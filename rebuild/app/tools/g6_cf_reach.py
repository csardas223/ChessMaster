import sys; sys.path.insert(0,__import__('os').path.dirname(__import__('os').path.abspath(__file__)))
import g6_cf_levels as S
from collections import deque
exec(open(__import__('os').path.join(__import__('os').path.dirname(__file__),'g6_cf_new_levels.py')).read())
lv=NEW[sys.argv[1]]; L=S.Level(lv); W=16
s0=L.start; seen={s0}; q=deque([s0]); best={}
while q:
    s=q.popleft()
    for mv,ns in L.succ(s):
        if ns and ns not in seen: seen.add(ns); q.append(ns)
# report highest reachable row per column for blue pieces
reach=set()
for s in seen:
    for i,ch in enumerate(s):
        if ch in S.BLUE: reach.add(i)
for r in range(10):
    print(''.join('X' if r*W+c in reach else s0[r*W+c] for c in range(16)))
print(len(seen))
