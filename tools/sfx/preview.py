"""Build a listening preview of the generated set: every core sound in make_sfx.py order (board cues, results,
shared .wav effects) with 0.45 s gaps, then a handful of mode effects.

Usage (repo root, after make_sfx.py):  python3 tools/sfx/preview.py <out.mp3>
"""
import os, sys, glob, subprocess
sys.path.insert(0, os.path.dirname(__file__))
from core import CORE, CORE_WAV
from modes import RESULTS

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SND = os.path.join(ROOT, 'assets', 'sounds')
MODE_FX = ['gong', 'portal', 'warp', 'achievement', 'fanfare', 'bomb', 'kidnap']
GAP = 0.45


def main(out):
    files = [os.path.join(SND, n + '.mp3') for n in list(CORE) + list(RESULTS)]
    files += [os.path.join(SND, n + '.wav') for n in CORE_WAV]
    for n in MODE_FX:
        files.append(sorted(glob.glob(os.path.join(ROOT, 'assets', 'modes', '*', n + '.wav')))[0])
    args, chain = [], []
    for i, f in enumerate(files):
        args += ['-i', f]
        chain.append('[%d:a]aformat=sample_rates=44100:channel_layouts=stereo,apad=pad_dur=%.2f[a%d]' % (i, GAP, i))
    fc = ';'.join(chain) + ';' + ''.join('[a%d]' % i for i in range(len(files))) + 'concat=n=%d:v=0:a=1[o]' % len(files)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', *args, '-filter_complex', fc, '-map', '[o]', '-c:a', 'libmp3lame',
                    '-b:a', '192k', out], check=True)
    for f in files:
        print(os.path.relpath(f, ROOT))
    print('->', out)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'sfx_preview.mp3')
