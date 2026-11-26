"""Core board sounds: moves, captures, check, promote, game start/end, UI."""
from synth import *


def tock(pitch=1.0, weight=1.0, bright=1.0, d=0.22):
    """polished wooden piece landing on a felt-and-wood board."""
    exc = noise(0.006) * env(0.006, 0.0003, 0.0015)
    exc = np.pad(exc, (0, int(SR * d) - len(exc)))
    wood = reson(exc, 1150 * pitch, 9) * 1.0 + reson(exc, 2350 * pitch, 16) * 0.55 * bright + reson(exc, 640 * pitch, 7) * 0.7
    thump = sine(sweep(210 * pitch, 120 * pitch, d), d) * env(d, 0.0008, 0.028) * 0.9 * weight
    click = hp(noise(0.002), 5000) * env(0.002, 0.0001, 0.0006) * 0.35 * bright
    x = mix(wood * 6, thump, click)
    return reverb(x, 0.35, 0.10, 6000)


def move_self():
    return finish(tock(1.0, 1.0, 1.0))


def move_opponent():
    return finish(tock(0.86, 0.9, 0.75), peak=0.8)


def capture():
    """snappy clack + body thud + crunchy grit + tiny sparkle tail. the money sound."""
    d = 0.5
    hit = tock(1.12, 1.3, 1.3, d)
    clack = bp(noise(0.03), 1800, 7000) * env(0.03, 0.0003, 0.006) * 0.9
    thud = sine(sweep(140, 55, 0.18), 0.18) * env(0.18, 0.001, 0.05) * 1.1
    grit = bp(noise(0.06), 2500, 9000) * env(0.06, 0.001, 0.014) * 0.35
    sparkle = mix(at(bell(note(96), 0.4, 0.07) * 0.10, 0.018), at(bell(note(103), 0.4, 0.06) * 0.07, 0.04))
    x = mix(hit, clack, at(thud, 0.002), grit, sparkle)
    return finish(sat(reverb(x, 0.45, 0.12, 7000), 1.4))


def castle():
    """king tock then rook tock, quick slide between: very tidy."""
    slide = bp(pink(0.07), 900, 4000) * adsr(0.07, 0.02, 0.02, 0.5, 0.03) * 0.12
    x = seq((0, tock(1.0, 1.0, 1.0)), (0.035, slide), (0.105, tock(1.18, 0.9, 1.1)))
    return finish(x)


def move_check():
    """tock + bright alert ping (minor-second-ish tension), short ring."""
    d = 0.7
    ping = mix(bell(note(88), d, 0.22, bright=1.2) * 0.45, bell(note(95), d, 0.16) * 0.22)
    x = mix(tock(1.05, 1.1, 1.2, d), at(ping, 0.012),
            at(sine(sweep(880, 1320, 0.05), 0.05) * env(0.05, 0.001, 0.015) * 0.12, 0.01))
    return finish(reverb(x, 0.7, 0.18, 8000))


def promote():
    """tock then fast rising sparkle arpeggio and a shimmer chord: level-up feeling."""
    d = 1.1
    notes = [72, 76, 79, 84, 88]
    arp = mix(*[at(bell(note(n), 0.8, 0.18, bright=1.3) * (0.35 + 0.08 * i), 0.03 + i * 0.045) for i, n in enumerate(notes)])
    shimmer = mix(*[sine(note(n) * (1 + dt), d) for n in (84, 88, 91) for dt in (-0.003, 0.003)]) * adsr(d, 0.15, 0.2, 0.5, 0.6) * 0.05
    swoosh = bp(noise(0.3), 3000, 11000) * adsr(0.3, 0.2, 0.05, 0.3, 0.05) * 0.06
    x = mix(tock(1.1, 1.0, 1.1, d), arp, at(shimmer, 0.18), at(swoosh, 0.0))
    return finish(reverb(x, 1.0, 0.25, 9000))


def game_start():
    """soft two-note chime with a warm pad under it."""
    d = 1.0
    c = mix(at(bell(note(79), d, 0.3) * 0.5, 0.0), at(bell(note(84), d, 0.35) * 0.55, 0.11))
    pad = mix(*[tri(note(n), d) for n in (60, 67, 72)]) * adsr(d, 0.08, 0.2, 0.4, 0.5) * 0.05
    return finish(reverb(mix(c, lp(pad, 2500)), 0.9, 0.25))


def game_end():
    """resolving cadence chord: satisfying 'done' with a long warm tail."""
    d = 1.6
    a = chord([note(n) for n in (67, 71, 74)], pluck, 0.0, d=0.5, dec=0.14)
    b = chord([note(n) for n in (60, 64, 67, 72)], pluck, 0.025, d=d, dec=0.4)
    sub = sine(note(48), d) * adsr(d, 0.01, 0.3, 0.3, 0.9) * 0.35
    x = mix(a * 0.7, at(mix(b, sub), 0.17), at(bell(note(84), 1.2, 0.4) * 0.25, 0.19))
    return finish(reverb(x, 1.3, 0.28))


def illegal():
    """soft muffled double 'nope' bonk; not harsh."""
    def bonk(f):
        d = 0.14
        return lp(mix(sine(sweep(f * 1.3, f, d), d), 0.3 * square(sweep(f * 1.3, f, d), d)), 1400) * env(d, 0.002, 0.04)
    return finish(seq((0, bonk(240)), (0.09, bonk(190))), peak=0.7)


def notify():
    """bright double ding."""
    d = 0.8
    x = mix(bell(note(86), d, 0.2) * 0.6, at(bell(note(91), d, 0.25) * 0.6, 0.085))
    return finish(reverb(x, 0.6, 0.2), peak=0.75)


def premove():
    """light ghost tap: like move but airy and higher."""
    x = mix(tock(1.35, 0.4, 0.8, 0.15) * 0.8, bp(noise(0.03), 4000, 10000) * env(0.03, 0.001, 0.007) * 0.15)
    return finish(x, peak=0.6)


def tenseconds():
    """heartbeat-ish double tick: urgent, not annoying."""
    def blip(f):
        d = 0.09
        return mix(sine(f, d), 0.4 * sine(f * 2, d)) * env(d, 0.001, 0.022)
    x = seq((0, blip(1568)), (0.14, blip(1568)), (0.36, blip(2093)))
    return finish(reverb(x, 0.4, 0.12), peak=0.75)


def tick():
    d = 0.06
    x = mix(reson(impulse(d, 0.002), 3200, 25) * 3, sine(2600, d) * env(d, 0.0005, 0.008) * 0.4)
    return finish(x * env(len(x) / SR, 0.0003, 0.015), peak=0.6)


def jumpscare():
    """loud: detuned rising screech + noise blast + sub hit."""
    d = 1.2
    f = sweep(300, 1400, d)
    scr = mix(*[saw(f * (1 + dt), d) for dt in (-0.02, 0, 0.017, 0.031)]) * 0.25
    scr = bp(scr, 600, 6000) * adsr(d, 0.01, 0.1, 0.85, 0.45)
    blast = hp(noise(d), 1000) * env(d, 0.001, 0.25) * 0.5
    sub = sine(sweep(90, 35, 0.5), 0.5) * env(0.5, 0.001, 0.18)
    stab = mix(*[saw(note(n), 0.6) for n in (61, 62, 67, 68)]) * env(0.6, 0.001, 0.2) * 0.25
    return finish(sat(mix(scr, blast, sub, stab), 2.5), peak=0.95)


def explosion(size=1.0):
    d = 1.6 * size
    crack = hp(noise(0.05), 1500) * env(0.05, 0.0005, 0.01)
    body = lp(noise(d), 900) * env(d, 0.003, 0.35 * size) * 1.4
    rumble = lp(pink(d), 200) * env(d, 0.02, 0.55 * size) * 2.2
    sub = sine(sweep(75, 28, 0.8), 0.8) * env(0.8, 0.002, 0.25 * size) * 1.3
    debris = bp(noise(d), 2000, 7000) * env(d, 0.05, 0.25) * 0.15
    x = mix(crack * 0.9, body, rumble, sub, at(debris, 0.08))
    return finish(sat(reverb(x, 1.2, 0.2, 3000), 2.0), peak=0.95)


CORE = {
    'move-self': move_self, 'move-opponent': move_opponent, 'capture': capture, 'castle': castle,
    'move-check': move_check, 'promote': promote, 'game-start': game_start, 'game-end': game_end,
    'illegal': illegal, 'notify': notify, 'premove': premove, 'tenseconds': tenseconds,
}
CORE_WAV = {'tick': tick, 'jumpscare': jumpscare, 'explosion': explosion}
