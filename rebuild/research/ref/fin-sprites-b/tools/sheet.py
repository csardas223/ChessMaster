exec(open('/workspace/work/fsb/h2list.py').read())
import json,os,sys
from PIL import Image,ImageDraw
A='/workspace/work/fin2_fx_b/rebuild/app/'
rows=json.load(open('art_rows.json')); m={x['p']:x for x in json.load(open('art_metrics.json'))}
S=set(H2); sp={}
for g,i,ps in rows:
  if i in S:
    for p in ps:
      if p in m and p.split('/')[2] in S and not p.endswith('.svg'): sp[p]=m[p]
TH=float(sys.argv[1]) if len(sys.argv)>1 else 15
L=sorted([p for p in sp if sp[p]['sharp']<TH], key=lambda p: sp[p]['sharp'])
print(len(sp),len(L))
json.dump(L,open('cand.json','w'),indent=0)
C=8;T=200
for k in range(0,len(L),40):
  ch=L[k:k+40]; R=(len(ch)+C-1)//C
  sh=Image.new('RGB',(C*T,R*(T+30)),(60,60,60)); d=ImageDraw.Draw(sh)
  for j,p in enumerate(ch):
    x,y=(j%C)*T,(j//C)*(T+30)
    for a in range(0,T,20):
      for b in range(0,T,20):
        d.rectangle([x+a,y+b,x+a+19,y+b+19],fill=(200,200,200) if (a+b)//20%2 else (150,150,150))
    try:
      im=Image.open(A+p).convert('RGBA'); im.thumbnail((T,T))
      sh.paste(im,(x+(T-im.width)//2,y+(T-im.height)//2),im)
    except Exception as e: d.text((x+5,y+5),str(e)[:30],fill='red')
    d.text((x+3,y+T+2),'%d %s'%(k+j,p.split('/',2)[2][:30]),fill='white')
    d.text((x+3,y+T+15),'%dx%d s%.1f b%.2f'%(sp[p]['w'],sp[p]['h'],sp[p]['sharp'],sp[p]['bord']),fill='yellow')
  sh.save('sheet_%02d.png'%(k//40))
