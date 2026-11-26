from PIL import Image
import numpy as np
from scipy import ndimage as nd
import sys; sys.path.insert(0,'.')
from fit import fit, preview
im=Image.open('U67_maxres1.jpg').convert('RGB')
a=np.asarray(im).astype(float)[262:460,317:515]
# upscale 3x first for smoother edges
up=np.asarray(Image.fromarray(a.astype('uint8')).resize((a.shape[1]*3,a.shape[0]*3),Image.LANCZOS)).astype(float)
bgpix=up.reshape(-1,3); L=up.mean(2)
bg=np.median(bgpix[L.reshape(-1)>110],axis=0); print('bg',bg)
Lb=bg.mean()
alpha=np.clip((Lb-L)/(Lb-18),0,1)  # creature core ~18
core=nd.binary_fill_holes(alpha>0.6)
core=nd.binary_opening(core,iterations=1)
eyes=core&(alpha<0.6)&((up[...,0]-up[...,2])<30)
alpha[eyes]=1.0
# remove tiny speck components
lab,n=nd.label(alpha>0.15); sizes=nd.sum(np.ones_like(alpha),lab,range(1,n+1))
keep=np.zeros(n+1,bool); keep[1:]=sizes>200
alpha[~keep[lab]]=0
# colour: unmix fg = (pix-(1-a)bg)/a
a3=alpha[...,None]
fg=np.where(a3>0.05,(up-(1-a3)*bg)/np.maximum(a3,0.05),0)
fg=np.clip(fg,0,255)
fg[eyes]=up[eyes]
out=np.dstack([fg,alpha*255]).astype('uint8')
o=Image.fromarray(out,'RGBA')
fit(o,512,0.92,True).save('out/despair.png')
preview(['out/despair.png'],'out/p3.png')
