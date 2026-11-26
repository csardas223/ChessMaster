from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import numpy as np
A='/workspace/work/fin_sprites_a/assets/modes/'
def save(img,p,mode='RGB'):
    img=img.convert(mode); img.save(A+p); print(p,img.size,img.mode)
def fit_photo(src,p,mode='RGB',dark=None):
    im=Image.open(src).convert('RGB').resize((512,512),Image.LANCZOS)
    if dark: im=ImageEnhance.Brightness(im).enhance(dark)
    save(im,p,mode)
fit_photo('fsa_5K72.png','5K72RRDBN5U/opponent.png')
fit_photo('fsa_88Cg.png','88CgS9anXJs/opponent.png')
fit_photo('fsa_Oj5r.png','Oj5rYPqpldg/opponent.png')
fit_photo('fsa_QrKI.png','QrKIKcYN5m4/opponent.png')
fit_photo('fsa_redpanda.png','UZ79sKLa6z4/redpanda.png')
fit_photo('fsa_nFYopp3.png','nFY-Hn6xiOI/opp3.png')
fit_photo('fsa_sphere.png','98Fzc7uQ7Ns/sphereplays.png')
fit_photo('fsa_trout.png','inm7KvllVu0/stockfish.png','RGBA')
fit_photo('fsa_trees.png','3_eutZExN2c/opponent.png')
fit_photo('fsa_GH9t.png','GH9tTFMWEUg/opponent.png')
fit_photo('fsa_f4Oopp1.png','f4O--Ai7B9A/opp1.png',dark=0.55)
fit_photo('fsa_sleepy.png','LfzNhUjl3qE/sleepy_martin.png','RGBA')
# bot icon: keep full square, RGBA
fit_photo('fsa_boticon.png','boaA9_TjXeU/bot_icon.png','RGBA')
save(Image.open('5d512.png'),'BbgwPj-u_gs/opponent.png')
save(Image.open('mona512.png'),'8XmhGMnypjc/opponent.png')
# goomba (SMB1 sprite, mirrored like the avatar)
g=np.array(Image.open('goomba_smb.png').convert('RGBA'))[:, ::-1]
cols={(153,78,0):(104,72,24),(255,204,197):(224,194,136),(0,0,0):(14,8,3)}
out=Image.new('RGB',(512,512),(166,130,91)); d=ImageDraw.Draw(out); cell=30; off=16
for y in range(16):
    for x in range(16):
        r,gg,b,al=g[y,x]
        if al<128: continue
        d.rectangle((off+x*cell,off+y*cell,off+x*cell+cell-1,off+y*cell+cell-1),fill=cols[(int(r),int(gg),int(b))])
save(out,'YZjdissxTyA/opponent.png')
# J letter avatar (chess.com letter style), drawn at 4x
S=2048; im=Image.new('RGB',(S,S),(87,88,121)); d=ImageDraw.Draw(im)
d.rounded_rectangle((int(4/96*S),int(5/96*S),int(91/96*S),int(92/96*S)),radius=int(6/96*S),fill=(91,102,188))
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',int(44/96*S))
bb=d.textbbox((0,0),'J',font=f); w=bb[2]-bb[0]; h=bb[3]-bb[1]
d.text((S/2-w/2-bb[0], S/2-h/2-bb[1]),'J',font=f,fill=(250,250,252))
save(im.resize((512,512),Image.LANCZOS),'ZP5cnusxKgA/opponent.png')
# slingshot: transparent, fit 90%
sl=Image.open('fsa_sling.png').convert('RGBA'); bb=sl.getbbox(); sl=sl.crop(bb)
k=460/max(sl.size); sl=sl.resize((round(sl.size[0]*k),round(sl.size[1]*k)),Image.LANCZOS)
c=Image.new('RGBA',(512,512),(0,0,0,0)); c.alpha_composite(sl,((512-sl.size[0])//2,(512-sl.size[1])//2)); save(c,'Ugw05nktuDM/slingshot.png','RGBA')
# solo chess: dark panel + title + official icon redraw
S=1024; im=Image.new('RGBA',(S,S),(38,37,34,255)); d=ImageDraw.Draw(im)
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',120)
bb=d.textbbox((0,0),'Solo Chess',font=f); d.text(((S-(bb[2]-bb[0]))/2-bb[0],40-bb[1]),'Solo Chess',font=f,fill=(255,255,255,255))
ic=Image.open('fsa_solo_icon.png').convert('RGBA'); ic=ic.crop(ic.getbbox()); k=760/max(ic.size); ic=ic.resize((round(ic.size[0]*k),round(ic.size[1]*k)),Image.LANCZOS)
im.alpha_composite(ic,((S-ic.size[0])//2,220)); save(im.resize((512,512),Image.LANCZOS),'DoImibR93tA/solo.png','RGBA')
# swamp: two-colour crisp rebuild at 2x
sw=Image.open(A+'hv_NHWqysZE/swamp.jpg').convert('L')
big=sw.resize((sw.size[0]*2,sw.size[1]*2),Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.5))
a=np.array(big).astype(float); thr=(a.min()+a.max())/2 if False else None
src=np.array(Image.open(A+'hv_NHWqysZE/swamp.jpg').convert('RGB')).astype(float)
L=src.mean(2); lo=src[L<np.percentile(L,30)].mean(0); hi=src[L>np.percentile(L,75)].mean(0)
t=(np.array(big).astype(float)); th=(np.percentile(L,30)+np.percentile(L,75))/2
m=t>th
o=np.where(m[...,None],hi,lo).astype(np.uint8)
Image.fromarray(o).save(A+'hv_NHWqysZE/swamp.jpg',quality=92); print('swamp',o.shape,lo.astype(int),hi.astype(int))
