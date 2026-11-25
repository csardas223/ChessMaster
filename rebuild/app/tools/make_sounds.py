"""Synthesise the game's sound effects (original, CC0). Run: python3 tools/make_sounds.py
Writes 16-bit mono WAVs to assets/sounds/. No samples from any other product are used."""
import numpy as np, wave, os
SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sounds')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)

def t(sec): return np.arange(int(SR*sec))/SR
def env(x, a=0.002, d=0.08):
    n=len(x); tt=np.arange(n)/SR
    e=np.minimum(1, tt/a)*np.exp(-tt/d); return x*e
def bandnoise(sec, lo, hi):
    n=int(SR*sec); X=np.fft.rfft(rng.standard_normal(n)); f=np.fft.rfftfreq(n,1/SR)
    X[(f<lo)|(f>hi)]=0; y=np.fft.irfft(X,n); return y/np.max(np.abs(y))
def tone(sec, f, d):
    tt=t(sec); return np.sin(2*np.pi*f*tt)*np.exp(-tt/d)
def knock(sec=0.16, body=(180, 420, 950), bright=(1800, 5200), dec=0.035, gain=1.0):
    """A wooden piece-on-board knock: short noise transient + a few damped resonances."""
    y = env(bandnoise(sec, *bright), 0.0008, 0.006)*0.55
    for k,f in enumerate(body):
        y += tone(sec, f*(1+rng.uniform(-0.01,0.01)), dec/(1+k*0.6))*(0.9/(k+1))
    return env(y, 0.0006, dec*1.4)*gain
def pad(y, sec): out=np.zeros(int(SR*sec)); out[:len(y)]+=y[:len(out)]; return out
def mix(*parts):
    n=max(int(o*SR)+len(y) for o,y in parts); out=np.zeros(n)
    for o,y in parts: s=int(o*SR); out[s:s+len(y)]+=y
    return out
def save(name, y, vol=0.8):
    y = y/ (np.max(np.abs(y)) or 1) * vol
    fade=int(0.004*SR); y[-fade:]*=np.linspace(1,0,fade)
    with wave.open(os.path.join(OUT, name+'.wav'),'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((y*32767).astype('<i2').tobytes())

save('move-self', knock(0.14, (210, 470, 1040), dec=0.03), 0.70)
save('move-opponent', knock(0.14, (190, 430, 980), dec=0.032), 0.62)
cap = mix((0, knock(0.18, (160, 380, 900), (2200, 7000), dec=0.04)), (0.018, knock(0.12, (260, 600, 1300), dec=0.022)*0.6))
save('capture', cap, 0.85)
save('castle', mix((0, knock(0.12, (200, 450, 1000), dec=0.028)), (0.11, knock(0.14, (190, 430, 980), dec=0.03))), 0.72)
chk = mix((0, knock(0.16, (200, 460, 1000), dec=0.03)), (0.0, tone(0.35, 880, 0.09)*0.22 + tone(0.35, 1320, 0.06)*0.12))
save('move-check', chk, 0.8)
save('promote', mix((0, knock(0.14, (210, 470, 1040), dec=0.03)), (0.05, tone(0.4, 660, 0.12)*0.25), (0.12, tone(0.45, 990, 0.14)*0.22)), 0.75)
save('game-start', mix((0, tone(0.5, 523.25, 0.16)*0.5), (0.09, tone(0.6, 783.99, 0.2)*0.45)), 0.6)
save('game-end', mix((0, tone(0.7, 783.99, 0.22)*0.45), (0.12, tone(0.7, 659.25, 0.22)*0.45), (0.24, tone(0.9, 523.25, 0.3)*0.5)), 0.6)
ill = tone(0.18, 140, 0.05)*0.7 + tone(0.18, 147, 0.05)*0.5
save('illegal', env(ill, 0.004, 0.06), 0.5)
save('notify', mix((0, tone(0.5, 1046.5, 0.12)*0.4), (0.07, tone(0.5, 1567.98, 0.1)*0.25)), 0.5)
save('tick', knock(0.06, (900, 2100, 4000), (4000, 9000), dec=0.008), 0.35)
# horror stinger for jumpscares: dissonant cluster + noise burst
tt=t(1.1); st=sum(np.sin(2*np.pi*f*tt) for f in (233, 247, 311, 466, 494))*np.exp(-tt/0.45)
st += bandnoise(1.1, 300, 6000)*np.exp(-tt/0.12)*1.4
save('jumpscare', env(st, 0.003, 0.5), 0.9)
save('explosion', env(bandnoise(0.9, 30, 2500)*1.0 + tone(0.9, 55, 0.25), 0.002, 0.25), 0.9)
print('ok', sorted(os.listdir(OUT)))
