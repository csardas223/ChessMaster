#!/usr/bin/env python3
"""art-audit-final: Kzt9ItpGtYg 'lion' (gold Island Boss head) recut from the video frame research/frames/video_thumbs/
Kzt9ItpGtYg_frame_706.jpg (1920x1080, square c5 of the Pawnbarian board) instead of the old 41px crop with the square behind it.
Mask = gold pixels, holes filled (keeps the dark inner lines), grown 2px for the dark outer outline, soft edge."""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
im=Image.open('research/frames/video_thumbs/Kzt9ItpGtYg_frame_706.jpg').convert('RGB').crop((903,325,1040,462))
a=np.asarray(im).astype(int)
gold=(a[...,0]>170)&(a[...,1]>110)&(a[...,2]<120)&(a[...,0]-a[...,2]>90)
m=Image.fromarray((gold*255).astype('uint8'))
m=m.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))  # close the gaps the dark inner lines leave
w,h=m.size; big=Image.new('L',(w+2,h+2),0); big.paste(m,(1,1))
ImageDraw.floodfill(big,(0,0),128)                                      # outside = 128
f=np.asarray(big)[1:-1,1:-1]; filled=(f!=128)
m=Image.fromarray((filled*255).astype('uint8')).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(0.7))
out=im.convert('RGBA'); out.putalpha(m); out=out.crop(out.getbbox())
s=max(out.size)+4; sq=Image.new('RGBA',(s,s)); sq.alpha_composite(out,((s-out.width)//2,(s-out.height)//2))
sq.save('assets/modes/Kzt9ItpGtYg/lion.png'); print(sq.size)
