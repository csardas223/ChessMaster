"""Group-6 (impl-6) mode sounds, synthesised from scratch (original, CC0). Run: python3 tools/g6_sounds.py [id ...]
Writes 16-bit mono WAVs into assets/modes/<id>/. No samples from any other product are used."""
import numpy as np, wave, os, sys
SR = 44100
ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'modes')
rng = np.random.default_rng(66)
def t(sec): return np.arange(int(SR * sec)) / SR
def noise(sec, lo, hi):
    n = int(SR * sec); X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0; y = np.fft.irfft(X, n); return y / (np.max(np.abs(y)) or 1)
def env(y, a, d): tt = np.arange(len(y)) / SR; return y * np.minimum(1, tt / a) * np.exp(-tt / d)
def tone(sec, f, d=1.0, kind='sin'):
    tt = t(sec); ph = 2 * np.pi * f * tt
    y = np.sin(ph) if kind == 'sin' else (np.sign(np.sin(ph)) * 0.6 if kind == 'sq' else 2 * (tt * f % 1) - 1)
    return y * np.exp(-tt / d)
def sweep(sec, f0, f1, d=1.0, kind='sin'):
    tt = t(sec); f = f0 * (f1 / f0) ** (tt / sec); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) if kind == 'sin' else np.sign(np.sin(ph)) * 0.6
    return y * np.exp(-tt / d)
def mix(*parts):
    n = max(int(o * SR) + len(y) for o, y in parts); out = np.zeros(n)
    for o, y in parts: s = int(o * SR); out[s:s + len(y)] += y
    return out
SOUNDS = {}
def snd(mid, name):
    def deco(fn): SOUNDS.setdefault(mid, []).append((name, fn)); return fn
    return deco
def save(mid, name, y, vol=0.8):
    os.makedirs(os.path.join(ROOT, mid), exist_ok=True)
    y = y / (np.max(np.abs(y)) or 1) * vol; fade = int(0.005 * SR); y[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(os.path.join(ROOT, mid, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype('<i2').tobytes())

# ---- reusable recipes ----
def r_coin(): return mix((0, tone(0.12, 1320, 0.08, 'sq') * 0.5), (0.07, tone(0.35, 1980, 0.15, 'sq') * 0.5))
def r_bonk(): return mix((0, env(noise(0.15, 200, 2500), 0.001, 0.03)), (0, sweep(0.2, 420, 160, 0.06) * 0.8))
def r_thunk(): return env(noise(0.12, 300, 3000), 0.0005, 0.02) + sweep(0.12, 300, 120, 0.03) * 0.6
def r_twang(): return mix((0, env(sweep(0.3, 330, 250, 0.12), 0.001, 0.12)), (0, env(noise(0.25, 1500, 7000), 0.01, 0.06) * 0.3))
def r_whoosh(): return env(noise(0.4, 400, 3000) * np.sin(np.pi * t(0.4) / 0.4), 0.05, 0.3)
def r_fall(): return mix((0, sweep(0.35, 500, 140, 0.3) * 0.5), (0.3, env(noise(0.25, 80, 1500), 0.001, 0.06)))
def r_gong(): tt = t(2.4); return sum(np.sin(2 * np.pi * f * tt) * np.exp(-tt / d) * a for f, d, a in [(110, 1.4, 1), (167, 1.0, 0.6), (231, 0.7, 0.4), (298, 0.5, 0.3), (412, 0.3, 0.2)]) * np.minimum(1, tt / 0.004)
def r_shotgun(): return mix((0, env(noise(0.6, 150, 9000), 0.0005, 0.06)), (0, env(sweep(0.4, 120, 40, 0.15), 0.001, 0.15) * 1.2), (0.03, env(noise(0.7, 100, 1200), 0.01, 0.2) * 0.4))
def r_pump(): return mix((0, env(noise(0.08, 800, 5000), 0.001, 0.02)), (0.16, env(noise(0.09, 600, 4000), 0.001, 0.025)))
def r_smoke(): return env(noise(0.5, 200, 2000), 0.03, 0.18) * 0.7
def r_banner(): return mix((0, tone(0.18, 523, 0.2) * 0.5), (0.09, tone(0.18, 659, 0.2) * 0.5), (0.18, tone(0.4, 784, 0.3) * 0.6))
def r_fanfare(): return mix(*[(i * 0.12, tone(0.5, f, 0.35, 'sq') * 0.35) for i, f in enumerate([523, 659, 784, 1046])])
def r_crumble(): return mix(*[(i * 0.05, env(noise(0.2, 100, 2500), 0.001, 0.04) * (1 - i * 0.12)) for i in range(7)])
def r_card(): return mix((0, env(noise(0.09, 2000, 9000), 0.002, 0.02)), (0.05, env(noise(0.06, 1000, 6000), 0.001, 0.015) * 0.6))
def r_tick(): return env(noise(0.04, 2000, 8000), 0.0005, 0.006)
def r_zap(): z = np.sign(np.sin(2 * np.pi * 90 * t(0.5))) * 0.4 + noise(0.5, 2000, 9000) * (rng.random(int(SR * 0.5)) > 0.6); return env(z, 0.002, 0.15)
def r_freeze(): return mix((0, sweep(0.5, 2400, 3600, 0.4) * 0.3), (0, env(noise(0.5, 4000, 10000), 0.01, 0.2) * 0.4))
def r_jump(): return sweep(0.3, 250, 900, 0.3, 'sq') * 0.5
def r_stone(): return mix((0, env(noise(0.4, 80, 900), 0.002, 0.1)), (0, sweep(0.3, 150, 60, 0.1) * 0.6))
def r_roar(): return env((noise(1.0, 80, 700) * (1 + 0.6 * np.sin(2 * np.pi * 28 * t(1.0)))), 0.08, 0.45)
def r_laugh(): return mix(*[(i * 0.16, env(sweep(0.13, 260 - i * 15, 180 - i * 15, 0.2, 'sq'), 0.01, 0.08) * 0.6) for i in range(4)])
def r_munch(): return mix(*[(i * 0.1, env(noise(0.07, 300, 2500), 0.002, 0.02)) for i in range(3)])
def r_blip(): return tone(0.1, 880, 0.05, 'sq') * 0.4
def r_warp(): return mix((0, sweep(0.8, 1200, 150, 2) * 0.5), (0, sweep(0.8, 1600, 220, 2) * 0.3), (0.4, sweep(0.4, 200, 1400, 0.5) * 0.4))
def r_wind(): return env(noise(2.0, 200, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * t(2.0))), 0.4, 1.5)
def r_heal(): return mix(*[(i * 0.07, tone(0.3, f, 0.2) * 0.4) for i, f in enumerate([660, 880, 1100, 1320])])
def r_hit(): return mix((0, env(noise(0.15, 500, 5000), 0.0005, 0.03)), (0, sweep(0.15, 700, 200, 0.05, 'sq') * 0.4))

TT = 'xvlHij1tgk8'
for n, f in [('step', lambda: env(noise(0.1, 150, 1500), 0.002, 0.03) * 0.6), ('twang', r_twang), ('launch', lambda: mix((0, env(sweep(0.15, 90, 240, 1), 0.04, 0.2) * 0.4), (0.13, r_whoosh() * 0.6))),
             ('bonk', r_bonk), ('fall', r_fall), ('coin', r_coin), ('thunk', r_thunk), ('roll', lambda: env(noise(0.6, 60, 500) * (1 + 0.3 * np.sin(2 * np.pi * 14 * t(0.6))), 0.02, 0.4)),
             ('castle', lambda: mix((0, env(noise(0.4, 60, 800), 0.001, 0.12)), (0, sweep(0.4, 110, 50, 0.2)))), ('build', lambda: mix((0, r_thunk()), (0.12, r_thunk() * 0.8))), ('roar', r_roar), ('fanfare', r_fanfare)]:
    SOUNDS.setdefault(TT, []).append((n, f))

def register(mid, names):
    for n in names: SOUNDS.setdefault(mid, []).append((n, globals()['r_' + n]))

if __name__ == '__main__':
    exec(open(os.path.join(os.path.dirname(__file__), 'g6_sounds_map.py')).read()) if os.path.exists(os.path.join(os.path.dirname(__file__), 'g6_sounds_map.py')) else None
    only = set(sys.argv[1:])
    for mid, lst in SOUNDS.items():
        if only and mid not in only: continue
        for name, fn in lst: save(mid, name, fn())
    print('ok', sum(len(v) for k, v in SOUNDS.items() if not only or k in only), 'sounds')
