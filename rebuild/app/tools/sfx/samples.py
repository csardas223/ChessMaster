"""Sample layer for the Chess Master SFX pipeline.

Every sound is built from the short CC0 recordings in tools/sfx/sources/ (see sources.md):
load a clip, then pitch, EQ, layer, soften, add a small room and master it to a common loudness.
"""
import os, subprocess
from fractions import Fraction
import numpy as np
from scipy import signal
from synth import SR, lp, hp, bp, mix, at, silence, sat, RNG

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sources')
_cache = {}
USED = set()

CEIL = 10 ** (-6 / 20)   # peak ceiling: -6 dBFS
TARGET = -20.0           # momentary-max loudness (K-weighted, 200 ms) for a normal sound


def S(name, onset=True):
    """load tools/sfx/sources/<name>.ogg as mono float, peak 1.0, starting ~2 ms before its onset."""
    USED.add(name)
    if name not in _cache:
        r = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(SRC, name + '.ogg'), '-ac', '1', '-ar', str(SR),
                            '-f', 'f32le', '-'], capture_output=True, check=True)
        x = np.frombuffer(r.stdout, np.float32).astype(float)
        x = x - np.mean(x)
        _cache[name] = x / (np.max(np.abs(x)) + 1e-12)
    x = _cache[name].copy()
    if onset:
        i = int(np.argmax(np.abs(x) > 0.05))
        x = x[max(0, i - int(SR * 0.002)):]
        x[:32] *= np.linspace(0, 1, 32)
    return x


def db(v):
    return 10 ** (v / 20)


def g(x, v):
    return x * db(v)


def pitch(x, semis):
    """varispeed pitch shift (length changes too, like a tape)."""
    if abs(semis) < 1e-6:
        return x
    fr = Fraction(2 ** (-semis / 12)).limit_denominator(400)
    return signal.resample_poly(x, fr.numerator, fr.denominator)


def glide(x, s0, s1):
    """varispeed with pitch moving from s0 to s1 semitones across the source (lower = slower = longer)."""
    n = len(x)
    rate = 2 ** (np.linspace(s0, s1, n) / 12)
    tpos = np.cumsum(1 / rate)                   # output time at which each input sample is reached
    p = np.interp(np.arange(int(tpos[-1])), tpos, np.arange(n))
    return np.interp(p, np.arange(n), x)


def rev(x):
    return x[::-1].copy()


def cut(x, d, fade=0.03):
    n = min(len(x), int(SR * d))
    y = x[:n].copy()
    nf = min(n, int(SR * fade))
    if nf:
        y[-nf:] *= np.cos(np.linspace(0, np.pi / 2, nf)) ** 2
    return y


def fade_in(x, d):
    y = x.copy()
    n = min(len(y), max(1, int(SR * d)))
    y[:n] *= np.sin(np.linspace(0, np.pi / 2, n)) ** 2
    return y


def fade_out(x, d):
    y = x.copy()
    n = min(len(y), max(1, int(SR * d)))
    y[-n:] *= np.cos(np.linspace(0, np.pi / 2, n)) ** 2
    return y


def soften(x, ms=1.5, smooth=6000):
    """take the edge off a transient: short fade-in and a low-passed first few ms crossfading to the dry clip."""
    n = int(SR * 0.012)
    dark = lp(x, smooth, 2)
    w = np.ones(len(x))
    w[:n] = np.linspace(0, 1, n)
    return fade_in(dark * (1 - w) + x * w, ms / 1000)


def _biquad(x, b, a):
    return signal.lfilter(b, a, x)


def peq(x, f, gain_db, q=1.0):
    A = 10 ** (gain_db / 40)
    w = 2 * np.pi * f / SR
    al = np.sin(w) / (2 * q)
    b = [1 + al * A, -2 * np.cos(w), 1 - al * A]
    a = [1 + al / A, -2 * np.cos(w), 1 - al / A]
    return _biquad(x, np.array(b) / a[0], np.array(a) / a[0])


def shelf(x, f, gain_db, kind='low', s=0.8):
    A = 10 ** (gain_db / 40)
    w = 2 * np.pi * f / SR
    cw, sw = np.cos(w), np.sin(w)
    al = sw / 2 * np.sqrt((A + 1 / A) * (1 / s - 1) + 2)
    k = 2 * np.sqrt(A) * al
    if kind == 'low':
        b = [A * ((A + 1) - (A - 1) * cw + k), 2 * A * ((A - 1) - (A + 1) * cw), A * ((A + 1) - (A - 1) * cw - k)]
        a = [(A + 1) + (A - 1) * cw + k, -2 * ((A - 1) + (A + 1) * cw), (A + 1) + (A - 1) * cw - k]
    else:
        b = [A * ((A + 1) + (A - 1) * cw + k), -2 * A * ((A - 1) + (A + 1) * cw), A * ((A + 1) + (A - 1) * cw - k)]
        a = [(A + 1) - (A - 1) * cw + k, 2 * ((A - 1) - (A + 1) * cw), (A + 1) - (A - 1) * cw - k]
    return _biquad(x, np.array(b) / a[0], np.array(a) / a[0])


def warm(x, drive=1.3):
    """gentle tape-ish saturation (odd + a touch of even), level-matched."""
    y = np.tanh(drive * (x + 0.08 * x * x)) / np.tanh(drive)
    return y - np.mean(y)


def _ir(dur, damp, early, seed):
    rng = np.random.default_rng(seed)
    n = int(SR * dur)
    tt = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-tt / (dur / 6.0))
    ir = lp(ir, damp)
    ir[:int(SR * 0.002)] = 0
    for d, a in early:   # a few discrete early reflections: small wooden room
        k = int(SR * d)
        if k < n:
            ir[k] += a
    return ir / (np.sqrt(np.sum(ir ** 2)) + 1e-9)


def room(x, wet=0.12, size=0.35, damp=5500, seed=1):
    """small close room: a few early reflections and a short damped tail."""
    ir = _ir(size, damp, [(0.0031, 0.5), (0.0057, 0.35), (0.0089, 0.3), (0.0127, 0.2)], seed)
    w = signal.fftconvolve(x, ir)
    return mix(x * (1 - wet * 0.3), w * wet)


def hall(x, wet=0.25, size=2.2, damp=4500, seed=2):
    ir = _ir(size, damp, [(0.011, 0.25), (0.019, 0.2), (0.029, 0.15)], seed)
    w = signal.fftconvolve(x, ir)
    return mix(x * (1 - wet * 0.3), w * wet)


def lay(*items):
    """items: (time_s, signal[, gain_db])"""
    parts = []
    for it in items:
        tt, x = it[0], it[1]
        gd = it[2] if len(it) > 2 else 0
        parts.append(at(x * db(gd), tt))
    return mix(*parts)


def noise_bed(d, lo, hi):
    return bp(RNG.standard_normal(int(SR * d)), lo, hi) * 0.2


# ---------- loudness + mastering ----------
def _kweight(x):
    # ITU-R BS.1770 K-weighting at 44.1 kHz (high shelf + RLB high-pass)
    b1, a1 = [1.53090959, -2.65116903, 1.16916686], [1.0, -1.66375011, 0.71265753]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.98998385, 0.99000498]
    return signal.lfilter(b2, a2, signal.lfilter(b1, a1, x))


def loudness(x, win=0.2):
    """max short-window K-weighted loudness, LUFS-like (dB)."""
    y = _kweight(np.concatenate([x, np.zeros(int(SR * win))]))
    n = int(SR * win)
    p = np.convolve(y ** 2, np.ones(n) / n, 'valid')
    return -0.691 + 10 * np.log10(np.max(p) + 1e-12)


def limit(x, ceil=CEIL, release=0.06):
    """peak limiter: instant attack over a 1.5 ms window, smooth exponential release (used gently)."""
    from scipy.ndimage import minimum_filter1d
    k = int(SR * 0.0015)
    need = minimum_filter1d(np.minimum(1.0, ceil / (np.abs(x) + 1e-12)), 2 * k + 1)
    out = np.empty_like(need)
    r = np.exp(-1 / (SR * release))
    gcur = 1.0
    for i, v in enumerate(need):
        gcur = v if v < gcur else v + (gcur - v) * r
        out[i] = gcur
    h = np.hanning(2 * k + 1)
    out = np.convolve(out, h / h.sum(), 'same')
    return x * out


def master(x, rel=0.0, tail_db=-58, fade=0.015, max_len=None, gain_cap=24):
    """DC/rumble clean-up, loudness to TARGET+rel, soft peak limit at -6 dBFS, trim silence, fades."""
    x = np.asarray(x, float)
    x = hp(x - np.mean(x), 30)
    if max_len:
        x = cut(x, max_len, 0.05)
    L = loudness(x)
    gn = min(TARGET + rel - L, gain_cap)
    x = x * db(gn)
    if np.max(np.abs(x)) > CEIL:
        x = limit(x)
    x = x * min(1.0, CEIL / (np.max(np.abs(x)) + 1e-12))  # safety
    th = db(tail_db)
    idx = np.where(np.abs(x) > th)[0]
    if len(idx):
        x = x[:min(len(x), idx[-1] + int(SR * 0.03))]
    x = fade_out(x, min(fade, len(x) / SR / 4))
    x[:16] *= np.linspace(0, 1, 16)
    assert np.all(np.isfinite(x))
    return x
