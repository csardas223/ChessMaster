/* Engine sweep: run every mode's rules in Node (no browser) - build the variant, set up the position, play a short
   random game (both sides), and run one CM.Search move. Catches throwing hooks, bad FENs, illegal starts, stuck
   games (no legal moves on move 1), and result/check bugs. Run: node qa/engine-sweep.mjs [--plies 8] [--json out] */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const MODES = path.join(ROOT, 'data/modes');
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const PLIES = +arg('--plies', 8);
const LIMIT = +arg('--limit', 0);

const files = fs.readdirSync(MODES).filter(f => f.endsWith('.js') && f !== 'index.js').sort().slice(0, LIMIT || undefined);
const report = { modes: files.length, ok: 0, failed: [], warnings: [], perMode: {} };

function makeSandbox() {
  const sandbox = {};
  const doc = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, setAttribute() {}, appendChild() {}, classList: { add() {}, remove() {}, toggle() {} }, getContext: () => null, addEventListener() {} }),
    addEventListener() {}, head: { appendChild() {} }, body: { appendChild() {} },
    documentElement: { style: { setProperty() {} }, dataset: {} }, baseURI: 'http://qa.local/',
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.document = doc;
  sandbox.location = { protocol: 'http:', href: 'http://qa.local/', hash: '' };
  sandbox.navigator = { userAgent: 'node' };
  sandbox.performance = { now: () => Date.now() };
  sandbox.setTimeout = (fn) => { try { fn(); } catch (e) {} return 0; };
  sandbox.clearTimeout = () => {};
  sandbox.setInterval = () => 0;
  sandbox.clearInterval = () => {};
  sandbox.requestAnimationFrame = (fn) => { try { fn(0); } catch (e) {} return 0; };
  sandbox.cancelAnimationFrame = () => {};
  sandbox.matchMedia = () => ({ matches: false, addEventListener() {} });
  sandbox.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
  sandbox.addEventListener = () => {};
  sandbox.Image = function () { this.src = ''; };
  sandbox.Audio = function () { return { play: () => Promise.resolve(), pause() {}, cloneNode() { return this; }, addEventListener() {} }; };
  sandbox.fetch = () => Promise.reject(new Error('no network in sweep'));
  sandbox.console = { log() {}, warn() {}, error() {}, info() {} };
  vm.createContext(sandbox);
  return sandbox;
}

const ENGINE = ['js/core/ns.js', 'js/engine/geometry.js', 'js/engine/movement.js', 'js/engine/variant.js', 'js/engine/search.js', 'js/engine/spec.js', 'js/engine/events.js'];
let base = null;
function freshEngine() {
  const sb = makeSandbox();
  for (const f of ENGINE) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sb, { filename: f, timeout: 5000 });
  return sb;
}
base = freshEngine();
const CM = base.CM;
if (!CM || !CM.Variant) { console.error('engine failed to boot in the sandbox'); process.exit(2); }

function loadHooks(sb, id, spec) {
  let h = spec.hooks;
  if (!h) return {};
  const seen = new Set();
  let out = {};
  const load = (name) => {
    if (seen.has(name)) return {};
    seen.add(name);
    const file = path.join(ROOT, 'js/modes', name + '.js');
    if (!fs.existsSync(file)) throw new Error('hooks module missing: js/modes/' + name + '.js');
    vm.runInContext(fs.readFileSync(file, 'utf8'), sb, { filename: file, timeout: 5000 });
    if (!sb.CM.hooks[name]) throw new Error('js/modes/' + name + '.js did not define hooks');
    return sb.CM.hooks[name];
  };
  if (typeof h === 'string') return load(h.replace(/^js\/modes\//, '').replace(/\.js$/, ''));
  if (h.extends) { const b = load(String(h.extends)); out = Object.assign({}, b); out._base = b; }
  return Object.assign(out, h);
}

function rngFactory(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

/* a small stand-in for SpecGame's ctx, enough for mode init/setup/onStart hooks to place their pieces */
function miniCtx(CM2, spec, V, hooks, st, human) {
  const G = { spec, V, hooks, state: st, human, bot: V.colors.find(c => c !== human) || 'b', moves: [], sel: -1, busy: false, over: null, x: st.x,
    opponent: Object.assign({}, spec.opponent), ply: 0, gid: 1,
    pieceImage: () => '', render() {}, refresh() {}, tryMove() {}, commit() {}, after() {}, toast() {}, setOpponent() {} };
  const g = V.geo;
  const ctx = {
    get state() { return G.state; }, set state(s) { G.state = s; },
    get V() { return V; }, get geo() { return g; }, get spec() { return spec; }, get params() { return spec.params || {}; },
    get hooks() { return hooks; }, get human() { return human; }, get bot() { return G.bot; }, get ply() { return G.state.ply; }, get colors() { return V.colors; },
    get x() { return G.state.x; }, get over() { return G.over; }, get last() { return G.last; }, get opponent() { return G.opponent; },
    sq: n => g.parse(n), name: i => g.name(i), at: i => G.state.b[typeof i === 'string' ? g.parse(i) : i],
    colorOf: w => (w === 'player' || w === 'human' ? human : w === 'bot' ? G.bot : w),
    resolveSquare: a => (typeof a === 'number' ? a : g.parse(a)), resolveSquares: l => (Array.isArray(l) ? l : String(l).split(/[\s,]+/)).map(a => g.parse(a)),
    piece: (t, c, extra) => V.piece(t, c, extra), set: (i, p) => { G.state.b[typeof i === 'string' ? g.parse(i) : i] = p; },
    spawn: (t, c, i, props) => { ctx.set(i, V.piece(t, c, props)); }, remove: i => ctx.set(i, null),
    move: (f, t) => { const p = ctx.at(f); ctx.set(f, null); ctx.set(t, p); },
    transform: (i, to) => { const p = ctx.at(i); if (p) ctx.set(i, Object.assign({}, p, to)); }, setX: (k, v) => { G.state.x = Object.assign({}, G.state.x); G.state.x[k] = v; },
    emptySquares: () => { const o = []; for (let i = 0; i < g.size; i++) if (g.valid[i] && !G.state.b[i]) o.push(i); return o; },
    pieces: f => G.state.b.map((p, i) => (p && (!f || f(p, i)) ? i : -1)).filter(i => i >= 0),
    moveToward() {}, fx() {}, clearFx() {}, sound() {}, toast() {}, trigger() {}, setOpponent() {},
    refresh() { G.moves = V.legal(G.state); }, endGame(w, why) { G.over = { w, why }; }, after() {},
    random: n => Math.floor(Math.random() * n), chance: p => Math.random() < p, pick: a => a[Math.floor(Math.random() * a.length)], game: G,
  };
  return { ctx, G };
}

for (const file of files) {
  const id = file.replace(/\.js$/, '');
  const m = report.perMode[id] = { ok: true };
  try {
    const sb = freshEngine();
    const CM2 = sb.CM;
    const collected = [];
    sb.CM.mode = (s) => { collected.push(s); return s; };
    vm.runInContext(fs.readFileSync(path.join(MODES, file), 'utf8'), sb, { filename: file, timeout: 8000 });
    const raw = collected[0];
    if (!raw) throw new Error('no CM.mode() call');
    const spec = CM2.spec.normalize(raw);
    m.name = spec.name || spec.title || id;
    m.frame = spec.frame || 'chess';
    if (m.frame === 'game') { m.ok = true; m.skipped = 'game frame (canvas)'; report.ok++; continue; }
    const hooks = loadHooks(sb, id, spec);
    if (typeof hooks.onStart === 'function' || typeof hooks.init === 'function') m.hasLifecycle = true;
    const V = CM2.spec.buildVariant(spec, hooks);
    m.board = V.geo.files + 'x' + V.geo.ranks;
    m.colors = V.colors.join('');
    let st = CM2.spec.initialState(V, spec);
    /* lifecycle hooks may build the position themselves (level modes), so run init/setup before judging the board */
    const { ctx, G } = miniCtx(CM2, spec, V, hooks, st, spec.player_side);
    for (const fn of ['init', 'setup']) {
      if (typeof hooks[fn] !== 'function') continue;
      try { hooks[fn](ctx); } catch (e) { report.warnings.push(`${id}: hooks.${fn} threw: ${String(e && e.message || e).slice(0, 120)}`); }
    }
    if (G.state !== st) st = G.state;
    m.pieces = st.b.filter(Boolean).length;
    /* drop/setup modes start with an empty board and their army in hand, which is fine */
    const inHand = Object.keys(st.hands || {}).reduce((n, k) => n + (st.hands[k] || []).length, 0);
    m.inHand = inHand;
    if (!m.pieces && !inHand) throw new Error('empty starting position');
    let moves = V.legal(st);
    if (!moves.length && inHand) { /* a setup/drop mode may need a drop first: ask the hooks again with hands */ }
    m.startMoves = moves.length;
    if (!moves.length && !inHand) throw new Error('no legal moves in the starting position');
    if (m.startMoves < 2) report.warnings.push(`${id}: only ${m.startMoves} legal move(s) at the start`);
    const rnd = rngFactory(id.split('').reduce((a, c) => a + c.charCodeAt(0), 7));
    let plies = 0, sawSearch = false;
    for (; plies < PLIES; plies++) {
      if (!moves.length) break;
      const res = V.result(st, moves);
      if (res) { m.endedAt = plies; m.result = res; break; }
      let move;
      if (!sawSearch && plies >= 2) {
        sawSearch = true;
        const ranked = CM2.Search && CM2.Search.choose ? CM2.Search.choose(V, st, moves, { depth: 1, time_ms: 40 }, hooks) : null;
        move = (ranked && ranked.m) || ranked || moves[Math.floor(rnd() * moves.length)];
      } else {
        /* prefer captures/exciting moves half the time so hooks that only fire on captures get exercised */
        const caps = moves.filter(x => x.cap);
        move = (caps.length && rnd() < 0.5 ? caps[Math.floor(rnd() * caps.length)] : moves[Math.floor(rnd() * moves.length)]);
      }
      if (!move) throw new Error('move picker returned nothing at ply ' + plies);
      st = V.make(st, move);
      G.state = st;
      moves = V.legal(st);
    }
    m.plies = plies;
    m.endPieces = st.b.filter(Boolean).length;
    m.hands = Object.keys(st.hands || {}).map(k => k + ':' + (st.hands[k] || []).length).join(',');
    report.ok++;
  } catch (e) {
    m.ok = false;
    m.error = String(e && e.message || e).slice(0, 300);
    report.failed.push(id + ': ' + m.error);
  }
}

const json = arg('--json', '');
if (json) fs.writeFileSync(json, JSON.stringify(report, null, 1));
console.log(JSON.stringify({ modes: report.modes, ok: report.ok, failed: report.failed.length, warnings: report.warnings.length }, null, 1));
if (report.failed.length) { console.log('\nFAILURES'); report.failed.forEach(f => console.log('  ' + f)); }
if (report.warnings.length) { console.log('\nWARNINGS'); report.warnings.slice(0, 30).forEach(f => console.log('  ' + f)); }
process.exit(report.failed.length ? 1 : 0);
