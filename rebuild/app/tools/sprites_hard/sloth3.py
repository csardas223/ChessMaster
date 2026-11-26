import cv2, numpy as np, sys
from scipy import ndimage as nd
sys.path.insert(0,'.')
from fit import fit, preview
from PIL import Image
comp=cv2.imread('sloth_comp.png'); H,W=comp.shape[:2]
M=np.load('sloth_M.npy'); s=M[0,0]
x0,x1,y0,y1=[int(round(v/s)) for v in (17,229,9,220)]
rgb=comp[...,::-1].astype(float)
cream=np.array([237,214,180.]); tan=np.array([181,136,99.])
d=np.minimum(np.linalg.norm(rgb-cream,axis=2),np.linalg.norm(rgb-tan,axis=2))
boardish=d<45
inside=np.zeros((H,W),bool); inside[y0:y1,x0:x1]=True
# seed: everything outside square + border rows of square that are boardish
cand=boardish|~inside
lab,n=nd.label(cand)
border_labels=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
# also anything outside square
bg=np.isin(lab,list(border_labels))|~inside
bg=nd.binary_opening(bg,iterations=1)|~inside
fgm=~bg
# keep largest component only
l2,n2=nd.label(fgm); sz=nd.sum(fgm,l2,range(1,n2+1)); fgm=l2==(1+int(np.argmax(sz)))
fgm=nd.binary_fill_holes(fgm); fgm=nd.binary_opening(fgm,iterations=3); l3,n3=nd.label(fgm); sz3=nd.sum(fgm,l3,range(1,n3+1)); fgm=l3==(1+int(np.argmax(sz3)))
a=cv2.GaussianBlur(fgm.astype(np.float32),(0,0),0.8)
a=np.where(fgm,np.maximum(a,0.5),a*0)  # 1px AA inside edge only
a=cv2.GaussianBlur(fgm.astype(np.float32),(3,3),0.7)
out=np.dstack([rgb,a*255]).astype(np.uint8)[y0:y1,x0:x1]
o=Image.fromarray(out,'RGBA'); o.save('sloth_cut_raw.png')
fit(o,512,0.92,False).save('out/scp2774.png')
preview(['out/scp2774.png'],'out/p4.png')
