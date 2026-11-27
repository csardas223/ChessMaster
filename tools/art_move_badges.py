#!/usr/bin/env python3
"""Move-classification badges (Brilliant ... Blunder, Book) for the MirrorFish review badges.

Original art drawn for Chess Master, released CC0 1.0: plain round badges in the usual review colours with the usual
symbols (!!, !, star, thumb, check, ?!, ?, cross, ??, book). Every glyph is built here from simple geometry (rounded
bars, circles, arcs, polygons); no font, no copied artwork. Not Chess.com art (owner rule 2026-11-26).

    python3 tools/art_move_badges.py        # writes assets/ui/move-quality/<kind>.svg
"""
import math
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'ui', 'move-quality')
W = 'fill="#fff"'

# kind: (fill, darker rim, glyph builder)
def bang(cx, top=9.2, bot=21.6, w=4.4):
    """an exclamation mark centred on cx: tapered bar + dot"""
    return (f'<path {W} d="M{cx - w / 2:.2f} {top + 1.6:.2f} Q{cx - w / 2:.2f} {top:.2f} {cx:.2f} {top:.2f} '
            f'Q{cx + w / 2:.2f} {top:.2f} {cx + w / 2:.2f} {top + 1.6:.2f} L{cx + w * 0.3:.2f} {bot - 3.6:.2f} '
            f'Q{cx:.2f} {bot - 2.6:.2f} {cx - w * 0.3:.2f} {bot - 3.6:.2f} Z"/>'
            f'<circle {W} cx="{cx:.2f}" cy="{bot + 0.6:.2f}" r="{w * 0.52:.2f}"/>')


def ques(cx, top=9.0, bot=21.6, s=1.0):
    """a question mark centred on cx: stroked hook + dot"""
    r = 3.6 * s
    cy = top + r + 0.6
    stem_y = cy + r + 1.6
    d = (f'M{cx - r:.2f} {cy:.2f} A{r:.2f} {r:.2f} 0 1 1 {cx + r * 0.55:.2f} {cy + r * 0.86:.2f} '
         f'Q{cx:.2f} {cy + r * 1.15:.2f} {cx:.2f} {stem_y:.2f}')
    return (f'<path d="{d}" fill="none" stroke="#fff" stroke-width="{3.0 * s:.2f}" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<circle {W} cx="{cx:.2f}" cy="{bot + 0.6:.2f}" r="{2.2 * s:.2f}"/>')


def star():
    pts = []
    for k in range(10):
        a = -math.pi / 2 + k * math.pi / 5
        r = 8.4 if k % 2 == 0 else 3.6
        pts.append(f'{16 + r * math.cos(a):.2f},{16.6 + r * math.sin(a):.2f}')
    return f'<polygon {W} stroke="#fff" stroke-width="1.2" stroke-linejoin="round" points="{" ".join(pts)}"/>'


def thumb():
    # a raised thumb: cuff block on the left, rounded fist with the thumb pointing up
    return (f'<rect {W} x="8.2" y="14.6" width="3.6" height="9.2" rx="1"/>'
            f'<path {W} d="M13.2 14.6 L16.4 8.6 Q17.4 7 18.6 7.8 Q19.7 8.6 19.2 10.4 L18.4 13.4 L22.4 13.4 '
            'Q24.4 13.6 24 15.6 L22.6 22.2 Q22.2 23.8 20.6 23.8 L13.2 23.8 Z"/>')


def check():
    return '<path d="M9.4 16.6 L14 21 L22.8 11.4" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>'


def cross():
    return '<path d="M10.6 10.6 L21.4 21.4 M21.4 10.6 L10.6 21.4" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/>'


def book():
    # an open book: two pages meeting at the spine
    return (f'<path {W} d="M15.2 11.2 Q12 9.2 7.6 9.6 L7.6 21.8 Q12 21.4 15.2 23.2 Z"/>'
            f'<path {W} d="M16.8 11.2 Q20 9.2 24.4 9.6 L24.4 21.8 Q20 21.4 16.8 23.2 Z"/>')


KINDS = {
    'brilliant': ('#1fb8a6', '#147a6e', lambda: bang(12.4) + bang(19.6)),
    'great': ('#5b8fc4', '#3b638c', lambda: bang(16)),
    'best': ('#85b33f', '#5a7d26', star),
    'excellent': ('#85b33f', '#5a7d26', thumb),
    'good': ('#8fae80', '#62805a', check),
    'book': ('#a8845d', '#755a3c', book),
    'inaccuracy': ('#e9b730', '#a8811a', lambda: ques(12.6, s=0.86) + bang(20.6, w=3.8)),
    'mistake': ('#e8862a', '#a65c16', lambda: ques(16)),
    'miss': ('#e8604c', '#a63e2f', cross),
    'blunder': ('#cc3333', '#8c1f1f', lambda: ques(11.6, s=0.86) + ques(20.4, s=0.86)),
}


def svg(kind):
    fill, rim, glyph = KINDS[kind]
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64">'
            f'<title>{kind}</title>'
            '<circle cx="16" cy="17" r="14.6" fill="rgba(0,0,0,0.35)"/>'
            f'<circle cx="16" cy="16" r="14.6" fill="{rim}"/>'
            f'<circle cx="16" cy="15.4" r="13.4" fill="{fill}"/>'
            f'{glyph()}</svg>\n')


def main():
    os.makedirs(OUT, exist_ok=True)
    for k in KINDS:
        with open(os.path.join(OUT, k + '.svg'), 'w') as f:
            f.write(svg(k))
    with open(os.path.join(OUT, 'LICENSE.txt'), 'w') as f:
        f.write('Move-quality badges (*.svg in this folder): original art drawn for Chess Master by tools/art_move_badges.py,\n'
                'released CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/). Not derived from Chess.com art.\n')
    print('wrote', len(KINDS), 'badges to', os.path.normpath(OUT))


if __name__ == '__main__':
    main()
