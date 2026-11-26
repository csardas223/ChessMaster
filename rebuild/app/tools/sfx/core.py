"""Core board sounds (v4): modern cinematic / premium game-UI sound design.

Target palette (the user's reference): a filtered-noise riser sweeping up, a crisp transient hit, then a deep warm
sub boom (~48-55 Hz) with a soft low string-pad tail, energy mostly under 4 kHz, narrow-ish stereo, mastered.

Two scales:
- frequent cues (moves, capture, castle, check, premove, illegal, notify, ten seconds): 60-250 ms, a tight layered
  transient, a subtle tuned low thump, a tiny filtered air tail and a short bright room; no risers.
  Mastered to about -19 LUFS momentary-max (premove lighter), true peak <= -1.5 dBTP.
- events (game start / end, results): riser or reverse whoosh -> impact -> sub boom -> warm pad, 0.8-3 s,
  mastered to about -15 LUFS short-term max like the reference.
No bells, chimes, dings, glass, chiptune or brass: the only tonal content is the sub and low bowed-string pads
(VSCO 2 CE, CC0), which swell in rather than strike (tools/sfx/ring_check.py checks for struck rings).
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


def ui_hit(src='k_wood_light_2', semis=0.0, f0=150.0, f1=72.0, weight=0.0, bright=0.0, airy=0.0, d=0.16,
           tau=0.035, seed=3, wide=0.35):
    """the frequent-cue hit: crisp recorded transient + 3 ms snap + tuned low thump + tiny air tail + short room."""
    tr = transient(src, semis, 220.0, 13000.0, 5.0, -6.0, 0.1)
    snap = click(0.004, 3500, 15000, seed)
    th = thump(f0, f1, d, tau)
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


def rise(d=0.55, f1=16000.0, dark=False, seed=1):
    """the riser into an impact: synthesised filtered-noise sweep + a recorded reverse swell for texture,
    both ending exactly on the hit."""
    r = riser(d, 900.0, f1 if not dark else 4500.0, 2.0, -46.0, 0.6, 0.35, 0.0, seed)
    sw = S('fs877966_revswell', onset=False)
    sw = sw[np.argmax(np.abs(sw) > 0.01):]
    sw = sw[:int(np.argmax(np.abs(sw)) + SR * 0.01)]
    sw = sw[-int(SR * d):] if len(sw) > SR * d else sw
    sw = fade(sweep_lp(sw, 1800.0, f1 if not dark else 4000.0, 0.8, 3), min(0.25, d / 2), 0.004)
    out = smix((0, r), (d - len(sw) / SR, widen(sw, 0.6), -4))
    return out[:int(SR * d)]


def event(hit_at=0.6, riser_d=0.55, f1=16000.0, dark=False, weight=0.0, bright=0.0, boom=(66.0, 49.0, 0.14, 0.3),
          boom_db=-1.0, chord=None, chord_db=-10.0, chord_d=2.2, chord_kw=None, tail=(0.18, 1.5), seed=1, extra=(),
          shimmer_db=-20.0, dip=0.12):
    """riser -> (short dip) -> impact -> sub boom -> warm pad tail with a faint air shimmer, glued and plated
    (stereo, pre-master). The riser peaks `dip` s before the hit and eases off, like the reference."""
    parts = []
    if riser_d:
        r = rise(riser_d, f1, dark, seed)
        k = int(SR * dip)
        if k:
            r[-k:] = (r[-k:].T * np.linspace(1.0, 0.45, k) ** 1.5).T
        parts.append((hit_at - riser_d, r, -6))
    parts.append((hit_at, impact(weight, bright, dark, seed), -2))
    f0, f1b, gl, tau = boom
    parts.append((hit_at + 0.002, sub(f0, f1b, gl, max(1.2, tau * 6), tau, 1.05, 0.002, 200.0), boom_db))
    if chord:
        parts.append((hit_at + 0.01, pad(chord, chord_d, **(chord_kw or {})), chord_db))
    if shimmer_db is not None and not dark:
        sh = fade(widen(air(1.6, 11000 + 2000 * bright, 5000, 0.3, 4500, seed + 7, 1.0), 0.8), 0.003, 0.9)
        parts.append((hit_at + 0.005, sh, shimmer_db + 3 * bright))
    parts.extend(extra)
    x = smix(*parts)
    x = plate(x, tail[0], tail[1], 5500.0 if not dark else 2600.0, 0.015, 220.0, seed)
    x = mbcomp(x, thr=(-14.0, -22.0, -26.0), ratio=(1.6, 2.0, 2.0))
    return x


# ================================================================ the board set
def move_self():
    return master(ui_hit('k_wood_light_2', 0.0, 150, 74, 0.0, 0.0, 0.0, 0.15, seed=3), UI_LUFS)


def move_opponent():
    """same family, a touch lower, rounder and darker so the two sides are told apart."""
    return master(ui_hit('k_wood_light_4', -1.5, 130, 64, 0.8, -1.5, -1.0, 0.15, seed=4), UI_LUFS - 0.5)


def capture():
    """more weight: punch + wood transients layered, a short sub (90 -> 50 Hz) and a slightly bigger room."""
    tr = smix((0, transient('fs348243_punch', 0, 150, 9000, 6, -6, 0.12)), (0.0, transient('k_chips_collide_2', -3, 600), -6),
              (0.002, transient('k_wood_medium_2', -1, 250), -3))
    s_ = sub(95, 52, 0.05, 0.26, 0.07, 2.0, 0.0008, 700)
    x = smix((0, widen(tr, 0.4)), (0, click(0.005, 3000, 14000, 8), -13), (0.001, s_, -2),
             (0.006, air(0.14, 7000, 2500, 0.05, 1500, 8), -19))
    x = room(peq(x, 110, 2.0, 0.9), 0.12, 0.38, 8)
    return master(trim(x, 0.32), UI_LUFS + 0.5)


def castle():
    """two quick placements (king, then rook) joined by a tiny air swish."""
    sw = riser(0.09, 1500, 7000, 1.5, -30, 0.7, 0.5, 0, 9)
    x = smix((0, ui_hit('k_wood_light_2', -0.5, 150, 76, 0.3, 0, -2, 0.12, seed=5)), (0.045, sw, -22),
             (0.125, ui_hit('k_wood_light_0', 0.9, 160, 80, 0.0, 0.3, 0, 0.14, seed=6), -0.5))
    return master(x, UI_LUFS)


def move_check():
    """tense short impact: darker hit, a sub punch at 58 Hz, a short low-mid noise swell cut off sharply."""
    tr = smix((0, transient('fs348243_punch', -1, 150, 7000, 7, -5, 0.12)), (0.001, transient('k_wood_medium_2', 0.5, 300), -4))
    s_ = sub(110, 56, 0.04, 0.3, 0.09, 2.2, 0.0008, 600)
    swell = fade(lp(riser(0.06, 400, 2500, 1.2, -18, 0.5, 0.5, 0, 12), 3000), 0.01, 0.01)
    tail = air(0.2, 2400, 900, 0.07, 400, 12)
    x = smix((0, swell, -18), (0.055, widen(tr, 0.4)), (0.055, click(0.005, 2500, 12000, 12), -12),
             (0.056, s_, -1.5), (0.06, tail, -17))
    x = room(shelf(x, 7000, -1.5, 'high'), 0.11, 0.35, 12)
    return master(trim(x, 0.34), UI_LUFS + 0.5)


def promote():
    """a quick upward whoosh into a bright hit with a little sparkle of air (no tones)."""
    up = riser(0.17, 1200, 15000, 1.6, -36, 0.8, 0.4, 0, 13)
    hit_ = ui_hit('k_wood_light_0', 1.5, 170, 80, 0.5, 1.5, 2.0, 0.18, seed=13, wide=0.5)
    spark = air(0.16, 12000, 6000, 0.06, 5000, 14)
    x = smix((0, up, -9), (0.165, hit_), (0.168, spark, -17))
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
    """two clean soft taps, a little air after: someone's here."""
    x = smix((0, ui_hit('k_wood_medium_0', 2.0, 170, 90, -1, 0.5, 0, 0.1, seed=18)),
             (0.105, ui_hit('k_wood_medium_0', 0.5, 160, 82, -1, 0.0, 1, 0.13, seed=19), -1.5))
    return master(x, UI_LUFS - 0.5)


def _tick(semis=3.0, seed=20, lo=1200):
    tr = transient('v_woodblock_pp', semis, lo, 11000, 5, -10, 0.05)
    return smix((0, widen(tr, 0.25)), (0, click(0.003, 4000, 15000, seed), -15))


def tenseconds():
    """clock pressure: tick-TOCK with a low pulse under the tock (~0.3 s)."""
    x = smix((0, _tick(4, 20)), (0.13, _tick(-1, 21, 700), -0.5), (0.131, thump(120, 60, 0.18, 0.06, 2.0), -5),
             (0.135, air(0.12, 3000, 1200, 0.05, 600, 21), -22))
    return master(room(x, 0.08, 0.3, 20), UI_LUFS - 1.0)


def tick():
    return master(room(_tick(5, 22), 0.06, 0.2, 22), UI_LUFS - 5.0)


# ================================================================ events
def game_start():
    """the reference treatment: 0.55 s riser to 16 kHz -> crisp hit -> 50 Hz sub boom -> warm Cmaj9 string pad."""
    x = event(0.6, 0.55, 16000, False, 0.0, 0.5, (55.0, 48.5, 0.1, 0.32), -1.0,
              [48, 55, 59, 62, 64], -11.0, 2.2, dict(attack=0.2, lpf=2900, close=1400, gains=[0, -2, -4, -4, -5]),
              (0.18, 1.5), 31)
    return master(x, EV_LUFS, 's', max_len=2.9)


def game_end():
    """the board closes: a short reverse whoosh into a softer, darker hit, a 46 Hz boom and an open-fifth pad
    that closes down."""
    x = event(0.38, 0.36, 7000, False, 0.5, -1.0, (60.0, 46.0, 0.16, 0.55), -1.0,
              [43, 50, 55, 62], -6.0, 1.8, dict(attack=0.12, lpf=1800, close=500, gains=[0, -2, -4, -6]),
              (0.2, 1.4), 32)
    return master(x, EV_LUFS - 1.0, 's', max_len=2.3)


CORE = {
    'move-self': move_self, 'move-opponent': move_opponent, 'capture': capture, 'castle': castle,
    'move-check': move_check, 'promote': promote, 'game-start': game_start, 'game-end': game_end,
    'illegal': illegal, 'notify': notify, 'premove': premove, 'tenseconds': tenseconds,
}


def jumpscare():
    """still a scare: a real scream over a big cinematic hit, a short reverse rush into it and a sub boom."""
    scream = shelf(lp(cut(S('fs35716_scream'), 1.4, 0.5), 7000), 3000, -3, 'high')
    rush = rise(0.18, 12000, False, 41)
    x = smix((0, rush, -6), (0.18, widen(scream, 0.4)), (0.18, impact(1.0, 0.5, False, 41), -3),
             (0.18, sub(80, 45, 0.1, 1.3, 0.4), -2))
    x = mbcomp(plate(x, 0.14, 1.1, 5000, 0.01, 220, 41))
    return master(x, EV_LUFS + 1.0, 's', max_len=1.6)


def explosion(size=1.0):
    """recorded explosions + cinematic boom layered over a sub drop, rounded off at the top."""
    d = 1.8 * size
    a = cut(S('fs235968_explosion'), d, d * 0.55)
    b = cut(S('fs189779_boom'), d, d * 0.55)
    x = smix((0, widen(lp(a, 8000), 0.6)), (0, lp(b, 2500), -2), (0, impact(1.5, 0.0, False, 42), -6),
             (0.003, sub(75, 38, 0.25, d, 0.5 * size), -1))
    x = mbcomp(plate(shelf(x, 7000, -2, 'high'), 0.12, 1.3, 4500, 0.012, 200, 42))
    return master(sat(x / (np.abs(x).max() + 1e-9), 1.3), EV_LUFS + 1.0, 's')


CORE_WAV = {'tick': tick, 'jumpscare': jumpscare, 'explosion': explosion}
