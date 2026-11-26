"""FPS duel gun sounds (assets/modes/AWFB4EzGtDc, used by js/modes/fps3d/duel.js) against the SAME gates as similarity.py:
Pearson envelope corr < 0.6 vs the reference and no riser->sub boom, no near-duplicate pair (corr >= 0.7 and spectrum diff <= 4 dB)
with each other or with any similarity.py event, true peak <= -1.2 dBTP. Reuses similarity.py unchanged.
Usage: python3 tools/sfx/fps_gate.py <reference.mp3>   (exit 1 on any failure)"""
import sys, os, subprocess, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import similarity as S
ref = S.stats(sys.argv[1])
d = os.path.join(S.ROOT, 'assets', 'modes', 'AWFB4EzGtDc') + os.sep
guns = ['pistol','shotgun','machine','crossbow','grenade','reload']
G = {g: S.stats(d+g+'.wav') for g in guns}
ev = {n: S.stats(S.path(n)) for n in S.EVENTS if S.path(n)}
bad = []
for g in guns:
    s = G[g]; c = S.ecorr(s['env'], ref['env']); rb = s['climb']>=12 and s['sub']>=0.45
    # true peak via ffmpeg ebur128
    r = subprocess.run(['ffmpeg','-nostats','-i',d+g+'.wav','-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True).stderr
    tp = [l for l in r.splitlines() if 'Peak:' in l][-1].split()[-2]
    print(f'{g:9s} dur {s["d"]:.2f}s  corr vs ref {c:.2f}  riser->boom {rb}  TP {tp} dBTP')
    if c >= 0.6 or rb: bad.append(f'{g} vs ref {c:.2f}')
    if float(tp) > -1.2: bad.append(f'{g} TP {tp}')
allS = dict(ev); allS.update({'gun:'+g: G[g] for g in guns})
for g in guns:
    a = 'gun:'+g
    for b, sb in allS.items():
        if b == a or (b.startswith('gun:') and b <= a) or b == g: continue
        c = S.ecorr(G[g]['env'], sb['env']); dsp = float(np.sqrt(np.mean((G[g]['bands']-sb['bands'])**2)))
        if c >= 0.7 and dsp <= 4.0: bad.append(f'{a}~{b} corr {c:.2f} spec {dsp:.1f}')
print('BAD:', bad if bad else 'none')
sys.exit(1 if bad else 0)
