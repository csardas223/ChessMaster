import cv2, numpy as np
from PIL import Image
sq=cv2.imread('J_maxres1.jpg')[255:485,530:770]   # board square region with margin
th=cv2.imread('J_maxresdefault.jpg')
th=cv2.flip(th,1)
# SIFT align thumbnail -> square
s=cv2.SIFT_create()
k1,d1=s.detectAndCompute(cv2.cvtColor(th,cv2.COLOR_BGR2GRAY),None)
k2,d2=s.detectAndCompute(cv2.cvtColor(sq,cv2.COLOR_BGR2GRAY),None)
m=cv2.BFMatcher().knnMatch(d1,d2,k=2)
g=[a for a,b in m if a.distance<0.75*b.distance]
print('good',len(g))
src=np.float32([k1[a.queryIdx].pt for a in g]); dst=np.float32([k2[a.trainIdx].pt for a in g])
M,inl=cv2.estimateAffinePartial2D(src,dst,method=cv2.RANSAC,ransacReprojThreshold=2)
print(M, inl.sum())
np.save('sloth_M.npy',M)
