"""Core board sounds, built from recorded CC0 sources (tools/sfx/sources, see sources.md).

Aesthetic: close-mic, tactile, soft. A weighted wooden piece set down on a felt-lined board,
felt-piano / vibraphone / glass chimes for the UI, short tails, no harsh transients.
"""
import numpy as np
from synth import SR, lp, hp, bp, mix, at
from samples import (S, g, pitch, glide, rev, cut, fade_in, fade_out, soften, peq, shelf, warm, room, hall, lay,
                     master)

# measured sounding fundamentals (Hz) of the pitched VCSL clips
HZ = {
    'piano': {'v_piano_C2': 130.8, 'v_piano_C3': 261.8, 'v_piano_G3': 392.4, 'v_piano_C4': 523.3, 'v_piano_G4': 782.0,
              'v_piano_C5': 1047.0},
    'vibes': {'v_vibes_D4': 587.0, 'v_vibes_A4': 880.0, 'v_vibes_C5': 1046.0, 'v_vibes_E5': 1319.0},
    'kalimba': {'v_kalimba_D#4': 627.0, 'v_kalimba_F4': 719.0, 'v_kalimba_G4': 799.0},
    'glass': {'v_glass_D#4': 631.0, 'v_glass_F#4': 733.0, 'v_glass_A#4': 964.0, 'v_glass_D5': 1178.0},
    'chime': {'v_chime_G#4': 832.0, 'v_chime_A4': 881.0, 'v_chime_C5': 1047.0, 'v_chime_E5': 1321.0},
    'glock': {'v_glock_G5': 1579.0, 'v_glock_C6': 2112.0},
    'organ': {'v_organ_' + n: 0 for n in ('C2', 'D#2', 'F#2', 'C3', 'D#3', 'F#3', 'A3')},
}
_N = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
for k in HZ['organ']:   # VCSL organ names sound an octave up: name C2 -> C3
    nm = k.split('_')[-1]
    HZ['organ'][k] = 440.0 * 2 ** ((_N.index(nm[:-1]) + 12 * (int(nm[-1]) + 1) + 12 - 69) / 12)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def inst(kind, m, d=None):
    """a recorded note of `kind` at midi note m: nearest sample, varispeed to pitch."""
    f = hz(m)
    name = min(HZ[kind], key=lambda k: abs(np.log2(HZ[kind][k] / f)))
    x = pitch(S(name), 12 * np.log2(f / HZ[kind][name]))
    return cut(x, d, min(0.25, d / 3)) if d else x


def felt(x, f=2400):
    """felt-piano colour: dull the hammer, keep the body."""
    return shelf(lp(x, f, 2), 300, 1.5, 'low')


# ---------- the piece ----------
def piece(body='k_wood_light_2', semis=0.0, weight=0.0, bright=0.0, d=0.2):
    """a weighted wooden piece set down on a felt-lined board: clay-chip contact + wood body + felt thump."""
    contact = soften(pitch(S('k_chip_lay_3'), semis), 1.2, 5000)
    wood = soften(pitch(S(body), semis), 2.0, 3000)
    thump = lp(S('k_soft_medium_1'), 320)
    crisp = soften(lp(hp(pitch(S('k_chip_lay_1'), semis - 2), 2500), 11000), 0.8, 9000)
    x = lay((0, contact, 0), (0.0015, wood, -4 + weight), (0.001, thump, -10 + weight), (0.0005, cut(crisp, 0.05, 0.03), -17 + bright))
    x = peq(x, 220, 1.5 + weight * 0.5, 0.9)
    x = peq(x, 2200, 1.5 + bright, 0.9)
    x = peq(x, 4200, -1.5, 1.2)
    x = shelf(x, 9500, -3 + bright, 'high')
    return room(cut(x, d, 0.09), 0.08, 0.25)


def move_self():
    return master(piece('k_wood_light_2', 0.0, 0.0, 0.0))


def move_opponent():
    """same family, a touch lower and rounder."""
    return master(piece('k_wood_light_4', -1.6, 0.8, -1.5), rel=-0.8)


def capture():
    """piece-on-piece knock, then a heavier set-down."""
    knock = lp(soften(pitch(S('k_chips_collide_2'), -4), 1.0, 6000), 6500)
    knock = peq(cut(knock, 0.09, 0.04), 900, 3, 1.0)
    land = piece('k_wood_medium_2', -1.0, 2.5, -0.5, 0.25)
    x = lay((0, knock, -5), (0.042, land, 0), (0.044, lp(S('k_soft_heavy_0'), 260), -12))
    return master(room(x, 0.06, 0.3), rel=1.0)


def castle():
    """two quick soft placements (king, then rook) with a whisper of felt slide between."""
    slide = fade_in(lp(hp(cut(S('k_card_slide_2'), 0.09, 0.04), 600), 3500), 0.03)
    x = lay((0, piece('k_wood_light_2', -0.8, 0.5), 0), (0.035, slide, -22), (0.135, piece('k_wood_light_0', 0.9, 0.0), -1))
    return master(x)


def move_check():
    """the set-down plus a quiet felt-piano tritone underneath: tension, not alarm."""
    acc = mix(felt(inst('piano', 61, 0.75), 1500), g(felt(inst('piano', 67, 0.75), 1700), -3))
    acc = fade_in(acc, 0.012)
    x = lay((0, piece('k_wood_light_2', 0.3, 0.8, 0.5, 0.25), 0), (0.018, acc, -13),
            (0.03, g(inst('vibes', 83, 0.6), -26)))
    return master(room(x, 0.12, 0.6), rel=0.5)


def promote():
    """set-down, then a soft shimmering lift: mark-tree glint, vibraphone rising, a breath of air."""
    shimmer = fade_out(fade_in(hp(cut(S('v_marktree_up'), 0.75, 0.3), 3500), 0.12), 0.35)
    arp = lay((0.0, inst('vibes', 84, 0.9), 0), (0.07, inst('vibes', 88, 0.9), -1), (0.14, inst('vibes', 91, 0.9), -2))
    air = fade_in(fade_out(bp(S('fs60013_whoosh'), 1500, 9000), 0.15), 0.08)
    x = lay((0, piece('k_wood_light_2', 0.5), 0), (0.05, air, -20), (0.06, arp, -11), (0.07, shimmer, -17),
            (0.2, inst('glock', 96, 0.8), -24))
    return master(hall(x, 0.16, 1.2), rel=0.0)


def premove():
    """a very light tick: small woodblock + chip, high and quiet."""
    tick_ = lp(pitch(S('v_woodblock_pp'), 4), 7000)
    chip = pitch(S('k_chip_lay_3'), 5)
    x = lay((0, cut(chip, 0.07, 0.03), -6), (0.0, cut(tick_, 0.07, 0.04), -4))
    return master(room(soften(x, 1.0, 6000), 0.08, 0.2), rel=-7)


def illegal():
    """soft muted hand thud on a frame drum, a lighter echo-tap after: 'not there'."""
    thud = lp(soften(S('v_framedrum_muted'), 3, 1500), 1800)
    wood = lp(soften(pitch(S('k_wood_medium_0'), 2), 3, 1200), 1600)
    pad = lp(S('k_soft_medium_3'), 500)
    one = mix(cut(thud, 0.16, 0.06), g(cut(wood, 0.14, 0.06), -2), g(pad, -10))
    one = peq(hp(one, 90), 450, 3, 0.8)
    two = pitch(one, 1.5)
    x = lay((0, one, 0), (0.105, two, -7))
    return master(room(x, 0.06, 0.25), rel=-2.0)


def notify():
    """two soft vibraphone notes, close and warm."""
    x = lay((0, inst('vibes', 81, 1.0), 0), (0.085, inst('vibes', 88, 1.1), -1.5),
            (0.0, cut(pitch(S('k_if_glass_2'), -5), 0.06, 0.03), -24))
    return master(room(shelf(x, 6000, -3, 'high'), 0.14, 0.5), rel=-1.5)


def game_start():
    """felt piano rolled open fifth, a vibraphone above: settle in."""
    x = lay((0.0, felt(inst('piano', 60, 1.6)), -2), (0.06, felt(inst('piano', 67, 1.5)), -3),
            (0.12, felt(inst('piano', 72, 1.4), 2800), -4), (0.2, inst('vibes', 88, 1.2), -12))
    return master(hall(x, 0.18, 1.6), rel=-1.0)


def game_end():
    """felt piano: a quiet suspension resolving home, glass chime on top."""
    sus = mix(felt(inst('piano', 65, 0.55)), felt(inst('piano', 72, 0.55)))
    home = mix(felt(inst('piano', 48, 1.9), 1800), felt(inst('piano', 64, 1.9)), felt(inst('piano', 67, 1.9)),
               felt(inst('piano', 72, 1.9), 2600))
    x = lay((0, sus, -4), (0.32, home, -2), (0.36, inst('chime', 84, 1.4), -16))
    return master(hall(x, 0.2, 1.8), rel=-1.0)


def _clock(semis):
    t_ = lp(pitch(S('v_woodblock_pp'), semis), 6000)
    m = hp(pitch(S('k_metal_click'), semis * 0.5), 2500)
    return mix(cut(t_, 0.09, 0.04), g(cut(m, 0.04, 0.02), -16))


def tenseconds():
    """gentle clock: tick, tock, tick."""
    x = lay((0, _clock(3), 0), (0.25, _clock(-1), -1), (0.5, _clock(3), -2))
    return master(room(soften(x, 0.8, 7000), 0.1, 0.3), rel=-3)


def tick():
    return master(room(soften(_clock(5), 0.8, 7000), 0.08, 0.2), rel=-7)


def jumpscare():
    """still a scare: a real scream over a low drum hit and a cymbal swell, but filtered so it doesn't pierce."""
    scream = shelf(lp(cut(S('fs35716_scream'), 1.4, 0.5), 6500), 3000, -4, 'high')
    boom = lp(S('v_bassdrum'), 400)
    swell = fade_in(cut(rev(S('v_cymbal_swell')), 0.25, 0.02), 0.05)
    x = lay((0, scream, 0), (0.0, boom, -2), (0.0, lp(S('v_timpani'), 600), -6), (0, hp(swell, 2000), -14))
    return master(room(warm(x, 1.4), 0.12, 0.5), rel=4.5, max_len=1.4)


def explosion(size=1.0):
    """a recorded explosion, warmed and rounded off at the top so it booms rather than crackles."""
    d = 1.7 * size
    a = S('fs235968_explosion')
    b = S('fs255111_boom')
    x = mix(cut(a, d, d * 0.55), g(cut(b, d, d * 0.55), -4))
    x = shelf(lp(x, 7000), 120, 2, 'low')
    return master(room(warm(x, 1.3), 0.1, 0.6), rel=3.5)


CORE = {
    'move-self': move_self, 'move-opponent': move_opponent, 'capture': capture, 'castle': castle,
    'move-check': move_check, 'promote': promote, 'game-start': game_start, 'game-end': game_end,
    'illegal': illegal, 'notify': notify, 'premove': premove, 'tenseconds': tenseconds,
}
CORE_WAV = {'tick': tick, 'jumpscare': jumpscare, 'explosion': explosion}
