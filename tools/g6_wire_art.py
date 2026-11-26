"""Group-6 art pass 2 (owner 2026-11-24: ship the video sprites): wires research/frames/sprites art into the modes that
had none. Idempotent-ish: run once; edits data/modes/<id>.js text. Cards are the video's own title/intro art shown for
1.6 s at game start (as the videos open on them)."""
import os, re, shutil
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); APP = os.path.join(HERE, '..'); SPR = os.path.join(APP, 'research', 'frames', 'sprites')
A = 'assets/modes/'
def copy_sprite(mid, src, name, size=480):
    im = Image.open(os.path.join(SPR, src)).convert('RGBA'); k = min(1, size / max(im.size))
    im = im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))), Image.LANCZOS)
    d = os.path.join(APP, 'assets', 'modes', mid); os.makedirs(d, exist_ok=True); im.save(os.path.join(d, name), optimize=True)
def add_key(s, key, val):
    m = re.search(r'\n(\s*)source:', s)
    if m: i = m.start()
    else: i = re.search(r'\s*\}\s*\)\s*;?\s*$', s).start(); s = s[:i].rstrip().rstrip(',') + ',' + s[i:]; i = re.search(r'\s*\}\s*\)\s*;?\s*$', s).start()
    return s[:i] + f'\n  {key}: {val},' + s[i:]
def add_vfx(s, items):
    js = ', '.join(items)
    m = re.search(r'\n  vfx_timeline: \[', s)
    if m: return s[:m.end()] + js + ', ' + s[m.end():]
    return add_key(s, 'vfx_timeline', '[' + js + ']')
def card(mid, f, trig='game_start', ms=1600):
    return f"{{ trigger: '{trig}', once: true, effect: {{ type: 'overlay', image: '{A}{mid}/{f}', fit: 'contain', at: 'board', opacity: 1, duration_ms: {ms}, fade_ms: 300 }} }}"
def edit(mid, fn):
    p = os.path.join(APP, 'data', 'modes', mid + '.js'); s = open(p).read(); n = fn(s)
    assert n != s, mid; open(p, 'w').write(n); print('ok', mid)

CARDS = {'dKBSZUzVQ1E': 'ultimate_king.png', 'ePpFGTNs5sE': 'circular_board.png', 'fXNw2uIWqgY': 'blindfold_icon.png', 'fqfCh3CsTJk': 'black_hole.png',
         'gY9DNg9xDUM': 'ornate_knight.png', 'h7UFq4r59tM': 'four_kings.png', 'hTTtJIdPVrc': 'magic_potion.png', 'iZQGpWbIwWI': 'knight_horde.png',
         'lmmKhSrRn_c': 'potion.png', 'mf238p7c3bc': 'infinite_king.png', 'pHItplJMih0': 'egg.png', 'qSwTtgUWqUw': 'cube.png', 'qTXES0F1MVQ': 'three_plus.png',
         'rBh7IIhTbw4': 'gift.png', 'tm24Uq9nlBc': 'luxury_board.png', 'u0hl8g63mUg': 'pawn_wall.png', 'uQ0kzL0-taQ': 'atomic.png', 'vqxA5bBUoVA': 'setup_icon.png',
         'wqaQeZHJKhk': 'knight_herd.png', 'ymIg80xvKVE': 'bughouse.png', 'zxRM5dD5b7w': 'cow.png',
         'hZf3G9Pr1UU': ('3d_board.png', 'hZf3G9Pr1UU_3d_board.png'), 'hxwi9DwDUKU': ('chaturanga_board.png', 'hxwi9DwDUKU_chaturanga_board.png'),
         'n-sYPJVwaXs': ('fairy_legend.png', 'n-sYPJVwaXs_fairy_legend.png'), 'oejsLcLHwoA': ('four_player_board.png', 'oejsLcLHwoA_four_player_board.png'),
         'v2QhfoGAp_I': ('reserve_icon.png', 'v2QhfoGAp_I_reserve_icon.png'), 'xlErokL2-4c': ('chess_clock.png', 'xlErokL2-4c_chess_clock.png'),
         'tsqxjK8GP10': ('chaturaji_boat.png', 'tsqxjK8GP10_chaturaji_boat.png')}
END = {'rBh7IIhTbw4': 'wins_card.png', 'zxRM5dD5b7w': 'trophy.png'}
for mid, c in CARDS.items():
    if isinstance(c, tuple): copy_sprite(mid, c[1], c[0]); c = c[0]
    if f"{A}{mid}/{c}'" in open(os.path.join(APP, 'data', 'modes', mid + '.js')).read(): continue
    items = [card(mid, c)] + ([card(mid, END[mid], 'win', 2200)] if mid in END else [])
    edit(mid, lambda s, items=items: add_vfx(s, items))

# Chaturaji (as Yellow): the video's boat sprites per colour (same game UI as mZUViBNWt6E); 'b' is the player's yellow army
for c in 'ruyg': shutil.copy(os.path.join(APP, 'assets', 'modes', 'mZUViBNWt6E', f'boat_{c}.png'), os.path.join(APP, 'assets', 'modes', 'tsqxjK8GP10', f'boat_{c}.png'))
edit('tsqxjK8GP10', lambda s: s.replace("R: { name: 'Boat', moves: 'R', value: 500, castleRook: false, points: 5 }",
     f"R: {{ name: 'Boat', moves: 'R', value: 500, castleRook: false, points: 5, img: {{ r: '{A}tsqxjK8GP10/boat_r.png', u: '{A}tsqxjK8GP10/boat_u.png', b: '{A}tsqxjK8GP10/boat_y.png', g: '{A}tsqxjK8GP10/boat_g.png' }} }}"))
# King of the Hill: the video's hill tile on the four centre squares
HILL = lambda mid: ', '.join(f"{q}: {{ image: '{A}{mid}/hill.png', opacity: 0.85 }}" for q in ['d4', 'e4', 'd5', 'e5'])
edit('y4jUrlwAPlA', lambda s: s.replace("board: { files: 8, ranks: 8, light: '#ECF2D1', dark: '#7B9F59',", "board: { files: 8, ranks: 8, light: '#ECF2D1', dark: '#7B9F59', squares: { " + HILL('y4jUrlwAPlA') + " },"))
edit('lmmKhSrRn_c', lambda s: re.sub(r"squares: \{ d4: .*?e5: \{ color: 'rgba\(255,170,40,.32\)' \} \}", "squares: { " + HILL('lmmKhSrRn_c') + " }", s))
# stone walls from the video (Labyrinth 82, Cornered Kings): wall type '#' drawn with the sprite instead of CSS hatching
WALL = lambda mid: f"'#': {{ name: 'Wall', value: 0, moves: '', blocker: true, capturable: false, overlay: null, img: '{A}{mid}/stone_wall.png' }}"
edit('xg_djfCrRes', lambda s: add_key(s, 'pieces', '{ ' + WALL('xg_djfCrRes') + ' }') if '\n  pieces:' not in s else s.replace('\n  pieces: {', '\n  pieces: { ' + WALL('xg_djfCrRes') + ',', 1))
edit('y5MBC8OCYlI', lambda s: add_key(s, 'pieces', '{ ' + WALL('y5MBC8OCYlI') + f", K: {{ name: 'King', moves: 'K', value: 2000, royal: true, castle: true, img: {{ w: '{A}y5MBC8OCYlI/yellow_king.png', b: '{A}y5MBC8OCYlI/red_king.png' }} }} }}"))
