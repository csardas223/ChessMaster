"""Duo path idle stillness: screenshots ~100 ms apart of the gold/green nodes and the PLAY bubble; prints max pixel diff per area. --tap also checks the node press."""
import os, sys, threading, http.server, socketserver, functools, argparse, io
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops
ap = argparse.ArgumentParser(); ap.add_argument('--port', type=int, default=8771); a = ap.parse_args()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *x): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(('127.0.0.1', a.port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch(**({'executable_path': os.environ['CM_CHROME']} if os.environ.get('CM_CHROME') else {})); pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg.goto('http://127.0.0.1:%d/index.html' % a.port)
    pg.evaluate("localStorage.setItem('cm.duo.eCzxOgc4fTY', JSON.stringify({lesson1:true}))")
    pg.goto('http://127.0.0.1:%d/index.html#/play/eCzxOgc4fTY' % a.port); pg.wait_for_selector('#duo-n2', timeout=15000); pg.wait_for_timeout(1500)
    boxes = {k: pg.locator(s).bounding_box() for k, s in (('gold', '#duo-n1'), ('green', '#duo-n2'), ('bubble', '.duo-start--side'))}
    def shot(): return Image.open(io.BytesIO(pg.screenshot())).convert('RGB')
    def crop(im, bb, pad=12): return im.crop(tuple(int(v * 2) for v in (bb['x'] - pad, bb['y'] - pad, bb['x'] + bb['width'] + pad, bb['y'] + bb['height'] + pad + 10)))
    frames = []
    for i in range(16): frames.append(shot()); pg.wait_for_timeout(100)
    for k, bb in boxes.items():
        diffs = [sum(1 for v in ImageChops.difference(crop(frames[i], bb), crop(frames[i + 1], bb)).convert('L').getdata() if v > 16) for i in range(len(frames) - 1)]
        print('%-6s changed px per 100ms frame: max %d, total %d' % (k, max(diffs), sum(diffs)))
    # press check on the green node
    bb = boxes['green']; n = pg.locator('#duo-n2')
    st = n.evaluate("e => getComputedStyle(e).boxShadow + ' | ' + getComputedStyle(e).transform")
    pg.mouse.move(bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2); pg.mouse.down(); pg.wait_for_timeout(200)
    pr = n.evaluate("e => getComputedStyle(e).boxShadow + ' | ' + getComputedStyle(e).transform"); pg.mouse.up()
    print('idle :', st); print('press:', pr)
    b.close()
srv.shutdown()
