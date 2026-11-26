# fUQXSj5jVUk: Xiangqi chariot + cannon discs. Line art = exact xiangqi.com graphical-piece icons from its help page
# (https://www.xiangqi.com/media/en/pages/help__pieces-and-moves/chariots.png, .../cannon.w1439.webp; same icons as the
# video's xiangqi.com frames), keyed white-on-red and laid on the flat disc of the existing set (general_r/_b.png, cut from
# the video's maxres thumbnail), so all pieces share one style. Advisor = the crowned-figure disc that was wrongly wired as chariot.
import numpy as np, sys
from PIL import Image
from scipy import ndimage as nd
M=sys.argv[1]
def icon(f, box):
    a=np.array(Image.open(f).convert('RGB').crop(box)).astype(float)
    r,g,b=a[...,0],a[...,1],a[...,2]
    red=(r>110)&(r-g>50)&(r-b>50)
    red=nd.binary_opening(red, np.ones((7,7)))
    lab,n=nd.label(red); sz=nd.sum(red,lab,range(1,n+1)); red=lab==(1+np.argmax(sz))
    filled=nd.binary_fill_holes(red)
    ys,xs=np.nonzero(filled); cx,cy=xs.mean(),ys.mean(); R=np.sqrt(filled.sum()/np.pi)
    # whiteness inside the disc (icon lines): low saturation, bright; alpha by distance from disc red
    mn=a.min(2); w=np.clip((mn-60)/(200-60),0,1)
    yy,xx=np.mgrid[:a.shape[0],:a.shape[1]]
    w[(xx-cx)**2+(yy-cy)**2>(R*0.86)**2]=0
    return w,cx,cy,R
def make(name, f, box, out_r, out_b, tweak=1.0):
    w,cx,cy,R=icon(f,box)
    print(name,'web disc R',round(R,1))
    for src,out in ((out_r,'r'),(out_b,'b')):
        base=Image.open(f'{M}/general_{out}.png').convert('RGBA'); A=np.array(base).astype(float)
        col=A[30,120,:3] if out=='r' else A[30,120,:3]
        # flat disc: every opaque pixel -> disc colour, keep alpha (antialiased edge)
        disc=A.copy(); disc[...,:3]=np.where(A[...,3:]>0, col, 0)
        ys,xs=np.nonzero(A[...,3]>128); D=(xs.max()-xs.min()+1); OC=((xs.max()+xs.min())/2,(ys.max()+ys.min())/2)
        s=(D/2)/R*tweak
        W=Image.fromarray((w*255).astype(np.uint8)).resize((round(w.shape[1]*s),round(w.shape[0]*s)),Image.LANCZOS)
        ww=np.zeros(A.shape[:2]); Wa=np.array(W).astype(float)/255
        ox=round(OC[0]-cx*s); oy=round(OC[1]-cy*s)
        h,wd=Wa.shape; y0,x0=max(0,oy),max(0,ox); y1,x1=min(A.shape[0],oy+h),min(A.shape[1],ox+wd)
        ww[y0:y1,x0:x1]=Wa[y0-oy:y1-oy,x0-ox:x1-ox]
        ww=np.clip((ww-0.15)/0.7,0,1)  # crisper lines after upscale
        line=np.array([245,245,245.])
        disc[...,:3]=disc[...,:3]*(1-ww[...,None])+line*ww[...,None]
        Image.fromarray(disc.astype(np.uint8)).save(f'{M}/{name}_{out}.png',optimize=True)
make('chariot','xw_chariots.png',(255,676,432,852),None,None)
make('cannon','xw_cannon.w1439.webp',(822,462,944,577),None,None)
