import asyncio, sys, subprocess, time, json
from playwright.async_api import async_playwright
root, port, ids = sys.argv[1], int(sys.argv[2]), sys.argv[3].split(',')
shots = len(sys.argv) > 4
srv = subprocess.Popen([sys.executable,'-m','http.server',str(port),'-d',root],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(1)
IGN=('ytimg','stockfish','net::ERR','Failed to load resource','googlevideo','youtube')
JS = """async () => {
 const UI = CM.gameUI, v = UI.vfx, g = UI.controller;
 const out = { id: g && g.spec && g.spec.id, tl: v.timeline.length, extra: (CM.gameFx.extrasFor(g && g.spec && g.spec.id || '', g && g.spec && g.spec.vfx_timeline) || []).length };
 const sq = g && g.state ? g.resolveSquare('e4', {}) : null;
 v.trigger('capture', { to: sq, side: 'b', by: 'bot', capture: true });
 v.trigger('check', { to: sq, side: 'w', by: 'player' });
 v.play({ type: 'popup', at: 'board', text: '+1000', color: '#8fd14f' }, {});
 await new Promise(r => setTimeout(r, 200)); document.getAnimations().forEach(a => a.pause());
 return out; }"""
async def main():
    res={}
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for mid in ids:
            for rm in ([False, True] if shots else [False]):
                ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True,reduced_motion='reduce' if rm else 'no-preference')
                pg=await ctx.new_page(); errs=[]
                pg.on('console', lambda m: errs.append(m.text) if m.type in ('error','warning') and 'vfx' in m.text.lower() or m.type=='error' else None)
                pg.on('pageerror', lambda e: errs.append('PAGEERROR '+str(e)))
                await pg.goto(f'http://127.0.0.1:{port}/#/play/{mid}', wait_until='load', timeout=20000)
                await pg.wait_for_timeout(2800)
                info = await pg.evaluate(JS)
                if shots: await pg.screenshot(path=f'rebuild/research/ref/fin-sprites-a/qa/vfx_{mid}_{"rm" if rm else "a"}_1.png')
                await pg.evaluate('() => document.getAnimations().forEach(a => a.play())')
                await pg.evaluate("() => CM.gameUI.vfx.trigger('win', {})")
                await pg.wait_for_timeout(420); await pg.evaluate('() => document.getAnimations().forEach(a => a.pause())')
                if shots: await pg.screenshot(path=f'rebuild/research/ref/fin-sprites-a/qa/vfx_{mid}_{"rm" if rm else "a"}_2.png')
                await pg.wait_for_timeout(1500)
                real=[e for e in errs if not any(k in e for k in IGN)]
                res[mid+('_rm' if rm else '')]={'info':info,'errors':real}
                await ctx.close()
        await b.close()
    print(json.dumps(res))
asyncio.run(main())
srv.terminate()
