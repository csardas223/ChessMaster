import cv2, numpy as np
from PIL import Image
sq=cv2.imread('J_maxres1.jpg')[255:485,530:770]
th=cv2.flip(cv2.imread('J_maxresdefault.jpg'),1)
M=np.load('sloth_M.npy'); s=M[0,0]
Mi=cv2.invertAffineTransform(M)
# exact square bounds in sq coords: find the cream square edges
g=sq.astype(int)
# canvas in thumbnail coords covering sq region
W=int(round(240/s)); H=int(round(230/s))
# translate so sq (0,0) maps to canvas (0,0): canvas = thumb coords shifted
off=Mi@np.array([0,0,1.0])  # thumb coords of sq origin
T=np.float32([[1,0,-off[0]],[0,1,-off[1]]])
up=cv2.warpAffine(sq,np.float32([[1/s,0,0],[0,1/s,0]]),(W,H),flags=cv2.INTER_CUBIC)
thc=cv2.warpAffine(th,T,(W,H),flags=cv2.INTER_LINEAR,borderValue=(0,0,0))
valid=cv2.warpAffine(np.full(th.shape[:2],255,np.uint8),T,(W,H),borderValue=0)
valid=cv2.erode(valid,np.ones((9,9),np.uint8))
comp=np.where(valid[...,None]>0,thc,up)
cv2.imwrite('sloth_comp.png',comp); print(W,H,off)
