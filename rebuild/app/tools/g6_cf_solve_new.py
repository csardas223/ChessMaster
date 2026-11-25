import sys; sys.path.insert(0,'/tmp/cm_cf/rebuild/app/tools')
import g6_cf_levels as S
exec(open(__import__('os').path.join(__import__('os').path.dirname(__file__),'g6_cf_new_levels.py')).read())
for k in sys.argv[1:]:
    v=NEW[k]; v.setdefault('name',k)
    sol,n=S.solve(v, limit=1500000, greedy='--g' in sys.argv[0:0] or v.get('greedy',False))
    print(k,'states',n,('SOLVED %d: '%len(sol)+' '.join(S.fmt(m) for m in sol)) if sol else 'NOT SOLVED',flush=True)
