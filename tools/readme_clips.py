#!/usr/bin/env python3
"""README clips (m3-ui): records short animated GIFs of real modes, headless at 390x844 touch, for the README
mode showcase. Plays random legal moves through tools/qa_play.js (real board taps, the bot answers) while it
screenshots the board column, then writes docs/media/<name>.gif (300 px wide, palette, looped).

  python3 tools/readme_clips.py [name=id ...]     default: the showcase list below
Needs playwright + chromium (see HANDOFF.md for the arm64 LD_LIBRARY_PATH)."""
import sys, os, io, asyncio, threading, http.server, socketserver, functools, time
from PIL import Image
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs/media')   # then caption: tools/readme_compose.py <name> ... --gif docs/media/<name>.gif
CLIPS = {'scp-4975': 'HuZlhHnES7M', 'atomic': 'wTudFnunSL0', 'duck': 'E2x-QTgBD5k', 'pac-man': 'sO-lD2On610', 'spell': 'Ag3KKsIrax4', 'dice': 'vm0JynHlzys'}
if len(sys.argv) > 1: CLIPS = dict(a.split('=', 1) for a in sys.argv[1:])
PLAY = open(os.path.join(ROOT, 'tools/qa_play.js'), encoding='utf8').read(); PLAY = PLAY[PLAY.index('async ('):]
PORT = 8871
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', PORT), functools.partial(Q, directory=ROOT))
threading.Thread(target=srv.serve_forever, daemon=True).start()

async def clip(b, name, mid, frames=44, every=0.22, plies=10, seed=7):
    ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=1, is_mobile=True, has_touch=True)
    pg = await ctx.new_page()
    await pg.goto(f'http://127.0.0.1:{PORT}/index.html#/play/{mid}')
    await pg.wait_for_function('CM.gameUI.controller && !CM.loader.isVisible()', timeout=20000)
    await pg.add_style_tag(content='#gover, #intro { display: none !important; }')   # a clip never ends on the result card
    await pg.wait_for_timeout(700)
    r = await pg.evaluate("(() => { const a = document.getElementById('board-col').getBoundingClientRect(); return [0, Math.max(0, a.top), 390, Math.min(844 - 58, a.bottom) - Math.max(0, a.top)]; })()")
    task = asyncio.ensure_future(pg.evaluate(PLAY, {'plies': plies, 'seed': seed, 'maxWait': 6000}))
    shots = []; t0 = time.time()
    while len(shots) < frames:
        if await pg.evaluate('!!(CM.gameUI.controller && CM.gameUI.controller.over)'): break
        png = await pg.screenshot(clip={'x': r[0], 'y': r[1], 'width': r[2], 'height': r[3]})
        shots.append(Image.open(io.BytesIO(png)).convert('RGB'))
        dt = every - (time.time() - t0) % every; await asyncio.sleep(max(0.02, dt))
    try: await asyncio.wait_for(task, 1)
    except Exception: pass
    await ctx.close()
    if len(shots) < frames * 0.6: return len(shots)   # game ended too soon: the caller retries with another seed
    w = 300; h = round(shots[0].height * w / shots[0].width)
    ims = [s.resize((w, h), Image.LANCZOS).quantize(colors=96, method=Image.MEDIANCUT, dither=Image.Dither.NONE) for s in shots]
    p = os.path.join(OUT, name + '.gif')
    ims[0].save(p, save_all=True, append_images=ims[1:], duration=int(every * 1000), loop=0, optimize=True, disposal=1)
    print(name, mid, len(ims), 'frames', os.path.getsize(p) // 1024, 'KB', flush=True)
    return 0

async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        for n, m in CLIPS.items():
            try:
                for sd in (7, 23):
                    left = await clip(b, n, m, seed=sd)
                    if not left: break
                    print('retry', n, 'ended after', left, 'frames', flush=True)
            except Exception as e: print('FAIL', n, m, e, flush=True)
        await b.close()
asyncio.run(main())
