#!/usr/bin/env python3
"""Haptics QA (owner 2026-11-27 "add mobile haptics crispy", Z Flip6 / Android Chrome). 390x844, is_mobile + has_touch.
navigator.vibrate is stubbed to record every call; checks:
  no pulse before the first gesture; Tap to start = 10; piece select = 6; own move = 12; illegal = [10,30,10,30,10];
  a capture = [14,30,18]; bot quiet moves stay silent, bot captures of your pieces / checks buzz;
  throttle (>= 40 ms between pulses, a stronger event may cut in); resign -> loss [60]; win modal -> [15,60,15,60,40];
  Settings > Haptics switch off silences everything and persists across a reload (localStorage cm.settings);
  0 app console errors.
Run: python3 -m http.server 8471 & python3 tools/qa_haptics.py [--base http://127.0.0.1:8471/index.html]"""
import sys, argparse
from playwright.sync_api import sync_playwright
ap = argparse.ArgumentParser(); ap.add_argument('--base', default='http://127.0.0.1:8471/index.html'); a = ap.parse_args()
ok = True
def chk(c, m):
    global ok
    print(('ok   ' if c else 'FAIL ') + m, flush=True); ok = ok and bool(c)
STUB = '''(() => { window.__vib = []; window.__mk = [];
  Object.defineProperty(Navigator.prototype, 'vibrate', { configurable: true, writable: true,
    value: function (p) { window.__vib.push({ t: performance.now(), p: Array.isArray(p) ? p.slice() : [p] }); return true; } }); })()'''
SQ = '''n => { const c = CM.gameUI.controller, g = c.V.geo; for (let i = 0; i < c.state.b.length; i++) if (g.name(i) === n) return i; return -1; }'''
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    ctx.add_init_script(STUB)
    pg = ctx.new_page(); errs = []
    pg.on('console', lambda m: m.type == 'error' and errs.append(m.text)); pg.on('pageerror', lambda e: errs.append(str(e)))
    vib = lambda: pg.evaluate('window.__vib.map(v => v.p)')
    def clear(): pg.evaluate('window.__vib.length = 0; CM.haptics._reset()')
    def tapsq(name):
        i = pg.evaluate(SQ, name); r = pg.evaluate('i => { const e = CM.gameUI.board.sqEl(i).getBoundingClientRect(); return [e.x + e.width / 2, e.y + e.height / 2]; }', i)
        pg.touchscreen.tap(r[0], r[1]); pg.wait_for_timeout(120)
    pg.goto(a.base + '#/play/stockfish'); pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && document.querySelector(".tapstart")'); pg.wait_for_timeout(800)
    chk(pg.evaluate("CM.settings.get('haptics') === true"), 'Haptics defaults ON on a touch device')
    pg.evaluate('CM.haptics.move(); CM.haptics.win()')
    chk(vib() == [], f'no vibrate before the first user gesture ({vib()})')
    # Tap to start
    pg.tap('.tapstart'); pg.wait_for_timeout(1500)
    chk(vib()[:1] == [[10]], f'Tap to start -> [10] ({vib()})')
    # hold the bot until we want it, and tag every move the controller plays
    pg.evaluate('''() => { const c = CM.gameUI.controller, s = c.sound;
      c.sound = function (m, chk, cap) { const n = window.__vib.length; s.apply(this, arguments);
        window.__mk.push({ mine: m.c === c.human, chk: !!chk, cap: !!cap, capC: m.cap ? m.cap.c : null, got: window.__vib.slice(n).map(v => v.p) }); }; }''')
    pg.wait_for_function('CM.gameUI.controller.state.turn === "w" && !CM.gameUI.controller.busy', timeout=8000)
    clear(); tapsq('e2')
    chk(vib() == [[6]], f'select own pawn -> [6] ({vib()})')
    pg.wait_for_timeout(60); clear(); tapsq('e5')
    chk(vib() == [[10, 30, 10, 30, 10]], f'illegal target -> [10,30,10,30,10] ({vib()})')
    pg.wait_for_timeout(60); tapsq('e2'); clear(); tapsq('e4')
    chk([6] not in vib() and vib()[:1] == [[12]], f'own move e2-e4 -> [12] ({vib()})')
    # play on until a capture is ours to make (or 12 moves), recording what each move buzzed
    for k in range(12):
        pg.wait_for_function('CM.gameUI.controller.over || (CM.gameUI.controller.state.turn === "w" && !CM.gameUI.controller.busy)', timeout=15000)
        if pg.evaluate('!!CM.gameUI.controller.over'): break
        mv = pg.evaluate('''() => { const c = CM.gameUI.controller, g = c.V.geo, ms = c.moves.filter(m => m.f >= 0 && !m.promo);
          const cap = ms.find(m => m.cap && m.cap.t !== 'K'); const m = cap || ms.find(m => !m.cap && m.p === 'N') || ms.find(m => !m.cap) || ms[0];
          return m ? [g.name(m.f), g.name(m.t), !!cap] : null; }''')
        if not mv: break
        pg.wait_for_timeout(60); tapsq(mv[0]); tapsq(mv[1]); pg.wait_for_timeout(200)
        if mv[2]: break
    pg.wait_for_timeout(2500)
    mk = pg.evaluate('window.__mk')
    caps = [m for m in mk if m['mine'] and m['cap'] and not m['chk']]
    chk(caps and all(m['got'] == [[14, 30, 18]] for m in caps), f"own capture -> [14,30,18] ({[m['got'] for m in caps]})")
    own = [m for m in mk if m['mine'] and not m['cap'] and not m['chk']]
    chk(own and all(m['got'] == [[12]] for m in own), f"every own quiet move -> [12] ({len(own)} moves)")
    bq = [m for m in mk if not m['mine'] and not m['cap'] and not m['chk']]
    chk(all(m['got'] == [] for m in bq), f"bot quiet moves stay silent ({len(bq)} moves, {[m['got'] for m in bq if m['got']]})")
    bc = [m for m in mk if not m['mine'] and (m['chk'] or (m['cap'] and m['capC'] == 'w'))]
    chk(all(m['got'] in ([[14, 30, 18]], [[20, 40, 20]]) for m in bc), f"bot capture / check of yours buzzes ({len(bc)} seen: {[m['got'] for m in bc]})")
    # forced check / bot-capture cases through the same entry point the controller uses
    clear(); pg.evaluate("CM.haptics.fromMove({ c: 'b', cap: { c: 'w', t: 'N' } }, false, true, 'w')"); pg.wait_for_timeout(60)
    pg.evaluate("CM.haptics.fromMove({ c: 'b' }, true, false, 'w')"); pg.wait_for_timeout(60)
    pg.evaluate("CM.haptics.fromMove({ c: 'b' }, false, false, 'w')")
    chk(vib() == [[14, 30, 18], [20, 40, 20]], f'bot takes your piece -> capture, bot check -> [20,40,20], bot quiet -> nothing ({vib()})')
    # throttle
    clear(); pg.evaluate('for (let i = 0; i < 6; i++) CM.haptics.tap()')
    chk(vib() == [[8]], f'6 taps in one burst -> 1 pulse ({vib()})')
    clear(); t = pg.evaluate('(async () => { for (let i = 0; i < 10; i++) { CM.haptics.move(); await new Promise(r => setTimeout(r, 15)); } return window.__vib.map(v => v.t); })()')
    gaps = [round(y - x) for x, y in zip(t, t[1:])]
    chk(len(t) < 10 and all(g >= 40 for g in gaps), f'moves every 15 ms -> {len(t)} pulses, gaps {gaps} all >= 40 ms')
    clear(); pg.evaluate('CM.haptics.move(); CM.haptics.check(); CM.haptics.select()')
    chk(vib() == [[12], [20, 40, 20]], f'a stronger event cuts into the 40 ms window, a weaker one does not ({vib()})')
    # game over: resign -> loss
    pg.wait_for_timeout(60); clear()
    chk(pg.evaluate('!CM.gameUI.controller.over'), 'game still running before resign')
    pg.evaluate('document.getElementById("resign").click()'); pg.wait_for_timeout(150)   # arms
    pg.evaluate('document.getElementById("resign").click()'); pg.wait_for_timeout(400)   # confirms
    chk([60] in vib(), f'resign -> loss [60] ({vib()})')
    pg.wait_for_timeout(900); chk(pg.evaluate('document.getElementById("gover").classList.contains("is-open")'), 'result modal open')
    clear(); pg.evaluate("CM.gameUI.showOver({ result: 'win', delay: 0 })")
    chk(vib() == [[15, 60, 15, 60, 40]], f'win modal -> [15,60,15,60,40] ({vib()})')
    pg.wait_for_timeout(100); clear(); pg.tap('#gover .btn--primary'); pg.wait_for_timeout(300)
    chk(vib()[:1] == [[8]], f'result modal button press -> [8] ({vib()})')
    # Settings switch off -> silent, persisted
    pg.wait_for_timeout(1200); pg.evaluate('CM.settingsPanel.open()'); pg.wait_for_timeout(300)
    chk(pg.locator('#opt-haptics').is_checked(), 'Settings shows Haptics switch, checked')
    pg.locator('#opt-haptics').click(); pg.wait_for_timeout(100)
    clear(); pg.wait_for_timeout(60); pg.evaluate('CM.haptics.win(); CM.haptics.tap()')
    chk(pg.evaluate("CM.settings.get('haptics') === false") and vib() == [], f'switch off -> no pulses ({vib()})')
    pg.reload(); pg.wait_for_function('window.CM && CM.settings'); pg.wait_for_timeout(600)
    chk(pg.evaluate("CM.settings.get('haptics') === false && JSON.parse(localStorage.getItem('cm.settings')).haptics === false"), 'off survives a reload (cm.settings)')
    pg.evaluate("localStorage.clear()")
    app = [e for e in errs if 'ERR_' not in e and 'net::' not in e and 'Failed to load resource' not in e and '407' not in e and 'unpkg.com' not in e and 'jsdelivr' not in e]   # CDN engines are blocked in this sandbox (HANDOFF)
    chk(not app, f'0 app console errors {app[:3]}')
    b.close()
print('PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)
