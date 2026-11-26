#!/usr/bin/env python3
"""art-audit-final: recut the dice-mode ROLL buttons with a clean anti-aliased circular alpha (the old cuts had a jagged
dark/green fringe). Source = research/frames/sprites/<id>_roll_button.png (video crop), same pixels, only the alpha changes."""
import sys
from PIL import Image, ImageDraw
import numpy as np
R='research/frames/sprites/'; A='assets/modes/'
FIX={'Cr3j7jf5xXk':(31.5,None)}   # button clipped at the left edge of that crop: centre from its gold ring (x 3-60)
for mid in sys.argv[1:]:
    im=Image.open(R+mid+'_roll_button.png').convert('RGB'); a=np.asarray(im).astype(int)
    r,g,b=a[...,0],a[...,1],a[...,2]
    bg=(g>r+4)&(g>=b)                       # table green around the button
    fg=~bg; ys,xs=np.nonzero(fg)
    # robust bbox: rows/cols where >30% of pixels are button
    rows=np.nonzero(fg.mean(1)>.3)[0]; cols=np.nonzero(fg.mean(0)>.3)[0]
    cy=(rows[0]+rows[-1]+1)/2; cx=(cols[0]+cols[-1]+1)/2; rad=min(rows[-1]-rows[0]+1,cols[-1]-cols[0]+1)/2-0.5
    if mid in FIX: cx=FIX[mid][0] or cx; cy=FIX[mid][1] or cy
    S=8; m=Image.new('L',(im.width*S,im.height*S),0)
    ImageDraw.Draw(m).ellipse([(cx-rad)*S,(cy-rad)*S,(cx+rad)*S,(cy+rad)*S],fill=255)
    m=m.resize(im.size,Image.LANCZOS)
    out=im.convert('RGBA'); out.putalpha(m)
    x0,y0=int(cx-rad-1),int(cy-rad-1); out=out.crop((x0,y0,x0+int(2*rad+3),y0+int(2*rad+3)))   # square, centred (outside the crop = transparent)
    out.save(A+mid+'/roll.png'); print(mid,im.size,'->',out.size,'c',cx,cy,'r',rad)
