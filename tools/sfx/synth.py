"""Chess Master SFX synth: every game sound is generated here from scratch (no samples).
Run:  python3 tools/sfx/make_sfx.py   (needs numpy, scipy, ffmpeg for the .mp3 core set)
"""
import numpy as np
from scipy import signal

SR = 44100
RNG = np.random.default_rng(7)


def t(d):
    return np.arange(int(SR * d)) / SR


def silence(d):
    return np.zeros(int(SR * d))


def env(d, a=0.002, dec=0.1, curve=1.0):
    """attack then exponential decay (dec = time constant)."""
    x = t(d)
    e = np.exp(-x / max(dec, 1e-4)) ** curve
    na = max(1, int(SR * a))
    e[:na] *= np.linspace(0, 1, na) ** 0.7
    return e


def adsr(d, a=0.01, dcy=0.1, s=0.6, r=0.2):
    n = int(SR * d)
    na, nd, nr = int(SR * a), int(SR * dcy), int(SR * r)
    ns = max(0, n - na - nd - nr)
    e = np.concatenate([np.linspace(0, 1, na, endpoint=False), np.linspace(1, s, nd, endpoint=False),
                        np.full(ns, s), np.linspace(s, 0, nr)])
    return np.pad(e, (0, max(0, n - len(e))))[:n]


def sine(f, d, ph=0):
    """f may be a float or an array (frequency sweep)."""
    n = int(SR * d)
    f = np.broadcast_to(np.asarray(f, float), (n,)) if np.ndim(f) == 0 else np.asarray(f, float)[:n]
    return np.sin(2 * np.pi * np.cumsum(f) / SR + ph)


def sweep(f0, f1, d, shape='exp'):
    n = int(SR * d)
    if shape == 'exp':
        return f0 * (f1 / f0) ** np.linspace(0, 1, n)
    return np.linspace(f0, f1, n)


def saw(f, d):
    n = int(SR * d)
    f = np.broadcast_to(np.asarray(f, float), (n,)) if np.ndim(f) == 0 else np.asarray(f, float)[:n]
    ph = np.cumsum(f) / SR
    return 2 * (ph - np.floor(ph + 0.5))


def square(f, d, duty=0.5):
    n = int(SR * d)
    f = np.broadcast_to(np.asarray(f, float), (n,)) if np.ndim(f) == 0 else np.asarray(f, float)[:n]
    ph = np.cumsum(f) / SR
    return np.where((ph % 1) < duty, 1.0, -1.0)


def tri(f, d):
    return 2 * np.abs(saw(f, d)) - 1


def noise(d):
    return RNG.uniform(-1, 1, int(SR * d))


def pink(d):
    w = RNG.standard_normal(int(SR * d))
    b, a = [0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400]
    p = signal.lfilter(b, a, w)
    return p / (np.max(np.abs(p)) + 1e-9)


def _filt(x, kind, f, order=2):
    nyq = SR / 2
    if kind == 'band':
        lo, hi = max(20, f[0]) / nyq, min(f[1], nyq * 0.98) / nyq
        sos = signal.butter(order, [lo, hi], 'bandpass', output='sos')
    else:
        sos = signal.butter(order, min(f, nyq * 0.98) / nyq, kind, output='sos')
    return signal.sosfilt(sos, x)


def lp(x, f, o=2): return _filt(x, 'low', f, o)
def hp(x, f, o=2): return _filt(x, 'high', f, o)
def bp(x, lo, hi, o=2): return _filt(x, 'band', (lo, hi), o)


def reson(x, f, q=20):
    """resonant peak (wood / glass body)."""
    b, a = signal.iirpeak(f, q, SR)
    return signal.lfilter(b, a, x)


def mix(*parts):
    n = max(len(p) for p in parts)
    out = np.zeros(n)
    for p in parts:
        out[:len(p)] += p
    return out


def at(x, delay):
    return np.concatenate([silence(delay), x])


def seq(*items):
    """items: (delay_seconds, signal)"""
    return mix(*[at(s, d) for d, s in items])


def reverb(x, dur=0.6, wet=0.2, damp=4000, pre=0.008):
    n = int(SR * dur)
    ir = RNG.standard_normal(n) * np.exp(-np.arange(n) / (SR * dur / 5.5))
    ir = lp(ir, damp)
    ir = np.concatenate([np.zeros(int(SR * pre)), ir])
    ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
    w = signal.fftconvolve(x, ir)
    out = np.zeros(len(w))
    out[:len(x)] += x * (1 - wet * 0.5)
    out += w * wet
    return out


def delay_fx(x, time=0.12, fb=0.35, n=4, damp=5000):
    out = x.copy()
    cur = x
    for i in range(1, n + 1):
        cur = lp(cur, damp) * fb
        out = mix(out, at(cur, time * i))
    return out


def sat(x, drive=1.5):
    return np.tanh(x * drive) / np.tanh(drive)


def bell(f, d=1.2, dec=0.35, partials=((1, 1), (2.76, .35), (5.4, .15), (8.93, .06)), bright=1.0):
    out = np.zeros(int(SR * d))
    for r, a in partials:
        out += a * sine(f * r, d) * env(d, 0.001, dec / (r ** 0.5 * bright))
    return out


def pluck(f, d=0.6, dec=0.18, harm=6):
    out = np.zeros(int(SR * d))
    for h in range(1, harm + 1):
        out += (1 / h ** 1.3) * sine(f * h, d) * env(d, 0.001, dec / h ** 0.6)
    return out


def chord(freqs, fn, stagger=0.0, **kw):
    return mix(*[at(fn(f, **kw), i * stagger) for i, f in enumerate(freqs)])


def note(n):
    """midi -> Hz"""
    return 440.0 * 2 ** ((n - 69) / 12)


def finish(x, peak=0.89, fade=0.006, trim_db=-62):
    x = x - np.mean(x)
    x = hp(x, 28)
    m = np.max(np.abs(x)) + 1e-9
    x = x / m * peak
    # trim trailing silence
    th = 10 ** (trim_db / 20) * peak
    idx = np.where(np.abs(x) > th)[0]
    if len(idx):
        x = x[:min(len(x), idx[-1] + int(SR * 0.02))]
    nf = int(SR * fade)
    if len(x) > nf:
        x[-nf:] *= np.linspace(1, 0, nf)
    x[:16] *= np.linspace(0, 1, 16)
    return x


def write_wav(path, x):
    from scipy.io import wavfile
    wavfile.write(path, SR, (np.clip(x, -1, 1) * 32767).astype(np.int16))


def impulse(d, burst=0.002):
    """short noise burst padded to exactly d seconds."""
    n = int(SR * d)
    b = noise(burst)[:n]
    return np.pad(b, (0, n - len(b)))
