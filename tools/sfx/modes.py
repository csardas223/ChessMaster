"""Mode effect sounds and result stings, built from recorded CC0 sources (see sources.md).

Same aesthetic as the board set: real recordings, close and soft, short tails, nothing piercing, and no bells,
chimes, glass, glockenspiel, vibraphone, kalimba, gong or coin dings (checked by tools/sfx/ring_check.py).
Each effect keeps its meaning (a gunshot still reads as a gunshot, a coin is a real coin, a quack is a quack).
"""
import numpy as np
from synth import SR, lp, hp, bp, mix, at
from samples import (S, g, pitch, glide, rev, cut, fade_in, fade_out, soften, peq, shelf, warm, room, hall, lay,
                     master)
from core import piece, inst, felt, muted, knock, air, explosion, jumpscare, tick


def W(name='fs60013_whoosh'):
    return S(name)


def whoosh(s0=0.0, s1=0.0, lo=300, hi=9000, src='fs60013_whoosh'):
    """recorded air movement, varispeed-glided (lower = longer)."""
    x = glide(W(src), s0, s1) if (s0 or s1) else W(src)
    return fade_in(bp(x, lo, hi), 0.02)


# ---------- results ----------
def victory():
    """warm, sleek win: a firm final set-down, a breath of air, a muted felt-piano maj9 swelling in underneath."""
    chord = lay((0.0, muted(inst('piano', 48, 2.4), 0.7, 1200), -2), (0.05, muted(inst('piano', 55, 2.3), 0.65, 1400), -4),
                (0.1, muted(inst('piano', 64, 2.2), 0.6, 1600), -5), (0.15, muted(inst('piano', 71, 2.1), 0.5, 1800), -8),
                (0.2, muted(inst('piano', 74, 2.0), 0.45, 1800), -9))
    chord = fade_in(chord, 0.06)
    lift = fade_out(cut(air(lo=600, hi=6000, reverse=True), 0.45, 0.05), 0.05)
    x = lay((0, piece('k_wood_medium_2', -1.0, 2.0, -0.5, 0.25), -3), (0.0, lift, -16), (0.3, chord, 0),
            (0.3, lp(S('k_soft_heavy_0'), 220), -12))
    return master(hall(x, 0.16, 1.4, 3500), rel=-1.5, max_len=2.6)


def defeat():
    """gentle and quiet: two falling muted felt-piano notes settling on a low minor chord, no shimmer."""
    hi = lay((0, muted(inst('piano', 69, 0.8), 0.35, 1600), 0), (0.3, muted(inst('piano', 64, 0.9), 0.35, 1500), -1))
    low = lay((0, muted(inst('piano', 45, 2.0), 0.6, 1000), 0), (0.03, muted(inst('piano', 52, 2.0), 0.55, 1200), -2),
              (0.06, muted(inst('piano', 60, 2.0), 0.5, 1300), -4))
    x = lay((0, hi, -2), (0.62, low, 0), (0.62, lp(S('k_soft_heavy_0'), 200), -14))
    return master(hall(x, 0.16, 1.4, 3500), rel=-2.5, max_len=2.4)


def draw():
    """neutral and calm: a muted felt-piano open fifth over a soft felt thump, no resolution either way."""
    x = lay((0, muted(inst('piano', 50, 1.8), 0.55, 1200), -2), (0.0, muted(inst('piano', 57, 1.7), 0.5, 1400), -4),
            (0.14, muted(inst('piano', 62, 1.6), 0.45, 1500), -5), (0.14, muted(inst('piano', 69, 1.5), 0.4, 1600), -8),
            (0.0, lp(S('k_soft_heavy_0'), 220), -12))
    return master(hall(x, 0.16, 1.4, 3500), rel=-2.5, max_len=2.1)


# ---------- mode effects ----------
def spawn():
    """something appears: an in-breath of air, a card flicked down, a soft set-down."""
    a = fade_in(bp(rev(W()), 800, 8000), 0.05)
    flick = lp(cut(S('k_card_place_1'), 0.15, 0.06), 8000)
    x = lay((0, a, -9), (0.36, flick, -10), (0.42, piece('k_wood_light_1', 2.0), -5))
    return master(room(x, 0.12, 0.5), rel=-1.5)


def steal():
    """quick cloth swipe, the piece lifted, a few coins."""
    swish = lp(hp(cut(S('k_cloth_2'), 0.35, 0.12), 250), 7000)
    coins = cut(S('k_coins'), 0.55, 0.3)
    x = lay((0, swish, -3), (0.17, piece('k_wood_light_1', 2.0, -1.0), -2), (0.26, lp(coins, 9000), -9))
    return master(room(x, 0.1, 0.4), rel=-1.5)


def void():
    """pulled into nothing: air sinking away over a soft low felt thump."""
    a = lp(whoosh(2, -9, 150, 6000), 3500)
    x = lay((0, a, 0), (0.02, lp(S('v_timpani'), 380), -6), (0.02, lp(S('k_soft_heavy_2'), 260), -8))
    return master(hall(x, 0.2, 1.2, 3500), rel=-1.5, max_len=1.3)


def portal():
    """a breath of air drawn in (reversed), a cloth swirl, a soft felt 'pop' as it opens."""
    draw_in = fade_in(lp(rev(cut(glide(W(), -4, -4), 1.0, 0.2)), 6000), 0.25)
    swirl = lp(hp(cut(S('k_cloth_2'), 0.4, 0.15), 250), 6000)
    pop = mix(lp(S('k_soft_heavy_2'), 400), g(knock('k_wood_medium_0', -2, 0.12, 2500), -6))
    x = lay((0, draw_in, -4), (0.45, swirl, -10), (0.82, pop, -3), (0.82, bp(W('fs683101_whoosh'), 400, 6000), -12))
    return master(hall(x, 0.15, 1.0, 3500), rel=-1.5, max_len=1.5)


def crossbow():
    x = lay((0, S('fs163453_crossbow'), 0), (0.03, cut(pitch(W('fs683101_whoosh'), 4), 0.25, 0.1), -12))
    return master(room(shelf(lp(x, 9000), 3500, -2, 'high'), 0.08, 0.3), rel=0)


def _gun(name, d, semis=0.0, bright=-3):
    x = cut(pitch(S(name), semis), d, d * 0.45)
    x = shelf(lp(soften(x, 0.6, 7000), 8000), 3000, bright, 'high')
    return warm(x, 1.4)


def pistol():
    return master(room(_gun('fs427592_pistol', 0.34), 0.08, 0.35), rel=0.5)


def machine():
    x = lay((0, _gun('fs427592_pistol', 0.2, 2.0), 0), (0.0, cut(hp(S('k_metal_click'), 1500), 0.05, 0.02), -16))
    return master(room(x, 0.06, 0.25), rel=0)


def shot():
    return master(room(_gun('fs402789_pistol_indoor', 0.55, 0, -2), 0.06, 0.4), rel=0.5)


def shotgun():
    return master(room(_gun('fs427595_shotgun', 0.64, -0.5, -3), 0.06, 0.4), rel=1.0)


def reload():
    x = lay((0, cut(S('k_metal_click'), 0.1, 0.04), 0), (0.07, cut(S('k_metal_latch'), 0.16, 0.06), -2))
    return master(room(lp(x, 10000), 0.06, 0.2), rel=-3, max_len=0.26)


def grenade(d=0.45):
    x = cut(pitch(S('fs235968_explosion'), 3), d, d * 0.5)
    x = mix(x, g(cut(S('k_chop'), 0.2, 0.1), -12))
    return master(room(warm(shelf(lp(x, 6500), 120, 2, 'low'), 1.3), 0.08, 0.4), rel=2.0)


def bomb():
    return master(explosion(1.15), rel=3.0)


def blast():
    x = lay((0, explosion(0.85), 0), (0.0, lp(whoosh(2, -6, 200, 6000), 4000), -6))
    return master(x, rel=3.0)


def hit():
    x = lay((0, lp(soften(S('k_punch_medium_0'), 1.0, 4000), 5000), 0), (0.0, lp(S('k_soft_heavy_0'), 300), -8))
    return master(room(cut(x, 0.24, 0.08), 0.06, 0.25), rel=0)


def slash():
    x = lay((0, cut(pitch(W('fs683101_whoosh'), 3), 0.18, 0.08), -4), (0.06, cut(S('k_knife_slice_1'), 0.22, 0.08), 0))
    return master(room(lp(x, 10000), 0.06, 0.25), rel=-1, max_len=0.3)


def swing():
    return master(room(lp(cut(W('fs683101_whoosh'), 0.26, 0.1), 9000), 0.05, 0.2), rel=-2)


def stab():
    x = lay((0, cut(S('k_knife_slice_1'), 0.2, 0.08), 0), (0.01, lp(S('k_punch_medium_0'), 2500), -8))
    return master(room(x, 0.05, 0.2), rel=-1, max_len=0.25)


def clear():
    """a line cleared: a quick ascending run of clay chips tapped down, a card swept off, a stack settling."""
    run = lay(*[(i * 0.06, cut(soften(pitch(S('k_chip_lay_3'), -2 + i * 1.5), 1.0, 6000), 0.08, 0.04), -i * 0.5)
                for i in range(6)])
    sweep = lp(hp(cut(S('k_card_slide_2'), 0.35, 0.12), 500), 7000)
    x = lay((0, run, 0), (0.3, sweep, -6), (0.42, lp(S('k_chips_stack_2'), 8000), -5))
    return master(room(x, 0.1, 0.35), rel=-1.5, max_len=1.0)


def alarm():
    """an alert, not a klaxon: three firm double knocks on wood, urgent but soft."""
    two = lay((0, knock('k_wood_heavy_0', 2.0, 0.12), 0), (0.1, knock('k_wood_heavy_0', 1.0, 0.12), -1))
    x = lay((0, two, 0), (0.42, two, -0.5), (0.84, two, -1))
    return master(room(x, 0.08, 0.3), rel=-1, max_len=1.2)


def coin():
    """a payout: a few clay chips dropped into a little stack, no metal ring."""
    x = lay((0, cut(lp(S('k_chips_handle_1'), 9000), 0.45, 0.15), -2), (0.0, cut(soften(S('k_chip_lay_1'), 1.0, 6000), 0.1, 0.04), 0))
    return master(room(x, 0.08, 0.3), rel=-2, max_len=0.5)


def zap():
    """an electric snap: sparkler crackle, a fast air snap, a soft low thump."""
    crack = hp(cut(S('fs45650_fuse'), 0.32, 0.18), 1200)
    snap = cut(bp(pitch(W('fs683101_whoosh'), 6), 1500, 9000), 0.12, 0.05)
    x = lay((0, crack, 0), (0.0, lp(S('k_soft_medium_1'), 300), -8), (0.0, snap, -8))
    return master(room(x, 0.1, 0.4), rel=-1, max_len=0.7)


def achievement():
    """unlocked: a card flicked onto the table, a firm stamp of approval (book on felt), a breath of air."""
    flick = lp(cut(S('k_card_place_1'), 0.15, 0.06), 9000)
    stamp = mix(lp(soften(S('k_book_place_1'), 1.5, 3000), 5000), g(lp(S('k_soft_heavy_0'), 260), -6))
    lift = fade_out(cut(air(lo=800, hi=7000, reverse=True), 0.3, 0.05), 0.04)
    x = lay((0, flick, -4), (0.08, lift, -16), (0.38, stamp, 0), (0.6, lp(hp(cut(S('k_card_fan_1'), 0.25, 0.1), 600), 8000), -14))
    return master(room(x, 0.1, 0.4), rel=-1.5, max_len=1.0)


def chest():
    x = cut(S('fs202092_chest'), 0.85, 0.3)
    return master(room(x, 0.08, 0.3), rel=-1.5, max_len=0.95)


def fuse():
    return master(lp(hp(cut(fade_in(S('fs45650_fuse', onset=False), 0.04), 0.6, 0.15), 700), 9000), rel=-6)


def place():
    return master(piece('k_wood_light_3', -0.5, 0.5))


def quack():
    return master(room(cut(S('fs418509_quack'), 0.6, 0.15), 0.06, 0.3), rel=-2)


def launch():
    x = lay((0, lp(soften(S('k_soft_heavy_0'), 2, 1500), 600), -2), (0.0, whoosh(-4, 4, 300, 8000), -2))
    return master(room(x, 0.08, 0.35), rel=-1, max_len=0.6)


def petrify():
    """flesh to stone: stone grinding, a dull crunch, settling weight."""
    crunch = lp(soften(pitch(S('k_chop'), -5), 1.5, 2500), 4000)
    x = lay((0, lp(S('fs743246_stone'), 7000), 0), (0.08, cut(crunch, 0.3, 0.12), -4),
            (0.2, lp(cut(pitch(S('k_wood_heavy_0'), -4), 0.3, 0.12), 2500), -6), (0.0, lp(S('v_timpani'), 250), -14))
    return master(room(x, 0.12, 0.45), rel=-1, max_len=0.75)


def arrest():
    """a police siren, filtered back so it reads as a siren without the shriek."""
    x = fade_in(cut(S('fs52906_siren', onset=False), 1.5, 0.3), 0.06)
    x = shelf(bp(x, 350, 4500), 2500, -4, 'high')
    return master(room(x, 0.15, 0.6), rel=-5)


def gong():
    """a new page in the rule book: a heavy book set down on felt, a low thump, a page turned."""
    slam = mix(lp(soften(S('k_book_place_1'), 2, 2500), 4500), g(lp(soften(S('k_book_close'), 2, 2000), 3500), -3))
    x = lay((0, slam, 0), (0.0, lp(S('v_bassdrum'), 180), -6), (0.0, lp(S('k_soft_heavy_0'), 260), -8),
            (0.32, lp(hp(S('k_book_flip_2'), 300), 8000), -8))
    return master(room(x, 0.12, 0.5), rel=-1, max_len=1.0)


def honk():
    return master(room(lp(cut(S('fs423990_horn'), 0.3, 0.06), 5000), 0.08, 0.3), rel=-4)


def reap():
    x = lay((0, lp(whoosh(-3, -5, 200, 7000), 6000), -2), (0.18, cut(S('k_knife_slice_1'), 0.3, 0.1), -1),
            (0.22, lp(S('v_timpani'), 300), -10))
    return master(hall(x, 0.15, 0.9), rel=-1, max_len=1.1)


def shatter():
    return master(room(shelf(lp(cut(S('fs221528_glass_break'), 1.0, 0.4), 10000), 5000, -3, 'high'), 0.1, 0.5), rel=-1)


def break_():
    """wood giving way: a chop, a plank crack, small pieces scattering."""
    bits = lay(*[(0.04 + i * 0.045, pitch(S('k_wood_light_%d' % (i % 5)), 3 + i), -6 - i * 2) for i in range(5)])
    x = lay((0, cut(S('k_chop'), 0.3, 0.1), 0), (0.0, cut(S('k_plank_3'), 0.3, 0.1), -3), (0.0, lp(bits, 6000), 0))
    return master(room(x, 0.08, 0.3), rel=0, max_len=0.5)


def scrape():
    x = lay((0, lp(pitch(S('fs743246_stone'), -5), 6000), 0), (0.0, lp(cut(S('k_card_slide_2'), 0.5, 0.2), 3000), -6))
    return master(room(fade_out(x, 0.15), 0.08, 0.3), rel=-2, max_len=0.58)


def laugh():
    """a real (evil) laugh, warmed and close."""
    x = cut(S('fs478934_laugh'), 1.15, 0.3)
    return master(room(shelf(lp(x, 9000), 200, 1.5, 'low'), 0.1, 0.4), rel=-1)


def fall():
    """dropping away: air sinking in pitch, thinning out."""
    a = lp(whoosh(1, -12, 150, 6000), 4500)
    b = lp(whoosh(4, -10, 300, 8000, 'fs683101_whoosh'), 5000)
    c = lp(whoosh(-2, -14, 150, 4000), 3000)
    x = lay((0, a, 0), (0.05, b, -8), (0.35, c, -6))
    return master(room(fade_out(x, 0.4), 0.1, 0.5), rel=-2, max_len=1.5)


def jump():
    x = lay((0, cut(hp(S('k_cloth_4'), 300), 0.15, 0.06), 0), (0.0, lp(cut(S('k_footstep_carpet_2'), 0.08, 0.04), 3000), -8))
    return master(x, rel=-3, max_len=0.17)


def land():
    x = lay((0, lp(cut(S('k_footstep_carpet_2'), 0.11, 0.05), 4000), 0), (0, lp(S('k_soft_medium_1'), 300), -6))
    return master(x, rel=-2, max_len=0.12)


def superjump():
    x = lay((0, cut(hp(S('k_cloth_4'), 300), 0.2, 0.08), -3), (0.03, whoosh(-5, 5, 300, 9000), 0))
    return master(room(x, 0.1, 0.5), rel=-2, max_len=0.9)


def warp():
    """bent through space: air drawn in, then rushing down and away, a soft felt landing."""
    draw_in = fade_in(lp(rev(cut(glide(W(), -3, -3), 0.7, 0.15)), 6000), 0.2)
    down = lp(whoosh(3, -9, 200, 7000, 'fs683101_whoosh'), 5000)
    x = lay((0, draw_in, -5), (0.55, down, -2), (0.62, lp(S('k_soft_heavy_2'), 350), -8))
    return master(hall(x, 0.15, 1.0, 3500), rel=-1.5, max_len=1.4)


def flag():
    x = lay((0, cut(lp(S('k_card_place_1'), 9000), 0.08, 0.03), 0), (0, cut(pitch(S('v_woodblock_pp'), 4), 0.06, 0.03), -8))
    return master(x, rel=-6, max_len=0.09)


def kill():
    """decisive and dark: a blade, a low drum, a heavy felt thump."""
    x = lay((0, cut(S('k_knife_slice_1'), 0.2, 0.08), 0), (0.02, lp(S('v_timpani'), 400), -4),
            (0.03, lp(S('v_bassdrum'), 200), -6), (0.03, lp(S('k_soft_heavy_2'), 300), -8))
    return master(hall(x, 0.12, 0.8, 3500), rel=0, max_len=0.9)


def beam():
    """a sustained beam of moving air, no tone: slowed whooshes overlapping, a low felt rumble."""
    def leg(r, s0, s1):
        x = rev(W()) if r else W()
        return fade_out(fade_in(bp(glide(x, s0, s1), 700, 7000), 0.12), 0.2)
    x = lay((0, leg(True, -7, -9), -2), (0.3, leg(False, -9, -10), 0), (0.65, leg(True, -8, -10), -1),
            (0.95, leg(False, -10, -12), -2), (0.0, fade_out(lp(S('k_soft_heavy_2'), 200), 0.2), -12))
    return master(room(fade_out(x, 0.35), 0.12, 0.6), rel=-3, max_len=1.45)


def button():
    return master(cut(S('k_ui_click_3'), 0.07, 0.03), rel=-6, max_len=0.08)


def kidnap():
    """swept away: a cloth grab, a long in-drawn breath of air, sinking air, a soft low drum."""
    grab = lp(hp(cut(S('k_cloth_2'), 0.3, 0.12), 250), 7000)
    draw_in = fade_in(lp(rev(cut(glide(W(), -6, -6), 1.3, 0.3)), 5000), 0.4)
    a = lp(whoosh(0, -8, 150, 6000), 4500)
    x = lay((0, grab, -3), (0.2, draw_in, -6), (1.0, a, -2), (1.55, lp(S('v_timpani'), 350), -8),
            (1.55, lp(S('k_soft_heavy_2'), 300), -10))
    return master(hall(x, 0.18, 1.2, 3500), rel=-2, max_len=2.4)


def sinking_hymn():
    """calm ambient hymn (~27 s): quiet pipe organ pads, felt-piano melody, long soft room (no bells or glass)."""
    prog = [[48, 64, 67], [53, 65, 69], [55, 62, 67], [48, 64, 67], [45, 60, 64], [50, 62, 65], [43, 62, 67], [48, 64, 67]]
    mel = [76, 77, 74, 72, 72, 74, 71, 72]
    beat = 3.2
    parts = []
    for i, (ch, m) in enumerate(zip(prog, mel)):
        t0 = i * beat
        for n in ch:
            o = fade_out(fade_in(cut(inst('organ', n), beat + 0.9, 0.9), 0.5), 0.9)
            parts.append((t0, lp(o, 2200), -14 - (3 if n < 50 else 0)))
        parts.append((t0 + 0.05, felt(inst('piano', m, beat + 1.2), 2200), -9))
        if i % 2 == 0:
            parts.append((t0 + 1.6, felt(inst('piano', m + 7, 2.0), 2600), -19))
    x = lay(*parts)
    x = fade_out(x, 2.0)
    return master(hall(x, 0.35, 3.0, 3500), rel=-4, max_len=28.0)


def bonk():
    x = lay((0, lp(pitch(S('v_woodblock_mp'), -7), 4000), 0), (0, lp(S('k_wood_light_1'), 3000), -4))
    return master(room(cut(x, 0.2, 0.08), 0.06, 0.25), rel=-2)


def build():
    x = lay((0, lp(cut(S('k_plank_1'), 0.2, 0.08), 5000), -2), (0.0, piece('k_wood_light_3', -2, 1.0), 0),
            (0.11, piece('k_wood_light_0', 0.5, 0.5), -1))
    return master(x, rel=0, max_len=0.45)


def castle_fx():
    """stone blocks set in place, a heavy wooden beam dropped on top as the keep stands."""
    stone = lp(soften(pitch(S('k_chop'), -4), 2, 3000), 4500)
    x = lay((0, piece('k_wood_medium_0', -2, 2.5), 0), (0.0, cut(stone, 0.2, 0.08), -6), (0.12, piece('k_wood_light_0', -0.5, 1.5), -1),
            (0.2, lp(soften(S('k_wood_heavy_0'), 2, 2500), 4000), -5))
    return master(room(x, 0.1, 0.4), rel=0, max_len=0.55)


def fanfare():
    """a celebration without brass or bells: da-da-da-DUM on a muted frame drum and wood, a card-fan flourish."""
    tap = lp(soften(pitch(S('v_framedrum_muted'), 3), 1.5, 3000), 4500)
    tap = mix(cut(tap, 0.12, 0.05), g(knock('k_wood_medium_0', 3, 0.1), -6))
    big = mix(lp(soften(S('v_framedrum_muted'), 2, 2500), 3500), g(lp(soften(S('k_wood_heavy_0'), 2, 2500), 4000), -3),
              g(lp(S('v_bassdrum'), 220), -5))
    flourish = lp(hp(cut(S('k_card_fan_1'), 0.35, 0.12), 600), 9000)
    x = lay((0, tap, 0), (0.13, tap, -1), (0.26, tap, -1), (0.39, big, 1), (0.42, flourish, -8))
    return master(room(x, 0.12, 0.5), rel=-1.0, max_len=1.0)


def roar():
    x = fade_in(cut(S('fs69570_lion', onset=False), 1.7, 0.6), 0.05)
    return master(room(warm(lp(x, 6500), 1.2), 0.1, 0.5), rel=1.0)


def roll():
    return master(room(lp(cut(S('k_dice_throw_1'), 0.7, 0.2), 9000), 0.06, 0.3), rel=-2)


def step():
    return master(lp(cut(S('k_footstep_wood_1'), 0.12, 0.05), 4000), rel=-4, max_len=0.12)


def thunk():
    x = lay((0, S('k_wood_medium_0'), 0), (0.0, lp(S('k_soft_heavy_0'), 300), -6))
    return master(room(cut(x, 0.35, 0.12), 0.06, 0.3), rel=0)


def twang():
    """a muted spring pluck: a crossbow string released, slowed down, damped by felt."""
    x = cut(pitch(S('fs163453_crossbow'), -4), 0.32, 0.15)
    x = lay((0, lp(x, 5000), 0), (0.0, lp(S('k_soft_medium_1'), 350), -8))
    return master(room(x, 0.08, 0.3), rel=-2, max_len=0.35)


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
