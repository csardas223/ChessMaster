#!/usr/bin/env python3
"""5d-qa (2026-11-25): play-test 5D Chess (BbgwPj-u_gs, js/games/g4_5d.js) in headless Chromium with REAL taps on the canvas.

  python3 tools/qa_5d.py [--width 390] [--shots DIR] [--part game|puzzles|all]

Versus engine: 1.e4 by taps + Submit, waits for the engine, then plays a time-travel move by taps (a piece sent to a
past board -> a new timeline must appear), submits, waits for the engine again; checks Undo Move, that Submit stays
off while a present-line board is unplayed, and that no console error happens.
Puzzles: opens each of the seven puzzles from the picker, plays one wrong turn (Black must answer, then the puzzle
resets), then finds the mating turn in the page and plays it by taps + Submit -> "Puzzle complete!" modal.
Sandbox Chromium: LD_LIBRARY_PATH=/tmp/libs/root/usr/lib/aarch64-linux-gnu:/tmp/libs/root/lib/aarch64-linux-gnu"""
import os, sys, json, time, threading, functools, http.server, socketserver, argparse
from playwright.sync_api import sync_playwright

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--width', type=int, default=390)
ap.add_argument('--shots', default='/workspace/work/qa_5d_shots')
ap.add_argument('--part', default='all')
ap.add_argument('--port', type=int, default=8796)
args = ap.parse_args()
os.makedirs(args.shots, exist_ok=True)

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=APP))
threading.Thread(target=srv.serve_forever, daemon=True).start()

errors, fails = [], []
def check(cond, msg):
    print(('ok   ' if cond else 'FAIL ') + msg, flush=True)
    if not cond: fails.append(msg)

MOD = 'CM.gameUI.controller.mod'
with sync_playwright() as p:
    b = p.chromium.launch(args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': args.width, 'height': 800}, device_scale_factor=2)
    pg.on('console', lambda m: m.type == 'error' and not any(k in m.text for k in ('407', 'ERR_TUNNEL', 'ERR_PROXY', 'ERR_NAME')) and errors.append(m.text))   # sandbox proxy blocks remote fonts/CDN
    pg.on('response', lambda r: r.url.startswith('http://127.0.0.1') and r.status >= 400 and errors.append('%d %s' % (r.status, r.url)))
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.goto('http://127.0.0.1:%d/index.html#/play/BbgwPj-u_gs' % args.port)
    pg.wait_for_function('CM.gameUI && CM.gameUI.controller && ' + MOD + ' && ' + MOD + '.qa', timeout=20000)
    pg.wait_for_timeout(1800)   # intro card
    cv = pg.locator('canvas').first
    def box(): return cv.bounding_box()
    def qa(): return pg.evaluate(MOD + '.qa()')
    def tap_pt(pt):
        bb = box(); pg.mouse.click(bb['x'] + pt[0], bb['y'] + pt[1]); pg.wait_for_timeout(120)
    def on_canvas(pt):
        bb = box(); return 0 <= pt[0] < bb['width'] and 0 <= pt[1] < bb['height']
    def tap_sq(L, ply, j):
        pt = pg.evaluate('%s.qaPoint(%d,%d,%d)' % (MOD, L, ply, j))
        if not on_canvas(pt):  # zoom out with the "-" pill until the board is on screen
            for _ in range(6):
                tap_pt(pg.evaluate(MOD + '.qaButton("zout")')[:2]); pt = pg.evaluate('%s.qaPoint(%d,%d,%d)' % (MOD, L, ply, j))
                if on_canvas(pt): break
        tap_pt(pt)
    def tap_btn(i):
        bt = pg.evaluate(MOD + '.qaButton("%s")' % i); tap_pt(bt[:2]); return bt[2]
    def play(m):
        n0 = qa()['turnMoves']
        tap_sq(m['fl'], m['fp'], m['fi']); pg.wait_for_timeout(300); tap_sq(m['tl'], m['tp'], m['ti'])
        return qa()['turnMoves'] == n0 + 1
    def wait_me(ms=25000):
        t0 = time.time()
        while time.time() - t0 < ms / 1000:
            s = qa()
            if not s['busy'] and (s['toMove'] == 'w' or not s['running']): return s
            pg.wait_for_timeout(200)
        return qa()

    if args.part in ('game', 'all'):
        s = qa(); check(s['running'] and s['toMove'] == 'w' and s['puzzle'] is None, 'versus engine: standard start, White to move')
        check(tap_btn('submit') is False, 'Submit Moves is off before any move')
        ms = pg.evaluate(MOD + '.qaMoves()')
        e4 = [m for m in ms if m['piece'][:2] == 'wP' and m['fi'] == 52 and m['ti'] == 36][0]
        check(play(e4), '1.e4 played by tapping e2 then e4')
        check(tap_btn('undo') and qa()['turnMoves'] == 0, 'Undo Move takes it back')
        check(play(e4), '1.e4 again')
        pg.screenshot(path=os.path.join(args.shots, '5d_%d_e4.png' % args.width))
        check(tap_btn('submit'), 'Submit Moves is on after the present-line board was played')
        s = wait_me(); check(s['running'] and s['toMove'] == 'w' and len(s['log']) == 2, 'engine answered: ' + ' '.join(s['log']))
        # second normal move so a white piece can travel back; then a time-travel move by taps
        travelled = False
        for turn in range(6):
            ms = pg.evaluate(MOD + '.qaMoves()')
            tt = [m for m in ms if (m['tl'] != m['fl'] or m['tp'] != m['fp']) and not m.get('castle')]
            if tt and turn >= 1:
                n0 = len(qa()['state']['tls'])
                m = sorted(tt, key=lambda m: (m['tl'] != m['fl'], -abs(m['fp'] - m['tp'])))[0]
                check(play(m), 'time-travel move by taps: ' + qa()['log'][-1])
                st = qa(); check(len(st['state']['tls']) == n0 + 1, 'a new timeline branched (%d -> %d timelines)' % (n0, len(st['state']['tls'])))
                pg.wait_for_timeout(700); pg.screenshot(path=os.path.join(args.shots, '5d_%d_branch.png' % args.width))
                # finish the turn on any remaining present-line board, then submit
                for _ in range(4):
                    if qa()['toMove'] != 'w': break
                    mm = [x for x in pg.evaluate(MOD + '.qaMoves()') if x['tl'] == x['fl'] and x['tp'] == x['fp']]
                    play(mm[0])
                ok_sub = tap_btn('submit')
                if not ok_sub:  # the travel left the king in check: undo everything and play a quiet move
                    while qa()['turnMoves']: tap_btn('undo')
                    continue
                s = wait_me(); check(s['running'], 'engine answered the multiverse turn (%d timelines): %s' % (len(s['state']['tls']), ' '.join(s['log'][-4:])))
                travelled = True; break
            quiet = [m for m in ms if m['tl'] == m['fl'] and m['tp'] == m['fp'] and m['piece'][:2] in ('wN', 'wB', 'wP') and not m.get('cap')]
            play(quiet[turn % len(quiet)]); tap_btn('submit'); s = wait_me()
            if not s['running']: break
        check(travelled, 'played and submitted a time-travel turn against the engine')
        pg.wait_for_timeout(600); pg.screenshot(path=os.path.join(args.shots, '5d_%d_after_travel.png' % args.width))
        # play on: a few more engine turns with random legal player turns (engine must keep answering legally)
        for k in range(3):
            s = qa()
            if not s['running']: break
            seq = pg.evaluate('(function(){var E=CM.fiveD,m=%s,S=E.fromDef(m.qa().state);return E.legalTurn(S,"w",E.budget(60000,3000))})()' % MOD)
            if not seq: break
            for m in seq: play(m)
            tap_btn('submit'); s = wait_me()
        s = qa(); check(len(s['log']) >= 8, 'game went on: %d moves logged, %d timelines' % (len(s['log']), len(s['state']['tls'])))
        pg.screenshot(path=os.path.join(args.shots, '5d_%d_game.png' % args.width))

    if args.part in ('puzzles', 'all'):
        names = []
        for pc in 'RNBPQKT':
            pg.evaluate("document.querySelector('.gpicker [data-v=\"%s\"]').click()" % pc)
            pg.wait_for_timeout(300)
            s = qa(); check(s['puzzle'] == pc and s['running'] and s['toMove'] == 'w', 'puzzle %s opened from the picker' % pc)
            # find the mating turn and one wrong turn in the page
            res = pg.evaluate('''(function(){var E=CM.fiveD,S=E.fromDef(%s.qa().state),mate=null,wrong=null,ctl=E.budget(2000000,60000);
              (function all(Sx,pre){ if(mate||ctl.aborted) return; if(E.toMove(Sx)!=='w'){ if(E.inCheck(Sx,'w')) return; var st=E.status(Sx,E.budget(100000,4000)); if(st.mate) mate=pre; else if(st.ok&&!wrong) wrong=pre; return; }
                var ch=E.children(Sx,'w',ctl); if(!ch) return; for(var k=0;k<ch.length&&!mate;k++) all(ch[k][1],pre.concat([ch[k][0]])); })(S,[]);
              return {mate:mate, wrong:wrong};})()''' % MOD)
            check(res['mate'] is not None, 'puzzle %s: a mating turn exists (%d moves)' % (pc, len(res['mate'] or [])))
            if res['wrong'] and pc in 'RQ':
                for m in res['wrong']: play(m)
                tap_btn('submit'); pg.wait_for_timeout(900)
                s = qa(); check(len(s['log']) > len(res['wrong']), 'puzzle %s: wrong turn -> Black escapes (%s)' % (pc, ' '.join(s['log'][len(res['wrong']):])))
                pg.wait_for_timeout(2600); s = qa(); check(s['turnMoves'] == 0 and len(s['log']) == 0 and s['running'], 'puzzle %s: resets after the escape' % pc)
            for m in res['mate']: check(play(m), 'puzzle %s: tapped %s' % (pc, qa()['log'][-1]))
            tap_btn('submit'); pg.wait_for_timeout(1200)
            title = pg.evaluate("(document.getElementById('gotitle')||{}).textContent||''")
            s = qa(); check(not s['running'] and 'Puzzle complete' in title, 'puzzle %s solved: %s' % (pc, ' '.join(s['log'])))
            check(pg.evaluate(MOD + '.qaChecks()') > 0, 'puzzle %s: check marker shown on the mated king(s)' % pc)
            pg.screenshot(path=os.path.join(args.shots, '5d_%d_puzzle_%s.png' % (args.width, pc)))
            pg.evaluate("(function(){var b=document.getElementById('gonew'); if(b) b.click();})()"); pg.wait_for_timeout(300)
            if pc != 'T': check(qa()['puzzle'] == 'RNBPQKT'['RNBPQKT'.index(pc) + 1], 'New game after %s opens the next puzzle' % pc)

    b.close()
check(not errors, 'no console errors' + ('' if not errors else ': ' + ' | '.join(errors[:5])))
srv.shutdown()
print('5D QA:', 'PASS' if not fails else '%d FAILED' % len(fails))
sys.exit(1 if fails else 0)
