"""SCP-956 (the Pinata) sounds for "Chess, But SCP-956 Is After the Children" (agJbUnr6PCQ, 2026-11-27).

Two events: a hidden pinata shows itself (a dry rustle of crepe paper), and it bonks a pawn with its bat (a wooden
bat hit with a paper burst and a short low body). Same rules as v6 (modes_v6.py): CC0 sources from tools/sfx/sources
only (Kenney + Freesound CC0, provenance in tools/sfx/sources.md), no bells, chimes, dings, glass, synth leads,
chiptune or cartoon brass; true peak <= -1.5 dBTP through make_sfx.check.
Regenerate (repo root): python3 tools/sfx/modes_scp956.py   -> assets/modes/agJbUnr6PCQ/pinata_*.wav
Nobody has listened to these yet (agents can't): the owner should judge them.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from samples import S, cut
from cine import smix, widen, pan, click
from core import transient, impact
from events import contour, HP, BP
from modes import polish, FX_LUFS


def pinata_reveal():
    """the pinata shows itself on its square: a quick, dry rustle of crepe paper with a soft air push (no tone)."""
    rustle = smix((0, HP(cut(S('k_card_fan_1'), 0.22, 0.08), 900)), (0.03, HP(cut(S('k_cloth_3'), 0.2, 0.08), 700), -5))
    air = BP(cut(S('fs60027_swosh'), 0.25, 0.1), 500, 7000)
    x = smix((0, widen(rustle, 0.6)), (0, contour(air, [(0, -30), (0.08, -10), (0.25, -40)]), -6))
    return polish(x, FX_LUFS - 6, 0.5, 0.06, 0.3, 0, 0, None, max_len=0.32)


def pinata_bonk():
    """the bat hits a pawn: a hard wooden crack, a burst of paper and a short low thump under it."""
    bat = smix((0, transient('k_wood_heavy_1', 1, 250, 12000, 8, -6, 0.14)), (0, transient('k_punch_medium_0', -2, 120, 9000, 6, -4, 0.1), -5),
               (0, click(0.004, 2200, 13000, 956), -12))
    paper = HP(cut(S('k_book_flip_2'), 0.3, 0.12), 1400)
    body = impact(0.0, 0.2, False, 956, 0.4)
    x = smix((0, bat), (0.015, pan(widen(paper, 0.7), 0.15), -7), (0, HP(body, 90), -12))
    return polish(x, FX_LUFS - 2, 0.4, 0.07, 0.3, 0, 0, (120, 70, 0.02, 0.07, 0.03), -14, max_len=0.5)


RECIPES = {'pinata_reveal': pinata_reveal, 'pinata_bonk': pinata_bonk}
HOME = {'agJbUnr6PCQ': ['pinata_reveal', 'pinata_bonk']}

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
