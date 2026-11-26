"""Regenerate every Chess Master sound effect. Run from the repo root: python3 tools/sfx/make_sfx.py"""
import os, sys, glob, subprocess, tempfile
sys.path.insert(0, os.path.dirname(__file__))
from synth import write_wav
from core import CORE, CORE_WAV
from modes import RECIPES, RESULTS

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SND = os.path.join(ROOT, 'assets', 'sounds')


def mp3(name, x):
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
        write_wav(f.name, x)
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f.name, '-c:a', 'libmp3lame', '-b:a', '160k', os.path.join(SND, name + '.mp3')], check=True)
        os.unlink(f.name)


def main():
    os.makedirs(SND, exist_ok=True)
    for n, fn in {**CORE, **RESULTS}.items():
        mp3(n, fn()); print('core', n)
    for n, fn in CORE_WAV.items():
        write_wav(os.path.join(SND, n + '.wav'), fn()); print('core', n)
    missing = []
    for p in sorted(glob.glob(os.path.join(ROOT, 'assets', 'modes', '*', '*.wav'))):
        k = os.path.splitext(os.path.basename(p))[0]
        if k not in RECIPES:
            missing.append(p); continue
        write_wav(p, RECIPES[k]()); print('mode', os.path.relpath(p, ROOT))
    if missing:
        print('NO RECIPE:', *missing, sep='\n  ')


if __name__ == '__main__':
    main()
