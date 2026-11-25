# JAz_qMQpI1o Ouroboros unit icons: rebuild the contrast outline so no grey halo is left (general: the cut caught the
# pink 'threatened' glow of the maxres2 still; prince: speckled outline from the recruit card; fool: faint grey fringe).
# Black-fill version: shape = filled dark pixels, inside crisp black/white from the cut, plus a clean 3px white outline;
# the white version is the fill/outline swap (as the other unit icons).
import numpy as np, sys, os
from PIL import Image
from scipy import ndimage as nd
D=sys.argv[1]
def fix(name, src_is_white, THR=110, src=None):
    im=np.array(Image.open(src or f"{D}/{name}_{'w' if src_is_white else 'b'}.png").convert("RGBA")).astype(float)
    L=im[...,:3].mean(2); A=im[...,3]
    if src_is_white: L=255-L
    dark=(L<THR)&(A>140)
    lab,n=nd.label(dark); sz=nd.sum(dark,lab,range(1,n+1)); dark=np.isin(lab,[k+1 for k in range(n) if sz[k]>=6])
    S=nd.binary_fill_holes(nd.binary_closing(dark,np.ones((3,3))))
    # supersample for smooth edges
    up=lambda m: np.array(Image.fromarray((m*255).astype(np.uint8)).resize((m.shape[1]*4,m.shape[0]*4),Image.BILINEAR)).astype(float)/255>0.5
    Su=up(S.astype(float)); Lu=np.array(Image.fromarray(L.astype(np.uint8)).resize((L.shape[1]*4,L.shape[0]*4),Image.BICUBIC)).astype(float)
    dist=nd.distance_transform_edt(~Su)
    alpha=np.clip((3.2*4-dist)/4+0.5,0,1)
    inner=np.where(Su, np.where(Lu<128,0,255), 255).astype(float)  # inside: crisp black/white; ring: white
    out=np.dstack([inner,inner,inner,alpha*255])
    o=Image.fromarray(out.astype(np.uint8)).resize(S.shape[::-1],Image.LANCZOS)
    a=np.array(o).astype(float)
    a[...,:3]=np.clip(a[...,:3]/np.maximum(a[...,3:]/255,1e-3),0,255)*(a[...,3:]>0)  # un-premultiply-ish for LANCZOS on black
    b=Image.fromarray(a.astype(np.uint8))
    b.save(f'{D}/{name}_b.png',optimize=True)
    w=a.copy(); w[...,:3]=np.where(a[...,3:]>0,255-a[...,:3],0)
    Image.fromarray(w.astype(np.uint8)).save(f'{D}/{name}_w.png',optimize=True)
import sys
if len(sys.argv)>2: fix('general',False,50,sys.argv[2])
else: fix('general',False,50); fix('prince',False); fix('fool',True)
