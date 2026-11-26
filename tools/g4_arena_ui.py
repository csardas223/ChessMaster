"""Chess Arena (CONozr99agQ) champion-select + HUD art, cut from the repo's video stills (owner rule: repo stills first).
Run: python3 tools/g4_arena_ui.py  ->  assets/modes/CONozr99agQ/ui/*.png
  frame_703 (11:43 CHOOSE A CHAMPION): Lord Thalric + Eldrin portrait cards, Blizzard / Ice Shield / Frostbite ability icons
  frame_352 (5:52 in game): bush (hedge) tile, blue XP orb
arena agent, 2026-11-25."""
import os
from PIL import Image, ImageDraw
APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TH = os.path.join(os.path.dirname(APP), 'research', 'frames', 'video_thumbs')
OUT = os.path.join(APP, 'assets', 'modes', 'CONozr99agQ', 'ui'); os.makedirs(OUT, exist_ok=True)
f703 = Image.open(os.path.join(TH, 'CONozr99agQ_frame_703.jpg')).convert('RGB')
f352 = Image.open(os.path.join(TH, 'CONozr99agQ_frame_352.jpg')).convert('RGB')
def save(im, name, size=None):
    if size: im = im.resize(size, Image.LANCZOS)
    im.save(os.path.join(OUT, name + '.png'), optimize=True); print(name, im.size)
save(f703.crop((1326, 893, 1416, 1018)), 'card_thalric')
save(f703.crop((1225, 893, 1313, 1018)), 'card_eldrin')
save(f703.crop((52, 399, 137, 485)), 'ab_blizzard', (72, 72))
save(f703.crop((80, 523, 165, 609)), 'ab_iceshield', (72, 72))
save(f703.crop((107, 648, 192, 734)), 'ab_frostbite', (72, 72))
save(f352.crop((1112, 430, 1206, 524)), 'bush', (64, 64))
# XP orb: circular cut with soft alpha edge
o = f352.crop((1036, 723, 1092, 779)).convert('RGBA'); m = Image.new('L', o.size, 0); ImageDraw.Draw(m).ellipse((3, 3, o.size[0] - 4, o.size[1] - 4), fill=255)
o.putalpha(m); save(o, 'xp_orb', (40, 40))
