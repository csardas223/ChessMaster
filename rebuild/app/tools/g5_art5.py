#!/usr/bin/env python3
"""Group 5 art pass 5 (Hark art-g5v session, 2026-11-25 ~1 AM ET). Owner 2026-11-25: frames may be grabbed from the
videos for art the repo stills don't show. Every frame used here is a paused, full-screen 1080p frame of the video's
own youtube.com player (no downloaders, no audio), committed as research/frames/video_thumbs/<id>_frame_<seconds>.jpg
(1920x1080). Nothing is drawn: pieces are cut from those frames; where the video shows one colour only, the other
colour is a recoloured copy (hue shift / fill-outline swap, as the game colours its sides) and marked "inferred".
Boxes are (l, t, r, b) on the 1920x1080 frame. Run from rebuild/app:  python3 tools/g5_art5.py [job ...]
Credit: all art (c) the original games / sites / iwantcheckmate videos."""
import os, sys, colorsys
from collections import deque
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageOps
from g5_frames import trim, square, save
from g5_art4 import hue_to, invert_rgb, abs_key

THUMBS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'research', 'frames', 'video_thumbs')
def frame(vid, t): return Image.open(os.path.join(THUMBS, '%s_frame_%s.jpg' % (vid, t))).convert('RGB')

def mask_cut(im, keep, grow=2, largest=True, do_trim=True):
    """alpha = pixels where keep(r,g,b) is true, grown `grow` px (pulls in the sprite's own dark outline from the frame),
    then only the largest connected part (drops neighbouring units / stat badges)"""
    im = im.convert('RGBA'); w, h = im.size; px = im.load()
    M = [[keep(*px[x, y][:3]) for x in range(w)] for y in range(h)]
    if largest:
        seen = [[False] * w for _ in range(h)]; best = []
        for y in range(h):
            for x in range(w):
                if M[y][x] and not seen[y][x]:
                    comp = []; q = deque([(x, y)]); seen[y][x] = True
                    while q:
                        cx, cy = q.popleft(); comp.append((cx, cy))
                        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
                            nx, ny = cx + dx, cy + dy
                            if 0 <= nx < w and 0 <= ny < h and M[ny][nx] and not seen[ny][nx]: seen[ny][nx] = True; q.append((nx, ny))
                    if len(comp) > len(best): best = comp
        M = [[False] * w for _ in range(h)]
        for x, y in best: M[y][x] = True
    for _ in range(grow):
        N = [r[:] for r in M]
        for y in range(h):
            for x in range(w):
                if M[y][x]:
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h: N[ny][nx] = True
        M = N
    for y in range(h):
        for x in range(w):
            if not M[y][x]: px[x, y] = (0, 0, 0, 0)
    return trim(im) if do_trim else im

def blue(r, g, b): return b > 45 and b > r + 30              # Wizard Chess player units: cyan-blue fill + navy outline
def orange(r, g, b): return r > 150 and r - b > 120 and g > 60  # Wizard Chess golden enemy units

def flood_bg(im, bgs, tol, extra=None):
    """Pawnbarian cells: background = reachable from the border over pixels near one of the square colours (or the red
    claw notches / highlight); the monsters' thick dark outline stops the flood"""
    im = im.convert('RGBA'); w, h = im.size; px = im.load(); seen = bytearray(w * h); q = deque()
    def isbg(c):
        if extra and extra(*c): return True
        return any(((c[0] - b[0]) ** 2 + (c[1] - b[1]) ** 2 + (c[2] - b[2]) ** 2) ** .5 < tol for b in bgs)
    for x in range(w): q.append((x, 0)); q.append((x, h - 1))
    for y in range(h): q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y * w + x]: continue
        if not isbg(px[x, y][:3]): continue
        seen[y * w + x] = 1; px[x, y] = (0, 0, 0, 0)
        q.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    return im

# ---------------------------------------------------------------- Wizard Chess (DMtaRFMpCWc)
def wizard():
    V = 'DMtaRFMpCWc'; F = frame(V, 922)   # 15:22, units without stat badges during the boss-reveal dialogue
    cuts = {'dog': (1055, 430, 1225, 540), 'merc': (565, 490, 710, 650), 'javelina': (895, 325, 1050, 475),
            'druid': (755, 385, 870, 565), 'rogue': (1220, 495, 1390, 650)}
    for n, box in cuts.items(): save(square(mask_cut(F.crop(box), blue, 1)), V + '/' + n + '.png', 160, nearest=True)
    sk = mask_cut(F.crop((70, 15, 245, 200)), orange, 2, largest=False); save(square(sk), V + '/skeleton.png', 160, nearest=True)
    gd = mask_cut(F.crop((215, 825, 355, 995)), orange, 2, largest=False); save(square(gd), V + '/guard.png', 160, nearest=True)
    # the video's Guard is an enemy (golden); the player's own guards = same sprite in the player blue (inferred)
    save(square(hue_to(gd, 0.55, 1.0)), V + '/guard_blue.png', 160, nearest=True)
    # Cloaky: his own cloaked sprite from the 1:58 dialogue scene (the magenta boss unit at 17:05 always carries its
    # ATK/DEF badge across the robe, so it is not cut)
    cl = mask_cut(frame(V, 118).crop((880, 270, 1140, 530)), blue, 2); save(square(cl), V + '/cloaky.png', 160, nearest=True)
    # Cloaky's dialogue box ("Conspiratorial whispers"), 1:58, as the boss-room overlay
    save(frame(V, 118).crop((560, 270, 1360, 1080)), V + '/cloaky_dialogue.jpg', 640)

# ---------------------------------------------------------------- Ouroboros King (JAz_qMQpI1o, _RFXN1Ye3sY)
def ouro():
    F = frame('_RFXN1Ye3sY', 223)   # 3:43, Glass queen card open; the white glass queen stands on the red-highlighted square
    im = abs_key(F.crop((620, 160, 712, 250)), 30)
    a = im.getchannel('A'); im = Image.merge('RGBA', (*ImageOps.autocontrast(im.convert('L')).convert('RGB').split(), a))
    im = square(trim(im), False)
    save(im, 'JAz_qMQpI1o/glass_queen_w.png', 120)
    save(invert_rgb(im), 'JAz_qMQpI1o/glass_queen_b.png', 120)   # other side = fill/outline swapped, as the game draws it (inferred)
    # VICTORY banners: each video's own final-boss win (19:25 / 18:07)
    save(frame('_RFXN1Ye3sY', 1165).crop((0, 330, 1920, 720)), '_RFXN1Ye3sY/victory.jpg', 960)
    v = frame('JAz_qMQpI1o', 1087); patch = frame('_RFXN1Ye3sY', 1165).crop((850, 540, 900, 600))
    v.paste(patch, (850, 540))   # the mouse pointer sits on the C in this frame: same banner pixels from the sibling video's frame
    save(v.crop((0, 330, 1920, 720)), 'JAz_qMQpI1o/victory.jpg', 960)

# ---------------------------------------------------------------- Pawnbarian (Kzt9ItpGtYg)
PX, PY, PC = 668, 95, 122.4   # board origin + cell size on the 1920x1080 frames (5x5 board)
def monster(F, c, r, m=6):
    """the monster on its own cell as a round token (soft circular cut, cell + m px). A transparent cut-out is not
    reliable here: the squares carry blight tint, claw notches and the champion ring right up to the sprites' outline"""
    x, y = PX + c * PC, PY + r * PC; im = F.crop((round(x - m), round(y - m), round(x + PC + m), round(y + PC + m))).convert('RGBA')
    w, h = im.size; px = im.load(); R = w / 2.0
    for yy in range(h):
        for xx in range(w):
            d = ((xx + .5 - R) ** 2 + (yy + .5 - R) ** 2) ** .5
            px[xx, yy] = px[xx, yy][:3] + (0 if d > R else 255 if d < R - 5 else int(255 * (R - d) / 5),)
    return im
def pawnbarian():
    V = 'Kzt9ItpGtYg'
    save(monster(frame(V, 703), 3, 0), V + '/spidertoad.png', 160)          # Spidertoad, 11:43
    save(monster(frame(V, 940), 1, 1), V + '/goblin_shaman.png', 160)       # Champion Goblin Shaman (card open), 15:40
    save(monster(frame(V, 1340), 3, 0), V + '/blightvessel.png', 160)       # Goblin Blightvessel, ringed champion top-right (card open), 22:20
    save(monster(frame(V, 1340), 3, 2), V + '/blightsack.png', 160)         # Blightsack, 22:20
    # lightning: the cantrip zap burst around the goblin archer (11:43): only its bright strokes outside the archer's face
    z = frame(V, 703).crop((870, 185, 1060, 375)).convert('RGBA'); px = z.load(); w, h = z.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]; l = (r + g + b) / 3; d = ((x - w / 2) ** 2 + (y - h / 2) ** 2) ** .5
            k = 0 if d < 0.26 * w or d > 0.5 * w or min(r, g, b) < 140 else max(0, min(255, int((l - 150) * 3)))
            px[x, y] = (r, g, b, k)
    save(z, V + '/zap.png', 200)

# ---------------------------------------------------------------- Thermopylae (boaA9_TjXeU)
GREEN = 0.379   # Green's swatch #4e9161
def thermopylae():
    V = 'boaA9_TjXeU'
    cards = {'archbishop': (65, (215, 120, 770, 860)), 'general': (70, (230, 120, 760, 860)),
             'sergeant': (75, (230, 130, 770, 870)), 'soldier': (98, (210, 150, 720, 790))}
    for n, (t, box) in cards.items():
        im = square(trim(abs_key(frame(V, t).crop(box), 40)))   # the piece-introduction cards (red icon on flat grey)
        save(im, V + '/' + n + '_r.png', 160)
        if n != 'archbishop':   # Green owns General / Sergeants / Soldiers on the board: green copy of the red card (inferred)
            save(hue_to(im, GREEN, 0.75), V + '/' + n + '_g.png', 160)

JOBS = {'wizard': wizard, 'ouro': ouro, 'pawnbarian': pawnbarian, 'thermopylae': thermopylae}
if __name__ == '__main__':
    only = sys.argv[1:]
    for k, fn in JOBS.items():
        if not only or any(k.startswith(o) for o in only): fn()
