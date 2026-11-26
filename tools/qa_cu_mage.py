# Headless QA of the iwantcheckmage Chess Ultimate modes (xRximnDlQtI, 4FRsSJoxMkE; js/modes/cu_mage.js) at 390x844 touch:
# every series opponent's lineup loads (8x10, 4 squares per squid, one King each side, who moves first), the MAKE A TEAM!
# dialog opens and plays, a Mage swap with a pawn on the last rank promotes, console errors (CDN 407s ignored). Shots -> OUT.
import os, sys, threading, http.server, socketserver, functools, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = os.environ.get('OUT', '/tmp/qa_cu_mage'); os.makedirs(OUT, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{port}/index.html'
def real(t): return not any(k in t for k in ('407', 'ERR_TUNNEL', 'Proxy', 'net::ERR'))
ok = True
STATE = """()=>{const G=CM.gameUI.controller,st=G.state,V=G.V,g=V.geo;const cnt={};st.b.forEach(p=>{if(p){const k=p.c+':'+p.t;cnt[k]=(cnt[k]||0)+1;}});
 return {opp:G.opponent.name,files:g.files,ranks:g.ranks,turn:st.turn,cnt,moves:(G.moves||[]).length}}"""
with sync_playwright() as p:
    b = p.chromium.launch()
    for mid in sys.argv[1:] or ['xRximnDlQtI', '4FRsSJoxMkE']:
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, has_touch=True, is_mobile=True)
        pg = ctx.new_page(); errs = []
        pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and real(m.text) else None)
        pg.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)))
        pg.goto(BASE + '#/play/' + mid); pg.wait_for_timeout(4500)
        n = pg.evaluate("()=>CM.gameUI.controller.spec.params.series.opponents.length")
        for k in range(n):
            pg.evaluate(f"()=>{{CM.store.set('g6series.{mid}',{{n:{k},w:0}});CM.gameUI.controller.newGame();}}"); pg.wait_for_timeout(1200)
            s = pg.evaluate(STATE)
            gi = {t: v for t, v in s['cnt'].items() if t.endswith(':Giant')}
            first = pg.evaluate(f"()=>{{const G=CM.gameUI.controller;return (G.spec.params.cuMage.games[G.opponent.name]||{{}}).first||'w'}}")
            good = s['files'] == 8 and s['ranks'] == 10 and s['cnt'].get('w:K') == 1 and s['cnt'].get('b:K') == 1 and all(v % 4 == 0 for v in gi.values())
            print(mid, k, s['opp'], 'turn', s['turn'], 'first', first, 'giants', gi, 'OK' if good else 'BAD', s['cnt'])
            ok &= good
            pg.screenshot(path=f'{OUT}/{mid}_{k}.png')
        # MAKE A TEAM! dialog
        pg.evaluate(f"()=>{{CM.store.set('g6series.{mid}',{{n:0,w:0}});CM.gameUI.controller.newGame();}}"); pg.wait_for_timeout(800)
        pg.click('.cum-bar button'); pg.wait_for_timeout(500); pg.screenshot(path=f'{OUT}/{mid}_team.png')
        pg.click('.cum-dlg [data-p="1"]'); pg.wait_for_timeout(200); pg.click('.cum-dlg [data-x="go"]'); pg.wait_for_timeout(1500)
        s = pg.evaluate(STATE); print(mid, 'preset 2 ->', s['cnt'])
        # Mage swap promotion: put a white Mage on the last rank and a pawn on rank 2, swap
        r = pg.evaluate("""()=>{const G=CM.gameUI.controller,V=G.V,g=V.geo,st=G.state;st.b=st.b.map(()=>null);
          st.b[g.parse('a1')]=V.piece('K','w');st.b[g.parse('h10')]=V.piece('K','b');st.b[g.parse('d10')]=V.piece('Mage','w');st.b[g.parse('b2')]=V.piece('P','w');st.turn='w';
          const ms=V.legal(st).filter(m=>m.swap&&m.f===g.parse('d10')&&m.t===g.parse('b2'));if(!ms.length)return 'no swap move';
          const n=V.make(st,ms[0]);return [n.b[g.parse('d10')]&&n.b[g.parse('d10')].t,n.b[g.parse('b2')]&&n.b[g.parse('b2')].t].join(',')}""")
        print(mid, 'mage swap pawn onto rank 10 ->', r); ok &= (r == 'Q,Mage')
        print(mid, 'console errors:', errs[:5]); ok &= not errs
        ctx.close()
    b.close()
print('ALL OK' if ok else 'FAIL'); sys.exit(0 if ok else 1)
