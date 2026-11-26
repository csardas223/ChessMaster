# regenerate sprite-sweep flags (fin-sprites-b, original detect.py lost): piece/token img refs only
import re,glob,os,json,numpy as np
from PIL import Image
os.chdir('/workspace/work/fin_sprites_b/rebuild/app')
refs={}
SKIP=re.compile(r'(intro|ending|board|bg|background|thumb|rulebook|card|floor|wall|tile|grass|dark|light|map|frame|title|shop|you_win|banner)',re.I)
for f in glob.glob('data/modes/*.js'):
    s=open(f).read()
    for m in re.finditer(r"img\s*:\s*(\{[^}]*\}|'[^']*'|\"[^\"]*\")",s):
        for p in re.findall(r"assets/[^'\"]+\.(?:png|webp)",m.group(1)):
            refs.setdefault(p,set()).add(os.path.basename(f)[:-3])
rows=[]
for p,ids in refs.items():
    if SKIP.search(os.path.basename(p)) or not os.path.exists(p): continue
    im=Image.open(p).convert('RGBA'); a=np.asarray(im)[...,3]; h,w=a.shape
    b=np.concatenate([a[0],a[-1],a[:,0],a[:,-1]]); opq=(b>200).mean()
    corners=sum(a[y,x]>200 for y in (0,h-1) for x in (0,w-1))
    run=max(max((a[e]>200).sum() for e in (0,-1)), max((a[:,e]>200).sum() for e in (0,-1)))/max(h,w)
    score=opq+corners*.1+(run>.4)*.3
    if opq>.25 or corners>=2 or run>.4: rows.append((round(score,2),p,w,h,round(opq,2),corners,round(run,2),sorted(ids)))
rows.sort(reverse=True)
with open('/workspace/work/sprite_sweep_out/flagged2.md','w') as o:
    for r in rows: o.write(f"- [ ] score {r[0]} `{r[1]}` {r[2]}x{r[3]} opaque-border {r[4]} corners {r[5]} edge-run {r[6]} used by {','.join(r[7])}\n")
print(len(refs),len(rows))
