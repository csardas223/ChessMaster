from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage
exec(open('/workspace/work/fsb/sr.py').read().split("if __name__")[0])
ar=Image.open('/workspace/work/fsb/cand_arthur-bot.png').convert('RGB')
big=up(ar,1024,sharpen=False); a=np.asarray(big,float)
g=np.array([71,112,76.]); dist=np.sqrt(((a-g)**2).sum(2))
lab,n=ndimage.label(dist<40); border=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
fg=~np.isin(lab,list(border)); fg=ndimage.binary_erosion(ndimage.binary_opening(fg,iterations=2),iterations=3); fg=ndimage.binary_fill_holes(fg)
al=ndimage.gaussian_filter(fg.astype(float),2.2); al=np.clip((al-0.5)*2.2+0.5,0,1)
# keep fg colour clean near edge: erode-colour fill
D=np.array([38,37,33.])
out=a*al[...,None]+D*(1-al[...,None])
Image.fromarray(out.clip(0,255).astype('uint8')).resize((512,512),Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.5,40,2)).save('/workspace/work/fsb/new_arthur.png')
