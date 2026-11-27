#!/usr/bin/env python3
"""cm_acc 2026-11-26: Labyrinth 82 (xg_djfCrRes) accuracy check at 390x844 touch.

  python3 tools/qa_lab82.py [--port 8912] [--shots DIR] [--max-turns 120]

Checks the start board against the maxres1 intro frame (14x14 cross, 70 stone walls, each army on its back row, kings
drawn with a big 8), names Plankton / Megan / JMeister, the 1 min + 5 s clocks, a pawn promoting on its 2nd rank to a
full-value piece (no 1-point promoted types), the double step skipping the promotion, then plays Blue to a result
through real taps (greedy: checkmate/capture/check first) and checks the game-over card. The bots think for ~60 ms
here (QA only) so a whole game fits in one run. Exit 1 on any failure or console error."""
import os, sys, threading, http.server, socketserver, functools, argparse, json
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser(); ap.add_argument('--port', type=int, default=8912); ap.add_argument('--shots', default='')
ap.add_argument('--max-turns', type=int, default=120)
args = ap.parse_args()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{args.port}/index.html'
MID = 'xg_djfCrRes'
H = "const c = CM.gameUI.controller, V = c.V, g = V.geo, ctx = c.ctx, sq = n => g.parse(n);"
fails = []
def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (' ' + str(info) if info and not ok else ''))
    if not ok: fails.append(name)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    errs, netfail = [], []
    pg.on('pageerror', lambda x: errs.append(str(x))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('requestfailed', lambda q: netfail.append(q.url) if 'ABORTED' not in (q.failure or '') else None)
    pg.goto(BASE + '#/play/' + MID)
    pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=20000)
    pg.wait_for_function('!document.querySelector(".view-game.is-loading")', timeout=15000)
    pg.evaluate('() => { const c = CM.gameUI.controller; c.spec.bot = Object.assign({}, c.spec.bot, { time_ms: 60, min_ms: 0, depth: 1 }); }')
    try: pg.wait_for_selector('.tapstart', timeout=5000); pg.locator('.tapstart').first.click()
    except Exception: pass
    pg.wait_for_function('() => { const c = CM.gameUI.controller; return c.state.turn === "u" && !c.busy; }', timeout=30000); pg.wait_for_timeout(300)
    r = pg.evaluate('() => { ' + H + ''' const b = c.state.b, cnt = f => b.filter(f).length;
      return { files: g.files, walls: cnt(p => p && p.t === '#'), pieces: ['r','u','y','g'].map(k => cnt(p => p && p.c === k)),
        k9: b[sq('k9')] ? b[sq('k9')].t : null, light: getComputedStyle(document.querySelector('#board .sq.light, #board .sq--light, #board .sq')).backgroundColor,
        lives: [...document.querySelectorAll('#board .g6-lives')].map(e => e.textContent), text: document.body.innerText }; }''')
    check('14x14 board, 70 stone walls, k9 open', r['files'] == 14 and r["walls"] == 70 and r['k9'] is None, (r['files'], r['walls'], r['k9']))
    check('armies of 7 (K, R, 3 N, 2 P each)', r['pieces'] == [7, 7, 7, 7], r['pieces'])
    check('kings carry a big 8', r['lives'] == ['8'] * 4, r['lives'])
    check('names Plankton / Megan / JMeister', all(n in r['text'] for n in ('Plankton', 'Megan', 'JMeister')), '')
    check('1:00 clocks in the status line', '1:0' in r['text'] or '0:5' in r['text'], '')
    if args.shots: pg.screenshot(path=os.path.join(args.shots, 'lab82_start.png'))
    r = pg.evaluate('() => { ' + H + ''' const ms = c.moves.filter(m => m.p === 'P');
      return { promo: ms.filter(m => m.promo).map(m => g.name(m.f) + '-' + g.name(m.t) + '=' + m.promo).sort(), dbl: ms.filter(m => !m.promo && Math.abs(g.col(m.t) - g.col(m.f)) === 2).map(m => g.name(m.f) + '-' + g.name(m.t)) }; }''')
    check('Blue pawns promote on their 2nd rank to Q/N/R/B', len(r['promo']) == 8 and all(x[-1] in 'QNRB' for x in r['promo']), r)
    check('a double step skips the promotion', len(r['dbl']) >= 1, r)
    pts = pg.evaluate('() => CM.gameUI.controller.V.winTypes.points.values')
    check('promoted queen is worth 9 (no 1-point promoted types)', pts.get('Q') == 9 and 'PQ' not in pts, pts)
    # play to a result through real taps
    turns = 0
    while turns < args.max_turns:
        pg.wait_for_function('() => { const c = CM.gameUI.controller; return c.over || (c.state.turn === "u" && !c.busy); }', timeout=60000)
        if pg.evaluate('() => !!CM.gameUI.controller.over'): break
        if pg.locator('#g6-claim').count():   # chess.com offers Claim Win with two players left and a 20-point lead
            pg.locator('#g6-claim').first.click(); pg.wait_for_timeout(800); print('  claimed the win'); break
        mv = pg.evaluate('() => { ' + H + ''' const ms = c.moves.filter(m => !m.promo || m.promo === 'Q'); if (!ms.length) return null;
          let best = null, bs = -1e9;
          for (const m of ms) { let s = Math.random(); const n = m.n || V.make(c.state, m);
            if (m.cap) s += 10 + (m.cap.t === 'K' ? 500 : V.def(m.cap.t).value / 50);
            if (['r','y','g'].some(k => V.royals(n, k).some(q => V.attacked(n, q, 'u')))) s += 30;
            if (m.promo) s += 20;
            if (V.attacked(n, m.t, 'r') || V.attacked(n, m.t, 'y') || V.attacked(n, m.t, 'g')) s -= 8;
            if (s > bs) { bs = s; best = m; } }
          return [best.f, best.t, best.promo || null]; }''')
        if not mv: break
        pg.locator('#board .sq[data-i="%d"]' % mv[0]).first.click(); pg.wait_for_timeout(60)
        pg.locator('#board .sq[data-i="%d"]' % mv[1]).first.click(); pg.wait_for_timeout(120)
        if pg.locator('#promo:not([hidden]) [data-t]').count():
            if args.shots and not os.path.exists(os.path.join(args.shots, 'lab82_promo.png')): pg.screenshot(path=os.path.join(args.shots, 'lab82_promo.png'))
            pg.locator('#promo [data-t="Q"]').first.click(); pg.wait_for_timeout(120)
        turns += 1
    pg.wait_for_timeout(1500)
    r = pg.evaluate('() => { const c = CM.gameUI.controller; return { over: c.over, score: c.state.score, out: c.state.out, lives: (c.state.x || {}).lives, modal: document.body.innerText.indexOf("Place") >= 0 || document.body.innerText.indexOf("You Won") >= 0 }; }')
    print('  result after %d player turns:' % turns, json.dumps(r))
    check('game reaches a result with the placement card', bool(r['over']) and r['modal'], '')
    if args.shots: pg.screenshot(path=os.path.join(args.shots, 'lab82_over.png'))
    local = [u for u in netfail if u.startswith('http://127.0.0.1')]
    check('every local asset loads', not local, local)
    errs = [e for e in errs if 'favicon' not in e and not (e.startswith('Failed to load resource') and ('407' in e or 'TUNNEL' in e))]
    check('0 console errors', not errs, errs[:5])
    b.close()
srv.shutdown()
print('FAILED: ' + ', '.join(fails) if fails else 'ALL PASS')
sys.exit(1 if fails else 0)
