"""cm-g6b (2026-11-25): Ouroboros King (rf2HSTXTehE) UI icons cut from repo stills: relics (Ouroboros Sigil, Alarm Bell,
The Finisher, wings relic), the rewind item, the gold-coins icon, the campaign map icon (rf2HSTXTehE_frame_82.jpg) and the
AI draw-offer handshake (_RFXN1Ye3sY_frame_223.jpg, the same game). White line art on a dark backdrop: alpha from luminance."""
from PIL import Image
import os
R = os.path.join(os.path.dirname(__file__), '..', '..', 'research', 'frames', 'video_thumbs')
O = os.path.join(os.path.dirname(__file__), '..', 'assets', 'modes', 'rf2HSTXTehE')
def cut(src, box, name):
    im = Image.open(os.path.join(R, src)).convert('RGB').crop(box); out = Image.new('RGBA', im.size)
    px, po = im.load(), out.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b = px[x, y]; L = 0.3 * r + 0.59 * g + 0.11 * b
            po[x, y] = (255, 255, 255, max(0, min(255, int((L - 70) * 2.2))))
    bb = out.getbbox(); out = out.crop(bb) if bb else out
    out.save(os.path.join(O, name + '.png')); print(name, out.size)
F = 'rf2HSTXTehE_frame_82.jpg'
cut(F, (344, 920, 416, 990), 'relic_sigil')
cut(F, (420, 920, 492, 990), 'relic_bell')
cut(F, (496, 920, 568, 990), 'relic_finisher')
cut(F, (572, 920, 644, 990), 'relic_wings')
cut(F, (346, 990, 412, 1052), 'item_rewind')
cut(F, (1306, 990, 1378, 1062), 'gold')
cut(F, (1804, 990, 1876, 1062), 'map_icon')
cut('_RFXN1Ye3sY_frame_223.jpg', (880, 935, 1040, 1065), 'draw_offer')
