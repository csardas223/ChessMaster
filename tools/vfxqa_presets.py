"""s5-vfx browser check of the game-fx presets (CM.gameFxModes, js/fx/game-fx-modes.js) - HANDOFF #2 "second-half presets
(47 ids) were only vfxqa-tested on rebuild". For each mode at 390x844 touch: read the timeline entries the presets added,
fire each generic trigger once through UI.vfx.trigger (capture on a real enemy piece, check on a real king, promotion,
castle, win, loss, draw) and check: effect nodes appear, the square/king it aims at resolves (no effect at the top-left
corner), banner text fits the board, every node is gone after 2.6 s (one-shot), 0 console errors. Saves one mid-effect
jpg per mode + trigger (--shots) and a contact sheet.
  python3 tools/vfxqa_presets.py --half 2 [--ids a,b] [--from N --count M] [--reduce] [--shots] [--out DIR]"""
import os, json, time, threading, http.server, socketserver, functools, argparse, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument('--ids', default=''); ap.add_argument('--half', type=int, default=2)
ap.add_argument('--from', dest='frm', type=int, default=0); ap.add_argument('--count', type=int, default=999)
ap.add_argument('--out', default='/tmp/vfxqa_presets'); ap.add_argument('--port', type=int, default=8853)
ap.add_argument('--shots', action='store_true'); ap.add_argument('--reduce', action='store_true')
args = ap.parse_args(); os.makedirs(args.out, exist_ok=True)
NOISE = re.compile(r'407|ERR_TUNNEL|ERR_FAILED|net::|unpkg|jsdelivr|Failed to load resource|youtube|ytimg', re.I)
if args.ids: IDS = args.ids.split(',')
else:
    js = "global.window={CM:{}};require('./js/fx/game-fx-modes.js');const k=Object.keys(window.CM.gameFxModes).sort((a,b)=>a<b?-1:a>b?1:0);" \
         "console.log(JSON.stringify(k.filter(x=>" + ("x>='X5kLXAJeAQI'" if args.half == 2 else "x<'X5kLXAJeAQI'") + ")))"
    IDS = json.loads(subprocess.check_output(['node', '-e', js], cwd=ROOT))
IDS = IDS[args.frm:args.frm + args.count]
FIRE = r'''async ([name, shot]) => {
  const UI = CM.gameUI, v = UI.vfx, g = UI.controller, st = g.state, geo = g.V.geo, me = g.human, foe = g.botColor;
  const kind = e => { const t = e._t || {}; return t.kind === 'piece_captured' ? 'capture' : t.kind; };
  const have = (v.timeline || []).some(e => kind(e) === name); if (!have) return { skip: 1 };
  const kingOf = c => { const r = g.V.royals ? g.V.royals(st, c) : []; return r && r.length ? r[0] : -1; };
  let info = { ply: (st.ply || 0) + 1, side: me, by: 'player', move: {} };
  if (name === 'capture' || name === 'promotion' || name === 'castle') {
    let to = -1, from = -1; for (let i = 0; i < st.b.length; i++) { const p = st.b[i]; if (p && p.c === foe && !(g.V.def(p.t) || {}).royal) { to = i; break; } }
    for (let i = 0; i < st.b.length; i++) { const p = st.b[i]; if (p && p.c === me) { from = i; break; } }
    if (to < 0) to = geo.idx(3, 3);
    const victim = st.b[to];
    const cap = (v.timeline || []).find(e => e._t && e._t.kind === 'piece_captured');
    info = Object.assign(info, { from: from, to: to, toName: geo.name(to), piece: from >= 0 ? st.b[from].t : 'Q', capture: name === 'capture',
      captured: cap && cap._t.arg ? cap._t.arg : (victim ? victim.t : 'P'), capturedColor: foe });
  }
  if (name === 'check') info = Object.assign(info, { check: true, to: kingOf(st.turn) });   /* the side to move is the checked one */
  v.trigger(name, info);
  await new Promise(r => setTimeout(r, 140));
  const q = '[class*="gfx-"],[class*="gfxf-"],.fx-particle,.fx-sqflash,.fx-flash,.fx-explosion,.fx-vignette';
  const nodes = [...document.querySelectorAll(q)];
  const br = (document.getElementById('board') || document.body).getBoundingClientRect();
  const out = { nodes: nodes.length, info: { to: info.to } };
  /* aim: rings / bursts / popups centred inside the board, and on the target square when there is one */
  const aim = nodes.filter(n => /gfx-ring|gfx-popup/.test(n.className)).map(n => { const r = n.getBoundingClientRect(); return [r.left + r.width / 2 - br.left, r.top + r.height / 2 - br.top]; });
  if (aim.length) { const sqr = info.to != null && info.to >= 0 && v.view && v.view.sqEl ? v.view.sqEl(info.to) : null, s = sqr ? sqr.getBoundingClientRect() : null;
    out.aim = aim.map(([x, y]) => s ? Math.round(Math.hypot(x + br.left - (s.left + s.width / 2), y + br.top - (s.top + s.height / 2))) : -1); }
  const bt = document.querySelector('.gfx-banner__text'); if (bt) { const r = bt.getBoundingClientRect(); out.banner = { w: Math.round(r.width), board: Math.round(br.width), fits: r.width <= br.width + 2 }; }
  if (shot) await shot(name);
  await new Promise(r => setTimeout(r, 2600));
  out.left = document.querySelectorAll('[class*="gfx-"],[class*="gfxf-"],.fx-particle,.fx-sqflash').length;
  return out; }'''
from playwright.sync_api import sync_playwright
def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a, **k): pass
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('127.0.0.1', args.port), functools.partial(Q, directory=ROOT)) as s: s.serve_forever()
threading.Thread(target=serve, daemon=True).start(); time.sleep(0.4)
base = f'http://127.0.0.1:{args.port}/index.html'
resf = os.path.join(args.out, 'vfxqa_presets.json')
res = json.load(open(resf)) if os.path.exists(resf) else {}
mode = 'reduce' if args.reduce else 'no-preference'
with sync_playwright() as p:
    b = p.chromium.launch(args=['--disable-gpu'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True, is_mobile=True, reduced_motion=mode)
    ctx.route(re.compile(r'https?://(?!127\.0\.0\.1).*'), lambda r: r.abort())
    for mid in IDS:
        pg = ctx.new_page(); errs = []; out = {}
        pg.on('console', lambda m: m.type == 'error' and not NOISE.search(m.text) and errs.append(m.text[:200]))
        pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)[:200]))
        try:
            pg.goto(base + '#/play/' + mid, timeout=20000)
            pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.vfx && CM.gameUI.controller.state', timeout=15000)
            pg.wait_for_timeout(2600)
            pg.evaluate("document.querySelectorAll('.fx-overlay,.cm-modal,.g5ob-dlg').forEach(e => e.remove())")
            def shot(name):
                if args.shots and not args.reduce:
                    el = pg.query_selector('#board-wrap') or pg.query_selector('#board')
                    (el or pg).screenshot(path=os.path.join(args.out, f'{mid}_{name}.jpg'), type='jpeg', quality=72)
            if args.shots and not args.reduce: pg.expose_function('__shot', shot)
            for name in ('capture', 'check', 'promotion', 'castle', 'win', 'loss', 'draw'):
                r = pg.evaluate('(a) => (' + FIRE + ')([a[0], a[1] ? window.__shot : null])', [name, bool(args.shots and not args.reduce)])
                if not r.get('skip'): out[name] = r
        except Exception as e: errs.append('run: ' + str(e)[:200])
        out['errors'] = errs; res.setdefault(mid, {})[mode] = out
        bad = [k for k, r in out.items() if isinstance(r, dict) and (r.get('left') or not r.get('nodes') or (r.get('banner') and not r['banner']['fits']) or any(a > 30 for a in r.get('aim', []) if a >= 0))]
        print(mode[:6], mid, 'errors', len(errs), 'bad', bad, json.dumps({k: (v.get('nodes'), v.get('left'), v.get('aim'), v.get('banner')) for k, v in out.items() if isinstance(v, dict)})[:260], flush=True)
        pg.close()
    b.close()
json.dump(res, open(resf, 'w'), indent=1)
