#!/usr/bin/env python3
"""cm_acc 2026-11-26: Thermopylae (boaA9_TjXeU) accuracy check at 390x844 touch.

  python3 tools/qa_thermo.py [--port 8905] [--shots DIR] [--side r|g] [--size 360x780] [--flag]
  (--flag: run your clock down instead of playing, expect "you ran out of time")

Loads the mode, checks the start position against the 1:55 frame (14x14 cross, walls, Green's General with 73, Red's
Ferz with 72, Yellow king 999, bot names Checker / F-Checker), that Blue's and Yellow's pieces cannot be captured, that a
green soldier promotes on the d-file with the video's choices, then plays the game to a result through real taps
(Red: greedy toward the General; Green: random) and checks the game-over card. Exit 1 on any failure or console error."""
import os, sys, threading, http.server, socketserver, functools, argparse, json
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser(); ap.add_argument('--port', type=int, default=8905); ap.add_argument('--shots', default='')
ap.add_argument('--side', default='r'); ap.add_argument('--size', default='390x844'); ap.add_argument('--flag', action='store_true'); ap.add_argument('--max-turns', type=int, default=90)
args = ap.parse_args()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{args.port}/index.html'
MID = 'boaA9_TjXeU'
H = "const c = CM.gameUI.controller, V = c.V, g = V.geo, ctx = c.ctx, sq = n => g.parse(n);"
fails = []
def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (' ' + str(info) if info and not ok else ''))
    if not ok: fails.append(name)
def tap_i(pg, i):
    pg.locator('#board .sq[data-i="%d"]' % i).first.click(); pg.wait_for_timeout(120)
def wait_turn(pg, side):
    pg.wait_for_function('(s) => { const c = CM.gameUI.controller; return c.over || (c.state.turn === s && !c.busy); }', arg=side, timeout=60000)

with sync_playwright() as p:
    b = p.chromium.launch()
    W, Hh = map(int, args.size.split('x'))
    pg = b.new_page(viewport={'width': W, 'height': Hh}, device_scale_factor=2, is_mobile=True, has_touch=True)
    errs, netfail = [], []
    pg.on('pageerror', lambda x: errs.append(str(x))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('requestfailed', lambda q: netfail.append(q.url) if 'ABORTED' not in (q.failure or '') else None)   # aborted = media cut off by New game
    pg.goto(BASE + '#/')
    pg.evaluate('s => localStorage.setItem("cm.g5thermo.side", JSON.stringify(s))', args.side)
    pg.goto(BASE + '#/play/' + MID)
    pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=20000)
    pg.wait_for_function('!document.querySelector(".view-game.is-loading")', timeout=15000); pg.wait_for_timeout(600)
    try: pg.wait_for_selector('.tapstart', timeout=5000); pg.locator('.tapstart').first.click(); pg.wait_for_timeout(2800)
    except Exception: pass
    side = pg.evaluate('() => CM.gameUI.controller.human')
    if side != args.side:   # the store key differs: use the Play-as picker
        pg.evaluate('s => { const b = document.querySelector(".g5thermo [data-side=" + s + "]"); if (b) b.click(); }', args.side); pg.wait_for_timeout(2500)
        side = pg.evaluate('() => CM.gameUI.controller.human')
    check('playing as ' + args.side, side == args.side, side)
    r = pg.evaluate('() => { ' + H + ''' const b = c.state.b, cnt = f => b.filter(f).length;
      const at = (col, row) => { const p = b[g.parse(String.fromCharCode(97 + col) + (14 - row))]; return p ? p.c + ':' + p.t : null; };
      return { files: g.files, walls: cnt(p => p && p.t === '#'), red: cnt(p => p && p.c === 'r'), green: cnt(p => p && p.c === 'g'),
        gen: at(7, 0), ferz: at(10, 13), yr: at(8, 13), yk: at(11, 10), ur: at(10, 3),
        lives: [...document.querySelectorAll('#board .th-lives')].map(e => e.textContent).sort(),
        shields: document.querySelectorAll('#board .sq.th-shield').length,
        names: document.body.innerText }; }''')
    check('14x14 board', r['files'] == 14, r)
    if side == 'r': check('start squares from the 1:55 frame (General h14, Ferz k1, Yellow rook i1 + king l4, Blue rook k11)',
          (r['gen'], r['ferz'], r['yr'], r['yk'], r['ur']) == ('g:O', 'r:F', 'y:R', 'y:K', 'u:R'), r)
    if side == 'r': check('army sizes (Red 61, Green 16) and 44 wall squares', (r['red'], r['green'], r['walls']) == (61, 16, 44), r)
    check('check counters drawn: Ferz 72 (71 after Yellow\'s first check when Green), General 73, Yellow 999', r['lives'] in (['72', '73', '999'], ['71', '73', '999']) or side == 'g', r['lives'])
    check('Blue + Yellow pieces framed as uncapturable (5)', r['shields'] == 5, r['shields'])
    check('bot names Checker / F-Checker in the player bars', 'Checker' in r['names'] and 'F-Checker' in r['names'], '')
    if args.shots: pg.screenshot(path=os.path.join(args.shots, 'thermo_start_%s.png' % side))
    # cm_h5: 2:00 clock with a 5 s delay (transcript 16:35 / 16:47): nothing comes off for 5 s, then it counts
    wait_turn(pg, side)
    st = lambda: pg.evaluate('() => (document.querySelector("#status, .status") || document.body).innerText')
    c0 = pg.evaluate('() => { const K = CM.gameUI.controller._thClk; return K && { left: K.left, run: K.run }; }')
    check('your clock starts at 2:00 and runs on your turn', bool(c0) and c0['left'] == 120000 and c0['run'], c0)
    check('status shows "Your clock 2:00 (5 s delay)"', 'Your clock 2:00 (5 s delay)' in pg.evaluate('() => document.body.innerText'), '')
    pg.evaluate('() => { CM.gameUI.controller._thClk.t = performance.now(); }')   # restart this turn's timer: deterministic timing
    pg.wait_for_timeout(4000)
    check('inside the 5 s delay the clock still reads 2:00', 'Your clock 2:00' in pg.evaluate('() => document.body.innerText'), '')
    pg.wait_for_timeout(3200)
    t = pg.evaluate('() => document.body.innerText'); import re; mm = re.search(r'Your clock (\d):(\d\d)', t)
    check('after the delay it counts down (1:57-1:59 at ~7 s)', bool(mm) and mm.group(0) in ('Your clock 1:57', 'Your clock 1:58', 'Your clock 1:59'), mm and mm.group(0))
    if args.flag:
        pg.evaluate('() => { const K = CM.gameUI.controller._thClk; K.left = 300; }'); pg.wait_for_timeout(6500)
        o = pg.evaluate('() => CM.gameUI.controller.over')
        check('flag: running out of time loses', bool(o) and 'ran out of time' in (o.get('why') or ''), o)
        if args.shots: pg.screenshot(path=os.path.join(args.shots, 'thermo_flag_%s.png' % side))
    # rules on a scratch state (engine only, nothing changes on the board)
    r = pg.evaluate('() => { ' + H + ''' const st = JSON.parse(JSON.stringify(c.state));
      st.b[g.parse('l9')] = V.piece('Q', 'r'); st.turn = 'r';   // red queen next to Blue's pawn m9
      const caps = V.legal(st).filter(m => m.f === g.parse('l9') && m.cap).map(m => m.cap.c);
      const s2 = JSON.parse(JSON.stringify(c.state)); s2.turn = 'g'; s2.b[g.parse('d13')] = null;
      const pro = V.legal(s2).filter(m => m.f === g.parse('e13') && m.t === g.parse('d13')).map(m => m.promo).sort();
      const pro2 = V.legal(s2).filter(m => m.f === g.parse('e13') && m.t !== g.parse('d13')).length;
      return { caps, pro, pro2 }; }''')
    check('Red cannot capture Blue or Yellow pieces', not any(c in ('u', 'y') for c in r['caps']), r)
    check('green soldier e13 promotes on d13 to Q / Archbishop / General / Wildebeest', r['pro'] == ['A', 'H', 'Q', 'Y'] and r['pro2'] == 0, r)
    # play to a result through real taps
    turns = 0
    if args.flag: args.max_turns = 0
    while turns < args.max_turns:
        wait_turn(pg, side)
        if pg.evaluate('() => !!CM.gameUI.controller.over'): break
        mv = pg.evaluate('(side) => { ' + H + ''' const ms = c.moves.filter(m => !m.promo || m.promo === 'Q'); if (!ms.length) return null;
          let gi = -1; c.state.b.forEach((p, i) => { if (p && p.t === 'O' && p.c === 'g') gi = i; });
          let best = null, bs = -1e9;
          for (const m of ms) { let s = Math.random();
            if (side === 'r') { if (m.cap && m.cap.t === 'O') s += 1e6; else if (m.cap) s += 50; if (gi >= 0) s -= 3 * g.dist(m.t, gi) - 3 * g.dist(m.f, gi); }
            if (s > bs) { bs = s; best = m; } }
          return [best.f, best.t]; }''', side)
        if not mv: break
        tap_i(pg, mv[0]); tap_i(pg, mv[1])
        if pg.locator('#promo:not([hidden]) [data-t]').count():   # Green's soldier reached the d-file: the picker shows the video's choices
            opts = pg.evaluate('() => [...document.querySelectorAll("#promo [data-t]")].map(b => b.dataset.t).sort()')
            check('promotion picker offers Q / Archbishop / General / Wildebeest', opts == ['A', 'H', 'Q', 'Y'], opts)
            pg.wait_for_function('() => [...document.querySelectorAll("#promo img")].every(i => i.complete && i.naturalWidth > 0)', timeout=5000)
            if args.shots: pg.wait_for_timeout(300); pg.screenshot(path=os.path.join(args.shots, 'thermo_promo.png'))
            pg.locator('#promo [data-t="A"]').first.click(); pg.wait_for_timeout(300)
        turns += 1
    pg.wait_for_timeout(1500)
    r = pg.evaluate('() => { const c = CM.gameUI.controller, x = c.state.x || {}; return { over: c.over, x: { f: x.ferzChecks, gc: x.genChecks, y: x.yChecks, rm: x.redMoves }, txt: document.body.innerText.slice(0, 4000) }; }')
    print('  result after %d player turns:' % turns, json.dumps(r['over']), r['x'])
    check('game reaches a result', bool(r['over']), r['x'])
    if side == 'r': check('Ferz counter counts Yellow\'s checks', (r['x']['f'] or 0) >= min(turns, 72) - 2, r['x'])
    if args.shots: pg.screenshot(path=os.path.join(args.shots, 'thermo_over_%s.png' % side))
    local = [u for u in netfail if u.startswith('http://127.0.0.1')]
    check('every local asset loads', not local, local)
    errs = [e for e in errs if 'favicon' not in e and not (e.startswith('Failed to load resource') and ('407' in e or 'TUNNEL' in e))]
    check('0 console errors', not errs, errs[:5])
    b.close()
srv.shutdown()
print('FAILED: ' + ', '.join(fails) if fails else 'ALL PASS')
sys.exit(1 if fails else 0)
