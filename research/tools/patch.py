import sys,json
R='/workspace/work/chessmaster/research'
for d in json.loads(sys.stdin.read()):
    p=f"{R}/modes/{d['id']}.json";j=json.load(open(p))
    for k,v in d.items():
        if k!='id': j[k]=v
    json.dump(j,open(p,'w'),indent=1,ensure_ascii=False);print('patched',d['id'])
