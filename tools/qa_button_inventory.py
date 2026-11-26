#!/usr/bin/env python3
"""Inventory every visible button-like element's computed style across screens.
usage: qa_button_inventory.py OUTDIR [--set 2d|3d|all] [--size 390x844] [--base URL]
  --set 3d  the 3D tab / FPS screens (FPS Chess + duel, Battle Chess 3D, Chess Arena, Table Tactics, Chess Ultimate,
            Roblox, Beyond the Board, Who Takes the Crown, Hyper, The Fly, Luxury, 3D Glasses, Petrified Pawns).
            Heavy: run it alone (one headless Chromium on the box), it takes ~2-3 min.
Each row has 'themed' (selector matched THEMED: buttons that copy a video game's own UI keep their look) and 'ok'
(the shared button system: >=44 px tap height incl. a ::before hit area, 12 px corners, 3 px hard bottom edge)."""
import sys, os, json, argparse
from playwright.sync_api import sync_playwright
ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--set', default='2d', choices=['2d', '3d', 'all'])
ap.add_argument('--size', default='390x844'); ap.add_argument('--base', default='http://127.0.0.1:8765/index.html')
args = ap.parse_args()
out = args.out; os.makedirs(out, exist_ok=True)
BASE = args.base
W, H = (int(x) for x in args.size.split('x'))
# buttons that copy a video game's own UI: inventoried, not held to the shared system
THEMED = ('.f3d__tile, .f3d__btn, .f3d__joy, .g4ar-card, .g4ar-lock, .g4soko-btns button, button[data-sp], button[data-it], '
          '.g6-3d-sym, .g5cu-ros button, [data-themed]')
# chrome that follows its own tier (chess.com bottom bar, icon tier): not held to the 3 px edge
NAV = '.act, .icon-btn, .zoomctl__b, .search__clear, .sec__more, .tab, select, .cm-chip, .tapstart'
INV = r"""([screen, THEMED, NAV]) => {
  const sel = 'button, a.btn, [role=button], .btn, select, .tab, .foot a';
  const res = [];
  for (const e of document.querySelectorAll(sel)) {
    if (e.closest('[hidden]')) continue;
    const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (r.bottom < 0 || r.top > innerHeight * 6) continue;
    const cls = (e.className && e.className.baseVal === undefined ? e.className : '').trim().split(/\s+/).slice(0, 3).join('.');
    // tap height includes an absolutely placed ::before hit area (inset: -6px ...)
    const pb = getComputedStyle(e, '::before'); let tap = r.height;
    if (pb.content !== 'none' && pb.position === 'absolute') tap = Math.max(tap, r.height - (parseFloat(pb.top) || 0) - (parseFloat(pb.bottom) || 0));
    const themed = e.matches(THEMED) || !!e.closest('[data-themed]'), nav = e.matches(NAV);
    const ok = e.matches('.foot a') ? tap >= 43.5 : themed || nav ? null : (tap >= 43.5 && cs.borderTopLeftRadius === '12px' && /0px 3px 0px/.test(cs.boxShadow));
    res.push({screen, id: e.id, cls, txt: (e.textContent || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 24),
      w: Math.round(r.width), h: Math.round(r.height), tap: Math.round(tap), rad: cs.borderTopLeftRadius, bg: cs.backgroundColor, sh: cs.boxShadow.slice(0, 60),
      ff: cs.fontFamily.split(',')[0], fs: cs.fontSize, fw: cs.fontWeight, pad: cs.padding, col: cs.color, bd: cs.borderTopWidth + ' ' + cs.borderTopColor,
      themed, nav, ok});
  }
  return res;
}"""
SCREENS_2D = [('lobby', ''), ('stockfish', '#/play/stockfish'), ('soko', '#/play/7lEglazTlo8'), ('duo', '#/play/eCzxOgc4fTY'),
           ('pacman', '#/play/sO-lD2On610'), ('wheel', '#/play/rQQKF0ZZQfg'), ('roulette', '#/play/cYVauucyLyQ'), ('4p', '#/play/8XmhGMnypjc'),
           ('dice', '#/play/B5LGzOEZSyo'), ('ladder', '#/play/D8olpXjblQ0'), ('jupiter', '#/play/Mg2Upjjo2yg')]
# 3D tab (tags: 3D) + the two lift3d games; one representative per engine. The FPS duel's own HUD (.f3d__*) only
# exists mid-capture and is a copy of the game's HUD: tools/qa_fps3d.py checks it.
SCREENS_3D = [('fps', '#/play/PszkLYudcws'), ('fps_bong', '#/play/Nz2A-g73_iM'), ('battle3d', '#/play/IbRrzKtieqs'),
           ('arena', '#/play/CONozr99agQ'), ('tactics', '#/play/xvlHij1tgk8'), ('cu', '#/play/M0Nr98Axpo8'), ('roblox', '#/play/EqOwqolOZOo'),
           ('btb', '#/play/xlErokL2-4c'), ('wttc', '#/play/iqfHW2_sMmc'), ('hyper', '#/play/d8pJkdxtXAA'), ('fly', '#/play/OFtVdbxJI2Y'),
           ('luxury', '#/play/tm24Uq9nlBc'), ('glasses', '#/play/hZf3G9Pr1UU'), ('petri', '#/play/sGXmiyvZDE4')]
screens = (SCREENS_2D if args.set != '3d' else []) + (SCREENS_3D if args.set != '2d' else [])
allr = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=2.6, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    for name, h in screens:
        is3d = (name, h) in SCREENS_3D
        try:
            pg.goto(BASE + h); pg.wait_for_timeout(1500 if not h else 3000)
            if h:
                pg.screenshot(path=f'{out}/{name}_tap.png')
                allr += pg.evaluate(INV, [name + ':tapstart', THEMED, NAV])
                pg.evaluate('(() => { const t = document.querySelector(".tapstart"); if (t) t.click(); })()'); pg.wait_for_timeout(1500)
                pg.evaluate('(() => { const t = document.querySelector(".intro__card .btn--primary"); if (t) t.click(); })()'); pg.wait_for_timeout(4000 if is3d else 300)
            pg.screenshot(path=f'{out}/{name}.png')
            allr += pg.evaluate(INV, [name, THEMED, NAV])
        except Exception as ex:   # a heavy 3D page can time out under load: note it, keep going
            print('SKIP', name, str(ex)[:120]); continue
        if name == 'lobby':
            pg.click('#open-settings'); pg.wait_for_timeout(500); allr += pg.evaluate(INV, ['settings', THEMED, NAV]); pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
            pg.fill('#q', 'zzqqxx'); pg.wait_for_timeout(300); allr += pg.evaluate(INV, ['empty', THEMED, NAV]); pg.fill('#q', '')
        if name == 'stockfish':
            pg.click('#resign'); pg.wait_for_timeout(200); pg.click('#resign'); pg.wait_for_timeout(1200)
            pg.screenshot(path=f'{out}/gover.png'); allr += pg.evaluate(INV, ['gover', THEMED, NAV])
    b.close()
json.dump(allr, open(f'{out}/inventory.json', 'w'), indent=0)
seen = {}
for r in allr:
    k = (r['screen'].split(':')[0] if r['screen'] in ('lobby','settings','empty','gover') else 'mode', r['cls'] or r['id'], r['h'], r['rad'], r['bg'], r['ff'], r['fs'], r['fw'], r['sh'][:40])
    seen.setdefault(k, []).append(r['screen'] + ':' + (r['id'] or r['txt']))
for k, v in sorted(seen.items(), key=lambda x: x[0][1]):
    print(k, len(v), v[:3])
bad = [r for r in allr if r['ok'] is False]
print(f'\nOFF-SYSTEM (not themed, not nav): {len(bad)}')
for r in bad: print('  ', r['screen'], r['cls'] or r['id'], repr(r['txt']), f"h={r['h']} tap={r['tap']} rad={r['rad']} sh={r['sh'][:30]!r} bg={r['bg']}")
