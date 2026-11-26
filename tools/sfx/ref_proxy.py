"""A stand-in for the owner's reference clip (intro_sfx_v3), for the similarity gate only.

The real clip is sandbox-only and is missing from most sandboxes. Its measured shape is known from
tools/sfx/similarity_v5.md: 3.00 s, main hit at 0.63 s, pre-hit climb +15.7 dB (a riser), 86 % of the first 0.6 s
after the hit in 40-62 Hz (a ~49 Hz sub boom). This script synthesises that SHAPE (filtered-noise riser -> hit ->
49 Hz sub boom) with parameters fitted so the v5 events measure about the same envelope correlations against it as
they did against the real clip (fit error printed by --fit). It is never a source for any sound, only measured.
Usage (repo root): python3 tools/sfx/ref_proxy.py OUT.wav [--fit]"""
import os, sys
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from synth import SR
import cine as C

# v5 table (similarity_v5.md): event -> env corr vs the real reference
V5 = {'game-start': 0.27, 'game-end': 0.14, 'victory': 0.01, 'defeat': 0.43, 'draw': 0.35, 'jumpscare': 0.49,
      'explosion': 0.44, 'achievement': 0.18, 'fanfare': 0.44, 'gong': 0.46, 'portal': 0.33, 'warp': 0.51,
      'void': 0.48, 'kidnap': 0.32, 'kill': 0.43, 'reap': 0.28, 'spawn': 0.33, 'petrify': 0.45, 'bomb': 0.47,
      'blast': 0.51, 'grenade': 0.57}


def make(rise=0.6, tau=0.5, hit_db=-6.0, tail=3.0, pad_db=-18.0):
    n = int(SR * tail)
    h = 0.63
    r = C.riser(rise, 500.0, 14000.0, 2.2, -36.0, 0.6, 0.35, 0.0, 7)
    x = np.zeros((n, 2))
    a = int((h - rise) * SR)
    x[a:a + len(r)] += C.st(r)[: n - a]
    b = C.sub(70.0, 49.0, 0.10, tail - h, tau, 1.4)
    hb = int(h * SR)
    x[hb:hb + len(b)] += C.st(b)[: n - hb]
    s = C.click(0.006, 2500, 14000, 3)
    x[hb:hb + len(s)] += C.st(s) * C.db(hit_db)
    pad = C.st(C.fade(np.random.default_rng(5).standard_normal(n - hb) * 0.02, 0.3, 0.8))
    x[hb:] += C.lr4(pad, 300, 'low') * C.db(pad_db + 20)
    x = x / (np.abs(x).max() + 1e-9) * 0.7
    return x


def main(argv):
    from make_sfx import write_wav
    out = argv[0]
    kw = dict(rise=0.6, tau=0.5)   # fitted 2026-11-26: rms err 0.058 vs the v5 table, bias +0.04 (proxy reads a bit high = conservative)
    if '--fit' in argv:
        import similarity as S
        tmp = out + '.fit.wav'
        best = None
        EV = {n: S.stats(S.path(n))['env'] for n in V5 if S.path(n)}
        for rise in (0.5, 0.6):
            for tau in (0.3, 0.5, 0.9):
                for pad_db in (-18.0,):
                    write_wav(tmp, make(rise, tau, pad_db=pad_db))
                    ref = S.stats(tmp)
                    errs = []
                    for n, e_ in EV.items():
                        errs.append(S.ecorr(e_, ref['env']) - V5[n])
                    e = float(np.sqrt(np.mean(np.square(errs)))); bias = float(np.mean(errs))
                    print('rise %.1f tau %.1f pad %d: rms err %.3f, bias %+.3f (n=%d)' % (rise, tau, pad_db, e, bias, len(errs)))
                    if best is None or e < best[0]:
                        best = (e, dict(rise=rise, tau=tau, pad_db=pad_db), bias)
        os.unlink(tmp)
        print('best', best)
        kw = best[1]
    write_wav(out, make(**kw))
    print('wrote', out, kw)


if __name__ == '__main__':
    main(sys.argv[1:])
