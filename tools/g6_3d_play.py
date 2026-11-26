#!/usr/bin/env python3
"""g6-3d targeted play-test (Who Takes the Crown x2 + Beyond the Board), playwright + chromium (SwiftShader WebGL).

  python3 tools/g6_3d_play.py [--ids iqfHW2_sMmc,zDFsnRE_Gig,xlErokL2-4c] [--width 390] [--reduce]

Who Takes the Crown: on every floor the real checkmate is forced (G.over + finish(), i.e. the real onGameOver path),
then an in-page autopilot climbs with the REAL key handlers (ArrowLeft/Right, Space, X dispatched as keyboard events)
and the real physics: it plans a ledge path (0-1 search, same jump heights as js/fx/g6_3d.js), walks, jumps, steers in
the air. Floor 1 of iqfHW2_sMmc's last board is also mated with a real move (Qb8#). Checks: jump counter, floors
advance, Replay board grants another jump, stack picker (zDFsnRE_Gig: Influencer + Random seed), crown win modal.
Beyond the Board: kidnapping cutscene after a real check, then each rook level is played with the line found by
tools/btb_solve.js through real taps (onTap), checking switches (tick counter, bridge squares), the boss hexagons /
beam, wall-hint buttons, the hymn element, respawn on death, and the final win modal.
Sandbox Chromium: LD_LIBRARY_PATH=/tmp/libs/root/usr/lib/aarch64-linux-gnu:/tmp/libs/root/lib/aarch64-linux-gnu"""
import sys, os, json, asyncio, threading, http.server, socketserver, functools, argparse, subprocess
from playwright.async_api import async_playwright

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--ids', default='iqfHW2_sMmc,zDFsnRE_Gig,xlErokL2-4c')
ap.add_argument('--width', type=int, default=390)
ap.add_argument('--reduce', action='store_true')
ap.add_argument('--port', type=int, default=0)
ap.add_argument('--shots', default='/tmp/g6_3d_shots')
args = ap.parse_args()
os.makedirs(args.shots, exist_ok=True)

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.ThreadingTCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=APP))
srv.daemon_threads = True
PORT = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{PORT}/index.html'

AUTOPILOT = r"""
async ({ maxMs }) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const PHY = { speed: 3.2, grav: 24, jumpH: 1.2, superH: 6.3 };
  const key = (k, down) => document.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { key: k, bubbles: true }));
  const press = async k => { key(k, true); await sleep(30); key(k, false); };
  const S = () => CM.scene3d.current();
  const st = () => S() && S().qa ? S().qa() : null;
  const reach = (A, B, H) => { const gap = Math.max(0, B.x0 - A.x1, A.x0 - B.x1), dy = B.y - A.y, g = PHY.grav; if (dy > H) return false;
    const t = Math.sqrt(2 * H / g) + Math.sqrt(2 * Math.max(0, H - dy) / g); return gap <= PHY.speed * t * 0.8; };
  const log = [];
  const t0 = performance.now();
  while (performance.now() - t0 < maxMs) {
    const q = st(); if (!q || !q.climb) return { done: true, log, q };
    const P = q.pos; if (!P || !P.ground) { await sleep(40); continue; }
    const G = CM.gameUI.controller, levels = G.spec.params.levels, n = levels.length, from = q.climb.from, summit = from >= n - 1;
    const L = CM.g6_3d._qa.ledges(G.ctx, levels, q.k);
    let A = null; L.forEach(l => { if (Math.abs(l.y - P.y) < 1e-3 && P.x >= l.x0 - .15 && P.x <= l.x1 + .15) A = l; });
    if (!A) { await sleep(40); continue; }
    const goal = summit ? { x0: -2.0, x1: 2.0, y: q.crownY - 0.4, goal: 1 } : L.find(l => l.kind === 'seam' && Math.abs(l.y - ((from + 1) * 8.12 + 4.06)) < 1e-3);
    const nodes = L.concat(summit ? [goal] : []);
    /* Dijkstra: cost = 100 per super jump + 1 per hop (fewest supers, then fewest hops) */
    const best = new Map([[A, 0]]), prev = new Map(), done = new Set();
    for (;;) { let c = null; best.forEach((v, l) => { if (!done.has(l) && (c === null || v < best.get(c))) c = l; }); if (!c || c === goal) break; done.add(c);
      for (const l of nodes) { if (l === c || done.has(l)) continue; const cost = reach(c, l, PHY.jumpH) ? 1 : reach(c, l, PHY.superH) ? 101 : -1; if (cost < 0) continue;
        const nc = best.get(c) + cost; if (best.has(l) && best.get(l) <= nc) continue; best.set(l, nc); prev.set(l, c); } }
    if (!best.has(goal)) return { done: false, why: 'no path', log, q };
    const supers = Math.floor(best.get(goal) / 100);
    if (supers > q.jumps) return { done: false, why: 'need ' + supers + ' jumps, have ' + q.jumps, need: supers, log, q };
    let T = goal; while (prev.get(T) !== A) T = prev.get(T);
    const sup = !reach(A, T, PHY.jumpH);
    /* walk on A to the point closest to T */
    const tx = Math.max(A.x0 + .08, Math.min(A.x1 - .08, (T.x0 + T.x1) / 2));
    for (let g = 0; g < 200; g++) { const p = st().pos; if (!p || Math.abs(p.x - tx) < .06) break; const k = p.x < tx ? 'ArrowRight' : 'ArrowLeft'; key(k, true); await sleep(12); key(k, false); await sleep(4); }
    log.push((sup ? 'S ' : 'j ') + T.kind + '@' + T.y.toFixed(2) + ',' + T.x0.toFixed(1));
    await press(sup ? 'x' : ' ');
    /* steer to T's centre while airborne */
    const cx = (T.x0 + T.x1) / 2;
    for (let g = 0; g < 400; g++) {
      await sleep(10); const s2 = st(); if (!s2 || !s2.climb || !s2.pos) break; const p = s2.pos;
      if (p.ground && g > 3) break;
      const dx = cx - p.x; const k = dx > 0 ? 'ArrowRight' : 'ArrowLeft', o = dx > 0 ? 'ArrowLeft' : 'ArrowRight';
      key(o, false); if (Math.abs(dx) > .12) key(k, true); else key(k, false);
    }
    key('ArrowLeft', false); key('ArrowRight', false);
    await sleep(30); const s3 = st(); if (s3 && s3.pos) log[log.length - 1] += ' -> ' + s3.pos.y.toFixed(2) + '/' + s3.pos.x.toFixed(2);
  }
  return { done: false, why: 'timeout', log, q: st() };
}
"""

async def wait_for(page, js, ms=15000):
    for _ in range(ms // 100):
        if await page.evaluate(js): return True
        await page.wait_for_timeout(100)
    return False

async def force_mate(page):
    await page.evaluate("() => { const G = CM.gameUI.controller; G.over = { w: G.human, why: 'checkmate' }; G.finish(); }")

def check(cond, msg, res):
    res.append(('ok  ' if cond else 'FAIL') + ' ' + msg); print(res[-1], flush=True)
    return cond

async def wttc(page, mid, res):
    await page.goto(BASE + '#/play/' + mid, wait_until='load')
    await wait_for(page, "() => CM.scene3d && CM.scene3d.current() && CM.scene3d.current().qa")
    if mid == 'zDFsnRE_Gig':
        has = await page.evaluate("() => !!document.getElementById('g6-3d-stacks')")
        check(has, mid + ' stack picker shown', res)
        await page.click('#g6-3d-stacks [data-s="Influencer"]')
        await page.wait_for_timeout(600)
        await wait_for(page, "() => CM.scene3d.current() && CM.scene3d.current().qa")
        nm = await page.evaluate("() => CM.gameUI.controller.spec.params.levels[0].name")
        check(nm == 'XQC vs MoistCr1TiKaL', mid + ' Influencer stack loads its floor 1 (' + nm + ')', res)
        await page.click('#g6-3d-stacks [data-s="Random"]')
        await page.wait_for_timeout(600)
        a = await page.evaluate("() => CM.gameUI.controller.spec.params.levels.map(l => l.fen)")
        await page.click('#g6-3d-stacks [data-s="Influencer"]'); await page.wait_for_timeout(300)
        await page.click('#g6-3d-stacks [data-s="Random"]'); await page.wait_for_timeout(600)
        b = await page.evaluate("() => CM.gameUI.controller.spec.params.levels.map(l => l.fen)")
        check(a == b and len(set(a)) == len(a), mid + ' Random stack: seeded (same seed = same tower), distinct floors', res)
        await page.click('#g6-3d-stacks [data-s="Famous"]'); await page.wait_for_timeout(600)
        await wait_for(page, "() => CM.scene3d.current() && CM.scene3d.current().qa")
    n = await page.evaluate("() => CM.gameUI.controller.spec.params.levels.length")
    replay_tested = False
    for floor in range(n):
        await wait_for(page, "() => CM.scene3d.current() && CM.scene3d.current().qa && !CM.gameUI.controller.over")
        q = await page.evaluate("() => CM.scene3d.current().qa()")
        check(q['k'] == floor, f'{mid} floor {floor + 1} is live (k={q["k"]})', res)
        if floor == n - 1 and mid == 'iqfHW2_sMmc':
            await page.evaluate("() => { const G = CM.gameUI.controller; G.onTap(G.V.geo.parse('b1'), {}); G.onTap(G.V.geo.parse('b8'), {}); }")
            ok = await wait_for(page, "() => !!CM.gameUI.controller.over", 5000)
            check(ok and await page.evaluate("() => CM.gameUI.controller.over.w === 'w'"), mid + ' real move Qb8# mates the crown floor', res)
        else:
            if floor == 1:   # a real move + the bot's reply first, so there is history to undo
                await page.evaluate("() => { const G = CM.gameUI.controller, m = G.moves.find(m => !m.cap) || G.moves[0]; G.onTap(m.f, {}); G.onTap(m.t, {}); }")
                await wait_for(page, "() => { const G = CM.gameUI.controller; return G.state.turn === G.human && !G.busy; }", 15000)
            await force_mate(page)
        await page.wait_for_timeout(500)
        q = await page.evaluate("() => CM.scene3d.current().qa()")
        check(q['climb'] is not None and q['jumps'] >= 1, f'{mid} floor {floor + 1} mate -> climb, jumps={q["jumps"]}', res)
        modal = await page.evaluate("() => document.getElementById('gover').classList.contains('is-open')")
        check(not modal, mid + ' no game-over modal during the climb', res)
        hud = await page.evaluate("() => (document.getElementById('g6-3d-jumps') || {}).textContent || ''")
        check('Jumps' in hud, mid + ' jump counter HUD: ' + hud.replace('\n', ' '), res)
        pad = await page.evaluate("() => !!document.getElementById('g6-3d-pad')")
        check(pad, mid + ' on-screen climb pad shown', res)
        if not replay_tested and floor == 0:
            # Replay board: earn another jump on the cleared floor, then come back to the climb
            await page.click('#g6-3d-pad [data-k="replay"]')
            await page.wait_for_timeout(700)
            r = await page.evaluate("() => ({ k: CM.scene3d.current().qa().k, over: !!CM.gameUI.controller.over })")
            check(r['k'] == 0 and not r['over'], mid + ' Replay board replays floor 1', res)
            await force_mate(page); await page.wait_for_timeout(500)
            q = await page.evaluate("() => CM.scene3d.current().qa()")
            check(q['jumps'] == 2, f'{mid} replayed mate grants a 2nd jump (jumps={q["jumps"]})', res)
            replay_tested = True
        if floor == 1:
            # Undo the mate during the climb = replay this board; the run must stay on this floor (no skipped floor)
            j0 = q['jumps']
            await page.evaluate("() => CM.gameUI.controller.undo()")
            await page.wait_for_timeout(400)
            r = await page.evaluate("() => ({ lv: CM.gameUI.controller.hooks.runLevel(CM.gameUI.controller.ctx), over: !!CM.gameUI.controller.over, pad: !!document.getElementById('g6-3d-pad') })")
            check(r['lv'] == 1 and not r['over'] and not r['pad'], f'{mid} undo of the floor-2 mate keeps the run on floor 2, pad hidden ({r})', res)
            await force_mate(page); await page.wait_for_timeout(500)
            q = await page.evaluate("() => CM.scene3d.current().qa()")
            check(q['jumps'] == j0 + 1 and q['climb'], f'{mid} re-mate after undo: jumps {j0} -> {q["jumps"]}', res)
        r = await page.evaluate(AUTOPILOT, {'maxMs': 40000})
        if not r.get('done') and r.get('need'):
            check(True, f'{mid} floor {floor + 1}: needs more jumps ({r["why"]}) -> replaying', res)
        if floor < n - 1:
            check(r.get('done'), f'{mid} climbed to floor {floor + 2}: ' + (r.get('why') or '') + ' ' + ' | '.join(r.get('log', [])), res)
            if not r.get('done'):
                await page.screenshot(path=f'{args.shots}/{mid}_fail_{floor}.png'); return
        else:
            ok = await wait_for(page, "() => document.getElementById('gover').classList.contains('is-open')", 4000)
            t = await page.evaluate("() => document.getElementById('gotitle').textContent")
            check(r.get('done') and ok and 'Crown' in t, f'{mid} super jump to the crown wins: "{t}" ' + ' | '.join(r.get('log', [])), res)
    await page.screenshot(path=f'{args.shots}/{mid}_end.png')

BTB_LINES = None
def btb_lines():
    out = subprocess.run(['node', os.path.join(APP, 'tools/btb_solve.js')], capture_output=True, text=True)
    lines = {}
    for ln in out.stdout.splitlines():
        if 'solvable in' in ln:
            k = int(ln.split()[1]) - 1; lines[k] = ln.split(': ', 1)[1].split(': ', 1)[1].split()
    return lines

async def btb(page, res):
    mid = 'xlErokL2-4c'
    lines = btb_lines()
    await page.goto(BASE + '#/play/' + mid, wait_until='load')
    await wait_for(page, "() => CM.scene3d && CM.scene3d.current() && CM.scene3d.current().qa")
    # a real check on the opening board: Ra1-a8+? find any checking move among legal moves
    mv = await page.evaluate("""() => { const G = CM.gameUI.controller, V = G.V;
      const m = G.moves.find(m => { const n = m.n || V.make(G.state, m); const k = V.royals(n, 'b')[0]; return k != null && V.attacked(n, k, 'w'); });
      G.onTap(m.f, {}); G.onTap(m.t, {}); return V.geo.name(m.f) + '-' + V.geo.name(m.t); }""")
    await page.wait_for_timeout(400)
    cut = await page.evaluate("() => !!(CM.scene3d.current() && CM.scene3d.current().cutscene) || CM.gameUI.controller.hooks.runLevel(CM.gameUI.controller.ctx) === 1")
    check(cut, f'{mid} check {mv} starts the kidnapping cutscene (snaps under reduced motion)', res)
    ok = await wait_for(page, "() => CM.scene3d.current() && CM.scene3d.current().qa && CM.scene3d.current().qa().level === 1", 8000)
    check(ok, mid + ' kidnapping -> level 2 (Walk the plank)', res)
    levels = await page.evaluate("() => CM.gameUI.controller.spec.params.levels.length")
    died = False
    for k in range(1, levels):
        await wait_for(page, f"() => CM.scene3d.current() && CM.scene3d.current().qa && CM.scene3d.current().qa().level === {k} && !CM.gameUI.controller.over && !CM.gameUI.controller.busy", 9000)
        q = await page.evaluate("() => CM.scene3d.current().qa()")
        check(q['voids'] > 0 and q['hidden'] > 0, f'{mid} level {k + 1}: abyss squares hidden ({q["hidden"]})', res)
        if k == 2: check(q['hymn'] or q['hymnOn'], f'{mid} sinking hymn on from level 3 (playing={q["hymn"]})', res)
        if q['marks']:
            vis = await page.evaluate("() => [...document.querySelectorAll('.g6-3d-sym')].filter(e => e.style.display !== 'none').length")
            await page.evaluate("() => document.querySelector('.g6-3d-sym').click()")
            t = await page.evaluate("() => document.getElementById('status').textContent")
            hint = await page.evaluate(f"() => CM.gameUI.controller.spec.params.levels[{k}].hints[0].text")
            check(t == hint, f'{mid} level {k + 1}: wall symbol ({vis}/{q["marks"]} on screen) shows its hint "{t[:40]}"', res)
        if k == 3 and not died:
            # die once: step into the sentry line (a1-a3 is in c... find a move that gets captured)
            r = await page.evaluate("""async () => { const G = CM.gameUI.controller, V = G.V;
              const m = G.moves.find(m => { const n = m.n || V.make(G.state, m); return V.legal(n).some(x => x.cap); });
              if (!m) return 'none'; G.onTap(m.f, {}); G.onTap(m.t, {}); return V.geo.name(m.t); }""")
            ok = await wait_for(page, "() => CM.gameUI.controller.over && CM.gameUI.controller.over.w === 'b'", 6000)
            check(ok, f'{mid} level 4: stepping into a sentry line ({r}) gets you taken', res)
            ok = await wait_for(page, f"() => !CM.gameUI.controller.over && CM.scene3d.current() && CM.scene3d.current().qa && CM.scene3d.current().qa().level === {k}", 6000)
            check(ok, f'{mid} death respawns the same level', res)
            died = True
            await page.wait_for_timeout(300)
        line = lines.get(k, [])
        for i, san in enumerate(line):
            f, t = san.replace('x', '-').split('-')
            await wait_for(page, "() => { const G = CM.gameUI.controller; return !G.busy && !G.over && G.state.turn === 'w'; }", 8000)
            await page.evaluate(f"() => {{ const G = CM.gameUI.controller, g = G.V.geo; G.onTap(g.parse('{f}'), {{}}); G.onTap(g.parse('{t}'), {{}}); }}")
            await page.wait_for_timeout(250)
            q = await page.evaluate("() => { const S = CM.scene3d.current(); return S && S.qa ? S.qa() : null; }")
            if q and q['level'] == k and q['tick']:
                check(True, f'{mid} level {k + 1}: {san} -> switch tick counter {q["tick"]}', res)
            if q and k == levels - 1:
                bm = await page.evaluate("() => JSON.stringify(CM.gameUI.controller.state.x.beam)")
                check(True, f'{mid} boss after {san}: hexagons {q["hex"]}/4 up={q["up"]} beam={bm}', res)
        if k == 1 and not args.reduce:   # (reduced motion: the cutscene snaps in 350 ms, too short to undo inside reliably)
            # undo during the sinking-plank cutscene: back on level 2 (the view is rebuilt), then win it again
            await page.wait_for_timeout(100 if args.reduce else 300)   # reduced motion: the plank cutscene snaps in 350 ms
            await page.evaluate("() => CM.gameUI.controller.undo()")
            await page.wait_for_timeout(1500)
            r = await page.evaluate("() => ({ lv: CM.gameUI.controller.hooks.runLevel(CM.gameUI.controller.ctx), over: !!CM.gameUI.controller.over, cut: !!(CM.scene3d.current() && CM.scene3d.current().cutscene), q: CM.scene3d.current().qa() })")
            check(r['lv'] == 1 and not r['over'] and not r['cut'] and r['q']['level'] == 1, f'{mid} undo of the level-2 win stays on level 2 ({r})', res)
            await page.evaluate("() => { const G = CM.gameUI.controller, g = G.V.geo; G.onTap(g.parse('a5'), {}); G.onTap(g.parse('h5'), {}); }")
        if k < levels - 1:
            ok = await wait_for(page, f"() => CM.scene3d.current() && CM.scene3d.current().qa && CM.scene3d.current().qa().level === {k + 1}", 9000)
            check(ok, f'{mid} level {k + 1} solved with {" ".join(line)} -> level {k + 2}', res)
            if not ok: await page.screenshot(path=f'{args.shots}/{mid}_fail_{k}.png'); return
        else:
            ok = await wait_for(page, "() => document.getElementById('gover').classList.contains('is-open')", 5000)
            t = await page.evaluate("() => document.getElementById('gotitle').textContent")
            check(ok and 'Eldritch' in t, f'{mid} final level solved: "{t}"', res)
    await page.screenshot(path=f'{args.shots}/{mid}_end.png')

async def main():
    res = []
    async with async_playwright() as p:
        px = os.environ.get('HTTPS_PROXY') or os.environ.get('HTTP_PROXY'); kw = {}
        if px:
            from urllib.parse import urlparse
            u = urlparse(px); kw['proxy'] = {'server': f'{u.scheme}://{u.hostname}:{u.port}', 'bypass': '127.0.0.1,localhost'}
            if u.username: kw['proxy'].update(username=u.username, password=u.password or '')
        br = await p.chromium.launch(**kw, args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await br.new_context(viewport={'width': args.width, 'height': 800}, has_touch=True, reduced_motion='reduce' if args.reduce else 'no-preference')
        for mid in args.ids.split(','):
            page = await ctx.new_page()
            errs = []
            page.on('pageerror', lambda e, errs=errs: errs.append(str(e)))
            page.on('console', lambda m, errs=errs: errs.append(m.text) if m.type == 'error' else None)
            try:
                if mid == 'xlErokL2-4c': await btb(page, res)
                else: await wttc(page, mid, res)
            except Exception as e:
                check(False, f'{mid} exception {e}', res)
            check(not errs, f'{mid} console errors: {errs[:3]}', res)
            await page.close()
        await br.close()
    bad = [r for r in res if r.startswith('FAIL')]
    print(f'{len(res) - len(bad)}/{len(res)} ok')
    sys.exit(1 if bad else 0)

asyncio.run(main())
