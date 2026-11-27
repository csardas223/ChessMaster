#!/usr/bin/env python3
"""3D button press QA (owner 2026-11-27, Z Flip6: "the edge disappears but the button doesn't go down").
Holds a press on every button variant and measures the face (translateY) and the hard bottom edge (box-shadow y)
at rest and while held. A pass is the Duolingo/Balatro press: the face moves down by exactly the resting edge height,
the edge shrinks to 0, so the visual bottom (rect.bottom + edge) does not move; it is back at rest after release;
transform + box-shadow transition is 80-100 ms.
  touch 390x844 and 360x780: CDP Input.dispatchTouchEvent touchStart held (no touchEnd), released with touchCancel
  mouse 1280x800: mouse down held, released off the button
Each runs with prefers-reduced-motion no-preference AND reduce (Samsung "Remove animations" turns it on).
Column `forced` also forces :active through CDP (CSS.forcePseudoState): headless Chromium never paints :active from a
synthetic touch (no tap-down gesture), so `forced` is what a phone shows if :active fires and press.js did not.
usage: python3 tools/qa_button_press.py [OUTDIR] [--base URL] [--quick] [--only lobby,game,gover,gunking,3d]
Serve the repo first: python3 -m http.server 8765 (headless libs: see HANDOFF "LD_LIBRARY_PATH")."""
import sys, os, json, re, argparse
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument('out', nargs='?', default='/tmp/qa_button_press')
ap.add_argument('--base', default='http://127.0.0.1:8765/index.html')
ap.add_argument('--quick', action='store_true', help='390 touch + 1280 mouse, motion no-preference + reduce, no 3D')
ap.add_argument('--only', default='lobby,game,gover,gunking,3d')
ap.add_argument('--ctx', default='touch390,touch360,mouse1280', help='subset of touch390,touch360,mouse1280 (run one per call if your shell times out)')
ap.add_argument('--motion', default='no-preference,reduce')
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
ONLY = set(a.only.split(','))
if a.quick: ONLY.discard('3d')

# (screen, label, selector of the element that carries the edge)
LOBBY = [('lobby', 'tab', '.view-lobby .tab:not([aria-selected="true"])'), ('lobby', 'tab selected', '.view-lobby .tab[aria-selected="true"]'),
         ('lobby', 'sort', '.sort'), ('lobby', 'featured Play', '.feat__play'), ('lobby', 'hero Play', '.hero__play'),
         ('lobby', 'random Roll', '.rnd__roll'), ('lobby', 'random Play', '.rnd__play'),
         ('lobby', 'lobby .btn', '.view-lobby .btn:not(.btn--ghost):not(.feat__play):not(.hero__play):not(.rnd__play):not(.rnd__roll)')]
TAP = [('game', 'Tap to start', '.tapstart__plate')]
INTRO = [('game', 'intro primary', '.intro__card .btn--primary'), ('game', 'intro secondary', '.intro__card .btn:not(.btn--primary):not(.btn--ghost)')]
GAME = [('game', 'game .btn', '.view-game .btn:not(.btn--ghost):not(.btn--primary)'), ('game', 'game primary', '.view-game .btn--primary'),
        ('game', 'plain mode button', ':is(#board-col, #side, .pbar, .game-controls) button:not([class])')]
GOVER = [('gover', 'result primary', '#gover .btn--primary'), ('gover', 'result secondary', '#gover .btn:not(.btn--primary):not(.btn--ghost)'),
         ('gover', 'modal .btn', '.modal:not([hidden]) .btn:not(.btn--ghost)')]
GUN = [('gunking', 'gctl pad', '.gctl:not(.gctl--primary)'), ('gunking', 'gctl primary', '.gctl--primary')]
TD = [('3d', 'Table Tactics bar', '.g6tt-bar button:not(:disabled)'), ('3d', '3D pad', '#g6-3d-pad button, #g6-3d-rot button, .b3-ui button, .g5fps__ctl button, .g5cu-bar button')]

MEASURE = r"""([sel, scroll]) => {
  const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return +getComputedStyle(e.closest('.modal__card') || e).opacity > 0.5 && r.width > 4 && r.height > 4 && cs.visibility !== 'hidden' && cs.display !== 'none' && !e.closest('[hidden]') && !e.disabled; };
  let e = document.querySelector('[data-qa-press]');
  if (!e) { e = [...document.querySelectorAll(sel)].find(vis); if (!e) return null; e.setAttribute('data-qa-press', ''); }
  if (scroll) { e.scrollIntoView({block: 'center', inline: 'center'}); }
  const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
  const m = cs.transform === 'none' ? [1,0,0,1,0,0] : cs.transform.replace(/^matrix\(|\)$/g, '').split(',').map(parseFloat);
  const sh = cs.boxShadow === 'none' ? null : cs.boxShadow;
  const nums = sh ? (sh.replace(/rgba?\([^)]*\)/g, '').trim().split(',')[0].match(/-?[\d.]+px/g) || []).map(parseFloat) : [];
  const edge = sh && !/inset/.test(sh.split(',')[0]) ? (nums[1] || 0) : 0;
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2, hit = document.elementFromPoint(cx, cy);
  const td = cs.transitionDuration.split(',').map(s => parseFloat(s) * (s.includes('ms') ? 1 : 1000)), tp = cs.transitionProperty.split(',').map(s => s.trim());
  const dur = p => { const i = tp.indexOf(p) >= 0 ? tp.indexOf(p) : tp.indexOf('all'); return i < 0 ? 0 : td[i % td.length]; };
  return {cx, cy, top: r.top, ty: m[5], edge, bottom: r.bottom + edge, shadow: (sh || 'none').slice(0, 44), hit: !!hit && (hit === e || e.contains(hit) || hit.contains(e) || (hit.closest && hit.closest('.tapstart') && e.closest('.tapstart'))),
          tDur: dur('transform'), sDur: dur('box-shadow'), pressedAttr: e.hasAttribute('data-pressed') || !!e.closest('[data-pressed]'), anim: cs.animationName !== 'none' && cs.animationPlayState === 'running', txt: (e.textContent || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 18)};
}"""

def judge(rest, held, back):
    if held is None: return 'FAIL', 'gone'
    e = rest['edge']
    base = 0 if rest.get('anim') else rest['ty']   # Tap to start plate bobs at rest; the press stops the bob
    probs = []
    if e < 1: probs.append('no edge at rest')
    if abs((held['ty'] - base) - e) > 0.5: probs.append(f"face moved {held['ty'] - base:+.1f} (want +{e:.0f})")
    if held['edge'] > 0.5: probs.append(f"edge {held['edge']:.1f} while held")
    if abs(held['bottom'] - rest['bottom']) > 0.5: probs.append(f"bottom moved {held['bottom'] - rest['bottom']:+.1f}")
    if back and ((not rest.get('anim') and abs(back['ty'] - rest['ty']) > 0.5) or abs(back['edge'] - e) > 0.5): probs.append('not back at rest')
    if not (80 <= rest['tDur'] <= 100 and 80 <= rest['sDur'] <= 100): probs.append(f"transition {rest['tDur']:.0f}/{rest['sDur']:.0f} ms")
    return ('PASS' if not probs else 'FAIL'), '; '.join(probs)

rows = []
def run(b, w, h, touch, motion):
    tag = f"{'touch' if touch else 'mouse'} {w} {motion}"
    kw = dict(viewport={'width': w, 'height': h}, reduced_motion=motion)
    if touch: kw.update(device_scale_factor=2.6, is_mobile=True, has_touch=True,
                        user_agent='Mozilla/5.0 (Linux; Android 14; SM-F741B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36')
    ctx = b.new_context(**kw); pg = ctx.new_page(); cdp = ctx.new_cdp_session(pg)
    cdp.send('DOM.enable'); cdp.send('CSS.enable')

    def force(on):
        doc = cdp.send('DOM.getDocument', {'depth': 0})
        nid = cdp.send('DOM.querySelector', {'nodeId': doc['root']['nodeId'], 'selector': '[data-qa-press]'})['nodeId']
        if nid: cdp.send('CSS.forcePseudoState', {'nodeId': nid, 'forcedPseudoClasses': ['active'] if on else []})

    def probe(screen, label, sel):
        pg.evaluate("document.querySelectorAll('[data-qa-press]').forEach(e => e.removeAttribute('data-qa-press'))")
        rest = pg.evaluate(MEASURE, [sel, True])
        if rest is None: rows.append(dict(ctx=tag, screen=screen, variant=label, result='n/a', why='not on screen')); return
        pg.wait_for_timeout(250); rest = pg.evaluate(MEASURE, [sel, False])
        if not rest['hit']: rows.append(dict(ctx=tag, screen=screen, variant=label, result='n/a', why='covered at its centre')); return
        # real input
        if touch:
            cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': rest['cx'], 'y': rest['cy']}]})
        else:
            pg.mouse.move(rest['cx'], rest['cy']); pg.mouse.down()
        pg.wait_for_timeout(220); held = pg.evaluate(MEASURE, [sel, False])
        if touch: cdp.send('Input.dispatchTouchEvent', {'type': 'touchCancel', 'touchPoints': []})
        else: pg.mouse.move(2, h - 2); pg.mouse.up()
        pg.wait_for_timeout(350); back = pg.evaluate(MEASURE, [sel, False])
        # then forced :active (what the CSS alone does when the browser does paint :active)
        force(True); pg.wait_for_timeout(220); forced = pg.evaluate(MEASURE, [sel, False]); force(False); pg.wait_for_timeout(150)
        res, why = judge(rest, held, back); fres, fwhy = judge(rest, forced, None)
        rows.append(dict(ctx=tag, screen=screen, variant=label, txt=rest['txt'], result=res, why=why, forced=fres, forced_why=fwhy,
                         rest=f"ty {rest['ty']:.1f} edge {rest['edge']:.1f}", held=f"ty {held['ty']:.1f} edge {held['edge']:.1f}" if held else '-',
                         forced_m=f"ty {forced['ty']:.1f} edge {forced['edge']:.1f}" if forced else '-', ms=f"{rest['tDur']:.0f}/{rest['sDur']:.0f}"))
        print(f"{tag:26} {screen:8} {label:20} {res:4} {why:40} | forced :active {fres} {fwhy}", flush=True)

    def opengame(hsh, wait=3500):
        pg.goto('about:blank'); pg.goto(a.base + hsh); pg.wait_for_timeout(wait)   # a fresh load, so the link-open "Tap to start" plate shows

    try:
        if 'lobby' in ONLY:
            pg.goto(a.base); pg.wait_for_timeout(2500)
            for v in LOBBY: probe(*v)
        if 'game' in ONLY or 'gover' in ONLY:
            if 'game' in ONLY:
                opengame('#/play/B5LGzOEZSyo')   # Dice Chess: Tap to start, intro card, mode buttons
                for v in TAP: probe(*v)
                pg.evaluate('(() => { const t = document.querySelector(".tapstart"); if (t) t.click(); })()'); pg.wait_for_timeout(2500)
                for v in INTRO: probe(*v)
                pg.evaluate('(() => { const t = document.querySelector(".intro__card .btn--primary"); if (t) t.click(); })()'); pg.wait_for_timeout(1200)
                for v in GAME: probe(*v)
                opengame('#/play/stockfish'); pg.evaluate('(() => { const t = document.querySelector(".tapstart"); if (t) t.click(); })()'); pg.wait_for_timeout(2000)
            if 'gover' in ONLY:
                pg.evaluate("window.scrollTo(0, 0)")
                try:
                    pg.evaluate('document.querySelector("#resign").click()'); pg.wait_for_timeout(250); pg.evaluate('document.querySelector("#resign").click()'); pg.wait_for_timeout(1400)
                    for v in GOVER: probe(*v)
                except Exception as ex: rows.append(dict(ctx=tag, screen='gover', variant='-', result='n/a', why=str(ex)[:80]))
        if 'gunking' in ONLY:
            opengame('#/play/AWFB4EzGtDc')
            pg.evaluate('(() => { const t = document.querySelector(".tapstart"); if (t) t.click(); })()'); pg.wait_for_timeout(1200)
            pg.evaluate('(() => { const t = document.querySelector(".intro__card .btn--primary"); if (t) t.click(); })()'); pg.wait_for_timeout(1200)
            for v in GUN: probe(*v)
        if '3d' in ONLY:
            opengame('#/play/xvlHij1tgk8', 3000)
            pg.evaluate('(() => { const t = document.querySelector(".tapstart"); if (t) t.click(); })()'); pg.wait_for_timeout(1200)
            pg.evaluate('(() => { const t = document.querySelector(".intro__card .btn--primary"); if (t) t.click(); })()'); pg.wait_for_timeout(5000)
            for v in TD: probe(*v)
    except Exception as ex:
        print('ERROR', tag, str(ex)[:160]); rows.append(dict(ctx=tag, screen='?', variant='?', result='ERROR', why=str(ex)[:120]))
    ctx.close()

with sync_playwright() as p:
    b = p.chromium.launch()
    ALL = {'touch390': (390, 844, True), 'touch360': (360, 780, True), 'mouse1280': (1280, 800, False)}
    combos = [ALL[c] for c in (['touch390', 'mouse1280'] if a.quick else a.ctx.split(','))]
    for w, h, touch in combos:
        for motion in a.motion.split(','):
            run(b, w, h, touch, motion)
    b.close()

json.dump(rows, open(f'{a.out}/press.json', 'w'), indent=1)
measured = [r for r in rows if r['result'] in ('PASS', 'FAIL', 'ERROR')]
fails = [r for r in measured if r['result'] != 'PASS']
na = sorted({(r['screen'], r['variant'], r['why']) for r in rows if r['result'] == 'n/a'})
print(f"\n{len(measured) - len(fails)}/{len(measured)} pressed correctly; {len(na)} variants not on screen in some context")
for r in fails: print('  FAIL', r['ctx'], r['screen'], r['variant'], r.get('why'))
for s in na: print('  n/a ', *s)
print('json:', f'{a.out}/press.json')
sys.exit(1 if fails else 0)
