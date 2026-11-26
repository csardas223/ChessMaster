# m-3d: game-fx second-half presets on main. 390x844 touch, normal + reduced motion; counts DOM fx nodes after triggers.
import asyncio, sys, subprocess, time, json
from playwright.async_api import async_playwright
root, port, ids, out = sys.argv[1], int(sys.argv[2]), open(sys.argv[3]).read().split(), sys.argv[4]
import os; os.makedirs(out, exist_ok=True)
srv = subprocess.Popen([sys.executable,'-m','http.server',str(port),'-d',root],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL); time.sleep(1)
IGN=('ytimg','stockfish','net::ERR','Failed to load resource','googlevideo','youtube','TUNNEL','407','unpkg','jsdelivr','Maia')
JS = """async () => {
 const UI = CM.gameUI, v = UI.vfx, g = UI.controller, id = g && g.spec && g.spec.id;
 const ex = (CM.gameFx.extrasFor(id || '', g && g.spec && g.spec.vfx_timeline) || []);
 const o = { id, tl: v.timeline.length, extra: ex.length, presets: (CM.gameFxModes||{})[id] };
 const sq = g && g.state ? g.resolveSquare('e4', {}) : null;
 const trig = [...new Set(ex.map(e => e.trigger))];
 for (const t of trig) { try { v.trigger(t, { to: sq, from: sq, side: 'b', by: 'bot', capture: true }); } catch (e) { o.err = String(e); } }
 await new Promise(r => setTimeout(r, 180));
 o.trig = trig; o.nodes = v.layer ? v.layer.querySelectorAll('*').length : -1; o.anims = document.getAnimations().length;
 document.getAnimations().forEach(a => a.pause());
 return o; }"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for mid in ids:
            for rm in (False, True):
                ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True,reduced_motion='reduce' if rm else 'no-preference')
                pg=await ctx.new_page(); errs=[]
                pg.on('console', lambda m: errs.append(m.text[:200]) if m.type=='error' else None)
                pg.on('pageerror', lambda e: errs.append('PAGEERROR '+str(e)[:200]))
                tag = mid+('_rm' if rm else '')
                try:
                    await pg.goto(f'http://127.0.0.1:{port}/#/play/{mid}', wait_until='load', timeout=40000)
                    await pg.wait_for_function('() => CM.gameUI && CM.gameUI.vfx && CM.gameUI.controller && CM.gameUI.controller.state', timeout=40000)
                    await pg.wait_for_timeout(2500)
                    info = await pg.evaluate(JS)
                    if not rm: await pg.screenshot(path=f'{out}/{mid}.jpg', type='jpeg', quality=60)
                    await pg.evaluate('() => document.getAnimations().forEach(a => a.play())'); await pg.wait_for_timeout(1500)
                except Exception as e: info = {'exc': str(e)[:200]}
                real=[e for e in errs if not any(k in e for k in IGN)]
                print(json.dumps({tag:{'info':info,'errors':real}}),flush=True)
                await ctx.close()
        await b.close()
asyncio.run(main()); srv.terminate()
