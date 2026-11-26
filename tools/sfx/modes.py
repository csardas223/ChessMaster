"""Mode effect sounds and result stings, built from recorded CC0 sources (see sources.md).

Same aesthetic as the board set: real recordings, close and soft, short tails, nothing piercing.
Each effect keeps its meaning (a gunshot still reads as a gunshot, a coin is a real coin, a quack is a quack).
"""
import numpy as np
from synth import SR, lp, hp, bp, mix, at
from samples import (S, g, pitch, glide, rev, cut, fade_in, fade_out, soften, peq, shelf, warm, room, hall, lay,
                     master)
from core import piece, inst, felt, explosion, jumpscare, tick


def W(name='fs60013_whoosh'):
    return S(name)


def whoosh(s0=0.0, s1=0.0, lo=300, hi=9000, src='fs60013_whoosh'):
    """recorded air movement, varispeed-glided (lower = longer)."""
    x = glide(W(src), s0, s1) if (s0 or s1) else W(src)
    return fade_in(bp(x, lo, hi), 0.02)


# ---------- results ----------
def victory():
    """warm, sleek win: vibraphone rising into a rolled felt-piano maj9, mark-tree glint, glass halo."""
    arp = lay((0.0, inst('vibes', 79, 1.6), 0), (0.085, inst('vibes', 83, 1.6), -1), (0.17, inst('vibes', 86, 1.6), -2),
              (0.255, inst('vibes', 91, 1.9), -2))
    chord = lay((0.0, felt(inst('piano', 48, 2.4), 1600), -2), (0.04, felt(inst('piano', 55, 2.3)), -4),
                (0.08, felt(inst('piano', 64, 2.2)), -5), (0.12, felt(inst('piano', 71, 2.1), 2800), -7),
                (0.16, felt(inst('piano', 74, 2.0), 3000), -8))
    glint = fade_in(hp(cut(S('v_marktree_up'), 1.2, 0.6), 3500), 0.15)
    halo = fade_in(inst('glass', 86, 1.9), 0.5)
    x = lay((0, arp, -5), (0.33, chord, 0), (0.3, glint, -21), (0.36, halo, -24))
    return master(hall(x, 0.22, 2.0), rel=-1.5, max_len=2.9)


def defeat():
    """gentle and quiet: two falling felt-piano notes settling on a low minor add9."""
    hi = lay((0, felt(inst('piano', 69, 0.8), 2000), 0), (0.3, felt(inst('piano', 64, 0.9), 1900), -1))
    low = lay((0, felt(inst('piano', 45, 2.0), 1100), 0), (0.03, felt(inst('piano', 52, 2.0), 1400), -2),
              (0.06, felt(inst('piano', 60, 2.0), 1700), -4), (0.09, felt(inst('piano', 71, 1.9), 1900), -10))
    x = lay((0, hi, -2), (0.62, low, 0), (0.7, fade_in(inst('glass', 74, 1.4), 0.4), -27))
    return master(hall(x, 0.2, 1.8), rel=-2.5, max_len=2.7)


def draw():
    """neutral and calm: open fifths, vibraphone over felt piano, no resolution either way."""
    x = lay((0, inst('vibes', 74, 1.7), 0), (0.0, felt(inst('piano', 50, 1.9), 1400), -5), (0.13, inst('vibes', 81, 1.6), -2),
            (0.13, felt(inst('piano', 57, 1.8)), -7), (0.3, inst('kalimba', 76, 1.2), -9))
    return master(hall(x, 0.2, 1.6), rel=-2.5, max_len=2.3)


# ---------- mode effects ----------
def spawn():
    """something appears: an in-breath of air, a glass glint, a soft set-down."""
    air = fade_in(bp(rev(W()), 800, 9000), 0.05)
    x = lay((0, air, -9), (0.4, inst('glock', 91, 0.5), -15), (0.38, hp(cut(S('v_marktree_down'), 0.42, 0.3), 4000), -17),
            (0.42, piece('k_wood_light_1', 2.0), -5))
    return master(room(x, 0.15, 0.6), rel=-1.5)


def steal():
    """quick cloth swipe, the piece lifted, a few coins."""
    swish = lp(hp(cut(S('k_cloth_2'), 0.35, 0.12), 250), 7000)
    coins = cut(S('k_coins'), 0.55, 0.3)
    x = lay((0, swish, -3), (0.17, piece('k_wood_light_1', 2.0, -1.0), -2), (0.26, lp(coins, 9000), -9))
    return master(room(x, 0.1, 0.4), rel=-1.5)


def void():
    """pulled into nothing: air sinking away over a soft low drum."""
    air = lp(whoosh(2, -9, 150, 6000, 'fs349698_slow_swoosh'), 3500)
    x = lay((0, air, 0), (0.02, lp(S('v_timpani'), 380), -6), (0.0, lp(cut(rev(S('v_gong_p')), 0.5, 0.05), 1500), -18))
    return master(hall(x, 0.25, 1.4), rel=-1.5, max_len=1.3)


def portal():
    """a wine-glass swell drawn in (reversed), air, a glass chime as it opens."""
    swell = fade_in(rev(cut(inst('glass', 86), 1.0, 0.25)), 0.25)
    x = lay((0, swell, -5), (0.15, bp(W('fs683101_whoosh'), 500, 8000), -10), (0.88, inst('chime', 88, 0.9), -12))
    return master(hall(x, 0.2, 1.2), rel=-1.5, max_len=1.6)


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
    x = mix(x, g(cut(S('k_mining_2'), 0.2, 0.1), -12))
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
    """a line cleared: kalimba runs up, glass chime on top."""
    notes = (72, 74, 76, 79, 81, 84)
    run = lay(*[(i * 0.075, inst('kalimba', n, 1.0), -i * 0.4) for i, n in enumerate(notes)])
    x = lay((0, run, 0), (0.5, inst('chime', 88, 1.3), -10))
    return master(hall(x, 0.18, 1.4), rel=-1.5, max_len=2.0)


def alarm():
    """an alert, not a klaxon: repeated soft glass-and-vibe double pings."""
    ping = lay((0, inst('vibes', 88, 0.35), 0), (0.0, inst('chime', 88, 0.35), -6), (0.12, inst('vibes', 84, 0.35), -2))
    x = lay((0, ping, 0), (0.42, ping, -1), (0.84, ping, -2))
    return master(room(x, 0.12, 0.5), rel=-2, max_len=1.45)


def coin():
    """a real coin dropped on a table."""
    x = cut(S('fs17502_coin'), 0.8, 0.35)
    return master(room(shelf(x, 7000, -2, 'high'), 0.08, 0.3), rel=-2)


def zap():
    """an electric snap: sparkler crackle, a glassy ring, a soft low thump."""
    crack = hp(cut(S('fs45650_fuse'), 0.32, 0.18), 1200)
    x = lay((0, crack, 0), (0.0, lp(S('k_soft_medium_1'), 300), -8), (0.01, inst('glass', 90, 0.5), -16))
    return master(room(x, 0.1, 0.4), rel=-1, max_len=0.7)


def achievement():
    """vibraphone rising over a soft felt-piano chord, a glint of mark tree."""
    arp = lay(*[(i * 0.09, inst('vibes', n, 1.3), -i * 0.8) for i, n in enumerate((84, 88, 91, 96))])
    chord = mix(felt(inst('piano', 60, 1.8)), felt(inst('piano', 64, 1.8)), felt(inst('piano', 67, 1.8)))
    x = lay((0, arp, -3), (0.27, chord, -6), (0.25, hp(cut(S('v_marktree_down'), 0.9, 0.5), 3500), -20))
    return master(hall(x, 0.2, 1.6), rel=-1.5, max_len=2.2)


def chest():
    x = lay((0, cut(S('fs202092_chest'), 0.85, 0.3), 0), (0.5, inst('glock', 91, 0.5), -18))
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
    """flesh to stone: stone grinding, a crunch, settling weight."""
    x = lay((0, lp(S('fs743246_stone'), 7000), 0), (0.08, lp(cut(S('k_mining_0'), 0.3, 0.12), 6000), -4),
            (0.2, lp(cut(S('k_mining_2'), 0.3, 0.12), 3000), -8), (0.0, lp(S('v_timpani'), 250), -14))
    return master(room(x, 0.12, 0.45), rel=-1, max_len=0.75)


def arrest():
    """a police siren, filtered back so it reads as a siren without the shriek."""
    x = fade_in(cut(S('fs52906_siren', onset=False), 1.5, 0.3), 0.06)
    x = shelf(bp(x, 350, 4500), 2500, -4, 'high')
    return master(room(x, 0.15, 0.6), rel=-5)


def gong():
    return master(hall(cut(S('v_gong_p'), 4.0, 1.6), 0.15, 1.6), rel=-1)


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
    a = lp(whoosh(1, -7, 150, 7000, 'fs349698_slow_swoosh'), 5000)
    b = lp(whoosh(4, -10, 300, 8000, 'fs683101_whoosh'), 5000)
    x = lay((0, a, 0), (0.05, b, -8))
    return master(room(fade_out(x, 0.4), 0.1, 0.5), rel=-2, max_len=1.5)


def jump():
    x = lay((0, cut(hp(S('k_cloth_4'), 300), 0.15, 0.06), 0), (0.0, lp(cut(S('k_footstep_carpet_2'), 0.08, 0.04), 3000), -8))
    return master(x, rel=-3, max_len=0.17)


def land():
    x = lay((0, lp(cut(S('k_footstep_carpet_2'), 0.11, 0.05), 4000), 0), (0, lp(S('k_soft_medium_1'), 300), -6))
    return master(x, rel=-2, max_len=0.12)


def superjump():
    x = lay((0, cut(hp(S('k_cloth_4'), 300), 0.2, 0.08), -3), (0.03, whoosh(-5, 5, 300, 9000), 0),
            (0.45, inst('glock', 96, 0.4), -20))
    return master(room(x, 0.1, 0.5), rel=-2, max_len=0.9)


def warp():
    swell = fade_in(rev(cut(inst('glass', 81), 0.8, 0.2)), 0.2)
    down = lp(whoosh(3, -9, 200, 7000, 'fs683101_whoosh'), 5000)
    x = lay((0, swell, -6), (0.55, down, -2), (0.6, inst('chime', 81, 0.8), -14))
    return master(hall(x, 0.2, 1.2), rel=-1.5, max_len=1.5)


def flag():
    x = lay((0, cut(S('k_if_glass_2'), 0.07, 0.03), 0), (0, cut(pitch(S('v_woodblock_pp'), 6), 0.06, 0.03), -6))
    return master(x, rel=-6, max_len=0.09)


def kill():
    """decisive and dark: a blade, a low drum, a low felt-piano cluster."""
    low = mix(felt(inst('piano', 43, 0.8), 900), felt(inst('piano', 44, 0.8), 900))
    x = lay((0, cut(S('k_knife_slice_1'), 0.2, 0.08), 0), (0.02, lp(S('v_timpani'), 400), -4), (0.03, low, -7))
    return master(hall(x, 0.15, 0.9), rel=0, max_len=0.9)


def beam():
    """a sustained bowed-glass tone with air: a beam, not a laser."""
    a = fade_in(cut(inst('glass', 86), 1.4, 0.4), 0.08)
    b = fade_in(cut(inst('glass', 79), 1.4, 0.4), 0.12)
    x = lay((0, a, 0), (0.0, b, -6), (0.0, lp(whoosh(-2, 1, 1500, 9000), 9000), -14))
    return master(hall(x, 0.15, 1.0), rel=-3, max_len=1.45)


def button():
    return master(cut(S('k_ui_click_3'), 0.07, 0.03), rel=-6, max_len=0.08)


def kidnap():
    """swept away: a long reversed glass swell, sinking air, a soft low drum."""
    swell = fade_in(rev(cut(inst('glass', 74), 1.6, 0.3)), 0.4)
    air = lp(whoosh(0, -8, 150, 7000, 'fs349698_slow_swoosh'), 4500)
    x = lay((0, swell, -5), (0.9, air, -2), (1.55, lp(S('v_timpani'), 350), -8), (1.55, inst('chime', 76, 0.9), -16))
    return master(hall(x, 0.22, 1.4), rel=-2, max_len=2.5)


def sinking_hymn():
    """calm ambient hymn (~27 s): quiet pipe organ pads, felt-piano melody, a wine-glass halo, long soft room."""
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
        parts.append((t0 + 0.3, fade_in(cut(inst('glass', m + 12), beat, 1.2), 0.9), -27))
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
    """stone blocks set in place, a soft bell as the keep stands."""
    stone = lp(soften(S('k_mining_0'), 2, 3000), 4500)
    x = lay((0, piece('k_wood_medium_0', -2, 2.5), 0), (0.0, cut(stone, 0.2, 0.08), -6), (0.12, piece('k_wood_light_0', -0.5, 1.5), -1),
            (0.14, inst('chime', 79, 0.5), -17))
    return master(room(x, 0.1, 0.4), rel=0, max_len=0.5)


def fanfare():
    """a celebration without brass: three quick vibraphone calls, then a bright chord with glass on top."""
    call = inst('vibes', 79, 0.2)
    chord = mix(inst('vibes', 84, 1.0), g(inst('vibes', 88, 1.0), -1), g(inst('vibes', 91, 1.0), -2),
                g(felt(inst('piano', 60, 1.0)), -4))
    x = lay((0, call, 0), (0.13, call, -1), (0.26, call, -1), (0.39, chord, 0), (0.42, inst('chime', 96, 0.9), -16))
    return master(hall(x, 0.15, 1.0), rel=-1.5, max_len=1.5)


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
    """a plucked low tine, bent a little as it rings."""
    x = glide(cut(inst('kalimba', 67, 0.5), 0.5, 0.2), 0.3, -1.2)
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
