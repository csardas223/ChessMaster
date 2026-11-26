# passant_ai.png (dkCMhNcZezM, dztzDlPfqSI): white UI arrow tip cut into the left edge of the red avatar -> repaint with the red of the same row
import numpy as np, sys
from PIL import Image
for p in sys.argv[1:]:
    im=Image.open(p); mode=im.mode; a=np.array(im.convert('RGBA')).astype(int)
    H,W=a.shape[:2]; reg=np.zeros((H,W),bool); reg[:H//2,:W//6]=True
    r,g,b=a[...,0],a[...,1],a[...,2]
    bad=reg&~((r>120)&(r-g>60)&(r-b>60))
    from scipy import ndimage as nd
    bad=nd.binary_dilation(bad,iterations=1)&reg
    print(p,a.shape,bad.sum())
    for y in np.nonzero(bad.any(1))[0]:
        xs=np.nonzero(bad[y])[0]; ref=a[y,xs.max()+2:xs.max()+5].mean(0)
        a[y,xs]=ref.astype(int)
    Image.fromarray(a.astype(np.uint8)).convert(mode).save(p,optimize=True)
