#!/usr/bin/env python3
"""art-audit-final batch 2 recuts (video frames only, research/frames/video_thumbs):
 * 1L_sxGgxX9M rainbow_bishop.png: the rainbow piece on a2 in 1L_sxGgxX9M_maxres1.jpg (old cut was chopped and had a stray
   black line from the move arrow); mask = saturated or dark-outline pixels vs the grey/teal square, holes filled.
 * 7lEglazTlo8 pawn_b.png / pawn_y.png (Sokochess): glyphs keep their white outline; the lavender tile behind is keyed out."""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
V='research/frames/video_thumbs/'; A='assets/modes/'
def fill_holes(mask):
    m=Image.fromarray((mask*255).astype('uint8')); w,h=m.size
    big=Image.new('L',(w+2,h+2),0); big.paste(m,(1,1)); ImageDraw.floodfill(big,(0,0),128)
    return np.asarray(big)[1:-1,1:-1]!=128
def largest(mask):
    from collections import deque
    h,w=mask.shape; lab=np.zeros((h,w),int); best=None; n=0
    for y in range(h):
        for x in range(w):
            if mask[y,x] and not lab[y,x]:
                n+=1; q=deque([(y,x)]); lab[y,x]=n; pts=[]
                while q:
                    cy,cx=q.popleft(); pts.append((cy,cx))
                    for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
                        yy,xx=cy+dy,cx+dx
                        if 0<=yy<h and 0<=xx<w and mask[yy,xx] and not lab[yy,xx]: lab[yy,xx]=n; q.append((yy,xx))
                if best is None or len(pts)>len(best): best=pts
    out=np.zeros_like(mask); 
    for p in best: out[p]=True
    return out
def save(rgb,alpha,path,size,scale_to):
    out=rgb.convert('RGBA'); out.putalpha(alpha); out=out.crop(out.getbbox())
    s=max(out.size)+2; sq=Image.new('RGBA',(s,s)); sq.alpha_composite(out,((s-out.width)//2,(s-out.height)//2))
    sq=sq.resize((scale_to,scale_to),Image.LANCZOS); sq.save(path); print(path,sq.size)
# rainbow piece: OpenCV GrabCut (pip opencv-python-headless) on a 4x cubic upscale of the a2 square, rect = the piece
import cv2
cv=cv2.imread(V+'1L_sxGgxX9M_maxres1.jpg')[540:625,390:452]
big=cv2.resize(cv,None,fx=4,fy=4,interpolation=cv2.INTER_CUBIC)
gm=np.zeros(big.shape[:2],np.uint8); b1=np.zeros((1,65)); f1=np.zeros((1,65))
cv2.grabCut(big,gm,(56,52,136,228),b1,f1,8,cv2.GC_INIT_WITH_RECT)
gm=np.where((gm==1)|(gm==3),255,0).astype('uint8')
gm=cv2.GaussianBlur(cv2.morphologyEx(gm,cv2.MORPH_OPEN,np.ones((5,5),np.uint8)),(5,5),0)
save(Image.fromarray(cv2.cvtColor(big,cv2.COLOR_BGR2RGB)),Image.fromarray(gm),A+'1L_sxGgxX9M/rainbow_bishop.png',None,128)
# sokochess pawns (lavender tile ~ (150,140,235))
for name,box in (('pawn_b',(653,253,686,295)),):
    im=Image.open(V+'7lEglazTlo8_maxres1.jpg').convert('RGB').crop(box); a=np.asarray(im).astype(float)
    tile=np.median(np.concatenate([a[0],a[-1],a[:,0],a[:,-1]]),0)
    d=np.sqrt(((a-tile)**2).sum(2)); alpha=np.clip((d-25)/45,0,1)
    fg=largest(fill_holes(alpha>0.5)); alpha=np.where(fg|(alpha>0)&np.asarray(Image.fromarray(fg.astype('uint8')*255).filter(ImageFilter.MaxFilter(3)))>0,alpha,0)
    alpha[fill_holes(alpha>0.5)]=np.maximum(alpha[fill_holes(alpha>0.5)],1)
    save(im,Image.fromarray((alpha*255).astype('uint8')),A+'7lEglazTlo8/'+name+'.png',None,96)
