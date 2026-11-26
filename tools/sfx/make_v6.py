"""Regenerate only the v6 per-mode sounds (fast; the full make_sfx.py run takes > 2 min).
Usage (repo root): python3 tools/sfx/make_v6.py [name ...]   (no names: all of modes_v6.HOME)
Writes assets/modes/<id>/<name>.wav through make_sfx.check (true peak, DC, edge fades) and prints the level report."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_sfx as M
from modes_v6 import RECIPES, HOME

want = set(sys.argv[1:])
for mid, names in HOME.items():
    for n in names:
        if want and n not in want:
            continue
        d = os.path.join(M.ROOT, 'assets', 'modes', mid)
        os.makedirs(d, exist_ok=True)
        M.write_wav(os.path.join(d, n + '.wav'), M.check('mode:' + n, RECIPES[n]()))
        print('mode', mid + '/' + n + '.wav', flush=True)
print('\n%-22s %6s %7s %7s %7s' % ('sound', 'secs', 'dBTP', 'LUFS-M', 'LUFS-S'))
for n, d_, tp, m, s_ in M.REPORT:
    print('%-22s %6.2f %7.1f %7.1f %7.1f' % (n, d_, tp, m, s_))
