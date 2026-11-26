# fRZmYTwLE54 magnet: recut from the video's maxresdefault thumbnail (old cut had the white square filled into the U and
# the lower pole cut off). Fill = red arms + grey poles; outline = 5px dark band around them (the poles' left outline is hidden
# by lightning in the frame, so the band is redrawn there in the outline colour; bishop lines touching it are dropped).
import numpy as np, sys
from PIL import Image
from scipy import ndimage as nd
X0,Y0,X1,Y1=750,255,975,455
a=np.array(Image.open(sys.argv[1]).convert('RGB').crop((X0,Y0,X1,Y1))).astype(float)
r,g,b=a[...,0],a[...,1],a[...,2]
red=(r>140)&(g<120)&(b<120)
grey=(abs(r-g)<22)&(abs(g-b)<28)&(r>120)&(r<222)
from scipy.spatial import ConvexHull
from PIL import ImageDraw
gl,gn=nd.label(nd.binary_opening(grey,np.ones((3,3))))
gsz=nd.sum(grey,gl,range(1,gn+1))
for k in range(gn):
    if gsz[k]<300: continue
    ys,xs=np.nonzero(gl==k+1); pts=np.c_[xs,ys]; hull=pts[ConvexHull(pts).vertices]
    im=Image.new('L',(a.shape[1],a.shape[0]),0); ImageDraw.Draw(im).polygon([tuple(p) for p in hull],fill=1)
    hm=np.array(im).astype(bool); col=np.median(a[gl==k+1],0)
    a[hm&~(gl==k+1)]=col; grey|=hm
fill=red|grey
lab,n=nd.label(fill); sz=nd.sum(fill,lab,range(1,n+1)); keep=[k+1 for k in range(n) if sz[k]>300]
fill=np.isin(lab,keep); fill=nd.binary_closing(fill,np.ones((3,3)))
fill=nd.binary_fill_holes(fill)
d=nd.distance_transform_edt(~fill)
R=5.0
al=np.clip(R+0.5-d,0,1)
ring=(d>0)&(d<=R+1)
oc=np.array([28,28,30.])
dk=a.max(2)<110
rgb=a.copy(); rgb[ring&~dk]=oc
# soften: ring pixels that are dark keep video colour
out=np.dstack([rgb,al*255]).astype(np.uint8)
ys,xs=np.nonzero(al>0); out=out[ys.min():ys.max()+1,xs.min():xs.max()+1]
h,w=out.shape[:2]; S=max(h,w)+8; can=np.zeros((S,S,4),np.uint8); can[(S-h)//2:(S-h)//2+h,(S-w)//2:(S-w)//2+w]=out
Image.fromarray(can).save(sys.argv[2],optimize=True); print(can.shape)
