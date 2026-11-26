"""Regenerate every Chess Master sound effect. Run from the repo root: python3 tools/sfx/make_sfx.py

Built from short CC0 recordings in tools/sfx/sources/ (provenance in tools/sfx/sources.md), processed here
(pitch, EQ, layering, soft saturation, small rooms) and mastered to a common loudness with peaks <= -6 dBFS.
Needs numpy, scipy and ffmpeg (decodes the .ogg sources, encodes the .mp3 core set).
"""
import os, sys, glob, subprocess, tempfile
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
from synth import write_wav, SR
import samples
from core import CORE, CORE_WAV
from modes import RECIPES, RESULTS

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SND = os.path.join(ROOT, 'assets', 'sounds')
REPORT = []


def check(name, x):
    x = np.asarray(x, float)
    assert np.all(np.isfinite(x)), name + ': NaN/inf'
    pk = float(np.max(np.abs(x)))
    assert pk <= samples.CEIL + 1e-6, '%s: peak %.3f over ceiling' % (name, pk)
    d = len(x) / SR
    assert 0.03 < d < 30, '%s: odd duration %.2fs' % (name, d)
    REPORT.append((name, d, 20 * np.log10(pk + 1e-12), samples.loudness(x)))
    return x


def mp3(name, x):
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
        write_wav(f.name, x)
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f.name, '-c:a', 'libmp3lame', '-b:a', '160k',
                        os.path.join(SND, name + '.mp3')], check=True)
        os.unlink(f.name)


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
    print('\n%-22s %6s %7s %7s' % ('sound', 'secs', 'peakdB', 'loud'))
    for n, d, pk, L in REPORT:
        print('%-22s %6.2f %7.1f %7.1f' % (n, d, pk, L))
    have = {os.path.splitext(os.path.basename(p))[0] for p in glob.glob(os.path.join(samples.SRC, '*.ogg'))}
    unused = sorted(have - samples.USED)
    if unused:
        print('UNUSED SOURCES:', *unused)
    if missing:
        print('NO RECIPE:', *missing, sep='\n  ')


if __name__ == '__main__':
    main()
