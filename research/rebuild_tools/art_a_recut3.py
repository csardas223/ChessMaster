#!/usr/bin/env python3
"""art-audit-final batch 2:
 * GawuFHUIj6o phantom rook: recut from research/frames/sprites/GawuFHUIj6o_phantom_rook.png (400px video crop) keying the purple
   background (old cut kept purple/grey streaks on the left); black = same blackify as app/tools/g5_frames.py.
 * JAz_qMQpI1o Ouroboros unit icons: the cuts kept a faint cream/grey wash at low alpha around every icon (visible as a halo on
   the green board) -> alpha below 70 dropped, the rest re-stretched; colours untouched."""
import sys
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
sys.path.insert(0,'app/tools'); 
A='app/assets/modes/'
def fill_holes(mask):
    m=Image.fromarray((mask*255).astype('uint8')); w,h=m.size
    big=Image.new('L',(w+2,h+2),0); big.paste(m,(1,1)); ImageDraw.floodfill(big,(0,0),128)
    return np.asarray(big)[1:-1,1:-1]!=128
def blackify(im):
    a=np.asarray(im.convert('RGBA')).astype(float); l=a[...,:3]@[0.299,0.587,0.114]
    v=np.where(l>128,40+(255-l)*0.75,200+(128-l)*0.3); a[...,0]=a[...,1]=a[...,2]=v
    return Image.fromarray(a.clip(0,255).astype('uint8'))
im=Image.open('research/frames/sprites/GawuFHUIj6o_phantom_rook.png').convert('RGB'); a=np.asarray(im).astype(int)
r,g,b=a[...,0],a[...,1],a[...,2]
purple=(r-g>40)&(b-g>40)                        # magenta/purple wall + streaks
grey=(np.abs(r-b)<25)&(r-g>12)&(b-g>12)          # lavender-grey streak pixels
fg=fill_holes(~(purple|grey))
# keep the biggest blob (the rook)
from scipy import ndimage
lab,n=ndimage.label(fg); sizes=ndimage.sum(fg,lab,range(1,n+1)); fg=lab==(1+int(np.argmax(sizes)))
fg=ndimage.binary_opening(fg,iterations=2)
al=Image.fromarray((fg*255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.0))
out=im.convert('RGBA'); out.putalpha(al); out=out.crop(out.getbbox())
s=max(out.size); sq=Image.new('RGBA',(s,s)); sq.alpha_composite(out,((s-out.width)//2,s-out.height))
sq=sq.resize((160,160),Image.LANCZOS); sq.save(A+'GawuFHUIj6o/phantom_w.png'); blackify(sq).save(A+'GawuFHUIj6o/phantom_b.png')
import glob
for p in sorted(glob.glob(A+'JAz_qMQpI1o/*_[wb].png')):
    x=np.asarray(Image.open(p).convert('RGBA')).astype(float); al=x[...,3]
    x[...,3]=np.clip((al-70)*255/(255-70),0,255); Image.fromarray(x.astype('uint8')).save(p); print(p)
