"""Original flat 'lesson app' art for Duolingo Chess (eCzxOgc4fTY): 12 chunky pieces + an original coach character.
Drawn from scratch for Chess Master (owner-own, CC0); not traced from any app or video asset.
Run: python3 tools/duo_art.py  -> assets/modes/eCzxOgc4fTY/"""
import os
OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'modes', 'eCzxOgc4fTY')
os.makedirs(os.path.join(OUT, 'pieces'), exist_ok=True)

# chunky silhouettes, viewBox 0 0 100 100, piece stands on y=90
BASE = 'M22 80 Q22 74 28 74 H72 Q78 74 78 80 V84 Q78 90 72 90 H28 Q22 90 22 84 Z'
SHAPES = {
 'P': BASE + ' M50 18 a14 14 0 1 1 -0.01 0 Z M38 50 Q38 44 44 44 H56 Q62 44 62 50 L68 76 H32 Z',
 'R': BASE + ' M30 22 Q30 18 34 18 H40 V26 H46 V18 H54 V26 H60 V18 H66 Q70 18 70 22 V38 Q70 42 66 42 H34 Q30 42 30 38 Z M35 42 H65 L68 76 H32 Z',
 'B': BASE + ' M50 8 a7 7 0 1 1 -0.01 0 Z M50 20 C66 32 68 48 60 60 L64 76 H36 L40 60 C32 48 34 32 50 20 Z',
 'N': BASE + ' M34 76 C30 60 36 50 44 44 L28 52 Q20 54 20 46 Q20 40 26 36 L44 20 L46 10 L54 18 C70 22 78 40 72 76 Z',
 'Q': BASE + ' M22 24 a6 6 0 1 1 -0.01 0 Z M38 16 a6 6 0 1 1 -0.01 0 Z M62 16 a6 6 0 1 1 -0.01 0 Z M78 24 a6 6 0 1 1 -0.01 0 Z M50 12 a6 6 0 1 1 -0.01 0 Z'
      ' M24 34 L38 54 L42 26 L50 50 L58 26 L62 54 L76 34 L68 76 H32 Z',
 'K': BASE + ' M46 6 H54 V14 H62 V22 H54 V30 H46 V22 H38 V14 H46 Z M50 30 C70 30 78 40 74 52 L66 76 H34 L26 52 C22 40 30 30 50 30 Z',
}
# details drawn on top in the shade colour (eye, slit, bands)
DETAIL = {
 'P': '<rect x="36" y="44" width="28" height="7" rx="3.5"/>',
 'R': '<rect x="33" y="40" width="34" height="6" rx="3"/>',
 'B': '<path d="M55 30 L46 42" stroke-width="5" stroke-linecap="round" fill="none"/><rect x="38" y="58" width="24" height="6" rx="3"/>',
 'N': '<circle cx="50" cy="30" r="4"/><path d="M60 22 C70 34 70 54 66 74" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>',
 'Q': '<rect x="32" y="60" width="36" height="6" rx="3"/>',
 'K': '<rect x="32" y="60" width="36" height="6" rx="3"/>',
}
COL = {'w': ('#ffffff', '#d9d9d9', '#8a8a8a'), 'b': ('#5a5a5a', '#3d3d3d', '#2a2a2a')}

def piece(t, c):
    fill, shade, line = COL[c]
    d = SHAPES[t]
    det = DETAIL[t].replace('<rect', '<rect fill="%s"' % shade).replace('<circle', '<circle fill="%s"' % (line if c == 'w' else '#1e1e1e'))
    det = det.replace('stroke-width', 'stroke="%s" stroke-width' % shade)
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
            '<defs><clipPath id="r"><rect x="58" y="0" width="50" height="100"/></clipPath></defs>'
            '<path d="%s" fill="%s" stroke="%s" stroke-width="3.5" stroke-linejoin="round" fill-rule="nonzero"/>'
            '<path d="%s" fill="%s" clip-path="url(#r)"/>'
            '<path d="%s" fill="none" stroke="%s" stroke-width="3.5" stroke-linejoin="round"/>'
            '%s</svg>') % (d, fill, line, d, shade, d, line, det)

# pieces are now traced from Duolingo's own set by tools/duo_pieces.py (owner 2026-11-27); this script no longer writes them
if os.environ.get('DUO_OLD_PIECES'):
    for c in 'wb':
        for t in SHAPES:
            open(os.path.join(OUT, 'pieces', c + t + '.svg'), 'w').write(piece(t, c))

# ---- original coach: "Coach Rook", a round purple rook-tower with a whistle (not any app's mascot) ----
def coach(mood):
    eyes = {
      'idle': '<ellipse cx="44" cy="58" rx="7" ry="9" fill="#fff"/><ellipse cx="76" cy="58" rx="7" ry="9" fill="#fff"/>'
              '<circle cx="46" cy="60" r="4.2" fill="#2b2140"/><circle cx="78" cy="60" r="4.2" fill="#2b2140"/>',
      'happy': '<path d="M36 60 Q44 50 52 60" stroke="#2b2140" stroke-width="5" fill="none" stroke-linecap="round"/>'
               '<path d="M68 60 Q76 50 84 60" stroke="#2b2140" stroke-width="5" fill="none" stroke-linecap="round"/>',
      'sad': '<ellipse cx="44" cy="60" rx="6" ry="7" fill="#fff"/><ellipse cx="76" cy="60" rx="6" ry="7" fill="#fff"/>'
             '<circle cx="44" cy="62" r="3.6" fill="#2b2140"/><circle cx="76" cy="62" r="3.6" fill="#2b2140"/>'
             '<path d="M35 52 L50 46 M85 52 L70 46" stroke="#2b2140" stroke-width="4" stroke-linecap="round"/>',
    }[mood]
    mouth = {
      'idle': '<path d="M52 74 Q60 82 68 74" stroke="#2b2140" stroke-width="4.5" fill="none" stroke-linecap="round"/>',
      'happy': '<path d="M48 70 Q60 88 72 70 Z" fill="#2b2140"/><path d="M53 78 Q60 84 67 78 Z" fill="#ff7b8a"/>',
      'sad': '<path d="M52 80 Q60 73 68 80" stroke="#2b2140" stroke-width="4.5" fill="none" stroke-linecap="round"/>',
    }[mood]
    arms = {
      'idle': '<path d="M22 84 Q8 92 12 104" stroke="#7d3fd0" stroke-width="10" fill="none" stroke-linecap="round"/>'
              '<path d="M98 84 Q112 92 108 104" stroke="#7d3fd0" stroke-width="10" fill="none" stroke-linecap="round"/>',
      'happy': '<path d="M22 80 Q6 66 10 50" stroke="#7d3fd0" stroke-width="10" fill="none" stroke-linecap="round"/>'
               '<path d="M98 80 Q114 66 110 50" stroke="#7d3fd0" stroke-width="10" fill="none" stroke-linecap="round"/>',
      'sad': '<path d="M22 86 Q14 98 20 110" stroke="#7d3fd0" stroke-width="10" fill="none" stroke-linecap="round"/>'
             '<path d="M98 86 Q106 98 100 110" stroke="#7d3fd0" stroke-width="10" fill="none" stroke-linecap="round"/>',
    }[mood]
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140">'
      '<ellipse cx="60" cy="134" rx="40" ry="5" fill="#000" opacity=".12"/>'
      + arms +
      # tower body with battlements
      '<path d="M22 30 Q22 22 30 22 H40 V32 H52 V22 H68 V32 H80 V22 H90 Q98 22 98 30 V118 Q98 128 88 128 H32 Q22 128 22 118 Z" fill="#9a5cf0"/>'
      '<path d="M80 22 H90 Q98 22 98 30 V118 Q98 128 88 128 H78 Q86 124 86 112 V40 Q86 32 80 32 Z" fill="#7d3fd0"/>'
      '<rect x="22" y="38" width="76" height="6" fill="#7d3fd0" opacity=".6"/>'
      # cheeks
      '<ellipse cx="36" cy="74" rx="6" ry="4" fill="#ff9fc4" opacity=".7"/><ellipse cx="84" cy="74" rx="6" ry="4" fill="#ff9fc4" opacity=".7"/>'
      + eyes + mouth +
      # whistle on a cord
      '<path d="M34 90 Q56 112 74 100" stroke="#ffd23f" stroke-width="3" fill="none"/>'
      '<rect x="68" y="96" width="16" height="10" rx="4" fill="#ffd23f"/><circle cx="78" cy="101" r="2.4" fill="#c99a00"/>'
      # feet
      '<rect x="34" y="124" width="20" height="10" rx="5" fill="#5b2aa6"/><rect x="66" y="124" width="20" height="10" rx="5" fill="#5b2aa6"/>'
      '</svg>')

for m in ('idle', 'happy', 'sad'):
    open(os.path.join(OUT, 'coach_%s.svg' % m), 'w').write(coach(m))
print('ok', OUT)
