/* Static QA over every data/modes/<id>.js: spec shape, FEN geometry, local asset paths, hook modules,
   win-condition types, and coverage of data/modes/index.js vs the files on disk.
   Run: node qa/validate-modes.mjs [--json out.json] */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const MODES = path.join(ROOT, 'data/modes');
const files = fs.readdirSync(MODES).filter(f => f.endsWith('.js') && f !== 'index.js');

const WIN_TYPES = ['checkmate', 'nchecks', 'reach', 'eliminate', 'capture', 'points', 'survive', 'turns'];
const HOOK_NAMES = ['moves', 'filterMoves', 'onMake', 'attacks', 'checkWin', 'evaluate', 'init', 'setup', 'onStart',
  'beforeMove', 'afterMove', 'onTurn', 'onTick', 'onTrigger', 'onGameOver', 'onUndo', 'onExit', 'decorate',
  'visible', 'vision', 'status', 'camera', 'botPick', 'stockfishOk', 'extends'];

const report = { files: files.length, errors: [], warnings: [], perMode: {} };
const err = (id, msg) => report.errors.push(`${id}: ${msg}`);
const warn = (id, msg) => report.warnings.push(`${id}: ${msg}`);

function loadSpec(file) {
  const collected = [];
  const sandbox = {
    console: { log() {}, warn() {}, error() {} },
    window: {},
    CM: {
      mode: s => { collected.push(s); return s; },
      defineHooks: () => ({}),
      util: {},
      DATA: {},
      hooks: {},
      scene3d: {}, g6_3d: {},
    },
    THREE: {},
    document: { getElementById: () => null, head: { appendChild() {} }, createElement: () => ({ getContext: () => null, style: {} }) },
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  try {
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file, timeout: 5000 });
  } catch (e) {
    return { error: e.message };
  }
  return { spec: collected[0], count: collected.length };
}

function checkFen(spec, id) {
  const b = spec.board || {};
  const files_ = b.files ?? 8, ranks = b.ranks ?? 8;
  if (!Number.isInteger(files_) || files_ < 1 || files_ > 32) err(id, `board.files ${files_}`);
  if (!Number.isInteger(ranks) || ranks < 1 || ranks > 32) err(id, `board.ranks ${ranks}`);
  let fen = spec.setup && (typeof spec.setup === 'string' ? spec.setup : spec.setup.fen);
  if (!fen) return;
  const rows = String(fen).split(' ')[0].split('/');
  if (rows.length !== ranks) err(id, `setup FEN has ${rows.length} rows for ${ranks} ranks`);
  rows.forEach((row, ri) => {
    let c = 0;
    for (let k = 0; k < row.length;) {
      const ch = row[k];
      if (/\d/.test(ch)) { let n = ''; while (k < row.length && /\d/.test(row[k])) n += row[k++]; c += +n; continue; }
      if (ch === '[') { const e = row.indexOf(']', k); if (e < 0) { err(id, `row ${ri}: unclosed [ token`); return; } k = e + 1; c++; continue; }
      k++; c += 1;
    }
    if (c !== files_) err(id, `row ${ri} has ${c} squares for ${files_} files`);
  });
}

function walkStrings(v, cb, key = '') {
  if (typeof v === 'string') return cb(v, key);
  if (Array.isArray(v)) return v.forEach(x => walkStrings(x, cb, key));
  if (v && typeof v === 'object') return Object.entries(v).forEach(([k, x]) => walkStrings(x, cb, k));
}

const indexSrc = fs.readFileSync(path.join(MODES, 'index.js'), 'utf8');
const indexedIds = new Set([...indexSrc.matchAll(/"([A-Za-z0-9_-]{6,})"\s*:/g)].map(m => m[1]));

for (const file of files) {
  const id = file.replace(/\.js$/, '');
  const { spec, error, count } = loadSpec(path.join(MODES, file));
  const m = (report.perMode[id] = { errors: 0, warnings: 0 });
  if (error) { err(id, 'did not evaluate: ' + error); m.errors++; continue; }
  if (!spec) { err(id, count ? 'called CM.mode more than once' : 'never called CM.mode'); m.errors++; continue; }
  if (spec.id !== id) err(id, `spec.id "${spec.id}" does not match the file name`);
  for (const k of ['title', 'name', 'category', 'description', 'how_to_win']) {
    if (!spec[k] || typeof spec[k] !== 'string' || !spec[k].trim()) warn(id, `missing ${k}`);
  }
  if (!spec.opponent && !spec.players) warn(id, 'no opponent/players[] (defaults to Stockfish 3600)');
  if (spec.frame && spec.frame !== 'chess' && spec.frame !== 'game') err(id, `unknown frame "${spec.frame}"`);
  if (spec.frame === 'game' && !(spec.game && spec.game.module)) err(id, 'frame:game without game.module');
  if (!indexedIds.has(id)) err(id, 'missing from data/modes/index.js (run build-data)');
  checkFen(spec, id);

  if (spec.rules && Array.isArray(spec.rules.win)) {
    spec.rules.win.forEach(w => { if (w && WIN_TYPES.indexOf(w.type) < 0) err(id, `unknown win type "${w && w.type}"`); });
  }
  if (spec.hooks) {
    if (typeof spec.hooks === 'string') {
      const name = spec.hooks.replace(/^js\/modes\//, '').replace(/\.js$/, '');
      if (!fs.existsSync(path.join(ROOT, 'js/modes', name + '.js'))) err(id, `hooks module js/modes/${name}.js missing`);
    } else if (typeof spec.hooks === 'object') {
      if (spec.hooks.extends) {
        const name = String(spec.hooks.extends).replace(/^js\/modes\//, '').replace(/\.js$/, '');
        if (!fs.existsSync(path.join(ROOT, 'js/modes', name + '.js'))) err(id, `hooks.extends js/modes/${name}.js missing`);
      }
      Object.keys(spec.hooks).forEach(k => {
        if (HOOK_NAMES.indexOf(k) < 0 && !/^[a-z]/i.test(k)) err(id, `bad hook key "${k}"`);
      });
    } else err(id, 'hooks is neither an object nor a module name');
  }

  const missingAssets = new Set();
  walkStrings(spec, (s, key) => {
    const mm = /(?:^|["'(= ])(assets\/[^"')\s]+)/.exec(s);
    if (!mm) return;
    const p = decodeURIComponent(mm[1].split('?')[0]);
    if (!fs.existsSync(path.join(ROOT, p))) missingAssets.add(p);
  });
  missingAssets.forEach(p => err(id, `missing asset ${p}`));
  m.errors = report.errors.filter(x => x.startsWith(id + ': ')).length;
  m.warnings = report.warnings.filter(x => x.startsWith(id + ': ')).length;
}

/* videos with neither a mode file nor a legacy entry would open nothing */
const videosSrc = fs.readFileSync(path.join(ROOT, 'data/videos.js'), 'utf8');
const videoIds = new Set([...videosSrc.matchAll(/"id":"([A-Za-z0-9_-]+)"/g)].map(m => m[1]));
const legacySrc = fs.readFileSync(path.join(ROOT, 'data/legacy_index.js'), 'utf8');
const legacyNames = new Set([...legacySrc.matchAll(/\"([A-Za-z0-9_-]{6,})\":/g)].map(m => m[1]));
const orphans = [...indexedIds].filter(id => !videoIds.has(id) && id !== 'stockfish');
report.videos = videoIds.size;
report.orphanModeIds = orphans;
const uncovered = [...videoIds].filter(id => !indexedIds.has(id) && !legacyNames.has(id));
report.videosWithoutAnyMode = uncovered.length;
report.uncoveredSample = uncovered.slice(0, 20);

report.summary = {
  files: report.files, indexed: indexedIds.size, videos: report.videos,
  errors: report.errors.length, warnings: report.warnings.length,
  videosWithoutAnyMode: report.videosWithoutAnyMode,
};

const jsonFlag = process.argv.indexOf('--json');
if (jsonFlag > 0 && process.argv[jsonFlag + 1]) fs.writeFileSync(process.argv[jsonFlag + 1], JSON.stringify(report, null, 1));
console.log(JSON.stringify(report.summary, null, 1));
if (report.errors.length) { console.log('\nERRORS'); report.errors.slice(0, 80).forEach(e => console.log('  ' + e)); if (report.errors.length > 80) console.log(`  ... ${report.errors.length - 80} more`); }
if (report.warnings.length) { console.log('\nWARNINGS (first 30)'); report.warnings.slice(0, 30).forEach(e => console.log('  ' + e)); }
if (uncovered.length) console.log('\nVIDEOS WITH NO MODE OR LEGACY (' + uncovered.length + '):', uncovered.slice(0, 20).join(' '));
process.exit(report.errors.length ? 1 : 0);
