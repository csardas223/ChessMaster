#!/usr/bin/env python3
"""g6-3d (2026-11-25): our own synthesised sounds for the three real-3D modes (owner rule: mode effect sounds are our
own synthesised WAVs, never audio extracted from the videos).

  python3 tools/g6_3d_sounds.py      (from rebuild/app)

Beyond the Board (xlErokL2-4c):
  sinking_hymn.wav  ~26 s loop: a slow four-voice minor chorale whose top line keeps sinking (D minor, organ/choir
                    additive voices, slow vibrato, soft attack, Schroeder reverb). Starts when the rook falls off the plank.
  beam.wav          the Eldritch King's beam (rising whine into a noisy zap)
  kidnap.wav        the kidnapping cutscene (low rumble + downward sweep)
  button.wav        a stone switch clicking in
Who Takes the Crown (iqfHW2_sMmc, zDFsnRE_Gig):
  jump.wav, superjump.wav, land.wav, fall.wav  the pawn climber
"""
import os, wave, struct, math, random
import numpy as np

APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 22050
rng = np.random.default_rng(7)


def write(path, x, sr=SR):
    x = np.asarray(x, dtype=np.float64)
    peak = np.max(np.abs(x)) or 1.0
    x = np.clip(x / peak * 0.85, -1, 1)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((x * 32767).astype('<i2').tobytes())
    print(path, f'{len(x) / sr:.2f}s', os.path.getsize(path) // 1024, 'KB')


def env(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na) ** 1.6
    if nr: e[-nr:] *= np.linspace(1, 0, nr) ** 1.4
    return e


def midi(m): return 440.0 * 2 ** ((m - 69) / 12)


def voice(freq, dur, bright=1.0, vib=5.0):
    n = int(dur * SR); t = np.arange(n) / SR
    v = 1 + 0.004 * np.sin(2 * np.pi * vib * t + rng.uniform(0, 6)) * np.clip(t / 0.8, 0, 1)
    ph = 2 * np.pi * np.cumsum(freq * v) / SR
    out = np.zeros(n)
    for h, a in [(1, 1.0), (2, .45 * bright), (3, .22 * bright), (4, .12 * bright), (5, .06 * bright), (6, .03 * bright)]:
        out += a * np.sin(h * ph + rng.uniform(0, 6))
    return out


def reverb(x, wet=.35):
    out = np.zeros(len(x) + SR * 3)
    out[:len(x)] += x
    y = np.zeros_like(out)
    for d, g in [(1557, .84), (1617, .83), (1491, .82), (1422, .81)]:
        buf = np.zeros_like(out)
        for i in range(0, len(out), d):   # block comb filter
            seg = out[i:i + d].copy()
            if i >= d: seg += g * buf[i - d:i - d + len(seg)]
            buf[i:i + len(seg)] = seg
        y += buf
    for d, g in [(225, .5), (556, .5)]:   # allpass
        z = np.zeros_like(y)
        for i in range(len(y)):
            xi = y[i]; yd = z[i - d] if i >= d else 0.0; xd = y[i - d] if i >= d else 0.0
            z[i] = -g * xi + xd + g * yd
        y = z
    return out * (1 - wet) + y / 4 * wet


def hymn():
    # (bass, tenor, alto, soprano) midi per chord, 3.2 s each; the soprano keeps sinking
    chords = [
        (38, 53, 57, 74),   # Dm
        (34, 53, 58, 72),   # Bb
        (31, 50, 58, 70),   # Gm
        (33, 52, 57, 69),   # A
        (38, 50, 57, 67),   # Dm / G-ish suspension
        (29, 48, 57, 65),   # F
        (31, 46, 55, 62),   # Gm
        (33, 49, 52, 61),   # A
    ]
    dur = 3.2
    total = int(len(chords) * dur * SR)
    mix = np.zeros(total + int(SR * 1.5))
    for k, ch in enumerate(chords):
        start = int(k * dur * SR)
        for j, m in enumerate(ch):
            d = dur + 1.0
            v = voice(midi(m), d, bright=.6 if j == 0 else 1.0) * env(int(d * SR), .9, 1.2) * (.9 if j == 0 else .55)
            mix[start:start + len(v)] += v
    # low drone on D that slowly falls a quarter tone over the loop (the sinking)
    t = np.arange(len(mix)) / SR
    f = midi(26) * (1 - 0.03 * t / t[-1])
    mix += .35 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.clip(t / 2, 0, 1)
    wet = reverb(mix[:total + SR], wet=.45)[:total]
    # make it loop: fold the tail into the start
    tail = reverb(mix[:total + SR], wet=.45)[total:total + SR]
    wet[:len(tail)] += tail * np.linspace(1, 0, len(tail))
    return wet


def sweep(f0, f1, dur, kind='sin'):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (t / dur)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) if kind == 'sin' else np.sign(np.sin(ph)) * .5


def noise(dur, lp=0.2):
    n = int(dur * SR); x = rng.standard_normal(n); y = np.zeros(n); a = 0.0
    for i in range(n): a += lp * (x[i] - a); y[i] = a
    return y


def main():
    btb = os.path.join(APP, 'assets/modes/xlErokL2-4c')
    write(os.path.join(btb, 'sinking_hymn.wav'), hymn())
    b = sweep(300, 1400, .35) * env(int(.35 * SR), .3, .02)
    z = (sweep(900, 120, .5, 'sq') * .6 + noise(.5, .5)) * env(int(.5 * SR), .005, .4)
    write(os.path.join(btb, 'beam.wav'), np.concatenate([b * .5, z]))
    k = (noise(1.6, .03) * 3 + sweep(220, 40, 1.6) * .6) * env(int(1.6 * SR), .2, .8)
    write(os.path.join(btb, 'kidnap.wav'), k)
    c = (noise(.12, .6) + sweep(180, 90, .12) * 1.5) * env(int(.12 * SR), .002, .1)
    write(os.path.join(btb, 'button.wav'), c)
    snd = {
        'jump': sweep(330, 660, .14, 'sq') * env(int(.14 * SR), .005, .08),
        'superjump': (sweep(220, 1320, .55, 'sq') * .7 + sweep(440, 2640, .55) * .3) * env(int(.55 * SR), .01, .25),
        'land': (noise(.09, .35) + sweep(140, 70, .09)) * env(int(.09 * SR), .002, .08),
        'fall': sweep(900, 110, 1.1) * env(int(1.1 * SR), .02, .4),
    }
    for mid in ('iqfHW2_sMmc', 'zDFsnRE_Gig'):
        for name, x in snd.items():
            write(os.path.join(APP, 'assets/modes', mid, name + '.wav'), x)


if __name__ == '__main__':
    main()
