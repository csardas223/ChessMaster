#!/usr/bin/env python3
"""Group 5 sound effects, synthesised from scratch (CC0): python3 tools/g5_sounds.py -> assets/modes/<id>/*.wav"""
import numpy as np, wave, os
SR = 22050
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'modes')
rng = np.random.default_rng(5)
def t(sec): return np.arange(int(SR * sec)) / SR
def noise(sec, lo=0, hi=SR / 2):
    n = int(SR * sec); X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0; y = np.fft.irfft(X, n); return y / (np.max(np.abs(y)) or 1)
def env(y, a=0.003, d=0.2):
    tt = np.arange(len(y)) / SR; return y * np.minimum(1, tt / a) * np.exp(-tt / d)
def sine(sec, f, d=0.3, a=0.003):
    tt = t(sec); f = np.broadcast_to(f, tt.shape); ph = 2 * np.pi * np.cumsum(f) / SR; return env(np.sin(ph), a, d)
def mix(*parts):
    n = max(int(o * SR) + len(y) for o, y in parts); out = np.zeros(n)
    for o, y in parts: s = int(o * SR); out[s:s + len(y)] += y
    return out
def save(mid, name, y, vol=0.8):
    d = os.path.join(ROOT, mid); os.makedirs(d, exist_ok=True)
    y = y / (np.max(np.abs(y)) or 1) * vol; fade = int(0.01 * SR); y[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(os.path.join(d, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype('<i2').tobytes())

def gong():
    y = sum(sine(2.2, f, 0.9 - k * 0.12) * (1 / (k + 1)) for k, f in enumerate((110, 163, 227, 301, 412)))
    return mix((0, y), (0, env(noise(0.05, 200, 3000), 0.001, 0.02) * 0.3))
def blast():
    return mix((0, env(noise(0.7, 60, 5000), 0.001, 0.12)), (0, sine(0.5, np.linspace(120, 40, int(SR * 0.5)), 0.15) * 0.8))
def reload():
    c = lambda: env(noise(0.06, 1500, 7000), 0.0005, 0.01)
    return mix((0, c()), (0.12, c() * 0.8), (0.14, sine(0.08, 900, 0.02) * 0.4))
def honk():
    tt = t(0.32); y = np.sign(np.sin(2 * np.pi * (380 + 40 * np.sin(2 * np.pi * 7 * tt)) * tt)) * 0.6 + np.sin(2 * np.pi * 760 * tt) * 0.3
    return env(y, 0.01, 0.25)
def slash():
    tt = t(0.22); return env(noise(0.22, 1200, 9000) * np.sin(np.pi * tt / 0.22), 0.02, 0.2)
def zap():
    return env(sine(0.35, np.linspace(1400, 200, int(SR * 0.35)), 0.2) + noise(0.35, 2000, 8000) * 0.3, 0.001, 0.12)
def chime(fs=(784, 988, 1175)):
    return mix(*[(k * 0.09, sine(0.9, f, 0.35)) for k, f in enumerate(fs)])
def poof():
    return env(noise(0.4, 100, 1500), 0.02, 0.15)
def whoosh():
    tt = t(0.45); return noise(0.45, 300, 3000) * np.sin(np.pi * tt / 0.45) ** 2
def thud():
    return env(sine(0.3, np.linspace(160, 60, int(SR * 0.3)), 0.12) + noise(0.3, 50, 400) * 0.4, 0.001, 0.1)
def gunshot():
    return mix((0, env(noise(0.35, 300, 9000), 0.0005, 0.05)), (0, sine(0.2, 90, 0.06) * 0.6))
def bow():
    return mix((0, sine(0.25, np.linspace(300, 180, int(SR * 0.25)), 0.1)), (0.02, whoosh()[:int(SR * 0.3)] * 0.5))
def fanfare():
    return mix(*[(k * 0.14, sine(0.5 if k < 3 else 1.0, f, 0.3 if k < 3 else 0.6)) for k, f in enumerate((523, 659, 784, 1047))])
def tick():
    return env(sine(0.05, 2000, 0.01), 0.0005, 0.01)
def glass():
    return mix(*([(k * 0.01, env(noise(0.5, 3000 + k * 900, 9000), 0.0005, 0.12) * (1 - k * 0.15)) for k in range(5)] + [(0, chime((2093, 2637)) * 0.3)]))

if __name__ == '__main__':
    save('WEYUcaJTBso', 'gong', gong()); save('WEYUcaJTBso', 'arrest', chime((660, 880, 1320)))
    save('Y7KKKTTkwNk', 'honk', honk())
    save('NK4Upb_s8Ok', 'blast', blast()); save('NK4Upb_s8Ok', 'reload', reload())
    save('Kzt9ItpGtYg', 'slash', slash()); save('Kzt9ItpGtYg', 'zap', zap()); save('Kzt9ItpGtYg', 'coin', chime((1319, 1760)))
    save('DMtaRFMpCWc', 'hit', slash()); save('DMtaRFMpCWc', 'clear', fanfare())
    save('_RFXN1Ye3sY', 'victory', fanfare()); save('_RFXN1Ye3sY', 'shatter', glass()); save('_RFXN1Ye3sY', 'reap', whoosh())
    save('OO3XlFQ32i0', 'poof', poof())
    save('PszkLYudcws', 'gunshot', gunshot()); save('PszkLYudcws', 'bow', bow()); save('PszkLYudcws', 'swipe', slash()); save('PszkLYudcws', 'zap', zap())
    save('d8pJkdxtXAA', 'win', fanfare()); save('d8pJkdxtXAA', 'whoosh', whoosh())
    save('RDl-EmbTRWc', 'fall', whoosh()); save('RDl-EmbTRWc', 'thud', thud())
    save('SMOXF1bSsDk', 'collapse', thud())
    save('UzoZVdmGpyc', 'jump', sine(0.18, np.linspace(300, 700, int(SR * 0.18)), 0.12)); save('UzoZVdmGpyc', 'crown', fanfare())
    save('c-_Th-jjfyM', 'tick', tick())
    save('M0rsyuvaTrk', 'achievement', chime((523, 784, 1047, 1568)))
