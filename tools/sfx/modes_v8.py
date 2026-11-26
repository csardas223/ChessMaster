"""v8 (2026-11-26, Hark): subtle themed capture sounds for the families that only had a start.

Owner's ask (2026-11-26 5:18 PM ET): "more sfx to better suit the modes, no overly obnoxious sounds, but they must
suit the theme".

Rules for this batch (on top of the v5-v7 rules: CC0 sources from tools/sfx/sources only, nothing new added; no bells,
chimes, dings, glass pings, synth leads, chiptune or cartoon brass; true peak <= -1.5 dBTP):
- captures only (the event a player hears often but not every move), short (0.25-0.45 s), sitting 2-3 dB under
  the v7 family captures (FX_LUFS - 2.5), no tonal tails, no loops;
- each one says what happens in that family's mode: something blows up, a die rattles, a block clicks, a piece is
  swallowed by the fog, a duck snaps, a clock ticks, a rule breaks, a fighter is punched, a chip is collected.
Build: python3 tools/sfx/make_v8.py [name ...]  ->  assets/sounds/sets/<name>.mp3
Wire:  add the capture name to the family's fam() call in tools/sfx/wire_v7.py, run it (rewrites js/core/sound-sets.js).
"""
import numpy as np
from synth import SR, lp, hp, bp
from samples import S, pitch, cut
from cine import smix, widen, pan, thump, click, shelf, peq
from core import transient
from events import clip, contour, LP, HP, BP, drumhit, panmove
from modes import polish, FX_LUFS
from modes_v6 import gate_stutter, noise

CAP = FX_LUFS - 2.5   # under the v7 family captures (FX_LUFS), under the move sounds


def boom_capture():
    """explosives: a muffled, distant-sounding thump with a short spray of debris. Not a full explosion. ~0.45 s"""
    body = LP(clip('fs255111_boom', 0.4, -4), 900)
    deb = contour(LP(HP(clip('fs560510_debris_a', 0.4, 2, onset=False), 600), 5000), [(0, -30), (0.04, -6), (0.4, -40)])
    x = smix((0, body), (0, thump(110, 45, 0.2, 0.05), -4), (0.03, widen(deb, 0.7), -8))
    return polish(x, CAP, 0.4, 0.08, 0.3, 0, 0, None, max_len=0.46)


def dice_capture():
    """dice: a die rattles briefly in the hand and is knocked onto the felt. ~0.35 s"""
    rat = LP(HP(clip('k_dice_throw_1', 0.22, 2), 700), 9000)
    knock = smix((0, transient('k_wood_light_2', -2, 200, 9000, 6, -6, 0.08)), (0, thump(180, 90, 0.07, 0.02), -8))
    x = smix((0, rat, -3), (0.2, knock))
    return polish(x, CAP, 0.35, 0.05, 0.25, 0, 0, None, max_len=0.36)


def scifi_capture():
    """sci-fi / time: a short filtered whoosh that pulls the piece out, ending in a dry mechanical click. ~0.3 s"""
    sw = panmove(bp(cut(pitch(S('fs446010_backwoosh'), 4), 0.22, 0.06), 600, 6000), 0.4, -0.2)
    snap = smix((0, transient('k_metal_click', 3, 900, 11000, 6, -6, 0.04)), (0, click(0.004, 3000, 13000, 801), -10))
    x = smix((0, LP(sw, 5000), -4), (0.2, snap))
    return polish(x, CAP, 0.5, 0.06, 0.25, 0, 0, None, max_len=0.32)


def puzzle_capture():
    """puzzles / platformers: a soft woodblock knock, like a tile being cleared. ~0.25 s"""
    x = smix((0, transient('v_woodblock_pp', 0, 300, 9000, 5, -6, 0.12)), (0, thump(200, 120, 0.05, 0.02), -12))
    return polish(x, CAP - 1, 0.3, 0.06, 0.2, 0, 0, None, max_len=0.26)


def fish_capture():
    """fish bots: a small, soft splash as the piece goes under. ~0.35 s"""
    rng = np.random.default_rng(802)
    nz = rng.standard_normal(int(SR * 0.3))
    sp = BP(nz, 400, 4500) * np.exp(-np.arange(len(nz)) / SR / 0.06)
    tail = contour(LP(noise(0.3, 120, 1400, 803), 1200), [(0, -30), (0.05, -10), (0.3, -40)])
    x = smix((0, sp / (np.max(np.abs(sp)) + 1e-9)), (0, thump(130, 60, 0.12, 0.03), -8), (0.03, tail, -4))
    return polish(x, CAP - 1, 0.35, 0.08, 0.3, 0, 0, None, max_len=0.36)


def fog_capture():
    """fog / blindfold: the piece is swallowed by a puff of cold air with a dull, far-off tap under it. ~0.4 s"""
    puff = contour(LP(clip('fs146932_wind', 0.4, 3, onset=False), 2200), [(0, -30), (0.06, -4), (0.4, -40)])
    tap = LP(transient('k_wood_medium_0', -3, 150, 4000, 5, -6, 0.1), 2500)
    x = smix((0, widen(puff, 0.9)), (0.02, tap, -6))
    return polish(x, CAP - 1, 0.6, 0.12, 0.4, 0, 0, None, max_len=0.42)


def duck_capture():
    """duck chess: a quick, quiet beak snap with only the very start of a quack in it. ~0.25 s"""
    q = contour(HP(clip('fs418509_quack', 0.16, 1), 400), [(0, 0), (0.06, -4), (0.16, -40)])
    snap = transient('k_wood_light_3', 3, 500, 10000, 7, -8, 0.04)
    x = smix((0, snap), (0.01, q, -8))
    return polish(x, CAP - 2, 0.3, 0.05, 0.2, 0, 0, None, max_len=0.26)


def rush_capture():
    """bullet / speed: a sharp clock tick hit, like a chess-clock button slapped. ~0.22 s"""
    x = smix((0, transient('k_metal_click', 0, 700, 12000, 7, -8, 0.05)), (0, transient('k_wood_light_1', 1, 300, 8000, 6, -6, 0.06), -4),
             (0, click(0.003, 4000, 15000, 804), -10))
    return polish(x, CAP, 0.3, 0.04, 0.2, 0, 0, None, max_len=0.22)


def drawback_capture():
    """Drawback: a short dry crunch that breaks up for a moment, like a rule snapping. ~0.3 s"""
    cr = transient('k_chop', -3, 300, 8000, 6, -5, 0.1)
    st = contour(gate_stutter(BP(noise(0.22, 800, 6000, 805), 800, 6000), 30, 0.45, 0.2, 805, -40), [(0, -6), (0.22, -40)])
    x = smix((0, cr), (0.03, st, -10))
    return polish(x, CAP, 0.4, 0.05, 0.25, 0, 0, None, max_len=0.3)


def arena_capture():
    """arena / multiplayer: a body punch with a short crowd-less room. ~0.3 s"""
    x = smix((0, transient('k_punch_medium_0', -1, 150, 8000, 6, -4, 0.12)), (0, thump(150, 70, 0.1, 0.03), -6))
    return polish(x, CAP, 0.35, 0.1, 0.3, 0, 0, None, max_len=0.3)


def odds_capture():
    """odds / challenges: a couple of poker chips clacked together, like a bet being won. ~0.3 s"""
    x = smix((0, transient('k_chips_collide_2', 0, 500, 11000, 6, -5, 0.15)), (0.08, transient('k_chip_lay_1', 2, 600, 11000, 6, -6, 0.06), -6))
    return polish(x, CAP - 1, 0.35, 0.05, 0.25, 0, 0, None, max_len=0.3)


RECIPES = {
    'boom_capture': boom_capture, 'dice_capture': dice_capture, 'scifi_capture': scifi_capture,
    'puzzle_capture': puzzle_capture, 'fish_capture': fish_capture, 'fog_capture': fog_capture,
    'duck_capture': duck_capture, 'rush_capture': rush_capture, 'drawback_capture': drawback_capture,
    'arena_capture': arena_capture, 'odds_capture': odds_capture,
}
OUT = {n: 'assets/sounds/sets/%s.mp3' % n for n in RECIPES}
