#!/usr/bin/env python3
"""README clips: turns recorded frames (tools/readme_media.py -> /tmp/readme_media/<name>/*.png, or a list of
real headless QA screenshots) into a looping GIF in docs/media/ with a store-style caption bar baked in, so the clip
reads on GitHub mobile without a table around it. Keeps every GIF under 3 MB (drops colours / frames until it fits).
  python3 tools/readme_compose.py <name> "<Title>" "<one line>" [--src DIR | --files a.png b.png ...]
        [--crop x,y,w,h] [--width 480] [--ms 160] [--hold 1] [--kb N]   (--hold repeats each frame, for slideshow sources)"""
import os, sys, argparse, glob
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument('name'); ap.add_argument('title'); ap.add_argument('line')
ap.add_argument('--src'); ap.add_argument('--files', nargs='*'); ap.add_argument('--gif')
ap.add_argument('--crop'); ap.add_argument('--width', type=int, default=480); ap.add_argument('--ms', type=int, default=160)
ap.add_argument('--hold', type=int, default=1); ap.add_argument('--kb', type=int, default=0); ap.add_argument('--every', type=int, default=1)
a = ap.parse_args()
SANS_B = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; SANS = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'

frames, durs = [], []
if a.gif:   # re-caption an existing clip
    g = Image.open(a.gif)
    try:
        while True: frames.append(g.convert('RGB')); durs.append(g.info.get('duration', a.ms)); g.seek(g.tell() + 1)
    except EOFError: pass
else:
    files = a.files or sorted(glob.glob(os.path.join(a.src, '*.png')) + glob.glob(os.path.join(a.src, '*.jpg')))
    for f in files[::a.every]:
        im = Image.open(f).convert('RGB')
        for _ in range(a.hold): frames.append(im); durs.append(a.ms)
if a.crop:
    x, y, w, h = map(int, a.crop.split(','))
    frames = [f.crop((x, y, x + w, y + h)) for f in frames]
if a.kb:   # stills from a slow 3D QA run: a slow push-in on each real frame (no invented content)
    kf, kd = [], []
    for f in frames[::a.hold]:
        for i in range(a.kb):
            z = 1 + 0.08 * i / max(1, a.kb - 1); w, h = f.width / z, f.height / z
            kf.append(f.crop(((f.width - w) / 2, (f.height - h) / 2, (f.width + w) / 2, (f.height + h) / 2)).resize(f.size, Image.LANCZOS)); kd.append(a.ms)
    frames, durs = kf, kd
W = a.width; bar = round(W * 0.15)
def caption(im):
    h = round(im.height * W / im.width); out = Image.new('RGB', (W, h + bar), (38, 36, 33))
    out.paste(im.resize((W, h), Image.LANCZOS), (0, bar)); d = ImageDraw.Draw(out)
    d.rectangle((0, bar - 3, W, bar - 1), fill=(129, 182, 76))
    ft = ImageFont.truetype(SANS_B, round(bar * .36)); fl = ImageFont.truetype(SANS, round(bar * .24))
    d.text((round(W * .035), round(bar * .32)), a.title, font=ft, fill='white', anchor='lm')
    d.text((round(W * .035), round(bar * .72)), a.line, font=fl, fill=(200, 196, 188), anchor='lm')
    return out
frames = [caption(f) for f in frames]
out = os.path.join(ROOT, 'docs/media', a.name + '.gif'); os.makedirs(os.path.dirname(out), exist_ok=True)
for colors, step in ((128, 1), (96, 1), (64, 1), (64, 2), (48, 2), (48, 3)):
    fr = frames[::step]; du = [sum(durs[i:i + step]) for i in range(0, len(durs), step)]
    pal = [f.quantize(colors=colors, method=Image.MEDIANCUT, dither=Image.Dither.NONE) for f in fr]
    pal[0].save(out, save_all=True, append_images=pal[1:], duration=du, loop=0, optimize=True, disposal=1)
    if os.path.getsize(out) < 2.9e6: break
print(a.name, len(fr), 'frames', colors, 'colours', os.path.getsize(out) // 1024, 'KB')
