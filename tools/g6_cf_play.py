# g6_cf_play.py (cf-2): replays tools/g6_cf_solve.mjs solutions (SOLJSON=sols.json node tools/g6_cf_solve.mjs ...) through the real app (SpecGame + g6_levels) and checks each level is won. Usage: PORT=8797 python3 tools/g6_cf_play.py sols.json
import asyncio, json, os, sys, subprocess, threading, http.server, socketserver, functools, re
from urllib.parse import urlparse
APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sols = json.load(open(sys.argv[1]))   # {vid: {levelIndex: [[f,t,type], ...]}}
os.environ['LD_LIBRARY_PATH'] = '/tmp/libs/root/usr/lib/aarch64-linux-gnu:/tmp/libs/root/lib/aarch64-linux-gnu:' + os.environ.get('LD_LIBRARY_PATH', '')
H = http.server.SimpleHTTPRequestHandler
class Q(H):
    def log_message(self, *a): pass
srv = socketserver.ThreadingTCPServer(('127.0.0.1', int(os.environ.get('PORT','8796'))), functools.partial(Q, directory=APP)); threading.Thread(target=srv.serve_forever, daemon=True).start()
from playwright.async_api import async_playwright
JS = """async ([k, moves]) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  CM.settings.animMs = () => 0;
  let g = CM.gameUI.controller; g.hooks.runSetLevel(g.ctx, k); g.newGame(); await sleep(300);
  g = CM.gameUI.controller; const er = document.getElementById('g6-run'); if (er) er.remove();
  const geo = g.V.geo, log = [];
  for (const [fs, ts, ty] of moves) {
    for (let w = 0; w < 50 && (g.busy || g.state.turn !== g.human); w++) await sleep(60);
    if (g.over) return {ok: false, why: 'over early: ' + g.over.why, log};
    const f = geo.parse(fs), t = geo.parse(ts), base = ty.split('=')[0], promo = ty.split('=')[1];
    const p = g.state.b[f]; if (!p) return {ok: false, why: 'no piece on ' + fs, log};
    const cl = g.state.x.chLeft || []; if (p.t === 'Ch' || (cl.includes(f) && p.t !== (base === 'A' ? 'P' : base))) { g.state.x.chLeft = cl.filter(x => x !== f); g.state.b = g.state.b.slice(); g.state.b[f] = Object.assign({}, p, {t: base === 'A' ? 'P' : base, m: 0}); g.moves = g.V.legal(g.state); }
    const m = g.moves.find(m => m.f === f && m.t === t && (!promo || m.promo === promo));
    if (!m) return {ok: false, why: 'illegal ' + ty + ' ' + fs + '-' + ts, log, legalFrom: g.moves.filter(m => m.f === f).map(m => geo.name(m.t))};
    g.commit(m); log.push(fs + '-' + ts); await sleep(80);
  }
  for (let w = 0; w < 40 && !g.over; w++) await sleep(60);
  return {ok: !!(g.over && g.over.w === g.human), over: g.over && g.over.why, log};
}"""
async def main():
    async with async_playwright() as p:
        kw = {}; px = os.environ.get('HTTPS_PROXY') or os.environ.get('HTTP_PROXY')
        if px: u = urlparse(px); kw['proxy'] = {'server': f'{u.scheme}://{u.hostname}:{u.port}', 'bypass': '127.0.0.1,localhost'}; kw['proxy'].update(username=u.username or '', password=u.password or '') if u.username else None
        br = await p.chromium.launch(**kw); pg = await br.new_page(viewport={'width': 390, 'height': 844})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        for vid, lv in sols.items():
            await pg.goto('http://127.0.0.1:'+os.environ.get('PORT','8796')+f'/index.html#/play/{vid}'); await pg.wait_for_timeout(1500)
            for k, mv in lv.items():
                r = await pg.evaluate(JS, [int(k), mv]); print(vid, 'level idx', k, r.get('ok'), r.get('why') or r.get('over'), r.get('legalFrom', ''), flush=True)
        print('page errors:', errs[:5]); await br.close()
asyncio.run(main())
