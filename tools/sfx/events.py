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
FX_GR = EV_LUFS - 3.0   # grenade: an in-play blast, a little under the big moments

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


def gap(x, t, d=0.025, depth=-36.0):
    """a trailer "suck-out": duck the mix to `depth` dB for the `d` s just before `t`, so the hit at `t` lands
    out of a breath of near-silence (it also marks that hit as the sound's main hit)."""
    x = np.asarray(x, float)
    tt = np.arange(len(x)) / SR
    g = C.db(np.interp(tt, [0, t - d - 0.012, t - d, t - 0.002, t], [0, 0, depth, depth, 0]))
    return (x.T * g).T


def lead(x, d=0.02):
    """prepend `d` s of silence, so a sound that opens on its hit starts from true silence."""
    x = np.asarray(x, float)
    return np.concatenate([np.zeros((int(SR * d),) + x.shape[1:]), x])


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
    left to right), a breath, then the board set down with a wide wooden slam on timpani and bass drum, and a
    confident D-major string swell that blooms after it, grows for a second and holds. ~2.6 s, no riser, no sub
    boom."""
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
    slam = contour(slam, [(0, 0), (0.2, -4), (0.45, -20)])
    swell = pad([50, 57, 62, 66, 69, 74], 2.2, attack=0.45, lpf=3600, close=2600, width=1.0,
                gains=[0, -2, -3, -4, -5, -7], section=['cello', 'cello', 'cello', 'viola', 'viola', 'violin'])
    swell = contour(swell, [(0, -24), (0.35, -12), (1.2, 0), (1.9, -1), (2.2, -10)])
    x = smix((0, flourish, -2), (0.45, slam), (0.47, swell, -3),
             (0.5, widen(air(0.9, 9000, 4000, 0.35, 3000, 31, 1.0), 0.8), -22))
    x = hall(x, 0.2, 1.8, 6000, 0.015, 200, 31)
    x = mbcomp(x, thr=(-16.0, -22.0, -26.0), ratio=(1.8, 2.0, 2.0))
    return master(gap(x, 0.45, 0.04), EV_LUFS, 's', max_len=2.8)


def game_end():
    """a heavy book shutting on the game: a low cello / viola chord is already sounding when the cover swings shut
    (a pushed-air whump, then the slam of book, wood and a damped timpani) and cuts the music off dead. A beat of
    silence, then the empty room answers: a dark, muffled low chord (cello D-A-D under a sinking filter) swells
    back in from nothing and hangs like dust settling, and the sound ends with it. ~2.4 s."""
    chord = pad([43, 50, 55, 58], 0.9, attack=0.12, lpf=1500, width=0.8, gains=[0, -2, -4, -6])
    chord = contour(chord, [(0, -3), (0.3, 0), (0.42, -1), (0.47, -40)])
    whump = fade(LP(rev(clip('fs683101_whoosh', 0.3)), 1500), 0.05, 0.01)
    slam = smix((0, widen(shape(clip('k_book_close', None, -6), 6, -2), 0.4)),
                (0, shape(clip('k_door_close_1', 0.6, -4), 5, -2), -3),
                (0, drumhit('vs_timp_1', 2, 0.5, 700, 4, -6), -2), (0, clip('k_punch_heavy_1', 0.3, -3), -6),
                (0, drumhit('v_bassdrum', -2, 0.6, 300), -4), (0, click(0.004, 1500, 9000, 32), -10))
    slam = contour(slam, [(0, 0), (0.18, -4), (0.32, -50)])
    after = pad([38, 45, 50], 1.8, attack=0.6, lpf=900, close=380, width=1.0, gains=[0, -3, -6])
    after = contour(after, [(0, -30), (0.7, -2), (1.1, 0), (1.8, -10)])
    rub = contour(LP(clip('vs_bassdrum_rub', 1.8), 240), [(0, -30), (0.8, -6), (1.8, -20)])
    dust = fade(widen(BP(air(1.2, 3000, 900, 0.6, 400, 32, 1.0), 300, 4000), 0.9), 0.4, 0.5)
    x = smix((0, chord, -3), (0.3, whump, -10), (0.45, slam), (0.85, after, -1), (0.85, rub, -6), (1.0, dust, -20))
    x = hall(x, 0.18, 1.2, 2800, 0.01, 180, 32)
    x = mbcomp(x, thr=(-14.0, -22.0, -26.0), ratio=(2.0, 2.0, 2.0))
    return master(x, EV_LUFS - 1.0, 's', max_len=2.7)


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
    """balance: two equal knocks, one left and one right half a second apart (log drum, heavy wood, damped
    timpani), and a bowed open fifth on D that swells up after them and holds level and still for a long
    moment, neither major nor minor, before it lets go. ~2.7 s."""
    def knock(seed, semis):
        return smix((0, drumhit('v_logdrum', semis, 0.5, 4000, 5, -3)), (0, transient('k_wood_heavy_3', semis, 150, 9000, 5, -3, 0.3), -2),
                    (0, drumhit('vs_timp_hi', semis - 2, 0.7, 700, 4, -6), -5), (0, click(0.004, 2000, 10000, seed), -14))
    tail = pad([50, 57, 62, 69], 2.5, attack=0.5, lpf=2300, close=1300, width=1.0, gains=[0, -1, -3, -6],
               section=['cello', 'cello', 'cello', 'viola'])
    tail = contour(tail, [(0, -24), (0.5, -8), (1.1, 0), (2.0, -1), (2.5, -14)])
    x = smix((0, pan(knock(53, 0), -0.45)), (0.5, pan(knock(54, 0), 0.45)), (0.2, tail, -3))
    x = hall(x, 0.22, 1.8, 4000, 0.015, 180, 53)
    x = mbcomp(x, thr=(-15.0, -22.0, -26.0), ratio=(1.7, 2.0, 2.0))
    return master(lead(x), EV_LUFS - 1.0, 's', max_len=2.8)


# ================================================================ shared big effects
def jumpscare():
    """still a scare: out of nowhere a dry, slapping stab hits and chokes, a split-second of dead air, then a
    real scream lands with a dramatic cinematic hit, a screeching band of the scream doubled an octave down
    underneath, getting harsher for a second and a half until it is cut off dead."""
    stab = smix((0, shape(clip('k_punch_heavy_1', 0.2, 0), 8, -6)), (0, click(0.005, 1500, 12000, 41), -6),
                (0, HP(clip('k_knife_slice_1', 0.12, -3, 0.03), 1500), -6))
    stab = contour(stab, [(0, 0), (0.08, -6), (0.14, -50)])
    scream = shelf(LP(clip('fs35716_scream', 1.8, 0.0, 0.05), 7000), 3000, -2, 'high')
    low = LP(clip('fs35716_scream', 1.8, -12, 0.05), 2500)
    hit = smix((0, shape(clip('fs222517_hit', 0.9, 0, 0.3), 4, 0)), (0, drumhit('v_bassdrum', -1, 0.8, 300), -3))
    body = smix((0, widen(scream, 0.5)), (0, low, -6), (0, hit, -5))
    body = contour(body, [(0, -9), (0.3, -7), (1.6, 0), (1.72, -40)])
    x = smix((0, stab), (0.3, body))
    x = hall(x, 0.12, 0.6, 5000, 0.008, 220, 41)
    return master(lead(mbcomp(x)), EV_LUFS + 1.0, 's', max_len=2.1)


def explosion(variant='a'):
    """recorded explosions with debris, three different shapes. 'a' (explosion.wav): a hard crack and a close
    blast that cuts off, a beat of ringing air, then the debris comes down: rubble and gravel raining heavier and
    wider for a second before it thins out; 'b' (bomb): bigger and deeper, the blast followed by two rolling
    slumps of rubble, each heavier than the last, rumbling on under timpani; 'c' (blast): a sharp, short pressure
    crack with a quick dusty tail."""
    if variant == 'a':
        crack = smix((0, shape(clip('fs427595_shotgun', 0.3, -2), 6, -4)), (0, click(0.006, 2000, 14000, 42), -6))
        blast = smix((0, widen(LP(clip('fs235968_explosion', 0.8), 9000), 0.6)), (0, LP(clip('fs189779_boom', 0.8), 2200), -4))
        blast = contour(blast, [(0, 0), (0.25, -5), (0.45, -26)])
        deb = smix((0, LP(clip('fs560510_debris_a', 2.4, 0, onset=False), 9000)),
                   (0.1, HP(clip('fs569746_gravel', 2.2), 400), -4), (0.2, LP(clip('fs462162_rubble', 1.9), 6000), -3))
        deb = contour(widen(deb, 0.9), [(0, -26), (0.5, -6), (1.0, 0), (1.6, -3), (2.2, -24)])
        x = smix((0, crack, -2), (0, blast), (0.4, deb, -2))
        x = hall(shelf(x, 7000, -2, 'high'), 0.12, 1.4, 4500, 0.012, 200, 42)
        return master(lead(sat(norm(mbcomp(x)), 1.3)), EV_LUFS + 1.0, 's', max_len=2.8)
    if variant == 'b':
        blast = smix((0, widen(LP(clip('fs560510_debris_b', 1.2), 8000), 0.7)), (0, LP(clip('fs255111_boom', 1.2), 1800), -2),
                     (0, drumhit('v_bassdrum', -4, 1.2, 200), -6))
        blast = contour(blast, [(0, 0), (0.4, -6), (0.7, -24)])
        def slump(seed, semis, d):
            return smix((0, contour(LP(clip('fs462162_rubble', d, semis), 6000), [(0, -14), (0.3, 0), (d, -18)])),
                        (0.1, contour(HP(clip('fs569746_gravel', d, semis - 2), 300), [(0, -16), (0.5, -3), (d, -30)]), -4),
                        (0, drumhit('vs_timp_1', semis - 5, 1.2, 400), -5))
        x = smix((0, blast), (0.6, widen(slump(1, 0, 1.2), 0.9), -4), (1.3, widen(slump(2, -3, 1.6), 0.9), -1))
        x = hall(shelf(x, 6000, -3, 'high'), 0.14, 1.8, 3500, 0.015, 180, 43)
        return master(lead(sat(norm(mbcomp(x)), 1.25)), EV_LUFS + 1.0, 's', max_len=3.3)
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
    """unlocked: a punchy frame-drum and bass-drum accent, then a quick upward run of eight tight wood ticks
    sweeping left to right and getting louder as it climbs inside a rising swish of air, landing on a held,
    open high string chord (an open C-G fifth: viola under violins, no third) with a bright air bloom on top
    that hangs, wide, before it fades. No plucked or struck notes. ~2.3 s."""
    acc = smix((0, drumhit('v_framedrum_muted', 0, 0.5, 6000, 5, -3)), (0, drumhit('v_bassdrum', 2, 0.5, 500), -4),
               (0, click(0.004, 3000, 15000, 54), -10))
    acc = contour(acc, [(0, 0), (0.15, -8), (0.3, -40)])
    srcs = ['k_wood_light_0', 'k_wood_light_1', 'k_wood_light_2', 'k_wood_light_3', 'k_wood_light_4',
            'k_wood_light_1', 'k_wood_light_3', 'k_wood_light_0']
    sp = [(0.18 + i * 0.07, pan(transient(n, 2 + i, 900, 14000, 6, -10, 0.07), -0.7 + 1.4 * i / 7), -14 + i * 1.4)
          for i, n in enumerate(srcs)]
    sparkle = smix(*sp)
    swish = bpsweep(clip('fs60013_whoosh', 0.6, 3), 900, 9000, 1.4)
    swish = panmove(contour(swish, [(0, -20), (0.5, 0), (0.6, -30)]), -0.6, 0.7)
    chord = pad([60, 67, 72, 79], 1.6, attack=0.3, lpf=6500, width=1.2, gains=[-2, 0, -2, -4],
                section=['viola', 'violin', 'violin', 'violin'])
    chord = contour(chord, [(0, -10), (0.4, 0), (1.2, -1), (1.6, -12)])
    bloom = widen(air(1.5, 14000, 8000, 1.0, 6000, 54, 1.0), 1.0)
    x = smix((0, acc), (0, sparkle, -3), (0.16, swish, -10), (0.72, chord, -3), (0.72, fade(bloom, 0.3, 0.5), -14))
    x = hall(x, 0.18, 1.2, 7000, 0.01, 300, 54)
    return master(lead(mbcomp(x)), EV_LUFS, 's', max_len=2.4)


def fanfare():
    """a celebration built from drums, no brass or bells: a frame-drum rhythm that doubles in speed over a
    timpani roll that swells, into a full stab of strings, timpani, bass drum and heavy wood at 1.2 s, ringing
    out in a wide hall. ~2.4 s."""
    pat = [0.0, 0.3, 0.45, 0.6, 0.75, 0.83, 0.91, 0.99, 1.05, 1.11]
    hits = smix(*[(tt, pan(drumhit('v_framedrum_muted' if i % 2 == 0 else 'v_handdrum', (i % 3) - 1, 0.35, 7000, 5, -4),
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
    """a new page in the rule book: four big page turns, each slowed so it sounds huge and each one heavier and
    further right than the last, then the book is laid down and a low cello fifth over a rubbed bass drum
    rises under it and holds. ~2.5 s."""
    flips = [('k_book_flip_1', -2, -0.8, -6), ('k_card_fan_1', -3, -0.3, -4), ('k_book_flip_3', -2, 0.2, -2),
             ('k_book_flip_2', -4, 0.7, 0)]
    sw = smix(*[(i * 0.38, pan(HP(clip(n, 0.36, s_), 250), p), g) for i, (n, s_, p, g) in enumerate(flips)])
    settle = smix((0, LP(clip('k_book_place_1', 0.4, -4), 3500)), (0, drumhit('vs_timp_1', -3, 0.8, 600, 4, -6), -6))
    low = smix((0, LP(clip('vs_bassdrum_rub', 1.6), 260)),
               (0.05, pad([36, 43, 48], 1.6, attack=0.4, lpf=900, close=500, width=0.7, gains=[0, -2, -6]), -4))
    low = contour(low, [(0, -20), (0.6, 0), (1.3, -2), (1.6, -16)])
    x = smix((0, widen(sw, 0.6)), (1.5, settle, -2), (0.9, low, 0))
    x = hall(x, 0.24, 1.7, 5000, 0.02, 200, 56)
    return master(lead(mbcomp(x)), EV_LUFS, 's', max_len=2.6)


def portal():
    """a portal tearing open: a sharp tearing crack of air, then a long ethereal woosh run through two resonant
    band-passes sweeping in opposite directions and circling the stereo field faster and faster, widening and
    growing over a low rubbed-drum rumble until it is fully open at ~1.3 s, holding, then sealing. The swirl
    grows after the tear, so there is no riser into a hit. ~2.3 s."""
    tear = smix((0, shape(HP(clip('k_knife_slice_1', 0.25, -5), 800), 8, -6)), (0, click(0.006, 1500, 14000, 57), -2),
                (0, drumhit('v_framedrum_muted', 3, 0.2, 6000, 6, -8), -2), (0, clip('fs683101_whoosh', 0.3, 4), -6))
    tear = contour(tear, [(0, 0), (0.12, -8), (0.25, -40)])
    e = clip('fs462879_ethereal', 2.2, -2)
    a = autopan(bpsweep(e, 400, 4000, 1.3), 0.6, 5.0, 0.9)
    b = autopan(bpsweep(e, 5000, 900, 1.3), 0.8, 6.0, 0.9, np.pi)
    rumble = contour(LP(clip('vs_bassdrum_rub', 2.2), 220), [(0, -20), (1.2, 0), (2.2, -12)])
    swirl = smix((0, a), (0, b, -1), (0, rumble, -6))
    swirl = contour(swirl, [(0, -30), (0.3, -18), (1.2, 0), (1.9, -2), (2.2, -18)])
    x = smix((0, tear), (0.12, swirl, -1))
    x = hall(x, 0.3, 1.6, 6000, 0.02, 220, 57)
    return master(lead(mbcomp(x)), EV_LUFS - 1.0, 's', max_len=2.4)


def warp():
    """bent through space in two moves: a punched, distorted snap as space bends, then a backwards woosh and a
    slow swoosh flanged and pulled through a tape-speed dive, flying left to right and swelling, straight into a
    pitch-dropping timpani thud that lands the piece on the far side. ~2.1 s."""
    snap = smix((0, sat(norm(clip('k_punch_heavy_1', 0.3, -2)), 2.5)), (0, click(0.005, 2000, 12000, 58), -6),
                (0, drumhit('v_framedrum_muted', 2, 0.2, 7000, 6, -6), -4))
    snap = contour(snap, [(0, 0), (0.1, -6), (0.25, -40)])
    w = smix((0, clip('fs446010_backwoosh', None, 2)), (0.25, glide(clip('fs60027_swosh', None, -2), 0, -14), -2))
    w = flange(w, 0.6, 7.0, 0.6, 0.7)
    w = panmove(BP(w, 150, 10000), -0.9, 0.9)
    w = fade(trim(w, 1.4) if len(w) > SR * 1.4 else w, 0.05, 0.2)
    w = contour(w, [(0, -12), (0.8, -3), (1.15, 0)])
    land = smix((0, glide(drumhit('vs_timp_hi', 0, 1.0, 1200), 0, -12)), (0, LP(clip('k_soft_heavy_0', 0.4, -4), 2000), -4))
    land = fade(land, 0.03, 0.3)
    x = smix((0, snap), (0.1, norm(w), 4), (1.15, widen(land, 0.4), -6))
    x = hall(x, 0.2, 1.1, 5000, 0.01, 220, 58)
    return master(lead(mbcomp(x)), EV_LUFS - 1.0, 's', max_len=2.2)


def void():
    """pulled into nothing: a cinematic boom, wind and a whoosh played backwards so everything is sucked inward
    over a second (its reverb reversed too), cut off dead into silence, then one small dry implosion. ~1.4 s."""
    boom = smix((0, LP(clip('fs255111_boom', 1.6), 3000)), (0, LP(clip('fs146932_wind', 1.6, -3), 2500), -4),
                (0, clip('fs60013_whoosh', None, -5), -6))
    boom = hall(boom, 0.4, 1.2, 3000, 0.0, 150, 59)
    suck = fade(rev(C.st(boom)[:int(SR * 1.15)]), 0.3, 0.0)
    suck = contour(suck, [(0, -6), (1.13, 0), (1.15, -60)])
    pop = smix((0, drumhit('v_framedrum_muted', -5, 0.25, 1500, 6, -10)), (0, click(0.003, 500, 4000, 59), -12))
    x = smix((0, suck), (1.2, pop, -3))
    return master(mbcomp(x), EV_LUFS - 1.5, 's', max_len=1.5, glue=False)


def kidnap():
    """snatched: a scuffle of cloth and leather, a muffled sack thud, then a doppler whoosh dragging away into
    the distance (pitch sinking, filter closing) while dark wind rises behind it, and a far-off door slams
    in a big room, its echo hanging. ~2.8 s."""
    scuffle = smix((0, clip('k_cloth_2', 0.3)), (0.08, clip('k_cloth_3', 0.3), -2), (0.17, clip('k_leather_drop', 0.3), -3),
                   (0.22, clip('k_cloth_4', 0.25, 2), -4))
    sack = smix((0, LP(clip('k_soft_heavy_0', 0.4, -4), 1500)), (0, drumhit('v_bassdrum', -4, 0.6, 250), -3))
    away = glide(clip('fs462879_ethereal', 1.6, 2), 0, -10)
    away = sweep_lp(panmove(away, -0.3, 0.9), 7000, 500, 0.7)
    away = contour(away, [(0, -6), (0.25, 0), (1.5, -12)])
    wind = contour(LP(clip('fs146932_wind', 2.2, -2), 1400), [(0, -24), (1.0, -4), (1.8, 0), (2.2, -20)])
    door = LP(clip('k_door_close_1', 0.6, -3), 1800)
    x = smix((0, widen(scuffle, 0.5), -2), (0.28, sack, -1), (0.35, away, -5), (0.3, widen(wind, 0.8), -6),
             (1.7, plate(door, 0.6, 1.4, 2500, 0.03, 200, 61), -6))
    x = hall(x, 0.18, 1.5, 4000, 0.015, 200, 61)
    return master(mbcomp(x), EV_LUFS - 1.0, 's', max_len=2.9)


def kill():
    """an execution in two beats: the blade is drawn and cuts through the air into a heavy, dark impact
    (recorded dramatic hit, heavy punch, timpani tuned down) that is choked short; a breath later the body
    drops (padded heavy thud, felt bass drum) on a low timpani roll that swells under it and slowly dies. ~2.8 s."""
    blade = smix((0, HP(clip('k_draw_knife_1', 0.4), 900), -2), (0.16, clip('fs683101_whoosh', 0.2, 2), -4),
                 (0.2, clip('k_knife_slice_2', 0.25), -2))
    blade = contour(blade, [(0, -10), (0.25, -6)])
    hit = smix((0, shape(LP(clip('fs222517_hit', 1.0, -2), 5000), 5, -2)), (0, clip('k_punch_heavy_1', 0.4, -4), -3),
               (0, drumhit('vs_timp_1', -4, 1.0, 500), -3))
    hit = contour(hit, [(0, 0), (0.12, -4), (0.3, -24), (0.5, -40)])
    drop = smix((0, LP(clip('k_soft_heavy_0', 0.6, -6), 1400)), (0, drumhit('v_bassdrum', -5, 1.0, 220), -1),
                (0.02, LP(clip('k_leather_drop', 0.4, -5), 2500), -6))
    drop = fade(drop, 0.03, 0.2)
    roll = contour(LP(clip('vs_timp_roll_lo', 1.7, -3), 900), [(0, -18), (0.4, -6), (1.2, 0), (1.7, -18)])
    x = smix((0, widen(blade, 0.5)), (0.3, hit), (0.9, drop, -4), (0.75, widen(roll, 0.5), -2))
    x = hall(x, 0.16, 1.3, 3000, 0.01, 200, 62)
    return master(gap(mbcomp(x), 0.3), EV_LUFS, 's', max_len=2.9)


def reap():
    """the scythe: a long low swoosh swinging left to right and growing, the cut at its peak out of a breath of
    silence, and then a cold, hollow wind that rises after it, louder and wider, like something leaving. ~2.5 s."""
    swing = smix((0, glide(clip('fs60027_swosh', None, -6), 0, -3)), (0.05, glide(clip('fs60013_whoosh', None, -4), 0, -6), -4))
    swing = panmove(LP(swing, 6000), -0.9, 0.7)
    cutx = smix((0, clip('k_knife_slice_2', 0.3, -2)), (0, transient('k_chop', -3, 300, 9000, 5, -3, 0.2), -5))
    wind = BP(clip('fs146932_wind', 2.0, 1), 300, 5000)
    wind = contour(widen(wind, 0.9), [(0, -22), (0.5, -10), (1.3, 0), (1.7, -1), (2.0, -18)])
    x = smix((0, swing, -2), (0.36, cutx), (0.45, wind, -3))
    x = hall(x, 0.22, 1.4, 4500, 0.015, 220, 63)
    return master(gap(mbcomp(x), 0.36), EV_LUFS - 1.5, 's', max_len=2.6)


def spawn():
    """something appears: a soft rising pop (a drumskin tap with its pitch bent up, a puff of air), then the
    thing materialises: a bloom of high bowed violins and bright air that grows for a second, opens wide and
    holds before it fades. ~2.3 s."""
    tap = glide(drumhit('v_handdrum', -3, 0.3, 3000, 4, -6), -4, 5)
    puff = fade(BP(air(0.12, 3000, 6000, 0.04, 800, 64, 0.6), 600, 8000), 0.003, 0.05)
    pop = smix((0, tap), (0, puff, -6), (0, LP(clip('k_soft_medium_1', 0.3), 3000), -6))
    pop = contour(pop, [(0, 0), (0.15, -6), (0.3, -40)])
    blo = pad([76, 79, 84], 2.1, attack=0.4, lpf=7000, width=1.2, gains=[0, -3, -6], section='violin')
    blo = contour(blo, [(0, -26), (0.3, -16), (1.1, 0), (1.8, -3), (2.1, -14)])
    shimmer = fade(widen(air(1.6, 13000, 7000, 1.6, 5000, 64, 1.0), 1.0), 0.7, 0.4)
    x = smix((0, pop), (0.1, blo, -4), (0.2, shimmer, -12))
    x = hall(x, 0.2, 1.0, 8000, 0.01, 300, 64)
    return master(lead(mbcomp(x)), EV_LUFS - 2.0, 's', max_len=2.4)


def petrify():
    """flesh to stone: a crack as the curse lands, stone grinding and crackling as it spreads (carved stone,
    a stone rune dragged, fuse crackle, gravel) and getting louder, then the heavy settling thud of a statue and
    a trickle of dust and pebbles that keeps falling. ~2.4 s."""
    crack = smix((0, shape(clip('k_plank_1', 0.4, -3), 6, -3)), (0, LP(clip('k_chop', 0.3, -2), 5000), -3),
                  (0, click(0.005, 2000, 12000, 65), -8))
    grind = smix((0, LP(clip('fs743246_stone', None, -5), 6000)), (0.15, LP(clip('fs743232_carve', None, -4), 7000), -2),
                 (0.3, LP(clip('fs743246_stone', None, -7), 5000), -2),
                 (0.0, HP(clip('fs45650_fuse', 0.9), 2500), -10), (0.1, HP(clip('fs569746_gravel', 0.8), 1500), -10))
    grind = contour(widen(grind, 0.7), [(0, -12), (0.7, 0), (0.85, -6)])
    settle = smix((0, shape(clip('k_mining_4', 0.5, -5), 5, -2)), (0, drumhit('vs_timp_1', -3, 0.9, 500, 4, -4), -3),
                  (0, drumhit('v_bassdrum', -3, 0.8, 250), -4))
    dust = contour(HP(clip('fs462162_rubble', 1.5, 3), 1200), [(0, -6), (0.5, 0), (1.2, -2), (1.5, -20)])
    x = smix((0, crack), (0.12, grind, -3), (0.95, settle, -1), (1.0, widen(dust, 0.8), -6))
    x = hall(x, 0.16, 1.1, 4000, 0.01, 220, 65)
    return master(lead(mbcomp(x)), EV_LUFS - 1.0, 's', max_len=2.5)


def grenade():
    """a grenade going off: a tight, bright detonation (a recorded explosion pitched up and cut short over a
    chopped wood crack and a padded thump), then what it threw up comes back down: chips, dice and gravel
    skittering and pattering across the floor left and right, heaviest about a second in, then thinning. ~2.0 s."""
    det = smix((0, LP(clip('fs235968_explosion', 0.5, 3, 0.25), 7000)), (0, clip('k_chop', 0.2), -10),
               (0, click(0.005, 2000, 14000, 66), -6), (0, drumhit('v_bassdrum', 2, 0.4, 400), -6))
    det = contour(det, [(0, 0), (0.12, -6), (0.3, -30)])
    bits = []
    for i, (tt, n, s_, p, g) in enumerate([(0.3, 'k_chips_collide_2', 2, -0.6, -10), (0.5, 'k_dice_throw_1', 0, 0.5, -7),
                                           (0.7, 'k_chips_handle_1', 3, -0.2, -4), (0.9, 'k_chip_lay_1', 4, 0.7, -3),
                                           (1.1, 'k_chips_collide_2', 5, -0.7, -3), (1.35, 'k_dice_throw_1', 3, 0.3, -4),
                                           (1.6, 'k_chips_handle_1', 1, 0.6, -6)]):
        bits.append((tt, pan(HP(clip(n, 0.4, s_), 600), p), g))
    grit = contour(widen(HP(clip('fs569746_gravel', 1.8, 2), 900), 0.9), [(0, -24), (0.8, -2), (1.4, 0), (1.8, -20)])
    x = smix((0, det, -5), *[(a, b, g + 4) for a, b, g in bits], (0.2, grit, 2))
    x = hall(x, 0.14, 0.9, 7000, 0.008, 250, 66)
    return master(lead(mbcomp(x)), FX_GR, 's', max_len=2.1)
