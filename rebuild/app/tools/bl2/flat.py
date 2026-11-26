# Flat-palette re-render: upscale, assign each pixel to the nearest given palette colour, smooth the class maps, render crisp at 512.
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd
def fit(im,size=512,frac=0.9):
    bb=im.getbbox(); im=im.crop(bb); w,h=im.size; sc=size*frac/max(w,h)
    im=im.resize((round(w*sc),round(h*sc)),Image.LANCZOS)
    c=Image.new('RGBA',(size,size),(0,0,0,0)); c.paste(im,((size-im.width)//2,(size-im.height)//2),im); return c
def flat(src, palette, out=None, drop=(), minfrac=0, up=8, sm=0.55, alpha_thr=110, keep_canvas=False, frac=0.9, opaque=False, fill_holes=True, render=None, size=512):
    im=Image.open(src).convert('RGBA'); W,H=im.size
    big=np.array(im.resize((W*up,H*up),Image.BICUBIC)).astype(float)
    P=np.array(palette,float)
    d=((big[...,None,:3]-P[None,None])**2).sum(-1); lab=d.argmin(-1)
    al=big[...,3]>alpha_thr if not opaque else np.ones(lab.shape,bool)
    if fill_holes and not opaque: al=nd.binary_fill_holes(al)
    # smooth class maps
    st=np.stack([nd.gaussian_filter((lab==j).astype(float),up*sm) for j in range(len(P))])
    lab=st.argmax(0)
    a=nd.gaussian_filter(al.astype(float),up*sm)
    R=np.array(render if render else palette,float)
    rgb=R[lab]
    # AA: supersample down by 2 then fit
    if drop:
        keepm=~np.isin(lab,list(drop)); a=nd.gaussian_filter((al&keepm).astype(float),up*sm)
    if minfrac and not opaque:
        m=a>0.5; lb,n=nd.label(m)
        if n>1:
            sz=nd.sum(m,lb,range(1,n+1)); keep=np.isin(lb,1+np.where(sz>=sz.max()*minfrac)[0])
            keep=nd.binary_dilation(keep,iterations=up)
            a=a*keep
    out_a=np.clip((a-0.5)*4+0.5,0,1)*255 if not opaque else np.full(a.shape,255.0)
    img=Image.fromarray(np.dstack([rgb,out_a]).astype(np.uint8),'RGBA')
    if opaque or keep_canvas:
        img=img.resize((size,size),Image.LANCZOS)
    else:
        img=fit(img,size,frac)
    if out: img.save(out)
    return img
