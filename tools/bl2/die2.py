import numpy as np, io, cairosvg
from PIL import Image, ImageFilter
from scipy import ndimage as nd
ex=Image.open('/workspace/work/cm_bl-2/assets/modes/exMFzra96vo/die.png').convert('RGBA')
A=np.array(ex)
# background: exMF die with the knight region replaced; rebuild bg as radial profile sampled from exMF
S=512; yy,xx=np.mgrid[0:S,0:S]; 
# sample radial colour profile along the diagonal top-left where no knight
cx=cy=S/2
r=np.hypot(xx-cx,yy-cy)
prof=[]
for i in range(0,363):
    t=i/362; x=int(cx-(cx-6)*t*0.7071*1.0); y=int(cy-(cy-6)*t*0.7071*1.0)
prof=None
bg=A.copy()
# knight mask = non-red pixels inside (black or white)
rgb=A[...,:3].astype(int); isred=(rgb[...,0]>rgb[...,1]+40)
inner=(A[...,3]>0)
mask=inner&~isred
mask=nd.binary_dilation(mask,iterations=6)
# fill masked area by radial average of red at the same radius
rr=r.astype(int); fillcol=np.zeros((rr.max()+1,3)); 
ok=inner&~mask
for c in range(3):
    s=np.bincount(rr[ok],weights=A[...,c][ok],minlength=rr.max()+1); n=np.bincount(rr[ok],minlength=rr.max()+1)
    fillcol[:,c]=np.where(n>0,s/np.maximum(n,1),0)
# interpolate empty radii
for c in range(3):
    v=fillcol[:,c]; idx=np.where(v>0)[0]; fillcol[:,c]=np.interp(np.arange(len(v)),idx,v[idx])
bg[...,:3][mask]=fillcol[rr[mask]].astype(np.uint8)
bgim=Image.fromarray(bg,'RGBA')
svg=open('/workspace/work/cm_bl-2/assets/pieces/cburnett/bQ.svg').read()
png=cairosvg.svg2png(bytestring=svg.encode(),output_width=1600,output_height=1600)
q=Image.open(io.BytesIO(png)).convert('RGBA')
qa=np.array(q.getchannel('A'))>40
ol=nd.binary_dilation(qa,iterations=38)
ol=nd.binary_fill_holes(ol)
olim=Image.fromarray((ol*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
white=Image.new('RGBA',q.size,(255,255,255,255)); white.putalpha(olim)
comp=Image.new('RGBA',q.size,(0,0,0,0)); comp.alpha_composite(white); comp.alpha_composite(q)
bb=comp.getbbox(); comp=comp.crop(bb)
# size like exMF knight: measure its bbox
kb=Image.fromarray((nd.binary_dilation(inner&~isred,iterations=1)*255).astype(np.uint8)).getbbox()
kh=kb[3]-kb[1]; kw=kb[2]-kb[0]
sc=0.74*512/comp.width
comp=comp.resize((round(comp.width*sc),round(comp.height*sc)),Image.LANCZOS)
out=bgim.copy(); out.alpha_composite(comp,((S-comp.width)//2,(S-comp.height)//2))
out.save('out/die.png'); print(kb, comp.size)
