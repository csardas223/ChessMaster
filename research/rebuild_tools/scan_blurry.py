import os,glob,json,re
from PIL import Image,ImageFilter,ImageStat
SKIP=re.compile(r'(intro|ending|board|bg|background|thumb|rulebook|card|shop|frame|map|banner)',re.I)
used=set()
for f in glob.glob('data/modes/*.js'):
    t=open(f,errors='ignore').read()
    for m in re.findall(r'assets/modes/[^\'"\s)]+\.(?:png|jpg|jpeg|webp)',t): used.add(m)
    mid=os.path.basename(f)[:-3]
    for m in re.findall(r'[\'"]([\w\-.]+\.(?:png|jpg|jpeg|webp))[\'"]',t): used.add(f'assets/modes/{mid}/{m}')
out=[]
for p in sorted(glob.glob('assets/modes/*/*.*')+glob.glob('assets/avatars/*.*')+glob.glob('assets/img/*.*')):
    if not p.lower().endswith(('.png','.jpg','.jpeg','.webp')) or SKIP.search(os.path.basename(p)): continue
    try: im=Image.open(p).convert('RGBA')
    except Exception: continue
    w,h=im.size; a=im.split()[3]; bb=a.getbbox() or (0,0,w,h)
    sub=im.crop(bb); g=sub.convert('L'); sw,sh=sub.size
    reasons=[]
    if max(sw,sh)<128: reasons.append(f'lowres {sw}x{sh}')
    # upscale detection: downscale by 2 and back; little loss => soft
    if sw>=32 and sh>=32:
        small=g.resize((max(1,sw//2),max(1,sh//2)),Image.LANCZOS).resize((sw,sh),Image.LANCZOS)
        diff=ImageStat.Stat(Image.eval(Image.blend(g,small,0.5),lambda x:x)).mean[0]
        import numpy as np
        A=np.asarray(g,float);B=np.asarray(small,float);m=np.asarray(sub.split()[3])>32
        loss=float(np.abs(A-B)[m].mean()) if m.any() else 99
        lap=np.asarray(g.filter(ImageFilter.FIND_EDGES),float)[m]
        sharp=float(lap.var()) if m.any() else 999
        if loss<1.6 and sharp<300: reasons.append(f'soft (loss {loss:.2f}, edge var {sharp:.0f})')
    if reasons: out.append({'file':p,'size':f'{w}x{h}','used_by_mode_file':p in used,'reasons':reasons})
json.dump(out,open('../research/blurry_sprites.json','w'),indent=1)
with open('../research/BLURRY_SPRITES.md','w') as f:
    f.write('# Blurry / low-res sprites marked for replacement (auto scan 2026-11-25)\n\nOwner rule: replace each with the same image found on the web, else the best alternate, else a composite from clean parts. Transparent PNG >= 512px, centred ~90%, sources in source.notes. Intro/ending/board/background/thumb/card images are skipped. Tick a line when replaced.\n\n')
    for o in sorted(out,key=lambda o:(not o['used_by_mode_file'],o['file'])):
        f.write(f"- [ ] `{o['file']}` ({o['size']}) {'; '.join(o['reasons'])}{'' if o['used_by_mode_file'] else ' (not referenced by name)'}\n")
print(len(out), sum(o['used_by_mode_file'] for o in out))
