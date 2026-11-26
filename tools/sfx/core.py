"""Core board sounds (v5): modern cinematic / premium game-UI sound design.

- frequent cues (moves, capture, castle, check, premove, illegal, notify, ten seconds): 60-350 ms, a tight layered
  recorded transient with its own low body per cue (a tuned thump for your move, felt for the opponent's, a damped
  timpani and a knocked-away piece for a capture, a frame drum and a tense low string dyad for check, hand drums
  for notify, a log drum under the clock), a tiny air tail and a short bright room. No risers.
  Mastered to about -19 LUFS momentary-max (premove lighter), true peak <= -1.5 dBTP.
- events (game start / end, results, the shared jumpscare / explosion and the mode big moments) live in
  events.py: each one is its own design (v4's shared riser -> hit -> sub boom -> pad template is retired),
  mastered to about -15 LUFS short-term max.
No bells, chimes, dings, glass, chiptune or brass (tools/sfx/ring_check.py checks for struck rings).
"""
import numpy as np
from synth import SR, lp, hp, bp
from samples import S, pitch, glide, rev, cut
import cine as C
from cine import (st, smix, widen, pan, fade, trim, riser, air, sub, subdrop, thump, click, shape, mbcomp, peq,
                  shelf, sat, sweep_lp, plate, room, master)

UI_LUFS = -19.0      # frequent cues, momentary max
EV_LUFS = -15.0      # events, short-term max (the reference measures -14.9)


# ================================================================ instruments
STRINGS = {
    'cello': {50: 'vs_cello_D3', 53: 'vs_cello_F3', 57: 'vs_cello_A3', 60: 'vs_cello_C4', 64: 'vs_cello_E4',
              67: 'vs_cello_G4', 71: 'vs_cello_B4'},
    'viola': {65: 'vs_viola_F4', 69: 'vs_viola_A4', 72: 'vs_viola_C5'},
    'violin': {72: 'vs_violin_C5', 76: 'vs_violin_E5'},
}


def bowed(m, d, section='cello', semis_glide=0.0):
    """one bowed string-section note at midi m (nearest VSCO sample, varispeed), optional downward glide."""
    tab = STRINGS[section]
    k = min(tab, key=lambda n: abs(n - m))
    x = pitch(S(tab[k]), m - k)
    if semis_glide:
        x = glide(x, 0.0, semis_glide)
    return cut(x, d, min(0.6, d / 3))


def pad(notes, d=2.2, attack=0.18, lpf=2400.0, close=None, glide_=0.0, width=0.8, gains=None, section='cello'):
    """warm string pad: each note doubled +-6 cents and spread L/R (ensemble chorus), low-passed (optionally
    closing over time), swelled in with `attack` so it never strikes like a bell."""
    parts = []
    for i, m in enumerate(notes):
        sec = section if isinstance(section, str) else section[i]
        gdb = gains[i] if gains else 0.0
        a = bowed(m + 0.06, d, sec, glide_)
        b = bowed(m - 0.06, d, sec, glide_)
        p = (i - (len(notes) - 1) / 2) / max(1, len(notes)) * width
        parts.append((0.0, pan(a, -0.35 * width + p), gdb - 3))
        parts.append((0.009, pan(b, 0.35 * width + p), gdb - 3))
    x = smix(*parts)
    x = np.stack([lp(x[:, c], lpf, 2) for c in range(2)], 1)
    if close:
        x = sweep_lp(x, lpf, close, 0.7)
    x = peq(x, 280, -2.0, 0.8)            # keep the low-mids from clouding the sub
    x = peq(x, 1300, -3.5, 0.7)           # and the bow rasp from poking out
    return fade(x, attack, min(0.7, d / 2.5))


# recorded pipe organ (VCSL, quiet manual) kept for the hymn music bed
HZ = {'organ': {}}
_N = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
for _n in ('C2', 'D#2', 'F#2', 'C3', 'D#3', 'F#3', 'A3'):   # VCSL organ names sound an octave up: name C2 -> C3
    HZ['organ']['v_organ_' + _n] = 440.0 * 2 ** ((_N.index(_n[:-1]) + 12 * (int(_n[-1]) + 1) + 12 - 69) / 12)


def inst(kind, m, d=None):
    f = 440.0 * 2 ** ((m - 69) / 12)
    name = min(HZ[kind], key=lambda k: abs(np.log2(HZ[kind][k] / f)))
    x = pitch(S(name), 12 * np.log2(f / HZ[kind][name]))
    return cut(x, d, min(0.25, d / 3)) if d else x


def inst_organ(m, d=None):
    return inst('organ', m, d)



# ================================================================ building blocks
def transient(src='k_wood_light_2', semis=0.0, hp_=350.0, lp_=12000.0, att=6.0, sus=-8.0, d=0.09):
    """a recorded contact cleaned into a tight, crisp transient (high-passed, attack up, sustain down)."""
    x = pitch(S(src), semis)
    x = lp(hp(x, hp_, 2), lp_, 2)
    x = shape(x, att, sus)
    return trim(x, d)


def body(kind, f0=150.0, f1=72.0, d=0.16, tau=0.035):
    """the low body under a cue: 'sine' a tuned thump, 'felt' a padded footfall, 'skin' a frame drum,
    'timp' a damped timpani, 'log' a log drum; each low-passed so it sits under the transient."""
    if kind == 'sine':
        return thump(f0, f1, d, tau)
    src, semis, lpf = {'felt': ('k_footstep_carpet_0', -4, 700), 'skin': ('v_framedrum_muted', -2, 900),
                       'timp': ('vs_timp_hi', 0, 600), 'log': ('v_logdrum', -5, 700)}[kind]
    x = lp(cut(pitch(S(src), semis), d, d * 0.6), lpf, 2)
    x = shape(x, 3.0, -4.0)
    return x / (np.max(np.abs(x)) + 1e-12)


def ui_hit(src='k_wood_light_2', semis=0.0, f0=150.0, f1=72.0, weight=0.0, bright=0.0, airy=0.0, d=0.16,
           tau=0.035, seed=3, wide=0.35, low='sine'):
    """the frequent-cue hit: crisp recorded transient + 3 ms snap + a low body (`low`, see body()) + tiny air
    tail + short room."""
    tr = transient(src, semis, 220.0, 13000.0, 5.0, -6.0, 0.1)
    snap = click(0.004, 3500, 15000, seed)
    th = body(low, f0, f1, d, tau)
    tail = air(min(0.12, d), 8000 + 2000 * bright, 3000, 0.035, 1800, seed)
    x = smix((0, widen(tr, wide)), (0, snap, -14 + bright * 2), (0.001, th, -10 + weight), (0.004, tail, -21 + airy))
    x = shelf(x, 9000, -1.5 + bright, 'high')
    x = peq(x, 3000, 1.5 + bright * 0.5, 0.9)
    x = room(x, 0.09, 0.28, seed)
    return trim(x, d + 0.12)


def impact(weight=0.0, bright=0.0, dark=False, seed=2, d=1.3):
    """the cinematic hit: HF snap + recorded big impact + low impact body + timpani, all tightened.
    (the sub boom is added separately so each event can tune it)"""
    snap = click(0.006, 2500 if not dark else 1200, 16000 if not dark else 6000, seed)
    big = lp(cut(S('fs430977_impact'), d, d * 0.6), 9000 if not dark else 3500)
    low = lp(cut(S('fs408141_lowimpact'), d, d * 0.6), 900)
    tim = lp(cut(S('vs_timpani_lo'), d, d * 0.6), 700)
    punch = hp(cut(S('fs348243_punch'), 0.2, 0.1), 120)
    x = smix((0, widen(shape(big, 4.0, -1.0), 0.45)), (0, low, -9 + weight), (0, tim, -12 + weight),
             (0, punch, -12 + bright), (0, snap, -11 + 2 * bright))
    x = C.lr4(x, 105.0 - 25.0 * max(0.0, weight), 'high')   # leave the lows to the tuned sub boom
    x = peq(x, 1800, -4.0, 0.7)             # scoop the boxy mids, like the reference
    x = shelf(x, 6000, -1 + 2 * bright - (6 if dark else 0), 'high')
    return x


# ================================================================ the board set
def move_self():
    return master(ui_hit('k_wood_light_2', 0.0, 150, 74, 0.0, 0.0, 0.0, 0.15, seed=3), UI_LUFS)


def move_opponent():
    """same family, a touch lower, rounder and darker, on a felt body instead of the tuned thump."""
    return master(ui_hit('k_wood_light_4', -1.5, 130, 64, 1.5, -1.5, -1.0, 0.15, seed=4, low='felt'), UI_LUFS - 0.5)


def capture():
    """a take: a heavier two-part hit, the capturing piece (punch, heavy wood, clay chips) on a damped timpani
    body, then the captured piece knocked away a beat later off to one side."""
    tr = smix((0, transient('fs348243_punch', 0, 150, 9000, 6, -6, 0.12)), (0.0, transient('k_chips_collide_2', -3, 600), -6),
              (0.002, transient('k_wood_heavy_3', 1, 200, 11000, 6, -4, 0.16), -2))
    knock = pan(transient('k_chip_lay_1', 3, 900, 14000, 5, -8, 0.06), 0.55)
    x = smix((0, widen(tr, 0.4)), (0, click(0.005, 3000, 14000, 8), -13), (0.001, body('timp', d=0.3), -3),
             (0.045, knock, -9), (0.05, air(0.14, 7000, 2500, 0.05, 1500, 8), -19))
    x = room(peq(x, 120, 2.0, 0.9), 0.13, 0.4, 8)
    return master(trim(x, 0.36), UI_LUFS + 0.5)


def castle():
    """two quick placements (king, then rook) with the rook sliding across the felt between them."""
    slide = hp(lp(cut(S('k_card_shove_2'), 0.14, 0.06), 6000), 400)
    x = smix((0, ui_hit('k_wood_light_2', -0.5, 150, 76, 0.3, 0, -2, 0.12, seed=5)), (0.03, pan(slide, 0.2), -14),
             (0.13, ui_hit('k_wood_light_0', 0.9, 0, 0, 0.5, 0.3, 0, 0.14, seed=6, low='skin'), -0.5))
    return master(x, UI_LUFS)


def move_check():
    """tension: a dark frame-drum and punch hit with a short, tightly bowed low string dyad a semitone apart
    (C#3 + D3) cut off sharply, so it reads as a threat and never as a move."""
    tr = smix((0, transient('fs348243_punch', -1, 150, 7000, 7, -5, 0.12)), (0.001, transient('k_wood_medium_2', 0.5, 300), -5))
    dyad = pad([49, 50], 0.26, attack=0.012, lpf=2600, width=0.6)
    dyad = shape(dyad, 5.0, -2.0)
    x = smix((0, widen(tr, 0.4)), (0, click(0.005, 2500, 12000, 12), -12), (0.001, body('skin', d=0.3), -2),
             (0.004, dyad, -7), (0.01, air(0.2, 2400, 900, 0.07, 400, 12), -18))
    x = room(shelf(x, 7000, -1.5, 'high'), 0.11, 0.35, 12)
    return master(trim(x, 0.34), UI_LUFS + 0.5)


def promote():
    """the piece placed with a bright hit, then lifted: a little upward flourish of air and clay chips after it."""
    hit_ = ui_hit('k_wood_light_0', 1.5, 170, 80, 0.5, 1.5, 2.0, 0.18, seed=13, wide=0.5, low='skin')
    lift = widen(air(0.24, 4000, 13000, 0.08, 2500, 14, 0.9), 0.8)
    chips = hp(cut(pitch(S('k_chips_stack_2'), 5), 0.2, 0.1), 2500)
    x = smix((0, hit_), (0.05, lift, -13), (0.07, widen(chips, 0.6), -16))
    x = plate(x, 0.08, 0.6, 7000, 0.01, 300, 13)
    return master(trim(x, 0.5), UI_LUFS + 0.5)


def premove():
    """a very light, high, tight tick."""
    tr = transient('k_chip_lay_3', 4, 900, 14000, 4, -10, 0.05)
    x = smix((0, widen(tr, 0.3)), (0, click(0.003, 5000, 16000, 15), -14), (0, thump(220, 140, 0.05, 0.015), -14))
    return master(room(x, 0.06, 0.2, 15), UI_LUFS - 3.5)


def illegal():
    """'not there': two muffled low thumps, the second lower and softer, no high end."""
    def one(semi, f0, f1, seed):
        tr = lp(transient('v_framedrum_muted', semi, 120, 2500, 4, -6, 0.12), 2200)
        return smix((0, tr), (0.001, thump(f0, f1, 0.14, 0.05, 2.0), -4), (0, click(0.004, 800, 3500, seed), -18))
    x = smix((0, one(0, 140, 82, 16)), (0.1, one(-2, 120, 66, 17), -3))
    return master(room(x, 0.07, 0.25, 16), UI_LUFS - 1.0)


def notify():
    """two clean soft hand-drum taps, a little air after: someone's here."""
    def tap(semis, seed):
        tr = transient('v_handdrum', semis, 180, 9000, 5, -6, 0.13)
        return smix((0, widen(tr, 0.3)), (0, click(0.003, 4000, 14000, seed), -16))
    x = smix((0, tap(3, 18)), (0.105, tap(1, 19), -1.5), (0.11, air(0.12, 9000, 4000, 0.04, 3000, 19), -22))
    return master(room(x, 0.08, 0.28, 18), UI_LUFS - 0.5)


def _tick(semis=3.0, seed=20, lo=1200):
    tr = transient('v_woodblock_pp', semis, lo, 11000, 5, -10, 0.05)
    return smix((0, widen(tr, 0.25)), (0, click(0.003, 4000, 15000, seed), -15))


def tenseconds():
    """clock pressure: tick-TOCK with a low log-drum pulse under the tock (~0.3 s)."""
    x = smix((0, _tick(4, 20)), (0.13, _tick(-1, 21, 700), -0.5), (0.131, body('log', d=0.2), -6),
             (0.135, air(0.12, 3000, 1200, 0.05, 600, 21), -22))
    return master(room(x, 0.08, 0.3, 20), UI_LUFS - 1.0)


def tick():
    return master(room(_tick(5, 22), 0.06, 0.2, 22), UI_LUFS - 5.0)


# ================================================================ events (designed one by one in events.py)
def game_start():
    import events
    return events.game_start()


def game_end():
    import events
    return events.game_end()


def jumpscare():
    import events
    return events.jumpscare()


def explosion():
    import events
    return events.explosion('a')


CORE = {
    'move-self': move_self, 'move-opponent': move_opponent, 'capture': capture, 'castle': castle,
    'move-check': move_check, 'promote': promote, 'game-start': game_start, 'game-end': game_end,
    'illegal': illegal, 'notify': notify, 'premove': premove, 'tenseconds': tenseconds,
}
CORE_WAV = {'tick': tick, 'jumpscare': jumpscare, 'explosion': explosion}
