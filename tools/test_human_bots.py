#!/usr/bin/env python3
"""pol-human: headless check of the bot engines (Maia, Stockfish 19/17.1/10) and their fallbacks.

  python3 tools/test_human_bots.py [--port 18826] [--net live|blocked|local] [--ids a,b] [--plies 4]

--net live     real CDNs (Chromium uses the HTTPS_PROXY of the environment when one is set)
--net blocked  every non-local request is aborted: Maia + Stockfish must fail over to CM.Search and the game goes on
--net local    Maia weight URLs are answered from --weights (a folder with maia-XXXX.pb.gz), everything else aborted;
               proves the in-browser Maia path when the sandbox cannot reach the CDN
Per mode it plays --plies human moves through tools/qa_play.js and logs every bot decision (engine planned, engine that
answered, move, legal?). Exit code 1 when a bot move is illegal, the bot stalls, or a page error happens.
"""
import os, sys, json, threading, http.server, socketserver, functools, argparse, asyncio, time
from urllib.parse import urlparse
APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--port', type=int, default=18826)
ap.add_argument('--net', default='live', choices=['live', 'blocked', 'local'])
ap.add_argument('--ids', default='tfPyy36nwc4,-cQ58zhZrSo,COBnLrfJVpE,stockfish')
ap.add_argument('--plies', type=int, default=4)
ap.add_argument('--weights', default='/workspace/work/maia')
ap.add_argument('--out', default='')
args = ap.parse_args()

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.ThreadingTCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=APP))
srv.daemon_threads = True; threading.Thread(target=srv.serve_forever, daemon=True).start()
LOCAL = f'http://127.0.0.1:{args.port}'
QA_PLAY = open(os.path.join(APP, 'tools/qa_play.js'), encoding='utf8').read()

HOOK = """() => {
  if (window.__botlog) return; window.__botlog = [];
  const orig = CM.bot.choose;
  CM.bot.choose = function (V, st, moves, cfg, hooks, ctx) {
    const plan = CM.bot.engineFor(V, st, cfg, hooks, ctx), t0 = performance.now();
    return orig.apply(this, arguments).then(m => {
      const g = V.geo, u = m ? g.name(m.f) + g.name(m.t) + (m.promo ? m.promo.toLowerCase() : '') : null;
      window.__botlog.push({ plan: plan.engine + (plan.version ? ' ' + plan.version : '') + (plan.elo != null ? ' @' + plan.elo : ''),
        used: CM.bot.last ? CM.bot.last.engine + (CM.bot.last.version ? ' ' + CM.bot.last.version : '') : null,
        move: u, legal: !!m && moves.indexOf(m) >= 0, ms: Math.round(performance.now() - t0), fen: V.toFEN(st),
        sf: { '19': CM.stockfish.state('19'), '17': CM.stockfish.state('17'), '10': CM.stockfish.state('10') }, id: CM.bot.last && CM.bot.last.engine === 'stockfish' ? CM.stockfish.idName(CM.bot.last.version) : null, maia: CM.maia.state() });
      return m;
    });
  };
}"""

def proxy_cfg():
    p = os.environ.get('HTTPS_PROXY') or os.environ.get('HTTP_PROXY')
    if not p: return None
    u = urlparse(p); c = {'server': f'{u.scheme}://{u.hostname}:{u.port}', 'bypass': '127.0.0.1,localhost'}
    if u.username: c['username'] = u.username; c['password'] = u.password or ''
    return c

async def main():
    from playwright.async_api import async_playwright
    res, bad = {}, False
    async with async_playwright() as p:
        kw = {}
        if args.net == 'live' and proxy_cfg(): kw['proxy'] = proxy_cfg()
        b = await p.chromium.launch(**kw)
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, ignore_https_errors=True)
        async def route(r):
            url = r.request.url
            if url.startswith(LOCAL): return await r.continue_()
            if args.net == 'live': return await r.continue_()
            if args.net == 'local' and 'maia-chess' in url and url.endswith('.pb.gz'):
                f = os.path.join(args.weights, url.rsplit('/', 1)[1])
                if os.path.exists(f):
                    return await r.fulfill(status=200, body=open(f, 'rb').read(), headers={'content-type': 'application/gzip', 'access-control-allow-origin': '*'})
            return await r.abort()
        if args.net != 'live': await ctx.route('**/*', route)
        for mid in [i for i in args.ids.split(',') if i]:
            pg = await ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:200]))
            pg.on('console', lambda m: errs.append('console.' + m.type + ': ' + m.text[:200]) if m.type in ('error', 'warning') else None)
            t0 = time.time()
            await pg.goto(f'{LOCAL}/#/play/{mid}')
            await pg.wait_for_function('window.CM && CM.app && CM.app.current && CM.app.current.V && CM.bot', timeout=30000)
            await pg.evaluate(HOOK)
            play = await pg.evaluate(QA_PLAY, {'plies': args.plies, 'seed': 7, 'maxWait': 60000})
            await pg.wait_for_timeout(500)
            log = await pg.evaluate('window.__botlog')
            G = await pg.evaluate('({turn: CM.app.current.state.turn, human: CM.app.current.human, busy: CM.app.current.busy, over: CM.app.current.over})')
            ok = len(log) > 0 and all(x['legal'] for x in log) and not any(e.startswith('pageerror') for e in errs)
            bad = bad or not ok
            res[mid] = {'ok': ok, 'secs': round(time.time() - t0, 1), 'play': {k: play.get(k) for k in ('kind', 'moves', 'notes', 'over')}, 'bot': log, 'state': G,
                        'console': [e for e in errs if 'favicon' not in e][:12]}
            print(json.dumps({mid: {'ok': ok, 'secs': res[mid]['secs'], 'bot': [(x['plan'], x['used'], x.get('id'), x['move'], x['legal'], x['ms']) for x in log],
                                    'console': res[mid]['console'][:4]}}), flush=True)
            await pg.close()
        await b.close()
    if args.out: json.dump(res, open(args.out, 'w'), indent=1)
    print('RESULT', 'PASS' if not bad else 'FAIL', args.net)
    sys.exit(1 if bad else 0)
asyncio.run(main())
