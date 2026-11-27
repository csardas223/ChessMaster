"""Duolingo-style chess pieces for the Duolingo Chess mode (eCzxOgc4fTY).

Traced by hand from Duolingo's own chess pieces (owner's reference image, 2026-11-27: "make the duolingo pieces like
this. Just trace."). Hand-built smooth paths, not a bitmap autotrace. 100x100 viewBox, one SVG per piece.
Layers per piece: soft floor shadow, darker base lip (the 3D bottom), body, lower shade, highlights, details.
White pieces: pale blue-grey with a grey outline. Black pieces: dark charcoal, no visible outline.
Run: python3 tools/duo_pieces.py  -> assets/modes/eCzxOgc4fTY/pieces/{w,b}{K,Q,R,B,N,P}.svg
"""
import os

OUT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'modes', 'eCzxOgc4fTY', 'pieces')

PAL = {
    'w': dict(body='#d6dee5', shade='#c3ccd4', hi='#f4f8fa', lip='#a7b1b9', line='#8f99a1', hole='#9ea8b0',
              det='#8f99a1', floor='#000000', floorOp='0.07', outline=True),
    'b': dict(body='#555658', shade='#4a4b4d', hi='#78797b', lip='#363739', line='#3f4042', hole='#2f3032',
              det='#2e2f31', floor='#000000', floorOp='0.10', outline=False),
}

# Each piece: 'sil' = silhouette paths (body), 'lip' = base path (drawn darker, under/below body),
# 'shade' = y where the lower shade starts (clip of the body), 'hi' = list of (kind, attrs) highlight shapes,
# 'hole' = dark shapes, 'det' = detail strokes.
P = {
    'P': dict(
        lip='M30 77 C30 86 40 90 50 90 C60 90 70 86 70 77 Z',
        sil=['M50 40 C42 40 38 46 41 53 C33 58 28 65 28 73 C28 82 38 86.5 50 86.5 C62 86.5 72 82 72 73 '
             'C72 65 67 58 59 53 C62 46 58 40 50 40 Z',
             'M50 13 C58.3 13 65 19.7 65 28 C65 36.3 58.3 43 50 43 C41.7 43 35 36.3 35 28 C35 19.7 41.7 13 50 13 Z'],
        shade=79,
        hi=[('ellipse', dict(cx='45', cy='22.5', rx='5', ry='4.3'))],
        hole=[], det=[]),
    'R': dict(
        lip='M29 78 L29 82 C29 88 38 90.5 50 90.5 C62 90.5 71 88 71 82 L71 78 Z',
        sil=['M20 22 C20 13 24 9 29 9 L31 9 C33.5 9 35 10.5 35 13 L35 18.5 L44.5 18.5 L44.5 13 C44.5 11 45.5 10 47.5 10 L52.5 10 '
             'C54.5 10 55.5 11 55.5 13 L55.5 18.5 L65 18.5 L65 13 C65 10.5 66.5 9 69 9 L71 9 C76 9 80 13 80 22 L80 45 '
             'C80 54 74 58 70 59 L70 64 L30 64 L30 59 C26 58 20 54 20 45 Z',
             'M33 62 L67 62 C70 62 72 64 72 67 L72 80 C72 85 64 87 50 87 C36 87 28 85 28 80 L28 67 C28 64 30 62 33 62 Z'],
        shade=74,
        hi=[('ellipse', dict(cx='50', cy='33', rx='21', ry='9.5'))],
        hole=['M50 26 C59 26 65 28.8 65 32.2 C65 35.6 59 38.4 50 38.4 C41 38.4 35 35.6 35 32.2 C35 28.8 41 26 50 26 Z'],
        det=[('path', dict(d='M23 52 C34 59 66 59 77 52', fill='none', **{'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-opacity': '0.55'}))]),
    'N': dict(
        lip='M34 76 L34 81 C34 88 44 90.5 56 90.5 C68 90.5 77 88 77 81 L77 76 Z',
        sil=['M36 10 C40 10 44 12.5 48 15 C49 11 52 8 58 8 L66 8 C74 8 78 13 78 22 L78 78 C78 85 68 87.5 56 87.5 '
             'C44 87.5 33 85 33 78 L33 62 C33 57 35 54 38 52 C30 53 21 51 17 47 C13 43 14 38 18 34 '
             'C22 30 27 26 31 23 C32 18 33 13 36 10 Z'],
        shade=77,
        hi=[('path', dict(d='M20.5 40 C23 34.5 28 30 33 27.5 C31.5 32 27.5 37 23.5 41.5 C22.3 42.8 20 42 20.5 40 Z'))],
        hole=[],
        det=[('circle', dict(cx='46', cy='36.5', r='2.8')),
             ('path', dict(d='M39 52.5 C47 57.5 58 57.5 66 52.5', fill='none', **{'stroke-width': '2.6', 'stroke-linecap': 'round'}))]),
    'B': dict(
        lip='M34 79 L34 82 C34 88 41 90.5 50 90.5 C59 90.5 66 88 66 82 L66 79 Z',
        sil=['M50 19 C42 26 20 40 20 58 C20 73 33 82 50 82 C67 82 80 73 80 58 C80 54 79 51 77.5 48.5 '
             'L63 55.5 C60 57 57.5 54.5 59.5 51.5 L70 36 C64 28 56 22 50 19 Z',
             'M50 6 C53.9 6 57 9.1 57 13 C57 16.9 53.9 20 50 20 C46.1 20 43 16.9 43 13 C43 9.1 46.1 6 50 6 Z',
             'M37 75 L63 75 C66 75 67 77 67 79 L67 83 L33 83 L33 79 C33 77 34 75 37 75 Z'],
        shade=76,
        hi=[('path', dict(d='M42 31 C35.5 37.5 31 44 29 52', fill='none', **{'stroke-width': '6', 'stroke-linecap': 'round'})),
            ('ellipse', dict(cx='48', cy='10.8', rx='2.5', ry='2.1'))],
        hole=[], det=[]),
    'Q': dict(
        lip='M37 76 L37 81 C37 88 43 90.5 50 90.5 C57 90.5 63 88 63 81 L63 76 Z',
        sil=['M11 22 C11 19.5 13.5 18.5 15.5 20 L26 27 L29 12 C29.5 9.5 32.5 9 34 11 L41 21 L48 7 C49 5.5 51 5.5 52 7 '
             'L59 21 L66 11 C67.5 9 70.5 9.5 71 12 L74 27 L84.5 20 C86.5 18.5 89 19.5 89 22 C87 35 79 45 71 53 '
             'C65 59 62 65 62 72 C62 77 57 80 50 80 C43 80 38 77 38 72 C38 65 35 59 29 53 C21 45 13 35 11 22 Z'],
        shade=72,
        hi=[('path', dict(d='M30 40 C42 29 58 29 70 40', fill='none', **{'stroke-width': '8', 'stroke-linecap': 'round'}, band=True)),
            ('ellipse', dict(cx='50', cy='65', rx='5', ry='5.5'))],
        hole=[], det=[]),
    'K': dict(
        lip='M37 76 L37 81 C37 88 43 90.5 50 90.5 C57 90.5 63 88 63 81 L63 76 Z',
        sil=['M50 28 C45 22 38 20 30 20 C19 20 11 27 11 37 C11 49 22 58 32 65 C38 69 40 72 40 75 C40 79 44 81 50 81 '
             'C56 81 60 79 60 75 C60 72 62 69 68 65 C78 58 89 49 89 37 C89 27 81 20 70 20 C62 20 55 22 50 28 Z',
             'M46.5 5 L53.5 5 C54.6 5 55.5 5.9 55.5 7 L55.5 11 L59 11 C60.1 11 61 11.9 61 13 L61 16.5 '
             'C61 17.6 60.1 18.5 59 18.5 L55.5 18.5 L55.5 31 L44.5 31 L44.5 18.5 L41 18.5 C39.9 18.5 39 17.6 39 16.5 '
             'L39 13 C39 11.9 39.9 11 41 11 L44.5 11 L44.5 7 C44.5 5.9 45.4 5 46.5 5 Z'],
        shade=None,
        hi=[('path', dict(d='M8 53 C28 46 72 46 92 53 L92 100 L8 100 Z'))],
        hole=[], det=[]),
}


def attrs(d):
    return ' '.join('%s="%s"' % (k, v) for k, v in d.items())


def piece(t, c):
    s, p = P[t], PAL[c]
    sil = s['sil']
    o = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">']
    cid = 'c%s%s' % (c, t)
    o.append('<defs><clipPath id="%s">%s</clipPath></defs>' % (cid, ''.join('<path d="%s"/>' % d for d in sil)))
    # soft floor shadow
    o.append('<ellipse cx="50" cy="89.5" rx="30" ry="5.5" fill="%s" fill-opacity="%s"/>' % (p['floor'], p['floorOp']))
    allp = [s['lip']] + sil
    # outline (painted under the fills, so only its outer half shows)
    lw = '5' if p['outline'] else '2.5'
    o.append('<g fill="%s" stroke="%s" stroke-width="%s" stroke-linejoin="round">%s</g>' % (
        p['line'], p['line'], lw, ''.join('<path d="%s"/>' % d for d in allp)))
    # base lip, then body
    o.append('<path d="%s" fill="%s"/>' % (s['lip'], p['lip']))
    o.append('<g fill="%s">%s</g>' % (p['body'], ''.join('<path d="%s"/>' % d for d in sil)))
    o.append('<g clip-path="url(#%s)">' % cid)
    if s.get('shade'):
        o.append('<rect x="0" y="%s" width="100" height="%s" fill="%s"/>' % (s['shade'], 100 - s['shade'], p['shade']))
    for kind, a in s['hi']:
        a = dict(a)
        band = a.pop('band', False)
        # on the white set the queen arch / king band read as grey bands, on black as lighter grey (like the reference)
        col = (p['shade'] if c == 'w' else p['hi']) if band else p['hi']
        if a.get('fill') == 'none':
            a['stroke'] = col
        else:
            a['fill'] = col
        o.append('<%s %s/>' % (kind, attrs(a)))
    for d in s['hole']:
        o.append('<path d="%s" fill="%s"/>' % (d, p['hole']))
    o.append('</g>')
    for kind, a in s['det']:
        a = dict(a)
        if a.get('fill') == 'none':
            a['stroke'] = p['det']
        else:
            a['fill'] = p['det']
        o.append('<%s %s/>' % (kind, attrs(a)))
    o.append('</svg>')
    return ''.join(o)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for c in 'wb':
        for t in 'KQRBNP':
            with open(os.path.join(OUT, c + t + '.svg'), 'w') as f:
                f.write(piece(t, c) + '\n')
    print('wrote 12 pieces to', os.path.normpath(OUT))
