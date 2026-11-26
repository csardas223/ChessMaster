#!/usr/bin/env python3
"""fin-sprites-b batch 3 (2026-11-26, sprite-sweep): the two spinner wheels used by js/modes/g4_wheel.js.
Both old images were frame crops with the video's pointer baked in, so the pointer spun with the wheel; nick8PeAXLA's was
also clipped on the left and off-centre (the wheel wobbled while spinning). Redrawn as clean, centred, transparent 512px
vector wheels with the video's slice colours / labels / icons; the static pointer now lives in g4_wheel.js.
Run from rebuild/app.
"""
import io, math, cairosvg
from PIL import Image

S = 512; C = S / 2


def arc(a0, a1, r):
    p = lambda a: (C + r * math.sin(math.radians(a)), C - r * math.cos(math.radians(a)))
    (x0, y0), (x1, y1) = p(a0), p(a1)
    return f'M{C},{C} L{x0:.2f},{y0:.2f} A{r},{r} 0 {1 if a1 - a0 > 180 else 0} 1 {x1:.2f},{y1:.2f} Z'


def save(svg, out):
    Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg.encode(), output_width=S, output_height=S))).save(out)


def action_wheel():
    # nick8PeAXLA (Spinner Wheel REMATCH): 11 equal slices measured clockwise from the top on the video frame.
    sl = [('#e33e76', 'Move'), ('#eb5b50', 'Move'), ('#f7a126', 'Capture'), ('#f7bf46', 'Move'), ('#f7e756', 'Move'),
          ('#ceda54', 'Blunder'), ('#94c955', 'Move'), ('#24a095', 'Move'), ('#3fa0ed', 'Move'), ('#5c68bb', 'Check'),
          ('#a746b9', 'Move')]
    n = len(sl); w = 360 / n; R = 244
    parts = [f'<circle cx="{C}" cy="{C}" r="254" fill="#d7d9dc"/>']
    for i, (col, lab) in enumerate(sl):
        a0 = -w / 2 + i * w
        parts.append(f'<path d="{arc(a0, a0 + w, R)}" fill="{col}"/>')
        mid = a0 + w / 2
        # label runs along the radius, reading from the hub outwards (as on the video's wheel)
        parts.append(f'<text x="{C + 150}" y="{C}" transform="rotate({mid - 90} {C} {C})" font-family="DejaVu Sans" '
                     f'font-size="30" font-weight="600" fill="#1d1d1d" text-anchor="middle" dominant-baseline="central">{lab}</text>')
    parts.append(f'<circle cx="{C}" cy="{C}" r="48" fill="#fff" stroke="#e6e6e6" stroke-width="3"/>')
    save(f'<svg xmlns="http://www.w3.org/2000/svg" width="{S}" height="{S}">{"".join(parts)}</svg>',
         'assets/modes/nick8PeAXLA/wheel.png')


def piece_wheel():
    # 6YEM7m8owJ4 (Spinner Wheel vs Martin): 6 purple slices, one piece icon each, pawn hub.
    cols = ['#8a5fd3', '#7446c2'] * 3
    order = ['K', 'Q', 'R', 'B', 'N', 'P']
    R = 238
    parts = [f'<circle cx="{C}" cy="{C}" r="254" fill="#4e2f8c"/>']
    for i in range(6):
        a0 = -30 + i * 60
        parts.append(f'<path d="{arc(a0, a0 + 60, R)}" fill="{cols[i]}"/>')
    for i in range(6):   # thin light dividers
        a = math.radians(-30 + i * 60)
        parts.append(f'<line x1="{C}" y1="{C}" x2="{C + R * math.sin(a):.1f}" y2="{C - R * math.cos(a):.1f}" stroke="#a98be6" stroke-width="3"/>')
    parts.append(f'<circle cx="{C}" cy="{C}" r="58" fill="#f4f0fb" stroke="#4e2f8c" stroke-width="6"/>')
    base = Image.open(io.BytesIO(cairosvg.svg2png(bytestring=f'<svg xmlns="http://www.w3.org/2000/svg" width="{S}" height="{S}">{"".join(parts)}</svg>'.encode(),
                                                   output_width=S, output_height=S))).convert('RGBA')
    def glyph(code, w, col):
        g = Image.open(io.BytesIO(cairosvg.svg2png(url=f'assets/pieces/cburnett/w{code}.svg', output_width=w, output_height=w))).convert('RGBA')
        # cburnett white piece: white fill -> col, black outline -> darker purple
        px = g.load()
        for y in range(g.height):
            for x in range(g.width):
                r, gg, b, a = px[x, y]
                if a:
                    t = (r + gg + b) / 765
                    px[x, y] = (int(col[0] * t + 60 * (1 - t)), int(col[1] * t + 30 * (1 - t)), int(col[2] * t + 110 * (1 - t)), a)
        return g
    for i, code in enumerate(order):
        a = math.radians(i * 60); r = 158; w = 104
        g = glyph(code, w, (246, 242, 255))
        base.alpha_composite(g, (int(C + r * math.sin(a) - w / 2), int(C - r * math.cos(a) - w / 2)))
    hub = glyph('P', 84, (180, 170, 200))
    base.alpha_composite(hub, (int(C - 42), int(C - 44)))
    base.save('assets/modes/6YEM7m8owJ4/wheel.png')


if __name__ == '__main__':
    action_wheel(); piece_wheel(); print('ok')
