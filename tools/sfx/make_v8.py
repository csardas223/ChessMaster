"""Build the v8 sounds (tools/sfx/modes_v8.py): the shared start's extra takes and the family / mode sets.
Usage (repo root): python3 tools/sfx/make_v7.py [name ...]   (no names: all; runs in parallel)
Each recipe goes through make_sfx.check (true peak, DC, edge fades) and is written as 160 kbps mp3 to modes_v8.OUT."""
import os, sys, subprocess, tempfile
from concurrent.futures import ProcessPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def build(n):
    import make_sfx as M
    from modes_v8 import RECIPES, OUT
    x = M.check('v8:' + n, RECIPES[n]())
    out = os.path.join(M.ROOT, OUT[n])
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
        M.write_wav(f.name, x)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f.name, '-c:a', 'libmp3lame', '-b:a', '160k', '-map_metadata', '-1', out], check=True)
    os.unlink(f.name)
    return M.REPORT[-1]


if __name__ == '__main__':
    from modes_v8 import RECIPES
    names = sys.argv[1:] or list(RECIPES)
    with ProcessPoolExecutor(max_workers=os.cpu_count() or 4) as ex:
        rows = list(ex.map(build, names))
    print('%-26s %6s %7s %7s %7s' % ('sound', 'secs', 'dBTP', 'LUFS-M', 'LUFS-S'))
    for n, d_, tp, m, s_ in rows:
        print('%-26s %6.2f %7.1f %7.1f %7.1f' % (n, d_, tp, m, s_))
