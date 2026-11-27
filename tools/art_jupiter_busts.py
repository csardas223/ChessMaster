#!/usr/bin/env python3
"""Jupiter 2011 Chess (Mg2Upjjo2yg) astronaut sprites: video-style greyscale busts.
The in-game sprites in the video (research/ref/fin2-jupiter/thumbs/maxres1.jpg, maxres2.jpg, video/full_map_t0000_1440p.jpg)
are greyscale head-and-shoulders photos of Speed, Queso and Creek in white spacesuits with a dark collar ring. The faces are
cut from the video's thumbnail (maxresdefault.jpg) with rembg + traced outlines; where a neighbour hides part of a head
(Queso's collar over Creek's jaw) it is inpainted from that head's own pixels, and Creek's hair past the frame edge is a
short mirror of the hair inside it. The suit (padded collar ring with rivets, shoulders) is drawn here at 4x and downsampled.
usage: python3 tools/art_jupiter_busts.py [OUTDIR]   (default: assets/modes/Mg2Upjjo2yg/, writes speed/queso/creek.png 512 px)
"""
import sys
import numpy as np, cv2
from PIL import Image, ImageDraw
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R=os.path.join(ROOT,'research/ref/fin2-jupiter/thumbs/maxresdefault.jpg')
im=np.array(Image.open(R).convert('RGB'))
def person_mask():
    # rembg u2net_human_seg over the whole thumbnail (pip install rembg onnxruntime opencv-python-headless)
    from rembg import remove, new_session
    return np.array(remove(Image.fromarray(im), session=new_session('u2net_human_seg'), only_mask=True).convert('L'))
mask=person_mask()
PAD=80
big=cv2.copyMakeBorder(im,PAD,PAD,PAD,PAD,cv2.BORDER_REFLECT)          # reflect beyond the frame (Creek's right, Queso's top)
mbig=cv2.copyMakeBorder(mask,PAD,PAD,PAD,PAD,cv2.BORDER_REFLECT)
def poly(pts):
    m=Image.new('L',(big.shape[1],big.shape[0]),0); ImageDraw.Draw(m).polygon([(x+PAD,y+PAD) for x,y in pts],fill=255); return np.array(m)
H={
 'speed': dict(pts=[(395,250),(420,200),(470,160),(540,140),(600,148),(640,160),(668,195),(680,260),(686,340),(686,420),(678,480),(662,528),(640,565),(625,610),(620,660),(530,660),(520,610),(480,560),(450,470),(420,380),(380,330),(370,290)],
               foreign=[]),
 'queso': dict(pts=[(700,-30),(800,-48),(900,-50),(1000,-42),(1060,0),(1085,80),(1095,180),(1095,280),(1090,370),(1080,440),(1065,510),(1035,580),(990,635),(930,668),(875,676),(815,666),(760,630),(720,575),(695,500),(682,420),(678,330),(675,240),(680,140),(690,40)],
               foreign=[]),
 'creek': dict(pts=[(1112,225),(1140,192),(1190,172),(1250,172),(1280,185),(1296,215),(1302,265),(1298,330),(1290,390),(1278,445),(1260,495),(1246,530),(1248,615),(1190,615),(1172,560),(1150,528),(1122,492),(1104,445),(1097,385),(1095,320),(1100,262)],
               foreign=[[(1060,150),(1099,150),(1099,470),(1060,470)],
                        [(1060,448),(1104,450),(1137,468),(1158,488),(1173,508),(1186,528),(1198,548),(1209,568),(1221,588),(1250,606),(1250,660),(1060,660)]]),
}
def head(name):
    h=H[name]; P=poly(h['pts'])
    fg=(mbig>110).astype(np.uint8)*255
    bad=np.zeros_like(P)
    for f in h['foreign']: bad=np.maximum(bad,(poly(f)>0).astype(np.uint8)*255&P)
    if name=='creek': bad[:, 1280+PAD:]=0   # reflected hair beyond the frame is kept as is
    fb=np.zeros_like(P)
    for f in h['foreign']: fb=np.maximum(fb,poly(f))
    good=((P>0)&(fg>0)&(fb==0)).astype(np.uint8)
    if name=='creek': good[:, 1280+PAD:]=((P>0)&(fg>0))[:, 1280+PAD:]
    ys,xs=np.where(P>0); X0,X1,Y0,Y1=xs.min()-10,xs.max()+10,ys.min()-10,ys.max()+10
    crop=big[Y0:Y1,X0:X1].copy(); unk=(1-good[Y0:Y1,X0:X1])*255
    filled=cv2.inpaint(crop,unk.astype(np.uint8),15,cv2.INPAINT_TELEA)
    img=big.copy(); img[Y0:Y1,X0:X1]=filled
    a=((P>0)&((fg>0)|(fb>0))).astype(np.uint8)*255
    a=cv2.morphologyEx(a,cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
    n,lab,st,_=cv2.connectedComponentsWithStats(a); k=1+np.argmax(st[1:,cv2.CC_STAT_AREA]); a=(lab==k).astype(np.uint8)*255
    ys,xs=np.where(a>0); x0,x1,y0,y1=xs.min(),xs.max()+1,ys.min(),ys.max()+1
    rgba=np.dstack([img,a])[y0:y1,x0:x1]
    return Image.fromarray(rgba.astype(np.uint8),'RGBA'), (x0-PAD, y0-PAD)

from PIL import ImageOps, ImageFilter
SS=4; N=512*SS
EYES={'speed':((523,422),(630,422)),'queso':((810,327),(940,327)),'creek':((1150,348),(1240,348))}
EYE_D=80; EYE_Y=166
rng=np.random.default_rng(7)
def ell(cx,cy,rx,ry):
    m=Image.new('L',(N,N),0); ImageDraw.Draw(m).ellipse([(cx-rx)*SS,(cy-ry)*SS,(cx+rx)*SS,(cy+ry)*SS],fill=255); return np.array(m)
YY,XX=np.mgrid[0:N,0:N]/SS
def shade(cx,cy,rx,ry,lo,hi,p=1.8):
    d=np.clip(np.sqrt(((XX-cx)/rx)**2+((YY-cy)/ry)**2),0,1); return hi-(hi-lo)*d**p
def bust(name):
    L=np.zeros((N,N)); A=np.zeros((N,N))
    def put(mask,val):
        nonlocal L,A
        m=mask/255.0; L=L*(1-m)+val*m; A=np.maximum(A,m)
    cy,rx,ry,band=346,138,44,30
    # shoulders: a wide padded dome, lit from the top
    put(ell(256,640,236,272), shade(250,380,300,300,120,228))
    # collar: padded rim + dark neck opening
    put(ell(256,cy,rx,ry), shade(248,cy-30,rx+30,ry+50,150,240))
    inner=ell(256,cy+6,rx-band,ry-band*0.6); put(inner, np.full((N,N),16.0))
    img=np.dstack([L,L,L,A*255]).astype(np.uint8); out=Image.fromarray(img,'RGBA')
    # head
    h,(ox,oy)=head(name); h=ImageOps.grayscale(h.convert('RGB')).convert('RGBA'); h.putalpha(head(name)[0].getchannel('A'))
    g=np.array(h)[:,:,0].astype(float); a=np.array(h)[:,:,3]>0
    lo,hi=np.percentile(g[a],1),np.percentile(g[a],99.5); g=np.clip((g-lo)/(hi-lo)*245+5,0,255)
    arr=np.array(h); arr[:,:,0]=arr[:,:,1]=arr[:,:,2]=g; h=Image.fromarray(arr,'RGBA')
    (ex1,ey1),(ex2,ey2)=EYES[name]; s=EYE_D/(ex2-ex1)*SS
    h=h.resize((max(1,int(h.width*s)),max(1,int(h.height*s))),Image.LANCZOS)
    mx,my=(ex1+ex2)/2-ox,(ey1+ey2)/2-oy
    layer=Image.new('RGBA',(N,N),(0,0,0,0)); layer.alpha_composite(h,(int(256*SS-mx*s),int(EYE_Y*SS-my*s)))
    la=np.array(layer); keep=(YY<cy)|(ell(256,cy+6,rx-band,ry-band*0.6)>0); la[:,:,3]=np.where(keep,la[:,:,3],0)
    out.alpha_composite(Image.fromarray(la,'RGBA'))
    # front lip of the collar over the neck
    lip=np.clip(ell(256,cy,rx,ry).astype(int)-ell(256,cy-10,rx-band,ry-band*0.6).astype(int),0,255)
    lip[YY<cy-12]=0
    v=shade(250,cy+ry*0.35,rx+40,ry+40,160,242)
    lipimg=np.dstack([v,v,v,lip]).astype(np.uint8); out.alpha_composite(Image.fromarray(lipimg,'RGBA'))
    d=ImageDraw.Draw(out)
    for ang in (200,228,312,340):
        t=np.radians(ang); x=256+(rx-band/2)*np.cos(t); y=cy-4-(ry-band*0.3)*np.sin(t); r=6.5
        d.ellipse([(x-r)*SS,(y-r)*SS,(x+r)*SS,(y+r)*SS],fill=(62,62,62,255))
        d.ellipse([(x-r*0.5)*SS,(y-r*0.75)*SS,(x+r*0.1)*SS,(y-r*0.15)*SS],fill=(140,140,140,255))
    out=out.resize((512,512),Image.LANCZOS)
    # photo grain on the suit so it sits with the photographed heads
    a=np.array(out).astype(float); hm=np.array(layer.resize((512,512)))[:,:,3]>8
    n=rng.normal(0,5.5,(512,512)); n=np.array(Image.fromarray(np.clip(n*10+128,0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))).astype(float)/10-12.8
    for c in range(3): a[:,:,c]=np.where(hm,a[:,:,c],np.clip(a[:,:,c]+n,0,255))
    return Image.fromarray(a.astype(np.uint8),'RGBA')
if __name__=='__main__':
    od=sys.argv[1] if len(sys.argv)>1 else os.path.join(ROOT,'assets/modes/Mg2Upjjo2yg')
    os.makedirs(od,exist_ok=True)
    sheet=Image.new('RGBA',(3*520,520),(181,136,99,255)); sm=Image.new('RGBA',(3*80,80),(240,217,181,255))
    for k,n in enumerate(['speed','queso','creek']):
        b=bust(n); b.save(f'{od}/{n}.png'); sheet.alpha_composite(b,(k*520+4,4)); sm.alpha_composite(b.resize((72,72),Image.LANCZOS),(k*80+4,4))
    if len(sys.argv)>1: sheet.save(f'{od}/sheet.png'); sm.resize((720,240),Image.NEAREST).save(f'{od}/small.png')
