import numpy as np, sys
from PIL import Image
from scipy import ndimage as nd
i=Image.open('d9_1.jpg').convert('RGB').crop((250,320,500,560))
a=np.array(i).astype(float)
# find pink square bounds
pk=(a[...,0]>190)&(a[...,2]>150)&(a[...,1]<170)
ys,xs=np.nonzero(pk); x0,x1,y0,y1=xs.min(),xs.max(),ys.min(),ys.max(); print(x0,x1,y0,y1)
a=a[y0:y1+1,x0:x1+1]
pink=np.median(a[pk[y0:y1+1,x0:x1+1]],0); print(pink)
d=np.sqrt(((a-pink)**2).sum(2))
fg=d>90
fg=nd.binary_opening(fg,np.ones((3,3)))
lab,n=nd.label(fg); sz=nd.sum(fg,lab,range(1,n+1)); fg=lab==(1+np.argmax(sz)); fg=nd.binary_fill_holes(fg)
al=np.clip((d-80)/(140-80),0,1); al=al*fg
al[nd.binary_erosion(fg,iterations=2)]=1
# decontaminate pink from edge pixels
rgb=a.copy(); m=(al>0)&(al<1)
rgb[m]=np.clip((a[m]-(1-al[m,None])*pink)/np.maximum(al[m,None],0.2),0,255)
out=np.dstack([rgb,al*255]).astype(np.uint8)
Image.fromarray(out).save(sys.argv[1],optimize=True)
print(out.shape)
