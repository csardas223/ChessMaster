"""Group-6 (impl-6) original art: piece SVGs, avatars and backdrops for the Variants C modes, drawn from scratch with
simple shapes (no traced or copied art). Run: python3 tools/g6_art.py  -> writes into assets/modes/<id>/.
Pieces use a 45x45 viewBox like the open-licensed sets in assets/pieces, avatars a 64x64 one."""
import os
ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'modes')
OUT = []
def save(mid, name, svg):
    d = os.path.join(ROOT, mid); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, name), 'w').write(svg.strip() + '\n'); OUT.append(mid + '/' + name)

# ---------------------------------------------------------------- piece silhouettes (original, 45x45)
SIL = {
 'P': 'M22.5 8.5c-2.6 0-4.6 2-4.6 4.6 0 1.2.4 2.2 1.1 3.1-2 1.2-3.3 3.3-3.3 5.8 0 2.1.9 4 2.4 5.2-3.7 1.6-7.6 5.8-7.6 12.3h24c0-6.5-3.9-10.7-7.6-12.3 1.5-1.2 2.4-3.1 2.4-5.2 0-2.5-1.3-4.6-3.3-5.8.7-.9 1.1-1.9 1.1-3.1 0-2.6-2-4.6-4.6-4.6z',
 'R': 'M10.5 39.5h24v-3.5h-24zM13 36l1.6-4.5h15.8L32 36zM14.8 31.5l.7-13.5h14l.7 13.5zM12 18v-7.5h4.3v3h4V10.5h4.4v3h4v-3H33V18z',
 'B': 'M10 39.5c3-1 8-1 12.5-3 4.5 2 9.5 2 12.5 3v-2.5c-3-1-8-1-12.5-3-4.5 2-9.5 2-12.5 3zM16 33.5h13c1-2 1.2-3.2 0-4.5 2.5-3 3.5-6.5 3-9.5-.8-4-4.5-7-9.5-9.5-5 2.5-8.7 5.5-9.5 9.5-.5 3 .5 6.5 3 9.5-1.2 1.3-1 2.5 0 4.5zM22.5 10a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2z',
 'N': 'M13 39.5h21c0-7.5-2.5-12.5-4-17-1.2-3.8-.6-7.2.6-10.5l-3.3 1.8-1.6-4.8-2.6 4.2c-6.2.5-10.6 5-12.8 11.2-.7 2 .3 3.5 2.3 3.2l4.8-1.6c.8 3.5-1.3 6.2-3.2 8.3-1.4 1.6-1.9 3.4-1.2 5.2z',
 'Q': 'M10.5 39.5h24l-1.2-4h-21.6zM12 35.5h21l2.8-17-6 9.5-1.8-12-5.5 11-5.5-11-1.8 12-6-9.5zM9.7 16.5a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6zM16.4 14a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6zM22.5 13a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6zM28.6 14a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6zM35.3 16.5a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6z',
 'K': 'M21.2 5h2.6v3h3v2.6h-3v4.2h-2.6v-4.2h-3V8h3zM11 39.5h23l-.8-4H11.8zM12 35.5h21c1.8-4.5 5-8.5 4.4-13-.6-4.4-5.4-6.2-9.4-4.4-2.4 1.1-4 3.1-5.5 5.4-1.5-2.3-3.1-4.3-5.5-5.4-4-1.8-8.8 0-9.4 4.4-.6 4.5 2.6 8.5 4.4 13z',
}
EYE = True
COL = {'w': ('#fafafa', '#222'), 'b': ('#3a3a3a', '#111')}
def piece_svg(kind, fill, stroke, extra='', sw=1.5, under=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">{under}<path d="{SIL[kind]}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"/>{extra}</svg>'
def mini(kind, x, y, s, fill, stroke):
    k = s / 45.0
    return f'<g transform="translate({x} {y}) scale({k})"><path d="{SIL[kind]}" fill="{fill}" stroke="{stroke}" stroke-width="{1.5/k*0.6:.2f}" stroke-linejoin="round"/></g>'
def compound(base, add, c, ring='#c89b3c'):
    f, s = COL[c]
    badge = f'<circle cx="34" cy="11" r="9.5" fill="{ring}" stroke="{s}" stroke-width="1.2"/>' + mini(add, 25.5, 2.5, 17, f, s)
    return piece_svg(base, f, s, badge)

# ---------------------------------------------------------------- avatar helpers (64x64)
def av(bg, inner, rx=10): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="{rx}" fill="{bg}"/>{inner}</svg>'
def face(bg, skin='#f1c9a0', hair='#3b2a1e', style='short', beard=None, glasses=False, blind=False, shirt='#3d5a80', extra='', eyes=True, mouth='smile'):
    s = f'<path d="M10 64c1-12 10-18 22-18s21 6 22 18z" fill="{shirt}"/><rect x="27" y="40" width="10" height="8" fill="{skin}"/>'
    s += f'<ellipse cx="32" cy="30" rx="14" ry="16" fill="{skin}"/>'
    if style == 'short': s += f'<path d="M17 28c-1-10 6-15 15-15s16 5 15 15c-3-5-8-7-15-7s-12 2-15 7z" fill="{hair}"/>'
    elif style == 'curly': s += ''.join(f'<circle cx="{x}" cy="{y}" r="5" fill="{hair}"/>' for x, y in [(19, 22), (24, 16), (31, 13), (38, 15), (44, 20), (46, 27), (18, 28)])
    elif style == 'long': s += f'<path d="M16 34c-2-14 5-21 16-21s18 7 16 21l-4 12c1-10-1-17-2-19-4 2-14 2-20-2-2 4-3 12-2 21z" fill="{hair}"/>'
    elif style == 'bald': s += f'<path d="M18 26c1-3 2-4 3-4M46 26c-1-3-2-4-3-4" stroke="{hair}" stroke-width="3"/>'
    elif style == 'quiff': s += f'<path d="M17 28c-1-9 4-15 13-16 6-4 15-2 17 5 1 4 0 8 0 11-3-5-8-7-15-7s-12 2-15 7z" fill="{hair}"/>'
    elif style == 'bun': s += f'<path d="M17 28c-1-10 6-15 15-15s16 5 15 15c-3-5-8-7-15-7s-12 2-15 7z" fill="{hair}"/><circle cx="32" cy="11" r="6" fill="{hair}"/>'
    if beard == 'full': s += f'<path d="M18 32c1 12 7 16 14 16s13-4 14-16c-3 5-8 7-14 7s-11-2-14-7z" fill="{hair}"/>'
    elif beard == 'goatee': s += f'<path d="M28 41c1 4 2 6 4 6s3-2 4-6c-2 1-6 1-8 0z" fill="{hair}"/>'
    elif beard == 'stubble': s += f'<path d="M19 34c2 9 7 13 13 13s11-4 13-13c-3 4-8 6-13 6s-10-2-13-6z" fill="{hair}" opacity=".35"/>'
    elif beard == 'moustache': s += f'<path d="M25 37c3-2 5-2 7 0 2-2 4-2 7 0-2 2-5 2-7 1-2 1-5 1-7-1z" fill="{hair}"/>'
    if blind: s += '<rect x="16" y="25" width="32" height="8" rx="3" fill="#111"/><path d="M47 28l6 4-6 1z" fill="#111"/>'
    elif eyes: s += '<circle cx="26" cy="30" r="2.3" fill="#222"/><circle cx="38" cy="30" r="2.3" fill="#222"/>'
    if glasses: s += '<rect x="20" y="26" width="11" height="8" rx="1.5" fill="none" stroke="#111" stroke-width="2"/><rect x="33" y="26" width="11" height="8" rx="1.5" fill="none" stroke="#111" stroke-width="2"/><path d="M31 29h2" stroke="#111" stroke-width="2"/>'
    if mouth == 'smile': s += '<path d="M27 39q5 4 10 0" stroke="#6b2a1a" stroke-width="2" fill="none" stroke-linecap="round"/>'
    elif mouth == 'smirk': s += '<path d="M27 40q6 1 10-3" stroke="#6b2a1a" stroke-width="2" fill="none" stroke-linecap="round"/>'
    elif mouth == 'flat': s += '<path d="M28 40h8" stroke="#6b2a1a" stroke-width="2" stroke-linecap="round"/>'
    return av(bg, s + extra)

# ================================================================= shared generic avatars
HUMAN = 'fXNw2uIWqgY'  # group-6 shared "online human" silhouette (chess.com default-avatar look, original drawing)
save(HUMAN, 'human.svg', av('#8b8987', '<circle cx="32" cy="24" r="11" fill="#d6d4d0"/><path d="M12 58c2-12 10-18 20-18s18 6 20 18z" fill="#d6d4d0"/>', 6))
save(HUMAN, 'blindfold_card.svg', av('#2e7d32', '<path d="M8 30c8-8 40-8 48 0-8 6-40 6-48 0z" fill="#66bb6a"/><path d="M12 30c6-4 34-4 40 0" stroke="#1b5e20" stroke-width="2" fill="none"/><path d="M52 30l8 6M52 30l7 9" stroke="#66bb6a" stroke-width="3"/>'))

# ================================================================= named opponents
save('h4FZjGSccFg', 'gotham.svg', face('#5d3a9b', skin='#f0c8a0', hair='#2b1d14', style='short', beard='stubble', shirt='#1d1d1d', mouth='smirk'))
save('mgXpcH_bWcY', 'hikaru_blind.svg', face('#262421', skin='#e7bf98', hair='#141414', style='short', blind=True, shirt='#c0392b', mouth='smirk'))
save('xjEz7bCQxho', 'tony.svg', face('#c2185b', skin='#e8bb92', hair='#1e1410', style='quiff', beard='goatee', glasses=True, shirt='#6a1b9a'))
save('iUUoeJL1FvY', 'pjs.svg', face('#1565c0', skin='#f2cfaa', hair='#6d4c2f', style='short', beard='full', shirt='#263238', mouth='smile'))
save('mf238p7c3bc', 'twoniche.svg', face('#8e24aa', skin='#d9a77c', hair='#111', style='curly', shirt='#f06292', mouth='smile', glasses=True))
save('s-BcakLUV4A', 'fih.svg', av('#90a4ae', '<ellipse cx="30" cy="36" rx="20" ry="13" fill="#ff9e57"/><path d="M48 36l12-9v18z" fill="#ff9e57"/><path d="M16 26l3-9 6 7M30 23l5-8 3 9" fill="#ff9e57"/><circle cx="21" cy="33" r="3.5" fill="#fff"/><circle cx="21" cy="33" r="1.8" fill="#111"/><path d="M14 40q4 2 7 0" stroke="#7a3d12" stroke-width="1.6" fill="none"/><path d="M12 36h-6M12 39l-6 2" stroke="#5d4037" stroke-width="1"/><circle cx="34" cy="38" r="2" fill="#e07b35"/><circle cx="40" cy="33" r="2" fill="#e07b35"/>'))
save('ePpFGTNs5sE', 'circular_bot.svg', av('#00897b', '<rect x="14" y="14" width="36" height="34" rx="9" fill="#cfd8dc"/><circle cx="25" cy="30" r="7" fill="#fff"/><circle cx="39" cy="30" r="7" fill="#fff"/><circle cx="25" cy="31" r="3.5" fill="#111"/><circle cx="39" cy="31" r="3.5" fill="#111"/><path d="M24 42h16" stroke="#455a64" stroke-width="2.4" stroke-linecap="round"/><circle cx="32" cy="9" r="3" fill="#ff4081"/><path d="M32 12v2" stroke="#cfd8dc" stroke-width="2"/>'))
save('qDkxrnZfeXw', 'anarchy_bot.svg', av('#ff4500', '<circle cx="32" cy="32" r="21" fill="#fff"/><path d="M20 46L32 14l12 32M24 36h16" stroke="#ff4500" stroke-width="5" fill="none" stroke-linejoin="round"/><circle cx="32" cy="32" r="21" fill="none" stroke="#111" stroke-width="2"/>'))
save('jXOg1Py4EoA', 'roblox.svg', av('#8fc6ee', '<rect x="18" y="12" width="28" height="26" rx="3" fill="#f5cd30"/><rect x="12" y="40" width="40" height="24" fill="#0d69ac"/><rect x="25" y="22" width="4" height="5" fill="#111"/><rect x="35" y="22" width="4" height="5" fill="#111"/><path d="M26 31q6 4 12 0" stroke="#111" stroke-width="2" fill="none"/>'))
save('tm24Uq9nlBc', 'roblox_lux.svg', av('#3d2c12', '<rect x="18" y="12" width="28" height="26" rx="3" fill="#e8b98f"/><rect x="12" y="40" width="40" height="24" fill="#2b2b2b"/><rect x="18" y="8" width="28" height="7" fill="#c9a227"/><rect x="25" y="22" width="4" height="5" fill="#111"/><rect x="35" y="22" width="4" height="5" fill="#111"/><path d="M28 32h8" stroke="#111" stroke-width="2"/><path d="M28 44l4 6 4-6" fill="#c9a227"/>'))
save('dKBSZUzVQ1E', 'vs_island.svg', av('#4f8f3a', '<ellipse cx="32" cy="44" rx="24" ry="8" fill="#7a5532"/><path d="M8 42c4-8 44-8 48 0" fill="#6abf4b"/><path d="M20 38c0-14 24-14 24 0z" fill="#ff7eb6"/><circle cx="27" cy="32" r="2.5" fill="#111"/><circle cx="37" cy="32" r="2.5" fill="#111"/><path d="M22 38q-2 8-5 6M28 38q0 8-2 8M36 38q0 8 2 8M42 38q2 8 5 6" stroke="#ff7eb6" stroke-width="3" fill="none"/>'))

# Martin-style opponent reused from group 1's original Martin (read-only reference): fnDkGF-EF44, rtoo4ojjxHU
# ---------------------------------------------------------------- Earth Day animals (dz81n87sILE)
ED = 'dz81n87sILE'
save(ED, 'dodo.svg', av('#81b64c', '<ellipse cx="30" cy="42" rx="18" ry="16" fill="#8d9aa6"/><circle cx="34" cy="24" r="12" fill="#a7b3bd"/><path d="M42 22c10 0 16 4 16 9-5 0-9-2-12-1-3 1-5 2-6-1z" fill="#f2c230"/><path d="M44 30c4 1 8 1 12 1" stroke="#c48f00" stroke-width="1.5" fill="none"/><circle cx="36" cy="21" r="2.6" fill="#111"/><path d="M14 40c-4-3-4-9 0-10 2 3 4 6 4 10z" fill="#fff"/>'))
save(ED, 'turtle.svg', av('#2e7d6b', '<ellipse cx="30" cy="40" rx="20" ry="13" fill="#5b8c3a"/><path d="M14 40c4-12 28-12 32 0" fill="#3f6b28"/><path d="M22 34l8-6 8 6-8 6z" fill="#7cb342" stroke="#2e4d1c"/><circle cx="51" cy="34" r="7" fill="#9ccc65"/><circle cx="53" cy="32" r="1.6" fill="#111"/><rect x="40" y="12" width="10" height="12" fill="#fafafa" stroke="#333"/><path d="M40 12v-3h2.5v2h2v-2h2v2h2v-2H50v3" fill="#fafafa" stroke="#333"/>'))
save(ED, 'rhino.svg', av('#a1887f', '<ellipse cx="34" cy="38" rx="20" ry="15" fill="#90a4ae"/><path d="M18 36l-10-14 14 6z" fill="#eceff1"/><path d="M22 28l-4-8 7 5z" fill="#eceff1"/><circle cx="30" cy="32" r="2.4" fill="#111"/><path d="M44 24l4-8 3 9z" fill="#90a4ae"/><path d="M22 44q6 3 12 0" stroke="#546e7a" stroke-width="2" fill="none"/>'))
save(ED, 'snow_leopard.svg', av('#90caf9', '<ellipse cx="32" cy="36" rx="18" ry="17" fill="#f5f5f5"/><path d="M16 24l2-10 8 8zM48 24l-2-10-8 8z" fill="#f5f5f5"/>' + ''.join(f'<circle cx="{x}" cy="{y}" r="2.2" fill="none" stroke="#555" stroke-width="1.4"/>' for x, y in [(22, 28), (42, 28), (20, 42), (44, 42), (32, 22)]) + '<ellipse cx="25" cy="34" rx="3" ry="2.4" fill="#7cb342"/><ellipse cx="39" cy="34" rx="3" ry="2.4" fill="#7cb342"/><path d="M29 41l3 3 3-3z" fill="#f48fb1"/>'))
save(ED, 'mammoth.svg', av('#5d4037', '<ellipse cx="32" cy="30" rx="20" ry="17" fill="#8d6e63"/><path d="M26 38c-4 8-2 20 4 20" stroke="#8d6e63" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M20 40c-6 6-6 14 2 16M44 40c6 6 6 14-2 16" stroke="#f5f0e1" stroke-width="3.5" fill="none" stroke-linecap="round"/><circle cx="24" cy="28" r="2.4" fill="#111"/><circle cx="40" cy="28" r="2.4" fill="#111"/><path d="M14 22c4-8 32-8 36 0" stroke="#6d4c41" stroke-width="4" fill="none"/>'))
# ---------------------------------------------------------------- Christmas bots (wMdAOirSvQQ)
XM = 'wMdAOirSvQQ'
save(XM, 'yeti.svg', av('#b3e5fc', '<ellipse cx="32" cy="36" rx="20" ry="20" fill="#fafafa"/><ellipse cx="32" cy="36" rx="12" ry="11" fill="#90a4ae"/><circle cx="27" cy="33" r="2.2" fill="#111"/><circle cx="37" cy="33" r="2.2" fill="#111"/><path d="M27 41q5 3 10 0" stroke="#111" stroke-width="1.8" fill="none"/>' + mini('P', 46, 38, 16, '#fafafa', '#333')))
save(XM, 'gingerbread.svg', av('#c62828', '<circle cx="32" cy="22" r="11" fill="#c47a3a"/><path d="M16 34h32v6H40v16h-6l-2-8-2 8h-6V40h-8z" fill="#c47a3a"/><circle cx="28" cy="21" r="1.8" fill="#fff"/><circle cx="36" cy="21" r="1.8" fill="#fff"/><path d="M28 26q4 3 8 0" stroke="#fff" stroke-width="1.6" fill="none"/><circle cx="32" cy="40" r="1.6" fill="#e53935"/><circle cx="32" cy="46" r="1.6" fill="#43a047"/>'))
save(XM, 'santa.svg', face('#2e7d32', skin='#f3c9a3', hair='#fafafa', style='bald', beard='full', shirt='#c62828', extra='<path d="M16 22c2-10 30-12 34 0z" fill="#c62828"/><rect x="15" y="20" width="35" height="5" rx="2.5" fill="#fafafa"/><circle cx="50" cy="14" r="4" fill="#fafafa"/>'))
save(XM, 'holly.svg', face('#ad1457', skin='#f4cfb0', hair='#8d3b1e', style='long', shirt='#2e7d32', extra='<circle cx="44" cy="16" r="2.5" fill="#e53935"/><circle cx="47" cy="19" r="2.5" fill="#e53935"/><path d="M40 18l-6-3 4 6zM50 22l4-5-6 1z" fill="#2e7d32"/>'))
save(XM, 'penguin.svg', av('#4fc3f7', '<ellipse cx="32" cy="38" rx="18" ry="22" fill="#263238"/><ellipse cx="32" cy="42" rx="12" ry="16" fill="#fafafa"/><path d="M22 26l7 4M42 26l-7 4" stroke="#fafafa" stroke-width="2.5"/><circle cx="26" cy="31" r="2" fill="#111"/><circle cx="38" cy="31" r="2" fill="#111"/><path d="M28 35h8l-4 4z" fill="#ffa000"/>'))
save(XM, 'evil_santa.svg', face('#1b1b1b', skin='#e8b48f', hair='#e0e0e0', style='bald', beard='full', shirt='#7f0000', mouth='smirk', extra='<path d="M16 22c2-10 30-12 34 0z" fill="#7f0000"/><rect x="15" y="20" width="35" height="5" rx="2.5" fill="#e0e0e0"/><path d="M21 26l8 3M43 26l-8 3" stroke="#111" stroke-width="2.4"/><circle cx="26" cy="31" r="1.4" fill="#e53935"/><circle cx="38" cy="31" r="1.4" fill="#e53935"/>'))
# ---------------------------------------------------------------- Advanced bots (tfPyy36nwc4)
AB = 'tfPyy36nwc4'
for n, kw in [('wendy', dict(bg='#ef6c00', skin='#f3cfb0', hair='#f2c14e', style='long', shirt='#7b1fa2')),
              ('pablo', dict(bg='#2e7d32', skin='#d9a77c', hair='#2b1d14', style='short', beard='moustache', shirt='#f9a825')),
              ('arthur', dict(bg='#455a64', skin='#f1c9a0', hair='#9e9e9e', style='bald', beard='full', glasses=True, shirt='#5d4037')),
              ('lorenzo', dict(bg='#c62828', skin='#e8bb92', hair='#3e2723', style='quiff', shirt='#1565c0')),
              ('miguel', dict(bg='#6a1b9a', skin='#c98d5e', hair='#111', style='short', beard='goatee', shirt='#00897b')),
              ('lee', dict(bg='#00838f', skin='#f0cfa5', hair='#111', style='bun', glasses=True, shirt='#e91e63')),
              ('manuel', dict(bg='#1a237e', skin='#d4a073', hair='#424242', style='short', beard='stubble', shirt='#212121', mouth='smirk'))]:
    bg = kw.pop('bg'); save(AB, n + '.svg', face(bg, **kw))
# ---------------------------------------------------------------- video-game opponents
save('dztzDlPfqSI', 'passant_ai.svg', av('#1f3b3b', mini('N', 6, 6, 52, '#1c1c1c', '#000') + '<circle cx="31" cy="21" r="3" fill="#ff1744"/><circle cx="31" cy="21" r="7" fill="#ff1744" opacity=".25"/>'))
TROLL = 'hv_NHWqysZE'
save(TROLL, 'troll.svg', av('#16220f', '<path d="M14 60c0-14 6-22 18-22s18 8 18 22z" fill="#111" stroke="#fff" stroke-width="2"/><ellipse cx="32" cy="28" rx="15" ry="14" fill="#111" stroke="#fff" stroke-width="2"/><path d="M19 20l-5-10 9 6M45 20l5-10-9 6" fill="#111" stroke="#fff" stroke-width="2"/><ellipse cx="32" cy="33" rx="6" ry="4" fill="#111" stroke="#fff" stroke-width="1.6"/><circle cx="30" cy="33" r="1" fill="#fff"/><circle cx="34" cy="33" r="1" fill="#fff"/><circle cx="26" cy="25" r="2" fill="#c6ff00"/><circle cx="38" cy="25" r="2" fill="#c6ff00"/><path d="M26 50l6-5 6 5" stroke="#fff" stroke-width="2" fill="none"/>'))
save('pzxXxIsKRRo', 'white_king.svg', av('#968aba', '<rect x="14" y="30" width="36" height="28" rx="3" fill="#6d5a96"/><rect x="18" y="12" width="28" height="22" rx="3" fill="#6d5a96"/>' + mini('K', 14, 10, 36, '#f6eac6', '#2b2340')))
save('spJibM5qaNQ', 'joker.svg', av('#2a1f3d', '<ellipse cx="32" cy="36" rx="15" ry="17" fill="#f3f0e8"/><path d="M14 28l4-16 14 10 14-10 4 16z" fill="#7b1fa2"/><path d="M14 28l4-16 14 10z" fill="#43a047"/><circle cx="18" cy="12" r="3" fill="#fdd835"/><circle cx="46" cy="12" r="3" fill="#fdd835"/><path d="M22 33l6 2M42 33l-6 2" stroke="#111" stroke-width="2.4"/><path d="M22 42q10 10 20 0" stroke="#c62828" stroke-width="3" fill="none"/><circle cx="26" cy="37" r="1.6" fill="#c62828"/><circle cx="38" cy="37" r="1.6" fill="#c62828"/>'))
save('zP9TzlgA-W0', 'skull.svg', av('#36355b', '<path d="M14 30c0-12 8-18 18-18s18 6 18 18c0 6-3 9-6 11v7H20v-7c-3-2-6-5-6-11z" fill="#eeeae0"/><circle cx="25" cy="31" r="5" fill="#36355b"/><circle cx="39" cy="31" r="5" fill="#36355b"/><circle cx="25" cy="31" r="1.6" fill="#ff4081"/><circle cx="39" cy="31" r="1.6" fill="#ff4081"/><path d="M30 39l2-4 2 4zM24 48v-5M30 48v-5M36 48v-5M40 48v-5" stroke="#36355b" stroke-width="1.6" fill="#36355b"/><path d="M12 20l-4-10 10 6M52 20l4-10-10 6" fill="#c62828"/>'))
save('rf2HSTXTehE', 'ouroboros_queen.svg', av('#323f55', '<circle cx="32" cy="32" r="22" fill="none" stroke="#2e7d32" stroke-width="5"/><path d="M50 22l6-2-3 6" fill="#2e7d32"/><ellipse cx="32" cy="34" rx="10" ry="12" fill="#f3d6c2"/><path d="M20 22l4 6 4-8 4 8 4-8 4 8 4-6-2 8H22z" fill="#c62828" stroke="#fafafa"/><circle cx="28" cy="33" r="1.6" fill="#111"/><circle cx="36" cy="33" r="1.6" fill="#111"/><path d="M29 40h6" stroke="#8e1b1b" stroke-width="1.6"/><path d="M22 46h20v10H22z" fill="#fafafa" stroke="#c62828"/>'))
save('qqvbb2r2k5I', 'deep_blu.svg', av('#b23a48', '<rect x="10" y="12" width="44" height="32" rx="3" fill="#2b2f3a" stroke="#9aa" stroke-width="2"/><rect x="14" y="16" width="36" height="24" fill="#0d47a1"/><path d="M20 24l8 3M44 24l-8 3" stroke="#ff5252" stroke-width="2.6"/><rect x="22" y="28" width="6" height="4" fill="#ff5252"/><rect x="36" y="28" width="6" height="4" fill="#ff5252"/><path d="M26 36h12" stroke="#ff5252" stroke-width="2"/><rect x="20" y="46" width="24" height="5" fill="#2b2f3a"/><rect x="14" y="51" width="36" height="6" fill="#3d4250"/><text x="32" y="62" font-family="monospace" font-size="5" fill="#fff" text-anchor="middle">DEEP BLU</text>'))
save('zxRM5dD5b7w', 'knightmare.svg', av('#42ba06', mini('N', 8, 8, 48, '#c62828', '#3b0000') + '<circle cx="32" cy="22" r="2.2" fill="#ffeb3b"/>'))
save('sGXmiyvZDE4', 'marble_knight.svg', av('#3a3d4a', '<rect x="0" y="0" width="64" height="64" fill="url(#g)"/><defs><radialGradient id="g"><stop offset="0" stop-color="#5e4b8b"/><stop offset="1" stop-color="#3a3d4a"/></radialGradient></defs>' + mini('N', 10, 12, 44, '#1d1d24', '#000') + '<path d="M18 10h28" stroke="#c62828" stroke-width="4"/><path d="M18 10h20" stroke="#e53935" stroke-width="4"/>'))
save('xlErokL2-4c', 'eldritch_king.svg', av('#b9d6e8', mini('K', 10, 8, 44, '#1b1b22', '#000') + '<path d="M32 30l7 4v8l-7 4-7-4v-8z" fill="none" stroke="#b388ff" stroke-width="2"/><path d="M32 34l3.5 2v4L32 42l-3.5-2v-4z" fill="#b388ff"/>'))
save('oAoik9Dj2qQ', 'red_king.svg', av('#c4a16d', '<rect x="14" y="46" width="36" height="10" rx="2" fill="#4caf50" stroke="#1b5e20" stroke-width="2"/>' + mini('K', 12, 6, 40, '#e53935', '#111')))
save('fqfCh3CsTJk', 'practice_king.svg', av('#0b0b1e', '<circle cx="32" cy="32" r="13" fill="#000" stroke="#ff9800" stroke-width="3"/><ellipse cx="32" cy="32" rx="26" ry="6" fill="none" stroke="#ffb74d" stroke-width="2" opacity=".8"/>' + ''.join(f'<circle cx="{x}" cy="{y}" r="1" fill="#fff"/>' for x, y in [(8, 10), (54, 14), (12, 52), (50, 50), (40, 6), (24, 58)]) + mini('K', 21, 18, 22, '#fafafa', '#222')))
save('qSwTtgUWqUw', 'timeline.svg', av('#b0bec5', '<rect x="8" y="14" width="18" height="18" fill="#f6daad" stroke="#d3b07e"/><rect x="38" y="14" width="18" height="18" fill="#f6daad" stroke="#d3b07e"/><rect x="38" y="38" width="18" height="18" fill="#f6daad" stroke="#d3b07e"/><path d="M26 23h10M47 32v4" stroke="#7e57c2" stroke-width="3"/><path d="M34 19l4 4-4 4M43 34l4 4 4-4" fill="none" stroke="#7e57c2" stroke-width="3"/>'))

# ================================================================= custom pieces
# Passant pieces (shared by the five Passant modes, stored under dztzDlPfqSI/)
PS = 'dztzDlPfqSI'
for c in 'wb':
    f, s = COL[c]
    save(PS, f'empress_{c}.svg', compound('R', 'N', c, '#7e57c2'))
    save(PS, f'amazon_{c}.svg', compound('Q', 'N', c, '#7e57c2'))
    save(PS, f'courtisan_{c}.svg', piece_svg('B', f, s, '<path d="M15 18c3-3 12-3 15 0" stroke="#e91e63" stroke-width="2" fill="none"/><circle cx="22.5" cy="24" r="2.5" fill="#e91e63"/>'))
    save(PS, f'man_{c}.svg', piece_svg('P', f, s, '<path d="M17 25h11" stroke="' + s + '" stroke-width="1.5"/><path d="M19 9.5c2-2 5-2 7 0" stroke="#8d6e63" stroke-width="2.5" fill="none"/>'))
    save(PS, f'dragon_king_{c}.svg', piece_svg('K', '#c62828' if c == 'b' else '#ffcdd2', s, '<path d="M8 26l-5-6 7 1zM37 26l5-6-7 1z" fill="#c62828" stroke="' + s + '" stroke-width="1"/><circle cx="19" cy="27" r="1.4" fill="#ffeb3b"/><circle cx="26" cy="27" r="1.4" fill="#ffeb3b"/>'))
    rb = '<defs><linearGradient id="rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5252"/><stop offset=".25" stop-color="#ffd740"/><stop offset=".5" stop-color="#69f0ae"/><stop offset=".75" stop-color="#40c4ff"/><stop offset="1" stop-color="#e040fb"/></linearGradient></defs>'
    save(PS, f'rainbow_pawn_{c}.svg', piece_svg('P', 'url(#rb)', s, under=rb))
save(PS, 'coin.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><circle cx="22.5" cy="22.5" r="16" fill="#f5c518" stroke="#8a6a00" stroke-width="2.5"/><text x="22.5" y="29" font-family="sans-serif" font-weight="700" font-size="17" fill="#8a6a00" text-anchor="middle">$</text></svg>')

# King of the Bridge 1-bit pixel set (shared by hv_NHWqysZE, puKYAUl9x9s, ulE3YPZI9Sc; stored under hv_NHWqysZE/)
PIX = {
 'P': ['.........', '...xxx...', '...xxx...', '....x....', '...xxx...', '...xxx...', '..xxxxx..', '.xxxxxxx.', '.........'],
 'N': ['.........', '...xx.x..', '..xxxxx..', '.xxx.xxx.', '.xxxxxxx.', '....xxx..', '...xxxx..', '.xxxxxxx.', '.........'],
 'B': ['....x....', '...xxx...', '..xx.xx..', '..x.xxx..', '..xxxxx..', '...xxx...', '..xxxxx..', '.xxxxxxx.', '.........'],
 'R': ['.........', '.x.x.x.x.', '.xxxxxxx.', '..xxxxx..', '..xxxxx..', '..xxxxx..', '.xxxxxxx.', '.xxxxxxx.', '.........'],
 'Q': ['.x..x..x.', '.x.xxx.x.', '.xxxxxxx.', '..xxxxx..', '...xxx...', '...xxx...', '..xxxxx..', '.xxxxxxx.', '.........'],
 'K': ['....x....', '...xxx...', '....x....', '.xxxxxxx.', '.xx.x.xx.', '..xxxxx..', '..xxxxx..', '.xxxxxxx.', '.........'],
}
def pixel_piece(rows, fill, edge):
    n = len(rows); px = 45 / (n + 1); o = px / 2; r = ''
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch != 'x': continue
            r += f'<rect x="{o + x * px - .6:.2f}" y="{o + y * px - .6:.2f}" width="{px + 1.2:.2f}" height="{px + 1.2:.2f}" fill="{edge}"/>'
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch == 'x': r += f'<rect x="{o + x * px + .6:.2f}" y="{o + y * px + .6:.2f}" width="{px - 1.2 + .4:.2f}" height="{px - 1.2 + .4:.2f}" fill="{fill}"/>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" shape-rendering="crispEdges">{r}</svg>'
for t, rows in PIX.items():
    save(TROLL, f'px_{t}_w.svg', pixel_piece(rows, '#e8ecd0', '#1c2414'))
    save(TROLL, f'px_{t}_b.svg', pixel_piece(rows, '#1c2414', '#c6d2a0'))
save(TROLL, 'swamp.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges"><rect width="160" height="90" fill="#16220f"/><rect y="60" width="160" height="30" fill="#0e1809"/><rect y="44" width="160" height="6" fill="#4f5540"/><rect y="50" width="160" height="2" fill="#2b3320"/>' + ''.join(f'<rect x="{x}" y="38" width="3" height="20" fill="#4f5540"/>' for x in range(4, 160, 20)) + ''.join(f'<rect x="{x}" y="{y}" width="2" height="2" fill="#8a8b72"/>' for x, y in [(10, 8), (40, 14), (70, 6), (110, 12), (140, 9), (25, 22), (95, 25)]) + ''.join(f'<rect x="{x}" y="{70 + (x % 7)}" width="6" height="1" fill="#2b3320"/>' for x in range(0, 160, 13)) + '</svg>')

# Shotgun King: black king with a shotgun
save('pzxXxIsKRRo', 'shotgun_king.svg', piece_svg('K', '#2b2340', '#000', '<path d="M27 26l15-6 1.6 3-15 6z" fill="#6d4c41" stroke="#000" stroke-width="1"/><path d="M32 23.8l11-4.4" stroke="#9e9e9e" stroke-width="1.6"/>'))
save('pzxXxIsKRRo', 'muzzle.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 4l6 18 18-6-12 14 16 10-20 0 4 18-12-14-12 14 4-18H4l16-10L8 16l18 6z" fill="#ffd54f" stroke="#ff6f00" stroke-width="2"/></svg>')
# Anarchy: knook, anti-queen, underage pawn
for c in 'wb':
    f, s = COL[c]
    save('qDkxrnZfeXw', f'knook_{c}.svg', compound('R', 'N', c, '#ff4500'))
    save('qDkxrnZfeXw', f'antiqueen_{c}.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g transform="rotate(180 22.5 22.5)"><path d="' + SIL['Q'] + f'" fill="{f}" stroke="{s}" stroke-width="1.5" stroke-linejoin="round"/></g></svg>')
    save('qDkxrnZfeXw', f'baby_pawn_{c}.svg', piece_svg('P', f, s, '<circle cx="21" cy="12.5" r=".9" fill="#111"/><circle cx="24.5" cy="12.5" r=".9" fill="#111"/><circle cx="22.8" cy="15.2" r="1.1" fill="#f48fb1"/><path d="M22.5 7.8c1.5-1.8 3-1 2 .6" stroke="#8d6e63" stroke-width="1" fill="none"/>'))
# Chaturaji boat (white base; 4-player armies are tinted by the app like every other piece)
save('mZUViBNWt6E', 'boat_w.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M7 30h31l-5 8H12z" fill="#fafafa" stroke="#222" stroke-width="1.5" stroke-linejoin="round"/><path d="M22 7v22" stroke="#222" stroke-width="1.8"/><path d="M23.5 9l10 17h-10z" fill="#fafafa" stroke="#222" stroke-width="1.4" stroke-linejoin="round"/><path d="M20.5 12l-8 14h8z" fill="#fafafa" stroke="#222" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 33h27" stroke="#222" stroke-width="1"/></svg>')
save('mZUViBNWt6E', 'boat_b.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M7 30h31l-5 8H12z" fill="#3a3a3a" stroke="#111" stroke-width="1.5"/><path d="M22 7v22" stroke="#111" stroke-width="1.8"/><path d="M23.5 9l10 17h-10zM20.5 12l-8 14h8z" fill="#3a3a3a" stroke="#111" stroke-width="1.4"/></svg>')
# Pac-Man pellet and ghost
save('sO-lD2On610', 'pellet.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><circle cx="22.5" cy="22.5" r="7" fill="#ffe0b2" stroke="#ff9800" stroke-width="2"/></svg>')
for k, colr in [('ghost_w', '#26c6da'), ('ghost_b', '#ef5350')]:
    save('sO-lD2On610', k + '.svg', f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M9 38V21c0-8 6-13 13.5-13S36 13 36 21v17l-4.5-4-4.5 4-4.5-4-4.5 4-4.5-4z" fill="{colr}" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="18" cy="21" rx="3.5" ry="4.5" fill="#fff"/><ellipse cx="28" cy="21" rx="3.5" ry="4.5" fill="#fff"/><circle cx="19" cy="22" r="2" fill="#1a237e"/><circle cx="29" cy="22" r="2" fill="#1a237e"/></svg>')
save('sO-lD2On610', 'pacman.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#111"/><path d="M32 32L54 20A24 24 0 1 0 54 44z" fill="#ffd600"/><circle cx="30" cy="20" r="3" fill="#111"/></svg>')
# Stone wall (Labyrinth 82, Cornered Kings)
stone = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><rect width="45" height="45" fill="#6f7472"/>' + ''.join(f'<rect x="{x}" y="{y}" width="{w}" height="10" rx="2" fill="{c}" stroke="#4a4e4d" stroke-width="1.2"/>' for x, y, w, c in [(1, 1, 20, '#9aa09d'), (23, 1, 21, '#8c928f'), (1, 12, 12, '#868c89'), (15, 12, 18, '#a3a8a5'), (35, 12, 9, '#8f9592'), (1, 23, 22, '#979d9a'), (25, 23, 19, '#888e8b'), (1, 34, 14, '#a0a5a2'), (17, 34, 27, '#8d9390')]) + '</svg>'
save('xg_djfCrRes', 'stone_wall.svg', stone)
# Pawnbarian hero (horned helmet) and monsters
save('zP9TzlgA-W0', 'pawnbarian.svg', piece_svg('P', '#fafafa', '#222', '<path d="M17.5 13a5 5 0 0 1 10 0z" fill="#9e9e9e" stroke="#222" stroke-width="1"/><path d="M17.5 12c-3-1-4-4-3.5-7 1.5 2 2.5 3.5 4.5 4.5M27.5 12c3-1 4-4 3.5-7-1.5 2-2.5 3.5-4.5 4.5" fill="#f5f0e1" stroke="#222" stroke-width="1"/>'))
save('zP9TzlgA-W0', 'skull_piece.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M10 22c0-8 5.5-13 12.5-13S35 14 35 22c0 4-2 6.5-4.5 8v5h-16v-5C12 28.5 10 26 10 22z" fill="#eeeae0" stroke="#222" stroke-width="1.5"/><circle cx="18" cy="22" r="3.4" fill="#36355b"/><circle cx="27" cy="22" r="3.4" fill="#36355b"/><path d="M21 29l1.5-3 1.5 3z" fill="#36355b"/><path d="M18 35v-3M22.5 35v-3M27 35v-3" stroke="#36355b" stroke-width="1.4"/></svg>')
save('zP9TzlgA-W0', 'demon_piece.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M12 37c0-9 4-15 10.5-15S33 28 33 37z" fill="#b71c1c" stroke="#222" stroke-width="1.5"/><circle cx="22.5" cy="18" r="8" fill="#d32f2f" stroke="#222" stroke-width="1.5"/><path d="M15.5 13l-4-7 7 4M29.5 13l4-7-7 4" fill="#f5f0e1" stroke="#222" stroke-width="1"/><circle cx="19.5" cy="18" r="1.5" fill="#ffeb3b"/><circle cx="25.5" cy="18" r="1.5" fill="#ffeb3b"/></svg>')
# Chess Survivors joker hero
save('spJibM5qaNQ', 'joker_hero.svg', piece_svg('P', '#f3f0e8', '#222', '<path d="M16 12l2.5-7 4 4.5 4-4.5 2.5 7z" fill="#7b1fa2" stroke="#222" stroke-width="1"/><circle cx="18.5" cy="5" r="1.6" fill="#fdd835"/><circle cx="26.5" cy="5" r="1.6" fill="#fdd835"/><path d="M20 15q2.5 2 5 0" stroke="#c62828" stroke-width="1.2" fill="none"/>'))
# Knightmare rock
save('zxRM5dD5b7w', 'rock.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M8 36l3-13 8-9 10 1 8 8 2 13z" fill="#8d8d8d" stroke="#3e3e3e" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 24l6 3 7-6M24 27l3 8" stroke="#5f5f5f" stroke-width="1.2" fill="none"/></svg>')
# Beyond the Board: Eldritch king piece
save('xlErokL2-4c', 'eldritch_piece.svg', piece_svg('K', '#1b1b22', '#000', '<path d="M22.5 22l5 2.9v5.8l-5 2.9-5-2.9v-5.8z" fill="none" stroke="#b388ff" stroke-width="1.6"/><circle cx="22.5" cy="27.8" r="1.8" fill="#b388ff"/>'))
# Chessformer / gravity puzzles: red king target, key, lock block, blue player tint is CSS
for mid in ['oAoik9Dj2qQ']:
    save(mid, 'red_king_piece.svg', piece_svg('K', '#e53935', '#111', sw=2))
    save(mid, 'key.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><rect x="4" y="4" width="37" height="37" rx="4" fill="#fdd835" stroke="#8a6a00" stroke-width="1.5"/><circle cx="16" cy="22.5" r="6.5" fill="none" stroke="#111" stroke-width="3.5"/><path d="M22 22.5h14M31 22.5v5M35 22.5v4" stroke="#111" stroke-width="3.5"/></svg>')
    save(mid, 'lock.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><rect x="2" y="2" width="41" height="41" rx="7" fill="#8e44ad" stroke="#4a148c" stroke-width="2"/><path d="M22.5 9l13.5 13.5-13.5 13.5L9 22.5z" fill="#ab47bc" stroke="#4a148c" stroke-width="1.5"/><rect x="17" y="21" width="11" height="9" rx="1.5" fill="#fdd835"/><path d="M19 21v-3a3.5 3.5 0 0 1 7 0v3" stroke="#fdd835" stroke-width="2" fill="none"/></svg>')
# Who Takes the Crown: pawn climber + crown
save('zDFsnRE_Gig', 'climber.svg', piece_svg('P', '#fafafa', '#222', '<circle cx="21" cy="13" r="1" fill="#111"/><circle cx="24.5" cy="13" r="1" fill="#111"/><path d="M14 30l-4 4M31 30l4 4" stroke="#222" stroke-width="2"/>'))
save('zDFsnRE_Gig', 'crown.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="10" fill="#4e2739"/><path d="M12 46l-2-24 12 10 10-16 10 16 12-10-2 24z" fill="#fdd835" stroke="#8a6a00" stroke-width="2.5" stroke-linejoin="round"/><circle cx="32" cy="36" r="4" fill="#e53935"/><rect x="12" y="46" width="40" height="6" fill="#f9a825" stroke="#8a6a00" stroke-width="2"/></svg>')
# compound fairy pieces (XXL, Seirawan, Gothic): base silhouette + small badge silhouette
for mid, items in [('n-sYPJVwaXs', [('chancellor', 'R', 'N'), ('general', 'K', 'N'), ('archbishop', 'B', 'N'), ('amazon', 'Q', 'N')]),
                   ('hk85bBLSi7Q', [('hawk', 'B', 'N'), ('elephant', 'R', 'N')]),
                   ('yXE14E0QKNI', [('chancellor', 'R', 'N'), ('archbishop', 'B', 'N')])]:
    for name, a, b in items:
        for c in 'wb': save(mid, f'{name}_{c}.svg', compound(a, b, c))
for c in 'wb':
    f, s = COL[c]
    save('n-sYPJVwaXs', f'camel_{c}.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M9 39.5h27l-1-3H10zM12 36.5c0-6 2-9 4-11-2-1-4-3-4-6 0-3 2-5 5-5 2 0 3 1 4 2 1-3 3-5 6-5 4 0 6 4 6 8 0 2 2 4 2 7 0 4-2 6-3 10z" fill="' + f + '" stroke="' + s + '" stroke-width="1.5" stroke-linejoin="round"/><path d="M16 19c3-2 5-2 7 0" stroke="' + s + '" stroke-width="1.2" fill="none"/><circle cx="15" cy="18" r="1" fill="' + s + '"/></svg>')
    save('hxwi9DwDUKU', f'elephant_{c}.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M10 39.5h25l-1-3H11zM12 36.5c-1-5 0-9 2-12-3-2-4-6-2-9 2-3 6-4 10-3 2-2 6-2 9 0 4 3 4 9 1 12 2 3 3 7 2 12z" fill="' + f + '" stroke="' + s + '" stroke-width="1.5" stroke-linejoin="round"/><path d="M28 24c2 4 1 9-2 11" stroke="' + s + '" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="26" cy="18" r="1.4" fill="' + s + '"/><path d="M31 25l5 3" stroke="#f5f0e1" stroke-width="2"/></svg>')
    save('hxwi9DwDUKU', f'counselor_{c}.svg', piece_svg('Q', f, s, '<path d="M14 30h17" stroke="' + s + '" stroke-width="1.2"/><circle cx="22.5" cy="24" r="2.2" fill="#c89b3c"/>'))
    save('qfHZlae8XVU', f'bob_{c}.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path d="M10 39.5h25l-2-4H12zM13 35.5h19l-2-14h-15z" fill="' + f + '" stroke="' + s + '" stroke-width="1.5" stroke-linejoin="round"/><path d="M22.5 7v13M16 13.5h13" stroke="' + s + '" stroke-width="3.5" stroke-linecap="round"/><path d="M22.5 7v13M16 13.5h13" stroke="' + f + '" stroke-width="1.5" stroke-linecap="round"/></svg>')
save('qfHZlae8XVU', 'brick.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><rect width="45" height="45" fill="#7a3b2a"/>' + ''.join(f'<rect x="{x}" y="{y}" width="{w}" height="9" fill="#b5523b" stroke="#5a2a1c" stroke-width="1"/>' for x, y, w in [(1, 2, 20), (23, 2, 21), (1, 13, 10), (13, 13, 20), (35, 13, 9), (1, 24, 20), (23, 24, 21), (1, 35, 10), (13, 35, 20), (35, 35, 9)]) + '</svg>')
# Villagers already have art; Gambonanza phantom copy
for c in 'wb':
    save('qqvbb2r2k5I', f'phantom_{c}.svg', piece_svg('P', 'rgba(200,220,255,.55)' if c == 'w' else 'rgba(60,40,90,.55)', '#7c4dff', sw=1.5))
# Infinite chess cosmic backdrop
save('fqfCh3CsTJk', 'blackhole.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="h" cx=".5" cy=".45" r=".6"><stop offset=".12" stop-color="#000"/><stop offset=".18" stop-color="#ffb74d"/><stop offset=".3" stop-color="#6a1b9a" stop-opacity=".7"/><stop offset="1" stop-color="#05050f"/></radialGradient></defs><rect width="200" height="120" fill="url(#h)"/>' + ''.join(f'<circle cx="{(i * 37) % 200}" cy="{(i * 53) % 120}" r="{0.4 + (i % 3) * 0.3}" fill="#fff" opacity=".8"/>' for i in range(60)) + '</svg>')
print(len(OUT), 'files')
