# impl-4 report (group 4: Other + Variants A, research/impl_4.json, 85 ids)

Status: RUNNING (eleventh session, impl-4 finish, started 2026-11-25 09:14 ET).

## Eleventh session (2026-11-25 from 09:14 ET): clear todo_pass2, bot.svg, QA 85 modes at 390/360
- Chess Ultimate x9 (1_FSHqyc904 CxtttdnwNWk F0nfkeR-QEg FxpWhTj2Cv4 ehlf0_asIKo onr_ABfEMGk pPQDMtvu5rk w4L_Obw74dE wwVvGHfEfPI): empty todo_pass2 arrays removed; stale "SVG tokens drawn" note corrected (all 25 tokens are crops of the videos' frames/stills, tools/g4_sprites.py).
- 9M2Mj2WFFys Kung Fu Chess: DONE. js/games/g4_rt.js kungfu: pieces travel square by square (STEP s/square), capture whatever enemy they run into and stop there, stop before a friendly piece, can be captured mid-move (head-on meeting: the earlier mover wins; a piece landing on a traveller's square takes it); knights jump (only interact on landing); cooldown starts on arrival; castling (king two squares, rook travels alongside; transcript 2:50 / 7:37 "let's castle"); speed picker Standard (1 s/square, 10 s cooldown) / Lightning (0.2 s/square, 2 s cooldown), the kfchess.com presets (the video states no numbers). Tested: e4/Nf3/Be2/O-O played in the browser, 0 errors.

## Real numbers (recomputed 2026-11-25 00:30 ET, ninth session art pass)
- Pass 1: 85/85 mode files.
- Video art: 85/85 modes reference real video art (mode file or its js/games module; Gun King via g4_gunking sprites, Kung Fu Chess now has its own site piece set). The 18 former no-sprite modes all carry the video thumbnail intro + player-bar avatar crops (tools/g4_thumbcrops.py).
- Invented SVGs: 0 in group 4 (the 7 g4 SVG avatars once referenced by g1/g6 were already switched to PNG crops and deleted, commits a2a5ac0/989a840).
- todo_pass2: 8/85 files still have items. ART items left (7): AaHmMC3HA0E Trash Bot 1999 + The Master avatars (bot.svg), D8olpXjblQ0 Level 20 avatar (bot.svg), LjehdkzmCho Elephant piece (lettered glyph) - none of these appear in any repo still; CONozr99agQ game piece models (only the pawn sprite exists); AWFB4EzGtDc biome looks + end-of-run summary styling; BbgwPj-u_gs board-spawn animation (VFX). Non-art items (logic/sounds/chat) stay listed in 8XmhGMnypjc, 9M2Mj2WFFys, AWFB4EzGtDc, BbgwPj-u_gs, CONozr99agQ.
- Owner rule (00:15 ET): use repo stills only (research/frames/sprites + research/frames/video_thumbs); open YouTube only for an id with neither, and only for the exact frame. Browser frames captured earlier tonight for AaHmMC3HA0E, D8olpXjblQ0, LjehdkzmCho, CONozr99agQ were NOT used.

## Tenth session (art, 2026-11-25 ~00:50 ET, owner now allows video frames)
- Chess Ultimate tokens (CxtttdnwNWk/cu, all 9 CU modes): checked the "light art under _b names" question against the video sprites. The light character art on _b is CORRECT: both armies use identical character models in Chess Ultimate; sides differ only by the outline glow (player cyan, opponent red; sprites 1_FSHqyc904_board_3d, wwVvGHfEfPI_pink_octopus, wwVvGHfEfPI_king_and_ninja_pieces). Fixed the side cue: ring band recoloured white->cyan (_w) and dark->red (_b), art untouched (app/tools/g4_cu_rings.py). QA CxtttdnwNWk + 1_FSHqyc904 at 390/360: 0 console errors, 0 missing assets.
- NOT DONE (browser blocked: every browser slot of this request was busy with other agents, 2 dispatch attempts refused): Trash Bot 1999 / The Master (AaHmMC3HA0E), Level 20 (D8olpXjblQ0), Wendy/Miguel/Lee (tfPyy36nwc4), Seirawan Elephant w/b (LjehdkzmCho), Chess Arena piece models (CONozr99agQ), Gun King biomes + end-of-run summary (AWFB4EzGtDc). todo_pass2 for these left as is.
- Frame times already known (web notes from earlier browser runs, frames themselves were never saved): D8olpXjblQ0 Level 20 (2000) bar at 18:06 / 19:06 / 20:21 (chapter 18:00); LjehdkzmCho elephants at 272 s (all four specials on board), 1145 s (black E g8, white E + H in pocket), 1170 s (white E h1); CONozr99agQ all six piece models on the champion-select preview board at 11:43, knights 5:51/8:49/20:31, kings 5:51/8:49, end stats screen 23:17; AaHmMC3HA0E Trash Bot 1999 game from 15:28, The Master from 22:19; tfPyy36nwc4 Wendy from 0:00, Miguel ~21:40, Lee between ~26:00 and 32:10 (Manuel).

## Ninth session (art pass, 2026-11-25 ~00:30 ET), commit c8ab8e0
- 9M2Mj2WFFys Kung Fu Chess: 12-piece site set cut from the 25% still (assets/modes/9M2Mj2WFFys/pieces, wired via g4_rt game.pieces); iwantcheckmate avatar; AI label todo cleared.
- 8XmhGMnypjc 4PC Team: grey board #dadada/#acacac sampled from the still; per-seat avatars (you, Croissant = GM_Croissant Mona Lisa, Blue = Millionaire grey pawn, Green = former opponent.png); board/avatar todos cleared.
- 1Q4rfOd0al8 Rosen Score: PURESATURDAYY avatar. LjehdkzmCho Seirawan: Hawk w/b as chess.com draws it.
- QA: 4 changed modes at 390 px, 0 console errors, all referenced assets exist (tools/qa_all.py --par 1).

## Sixth session log
- 1L_sxGgxX9M Passant Conclusion: done (hooks g5_passant read-only, 5 rounds incl. Rainbow Bishop boss, laser event). QA 360/390 0 errors.
- 9M2Mj2WFFys Kung Fu Chess + CONozr99agQ Battle Royale (reduced: 8 kings, 24x24): js/games/g4_rt.js (frame 'game'). QA 360/390 0 errors.
- AWFB4EzGtDc Gun King: js/games/g4_gunking.js (top-down shooter, 4 guns, waves, level-up upgrades, Quickplay/Survival). QA 360/390 0 errors.
- -TKJGtBKK8U Infinite Craft: js/games/g4_craft.js (DOM chips over the frame, tap or drag to combine, 50+ recipes, goal Chess). Scripted solve reaches Chess, 0 errors.
- BbgwPj-u_gs 5D Chess (Lite, reduced): js/games/g4_5d.js (move on every timeline each turn, time travel 1-2 turns back branches a timeline, max 3, king capture wins). Scripted game incl. time jump, 0 errors.

## Pass 1: 85/85 done (22 added this session)
Added this session:
- Chess Ultimate x9: CxtttdnwNWk F0nfkeR-QEg FxpWhTj2Cv4 ehlf0_asIKo onr_ABfEMGk pPQDMtvu5rk w4L_Obw74dE wwVvGHfEfPI 1_FSHqyc904 (shared character rules js/modes/g4_cu.js; one representative draft per video)
- Pz5ZWCrUQyY 50 Puzzles (50 CC0 Lichess puzzles inline, black-to-move ones mirrored so you are always White)
- DoImibR93tA, vvCAEWKttT4 Solo Chess / speedrun (js/modes/g4_solo.js, levels generated backwards so always solvable)
- inm7KvllVu0 Portal Chess (double-tap places portals), fUQXSj5jVUk Xiangqi 9x10, 7lEglazTlo8 Soko Chess (6 original levels, BFS-verified solvable), Cv28-UoZseg Sergeant's Checkers, WXcmWG7Eczs Anarchy Chess
- AvZiSnngZjA, 9j7h5kF4X9s Shotgun King (js/modes/g4_shotgun.js: shoot cone, HP, shells, 12 floors, auto cards)
- 0LO0D0rOif0, 1FKa1LnTDeQ, 4KetMbEVvhI King of the Bridge endings (js/modes/g4_kotb.js: rule book, troll cheats, accusation by double-tap, payback cheat, ending checks)

Remaining pass 1: none.
Note: js/games/ does not exist yet (no game-frame module has been written by anyone in this repo as of this push).

## Pass 2 (owner correction 22:13 ET: copy the video's art from research/frames/sprites; recreate to match where no sprite)
- Chess Ultimate x9: DONE. assets/modes/CxtttdnwNWk/cu/ (shared by all 9 files): 13 circular tokens cropped from video sprites (King, Rover bishop, Ninja, Ghost, Angel, Devil, Bomb, Fisherman, Dragon, Giant octopus, Mage, Berserker, Checker), 12 SVG tokens drawn for characters with no sprite, VS splash + CHECKMATE overlay. Not modelled (rules): Giant 2x2, checker multi-jump, island backdrop (noted in source.notes).

## Pass 2 (old notes)
Every group-4 mode file with todo_pass2 still needs its art/VFX/sounds (grep todo_pass2 over impl_4.json ids). All 22 new files carry todo_pass2 lists (main items: original Chess Ultimate character SVGs, Xiangqi discs/intersection board, Shotgun King pixel sprites + card draft UI, King of the Bridge pixel scene/troll portrait/rule-book overlay, Solo Chess panel, Soko piece/target art, Sergeant pieces, Anarchy cartoon pieces, portal ring art).

## QA
- All 22 new modes: load at 360 and 390 px, 4 random player moves played (bot replies), 0 console errors (harness copy /workspace/work/g4tmp/qa.py, not committed; generated data/*.js not committed).
- Puzzles: solution lines verified playable for puzzles 1-4 (advances, score counts).
- Older 57 group-4 modes not re-run this session.

## Shared files touched outside group
- js/game/spec-game.js: one line in P.onTap adding optional hooks.onTap(ctx, sq, opts) (comment "impl-4"); used by Portal Chess and King of the Bridge.

## Low confidence
- Cv28-UoZseg (rules inferred, no transcript), WXcmWG7Eczs (start position inferred, Inverse Queen limited to range 3, Title Rooks either-side), Chess Ultimate (Giant is 1 square, no checker multi-jump, Prince double move and Devil autonomous minions not modelled, armies representative), Shotgun King (HP/cone/damage/cards approximations, generated floors), King of the Bridge (cheat types/rate inferred; slippery tiles, board flip, goose, gifts not modelled).
