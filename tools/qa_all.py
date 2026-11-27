#!/usr/bin/env python3
"""Full headless QA of every mode in data/modes/index.js (playwright + chromium).

  python3 tools/qa_all.py [--widths 390,360] [--ids a,b] [--group 3] [--par 3] [--budget 100]
                          [--results DIR] [--plies 4] [--redo] [--report-only]

For every mode and width it opens #/play/<id> in a fresh page, then
  * chess modes (SpecGame): plays --plies moves for the human through the real tap handlers (tools/qa_play.js),
    including drops / placement phases (Duck, Setup, Ambush, pawn placement), waiting for the bot(s) in between;
  * game frames: presses keys (run, jump, action) and checks the canvas changes; rx-HCGCNuDo (Gravity platformer)
    is checked through its qa() hook: the king runs right, jumps, falls back to the floor, Stockfish moves on its timer;
  * legacy port: plays random legal moves.
A mode FAILS on: load failure, any console error / page error, a local file answering 4xx/5xx, horizontal overflow,
a board wider than the screen, a bot that never answers (stuck), no legal move on the first turn.
Results are cached per mode+width in --results (JSON) so the run can be split over several shells (--budget seconds
per call; rerun until it says "all done"). Then write the report with --report-only (or pass --report): research/qa_full_report.md.
Sandbox Chromium: LD_LIBRARY_PATH=/tmp/libs/root/usr/lib/aarch64-linux-gnu:/tmp/libs/root/lib/aarch64-linux-gnu"""
import sys, os, json, time, threading, http.server, socketserver, functools, argparse, asyncio, re, hashlib, datetime
from urllib.parse import urlparse

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESEARCH = os.path.join(APP, 'research')
ap = argparse.ArgumentParser()
ap.add_argument('--widths', default='390,360')
ap.add_argument('--ids', default='')
ap.add_argument('--group', default='')
ap.add_argument('--par', type=int, default=3)
ap.add_argument('--budget', type=float, default=100)
ap.add_argument('--plies', type=int, default=3)
ap.add_argument('--results', default='/workspace/work/qa7/qa_results')
ap.add_argument('--shots', default='/workspace/work/qa7/qa_shots')
ap.add_argument('--redo', action='store_true')
ap.add_argument('--report-only', action='store_true', help='only (re)write research/qa_full_report.md from the cached results')
ap.add_argument('--report', action='store_true', help='write the report when every run is done')
ap.add_argument('--port', type=int, default=8771)
args = ap.parse_args()
os.makedirs(args.results, exist_ok=True); os.makedirs(args.shots, exist_ok=True)
T0 = time.time()

def mode_index():
    src = open(os.path.join(APP, 'data/modes/index.js'), encoding='utf8').read()
    j = src[src.index('modeIndex=') + len('modeIndex='):].rstrip().rstrip(';')
    return json.loads(j)

def groups():
    g = {}
    for n in range(1, 7):
        p = os.path.join(RESEARCH, f'impl_{n}.json')
        if os.path.exists(p):
            for i in json.load(open(p)): g[i if isinstance(i, str) else i.get('id')] = str(n)
    return g

IDX = mode_index(); GRP = groups()
IDS = [i for i in IDX if i != 'stockfish' and not (IDX[i] or {}).get('no_video')]
if args.ids: IDS = [i for i in args.ids.split(',') if i]
if args.group: IDS = [i for i in IDS if GRP.get(i, '0') in args.group.split(',')]
WIDTHS = [int(x) for x in args.widths.split(',')]

def rpath(mid, w): return os.path.join(args.results, f'{mid}__{w}.json')

IGNORE = ('i.ytimg.com', 'ERR_NAME_NOT_RESOLVED', 'unpkg', 'ERR_TUNNEL', 'ERR_PROXY', 'ERR_CONNECTION', 'net::ERR_ABORTED')

def classify(r):
    """failure reasons for one result"""
    f = []
    if not r.get('loaded'): f.append('load: controller never started')
    if r.get('errors'): f.append('console: ' + ' | '.join(e[:220] for e in r['errors'][:3]))
    if r.get('missing'): f.append('missing files: ' + ', '.join(r['missing'][:4]))
    if r.get('overflow'): f.append(f"horizontal overflow (scrollWidth {r['overflow']})")
    if r.get('board_overflow'): f.append(f"board wider than screen ({r['board_overflow']}px right edge)")
    p = r.get('play') or {}
    if p.get('stuck'): f.append('stuck: bot/turn never came back ' + json.dumps(p['stuck']))
    if p.get('kind') == 'spec' and not p.get('moves') and not p.get('over'): f.append('no move could be played: ' + '; '.join(p.get('notes', [])[:2]))
    if p.get('kind') == 'game' and r.get('game_check') and not r['game_check'].get('ok'): f.append('game frame: ' + r['game_check'].get('why', 'no response to input'))
    if r.get('exc'): f.append('qa exception: ' + r['exc'][:200])
    return f

def warns(r):
    w = []
    p = r.get('play') or {}
    if p.get('tapFallback'): w.append(f"tap input did not move {p['tapFallback']}x (committed directly)")
    if p.get('over') and len(p.get('moves', [])) < 2: w.append('game ended after ' + str(len(p.get('moves', []))) + ' human plies: ' + str(p['over'])[:80])
    gc = r.get('game_check') or {}
    if gc.get('static') and not (gc.get('dom') or {}).get('changedOnClick'): w.append('game canvas did not change on arrow/jump/action keys (mouse-driven game?)')
    for n in p.get('notes', []):
        if 'promo picker left open' in n: w.append(n)
    return w

# ---------------------------------------------------------------- report
def report():
    res = {}
    for fn in os.listdir(args.results):
        if fn.endswith('.json'):
            r = json.load(open(os.path.join(args.results, fn))); res[(r['id'], r['width'])] = r
    ids = [i for i in IDX if i != 'stockfish']
    names = {1: 'Horror/Powerups/Dice', 2: 'Drawback Chess + Variant Bots', 3: 'Challenges & Odds', 4: 'Other + Variants A', 5: 'Variants B', 6: 'Variants C', 0: 'not in impl_1..6 (proof/core modes)'}
    by = {}
    for i in ids: by.setdefault(int(GRP.get(i, '0')), []).append(i)
    lines = ['# Full headless QA report', '',
             f"Generated {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')} by `tools/qa_all.py` (widths {', '.join(map(str, WIDTHS))} px, {args.plies} human plies per mode via the real tap handlers, drops/placement included; game frames driven by keys).",
             'A mode fails on: no start, any console/page error, a local file 4xx, horizontal overflow, board wider than the screen, a bot that never answers, or no playable first move. Warnings do not fail a mode.', '',
             '| Group | Modes | Pass | Fail | Not run |', '|---|---|---|---|---|']
    tot = [0, 0, 0, 0]; fails = {}; warnl = {}
    for gk in sorted(by):
        p = f = nr = 0
        for i in by[gk]:
            rr = [res.get((i, w)) for w in WIDTHS]
            if any(r is None for r in rr): nr += 1; continue
            fl = []; wl = []
            for w, r in zip(WIDTHS, rr):
                fl += [f'{w}px: {x}' for x in classify(r)]; wl += [f'{w}px: {x}' for x in warns(r)]
            if fl: f += 1; fails.setdefault(gk, []).append((i, fl))
            else: p += 1
            if wl: warnl.setdefault(gk, []).append((i, wl))
        lines.append(f'| {gk} {names[gk]} | {len(by[gk])} | {p} | {f} | {nr} |')
        tot = [tot[0] + len(by[gk]), tot[1] + p, tot[2] + f, tot[3] + nr]
    lines.append(f'| **All** | {tot[0]} | {tot[1]} | {tot[2]} | {tot[3]} |'); lines.append('')
    lines.append('## Failures by group (group agents: fix these in your mode files)'); lines.append('')
    if not fails: lines.append('None.')
    for gk in sorted(fails):
        lines.append(f'### Group {gk} ({names[gk]}): {len(fails[gk])} failing'); lines.append('')
        for i, fl in fails[gk]:
            lines.append(f"- `{i}` {IDX[i].get('name') or ''}")
            seen = set()
            for x in fl:
                k = x.split(': ', 1)[1] if ': ' in x else x
                if k in seen: continue
                seen.add(k); lines.append(f'  - {x}')
        lines.append('')
    lines.append('## Warnings (not failures)'); lines.append('')
    if not warnl: lines.append('None.')
    for gk in sorted(warnl):
        lines.append(f'### Group {gk}'); lines.append('')
        for i, wl in warnl[gk]: lines.append(f"- `{i}` {IDX[i].get('name') or ''}: " + '; '.join(dict.fromkeys(wl)))
        lines.append('')
    g = res.get(('rx-HCGCNuDo', 390))
    if g:
        lines.append('## Gravity platformer (rx-HCGCNuDo) check'); lines.append('')
        lines.append('```'); lines.append(json.dumps(g.get('game_check'), indent=1)); lines.append('```'); lines.append('')
    out = os.path.join(RESEARCH, 'qa_full_report.md')
    open(out, 'w').write('\n'.join(lines) + '\n')
    print('report:', out, 'totals', tot)
    for gk in sorted(fails): print('group', gk, 'fail', [i for i, _ in fails[gk]])
    return tot

if args.report_only:
    report(); sys.exit(0)

# ---------------------------------------------------------------- server
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    socketserver.ThreadingTCPServer.daemon_threads = True
    with socketserver.ThreadingTCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=APP)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.3)
TAPSTART = "() => { const t = document.querySelector('.tapstart'); if (t) { t.click(); return 'tap'; } if (!(CM.loader && CM.loader.isVisible && CM.loader.isVisible()) && !(CM.gameUI && CM.gameUI.waitingStart)) return 'none'; return false; }"
BASE = f'http://127.0.0.1:{args.port}/index.html'
PLAY_JS = open(os.path.join(APP, 'tools/qa_play.js'), encoding='utf8').read()
PLAY_JS = PLAY_JS[PLAY_JS.index('async ('):]

GAME_JS = """async (keys) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const c = document.getElementById('game-canvas'); if (!c) return {ok: false, why: 'no canvas'};
  const sig = () => { try { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0; for (let i = 0; i < d.length; i += 97) h = (h * 31 + d[i]) | 0; return h; } catch (e) { return 'x' + e; } };
  const g = CM.gameUI.controller, a = sig(); const seen = new Set([a]);
  for (const k of keys) { g._send(k, true); await sleep(350); seen.add(sig()); g._send(k, false); await sleep(150); seen.add(sig()); }
  let colours = 0; try { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, s = new Set(); for (let i = 0; i < d.length && s.size < 50; i += 4 * 53) s.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2] + ',' + d[i + 3]); colours = s.size; } catch (e) {}
  const fr = document.getElementById('game-frame'), dom0 = fr.innerHTML;
  const btns = [...fr.querySelectorAll('button')].filter(b => b.getClientRects().length && !b.closest('#game-hud'));
  let domChanged = false;
  if (colours <= 2 && btns.length) {   /* DOM-built game (e.g. Infinite Craft chips): click two of its buttons */
    btns[0].click(); await sleep(250); const b2 = [...fr.querySelectorAll('button')].filter(b => b.getClientRects().length)[1]; if (b2) b2.click(); await sleep(400);
    domChanged = fr.innerHTML !== dom0;
  }
  const drawn = (colours > 2 && c.width > 0) || btns.length > 0;
  return {ok: drawn, why: drawn ? '' : 'canvas is blank and the frame has no UI', dom: btns.length ? {buttons: btns.length, changedOnClick: domChanged} : null, static: seen.size <= 1, frames: seen.size, colours, w: c.width, h: c.height, over: g.over ? (g.over.why || g.over.result || 'over') : null};
}"""

GRAVITY_JS = open(os.path.join(APP, 'tools/qa_gravity.js'), encoding='utf8').read()
GRAVITY_JS = GRAVITY_JS[GRAVITY_JS.index('async ('):]

def proxy_kw():
    px = os.environ.get('HTTPS_PROXY') or os.environ.get('HTTP_PROXY'); kw = {}
    if px:
        u = urlparse(px); kw['proxy'] = {'server': f'{u.scheme}://{u.hostname}:{u.port}', 'bypass': '127.0.0.1,localhost'}
        if u.username: kw['proxy'].update(username=u.username, password=u.password or '')
    return kw

async def run_one(ctx, mid, w, seed):
    r = {'id': mid, 'width': w, 'group': GRP.get(mid, '0'), 'errors': [], 'missing': [], 'ts': time.time()}
    page = await ctx.new_page()
    def on_console(msg):
        if msg.type == 'error':
            t = msg.text
            if any(x in t for x in IGNORE): return
            if 'Failed to load resource' in t: return   # reported through on_response with the url
            r['errors'].append('console.error: ' + t)
    page.on('console', on_console)
    page.on('pageerror', lambda e: r['errors'].append('pageerror: ' + str(e)))
    def on_response(resp):
        if resp.status >= 400 and resp.url.startswith(f'http://127.0.0.1:{args.port}/'):
            r['missing'].append(f"{resp.status} {resp.url.split(str(args.port) + '/', 1)[1]}")
    page.on('response', on_response)
    try:
        await page.goto(BASE + '#/play/' + mid, wait_until='load', timeout=20000)
        await page.wait_for_function('() => !!(window.CM && CM.gameUI && CM.gameUI.controller)', timeout=9000)
        r['loaded'] = True
        try: await page.wait_for_function(TAPSTART, timeout=15000)   # direct opens wait on the "Tap to start" plate (js/ui/game-ui.js)
        except Exception: pass
        await page.wait_for_timeout(500)
        r['play'] = await page.evaluate(PLAY_JS, {'plies': args.plies, 'seed': seed, 'maxWait': 12000})
        if r['play'].get('kind') == 'game':
            if mid == 'rx-HCGCNuDo': r['game_check'] = await page.evaluate(GRAVITY_JS)
            else: r['game_check'] = await page.evaluate(GAME_JS, ['right', 'left', 'up', 'jump', 'action', 'down'])
        await page.wait_for_timeout(300)
        sw = await page.evaluate('document.documentElement.scrollWidth')
        if sw > w: r['overflow'] = sw
        br = await page.evaluate("(() => { const b = document.getElementById(CM.gameUI.controller && CM.gameUI.controller.frame === 'game' ? 'game-frame' : 'board-wrap'); if (!b || b.hidden) return 0; return Math.round(b.getBoundingClientRect().right); })()")
        if br > w + 1: r['board_overflow'] = br
        r['title'] = await page.evaluate("document.getElementById('mname').textContent")
    except Exception as e:
        r['exc'] = str(e).split('\n')[0][:300]
        if 'loaded' not in r: r['loaded'] = False
    r['fail'] = classify(r)
    if r['fail']:
        try: await page.screenshot(path=os.path.join(args.shots, f'{mid}_{w}.png'))
        except Exception: pass
    await page.close()
    json.dump(r, open(rpath(mid, w), 'w'), indent=1)
    return r

async def main():
    from playwright.async_api import async_playwright
    todo = [(mid, w) for w in WIDTHS for mid in IDS if args.redo or not os.path.exists(rpath(mid, w))]
    print(f'{len(todo)} mode/width runs to do', flush=True)
    if not todo: return True
    q = asyncio.Queue()
    for x in todo: q.put_nowait(x)
    async with async_playwright() as p:
        br = await p.chromium.launch(**proxy_kw())
        async def worker(k):
            ctxs = {}
            while not q.empty() and time.time() - T0 < args.budget:
                mid, w = q.get_nowait()
                if w not in ctxs:
                    ctxs[w] = await br.new_context(viewport={'width': w, 'height': 800}, device_scale_factor=1, has_touch=True, is_mobile=False, reduced_motion='reduce' if w < 380 else 'no-preference')
                    await ctxs[w].add_init_script("try{localStorage.setItem('cm.settings', localStorage.getItem('cm.settings')||'{}')}catch(e){}")
                try: r = await asyncio.wait_for(run_one(ctxs[w], mid, w, 7 + k), timeout=35)
                except asyncio.TimeoutError:
                    r = {'id': mid, 'width': w, 'group': GRP.get(mid, '0'), 'loaded': False, 'exc': 'qa timeout (35 s)', 'errors': [], 'missing': []}
                    r['fail'] = classify(r); json.dump(r, open(rpath(mid, w), 'w'), indent=1)
                print(('FAIL ' if r['fail'] else 'ok   ') + f"{mid} {w} " + ('; '.join(r['fail'])[:300] if r['fail'] else ''), flush=True)
            for c in ctxs.values(): await c.close()
        await asyncio.gather(*[worker(k) for k in range(args.par)])
        await br.close()
    left = [(mid, w) for w in WIDTHS for mid in IDS if not os.path.exists(rpath(mid, w))]
    print(f'{len(left)} left' if left else 'all done', flush=True)
    return not left

done = asyncio.run(main())
if done and args.report: report()
elif done: print('all runs cached; write the report with --report-only')
