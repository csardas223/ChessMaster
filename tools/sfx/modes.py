"""Mode effect sounds and result stings (v5).

- Results and big moments (victory / defeat / draw, achievement, fanfare, new rule page, portal, warp, void, kidnap,
  kill, reap, spawn, petrify, bomb, blast) are designed one by one in events.py, each with its own structure.
- In-play effects keep their meaning (a gunshot still reads as a gunshot, a quack is a quack, dice are dice) but
  are re-cut as designed sounds: transient shaping, a tuned low layer under the hit, EQ, 3-band compression,
  a short stereo plate, about -17 LUFS momentary-max (tiny cues like steps and buttons quieter).
No bells, chimes, dings, glass, chiptune or brass anywhere (checked by tools/sfx/ring_check.py).
"""
import numpy as np
from synth import SR, lp, hp, bp
from samples import S, pitch, glide, rev, cut
import cine as C
from cine import (st, smix, widen, pan, fade, trim, riser, air, sub, subdrop, thump, click, shape, mbcomp, peq,
                  shelf, sat, sweep_lp, plate, room, master)
from core import EV_LUFS, UI_LUFS, pad, transient, ui_hit, impact, inst_organ
import events as E

FX_LUFS = -17.0      # in-play mode effects, momentary max


def W(name='fs60013_whoosh'):
    return S(name)


def whoosh(s0=0.0, s1=0.0, lo=300, hi=9000, src='fs60013_whoosh'):
    """recorded air movement, varispeed-glided (lower = longer)."""
    x = glide(W(src), s0, s1) if (s0 or s1) else W(src)
    return fade(bp(x, lo, hi), 0.02, 0.02)


def fall_sweep(d=0.8, f0=9000.0, f1=300.0, seed=60):
    """a descending filtered-noise sweep (the riser run backwards in pitch)."""
    r = sweep_lp(E.noise(d, 200.0, 14000.0, seed), f0, f1, 0.8, 3)
    e = np.exp(-np.linspace(0, 3.0, len(r)))
    return fade((r.T * e).T, 0.02, 0.1)


def polish(x, lufs=FX_LUFS, wide=0.35, wet=0.1, size=0.35, att=3.0, sus=-1.0, sub_=None, sub_db=-6.0, glue=True,
           metric='m', max_len=None, mb=True, damp=7000.0):
    """the in-play treatment: transient shaping, optional tuned sub under the hit, widen, short plate, 3-band comp."""
    m = shape(C.mono(x), att, sus) if (att or sus) else C.mono(x)
    parts = [(0, widen(m, wide))]
    if sub_:
        parts.append((0.001, sub(*sub_), sub_db))
    y = smix(*parts)
    y = plate(y, wet, size, damp, 0.008, 240.0, 7)
    if mb:
        y = mbcomp(y)
    return master(y, lufs, metric, glue=glue, max_len=max_len)


# ================================================================ results and big moments (events.py)
victory, defeat, draw = E.victory, E.defeat, E.draw
achievement, fanfare, gong, portal, warp = E.achievement, E.fanfare, E.gong, E.portal, E.warp
void, kidnap, kill, reap, spawn, petrify = E.void, E.kidnap, E.kill, E.reap, E.spawn, E.petrify


def bomb():
    return E.explosion('b')


def blast():
    return E.explosion('c')


def grenade():
    return E.grenade()


# ================================================================ in-play effects (recording keeps its meaning)
def crossbow():
    """FPS v5b: the string release and a short bolt whoosh, cut tight (fired every 0.45-0.8 s)."""
    x = smix((0, cut(S('fs163453_crossbow'), 0.16, 0.06)), (0.05, cut(pitch(W('fs683101_whoosh'), 5), 0.16, 0.08), -10))
    return polish(shelf(lp(x, 11000), 3500, -1, 'high'), FX_LUFS, 0.35, 0.05, 0.25, 4, -4, None, max_len=0.24)


def _gun(name, d, semis=0.0):
    return cut(pitch(S(name), semis), d, d * 0.45)


# FPS v5b (2026-11-26): the duel's guns are short and dry so none tracks the owner's reference (a riser into a long
# decay) and no two are near-duplicates: pistol = mid crack + click, rifle = thin bright snap from another recording,
# shotgun = dark heavy blast with a low thump. A pump rack / casing tail was tried and raised the reference match.
def pistol():
    x = smix((0, _gun('fs427592_pistol', 0.18)), (0, click(0.005, 2500, 14000, 31), -8))
    return polish(x, FX_LUFS + 1.0, 0.4, 0.05, 0.25, 4, -6, (110, 60, 0.03, 0.12, 0.04), -9, max_len=0.3)


def machine():
    """the rifle, fired every 0.11 s: a very short bright snap so the bursts do not smear."""
    x = smix((0, cut(hp(pitch(S('fs402789_pistol_indoor'), 3.0), 900), 0.09, 0.04)), (0, cut(hp(S('k_metal_click'), 2500), 0.03, 0.015), -12))
    return polish(x, FX_LUFS, 0.3, 0.03, 0.2, 5, -8, None, max_len=0.14)


def shot():
    return polish(_gun('fs402789_pistol_indoor', 0.55), FX_LUFS + 1.0, 0.4, 0.06, 0.5, 3, -2, (90, 46, 0.04, 0.35, 0.09), -6)


def shotgun():
    x = lp(_gun('fs427595_shotgun', 0.20, -2.0), 3500)
    return polish(x, FX_LUFS + 1.5, 0.5, 0.04, 0.25, 4, -8, (72, 36, 0.04, 0.16, 0.06), 0, max_len=0.27)


def reload():
    x = smix((0, cut(S('k_metal_click'), 0.1, 0.04)), (0.07, cut(S('k_metal_latch'), 0.16, 0.06), -2))
    return polish(lp(x, 11000), FX_LUFS - 3, 0.3, 0.06, 0.3, 4, -4, None, max_len=0.26)


def hit():
    x = smix((0, transient('fs348243_punch', 0, 120, 9000, 6, -4, 0.22)), (0.0, transient('k_punch_medium_0', 0, 200, 8000), -5))
    return polish(x, FX_LUFS, 0.35, 0.08, 0.4, 0, 0, (100, 50, 0.04, 0.25, 0.07), -4)


def slash():
    x = smix((0, cut(pitch(W('fs683101_whoosh'), 3), 0.18, 0.08), -4), (0.06, cut(S('k_knife_slice_1'), 0.22, 0.08)))
    return polish(lp(x, 12000), FX_LUFS - 1, 0.5, 0.08, 0.4, 3, -1, None, max_len=0.35)


def swing():
    return polish(lp(cut(W('fs683101_whoosh'), 0.26, 0.1), 10000), FX_LUFS - 2, 0.6, 0.06, 0.3, 0, 0, None)


def stab():
    x = smix((0, cut(S('k_knife_slice_1'), 0.2, 0.08)), (0.01, lp(S('k_punch_medium_0'), 2500), -8))
    return polish(x, FX_LUFS - 1, 0.35, 0.06, 0.3, 3, -2, (110, 60, 0.03, 0.15, 0.05), -9, max_len=0.3)


def clear():
    """a line cleared: a quick whoosh swept across left to right with a bright designed hit in the middle of it."""
    sw = E.panmove(bp(cut(pitch(W('fs683101_whoosh'), 2), 0.35, 0.1), 600, 12000), -0.8, 0.8)
    x = smix((0, sw, -6), (0.09, ui_hit('k_chip_lay_3', 1.0, 170, 85, 0.5, 1.5, 2, 0.2, seed=67, wide=0.5, low='skin')),
             (0.1, air(0.3, 12000, 5000, 0.1, 4000, 67), -16))
    return polish(x, FX_LUFS, 0.4, 0.12, 0.8, 0, 0, None, max_len=0.8)


def alarm():
    """an alert, not a klaxon: three tense double pulses (dark hit + sub punch)."""
    def two(seed):
        h = lambda s, sd: smix((0, transient('fs348243_punch', s, 150, 6000, 6, -4, 0.1)),
                               (0.001, sub(110, 58, 0.04, 0.22, 0.06, 2.0, 0.0008, 600), -2), (0, click(0.004, 2000, 9000, sd), -14))
        return smix((0, h(0.5, seed)), (0.11, h(-0.5, seed + 1), -1.5))
    x = smix((0, two(68)), (0.4, two(70), -0.5), (0.8, two(72), -1))
    return polish(x, FX_LUFS, 0.35, 0.1, 0.5, 0, 0, None, max_len=1.2)


def coin():
    """a payout: clay chips dropped into a stack (no metal ring), a little air on top."""
    x = smix((0, cut(lp(S('k_chips_handle_1'), 10000), 0.45, 0.15), -2), (0.0, transient('k_chip_lay_1', 0, 400, 13000)),
             (0.005, air(0.2, 11000, 6000, 0.06, 4000, 69), -20))
    return polish(x, FX_LUFS - 2, 0.45, 0.08, 0.35, 2, -1, None, max_len=0.55)


def zap():
    """an electric snap: crackle, a fast air snap, a tight low thump."""
    crack = hp(cut(S('fs45650_fuse'), 0.32, 0.18), 1200)
    snap = cut(bp(pitch(W('fs683101_whoosh'), 6), 1500, 9000), 0.12, 0.05)
    x = smix((0, crack), (0.0, snap, -8), (0, click(0.004, 3000, 15000, 71), -8))
    return polish(x, FX_LUFS - 1, 0.5, 0.1, 0.4, 3, -1, (140, 70, 0.02, 0.15, 0.04), -8, max_len=0.7)


def chest():
    return polish(cut(S('fs202092_chest'), 0.85, 0.3), FX_LUFS - 1, 0.35, 0.1, 0.5, 2, -1, (70, 55, 0.05, 0.4, 0.1), -12,
                  max_len=0.95)


def fuse():
    x = lp(hp(cut(fade(S('fs45650_fuse', onset=False), 0.04), 0.6, 0.15), 700), 10000)
    return polish(x, FX_LUFS - 5, 0.5, 0.05, 0.3, 0, 0, None, mb=False)


def place():
    return master(ui_hit('k_wood_light_3', -0.5, 150, 74, 0.5, 0, 0, 0.15, seed=72), UI_LUFS)


def quack():
    return polish(cut(S('fs418509_quack'), 0.6, 0.15), FX_LUFS - 1, 0.3, 0.08, 0.35, 1, 0, None)


def launch():
    """push-off thump, then a rising whoosh."""
    up = fade(bp(glide(W(), -6, 5), 300, 11000), 0.03, 0.12)
    x = smix((0, ui_hit('k_soft_heavy_0', 0, 130, 60, 2, -1, 0, 0.2, seed=73, low='felt')), (0.02, up, -6))
    return polish(x, FX_LUFS, 0.45, 0.08, 0.5, 0, 0, None, max_len=0.6)


def arrest():
    """a police siren, filtered back so it reads as a siren without the shriek, over a low hit."""
    x = fade(cut(S('fs52906_siren', onset=False), 1.5, 0.3), 0.06, 0)
    x = shelf(bp(x, 350, 4500), 2500, -4, 'high')
    y = smix((0, widen(x, 0.5)), (0, impact(0.0, -1.0, False, 74), -10), (0.002, sub(60, 48, 0.05, 1.0, 0.25, 1.1, 0.002, 220), -8))
    return master(plate(y, 0.14, 1.0, 5000, 0.01, 240, 74), FX_LUFS - 3)


def honk():
    return polish(lp(cut(S('fs423990_horn'), 0.3, 0.06), 5000), FX_LUFS - 3, 0.3, 0.08, 0.35, 0, 0, None)


def shatter():
    """something breaks apart (no glass): a bright noise crack, splintering wood, a hit and a short sub."""
    bits = smix(*[(0.03 + i * 0.04, pitch(S('k_wood_light_%d' % (i % 5)), 4 + i), -6 - i * 2) for i in range(6)])
    crack = hp(click(0.03, 2500, 14000, 75), 2000)
    x = smix((0, crack, -4), (0, cut(S('k_chop'), 0.3, 0.1), -2), (0, cut(S('k_plank_3'), 0.3, 0.1), -4), (0, lp(bits, 9000)),
             (0, impact(0.0, 0.5, False, 75), -10))
    return polish(x, FX_LUFS, 0.55, 0.12, 0.6, 3, -1, (85, 50, 0.05, 0.4, 0.1), -6, max_len=0.8)


def break_():
    """wood giving way: a chop, a plank crack, small pieces scattering, a short sub."""
    bits = smix(*[(0.04 + i * 0.045, pitch(S('k_wood_light_%d' % (i % 5)), 3 + i), -6 - i * 2) for i in range(5)])
    x = smix((0, cut(S('k_chop'), 0.3, 0.1)), (0.0, cut(S('k_plank_3'), 0.3, 0.1), -3), (0.0, lp(bits, 7000)))
    return polish(x, FX_LUFS, 0.45, 0.08, 0.4, 3, -1, (90, 50, 0.04, 0.3, 0.08), -7, max_len=0.55)


def scrape():
    x = smix((0, lp(pitch(S('fs743246_stone'), -5), 7000)), (0.0, lp(cut(S('k_card_slide_2'), 0.5, 0.2), 3000), -6))
    return polish(fade(x, 0, 0.15), FX_LUFS - 2, 0.45, 0.08, 0.35, 0, 0, None, max_len=0.6)


def laugh():
    """a real (evil) laugh, close and warm, with a low swell under it."""
    x = cut(S('fs478934_laugh'), 1.15, 0.3)
    y = smix((0, widen(shelf(lp(x, 10000), 200, 1.5, 'low'), 0.3)), (0, fade(subdrop(55, 40, 1.15, 0.6), 0.2, 0.3), -14))
    return master(plate(y, 0.12, 0.9, 5000, 0.01, 240, 76), FX_LUFS - 1)


def fall():
    """dropping away: a descending sweep thinning out over a sinking sub."""
    x = smix((0, fall_sweep(1.2, 10000, 250, 77)), (0.05, lp(whoosh(4, -10, 300, 8000, 'fs683101_whoosh'), 5000), -8),
             (0.0, subdrop(70, 32, 1.2, 0.45), -8))
    return polish(x, FX_LUFS - 1, 0.5, 0.1, 0.6, 0, 0, None, max_len=1.4)


def jump():
    x = smix((0, cut(hp(S('k_cloth_4'), 300), 0.15, 0.06)), (0.0, air(0.12, 6000, 9000, 0.05, 2000, 78), -10))
    return polish(x, FX_LUFS - 5, 0.4, 0.04, 0.2, 2, -2, None, max_len=0.18)


def land():
    x = transient('k_footstep_carpet_2', 0, 150, 5000, 4, -4, 0.11)
    return polish(x, FX_LUFS - 4, 0.3, 0.04, 0.2, 0, 0, (110, 60, 0.03, 0.12, 0.04), -6, max_len=0.16)


def superjump():
    up = fade(bp(glide(S('fs462879_ethereal')[:int(SR * 1.2)], -4, 6), 300, 12000), 0.02, 0.2)
    x = smix((0, ui_hit('k_footstep_carpet_2', 0, 120, 60, 1, -1, -3, 0.15, seed=79, low='felt')), (0.03, up, -5))
    return polish(x, FX_LUFS - 1, 0.5, 0.1, 0.6, 0, 0, None, max_len=0.9)


def flag():
    x = smix((0, transient('k_card_place_1', 0, 500, 12000, 4, -6, 0.08)), (0, click(0.003, 4000, 15000, 80), -12))
    return polish(x, FX_LUFS - 6, 0.3, 0.05, 0.2, 0, 0, None, max_len=0.11)


def beam():
    """a sustained beam of moving air (no tone): slowed whooshes overlapping over a low rumble."""
    def leg(r, s0, s1):
        x = rev(W()) if r else W()
        return fade(bp(glide(x, s0, s1), 700, 8000), 0.12, 0.2)
    rumble = fade(lp(C.mono(E.noise(1.4, 40, 400, 81)), 220), 0.1, 0.3)
    x = smix((0, leg(True, -7, -9), -2), (0.3, leg(False, -9, -10)), (0.65, leg(True, -8, -10), -1),
             (0.95, leg(False, -10, -12), -2), (0.0, rumble, -8))
    return polish(fade(C.mono(x), 0, 0.35), FX_LUFS - 2, 0.7, 0.12, 0.7, 0, 0, None, max_len=1.45)


def button():
    x = smix((0, transient('k_ui_click_3', 0, 400, 13000, 3, -6, 0.07)), (0, thump(220, 140, 0.05, 0.015), -14))
    return polish(x, FX_LUFS - 6, 0.25, 0.04, 0.2, 0, 0, None, max_len=0.09)


def bonk():
    x = smix((0, transient('v_woodblock_mp', -7, 200, 5000, 3, -3, 0.2)), (0, transient('k_wood_light_1', 0, 200, 4000), -4))
    return polish(x, FX_LUFS - 2, 0.3, 0.06, 0.3, 0, 0, (130, 65, 0.03, 0.18, 0.05), -6)


def build():
    x = smix((0, lp(cut(S('k_plank_1'), 0.2, 0.08), 6000), -2), (0.0, ui_hit('k_wood_light_3', -2, 140, 70, 1.0, 0, 0, 0.14, seed=82)),
             (0.11, ui_hit('k_wood_light_0', 0.5, 150, 75, 0.5, 0, 0, 0.14, seed=83), -1))
    return polish(x, FX_LUFS - 1, 0.35, 0.06, 0.3, 0, 0, None, max_len=0.45)


def castle_fx():
    """blocks set in place, a heavy beam dropped on top as the keep stands: two placements and a weighty hit."""
    stone = lp(pitch(S('k_chop'), -4), 4500)
    x = smix((0, ui_hit('k_wood_medium_0', -2, 130, 62, 2.0, 0, 0, 0.15, seed=84)), (0.0, cut(stone, 0.2, 0.08), -6),
             (0.12, ui_hit('k_wood_light_0', -0.5, 140, 70, 1.5, 0, 0, 0.15, seed=85), -1),
             (0.2, impact(0.5, 0.0, False, 84), -6))
    return polish(x, FX_LUFS, 0.4, 0.1, 0.5, 0, 0, (70, 48, 0.06, 0.5, 0.15), -6, max_len=0.7)


def roar():
    x = fade(cut(S('fs69570_lion', onset=False), 1.7, 0.6), 0.05, 0)
    y = smix((0, widen(lp(x, 7500), 0.4)), (0.05, sub(60, 45, 0.1, 1.6, 0.5, 1.1, 0.004, 220), -8))
    return master(mbcomp(plate(y, 0.12, 1.0, 5000, 0.01, 240, 86)), FX_LUFS + 1)


def roll():
    return polish(lp(cut(S('k_dice_throw_1'), 0.7, 0.2), 11000), FX_LUFS - 3, 0.45, 0.06, 0.3, 2, -1, None)


def step():
    return polish(lp(cut(S('k_footstep_wood_1'), 0.12, 0.05), 5000), FX_LUFS - 5, 0.25, 0.03, 0.2, 2, -2, None, max_len=0.13)


def thunk():
    x = transient('k_wood_medium_0', 0, 150, 6000, 4, -3, 0.3)
    return polish(x, FX_LUFS - 1, 0.3, 0.06, 0.3, 0, 0, (100, 52, 0.04, 0.25, 0.07), -6)


def twang():
    """a muted spring pluck: a crossbow string released, slowed down."""
    x = cut(pitch(S('fs163453_crossbow'), -4), 0.32, 0.15)
    return polish(lp(x, 6000), FX_LUFS - 3, 0.35, 0.06, 0.3, 2, -1, (90, 55, 0.03, 0.2, 0.06), -10, max_len=0.35)


def sinking_hymn():
    """calm ambient hymn (~27 s, looped by the 3D mode): quiet pipe-organ chords under a bowed viola/violin
    melody and a low cello line, in a long soft plate. Everything is sustained and swells in: no struck notes."""
    prog = [[48, 64, 67], [53, 65, 69], [55, 62, 67], [48, 64, 67], [45, 60, 64], [50, 62, 65], [43, 62, 67], [48, 64, 67]]
    mel = [76, 77, 74, 72, 72, 74, 71, 72]
    beat = 3.2
    parts = []
    for i, (ch, m) in enumerate(zip(prog, mel)):
        t0 = i * beat
        for n in ch:
            o = fade(cut(inst_organ(n), beat + 0.9, 0.9), 0.5, 0.9)
            parts.append((t0, pan(lp(o, 2200), (n - 60) / 30), -15 - (3 if n < 50 else 0)))
        parts.append((t0, pad([ch[0]], beat + 0.8, attack=0.6, lpf=1500, width=0.4), -12))
        sec = 'violin' if m >= 74 else 'viola'
        parts.append((t0 + 0.05, pad([m], beat + 0.9, attack=0.35, lpf=3200, width=0.5, section=sec), -9))
    x = fade(smix(*parts), 0, 2.0)
    return master(plate(x, 0.35, 3.0, 3500, 0.03, 150, 87), FX_LUFS - 6, glue=False, max_len=28.0)


RECIPES = {
    'spawn': spawn, 'steal': None, 'void': void, 'portal': portal, 'crossbow': crossbow, 'grenade': grenade,
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


def steal():
    """a quick swipe of air and cloth, the piece snatched up, chips raked in (no coin ring)."""
    swish = lp(hp(cut(S('k_cloth_2'), 0.35, 0.12), 250), 8000)
    x = smix((0, swish, -3), (0.0, air(0.25, 9000, 2500, 0.08, 1500, 88), -8),
             (0.17, ui_hit('k_wood_light_1', 2.0, 170, 85, -1.0, 0.5, 0, 0.12, seed=88), -2),
             (0.26, lp(cut(S('k_chips_handle_1'), 0.4, 0.15), 9000), -10))
    return polish(x, FX_LUFS - 1, 0.5, 0.08, 0.4, 0, 0, None, max_len=0.75)


RECIPES['steal'] = steal
RESULTS = {'victory': victory, 'defeat': defeat, 'draw': draw}
