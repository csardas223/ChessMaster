#!/usr/bin/env python3
"""Inventory every visible button-like element's computed style across screens. usage: inventory.py OUTDIR"""
import sys, os, json
from playwright.sync_api import sync_playwright
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
BASE = 'http://127.0.0.1:8765/index.html'
INV = r'''(screen) => {
  const sel = 'button, a.btn, [role=button], .btn, select, .tab';
  const res = [];
  for (const e of document.querySelectorAll(sel)) {
    if (e.closest('[hidden]')) continue;
    const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (r.bottom < 0 || r.top > innerHeight * 6) continue;
    const cls = (e.className && e.className.baseVal === undefined ? e.className : '').trim().split(/\s+/).slice(0, 3).join('.');
    res.push({screen, id: e.id, cls, txt: (e.textContent || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 24),
      w: Math.round(r.width), h: Math.round(r.height), rad: cs.borderTopLeftRadius, bg: cs.backgroundColor, sh: cs.boxShadow.slice(0, 60),
      ff: cs.fontFamily.split(',')[0], fs: cs.fontSize, fw: cs.fontWeight, pad: cs.padding, col: cs.color, bd: cs.borderTopWidth + ' ' + cs.borderTopColor});
  }
  return res;
}'''
screens = [('lobby', ''), ('stockfish', '#/play/stockfish'), ('soko', '#/play/7lEglazTlo8'), ('duo', '#/play/eCzxOgc4fTY'),
           ('pacman', '#/play/sO-lD2On610'), ('wheel', '#/play/rQQKF0ZZQfg'), ('roulette', '#/play/cYVauucyLyQ'), ('4p', '#/play/8XmhGMnypjc'),
           ('dice', '#/play/B5LGzOEZSyo'), ('ladder', '#/play/D8olpXjblQ0'), ('jupiter', '#/play/Mg2Upjjo2yg')]
allr = []
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2.6, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    for name, h in screens:
        pg.goto(BASE + h); pg.wait_for_timeout(1500 if not h else 3000)
        if h:
            pg.screenshot(path=f'{out}/{name}_tap.png')
            allr += pg.evaluate(INV, name + ':tapstart')
            pg.evaluate('(() => { const t = document.querySelector(".tapstart"); if (t) t.click(); })()'); pg.wait_for_timeout(1500)
        pg.screenshot(path=f'{out}/{name}.png')
        allr += pg.evaluate(INV, name)
        if name == 'lobby':
            pg.click('#open-settings'); pg.wait_for_timeout(500); allr += pg.evaluate(INV, 'settings'); pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
            pg.fill('#q', 'zzqqxx'); pg.wait_for_timeout(300); allr += pg.evaluate(INV, 'empty'); pg.fill('#q', '')
        if name == 'stockfish':
            pg.click('#resign'); pg.wait_for_timeout(200); pg.click('#resign'); pg.wait_for_timeout(1200)
            pg.screenshot(path=f'{out}/gover.png'); allr += pg.evaluate(INV, 'gover')
    b.close()
json.dump(allr, open(f'{out}/inventory.json', 'w'), indent=0)
seen = {}
for r in allr:
    k = (r['screen'].split(':')[0] if r['screen'] in ('lobby','settings','empty','gover') else 'mode', r['cls'] or r['id'], r['h'], r['rad'], r['bg'], r['ff'], r['fs'], r['fw'], r['sh'][:40])
    seen.setdefault(k, []).append(r['screen'] + ':' + (r['id'] or r['txt']))
for k, v in sorted(seen.items(), key=lambda x: x[0][1]):
    print(k, len(v), v[:3])
