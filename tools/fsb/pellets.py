import cairosvg
F='#5d93cf'; S='#1c3a5e'; H='#8cb8e6'; W=7
def svg(body): return f'<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><g stroke="{S}" stroke-width="{W}" stroke-linejoin="round" stroke-linecap="round">{body}</g></svg>'
rook=svg(f'''
<path fill="{F}" d="M176 432 h160 a14 14 0 0 0 14-14 v-14 a14 14 0 0 0-14-14 H176 a14 14 0 0 0-14 14 v14 a14 14 0 0 0 14 14z"/>
<path fill="{F}" d="M188 390 l10-60 h116 l10 60z"/>
<path fill="{F}" d="M178 330 q-4-30 6-62 h144 q10 32 6 62z"/>
<rect fill="{F}" x="160" y="132" width="192" height="138" rx="22"/>
<rect fill="{F}" x="122" y="168" width="44" height="58" rx="14"/>
<rect fill="{F}" x="346" y="168" width="44" height="58" rx="14"/>
<path fill="{F}" d="M222 132 q0-34 34-34 q34 0 34 34z"/>
<circle cx="256" cy="80" r="16" fill="{F}"/>
<circle cx="256" cy="198" r="34" fill="{F}" stroke-width="14"/>
<path fill="none" d="M178 270 h156 M180 330 h152" stroke-width="10"/>
<path fill="none" stroke="{H}" stroke-width="8" d="M178 150 h60 M200 352 h30 M182 410 h40"/>
''')
pawn=svg(f'''
<path fill="{F}" d="M170 434 h172 a14 14 0 0 0 14-14 v-12 a14 14 0 0 0-14-14 H170 a14 14 0 0 0-14 14 v12 a14 14 0 0 0 14 14z"/>
<path fill="{F}" d="M180 394 q22-46 44-80 h64 q22 34 44 80z"/>
<path fill="{F}" d="M124 284 q32-28 132-28 q100 0 132 28 q-32 30-132 30 q-100 0-132-30z"/>
<path fill="{F}" d="M164 258 q6-80 92-86 q86 6 92 86 q-40 12-92 12 q-52 0-92-12z"/>
<path fill="{F}" d="M206 176 q4-34 50-36 q46 2 50 36 q-24 10-50 10 q-26 0-50-10z"/>
<circle cx="256" cy="112" r="28" fill="{F}"/>
<path fill="none" stroke="{H}" stroke-width="8" d="M196 230 q12-34 44-44 M150 282 q40-14 90-16 M190 410 h40"/>
''')
for n,s in (('pellet_rook',rook),('pellet_pawn',pawn)):
    open(f'./{n}.svg','w').write(s)
    cairosvg.svg2png(bytestring=s.encode(),write_to=f'./new_{n}.png',output_width=512,output_height=512)
