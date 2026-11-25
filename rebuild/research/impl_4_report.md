# impl-4 report (group 4: Other + Variants A, research/impl_4.json, 85 ids)

Status: STOPPED on owner's wrap-up (2026-11-24 ~21:55 ET). Resume from "Remaining" below.

## Pass 1: 79/85 done (22 added this session)
Added this session:
- Chess Ultimate x9: CxtttdnwNWk F0nfkeR-QEg FxpWhTj2Cv4 ehlf0_asIKo onr_ABfEMGk pPQDMtvu5rk w4L_Obw74dE wwVvGHfEfPI 1_FSHqyc904 (shared character rules js/modes/g4_cu.js; one representative draft per video)
- Pz5ZWCrUQyY 50 Puzzles (50 CC0 Lichess puzzles inline, black-to-move ones mirrored so you are always White)
- DoImibR93tA, vvCAEWKttT4 Solo Chess / speedrun (js/modes/g4_solo.js, levels generated backwards so always solvable)
- inm7KvllVu0 Portal Chess (double-tap places portals), fUQXSj5jVUk Xiangqi 9x10, 7lEglazTlo8 Soko Chess (6 original levels, BFS-verified solvable), Cv28-UoZseg Sergeant's Checkers, WXcmWG7Eczs Anarchy Chess
- AvZiSnngZjA, 9j7h5kF4X9s Shotgun King (js/modes/g4_shotgun.js: shoot cone, HP, shells, 12 floors, auto cards)
- 0LO0D0rOif0, 1FKa1LnTDeQ, 4KetMbEVvhI King of the Bridge endings (js/modes/g4_kotb.js: rule book, troll cheats, accusation by double-tap, payback cheat, ending checks)

Remaining pass 1 (6, all kind video_game):
- 1L_sxGgxX9M Passant [Conclusion]: chess frame; group 5 has js/modes/g5_passant.js (slippy/push badges, alt victory) - could reuse via hooks:'g5_passant' with rounds incl. Rainbow Bishop boss.
- 9M2Mj2WFFys Kung Fu Chess: real-time (no turns, per-piece cooldown); needs a game-frame module or onTick bot.
- AWFB4EzGtDc Gun King: top-down twin-stick shooter mini-game (frame:'game', js/games/g4_gunking.js).
- -TKJGtBKK8U Infinite Craft: crafting mini-game (recipe table from the spec, goal: craft "Chess").
- BbgwPj-u_gs 5D Chess: multiverse time travel - very large; consider skip-with-note or a reduced version.
- CONozr99agQ Battle Royale (Chess Arena): real-time 40-player; skip-with-note or reduced mini-game.
Note: js/games/ does not exist yet (no game-frame module has been written by anyone in this repo as of this push).

## Pass 2: 0 done
Every group-4 mode file with todo_pass2 still needs its art/VFX/sounds (grep todo_pass2 over impl_4.json ids). All 22 new files carry todo_pass2 lists (main items: original Chess Ultimate character SVGs, Xiangqi discs/intersection board, Shotgun King pixel sprites + card draft UI, King of the Bridge pixel scene/troll portrait/rule-book overlay, Solo Chess panel, Soko piece/target art, Sergeant pieces, Anarchy cartoon pieces, portal ring art).

## QA
- All 22 new modes: load at 360 and 390 px, 4 random player moves played (bot replies), 0 console errors (harness copy /workspace/work/g4tmp/qa.py, not committed; generated data/*.js not committed).
- Puzzles: solution lines verified playable for puzzles 1-4 (advances, score counts).
- Older 57 group-4 modes not re-run this session.

## Shared files touched outside group
- js/game/spec-game.js: one line in P.onTap adding optional hooks.onTap(ctx, sq, opts) (comment "impl-4"); used by Portal Chess and King of the Bridge.

## Low confidence
- Cv28-UoZseg (rules inferred, no transcript), WXcmWG7Eczs (start position inferred, Inverse Queen limited to range 3, Title Rooks either-side), Chess Ultimate (Giant is 1 square, no checker multi-jump, Prince double move and Devil autonomous minions not modelled, armies representative), Shotgun King (HP/cone/damage/cards approximations, generated floors), King of the Bridge (cheat types/rate inferred; slippery tiles, board flip, goose, gifts not modelled).
