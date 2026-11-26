import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd
rng=np.random.default_rng(7)
def tile_noise(S,scale,seed):
    r=np.random.default_rng(seed); n=r.random((S//scale+2,S//scale+2))
    im=Image.fromarray((n*255).astype(np.uint8)).resize((S+2*scale,S+2*scale),Image.BICUBIC)
    return np.array(im)[scale:scale+S,scale:scale+S]/255.0
# --- Petrified Pawns dark slate wall (sGXmiyvZDE4/wall.jpg) ---
S=512; SS=S*2
img=Image.new('RGB',(SS,SS),(24,24,31)); d=ImageDraw.Draw(img)
g=0.016*SS
bricks=[(0,0,0.49,0.49),(0.51,0,1,0.49),(0,0.51,0.235,1),(0.255,0.51,0.735,1),(0.755,0.51,1,1)]
for (x0,y0,x1,y1) in bricks:
    X0=x0*SS+(g/2 if x0>0 else 0); Y0=y0*SS+(g if y0==0 else 0); X1=x1*SS-(0 if x1==1 else 0); Y1=y1*SS-(0 if y1==1 else 0)
    d.rectangle([X0,Y0,X1,Y1],fill=(39,42,49))
    d.rectangle([X0,Y0,X1,Y0+0.012*SS],fill=(56,57,66))
a=np.array(img).astype(float)
n=tile_noise(SS,48,1)*0.6+tile_noise(SS,12,2)*0.4
brick=(a[...,0]>33)
a[brick]+=((n[brick]-0.5)*12)[:,None]
img=Image.fromarray(np.clip(a,0,255).astype(np.uint8)).resize((S,S),Image.LANCZOS)
img.save('out/wall.jpg',quality=92)
# --- Cornered Kings light flagstone wall (y5MBC8OCYlI/stone_wall.png): seamless small-cobble texture ---
S=512; N=110
pts=rng.random((N,2))*S
P=np.concatenate([pts+np.array([dx,dy])*S for dx in (-1,0,1) for dy in (-1,0,1)])
yy,xx=np.mgrid[0:S,0:S].astype(float)
from scipy.spatial import cKDTree
t=cKDTree(P); dist,idx=t.query(np.stack([xx.ravel(),yy.ravel()],1),k=2)
F1=dist[:,0].reshape(S,S); F2=dist[:,1].reshape(S,S); cell=(idx[:,0]%N).reshape(S,S)
edge=F2-F1
stone=np.clip((edge-3.2)/2.2,0,1)
shade=rng.uniform(-10,10,N)[cell]
base=np.array([138,146,149.])
rgb=np.zeros((S,S,3))+base+shade[...,None]
# bevel: light on top-left side of each stone, dark on bottom-right
gy,gx=np.gradient(nd.gaussian_filter(np.clip(edge,0,14),2))
bev=(-gx-gy)*3.2
rgb+=np.clip(bev,-18,18)[...,None]*np.clip((14-edge)/10,0,1)[...,None]
n=tile_noise(S,8,3); rgb+=((n-0.5)*8)[...,None]
grout=np.array([86,92,95.])
rgb=rgb*stone[...,None]+grout*(1-stone[...,None])
Image.fromarray(np.clip(rgb,0,255).astype(np.uint8)).save('out/stone_wall_y5.png')
