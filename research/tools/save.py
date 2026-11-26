import sys,json,os
R='/workspace/work/chessmaster/research'
data=json.loads(sys.stdin.read())
if isinstance(data,dict): data=[data]
keys=["id","title","category","summary","rules","win_condition","player_side","opponent","board","pieces","setup","events","visual_fx","current_impl_issues","confidence","evidence"]
opt=["official_site_url","vfx_timeline"]
for d in data:
    miss=[k for k in keys if k not in d]
    if miss: print('MISSING',d.get('id'),miss)
    d2={k:d.get(k) for k in keys}
    d2['official_site_url']=d.get('official_site_url')
    d2['vfx_timeline']=d.get('vfx_timeline',[])
    d=d2
    json.dump(d,open(f"{R}/modes/{d['id']}.json",'w'),indent=1,ensure_ascii=False)
    open(f'{R}/progress_batch4.txt','a').write(f"{d['id']}\t{d['confidence']}\t{d['title']}\n")
    print('saved',d['id'],d['confidence'])
