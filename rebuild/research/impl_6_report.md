# impl-6 report (group 6, Variants C): status at 2026-11-24 21:55 ET (owner wrap-up)

## Pass 1
- 86 of 87 ids in research/impl_6.json now have app/data/modes/<id>.js (54 existed before this session, 32 written now).
- Skipped: **xvlHij1tgk8 (Table Tactics)**: kind video_game, a 3D physics diorama tactics game with no chess board; needs a standalone js/games/ mini-game (frame 'game'). No mode file yet, so the legacy port still plays it.
- Written this session: h7UFq4r59tM, oejsLcLHwoA, mZUViBNWt6E, oGP4TUDjSVk, tsqxjK8GP10, xg_djfCrRes, sO-lD2On610, fqfCh3CsTJk, iUUoeJL1FvY, mf238p7c3bc, rMSar6g_2HY, dztzDlPfqSI, qZyNuiVbGMI, dkCMhNcZezM, p6W3yDU-v88, oAoik9Dj2qQ, xlErokL2-4c, zxRM5dD5b7w, qqvbb2r2k5I, iqfHW2_sMmc, zDFsnRE_Gig, hv_NHWqysZE, puKYAUl9x9s, ulE3YPZI9Sc, pzxXxIsKRRo, qDkxrnZfeXw, qSwTtgUWqUw, rcFGwuREQFY, rf2HSTXTehE, sGXmiyvZDE4, spJibM5qaNQ, zP9TzlgA-W0.
- Every new file carries `todo_pass2` (art, VFX, sounds, plus rule pieces not yet modelled).

## Shared hook libs (group 6)
- js/modes/g6_levels.js (new): level/round runs with Passant victory conditions (6 checks in a row, all non-king pieces captured, +7 material vs the starting balance for 2 turns), money counter, passColor / captureOnly (also per level via x), freezer (Courtisan), slippy badge, key/lock unlock, `portal` generator.
- js/modes/g6_bridge.js (new): King of the Bridge (troll rules, crown transfer, random troll cheats, rule unlock toasts, Rule 28 castle restriction, ascension counter).
- Read-only reuse of group 5's js/modes/g5_4pc.js by h7UFq4r59tM, oejsLcLHwoA, mZUViBNWt6E, oGP4TUDjSVk, tsqxjK8GP10, xg_djfCrRes (not edited).

## Pass 2
- Not started (0 modes). Next AI: `grep -l todo_pass2 app/data/modes/<group-6 ids>`; the 54 older group-6 files have no todo_pass2 key and were not re-audited for art.

## QA
- node tools/build-data.mjs --check: OK. Headless (my copy of tools/test_browser.py with the id list, 390px): all 32 new modes load and play 4 random moves with 0 console errors. 360px not run for these. Older 54 not re-run this session.
- Puzzle levels (Chessformer x2, Chess with Gravity, Beyond the Board, Knightmare) were checked solvable with a BFS over the engine.

## Low confidence / approximations
- sO-lD2On610 Pac-Man Chess (2 players, invented maze; rules unconfirmed), qqvbb2r2k5I Gambonanza, xg_djfCrRes Labyrinth 82 (invented walls, 8-check life not modelled), qSwTtgUWqUw Tiny 5D (no time travel), Passant x4 / Ouroboros / Shotgun King / Pawnbarian / Chess Survivors / Petrified Pawns / Knightmare are turn-based chess approximations of video games; Who Takes the Crown positions and puzzle layouts are original, not the video's.

## Files outside my group
- None edited (no engine/UI changes). Generated data/*.js not committed.
