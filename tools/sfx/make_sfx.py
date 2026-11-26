"""Regenerate every Chess Master sound effect. Run from the repo root: python3 tools/sfx/make_sfx.py

v5 (2026-11-26): the big events (game start / end, results, jumpscare, explosion and the mode big moments) are each
their own design in events.py; v4's shared riser -> hit -> sub boom -> pad template below is retired for them.
Gates: tools/sfx/similarity.py <reference> (Pearson envelope corr < 0.6 vs the owner's reference clip, which is
never a source and not in the repo; no near-duplicate pairs) and tools/sfx/ring_check.py (no struck ring > 150 ms).
Loudness: unchanged from v4, true peak <= -1.2 dBTP (TP_MAX - 0.2) -- still to confirm with the owner (an older
rule said peaks <= -6 dBFS).

v4, modern cinematic / premium game-UI sound design: risers, layered impacts, tuned sub booms and warm bowed-string
pads for the big moments; tight layered transients with a subtle low thump and a tiny air tail for the frequent
cues. Built from CC0 recordings in tools/sfx/sources/ (provenance in tools/sfx/sources.md) plus synthesised
noise risers / sine subs (cine.py), processed in core.py and modes.py and mastered with a BS.1770 meter and a
true-peak limiter (frequent cues about -19 LUFS momentary-max, big moments about -15 LUFS short-term max,
true peak <= -1 dBTP after encoding). Output is stereo 44.1 kHz; names and formats are unchanged.
Needs numpy, scipy and ffmpeg (decodes the .ogg sources, encodes the .mp3 core set).
"""
import os, sys, glob, subprocess, tempfile
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from synth import SR
import samples
import cine
from core import CORE, CORE_WAV
from modes import RECIPES, RESULTS
from modes_v6 import RECIPES as V6_RECIPES   # v6 per-mode sets (tools/sfx/make_v6.py regenerates only these)
RECIPES.update(V6_RECIPES)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SND = os.path.join(ROOT, 'assets', 'sounds')
REPORT = []
TP_MAX = -1.0


def check(name, x):
    x = cine.st(x)
    assert np.all(np.isfinite(x)), name + ': NaN/inf'
    tp = cine.true_peak(x)
    assert tp <= TP_MAX - 0.2, '%s: true peak %.2f dBTP' % (name, tp)
    d = len(x) / SR
    assert 0.03 < d < 30, '%s: odd duration %.2fs' % (name, d)
    dc = float(np.max(np.abs(x.mean(0))))
    assert dc < 1e-3, '%s: DC offset %.4f' % (name, dc)
    assert np.max(np.abs(x[:8])) < 0.05 and np.max(np.abs(x[-8:])) < 0.01, name + ': not faded at the edges'
    REPORT.append((name, d, tp, cine.lufs_m(x), cine.lufs_s(x)))
    return x


def write_wav(path, x):
    """16-bit stereo wav with TPDF dither."""
    from scipy.io import wavfile
    rng = np.random.default_rng(0)
    y = cine.st(x) * 32767 + (rng.random(cine.st(x).shape) - rng.random(cine.st(x).shape))
    wavfile.write(path, SR, np.clip(np.round(y), -32768, 32767).astype(np.int16))


def mp3(name, x):
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
        write_wav(f.name, x)
        out = os.path.join(SND, name + '.mp3')
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f.name, '-c:a', 'libmp3lame', '-b:a', '160k',
                        '-map_metadata', '-1', out], check=True)
        os.unlink(f.name)
    return out


def main():
    os.makedirs(SND, exist_ok=True)
    for n, fn in {**CORE, **RESULTS}.items():
        mp3(n, check(n, fn())); print('core', n)
    for n, fn in CORE_WAV.items():
        write_wav(os.path.join(SND, n + '.wav'), check(n, fn())); print('core', n)
    missing, cache = [], {}
    for p in sorted(glob.glob(os.path.join(ROOT, 'assets', 'modes', '*', '*.wav'))):
        k = os.path.splitext(os.path.basename(p))[0]
        if k not in RECIPES:
            missing.append(p); continue
        if k not in cache:
            cache[k] = check('mode:' + k, RECIPES[k]())
        write_wav(p, cache[k]); print('mode', os.path.relpath(p, ROOT))
    print('\n%-22s %6s %7s %7s %7s' % ('sound', 'secs', 'dBTP', 'LUFS-M', 'LUFS-S'))
    for n, d, tp, M, S_ in REPORT:
        print('%-22s %6.2f %7.1f %7.1f %7.1f' % (n, d, tp, M, S_))
    have = {os.path.splitext(os.path.basename(p))[0] for p in glob.glob(os.path.join(samples.SRC, '*.ogg'))}
    unused = sorted(have - samples.USED)
    if unused:
        print('UNUSED SOURCES:', *unused)
    if missing:
        print('NO RECIPE:', *missing, sep='\n  ')


if __name__ == '__main__':
    main()
