#!/usr/bin/env python3
"""Piece-motion check (playwright + chromium): plays real moves and captures frame sequences mid-move to prove pieces
slide instead of teleporting: a normal move, a capture, castling, the bot's reply, a move on a zoomed big board, and a
drag-and-drop. Motion is slowed (animMs -> SLOW) so frames land mid-slide; each sequence is saved as one contact strip.
For every sequence it also measures the moving piece's on-screen centre per frame and fails if it never sits between
its origin and destination (that is, if it teleported).

  python3 tools/qa_motion.py [--out DIR] [--port 8796]"""
import os, sys, json, time, threading, http.server, socketserver, functools, argparse, tempfile
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--out', default=os.path.join(tempfile.gettempdir(), 'qa_motion'))
ap.add_argument('--port', type=int, default=8796)
ap.add_argument('--only', default='')
args = ap.parse_args()
os.makedirs(args.out, exist_ok=True)
SLOW = 1400


def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
BASE = f'http://127.0.0.1:{args.port}/index.html'
res = {'checks': {}, 'shots': {}}


def check(name, ok, info=None):
    res['checks'][name] = {'ok': bool(ok), 'info': info}
    print(('ok   ' if ok else 'FAIL ') + name + ('' if info is None else '  ' + json.dumps(info)[:260]), flush=True)


def strip(paths, name):
    ims = [Image.open(p) for p in paths]
    w, h = ims[0].size; sc = min(1.0, 300 / w); tw, th = int(w * sc), int(h * sc)
    out = Image.new('RGB', (tw * len(ims) + 6 * (len(ims) - 1), th + 18), 'white'); d = ImageDraw.Draw(out)
    for k, im in enumerate(ims):
        out.paste(im.convert('RGB').resize((tw, th)), (k * (tw + 6), 18)); d.text((k * (tw + 6) + 4, 3), 'frame %d' % k, fill='black')
    p = os.path.join(args.out, name + '.png'); out.save(p); return p


JS_HELP = '''
window.__q = {
  ctl: () => CM.gameUI.controller,
  sq: n => { const c = CM.gameUI.controller; return c.V.geo.parse(n); },
  click: n => { const i = __q.sq(n); CM.gameUI.board.sqEl(i).click(); },
  /* centre (client px) of the piece image drawn on square n, including its running transform */
  at: n => { const im = CM.gameUI.board.pieceEl(__q.sq(n)); if (!im) return null; const r = im.getBoundingClientRect(), o = __q.o(); return [r.left + r.width / 2 - o[0], r.top + r.height / 2 - o[1]]; },
  sqc: n => { const r = CM.gameUI.board.rectOf(__q.sq(n)), o = __q.o(); return [r.left + r.width / 2 - o[0], r.top + r.height / 2 - o[1]]; },
  /* board-local coordinates: the zoom camera may glide while a piece slides */
  o: () => { if (window.__abs) return [0, 0]; const r = document.getElementById('board').getBoundingClientRect(); return [r.left, r.top]; },
  abs: n => { const r = CM.gameUI.board.rectOf(__q.sq(n)); return [r.left + r.width / 2, r.top + r.height / 2]; }
};'''


def mclick(pg, n):
    c = pg.evaluate(f'__q.abs("{n}")'); pg.mouse.click(c[0], c[1])


def open_mode(pg, mid):
    pg.goto(BASE + '#/play/' + mid); pg.wait_for_function('CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=20000)
    # link opens show "Tap to start" (s6d): dismiss it like a player would, or the bot never starts its turn
    try: pg.wait_for_function("() => { const t = document.querySelector('.tapstart'); if (t) { t.click(); return true; } return !(CM.gameUI && CM.gameUI.waitingStart); }", timeout=15000)
    except Exception: pass
    pg.wait_for_timeout(900); pg.evaluate(JS_HELP)
    pg.evaluate(f'CM.settings.animMs = () => {SLOW}; 0')


def frames(pg, name, n=6, gap=None, track=None):
    gap = gap or SLOW / (n + 1) / 1000
    box = pg.evaluate('(() => { const r = document.getElementById("board-wrap").getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; })()')
    paths, pos = [], []
    for k in range(n):
        p = os.path.join(args.out, f'{name}_{k}.png')
        pg.screenshot(path=p, clip={'x': box[0], 'y': box[1], 'width': box[2], 'height': box[3]})
        if track: pos.append(pg.evaluate(f'__q.at("{track}")'))
        paths.append(p); time.sleep(gap)
    sp = strip(paths, name); res['shots'][name] = sp; return pos


def between(pos, a, b):
    """some frame shows the piece strictly between origin a and destination b"""
    import math
    d = math.dist(a, b); mids = 0
    for q in pos:
        if not q: continue
        da, db = math.dist(q, a), math.dist(q, b)
        if da > d * 0.08 and db > d * 0.08 and da + db < d * 1.25: mids += 1
    return mids


def run(width, height, tag):
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        mob = width < 600
        ctx = b.new_context(viewport={'width': width, 'height': height}, device_scale_factor=1, is_mobile=mob, has_touch=mob)
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        want = lambda k: not args.only or k in args.only

        if want('normal') or want('bot') or want('capture'):
            open_mode(pg, 'stockfish')
            pg.evaluate('CM.bot.choose = (V, st, moves) => new Promise(r => { window.__botGo = () => r(moves.find(m => V.geo.name(m.f) === "d7" && V.geo.name(m.t) === "d5") || moves[0]); }); 0')
            a, bb = pg.evaluate('__q.sqc("e2")'), pg.evaluate('__q.sqc("e4")')
            mclick(pg, "e2"); mclick(pg, "e4")
            pos = frames(pg, f'{tag}_normal_e2e4', track='e4')
            check(f'{tag}: normal move slides (e2-e4)', between(pos, a, bb) >= 2, {'mid_frames': between(pos, a, bb)})
            # bot reply d7-d5 (stubbed choice), captured as soon as it is committed; re-renders from the bot turn must not cut it
            pg.wait_for_function('!!window.__botGo', timeout=15000); pg.evaluate('window.__botGo()')
            pg.wait_for_function('CM.gameUI.controller.sans.length >= 2', timeout=15000)
            a, bb = pg.evaluate('__q.sqc("d7")'), pg.evaluate('__q.sqc("d5")')
            pos = frames(pg, f'{tag}_bot_d7d5', track='d5')
            check(f'{tag}: bot reply slides (d7-d5)', between(pos, a, bb) >= 2, {'mid_frames': between(pos, a, bb)})
            pg.wait_for_timeout(SLOW + 200)
            # capture exd5: the black pawn fades on arrival, the white pawn slides in over it
            pg.evaluate('CM.bot.choose = (V, st, moves) => Promise.resolve(moves.find(m => V.geo.name(m.f) === "g8") || moves[0]); 0')
            a, bb = pg.evaluate('__q.sqc("e4")'), pg.evaluate('__q.sqc("d5")')
            mclick(pg, "e4"); mclick(pg, "d5")
            pos = frames(pg, f'{tag}_capture_exd5', track='d5')
            ghosts = pg.evaluate('document.querySelectorAll(".board-under .pc-ghost").length')
            check(f'{tag}: capture slides + captured piece fades (exd5)', between(pos, a, bb) >= 2, {'mid_frames': between(pos, a, bb), 'ghosts_left_after': ghosts})
            pg.wait_for_timeout(SLOW + 600)

        if want('castle'):
            open_mode(pg, 'stockfish')
            pg.evaluate('''(() => { const c = CM.gameUI.controller; c.spec.setup = Object.assign({}, c.spec.setup, { fen: 'r3k2r/pppq1ppp/2n2n2/3pp3/3PP3/2N2N2/PPPQ1PPP/R3K2R' }); c.newGame(); })()''')
            pg.evaluate('CM.bot.choose = () => new Promise(() => {}); 0')
            pg.wait_for_timeout(400); pg.evaluate(f'CM.settings.animMs = () => {SLOW}; 0')
            k0, k1, r0, r1 = [pg.evaluate(f'__q.sqc("{n}")') for n in ('e1', 'g1', 'h1', 'f1')]
            mclick(pg, "e1"); mclick(pg, "g1")
            box = pg.evaluate('(() => { const r = document.getElementById("board-wrap").getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; })()')
            paths, kp, rp = [], [], []
            for k in range(6):
                pth = os.path.join(args.out, f'{tag}_castle_{k}.png'); pg.screenshot(path=pth, clip={'x': box[0], 'y': box[1], 'width': box[2], 'height': box[3]})
                kp.append(pg.evaluate('__q.at("g1")')); rp.append(pg.evaluate('__q.at("f1")')); paths.append(pth); time.sleep(SLOW / 7000)
            res['shots'][f'{tag}_castle'] = strip(paths, f'{tag}_castle')
            check(f'{tag}: castling slides king and rook', between(kp, k0, k1) >= 2 and between(rp, r0, r1) >= 2, {'king': between(kp, k0, k1), 'rook': between(rp, r0, r1)})

        if want('drag'):
            open_mode(pg, 'stockfish')
            pg.evaluate('CM.bot.choose = () => new Promise(() => {}); 0')
            a = pg.evaluate('__q.abs("g1")'); bb = pg.evaluate('__q.abs("f3")'); pg.evaluate('window.__abs = 1')
            pg.mouse.move(a[0], a[1]); pg.mouse.down(); pg.mouse.move(a[0] + 10, a[1] - 10, steps=2)
            drop = [bb[0] + 0.32 * (bb[0] - a[0]) / 2, bb[1] - 18]
            pg.mouse.move(drop[0], drop[1], steps=6); pg.mouse.up()
            pos = pg.evaluate('''new Promise(res => { const out = []; const t0 = performance.now(); const f = () => { out.push(__q.at("f3")); if (performance.now() - t0 < 260) requestAnimationFrame(f); else res(out); }; f(); })''')
            frames(pg, f'{tag}_drag_settle', n=2, gap=0.05)
            import math
            off0 = math.dist(pos[0], bb) if pos[0] else 0
            check(f'{tag}: drag-and-drop settles from the drop point', pos[0] is not None and off0 > 3 and math.dist(pos[-1], bb) < 2, {'first_offset_px': round(off0, 1), 'last_offset_px': round(math.dist(pos[-1], bb), 1) if pos[-1] else None, 'samples': len(pos)})

        if want('zoom'):
            open_mode(pg, 'Mg2Upjjo2yg')   # Jupiter 2011 Chess, 32x17: universal zoom camera on
            zoom = pg.evaluate('CM.gameUI.board.zoomOn')
            pg.evaluate('CM.bot.choose = () => new Promise(() => {}); 0')
            pg.evaluate('CM.gameUI.board.zoomBy(1.4, null, null, true)'); pg.wait_for_timeout(500)
            mv = pg.evaluate('''(() => { const c = CM.gameUI.controller, g = c.V.geo, B = CM.gameUI.board, v = document.getElementById('board-viewport').getBoundingClientRect();
              const inV = i => { const r = B.rectOf(i); return r && r.left >= v.left && r.right <= Math.min(v.right, innerWidth) && r.top >= Math.max(v.top, 0) && r.bottom <= Math.min(v.bottom, innerHeight) && !document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2).closest('.zoommap, .zoomctl'); };
              let m = c.moves.find(m => m.f >= 0 && !m.drop && g.dist(m.f, m.t) >= 2 && inV(m.f) && inV(m.t));
              if (!m) { m = c.moves.find(m => m.f >= 0 && !m.drop && g.dist(m.f, m.t) >= 2) || c.moves[0]; B.cam.user = true; B._camTo(B._centerOnDisp(B.sqToDisp(m.f), { s: B.cam.s, tx: 0, ty: 0 }), true); }
              return [g.name(m.f), g.name(m.t)]; })()''')
            a, bb = pg.evaluate(f'__q.sqc("{mv[0]}")'), pg.evaluate(f'__q.sqc("{mv[1]}")')
            mclick(pg, mv[0]); mclick(pg, mv[1])
            pos = frames(pg, f'{tag}_zoom_bigboard', track=mv[1])
            check(f'{tag}: zoomed big board move slides ({mv[0]}-{mv[1]})', zoom and between(pos, a, bb) >= 1, {'zoomOn': zoom, 'mid_frames': between(pos, a, bb)})

        check(f'{tag}: no page errors', not errs, errs[:3])
        b.close()


run(390, 844, 'phone')
run(1366, 900, 'desk')
json.dump(res, open(os.path.join(args.out, 'report.json'), 'w'), indent=1)
print(json.dumps(res['shots'], indent=1))
sys.exit(0 if all(c['ok'] for c in res['checks'].values()) else 1)
