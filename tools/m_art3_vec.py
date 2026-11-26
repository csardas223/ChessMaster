# m-art3 2026-11-26: clean 512 px re-trace of the small flat piece sprites on the BLURRY_SPRITES fix list
# (palette-quantise + potrace via tools/sprite_vec.vec; pixel art via tools/sprite_repix.repix).
# Usage: python3 tools/m_art3_vec.py OUTDIR [name ...]   (then compare + copy to assets/)
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sprite_vec import vec
from PIL import Image
MAXSRC = 200
S = 'research/frames/sprites/'
M = 'assets/modes/'
# name -> (source, k, extra kwargs)
JOBS = {
 'piiE6JB8pWw/bishop_w': (M+'piiE6JB8pWw/bishop_w.png', 3, {}),
 'piiE6JB8pWw/bishop_b': (M+'piiE6JB8pWw/bishop_b.png', 3, {}),
 'qDkxrnZfeXw/anti_queen_w': (M+'qDkxrnZfeXw/anti_queen_w.png', 3, {}),
 'qDkxrnZfeXw/anti_queen_b': (M+'qDkxrnZfeXw/anti_queen_b.png', 3, {}),
 'qDkxrnZfeXw/knook_w': (M+'qDkxrnZfeXw/knook_w.png', 4, {}),
 'qDkxrnZfeXw/knook_b': (M+'qDkxrnZfeXw/knook_b.png', 3, {}),
 'zxRM5dD5b7w/king_b': (M+'zxRM5dD5b7w/king_b.png', 3, {}),
 'zxRM5dD5b7w/pawn_b': (M+'zxRM5dD5b7w/pawn_b.png', 2, {}),
 'zxRM5dD5b7w/queen_b': (M+'zxRM5dD5b7w/queen_b.png', 3, {}),
 'zxRM5dD5b7w/rook_b': (M+'zxRM5dD5b7w/rook_b.png', 3, {}),
 'zxRM5dD5b7w/bishop_b': (M+'zxRM5dD5b7w/bishop_b.png', 3, {}),
 'zxRM5dD5b7w/knight_b': (M+'zxRM5dD5b7w/knight_b.png', 3, {}),
 'zxRM5dD5b7w/knight_w': (M+'zxRM5dD5b7w/knight_w.png', 6, {}),
 'y5MBC8OCYlI/bishop_r': (M+'y5MBC8OCYlI/bishop_r.png', 3, {}),
 'y5MBC8OCYlI/bishop_y': (M+'y5MBC8OCYlI/bishop_y.png', 3, {}),
 'custom/boat_r': ('research/ref/m-art3/boat_red_keyed.png', 5, {}),
 'custom/boat_u': ('research/ref/m-art3/boat_blue_keyed.png', 5, {}),
 'custom/boat_y': ('research/ref/m-art3/boat_yellow_keyed.png', 5, {}),
 'custom/boat_g': ('research/ref/m-art3/boat_green_keyed.png', 5, {}),
 '8rqN9o9lZOM/lance_b': (M+'8rqN9o9lZOM/lance_b.png', 2, {}),
 '8rqN9o9lZOM/silver_b': (M+'8rqN9o9lZOM/silver_b.png', 2, {}),
 'Kzt9ItpGtYg/cappy': (M+'Kzt9ItpGtYg/cappy.png', 3, {}),
 '7lEglazTlo8/target_red': (M+'7lEglazTlo8/target_red.png', 2, {}),
 'fRZmYTwLE54/magnet': (M+'fRZmYTwLE54/magnet.png', 4, {}),
 'RcpgDq_LNlk/knook_w': (M+'RcpgDq_LNlk/knook_w.png', 3, {}),
 'j5na3lPhw7g/fish_w': (M+'j5na3lPhw7g/fish_w.png', 5, {}),
 'goDcorwxJnA/minion_w': (M+'goDcorwxJnA/minion_w.png', 8, {}),
}
for side in 'rb':
    for p in ['advisor','cannon','chariot','elephant','general','horse','soldier']:
        JOBS[f'fUQXSj5jVUk/{p}_{side}'] = (M+f'fUQXSj5jVUk/{p}_{side}.png', 3, {})
if __name__ == '__main__':
    out = sys.argv[1]; names = sys.argv[2:] or list(JOBS)
    for n in names:
        src, k, kw = JOBS[n]
        o = os.path.join(out, n.replace('/', '__') + '.png')
        im = Image.open(src)
        if max(im.size) > MAXSRC:  # vec renders at 32x the source width: shrink big sources first (flat art keeps its shape)
            sc = MAXSRC / max(im.size); tmp = o + '.src.png'
            im.convert('RGBA').resize((round(im.size[0]*sc), round(im.size[1]*sc)), Image.LANCZOS).save(tmp); src = tmp
        vec(src, o, k=k, **kw); print('ok', n)
