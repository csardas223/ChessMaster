/* Research helper: pull the rule text and the control hints of every playable challenge on iwantcheckmate.com so the
   repo's modes can be compared with the reference implementation. Writes qa/site-games.json (research output). */
import fs from 'node:fs';

const SLUGS = ['sniper-bishops', 'midas-touch', 'catapult-chess', 'trojan-horse', 'portal-chess', 'infinite-pawns',
  'dragons-tony', 'scp-096', 'locust', 'boiled-one', 'scp-049', 'scp-966', 'containment-breach', 'malo', 'deer', 'dark', 'waldo'];

const out = [];
for (const slug of SLUGS) {
  const url = `https://iwantcheckmate.com/challenges/${slug}/index.html`;
  try {
    const html = await (await fetch(url)).text();
    const scripts = [...html.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]);
    let js = '';
    for (const s of scripts) {
      try { js += await (await fetch(new URL(s, url))).text(); } catch (e) { }
    }
    const desc = (js.match(/game-description">([^<]*)</) || [])[1] || '';
    const dbl = /ondblclick|dblclick/.test(js);
    const ctxMentions = [...new Set((js.match(/(right-click|double-click|double click|drag|keyboard|arrow keys|press [A-Z]|toggle)[^<".]{0,80}/gi) || []))].slice(0, 8);
    const ruleText = [...new Set((js.match(/<p[^>]*>([^<]{25,240})<\/p>/g) || []).map(s => s.replace(/<[^>]+>/g, '')))].slice(0, 6);
    out.push({ slug, url, desc, dbl, ctxMentions, ruleText, jsBytes: js.length });
  } catch (e) { out.push({ slug, url, err: String(e.message) }); }
}
fs.writeFileSync(new URL('./site-games.json', import.meta.url), JSON.stringify(out, null, 1));
for (const o of out) {
  console.log('\n=== ' + o.slug + (o.dbl ? '  [dblclick]' : '') + '  js=' + (o.jsBytes || 0));
  console.log('desc:', (o.desc || o.err || '').slice(0, 400));
  if (o.ctxMentions && o.ctxMentions.length) console.log('controls:', o.ctxMentions.join(' | '));
  if (o.ruleText && o.ruleText.length) console.log('text:', o.ruleText.join(' || ').slice(0, 500));
}
