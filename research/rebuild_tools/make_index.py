# Regenerates rebuild/research/INDEX.md from research/modes/*.json (run from repo root)
import json,glob,os
rows=[]
for f in sorted(glob.glob('rebuild/research/modes/*.json')):
    d=json.load(open(f)); rows.append(f"| {os.path.basename(f)[:-5]} | {str(d.get('name') or d.get('title') or '')[:60].replace('|','/')} | {d.get('kind','variant')} | {'yes' if d.get('playable',True) else 'no'} | {d.get('confidence','?')} |")
open('rebuild/research/INDEX.md','w').write('# Research index\n\n| id | name | kind | playable | confidence |\n|---|---|---|---|---|\n'+'\n'.join(rows)+'\n')
