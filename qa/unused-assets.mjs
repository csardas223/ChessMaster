/* Report-only dead-file scan. Mode art and sounds are referenced from generated data and mode scripts, so this is a
   candidate list, not an invitation to bulk-delete: search each hit across the repo before removing it.
   Usage: node qa/unused-assets.mjs [--json] */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', '.git', 'qa/shots', 'assets/sounds/lichess']);
const TEXT = /\.(html|js|mjs|css|md|json|txt|py|yml|yaml)$/i;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = path.posix.join(dir, e.name);
    if (SKIP.has(rel) || e.name.startsWith('.')) continue;
    if (e.isDirectory()) walk(rel, out);
    else out.push(rel);
  }
  return out;
}

const all = walk('.');
const text = all.filter((f) => TEXT.test(f));
const haystack = text.map((f) => fs.readFileSync(path.join(ROOT, f), 'utf8')).join('\n');
/* Every path and bare filename mentioned anywhere (README counts as a reference once it embeds a screenshot). */
const referenced = (rel) => {
  const base = path.basename(rel);
  const stem = base.replace(/\.[^.]+$/, '');
  /* Match the full path, the filename, and the extensionless stem: hooks and mode sounds are loaded as names
     (hooks: 'g5_ladder', host.sound('hit')), and some art names are built as prefixes (face_wP, card_u4). */
  return haystack.includes(rel) || haystack.includes(base) || haystack.includes(stem);
};

const assets = all.filter((f) => f.startsWith('assets/') && !f.endsWith('/'));
const scripts = all.filter((f) => f.startsWith('js/') && f.endsWith('.js'));
const unusedAssets = assets.filter((f) => !referenced(f));
const unusedScripts = scripts.filter((f) => !referenced(f) && !f.includes('/vendor/'));

const report = {
  scanned: { files: all.length, textFiles: text.length, assets: assets.length, scripts: scripts.length },
  unusedAssets,
  unusedScripts,
};
if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`scanned ${report.scanned.files} files (${assets.length} assets, ${scripts.length} scripts)`);
  console.log(`\nunreferenced assets (${unusedAssets.length}):`);
  for (const f of unusedAssets) console.log('  ' + f);
  console.log(`\nunreferenced scripts (${unusedScripts.length}):`);
  for (const f of unusedScripts) console.log('  ' + f);
  console.log('\nCheck each hit before deleting; dynamic paths and generated data can hide references.');
}
