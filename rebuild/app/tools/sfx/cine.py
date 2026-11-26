"""Cinematic / premium game-UI sound-design layer for the Chess Master SFX (v4).

Signals here are mono 1-D arrays or stereo (n, 2) arrays at 44.1 kHz. The building blocks are standard sound
design: filtered-noise risers, sine sub drops with a little saturation (so the boom still reads on phone speakers),
layered transients, a transient shaper, a 3-band compressor, a stereo plate, a mono-compatible widener (lows stay
mono), and a BS.1770 loudness meter with a true-peak limiter for mastering.
"""
import numpy as np
from scipy import signal
from scipy.ndimage import maximum_filter1d, minimum_filter1d
from synth import SR, lp, hp, bp

RNG = np.random.default_rng(404)


def db(v):
    return 10 ** (v / 20)


def T(d):
    return np.arange(int(SR * d)) / SR


# ---------------------------------------------------------------- stereo helpers
def st(x):
    """mono -> stereo (n, 2); stereo passes through."""
    x = np.asarray(x, float)
    return np.stack([x, x], 1) if x.ndim == 1 else x


def mono(x):
    x = np.asarray(x, float)
    return x if x.ndim == 1 else x.mean(1)


def smix(*parts):
    """mix mono/stereo parts (time, signal[, gain_db]) into one stereo signal."""
    items = []
    for p in parts:
        tt, x = p[0], st(p[1])
        gd = p[2] if len(p) > 2 else 0.0
        items.append((int(round(tt * SR)), x * db(gd)))
    n = max(o + len(x) for o, x in items)
    out = np.zeros((n, 2))
    for o, x in items:
        out[o:o + len(x)] += x
    return out


def lr4(x, f, kind):
    """Linkwitz-Riley 4th order (two cascaded Butterworth 2nd order), works on mono or stereo along axis 0."""
    sos = signal.butter(2, f / (SR / 2), kind, output='sos')
    return signal.sosfilt(sos, signal.sosfilt(sos, x, axis=0), axis=0)


def widen(x, amt=0.5, lo=280, ms=(7.3, 11.9)):
    """mono-compatible widener: the band above `lo` gets a decorrelated side signal (two short delays in
    opposite polarity), the band below stays mono. L+R is exactly the input, so nothing cancels in mono."""
    m = mono(x)
    hi = lr4(m, lo, 'high')
    d1, d2 = int(SR * ms[0] / 1000), int(SR * ms[1] / 1000)
    side = np.zeros_like(hi)
    side[d1:] += hi[:-d1]
    side[d2:] -= hi[:-d2]
    side = lp(side, 9000) * 0.5 * amt
    return np.stack([m + side, m - side], 1)


def pan(x, p):
    """constant-power pan of a mono signal, p in [-1, 1]."""
    a = (p + 1) * np.pi / 4
    m = mono(x)
    return np.stack([m * np.cos(a), m * np.sin(a)], 1) * np.sqrt(2)


# ---------------------------------------------------------------- envelopes / fades
def fade(x, a=0.0, r=0.0):
    y = np.array(x, float, copy=True)
    n = len(y)
    if a > 0:
        na = min(n, max(1, int(SR * a)))
        w = np.sin(np.linspace(0, np.pi / 2, na)) ** 2
        y[:na] = (y[:na].T * w).T
    if r > 0:
        nr = min(n, max(1, int(SR * r)))
        w = np.cos(np.linspace(0, np.pi / 2, nr)) ** 2
        y[-nr:] = (y[-nr:].T * w).T
    return y


def expenv(d, tau, a=0.001):
    e = np.exp(-T(d) / tau)
    na = max(1, int(SR * a))
    e[:na] *= np.linspace(0, 1, na)
    return e


def trim(x, d):
    return fade(np.asarray(x)[:int(SR * d)], 0, min(0.05, d / 4))


# ---------------------------------------------------------------- generators
def riser(d=0.55, f0=500.0, f1=16000.0, curve=2.2, floor_db=-48.0, width=0.6, q=0.35, tilt=0.0, seed=1):
    """filtered-noise riser: a resonant low-pass whose cutoff sweeps f0 -> f1 (log), level swelling from floor_db
    to 0 dB with a power curve. Synthesised in the STFT domain (smooth, no zipper). Returns stereo, partly
    decorrelated by `width`."""
    rng = np.random.default_rng(seed)
    nfft, hop = 2048, 256
    n = int(SR * d)
    frames = n // hop + 4
    f = np.fft.rfftfreq(nfft, 1 / SR)
    pos = np.linspace(0, 1, frames)
    fc = f0 * (f1 / f0) ** (pos ** 0.9)
    lvl = db(floor_db * (1 - pos ** (1 / curve)))
    F = np.maximum(f[:, None], 1.0)
    r = F / fc[None, :]
    H = 1 / np.sqrt(1 + r ** 6) * (1 + 1.6 * np.exp(-(np.log2(r)) ** 2 / (2 * q * q)))
    H *= np.clip(F / 180.0, 0, 1) ** 2                      # gentle low cut
    H *= (F / 1000.0) ** (tilt / 6.02 / 1.0) if tilt else 1
    H *= lvl[None, :]
    out = []
    base = rng.standard_normal((len(f), frames)) + 1j * rng.standard_normal((len(f), frames))
    for ch in range(2):
        other = rng.standard_normal((len(f), frames)) + 1j * rng.standard_normal((len(f), frames))
        Z = (base * np.sqrt(1 - width * 0.5) + other * np.sqrt(width * 0.5)) * H
        _, y = signal.istft(Z, SR, nperseg=nfft, noverlap=nfft - hop)
        out.append(y[:n])
    y = np.stack(out, 1)
    y /= np.max(np.abs(y)) + 1e-12
    return fade(y, 0.02, 0.004)


def air(d=0.12, f0=7000.0, f1=2500.0, tau=0.045, lo=1500.0, seed=3, width=0.7):
    """tiny filtered air/whoosh tail: band-limited noise with a falling band and a fast decay (stereo)."""
    rng = np.random.default_rng(seed)
    n = int(SR * d)
    nfft, hop = 1024, 128
    frames = n // hop + 4
    f = np.fft.rfftfreq(nfft, 1 / SR)
    pos = np.linspace(0, 1, frames)
    fc = f0 * (f1 / f0) ** pos
    F = np.maximum(f[:, None], 1.0)
    H = np.exp(-(np.log2(F / fc[None, :])) ** 2 / (2 * 0.8 ** 2)) * (1 - np.exp(-(F / lo) ** 2))
    out = []
    a = rng.standard_normal((len(f), frames)) + 1j * rng.standard_normal((len(f), frames))
    for ch in range(2):
        b = rng.standard_normal((len(f), frames)) + 1j * rng.standard_normal((len(f), frames))
        Z = (a * np.sqrt(1 - width * 0.5) + b * np.sqrt(width * 0.5)) * H
        _, y = signal.istft(Z, SR, nperseg=nfft, noverlap=nfft - hop)
        out.append(y[:n])
    y = np.stack(out, 1)
    y = (y.T * expenv(n / SR, tau, 0.002)).T
    return fade(y / (np.max(np.abs(y)) + 1e-12), 0.002, min(0.02, d / 3))


def sub(f0=70.0, f1=48.0, glide=0.12, d=1.6, tau=0.55, drive=1.6, a=0.002, harm_lp=420.0):
    """sine sub boom with an exponential pitch drop f0 -> f1 over `glide` s, exponential decay, then soft
    saturation for 2nd/3rd harmonics (so it translates to small speakers), low-passed."""
    t = T(d)
    k = np.log(f1 / f0) / max(glide, 1e-3)
    fr = np.where(t < glide, f0 * np.exp(k * t), f1)
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR)
    x *= expenv(d, tau, a)
    y = np.tanh(drive * (x + 0.12 * x * x)) / np.tanh(drive)
    y = lp(y - np.mean(y), harm_lp, 2)
    return fade(y / (np.max(np.abs(y)) + 1e-12), 0, min(0.15, d / 4))


def subdrop(f0=60.0, f1=32.0, d=1.6, tau=0.9, drive=1.4):
    """a slow descending sub (defeat, falling): pitch glides over the whole duration."""
    t = T(d)
    fr = f0 * (f1 / f0) ** (t / d) ** 0.7
    x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * expenv(d, tau, 0.004)
    y = lp(np.tanh(drive * x) / np.tanh(drive), 380, 2)
    return fade(y / (np.max(np.abs(y)) + 1e-12), 0, min(0.2, d / 4))


def thump(f0=150.0, f1=70.0, d=0.12, tau=0.035, drive=1.8):
    """short tonal low thump under a UI transient (kick-like pitch drop, fast decay)."""
    return sub(f0, f1, min(0.03, d / 3), d, tau, drive, a=0.0008, harm_lp=900.0)


def click(d=0.006, lo=2500.0, hi=14000.0, seed=5):
    """a 1-3 ms noise snap: the crisp front edge of a hit."""
    rng = np.random.default_rng(seed)
    x = bp(rng.standard_normal(int(SR * d)), lo, hi, 2)
    x *= expenv(d, d / 4, 0.0002)
    return x / (np.max(np.abs(x)) + 1e-12)


# ---------------------------------------------------------------- processors
def env_follow(x, att, rel):
    m = np.abs(mono(x))
    k = max(1, int(SR * att))
    m = maximum_filter1d(m, k, origin=-(k // 2) if k > 1 else 0)
    a = np.exp(-1 / (SR * rel))
    return signal.lfilter([1 - a], [1, -a], m)


def shape(x, attack_db=4.0, sustain_db=-3.0):
    """transient designer: boost the attack and/or tuck the sustain, from a fast/slow envelope ratio."""
    fast = env_follow(x, 0.0003, 0.012) + 1e-9
    slow = env_follow(x, 0.012, 0.09) + 1e-9
    r = np.clip(fast / slow, 0.25, 4.0)
    tr = np.clip((r - 1) / 1.0, 0, 1)                       # 1 at transients, 0 in steady state
    gdb = tr * attack_db + (1 - tr) * sustain_db
    gdb = signal.lfilter([0.05], [1, -0.95], gdb)            # de-zipper
    g = db(gdb)
    return (np.asarray(x).T * g).T


def comp(x, thr_db=-18.0, ratio=3.0, att=0.004, rel=0.12, knee=6.0):
    """feed-forward compressor (peak-ish envelope, soft knee), stereo-linked; no make-up gain."""
    e = 20 * np.log10(env_follow(x, att, rel) + 1e-9)
    over = e - thr_db
    gr = np.where(over <= -knee / 2, 0.0,
                  np.where(over >= knee / 2, over * (1 - 1 / ratio), (over + knee / 2) ** 2 / (2 * knee) * (1 - 1 / ratio)))
    return (np.asarray(x).T * db(-gr)).T


def mbcomp(x, xo=(140.0, 3200.0), thr=(-20.0, -22.0, -26.0), ratio=(2.5, 2.0, 2.0), att=(0.012, 0.004, 0.002),
           rel=(0.2, 0.12, 0.08)):
    """3-band compressor on LR4 crossovers (bands sum flat)."""
    x = np.asarray(x, float)
    lo = lr4(x, xo[0], 'low')
    rest = x - lo
    mid = lr4(rest, xo[1], 'low')
    hi = rest - mid
    out = 0
    for b, th, ra, a, r in zip((lo, mid, hi), thr, ratio, att, rel):
        out = out + comp(b, th, ra, a, r)
    return out


def peq(x, f, gain_db, q=1.0):
    A = 10 ** (gain_db / 40)
    w = 2 * np.pi * f / SR
    al = np.sin(w) / (2 * q)
    b = np.array([1 + al * A, -2 * np.cos(w), 1 - al * A])
    a = np.array([1 + al / A, -2 * np.cos(w), 1 - al / A])
    return signal.lfilter(b / a[0], a / a[0], x, axis=0)


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
    return signal.lfilter(np.array(b) / a[0], np.array(a) / a[0], x, axis=0)


def sat(x, drive=1.4):
    y = np.tanh(drive * np.asarray(x)) / np.tanh(drive)
    return y


def sweep_lp(x, f0, f1, curve=1.0, order=2):
    """time-varying low-pass: cutoff glides f0 -> f1 (log, with a power curve), applied in the STFT domain."""
    x = np.asarray(x, float)
    chans = [x] if x.ndim == 1 else [x[:, c] for c in range(x.shape[1])]
    nfft, hop = 2048, 256
    out = []
    for c in chans:
        f, tt, Z = signal.stft(c, SR, nperseg=nfft, noverlap=nfft - hop)
        pos = np.clip(np.linspace(0, 1, Z.shape[1]), 0, 1) ** curve
        fc = f0 * (f1 / f0) ** pos
        H = 1 / np.sqrt(1 + (np.maximum(f[:, None], 1) / fc[None, :]) ** (2 * order))
        _, y = signal.istft(Z * H, SR, nperseg=nfft, noverlap=nfft - hop)
        out.append(np.pad(y, (0, max(0, len(c) - len(y))))[:len(c)])
    return out[0] if x.ndim == 1 else np.stack(out, 1)


# ---------------------------------------------------------------- reverbs
def _plate_ir(decay, damp, pre, seed, density_ms=0.0):
    rng = np.random.default_rng(seed)
    n = int(SR * decay * 1.1)
    t = np.arange(n) / SR
    chans = []
    for c in range(2):
        w = rng.standard_normal(n)
        lo_ = lp(w, 900, 2)
        mid_ = bp(w, 900, damp, 2)
        hi_ = hp(w, damp, 2)
        ir = (lo_ * np.exp(-6.9 * t / decay) + mid_ * np.exp(-6.9 * t / (decay * 0.75)) +
              0.5 * hi_ * np.exp(-6.9 * t / (decay * 0.35)))
        na = int(SR * 0.004)
        ir[:na] *= np.linspace(0, 1, na)                     # soft onset, plate-like density from the start
        ir = np.concatenate([np.zeros(int(SR * pre)), ir])
        chans.append(ir)
    ir = np.stack(chans, 1)
    return ir / (np.sqrt(np.sum(ir ** 2) / 2) + 1e-12)


def plate(x, wet=0.18, decay=1.4, damp=5500.0, pre=0.012, lowcut=180.0, seed=11):
    """stereo plate: decorrelated L/R noise IRs, faster decay in the highs; lows below `lowcut` are kept out of
    the reverb so the sub stays tight and mono."""
    x = st(x)
    ir = _plate_ir(decay, damp, pre, seed)
    src = hp(mono(x), lowcut, 2)
    w = np.stack([signal.fftconvolve(src, ir[:, c]) for c in range(2)], 1)
    out = np.zeros((max(len(x), len(w)), 2))
    out[:len(x)] += x
    out[:len(w)] += w * wet
    return out


def room(x, wet=0.12, size=0.3, seed=21):
    """short bright room for UI sounds (early density + 0.3 s tail)."""
    return plate(x, wet, size, 9000.0, 0.004, 250.0, seed)


# ---------------------------------------------------------------- metering
def _kw(x):
    b1, a1 = [1.53090959, -2.65116903, 1.16916686], [1.0, -1.66375011, 0.71265753]
    b2, a2 = [1.0, -2.0, 1.0], [1.0, -1.98998385, 0.99000498]
    return signal.lfilter(b2, a2, signal.lfilter(b1, a1, x, axis=0), axis=0)


def _pow(x):
    y = _kw(st(x))
    return (y ** 2).sum(1)


def _movavg_max(p, n):
    c = np.concatenate([[0.0], np.cumsum(p)])
    return np.max((c[n:] - c[:-n]) / n) if len(p) >= n else p.sum() / n


def lufs_m(x):
    """max momentary loudness (400 ms window, BS.1770 K-weighting, stereo sum), LUFS."""
    p = _pow(np.concatenate([st(x), np.zeros((int(SR * 0.4), 2))]))
    n = int(SR * 0.4)
    return -0.691 + 10 * np.log10(_movavg_max(p, n) + 1e-20)


def lufs_s(x):
    """max short-term loudness (3 s window, zero padded like a meter that starts with the file), LUFS."""
    n = int(SR * 3)
    p = _pow(np.concatenate([np.zeros((n, 2)), st(x), np.zeros((n, 2))]))
    return -0.691 + 10 * np.log10(_movavg_max(p, n) + 1e-20)


def lufs_i(x):
    """integrated loudness with the BS.1770-4 absolute (-70) and relative (-10 LU) gates."""
    p = _pow(x)
    n, h = int(SR * 0.4), int(SR * 0.1)
    if len(p) < n:
        p = np.concatenate([p, np.zeros(n - len(p))])
    blocks = np.array([p[i:i + n].mean() for i in range(0, len(p) - n + 1, h)])
    L = -0.691 + 10 * np.log10(blocks + 1e-20)
    b = blocks[L > -70]
    if not len(b):
        return -70.0
    rel = -0.691 + 10 * np.log10(b.mean()) - 10
    b2 = blocks[L > rel]
    return -0.691 + 10 * np.log10(b2.mean() + 1e-20)


def true_peak(x):
    y = signal.resample_poly(st(x), 4, 1, axis=0)
    return 20 * np.log10(np.max(np.abs(y)) + 1e-12)


# ---------------------------------------------------------------- mastering
def limit(x, ceil_db=-1.6, release=0.05, look=0.0015):
    """stereo-linked look-ahead peak limiter on a 4x oversampled detector (true-peak aware)."""
    x = st(x)
    det = np.abs(signal.resample_poly(x, 4, 1, axis=0)).max(1)
    det = det.reshape(-1, 4).max(1) if len(det) % 4 == 0 else np.pad(det, (0, 4 - len(det) % 4)).reshape(-1, 4).max(1)
    det = det[:len(x)]
    c = db(ceil_db)
    need = np.minimum(1.0, c / (det + 1e-12))
    k = int(SR * look)
    need = minimum_filter1d(need, 2 * k + 1)
    out = np.empty_like(need)
    r = np.exp(-1 / (SR * release))
    g = 1.0
    for i, v in enumerate(need):
        g = v if v < g else v + (g - v) * r
        out[i] = g
    hw = np.hanning(2 * k + 1)
    out = np.minimum(np.convolve(out, hw / hw.sum(), 'same'), need * 1.0 + 0 * out)
    return (x.T * out).T


def master(x, target, metric='m', tp=-1.5, glue=True, tail_db=-62.0, fout=0.03, max_len=None, hpf=28.0):
    """DC + rumble clean-up, optional glue compression, loudness to `target` (metric 'm' momentary max or
    's' short-term max), true-peak limit to `tp` dBTP, trim the silent tail, click-free fades. Returns stereo."""
    x = st(x)
    x = x - x.mean(0)
    x = hp(x.T, hpf, 2).T if False else np.stack([hp(x[:, c], hpf, 2) for c in range(2)], 1)
    if max_len:
        x = fade(x[:int(SR * max_len)], 0, 0.06)
    if glue:
        x = comp(x * db(-np.max(20 * np.log10(np.abs(x).max() + 1e-12))), -10.0, 1.8, 0.01, 0.25)
    meter = lufs_m if metric == 'm' else lufs_s
    for _ in range(6):
        L = meter(x)
        x = x * db(target - L)
        if true_peak(x) > tp:
            x = limit(x, tp - 0.1)
        if abs(meter(x) - target) < 0.3:
            break
    x = x * db(min(0.0, tp - true_peak(x)))
    th = db(tail_db)
    idx = np.where(np.abs(x).max(1) > th)[0]
    if len(idx):
        x = x[:min(len(x), idx[-1] + int(SR * 0.02))]
    x = x - x.mean(0)                     # no residual offset after limiting and trimming
    x = fade(x, 0.0008, min(fout, len(x) / SR / 4))
    assert np.all(np.isfinite(x))
    return x
