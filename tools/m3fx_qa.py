"""m3-art VFX QA for js/fx/game-fx-families.js (vfxqa-style): open each mode at 390x844 touch, read the family entries
the timeline got, fire each one through the real trigger path (UI.vfx.trigger with a capture info built from a square
holding that piece type and a neighbouring square), check that .gfxf-* / fx nodes render, that they are all gone after
2 s (one-shot), and count console errors; then the same with prefers-reduced-motion. Saves a mid-effect shot per mode.
  python3 tools/m3fx_qa.py --ids a,b --out research/ref/m3-art/vfx [--port 8841]"""
import os, json, time, threading, http.server, socketserver, functools, argparse, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument('--ids', default=''); ap.add_argument('--out', default='/tmp/m3fx')
ap.add_argument('--port', type=int, default=8841); ap.add_argument('--shots', action='store_true')
args = ap.parse_args(); os.makedirs(args.out, exist_ok=True)
NOISE = re.compile(r'407|ERR_TUNNEL|ERR_FAILED|net::|unpkg|jsdelivr|Failed to load resource|youtube|ytimg', re.I)
FIRE = r'''async (shot) => {
  const UI = CM.gameUI, v = UI.vfx, g = UI.controller; if (!v || !g) return { err: 'no game' };
  const fam = (v.timeline || []).filter(e => e._fam || e._famx);
  const out = { fam: fam.map(e => ({ piece: e._fam, type: (e.effect || {}).type })), fired: [] };
  const st = g.state, geo = g.V.geo;
  for (const e of fam) {
    let from = -1; for (let i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === e._fam) { from = i; break; }
    if (from < 0) { out.fired.push({ piece: e._fam, skipped: 'not on board' }); continue; }
    const f = from % geo.files, r = Math.floor(from / geo.files);
    const to = geo.idx(Math.min(geo.files - 1, f + 1), Math.min(geo.ranks - 1, r + (r < 2 ? 2 : -2)));
    v.trigger('capture', { piece: e._fam, from: from, to: to, capture: true, captured: 'P', side: st.b[from].c, by: 'player' });
    await new Promise(r => setTimeout(r, shot ? 20 : 140));
    let anims = [];
    if (shot) { const T = { firebreath: 260, shockwave: 170, muzzle: 120 }[(e.effect || {}).type] || 200;
      anims = document.getAnimations(); anims.forEach(a => { try { a.pause(); a.currentTime = T; } catch (_) {} }); }
    const n = document.querySelectorAll('.gfxf-muzzle,.gfxf-tracer,.gfxf-core,.gfxf-scorch,.gfxf-flame,.gfxf-glyph,.gfxf-chomp,.gfxf-shadow,.gfx-ring,.fx-particle').length;
    if (shot) { await shot(); anims.forEach(a => { try { a.play(); } catch (_) {} }); }
    await new Promise(r => setTimeout(r, 2000));
    const left = document.querySelectorAll('[class*="gfxf-"]').length;
    out.fired.push({ piece: e._fam, type: (e.effect || {}).type, nodes: n, left: left });
  }
  return out; }'''
from playwright.sync_api import sync_playwright
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
base = f'http://127.0.0.1:{args.port}/index.html'
res = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--disable-gpu'])
    for mode in ('no-preference', 'reduce'):
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True, is_mobile=True, reduced_motion=mode)
        ctx.route(re.compile(r'https?://(?!127\.0\.0\.1).*'), lambda r: r.abort())
        for mid in [i for i in args.ids.split(',') if i]:
            pg = ctx.new_page(); errs = []
            pg.on('console', lambda m: m.type == 'error' and not NOISE.search(m.text) and errs.append(m.text[:200]))
            pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:200]))
            r = {}
            try:
                pg.goto(base + '#/play/' + mid, timeout=15000)
                pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.vfx', timeout=9000)
                pg.wait_for_timeout(900)
                done = {'n': 0}
                def shot():
                    if args.shots and mode == 'no-preference' and not done['n']:
                        done['n'] = 1; el = pg.query_selector('#board-wrap') or pg
                        el.screenshot(path=os.path.join(args.out, f'{mid}.png'))
                pg.expose_function('__shot', shot) if args.shots else None
                r = pg.evaluate('(f) => (' + FIRE + ')(f ? window.__shot : null)', bool(args.shots))
            except Exception as e: errs.append('nav: ' + str(e)[:200])
            r['errors'] = errs; res.setdefault(mid, {})[mode] = r
            print(mode[:6], mid, json.dumps({k: v for k, v in r.items() if k != 'fam'})[:300]); pg.close()
        ctx.close()
    b.close()
json.dump(res, open(os.path.join(args.out, 'vfx_results.json'), 'w'), indent=1)
bad = [m for m, v in res.items() for k, r in v.items() if r.get('errors') or any(f.get('left') for f in r.get('fired', []))]
print('modes', len(res), 'bad', sorted(set(bad)))
