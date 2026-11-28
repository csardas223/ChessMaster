"""SCP-4000 (the rabbit that steals identities) sounds for "Chess, But SCP-4000 Steals Your Identity" (b2QHgQAQTp0,
2026-11-28).

Three events, matching the site's own sequence (iwantcheckmate.com/challenges/scp-4000): the rabbit hops to a new
square (a soft padded landing on felt), the rabbit and its neighbour tremble for one second before the swap (a low,
uneasy sub swell with a breath of air rising under it, no tone on top), and the two trade places (a cinematic
reverse-whoosh that lands on a soft low hit). Same rules as v6 (modes_v6.py): CC0 sources from tools/sfx/sources only
(Kenney + Freesound CC0, provenance in tools/sfx/sources.md), no bells, chimes, dings, glass, synth leads, chiptune or
cartoon brass; true peak <= -1.5 dBTP through make_sfx.check.
Regenerate (repo root): python3 tools/sfx/modes_scp4000.py   -> assets/modes/b2QHgQAQTp0/s4000_*.wav
Nobody has listened to these yet (agents can't): the owner should judge them.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from samples import S, cut
from cine import smix, widen, pan, riser, subdrop, thump, sweep_lp
from core import transient, impact
from events import contour, HP, BP, LP
from modes import polish, FX_LUFS


def s4000_hop():
    """the rabbit hops one move: a padded landing (soft footstep on carpet + a felt thump), short and dry."""
    pad = smix((0, transient('k_footstep_carpet_2', -3, 160, 7000, 5, -6, 0.12)), (0.006, transient('k_soft_medium_1', -2, 120, 5000, 4, -6, 0.1), -4))
    body = thump(120.0, 70.0, 0.11, 0.03, 1.4)
    x = smix((0, pad), (0, HP(body, 50), -9))
    return polish(x, FX_LUFS - 7, 0.3, 0.05, 0.25, 0, 0, None, max_len=0.3)


def s4000_tremor():
    """one second of unease before the swap: a low sub swell with filtered air rising under it, then it cuts."""
    low = contour(subdrop(46.0, 38.0, 1.05, 2.0, 1.3), [(0, -40), (0.55, -10), (0.95, -6), (1.05, -50)])
    breath = contour(BP(riser(1.0, 300.0, 3200.0, 2.0, -46.0, 0.7, 0.4, 0.0, 4000), 200, 5000), [(0, -40), (0.8, -12), (1.0, -50)])
    rumble = contour(LP(cut(S('fs462162_rubble'), 1.0, 0.1), 900), [(0, -40), (0.5, -18), (1.0, -50)])
    x = smix((0, low), (0, widen(breath, 0.7), -8), (0, rumble, -12))
    return polish(x, FX_LUFS - 6, 0.45, 0.06, 0.3, 0, 0, None, max_len=1.1)


def s4000_swap():
    """the two trade places: a reverse whoosh sucking in, landing on a soft low hit with a short room tail."""
    suck = BP(cut(S('fs446010_backwoosh'), 0.32, 0.04), 250, 9000)
    hit = smix((0, transient('k_soft_heavy_0', -3, 110, 8000, 6, -5, 0.14)), (0, impact(0.0, 0.0, True, 4000, 0.5), -6))
    x = smix((0, widen(suck, 0.6), -2), (0.3, hit))
    return polish(x, FX_LUFS - 3, 0.45, 0.09, 0.35, 0, 0, (90, 50, 0.01, 0.08, 0.05), -12, max_len=0.85)


RECIPES = {'s4000_hop': s4000_hop, 's4000_tremor': s4000_tremor, 's4000_swap': s4000_swap}
HOME = {'b2QHgQAQTp0': ['s4000_hop', 's4000_tremor', 's4000_swap']}

if __name__ == '__main__':
    import make_sfx as M
    for mid, names in HOME.items():
        d = os.path.join(M.ROOT, 'assets', 'modes', mid)
        os.makedirs(d, exist_ok=True)
        for n in names:
            M.write_wav(os.path.join(d, n + '.wav'), M.check('mode:' + n, RECIPES[n]()))
            print('mode', mid + '/' + n + '.wav', flush=True)
    for n, d_, tp, m, s_ in M.REPORT:
        print('%-22s %6.2f %7.1f %7.1f %7.1f' % (n, d_, tp, m, s_))
