"""Procedural wood textures for the 'wood' board theme (original, CC0). Run: python3 tools/make_boards.py"""
import numpy as np, os
from PIL import Image, ImageFilter
OUT=os.path.join(os.path.dirname(__file__),'..','assets','boards'); os.makedirs(OUT,exist_ok=True)
rng=np.random.default_rng(3)
def smooth_noise(h,w,sy,sx):
    n=rng.random((max(2,h//sy)+1,max(2,w//sx)+1)); im=Image.fromarray((n*255).astype('uint8')).resize((w,h),Image.BICUBIC)
    return np.asarray(im,dtype=float)/255
def wood(base,dark,seed_shift):
    H=W=256; y,x=np.mgrid[0:H,0:W]
    warp=smooth_noise(H,W,128,64)*2.5
    rings=np.sin(x*0.16+warp*3+seed_shift)*0.5+0.5
    streak=smooth_noise(H,W,96,2)
    t=np.clip(rings**3*0.35+streak**2*0.45,0,1)[...,None]
    c=np.array(base)*(1-t)+np.array(dark)*t
    return Image.fromarray(c.astype('uint8')).filter(ImageFilter.GaussianBlur(0.6))
wood((233,196,145),(201,156,104),0).save(os.path.join(OUT,'wood-light.jpg'),quality=86)
wood((176,123,76),(140,92,52),2).save(os.path.join(OUT,'wood-dark.jpg'),quality=86)
print('ok')
