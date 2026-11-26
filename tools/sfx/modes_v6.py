"""v6 (2026-11-26): per-mode sound sets for the newest videos and for modes that sounded wrong on the default board set.

Owner's ask: "Sfx for the new vids, and ones that seem weird using the default sounds for their modes." Each mode
gets sounds for ITS events (what happens in that video), wired through the mode's `sounds` map; js/core/sound.js
scopes a mode's map to that mode, so a map entry can also replace a core event (game-start, capture, move-check,
victory, defeat, jumpscare, explosion ...) for that mode only.

Same rules as v5 (see modes.py / events.py): CC0 sources from tools/sfx/sources only, no bells, chimes, dings,
glass pings, synth leads, chiptune or cartoon brass; no riser into a sub boom (the owner's reference shape);
every sound its own design; true peak <= -1.5 dBTP. Gate: python3 tools/sfx/v6_gate.py [reference.mp3].
Regenerate only these: python3 tools/sfx/make_v6.py [name ...]
"""
import numpy as np
from synth import SR, lp, hp, bp
from samples import S, pitch, glide, rev, cut
import cine as C
from cine import (st, smix, widen, pan, fade, trim, air, sub, subdrop, thump, click, shape, mbcomp, peq, shelf, sat,
                  sweep_lp, plate, master)
from core import EV_LUFS, UI_LUFS, pad, transient, ui_hit, impact
import events as E
from events import clip, contour, LP, HP, BP, hall, drumhit, bpsweep, panmove, autopan, lead, norm
from modes import polish, whoosh, fall_sweep, FX_LUFS

ST_LUFS = EV_LUFS - 1.0   # mode start / result stingers (a touch under the shared big moments)


def noise(d, lo=200.0, hi=12000.0, seed=1):
    return E.noise(d, lo, hi, seed)


def gate_stutter(x, rate=28.0, duty=0.55, jitter=0.35, seed=1, depth=-30.0):
    """chop a signal into irregular on/off grains (glitch / static / broken transmission), stereo-safe."""
    x = np.asarray(x, float)
    rng = np.random.default_rng(seed)
    n = len(x)
    g = np.zeros(n)
    i = 0
    while i < n:
        per = int(SR / rate * (1 + jitter * (rng.random() * 2 - 1)))
        on = int(per * duty * (0.6 + 0.8 * rng.random()))
        g[i:i + on] = 1.0
        i += max(per, 8)
    lo = C.db(depth)
    g = lo + (1 - lo) * g
    k = int(SR * 0.0015)
    g = np.convolve(g, np.ones(k) / k, 'same')
    return (x.T * g).T


def wings(d, rates=(178, 203, 231, 256, 192), seed=7, lo=250.0, hi=5200.0):
    """a swarm: several noise bands amplitude-modulated at drifting wing-beat rates (no fixed pitch)."""
    rng = np.random.default_rng(seed)
    n = int(SR * d)
    tt = np.arange(n) / SR
    out = np.zeros((n, 2))
    for k, r in enumerate(rates):
        drift = r * (1 + 0.06 * np.sin(2 * np.pi * (0.7 + 0.3 * k) * tt + rng.random() * 6))
        ph = 2 * np.pi * np.cumsum(drift) / SR
        am = (0.5 + 0.5 * np.sin(ph)) ** 3
        nz = BP(rng.standard_normal(n), lo * (1 + 0.2 * k), hi)
        p = (k / (len(rates) - 1)) * 1.6 - 0.8
        out += pan(nz * am, p)
    return norm(out)


def creak(d=0.8, semis=-7, seed=1):
    """a slow structural creak: a stone scrape slowed down and band-limited."""
    return fade(BP(cut(pitch(S('fs743246_stone'), semis), d, d * 0.4), 120, 2600), 0.08, 0.2)


def swell_rev(name='fs60013_whoosh', semis=-5, d=0.9):
    """a reversed whoosh: air that is sucked in and stops."""
    return fade(rev(cut(pitch(S(name), semis), d, 0.05)), 0.05, 0.01)


# ================================================================ Jupiter 2011 (Mg2Upjjo2yg): spaceship, Keys hunt astronauts
def j11_start():
    """the ship powers up: a heavy airlock latch, a long pressure hiss from the seals, and the hull settling under
    a low engine rumble that swells in. ~2.4 s."""
    latch = smix((0, transient('k_metal_latch', -5, 120, 8000, 6, -2, 0.3)), (0.005, impact(0.3, -0.5, True, 101, 0.9), -6),
                 (0.0, drumhit('vs_timp_1', -6, 0.9, 500, 4, -4), -6))
    hiss = contour(HP(widen(noise(1.6, 2500, 12000, 101), 0.9), 2500), [(0, -30), (0.05, -6), (0.5, -10), (1.6, -40)])
    rumble = contour(LP(noise(2.4, 30, 300, 102), 180), [(0, -40), (0.6, -6), (1.8, -4), (2.4, -40)])
    hull = creak(1.1, -9)
    x = smix((0, latch), (0.06, hiss, -8), (0.2, rumble, -3), (0.9, hull, -10))
    x = hall(x, 0.16, 1.6, 4000, 0.02, 160, 101)
    return master(lead(mbcomp(x)), ST_LUFS, 's', max_len=2.5)


def j11_key():
    """a Key darts across the ship: a quick dry swish with a hard metallic foot-tap at the end."""
    sw = panmove(bp(cut(pitch(S('fs683101_whoosh'), 4), 0.16, 0.06), 900, 9000), -0.5, 0.5)
    tap = transient('k_metal_click', -3, 600, 11000, 6, -6, 0.07)
    x = smix((0, sw, -6), (0.12, tap), (0.121, thump(170, 90, 0.08, 0.02), -12))
    return polish(x, FX_LUFS - 3, 0.35, 0.04, 0.2, 2, -3, None, max_len=0.3)


def j11_catch():
    """a Key grabs an astronaut: a lunge, a heavy suit impact and the helmet seal hissing out."""
    lunge = bp(cut(pitch(S('fs446010_backwoosh'), 0), 0.22, 0.04), 300, 8000)
    hitx = smix((0, transient('k_punch_heavy_1', -2, 100, 7000, 6, -3, 0.25)), (0, transient('k_metal_latch', -2, 400, 9000, 5, -6, 0.15), -6))
    seal = contour(HP(noise(0.7, 3000, 11000, 103), 3000), [(0, -6), (0.1, -10), (0.7, -40)])
    x = smix((0, lunge, -6), (0.16, hitx), (0.2, widen(seal, 0.8), -14))
    return polish(x, FX_LUFS, 0.4, 0.08, 0.4, 3, -2, (90, 45, 0.04, 0.3, 0.08), -5, max_len=0.95)


def j11_spotted():
    """an astronaut is in a Key's line: two dark low pulses of the ship's proximity warning (noise thumps, no tone)."""
    def pulse(s):
        return smix((0, shape(LP(clip('v_framedrum_muted', 0.25, -6 + s), 1500), 6, -6)), (0, thump(120, 60, 0.18, 0.05), -4),
                    (0, BP(noise(0.12, 800, 3000, 104 + int(s)), 800, 3000), -20))
    x = smix((0, pulse(0)), (0.22, pulse(-1), -2))
    return polish(x, FX_LUFS - 2, 0.3, 0.1, 0.5, 0, 0, None, max_len=0.6)


def j11_launch():
    """the escape pod launches (win): docking clamps blow, the engine ignites with a hard blast, then the thrust roars
    and recedes as the pod flies off to the right. ~2.8 s."""
    clamps = smix((0, transient('k_metal_latch', -3, 200, 9000, 6, -4, 0.15)), (0.09, transient('k_metal_click', -4, 300, 9000, 6, -4, 0.1), -2))
    ign = smix((0, shape(clip('fs235968_explosion', 0.6, 3), 5, -3)), (0, LP(clip('fs189779_boom', 0.8, 2), 2000), -4))
    thrust = smix((0, LP(clip('fs560510_debris_b', 2.2, -4, onset=False), 3500)), (0, LP(noise(2.2, 40, 2000, 105), 900), -4))
    thrust = panmove(contour(thrust, [(0, -4), (0.4, 0), (1.4, -6), (2.2, -40)]), 0.0, 0.85)
    x = smix((0, clamps, -4), (0.22, ign), (0.3, thrust, -2), (0.3, widen(air(0.8, 9000, 2500, 0.35, 2000, 105), 1.0), -14))
    x = hall(x, 0.14, 1.6, 4500, 0.015, 180, 105)
    return master(lead(sat(norm(mbcomp(x)), 1.2)), ST_LUFS, 's', max_len=2.8)


def j11_lost():
    """mission failed (loss): the ship's power dies: a dull hull knock, the rumble sagging down, a last vent of air,
    then a cold low cello note. ~2.6 s."""
    knock = smix((0, drumhit('vs_timp_1', -8, 1.0, 400, 3, -3)), (0, transient('k_wood_heavy_3', -6, 120, 3000, 4, -4, 0.3), -6))
    sag = contour(LP(noise(1.8, 30, 260, 106), 160), [(0, -4), (1.6, -18), (1.8, -40)])
    vent = contour(BP(noise(1.0, 1500, 7000, 107), 1500, 7000), [(0, -30), (0.2, -10), (1.0, -40)])
    low = contour(pad([38, 45], 1.8, attack=0.5, lpf=700, width=0.5), [(0, -14), (0.8, -2), (1.8, -24)])
    x = smix((0, knock), (0.05, widen(sag, 0.5), -2), (0.5, widen(vent, 0.7), -14), (0.7, low, -4))
    x = hall(x, 0.2, 1.9, 3500, 0.02, 140, 106)
    return master(lead(mbcomp(x)), ST_LUFS - 1, 's', max_len=2.6)


# ================================================================ SCP-2774 (JUlTxosCXuk): the sloth that takes your will
def s2774_start():
    """a slow breath drawn in backwards, then a thick low cello cluster pressing in (it is inside your head). ~2 s."""
    br = contour(swell_rev('fs60013_whoosh', -9, 1.0), [(0, -30), (0.9, 0), (1.0, -40)])
    cl = contour(pad([36, 37, 43], 1.4, attack=0.3, lpf=900, width=0.7), [(0, -20), (0.4, 0), (1.4, -24)])
    x = smix((0, widen(LP(br, 5000), 0.6)), (0.85, cl, -2), (0.85, drumhit('vs_bassdrum_rub', -2, 1.0, 300, 2, 0), -6))
    return master(lead(mbcomp(hall(x, 0.2, 1.8, 3500, 0.03, 150, 110))), ST_LUFS - 1, 's', max_len=2.3)


def s2774_step():
    """the sloth drags itself one square: a slow soft heavy footfall and cloth dragging."""
    x = smix((0, LP(cut(pitch(S('k_soft_heavy_0'), -6), 0.35, 0.15), 2000)), (0.05, LP(cut(pitch(S('k_cloth_3'), -5), 0.4, 0.2), 3000), -6))
    return polish(x, FX_LUFS - 4, 0.3, 0.08, 0.4, 0, 0, (80, 50, 0.05, 0.25, 0.08), -8, max_len=0.5)


def s2774_seize():
    """a piece's will is taken: a reversed pull of air that snaps into a muffled thud, the piece moved for you."""
    pull = contour(swell_rev('fs683101_whoosh', -3, 0.4), [(0, -20), (0.38, 0), (0.4, -40)])
    th = smix((0, transient('k_wood_medium_2', -4, 150, 4000, 5, -4, 0.18)), (0, thump(110, 55, 0.2, 0.06), -6))
    x = smix((0, bp(pull, 400, 7000), -2), (0.38, th))
    return polish(x, FX_LUFS - 1, 0.45, 0.1, 0.45, 0, 0, None, max_len=0.75)


# ================================================================ All-Consuming Darkness (BYg7rV53WrM)
def dark_start():
    """the darkness wakes: a deep rubbed bass drum and a wide black rumble rolling in from far away. ~2.2 s."""
    rub = LP(clip('vs_bassdrum_rub', 2.0, -3), 400)
    roll = contour(LP(widen(noise(2.2, 30, 500, 120), 1.0), 300), [(0, -40), (0.9, -2), (2.2, -40)])
    x = smix((0, rub), (0.1, roll, -3), (0.6, LP(clip('vs_timp_roll_lo', 1.4, -5), 600), -8))
    return master(lead(mbcomp(hall(x, 0.22, 2.0, 2500, 0.03, 120, 120))), ST_LUFS - 1, 's', max_len=2.3)


def dark_spread():
    """the darkness spreads one square: a low swell of air that thickens and closes, no hit."""
    x = smix((0, contour(LP(swell_rev('fs60013_whoosh', -10, 0.7), 2200), [(0, -24), (0.6, 0), (0.7, -40)])),
             (0, contour(LP(noise(0.7, 30, 250, 121), 200), [(0, -30), (0.55, -6), (0.7, -40)]), -4))
    return polish(x, FX_LUFS - 3, 0.6, 0.1, 0.6, 0, 0, None, max_len=0.75)


def dark_consume():
    """a piece is swallowed: it is sucked into the dark, a choked thud, and a sinking sub under a smear of air."""
    suck = contour(BP(swell_rev('fs446010_backwoosh', -2, 0.45), 300, 9000), [(0, -18), (0.42, 0), (0.45, -40)])
    th = smix((0, transient('k_punch_heavy_1', -6, 100, 2500, 5, -4, 0.25)), (0, subdrop(70, 34, 0.9, 0.35), -4))
    smear = contour(LP(widen(noise(0.8, 200, 3000, 122), 1.0), 1800), [(0, -20), (0.1, -10), (0.8, -40)])
    x = smix((0, suck, -2), (0.42, th), (0.44, smear, -10))
    return polish(x, FX_LUFS, 0.5, 0.12, 0.7, 0, 0, None, max_len=1.3)


# ================================================================ Waldo Finds You (gHAmif0TenY)
def waldo_found():
    """Waldo finds you (replaces the shared jumpscare in this mode): a quick close giggle pitched up behind you,
    then a hard dry slam and the square blacking out with a choked low hit. ~1.4 s."""
    gig = HP(clip('fs478934_laugh', 0.45, 5), 500)
    gig = contour(gig, [(0, -2), (0.38, -6), (0.45, -40)])
    slam = smix((0, shape(clip('k_door_close_1', 0.5, -5), 8, -4)), (0, click(0.005, 1500, 12000, 130), -8),
                (0.002, drumhit('v_bassdrum', -3, 0.7, 300), -2))
    black = contour(LP(noise(0.8, 30, 900, 131), 600), [(0, -6), (0.8, -40)])
    x = smix((0, pan(gig, -0.5), -6), (0.48, slam), (0.5, widen(black, 0.8), -8))
    return master(lead(mbcomp(hall(x, 0.12, 0.8, 4500, 0.008, 200, 130))), EV_LUFS, 's', max_len=1.5)


def waldo_start():
    """hide and seek: soft hurried footsteps running off to the left behind the board, a door eased shut, and quiet. ~1.6 s."""
    steps = smix(*[(i * 0.13, pan(LP(transient('k_footstep_wood_1', -1 - i * 0.5, 200, 6000, 3, -4, 0.1), 4000 - i * 400), 0.3 - i * 0.18), -2 - i * 2.5)
                   for i in range(6)])
    door = LP(clip('k_door_close_1', 0.6, -2), 3000)
    x = smix((0, steps), (0.9, pan(door, -0.7), -6))
    return master(lead(hall(x, 0.2, 1.2, 3000, 0.02, 200, 132)), FX_LUFS - 2, 'm', max_len=1.8)


# ================================================================ SCP-2845 the Deer (PGBHL6Nc4X0)
def deer_step():
    """the Deer wanders: a hoof set down on stone with a little grit."""
    hoof = smix((0, transient('v_woodblock_pp', -9, 250, 5000, 5, -6, 0.07)), (0.045, transient('v_woodblock_pp', -11, 250, 4500, 5, -6, 0.06), -5),
                (0, HP(cut(S('fs569746_gravel'), 0.18, 0.08), 600), -12))
    return polish(hoof, FX_LUFS - 5, 0.3, 0.06, 0.3, 0, 0, (130, 70, 0.02, 0.1, 0.03), -12, max_len=0.25)


def deer_alter():
    """reality is altered: the air folds in on itself (a flanged reversed swell), a deep timpani heartbeat and the
    pieces dropping back down in new places as a scatter of soft knocks. ~1.4 s."""
    fold = E.flange(contour(swell_rev('fs60027_swosh', -4, 0.7), [(0, -24), (0.65, 0), (0.7, -40)]), 0.5, 8.0, 0.6, 0.8)
    beat = smix((0, drumhit('vs_timp_hi', -7, 0.6, 800, 4, -3)), (0.24, drumhit('vs_timp_hi', -8, 0.7, 700, 4, -3), -3))
    knocks = smix(*[(0.05 * i, pan(transient('k_wood_light_%d' % (i % 5), -2 + i, 300, 7000, 5, -6, 0.06), (-0.6 + 0.3 * i)), -6 - i)
                    for i in range(5)])
    x = smix((0, widen(bp(fold, 300, 9000), 0.9), -2), (0.68, beat), (0.95, knocks, -4))
    return master(lead(mbcomp(hall(x, 0.2, 1.4, 4500, 0.02, 180, 140))), FX_LUFS + 1, 's', max_len=1.6)


# ================================================================ Mal0 / SCP-1471 (vPEVQgvjoL4)
def mal0_step():
    """Mal0 closes in: a burst of phone-line static that cuts out, under a soft heavy step."""
    st_ = gate_stutter(BP(noise(0.36, 2500, 11000, 150), 2500, 11000), 34, 0.5, 0.5, 150)
    st_ = contour(st_, [(0, -8), (0.05, 0), (0.3, -4), (0.36, -40)])
    x = smix((0, st_, -3), (0.12, LP(transient('k_footstep_carpet_0', -5, 100, 2500, 4, -4, 0.15), 2500), -8))
    return polish(x, FX_LUFS - 4, 0.4, 0.05, 0.3, 0, 0, None, max_len=0.4)


def mal0_take():
    """Mal0 takes a piece: the signal tears into heavy static, a deep hit lands in it, and it chokes off."""
    tear = gate_stutter(BP(noise(0.7, 600, 9000, 151), 600, 9000), 22, 0.6, 0.6, 151, -40)
    tear = contour(tear, [(0, -10), (0.1, 0), (0.55, -4), (0.6, -40)])
    hitx = smix((0, impact(0.6, -0.5, True, 151, 0.8)), (0, drumhit('v_bassdrum', -4, 0.7, 300), -2))
    x = smix((0, widen(tear, 0.8), -6), (0.1, hitx))
    return polish(x, FX_LUFS + 1, 0.4, 0.06, 0.4, 0, 0, None, max_len=0.9)


def mal0_start():
    """the app opens: a phone-speaker crackle, a soft wet breath close by, and a long dark low swell. ~1.8 s."""
    crack = gate_stutter(BP(noise(0.5, 1500, 6000, 152), 1500, 6000), 40, 0.4, 0.6, 152)
    breath = LP(contour(HP(noise(0.7, 400, 4000, 153), 400), [(0, -30), (0.45, -6), (0.7, -40)]), 2500)
    low = contour(pad([33, 40], 1.5, attack=0.4, lpf=600, width=0.6), [(0, -20), (0.6, -2), (1.5, -26)])
    x = smix((0, crack, -8), (0.4, breath, -8), (0.5, low, -2))
    return master(lead(mbcomp(hall(x, 0.18, 1.5, 3500, 0.02, 150, 152))), ST_LUFS - 2, 's', max_len=2.0)


# ================================================================ Despair (U67wZoy-1fE)
def despair_step():
    """Despair crawls one step: a heavy slow drag across stone."""
    drag = contour(LP(cut(pitch(S('fs743246_stone'), -12), 0.75, 0.2), 1100), [(0, -18), (0.35, 0), (0.75, -30)])
    x = smix((0, drag), (0.3, LP(transient('k_soft_heavy_0', -7, 60, 900, 3, -3, 0.2), 900), -6))
    return polish(fade(x, 0.05, 0.15), FX_LUFS - 4, 0.35, 0.08, 0.4, 0, 0, None, max_len=0.8)


def despair_take():
    """Despair reaches its target: a low groaning cello pair bends downward over a dull, heavy thud. ~1.3 s."""
    g = contour(pad([41, 42], 1.2, attack=0.08, lpf=900, glide_=-2.0, width=0.6), [(0, -8), (0.3, 0), (1.2, -30)])
    th = smix((0, transient('k_punch_heavy_1', -7, 80, 2000, 5, -4, 0.3)), (0, drumhit('vs_timp_1', -9, 1.0, 400, 3, -3), -4))
    x = smix((0, th), (0.02, g, -3))
    return polish(x, FX_LUFS, 0.45, 0.14, 0.9, 0, 0, None, max_len=1.3)


# ================================================================ Archangel Gabriel (d9oDfmcMJvA): Mandela Catalogue alternates
def gabriel_step():
    """Gabriel shifts one square: a broadcast glitch, a smeared swish that stutters and freezes."""
    sw = gate_stutter(bp(cut(pitch(S('fs60027_swosh'), -2), 0.3, 0.06), 500, 9000), 18, 0.5, 0.7, 160)
    x = smix((0, sw), (0.0, gate_stutter(BP(noise(0.25, 2500, 9000, 161), 2500, 9000), 45, 0.35, 0.6, 161), -16))
    return polish(x, FX_LUFS - 3, 0.5, 0.06, 0.4, 0, 0, None, max_len=0.4)


def gabriel_alt():
    """an alternate makes its own move: a piece set down wrong, doubled and smeared a hair late, with a buzz of static."""
    a = transient('k_wood_light_2', -3, 250, 8000, 5, -6, 0.12)
    b = LP(transient('k_wood_light_2', -6, 250, 6000, 5, -6, 0.12), 3000)
    x = smix((0, pan(a, -0.3)), (0.035, pan(b, 0.4), -4), (0.0, gate_stutter(BP(noise(0.18, 1800, 7000, 162), 1800, 7000), 50, 0.4, 0.5, 162), -18))
    return polish(x, FX_LUFS - 4, 0.4, 0.06, 0.3, 0, 0, (120, 60, 0.03, 0.12, 0.04), -10, max_len=0.25)


def gabriel_take():
    """an alternate captures: a distorted, bitten-off impact with the static spiking over it."""
    hitx = sat(smix((0, transient('k_punch_medium_0', -3, 150, 7000, 6, -4, 0.2)), (0, transient('k_chop', -2, 200, 6000, 5, -4, 0.15), -4)), 2.2)
    stat = contour(gate_stutter(BP(noise(0.7, 3000, 12000, 163), 3000, 12000), 24, 0.5, 0.7, 163), [(0, 0), (0.5, -4), (0.7, -40)])
    x = smix((0, HP(hitx, 400)), (0, stat, -2), (0, thump(100, 50, 0.25, 0.07), -12))
    return polish(x, FX_LUFS - 1, 0.4, 0.06, 0.3, 0, 0, None, max_len=0.75)


# ================================================================ He Knows You Are Alone (mymJwfSPeFA): Room takes the lonely
def room_step():
    """Room drifts closer: a soft breath of air leaning in from one side and a faint floor creak."""
    br = panmove(contour(LP(HP(noise(0.5, 300, 5000, 170), 300), 3500), [(0, -30), (0.3, 0), (0.5, -40)]), -0.6, 0.1)
    x = smix((0, br, -2), (0.1, creak(0.4, -5), -10))
    return polish(x, FX_LUFS - 5, 0.5, 0.08, 0.5, 0, 0, None, max_len=0.55)


def room_take():
    """Room takes a piece that was alone: the room closes in (a swallowed reversed swell), a dull muffled thud as
    if behind a wall, and the air drops out. ~1.1 s."""
    close = contour(LP(swell_rev('fs446010_backwoosh', -5, 0.5), 2500), [(0, -18), (0.48, 0), (0.5, -40)])
    th = LP(smix((0, transient('k_punch_heavy_1', -5, 60, 1500, 5, -4, 0.3)), (0, drumhit('v_bassdrum', -5, 0.6, 250), -2)), 900)
    drop = contour(LP(widen(noise(1.1, 30, 600, 171), 0.9), 400), [(0, -2), (0.5, -6), (1.1, -40)])
    x = smix((0, close, -2), (0.48, th, -2), (0.5, drop, -4))
    return polish(LP(x, 2500), FX_LUFS, 0.4, 0.12, 0.6, 0, 0, None, max_len=1.6)


# ================================================================ The Boiled One (xvibqyL-CqQ)
def boiled_step():
    """the Boiled One shifts: a wet heavy step smothered in a crackle of bad broadcast."""
    x = smix((0, LP(transient('k_soft_medium_1', -6, 80, 2500, 4, -4, 0.18), 2500)),
             (0, gate_stutter(BP(noise(0.3, 900, 6000, 180), 900, 6000), 26, 0.45, 0.6, 180), -12))
    return polish(x, FX_LUFS - 4, 0.4, 0.06, 0.35, 0, 0, (80, 45, 0.04, 0.2, 0.06), -10, max_len=0.4)


def boiled_gaze():
    """a piece looked at it and is paralysed: a slam of harsh broadcast static that holds, then cuts dead. ~0.9 s."""
    stat = BP(noise(0.85, 400, 10000, 181), 400, 10000)
    stat = sat(gate_stutter(stat, 60, 0.8, 0.3, 181, -14), 1.8)
    stat = contour(stat, [(0, 0), (0.75, -3), (0.8, -50)])
    x = smix((0, widen(stat, 0.6)), (0, impact(0.3, 0.0, False, 181, 0.6), -6), (0, thump(90, 45, 0.5, 0.15), -6))
    return polish(x, FX_LUFS, 0.5, 0.0, 0.3, 0, 0, None, max_len=0.9, mb=False)


# ================================================================ The Locust (PDCuJf3SdRY)
def locust_warn():
    """the Locust lands on a square (warning): a swarm buzzes in and settles."""
    w = contour(wings(1.5, seed=190), [(0, -36), (0.7, -2), (1.1, 0), (1.5, -40)])
    x = smix((0, w), (1.0, HP(cut(S('k_cloth_2'), 0.2, 0.08), 1500), -12))
    return polish(x, FX_LUFS - 3, 0.5, 0.06, 0.4, 0, 0, None, max_len=1.55)


def locust_eat():
    """the Locust evaporates the square: a frenzy of chewing crackle inside the swarm, a dry crunch, then dust."""
    w = contour(wings(0.9, (205, 244, 268, 221), seed=191), [(0, -6), (0.5, 0), (0.9, -40)])
    chew = contour(HP(cut(S('fs45650_fuse', onset=False), 0.6, 0.15), 1500), [(0, -6), (0.6, -30)])
    crunch = smix((0, transient('k_chop', 0, 200, 8000, 6, -4, 0.15)), (0.01, HP(cut(S('fs569746_gravel'), 0.3, 0.12), 500), -6))
    dust = HP(cut(S('fs462162_rubble'), 0.5, 0.25), 1200)
    x = smix((0, crunch), (0.0, contour(w, [(0, 0), (0.3, -8), (0.9, -40)]), -8), (0.02, chew, -6), (0.06, widen(dust, 0.7), -10))
    return polish(x, FX_LUFS, 0.5, 0.08, 0.4, 0, 0, None, max_len=1.0)


# ================================================================ SCP-4975 Crack (icm-scp4975)
def crack_crawl():
    """SCP-4975 crawls a square: a hard skittering of stone-shell legs."""
    taps = smix(*[(0.035 * i, pan(transient('k_wood_light_%d' % ((i * 2) % 5), 3 - i, 800, 11000, 6, -8, 0.04), 0.4 - 0.2 * i), -i * 1.5) for i in range(5)])
    x = smix((0, taps), (0.0, HP(cut(S('fs569746_gravel'), 0.2, 0.08), 800), -14))
    return polish(x, FX_LUFS - 5, 0.4, 0.04, 0.2, 0, 0, None, max_len=0.25)


def crack_scan():
    """a piece is scanned and cracks: a stone split, sharp and dry, with a little grit falling (no glass)."""
    x = smix((0, transient('fs743246_stone', 2, 300, 12000, 8, -6, 0.12)), (0, transient('k_chop', 3, 600, 12000, 6, -6, 0.08), -4),
             (0.02, HP(cut(S('fs569746_gravel'), 0.2, 0.1), 1500), -12), (0, click(0.004, 2500, 14000, 200), -10))
    return polish(x, FX_LUFS - 2, 0.35, 0.06, 0.3, 0, 0, (150, 80, 0.02, 0.08, 0.03), -12, max_len=0.3)


def crack_shatter():
    """a cracked piece is scanned again and shatters: a stone burst, pieces raining down, a short low hit."""
    burst = smix((0, transient('fs743246_stone', -2, 150, 11000, 6, -3, 0.3)), (0, cut(S('k_chop'), 0.25, 0.1), -3),
                 (0, impact(0.2, 0.5, False, 201, 0.6), -8))
    rain = smix((0.03, HP(cut(S('fs462162_rubble'), 0.9, 0.3), 1200)), (0.06, HP(cut(S('fs569746_gravel'), 0.8, 0.3), 1500), -4))
    rain = contour(rain, [(0, -10), (0.25, 0), (0.9, -30)])
    x = smix((0, HP(burst, 250)), (0, widen(rain, 0.8), -2))
    return polish(x, FX_LUFS, 0.5, 0.08, 0.4, 0, 0, None, max_len=1.0)


RECIPES = {
    'j11_start': j11_start, 'j11_key': j11_key, 'j11_catch': j11_catch, 'j11_spotted': j11_spotted,
    'j11_launch': j11_launch, 'j11_lost': j11_lost,
    's2774_start': s2774_start, 's2774_step': s2774_step, 's2774_seize': s2774_seize,
    'dark_start': dark_start, 'dark_spread': dark_spread, 'dark_consume': dark_consume,
    'waldo_found': waldo_found, 'waldo_start': waldo_start,
    'deer_step': deer_step, 'deer_alter': deer_alter,
    'mal0_step': mal0_step, 'mal0_take': mal0_take, 'mal0_start': mal0_start,
    'despair_step': despair_step, 'despair_take': despair_take,
    'gabriel_step': gabriel_step, 'gabriel_alt': gabriel_alt, 'gabriel_take': gabriel_take,
    'room_step': room_step, 'room_take': room_take,
    'boiled_step': boiled_step, 'boiled_gaze': boiled_gaze,
    'locust_warn': locust_warn, 'locust_eat': locust_eat,
    'crack_crawl': crack_crawl, 'crack_scan': crack_scan, 'crack_shatter': crack_shatter,
}

# where each sound is written: assets/modes/<mode id>/<name>.wav (siblings that share a set reference these paths)
HOME = {
    'Mg2Upjjo2yg': ['j11_start', 'j11_key', 'j11_catch', 'j11_spotted', 'j11_launch', 'j11_lost'],
    'JUlTxosCXuk': ['s2774_start', 's2774_step', 's2774_seize'],
    'BYg7rV53WrM': ['dark_start', 'dark_spread', 'dark_consume'],
    'gHAmif0TenY': ['waldo_found', 'waldo_start'],
    'PGBHL6Nc4X0': ['deer_step', 'deer_alter'],
    'vPEVQgvjoL4': ['mal0_step', 'mal0_take', 'mal0_start'],
    'U67wZoy-1fE': ['despair_step', 'despair_take'],
    'd9oDfmcMJvA': ['gabriel_step', 'gabriel_alt', 'gabriel_take'],
    'mymJwfSPeFA': ['room_step', 'room_take'],
    'xvibqyL-CqQ': ['boiled_step', 'boiled_gaze'],
    'PDCuJf3SdRY': ['locust_warn', 'locust_eat'],
    'icm-scp4975': ['crack_crawl', 'crack_scan', 'crack_shatter'],
}


# ================================================================ wiring (tools/sfx/wire_v6.py applies it to data/modes/<id>.js)
def _a(name):
    for mid, ns in HOME.items():
        if name in ns:
            return 'assets/modes/%s/%s.wav' % (mid, name)
    raise KeyError(name)


def _set(**kw):
    return {k.replace('__', '-'): _a(v) for k, v in kw.items()}


CS = "ctx.sound('%s')"
WIRE = {
    'Mg2Upjjo2yg': {'sounds': _set(game__start='j11_start', victory='j11_launch', defeat='j11_lost', j11_key='j11_key',
                                   j11_catch='j11_catch', j11_spotted='j11_spotted'),
                    'repl': [("ctx.sound(victim ? 'capture' : 'move-opponent');", "ctx.sound(victim ? 'j11_catch' : 'j11_key');"),
                             ("UIS.focus = hot[0]; ctx.sound('move-check');", "UIS.focus = hot[0]; ctx.sound('j11_spotted');")]},
    'JUlTxosCXuk': {'sounds': _set(game__start='s2774_start', s2774_step='s2774_step', s2774_seize='s2774_seize'),
                    'repl': [("s = to; ctx.sound('move-opponent');", "s = to; ctx.sound('s2774_step');"),
                             ("ctx.sound(victim ? 'capture' : 'move-opponent');", "ctx.sound('s2774_seize');")]},
    'BYg7rV53WrM': {'sounds': _set(game__start='dark_start', dark_spread='dark_spread', dark_consume='dark_consume'),
                    'repl': [("ctx.sound('capture'); ctx.fx({ type: 'particles', kind: 'smoke'", "ctx.sound('dark_consume'); ctx.fx({ type: 'particles', kind: 'smoke'"),
                             ("} else ctx.sound('move-opponent');", "} else ctx.sound('dark_spread');")]},
    'gHAmif0TenY': {'sounds': _set(game__start='waldo_start', jumpscare='waldo_found')},
    'PGBHL6Nc4X0': {'sounds': _set(deer_step='deer_step', deer_alter='deer_alter'),
                    'repl': [("s = t; ctx.sound('move-opponent');", "s = t; ctx.sound('deer_step');"),
                             ("ctx.sound('castle'); ctx.toast('SCP-2845 altered reality.'", "ctx.sound('deer_alter'); ctx.toast('SCP-2845 altered reality.'")]},
    'vPEVQgvjoL4': {'sounds': _set(game__start='mal0_start', mal0_step='mal0_step', mal0_take='mal0_take'),
                    'repl': [("ctx.sound('capture');", "ctx.sound('mal0_take');"), ("ctx.sound('move-opponent');", "ctx.sound('mal0_step');")]},
    'U67wZoy-1fE': {'sounds': _set(despair_step='despair_step', despair_take='despair_take'),
                    'repl': [("ctx.sound('capture'); ctx.fx({ type: 'particles', kind: 'smoke'", "ctx.sound('despair_take'); ctx.fx({ type: 'particles', kind: 'smoke'"),
                             ("} else ctx.sound('move-opponent');", "} else ctx.sound('despair_step');")]},
    'd9oDfmcMJvA': {'sounds': _set(gabriel_step='gabriel_step', gabriel_alt='gabriel_alt', gabriel_take='gabriel_take'),
                    'repl': [("ctx.move(s, to); ctx.sound('move-opponent');", "ctx.move(s, to); ctx.sound('gabriel_step');"),
                             ("ctx.sound(victim ? 'capture' : 'move-opponent');", "ctx.sound(victim ? 'gabriel_take' : 'gabriel_alt');")]},
    'mymJwfSPeFA': {'sounds': _set(room_step='room_step', room_take='room_take'),
                    'repl': [("ctx.sound('capture'); ctx.fx({ type: 'vignette'", "ctx.sound('room_take'); ctx.fx({ type: 'vignette'"),
                             ("} else ctx.sound('move-opponent');", "} else ctx.sound('room_step');")]},
    'xvibqyL-CqQ': {'sounds': _set(boiled_step='boiled_step', boiled_gaze='boiled_gaze'),
                    'repl': [("ctx.transform(i, { props: { para: 1 } }); });   /* the rule applies at once */\n    ctx.sound('notify');",
                              "ctx.transform(i, { props: { para: 1 } }); });   /* the rule applies at once */\n    ctx.sound('boiled_gaze');"),
                             ("ctx.move(s, to); ctx.sound('move-opponent');", "ctx.move(s, to); ctx.sound('boiled_step');")]},
    'PDCuJf3SdRY': {'sounds': _set(locust_warn='locust_warn', locust_eat='locust_eat'),
                    'repl': [("ctx.sound(victim ? 'capture' : 'move-opponent');", "ctx.sound('locust_eat');"),
                             ("ctx.game._locustT = performance.now();\n      ctx.sound('notify');", "ctx.game._locustT = performance.now();\n      ctx.sound('locust_warn');")]},
    'icm-scp4975': {'sounds': _set(crack_crawl='crack_crawl', crack_scan='crack_scan', crack_shatter='crack_shatter'),
                    'repl': [("ctx.remove(sq); ctx.sound('capture');", "ctx.remove(sq); ctx.sound('crack_shatter');"),
                             ("ctx.sound('move-check');", "ctx.sound('crack_scan');"),
                             ("ctx.move(s, to); ctx.sound('move-opponent');", "ctx.move(s, to); ctx.sound('crack_crawl');")]},
}
