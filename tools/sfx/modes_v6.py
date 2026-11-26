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



# ================================================================ batch 2: modes that sounded wrong on the default set
def dice_roll():
    """Dice Chess: the dice are shaken in a cupped hand and thrown onto the table, tumbling to a stop (wood, no tone)."""
    shake = smix(*[(0.045 * i, pan(transient('k_dice_throw_1', 2 + (i % 3), 600, 11000, 4, -6, 0.05), -0.3 + 0.15 * (i % 4)), -10 - i % 3)
                   for i in range(5)])
    throw = LP(cut(S('k_dice_throw_1'), 0.7, 0.25), 10000)
    x = smix((0, shake), (0.26, throw), (0.27, thump(140, 80, 0.1, 0.03), -14))
    return polish(x, FX_LUFS - 3, 0.45, 0.06, 0.3, 2, -1, None, max_len=1.0)


def roulette_click():
    """Chess Roulette, the chamber was empty: the cylinder clicks round and the hammer falls on nothing."""
    spin = smix(*[(0.05 * i, transient('k_metal_click', 4 - i * 0.5, 1500, 12000, 6, -8, 0.03), -8 - i * 1.5) for i in range(4)])
    ham = smix((0, transient('k_metal_latch', 0, 300, 9000, 8, -6, 0.08)), (0, thump(180, 110, 0.06, 0.015), -14))
    x = smix((0, spin), (0.28, ham))
    return polish(x, FX_LUFS - 4, 0.3, 0.05, 0.25, 0, 0, None, max_len=0.45)


def roulette_bang():
    """Chess Roulette, the chamber was loaded: a revolver shot in a small room, heavy and close, with a long dark tail."""
    shot = smix((0, cut(S('fs427592_pistol'), 0.5, 0.25)), (0, click(0.005, 2500, 14000, 210), -4),
                (0, LP(cut(S('fs189779_boom'), 1.4, 0.8), 700), -6))
    tail = contour(LP(widen(noise(1.8, 40, 1200, 211), 0.9), 700), [(0, -8), (0.4, -10), (1.8, -50)])
    ham = transient('k_metal_latch', 0, 300, 9000, 8, -6, 0.08)
    x = smix((0, ham, -6), (0.16, shot), (0.18, tail, -2))
    return polish(x, FX_LUFS + 1.5, 0.4, 0.16, 1.2, 4, 0, (75, 42, 0.04, 0.9, 0.3), -4, max_len=1.9)


def atomic_blast():   # NOT USED: 3 attempts stayed a near-duplicate of j11_catch (v6_gate); Atomic keeps the shared explosion
    """Atomic Chess: the capture detonates: a hard compression crack, a short deep punch, and the 3x3 around it blown
    out as a quick ring of debris (shorter and tighter than the shared explosion, it fires on every capture)."""
    crack = smix((0, click(0.006, 1500, 13000, 220)), (0, transient('fs427595_shotgun', -4, 200, 9000, 6, -4, 0.12), -4))
    punch = smix((0, LP(cut(S('fs255111_boom'), 0.6, 0.35), 1400)), (0, drumhit('v_bassdrum', -2, 0.5, 250), -4))
    ring = panmove(HP(cut(S('fs560510_debris_a', onset=False), 1.0, 0.3), 500), -0.7, 0.7)
    x = smix((0, crack, -2), (0, punch, 2), (0.03, contour(widen(HP(ring, 1500), 1.0), [(0, -10), (0.12, 0), (0.3, -40)]), -2))
    x = contour(x, [(0, 0), (0.3, -6), (0.42, -60)])
    return polish(x, FX_LUFS + 1, 0.5, 0.0, 0.2, 4, -2, (60, 38, 0.05, 0.35, 0.1), -4, max_len=0.45, mb=False)


def scp682_bite():
    """SCP-682 (the hard-to-destroy reptile) eats a piece: a deep reptile snarl, jaws crunching shut."""
    snarl = LP(cut(pitch(S('fs69570_lion', onset=False), -7), 0.8, 0.35), 3500)
    jaws = smix((0, transient('k_chop', -5, 150, 6000, 7, -4, 0.15)), (0.06, transient('k_punch_heavy_1', -4, 100, 5000, 6, -4, 0.2), -3))
    x = smix((0, fade(snarl, 0.05, 0), -4), (0.32, jaws), (0.33, thump(90, 45, 0.3, 0.09), -6))
    return polish(x, FX_LUFS + 1, 0.4, 0.1, 0.5, 0, 0, None, max_len=1.0)


def scp682_stomp():
    """SCP-682 moves: one heavy clawed footfall that shakes the board."""
    x = smix((0, drumhit('vs_timp_1', -9, 0.5, 300, 4, -4)), (0, transient('k_wood_heavy_1', -8, 100, 3000, 5, -4, 0.2), -4),
             (0.01, HP(cut(S('fs569746_gravel'), 0.25, 0.12), 400), -14))
    return polish(x, FX_LUFS - 2, 0.35, 0.06, 0.4, 0, 0, None, max_len=0.5)


def scp035_possess():
    """SCP-035 (the mask) forces a piece to move: a hoarse whispered breath swells in and the piece is pushed, possessed."""
    wh = contour(BP(noise(0.6, 1200, 6000, 230), 1200, 6000), [(0, -30), (0.4, -2), (0.6, -40)])
    wh = autopan(wh, 0.8, 4.0, 0.7)
    push = smix((0, transient('k_wood_medium_2', -3, 200, 5000, 5, -4, 0.14)), (0, thump(120, 60, 0.15, 0.05), -8))
    x = smix((0, E.flange(wh, 2.0, 7.0, 0.5, 0.6), -4), (0.45, push))
    return polish(x, FX_LUFS - 2, 0.5, 0.1, 0.5, 0, 0, None, max_len=0.85)


def scp106_ooze():
    """SCP-106 (the old man) seeps one square: a slow wet corroding drag through the floor."""
    x = smix((0, LP(cut(pitch(S('k_cloth_4'), -9), 0.5, 0.2), 1800)), (0.05, LP(cut(pitch(S('fs743246_stone'), -14), 0.5, 0.2), 900), -4),
             (0, contour(BP(noise(0.5, 300, 1500, 240), 300, 1500), [(0, -30), (0.25, -8), (0.5, -40)]), -8))
    return polish(fade(x, 0.04, 0.12), FX_LUFS - 4, 0.4, 0.1, 0.5, 0, 0, None, max_len=0.6)


def scp106_drag():
    """SCP-106 drags pieces into his pocket dimension: the floor gives way, pulled down and away into a long sinking
    corridor of air. ~1.4 s."""
    give = smix((0, transient('k_plank_3', -6, 120, 3000, 5, -4, 0.2)), (0, drumhit('vs_timp_1', -10, 0.8, 300, 3, -3), -4))
    pull = fall_sweep(1.2, 4000, 120, 241)
    x = smix((0, give), (0.05, LP(pull, 3000), -2), (0.05, subdrop(60, 28, 1.3, 0.5), -6))
    return master(lead(mbcomp(hall(x, 0.2, 1.6, 2500, 0.02, 140, 241))), FX_LUFS + 1, 's', max_len=1.5)


def scp049_step():
    """SCP-049 (the plague doctor) walks: one measured, heavy-booted step and the swish of a long coat."""
    x = smix((0, transient('k_footstep_wood_1', -4, 120, 5000, 5, -4, 0.12)), (0.02, LP(cut(pitch(S('k_cloth_3'), -3), 0.25, 0.1), 5000), -8))
    return polish(x, FX_LUFS - 5, 0.3, 0.08, 0.4, 0, 0, None, max_len=0.35)


def scp049_cure():
    """SCP-049 "cures" a piece: a gloved hand laid on it, a slow exhale, and a muffled low thud as it falls still."""
    hand = LP(cut(S('k_leather_drop'), 0.2, 0.08), 4000)
    ex = contour(LP(HP(noise(0.8, 300, 4000, 250), 300), 2500), [(0, -30), (0.15, -4), (0.8, -40)])
    th = smix((0, LP(transient('k_soft_heavy_0', -5, 60, 1200, 4, -4, 0.3), 1200)), (0, drumhit('vs_bassdrum_rub', -3, 0.6, 250, 2, 0), -6))
    x = smix((0, hand, 2), (0.1, HP(ex, 1200), -10), (0.45, th, 4))
    return polish(x, FX_LUFS - 1, 0.4, 0.08, 0.4, 0, 0, None, max_len=1.0)


def scp966_turn():
    """SCP-966 strikes unseen in the dark: fast claws raking past, and the pieces turning with a dry stifled thump."""
    rake = smix(*[(0.11 * i, pan(HP(cut(pitch(S('k_knife_slice_2'), 3 - i), 0.12, 0.05), 1500), -0.6 + 0.6 * i), -i) for i in range(3)])
    th = smix((0, transient('k_punch_medium_0', -5, 300, 3000, 5, -4, 0.2)), (0, thump(100, 50, 0.25, 0.08), -12))
    x = smix((0, rake), (0.36, th, -8))
    return polish(HP(x, 300), FX_LUFS - 1, 0.5, 0.08, 0.4, 0, 0, None, max_len=0.7)


def scp939_creep():
    """SCP-939 creeps toward the last sound: low padded paws and a wet breath."""
    paws = smix((0, LP(transient('k_footstep_carpet_2', -6, 80, 1800, 4, -4, 0.1), 1800)), (0.16, LP(transient('k_footstep_carpet_0', -7, 80, 1600, 4, -4, 0.1), 1600), -3))
    br = contour(LP(HP(noise(0.5, 200, 2500, 260), 200), 1800), [(0, -30), (0.2, -6), (0.5, -40)])
    x = smix((0, paws), (0.05, br, -10))
    return polish(x, FX_LUFS - 5, 0.4, 0.08, 0.4, 0, 0, None, max_len=0.55)


def scp939_bite():
    """SCP-939 devours a piece: a guttural lunge and a wet crunching snap."""
    hiss = contour(HP(noise(0.3, 2000, 10000, 261), 2000), [(0, -30), (0.25, 0), (0.3, -40)])
    snap = smix((0, transient('k_knife_slice_1', -2, 1200, 11000, 7, -4, 0.08)), (0.01, transient('k_chop', 2, 900, 10000, 6, -4, 0.08), -3))
    x = smix((0, hiss, -10), (0.28, snap), (0.42, snap, -3))
    return polish(HP(x, 500), FX_LUFS - 1, 0.45, 0.06, 0.3, 0, 0, None, max_len=0.65)


def scp409_freeze():
    """SCP-409 crystallizes pieces: a fast creeping crackle of crystal growing over stone, ending in a dry set (no glass)."""
    grow = contour(HP(cut(S('fs45650_fuse', onset=False), 0.7, 0.1), 2500), [(0, -24), (0.55, 0), (0.7, -40)])
    grit = contour(HP(cut(S('fs569746_gravel'), 0.7, 0.1), 3000), [(0, -30), (0.6, -4), (0.7, -40)])
    sett = smix((0, transient('fs743246_stone', 4, 800, 12000, 8, -6, 0.06)), (0, click(0.004, 3000, 15000, 270), -8))
    x = smix((0, widen(grow, 0.8)), (0, grit, -6), (0.66, sett, -2))
    return polish(x, FX_LUFS - 2, 0.5, 0.06, 0.3, 0, 0, None, max_len=0.85)


def scp409_shatter():
    """a crystallized piece breaks apart into hard stony crystal grit (no glass ping)."""
    burst = smix((0, transient('fs743246_stone', 5, 600, 13000, 8, -4, 0.15)), (0, transient('k_chop', 6, 1000, 13000, 7, -6, 0.08), -4),
                 (0.02, HP(cut(S('fs569746_gravel'), 0.4, 0.2), 2500), -4))
    return polish(burst, FX_LUFS - 1, 0.55, 0.08, 0.35, 0, 0, None, max_len=0.5)


def scp409_step():
    """SCP-409 slides one square: a dry stone shard dragged across the board."""
    x = HP(cut(pitch(S('fs743246_stone'), 3), 0.22, 0.1), 700)
    return polish(fade(x, 0.01, 0.06), FX_LUFS - 6, 0.35, 0.05, 0.25, 0, 0, None, max_len=0.25)


def scp426_toast():
    """SCP-426 (the toaster) convinces pieces they are toasters: the lever pressed down, a warm element ticking on."""
    lever = smix((0, transient('k_metal_latch', -2, 300, 9000, 6, -4, 0.12)), (0.0, thump(150, 90, 0.08, 0.02), -12))
    tick = smix(*[(0.12 + 0.09 * i, transient('k_metal_click', 6, 2000, 12000, 6, -8, 0.02), -18 - i) for i in range(4)])
    warm = contour(BP(noise(0.6, 400, 3000, 280), 400, 3000), [(0, -40), (0.3, -12), (0.6, -40)])
    x = smix((0, lever), (0, tick), (0.1, warm, -8))
    return polish(x, FX_LUFS - 3, 0.3, 0.06, 0.3, 0, 0, None, max_len=0.75)


def scp426_hop():
    """SCP-426 hops one square: a small metal box set down hard on the board."""
    x = smix((0, transient('k_metal_latch', -6, 200, 7000, 6, -6, 0.08)), (0, transient('k_wood_medium_0', -2, 150, 5000, 5, -6, 0.1), -4))
    return polish(x, FX_LUFS - 5, 0.3, 0.05, 0.25, 0, 0, (140, 80, 0.02, 0.08, 0.03), -12, max_len=0.2)


def scp096_rip():
    """SCP-096 (Shy Guy) reaches whoever saw its face: a tearing lunge and a violent, final impact."""
    tear = smix((0, HP(cut(pitch(S('k_cloth_2'), -2), 0.25, 0.08), 600)), (0.03, HP(cut(S('k_knife_slice_2'), 0.2, 0.06), 1200), -4))
    slam = smix((0, transient('k_punch_heavy_1', -2, 100, 7000, 7, -3, 0.25)), (0, impact(0.5, 0.2, False, 290, 0.7), -6))
    after = contour(HP(cut(pitch(S('k_cloth_4'), 1), 0.6, 0.2), 1500), [(0, -6), (0.6, -40)])
    x = smix((0, tear), (0.14, HP(slam, 250)), (0.2, after, -2))
    return polish(x, FX_LUFS + 1, 0.45, 0.08, 0.4, 0, 0, None, max_len=0.9)



# ================================================================ batch 3: the real-time and game-frame videos
def kf_dash():
    """Kung Fu Chess (real time): a piece darts across: a tight sleeve whoosh and a light landing step."""
    x = smix((0, bp(cut(pitch(S('fs683101_whoosh'), 5), 0.13, 0.05), 900, 10000), -4),
             (0.09, transient('k_footstep_wood_1', 2, 300, 7000, 6, -6, 0.06), -6))
    return polish(x, FX_LUFS - 5, 0.4, 0.03, 0.2, 2, -4, None, max_len=0.2)


def kf_strike():
    """Kung Fu Chess: a capture is a strike: a fast swing and a hard, dry punch-kick landing."""
    x = smix((0, bp(cut(pitch(S('fs683101_whoosh'), 2), 0.16, 0.05), 600, 10000), -6),
             (0.1, transient('fs348243_punch', 0, 120, 9000, 7, -4, 0.2)), (0.1, transient('k_punch_heavy_1', 1, 150, 8000, 6, -4, 0.15), -4),
             (0.1, click(0.004, 2500, 14000, 300), -10))
    return polish(x, FX_LUFS, 0.4, 0.06, 0.3, 0, 0, (120, 60, 0.03, 0.15, 0.05), -6, max_len=0.42)


def kf_start():
    """Kung Fu Chess begins: a staff spun through the air twice, then a big low drum hit and a sharp shout of air. ~1.6 s."""
    spin = smix((0, bp(cut(pitch(S('fs60027_swosh'), -2), 0.3, 0.06), 300, 8000)), (0.28, bp(cut(pitch(S('fs60027_swosh'), 0), 0.25, 0.06), 400, 9000), -2))
    drum = smix((0, drumhit('vs_timp_hi', -5, 1.0, 900, 6, -2)), (0, drumhit('v_framedrum_muted', -4, 0.4, 5000, 6, -4), -4),
                (0, drumhit('v_bassdrum', -2, 0.8, 300), -4))
    x = smix((0, panmove(spin, -0.6, 0.6), -4), (0.55, drum), (0.56, widen(air(0.5, 9000, 3000, 0.15, 2500, 301), 1.0), -14))
    return master(lead(mbcomp(hall(x, 0.16, 1.3, 5000, 0.015, 180, 301))), ST_LUFS, 's', max_len=1.8)


def br_drop():
    """Chess Arena Battle Royale begins: the players drop in: wind rushing past, falling away into a heavy landing thud. ~1.7 s."""
    wind = contour(fall_sweep(1.1, 9000, 500, 310), [(0, -8), (0.9, 0), (1.1, -30)])
    land = smix((0, transient('k_soft_heavy_0', -3, 60, 3000, 6, -3, 0.3)), (0, drumhit('vs_timp_1', -6, 0.7, 400, 4, -3), -3),
                (0.01, HP(cut(S('fs569746_gravel'), 0.4, 0.2), 400), -10))
    x = smix((0, widen(wind, 0.9), -2), (1.05, land))
    return master(lead(mbcomp(hall(x, 0.14, 1.2, 4500, 0.015, 180, 310))), ST_LUFS, 's', max_len=1.9)


def br_elim():
    """Battle Royale: a piece is eliminated: a crunching hit and a short dull knock-out thump with grit."""
    one = smix((0, transient('k_punch_heavy_1', -1, 300, 9000, 7, -3, 0.15)), (0, transient('k_chop', 0, 600, 10000, 6, -4, 0.1), -4))
    x = smix((0, one), (0.13, one, -3), (0.14, HP(cut(S('fs462162_rubble'), 0.35, 0.15), 1500), -8))
    return polish(HP(x, 250), FX_LUFS, 0.4, 0.06, 0.3, 0, 0, None, max_len=0.6)


def br_tremor():
    """Battle Royale, the Tremor ability: the ground heaves: a rolling low quake with rubble shaking loose. ~1.2 s."""
    q = contour(LP(widen(noise(1.2, 25, 300, 311), 0.8), 200), [(0, -20), (0.15, 0), (0.8, -4), (1.2, -40)])
    q = autopan(q, 3.0, 6.0, 0.4)
    rub = contour(LP(cut(S('fs462162_rubble'), 1.1, 0.4), 4000), [(0, -20), (0.3, -2), (1.1, -30)])
    x = smix((0, q), (0.05, widen(rub, 0.8), -6), (0, drumhit('vs_timp_roll_lo', -6, 1.0, 400, 2, 0), -6))
    return polish(x, FX_LUFS + 1, 0.5, 0.08, 0.6, 0, 0, None, max_len=1.25)


def t5d_start():
    """5D Chess begins: time folds open: a reversed swell runs backwards through a slow comb sweep and lands on a
    soft deep drum with a tail that drifts out to both sides. ~2 s."""
    fold = contour(rev(cut(pitch(S('fs462879_ethereal'), -3), 1.0, 0.05)), [(0, -30), (0.9, 0), (1.0, -40)])
    land = smix((0, drumhit('v_framedrum_muted', -3, 0.4, 6000, 6, -4)), (0, transient('k_wood_heavy_1', 2, 300, 11000, 6, -4, 0.1), -4),
                (0, click(0.005, 3000, 15000, 321), -8))
    echo = smix(*[(0.18 * k, pan(transient('k_wood_heavy_1', 2 - k, 400, 9000, 6, -6, 0.08), (-1) ** k * 0.7), -8 - 4 * k) for k in range(1, 4)])
    hold = contour(bp(cut(pitch(S('fs462879_ethereal'), -8), 1.2, 0.4), 300, 5000), [(0, -20), (0.3, -4), (0.9, -6), (1.2, -40)])
    x = smix((0, autopan(bp(fold, 600, 11000), 0.5, 3.0, 0.8)), (1.0, land), (1.0, echo), (1.0, widen(hold, 1.0), -2))
    return master(lead(mbcomp(hall(x, 0.18, 1.6, 4500, 0.02, 180, 320))), ST_LUFS, 's', max_len=2.2)


def t5d_capture():
    """5D Chess: a capture across time: a tight hit whose tail is sucked backwards out of the timeline."""
    hitx = smix((0, transient('k_wood_heavy_1', 0, 150, 9000, 7, -4, 0.15)), (0, thump(130, 65, 0.15, 0.04), -8))
    back = contour(swell_rev('fs683101_whoosh', 2, 0.3), [(0, -30), (0.28, 0), (0.3, -40)])
    x = smix((0, back, -6), (0.3, hitx), (0.32, HP(rev(cut(S('k_wood_heavy_1'), 0.25, 0.05)), 400), -10))
    return polish(x, FX_LUFS - 2, 0.45, 0.06, 0.3, 0, 0, None, max_len=0.65)


def craft_combine():
    """Infinite Craft: two elements dragged together: a soft card slide and the tile settling."""
    x = smix((0, LP(cut(S('k_card_slide_2'), 0.22, 0.08), 9000), -2), (0.16, transient('k_chip_lay_1', 0, 400, 12000, 5, -6, 0.08)))
    return polish(x, FX_LUFS - 5, 0.35, 0.05, 0.25, 0, 0, None, max_len=0.3)


def craft_new():
    """Infinite Craft: a first discovery: the tiles snap together, a puff of air opens upward and settles warm
    (a short open viola-violin fifth swelling in, no struck notes). ~1.2 s."""
    snap = smix((0, transient('k_chip_lay_3', 1, 400, 13000, 6, -4, 0.08)), (0, click(0.004, 3000, 15000, 330), -10))
    puff = panmove(bpsweep(clip('fs60027_swosh', 0.4, 4), 800, 9000, 1.2), -0.3, 0.4)
    warm = contour(pad([65, 72], 0.9, attack=0.12, lpf=5000, width=1.0, section=['viola', 'violin']), [(0, -14), (0.25, 0), (0.9, -24)])
    x = smix((0, snap), (0.02, puff, -10), (0.08, warm, -6))
    return master(lead(mbcomp(hall(x, 0.16, 1.0, 6500, 0.01, 300, 330))), FX_LUFS, 'm', max_len=1.3)


def fireworks():
    """Martin's Fireworks: a firework goes off: the launch tube thumps, it streaks up, and bursts into crackle."""
    tube = smix((0, transient('k_soft_heavy_0', 2, 100, 3000, 6, -4, 0.15)), (0, thump(140, 70, 0.12, 0.03), -6))
    streak = bp(glide(cut(S('fs683101_whoosh'), 0.35, 0.05), -2, 6), 1200, 10000)
    burst = smix((0, shape(clip('fs235968_explosion', 0.5, 6), 6, -3)), (0, click(0.006, 2000, 14000, 340), -6))
    crackle = contour(HP(cut(S('fs45650_fuse', onset=False), 1.0, 0.2), 4000), [(0, -6), (0.3, 0), (1.0, -30)])
    x = smix((0, tube, -4), (0.04, streak, -10), (0.4, burst, 2), (0.45, widen(crackle, 1.0), 0),
             (0.75, pan(burst, 0.5), -2), (0.8, pan(crackle, 0.6), -4))
    return polish(x, FX_LUFS + 1, 0.6, 0.1, 0.7, 0, 0, None, max_len=1.9)


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
    'dice_roll': dice_roll, 'roulette_click': roulette_click, 'roulette_bang': roulette_bang,
    'scp682_bite': scp682_bite, 'scp682_stomp': scp682_stomp, 'scp035_possess': scp035_possess,
    'scp106_ooze': scp106_ooze, 'scp106_drag': scp106_drag, 'scp049_step': scp049_step, 'scp049_cure': scp049_cure,
    'scp966_turn': scp966_turn, 'scp939_creep': scp939_creep, 'scp939_bite': scp939_bite,
    'scp409_freeze': scp409_freeze, 'scp409_shatter': scp409_shatter, 'scp409_step': scp409_step,
    'scp426_toast': scp426_toast, 'scp426_hop': scp426_hop, 'scp096_rip': scp096_rip,
    'kf_dash': kf_dash, 'kf_strike': kf_strike, 'kf_start': kf_start, 'br_drop': br_drop, 'br_elim': br_elim,
    'br_tremor': br_tremor, 't5d_start': t5d_start, 't5d_capture': t5d_capture, 'craft_combine': craft_combine,
    'craft_new': craft_new, 'fireworks': fireworks,
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
    'icm-scp4975': ['crack_crawl', 'crack_scan', 'crack_shatter'],   # asset folder of SCP-4975 (mode file is now HuZlhHnES7M.js, the video)
    'B5LGzOEZSyo': ['dice_roll'],
    '0VbTOk8X1TY': ['roulette_click', 'roulette_bang'],
    '06OeGk5Iu-s': ['scp682_bite', 'scp682_stomp'],
    '4XV3SBMQgXE': ['scp035_possess'],
    '_Kx4ChHuCgI': ['scp106_ooze', 'scp106_drag'],
    'byhq5v6BUWg': ['scp049_step', 'scp049_cure'],
    'mwv48BWl2DY': ['scp966_turn'],
    's2WDIfvefEk': ['scp939_creep', 'scp939_bite'],
    'ndbf05-bvgQ': ['scp409_freeze', 'scp409_shatter', 'scp409_step'],
    'lpqVYTH9U-A': ['scp426_toast', 'scp426_hop'],
    '-fax07t_o5s': ['scp096_rip'],
    '9M2Mj2WFFys': ['kf_dash', 'kf_strike', 'kf_start'],
    'CONozr99agQ': ['br_drop', 'br_elim', 'br_tremor'],
    'BbgwPj-u_gs': ['t5d_start', 't5d_capture'],
    '-TKJGtBKK8U': ['craft_combine', 'craft_new'],
    '30CbSsx8ixM': ['fireworks'],
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
    'HuZlhHnES7M': {'sounds': _set(crack_crawl='crack_crawl', crack_scan='crack_scan', crack_shatter='crack_shatter'),
                    'repl': [("ctx.remove(sq); ctx.sound('capture');", "ctx.remove(sq); ctx.sound('crack_shatter');"),
                             ("ctx.sound('move-check');", "ctx.sound('crack_scan');"),
                             ("ctx.move(s, to); ctx.sound('move-opponent');", "ctx.move(s, to); ctx.sound('crack_crawl');")]},
}

# ---------------------------------------------------------------- batch 2 wiring
DICE = ['B5LGzOEZSyo', 'CEkC0TINhm8', 'Cr3j7jf5xXk', 'CuwO5ygTGCM', 'HkeZayq10p8', 'Jg-oNqDOXtg', 'KJYUsRlj_34', 'OcWzHqqeLNg',
        'Rtee8TRU0vg', 'dwiAKx06Q9E', 'eKAOw0yaqyA', 'exMFzra96vo', 'haNXJMir3Zk', 'prd7LxnJtL4', 'vm0JynHlzys']
for _m in DICE:   # g1_dice plays 'tick' when the dice are rolled
    WIRE[_m] = {'sounds': _set(tick='dice_roll')}
SHOTGUN = 'assets/modes/NK4Upb_s8Ok/blast.wav'   # Shotgun King's own shotgun blast (the rank 3 video's set)
for _m in ['AvZiSnngZjA', '9j7h5kF4X9s', 'pzxXxIsKRRo']:   # g4_shotgun fires with ctx.sound('explosion')
    WIRE[_m] = {'sounds': {'explosion': SHOTGUN}}
WIRE['0VbTOk8X1TY'] = {'sounds': _set(tick='roulette_click', explosion='roulette_bang'),   # the explosion fx no longer doubles the shot
                       'repl': [("ctx.fx({ type: 'explosion', at: info.to, radius: 0, shake: false }); ctx.sound('explosion');",
                                 "ctx.fx({ type: 'explosion', at: info.to, radius: 0, shake: false, sound: 'none' }); ctx.sound('explosion');")]}
WIRE['cYVauucyLyQ'] = {'sounds': _set(explosion='roulette_bang')}
_HIT = "ctx.sound('capture'); h.forEach"
WIRE['DMtaRFMpCWc'] = {'sounds': {'hit': 'assets/modes/DMtaRFMpCWc/hit.wav'},
                       'files': [('js/modes/g5_wizard.js', _HIT, "ctx.sound(ctx.spec.sounds && ctx.spec.sounds.hit ? 'hit' : 'capture'); h.forEach")]}
_REAP = "duration_ms: 300 }); ctx.sound('capture'); }"
for _m in ['_RFXN1Ye3sY', 'JAz_qMQpI1o']:   # Ouroboros King: the reap capture
    WIRE[_m] = {'sounds': {'reap': 'assets/modes/_RFXN1Ye3sY/reap.wav'},
                'files': [('js/modes/g5_ouro.js', _REAP, "duration_ms: 300 }); ctx.sound(ctx.spec.sounds && ctx.spec.sounds.reap ? 'reap' : 'capture'); }")]}
for _m in ['Kzt9ItpGtYg', 'zP9TzlgA-W0']:   # Pawnbarian: captures are sword slashes, the shop pays out in coins
    WIRE[_m] = {'sounds': {'capture': 'assets/modes/Kzt9ItpGtYg/slash.wav', 'coin': 'assets/modes/Kzt9ItpGtYg/coin.wav'}}
WIRE['Kzt9ItpGtYg']['repl'] = WIRE['zP9TzlgA-W0']['repl'] = [("ctx.sound('notify'); shop(ctx); };", "ctx.sound('coin'); shop(ctx); };")]
WIRE['06OeGk5Iu-s'] = {'sounds': _set(scp682_bite='scp682_bite', scp682_stomp='scp682_stomp'),
                       'repl': [("ctx.move(s, pick.t); ctx.sound(victim ? 'capture' : 'move-opponent');", "ctx.move(s, pick.t); ctx.sound(victim ? 'scp682_bite' : 'scp682_stomp');")]}
WIRE['4XV3SBMQgXE'] = {'sounds': _set(scp035_possess='scp035_possess'),
                       'repl': [("ctx.move(mv.f, mv.t); ctx.sound(victim ? 'capture' : 'move-opponent');", "ctx.move(mv.f, mv.t); ctx.sound('scp035_possess');")]}
WIRE['_Kx4ChHuCgI'] = {'sounds': _set(scp106_ooze='scp106_ooze', scp106_drag='scp106_drag'),
                       'repl': [("s = to; ctx.sound('move-opponent');", "s = to; ctx.sound('scp106_ooze');"),
                                ("ctx.sound('notify'); ctx.toast('SCP-106 dragged", "ctx.sound('scp106_drag'); ctx.toast('SCP-106 dragged")]}
WIRE['byhq5v6BUWg'] = {'sounds': _set(scp049_step='scp049_step', scp049_cure='scp049_cure'),
                       'repl': [("s = to; ctx.sound('move-opponent');", "s = to; ctx.sound('scp049_step');"),
                                ("ctx.sound('notify'); ctx.toast('SCP-049 cured", "ctx.sound('scp049_cure'); ctx.toast('SCP-049 cured")]}
WIRE['mwv48BWl2DY'] = {'sounds': _set(scp966_turn='scp966_turn'),
                       'repl': [("ctx.sound('notify'); ctx.toast('Something in the fog turned", "ctx.sound('scp966_turn'); ctx.toast('Something in the fog turned")]}
WIRE['s2WDIfvefEk'] = {'sounds': _set(scp939_creep='scp939_creep', scp939_bite='scp939_bite'),
                       'repl': [("ctx.move(s, to); ctx.sound(victim ? 'capture' : 'move-opponent');", "ctx.move(s, to); ctx.sound(victim ? 'scp939_bite' : 'scp939_creep');")]}
WIRE['ndbf05-bvgQ'] = {'sounds': _set(scp409_freeze='scp409_freeze', scp409_shatter='scp409_shatter', scp409_step='scp409_step'),
                       'repl': [("colors: ['#e6f8ff', '#9fdcf5', '#ffffff'] }); ctx.sound('capture');", "colors: ['#e6f8ff', '#9fdcf5', '#ffffff'] }); ctx.sound('scp409_shatter');"),
                                ("s = to; ctx.sound('move-opponent');", "s = to; ctx.sound('scp409_step');"),
                                ("ctx.sound('notify'); ctx.toast('SCP-409 crystallized", "ctx.sound('scp409_freeze'); ctx.toast('SCP-409 crystallized")]}
WIRE['lpqVYTH9U-A'] = {'sounds': _set(scp426_toast='scp426_toast', scp426_hop='scp426_hop'),
                       'repl': [("s = to; ctx.sound(victim ? 'capture' : 'move-opponent');", "s = to; ctx.sound(victim ? 'capture' : 'scp426_hop');"),
                                ("var n = hit.length; ctx.sound('notify');", "var n = hit.length; ctx.sound('scp426_toast');")]}
for _m in ['-fax07t_o5s', 'epzU65ZEdcs']:   # SCP-096 (Shy Guy, and in the fog): the kill
    WIRE[_m] = {'sounds': _set(scp096_rip='scp096_rip'), 'repl': [("ctx.move(s, a); ctx.sound('capture');", "ctx.move(s, a); ctx.sound('scp096_rip');")]}

# ---------------------------------------------------------------- batch 3 wiring (core events replaced for these modes only)
WIRE['9M2Mj2WFFys'] = {'sounds': _set(game__start='kf_start', move__self='kf_dash', move__opponent='kf_dash', capture='kf_strike')}
WIRE['CONozr99agQ'] = {'sounds': _set(game__start='br_drop', capture='br_elim', explosion='br_tremor')}
for _m in ['BbgwPj-u_gs', 'qSwTtgUWqUw']:   # 5D Chess and Tiny 5D Chess
    WIRE[_m] = {'sounds': _set(game__start='t5d_start', capture='t5d_capture')}
WIRE['-TKJGtBKK8U'] = {'sounds': _set(move__self='craft_combine', promote='craft_new')}
WIRE['30CbSsx8ixM'] = {'sounds': _set(explosion='fireworks')}
