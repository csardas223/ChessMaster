/* List every mode and whether it has its own sounds.
   Usage (repo root): node tools/sfx/sound_audit.mjs [--json] [--defaults]
   A mode has custom sounds when its spec has a non-empty `sounds` map (assets/modes/<id>/*.wav), or its file or its
   hooks module plays a mode wav directly. Everything else plays only the shared core set (move / capture / check /
   game-start / victory ... plus the shared tick / jumpscare / explosion). For those we print the theme words found in
   the spec (name, description) so a human can judge which ones sound wrong with the defaults. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const DIR = path.join(ROOT, 'data', 'modes');
const THEME = /explo|nuke|bomb|grenade|gun|shot|rifle|pistol|bazooka|torpedo|cannon|laser|missile|scp|horror|monster|ghost|demon|zombie|blood|scream|jump ?scare|dark|fog|curse|devil|angel|magic|spell|wizard|fire|dragon|ice|freez|poison|plague|dice|roll|wheel|spin|roulette|duck|goose|snake|fish|animal|elephant|unicorn|locust|insect|fly\b|deer|reptile|lion|knight ?mare|real.?time|kung ?fu|battle royale|arena|portal|time travel|gravity|magnet|launch|catapult|mine|landmine|trap|sword|axe|arrow|crossbow|craft|minecraft|roblox|pac.?man|snake|maze|labyrinth|backrooms|space|astronaut|rocket|jupiter|alien|toaster|crystal|crack|shatter|boiled|mal0|waldo|despair|alone|gabriel|abyss|void|ninja|egg|midas|gold|trojan|zebra|pawnbarian|shotgun|ouroboros|survivors|chessformer|passant|minions|moon|1d|5d|hyper|xxl|10,000|million|youtube|chatgpt|trash talk/ig;

function load(file) {
  let spec = null;
  const CM = { mode: (s) => { spec = s; }, register: () => {}, };
  const ctx = { CM, window: { CM }, console: { log() {}, warn() {} } };
  try { vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx, { timeout: 2000 }); } catch (e) { return { err: String(e) }; }
  return spec || {};
}

const out = [];
for (const f of fs.readdirSync(DIR).filter((n) => n.endsWith('.js') && n !== 'index.js').sort()) {
  const id = f.replace(/\.js$/, '');
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const s = load(path.join(DIR, f));
  const sounds = s.sounds && typeof s.sounds === 'object' ? Object.keys(s.sounds) : [];
  let hookSrc = '';
  const hooks = typeof s.hooks === 'string' ? s.hooks : null;
  if (hooks) { const p = path.join(ROOT, 'js', 'modes', hooks + '.js'); if (fs.existsSync(p)) hookSrc = fs.readFileSync(p, 'utf8'); }
  const wavRef = /assets\/modes\/[^'"]+\.wav/.test(src);
  const custom = sounds.length > 0 || wavRef;
  const text = [s.name, s.title, s.description, s.how_to_win].filter(Boolean).join(' ');
  const themes = [...new Set((text.match(THEME) || []).map((w) => w.toLowerCase()))];
  out.push({ id, name: s.name || s.title || id, category: s.category || '', hooks, kind: s.kind || s.frame || '', custom, sounds,
    usesExplosion: /['"]explosion['"]|type:\s*'explosion'/.test(src + hookSrc), usesJumpscare: /jumpscare/.test(src + hookSrc), themes, err: s.err });
}
const args = process.argv.slice(2);
const rows = args.includes('--defaults') ? out.filter((r) => !r.custom) : out;
if (args.includes('--json')) { console.log(JSON.stringify(rows, null, 1)); process.exit(0); }
for (const r of rows) {
  console.log([r.custom ? 'CUSTOM ' : 'default', r.id.padEnd(14), (r.name || '').slice(0, 34).padEnd(34), r.category.slice(0, 22).padEnd(22),
    r.custom ? r.sounds.join(',') : r.themes.join(',')].join(' | '));
}
console.error(`${out.length} modes, ${out.filter((r) => r.custom).length} with custom sounds, ${out.filter((r) => !r.custom).length} on defaults`);
