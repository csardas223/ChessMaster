"""Gun King (AWFB4EzGtDc) gun sounds: our own synthesised WAVs (owner rule: mode effect sounds are synthesised,
never extracted from the video). Run: python3 tools/g4_gunking_sounds.py
Writes assets/modes/AWFB4EzGtDc/{pistol,shotgun,crossbow,machine,smg,reload,grenade}.wav (16-bit mono, 44.1 kHz).
arena (2026-11-25): one shot per gun with its own character, a magazine click for reloads and a grenade fuse/throw."""
import numpy as np, wave, os
SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'modes', 'AWFB4EzGtDc')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(11)


def tt(sec): return np.arange(int(SR * sec)) / SR


def bandnoise(sec, lo, hi):
    n = int(SR * sec); X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    X[(f < lo) | (f > hi)] = 0; y = np.fft.irfft(X, n); return y / (np.max(np.abs(y)) or 1)


def env(n, a, d):
    x = np.arange(n) / SR; return np.minimum(1, x / a) * np.exp(-x / d)


def sweep(sec, f0, f1, d):
    x = tt(sec); f = f0 * (f1 / f0) ** (x / sec); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-x / d)


def save(name, y, vol=0.8):
    y = y / (np.max(np.abs(y)) or 1) * vol
    fade = int(0.004 * SR); y[-fade:] *= np.linspace(1, 0, fade)
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((y * 32767).astype('<i2').tobytes())


def shot(sec, crack, body, dec_c, dec_b, thump_f, thump_d):
    n = int(SR * sec)
    y = bandnoise(sec, *crack) * env(n, 0.0005, dec_c) * 0.9
    y += bandnoise(sec, *body) * env(n, 0.001, dec_b) * 0.8
    y += sweep(sec, thump_f, thump_f * 0.45, thump_d) * 0.9
    return np.tanh(y * 1.6)


save('pistol', shot(0.22, (1800, 7000), (300, 1800), 0.012, 0.05, 150, 0.04), 0.75)
save('shotgun', shot(0.42, (900, 6000), (120, 1400), 0.03, 0.12, 95, 0.09), 0.85)
save('machine', shot(0.09, (2200, 8000), (400, 2400), 0.008, 0.022, 190, 0.018), 0.55)
# smg (m3-salvage: unlocked at 375 gold, transcript 8:40): lighter, higher and shorter than the machine gun
save('smg', shot(0.07, (2800, 9000), (600, 3000), 0.006, 0.016, 260, 0.014), 0.5)
# crossbow: string twang (fast falling pluck) + soft whoosh of the bolt
x = tt(0.3)
tw = sweep(0.3, 520, 260, 0.08) + 0.5 * sweep(0.3, 1040, 520, 0.05)
wh = bandnoise(0.3, 700, 3000) * env(len(x), 0.03, 0.08) * 0.35
save('crossbow', np.tanh((tw + wh) * 1.2), 0.7)
# reload: two metallic clicks
c = lambda: bandnoise(0.05, 2500, 9000) * env(int(SR * 0.05), 0.0003, 0.006) + 0.4 * sweep(0.05, 2400, 1800, 0.01)
r = np.zeros(int(SR * 0.28)); a = c(); r[:len(a)] += a; s = int(0.16 * SR); r[s:s + len(a)] += c() * 0.8
save('reload', r, 0.5)
# grenade throw: short whoosh + fuse hiss
n = int(SR * 0.35)
save('grenade', bandnoise(0.35, 400, 2500) * env(n, 0.05, 0.12) + 0.3 * bandnoise(0.35, 4000, 9000) * env(n, 0.01, 0.3), 0.45)
print('ok', sorted(os.listdir(OUT)))
