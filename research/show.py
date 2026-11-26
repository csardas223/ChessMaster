import sys,re,json,os
id=sys.argv[1]; maxc=int(sys.argv[2]) if len(sys.argv)>2 else 10**9
h=open('/workspace/work/cm.html',encoding='utf-8').read()
m=re.search(r'^"'+re.escape(id)+r'":\{.*$',h,re.M)
print('MAP:',m.group(0)[:700] if m else None)
if m:
    mode=re.search(r'"mode":"([^"]+)"',m.group(0)).group(1)
    k=mode.split(':')[0]
    n=0
    for line in h.split('\n'):
        if ("'"+k+"'" in line or line.strip().startswith(k+':')) and not line.startswith('"'):
            print('IMPL:',line.strip()[:600]); n+=1
            if n>=4: break
p=f'/workspace/web/downloads/{id}.en.srt'
if not os.path.exists(p): print('NO SRT'); sys.exit()
s=open(p,encoding='utf-8').read()
blocks=re.split(r'\n\s*\n',s.strip()); seen=set(); out=[];last=None;cur=''
for b in blocks:
    L=b.split('\n')
    if len(L)<3: continue
    t=L[1][:8]; txt=L[-1].strip()
    if txt in seen: continue
    seen.add(txt)
    mn=t[3:8]
    if mn!=last and (last is None or len(cur)>300):
        out.append(cur); cur='['+mn+'] '; last=mn
    cur+=txt+' '
out.append(cur)
txt='\n'.join(x for x in out if x)
txt=re.sub(r'\s+\n','\n',txt)
print(txt[:maxc])
