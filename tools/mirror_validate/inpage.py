"""In-game evaluator scores: for every ply in positions.json, CM.mirrorReview.evalFen (Fairy-Stockfish WASM in headless
Chromium, the exact function the game uses) at --depth (or --movetime). Resumable: run again until it prints 'done'.
  python3 inpage.py [--depth 14 | --movetime 400] [--budget 100]"""
import json, os, time, threading, http.server, socketserver, functools, argparse
from playwright.sync_api import sync_playwright
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(D))
ap = argparse.ArgumentParser(); ap.add_argument('--depth', type=int, default=14); ap.add_argument('--movetime', type=int, default=0)
ap.add_argument('--budget', type=float, default=100); ap.add_argument('--port', type=int, default=8873)
ap.add_argument('--sf-dir', default='', help='local copy of the stockfish@18.0.8 npm package bin/ (npm pack stockfish@18.0.8); served for the unpkg URL. Without it the CDN is used, or Fairy-Stockfish when that fails')
a = ap.parse_args()
tag = ('sf18_' if a.sf_dir else '') + (f'mt{a.movetime}' if a.movetime else f'd{a.depth}'); out = os.path.join(D, f'fairy_{tag}.json')
P = json.load(open(os.path.join(D, 'positions.json'))); R = json.load(open(out)) if os.path.exists(out) else {}
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', a.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.3)
t0 = time.time()
with sync_playwright() as p:
    b = p.chromium.launch(args=['--disable-gpu']); pg = b.new_page()
    def route(r):
        u = r.request.url
        if u.startswith(f'http://127.0.0.1:{a.port}'): return r.continue_()
        if a.sf_dir and 'unpkg.com/stockfish@18' in u:
            f = os.path.join(a.sf_dir, u.split('/')[-1].split('?')[0])
            return r.fulfill(path=f, headers={'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/wasm' if f.endswith('.wasm') else 'text/javascript'})
        return r.abort()
    pg.route('**/*', route)
    pg.goto(f'http://127.0.0.1:{a.port}/index.html#/play/eCC-U9w9RvQ'); pg.wait_for_function('window.CM && CM.mirrorReview && CM.fairy', timeout=30000)
    for q in P:
        k = f"{q['game']}#{q['ply']}"
        if k in R: continue
        if time.time() - t0 > a.budget: break
        o = {'movetime': a.movetime} if a.movetime else {'depth': a.depth}
        R[k] = pg.evaluate('([f, u, o]) => CM.mirrorReview.evalFen(f, u, o).then(r => r && Object.assign(r, { engine: CM.mirrorReview.engine }))', [q['fen'], q['uci'], o])
        json.dump(R, open(out, 'w'))
    b.close()
print(tag, len(R), '/', len(P), 'done' if len(R) == len(P) else 'partial')
