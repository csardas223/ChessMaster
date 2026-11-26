#!/usr/bin/env python3
"""Mobile UI sweep: screenshots + automated overflow/clip/tap-target audit.
usage: python3 sweep.py OUTDIR [--sizes 390x844,360x780] [--only lobby,settings,modes,promo,gover,loading] [--modes id,id]"""
import sys, os, json, argparse
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument('out')
ap.add_argument('--sizes', default='390x844,360x780')
ap.add_argument('--only', default='lobby,search,settings,modes,promo,gover,loading')
ap.add_argument('--modes', default='stockfish,sO-lD2On610,7lEglazTlo8,eCzxOgc4fTY,BYg7rV53WrM,-fax07t_o5s,YrxMDVnjri8,8XmhGMnypjc,B5LGzOEZSyo,xp6Pr-rB4JA,Mg2Upjjo2yg')
ap.add_argument('--base', default='http://127.0.0.1:8765/index.html')
ap.add_argument('--wait', type=int, default=3500)
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)
only = set(a.only.split(','))

AUDIT = r'''() => {
  const W = innerWidth, H = innerHeight, out = {docOverflow: document.documentElement.scrollWidth - W, bodyOverflow: document.body.scrollWidth - W, outside: [], textClip: [], small: [], overlapsTop: []};
  const name = e => { let s = e.tagName.toLowerCase(); if (e.id) s += '#' + e.id; if (e.classList.length) s += '.' + Array.from(e.classList).slice(0,3).join('.'); return s; };
  const path = e => { const p = []; let x = e; for (let i = 0; x && i < 3; i++, x = x.parentElement) p.unshift(name(x)); return p.join(' > '); };
  const vis = e => { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const clippedByScroller = e => { for (let x = e.parentElement; x && x !== document.body; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.overflowX !== 'visible' || cs.overflow === 'hidden' || cs.overflow === 'clip') { const r = x.getBoundingClientRect(); if (r.left >= -1 && r.right <= W + 1) return true; } if (cs.position === 'fixed') break; } return false; };
  const all = Array.from(document.querySelectorAll('body *')).filter(e => !e.closest('[hidden]') && !['SCRIPT','STYLE','svg','path','LINK'].includes(e.tagName));
  for (const e of all) {
    if (!vis(e)) continue;
    const r = e.getBoundingClientRect();
    if ((r.right > W + 1 || r.left < -1) && !clippedByScroller(e) && r.width < W * 3) out.outside.push([path(e), Math.round(r.left), Math.round(r.right)]);
    const cs = getComputedStyle(e);
    if ((cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.overflow === 'clip') && e.children.length === 0 && e.textContent.trim() && e.scrollWidth > e.clientWidth + 1)
      out.textClip.push([path(e), e.textContent.trim().slice(0, 40), e.scrollWidth, e.clientWidth, cs.textOverflow]);
    if (e.children.length === 0 && e.textContent.trim() && (cs.overflow === 'hidden' || cs.overflowY === 'hidden') && e.scrollHeight > e.clientHeight + 2 && cs.webkitLineClamp === 'none')
      out.textClip.push([path(e) + ' [V]', e.textContent.trim().slice(0, 40), e.scrollHeight, e.clientHeight, '']);
    if (e.matches('button, a[href], [role=button], input, select, [data-tab]') && r.top < H && r.bottom > 0) {
      if (r.width < 32 || r.height < 32) out.small.push([path(e), Math.round(r.width), Math.round(r.height), (e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,20)]);
    }
  }
  out.outside = out.outside.slice(0, 25); out.textClip = out.textClip.slice(0, 40); out.small = out.small.slice(0, 40);
  return out;
}'''

report = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    for size in a.sizes.split(','):
        w, h = map(int, size.split('x'))
        ctx = b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2.6, is_mobile=True, has_touch=True,
                            user_agent='Mozilla/5.0 (Linux; Android 14; SM-F741B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36')
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        def shot(tag, full=True):
            fn = f'{a.out}/{tag}_{w}.png'
            pg.screenshot(path=fn, full_page=full)
            r = pg.evaluate(AUDIT); r['errors'] = list(errs); errs.clear()
            report[f'{tag}_{w}'] = r
            print(tag, w, 'docOverflow', r['docOverflow'], 'outside', len(r['outside']), 'textClip', len(r['textClip']), 'small', len(r['small']), flush=True)
        pg.goto(a.base); pg.wait_for_timeout(1500)
        if 'lobby' in only:
            # load every page of the feed then shoot viewport-sized steps
            Ht = pg.evaluate('document.documentElement.scrollHeight')
            shot('lobby_full')
            y, i = 0, 0
            while y < min(Ht, 9000):
                pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(250)
                shot(f'lobby_v{i:02d}', full=False); y += h - 100; i += 1
            pg.evaluate('window.scrollTo(0,0)')
        if 'search' in only:
            pg.fill('#q', 'chess'); pg.wait_for_timeout(300); shot('search', full=False)
            pg.fill('#q', 'zzqqxx'); pg.wait_for_timeout(300); shot('search_empty', full=False)
            pg.fill('#q', ''); pg.wait_for_timeout(300)
        if 'settings' in only:
            pg.click('#open-settings'); pg.wait_for_timeout(500); shot('settings', full=False)
            pg.evaluate('(() => { const p = document.querySelector("#settings .sheet__panel"); if (p) p.scrollTop = 99999; })()'); pg.wait_for_timeout(200); shot('settings_bottom', full=False)
            pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
        if 'modes' in only:
            for mid in a.modes.split(','):
                pg.goto(a.base + '#/play/' + mid); pg.wait_for_timeout(400)
                if 'loading' in only and mid == 'stockfish':
                    shot('loading_' + mid, full=False)
                pg.wait_for_timeout(a.wait)
                # dismiss tap-to-start
                pg.evaluate('(() => { const t = document.querySelector(".tapstart"); if (t) t.click(); })()')
                pg.wait_for_timeout(600)
                shot('mode_' + mid)
        if 'promo' in only or 'gover' in only:
            pg.goto(a.base + '#/play/stockfish'); pg.wait_for_timeout(3000)
            try: pg.wait_for_function('CM.gameUI.controller && CM.gameUI.controller.state', timeout=15000)
            except Exception: pass
            if 'promo' in only:
                pg.evaluate('''() => { const c = CM.gameUI.controller; window.__s0 = c.spec.setup; c.spec.setup = Object.assign({}, c.spec.setup, { fen: '7k/P7/8/8/8/8/8/K7' }); CM.settings.set('autoQueen', false); c.newGame(); }''')
                pg.wait_for_timeout(600)
                def tap(n):
                    x, y = pg.evaluate(f'''(() => {{ const c = CM.gameUI.controller, g = c.V.geo || c.V.g; const r = CM.gameUI.board.rectOf(g.parse('{n}')); return [r.left + r.width/2, r.top + r.height/2]; }})()''')
                    pg.mouse.click(x, y); pg.wait_for_timeout(150)
                tap('a7'); tap('a8'); pg.wait_for_timeout(400); shot('promo', full=False)
                pg.keyboard.press('Escape'); pg.evaluate('''() => { const c = CM.gameUI.controller; c.spec.setup = window.__s0; CM.settings.set('autoQueen', true); c.newGame(); }'''); pg.wait_for_timeout(500)
            if 'gover' in only:
                pg.click('#resign'); pg.wait_for_timeout(200); pg.click('#resign')
                try: pg.wait_for_selector('#gover.is-open', timeout=4000)
                except Exception: pass
                pg.wait_for_timeout(700); shot('gover', full=False)
        ctx.close()
    b.close()
json.dump(report, open(f'{a.out}/report.json', 'w'), indent=1)
