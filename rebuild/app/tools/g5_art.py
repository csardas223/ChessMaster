#!/usr/bin/env python3
"""Group 5 original art (pixel sprites + simple vector icons) -> assets/modes/<id>/*.svg.
Run: python3 tools/g5_art.py. Everything here is drawn from scratch (character grids / SVG paths), CC0.
Pixel grids: each char maps to a colour from the palette; '.' is transparent. An outline colour is added
automatically around every filled pixel when outline is set."""
import os
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'modes')

def pix(grid, pal, outline=None, pad=1):
    g = [r for r in grid.strip('\n').split('\n')]
    w = max(len(r) for r in g); g = [r.ljust(w, '.') for r in g]; h = len(g)
    W, H = w + 2 * pad, h + 2 * pad
    filled = {(x + pad, y + pad): c for y, r in enumerate(g) for x, c in enumerate(r) if c != '.'}
    rects = []
    if outline:
        ol = set()
        for (x, y) in filled:
            for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                q = (x+dx, y+dy)
                if q not in filled: ol.add(q)
        for (x, y) in sorted(ol): rects.append(f'<rect x="{x}" y="{y}" width="1.02" height="1.02" fill="{outline}"/>')
    for (x, y), c in sorted(filled.items()):
        rects.append(f'<rect x="{x}" y="{y}" width="1.02" height="1.02" fill="{pal[c]}"/>')
    s = max(W, H); ox, oy = (s - W) / 2, (s - H)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-ox} {-oy} {s} {s}" shape-rendering="crispEdges">'
            + ''.join(rects) + '</svg>')

def save(mid, name, svg):
    d = os.path.join(ROOT, mid); os.makedirs(os.path.dirname(os.path.join(d, name)), exist_ok=True)
    open(os.path.join(d, name), 'w').write(svg)

# ---------------------------------------------------------------- pixel chess set (12x14)
PIECES = {
'P': """
....aa....
...aaaa...
...aaab...
....ab....
...aaab...
..aaaaab..
..aaaaab..
.aaaaaaab.
""",
'N': """
...aa.....
..aaaaa...
.aaeaaab..
aaaaaaaab.
aaa.aaaab.
....aaaab.
...aaaaab.
..aaaaaab.
..aaaaaab.
.aaaaaaaab
""",
'B': """
....a.....
...aaa....
..aa.ab...
..aaa.b...
..aaaab...
...aab....
...aab....
..aaaab...
.aaaaaab..
.aaaaaab..
""",
'R': """
a.aa.aa.b
aaaaaaaab
.aaaaaab.
..aaaab..
..aaaab..
..aaaab..
..aaaab..
.aaaaaab.
aaaaaaaab
aaaaaaaab
""",
'Q': """
a..a..a..b
aa.aa.aa.b
aaaaaaaabb
.aaaaaaab.
..aaaaab..
..aaaaab..
...aaab...
..aaaaab..
.aaaaaaab.
aaaaaaaaab
""",
'K': """
....a.....
...aaa....
....a.....
.aa.a.aa..
aaaaaaaab.
aaaaaaaab.
.aaaaaab..
..aaaab...
..aaaab...
.aaaaaab..
aaaaaaaab.
""",
}
def piece_set(mid, sub, light, dark, ol_w='#2a2320', ol_b='#e9e2cf', accent=None):
    for t, g in PIECES.items():
        for c, (a, b, ol) in (('w', (light[0], light[1], ol_w)), ('b', (dark[0], dark[1], ol_b))):
            pal = {'a': a, 'b': b, 'e': ol}
            save(mid, f'{sub}/{c}{t}.svg', pix(g, pal, ol))

# ---------------------------------------------------------------- sprites
def sprite(mid, name, grid, pal, outline='#1a1418'):
    save(mid, name, pix(grid, pal, outline))

TROLL = """
....gggggg....
...gggggggg...
..gggggggggg..
..gwkggggwkg..
..gggggggggg..
.hggggnnggggh.
.hgggggggggggh
..ggt.tt.tgg..
..gggttttggg..
...gggggggg...
..ccccccccc...
.ccccccccccc..
"""
GOOSE = """
.....www......
....wwkww.....
....wwwwoo....
.....www......
.....ww.......
....www.......
..wwwwwww.....
.wwwwwwwwwww..
wwwwwwwwwwwww.
.wwwwwwwwwww..
...wwwwwww....
.....o..o.....
.....oo.oo....
"""
SHOTGUN_KING = """
....y.y.y.....
....yyyyy.....
....yyyyy.....
...ddddddd....
...dwdddwd....
...ddddddd....
..ddddddddd...
..dddddddddsssss
..ddddddddsssss.
..ddddddddd.b...
..ddddddddd.....
.ddddddddddd....
.ddddddddddd....
"""
BARB = """
.h.......h..
.hh.mmm.hh..
..hmmmmmh...
..mmmmmmm...
..msksskm...
..mssssss...
...sssss....
..rrrrrrr..x
.srrrrrrrs.x
.s.rrrrr.sxx
...bbbbb....
...b...b....
..bb...bb...
"""
CAPY = """
..........
..cc..cc..
.cccccccc.
.ckccccc..
cccccccccc
cnccccccc.
.cccccccc.
.cccccccc.
..c.c..c..
"""
HCAPY = """
h........h
hh.cc.cc.hh
.hhccccccch
..cckcccc.
.cccccccccc
.cnccccccc.
..cccccccc.
..cccccccc.
...c.c..c..
"""
BOSS = """
...y.y.y.y...
...yyyyyyy...
..ccccccccc..
.cckcccccckc.
.ccccccccccc.
cccccnnnccccc
ccccctttccccc
.ccccccccccc.
.ccccccccccc.
..cc.cc.cc...
"""

def preview(paths, out):
    html = '<html><body style="background:#777;margin:0">' + ''.join(f'<img src="file://{os.path.abspath(p)}" style="width:72px;height:72px;margin:3px;background:#c8b98a">' for p in paths) + '</body></html>'
    open(out, 'w').write(html)

if __name__ == '__main__':
    import sys
    # King of the Bridge (WEYUcaJTBso, shared with M0rsyuvaTrk, Y7KKKTTkwNk): pixel set + troll + goose
    piece_set('WEYUcaJTBso', 'pixel', ('#f3ead2', '#c9b98f'), ('#4a3b5c', '#2e2340'))
    sprite('WEYUcaJTBso', 'troll.svg', TROLL, {'g': '#6f9a4a', 'w': '#ffffff', 'k': '#111111', 'h': '#8fb86a', 'n': '#4f7434', 't': '#f2f0e6', 'c': '#7a5a3a'})
    sprite('Y7KKKTTkwNk', 'goose.svg', GOOSE, {'w': '#f4efe2', 'k': '#111111', 'o': '#f08a24'})
    # Shotgun King (NK4Upb_s8Ok)
    piece_set('NK4Upb_s8Ok', 'pixel', ('#fbf3e2', '#d8c8a8'), ('#2b2238', '#17111f'))
    sprite('NK4Upb_s8Ok', 'shotgun_king.svg', SHOTGUN_KING, {'y': '#f2c94c', 'd': '#2b2238', 'w': '#e8e2ff', 's': '#7b5a3a', 'b': '#2b2238'}, '#efe6d0')
    # Pawnbarian (Kzt9ItpGtYg)
    sprite('Kzt9ItpGtYg', 'hero.svg', BARB, {'h': '#e8e0cf', 'm': '#9aa3ad', 's': '#e2a87a', 'k': '#222222', 'r': '#a5482e', 'b': '#5b3b25', 'x': '#cfd6dd'})
    sprite('Kzt9ItpGtYg', 'cappy.svg', CAPY, {'c': '#a86b3c', 'k': '#1a1a1a', 'n': '#5a341b'})
    sprite('Kzt9ItpGtYg', 'horned_cappy.svg', HCAPY, {'c': '#8d5630', 'k': '#1a1a1a', 'n': '#4a2a14', 'h': '#efe6cc'})
    sprite('Kzt9ItpGtYg', 'boss.svg', BOSS, {'c': '#6b3b8c', 'k': '#ffdd55', 'n': '#2a1030', 't': '#f2f0e6', 'y': '#f2c94c'})
    if '--preview' in sys.argv:
        import glob
        preview(sorted(glob.glob(ROOT + '/WEYUcaJTBso/pixel/*.svg')) + [ROOT + '/WEYUcaJTBso/troll.svg', ROOT + '/Y7KKKTTkwNk/goose.svg'] + sorted(glob.glob(ROOT + '/NK4Upb_s8Ok/pixel/*.svg'))[:6] + [ROOT + '/NK4Upb_s8Ok/shotgun_king.svg'] + sorted(glob.glob(ROOT + '/Kzt9ItpGtYg/*.svg')), '/workspace/work/g5qa/art.html')
