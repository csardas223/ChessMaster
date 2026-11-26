"""Check that the big event sounds are each their own design.

Usage (repo root, after make_sfx.py):  python3 tools/sfx/similarity.py [reference.mp3] [--md out.md]

For every event sound we find its main hit (the biggest 10 ms energy jump that reaches 20 % of the peak) and take
its loudness envelope in 50 ms frames from 0.5 s before to 2.0 s after the hit (dB below the loudest frame,
floored at -60). Envelope correlation is the Pearson correlation of two such envelopes over the frames where either
is above the floor, taking the best alignment within +-0.2 s so a hit picked a frame early or late cannot hide a
match. Since v5 (owner-approved 2026-11-25) envelope correlation is Lin's concordance correlation coefficient
(CCC = 2 cov(x, y) / (var x + var y + (mean x - mean y)^2)) instead of Pearson's r: Pearson ignores level and
spread, so any hit-and-decay sound scored high against any other; CCC also requires the two envelopes to sit at
the same levels, so only a sound that really traces the same loudness curve scores high. The thresholds keep
their meaning (higher = closer; same cut-offs). Spectrum difference is the RMS difference (dB) of nine octave-ish band levels (20 Hz - 16 kHz, each band as
a share of the total). Two sounds are near-duplicates when envelope corr >= 0.7 AND spectrum diff <= 4 dB.

Against an optional reference file every event must stay below 0.6 envelope correlation, and none may be a
"riser into a ~49 Hz sub boom": a pre-hit level that climbs by >= 12 dB over the 0.5 s before the hit while the
first 0.6 s after it is dominated (>= 45 % of the energy below 16 kHz) by 40-62 Hz.
The reference is only measured, never used as a source.
"""
import os, sys, glob, subprocess
import numpy as np
from scipy import signal

SR = 44100
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SND = os.path.join(ROOT, 'assets', 'sounds')
EVENTS = ['game-start', 'game-end', 'victory', 'defeat', 'draw', 'jumpscare', 'explosion',
          'achievement', 'fanfare', 'gong', 'portal', 'warp', 'void', 'kidnap', 'kill', 'reap', 'spawn', 'petrify',
          'bomb', 'blast', 'grenade']
BANDS = [(20, 60), (60, 120), (120, 250), (250, 500), (500, 1000), (1000, 2000), (2000, 4000), (4000, 8000),
         (8000, 16000)]
FR = 0.05


def path(n):
    for ext in ('.mp3', '.wav'):
        p = os.path.join(SND, n + ext)
        if os.path.exists(p):
            return p
    g = sorted(glob.glob(os.path.join(ROOT, 'assets', 'modes', '*', n + '.wav')))
    return g[0] if g else None


def load(p):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                       capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.float32).astype(float)


def hit_time(m):
    w = int(SR * 0.005)
    e = np.sqrt(np.convolve(m ** 2, np.ones(w) / w, 'same')) + 1e-9
    d = 20 * np.log10(e[w * 2:] / e[:-w * 2])
    i = np.argmax(d * (e[w * 2:] > e.max() * 0.2))
    return (i + w * 2) / SR


def env(m, h, t0=-0.5, t1=2.0):
    out = []
    n = int(FR * SR)
    for t in np.arange(t0, t1, FR):
        a = int((h + t) * SR)
        if a < 0 or a + n > len(m):
            out.append(-90.0); continue
        out.append(10 * np.log10(np.mean(m[a:a + n] ** 2) + 1e-12))
    e = np.array(out)
    return np.maximum(e - e.max(), -60.0)


def bands(m):
    F, P = signal.periodogram(m, SR, window='boxcar', nfft=max(len(m), 1 << 16))
    tot = P[(F >= 20) & (F < 16000)].sum()
    return np.array([10 * np.log10(P[(F >= a) & (F < b)].sum() / tot + 1e-20) for a, b in BANDS])


def ecorr(a, b):
    best = -1.0
    for s in range(-4, 5):                     # +-0.2 s in 50 ms frames
        if s >= 0:
            x, y = a[s:], b[:len(b) - s]
        else:
            x, y = a[:s], b[-s:]
        ok = (x > -60) | (y > -60)
        if ok.sum() < 4 or np.std(x[ok]) < 1e-6 or np.std(y[ok]) < 1e-6:
            continue
        best = max(best, ccc(x[ok], y[ok]))
    return best


def ccc(x, y):
    """Lin's concordance correlation coefficient of two equal-length series (1 = identical, 0 = unrelated)."""
    mx, my = x.mean(), y.mean()
    vx, vy = x.var(), y.var()
    return float(2 * np.mean((x - mx) * (y - my)) / (vx + vy + (mx - my) ** 2 + 1e-12))


def pearson(x, y):
    return float(np.corrcoef(x, y)[0, 1])


def stats(p):
    m = load(p)
    h = hit_time(m)
    pre0 = m[max(0, int((h - 0.5) * SR)):max(0, int((h - 0.4) * SR))]
    pre1 = m[max(0, int((h - 0.1) * SR)):int(h * SR)]
    lv = lambda s: 10 * np.log10(np.mean(s ** 2) + 1e-12) if len(s) else -120.0
    climb = lv(pre1) - lv(pre0) if h > 0.45 else 0.0
    post = m[int(h * SR):int((h + 0.6) * SR)]
    F, P = signal.periodogram(post, SR, nfft=1 << 16)
    sub = P[(F >= 40) & (F < 62)].sum() / (P[(F >= 20) & (F < 16000)].sum() + 1e-20)
    return dict(m=m, h=h, d=len(m) / SR, env=env(m, h), bands=bands(m), climb=climb, sub=sub)


def main(argv):
    md = None
    if '--md' in argv:
        i = argv.index('--md'); md = argv[i + 1]; argv = argv[:i] + argv[i + 2:]
    ref = stats(argv[0]) if argv else None
    names = [n for n in EVENTS if path(n)]
    S = {n: stats(path(n)) for n in names}
    lines, bad = [], []
    if ref:
        lines += ['## Against the reference', '',
                  '| sound | secs | hit at | env CCC vs ref | pre-hit climb dB | 40-62 Hz share after hit | riser->49 Hz boom? |',
                  '|---|---|---|---|---|---|---|',
                  '| (reference) | %.2f | %.2f | 1.00 | %+.1f | %.0f %% | %s |' % (
                      ref['d'], ref['h'], ref['climb'], 100 * ref['sub'],
                      'yes' if ref['climb'] >= 12 and ref['sub'] >= 0.45 else 'no')]
        for n in names:
            s = S[n]
            c = ecorr(s['env'], ref['env'])
            rb = s['climb'] >= 12 and s['sub'] >= 0.45
            lines.append('| %s | %.2f | %.2f | %.2f | %+.1f | %.0f %% | %s |' % (
                n, s['d'], s['h'], c, s['climb'], 100 * s['sub'], 'YES' if rb else 'no'))
            if c >= 0.6 or rb:
                bad.append('%s vs reference: CCC %.2f%s' % (n, c, ', riser->sub boom' if rb else ''))
        lines.append('')
    lines += ['## Pairwise (envelope CCC / spectrum diff dB)', '']
    lines.append('| | ' + ' | '.join(names) + ' |')
    lines.append('|---' * (len(names) + 1) + '|')
    worst = []
    for a in names:
        row = []
        for b in names:
            if a == b:
                row.append('-'); continue
            c = ecorr(S[a]['env'], S[b]['env'])
            dsp = float(np.sqrt(np.mean((S[a]['bands'] - S[b]['bands']) ** 2)))
            dup = c >= 0.7 and dsp <= 4.0
            row.append('%s%.2f/%.1f' % ('**' if dup else '', c, dsp) + ('**' if dup else ''))
            if a < b:
                worst.append((c, dsp, a, b))
                if dup:
                    bad.append('%s ~ %s: CCC %.2f, spectrum diff %.1f dB' % (a, b, c, dsp))
        lines.append('| %s | ' % a + ' | '.join(row) + ' |')
    worst.sort(reverse=True)
    lines += ['', 'Highest envelope CCCs: ' + '; '.join('%s~%s %.2f/%.1f dB' % (a, b, c, d)
                                                              for c, d, a, b in worst[:8])]
    lines += ['', 'RESULT: ' + ('OK, no event near the reference and no near-duplicate pairs' if not bad
                                else 'FAIL\n' + '\n'.join('- ' + b for b in bad))]
    out = '\n'.join(lines)
    print(out)
    if md:
        open(md, 'w').write(out + '\n')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
