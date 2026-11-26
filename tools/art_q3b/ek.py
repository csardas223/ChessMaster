import numpy as np, sys
from PIL import Image
from scipy import ndimage as nd
def keep_near_main(p, r, out=None, thr=40):
    im=Image.open(p).convert('RGBA'); a=np.array(im)
    m=a[...,3]>thr; lab,n=nd.label(m,np.ones((3,3))); sz=nd.sum(m,lab,range(1,n+1))
    main=lab==(1+np.argmax(sz))
    near=nd.distance_transform_edt(~main)<=r
    a[...,3]=np.where(near,a[...,3],0)
    if r>0:  # drop specks left that no longer touch anything big
        m=a[...,3]>thr; lab,n=nd.label(m,np.ones((3,3)))
        for k in range(1,n+1):
            if (lab==k).sum()<12: a[...,3][lab==k]=0
    a[a[...,3]==0]=0
    Image.fromarray(a).save(out or p, optimize=True)
if __name__=='__main__':
    keep_near_main(sys.argv[1], int(sys.argv[2]))
