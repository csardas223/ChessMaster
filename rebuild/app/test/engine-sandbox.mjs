/* Loads the classic browser engine scripts in a VM sandbox so the rules can be tested under Node.
   Mirrors qa/engine-sweep.mjs's stubs; only the pieces the engine and settings touch are provided. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ENGINE = [
  'js/core/ns.js',
  'js/core/settings.js',
  'js/engine/geometry.js',
  'js/engine/movement.js',
  'js/engine/variant.js',
  'js/engine/search.js',
  'js/engine/spec.js',
  'js/engine/events.js',
];

function makeEl(id) {
  return {
    id: id || '', style: { setProperty() {}, cssText: '' }, dataset: {}, children: [], innerHTML: '', textContent: '',
    hidden: false, className: '', disabled: false, isConnected: true,
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    appendChild(c) { this.children.push(c); return c; }, insertBefore(c) { this.children.push(c); return c; },
    removeChild() {}, remove() { this.isConnected = false; }, setAttribute() {}, getAttribute() { return null; },
    addEventListener() {}, removeEventListener() {}, querySelector: () => makeEl(), querySelectorAll: () => [],
    getContext: () => null,
  };
}

export function makeSandbox() {
  const sandbox = {};
  const byId = {};
  const body = makeEl('body');
  const doc = {
    getElementById: (id) => (byId[id] || (byId[id] = makeEl(id))),
    querySelector: () => makeEl(), querySelectorAll: () => [], createElement: (tag) => makeEl(tag),
    addEventListener() {}, head: makeEl('head'), body, documentElement: makeEl('html'),
    baseURI: 'http://test.local/',
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.document = doc;
  sandbox.location = { protocol: 'http:', href: 'http://test.local/', hash: '' };
  sandbox.navigator = { userAgent: 'node' };
  sandbox.performance = { now: () => Date.now() };
  sandbox.setTimeout = () => 0;
  sandbox.clearTimeout = () => {};
  sandbox.setInterval = () => 0;
  sandbox.clearInterval = () => {};
  sandbox.requestAnimationFrame = () => 0;
  sandbox.cancelAnimationFrame = () => {};
  sandbox.matchMedia = () => ({ matches: false, addEventListener() {} });
  sandbox.localStorage = {
    _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; },
  };
  sandbox.addEventListener = () => {};
  sandbox.Image = function () { this.src = ''; };
  sandbox.Audio = function () { return { play: () => Promise.resolve(), pause() {}, addEventListener() {} }; };
  sandbox.fetch = () => Promise.reject(new Error('no network in tests'));
  sandbox.console = { log() {}, warn() {}, error() {}, info() {} };
  vm.createContext(sandbox);
  for (const f of ENGINE) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sandbox, { filename: f, timeout: 5000 });
  return sandbox;
}

/* A normal 8x8 game from a FEN (the FEN's first field is what the engine uses for setup).
   The side to move comes from setup.turn; the engine ignores the FEN's "w"/"b" field. */
export function game(fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', opts = {}) {
  const sb = makeSandbox();
  const CM = sb.CM;
  const spec = CM.spec.normalize({ id: 'test', board: { files: 8, ranks: 8 }, setup: { fen, turn: opts.turn } });
  const V = CM.spec.buildVariant(spec, {});
  const st = CM.spec.initialState(V, spec);
  return { CM, V, st, spec };
}

/* Find a legal move by its coordinate pair, e.g. move(V, st, 'e2', 'e4'). */
export function move(V, st, from, to, extra) {
  const f = V.geo.parse(from), t = V.geo.parse(to);
  return V.legal(st).find((m) => m.f === f && m.t === t && (extra ? extra(m) : true));
}

/* Play a list of coordinate pairs from the start position and return the final state + move list. */
export function play(V, st, list) {
  const played = [];
  let s = st;
  for (const [from, to, extra] of list) {
    const m = move(V, s, from, to, extra);
    if (!m) throw new Error(`illegal move ${from}${to} at ply ${s.ply}`);
    played.push(m);
    s = V.make(s, m);
  }
  return { st: s, moves: played };
}
