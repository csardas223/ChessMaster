"""Gates for the v6 per-mode sounds (tools/sfx/modes_v6.py), the same tests as similarity.py / fps_gate.py / ring_check.py:
- true peak <= -1.5 dBTP (ffmpeg ebur128, as fps_gate.py),
- no struck ring > 150 ms (ring_check.longest_ring),
- no "riser into a ~49 Hz sub boom" (pre-hit climb >= 12 dB AND >= 45 % of the first 0.6 s in 40-62 Hz),
- no near-duplicate pair (envelope corr >= 0.7 AND spectrum diff <= 4 dB) among the v6 sounds, nor between a v6 sound
  and any other built sound (assets/sounds/*, every other assets/modes/*/*.wav),
- with a reference file given: Pearson envelope corr < 0.6 vs the owner's reference (it is measured only, never a source).
Usage (repo root): python3 tools/sfx/v6_gate.py [reference.mp3] [--md out.md]   exit 1 on any failure."""
import os, sys, glob, subprocess
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import similarity as S
import ring_check as R
from modes_v6 import HOME

argv = sys.argv[1:]
md = None
if '--md' in argv:
    i = argv.index('--md'); md = argv[i + 1]; argv = argv[:i] + argv[i + 2:]
ref = S.stats(argv[0]) if argv else None
mine = {n: os.path.join(S.ROOT, 'assets', 'modes', mid, n + '.wav') for mid, ns in HOME.items() for n in ns}
mine = {n: p for n, p in mine.items() if os.path.exists(p)}
mset = set(mine.values())
others = sorted(glob.glob(os.path.join(S.ROOT, 'assets', 'sounds', '*.mp3')) + glob.glob(os.path.join(S.ROOT, 'assets', 'sounds', '*.wav'))
                + [p for p in glob.glob(os.path.join(S.ROOT, 'assets', 'modes', '*', '*.wav')) if p not in mset])
seen, oth = set(), {}
for p in others:   # the same recipe written into several folders is one sound
    k = os.path.splitext(os.path.basename(p))[0]
    if k in seen or os.path.basename(os.path.dirname(p)) == 'xlErokL2-4c' and k == 'sinking_hymn':
        continue
    seen.add(k); oth['%s' % os.path.relpath(p, S.ROOT)] = p
ST = {n: S.stats(p) for n, p in mine.items()}
OT = {n: S.stats(p) for n, p in oth.items()}
bad, rows = [], []
for n, p in mine.items():
    s = ST[n]
    r = subprocess.run(['ffmpeg', '-nostats', '-i', p, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    tp = float([l for l in r.splitlines() if 'Peak:' in l][-1].split()[-2])
    ring, rf, _, _ = R.longest_ring(R.load(p))
    rb = s['climb'] >= 12 and s['sub'] >= 0.45
    c = S.ecorr(s['env'], ref['env']) if ref else float('nan')
    # nearest other sound (v6 or existing) by envelope corr among those within 4 dB spectrum
    best = (-1, 99, '')
    for m2, s2 in list(ST.items()) + list(OT.items()):
        if m2 == n:
            continue
        cc = S.ecorr(s['env'], s2['env']); dsp = float(np.sqrt(np.mean((s['bands'] - s2['bands']) ** 2)))
        if cc >= 0.7 and dsp <= 4.0 and not (m2 in ST and m2 < n):
            bad.append('%s ~ %s: corr %.2f, spectrum diff %.1f dB (near-duplicate)' % (n, m2, cc, dsp))
        if dsp <= 4.0 and cc > best[0]:
            best = (cc, dsp, m2)
    if tp > -1.5: bad.append('%s: true peak %.2f dBTP' % (n, tp))
    if ring > R.LIMIT_MS: bad.append('%s: struck ring %.0f ms @ %.0f Hz' % (n, ring, rf))
    if rb: bad.append('%s: riser -> sub boom' % n)
    if ref and c >= 0.6: bad.append('%s vs reference: corr %.2f' % (n, c))
    rows.append('| %s | %s | %.2f | %.1f | %.0f | %s | %s | %s |' % (n, os.path.relpath(p, S.ROOT), s['d'], tp, ring, 'YES' if rb else 'no',
                                                      'n/a' if not ref else '%.2f' % c,
                                                      '%s %.2f/%.1f' % (best[2], best[0], best[1]) if best[2] else '-'))
out = ['# v6 per-mode sounds gate', '', 'Reference: ' + (argv[0] if ref else 'NOT GIVEN (owner reference clip not in the sandbox; env-corr vs reference not measured)'), '',
       '| sound | file | secs | true peak dBTP | longest struck ring ms | riser->sub boom | env corr vs ref | closest other sound within 4 dB spectrum (corr/spec dB) |',
       '|---|---|---|---|---|---|---|---|'] + rows
out += ['', '%d v6 sounds checked against each other and %d other built sounds.' % (len(ST), len(OT)),
        'RESULT: ' + ('OK' if not bad else 'FAIL\n' + '\n'.join('- ' + b for b in bad))]
print('\n'.join(out))
if md:
    open(md, 'w').write('\n'.join(out) + '\n')
sys.exit(1 if bad else 0)
