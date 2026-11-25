"""Group-1 (impl-1) mode sounds, synthesised from scratch (original, CC0). Run: python3 tools/g1_sounds.py
Writes 16-bit mono WAVs into assets/modes/<id>/. No samples from any other product are used."""
import numpy as np, wave, os
SR = 44100
ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'modes')
rng = np.random.default_rng(11)
def t(sec): return np.arange(int(SR * sec)) / SR
def noise(sec, lo, hi):
    n = int(SR * sec); X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0; y = np.fft.irfft(X, n); return y / (np.max(np.abs(y)) or 1)
def env(y, a, d): tt = np.arange(len(y)) / SR; return y * np.minimum(1, tt / a) * np.exp(-tt / d)
def sweep(sec, f0, f1, d=1.0):
    tt = t(sec); f = f0 * (f1 / f0) ** (tt / sec); ph = 2 * np.pi * np.cumsum(f) / SR; return np.sin(ph) * np.exp(-tt / d)
def save(mid, name, y, vol=0.8):
    os.makedirs(os.path.join(ROOT, mid), exist_ok=True)
    y = y / (np.max(np.abs(y)) or 1) * vol; fade = int(0.005 * SR); y[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(os.path.join(ROOT, mid, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype('<i2').tobytes())
def mix(*parts):
    n = max(int(o * SR) + len(y) for o, y in parts); out = np.zeros(n)
    for o, y in parts: s = int(o * SR); out[s:s + len(y)] += y
    return out
# rifle shot: sharp crack + low thump + short tail
save('AoREbapF7y0', 'shot', mix((0, env(noise(0.35, 300, 9000), 0.0005, 0.03)), (0, env(sweep(0.25, 160, 50, 0.08), 0.001, 0.08) * 0.8), (0.02, env(noise(0.4, 200, 1500), 0.01, 0.12) * 0.35)), 0.85)
# time warp: falling-rising chorus sweep
save('riHSnaWRQlY', 'warp', mix((0, sweep(0.7, 900, 180, 2) * 0.6), (0, sweep(0.7, 1350, 260, 2) * 0.35), (0.35, sweep(0.4, 200, 1200, 0.5) * 0.4)), 0.7)
# magnet zap: buzzy crackle
z = np.sign(np.sin(2 * np.pi * 120 * t(0.45))) * 0.3 + noise(0.45, 2000, 8000) * (rng.random(int(SR * 0.45)) > 0.7)
save('fRZmYTwLE54', 'zap', env(z, 0.003, 0.18), 0.6)
# portal whoosh
save('7csbf0L-uio', 'portal', mix((0, env(noise(0.5, 300, 2500), 0.12, 0.2)), (0, sweep(0.5, 300, 900, 0.4) * 0.4)), 0.7)
# minecraft-ish block place (soft thud), chest creak, TNT fuse hiss
save('Re3c-3qomgQ', 'place', env(noise(0.2, 80, 1200), 0.001, 0.04) + env(sweep(0.2, 140, 70, 0.05), 0.001, 0.05), 0.75)
save('Re3c-3qomgQ', 'chest', mix((0, env(sweep(0.25, 220, 330, 1) * (1 + 0.5 * np.sin(2 * np.pi * 30 * t(0.25))), 0.01, 0.2)), (0.22, env(noise(0.15, 100, 1500), 0.001, 0.03))), 0.6)
save('Re3c-3qomgQ', 'fuse', env(noise(0.6, 3000, 9000), 0.02, 0.5), 0.45)
# slingshot: stretch creak then twang
save('Ugw05nktuDM', 'launch', mix((0, env(sweep(0.18, 90, 260, 1), 0.05, 0.2) * 0.4), (0.16, env(sweep(0.35, 520, 300, 0.15), 0.001, 0.15)), (0.16, env(noise(0.2, 500, 4000), 0.001, 0.05) * 0.4)), 0.75)
# mine click + explosion handled by built-in 'explosion'; click for placing a mine/flag
save('vQ3hLgU6jLA', 'flag', env(noise(0.08, 1500, 6000), 0.0005, 0.015) + env(sweep(0.08, 1800, 1200, 0.03), 0.0005, 0.03) * 0.5, 0.6)
save('w15Ev7q2HmI', 'flag', env(noise(0.08, 1500, 6000), 0.0005, 0.015) + env(sweep(0.08, 1800, 1200, 0.03), 0.0005, 0.03) * 0.5, 0.6)
# containment alarm (two-tone)
a = np.concatenate([np.sin(2 * np.pi * f * t(0.22)) for f in (660, 440, 660, 440)])
save('Ji7frCIfmAQ', 'alarm', env(a, 0.01, 2.0), 0.5)
# sword swing + stab for the gravity platformer
save('rx-HCGCNuDo', 'swing', env(noise(0.22, 800, 6000), 0.03, 0.07), 0.6)
save('rx-HCGCNuDo', 'stab', mix((0, env(noise(0.12, 2000, 9000), 0.0005, 0.02)), (0, env(sweep(0.2, 900, 400, 0.08), 0.001, 0.08) * 0.6)), 0.75)
save('rx-HCGCNuDo', 'jump', env(sweep(0.18, 300, 700, 0.3), 0.003, 0.1), 0.5)
# square breaking
save('aSc3Cs0eo7g', 'break', mix((0, env(noise(0.4, 400, 7000), 0.0008, 0.06)), (0.03, env(noise(0.5, 60, 600), 0.005, 0.2) * 0.6)), 0.8)
