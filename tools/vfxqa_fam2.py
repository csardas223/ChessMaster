"""s5-vfx QA for the game-fx families batch 2 (js/fx/game-fx-families.js second half): open each mode at 390x844 touch,
fire its family entries (CM.gameFxFamilyModes object triggers) through the real UI.vfx.trigger path and its upgrades
(CM.gameFxUpgrades) through UI.vfx.play with the mode's own effect signature, check effect nodes appear, that every
.gfxf-* node is gone after 2.4 s (one-shot), count console errors; then again with prefers-reduced-motion.
Saves a mid-effect board shot per mode + scenario (--shots).
  python3 tools/vfxqa_fam2.py [--ids a,b] [--out research/ref/s5-vfx] [--shots] [--port 8851]"""
import os, json, time, threading, http.server, socketserver, functools, argparse, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument('--ids', default=''); ap.add_argument('--out', default='/tmp/vfxqa_fam2')
ap.add_argument('--port', type=int, default=8851); ap.add_argument('--shots', action='store_true')
args = ap.parse_args(); os.makedirs(args.out, exist_ok=True)
NOISE = re.compile(r'407|ERR_TUNNEL|ERR_FAILED|net::|unpkg|jsdelivr|Failed to load resource|youtube|ytimg', re.I)
DEFAULT = ['sO-lD2On610', '8CtX9G07bMU', 'Ag3KKsIrax4', 'Bzbzs0K5IBs', 'E2x-QTgBD5k', 'B5LGzOEZSyo', '6YEM7m8owJ4',
           'zP9TzlgA-W0', 'rf2HSTXTehE', 'qqvbb2r2k5I', '0i5a9jD1e5Y']
# scenario name -> JS (runs in page with v = UI.vfx, g = controller, st, geo, helpers below); returns nothing
SCEN = {
 'pacbite': "const s = find(t => t === 'Pr'); v.trigger('capture', { piece: 'Bo', from: nb(s), to: s, capture: true, captured: 'Pr', side: 'w', by: 'player', move: {} });",
 'pixpop5': "const s = find(t => t === 'Pp'); v.trigger('capture', { piece: 'Bo', from: nb(s), to: s, capture: true, captured: 'Pp', side: 'w', by: 'player', move: {} });",
 'jump': "const s = mid(); v.trigger('move', { piece: 'R', from: nb(s), to: s, side: 'w', by: 'player', move: { jump: 1 } });",
 'freeze': "v.play({ type: 'flash', at: mid(), color: '#7cc0ff', opacity: 0.6, duration_ms: 500 }, {});",
 'duck': "const s = empty(); v.trigger('move', { piece: '*', from: -1, to: s, side: 'w', by: 'player', move: { drop: '*' } });",
 'dice': "v.moved = true; v.play({ type: 'overlay', at: 'board', id: 'dice', duration_ms: 1000, fade_ms: 180, html: '<div style=\"display:flex;gap:10px;padding:10px 14px\">' + ['P','N','K'].map(t => '<img alt=\"\" src=\"assets/modes/B5LGzOEZSyo/face_w' + t + '.png\" style=\"width:56px;height:56px\">').join('') + '</div>' }, {});",
 'wheel': "v.moved = true; const id = 'g4wqa'; v.play({ type: 'overlay', at: 'board', id: 'g4wheel', duration_ms: 2300, fade_ms: 220, html: '<style>@keyframes ' + id + '{from{transform:rotate(0)}to{transform:rotate(1555deg)}}#' + id + '{animation:' + id + ' 1.9s cubic-bezier(.12,.7,.18,1) forwards}</style><div style=\"display:grid;place-items:center;width:100%;height:100%\"><div style=\"position:relative;width:min(62%,230px);aspect-ratio:1\"><img id=\"' + id + '\" src=\"' + (g.spec.params.wheel_img || '') + '\" style=\"width:100%;height:100%;border-radius:50%\"><div aria-hidden=\"true\" style=\"position:absolute;left:50%;top:-8px;transform:translateX(-50%);width:0;height:0;border-left:11px solid transparent;border-right:11px solid transparent;border-top:22px solid #fff\"></div><div id=\"' + id + 'l\" style=\"position:absolute;left:50%;bottom:-34px;transform:translateX(-50%);background:#fff;color:#222;padding:7px 12px;border-radius:14px\">Knight</div></div></div>' }, {});",
 'splash': "v.moved = true; v.play({ type: 'overlay', at: mid(), image: 'assets/modes/Kzt9ItpGtYg/splash.png', fit: 'contain', duration_ms: 520 }, {});",
 'reap': "v.play({ type: 'flash', color: '#9b5cff', opacity: 0.5, at: mid(), duration_ms: 300 }, {});",
 'tilefall': "v.play({ type: 'particles', kind: 'dust', at: mid(), count: 14 }, {});",
 'cash': "const s = mid(); v.trigger('capture', { piece: 'Q', from: nb(s), to: s, capture: true, captured: 'P', side: 'w', by: 'player', move: {} });",
 'drawback': "v.moved = true; v.play({ type: 'overlay', at: 'board', duration_ms: 3400, fade_ms: 300, html: '<div class=\"g2db-dlg\"><h4>You won!</h4><div class=\"why\">You took your opponent\\'s king.</div><div class=\"was\">Your opponent\\'s drawback was <b>\"Lame Duck: test.\"</b></div><div class=\"lrow\"><span class=\"lab\" style=\"left:72%\">Opponent</span></div><div class=\"g2sl g2sl--r\"><b class=\"e\">Easy</b><b class=\"h\">Hard</b><u class=\"tb\" style=\"left:42%;border-bottom-color:white\"></u><u class=\"tt\" style=\"left:72%;border-top-color:black\"></u></div><div class=\"lrow\"><span class=\"lab\" style=\"left:42%\">You</span></div></div>' }, {});",
}
PLAN = {'sO-lD2On610': ['pacbite', 'pixpop5'], '8CtX9G07bMU': ['jump', 'freeze'], 'Ag3KKsIrax4': ['freeze'], 'hTTtJIdPVrc': ['jump', 'freeze'],
        'q_153NJxO1M': ['freeze'], 'Bzbzs0K5IBs': ['duck'], 'E2x-QTgBD5k': ['duck'], 'MQAC6oSeQzk': ['duck'], 'TX8zxTIeby4': ['duck'], 'ioUPg_z2KpA': ['duck'],
        '6YEM7m8owJ4': ['wheel'], 'nick8PeAXLA': ['wheel'], 'zP9TzlgA-W0': ['splash'], 'Kzt9ItpGtYg': ['splash'],
        'rf2HSTXTehE': ['reap'], 'JAz_qMQpI1o': ['reap'], '_RFXN1Ye3sY': ['reap'], 'qqvbb2r2k5I': ['tilefall', 'cash'], '0i5a9jD1e5Y': ['drawback']}
DICE = 'B5LGzOEZSyo CEkC0TINhm8 Cr3j7jf5xXk CuwO5ygTGCM HkeZayq10p8 Jg-oNqDOXtg KJYUsRlj_34 OcWzHqqeLNg Rtee8TRU0vg dwiAKx06Q9E eKAOw0yaqyA exMFzra96vo haNXJMir3Zk prd7LxnJtL4 vm0JynHlzys'.split()
for d in DICE: PLAN[d] = ['dice']
HELP = r'''const UI = CM.gameUI, v = UI.vfx, g = UI.controller, st = g.state, geo = g.V.geo;
  const find = f => { for (let i = 0; i < st.b.length; i++) if (st.b[i] && f(st.b[i].t)) return i; return mid(); };
  const mid = () => geo.idx(Math.floor(geo.files / 2) - 1, Math.floor(geo.ranks / 2));
  const nb = s => { const f = s % geo.files, r = Math.floor(s / geo.files); return geo.idx(f > 0 ? f - 1 : f + 1, r); };
  const empty = () => { for (let i = Math.floor(st.b.length / 2); i < st.b.length; i++) if (!st.b[i] && geo.idx(i % geo.files, Math.floor(i / geo.files)) === i) return i; return mid(); };'''
SEL = '[class*="gfxf-"],.gfx-ring,.fx-particle,.fx-overlay,.fx-sqflash'
from playwright.sync_api import sync_playwright
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
base = f'http://127.0.0.1:{args.port}/index.html'
ids = [i for i in args.ids.split(',') if i] or DEFAULT
res = {}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--disable-gpu'])
    for mode in ('no-preference', 'reduce'):
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True, is_mobile=True, reduced_motion=mode)
        ctx.route(re.compile(r'https?://(?!127\.0\.0\.1).*'), lambda r: r.abort())
        for mid in ids:
            pg = ctx.new_page(); errs = []
            pg.on('console', lambda m: m.type == 'error' and not NOISE.search(m.text) and errs.append(m.text[:200]))
            pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:200]))
            out = {}
            try:
                pg.goto(base + '#/play/' + mid, timeout=20000)
                pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.vfx && CM.gameUI.controller.state', timeout=15000)
                pg.wait_for_timeout(3000)   # past the loader + opening-image window
                pg.evaluate("document.querySelectorAll('.fx-overlay').forEach(e => e.remove())")
                for sc in PLAN.get(mid, []):
                    pg.evaluate('() => { ' + HELP + SCEN[sc] + ' }')
                    pg.wait_for_timeout(260 if sc not in ('wheel', 'drawback') else 900)
                    n = pg.evaluate(f"document.querySelectorAll('{SEL}').length")
                    if args.shots and mode == 'no-preference':
                        el = pg.query_selector('#board-wrap') or pg.query_selector('#board')
                        (el or pg).screenshot(path=os.path.join(args.out, f'{mid}_{sc}.jpg'), type='jpeg', quality=78)
                    pg.wait_for_timeout(3600 if sc in ('wheel', 'drawback') else 2400)
                    left = pg.evaluate("document.querySelectorAll('[class*=\"gfxf-\"]').length")
                    out[sc] = {'nodes': n, 'left': left}
            except Exception as e: errs.append('nav: ' + str(e)[:200])
            out['errors'] = errs; res.setdefault(mid, {})[mode] = out
            print(mode[:6], mid, json.dumps(out)[:300], flush=True); pg.close()
        ctx.close()
    b.close()
json.dump(res, open(os.path.join(args.out, 'vfxqa_fam2.json'), 'w'), indent=1)
bad = sorted(set(m for m, v in res.items() for k, r in v.items() if r.get('errors') or any(isinstance(x, dict) and (x.get('left') or not x.get('nodes')) for x in r.values())))
print('modes', len(res), 'bad', bad)
