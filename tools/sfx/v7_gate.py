"""Gates for the v7 sounds (tools/sfx/modes_v7.py), the same tests as similarity.py / v6_gate.py / ring_check.py:
- true peak <= -1.5 dBTP on the encoded file (ffmpeg ebur128),
- no struck ring > 150 ms (ring_check.longest_ring),
- no "riser into a ~49 Hz sub boom" (pre-hit climb >= 12 dB AND >= 45 % of the first 0.6 s in 40-62 Hz),
- Pearson envelope corr < 0.6 vs the owner's reference (pass its path; when the sandbox lacks it, pass the stand-in
  from tools/sfx/ref_proxy.py and the report says so),
- no near-duplicate pair (envelope corr >= 0.7 AND spectrum diff <= 4 dB) among the v7 sounds (the four game-start
  takes included), nor between a v7 sound and any other built sound (assets/sounds/*, assets/modes/*/*.wav).
Usage (repo root): python3 tools/sfx/v7_gate.py REFERENCE [--proxy] [--md out.md]   exit 1 on any failure."""
import os, sys, glob, subprocess
import numpy as np
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import similarity as S
import ring_check as R
from modes_v7 import OUT

argv = sys.argv[1:]
md = None
if '--md' in argv:
    i = argv.index('--md'); md = argv[i + 1]; argv = argv[:i] + argv[i + 2:]
proxy = '--proxy' in argv
argv = [a for a in argv if a != '--proxy']
ref = S.stats(argv[0]) if argv else None
mine = {n: os.path.join(S.ROOT, p) for n, p in OUT.items() if os.path.exists(os.path.join(S.ROOT, p))}
mine['game-start'] = os.path.join(S.ROOT, 'assets', 'sounds', 'game-start.mp3')   # take 1, checked against its takes
mset = set(mine.values())
others = sorted(glob.glob(os.path.join(S.ROOT, 'assets', 'sounds', '*.mp3')) + glob.glob(os.path.join(S.ROOT, 'assets', 'sounds', '*.wav'))
                + glob.glob(os.path.join(S.ROOT, 'assets', 'modes', '*', '*.wav')))
seen, oth = set(), {}
for p in others:   # the same recipe written into several folders is one sound
    k = os.path.splitext(os.path.basename(p))[0]
    if p in mset or k in seen:
        continue
    seen.add(k); oth[os.path.relpath(p, S.ROOT)] = p
with ThreadPoolExecutor(8) as ex:
    ST = dict(zip(mine, ex.map(S.stats, mine.values())))
    OT = dict(zip(oth, ex.map(S.stats, oth.values())))


def tp_of(p):
    r = subprocess.run(['ffmpeg', '-nostats', '-i', p, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float([l for l in r.splitlines() if 'Peak:' in l][-1].split()[-2])


bad, rows = [], []
for n, p in mine.items():
    s = ST[n]
    tp = tp_of(p)
    ring, rf, _, _ = R.longest_ring(R.load(p))
    rb = s['climb'] >= 12 and s['sub'] >= 0.45
    c = S.ecorr(s['env'], ref['env']) if ref else float('nan')
    best = (-1, 99, '')
    for m2, s2 in list(ST.items()) + list(OT.items()):
        if m2 == n:
            continue
        cc = S.ecorr(s['env'], s2['env']); dsp = float(np.sqrt(np.mean((s['bands'] - s2['bands']) ** 2)))
        if cc >= 0.7 and dsp <= 4.0 and not (m2 in ST and m2 < n):
            bad.append('%s ~ %s: corr %.2f, spectrum diff %.1f dB (near-duplicate)' % (n, m2, cc, dsp))
        if dsp <= 4.0 and cc > best[0]:
            best = (cc, dsp, m2)
    if n != 'game-start':
        if tp > -1.5: bad.append('%s: true peak %.2f dBTP' % (n, tp))
        if ring > R.LIMIT_MS: bad.append('%s: struck ring %.0f ms @ %.0f Hz' % (n, ring, rf))
        if rb: bad.append('%s: riser -> sub boom' % n)
        if ref and c >= 0.6: bad.append('%s vs reference: corr %.2f' % (n, c))
    rows.append('| %s | %s | %.2f | %.1f | %.0f | %s | %s | %s |' % (n, os.path.relpath(p, S.ROOT), s['d'], tp, ring, 'YES' if rb else 'no',
                                                      'n/a' if not ref else '%.2f' % c,
                                                      '%s %.2f/%.1f' % (best[2], best[0], best[1]) if best[2] else '-'))
refname = 'NOT GIVEN' if not ref else (argv[0] + (' = STAND-IN from tools/sfx/ref_proxy.py (the owner clip is not in this sandbox; '
                                                  'fitted to the v5 table, rms err 0.058, reads ~0.04 high)' if proxy else ''))
out = ['# v7 sounds gate (start takes + family sets)', '', 'Reference: ' + refname, '',
       '| sound | file | secs | true peak dBTP | longest struck ring ms | riser->sub boom | env corr vs ref | closest other sound within 4 dB spectrum (corr/spec dB) |',
       '|---|---|---|---|---|---|---|---|'] + rows
out += ['', '%d v7 sounds (+ game-start take 1) checked against each other and %d other built sounds.' % (len(ST) - 1, len(OT)),
        'RESULT: ' + ('OK' if not bad else 'FAIL\n' + '\n'.join('- ' + b for b in bad))]
print('\n'.join(out))
if md:
    open(md, 'w').write('\n'.join(out) + '\n')
sys.exit(1 if bad else 0)
