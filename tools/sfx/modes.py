"""Mode effect sounds and result stings. Every recipe is original synthesis."""
from synth import *
from core import tock, explosion, jumpscare, tick


# ---------- results ----------
def victory():
    """triumphant rising fanfare + sparkle burst: the dopamine hit."""
    d = 1.8
    brass = lambda f, dd: lp(mix(saw(f, dd), 0.6 * saw(f * 1.004, dd), 0.5 * square(f * 0.5, dd)), 3200) * adsr(dd, 0.012, 0.08, 0.7, 0.12)
    line = [(0.0, 67, 0.12), (0.12, 72, 0.12), (0.24, 76, 0.12), (0.36, 79, 0.9)]
    lead = mix(*[at(brass(note(n), dd) * 0.35, s) for s, n, dd in line])
    harm = at(mix(*[brass(note(n), 1.0) * 0.18 for n in (64, 67, 72)]), 0.36)
    sparks = mix(*[at(bell(note(n), 0.7, 0.12, bright=1.5) * 0.18, 0.36 + i * 0.05) for i, n in enumerate((91, 96, 100, 103, 108))])
    boom = at(sine(sweep(110, 50, 0.4), 0.4) * env(0.4, 0.002, 0.12) * 0.6, 0.36)
    cym = at(hp(noise(1.2), 6000) * env(1.2, 0.002, 0.35) * 0.12, 0.36)
    return finish(reverb(mix(lead, harm, sparks, boom, cym), 1.4, 0.28))


def defeat():
    """gentle falling minor phrase, soft, not punishing."""
    d = 1.6
    tone = lambda f, dd: lp(mix(tri(f, dd), 0.3 * saw(f, dd)), 1800) * adsr(dd, 0.02, 0.1, 0.6, 0.3)
    x = mix(at(tone(note(67), 0.35) * 0.5, 0), at(tone(note(63), 0.35) * 0.5, 0.3),
            at(mix(tone(note(60), 1.0), tone(note(55), 1.0) * 0.6, tone(note(48), 1.0) * 0.5) * 0.45, 0.6))
    return finish(reverb(x, 1.3, 0.3), peak=0.8)


def draw():
    """neutral open fifth chime, settles."""
    x = mix(bell(note(72), 1.3, 0.4) * 0.5, at(bell(note(79), 1.3, 0.4) * 0.45, 0.12),
            at(lp(tri(note(60), 1.2), 1500) * adsr(1.2, 0.05, 0.2, 0.4, 0.6) * 0.3, 0.12))
    return finish(reverb(x, 1.1, 0.28), peak=0.8)


# ---------- reusable gestures ----------
def whoosh(d=0.3, lo=500, hi=4000, rise=True):
    n = noise(d)
    out = np.zeros_like(n)
    steps = 12
    seg = len(n) // steps
    for i in range(steps):
        k = i / (steps - 1)
        k = k if rise else 1 - k
        c = lo * (hi / lo) ** k
        out[i * seg:(i + 1) * seg] = bp(n, c * 0.7, c * 1.4)[i * seg:(i + 1) * seg]
    return out * adsr(d, d * 0.5, d * 0.2, 0.6, d * 0.3)


def coin(base=988):
    d = 0.6
    x = mix(square(base, 0.07) * env(0.07, 0.001, 0.05) * 0.3, at(square(base * 4 / 3, d) * env(d, 0.001, 0.12) * 0.3, 0.07),
            at(bell(base * 8 / 3, d, 0.12) * 0.25, 0.07))
    return finish(reverb(lp(x, 9000), 0.5, 0.15), peak=0.75)


def jump():
    d = 0.16
    return finish(square(sweep(300, 900, d), d, 0.25) * env(d, 0.002, 0.07) * 0.6 + sine(sweep(300, 900, d), d) * env(d, 0.002, 0.06) * 0.6, peak=0.7)


def superjump():
    d = 0.55
    s = mix(square(sweep(220, 1500, d), d, 0.3) * 0.4, sine(sweep(220, 1500, d), d) * 0.6) * adsr(d, 0.005, 0.1, 0.8, 0.2)
    trill = sine(sweep(1500, 2400, d) * (1 + 0.03 * np.sin(2 * np.pi * 30 * t(d))), d) * adsr(d, 0.2, 0.1, 0.5, 0.2) * 0.25
    return finish(reverb(mix(s, trill, whoosh(d, 600, 5000) * 0.3), 0.4, 0.15), peak=0.75)


def land():
    d = 0.1
    return finish(mix(sine(sweep(160, 60, d), d) * env(d, 0.001, 0.03), lp(noise(d), 1500) * env(d, 0.001, 0.015) * 0.6), peak=0.75)


def fall(d=1.1):
    s = mix(sine(sweep(1400, 120, d), d), 0.3 * square(sweep(1400, 120, d), d, 0.4)) * adsr(d, 0.01, 0.1, 0.7, 0.2) * 0.5
    return finish(reverb(lp(s, 5000), 0.5, 0.15), peak=0.7)


def gunshot(d=0.4, body=110, tail=0.12, bright=1.0):
    crack = hp(noise(0.02), 2000) * env(0.02, 0.0003, 0.004) * 1.2 * bright
    blast = lp(noise(d), 4000) * env(d, 0.0008, tail * 0.5)
    thump = sine(sweep(body * 1.6, body * 0.5, 0.15), 0.15) * env(0.15, 0.0005, 0.035) * 1.2
    return sat(reverb(mix(crack, blast, thump), d, 0.18, 4000), 2.2)


def mech_click(f=2500):
    d = 0.04
    return reson(impulse(d, 0.002), f, 18) * 4 * env(d, 0.0002, 0.01)


def reload():
    x = seq((0, mech_click(1800)), (0.06, bp(noise(0.08), 1200, 5000) * adsr(0.08, 0.01, 0.02, 0.6, 0.03) * 0.5), (0.15, mech_click(3200)), (0.165, mech_click(2600)))
    return finish(x, peak=0.75)


def zap(d=0.4, f0=2400, f1=200):
    base = saw(sweep(f0, f1, d) * (1 + 0.25 * square(60, d)), d) * 0.5
    crackle = hp(noise(d) * (RNG.uniform(0, 1, int(SR * d)) > 0.93), 3000) * 0.5
    return finish(reverb(mix(bp(base, 200, 8000), crackle) * env(d, 0.001, d * 0.35), 0.4, 0.2), peak=0.8)


def gong(d=2.4):
    partials = [(1, 1), (1.47, .6), (1.98, .5), (2.44, .35), (2.94, .3), (3.56, .2), (4.2, .15), (5.3, .1)]
    f = 92
    x = np.zeros(int(SR * d))
    for r, a in partials:
        wob = 1 + 0.004 * np.sin(2 * np.pi * (0.8 + r) * t(d))
        x += a * sine(f * r * wob, d) * env(d, 0.004 + 0.02 * r / 5, d * 0.45 / r ** 0.4)
    hit = lp(noise(0.05), 1200) * env(0.05, 0.001, 0.01) * 0.6
    return finish(reverb(mix(x, hit), 2.0, 0.3, 3000))


def laugh():
    """goofy synthetic 'ha-ha-ha' (vowel formants), cartoon troll."""
    out = []
    for i, f0 in enumerate((260, 240, 225, 205)):
        d = 0.12
        src = saw(f0 * (1 + 0.04 * np.sin(2 * np.pi * 9 * t(d))), d)
        v = mix(bp(src, 650, 900) * 1.2, bp(src, 1050, 1300) * 0.8, bp(src, 2500, 2900) * 0.3)
        h = hp(noise(0.03), 1500) * env(0.03, 0.002, 0.01) * 0.3
        out.append((i * 0.14, mix(h, at(v * adsr(d, 0.01, 0.03, 0.7, 0.05), 0.02))))
    return finish(reverb(seq(*out), 0.4, 0.15), peak=0.8)


def portal(d=0.55):
    f = sweep(200, 1200, d)
    s = mix(sine(f * (1 + 0.05 * np.sin(2 * np.pi * 18 * t(d))), d), 0.5 * sine(f * 1.5, d)) * adsr(d, 0.05, 0.1, 0.7, 0.25) * 0.4
    return finish(reverb(mix(s, whoosh(d, 300, 6000) * 0.5, at(bell(note(96), 0.5, 0.1) * 0.2, d * 0.7)), 0.7, 0.3), peak=0.8)


def warp(d=0.8):
    f = sweep(1500, 120, d)
    s = mix(saw(f, d) * 0.3, sine(f * 0.5, d) * 0.5) * (0.6 + 0.4 * np.sin(2 * np.pi * sweep(25, 4, d, 'lin').cumsum() / SR))
    return finish(reverb(lp(s, 5000) * adsr(d, 0.01, 0.1, 0.7, 0.3), 0.8, 0.3), peak=0.8)


def spawn():
    d = 0.45
    arp = mix(*[at(bell(note(n), 0.35, 0.08, bright=1.4) * 0.3, i * 0.04) for i, n in enumerate((79, 84, 88, 91, 96))])
    return finish(reverb(mix(arp, whoosh(d, 800, 8000) * 0.35), 0.5, 0.25), peak=0.8)


def steal():
    d = 0.55
    sw = whoosh(0.25, 600, 6000) * 0.6
    snatch = mix(tock(1.3, 0.6, 1.3, 0.2), sine(sweep(400, 1600, 0.1), 0.1) * env(0.1, 0.001, 0.04) * 0.4)
    ka = mix(at(coin(1318) * 0.6, 0.0))
    return finish(seq((0, sw), (0.18, snatch), (0.24, ka)), peak=0.8)


def void():
    d = 0.5
    s = mix(sine(sweep(400, 40, d), d) * 0.8, lp(noise(d), 600) * 0.4) * adsr(d, 0.01, 0.1, 0.6, 0.25)
    return finish(reverb(sat(s, 1.5), 0.8, 0.35, 2000), peak=0.85)


def crossbow():
    d = 0.3
    twang = pluck(98, d, 0.07, 8) * 0.8
    fly = whoosh(0.2, 2000, 7000, rise=False) * 0.4
    return finish(seq((0, mech_click(1500) * 0.6), (0.01, twang), (0.05, fly)), peak=0.85)


def machine():
    return finish(gunshot(0.09, 140, 0.04), peak=0.85)


def shotgun():
    x = mix(gunshot(0.42, 80, 0.2), at(hp(noise(0.25), 3000) * env(0.25, 0.005, 0.05) * 0.25, 0.01))
    return finish(x, peak=0.95)


def pistol():
    return finish(gunshot(0.22, 130, 0.07), peak=0.9)


def shot():
    return finish(gunshot(0.42, 110, 0.12), peak=0.92)


def grenade(d=0.45):
    return finish(explosion(0.35)[:int(SR * d)])


def bomb():
    return finish(explosion(0.8))


def blast():
    return finish(mix(explosion(0.5), at(zap(0.4, 3000, 300) * 0.4, 0)))


def hit():
    d = 0.22
    return finish(mix(sine(sweep(220, 70, d), d) * env(d, 0.001, 0.04), bp(noise(d), 800, 5000) * env(d, 0.0005, 0.018) * 0.8), peak=0.85)


def slash():
    d = 0.22
    return finish(mix(whoosh(d, 1500, 9000) * 0.8, at(sine(sweep(3000, 2200, 0.1), 0.1) * env(0.1, 0.001, 0.04) * 0.25, 0.1)), peak=0.85)


def swing():
    return finish(whoosh(0.22, 400, 3000), peak=0.75)


def stab():
    d = 0.2
    return finish(mix(hit()[:int(SR * d)] * 0.6, bp(noise(d), 3000, 9000) * env(d, 0.0005, 0.02) * 0.6, sine(sweep(2500, 1800, d), d) * env(d, 0.001, 0.03) * 0.2), peak=0.85)


def clear():
    d = 1.4
    arp = mix(*[at(pluck(note(n), 0.8, 0.2) * 0.4, i * 0.07) for i, n in enumerate((60, 64, 67, 72, 76, 79, 84))])
    return finish(reverb(mix(arp, at(bell(note(96), 1.0, 0.3) * 0.2, 0.5)), 1.0, 0.25))


def alarm():
    d = 0.88
    f = 700 + 400 * (0.5 + 0.5 * signal.square(2 * np.pi * 4.5 * t(d)))
    s = lp(mix(square(f, d) * 0.4, saw(f * 1.01, d) * 0.3), 3500) * adsr(d, 0.01, 0.05, 0.9, 0.1)
    return finish(reverb(s, 0.6, 0.2), peak=0.6)


def achievement():
    d = 1.2
    x = mix(at(bell(note(84), d, 0.3) * 0.5, 0), at(bell(note(88), d, 0.3) * 0.5, 0.09), at(bell(note(91), d, 0.35) * 0.5, 0.18),
            at(bell(note(96), d, 0.5) * 0.55, 0.27), at(whoosh(0.4, 2000, 10000) * 0.15, 0.2))
    return finish(reverb(x, 1.0, 0.3))


def chest():
    d = 0.4
    creak = bp(saw(sweep(90, 140, 0.15) * (1 + 0.2 * np.sin(2 * np.pi * 35 * t(0.15))), 0.15), 300, 2500) * adsr(0.15, 0.02, 0.05, 0.6, 0.05) * 0.4
    return finish(mix(creak, at(tock(0.7, 1.0, 0.8, 0.2), 0.12), at(spawn() * 0.5, 0.18)), peak=0.85)


def fuse():
    d = 0.6
    sp = hp(noise(d) * (RNG.uniform(0, 1, int(SR * d)) > 0.8), 2500) * adsr(d, 0.01, 0.1, 0.8, 0.1) * 0.6
    return finish(mix(sp, bp(noise(d), 3000, 8000) * 0.15), peak=0.7)


def place():
    return finish(tock(0.95, 1.1, 1.0, 0.2))


def quack():
    d = 0.3
    f = sweep(600, 380, d)
    src = saw(f, d)
    v = mix(bp(src, 900, 1300) * 1.2, bp(src, 2000, 2600) * 0.6, lp(src, 600) * 0.4)
    return finish(sat(v * adsr(d, 0.01, 0.06, 0.6, 0.12), 2), peak=0.6)


def launch():
    d = 0.52
    return finish(mix(whoosh(d, 300, 7000) * 0.7, sine(sweep(120, 600, d), d) * adsr(d, 0.01, 0.1, 0.5, 0.2) * 0.4,
                      at(lp(noise(0.05), 2000) * env(0.05, 0.001, 0.01) * 0.6, 0)), peak=0.85)


def petrify():
    d = 0.45
    crunch = mix(*[at(bp(noise(0.02), 1500, 6000) * env(0.02, 0.0005, 0.005) * RNG.uniform(0.4, 1), RNG.uniform(0, 0.3)) for _ in range(28)])
    low = sine(sweep(200, 90, d), d) * env(d, 0.005, 0.12) * 0.6
    return finish(reverb(mix(crunch, low), 0.4, 0.2, 3000), peak=0.85)


def arrest():
    d = 1.08
    f = np.where((t(d) % 0.54) < 0.27, 960, 770)
    siren = lp(mix(square(f, d) * 0.3, sine(f, d) * 0.5), 3000) * adsr(d, 0.01, 0.05, 0.9, 0.08)
    return finish(reverb(siren, 0.5, 0.15), peak=0.5)


def honk():
    d = 0.32
    s = lp(mix(square(311, d), square(392, d) * 0.8), 2200) * adsr(d, 0.008, 0.03, 0.8, 0.05)
    return finish(sat(s, 1.5), peak=0.42)


def reap():
    d = 0.45
    return finish(reverb(mix(whoosh(0.3, 300, 5000) * 0.7, at(sine(sweep(3500, 2500, 0.2), 0.2) * env(0.2, 0.001, 0.07) * 0.3, 0.2),
                             at(sine(sweep(120, 50, 0.25), 0.25) * env(0.25, 0.002, 0.06) * 0.5, 0.22)), 0.7, 0.3), peak=0.85)


def shatter():
    d = 1.0
    shards = mix(*[at(bell(RNG.uniform(2500, 7000), 0.5, RNG.uniform(0.03, 0.12), partials=((1, 1), (2.3, .4))) * RNG.uniform(0.1, 0.4),
                      RNG.uniform(0, 0.25) ** 1.5) for _ in range(40)])
    hitn = hp(noise(0.15), 2000) * env(0.15, 0.0005, 0.03)
    return finish(reverb(mix(shards, hitn), 0.8, 0.25, 9000))


def break_():
    d = 0.53
    wood = mix(*[at(tock(RNG.uniform(0.6, 1.4), 0.6, 1.0, 0.2) * RNG.uniform(0.3, 0.8), RNG.uniform(0, 0.15)) for _ in range(7)])
    crack = hp(noise(0.05), 1500) * env(0.05, 0.0005, 0.01)
    return finish(mix(crack, wood, sine(sweep(150, 60, 0.2), 0.2) * env(0.2, 0.001, 0.05) * 0.6), peak=0.9)


def scrape():
    d = 0.54
    s = bp(noise(d), 1200, 3500) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t(d))) * adsr(d, 0.04, 0.1, 0.8, 0.15)
    grind = lp(saw(sweep(70, 55, d), d), 900) * adsr(d, 0.04, 0.1, 0.6, 0.15) * 0.3
    return finish(mix(s, grind), peak=0.75)


def beam(d=0.85):
    f = 520 * (1 + 0.02 * np.sin(2 * np.pi * 7 * t(d)))
    s = mix(sine(f, d), 0.5 * sine(f * 1.5, d), 0.3 * saw(f * 2.01, d)) * adsr(d, 0.06, 0.1, 0.7, 0.3) * 0.4
    return finish(reverb(mix(s, whoosh(d, 1500, 8000) * 0.2), 0.7, 0.3), peak=0.8)


def button():
    return finish(seq((0, mech_click(3000)), (0.04, mech_click(2200) * 0.7)), peak=0.7)


def kidnap():
    d = 1.6
    swirl = sine(sweep(200, 2000, d) * (1 + 0.1 * np.sin(2 * np.pi * 8 * t(d))), d) * adsr(d, 0.1, 0.1, 0.6, 0.4) * 0.35
    return finish(reverb(mix(beam(1.4) * 0.6, swirl, whoosh(d, 200, 5000) * 0.3), 1.0, 0.35))


def sinking_hymn():
    """slow original organ hymn (4-part chords), ~25 s, with gentle swell."""
    prog = [(60, [48, 64, 67]), (60, [53, 65, 69]), (59, [55, 62, 67]), (60, [48, 64, 67]),
            (57, [45, 60, 64]), (62, [50, 62, 65]), (59, [43, 62, 67]), (60, [48, 64, 67])]
    mel = [76, 77, 74, 72, 72, 74, 71, 72]
    beat = 3.1
    def organ(f, dd):
        x = mix(sine(f, dd), 0.5 * sine(f * 2, dd), 0.3 * sine(f * 3, dd), 0.15 * sine(f * 4, dd), 0.2 * sine(f / 2, dd))
        return x * adsr(dd, 0.12, 0.2, 0.8, 0.6)
    parts = []
    for i, ((_, ch), m) in enumerate(zip(prog, mel)):
        for n in ch:
            parts.append(at(organ(note(n), beat + 0.4) * 0.12, i * beat))
        parts.append(at(organ(note(m), beat + 0.4) * 0.17, i * beat))
    x = mix(*parts)
    return finish(reverb(lp(x, 3500), 2.5, 0.35, 2500), peak=0.7)


def bonk():
    d = 0.2
    return finish(mix(sine(sweep(500, 280, d), d) * env(d, 0.001, 0.05), reson(impulse(d, 0.003), 900, 10) * 3 * env(d, 0.0005, 0.03)), peak=0.8)


def build():
    return finish(seq((0, tock(0.8, 1.0, 1.0, 0.12)), (0.09, tock(1.0, 0.8, 1.0, 0.15))), peak=0.85)


def castle_fx():
    return finish(mix(seq((0, tock(0.7, 1.2, 0.9, 0.2)), (0.12, tock(0.9, 1.0, 1.0, 0.25))), at(bell(note(79), 0.3, 0.1) * 0.15, 0.12)))


def fanfare():
    d = 0.86
    brass = lambda f, dd: lp(mix(saw(f, dd), 0.6 * saw(f * 1.004, dd)), 3000) * adsr(dd, 0.01, 0.05, 0.7, 0.08)
    x = mix(at(brass(note(72), 0.12) * 0.4, 0), at(brass(note(72), 0.12) * 0.4, 0.13), at(brass(note(72), 0.12) * 0.4, 0.26),
            at(mix(brass(note(79), 0.5), brass(note(76), 0.5) * 0.6) * 0.45, 0.39))
    return finish(reverb(x, 0.7, 0.2))


def roar():
    d = 1.0
    src = mix(saw(sweep(95, 70, d) * (1 + 0.08 * np.sin(2 * np.pi * 13 * t(d))), d), lp(noise(d), 1500) * 0.8)
    v = mix(bp(src, 300, 800) * 1.2, bp(src, 900, 1600) * 0.6, lp(src, 250) * 0.8)
    return finish(reverb(sat(v * adsr(d, 0.06, 0.2, 0.7, 0.4), 3), 0.8, 0.2, 3000), peak=0.92)


def roll():
    d = 0.6
    clicks = mix(*[at(tock(RNG.uniform(1.4, 1.9), 0.2, 1.2, 0.06) * (1 - i / 14) ** 0.5, (i / 14) ** 1.6 * 0.5) for i in range(14)])
    return finish(clicks, peak=0.8)


def step():
    d = 0.1
    return finish(mix(lp(noise(d), 1200) * env(d, 0.002, 0.02), sine(sweep(130, 80, d), d) * env(d, 0.001, 0.025) * 0.6), peak=0.65)


def thunk():
    return finish(mix(tock(0.55, 1.5, 0.6, 0.12), sine(sweep(110, 55, 0.12), 0.12) * env(0.12, 0.001, 0.03) * 0.8), peak=0.85)


def twang():
    d = 0.3
    f = 165 * (1 + 0.05 * np.exp(-t(d) * 20) * np.sin(2 * np.pi * 25 * t(d)))
    x = mix(*[sine(f * h, d) * env(d, 0.001, 0.12 / h ** 0.5) / h for h in range(1, 7)])
    return finish(x, peak=0.8)


def kill():
    d = 0.6
    x = mix(stab()[:int(SR * 0.2)], at(mix(*[saw(note(n), 0.5) for n in (50, 51, 57)]) * env(0.5, 0.002, 0.15) * 0.2, 0.0),
            at(sine(sweep(100, 40, 0.4), 0.4) * env(0.4, 0.002, 0.1) * 0.6, 0.02))
    return finish(reverb(lp(x, 6000), 0.6, 0.25), peak=0.9)


def flag():
    d = 0.08
    return finish(mix(sine(1760, d), 0.3 * sine(2640, d)) * env(d, 0.001, 0.02), peak=0.6)


RECIPES = {
    'spawn': spawn, 'steal': steal, 'void': void, 'portal': portal, 'crossbow': crossbow, 'grenade': grenade,
    'machine': machine, 'pistol': pistol, 'reload': reload, 'shotgun': shotgun, 'shot': shot, 'clear': clear,
    'hit': hit, 'alarm': alarm, 'coin': coin, 'slash': slash, 'zap': zap, 'achievement': achievement,
    'blast': blast, 'chest': chest, 'fuse': fuse, 'place': place, 'quack': quack, 'launch': launch,
    'petrify': petrify, 'arrest': arrest, 'gong': gong, 'honk': honk, 'reap': reap, 'shatter': shatter,
    'victory': victory, 'break': break_, 'scrape': scrape, 'bomb': bomb, 'laugh': laugh, 'fall': fall,
    'jump': jump, 'land': land, 'superjump': superjump, 'warp': warp, 'stab': stab, 'swing': swing,
    'flag': flag, 'kill': kill, 'beam': beam, 'button': button, 'kidnap': kidnap, 'sinking_hymn': sinking_hymn,
    'bonk': bonk, 'build': build, 'castle': castle_fx, 'fanfare': fanfare, 'roar': roar, 'roll': roll,
    'step': step, 'thunk': thunk, 'twang': twang,
}
RESULTS = {'victory': victory, 'defeat': defeat, 'draw': draw}
