# impl-4 report (group 4: Other + Variants A, research/impl_4.json, 85 ids)

Status: IN PROGRESS (updated 2026-11-24 ~22:20 ET)

## Pass 1
- Before this session: 57/85 had mode files. This session added 17 so far (74/85):
  Chess Ultimate x9 (CxtttdnwNWk F0nfkeR-QEg FxpWhTj2Cv4 ehlf0_asIKo onr_ABfEMGk pPQDMtvu5rk w4L_Obw74dE wwVvGHfEfPI 1_FSHqyc904, shared js/modes/g4_cu.js),
  Pz5ZWCrUQyY (50 CC0 Lichess puzzles), DoImibR93tA + vvCAEWKttT4 (Solo Chess, js/modes/g4_solo.js),
  inm7KvllVu0 (portals), fUQXSj5jVUk (xiangqi), 7lEglazTlo8 (Soko Chess, original solvable levels), Cv28-UoZseg (low conf.), WXcmWG7Eczs (Anarchy, low conf.).
- Remaining pass 1 (video games): -TKJGtBKK8U, 0LO0D0rOif0, 1FKa1LnTDeQ, 4KetMbEVvhI, 1L_sxGgxX9M, 9M2Mj2WFFys, 9j7h5kF4X9s, AvZiSnngZjA, AWFB4EzGtDc, BbgwPj-u_gs, CONozr99agQ.

## Pass 2
- Not started.

## Shared files touched
- js/game/spec-game.js: added optional `hooks.onTap(ctx, sq, opts)` (one line, commented "impl-4"), used by Portal Chess.

## QA
- All 17 new modes load at 360/390 px, play 4 random moves, 0 console errors (harness copy at /workspace/work/g4tmp/qa.py, not committed).
