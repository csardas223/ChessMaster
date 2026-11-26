"""v7 (2026-11-26, m-sfx): match-start variety and per-family sound sets.

Owner's ask (2026-11-26 12:25 PM ET): "The sound when i start a match is getting tiring hearing the same thing each
time. Add a little variation but not too much, and depending on the mode, make it a different sound, and make extra
sounds to the modes where the default ones feel off. Cinematic or gamey."

- The shared start (events.game_start: pieces placed -> board slam -> string swell) gets three more takes with the
  same character (gs_b, gs_c, gs_d); js/core/sound.js picks one of the four at random, never the last one twice.
- Each mode family gets its own start (horror, fish bots, guns, explosives, medieval, magic, dragons, arcade /
  video-game, sci-fi / time, puzzle / platformer, multiplayer / arena, dice, ducks, Drawback, fog / blindfold,
  odds challenges, bullet / speed); standout modes get their own (Backrooms, Minecraft, nukes, Chess Roulette,
  Spinner Wheel, glitched Drawback). Normal chess, variants, bots and the rest keep the shared start + its takes.
- Families whose default board sounds felt off get effect sounds for the core events (capture): guns, medieval
  battle, magic, dragons, arcade, horror, plus Pac-Man's chomp.
- A mode's own `sounds` map (v6 and older) always wins over its family set (js/core/sound.js).

Same rules as v5/v6: CC0 sources from tools/sfx/sources only (nothing new added), no bells, chimes, dings, glass
pings, synth leads, chiptune or cartoon brass, no riser into a sub boom, every sound its own design, true peak
<= -1.5 dBTP. Gate: python3 tools/sfx/v7_gate.py [reference] (no reference in the sandbox: tools/sfx/ref_proxy.py).
Build: python3 tools/sfx/make_v7.py [name ...]  ->  assets/sounds/game-start-{2,3,4}.mp3, assets/sounds/sets/<name>.mp3
Wire:  python3 tools/sfx/wire_v7.py  ->  js/core/sound-sets.js (family of every mode, from FAMILY below).
"""
import numpy as np
from synth import SR, lp, hp, bp
from samples import S, pitch, glide, rev, cut
import cine as C
from cine import st, smix, widen, pan, fade, air, thump, click, shape, mbcomp, peq, shelf, sat, master
from core import EV_LUFS, pad, transient
import events as E
from events import clip, contour, LP, HP, BP, hall, drumhit, bpsweep, panmove, autopan, lead, norm, gap
from modes import polish, FX_LUFS
from modes_v6 import gate_stutter, creak, swell_rev, noise

ST_LUFS = EV_LUFS - 1.0   # starts sit with the v6 mode starts


# ================================================================ the shared start, three more takes
def _gs(taps, slam_t, notes, sect, sw_env, slam_gain=0.0, timp=('vs_timp_hi', -3), lpf=3600, seed=31, slide=False,
        max_len=2.8, width=1.0):
    """events.game_start's character (felt-and-wood placements -> wide board slam on timpani + bass drum -> warm
    string swell), re-voiced: tap pattern, slam time, chord and swell shape change per take."""
    parts = []
    for i, (tt, src, s_, p) in enumerate(taps):
        parts.append((tt, pan(transient(src, s_, 200, 12000, 5, -5, 0.14), p), -9 + i * 1.0))
    if slide:
        parts.append((0.0, panmove(HP(LP(clip('k_card_shove_2', 0.3), 6000), 300), -0.5, 0.3), -8))
    flourish = smix(*parts)
    felt = LP(clip('k_footstep_carpet_0', 0.3), 1800)
    slam = smix((0, widen(shape(clip('k_wood_heavy_1', 0.7, -2), 5, -1), 0.5)),
                (0, drumhit(timp[0], timp[1], 1.6, 900), -3 + slam_gain), (0, drumhit('v_bassdrum', 0, 1.2, 400), -4 + slam_gain),
                (0, felt, -6), (0, click(0.005, 2500, 14000, seed), -12))
    slam = contour(slam, [(0, 0), (0.2, -4), (0.45, -20)])
    d = sw_env[-1][0]
    swell = contour(pad(notes, d, attack=0.4, lpf=lpf, close=lpf * 0.7, width=width, section=sect), sw_env)
    x = smix((0, flourish, -2), (slam_t, slam), (slam_t + 0.02, swell, -3),
             (slam_t + 0.05, widen(air(0.9, 9000, 4000, 0.35, 3000, seed, 1.0), 0.8), -22))
    x = hall(x, 0.2, 1.8, 6000, 0.015, 200, seed)
    x = mbcomp(x, thr=(-16.0, -22.0, -26.0), ratio=(1.8, 2.0, 2.0))
    return master(gap(x, slam_t, 0.04), EV_LUFS, 's', max_len=max_len)


def gs_b():
    """take 2: four quick placements, an earlier slam, a second softer knock as the last piece is set, and a
    G-major swell that blooms after it. ~2.5 s"""
    taps = [(0.0, 'k_wood_light_1', 0, 0.5), (0.08, 'k_chip_lay_1', 1, 0.1), (0.15, 'k_wood_light_2', 2, -0.4),
            (0.22, 'k_chips_stack_2', 1, -0.6)]
    sw = [(0, -30), (0.5, -26), (0.9, -6), (1.3, 0), (1.7, -2), (2.1, -24)]
    x = _gs(taps, 0.34, [43, 55, 62, 67, 71], ['cello', 'cello', 'viola', 'viola', 'violin'], sw, 1.0,
            ('vs_timp_1', -2), 3200, 41, max_len=2.6)
    knock = smix((0, drumhit('vs_timp_hi', -1, 0.8, 900, 5, -3)), (0, transient('k_wood_heavy_1', 0, 150, 10000, 6, -4, 0.15), -3))
    return master(smix((0, x), (0.34 + 0.62, pan(knock, 0.3), -9)), EV_LUFS, 's', max_len=2.6)


def gs_c():
    """take 3: the pieces are swept into place across the felt (a slide and two clicks), the slam, then an open
    A-sus swell that starts low and keeps growing to the very end. ~2.8 s"""
    taps = [(0.12, 'k_chips_stack_2', 0, 0.3), (0.26, 'k_wood_light_4', 1, 0.6)]
    sw = [(0, -40), (0.5, -30), (1.2, -12), (1.9, -2), (2.25, 0), (2.4, -8)]
    return _gs(taps, 0.40, [45, 52, 57, 64, 69, 71], ['cello', 'cello', 'viola', 'viola', 'violin', 'violin'], sw, -1.0,
               ('vs_timp_hi', -1), 4000, 51, slide=True, max_len=2.85)


def gs_d():
    """take 4: two rows set down (left group, then right group), a later, heavier slam and a low, darker D swell
    that rises at once, breathes down and comes back. ~2.8 s"""
    taps = [(0.0, 'k_wood_light_0', -2, -0.7), (0.07, 'k_wood_light_3', -1, -0.5), (0.13, 'k_chip_lay_3', 0, -0.3),
            (0.33, 'k_wood_light_1', 0, 0.3), (0.40, 'k_wood_light_2', 1, 0.5), (0.46, 'k_chips_stack_2', 1, 0.7)]
    sw = [(0, -10), (0.15, -2), (0.6, -2), (1.0, -14), (1.5, -3), (1.9, -3), (2.15, -24)]
    return _gs(taps, 0.62, [38, 45, 50, 57, 62], ['cello', 'cello', 'cello', 'viola', 'viola'], sw, 2.0,
               ('vs_timpani_lo', 0), 2600, 61, max_len=2.85)


# ================================================================ family starts
def hz_start():
    """horror family: a slow double heartbeat under a cold breath of wind, a far-off structural creak, then a low
    cello minor-second cluster creeping in and holding. No hit, no riser. ~2.7 s"""
    def beat(g):
        return smix((0, LP(drumhit('v_framedrum_muted', -10, 0.35, 900, 5, -6), 400)), (0, thump(75, 45, 0.25, 0.06), -2 + g))
    hb = smix((0, beat(0)), (0.22, beat(-3), -4), (0.95, beat(-1), -2), (1.17, beat(-4), -6))
    breath = contour(LP(clip('fs146932_wind', 2.4, -7), 1600), [(0, -40), (0.6, -14), (1.6, -10), (2.4, -40)])
    clus = contour(pad([37, 38, 49], 1.9, attack=0.7, lpf=900, width=0.7, section='cello'), [(0, -30), (1.0, -6), (1.6, -4), (1.9, -26)])
    x = smix((0.02, hb), (0, widen(breath, 0.9), -6), (0.7, creak(0.9, -10), -14), (0.8, clus, -2))
    x = hall(x, 0.22, 2.0, 3000, 0.03, 120, 701)
    return master(lead(mbcomp(x)), ST_LUFS - 1, 's', max_len=2.8)


def fish_start():
    """fish bots: a fishing reel ratchets out, the line whips through the air, the bait plunges into the water,
    and the water churns harder and harder with bubbles boiling up under the surface. Gamey. ~2.8 s"""
    ts = np.cumsum([0.0] + [0.05 - 0.0012 * k for k in range(13)])
    reel = smix(*[(t, pan(transient('k_metal_click', 5 + (k % 2), 1200, 9000, 6, -8, 0.03), -0.3 + 0.05 * k), 0)
                  for k, t in enumerate(ts)])
    cast = panmove(bp(cut(pitch(S('fs683101_whoosh'), 6), 0.18, 0.05), 1500, 9000), -0.4, 0.6)
    rng = np.random.default_rng(702)
    nz = rng.standard_normal(int(SR * 0.6))
    splash = BP(nz, 200, 5000) * np.exp(-np.arange(len(nz)) / SR / 0.09)
    plunge = smix((0, norm(splash)), (0, thump(110, 50, 0.25, 0.06), -2))
    churn = contour(LP(noise(2.1, 80, 1500, 703), 700), [(0, -20), (0.2, -8), (1.5, 0), (1.8, 0), (2.1, -40)])
    bubbles = []
    for k in range(36):
        f0 = 240 + 140 * rng.random() + 8 * k
        n = int(SR * 0.035)
        tt = np.arange(n) / SR
        b = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 2.0 * tt / 0.035)) / SR) * np.exp(-tt / 0.013)
        bubbles.append((0.08 + 1.75 * (k / 36) ** 0.8 + 0.03 * rng.random(), pan(b, rng.random() * 1.2 - 0.6), -12 + 0.35 * k))
    under = LP(smix(*bubbles), 1800)
    x = smix((0, reel, 2), (0.5, cast, -2), (0.62, plunge, -6), (0.64, widen(churn, 0.7), 0), (0.66, under, 2))
    return master(lead(mbcomp(hall(gap(x, 0.62, 0.03), 0.14, 1.1, 4000, 0.01, 160, 702))), ST_LUFS, 's', tp=-2.6, max_len=2.9)


def gun_start():
    """guns: a magazine slammed home, the slide racked back and released, a beat, then a heavy low drum hit
    and a dry room. Gamey, weighty. ~1.5 s"""
    mag = smix((0, transient('k_metal_latch', -3, 200, 9000, 7, -4, 0.12)), (0, transient('k_soft_heavy_0', 2, 100, 3000, 5, -4, 0.1), -8))
    back = smix((0, transient('k_metal_click', -2, 400, 11000, 6, -6, 0.06)), (0.01, bp(cut(S('fs683101_whoosh'), 0.07, 0.03), 2000, 9000), -12))
    fwd = smix((0, transient('k_metal_latch', 3, 600, 12000, 7, -3, 0.1)), (0, click(0.004, 3000, 15000, 703), -10))
    hit = smix((0, drumhit('vs_timp_1', -7, 0.9, 500, 5, -3)), (0, drumhit('v_bassdrum', -3, 0.7, 300), -3),
               (0, transient('k_punch_heavy_1', -4, 80, 5000, 6, -3, 0.2), -4))
    x = smix((0, mag, -2), (0.32, pan(back, 0.2)), (0.45, pan(fwd, 0.25)), (0.85, hit))
    return master(lead(mbcomp(hall(x, 0.1, 0.9, 5000, 0.01, 200, 703))), ST_LUFS, 's', max_len=1.6)


def boom_start():
    """explosives: a flint strike lights the fuse, it sizzles across the board, a dull blast goes off far away,
    then a second, closer one, and the low debris keeps rolling and settling. ~2.8 s"""
    strike = smix((0, transient('k_metal_click', 4, 800, 9000, 7, -6, 0.04)), (0.01, HP(clip('fs45650_fuse', 0.08, 3), 3000), -6))
    fuse = panmove(contour(HP(clip('fs45650_fuse', 1.2, 0, onset=False), 1500), [(0, -10), (0.05, -2), (1.0, -4), (1.2, -30)]), -0.6, 0.2)
    far = LP(shape(clip('fs235968_explosion', 0.9, -8), 4, -2), 500)
    near = smix((0, LP(shape(clip('fs189779_boom', 2.0, -3), 4, -1), 1200)), (0, LP(clip('fs430977_impact', 1.0, -6), 1000), -5))
    deb = contour(LP(clip('fs560510_debris_b', 1.8, -5, onset=False), 1800), [(0, -20), (0.3, -2), (1.3, -4), (1.8, -40)])
    x = smix((0, strike, -8), (0.04, fuse, -6), (0.75, far, -6), (1.15, near), (1.2, widen(deb, 0.6), -4))
    x = gap(x, 1.15, 0.04)
    return master(lead(mbcomp(hall(x, 0.22, 1.8, 2400, 0.04, 120, 704))), ST_LUFS, 's', max_len=3.0)


def nuke_start():
    """nukes: two launch keys turned, a far-off air-raid siren winding up behind the bunker wall, and a deep
    concrete thud as the blast doors seal while the siren keeps wailing. ~2.6 s"""
    key = lambda s_: LP(transient('k_metal_latch', s_, 300, 5000, 6, -5, 0.08), 4500)
    keys = smix((0, key(-1)), (0.3, pan(key(1), 0.4), -1))
    siren = contour(LP(HP(clip('fs52906_siren', 2.4, -9, onset=False), 250), 1500), [(0, -40), (0.7, -8), (1.8, -4), (2.4, -40)])
    door = smix((0, drumhit('vs_timp_1', -9, 1.0, 350, 5, -3)), (0, transient('k_wood_heavy_3', -7, 60, 2500, 5, -3, 0.25), -4),
                (0.01, LP(HP(clip('fs569746_gravel', 0.4), 500), 4000), -16))
    x = smix((0, keys, -6), (0.25, widen(siren, 0.7), -2), (0.62, door))
    return master(lead(mbcomp(hall(x, 0.22, 1.8, 2600, 0.03, 120, 705))), ST_LUFS, 's', max_len=2.7)


def sword_start():
    """medieval / battle: a sword drawn from its scabbard, four war-drum strokes building, and a low cello-viola
    fifth that swells under the last and holds. ~2.6 s"""
    draw = smix((0, LP(clip('k_draw_knife_1', 0.45, -3), 9000)), (0.02, bp(cut(pitch(S('fs60027_swosh'), 3), 0.3, 0.08), 1500, 10000), -10))
    d1 = smix((0, drumhit('vs_timp_hi', -4, 0.7, 800, 5, -3)), (0, drumhit('v_framedrum_muted', -5, 0.3, 4000, 6, -4), -6))
    d3 = smix((0, drumhit('vs_timp_1', -5, 1.2, 700, 5, -2)), (0, drumhit('v_bassdrum', -2, 1.0, 300), -3),
              (0, drumhit('v_handdrum', -3, 0.3, 5000, 6, -4), -6))
    fifth = contour(pad([38, 45, 50, 57], 1.7, attack=0.25, lpf=1800, width=0.8, section=['cello', 'cello', 'viola', 'viola']),
                    [(0, -20), (0.3, -4), (1.3, -2), (1.7, -30)])
    x = smix((0, pan(draw, -0.3), -4), (0.45, pan(d1, -0.4), -4), (0.7, pan(d1, 0.4), -3), (0.95, d1, -2), (1.2, d3), (1.22, fifth, -2))
    return master(lead(mbcomp(hall(x, 0.2, 1.7, 4000, 0.02, 160, 706))), ST_LUFS, 's', max_len=2.9)


def sword_capture():
    """medieval capture: a blade whipped in and a bright steel-on-steel clash. ~0.35 s"""
    sw = bp(cut(pitch(S('fs683101_whoosh'), 5), 0.1, 0.03), 2000, 11000)
    clash = smix((0, transient('k_knife_slice_2', 4, 2000, 14000, 7, -6, 0.1)), (0, transient('k_metal_latch', 7, 2500, 14000, 7, -8, 0.06), -2),
                 (0, transient('k_punch_heavy_1', 2, 600, 6000, 6, -6, 0.1), -10))
    x = smix((0, sw, -8), (0.07, clash), (0.07, click(0.004, 4000, 15000, 707), -10))
    return polish(shelf(HP(x, 500), 5000, 5.0, 'high'), FX_LUFS, 0.45, 0.07, 0.3, 0, 0, None, max_len=0.36)


def magic_start():
    """magic: a faint shimmer, a soft drum as the spell is cast, then bright sparks and a high swirl of air
    flutter around the board over a thin, high violin fifth. No chimes. ~2.6 s"""
    sh = contour(gate_stutter(HP(noise(0.6, 6000, 15000, 708), 6000), 30, 0.3, 0.5, 708, -40), [(0, -30), (0.15, -12), (0.6, -12)])
    land = smix((0, HP(drumhit('v_framedrum_muted', -2, 0.4, 5000, 5, -3), 250)), (0, click(0.006, 3000, 15000, 708), -6))
    swirl = contour(autopan(HP(clip('fs462879_ethereal', 1.8, 5, onset=False), 1500), 0.8, 4.0, 0.9), [(0, -30), (0.5, -6), (1.4, -4), (1.8, -40)])
    sparks = contour(gate_stutter(HP(noise(1.8, 5000, 16000, 709), 5000), 22, 0.35, 0.6, 709, -40), [(0, -20), (0.6, -6), (1.5, -6), (1.8, -40)])
    open5 = contour(pad([74, 81], 1.9, attack=0.4, lpf=7000, width=1.0, section='violin'), [(0, -30), (0.8, -6), (1.5, -4), (1.9, -30)])
    x = smix((0, widen(sh, 1.0)), (0.55, land), (0.6, swirl, -4), (0.6, widen(sparks, 1.0), -6), (0.65, HP(open5, 900), -8))
    return master(lead(mbcomp(hall(shelf(x, 300, -6, 'low'), 0.26, 1.9, 8000, 0.02, 300, 708))), ST_LUFS, 's', tp=-2.4, max_len=2.7)


def magic_capture():
    """magic capture: a bright burst of sparks off the struck piece over a soft low hit. ~0.35 s"""
    burst = smix((0, click(0.006, 3000, 15000, 709)), (0, HP(clip('fs683101_whoosh', 0.12, 9), 5000), -4),
                 (0, thump(140, 70, 0.12, 0.03), -6))
    sparks = contour(gate_stutter(HP(noise(0.3, 7000, 16000, 709), 7000), 45, 0.3, 0.5, 709, -40), [(0, -2), (0.3, -40)])
    x = smix((0, burst), (0.0, widen(sparks, 1.0), -6))
    return polish(shelf(x, 6000, 4.0, 'high'), FX_LUFS, 0.6, 0.06, 0.25, 0, 0, None, max_len=0.34)


def dragon_start():
    """dragons: wingbeats circling overhead, a heavy timpani stroke as it lands, then a deep roar that builds
    and fills the room over a rising timpani roll. ~2.8 s"""
    def flap(p):
        return pan(smix((0, LP(clip('k_cloth_3', 0.3, -9), 2500)), (0, bp(cut(pitch(S('fs60027_swosh'), -6), 0.3, 0.1), 200, 3000), -4)), p)
    wings = smix((0, flap(-0.4)), (0.2, flap(0.0)), (0.4, flap(0.4)))
    land = smix((0, drumhit('vs_timp_1', -6, 1.0, 500, 5, -3)), (0, transient('k_soft_heavy_0', -4, 60, 2500, 5, -3, 0.2), -4))
    roar = contour(shape(LP(clip('fs69570_lion', 1.9, -7, onset=False), 2600), 1, 1), [(0, -30), (0.6, -6), (1.2, 0), (1.6, -2), (1.9, -30)])
    roll = contour(drumhit('vs_timp_roll_lo', -3, 1.8, 500, 0, 0), [(0, -24), (1.1, 0), (1.8, -30)])
    x = smix((0, wings, -6), (0.6, land), (0.9, widen(roar, 0.6)), (0.7, roll, -4))
    return master(lead(mbcomp(hall(x, 0.2, 1.8, 3500, 0.02, 140, 710))), ST_LUFS, 's', max_len=2.9)


def dragon_capture():
    """dragon capture: a deep growl with a crunching bite in it. ~0.45 s"""
    growl = contour(LP(clip('fs69570_lion', 0.45, -12, onset=False), 1400), [(0, -6), (0.05, 0), (0.45, -30)])
    bite = smix((0, transient('k_chop', -2, 300, 7000, 7, -4, 0.08)), (0, transient('k_punch_heavy_1', -6, 60, 2500, 6, -3, 0.12), -6))
    x = smix((0, growl), (0.03, bite, -4))
    return polish(x, FX_LUFS, 0.35, 0.06, 0.3, 0, 0, None, max_len=0.46)


def arcade_start():
    """arcade / video game: menu clicks and a few coins dropped in, then a punchy hit, a beat, and a bigger
    "GO" hit with a stuttering flash of noise that rides on. Gamey, no chiptune. ~2.1 s"""
    clicks = smix((0, transient('k_ui_click_3', 0, 600, 12000, 6, -6, 0.04)), (0.12, transient('k_ui_click_3', 2, 600, 12000, 6, -6, 0.04), -2))
    coins = smix((0, LP(clip('k_chips_handle_1', 0.35, 3), 9000)), (0.16, transient('k_chip_lay_3', 4, 800, 12000, 6, -6, 0.06), -4))
    hit = lambda s_, g: smix((0, transient('k_punch_medium_0', s_, 120, 9000, 7, -3, 0.15)), (0, drumhit('v_bassdrum', 2 + s_, 0.5, 400), -3),
                             (0, click(0.005, 3000, 12000, 711), -10), (0, thump(160, 70, 0.16, 0.04), -4 + g))
    tail = contour(gate_stutter(BP(noise(1.3, 1200, 7000, 711), 1200, 7000), 16, 0.5, 0.1, 711, -40), [(0, -10), (0.6, -8), (1.3, -40)])
    x = smix((0, clicks, -12), (0.25, coins, -14), (0.55, hit(-2, 0), -3), (0.95, hit(0, 2)), (0.97, widen(tail, 1.0), -10))
    return master(lead(mbcomp(hall(x, 0.12, 1.0, 6000, 0.01, 250, 711))), ST_LUFS, 's', tp=-2.2, max_len=2.2)


def arcade_capture():
    """arcade capture: a punchy knockout hit with a hard bright snap, cut off in a quick stutter. ~0.3 s"""
    hit = smix((0, transient('k_punch_medium_0', 4, 400, 12000, 7, -4, 0.1)), (0, click(0.004, 4000, 16000, 712), -4),
               (0, thump(220, 120, 0.08, 0.02), -8))
    tail = contour(gate_stutter(BP(noise(0.22, 2500, 9000, 712), 2500, 9000), 26, 0.45, 0.1, 712, -40), [(0, -2), (0.22, -40)])
    x = smix((0, hit), (0.03, widen(tail, 1.0), -6))
    return polish(peq(HP(x, 300), 3000, 5.0, 0.8), FX_LUFS, 0.5, 0.05, 0.25, 0, 0, None, max_len=0.32)


def pac_chomp():
    """Pac-Man Chess capture: two quick bites. ~0.3 s"""
    b = smix((0, transient('k_chop', -2, 200, 9000, 7, -5, 0.08)), (0, thump(150, 80, 0.08, 0.025), -6))
    x = smix((0, b), (0.11, b, -2))
    return polish(x, FX_LUFS - 2, 0.3, 0.05, 0.2, 0, 0, None, max_len=0.32)


def mine_start():
    """Minecraft modes: a pickaxe chips at stone three times, the block breaks into rubble that keeps trickling,
    and a new block pops into place. ~2.0 s"""
    pick = lambda s_, p: pan(smix((0, LP(transient('k_mining_4', s_, 150, 4000, 6, -6, 0.08), 3500)), (0, thump(140, 80, 0.1, 0.03), -8)), p)
    brk = smix((0, LP(clip('fs462162_rubble', 1.1), 5000)), (0, LP(transient('k_mining_4', -3, 100, 3500, 6, -3, 0.1), 3000), -2),
               (0.02, LP(HP(clip('fs569746_gravel', 1.2, onset=False), 800), 6000), -6))
    pop = smix((0, transient('k_wood_heavy_3', 2, 200, 8000, 6, -6, 0.1)), (0, thump(170, 85, 0.1, 0.03), -6))
    x = smix((0, pick(0, -0.2), -10), (0.22, pick(1, 0.0), -10), (0.44, pick(-1, 0.2), -9), (0.7, brk), (1.35, pop, 0))
    return master(lead(mbcomp(hall(x, 0.12, 1.0, 5000, 0.01, 200, 713))), ST_LUFS, 's', max_len=2.1)


def scifi_start():
    """sci-fi / time / portals: a heavy power switch is thrown, the machine spins up in two stages after it and
    its field hums on, slowly circling. ~2.5 s"""
    pre = contour(BP(noise(0.5, 80, 1500, 717), 90, 600), [(0, -30), (0.1, -18), (0.5, -18)])
    clunk = smix((0, transient('k_metal_latch', -7, 100, 6000, 6, -3, 0.2)), (0, transient('k_wood_heavy_1', -5, 80, 3000, 5, -3, 0.2), -4),
                 (0, thump(110, 60, 0.2, 0.05), -6))
    spin1 = contour(bpsweep(noise(0.6, 100, 6000, 714), 150, 700, 2.0), [(0, -30), (0.5, -8), (0.6, -16)])
    spin2 = contour(bpsweep(noise(0.8, 100, 8000, 715), 300, 2000, 2.0), [(0, -24), (0.7, -4), (0.8, -10)])
    hum = autopan(contour(BP(noise(1.2, 80, 1200, 716), 90, 700), [(0, -20), (0.2, -4), (0.8, -6), (1.2, -40)]), 0.4, 1.2, 0.7)
    x = smix((0, autopan(pre, 0.3, 0.6, 0.5)), (0.5, clunk), (0.62, spin1, -2), (1.15, spin2), (1.9, hum, -2))
    return master(lead(mbcomp(hall(x, 0.16, 1.4, 5000, 0.02, 160, 714))), ST_LUFS, 's', max_len=3.0)


def puzzle_start():
    """puzzle / platformer: a wooden puzzle box is worked open: a panel slides, tumblers click in an uneven
    rhythm, the lid knocks down, and a warm low cello-viola chord opens up under it. ~2.3 s"""
    slide = panmove(HP(LP(clip('k_plank_1', 0.35, 2), 7000), 300), -0.4, 0.1)
    tumb = smix(*[(t, pan(transient(src, s_, 500, 12000, 6, -7, 0.05), p), g) for t, src, s_, p, g in
                  [(0, 'k_wood_light_0', 4, -0.2, 0), (0.13, 'k_wood_light_3', 6, 0.1, -2), (0.21, 'k_wood_light_1', 3, 0.3, -1),
                   (0.38, 'k_wood_light_4', 5, 0.0, -3)]])
    lid = smix((0, transient('k_wood_heavy_3', -3, 80, 6000, 5, -3, 0.25)), (0, drumhit('v_logdrum', -5, 0.5, 900, 4, -4), -4))
    warm = contour(pad([45, 52, 57, 61], 1.6, attack=0.3, lpf=2200, width=0.9, section=['cello', 'cello', 'viola', 'viola']), [(0, -24), (0.6, -2), (1.2, -2), (1.6, -30)])
    x = smix((0, slide, -12), (0.25, tumb, -10), (0.7, lid), (0.75, warm, -4))
    return master(lead(mbcomp(hall(x, 0.16, 1.2, 5000, 0.01, 200, 718))), ST_LUFS, 's', max_len=2.4)


def arena_start():
    """multiplayer / arena / tournaments: four players take their seats from four sides, then the arena stomps
    twice and claps (stomp-stomp-hit). ~1.9 s"""
    seats = smix(*[(0.17 * k, pan(transient('k_wood_heavy_1', [-2, 0, -1, 1][k], 150, 9000, 6, -4, 0.15), [-0.8, 0.8, -0.4, 0.4][k]), -6)
                   for k in range(4)])
    stomp = smix((0, drumhit('v_bassdrum', 0, 0.5, 300)), (0, transient('k_soft_heavy_0', -2, 60, 3000, 5, -3, 0.15), -4))
    clap = smix((0, drumhit('v_handdrum', 0, 0.3, 7000, 6, -5)), (0, transient('k_punch_medium_0', 1, 400, 11000, 6, -6, 0.1), -3),
                (0, drumhit('vs_timp_hi', -4, 0.9, 900, 5, -2), -4), (0, click(0.005, 3000, 15000, 719), -8))
    x = smix((0, seats), (0.82, stomp), (1.06, stomp, -1), (1.3, widen(clap, 0.6)))
    return master(lead(mbcomp(hall(x, 0.2, 1.4, 5000, 0.02, 180, 719))), ST_LUFS, 's', max_len=2.0)


def dice_start():
    """dice modes: the dice are shaken in a leather cup, the cup is slammed down, a low drum roll builds while
    you wait, and the reveal lands. ~2.2 s"""
    def rattle(s_, p):
        return pan(smix((0, HP(clip('k_dice_throw_1', 0.12, s_), 600)), (0.03, transient('k_chips_collide_2', s_ + 2, 800, 12000, 5, -6, 0.06), -6)), p)
    shake = smix((0, rattle(1, -0.4)), (0.15, rattle(2, 0.4), -1), (0.3, rattle(1, -0.3)))
    slam = smix((0, transient('k_leather_drop', -2, 80, 6000, 6, -3, 0.2)), (0, transient('k_wood_heavy_1', -3, 80, 6000, 6, -3, 0.2), -2),
                (0, drumhit('vs_timp_hi', -6, 0.7, 700, 5, -3), -5))
    roll = contour(drumhit('vs_timp_roll_hi', -4, 0.9, 900, 2, 0), [(0, -24), (0.8, -4), (0.9, -20)])
    rev_ = smix((0, transient('k_wood_heavy_1', -1, 100, 8000, 6, -3, 0.2)), (0, drumhit('vs_timp_1', -4, 0.9, 600, 5, -3), -2),
                (0.01, HP(clip('k_dice_throw_1', 0.3, 0), 900), -6))
    x = smix((0, shake, -14), (0.5, slam), (0.62, roll, -4), (1.5, rev_, 1))
    return master(lead(mbcomp(hall(x, 0.12, 1.1, 6000, 0.01, 200, 720))), ST_LUFS, 's', max_len=2.3)


def duck_start():
    """duck / goose modes: wings flapping in, a solid landing on the board, a quack, a waddle across the
    squares, and a big flapping, honking second quack to finish. ~2.4 s"""
    flap = lambda p: pan(LP(clip('k_cloth_4', 0.16, 4), 6000), p)
    quack = shape(LP(clip('fs418509_quack', 0.45), 8000), 3, -2)
    land = smix((0, transient('k_soft_heavy_0', 0, 80, 6000, 5, -3, 0.2)), (0, thump(140, 70, 0.12, 0.03), -2), (0, click(0.005, 3000, 12000, 721), -10))
    steps = smix(*[(0.15 * k, pan(transient('k_footstep_wood_1', 3 + (k % 2), 300, 8000, 5, -5, 0.07), -0.4 + 0.2 * k), -8 + 1.2 * k) for k in range(5)])
    flurry = smix(*[(0.07 * k, flap(0.3 * (-1) ** k), -2) for k in range(5)])
    x = smix((0, flap(-0.5), -20), (0.12, flap(-0.2), -20), (0.24, flap(0.1), -19), (0.45, land, 2), (0.62, quack, -4),
             (1.0, steps), (1.6, flurry), (1.68, pan(pitch(quack, 1), 0.2), 2))
    return master(lead(mbcomp(hall(gap(x, 0.45, 0.03), 0.14, 1.1, 6000, 0.01, 200, 721))), ST_LUFS - 1, 's', max_len=2.6)


def drawback_start():
    """Drawback Chess: your hidden drawback is dealt: a card slid across face down, a pause, a second card
    tapped onto it, and a low uneasy string cluster swelling underneath. ~2.1 s"""
    slide = panmove(smix((0, LP(clip('k_card_shove_2', 0.3), 9000)), (0.24, transient('k_card_place_1', 0, 400, 12000, 5, -5, 0.08), -2)), -0.5, 0.0)
    tap = smix((0, transient('k_card_place_1', -2, 300, 11000, 6, -4, 0.1)), (0, drumhit('v_framedrum_muted', -7, 0.4, 900, 5, -4), -4))
    clus = contour(pad([48, 49, 55], 1.5, attack=0.4, lpf=1600, width=0.8, section=['cello', 'cello', 'viola']), [(0, -26), (0.6, -4), (1.1, -6), (1.5, -30)])
    x = smix((0, slide, -4), (0.75, tap), (0.6, clus, -4))
    return master(lead(mbcomp(hall(x, 0.18, 1.5, 4000, 0.02, 160, 722))), ST_LUFS - 1, 's', max_len=2.2)


def drawback_glitch_start():
    """the glitched Drawback video: the deal breaks up: the card slide stutters, a bed of static is already
    crackling, a knock, and the cluster drops out in chopped pieces. ~2.3 s"""
    slide = gate_stutter(panmove(LP(clip('k_card_shove_2', 0.5), 9000), -0.5, 0.5), 24, 0.5, 0.6, 723, -40)
    stat = contour(gate_stutter(BP(noise(2.2, 1500, 9000, 723), 1500, 9000), 13, 0.35, 0.7, 724, -45), [(0, -12), (0.1, -8), (1.8, -8), (2.2, -40)])
    clus = gate_stutter(contour(pad([48, 49], 1.8, attack=0.3, lpf=1800, width=0.8, section='cello'), [(0, -20), (0.6, -2), (1.4, -2), (1.8, -30)]), 9, 0.6, 0.5, 725, -36)
    knock = smix((0, transient('k_card_place_1', -4, 300, 11000, 6, -4, 0.1)), (0, thump(90, 50, 0.2, 0.05), -6))
    x = smix((0, slide, -6), (0, widen(stat, 1.0), -12), (0.5, knock), (0.55, clus, -4), (1.15, pan(knock, 0.4), -2))
    return master(lead(mbcomp(hall(x, 0.14, 1.2, 5000, 0.02, 180, 723))), ST_LUFS - 1, 's', max_len=2.4)


def fog_start():
    """fog of war / blindfold: a steady wind is already moving across the board, two drums sound far off behind
    it, the second nearer, and a gust swells up around them. ~2.7 s"""
    bed = contour(autopan(LP(HP(noise(2.7, 150, 2500, 726), 200), 1400), 0.15, 0.5, 0.7), [(0, -30), (0.04, -7), (2.4, -5), (2.75, -40)])
    gust = contour(bpsweep(clip('fs146932_wind', 1.6, -2, onset=False), 500, 1800, 1.0), [(0, -30), (0.8, 0), (1.6, -40)])
    far = lambda s_: HP(LP(smix((0, drumhit('vs_timp_hi', s_, 1.0, 700, 4, -3)), (0, drumhit('v_framedrum_muted', s_, 0.5, 1200, 5, -4), -3)), 700), 110)
    x = smix((0, bed, -2), (0.95, widen(gust, 0.8), 5), (0.7, far(-5), -2), (1.35, pan(far(-4), 0.3), 4))
    return master(lead(mbcomp(hall(gap(x, 0.7, 0.03), 0.3, 2.2, 2200, 0.05, 140, 726))), ST_LUFS - 1, 's', max_len=2.8)


def odds_start():
    """odds challenges ("how many X to beat Y"): a low drum roll, then a versus screen: one hit on the left, one
    on the right, and the biggest in the centre with a low power-fifth string stab that holds. ~2.5 s"""
    def hit(s_):
        return smix((0, drumhit('vs_timp_hi', s_, 0.8, 900, 6, -3)), (0, transient('k_wood_heavy_1', s_ + 2, 120, 9000, 6, -4, 0.15), -3),
                    (0, transient('fs348243_punch', 0, 100, 8000, 6, -4, 0.12), -6))
    roll = contour(drumhit('vs_timp_roll_lo', -2, 0.5, 600, 0, 0), [(0, -20), (0.1, -12), (0.5, -12)])
    big = smix((0, hit(-4)), (0, drumhit('v_bassdrum', -2, 0.9, 300), 0), (0, click(0.006, 2500, 15000, 727), -8))
    stab = contour(pad([31, 38, 43, 50], 1.5, attack=0.05, lpf=1600, width=0.9, section='cello'),
                   [(0, -6), (0.1, 0), (1.0, -1), (1.5, -36)])
    x = smix((0, roll, -6), (0.45, pan(hit(-1), -0.6), -6), (0.75, pan(hit(0), 0.6), -4), (1.1, big), (1.11, stab, -2))
    return master(lead(mbcomp(hall(x, 0.16, 1.3, 4000, 0.015, 140, 727))), ST_LUFS, 's', max_len=2.7)


def rush_start():
    """bullet / speedrun / racing: the clock is slapped, a whoosh tears across the board, a tight punchy hit, and
    the clock keeps ticking fast underneath to a second hit. ~1.9 s"""
    slap = lambda s_: smix((0, transient('k_metal_click', s_, 500, 9000, 6, -6, 0.04)), (0, transient('k_wood_light_0', s_ - 2, 300, 9000, 6, -6, 0.06), -2))
    sw = panmove(bp(cut(pitch(S('fs683101_whoosh'), 3), 0.25, 0.05), 800, 9000), -0.7, 0.7)
    hit = smix((0, transient('fs348243_punch', 1, 120, 9000, 7, -4, 0.15)), (0, drumhit('v_framedrum_muted', -2, 0.3, 5000, 6, -4), -3),
               (0, thump(160, 75, 0.15, 0.04), -5))
    ticks = smix(*[(0.125 * k, pan(transient('k_wood_light_%d' % (k % 2 * 3), 4, 600, 9000, 6, -8, 0.03), 0.3 * (-1) ** k), -6 - 0.8 * max(0, k - 6))
                   for k in range(12)])
    x = smix((0, slap(0), -22), (0.2, slap(1), -20), (0.25, sw, -14), (0.55, hit), (0.65, ticks, -2), (1.2, pan(hit, 0.3), -1))
    return master(lead(mbcomp(hall(x, 0.1, 0.7, 6000, 0.01, 250, 728))), ST_LUFS, 's', max_len=2.0)


def roulette_start():
    """Chess Roulette: the revolver's cylinder is spun (a metal ratchet slowing down), snapped shut hard, and
    the room holds its breath on two low pulses. ~2.1 s"""
    ts = np.cumsum([0.0] + [0.03 + 0.0045 * k * k / 2 for k in range(13)])
    ratchet = smix(*[(t, transient('k_metal_click', 6 - 0.2 * k, 1500, 9000, 7, -8, 0.025), -2 - 0.3 * k) for k, t in enumerate(ts)])
    shut = smix((0, transient('k_metal_latch', -4, 200, 7000, 7, -3, 0.12)), (0, thump(120, 65, 0.15, 0.04), -4),
                (0, drumhit('vs_timp_hi', -7, 0.7, 600, 5, -3), -6))
    pulse = smix((0, LP(drumhit('v_framedrum_muted', -9, 0.4, 700, 5, -6), 500)), (0, thump(70, 45, 0.25, 0.07), -2))
    x = smix((0, widen(ratchet, 0.4), -12), (ts[-1] + 0.2, shut), (ts[-1] + 0.55, pulse, -6), (ts[-1] + 0.95, pulse, -3))
    return master(lead(mbcomp(hall(x, 0.12, 1.0, 5000, 0.01, 200, 729))), ST_LUFS - 1, 's', tp=-2.4, max_len=2.2)


def wheel_start():
    """Spinner Wheel: the wheel is thrown, its wooden pegs flick past the flapper, slowing, it lands with a solid
    wooden thunk, and a low drum roll rumbles up for the result. ~2.9 s"""
    ts = np.cumsum([0.0] + [0.05 + 0.003 * k * k for k in range(10)])
    pegs = smix(*[(t, pan(transient('k_wood_light_2', 3 - 0.1 * k, 400, 12000, 6, -8, 0.04), 0.2 * np.sin(k)), -2 - 0.2 * k) for k, t in enumerate(ts)])
    throw = panmove(bp(cut(pitch(S('fs60027_swosh'), 1), 0.3, 0.08), 300, 7000), -0.5, 0.5)
    stop = smix((0, transient('k_wood_medium_2', -2, 150, 8000, 6, -3, 0.15)), (0, thump(130, 70, 0.14, 0.04), -4),
                (0, drumhit('vs_timp_hi', -5, 1.0, 700, 5, -2), -3))
    roll = contour(drumhit('vs_timp_roll_lo', -2, 1.9, 600, 0, 0), [(0, -20), (1.4, -2), (1.9, -30)])
    x = smix((0, throw, -8), (0.12, pegs, -3), (ts[-1] + 0.3, stop, 2), (ts[-1] + 0.45, roll, 2))
    x = gap(x, ts[-1] + 0.3, 0.03)
    return master(lead(mbcomp(hall(x, 0.14, 1.2, 6000, 0.01, 220, 730))), ST_LUFS - 1, 's', max_len=3.2)


def backrooms_start():
    """Backrooms: a fluorescent tube flickers on and buzzes, damp carpet underfoot somewhere down the hall,
    and the hum settles. ~2.3 s"""
    tt = np.arange(int(SR * 2.3)) / SR
    am = 0.55 + 0.45 * np.abs(np.sin(2 * np.pi * 60 * tt)) ** 6
    buzz = BP(noise(2.3, 100, 6000, 731)[:, 0] * am, 100, 4000)
    flick = gate_stutter(buzz, 11, 0.5, 0.8, 731, -36)
    buzz = np.concatenate([flick[:int(SR * 0.6)], buzz[int(SR * 0.6):]])
    buzz = contour(buzz, [(0, -6), (0.6, -6), (0.7, -10), (2.0, -10), (2.3, -40)])
    ticks = smix(*[(t, transient('k_metal_click', 2, 2000, 12000, 6, -8, 0.02), -14) for t in (0.0, 0.17, 0.31, 0.52)])
    steps = smix(*[(0.9 + 0.42 * k, pan(LP(transient('k_footstep_carpet_%d' % (2 * (k % 2)), -3, 80, 3000, 4, -3, 0.2), 1200), 0.5), -12 - 2 * k)
                   for k in range(3)])
    x = smix((0, widen(buzz, 0.4), -6), (0, ticks), (0, steps))
    return master(lead(mbcomp(hall(x, 0.2, 1.6, 3000, 0.03, 150, 731))), ST_LUFS - 2, 's', max_len=2.4)


def hz_capture():
    """horror capture: a dull, heavy take that is swallowed into a short breath. ~0.4 s"""
    hit = smix((0, transient('k_punch_heavy_1', -4, 60, 4000, 6, -3, 0.2)), (0, drumhit('v_framedrum_muted', -8, 0.3, 600, 5, -4), -4))
    breath = contour(LP(clip('fs146932_wind', 0.3, -6, onset=False), 2500), [(0, -10), (0.05, -4), (0.3, -40)])
    x = smix((0, hit), (0.02, widen(breath, 0.8), -6))
    return polish(x, FX_LUFS - 1, 0.4, 0.1, 0.4, 0, 0, None, max_len=0.42)


def gun_capture():
    """guns (FPS Chess, Bazooka vs Granny): a suppressed shot and the bullet striking the piece. ~0.4 s"""
    shot = LP(HP(clip('fs427592_pistol', 0.18, -2), 300), 2600)
    strike = smix((0, transient('k_punch_heavy_1', 1, 120, 8000, 7, -4, 0.12)), (0, transient('k_chips_collide_2', -2, 600, 12000, 6, -6, 0.06), -6),
                  (0, click(0.004, 3000, 15000, 732), -10))
    x = smix((0, shot, -3), (0.06, strike))
    return polish(x, FX_LUFS, 0.4, 0.06, 0.25, 0, 0, None, max_len=0.42)


RECIPES = {
    'gs_b': gs_b, 'gs_c': gs_c, 'gs_d': gs_d,
    'hz_start': hz_start, 'fish_start': fish_start, 'gun_start': gun_start, 'boom_start': boom_start,
    'nuke_start': nuke_start, 'sword_start': sword_start, 'magic_start': magic_start, 'dragon_start': dragon_start,
    'arcade_start': arcade_start, 'mine_start': mine_start, 'scifi_start': scifi_start, 'puzzle_start': puzzle_start,
    'arena_start': arena_start, 'dice_start': dice_start, 'duck_start': duck_start, 'drawback_start': drawback_start,
    'drawback_glitch_start': drawback_glitch_start, 'fog_start': fog_start, 'odds_start': odds_start,
    'rush_start': rush_start, 'roulette_start': roulette_start, 'wheel_start': wheel_start,
    'backrooms_start': backrooms_start,
    'sword_capture': sword_capture, 'magic_capture': magic_capture, 'dragon_capture': dragon_capture,
    'arcade_capture': arcade_capture, 'pac_chomp': pac_chomp, 'hz_capture': hz_capture, 'gun_capture': gun_capture,
}
# where each one is written (relative to the repo root)
OUT = {n: 'assets/sounds/sets/%s.mp3' % n for n in RECIPES}
OUT.update({'gs_b': 'assets/sounds/game-start-2.mp3', 'gs_c': 'assets/sounds/game-start-3.mp3', 'gs_d': 'assets/sounds/game-start-4.mp3'})
