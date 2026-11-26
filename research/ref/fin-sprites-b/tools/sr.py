import cv2,sys,numpy as np
from PIL import Image, ImageFilter
sr=cv2.dnn_superres.DnnSuperResImpl_create(); sr.readModel('/workspace/work/fsb/EDSR_x4.pb'); sr.setModel('edsr',4)
def up(pil, out=512, sharpen=True):
    rgb=np.asarray(pil.convert('RGB'))[:,:,::-1].copy()
    o=sr.upsample(rgb)[:,:,::-1]
    im=Image.fromarray(o).resize((out,out),Image.LANCZOS)
    if sharpen: im=im.filter(ImageFilter.UnsharpMask(radius=2,percent=60,threshold=2))
    return im
if __name__=='__main__':
    up(Image.open(sys.argv[1]), int(sys.argv[3]) if len(sys.argv)>3 else 512).save(sys.argv[2])
