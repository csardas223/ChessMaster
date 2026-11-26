"""chess.com bot avatar (200px, transparent) -> 512px transparent PNG: premultiplied-alpha Lanczos + light unsharp, no
baked background (m-art method). Usage: python3 tools/art_bot512.py <in.png> <out.png>"""
import sys, numpy as np
from PIL import Image, ImageFilter
im = Image.open(sys.argv[1]).convert('RGBA'); a = np.asarray(im).astype(float); al = a[..., 3:] / 255
pm = Image.fromarray(np.concatenate([a[..., :3] * al, a[..., 3:]], -1).astype(np.uint8), 'RGBA').resize((512, 512), Image.LANCZOS)
p = np.asarray(pm).astype(float); A = p[..., 3:]
rgb = np.asarray(Image.fromarray(p[..., :3].astype(np.uint8)).filter(ImageFilter.UnsharpMask(1.4, 40, 2))).astype(float)
C = np.where(A > 0, rgb / np.maximum(A / 255, 1e-3), 0)
Image.fromarray(np.concatenate([np.clip(C, 0, 255), A], -1).astype(np.uint8), 'RGBA').save(sys.argv[2], optimize=True)
