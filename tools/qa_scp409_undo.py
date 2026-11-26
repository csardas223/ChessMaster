#!/usr/bin/env python3
"""s5-ui: SCP-409 (ndbf05-bvgQ) aura vs state after undo / flip, 390x844 touch.

  python3 tools/qa_scp409_undo.py [--rounds 24] [--seed 1]

Plays random legal moves against the bot; every few plies it undoes (sometimes twice) or flips the board, then checks
that the cyan aura tiles (#board-abl .fx-abl-aura of the live aura) sit exactly on the crystal's 8 neighbours when the
state says it is charged (x.freezeNext) and that no aura is shown when it is not. Exit 1 on any mismatch."""
import os, sys, json, random, threading, http.server, socketserver, functools, argparse
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser(); ap.add_argument('--rounds', type=int, default=24); ap.add_argument('--seed', type=int, default=1)
args = ap.parse_args(); random.seed(args.seed)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{srv.server_address[1]}/index.html'

CHECK = r"""() => {
  const c = CM.gameUI.controller, st = c.state, V = c.V;
  let s = -1; st.b.forEach((p, i) => { if (p && p.t === 'Cry') s = i; });
  const charged = !!(st.x && st.x.freezeNext) && s >= 0;
  const sqRect = i => { const el = document.querySelector('#board [data-sq="' + V.geo.name(i) + '"]') || document.querySelector('#board .sq[data-i="' + i + '"]'); return el ? el.getBoundingClientRect() : null; };
  const want = [];
  if (charged) for (let i = 0; i < st.b.length; i++) if (V.geo.valid[i] && i !== s && V.geo.dist(i, s) === 1) want.push(i);
  /* live aura tiles: ignore boxes fading out (opacity animation to 0 running) */
  const boxes = [...document.querySelectorAll('.fx-abl-zone')].filter(b => b.querySelector('.fx-abl-aura'));   /* faded boxes are removed 300 ms after clearFx */
  const tiles = boxes.flatMap(b => [...b.querySelectorAll('.fx-abl-aura')]).map(t => t.getBoundingClientRect());
  const centers = tiles.map(r => [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]);
  const wantC = want.map(i => { const r = sqRect(i); return r ? [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)] : null; });
  const near = (a, b) => a && b && Math.abs(a[0] - b[0]) <= 2 && Math.abs(a[1] - b[1]) <= 2;
  const ok = centers.length === wantC.length && wantC.every(w => centers.some(cc => near(cc, w)));
  return { ok, charged, crystal: s >= 0 ? V.geo.name(s) : null, want: want.length, tiles: centers.length, flipped: c.flipped(), plies: c.history.length };
}"""
fails, log = [], []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=1, is_mobile=True, has_touch=True)
    errs = []; pg.on('pageerror', lambda x: errs.append(str(x)))
    pg.goto(BASE + '#/play/ndbf05-bvgQ')
    pg.wait_for_function('window.CM && CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=20000)
    pg.wait_for_function('!document.querySelector(".view-game.is-loading")', timeout=15000); pg.wait_for_timeout(800)
    idle = 'CM.gameUI.controller.over || (!CM.gameUI.controller.busy && CM.gameUI.controller.state.turn === CM.gameUI.controller.human)'
    for r in range(args.rounds):
        pg.wait_for_function(idle, timeout=30000)
        if pg.evaluate('!!CM.gameUI.controller.over'):
            pg.evaluate('CM.gameUI.controller.undo()'); pg.wait_for_timeout(700)
        act = random.random()
        if r > 2 and act < 0.3: what = 'undo'; pg.evaluate('CM.gameUI.controller.undo()')
        elif r > 2 and act < 0.4: what = 'undo2'; pg.evaluate('CM.gameUI.controller.undo(); CM.gameUI.controller.undo()')
        elif act < 0.5: what = 'flip'; pg.evaluate('CM.gameUI.controller.flip()')
        else:
            what = 'move'
            pg.evaluate("""() => { const c = CM.gameUI.controller; const ms = c.moves.filter(m => !m.special && !m.promo); if (!ms.length) return; const m = ms[Math.floor(Math.random() * ms.length)]; c.tryMove(m.f, m.t); }""")
            pg.wait_for_timeout(300); pg.wait_for_function(idle, timeout=30000)
        pg.wait_for_timeout(700)   # aura fade in/out is 300 ms
        res = pg.evaluate(CHECK); res['act'] = what; log.append(res)
        if not res['ok']: fails.append(res)
    b.close()
srv.shutdown()
print(json.dumps({'ok': not fails and not errs, 'steps': len(log), 'charged_steps': sum(1 for l in log if l['charged']), 'fails': fails[:6], 'page_errors': errs[:4]}, indent=1))
sys.exit(1 if fails or errs else 0)
