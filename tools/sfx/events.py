"""Big moments (v5): every event sound is its own design.

v4 built ~17 events on one template (riser -> hit -> ~49 Hz sub boom -> string pad). v5 retires that template:
each sound below has its own structure, length, sources and timbre, while keeping the cinematic, trailer-grade
weight (layered recorded impacts, orchestral percussion, string sections, wide plates, glue and loudness
mastering). Only one sound uses a synthesised noise riser (portal, as a swirl with no hit after it); fanfare builds
with a drum roll into a stab at 1.2 s and void is a reverse suck-in that ends in silence. No sine sub booms on the
events: the low end comes from recorded timpani, bass drum, frame drum and explosions.
`tools/sfx/similarity.py` checks that no event measures close to the v4 reference and that no two are alike.

Signals are mono 1-D or stereo (n, 2) at 44.1 kHz; see cine.py for the processors.
"""
import numpy as np
from scipy import signal
from synth import SR
from samples import S, pitch, glide, rev, cut
import cine as C
from cine import (st, smix, widen, pan, fade, trim, air, click, shape, mbcomp, peq, shelf, sat, sweep_lp, plate,
                  master, riser)
from core import EV_LUFS, pad, transient

# ---------------------------------------------------------------- stereo-safe filters
def _f(x, kind, f, o=2):
    nyq = SR / 2
    if kind == 'band':
        sos = signal.butter(o, [max(20, f[0]) / nyq, min(f[1], nyq * 0.98) / nyq], 'bandpass', output='sos')
    else:
        sos = signal.butter(o, min(f, nyq * 0.98) / nyq, kind, output='sos')
    return signal.sosfilt(sos, np.asarray(x, float), axis=0)


def LP(x, f, o=2):
    return _f(x, 'low', f, o)


def HP(x, f, o=2):
    return _f(x, 'high', f, o)


def BP(x, lo, hi, o=2):
    return _f(x, 'band', (lo, hi), o)


def clip(name, d=None, semis=0.0, fo=None, onset=True):
    """a source clip, varispeed by `semis`, cut to `d` s with a fade-out."""
    x = pitch(S(name, onset), semis)
    return cut(x, d, fo if fo is not None else min(0.3, d / 3)) if d else x


def contour(x, pts):
    """multiply by a piecewise-linear gain curve given in dB at (time s, dB) points (held past the last)."""
    x = np.asarray(x, float)
    tt = np.arange(len(x)) / SR
    ts, ds = zip(*pts)
    g = C.db(np.interp(tt, ts, ds))
    return (x.T * g).T


def autopan(x, r0=0.5, r1=3.0, depth=0.8, phase=0.0):
    """mono -> stereo with an accelerating constant-power pan (r0 -> r1 Hz)."""
    m = C.mono(x)
    rate = np.linspace(r0, r1, len(m))
    p = depth * np.sin(2 * np.pi * np.cumsum(rate) / SR + phase)
    a = (p + 1) * np.pi / 4
    return np.stack([m * np.cos(a), m * np.sin(a)], 1) * np.sqrt(2)


def panmove(x, p0, p1):
    m = C.mono(x)
    p = np.linspace(p0, p1, len(m))
    a = (p + 1) * np.pi / 4
    return np.stack([m * np.cos(a), m * np.sin(a)], 1) * np.sqrt(2)


def bpsweep(x, f0, f1, q=1.2, curve=1.0):
    """time-varying band-pass (log centre f0 -> f1), STFT domain, mono or stereo."""
    x = np.asarray(x, float)
    chans = [x] if x.ndim == 1 else [x[:, c] for c in range(x.shape[1])]
    out = []
    for c in chans:
        f, _, Z = signal.stft(c, SR, nperseg=2048, noverlap=2048 - 256)
        pos = np.linspace(0, 1, Z.shape[1]) ** curve
        fc = f0 * (f1 / f0) ** pos
        F = np.maximum(f[:, None], 1.0)
        H = np.exp(-(np.log2(F / fc[None, :])) ** 2 / (2 * (1.0 / q) ** 2))
        _, y = signal.istft(Z * H, SR, nperseg=2048, noverlap=2048 - 256)
        out.append(np.pad(y, (0, max(0, len(c) - len(y))))[:len(c)])
    return out[0] if x.ndim == 1 else np.stack(out, 1)


def flange(x, d0=1.0, d1=9.0, fb=0.55, mixw=0.7):
    """swept comb (delay d0 -> d1 ms), mono."""
    m = C.mono(x)
    n = len(m)
    dl = np.linspace(d0, d1, n) * SR / 1000
    y = np.zeros(n)
    for i in range(n):
        j = i - dl[i]
        k = int(j)
        if k >= 1:
            fr = j - k
            y[i] = m[i] + fb * ((1 - fr) * y[k] + fr * y[k + 1])
        else:
            y[i] = m[i]
    return m * (1 - mixw) + y * mixw * (1 - fb)


def hall(x, wet=0.25, decay=2.2, damp=4500.0, pre=0.02, lowcut=160.0, seed=11):
    return plate(x, wet, decay, damp, pre, lowcut, seed)


def noise(d, lo=200.0, hi=12000.0, seed=1):
    """plain band-limited stereo noise (decorrelated L/R), peak 1."""
    rng = np.random.default_rng(seed)
    n = int(SR * d)
    return norm(BP(rng.standard_normal((n, 2)), lo, hi))


def norm(x):
    return x / (np.max(np.abs(x)) + 1e-12)


def drumhit(name, semis=0.0, d=1.0, lp_=None, att=3.0, sus=0.0):
    x = clip(name, d, semis)
    if lp_:
        x = LP(x, lp_)
    return shape(x, att, sus) if (att or sus) else x


# ================================================================ core-set events
def game_start():
    """setting up the board: a felt-and-wood flourish of pieces placed in quick succession (accelerating, panned
    left to right), the board set down with a wide wooden slam on timpani and bass drum, and a confident
    D-major string swell that blooms after it. ~2.1 s, no riser, no sub boom."""
    taps = []
    for i, (tt, src, s_, p) in enumerate([(0.0, 'k_wood_light_0', -1, -0.6), (0.11, 'k_chip_lay_3', 0, -0.3),
                                          (0.19, 'k_wood_light_3', 1, 0.0), (0.25, 'k_chips_stack_2', 0, 0.3),
                                          (0.30, 'k_wood_light_1', 2, 0.55)]):
        t_ = transient(src, s_, 200, 12000, 5, -5, 0.14)
        taps.append((tt, pan(t_, p), -9 + i * 1.2))
    flourish = smix(*taps)
    felt = LP(clip('k_footstep_carpet_0', 0.3), 1800)
    slam = smix((0, widen(shape(clip('k_wood_heavy_1', 0.7, -2), 5, -1), 0.5)),
                (0, drumhit('vs_timp_hi', -3, 1.6, 900), -3), (0, drumhit('v_bassdrum', 0, 1.2, 400), -4),
                (0, felt, -6), (0, click(0.005, 2500, 14000, 31), -12))
    swell = pad([50, 57, 62, 66, 69, 74], 1.9, attack=0.45, lpf=3600, close=2200, width=1.0,
                gains=[0, -2, -3, -4, -5, -7], section=['cello', 'cello', 'cello', 'viola', 'viola', 'violin'])
    swell = contour(swell, [(0, -14), (0.35, -2), (0.6, 0), (1.9, -6)])
    x = smix((0, flourish), (0.42, slam, -1), (0.40, swell, -3.5),
             (0.45, widen(air(0.9, 9000, 4000, 0.35, 3000, 31, 1.0), 0.8), -22))
    x = hall(x, 0.2, 1.8, 6000, 0.015, 200, 31)
    x = mbcomp(x, thr=(-16.0, -22.0, -26.0), ratio=(1.8, 2.0, 2.0))
    return master(x, EV_LUFS, 's', max_len=2.3)


def game_end():
    """a heavy book shutting on the game: a low cello / viola chord is already sounding when the cover swings shut
    (a pushed-air whump, then the slam of book, wood and a damped timpani) and the music is cut off by it,
    leaving only a dark room and a puff of dust. ~1.7 s."""
    chord = pad([43, 50, 55, 58], 0.9, attack=0.12, lpf=1500, width=0.8, gains=[0, -2, -4, -6])
    chord = contour(chord, [(0, -3), (0.3, 0), (0.42, -1), (0.47, -40)])
    whump = fade(LP(rev(clip('fs683101_whoosh', 0.3)), 1500), 0.05, 0.01)
    slam = smix((0, widen(shape(clip('k_book_close', None, -6), 6, -2), 0.4)),
                (0, shape(clip('k_door_close_1', 0.6, -4), 5, -2), -3),
                (0, drumhit('vs_timp_1', 2, 0.5, 700, 4, -6), -2), (0, clip('k_punch_heavy_1', 0.3, -3), -6),
                (0, drumhit('v_bassdrum', -2, 0.6, 300), -4), (0, click(0.004, 1500, 9000, 32), -10))
    dust = fade(widen(BP(air(0.6, 3000, 900, 0.22, 400, 32, 1.0), 300, 5000), 0.9), 0.01, 0.3)
    x = smix((0, chord, -3), (0.3, whump, -10), (0.45, slam), (0.47, dust, -16))
    x = hall(x, 0.22, 1.3, 2800, 0.01, 180, 32)
    x = mbcomp(x, thr=(-14.0, -22.0, -26.0), ratio=(2.0, 2.0, 2.0))
    return master(x, EV_LUFS - 1.0, 's', max_len=1.8)


def victory():
    """triumph: a bright timpani-and-bass-drum downbeat opens it, then the full string section rises from G up
    to a C-major chord that resolves at ~1.3 s with violins on top, a timpani roll swelling under it and a
    bright air bloom as it resolves. No hit at the top and no sub drop; a long open hall tail. ~3 s."""
    down = smix((0, drumhit('vs_timp_hi', 0, 1.4, 2500), 0), (0, drumhit('v_bassdrum', 0, 1.0, 600), -5),
                (0, transient('k_wood_heavy_3', 2, 300, 12000, 6, -4, 0.2), -8))
    rise = pad([43, 55, 59, 62, 67], 1.3, attack=0.25, lpf=2800, close=4000, width=1.0,
               gains=[0, -2, -3, -4, -7], section=['cello', 'cello', 'cello', 'viola', 'violin'])
    res = pad([48, 55, 64, 67, 72, 76], 1.9, attack=0.18, lpf=4200, close=6500, width=1.1,
              gains=[0, -1, -2, -3, -4, -6], section=['cello', 'cello', 'cello', 'viola', 'violin', 'violin'])
    roll = LP(clip('vs_timp_roll_hi', 1.5, 0), 1800)
    roll = contour(roll, [(0, -24), (1.2, -4), (1.35, -2), (1.5, -40)])
    bloom = widen(air(1.6, 13000, 6500, 0.5, 5000, 51, 1.0), 1.0)
    x = smix((0, down, -2), (0.12, contour(rise, [(0, -20), (1.15, -4), (1.3, -12)]), -2),
             (0.05, roll, -6), (1.25, contour(res, [(0, -6), (0.15, 0), (1.9, -8)]), -1),
             (1.27, fade(bloom, 0.06, 1.0), -14))
    x = hall(x, 0.24, 2.4, 7000, 0.02, 200, 51)
    x = mbcomp(x, thr=(-16.0, -22.0, -26.0), ratio=(1.6, 2.0, 2.0))
    return master(x, EV_LUFS, 's', max_len=3.1)


def defeat():
    """loss: a big muffled thump (frame drum, felt bass drum, padded impact, all low-passed), then a low cello
    sigh in A minor that swells in and slides down a minor third while its filter closes, into a dark hall. ~2.8 s."""
    thump = smix((0, drumhit('v_framedrum_muted', -3, 0.8, 900, 4, -2)), (0, drumhit('v_bassdrum', -3, 1.2, 280), -1),
                 (0, LP(clip('k_soft_heavy_0', 0.5, -5), 1200), -4), (0, drumhit('vs_timp_1', -2, 1.2, 400), -5))
    sigh = pad([45, 52, 57, 60], 2.4, attack=0.35, lpf=1600, close=420, glide_=-3.0, width=0.9,
               gains=[0, -2, -3, -5])
    sigh = contour(sigh, [(0, -18), (0.55, 0), (1.2, -3), (2.4, -14)])
    x = smix((0, thump), (0.2, sigh, -2.5), (0.22, LP(clip('vs_bassdrum_rub', 2.2), 300), -14))
    x = hall(x, 0.26, 2.2, 2200, 0.02, 160, 52)
    x = mbcomp(x, thr=(-15.0, -22.0, -26.0), ratio=(1.8, 2.0, 2.0))
    return master(x, EV_LUFS - 1.0, 's', max_len=2.8)


def draw():
    """balance: two equal knocks, one left and one right (log drum, heavy wood, damped timpani), and a bowed
    open fifth on D that swells up between them and fades out level, neither major nor minor. ~2.3 s."""
    def knock(seed, semis):
        return smix((0, drumhit('v_logdrum', semis, 0.5, 4000, 5, -3)), (0, transient('k_wood_heavy_3', semis, 150, 9000, 5, -3, 0.3), -2),
                    (0, drumhit('vs_timp_hi', semis - 2, 0.7, 700, 4, -6), -5), (0, click(0.004, 2000, 10000, seed), -14))
    tail = pad([50, 57, 62, 69], 2.0, attack=0.4, lpf=2300, close=1300, width=1.0, gains=[0, -1, -3, -6],
               section=['cello', 'cello', 'cello', 'viola'])
    tail = contour(tail, [(0, -16), (0.6, 0), (1.0, -1), (2.0, -12)])
    x = smix((0, pan(knock(53, 0), -0.45)), (0.34, pan(knock(54, 0), 0.45)), (0.1, tail, -3))
    x = hall(x, 0.22, 1.8, 4000, 0.015, 180, 53)
    x = mbcomp(x, thr=(-15.0, -22.0, -26.0), ratio=(1.7, 2.0, 2.0))
    return master(x, EV_LUFS - 1.0, 's', max_len=2.3)


# ================================================================ shared big effects
def jumpscare():
    """still a scare, all at once: a dramatic cinematic hit and a real scream land together, a screeching
    band of the scream doubled an octave down underneath, held for most of a second and cut off dead."""
    scream = shelf(LP(clip('fs35716_scream', 1.1, 0.0, 0.05), 7000), 3000, -2, 'high')
    low = LP(clip('fs35716_scream', 1.1, -12, 0.05), 2500)
    hit = smix((0, shape(clip('fs222517_hit', 0.9, 0, 0.3), 4, 0)), (0, drumhit('v_bassdrum', -1, 0.8, 300), -3))
    x = smix((0, widen(scream, 0.5)), (0, low, -8), (0, hit, -2))
    x = contour(x, [(0, 0), (0.85, -2), (0.95, -40)])
    x = hall(x, 0.12, 0.6, 5000, 0.008, 220, 41)
    return master(mbcomp(x), EV_LUFS + 1.0, 's', max_len=1.25)


def explosion(variant='a'):
    """recorded explosions with debris. 'a' (explosion.wav): a close blast with the debris raining for a second
    and a half; 'b' (bomb): bigger and deeper, the blast followed by a second slump of rubble and gravel that
    swells up after it; 'c' (blast): a sharp, short pressure crack with a quick dusty tail."""
    if variant == 'a':
        blast = smix((0, widen(LP(clip('fs235968_explosion', 2.6), 9000), 0.6)), (0, LP(clip('fs189779_boom', 2.4), 2200), -4),
                     (0.02, LP(clip('fs560510_debris_a', 2.6), 9000), -1))
        deb = contour(HP(clip('fs569746_gravel', 2.2), 400), [(0, -20), (0.5, -2), (1.4, -6), (2.2, -30)])
        x = smix((0, blast), (0.25, widen(deb, 0.8), -10))
        x = hall(shelf(x, 7000, -2, 'high'), 0.12, 1.4, 4500, 0.012, 200, 42)
        return master(sat(norm(mbcomp(x)), 1.3), EV_LUFS + 1.0, 's', max_len=2.6)
    if variant == 'b':
        blast = smix((0, widen(LP(clip('fs560510_debris_b', 3.4), 8000), 0.7)), (0, LP(clip('fs255111_boom', 3.2), 1800), -2),
                     (0, drumhit('v_bassdrum', -4, 1.5, 200), -6))
        slump = smix((0, contour(LP(clip('fs462162_rubble', 1.9), 6000), [(0, -12), (0.4, 0), (1.9, -18)])),
                     (0.1, contour(HP(clip('fs569746_gravel', 2.4, -2), 300), [(0, -16), (0.6, -3), (2.4, -30)]), -4),
                     (0, drumhit('vs_timp_1', -5, 1.2, 400), -6))
        x = smix((0, blast), (0.55, widen(slump, 0.9), -3))
        x = hall(shelf(x, 6000, -3, 'high'), 0.14, 1.8, 3500, 0.015, 180, 43)
        return master(sat(norm(mbcomp(x)), 1.25), EV_LUFS + 1.0, 's', max_len=3.2)
    crack = smix((0, shape(clip('fs427595_shotgun', 0.4, -3), 6, -4)), (0, click(0.006, 2000, 14000, 44), -6))
    boom = smix((0, LP(clip('fs189779_boom', 1.2, 2), 3000)), (0, widen(LP(clip('fs235968_explosion', 1.0, 3), 9000), 0.6), -3))
    push = LP(clip('fs683101_whoosh', 0.5, -3), 5000)
    dust = HP(clip('fs462162_rubble', 0.9, 2), 600)
    x = smix((0, crack, -2), (0, boom), (0.03, widen(push, 0.8), -10), (0.12, widen(dust, 0.7), -12))
    x = contour(x, [(0, 0), (0.6, -4), (1.1, -24)])
    x = hall(x, 0.1, 0.9, 5000, 0.008, 220, 44)
    return master(sat(norm(mbcomp(x)), 1.3), EV_LUFS + 1.0, 's', max_len=1.3)


# ================================================================ mode events
def achievement():
    """unlocked: a punchy frame-drum and bass-drum accent, then a quick upward sparkle of eight muted violin
    plucks sweeping left to right with a bright air bloom on top, ending light. ~1.4 s."""
    acc = smix((0, drumhit('vs_frame_hit', 0, 0.5, 6000, 5, -3)), (0, drumhit('v_bassdrum', 2, 0.5, 500), -4),
               (0, click(0.004, 3000, 15000, 54), -10))
    notes = [('vs_pizz_G5', 0), ('vs_pizz_C6', 0), ('vs_pizz_E6', 0), ('vs_pizz_G5', 12), ('vs_pizz_A6', 0),
             ('vs_pizz_C6', 12), ('vs_pizz_E6', 12), ('vs_pizz_A6', 7)]
    sp = []
    for i, (n, s_) in enumerate(notes):
        pz = HP(clip(n, 0.13, s_, 0.08), 500)
        sp.append((0.05 + i * 0.045, pan(pz, -0.7 + 1.4 * i / 7), -2 - i * 0.6))
    sparkle = smix(*sp)
    bloom = widen(air(0.9, 14000, 8000, 0.25, 6000, 54, 1.0), 1.0)
    x = smix((0, acc, -3), (0, sparkle), (0.1, fade(bloom, 0.15, 0.5), -14))
    x = hall(x, 0.2, 1.2, 8000, 0.01, 300, 54)
    return master(mbcomp(x), EV_LUFS, 's', max_len=1.4)


def fanfare():
    """a celebration built from drums, no brass or bells: a frame-drum rhythm that doubles in speed over a
    timpani roll that swells, into a full stab of strings, timpani, bass drum and heavy wood at 1.2 s, ringing
    out in a wide hall. ~2.4 s."""
    pat = [0.0, 0.3, 0.45, 0.6, 0.75, 0.83, 0.91, 0.99, 1.05, 1.11]
    hits = smix(*[(tt, pan(drumhit('vs_frame_hit' if i % 2 == 0 else 'v_handdrum', (i % 3) - 1, 0.35, 7000, 5, -4),
                           0.35 if i % 2 else -0.35), -9 + i * 0.6) for i, tt in enumerate(pat)])
    roll = contour(LP(clip('vs_timp_roll_lo', 1.25, 2), 1500), [(0, -26), (1.15, -3), (1.2, -30)])
    stab_s = pad([48, 55, 64, 67, 72, 76], 1.0, attack=0.012, lpf=5000, width=1.1, gains=[0, -1, -2, -3, -4, -6],
                 section=['cello', 'cello', 'cello', 'viola', 'violin', 'violin'])
    stab_s = contour(shape(stab_s, 6, -3), [(0, 0), (0.25, -6), (1.0, -20)])
    stab = smix((0, stab_s, -2), (0, drumhit('vs_timp_hi', 0, 1.4, 2000, 5, -1), -1), (0, drumhit('v_bassdrum', 0, 1.0, 500), -3),
                (0, transient('k_wood_heavy_1', 0, 150, 12000, 6, -2, 0.3), -5), (0, click(0.006, 2500, 15000, 55), -10),
                (0.01, widen(air(0.8, 12000, 6000, 0.3, 4500, 55, 1.0), 0.9), -16))
    x = smix((0, hits), (0, roll, -4), (1.2, stab))
    x = hall(x, 0.22, 1.8, 6500, 0.015, 200, 55)
    return master(mbcomp(x), EV_LUFS, 's', max_len=2.5)


def gong():
    """a new page in the rule book: pages fanned and swept across the stereo field, slowed a little so they
    sound big, over a low swell of rubbed bass drum and a cello fifth that rises and settles. ~2.1 s."""
    sw = smix((0, panmove(clip('k_book_flip_1', None, -2), -0.8, -0.2)), (0.12, panmove(clip('k_card_fan_1', None, -3), -0.4, 0.4), -2),
              (0.26, panmove(clip('k_book_flip_3', None, -2), 0.0, 0.7), -1), (0.42, panmove(clip('k_book_flip_2', None, -4), 0.4, 0.9), -3))
    sw = HP(sw, 250)
    low = smix((0, LP(clip('vs_bassdrum_rub', 2.0), 260)),
               (0.05, pad([36, 43, 48], 1.9, attack=0.5, lpf=900, close=500, width=0.7, gains=[0, -2, -6]), -4))
    low = contour(low, [(0, -20), (0.7, 0), (1.2, -2), (2.0, -16)])
    settle = LP(clip('k_book_place_1', 0.4, -4), 3500)
    x = smix((0, widen(sw, 0.6)), (0, low, -3), (0.68, settle, -7))
    x = hall(x, 0.24, 1.7, 5000, 0.02, 200, 56)
    return master(mbcomp(x), EV_LUFS, 's', max_len=2.1)


def portal():
    """a portal opening: a long ethereal woosh run through two resonant band-passes sweeping in opposite
    directions and circling the stereo field faster and faster, a noise riser underneath (the only riser in the
    set, with no hit after it), blooming wide at ~1.1 s over a low rubbed-drum rumble. ~2 s."""
    e = clip('fs462879_ethereal', 2.0, -2)
    a = autopan(bpsweep(e, 400, 4000, 1.3), 0.6, 5.0, 0.9)
    b = autopan(bpsweep(e, 5000, 900, 1.3), 0.8, 6.0, 0.9, np.pi)
    r = riser(1.1, 300, 9000, 1.6, -30, 0.9, 0.5, 0.0, 57)
    rumble = contour(LP(clip('vs_bassdrum_rub', 2.0), 220), [(0, -20), (1.1, 0), (2.0, -12)])
    bloom = widen(air(0.9, 9000, 3000, 0.35, 1500, 57, 1.0), 1.0)
    x = smix((0, a), (0, b, -1), (0, r, -9), (0, rumble, -6), (1.05, fade(bloom, 0.08, 0.5), -9))
    x = contour(x, [(0, -14), (1.1, 0), (2.0, -10)])
    x = hall(x, 0.3, 1.6, 6000, 0.02, 220, 57)
    return master(mbcomp(x), EV_LUFS - 1.0, 's', max_len=2.0)


def warp():
    """bent through space: a backwards woosh and a slow swoosh flanged and pulled through a tape-speed dive while
    they fly left to right, a punched distortion at the bend and a pitch-dropping thud. ~1.3 s."""
    w = smix((0, clip('fs446010_backwoosh', None, 2)), (0.25, glide(clip('fs60027_swosh', None, -2), 0, -14), -2))
    w = flange(w, 0.6, 7.0, 0.6, 0.7)
    w = panmove(BP(w, 150, 10000), -0.9, 0.9)
    bend = smix((0, sat(norm(clip('k_punch_heavy_1', 0.4, -2)), 2.5)), (0, glide(drumhit('vs_timp_hi', 0, 1.0, 1200), 0, -12), -2))
    x = smix((0, w), (0.42, widen(bend, 0.4), -3))
    x = hall(x, 0.2, 1.1, 5000, 0.01, 220, 58)
    return master(mbcomp(x), EV_LUFS - 1.0, 's', max_len=1.4)


def void():
    """pulled into nothing: a cinematic boom, wind and a whoosh played backwards so everything is sucked inward
    over a second (its reverb reversed too), cut off dead into silence, then one small dry implosion. ~1.4 s."""
    boom = smix((0, LP(clip('fs255111_boom', 1.6), 3000)), (0, LP(clip('fs146932_wind', 1.6, -3), 2500), -4),
                (0, clip('fs60013_whoosh', None, -5), -6))
    boom = hall(boom, 0.4, 1.2, 3000, 0.0, 150, 59)
    suck = fade(rev(C.st(boom)[:int(SR * 1.15)]), 0.3, 0.0)
    suck = contour(suck, [(0, -6), (1.13, 0), (1.15, -60)])
    pop = smix((0, drumhit('vs_frame_hit', -5, 0.25, 1500, 6, -10)), (0, click(0.003, 500, 4000, 59), -12))
    x = smix((0, suck), (1.2, pop, -10))
    return master(mbcomp(x), EV_LUFS - 1.5, 's', max_len=1.5, glue=False)


def kidnap():
    """snatched: a scuffle of cloth and leather, a muffled sack thud, then a doppler whoosh dragging away into
    the distance (pitch sinking, filter closing) over dark wind, and a far-off door slam in a big room. ~2.2 s."""
    scuffle = smix((0, clip('k_cloth_2', 0.3)), (0.08, clip('k_cloth_3', 0.3), -2), (0.17, clip('k_leather_drop', 0.3), -3),
                   (0.22, clip('k_cloth_4', 0.25, 2), -4))
    sack = smix((0, LP(clip('k_soft_heavy_0', 0.4, -4), 1500)), (0, drumhit('v_bassdrum', -4, 0.6, 250), -3))
    away = glide(clip('fs462879_ethereal', 1.6, 2), 0, -10)
    away = sweep_lp(panmove(away, -0.3, 0.9), 7000, 500, 0.7)
    away = contour(away, [(0, -6), (0.25, 0), (1.5, -20)])
    wind = contour(LP(clip('fs146932_wind', 1.8, -2), 1200), [(0, -24), (0.6, -6), (1.8, -26)])
    door = LP(clip('k_door_close_1', 0.6, -3), 1800)
    x = smix((0, widen(scuffle, 0.5), -2), (0.28, sack, -1), (0.35, away, -5), (0.3, widen(wind, 0.7), -10),
             (1.45, plate(door, 0.6, 1.2, 2500, 0.03, 200, 61), -14))
    x = hall(x, 0.18, 1.5, 4000, 0.015, 200, 61)
    return master(mbcomp(x), EV_LUFS - 1.0, 's', max_len=2.4)


def kill():
    """an execution: a blade drawn, a fast cut through the air, then a heavy, dark cinematic impact (recorded
    dramatic hit, heavy punch, timpani tuned down) that is choked short, leaving a low drumskin rumble. ~1.4 s."""
    blade = smix((0, HP(clip('k_draw_knife_1', 0.4), 900), -2), (0.16, clip('fs683101_whoosh', 0.2, 2), -4),
                 (0.2, clip('k_knife_slice_2', 0.25), -2))
    hit = smix((0, shape(LP(clip('fs222517_hit', 1.0, -2), 5000), 5, -2)), (0, clip('k_punch_heavy_1', 0.4, -4), -3),
               (0, drumhit('vs_timp_1', -4, 1.0, 500), -3))
    hit = contour(hit, [(0, 0), (0.25, -3), (0.4, -18)])
    rumble = contour(LP(clip('vs_frame_roll', 1.0, -7), 300), [(0, -20), (0.2, -8), (1.0, -26)])
    x = smix((0, widen(blade, 0.5)), (0.26, hit, -1), (0.4, rumble, -6))
    x = hall(x, 0.14, 1.0, 3000, 0.01, 200, 62)
    return master(mbcomp(x), EV_LUFS, 's', max_len=1.4)


def reap():
    """the scythe: a long low swoosh swinging left to right and growing, the cut at its peak, and then a cold,
    hollow wind that rises after it like something leaving. ~1.7 s."""
    swing = smix((0, glide(clip('fs60027_swosh', None, -6), 0, -3)), (0.05, glide(clip('fs60013_whoosh', None, -4), 0, -6), -4))
    swing = panmove(LP(swing, 6000), -0.9, 0.7)
    cutx = smix((0, clip('k_knife_slice_2', 0.3, -2)), (0, transient('k_chop', -3, 300, 9000, 5, -3, 0.2), -5))
    wind = BP(clip('fs146932_wind', 1.4, 1), 300, 5000)
    wind = contour(widen(wind, 0.9), [(0, -18), (0.4, -4), (0.6, -3), (1.4, -24)])
    x = smix((0, swing), (0.36, cutx, -1), (0.42, wind, -4))
    x = hall(x, 0.22, 1.4, 4500, 0.015, 220, 63)
    return master(mbcomp(x), EV_LUFS - 1.5, 's', max_len=1.7)


def spawn():
    """something appears: a soft rising pop (a drumskin tap with its pitch bent up, a puff of air) and a quick
    bloom of high bowed violins and bright air that opens wide and fades. ~1.1 s."""
    tap = glide(drumhit('v_handdrum', -3, 0.3, 3000, 4, -6), -4, 5)
    puff = fade(BP(air(0.12, 3000, 6000, 0.04, 800, 64, 0.6), 600, 8000), 0.003, 0.05)
    pop = smix((0, tap), (0, puff, -6), (0, LP(clip('k_soft_medium_1', 0.3), 3000), -6))
    blo = pad([76, 79, 84], 0.9, attack=0.1, lpf=7000, width=1.2, gains=[0, -3, -6], section='violin')
    blo = contour(blo, [(0, -10), (0.2, 0), (0.9, -14)])
    x = smix((0, pop, -1), (0.05, blo, -6), (0.06, fade(widen(air(0.7, 13000, 7000, 0.2, 5000, 64, 1.0), 1.0), 0.08, 0.4), -10))
    x = hall(x, 0.2, 1.0, 8000, 0.01, 300, 64)
    return master(mbcomp(x), EV_LUFS - 2.0, 's', max_len=1.1)


def petrify():
    """flesh to stone: a crack as the curse lands, stone grinding and crackling as it spreads (carved stone,
    a stone rune dragged, fuse crackle, gravel), then the heavy settling thud of a statue and a trickle of dust. ~1.6 s."""
    crack = smix((0, shape(clip('k_mining_2', 0.4, -2), 6, -3)), (0, click(0.005, 2000, 12000, 65), -8))
    grind = smix((0, LP(clip('fs743246_stone', None, -5), 6000)), (0.15, LP(clip('fs743232_carve', None, -4), 7000), -2),
                 (0.3, LP(clip('fs743246_stone', None, -7), 5000), -2),
                 (0.0, HP(clip('fs45650_fuse', 0.9), 2500), -10), (0.1, HP(clip('fs569746_gravel', 0.8), 1500), -10))
    grind = contour(widen(grind, 0.7), [(0, -4), (0.6, 0), (0.75, -6)])
    settle = smix((0, shape(clip('k_mining_4', 0.5, -5), 5, -2)), (0, drumhit('vs_timp_1', -3, 0.9, 500, 4, -4), -3),
                  (0, drumhit('v_bassdrum', -3, 0.8, 250), -4))
    dust = HP(clip('fs462162_rubble', 0.8, 3), 1500)
    x = smix((0, crack, -2), (0.08, grind, -3), (0.86, settle), (0.92, widen(dust, 0.8), -14))
    x = hall(x, 0.16, 1.1, 4000, 0.01, 220, 65)
    return master(mbcomp(x), EV_LUFS - 1.0, 's', max_len=1.7)
