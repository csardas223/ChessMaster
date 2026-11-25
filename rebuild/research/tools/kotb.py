import json,sys,subprocess
base=json.load(open('/workspace/work/chessmaster/research/modes/WEYUcaJTBso.json'))
x=json.loads(sys.stdin.read())
d={k:v for k,v in base.items()}
d['rules']=x.pop('extra_rules',[])+["Base game rules as in WEYUcaJTBso (King of the Bridge): accusation via Space + rule book; correct accusation = you may cheat once; false accusation = turn forfeited + troll revenge cheat; pawns move orthogonally (forward/back/sideways) not diagonally; only knights jump; only bishops may go 'out of town' off-board; troll king death passes crown to another piece; queen can't take king; slippery tiles; board flips."]
d['current_impl_issues']=x.pop('issues')
d['vfx_timeline']=x.pop('vfx',[])+[{"trigger":"see base","effect":"all base King of the Bridge VFX (rule unlock gong, accusation mode, piece falls on slippery tile, board flip, ascend on capture)","duration_ms":None,"sound":"gong on rule unlock","source":"WEYUcaJTBso"}]
d.update(x)
print(json.dumps(d))
