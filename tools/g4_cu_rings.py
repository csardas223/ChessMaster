"""impl-4 (2026-11-25): Chess Ultimate tokens (assets/modes/CxtttdnwNWk/cu, shared by all 9 CU modes).
In the videos both armies use the SAME character art; sides differ only by the outline glow: the player's
units are outlined cyan/blue, the opponent's red (research/frames/sprites/1_FSHqyc904_board_3d.png cyan,
wwVvGHfEfPI_pink_octopus.png / wwVvGHfEfPI_king_and_ninja_pieces.png red). The old tokens used a white ring
(_w) vs dark ring (_b). This recolours only the ring band (pixels where _w and _b differed, radius >= 45 of 64)
to cyan (_w) / red (_b); the character art inside is untouched. Ran ONCE on the white/dark-ring tokens
(git show 869e1ce/b7f685e versions); re-running on the recoloured files is a no-op-ish and not needed."""
from PIL import Image
import numpy as np, glob, os
d = os.path.join(os.path.dirname(__file__), '..', 'assets/modes/CxtttdnwNWk/cu/')
col = {'w': (57, 198, 244), 'b': (236, 72, 60)}
for n in sorted(set(os.path.basename(f)[:-6] for f in glob.glob(d + '*_w.png'))):
    A = {c: np.array(Image.open(d + f'{n}_{c}.png').convert('RGBA')).astype(float) for c in 'wb'}
    diff = np.abs(A['w'][..., :3] - A['b'][..., :3]).sum(-1)
    H, W = diff.shape; yy, xx = np.mgrid[:H, :W]; r = np.hypot(yy - (H - 1) / 2, xx - (W - 1) / 2)
    t = np.clip((diff - 40) / 400, 0, 1) * (r >= 45)
    for c in 'wb':
        a = A[c]
        for k in range(3): a[..., k] = a[..., k] * (1 - t) + col[c][k] * t
        Image.fromarray(a.round().clip(0, 255).astype('uint8'), 'RGBA').save(d + f'{n}_{c}.png', optimize=True)
