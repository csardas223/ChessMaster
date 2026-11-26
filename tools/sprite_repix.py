# Rebuild blurred pixel art: find the art-pixel grid (pitch+offset), sample each cell centre, palette-quantise, nearest-neighbour upscale.
import sys, numpy as np
from PIL import Image
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); from sprite_vec import kmeans  # sync-qa: was a sandbox-only path
def grid1d(prof, lo=3.0, hi=6.2):
    # prof: edge energy per column; find pitch/offset maximising energy on grid lines
    n=len(prof); best=(-1,None,None)
    for p in np.arange(lo,hi,0.02):
        for o in np.arange(0,p,0.25):
            idx=np.arange(o,n,p); ii=np.round(idx).astype(int); ii=ii[(ii>0)&(ii<n)]
            if len(ii)<3: continue
            s=prof[ii].mean()/(prof.mean()+1e-6)
            if s>best[0]: best=(s,p,o)
    return best
def grid1d_fixed(prof,p):
    return grid1d(prof,p,p+0.001)
def repix(src,out,k=8,size=512,frac=0.9,pitch=None,alpha_thr=110,show=False):
    im=Image.open(src).convert('RGBA'); a=np.array(im).astype(float)
    rgb=a[...,:3]*(a[...,3:]/255)
    g=np.abs(np.diff(rgb,axis=1)).sum(-1); gx=np.pad(g,((0,0),(1,0))).sum(0)
    g=np.abs(np.diff(rgb,axis=0)).sum(-1); gy=np.pad(g,((1,0),(0,0))).sum(1)
    sx,px,ox=grid1d(gx); sy,py,oy=grid1d(gy)
    p=(px+py)/2 if abs(px-py)<0.4 else (px if sx>=sy else py)
    if p: px=py=p
    if pitch: px=py=pitch
    if p and not pitch:
        _,_,ox=grid1d_fixed(gx,px); _,_,oy=grid1d_fixed(gy,py)
    if show: print(src.split('/')[-1],'pitch',round(px,2),round(py,2),'off',ox,oy,'score',round(sx,2),round(sy,2))
    H,W=a.shape[:2]
    xs=np.arange(ox+px/2,W,px); ys=np.arange(oy+py/2,H,py)
    xs=np.concatenate([np.arange(ox-px/2,0,-px)[::-1][-0:],xs]) if ox-px/2>0 else xs
    ys=np.concatenate([np.arange(oy-py/2,0,-py)[::-1],ys]) if oy-py/2>0 else ys
    xs=xs[(xs>=0)&(xs<W)]; ys=ys[(ys>=0)&(ys<H)]
    big=im.resize((W*4,H*4),Image.BICUBIC); B=np.array(big).astype(float)
    cell=np.zeros((len(ys),len(xs),4))
    for i,y in enumerate(ys):
        for j,x in enumerate(xs):
            y0,y1=int((y-py*0.25)*4),int((y+py*0.25)*4)+1; x0,x1=int((x-px*0.25)*4),int((x+px*0.25)*4)+1
            patch=B[max(0,y0):y1,max(0,x0):x1].reshape(-1,4)
            cell[i,j]=np.median(patch,0)
    op=cell[...,3]>alpha_thr
    X=cell[...,:3][op]
    C,l=kmeans(X,min(k,len(X)))
    q=np.zeros_like(cell); q[...,3]=0
    q[op,:3]=C[l]; q[op,3]=255
    small=Image.fromarray(q.astype(np.uint8))
    bb=small.getbbox(); small=small.crop(bb); w,h=small.size
    s=max(1,int(size*frac/max(w,h)))
    up=small.resize((w*s,h*s),Image.NEAREST)
    c=Image.new('RGBA',(size,size),(0,0,0,0)); c.paste(up,((size-up.size[0])//2,(size-up.size[1])//2),up); c.save(out)
    return (w,h,s)
if __name__=='__main__':
    print(repix(sys.argv[1],sys.argv[2],k=int(sys.argv[3]) if len(sys.argv)>3 else 8,show=True))
