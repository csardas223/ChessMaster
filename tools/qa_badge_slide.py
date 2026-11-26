#!/usr/bin/env python3
"""m-ui #11 check: a piece-attached decoration (SCP-4975 crack, HuZlhHnES7M) slides with its piece. Needs a static server
on 127.0.0.1:8797 at the repo root (python3 -m http.server 8797). Prints per-frame [piece left/top, crack left/top]; they must match."""
from playwright.sync_api import sync_playwright
import time, json
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844}, has_touch=True, is_mobile=True)
    errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:8797/index.html#/play/HuZlhHnES7M'); time.sleep(3)
    r=pg.evaluate("""()=>new Promise(res=>{const g=CM.app.current,V=g.V,s=V.geo.parse('g1');g.state.b[s]=Object.assign({},g.state.b[s],{crk:1});g.moves=V.legal(g.state);g.render({instant:true});
      g.tryMove(s,V.geo.parse('f3'));const out=[];
      const sample=()=>{const sq=document.querySelector('[data-i="'+V.geo.parse('f3')+'"]');const pc=sq&&sq.querySelector('.pc'),cr=sq&&sq.querySelector('.g4975-crack');
        if(pc&&cr){const a=pc.getBoundingClientRect(),c=cr.getBoundingClientRect();out.push([Math.round(a.left),Math.round(a.top),Math.round(c.left),Math.round(c.top)]);}};
      let n=0;(function f(){sample();if(++n<90)requestAnimationFrame(f);else res(out);})();})""")
    print(len(r), r[:14]); print(errs)
