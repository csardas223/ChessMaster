import sys,re,json,os
vid=sys.argv[1]; full=len(sys.argv)>2 and sys.argv[2]=='full'
R='/workspace/work/chessmaster/research'
b={v['id']:v for v in json.load(open(R+'/batch4.json'))}
v=b.get(vid,{}); print('META',v)
# current impl
html=open('/workspace/work/cm.html',encoding='utf-8').read()
m=re.search(r'^"'+re.escape(vid)+r'":(\{.*\}),?$',html,re.M)
print('IMPL',m.group(1) if m else 'NONE')
srt='/workspace/web/downloads/%s.en.srt'%vid
if not os.path.exists(srt):
    c=[f for f in os.listdir('/workspace/web/downloads') if f.startswith(vid) and f.endswith('.srt')]
    if not c: print('NO TRANSCRIPT');sys.exit()
    srt='/workspace/web/downloads/'+c[0]
txt=open(srt,encoding='utf-8',errors='ignore').read()
blocks=re.split(r'\n\s*\n',txt)
out=[];last=set()
for bl in blocks:
    ls=bl.strip().split('\n')
    if len(ls)<2 or '-->' not in ls[1]: 
        if len(ls)>=1 and '-->' in ls[0]: ls=['0']+ls
        else: continue
    t=ls[1].split(' --> ')[0][:8]
    for l in ls[2:]:
        l=l.strip()
        if l and l not in last: out.append((t,l))
    last=set(l.strip() for l in ls[2:])
# dedupe consecutive
lines=[];prev=None
for t,l in out:
    if l!=prev: lines.append((t,l))
    prev=l
words=sum(len(l.split()) for _,l in lines)
print('WORDS',words)
def para(ls):
    s='';cur=None
    for t,l in ls:
        if cur is None or len(s)>600: 
            if s: print('['+cur+']',s)
            s='';cur=t
        s+=l+' '
    if s: print('['+cur+']',s)
if full: para(lines);sys.exit()
N=int(sys.argv[3]) if len(sys.argv)>3 else 450
acc=0;head=[]
for t,l in lines:
    head.append((t,l));acc+=len(l.split())
    if acc>N: break
para(head)
kw=re.compile(r'\b(rule|rules|can only|cannot|can\'t|if you|whenever|every (turn|move)|win|wins|lose|checkmate|captur|spawn|level|ending|elo|rated|bot|promot|special|ability|instead|gravity|fall|explod|points?|score|timer|seconds|hp|health|damage|boss)\b',re.I)
print('---KEYWORD HITS (rest)---')
rest=lines[len(head):];hits=[(t,l) for t,l in rest if kw.search(l)]
step=max(1,len(hits)//14)
for t,l in hits[::step]: print('['+t+']',l)
