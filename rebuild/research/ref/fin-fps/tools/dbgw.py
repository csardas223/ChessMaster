import sys, time
sys.argv=['x','--only','none','--port','8813','--out','/workspace/work/fps3d']
__file__='/workspace/work/fin_fps/tools/qa_fps3d.py'
exec(open('tools/qa_fps3d.py').read().split('with sync_playwright() as p:')[0])
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_context(viewport={'width': 800, 'height': 500}).new_page(); hook(pg)
    open_mode(pg, 'Nz2A-g73_iM')
    d0 = start_duel(pg, 'dw', 'e2', 'f3', 'N')
    pg.evaluate('() => { CM.fps3d.qaHold = true; }')
    pg.mouse.click(400, 250); pg.wait_for_timeout(200)
    for k in range(3):
        pg.keyboard.down('w'); pg.wait_for_timeout(400)
        print(pg.evaluate('() => { const d = CM.fps3d.dbg(); return [d.me.x, d.me.z, d.me.y, d.phase, d.firing, document.pointerLockElement && document.pointerLockElement.tagName]; }'))
    pg.keyboard.up('w')

    print(res['errors'])
    b.close()
