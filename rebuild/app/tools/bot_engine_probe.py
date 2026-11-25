#!/usr/bin/env python3
"""pol-human: list which chess modes the bot layer can hand to a real engine (Maia / Stockfish) and which engine
CM.bot.engineFor picks for each (opponent name + rating, standard-rules check at the start position).

  python3 tools/bot_engine_probe.py [--port 8822] [--ids a,b] [--out /tmp/bot_engines_probe.json]
"""
import os, sys, json, threading, http.server, socketserver, functools, argparse, asyncio
APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument('--port', type=int, default=8822); ap.add_argument('--ids', default='')
ap.add_argument('--out', default='/tmp/bot_engines_probe.json'); ap.add_argument('--budget', type=float, default=100)
args = ap.parse_args()
import time; T0 = time.time()

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.ThreadingTCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=APP))
srv.daemon_threads = True; threading.Thread(target=srv.serve_forever, daemon=True).start()

src = open(os.path.join(APP, 'data/modes/index.js'), encoding='utf8').read()
IDX = json.loads(src[src.index('modeIndex=') + len('modeIndex='):].rstrip().rstrip(';'))
IDS = [i for i in IDX if (IDX[i] or {}).get('frame', 'chess') == 'chess']
if args.ids: IDS = args.ids.split(',')

async def main():
    from playwright.async_api import async_playwright
    out = json.load(open(args.out)) if os.path.exists(args.out) else {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1200, 'height': 900})
        await ctx.route('**/*', lambda r: r.abort() if not r.request.url.startswith(f'http://127.0.0.1:{args.port}') else r.continue_())
        pg = await ctx.new_page()
        for i, mid in enumerate(IDS):
            if mid in out and 'error' not in out[mid]: continue
            if time.time() - T0 > args.budget: print('budget reached; rerun to continue'); break
            try:
                await pg.goto(f'http://127.0.0.1:{args.port}/#/play/{mid}')
                await pg.wait_for_function('window.CM && CM.app && CM.app.current && CM.app.current.V', timeout=15000)
                await pg.wait_for_timeout(150)
                r = await pg.evaluate("""() => { const G = CM.app.current; const V = G.V;
                  const cfg = Object.assign({}, G.spec.bot, G.opponent.elo != null ? { elo: G.opponent.elo } : {});
                  return { name: G.opponent.name, rating: G.opponent.rating, elo: cfg.elo, engine: cfg.engine || 'auto', style: cfg.style || 'elo',
                    compat: CM.bot.stockfishCompatible(V), pick: CM.bot.engineFor ? CM.bot.engineFor(V, G.state, cfg, G.hooks, G.ctx) : null,
                    human: G.human, botColor: G.botColor }; }""")
            except Exception as e:
                r = {'error': str(e)[:200]}
            out[mid] = r; json.dump(out, open(args.out, "w"))
            if i % 25 == 0: print(i, mid, r, flush=True)
        await b.close()
    json.dump(out, open(args.out, 'w'), indent=1)
    print('done', sum(1 for i in IDS if i in out), '/', len(IDS))
    picks = {}
    for k, v in out.items():
        picks.setdefault(json.dumps(v.get('pick')) if v.get('compat') else 'not-standard', []).append(k)
    for k, v in picks.items(): print(k, len(v))
asyncio.run(main())
