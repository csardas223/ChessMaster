"""Duolingo chess pieces for the Duolingo Chess mode (eCzxOgc4fTY), vector-traced from the owner's screenshot of Duolingo's
real board (research/frames/sprites/eCzxOgc4fTY_duo_pieces_ref.png, 769x794, 96px squares, board at y=6).
Each 96px cell is upscaled 8x, every pixel is snapped to Duolingo's flat palette (white: outline #9bb0bb, body #d8e4ec,
highlight #ffffff; black: body #616161, dark facet #3d3d3d, light facet #888888; floor shadow = black at 10%), and each colour
layer is traced to smooth Bezier paths with potrace. The SVG keeps the screenshot's scale (piece + shadow fill the square
like Duolingo's), so it is drawn at 100% of the square. Needs: pip install potracer numpy scipy pillow.
Run: python3 tools/duo_pieces.py assets/modes/eCzxOgc4fTY/pieces"""
import numpy as np, potrace
from PIL import Image
from scipy import ndimage
import os
REF=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','research','frames','sprites','eCzxOgc4fTY_duo_pieces_ref.png')
im=Image.open(REF).convert('RGB'); OY=6; S=96; UP=8
SRC={'bR':(0,0),'bN':(1,0),'bB':(2,0),'bQ':(3,0),'bK':(4,0),'bP':(0,1),
     'wR':(7,7),'wN':(1,7),'wB':(2,7),'wQ':(3,7),'wK':(4,7),'wP':(1,6)}
PAL={'w':['#9bb0bb','#d8e4ec','#ffffff'],'b':['#616161','#3d3d3d','#888888']}
SHA=0.10
hx=lambda h:np.array([int(h[i:i+2],16) for i in (1,3,5)],float)
def path_d(bm,sc):
    pl=potrace.Bitmap(~np.asarray(bm,bool)).trace(turdsize=20,turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY,alphamax=1.0,opticurve=True,opttolerance=0.2)
    f=lambda p:'%.1f %.1f'%(p.x*sc,p.y*sc) if hasattr(p,'x') else '%.1f %.1f'%(p[0]*sc,p[1]*sc)
    o=[]
    for c in pl:
        o.append('M'+f(c.start_point))
        for s in c.segments:
            o.append(('L'+f(s.c)+'L'+f(s.end_point)) if s.is_corner else ('C'+f(s.c1)+' '+f(s.c2)+' '+f(s.end_point)))
        o.append('Z')
    return ''.join(o)
def trace(name,fx,ry,out,size=None):
    x0=fx*S; y0=OY+ry*S
    crop=im.crop((x0+2,y0+2,x0+S-2,y0+S-2))  # skip square-edge lines
    bg=np.array(crop)[2,2].astype(float)
    n=crop.size[0]*UP
    big=np.array(crop.resize((n,n),Image.BICUBIC)).astype(float)
    pal=[bg,bg*(1-SHA)]+[hx(h) for h in PAL[name[0]]]
    P=np.array(pal)
    lab=np.argmin(((big[:,:,None,:]-P[None,None])**2).sum(-1),2)
    # bg-coloured pixels: exterior if connected to border, else interior (white highlight for white pieces)
    if name[0]=='w':
        isbg=(lab==0)|((lab==4)&(np.abs(bg-255).sum()<4))
    else: isbg=lab==0
    cc,_=ndimage.label(isbg)
    border=set(np.unique(np.r_[cc[0],cc[-1],cc[:,0],cc[:,-1]]))-{0}
    ext=np.isin(cc,list(border))
    lab=np.where(isbg&~ext,4 if name[0]=='w' else lab,lab)
    lab=np.where(ext,0,lab)
    piece=(lab>=2)
    # remove specks
    piece=ndimage.binary_opening(piece,iterations=2)
    piece=ndimage.binary_fill_holes(piece)
    shadow=piece|(lab==1)
    shadow=ndimage.binary_opening(shadow,iterations=3)
    sc=100.0/n
    # recentre/scale handled by viewBox: crop offset 2px of 96
    off=2*100/96.0; k=(S-4)/S
    g='<g transform="translate(%.3f %.3f) scale(%.4f)">'%(off,off,k)
    parts=[g,'<path d="%s" fill="#000" fill-opacity="%.2f"/>'%(path_d(shadow,sc),SHA)]
    cols=PAL[name[0]]
    parts.append('<path d="%s" fill="%s"/>'%(path_d(piece,sc),cols[0]))
    for i,c in enumerate(cols[1:]):
        m=(lab==3+i)&piece
        m=ndimage.binary_opening(m,iterations=1)
        d=path_d(m,sc)
        if d: parts.append('<path d="%s" fill="%s"/>'%(d,c))
    parts.append('</g>')
    svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'+''.join(parts)+'</svg>'
    open(out,'w').write(svg); return len(svg)
if __name__=='__main__':
    import sys,os
    od=sys.argv[1] if len(sys.argv)>1 else 'out'
    os.makedirs(od,exist_ok=True)
    for nm,(fx,ry) in SRC.items(): print(nm,trace(nm,fx,ry,os.path.join(od,nm+'.svg')))
