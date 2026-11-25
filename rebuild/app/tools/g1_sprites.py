"""Group-1 (impl-1) art from the videos: copies/crops the reference sprites in research/frames/sprites/ into
assets/modes/<id>/ (owner instruction 2026-11-24 10:13 PM ET: use the video's own art; credit iwantcheckmate).
Run from rebuild/app:  python3 tools/g1_sprites.py
Methods: 'cut' = remove the board-square / plain background connected to the border (flood fill), crop, pad square;
         'tile' = keep the whole sprite (square tiles, avatars, cards), optional crop box (fractions l,t,r,b)."""
import os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
SP = os.path.join(HERE, '..', '..', 'research', 'frames', 'sprites')
OUT = os.path.join(HERE, '..', 'assets', 'modes')
SENT = (1, 254, 3, 255)

# (dest "<id>/<name>.png", sprite file, method, opts)
MAP = [
    ('-fax07t_o5s/shyguy.png', '-fax07t_o5s_scp096.png', 'tile', {'box': (0.03, 0.03, 0.97, 0.97)}),
    ('06OeGk5Iu-s/reptile.png', '06OeGk5Iu-s_scp682.png', 'tile', {'box': (0.03, 0.03, 0.97, 0.97)}),
    ('4XV3SBMQgXE/mask.png', '4XV3SBMQgXE_scp035.png', 'tile', {}),
    ('AoREbapF7y0/sniper.png', 'AoREbapF7y0_sniper_bishop.png', 'cut', {'box': (0.04, 0.0, 0.96, 0.96)}),
    ('BYg7rV53WrM/darkness.png', 'BYg7rV53WrM_darkness_tendrils.png', 'tile', {}),
    ('IU9a1RB1KJw/smartin.png', 'IU9a1RB1KJw_smartin.png', 'tile', {'box': (0.0, 0.0, 0.92, 1.0)}),
    ('IwbWTK5_1nY/sadaqah.png', 'IwbWTK5_1nY_sadaqah_card.png', 'tile', {'box': (0.0, 0.0, 1.0, 0.78)}),
    ('IwbWTK5_1nY/spell_x.png', 'IwbWTK5_1nY_freeze_spell_x.png', 'tile', {}),
    ('IwbWTK5_1nY/potion.png', 'IwbWTK5_1nY_potion.png', 'tile', {}),
    ('IwbWTK5_1nY/bottle.png', 'IwbWTK5_1nY_green_bottle.png', 'tile', {}),
    ('Ji7frCIfmAQ/lineup.png', 'Ji7frCIfmAQ_scp_lineup_thumb.png', 'tile', {}),
    ('Ji7frCIfmAQ/zombie.png', 'Ji7frCIfmAQ_scp_zombie.png', 'tile', {}),
    ('OvQYI_S5IZg/trojan.png', 'OvQYI_S5IZg_trojan_horse.png', 'cut', {}),
    ('PDCuJf3SdRY/locust.png', 'PDCuJf3SdRY_locust.png', 'tile', {}),
    ('PGBHL6Nc4X0/deer.png', 'PGBHL6Nc4X0_scp2845.png', 'tile', {}),
    ('Re3c-3qomgQ/chest.png', 'Re3c-3qomgQ_chest.png', 'tile', {}),
    ('Re3c-3qomgQ/cobble.png', 'Re3c-3qomgQ_cobblestone.png', 'tile', {}),
    ('Re3c-3qomgQ/tnt.png', 'Re3c-3qomgQ_tnt.png', 'tile', {}),
    ('U67wZoy-1fE/despair.png', 'U67wZoy-1fE_despair_entity_piece.png', 'tile', {}),
    ('Ugw05nktuDM/slingshot.png', 'Ugw05nktuDM_slingshot.png', 'tile', {'box': (0.05, 0.0, 1.0, 1.0)}),
    ('_Kx4ChHuCgI/oldman.png', '_Kx4ChHuCgI_scp106.png', 'tile', {}),
    ('amA3ARfEoU8/scp173.png', 'amA3ARfEoU8_scp173.png', 'cut', {}),
    ('byhq5v6BUWg/doctor.png', 'byhq5v6BUWg_scp049.png', 'cut', {}),
    ('d9oDfmcMJvA/gabriel.png', 'd9oDfmcMJvA_gabriel.png', 'tile', {'box': (0.0, 0.0, 0.95, 1.0)}),
    ('epzU65ZEdcs/shyguy_fog.png', 'epzU65ZEdcs_scp096_fog.png', 'tile', {}),
    ('fRZmYTwLE54/magnet.png', 'fRZmYTwLE54_magnet.png', 'cut', {'box': (0.24, 0.26, 0.68, 0.74), 'tol': 30}),
    ('fRZmYTwLE54/electric_king.png', 'fRZmYTwLE54_electrified_king.png', 'cut', {}),
    ('gHAmif0TenY/waldo.png', 'gHAmif0TenY_waldo.png', 'tile', {}),
    ('hgU5hVwLlHo/anish.png', 'hgU5hVwLlHo_anish_grab.png', 'tile', {'box': (0.0, 0.0, 0.97, 1.0)}),
    ('ioA1tvVO1qA/wizard.png', 'ioA1tvVO1qA_wizard.png', 'cut', {}),
    ('jHtJ8zYDF8M/goblin.png', 'jHtJ8zYDF8M_goblin.png', 'cut', {}),
    ('k_OvayYKZYI/dragon_rook.png', 'k_OvayYKZYI_dragon_rook.png', 'cut', {}),
    ('lpqVYTH9U-A/toaster.png', 'lpqVYTH9U-A_toaster.png', 'cut', {}),
    ('lpqVYTH9U-A/thought.png', 'lpqVYTH9U-A_toaster_thought.png', 'cut', {}),
    ('LiXg0nHrjxg/midas_hand.png', 'LiXg0nHrjxg_midas_hand.png', 'cut', {}),
    ('mwv48BWl2DY/scp966.png', 'mwv48BWl2DY_scp966.png', 'tile', {}),
    ('mymJwfSPeFA/shadow.png', 'mymJwfSPeFA_shadow_entity_piece.png', 'tile', {}),
    ('ndbf05-bvgQ/crystal.png', 'ndbf05-bvgQ_ice_crystal.png', 'cut', {}),
    ('ndbf05-bvgQ/frozen_pawn.png', 'ndbf05-bvgQ_frozen_pawn.png', 'cut', {}),
    ('oWZa73IODRU/zebra.png', 'oWZa73IODRU_zebra.png', 'cut', {}),
    ('riHSnaWRQlY/tt_rook.png', 'riHSnaWRQlY_timetravel_rook.png', 'cut', {}),
    ('rsI_92dNd9M/horse.png', 'rsI_92dNd9M_breeding_knight.png', 'cut', {'box': (0.05, 0.08, 1.0, 1.0)}),
    ('rx-HCGCNuDo/sword_king.png', 'rx-HCGCNuDo_sword_king.png', 'cut', {}),
    ('s2WDIfvefEk/scp939.png', 's2WDIfvefEk_scp939_piece.png', 'tile', {}),
    ('vPEVQgvjoL4/mal0.png', 'vPEVQgvjoL4_mal0_face.png', 'tile', {}),
    ('vQ3hLgU6jLA/flag.png', 'vQ3hLgU6jLA_mine_flag.png', 'cut', {}),
    ('w15Ev7q2HmI/crater.png', 'w15Ev7q2HmI_crater.png', 'tile', {}),
    ('w15Ev7q2HmI/mine.png', 'w15Ev7q2HmI_bomb_pawn.png', 'cut', {'box': (0.1, 0.0, 0.9, 0.78)}),
    ('w15Ev7q2HmI/x.png', 'w15Ev7q2HmI_mine_x.png', 'cut', {}),
    ('wPaOpQw4FoY/spaceship.png', 'wPaOpQw4FoY_gol_spaceship.png', 'tile', {'box': (0.0, 0.18, 1.0, 1.0)}),
    ('xvibqyL-CqQ/boiled.png', 'xvibqyL-CqQ_boiled_one_piece.png', 'tile', {}),
    ('p49nLVPVmws/clock_halving.png', 'p49nLVPVmws_clock_halving.png', 'tile', {}),
    ('aSc3Cs0eo7g/cracked.png', 'aSc3Cs0eo7g_cracked_square.png', 'tile', {}),
    ('PDCuJf3SdRY/void.png', 'PDCuJf3SdRY_void_square.png', 'tile', {}),
    ('B5LGzOEZSyo/roll.png', 'B5LGzOEZSyo_roll_button.png', 'cut', {}),
    ('aSc3Cs0eo7g/broken.png', 'aSc3Cs0eo7g_broken_square.png', 'tile', {}),
    ('I_TbJqRHtf4/marker.png', 'I_TbJqRHtf4_secret_marker.png', 'tile', {'box': (0.3, 0.14, 0.76, 0.6)}),
    ('CEkC0TINhm8/die.png', 'CEkC0TINhm8_lucky_die.png', 'tile', {}),
    ('Cr3j7jf5xXk/die.png', 'Cr3j7jf5xXk_die.png', 'tile', {}),
    ('CuwO5ygTGCM/die.png', 'CuwO5ygTGCM_die.png', 'tile', {}),
    ('HkeZayq10p8/die.png', 'HkeZayq10p8_pip_die.png', 'tile', {}),
    ('Jg-oNqDOXtg/die.png', 'Jg-oNqDOXtg_die_big.png', 'tile', {}),
    ('Rtee8TRU0vg/die.png', 'Rtee8TRU0vg_dice.png', 'tile', {}),
    ('dwiAKx06Q9E/die.png', 'dwiAKx06Q9E_infinity_die.png', 'tile', {}),
    ('eKAOw0yaqyA/die.png', 'eKAOw0yaqyA_piece_die.png', 'tile', {}),
    ('exMFzra96vo/die.png', 'exMFzra96vo_dice.png', 'tile', {}),
    ('haNXJMir3Zk/die.png', 'haNXJMir3Zk_piece_die.png', 'tile', {}),
    ('prd7LxnJtL4/die.png', 'prd7LxnJtL4_die_queen.png', 'tile', {}),
    ('vm0JynHlzys/die.png', 'vm0JynHlzys_die_thumb.png', 'tile', {}),
    ('CEkC0TINhm8/roll.png', 'CEkC0TINhm8_roll_button.png', 'cut', {}),
    ('Cr3j7jf5xXk/roll.png', 'Cr3j7jf5xXk_roll_button.png', 'cut', {}),
    ('Jg-oNqDOXtg/roll.png', 'Jg-oNqDOXtg_roll_button.png', 'cut', {}),
    ('exMFzra96vo/roll.png', 'exMFzra96vo_roll_button.png', 'cut', {}),
    ('prd7LxnJtL4/roll.png', 'prd7LxnJtL4_roll_button.png', 'cut', {}),
    ('vm0JynHlzys/roll.png', 'vm0JynHlzys_roll_button.png', 'cut', {}),
    ('HkeZayq10p8/you_win.png', 'HkeZayq10p8_you_win_popup.png', 'tile', {}),
    ('Jg-oNqDOXtg/you_win.png', 'Jg-oNqDOXtg_you_win.png', 'tile', {}),
    ('I_TbJqRHtf4/secret_queen.png', 'I_TbJqRHtf4_secret_queen_pawn.png', 'tile', {}),
    ('JPDYufARCQU/star_pawn.png', 'JPDYufARCQU_secret_queen_star_pawn.png', 'tile', {}),
    ('B5LGzOEZSyo/die.png', 'B5LGzOEZSyo_die.png', 'tile', {}),
]


def cut(im, tol):
    im = im.convert('RGBA'); w, h = im.size
    work = im.copy()
    step = max(1, min(w, h) // 40)
    pts = [(x, 0) for x in range(0, w, step)] + [(x, h - 1) for x in range(0, w, step)] + \
          [(0, y) for y in range(0, h, step)] + [(w - 1, y) for y in range(0, h, step)]
    for p in pts:
        if work.getpixel(p) != SENT:
            ImageDraw.floodfill(work, p, SENT, thresh=tol)
    px, wp = im.load(), work.load()
    for y in range(h):
        for x in range(w):
            if wp[x, y] == SENT:
                px[x, y] = (0, 0, 0, 0)
    return im


def square(im, pad=0.04):
    bb = im.getbbox() or (0, 0, im.size[0], im.size[1])
    im = im.crop(bb); w, h = im.size; s = int(max(w, h) * (1 + pad * 2))
    out = Image.new('RGBA', (s, s), (0, 0, 0, 0)); out.paste(im, ((s - w) // 2, s - h - int(s * pad)), im)
    return out


# Crops from the videos' own frames (YouTube storyboard thumbnails maxres1-3 / maxresdefault, 1280x720), for art the
# sprite folder does not have. (dest, video id, frame name, crop box in pixels)
FRAMES = [
    ('9pHhqAbQS0s/martin.png', '9pHhqAbQS0s', 'maxres1', (440, 140, 820, 520)),   # chess.com Martin bot portrait
    ('9pHhqAbQS0s/zach.png', '9pHhqAbQS0s', 'maxres1', (70, 120, 400, 450)),      # Zach (1), labelled in the same frame
    ('9pHhqAbQS0s/aaron.png', '9pHhqAbQS0s', 'maxres2', (510, 70, 850, 410)),     # "Aron (700)" intro card
    ('ucGhD2hC_6s/offside.png', 'ucGhD2hC_6s', 'maxres1', (410, 640, 870, 690)),  # OFFSIDE broadcast banner
    ('riHSnaWRQlY/clock.png', 'riHSnaWRQlY', 'maxresdefault', (296, 227, 407, 338), 'circle'),  # clock badge on past rooks
]
# (Portal squares in 7csbf0L-uio are flat colours sampled from frame maxres2: #f3861d orange, #2090f2 blue.)
# Dice faces (red piece dice from the Dice Chess videos): face letter -> (sprite, crop box px or None)
DICE = [
    ('P', 'Jg-oNqDOXtg_die_pawn.png', None), ('N', 'B5LGzOEZSyo_dice_knight.png', None),
    ('B', 'Rtee8TRU0vg_dice.png', (106, 42, 150, 100)), ('R', 'eKAOw0yaqyA_die_rook.png', None),
    ('Q', 'eKAOw0yaqyA_die_queen.png', None), ('K', 'dwiAKx06Q9E_die_king.png', None),
]
CACHE = '/tmp/g1_frames'


def frame(vid, name):
    import urllib.request
    os.makedirs(CACHE, exist_ok=True)
    f = os.path.join(CACHE, vid + '_' + name + '.jpg')
    if not os.path.exists(f):
        urllib.request.urlretrieve('https://i.ytimg.com/vi/%s/%s.jpg' % (vid, name), f)
    return Image.open(f).convert('RGBA')


def run_frames():
    for row in FRAMES:
        dest, vid, name, box = row[:4]
        im = frame(vid, name).crop(box)
        if 'circle' in row[4:]:
            m = Image.new('L', im.size, 0); ImageDraw.Draw(m).ellipse((1, 1, im.size[0] - 2, im.size[1] - 2), fill=255); im.putalpha(m)
        im.thumbnail((256, 256), Image.LANCZOS)
        d = os.path.join(OUT, dest); os.makedirs(os.path.dirname(d), exist_ok=True)
        (im if 'circle' in row[4:] else im.convert('RGB')).save(d, optimize=True)
    for face, src, box in DICE:
        im = Image.open(os.path.join(SP, src)).convert('RGB')
        if box:
            im = im.crop(box); w, h = im.size
            if w < h:   # tile cut by the frame edge: extend the red background (mirror of its own left strip)
                pad = Image.new('RGB', (h, h)); pad.paste(im, (0, 0))
                strip = im.crop((0, 0, h - w, h)).transpose(Image.FLIP_LEFT_RIGHT); pad.paste(strip, (w, 0)); im = pad
        im = im.resize((96, 96), Image.LANCZOS)
        d = os.path.join(OUT, 'B5LGzOEZSyo', 'face_' + face + '.png'); im.save(d, optimize=True)
    # Stockfish as the videos show it (the fish), for every group-1 Stockfish opponent
    im = Image.open(os.path.join(SP, 'U_irVoLjtNI_stockfish_fish.png')).convert('RGB'); im.thumbnail((256, 256), Image.LANCZOS)
    os.makedirs(os.path.join(OUT, 'U_irVoLjtNI'), exist_ok=True); im.save(os.path.join(OUT, 'U_irVoLjtNI', 'stockfish.png'), optimize=True)
    print('frames', len(FRAMES), 'dice', len(DICE))


def run():
    for dest, src, how, o in MAP:
        p = os.path.join(SP, src)
        if not os.path.exists(p):
            print('missing', src); continue
        im = Image.open(p).convert('RGBA')
        if o.get('box'):
            l, t, r, b = o['box']; W, H = im.size
            im = im.crop((int(l * W), int(t * H), int(r * W), int(b * H)))
        if how == 'cut':
            im = square(cut(im, o.get('tol', 46)))
        im.thumbnail((256, 256), Image.LANCZOS)
        d = os.path.join(OUT, dest); os.makedirs(os.path.dirname(d), exist_ok=True)
        im.save(d, optimize=True)
    print('wrote', len(MAP))


if __name__ == '__main__':
    run()
    run_frames()
