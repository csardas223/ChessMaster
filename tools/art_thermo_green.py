"""Thermopylae (boaA9_TjXeU) green pieces: recolour a red chess.com 4PC variant sprite (#bf3b43) to the board green
(#4e9161) in HSV (hue swap, S/V scaled by the fill ratio). Checked against general_g.png (rendered from the template in
that green): mean channel error ~1/255. Usage: python3 tools/art_thermo_green.py in_r.png out_g.png (numpy, matplotlib)."""
import sys, colorsys
from PIL import Image
import numpy as np
RED=(0xbf,0x3b,0x43); GREEN=(0x4e,0x91,0x61)
def hsv(c): return colorsys.rgb_to_hsv(*[x/255 for x in c])
def recolor(src, dst, target=GREEN):
    im=np.array(Image.open(src).convert('RGBA')).astype(float)/255
    hr,sr,vr=hsv(RED); ht,st,vt=hsv(target)
    out=im.copy()
    import matplotlib.colors as mc
    h=mc.rgb_to_hsv(im[...,:3])
    # reddish pixels: hue near red and saturated
    dh=np.minimum(abs(h[...,0]-hr),1-abs(h[...,0]-hr))
    m=(dh<0.08)&(h[...,1]>0.15)
    h2=h.copy()
    h2[...,0]=np.where(m,ht,h[...,0])
    h2[...,1]=np.where(m,np.clip(h[...,1]*st/sr,0,1),h[...,1])
    h2[...,2]=np.where(m,np.clip(h[...,2]*vt/vr,0,1),h[...,2])
    out[...,:3]=mc.hsv_to_rgb(h2)
    Image.fromarray((out*255).round().astype('uint8')).save(dst)
if __name__=='__main__':
    recolor(sys.argv[1],sys.argv[2])
