"""Midas Touch (LiXg0nHrjxg) gilding QA at 390x844: sets a position where every black piece type (P N B R Q) is attacked,
screenshots the board before gilding, gilds each one through the mode's own doubleTap hook, screenshots after, and checks
that every gilded piece image has the same box (position + size) and the same alpha silhouette as the normal piece of
that type in the active set. Usage: python3 tools/qa_midas.py [--out DIR] [--port 8797] [--set staunty]"""
import os, sys, json, time, threading, http.server, socketserver, functools, argparse, tempfile
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--out', default=os.path.join(tempfile.gettempdir(), 'qa_midas'))
ap.add_argument('--port', type=int, default=8797)
ap.add_argument('--set', default='')
args = ap.parse_args()
os.makedirs(args.out, exist_ok=True)


def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
BASE = f'http://127.0.0.1:{args.port}/index.html'
FEN = '4k3/8/8/2nrb3/2qQp3/8/8/4K3'
SQS = ['c5', 'd5', 'e5', 'c4', 'e4']   # n r b q p, all attacked by the white queen on d4

BOXES = '''(sqs) => sqs.map(n => { const c = CM.gameUI.controller, i = c.V.geo.parse(n), im = CM.gameUI.board.pieceEl(i), s = CM.gameUI.board.sqEl(i);
  if (!im) return { n, none: true };
  const r = im.getBoundingClientRect(), q = s.getBoundingClientRect(), cs = getComputedStyle(im);
  return { n, src: im.getAttribute('src'), cls: im.className, x: r.left - q.left, y: r.top - q.top, w: r.width, h: r.height, sq: q.width, filter: cs.filter, transform: cs.transform }; })'''

fails = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE + '#/play/LiXg0nHrjxg'); pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller', timeout=20000)
    pg.wait_for_timeout(1500)
    if args.set: pg.evaluate(f"CM.settings.set ? CM.settings.set('pieces', '{args.set}') : 0")
    pg.evaluate('CM.bot.choose = () => new Promise(() => {}); 0')
    pg.evaluate(f"(() => {{ const c = CM.gameUI.controller; c.spec.setup = Object.assign({{}}, c.spec.setup, {{ fen: '{FEN}' }}); c.newGame(); }})()")
    pg.wait_for_timeout(2600)
    before = pg.evaluate(BOXES, SQS)
    board = pg.locator('#board')
    board.screenshot(path=os.path.join(args.out, 'before.png'))
    for n in SQS:
        ok = pg.evaluate(f"(() => {{ const c = CM.gameUI.controller, i = c.V.geo.parse('{n}'); return c.hooks.doubleTap(c.ctx, i); }})()")
        if not ok: fails.append(f'gild {n} refused')
        pg.wait_for_timeout(250)
    pg.wait_for_timeout(1400)
    after = pg.evaluate(BOXES, SQS)
    board.screenshot(path=os.path.join(args.out, 'after.png'))
    # alpha silhouette (<=6%: cburnett's own bQ/wQ differ ~5%): normal black piece vs gilded image source, same type, rendered at the same size
    sil = pg.evaluate('''async (pairs) => { const out = [];
      const load = u => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = u; });
      for (const [a, b] of pairs) { const A = await load(a), B = await load(b); if (!A || !B) { out.push(-1); continue; }
        const cv = n => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.drawImage(n, 0, 0, 128, 128); return x.getImageData(0, 0, 128, 128).data; };
        const da = cv(A), db = cv(B); let diff = 0, tot = 0; for (let k = 3; k < da.length; k += 4) { const ia = da[k] > 128, ib = db[k] > 128; if (ia || ib) tot++; if (ia !== ib) diff++; }
        out.push(diff / Math.max(1, tot)); } return out; }''', [[bf['src'], af['src']] for bf, af in zip(before, after)])
    for bf, af, s in zip(before, after, sil):
        same_box = all(abs(bf[k] - af[k]) < 0.6 for k in ('x', 'y', 'w', 'h'))
        if not same_box: fails.append(f"{bf['n']}: box changed {[round(bf[k], 1) for k in ('x','y','w','h')]} -> {[round(af[k], 1) for k in ('x','y','w','h')]}")
        if s < 0 or s > 0.06: fails.append(f"{bf['n']}: silhouette differs ({s:.3f}) {bf['src']} vs {af['src']}")
        if 'g1-gold' not in af['cls']: fails.append(f"{af['n']}: no g1-gold class ({af['cls']})")
    names = [a['src'].split('/')[-1] for a in after]
    if len(set(a['filter'] for a in after)) != 1: fails.append('gold treatment differs between pieces: ' + json.dumps([a['filter'] for a in after]))
    json.dump({'before': before, 'after': after, 'silhouette_diff': sil, 'errors': errs, 'fails': fails}, open(os.path.join(args.out, 'result.json'), 'w'), indent=1)
    if errs: fails.append('page errors: ' + '; '.join(errs[:3]))
    b.close()
print('\n'.join(fails) if fails else 'ok   midas gild: same box + silhouette for P N B R Q, one gold treatment, 0 page errors')
print('shots:', os.path.join(args.out, 'before.png'), os.path.join(args.out, 'after.png'))
sys.exit(1 if fails else 0)
