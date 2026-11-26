# sync-qa 2026-11-26: fixes for the still-referenced sprites in research/BLURRY_SPRITES.md lines 260+ ("not referenced by name"
# section; the unreferenced ones were deleted). Owner art rule: same image online > best alternate > composite from clean parts;
# transparent PNG >= 512 px, centred ~90%, never faded edges. Sources are written to each folder's source.notes.
# Run from rebuild/app: python3 tools/sq_blurry_tail.py <orig_dir>   (orig_dir holds copies of the old sprites)
import sys, os, io, re, shutil, urllib.request, numpy as np, cairosvg
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sprite_vec import vec
from sprite_repix import repix
O = sys.argv[1]
def src(p):  # keep an untouched copy of the original to trace from
    q = os.path.join(O, p.replace('/', '__'))
    if not os.path.exists(q): shutil.copy(p, q)
    return q
# 1) clean flat icons / pieces: palette-quantised potrace re-trace at 512 (same art, no new third-party art)
VEC = {'assets/img/dragon_b.png': 2, 'assets/img/dragon_w.png': 2, 'assets/modes/AvZiSnngZjA/king_b.png': 2,
       'assets/modes/DMtaRFMpCWc/skull_coin.png': 5, 'assets/modes/OO3XlFQ32i0/arrow.png': 2,
       'assets/modes/zP9TzlgA-W0/up_cantrip.png': 3, 'assets/modes/zP9TzlgA-W0/up_csplash.png': 3, 'assets/modes/zP9TzlgA-W0/up_dsplash.png': 3}
# Hexagonal-army pieces (y5MBC8OCYlI) are clean 128 px art already: re-rendered 4x (premultiplied Lanczos, light unsharp,
# hard anti-aliased alpha edge, no fading) instead of a posterising re-trace.
CRISP = [f'assets/modes/y5MBC8OCYlI/{n}_{c}.png' for n in ['royal', 'king', 'dknight', 'knight', 'sergeant', 'soldier'] for c in 'ry']
def crisp(s, out, size=512, frac=0.9):
    im = Image.open(s).convert('RGBA'); a = np.array(im).astype(float); al = a[..., 3:] / 255
    pm = Image.fromarray(np.concatenate([a[..., :3] * al, a[..., 3:]], -1).astype(np.uint8), 'RGBA')
    bb = pm.getbbox(); pm = pm.crop(bb); w, h = pm.size; sc = size * frac / max(w, h)
    big = pm.resize((round(w * sc), round(h * sc)), Image.LANCZOS)
    rgb = Image.fromarray(np.array(big)[..., :3]).filter(ImageFilter.UnsharpMask(2, 60, 2)); A = np.array(big)[..., 3].astype(float)
    A2 = np.clip((A - 96) / 64, 0, 1); A2 = A2 * A2 * (3 - 2 * A2)  # hard edge, ~2 px anti-alias
    C = np.array(rgb).astype(float) / np.maximum(A[..., None] / 255, 1e-3)
    o = np.concatenate([np.clip(C, 0, 255), (A2 * 255)[..., None]], -1).astype(np.uint8)
    r = Image.fromarray(o, 'RGBA'); c = Image.new('RGBA', (size, size)); c.paste(r, ((size - r.width) // 2, (size - r.height) // 2), r); c.save(out)
# 2) pixel-art sprites: rebuild the art-pixel grid, nearest-neighbour to 512
REPIX = {'assets/modes/AWFB4EzGtDc/pawn.png': 8, 'assets/modes/AWFB4EzGtDc/red_pawn.png': 8}
only = set(sys.argv[2:])
for p, k in VEC.items():
    if only and p not in only: continue
    s = src(p); vec(s, p, k=k); os.remove(p + '.svg') if os.path.exists(p + '.svg') else None
for p in CRISP:
    if only and p not in only: continue
    crisp(src(p), p)
# Pawnbarian loot (zP9TzlgA-W0): the same game's own gem / gold nugget, already cut from the official press kit by blurry-a (Kzt9ItpGtYg)
for a, b in [('gem', 'loot_crystal'), ('nugget', 'loot_gold')]:
    p = f'assets/modes/zP9TzlgA-W0/{b}.png'
    if only and p not in only: continue
    src(p); shutil.copy(f'assets/modes/Kzt9ItpGtYg/{a}.png', p)
for p, k in REPIX.items():
    if only and p not in only: continue
    s = src(p); repix(s, p, k=k)
# 3) Ouroboros King HUD icons: the same game-icons.net icons blurry-b chose for rf2HSTXTehE (same game, same HUD)
for a, b in [('gold', 'gold'), ('relic_sigil', 'relic_sigil'), ('item_rewind', 'rewind')]:
    p = f'assets/modes/JAz_qMQpI1o/{b}.png'
    if only and p not in only: continue
    src(p); shutil.copy(f'assets/modes/rf2HSTXTehE/{a}.png', p)
# 4) Spell Chess potions: game-icons.net 'square-bottle' / 'round-bottom-flask' by Lorc (CC BY 3.0), coloured like the video's
def gi(name, fill, out):
    svg = urllib.request.urlopen(f'https://raw.githubusercontent.com/game-icons/icons/master/lorc/{name}.svg').read().decode()
    svg = svg.replace('<path d="M0 0h512v512H0z"/>', '')
    svg = re.sub(r'fill="#fff"', f'fill="{fill}" stroke="#14202a" stroke-width="10" paint-order="stroke"', svg)
    r = Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg.encode(), output_width=1024, output_height=1024))).convert('RGBA')
    r = r.crop(r.getbbox()); w, h = r.size; sc = 512 * 0.9 / max(w, h); r = r.resize((round(w * sc), round(h * sc)), Image.LANCZOS)
    c = Image.new('RGBA', (512, 512)); c.paste(r, ((512 - r.width) // 2, (512 - r.height) // 2), r); c.save(out)
for name, fill, p in [('square-bottle', '#5ec8ff', 'assets/modes/hTTtJIdPVrc/freeze_potion.png'),
                      ('round-bottom-flask', '#6ee05a', 'assets/modes/hTTtJIdPVrc/jump_potion.png')]:
    if only and p not in only: continue
    src(p); gi(name, fill, p)
# 5) dice faces: composite of the video's red radial tile (colours sampled from the old crop) + the repo's cburnett piece SVGs
for c in 'wb':
    for t in 'PNBRQK':
        p = f'assets/modes/B5LGzOEZSyo/face_{c}{t}.png'
        if only and p not in only: continue
        src(p); mid = np.array([185., 6, 20]); edge = np.array([92., 3, 9])  # read off the old 96 px crop: bright centre, dark rim
        N = 512; yy, xx = np.mgrid[0:N, 0:N]; r = np.clip(np.hypot(xx - N / 2, yy - N / 2) / (N * 0.70), 0, 1)[..., None]
        tile = Image.fromarray((mid * (1 - r) + edge * r).astype(np.uint8)).convert('RGBA')
        svg = open(f'assets/pieces/cburnett/{c}{t}.svg').read()
        pc = Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg.encode(), output_width=360, output_height=360))).convert('RGBA')
        if c == 'b':  # the video's black pieces carry a thin white rim on the red tile
            rim = pc.getchannel('A').filter(ImageFilter.MaxFilter(9)); w = Image.new('RGBA', pc.size, (255, 255, 255, 255)); w.putalpha(rim)
            tile.alpha_composite(w, (76, 80))
        tile.alpha_composite(pc, (76, 80)); tile.convert('RGB').save(p)
print('done')
