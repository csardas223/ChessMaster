"""Group-6 (impl-6): copy the video's art from research/frames/sprites into assets/modes/<id>/ (owner instruction,
2026-11-24 10:13 PM ET: use the video sprites directly). Pieces get their flat background keyed out (flood fill from
the border, so outlines survive) and are trimmed to a square PNG; avatars and cards keep their background.
Run: python3 tools/g6_sprites.py [id ...]"""
import os, sys
from collections import deque
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
SPR = os.path.join(HERE, '..', '..', 'research', 'frames', 'sprites')
OUT = os.path.join(HERE, '..', 'assets', 'modes')

def key_out(im, tol=70, seeds=None):
    im = im.convert('RGBA'); w, h = im.size; px = im.load()
    seen = bytearray(w * h); q = deque()
    border = seeds or [(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)]
    for x, y in border:
        if not seen[y * w + x]: seen[y * w + x] = 1; q.append((x, y, px[x, y]))
    while q:
        x, y, ref = q.popleft(); c = px[x, y]
        if abs(c[0] - ref[0]) + abs(c[1] - ref[1]) + abs(c[2] - ref[2]) > tol: continue
        px[x, y] = (c[0], c[1], c[2], 0)
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]: seen[ny * w + nx] = 1; q.append((nx, ny, ref))
    return im
def square(im, size, pad=0.06, keep_bg=False):
    if not keep_bg:
        bb = im.getbbox()
        if bb: im = im.crop(bb)
    w, h = im.size; s = int(max(w, h) * (1 + 2 * pad)) if not keep_bg else min(w, h)
    if keep_bg:
        l, t = (w - s) // 2, (h - s) // 2; im = im.crop((l, t, l + s, t + s))
    else:
        c = Image.new('RGBA', (s, s), (0, 0, 0, 0)); c.paste(im, ((s - w) // 2, (s - h) // 2), im); im = c
    return im.resize((size, size), Image.LANCZOS) if im.size[0] != size else im
def recolor(im, fn):
    im = im.copy(); px = im.load()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            r, g, b, a = px[x, y]
            if a: px[x, y] = fn(r, g, b) + (a,)
    return im

JOBS = []  # (mode id, sprite file, out name, kind, opts)
def job(mid, src, name, kind='piece', **o): JOBS.append((mid, src, name, kind, o))

def run(only):
    done = 0
    for mid, src, name, kind, o in JOBS:
        if only and mid not in only: continue
        im = Image.open(os.path.join(SPR, src)).convert('RGBA')
        if o.get('crop'): l, t, r, b = o['crop']; W, H = im.size; im = im.crop((int(l * W), int(t * H), int(r * W), int(b * H)))
        if kind == 'piece':
            im = key_out(im, o.get('tol', 70)); im = square(im, o.get('size', 128), o.get('pad', 0.04))
        elif kind == 'avatar':
            im = square(im, o.get('size', 128), keep_bg=True)
        else:  # card / overlay: keep, cap size
            if o.get('key'): im = key_out(im, o.get('tol', 70))
            m = o.get('size', 360); k = min(1, m / max(im.size)); im = im.resize((max(1, int(im.size[0] * k)), max(1, int(im.size[1] * k))), Image.LANCZOS)
        if o.get('dark'): im = recolor(im, lambda r, g, b: (int(r * 0.22 + 20), int(g * 0.22 + 20), int(b * 0.22 + 24)))
        d = os.path.join(OUT, mid); os.makedirs(d, exist_ok=True); im.save(os.path.join(d, name), optimize=True); done += 1
    print(done, 'sprites written')

# ------------------------------------------------------------------ mapping (sprite -> asset)
job('xvlHij1tgk8', 'xvlHij1tgk8_cat_knight.png', 'cat_knight.png', 'card', size=160)
job('xvlHij1tgk8', 'xvlHij1tgk8_table_tactics_knight.png', 'tt_knight.png', 'card', size=160)
job('xvlHij1tgk8', 'xvlHij1tgk8_purple_slime.png', 'slime.png', 'piece', size=128)
job('xvlHij1tgk8', 'xvlHij1tgk8_meat.png', 'meat.png', 'piece', size=96)
job('xvlHij1tgk8', 'xvlHij1tgk8_cat_knight.png', 'cat_knight_av.png', 'avatar')
job('hv_NHWqysZE', 'puKYAUl9x9s_horned_opponent.png', 'troll.png', 'avatar')
job('dztzDlPfqSI', 'dztzDlPfqSI_ai_knight.png', 'passant_ai.png', 'avatar')
job('dztzDlPfqSI', 'rMSar6g_2HY_passant_logo.png', 'passant_logo.png', 'card')
job('dztzDlPfqSI', 'dztzDlPfqSI_shop_item.png', 'coin_item.png', 'avatar', size=96)
job('dkCMhNcZezM', 'dkCMhNcZezM_rainbow_bishop_card.png', 'rainbow_bishop_card.png', 'card')
job('dkCMhNcZezM', 'dkCMhNcZezM_boss_card.png', 'boss_card.png', 'card')
job('qZyNuiVbGMI', 'qZyNuiVbGMI_boss_round.png', 'boss_round.png', 'card')
job('qZyNuiVbGMI', 'qZyNuiVbGMI_stage_select.png', 'stage_select.png', 'card')
job('rMSar6g_2HY', 'rMSar6g_2HY_exploding_pieces.png', 'explode.png', 'card', size=200)
job('pzxXxIsKRRo', 'pzxXxIsKRRo_shotgun_king.png', 'shotgun_king.png', 'piece')
job('pzxXxIsKRRo', 'pzxXxIsKRRo_shotgun_card.png', 'shotgun_card.png', 'card')
job('qDkxrnZfeXw', 'qDkxrnZfeXw_underage_pawn.png', 'baby_pawn_w.png', 'piece')
job('qDkxrnZfeXw', 'qDkxrnZfeXw_underage_pawn.png', 'baby_pawn_b.png', 'piece', dark=True)
job('qDkxrnZfeXw', 'qDkxrnZfeXw_anarchy_piece.png', 'anarchy_bot.png', 'avatar')
for mid in ['mZUViBNWt6E', 'oGP4TUDjSVk']:
    for c, n in [('r', 'red'), ('u', 'blue'), ('y', 'yellow'), ('g', 'green')]:
        job(mid, f'{mid}_boat_{n}.png', f'boat_{c}.png', 'piece')
job('mZUViBNWt6E', 'mZUViBNWt6E_point_values.png', 'point_values.png', 'card')
job('mgXpcH_bWcY', 'mgXpcH_bWcY_blindfold_hikaru.png', 'hikaru_blind.png', 'avatar')
job('fXNw2uIWqgY', 'fXNw2uIWqgY_blindfold_icon.png', 'blindfold_icon.png', 'card', size=160)
job('fqfCh3CsTJk', 'fqfCh3CsTJk_black_hole.png', 'black_hole.png', 'card', size=640)
job('mf238p7c3bc', 'mf238p7c3bc_infinite_king.png', 'infinite_king.png', 'avatar')
job('oAoik9Dj2qQ', 'oAoik9Dj2qQ_red_king.png', 'red_king.png', 'piece')
job('oAoik9Dj2qQ', 'oAoik9Dj2qQ_blue_king.png', 'blue_king.png', 'piece')
job('oAoik9Dj2qQ', 'oAoik9Dj2qQ_key_tile.png', 'key.png', 'avatar', size=96)
job('oAoik9Dj2qQ', 'oAoik9Dj2qQ_red_king.png', 'red_king_av.png', 'avatar')
job('p6W3yDU-v88', 'p6W3yDU-v88_lock.png', 'lock.png', 'avatar', size=96)
job('p6W3yDU-v88', 'p6W3yDU-v88_purple_block.png', 'purple_block.png', 'avatar', size=96)
job('p6W3yDU-v88', 'p6W3yDU-v88_key.png', 'key.png', 'avatar', size=96)
job('pGVRaaLnMAY', 'pGVRaaLnMAY_ambush_pawn.png', 'soldier_w.png', 'piece')
job('pGVRaaLnMAY', 'pGVRaaLnMAY_ambush_pawn_spiked.png', 'sergeant_w.png', 'piece')
job('pGVRaaLnMAY', 'pGVRaaLnMAY_ambush_pawn.png', 'soldier_b.png', 'piece', dark=True)
job('pGVRaaLnMAY', 'pGVRaaLnMAY_ambush_pawn_spiked.png', 'sergeant_b.png', 'piece', dark=True)
job('pGVRaaLnMAY', 'pGVRaaLnMAY_bush.png', 'bush.png', 'avatar', size=96)
job('pHItplJMih0', 'pHItplJMih0_egg.png', 'egg.png', 'piece', size=160)
job('ppwoznHliD8', 'ppwoznHliD8_stone_king.png', 'stone_king.png', 'avatar', size=96)
job('ppwoznHliD8', 'ppwoznHliD8_petrified_piece.png', 'petrified.png', 'avatar', size=96)
job('qSwTtgUWqUw', 'qSwTtgUWqUw_5d_cube.png', 'cube.png', 'avatar')
job('qTXES0F1MVQ', 'qTXES0F1MVQ_3plus_icon.png', 'three_plus.png', 'piece', size=128)
job('qqvbb2r2k5I', 'qqvbb2r2k5I_deep_blue_monitor.png', 'deep_blu.png', 'avatar')
job('qqvbb2r2k5I', 'qqvbb2r2k5I_geisha_boss.png', 'boss.png', 'avatar')
job('rBh7IIhTbw4', 'rBh7IIhTbw4_gift.png', 'gift.png', 'piece', size=128)
job('rBh7IIhTbw4', 'rBh7IIhTbw4_king_wins_card.png', 'wins_card.png', 'card')
job('rQQKF0ZZQfg', 'rQQKF0ZZQfg_spinner_wheel.png', 'spinner_wheel.png', 'card', size=240)
job('rf2HSTXTehE', 'rf2HSTXTehE_ouroboros_hero.png', 'hero.png', 'avatar')
job('rf2HSTXTehE', 'rf2HSTXTehE_campaign_map.png', 'campaign_map.png', 'card')
job('rtoo4ojjxHU', 'rtoo4ojjxHU_rainbow_king.png', 'rainbow_king.png', 'piece')
job('s-BcakLUV4A', 's-BcakLUV4A_stockfih_avatar.png', 'stockfih.png', 'avatar')
job('sGXmiyvZDE4', 'sGXmiyvZDE4_black_knight.png', 'black_knight.png', 'avatar')
job('sGXmiyvZDE4', 'sGXmiyvZDE4_dungeon_rook.png', 'dungeon_rook.png', 'avatar')
job('sO-lD2On610', 'sO-lD2On610_pellet_pawn_plus5.png', 'pellet_pawn.png', 'piece')
job('sO-lD2On610', 'sO-lD2On610_pellet_rook_plus1.png', 'pellet_rook.png', 'piece')
job('sO-lD2On610', 'sO-lD2On610_ghosts.png', 'ghost_r.png', 'piece', crop=(0.05, 0.35, 0.42, 0.9))
job('sO-lD2On610', 'sO-lD2On610_ghosts.png', 'ghost_o.png', 'piece', crop=(0.55, 0.35, 0.95, 0.9))
job('spJibM5qaNQ', 'spJibM5qaNQ_evil_joker.png', 'evil_joker.png', 'avatar')
job('spJibM5qaNQ', 'spJibM5qaNQ_enemy_rook.png', 'enemy_rook.png', 'piece')
job('spJibM5qaNQ', 'spJibM5qaNQ_bullseye.png', 'bullseye.png', 'piece')
job('tm24Uq9nlBc', 'tm24Uq9nlBc_luxury_board.png', 'luxury_board.png', 'card', size=480)
job('u0hl8g63mUg', 'u0hl8g63mUg_pawn_wall.png', 'pawn_wall.png', 'card', size=200)
job('uQ0kzL0-taQ', 'uQ0kzL0-taQ_atomic_icon.png', 'atomic.png', 'piece', size=128)
job('wMdAOirSvQQ', 'wMdAOirSvQQ_santa.png', 'santa.png', 'avatar')
job('wMdAOirSvQQ', 'wMdAOirSvQQ_yeti.png', 'yeti.png', 'avatar')
job('xg_djfCrRes', 'xg_djfCrRes_stone_wall.png', 'stone_wall.png', 'avatar', size=96)
job('y5MBC8OCYlI', 'y5MBC8OCYlI_stone_wall.png', 'stone_wall.png', 'avatar', size=96)
job('y5MBC8OCYlI', 'y5MBC8OCYlI_red_king.png', 'red_king.png', 'piece')
job('y5MBC8OCYlI', 'y5MBC8OCYlI_yellow_king.png', 'yellow_king.png', 'piece')
job('y5MBC8OCYlI', 'y5MBC8OCYlI_red_knight.png', 'red_knight.png', 'piece')
job('xjEz7bCQxho', 'xjEz7bCQxho_tony_bot.png', 'tony.png', 'avatar')
job('y4jUrlwAPlA', 'y4jUrlwAPlA_hill.png', 'hill.png', 'piece', size=128)
job('lmmKhSrRn_c', 'lmmKhSrRn_c_hill.png', 'hill.png', 'piece', size=128)
job('lmmKhSrRn_c', 'lmmKhSrRn_c_dragon_knight.png', 'dragon_knight.png', 'avatar', size=128)
job('lmmKhSrRn_c', 'lmmKhSrRn_c_snowflake_tile.png', 'snowflake.png', 'avatar', size=96)
job('lmmKhSrRn_c', 'lmmKhSrRn_c_potion.png', 'potion.png', 'piece', size=128)
job('hTTtJIdPVrc', 'hTTtJIdPVrc_freeze_potion.png', 'freeze_potion.png', 'avatar', size=64)
job('hTTtJIdPVrc', 'hTTtJIdPVrc_jump_potion.png', 'jump_potion.png', 'avatar', size=64)
job('hTTtJIdPVrc', 'hTTtJIdPVrc_magic_potion.png', 'magic_potion.png', 'piece', size=160)
job('hk85bBLSi7Q', 'hk85bBLSi7Q_hawk_thumb.png', 'hawk_w.png', 'piece')
job('hk85bBLSi7Q', 'hk85bBLSi7Q_hawk_thumb.png', 'hawk_b.png', 'piece', dark=True)
job('djfYBXvvaYI', 'djfYBXvvaYI_villager_icon.png', 'villager_icon.png', 'piece', size=128)
job('dKBSZUzVQ1E', 'dKBSZUzVQ1E_ultimate_king.png', 'ultimate_king.png', 'avatar')
job('iqfHW2_sMmc', 'iqfHW2_sMmc_crowned_pawn.png', 'crowned_pawn.png', 'avatar')
job('iqfHW2_sMmc', 'iqfHW2_sMmc_black_king_crown.png', 'black_king_crown.png', 'avatar')
job('zP9TzlgA-W0', 'zP9TzlgA-W0_skull_enemy.png', 'skull_enemy.png', 'avatar')
job('zP9TzlgA-W0', 'zP9TzlgA-W0_heart.png', 'heart.png', 'piece', size=96)
job('zP9TzlgA-W0', 'zP9TzlgA-W0_pawnbarian_title.png', 'title.png', 'card')
job('zxRM5dD5b7w', 'zxRM5dD5b7w_cow_tile.png', 'cow.png', 'avatar')
job('zxRM5dD5b7w', 'zxRM5dD5b7w_trophy.png', 'trophy.png', 'avatar', size=96)
job('h7UFq4r59tM', 'h7UFq4r59tM_four_kings.png', 'four_kings.png', 'card', size=240)
job('ymIg80xvKVE', 'ymIg80xvKVE_bughouse_icon.png', 'bughouse.png', 'card', size=160)
job('vqxA5bBUoVA', 'vqxA5bBUoVA_setup_icon.png', 'setup_icon.png', 'card', size=160)
job('iZQGpWbIwWI', 'iZQGpWbIwWI_knight_horde.png', 'knight_horde.png', 'card', size=200)
job('wqaQeZHJKhk', 'wqaQeZHJKhk_knight_herd.png', 'knight_herd.png', 'card', size=200)
job('gY9DNg9xDUM', 'gY9DNg9xDUM_ornate_knight.png', 'ornate_knight.png', 'card', size=128)
job('ePpFGTNs5sE', 'ePpFGTNs5sE_circular_board.png', 'circular_board.png', 'card', size=240)
job('fnDkGF-EF44', 'fnDkGF-EF44_sword_pawns.png', 'sword_pawns.png', 'card', size=240)

if __name__ == '__main__': run(set(sys.argv[1:]))
