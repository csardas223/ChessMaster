#!/bin/bash
# push rebuild with fetch+rebase retries; resolve append conflicts by keeping both
cd /workspace/work/fin_sprites_b
for i in 1 2 3 4; do
  git fetch -q origin rebuild
  if ! git rebase -q origin/rebuild; then
    for f in $(git diff --name-only --diff-filter=U); do python3 /workspace/work/fsb/keepboth.py "$f"; git add "$f"; done
    GIT_EDITOR=true git rebase --continue || { echo REBASE_FAIL; exit 1; }
  fi
  git push -q origin rebuild && { git log --oneline -3; exit 0; }
done
echo PUSH_FAIL; exit 1
