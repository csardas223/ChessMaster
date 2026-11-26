for i in range(3):
    print(pg.evaluate("() => new Promise(r => { const S = CM.scene3d.current(), f0 = S.renderer.info.render.frame, t0 = performance.now(); setTimeout(() => r([S.renderer.info.render.frame - f0, performance.now() - t0, S.renderer.info.render.calls, CM.battle3d.current().clock]), 3000); })"), flush=True)
pg.screenshot(path=OUT + '/fps.png', timeout=90000)
print('shot ok')
