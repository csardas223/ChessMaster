"""README still of Gun King mid-run (owner rule: no GIFs, a still is fine).

  python3 tools/readme_gunking.py --capture   # headless Chromium: open Gun King, walk through the bottom EXIT (icy biome),
                                              # let the waves come in, shoot the board area to /tmp/readme_store_raw/gun-king.png
  python3 tools/readme_gunking.py             # compose docs/media/shots/gun-king.jpg in the same felt frame as the other shots
Uses tools/readme_store.py helpers. Port 8902 (PORT env to change).
"""
import io, os, sys, threading, http.server, socketserver, functools
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import readme_store as rs
from PIL import Image, ImageDraw, ImageStat

MID, SLUG, CAP = 'AWFB4EzGtDc', 'gun-king', 'Gun King: a king with a gun vs the waves'
PORT = int(os.environ.get('PORT', '8902'))

def capture():
    from playwright.sync_api import sync_playwright
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', PORT), functools.partial(Q, directory=rs.ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=2).new_page()
        pg.goto(f'http://127.0.0.1:{PORT}/index.html'); pg.wait_for_timeout(1500); pg.mouse.click(5, 5)
        best = None
        for attempt in range(3):
            pg.evaluate(f"CM.app.openVideo('{MID}')"); pg.wait_for_timeout(5000)
            for _ in range(3):   # dismiss the mode intro card / "tap to start" overlay if they show
                pg.evaluate("(()=>{try{CM.gameUI.hideIntro()}catch(e){}})()")
                t = pg.locator('.tapstart')
                if t.count() and t.first.is_visible(): t.first.click()
                pg.wait_for_timeout(500)
            pg.mouse.click(640, 400); pg.wait_for_timeout(200)
            pg.keyboard.down('ArrowDown'); pg.wait_for_timeout(1600); pg.keyboard.up('ArrowDown')   # bottom EXIT = icy biome
            clip = None; good = []
            for k in range(int(os.environ.get('GK_STEPS', '30'))):   # strafe ~35 s so the waves fill the arena
                key = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'][k % 4]
                pg.keyboard.down(key); pg.wait_for_timeout(450); pg.keyboard.up(key); pg.wait_for_timeout(500)
                if clip is None:
                    r = pg.evaluate("(()=>{var a=document.getElementById('board-area')||document.getElementById('board-wrap');var e=a.getBoundingClientRect();return [e.x,e.y,e.width,e.height]})()")
                    clip = {'x': max(0, r[0] - 8), 'y': max(0, r[1] - 8), 'width': r[2] + 16, 'height': r[3] + 16}
                im = Image.open(io.BytesIO(pg.screenshot(clip=clip))).convert('RGB')
                st = ImageStat.Stat(im.resize((64, 64))).mean   # icy run frame: bright blue; level-up card: dimmed; start room / end screen: grey
                if st[2] < 150 or st[2] - st[0] < 60:
                    if good: pg.keyboard.press('Enter'); pg.wait_for_timeout(300)   # take the level-up pick and keep going
                    if pg.evaluate("(()=>{try{var G=CM.gameUI.controller;return !!(G&&G.over)}catch(e){return false}})()"): break
                    continue
                good.append(im)
            if good:
                best = len(good)   # keep the busiest run frame: most dark enemy-sprite pixels on the bright ice
                busy = lambda im: sum(1 for v in im.convert('L').resize((200, 200)).getdata() if v < 70)
                max(good, key=busy).save(f'{rs.RAW}/{SLUG}.png'); break
        b.close(); srv.shutdown()
        print('captured, good frames', best)

def compose():
    raw = Image.open(f'{rs.RAW}/{SLUG}.png').convert('RGB'); W, H = 900, 760
    bg = rs.felt(W, H, seed=hash(SLUG) % 97).convert('RGBA'); d = ImageDraw.Draw(bg)
    ch = 620; cw = min(int(ch * raw.width / raw.height) + 20, W - 60)
    rs.drop(bg, rs.card(raw, cw, ch, rim=4, r=14), (W - cw) // 2, 26, sh=8)
    rs.shadow_text(d, (W // 2, H - 44), CAP, rs.px(34), sh=4)
    bg.convert('RGB').save(f'{rs.OUT}/shots/{SLUG}.jpg', quality=90)
    print('wrote docs/media/shots/gun-king.jpg')

if __name__ == '__main__':
    if '--capture' in sys.argv: capture()
    compose()
