from PIL import Image
def fit(im, size=512, frac=0.90, bottom_flush=False):
    im=im.convert('RGBA'); bb=im.getchannel('A').point(lambda a:255 if a>8 else 0).getbbox(); im=im.crop(bb)
    w,h=im.size; s=size*frac/max(w,h); im=im.resize((max(1,round(w*s)),max(1,round(h*s))),Image.LANCZOS)
    c=Image.new('RGBA',(size,size),(0,0,0,0)); x=(size-im.width)//2
    y=size-im.height if bottom_flush else (size-im.height)//2
    c.alpha_composite(im,(x,y)); return c
def preview(paths,out,bg=((118,150,86),(238,238,210))):
    n=len(paths); c=Image.new('RGB',(n*260,520),(255,255,255))
    for i,p in enumerate(paths):
        im=Image.open(p).convert('RGBA')
        for j,col in enumerate(bg+((30,30,30),)):
            t=Image.new('RGBA',(256,170) if False else (256,170),col+(255,))
            s=im.copy(); s.thumbnail((170,170)); t.alpha_composite(s,((256-s.width)//2,0)); c.paste(t.convert('RGB'),(i*260,j*172))
    c.save(out)
