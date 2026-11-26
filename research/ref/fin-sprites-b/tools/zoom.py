import sys
from PIL import Image,ImageDraw
A='/workspace/work/fin2_fx_b/rebuild/app/assets/modes/'
L=sys.argv[2:];T=380;C=4;R=(len(L)+C-1)//C
sh=Image.new('RGB',(C*T,R*(T+18)),(60,60,60));d=ImageDraw.Draw(sh)
for j,p in enumerate(L):
  x,y=(j%C)*T,(j//C)*(T+18)
  for a in range(0,T,20):
    for b in range(0,T,20): d.rectangle([x+a,y+b,x+a+19,y+b+19],fill=(200,200,200) if (a+b)//20%2 else (150,150,150))
  im=Image.open(A+p).convert('RGBA'); s=min(T/im.width,T/im.height); im=im.resize((int(im.width*s),int(im.height*s)),Image.NEAREST if s>1 else Image.LANCZOS)
  sh.paste(im,(x+(T-im.width)//2,y+(T-im.height)//2),im); d.text((x+3,y+T+3),p,fill='white')
sh.save(sys.argv[1])
