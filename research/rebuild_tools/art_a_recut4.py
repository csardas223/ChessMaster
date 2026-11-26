#!/usr/bin/env python3
"""art-audit-final batch 3:
 * I_TbJqRHtf4 marker.png: the old file was the marker plus a square of board behind it (blurry 59px upscale). Recut from the
   video crop research/frames/sprites/I_TbJqRHtf4_secret_marker.png: blue disc (x 42-102, y 31-93) with a soft circular alpha.
 * 0VbTOk8X1TY blood.png: the video splat kept the dark square around it; red keyed into alpha so it sits on any square colour."""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
A='assets/modes/'; F='research/frames/sprites/'
im=Image.open(F+'I_TbJqRHtf4_secret_marker.png').convert('RGB')
cx,cy,r=72.5,62.5,32.5; S=8
m=Image.new('L',(im.width*S,im.height*S)); ImageDraw.Draw(m).ellipse([(cx-r)*S,(cy-r)*S,(cx+r)*S,(cy+r)*S],fill=255)
m=m.resize(im.size,Image.LANCZOS); o=im.convert('RGBA'); o.putalpha(m)
o=o.crop((int(cx-r-1),int(cy-r-1),int(cx+r+2),int(cy+r+2))); o.resize((96,96),Image.LANCZOS).save(A+'I_TbJqRHtf4/marker.png')
im=Image.open(F+'0VbTOk8X1TY_blood_splat.png').convert('RGB'); a=np.asarray(im).astype(float)
red=np.clip((a[...,0]-np.maximum(a[...,1],a[...,2])-40)/80,0,1)
al=Image.fromarray((red*255).astype('uint8')).filter(ImageFilter.GaussianBlur(0.6))
o=Image.new('RGBA',im.size,(205,10,25,0)); px=np.asarray(im.convert('RGBA')).copy(); px[...,3]=np.asarray(al)
Image.fromarray(px).resize((128,128),Image.LANCZOS).save(A+'0VbTOk8X1TY/blood.png')
