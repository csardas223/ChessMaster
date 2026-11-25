import json,sys,os
d={v['id']:v for v in json.load(open('batch1.json'))}
objs=json.loads(sys.stdin.read())
if isinstance(objs,dict): objs=[objs]
order=["id","title","category","summary","rules","win_condition","player_side","opponent","board","pieces","setup","events","visual_fx","current_impl_issues","confidence","evidence"]
for o in objs:
    v=d[o['id']]; o.setdefault('title',v['title']); o.setdefault('category',v['category'])
    o.setdefault('board',{}); b=o['board']
    for k,dv in [('files',8),('ranks',8),('shape_notes','standard 8x8'),('light','#eeeed2'),('dark','#769656'),('theme_notes','standard green chess.com-style board (inferred from channel format)')]: b.setdefault(k,dv)
    o.setdefault('pieces',{'set':'standard','custom_pieces':[]})
    o.setdefault('setup','rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    o.setdefault('events',[]); o.setdefault('visual_fx',[])
    out={k:o[k] for k in order if k in o}
    for k in o:
        if k not in out: out[k]=o[k]
    json.dump(out,open(f"modes/{o['id']}.json",'w'),indent=1,ensure_ascii=False)
    open('progress_batch1.txt','a').write(f"{o['id']}\t{o['confidence']}\t{v['title'][:60]}\n")
    print('wrote',o['id'],o['confidence'])
