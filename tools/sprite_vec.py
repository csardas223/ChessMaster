# Clean re-trace of a small flat icon: palette-quantise, potrace each colour layer, re-render at 512px (hard AA edges, no fading).
import sys, io, numpy as np, potrace, cairosvg
from PIL import Image, ImageFilter
def path_d(bm, turd=4, alpha=1.0):
    p = potrace.Bitmap(~bm).trace(turdsize=turd, alphamax=alpha, opticurve=True, opttolerance=0.2)
    d=[]
    for c in p:
        s=c.start_point; d.append(f'M{s.x:.2f},{s.y:.2f}')
        for seg in c.segments:
            if seg.is_corner: d.append(f'L{seg.c.x:.2f},{seg.c.y:.2f}L{seg.end_point.x:.2f},{seg.end_point.y:.2f}')
            else: d.append(f'C{seg.c1.x:.2f},{seg.c1.y:.2f} {seg.c2.x:.2f},{seg.c2.y:.2f} {seg.end_point.x:.2f},{seg.end_point.y:.2f}')
        d.append('Z')
    return ' '.join(d)
def kmeans(X, k, it=25, init=None):
    rng=np.random.default_rng(0)
    C = np.array(init,float) if init is not None else X[rng.choice(len(X),k,replace=False)]
    for _ in range(it):
        lab=((X[:,None,:]-C[None])**2).sum(-1).argmin(1)
        for j in range(len(C)):
            if (lab==j).any(): C[j]=X[lab==j].mean(0)
    return C, lab
def vec(src, out, k=2, up=6, size=512, frac=0.9, palette=None, bg=None, base=None, turd=None, keep_canvas=False, alpha_thr=128, smooth=0.5, lab_smooth=0, drop=None):
    im=Image.open(src).convert('RGBA')
    if bg is not None:  # key out a flat background colour
        a=np.array(im).astype(float); dist=np.sqrt(((a[...,:3]-np.array(bg))**2).sum(-1)); a[...,3]=np.where(dist<bg_tol,0,a[...,3]); im=Image.fromarray(a.astype(np.uint8))
    W,H=im.size; big=im.resize((W*up,H*up),Image.LANCZOS)
    A=np.array(big).astype(float)
    al=np.array(big.getchannel('A').filter(ImageFilter.GaussianBlur(up*smooth))).astype(float) if smooth else A[...,3]
    opaque=al>=alpha_thr
    X=A[...,:3][opaque]
    C,lab=kmeans(X,k,init=palette)
    L=np.full(opaque.shape,-1); L[opaque]=lab
    if lab_smooth:
        st=np.stack([np.array(Image.fromarray(((L==j)*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(up*lab_smooth))) for j in range(k)])
        L=np.where(opaque, st.argmax(0), -1)
    # smooth label map with a mode filter to avoid speckle
    if drop:
        dl=[j for j in range(k) if min(np.sqrt(((C[j]-np.array(d))**2).sum()) for d in drop)<70]
        print('drop',[C[j].astype(int).tolist() for j in dl])
        for j in dl: opaque&=(L!=j)
        opaque=np.array(Image.fromarray(opaque.astype(np.uint8)*255).filter(ImageFilter.MedianFilter(5)))>0
        L=np.where(opaque,L,-1)
        if lab_smooth:
            keep=[j for j in range(k) if j not in dl]
            for j in dl: st[j]=0
            L=np.where(opaque, st.argmax(0), -1)
    if base is None:  # base = colour most common on the silhouette border
        er=np.array(Image.fromarray(opaque.astype(np.uint8)*255).filter(ImageFilter.MinFilter(5)))>0
        border=opaque & ~er; base=np.bincount(L[border],minlength=k).argmax()
    order=[base]+[j for j in np.argsort([-(L==j).sum() for j in range(k)]) if j!=base]
    turd=turd if turd is not None else 2*up*up
    paths=[]
    for i,j in enumerate(order):
        m = opaque if i==0 else (L==j)
        if i>0: m=np.array(Image.fromarray(m.astype(np.uint8)*255).filter(ImageFilter.MaxFilter(3)))>0  # slight overlap, no seams
        m=m & opaque
        col='#%02x%02x%02x'%tuple(int(round(v)) for v in C[j])
        paths.append(f'<path fill="{col}" fill-rule="evenodd" d="{path_d(m,turd)}"/>')
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{W*up}" height="{H*up}" viewBox="0 0 {W*up} {H*up}">'+''.join(paths)+'</svg>'
    open(out+'.svg','w').write(svg)
    R=2048 if not keep_canvas else None
    png=cairosvg.svg2png(bytestring=svg.encode(), output_width=W*up*4//up*8, output_height=H*up*4//up*8)
    r=Image.open(io.BytesIO(png)).convert('RGBA')
    if keep_canvas:
        sc=max(size/W,size/H); r=r.resize((round(W*sc),round(H*sc)),Image.LANCZOS); r.save(out); return out
    bb=r.getbbox(); r=r.crop(bb); w,h=r.size; sc=size*frac/max(w,h)
    r=r.resize((round(w*sc),round(h*sc)),Image.LANCZOS)
    c=Image.new('RGBA',(size,size),(0,0,0,0)); c.paste(r,((size-r.size[0])//2,(size-r.size[1])//2),r); c.save(out); return out
bg_tol=40
if __name__=='__main__':
    vec(sys.argv[1], sys.argv[2], k=int(sys.argv[3]) if len(sys.argv)>3 else 2)
