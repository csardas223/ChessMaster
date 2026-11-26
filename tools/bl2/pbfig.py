import numpy as np, sys
from PIL import Image, ImageFilter
from scipy import ndimage as nd
def fit(im,size=512,frac=0.9):
    bb=im.getbbox(); im=im.crop(bb); w,h=im.size; sc=size*frac/max(w,h)
    im=im.resize((round(w*sc),round(h*sc)),Image.LANCZOS)
    c=Image.new('RGBA',(size,size),(0,0,0,0)); c.paste(im,((size-im.width)//2,(size-im.height)//2),im); return c
def smooth(m,up,r):
    im=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))
    return np.array(im)/255.0
def build(src, white, navy, gold=None, up=8, outline=1.6, disc=None, crop=None):
    im=Image.open(src).convert('RGB')
    if crop: im=im.crop(crop)
    W,H=im.size; big=np.array(im.resize((W*up,H*up),Image.BICUBIC)).astype(float)
    r,g,b=big[...,0],big[...,1],big[...,2]; mx=big.max(-1); mn=big.min(-1); lum=big.mean(-1)
    wm=(lum>185)&((mx-mn)<45)
    gm=(r>200)&(g>130)&(g<215)&(b<140) if gold is not None else np.zeros_like(wm)
    fig=wm|gm
    lab,n=nd.label(fig); sizes=nd.sum(fig,lab,range(1,n+1))
    keep=np.isin(lab,1+np.where(sizes>sizes.max()*0.004)[0])
    # drop components touching the image border (glow/corners)
    border=np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]]))
    keep&=~np.isin(lab,border[border>0])
    wm&=keep; gm&=keep; fig=wm|gm
    sil=nd.binary_fill_holes(nd.binary_dilation(fig,iterations=int(outline*up)))
    sil=nd.binary_fill_holes(sil)
    # smooth masks -> AA
    a_sil=smooth(sil,up,up*0.6); a_w=smooth(wm,up,up*0.45); a_g=smooth(gm,up,up*0.45)
    a_sil=np.clip((a_sil-0.5)*6+0.5,0,1); a_w=np.clip((a_w-0.5)*6+0.5,0,1); a_g=np.clip((a_g-0.5)*6+0.5,0,1)
    out=np.zeros(big.shape[:2]+(4,))
    col=np.array(navy,float)[None,None]*np.ones(big.shape[:2]+(3,))
    col=col*(1-a_w[...,None])+np.array(white,float)*a_w[...,None]
    if gold is not None: col=col*(1-a_g[...,None])+np.array(gold,float)*a_g[...,None]
    out[...,:3]=col; out[...,3]=a_sil*255
    res=Image.fromarray(out.astype(np.uint8),'RGBA')
    if disc is not None:
        S=max(res.size); d=Image.new('RGBA',(int(S*1.18),int(S*1.18)),(0,0,0,0))
        from PIL import ImageDraw
        big2=Image.new('RGBA',(d.width*2,d.height*2),(0,0,0,0)); ImageDraw.Draw(big2).ellipse([0,0,big2.width-1,big2.height-1],fill=tuple(disc)+(255,))
        d=big2.resize(d.size,Image.LANCZOS); fb=res.crop(res.getbbox()); sc=d.width*0.8/max(fb.size); fb=fb.resize((round(fb.width*sc),round(fb.height*sc)),Image.LANCZOS)
        d.alpha_composite(fb,((d.width-fb.width)//2,(d.height-fb.height)//2)); res=d
        return fit(res,512,0.98)
    return fit(res)
if __name__=='__main__':
    P='web/pb/'
    build(P+'Spark_Imp.jpg',(242,242,246),(52,54,84),gold=(232,176,80)).save('out/cappy_bear.png')
    build(P+'Spark_Imp.jpg',(242,242,246),(52,54,84),gold=(232,176,80),disc=(92,96,130)).save('out/spewer_golem.png')
    build(P+'Goblin_Zapper.jpg',(226,142,178),(74,44,82)).save('out/skull_enemy.png')
