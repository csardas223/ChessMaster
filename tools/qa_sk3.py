#!/usr/bin/env python3
"""cm_acc 2026-11-26: Shotgun King Rank 3 (NK4Upb_s8Ok) accuracy check at 390x844 touch.

  python3 tools/qa_sk3.py [--port 8913] [--shots DIR] [--max-turns 400] [--god]

Loads the mode (shared engine js/modes/g4_shotgun.js with params.cardSet 'rank3'), checks the 12-floor run, the extra
rook, the HUD (FLOOR / POWER / RANGE / F.ARC, SOUL + GRENADE buttons), then plays through real taps: greedy shots at the
White King, safe steps otherwise; at each draft it taps the card the video picked (Courteous Jousting, Bloodless Coup,
Subtle Poison, Golden Aging, Philanthropy, Ravenous Rats, Cornered Desperado, Welcome Gift, Workshop, Piercing Truth)
and checks the card text; uses a soul and a grenade once each when available. --god keeps White from capturing the
king (QA only, so a full 12-floor run reaches the boss); without it the run ends at the first capture, which is also a
result. Exit 1 on any failed check or console error."""
import os, sys, threading, http.server, socketserver, functools, argparse, json
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser(); ap.add_argument('--port', type=int, default=8913); ap.add_argument('--shots', default='')
ap.add_argument('--max-turns', type=int, default=400); ap.add_argument('--god', action='store_true')
args = ap.parse_args()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{args.port}/index.html'
MID = 'NK4Upb_s8Ok'
PICKS = ['Courteous Jousting', 'Bloodless Coup', 'Subtle Poison', 'Golden Aging', 'Philanthropy', 'Ravenous Rats', 'Cornered Desperado', 'Welcome Gift', 'Workshop', 'Piercing Truth']
H = "const c = CM.gameUI.controller, V = c.V, g = V.geo, ctx = c.ctx;"
fails = []
def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (' ' + str(info) if info and not ok else ''), flush=True)
    if not ok: fails.append(name)
def tap(pg, i):
    pg.locator('#board .sq[data-i="%d"]' % i).first.click(); pg.wait_for_timeout(70)

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
    if args.god:   # QA only: White never takes the king (lets one run reach the boss floor)
        pg.evaluate('''() => { const c = CM.gameUI.controller, base = c.hooks.botPick; c.hooks.botPick = function (ctx, ranked) {
          const ok = ranked.filter(r => !(r.m.cap && r.m.cap.c === 'b')); return ok.length ? ctx.pick(ok) : null; }; }''')
    try: pg.wait_for_selector('.tapstart', timeout=5000); pg.locator('.tapstart').first.click()
    except Exception: pass
    pg.wait_for_function('() => { const c = CM.gameUI.controller; return c.state.turn === "b" && !c.busy; }', timeout=30000); pg.wait_for_timeout(500)
    r = pg.evaluate('() => { ' + H + ''' const b = c.state.b; return { floors: ctx.params.floors, rooks: b.filter(p => p && p.c === 'w' && p.t === 'R').length,
        holes: b.filter(p => p && p.t === '#').length, panel: (document.querySelector('.g4sk-panel') || {}).innerText || '', btns: document.querySelectorAll('.g4sk-acts button').length }; }''')
    check('12-floor run', r['floors'] == 12, r)
    check('Rank 3: an extra rook on floor 1', r['rooks'] >= 1, r)
    check('floor has holes', r['holes'] >= 1, r)
    check('HUD: FLOOR / POWER / RANGE / F.ARC + SOUL / GRENADE buttons', all(k in r['panel'] for k in ('FLOOR', 'POWER', 'RANGE', 'F.ARC')) and r['btns'] == 2, r)
    if args.shots: pg.screenshot(path=os.path.join(args.shots, 'sk3_floor1.png'))
    # grenade blast check on a staged board (3x3 of 5-HP rooks round d5, 2 grenades), then a fresh page for the run
    pg.evaluate('''() => { const c = CM.gameUI.controller, V = c.V, g = V.geo, st = Object.assign({}, c.state), b = st.b.map(() => null);
      b[g.parse('e8')] = V.piece('K', 'b'); b[g.parse('e1')] = Object.assign(V.piece('K', 'w', { m: 1 }), { hp: 4 });
      ['c4','d4','e4','c5','d5','e5','c6','d6','e6'].forEach(s => { b[g.parse(s)] = Object.assign(V.piece('R', 'w', { m: 1 }), { hp: 5 }); });
      st.b = b; st.x = Object.assign({}, st.x, { nades: 2, nadeUsed: 0, nadeDmg: 3, arm: null }); c.ctx.state = st; c.ctx.refresh();
      document.querySelector('.g4sk-acts button[data-a=nade]').disabled = false; }''')
    pg.locator('.g4sk-acts button[data-a="nade"]').click(); pg.wait_for_timeout(150)
    tap(pg, pg.evaluate('() => CM.gameUI.controller.V.geo.parse("e8")')); tap(pg, pg.evaluate('() => CM.gameUI.controller.V.geo.parse("d5")')); pg.wait_for_timeout(200)
    if args.shots: pg.screenshot(path=os.path.join(args.shots, 'sk3_grenade.png'))
    r = pg.evaluate('''() => { const c = CM.gameUI.controller, g = c.V.geo, x = c.state.x; if (x.boom == null || x.boom < 0) return { boom: x.boom };
      const hit = []; c.state.b.forEach((p, i) => { if (p && p.c === 'w' && p.t === 'R' && g.dist(i, x.boom) <= 1) hit.push(p.hp); });
      return { boom: g.name(x.boom), hit, nades: x.nades, turn: c.state.turn, king: g.name(c.state.b.findIndex(p => p && p.c === 'b')) }; }''')
    check('grenade bounces and blasts the 3x3 for 3 (free action, king stays)', r.get('hit') and all(h == 2 for h in r['hit']) and r['nades'] == 1 and r['turn'] == 'b' and r['king'] == 'e8', r)
    pg.goto('about:blank'); pg.goto(BASE + '#/play/' + MID)
    pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=20000)
    pg.evaluate('() => { const c = CM.gameUI.controller; c.spec.bot = Object.assign({}, c.spec.bot, { time_ms: 60, min_ms: 0, depth: 1 }); }')
    try: pg.wait_for_selector('.tapstart', timeout=5000); pg.locator('.tapstart').first.click()
    except Exception: pass
    pg.wait_for_function('() => { const c = CM.gameUI.controller; return c.state.turn === "b" && !c.busy; }', timeout=30000); pg.wait_for_timeout(300)
    turns, drafts, used_soul, used_nade, boss_seen = 0, 0, False, False, False
    while turns < args.max_turns:
        if pg.locator('.g4sk-draft').count():
            txt = pg.locator('.g4sk-draft').inner_text(); want = PICKS[drafts] if drafts < len(PICKS) else None
            check('draft %d offers %s with its White curse' % (drafts + 1, want), want is not None and want in txt and 'White' in txt, txt[:160])
            if args.shots and drafts in (0, 4): pg.screenshot(path=os.path.join(args.shots, 'sk3_draft%d.png' % (drafts + 1)))
            btn = pg.locator('.g4sk-draft button', has_text=want) if want else pg.locator('.g4sk-draft button')
            btn.first.click(); drafts += 1; pg.wait_for_timeout(500); continue
        st = pg.evaluate('() => { const c = CM.gameUI.controller; return { over: !!c.over, turn: c.state.turn, busy: c.busy, floor: c.game ? 0 : (c._sk || {}).floor }; }')
        if st['over']: break
        if st['turn'] != 'b' or st['busy']: pg.wait_for_timeout(120); continue
        x = pg.evaluate('() => CM.gameUI.controller.state.x')
        if not used_soul and (x.get('souls') or []):
            pg.locator('.g4sk-acts button[data-a="soul"]').click(); pg.wait_for_timeout(150)
            n = pg.evaluate('() => CM.gameUI.controller.moves.filter(m => m.soul).length')
            check('SOUL button arms soul moves (%s)' % (x['souls'][0]), n > 0, n)
            if n == 0: pg.locator('.g4sk-acts button[data-a="soul"]').click(); pg.wait_for_timeout(100)
            used_soul = True
            if n == 0: continue
        elif not used_nade and (x.get('nades') or 0) > 0 and not x.get('nadeUsed'):
            pg.locator('.g4sk-acts button[data-a="nade"]').click(); pg.wait_for_timeout(150)
            used_nade = True
        mv = pg.evaluate('() => { ' + H + ''' const st = c.state, b = st.b, ms = c.moves; if (!ms.length) return null;
          let wk = -1, me = -1; b.forEach((p, i) => { if (p && p.c === 'w' && p.t === 'K') wk = i; if (p && p.c === 'b' && p.t === 'K') me = i; });
          let best = null, bs = -1e9;
          for (const m of ms) { let s = Math.random(); const n = m.n || V.make(st, m), nb = n.b;
            const wkHp = wk >= 0 && nb[wk] && nb[wk].t === 'K' ? (nb[wk].hp != null ? nb[wk].hp : 4) : 0;
            const kingHp = wk >= 0 && b[wk] ? (b[wk].hp != null ? b[wk].hp : 4) : 0;
            if (!nb.some(p => p && p.c === 'w' && p.t === 'K')) s += 1e5;
            s += 40 * (kingHp - wkHp);
            s += 5 * (b.filter(p => p && p.c === 'w').length - nb.filter(p => p && p.c === 'w').length);
            const to = m.shoot || m.nade ? m.f : m.t;
            if (V.attacked(n, to, 'w')) s -= 300;
            if (!m.shoot && !m.nade && wk >= 0) s -= 2 * g.dist(m.t, wk);
            if (m.soul) s += 3;
            if (s > bs) { bs = s; best = m; } }
          return [best.f, best.t]; }''')
        if not mv: break
        tap(pg, mv[0]); tap(pg, mv[1]); turns += 1
        if not boss_seen and pg.evaluate('() => CM.gameUI.controller.state.b.some(p => p && p.boss)'):
            boss_seen = True
            hpb = pg.evaluate('() => CM.gameUI.controller.state.b.find(p => p && p.boss).hp')
            check('floor 12 boss: the White King with 21 hearts', hpb == 21, hpb)
            if args.shots: pg.wait_for_timeout(500); pg.screenshot(path=os.path.join(args.shots, 'sk3_boss.png'))
        pg.wait_for_timeout(60)
    pg.wait_for_timeout(1500)
    r = pg.evaluate('() => { const c = CM.gameUI.controller, x = c.state.x || {}; return { over: c.over, floor: x.floor, fp: x.fp, arc: x.arc, max: x.max, nades: x.nades, souls: x.souls }; }')
    print('  result after %d player moves, %d drafts:' % (turns, drafts), json.dumps(r), flush=True)
    check('run reaches a result', bool(r['over']), r)
    if args.god: check('god run clears all 12 floors (win)', r['over'] and r['over'].get('w') == 'b' and drafts == 10 and boss_seen, (r, drafts, boss_seen))
    if args.shots: pg.screenshot(path=os.path.join(args.shots, 'sk3_over.png'))
    local = [u for u in netfail if u.startswith('http://127.0.0.1')]
    check('every local asset loads', not local, local)
    errs = [e for e in errs if 'favicon' not in e and not (e.startswith('Failed to load resource') and ('407' in e or 'TUNNEL' in e))]
    check('0 console errors', not errs, errs[:5])
    b.close()
srv.shutdown()
print('FAILED: ' + ', '.join(fails) if fails else 'ALL PASS', flush=True)
sys.exit(1 if fails else 0)
