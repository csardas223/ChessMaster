import sys
exec(open('/workspace/work/fsb/cc.py').read().split("if __name__")[0])
ref=Image.open(sys.argv[1]).convert('RGB')
for u in sys.argv[2:]:
    im,a,err=avatar(u)
    if im is None: print(u,'none',err); continue
    im.save('cand_'+u+'.png'); print(u,round(sim(ref,im),1),im.size,a)
