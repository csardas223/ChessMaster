#!/usr/bin/env python3
"""README store-page clips for the 3D / canvas modes (README rebuild, 2026-11-26). Board-mode clips are
tools/readme_clips.py; this one records the modes that random board taps can't show:
  fps     FPS Chess (PszkLYudcws) at 1280x720: a pawn takes a pawn and the first-person duel plays out
  battle  Battle Chess (IbRrzKtieqs) at 1280x720: capture-first moves until a 3D fight runs
  gunking Gun King (AWFB4EzGtDc, canvas game) at 390x844 touch: taps on the game canvas
Headless Chromium with SwiftShader WebGL (slow on a CPU box), so every clip is a time-lapse of real rendered
frames, not a screen video. Writes raw frames to /tmp/readme_media/<name>/NNN.png; tools/readme_compose.py turns
them into docs/media/<name>.gif.   python3 tools/readme_media.py fps|battle|gunking [--frames 60]"""
import os, sys, time, threading, http.server, socketserver, functools, argparse
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument('clip'); ap.add_argument('--frames', type=int, default=60); ap.add_argument('--port', type=int, default=8873)
args = ap.parse_args()
OUT = f'/tmp/readme_media/{args.clip}'; os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT): os.remove(os.path.join(OUT, f))

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a, **k): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{args.port}/index.html'
n = 0
def snap(pg):
    global n
    try: pg.screenshot(path=f'{OUT}/{n:03d}.png', timeout=90000); n += 1
    except Exception as e: print('skip', str(e)[:80], flush=True)

GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required']
def open_mode(pg, mid):
    pg.goto(BASE + '#/play/' + mid, timeout=180000, wait_until='commit')
    pg.wait_for_function('() => CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.moves && CM.gameUI.controller.moves.length > 0', timeout=120000)
    pg.add_style_tag(content='#gover, #intro { display: none !important; }')
    pg.wait_for_timeout(2500)

def fps(p):
    b = p.chromium.launch(args=GL); pg = b.new_page(viewport={'width': 960, 'height': 540})
    open_mode(pg, 'PszkLYudcws')
    pg.evaluate("() => CM.util.loadScripts(['js/modes/fps3d/models.js', 'js/modes/fps3d/duel.js']).then(() => { CM.fps3d.maxPR = 0.35; })")
    pg.evaluate("() => { const G = CM.gameUI.controller; G.ctx.set(G.V.geo.parse('d3'), G.V.piece('P', 'b')); G.moves = G.V.legal(G.state); G.render(); }")
    snap(pg)
    pg.evaluate("() => { const G = CM.gameUI.controller; G.tryMove(G.V.geo.parse('e2'), G.V.geo.parse('d3')); }")
    pg.wait_for_function('() => document.querySelector(".f3d") && CM.fps3d && CM.fps3d.dbg()', timeout=120000)
    t0 = time.time(); shots = 0
    while n < args.frames and time.time() - t0 < 600:
        d = pg.evaluate('CM.fps3d && CM.fps3d.dbg && CM.fps3d.dbg()')
        if d and d.get('phase') == 'fight':
            pg.evaluate('CM.fps3d.dbgAim()')
            if shots % 3 == 0: pg.mouse.click(480, 270)
            shots += 1
        snap(pg)
        if not d and shots: break
        if d and d.get('phase') in ('end', 'dead'):
            for _ in range(6): snap(pg); pg.wait_for_timeout(300)
            break
    b.close()

def battle(p):
    b = p.chromium.launch(args=GL); pg = b.new_page(viewport={'width': 960, 'height': 540})
    open_mode(pg, 'IbRrzKtieqs')
    pg.wait_for_function('() => CM.battle3d && CM.battle3d.current() && CM.battle3d.current().S', timeout=120000)
    pg.evaluate('() => { CM.scene3d.current().renderer.setPixelRatio(.75); }')
    pg.wait_for_timeout(1500); snap(pg)
    fought = 0
    for k in range(14):
        G = pg.evaluate('() => { const G = CM.gameUI.controller; return { over: G.over, turn: G.state.turn === G.human, busy: G.busy || CM.battle3d.current().busy }; }')
        if G['over'] or n >= args.frames: break
        if not G['turn'] or G['busy']:
            snap(pg) if fought else pg.wait_for_timeout(500); continue
        mv = pg.evaluate("""() => { const G = CM.gameUI.controller, v = G.V; const val = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
          const g = i => ((v.def(G.state.b[i].t) || {}).glyph || G.state.b[i].t);
          let ms = G.moves.filter(m => G.state.b[m.f] && G.state.b[m.f].c === G.human && (!m.promo || m.promo === 'Q'));
          const caps = ms.filter(m => m.cap); if (caps.length) { caps.sort((a, b) => val[g(b.capSq != null ? b.capSq : b.t)] - val[g(a.capSq != null ? a.capSq : a.t)]); ms = caps; }
          else { const dev = ['e2e4', 'd2d4', 'g1f3', 'b1c3', 'f1c4', 'c1f4', 'd1f3', 'f3f7']; for (const d of dev) { const m = ms.find(m => v.geo.name(m.f) + v.geo.name(m.t) === d); if (m) { ms = [m]; break; } } }
          const m = ms[0]; return m ? [v.geo.name(m.f), v.geo.name(m.t), !!m.cap] : null; }""")
        if not mv: break
        pg.evaluate(f"() => {{ const G = CM.gameUI.controller; G.sel = -1; G.tryMove(G.V.geo.parse('{mv[0]}'), G.V.geo.parse('{mv[1]}')); }}")
        if mv[2]:
            fought += 1; t0 = time.time()
            while time.time() - t0 < 240 and n < args.frames:
                snap(pg)
                if not pg.evaluate('CM.battle3d.current().busy'): break
            if fought >= 2: break
        else:
            pg.wait_for_timeout(300)
            if fought: snap(pg)
    for _ in range(3): snap(pg)
    b.close()

def gunking(p):
    b = p.chromium.launch(args=GL)
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1, is_mobile=True, has_touch=True); pg = ctx.new_page()
    pg.goto(BASE + '#/play/AWFB4EzGtDc', timeout=180000, wait_until='commit'); pg.wait_for_function('() => window.CM && CM.gameUI', timeout=180000); pg.wait_for_timeout(9000)
    pg.add_style_tag(content='#gover, #intro { display: none !important; }')
    # walk down through the icy EXIT (keyboard map in js/game/game-frame.js), then fight the waves: Space fires
    # (auto-aims at the nearest enemy), the arrows strafe
    pg.keyboard.down('ArrowDown')
    for k in range(10): snap(pg)
    pg.keyboard.up('ArrowDown'); pg.keyboard.down('Space')
    dirs = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown']
    for k in range(args.frames - 10):
        if k % 5 == 0:
            if k: pg.keyboard.up(dirs[(k // 5 - 1) % 4])
            pg.keyboard.down(dirs[(k // 5) % 4])
        snap(pg)
    b.close()

with sync_playwright() as p: {'fps': fps, 'battle': battle, 'gunking': gunking}[args.clip](p)
print(args.clip, n, 'frames ->', OUT, flush=True)
