"""m-art piece sweep (owner 2026-11-26 12:58 PM: "pieces still clipped, blurry, or not fully visible").
Pass 1 (browser, 390x844 touch, DPR 2): open every mode, list every piece image drawn on the board (#board .pc, plus
overlay <img>s inside squares) and the player-bar avatars, with natural size, drawn box, square box and board box.
Pass 2 (--analyse): per unique raster file: alpha touching the PNG border (clipped cut), < 256 px source, upscaled/soft
(little detail lost by a 2x down/up round trip), content fill; per drawn piece: box outside its square or cut by the board.
  python3 tools/art_sweep.py --ids a,b,c --out DIR        (pass 1, appends DIR/sweep.jsonl)
  python3 tools/art_sweep.py --analyse --out DIR          (pass 2, writes DIR/flags.json + DIR/flags.md)"""
import os, sys, json, time, threading, http.server, socketserver, functools, argparse, tempfile, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--ids', default='')
ap.add_argument('--out', default=os.path.join(tempfile.gettempdir(), 'art_sweep'))
ap.add_argument('--port', type=int, default=8801)
ap.add_argument('--analyse', action='store_true')
ap.add_argument('--wait', type=int, default=1700)
args = ap.parse_args()
os.makedirs(args.out, exist_ok=True)

GRAB = r'''() => {
  const out = { pieces: [], avatars: [] };
  const board = document.getElementById('board'); if (!board) return out;
  const br = board.getBoundingClientRect();
  let clip = br; for (let e = board.parentElement; e && e !== document.body; e = e.parentElement) { const cs = getComputedStyle(e);
    if (cs.overflow !== 'visible' || cs.overflowX !== 'visible') { const r = e.getBoundingClientRect(); clip = { left: Math.max(clip.left, r.left), top: Math.max(clip.top, r.top), right: Math.min(clip.right, r.right), bottom: Math.min(clip.bottom, r.bottom) }; } }
  const vw = innerWidth, vh = innerHeight;
  board.querySelectorAll('img').forEach(im => {
    const r = im.getBoundingClientRect(); if (!r.width || getComputedStyle(im).visibility === 'hidden' || getComputedStyle(im).opacity === '0') return;
    let sq = im.closest('[data-i], .sq'); const q = sq ? sq.getBoundingClientRect() : null;
    out.pieces.push({ src: im.getAttribute('src'), cls: im.className, pc: im.classList.contains('pc'), nw: im.naturalWidth, nh: im.naturalHeight,
      r: [r.left, r.top, r.width, r.height], sq: q ? [q.left, q.top, q.width, q.height] : null,
      clip: [clip.left, clip.top, clip.right, clip.bottom], vw, vh, fit: getComputedStyle(im).objectFit, tf: getComputedStyle(im).transform });
  });
  document.querySelectorAll('.pbar img, .player img, [class*=avatar] img, img[class*=avatar]').forEach(im => {
    const r = im.getBoundingClientRect(); if (!r.width) return;
    out.avatars.push({ src: im.getAttribute('src'), nw: im.naturalWidth, nh: im.naturalHeight, r: [r.left, r.top, r.width, r.height] });
  });
  return out; }'''


def pass1():
    from playwright.sync_api import sync_playwright
    def serve():
        class Q(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *a, **k): pass
        socketserver.TCPServer.allow_reuse_address = True
        with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
    threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
    base = f'http://127.0.0.1:{args.port}/index.html'
    ids = [i for i in args.ids.split(',') if i]
    f = open(os.path.join(args.out, 'sweep.jsonl'), 'a')
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--disable-gpu'])
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
        ctx.route(re.compile(r'https?://(?!127\.0\.0\.1).*'), lambda r: r.abort())
        for mid in ids:
            pg = ctx.new_page(); rec = {'id': mid}
            try:
                pg.goto(base + '#/play/' + mid, timeout=15000)
                try: pg.wait_for_function('window.CM && CM.gameUI && document.querySelector("#board")', timeout=9000)
                except Exception: rec['noboard'] = True
                pg.wait_for_timeout(args.wait)
                rec.update(pg.evaluate(GRAB))
            except Exception as e: rec['err'] = str(e)[:200]
            f.write(json.dumps(rec) + '\n'); f.flush(); pg.close()
        b.close()


def analyse():
    import numpy as np
    from PIL import Image
    recs = {}
    for ln in open(os.path.join(args.out, 'sweep.jsonl')):
        r = json.loads(ln); recs[r['id']] = r
    files = {}; drawn = []
    for mid, r in recs.items():
        for pc in r.get('pieces', []):
            s = (pc['src'] or '').split('?')[0]
            if not s or s.startswith('data:'): continue
            files.setdefault(s, set()).add(mid)
            # drawn box vs its square / the visible board clip
            x, y, w, h = pc['r']; cl = pc['clip']
            cut = x < cl[0] - 1.5 or y < cl[1] - 1.5 or x + w > cl[2] + 1.5 or y + h > cl[3] + 1.5
            out = False
            if pc['sq'] and pc['pc']:
                qx, qy, qw, qh = pc['sq']; out = x < qx - 1.5 or y < qy - 1.5 or x + w > qx + qw + 1.5 or y + h > qy + qh + 1.5
            if cut or out: drawn.append({'id': mid, 'src': s, 'cut_by_board': cut, 'outside_square': out, 'r': [round(v) for v in pc['r']], 'sq': [round(v) for v in (pc['sq'] or [])]})
    flags = {}
    for s, mids in sorted(files.items()):
        p = os.path.join(ROOT, s)
        if not os.path.exists(p): flags[s] = {'missing': True, 'modes': sorted(mids)}; continue
        if s.endswith('.svg'): continue
        try: im = Image.open(p)
        except Exception: continue
        W, H = im.size; im = im.convert('RGBA'); a = np.asarray(im).astype(float)
        al = a[..., 3]; f = {}
        if max(W, H) < 256: f['lowres'] = f'{W}x{H}'
        if al.min() > 250: f['opaque'] = True   # a square photo/tile, not a cut-out piece
        else:
            edge = np.concatenate([al[0], al[-1], al[:, 0], al[:, -1]])
            if (edge > 60).mean() > 0.01: f['alpha_at_border'] = round(float((edge > 60).mean()), 3)
            ys, xs = np.nonzero(al > 20)
            if len(xs):
                fill = max(xs.max() - xs.min() + 1, ys.max() - ys.min() + 1) / max(W, H)
                if fill < 0.6: f['small_in_canvas'] = round(float(fill), 2)
        # softness: detail lost by a 2x down + up round trip (premultiplied grey), relative to a crisp reference
        g = (a[..., :3].mean(-1) * al / 255)
        gi = Image.fromarray(g.astype(np.uint8))
        rt = np.asarray(gi.resize((max(1, W // 2), max(1, H // 2)), Image.BILINEAR).resize((W, H), Image.BICUBIC)).astype(float)
        mask = al > 20
        if mask.sum() > 50:
            loss = float(np.abs(g - rt)[mask].mean())
            gy, gx = np.gradient(g); edge = float(np.hypot(gx, gy)[mask].mean())
            f['loss'] = round(loss, 2); f['grad'] = round(edge, 2)
            if loss < 1.2 and max(W, H) >= 64: f['soft'] = True
        f['size'] = f'{W}x{H}'
        if any(k in f for k in ('lowres', 'alpha_at_border', 'soft', 'small_in_canvas', 'missing')):
            f['modes'] = sorted(mids); flags[s] = f
    json.dump({'files': flags, 'drawn': drawn, 'n_modes': len(recs), 'n_files': len(files),
               'noboard': [m for m, r in recs.items() if r.get('noboard') or r.get('err')]}, open(os.path.join(args.out, 'flags.json'), 'w'), indent=1)
    print('modes', len(recs), 'files', len(files), 'flagged files', len(flags), 'drawn-out', len(drawn))


if args.analyse: analyse()
else: pass1()
