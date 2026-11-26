#!/usr/bin/env python3
"""acc 2026-11-26: King of the Bridge rule check (M0rsyuvaTrk, WEYUcaJTBso, js/modes/g5_troll.js), 390x844 touch.

  python3 tools/qa_kotb.py [--port 8904] [--shots DIR]

Per mode: loads it, then checks (through the live controller, taps on real squares where the player would tap):
  out-of-town ring (rook may not, bishop may), the bishop's gift of knowledge (rule 22) and a piece blown up on it,
  small-minded pawns (no double step / diagonal), a forced Troll cheat + correct accusation from the rule book,
  the payback cheat (tap a gift, then a Troll piece), the rule-7/12/14/24/25/27 cheats being fabricated, then the
  win: ending cutscene, "you became the Troll", game-over card. Exit 1 on any failed check or console error."""
import os, sys, threading, http.server, socketserver, functools, argparse
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser(); ap.add_argument('--port', type=int, default=8904); ap.add_argument('--shots', default='')
args = ap.parse_args()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{args.port}/index.html'
H = "const c = CM.gameUI.controller, V = c.V, g = V.geo, ctx = c.ctx, sq = n => g.parse(n), at = n => c.state.b[g.parse(n)];"
fails = []
def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (' ' + str(info) if info and not ok else ''))
    if not ok: fails.append(name)

def tap(pg, name):
    i = pg.evaluate('n => CM.gameUI.controller.V.geo.parse(n)', name)
    pg.locator('#board .sq[data-i="%d"]' % i).first.click(); pg.wait_for_timeout(250)

def run(pg, mid):
    errs, netfail = [], []; pg.on('pageerror', lambda x: errs.append(str(x))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.on('requestfailed', lambda q: netfail.append(q.url))
    pg.goto(BASE + '#/play/' + mid)
    pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=20000)
    pg.wait_for_function('!document.querySelector(".view-game.is-loading")', timeout=15000); pg.wait_for_timeout(800)
    try: pg.wait_for_selector('.tapstart', timeout=6000); pg.locator('.tapstart').first.click(); pg.wait_for_timeout(1200)
    except Exception: pass
    for _ in range(6):   # click through the intro dialogue
        if pg.locator('.g5troll__dlg').count(): pg.locator('.g5troll__dlg').first.click(); pg.wait_for_timeout(150)
    r = pg.evaluate('() => { ' + H + ' return { files: g.files, town: document.querySelectorAll("#board .g5troll-town").length, acc: !!document.querySelector(".g5troll button[data-a=acc]") }; }')
    check(mid + ' 10x10 board with the out-of-town ring', r['files'] == 10 and r['town'] == 36, r)
    check(mid + ' accuse button', r['acc'])
    if args.shots: pg.screenshot(path=os.path.join(args.shots, mid + '_start.png'))
    # pawns: one step N/E/W/S, no double step, no diagonals
    r = pg.evaluate('() => { ' + H + ' return c.moves.filter(m => m.f === sq("e3")).map(m => g.name(m.t)).sort(); }')
    check(mid + ' pawn e3 moves only one step forward', r == ['e4'], r)
    # clear a lane: put the white bishop on d4 and a rook on b4 (positions set through ctx, as a scripted test)
    pg.evaluate('() => { ' + H + ' ctx.set(sq("d4"), ctx.piece("B", "w")); ctx.set(sq("b5"), ctx.piece("R", "w")); ctx.remove(sq("b3")); ctx.refresh(); }')
    r = pg.evaluate('() => { ' + H + ' const t = f => c.moves.filter(m => m.f === sq(f)).map(m => g.name(m.t)); return { b: t("d4"), r: t("b5") }; }')
    check(mid + ' bishop may work out of town (a1 / a7 ring)', 'a7' in r['b'], r['b'])
    check(mid + ' tower may not leave the board', not any(n[0] == 'a' for n in r['r']), r['r'])
    # rule 22: the bishop leaves a gift on d4 when it moves (tap d4 then f6)
    tap(pg, 'd4'); tap(pg, 'f6')
    pg.wait_for_function('CM.gameUI.controller.state.turn === "w" && !CM.gameUI.controller.busy || CM.gameUI.controller.over', timeout=30000); pg.wait_for_timeout(400)
    r = pg.evaluate('() => { ' + H + ' return { gifts: Object.keys(c.state.x.gifts || {}).map(i => g.name(+i)), img: document.querySelectorAll("#board .g5troll__gift").length }; }')
    check(mid + ' gift of knowledge dropped on d4 and drawn', 'd4' in r['gifts'] and r['img'] >= 1, r)
    # a piece that steps on a gift blows up with it: walk the e3 pawn... use c3 pawn -> d3 -> d4
    pg.evaluate('() => { ' + H + ' ctx.set(sq("d3"), ctx.piece("P", "w")); ctx.refresh(); }')
    n0 = pg.evaluate('() => CM.gameUI.controller.state.b.filter(p => p && p.c === "w").length')
    tap(pg, 'd3'); tap(pg, 'd4')
    pg.wait_for_timeout(300)
    r = pg.evaluate('() => { ' + H + ' return { d4: at("d4"), n: c.state.b.filter(p => p && p.c === "w").length, gift: !!(c.state.x.gifts || {})[sq("d4")] }; }')
    check(mid + ' pawn that lands on the gift is blown up', r['d4'] is None and not r['gift'], (r, n0))
    pg.wait_for_function('CM.gameUI.controller.state.turn === "w" && !CM.gameUI.controller.busy || CM.gameUI.controller.over', timeout=30000); pg.wait_for_timeout(400)
    # make the Troll cheat on his next move, then accuse with the right page
    pg.evaluate('() => { const c = CM.gameUI.controller; c.spec.params.cheatChance = 1; c.ctx.params.cheatChance = 1; }')
    ms = pg.evaluate('() => { ' + H + ' const m = c.moves.find(m => g.name(m.f) === "h3" && g.name(m.t) === "h4"); return !!m; }')
    if ms: tap(pg, 'h3'); tap(pg, 'h4')
    else: pg.evaluate('() => { const c = CM.gameUI.controller; const m = c.moves.find(m => m.p === "P"); c.tryMove(m.f, m.t); }')
    pg.wait_for_function('CM.gameUI.controller.state.turn === "w" && !CM.gameUI.controller.busy || CM.gameUI.controller.over', timeout=30000); pg.wait_for_timeout(500)
    ch = pg.evaluate('() => CM.gameUI.controller.state.x.cheat')
    check(mid + ' the Troll cheated', bool(ch), ch)
    if ch:
        nb = pg.evaluate('() => CM.gameUI.controller.state.b.filter(p => p && p.c === "b").length')
        pg.locator('.g5troll button[data-a=acc]').click(); pg.wait_for_timeout(300)
        if args.shots: pg.screenshot(path=os.path.join(args.shots, mid + '_book.png'))
        pg.locator('.g5troll__book button[data-r="%d"]' % ch['rule']).click(); pg.wait_for_timeout(600)
        r = pg.evaluate('() => { const x = CM.gameUI.controller.state.x; return { caught: x.caught, payback: x.payback, nb: CM.gameUI.controller.state.b.filter(p => p && p.c === "b").length, over: !!CM.gameUI.controller.over }; }')
        check(mid + ' correct accusation (rule %d) arrests and grants the payback cheat' % ch['rule'], r['caught'] == 1 and r['payback'] == 1 and not r['over'] and (r['nb'] < nb or ch.get('gift') or ch['rule'] in (2, 24)), r)
        st = pg.evaluate('() => document.getElementById("status").textContent')
        check(mid + ' status says YOU MAY CHEAT THIS TURN', 'CHEAT' in st, st)
        pg.evaluate('() => { const c = CM.gameUI.controller; c.spec.params.cheatChance = 0; c.ctx.params.cheatChance = 0; }')
        # payback: place a gift next to a Troll piece first (rule 22 gift from the test), then tap gift + Troll piece
        pg.evaluate('() => { ' + H + ' const G = Object.assign({}, c.state.x.gifts || {}); G[sq("e6")] = 1; ctx.setX("gifts", G); ctx.refresh(); }')
        tgt = pg.evaluate('() => { ' + H + ' const i = c.state.b.findIndex(p => p && p.c === "b" && p.t === "N"); return i >= 0 ? g.name(i) : g.name(c.state.b.findIndex(p => p && p.c === "b")); }')
        nb = pg.evaluate('() => CM.gameUI.controller.state.b.filter(p => p && p.c === "b").length')
        tap(pg, 'e6'); tap(pg, tgt)
        pg.wait_for_timeout(500)
        print('  nb before', nb, 'hist:', pg.evaluate('() => { const c = CM.gameUI.controller; return c.history.slice(-3).map(h => h.state.b.filter(p => p && p.c === "b").length + "/" + h.state.turn).join(" ") + " now " + c.state.b.filter(p => p && p.c === "b").length + " last " + JSON.stringify(c.last); }'))
        r = pg.evaluate('(n) => { ' + H + ' return { tgt: at(n), nb: c.state.b.filter(p => p && p.c === "b").length, cheated: c.state.x.cheated, gift: !!(c.state.x.gifts || {})[sq("e6")] }; }', tgt)
        check(mid + ' payback: gift dropped on the Troll %s blows it up' % tgt, r['nb'] == nb - 1 and r['cheated'] == 1 and not r['gift'], r)
        pg.wait_for_function('CM.gameUI.controller.state.turn === "w" && !CM.gameUI.controller.busy || CM.gameUI.controller.over', timeout=30000); pg.wait_for_timeout(400)
    # every Troll cheat kind can be fabricated (rules unlocked: jump the ply clock past the unlocks for WEYU)
    r = pg.evaluate('''() => { const c = CM.gameUI.controller, g = c.V.geo, x = c.state.x, kinds = {};
      const P = c.ctx.params, keep = { u: P.unlock, h: P.hidden }; P.unlock = null; P.hidden = null;
      const st0 = c.state, b2 = st0.b.slice(); b2[g.parse('e6')] = { t: 'N', c: 'b', m: 1 }; b2[g.parse('h6')] = { t: 'R', c: 'b', m: 1 }; b2[g.parse('e5')] = { t: 'K', c: 'b', m: 1 };
      c.state = Object.assign({}, st0, { b: b2, turn: 'b', x: Object.assign({}, x, { gifts: Object.assign({ 55: 1 }, x.gifts || {}) }) });
      for (let k = 0; k < 400; k++) { const m = c.hooks.botPick(Object.assign(c.ctx, {}), []); if (m && m.cheat) kinds[m.cheat] = 1; c.state.x.revenge = 1; }
      c.state = st0; P.unlock = keep.u; P.hidden = keep.h; return Object.keys(kinds).map(Number).sort((a, b) => a - b); }''')
    for k in (2, 4, 7, 9, 12, 13, 14, 24, 25, 27):
        check(mid + ' Troll cheat rule %d exists' % k, k in r, r)
    # win: leave one Troll piece and take it -> ending cutscene
    pg.evaluate('''() => { const c = CM.gameUI.controller, ctx = c.ctx, g = c.V.geo; c.state.x.revenge = 0; c.ctx.params.cheatChance = 0; c.spec.params.cheatChance = 0;
      ctx.set(g.parse('e7'), ctx.piece('K', 'b', { crowned: 1 })); ctx.set(g.parse('e6'), ctx.piece('R', 'w')); c.state.b.forEach((p, i) => { if (p && p.c === 'b' && i !== g.parse('e7')) ctx.remove(i); });
      ctx.setX('payback', 0); ctx.setX('cheated', 1); ctx.refresh(); }''')
    pg.wait_for_timeout(300)
    r = pg.evaluate('() => ({ over: CM.gameUI.controller.over, n: CM.gameUI.controller.state.b.filter(p => p && p.c === "b").length, turn: CM.gameUI.controller.state.turn })')
    check(mid + ' one Troll piece left, game on', not r['over'] and r['n'] == 1, r)
    tap(pg, 'e6'); tap(pg, 'e7'); pg.wait_for_timeout(1200)
    r = pg.evaluate('() => ({ over: CM.gameUI.controller.over, dlg: (document.querySelector(".g5troll__dlg p") || {}).textContent || "" })')
    check(mid + ' all Troll pieces gone = win + ending cutscene', bool(r['over']) and r['over']['w'] == 'w' and 'Cheater' in r['dlg'], r)
    if args.shots: pg.screenshot(path=os.path.join(args.shots, mid + '_cutscene.png'))
    for _ in range(8):
        if pg.locator('.g5troll__dlg').count(): pg.locator('.g5troll__dlg').first.click(); pg.wait_for_timeout(200)
    pg.wait_for_timeout(900)
    r = pg.evaluate('() => ({ end: !!document.querySelector(".g5troll__end"), t1: (document.querySelector(".g5troll__timer") || {}).textContent })')
    if args.shots: pg.screenshot(path=os.path.join(args.shots, mid + '_troll.png'))
    pg.wait_for_timeout(8400)
    r2 = pg.evaluate('() => ({ modal: !!document.querySelector(".modal.is-open, .gameover, #gameover:not([hidden]), [class*=over][class*=open]"), text: document.body.innerText.indexOf("became the Troll") >= 0, t2: (document.querySelector(".g5troll__timer") || {}).textContent })')
    check(mid + ' you become the Troll, game-over card', r['end'] and r2['text'], (r, r2))
    if r['t1'] is not None: check(mid + ' speedrun timer stops after the cutscene', r['t1'] == r2['t2'], (r['t1'], r2['t2']))
    if args.shots: pg.screenshot(path=os.path.join(args.shots, mid + '_over.png'))
    local = [u for u in netfail if u.startswith('http://127.0.0.1')]
    check(mid + ' every local asset loads', not local, local)
    # the sandbox has no internet: requests to outside hosts (fonts, CDNs) fail with a proxy error; not the mode's fault
    errs = [e for e in errs if 'favicon' not in e and not (e.startswith('Failed to load resource') and ('407' in e or 'TUNNEL' in e))]
    if netfail: print('  (offline, outside hosts failed: %d, e.g. %s)' % (len(netfail), netfail[0][:80]))
    check(mid + ' 0 console errors', not errs, errs[:5])

with sync_playwright() as p:
    b = p.chromium.launch()
    for mid in ('M0rsyuvaTrk', 'WEYUcaJTBso'):
        pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        try: run(pg, mid)
        except Exception as e: check(mid + ' run', False, repr(e)[:400])
        pg.close()
    b.close()
srv.shutdown()
print('FAILED: ' + ', '.join(fails) if fails else 'ALL PASS')
sys.exit(1 if fails else 0)
