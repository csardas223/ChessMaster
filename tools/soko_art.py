# s6-soko: flat Soko Chess piece/target art drawn for this project (own work, Apache-2.0 like the code).
from PIL import Image, ImageDraw, ImageFilter
S=512; SS=4; N=S*SS
import os
A=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'assets/modes/7lEglazTlo8/')
def rook_mask():
    im=Image.new('L',(N,N),0); d=ImageDraw.Draw(im); u=N/512
    P=lambda pts:[(x*u,y*u) for x,y in pts]
    d.rounded_rectangle(P([(96,404),(416,470)])[0]+P([(96,404),(416,470)])[1],radius=18*u,fill=255)
    d.polygon(P([(150,404),(362,404),(338,214),(174,214)]),fill=255)
    d.rounded_rectangle([118*u,150*u,394*u,226*u],radius=12*u,fill=255)
    for x0 in (118,212,306):
        d.rounded_rectangle([x0*u,62*u,(x0+88)*u,170*u],radius=12*u,fill=255)
    return im
def pawn_mask():
    src=Image.open(A+'pawn_b.png').convert('RGBA').resize((N,N),Image.LANCZOS)
    return src.split()[3]
def bishop_mask():
    im=Image.new('L',(N,N),0); d=ImageDraw.Draw(im); u=N/512
    d.rounded_rectangle([96*u,404*u,416*u,470*u],radius=18*u,fill=255)
    d.polygon([(160*u,404*u),(352*u,404*u),(300*u,300*u),(212*u,300*u)],fill=255)
    d.ellipse([150*u,120*u,362*u,330*u],fill=255)
    d.ellipse([222*u,48*u,290*u,116*u],fill=255)
    d.line([(285*u,150*u),(225*u,240*u)],fill=0,width=int(26*u))
    return im
def out(mask,fill,name,outline=None,ow=22):
    m=mask
    img=Image.new('RGBA',(N,N),(0,0,0,0))
    if outline:
        big=m.filter(ImageFilter.MaxFilter(ow*SS//2*2+1))
        img.paste(Image.new('RGBA',(N,N),outline),(0,0),big)
    img.paste(Image.new('RGBA',(N,N),fill),(0,0),m)
    # fit to ~90% box, centred
    img=img.resize((S,S),Image.LANCZOS)
    bb=img.getbbox(); c=img.crop(bb); k=0.9*S/max(c.size); c=c.resize((int(c.size[0]*k),int(c.size[1]*k)),Image.LANCZOS)
    o=Image.new('RGBA',(S,S),(0,0,0,0)); o.alpha_composite(c,((S-c.size[0])//2,(S-c.size[1])//2)); o.save(A+name)
BLACK=(10,8,18,255); YEL=(240,240,40,255); RED=(205,16,64,255); GRN=(160,240,90,255); WH=(240,246,255,255); OUT=(70,40,140,255)
r=rook_mask(); p=pawn_mask(); b=bishop_mask()
out(r,BLACK,'rook_b.png'); out(r,YEL,'rook_y.png'); out(r,RED,'target_rook_red.png'); out(r,GRN,'target_rook_green.png')
out(r,WH,'rook_w.png',OUT); out(p,WH,'pawn_w.png',OUT); out(b,WH,'bishop_w.png',OUT)
out(p,YEL,'pawn_y.png'); out(p,GRN,'target_green.png')
