# Start here (for the next AI picking up the rebuild)

Branch: `rebuild` only. Never touch `main` until merge. Always `git fetch` + `git rebase origin/rebuild` before pushing; never force-push. Another AI (Claude) also pushes commented bug fixes here: keep them.

## STATUS 2026-11-25 4:47 PM ET (Hark coordinator) - READ THIS FIRST
SHIPPED: main = 8a2fc11 (built from rebuild@ca625ed, merge_to_main.sh --smoke PASS). Owner (4:46 PM ET): "yes [keep going on polish + human-like bots]
and make the ui not look vibecoded". 6 agents, own clones, small commits to rebuild, log + RESUME line in research/polish_report.md:
- pol-q1..pol-q4: same quarter split as the 4:06 section (q2 resumes after GuyllCIRcQI). QA 390/360, fix, art polish, gameplay vs spec.
- pol-ui: de-vibecode the whole UI (see polish_report 'pol-ui' for the design brief it writes first). Owns css/ + js/ui/ + index.html.
- pol-human: human-like bots (Maia/Lc0 WASM) + older Stockfish versions per video (scope in 4:06 section).
Mode agents don't touch shared UI css/js; pol-ui doesn't touch data/modes/*. If cut off: resume from RESUME lines, full re-QA, re-ship.

## STATUS 2026-11-25 4:06 PM ET (Hark coordinator) - POLISH ROUND - READ THIS FIRST
Owner (4:01 PM ET): "make sure everything's done and POLISHED", wants the general UI improved too, and asked about performance. main = d88a8b8.
6 agents, each in its own clone, pushing small commits to rebuild, logging in research/polish_report.md under its section:
- pol-q1..pol-q4: mode ids split in sorted quarters (ls data/modes/*.js minus index, LC_ALL=C sort, split -n l/4; q1 -TKJ..GGvp,
  q2 GH9t..X-aU, q3 X1aD..mwv4, q4 mymJ..zxRM). Per mode: full QA (qa_all --widths 390,360, own --port), fix bugs, then art polish,
  then gameplay check vs research/modes/<id>.json + frames (medium/low-confidence specs first). Resume = last id in their section.
- pol-ui: general UI polish (lobby, mode cards, search/filter, player bars, menus, dialogs, settings, transitions) on the chess.com
  Android look; also re-check every 4-player mode after c7a4505's tint change.
- pol-perf: load/runtime performance (lazy-load mode data + scripts, legacy_modes, image sizes/formats, caching), behaviour unchanged.
QUEUED (owner 4:13 PM ET): "if you need other engines from online besides Stockfish to mimic human behaviour, do so" -> human-like bots
  for standard-rules modes (e.g. Maia / Maia-2 human-move nets via ONNX/WASM or Lc0 WASM, rating-matched to each video's bot), lazy-loaded,
  Stockfish kept as fallback + for variants it supports; variant engines keep CM.Search.
  + (owner 4:14 PM ET) modes whose video uses an OLDER Stockfish version get that version (grep specs/notes for "Stockfish <n>"; use
  real builds compiled to WASM/asm.js, e.g. stockfish.js npm versions; when none exists for that number, nearest real older build, noted). Starts when a polish agent finishes (section 'pol-human').
If cut off: finish each section from its resume note, then full QA, then re-ship: clean clone -> bash rebuild/tools/merge_to_main.sh --smoke -> git push origin main.

## STATUS 2026-11-25 3:22 PM ET (Hark coordinator) - REBUILD SHIPPED - READ THIS FIRST
DONE: art audit q1-q4 finished (art_audit_todo.md all DONE with hashes; leftovers = items with no exact better source, listed there
and in impl_6_report.md art-audit-q1..q4); Chessformer all 28 levels verified incl. L48 (106-move line, 2234573), QA 4/4;
every touched id QA'd 390/360 (q1 46/46, q2 40/40, q3a 40/40, q3b 24/24, q4 60/60). NOTE: q3a c7a4505 retuned the shared 4-player
tints (css .pc--tint-r/u/y/g) for every 4-player mode; spot-checked 9 of them.
MERGED: main = d88a8b8 (multi-file static site built by merge_to_main.sh from c7accde, smoke PASS at / and /ChessMaster/). README PROGRESS removed.
OWNER TODO: turn on GitHub Pages (Settings > Pages > Deploy from a branch > main, / root).
NEXT (owner's post-merge order): bug scan -> art polish -> gameplay polish -> bug scan. Ship later changes by fixing on rebuild,
then re-running merge_to_main.sh from a clean clone. QA tip: give each parallel qa_all.py run its own --port.

## STATUS 2026-11-25 2:41 PM ET (Hark coordinator, new session) - READ THIS FIRST
Owner (2:39 PM ET): "finish it"; rule stands: when usage runs out, commit + push WIP and leave clear instructions here. Owner asked for 6 agents.
Running, each in its own clone, pushing small commits to rebuild and logging in research/impl_6_report.md under its section
(and marking DONE + hash in research/art_audit_todo.md):
- art-audit-q1: art_audit_todo q1 items 1-10.
- art-audit-q2: q2 leftovers (+ QA of b260142 ids).
- art-audit-q3a: q3 items 1-8.  art-audit-q3b: q3 items 9-15 + the Non-art line.
- art-audit-q4: QA the 11 pushed q4 ids first, then q4 leftovers.
- cf-2 (Chessformer): prove L48, update cf-2 + source.notes, QA oAoik9Dj2qQ,p6W3yDU-v88.
If this session was cut off: read each section's resume note, finish what's open, then: qa_all.py --report-only (re-add resume note),
then merge (2:10 section: clean clone -> bash rebuild/tools/merge_to_main.sh --smoke -> git show --stat HEAD -> git push origin main),
delete README PROGRESS on rebuild. Owner turns on Pages afterwards.

## STATUS 2026-11-25 2:35 PM ET (Hark coordinator, CUT OFF BY USAGE LIMIT) - READ THIS FIRST
Do in order:
1. Art: finish every item in rebuild/research/art_audit_todo.md (full audit of all 500 modes done; ~50 items left; QA q4's pushed commits first).
2. Chessformer verify RESULT (2:35 PM): L33 L36 L38-46 proven + replayed in app (tools/g6_cf_solutions_verify.json, tools/g6_cf_astar.mjs, 4a5f70c);
   title fixed fcf7100; ledge green #66cf59 7849de8. LEFT: L48 unproven (frame matches grid; 23-move key line:
   b2-c3 d2-b3 b2-a4 e2-d4 d2-b3 b2-a4 c3-a5 a5-d8 c2-f5 a4-c3 c2-e3 e2-f4 f4-g6 g6-f8 f8-d9 a3-c2 c2-e3 e2-f4 f4-g6 g6-f8 f8-e10 e8-d10 d10-b11;
   then knights ferry ~5 pieces to a right-side staircase, king climbs l3-m4-l5-m6-n7-o8-n9-m10, per commentary 19:13-21:20);
   update cf-2 in impl_6_report.md + both source.notes (still say unverified); QA the 2 ids. OLD NOTE: a worker was still proving L33 L36 L38-42 L44-46 L48 solvable + title "Levels 21-35"->"21-36" + ledge colour
   when the session ended; check git log / impl_6_report.md 'cf-2' and source.notes for what landed; bg solver output may be at
   /workspace/work/cfsolve/bg_out.txt (sandbox, may be gone). Then QA the two Chessformer ids and --report-only (see 2:10 section).
3. Merge to main with rebuild/tools/merge_to_main.sh (see 2:10 section). Owner turns on Pages afterwards.

## STATUS 2026-11-25 2:20 PM ET (Hark coordinator) - READ THIS FIRST
Owner (2:17 PM ET): "make sure all the art looks proper" (spotted Thermopylae red Nightrider half white). BEFORE THE MERGE:
- Thermopylae fix worker: nightrider_r.png recut from frame_115 + re-check all Thermopylae pieces.
- Full visual art audit, 4 workers, mode ids split in sorted quarters (/workspace/work/art_q00..03; regenerate with
  `ls -- rebuild/app/data/modes/*.js` minus index, LC_ALL=C sort, split -n l/4). Each logs in research/impl_6_report.md as
  'art-audit-q1'..'q4' with the last id reached: resume from there if cut off. Checks: half-coloured pieces, halos, crop strips,
  cut-off sprites, blurry upscales, wrong colours vs video, failed loads.
- cf-verify still running. Merge (item 4, see 2:10 section) only after all of these land.

## STATUS 2026-11-25 2:10 PM ET (Hark coordinator) - READ THIS FIRST
DONE: QA sweep 994/994 pass at 390+360 (497 modes, re-run from scratch; report 3bc2728, research/qa_full_report.md). Chessformer ids
not yet in it: after cf-verify lands run from rebuild/app: python3 tools/qa_all.py --widths 390,360 --ids=oAoik9Dj2qQ,p6W3yDU-v88 --redo
--par 1 --results <dir>, then --report-only (re-add the resume note it overwrites). Use --ids=... (ids starting with '-').
DONE merge prep (fce414f e1d0117 fbbf7eb f356657): Pages subpath texture fix, .nojekyll, script rebuild/tools/merge_to_main.sh
(+ README_main.md, check_site_paths.py, smoke_site.py). Dry run passed at / and /ChessMaster/.
TO SHIP (after cf-verify + art2 land): clean clone -> bash rebuild/tools/merge_to_main.sh --smoke -> git show --stat HEAD -> git push origin main.
Then: delete README PROGRESS on rebuild, owner turns on Pages (Settings > Pages > main, root). Post-merge order: bug scan, art polish, gameplay polish, bug scan.

## STATUS 2026-11-25 2:05 PM ET (Hark coordinator) - READ THIS FIRST
DONE since 1:35: Chessformer item 1 a-f (5efff0e c721c62 bfb197f a1191a6 0995168 0320955 + levels 43/44/46/48 3dd762c): 28 real levels
wired (oAoik9Dj2qQ L21-36, p6W3yDU-v88 L37-48), QA 4/4, 15 levels replayed to a win in-app (tools/g6_cf_play.py). Art item 3 done
(ffb2c77 08f2e14 9d770f4 3a010df) except inm7KvllVu0 trout avatar (no exact hi-res copy found).
RUNNING: cf-verify worker (prove L33 L36 L38-42 L44-46 L48 solvable; bg solver /workspace/work/cfsolve/bg.sh -> bg_out.txt; title
"Levels 21-35" -> 21-36; ledge colour), art2 worker (Thermopylae red plain pieces, wMdAOirSvQQ santa), QA x2 (360px halves), merge-prep.
LEFT after those: final QA --report-only, then item 4 merge with rebuild/tools/merge_to_main.sh (merge-prep worker writes it).

## STATUS 2026-11-25 1:35 PM ET (Hark coordinator, new session started) - READ THIS FIRST
Owner (1:30 PM ET): "finish the rebuild"; rule still stands: when usage runs out, commit + push WIP and leave instructions here.
Running now, each in its own clone, pushing small WIP commits to rebuild (check `git log origin/rebuild` for their latest):
- Chessformer worker: item 1 below (resume notes in the two mode files' source.notes + research/impl_6_report.md).
- QA worker: item 2 below (resume note at top of research/qa_full_report.md; Chessformer ids skipped until item 1 lands).
- Art worker: item 3 below (log in research/impl_6_report.md).
- 1:45 PM ET, owner asked for six agents: + Chessformer transcriber (levels 43/44/46/48 data only, tools/g6_cf_new_levels.py),
  + second QA worker (360px, second half of sorted mode ids, same results dir; first QA worker owns qa_full_report.md),
  + merge-prep worker (rebuild/tools/merge_to_main.sh + rebuild/tools/README_main.md, GitHub Pages path fixes; never pushes main).
Then the coordinator does item 4 (multi-file merge to main) once 1 and 2 are done. If this session was cut off, resume from those notes.

## STATUS 2026-11-25 1:30 PM ET (Hark coordinator, wrapped up on owner's order) - READ THIS FIRST
FINISHED + pushed (QA 0 errors): Gambonanza recheck low->high (4099a40, 0 low-confidence specs left); merged side-branch WIP verified;
art audit pass both halves (ed23e46 4aef803 c7281fc / cbd2ccb 1c0d890 b735dd4 87eeb79 2125828; tool rebuild/tools/art_audit.py);
Chess Survivors pass 2 (6309c7f, 32a1d5b) + Chess Ultimate Giant 2x2 (127d86c); QA fixes: CM.util.cssUrl 404 fix (ca9c282), Resign
button, back/history, LICENSES.md, tools/qa_ui.py 41/41 (3f22e8e).
LEFT, do in this order:
1. Chessformer oAoik9Dj2qQ + p6W3yDU-v88 (WIP 366b93c 57a28d1): frames for levels 22-47 committed; levels 21-42,45,47 transcribed
   (tools/g6_cf_levels.py + g6_cf_new_levels.py). Exact steps in both mode files' source.notes "NEXT AI" + impl_6_report.md:
   a) fall-onto-king capture (solver + js/modes/g6_levels.js), re-solve all levels (25/26 should become solvable; 33-36 unsolved yet);
   b) button toggle + gravity loop to fixpoint; c) pawn double step on first move from any rank (level 42);
   d) transcribe 43, 44, 46 (frames committed), get frame for 48 (~18:06); e) wire levels: 16x11 board, gravity in level layer,
   ? piece choice R/B/N/K/P, buttons, load from g6_cf_levels.py --json; f) clear todo_pass2, qa_all --ids oAoik9Dj2qQ,p6W3yDU-v88 --redo --par 1.
2. QA sweep: 390px done (499/499; fUQXSj5jVUk fixed, needs --redo); 360px 177/499 done, 322 left. Resume from rebuild/app:
   python3 tools/qa_all.py --widths 390,360 --par 2 --budget 98 --results <dir>  (repeat until "all done"), then --report-only.
   Thumbnail/Stockfish fetch errors in the sandbox are proxy blocks, not app bugs. Playwright: pip install playwright && python -m playwright install --with-deps chromium.
3. Art leftovers (optional polish): boaA9_TjXeU green army halo (recut from frame); 64px Stockfish avatars (assets/avatars/stockfish.png,
   cYVauucyLyQ, inm7KvllVu0); small chess.com bots (Wally, Samantha, Hustler, lvl5-15, Santa, Frosty) -> 200px chess.com API copies.
4. Merge rebuild into main as a MULTI-FILE static site (index.html + css/ js/ data/ assets/ from rebuild/app, hostable on GitHub Pages),
   update README run instructions, delete README PROGRESS. Not before 1-2 are done.

## STATUS 2026-11-25 1:15 PM ET (Hark coordinator) - READ THIS FIRST, supersedes the 11:50 list below
Owner rule (2026-11-25 1:12 PM ET): when usage runs out, commit + push what you have ("WIP:" message) and leave clear instructions for the next AI here.
DONE this session (all QA 0 errors at 390/360):
- Gambonanza qqvbb2r2k5I rechecked low -> high (4099a40); 0 low-confidence specs left. Recheck list (item 3 below) is FINISHED.
- Merged side-branch WIP (YZjdissxTyA, Zc8ljpWtYWQ, 9j7h5kF4X9s, AvZiSnngZjA, arena index, 5D, 3D) verified complete.
- Art audit pass: cm-art-a ed23e46 4aef803 c7281fc (47 modes), cm-art-b cbd2ccb 1c0d890 b735dd4 87eeb79 2125828 (50 images / 32 modes).
  Audit tool: rebuild/tools/art_audit.py. Logs: impl_6_report.md 'art-audit-final', impl_5_report.md 'art-audit-final-b'.
  Art leftovers: boaA9_TjXeU green army halo (needs fresh frame cut); 64px Stockfish avatars (assets/avatars/stockfish.png, cYVauucyLyQ,
  inm7KvllVu0); small chess.com bot portraits (Wally, Samantha, Hustler, lvl5-15, Santa, Frosty) -> swap for 200px chess.com API copies.
IN PROGRESS at 1:15 PM ET (check git log for their latest commits / WIP notes):
- Chessformer oAoik9Dj2qQ + p6W3yDU-v88: real levels, pipes, one-way ledges, keys, buttons (see source.notes + impl_6_report).
- Chess Survivors spJibM5qaNQ todo_pass2 + g4_cu.js Giant W4.
- Full QA sweep (rebuild/research/qa_full_report.md; tools/qa_all.py --par 2).
THEN: merge rebuild into main as a multi-file static site (item 5 below), update README run instructions, delete README PROGRESS.

## STATUS 2026-11-25 11:50 AM ET (Hark, 6-agent session cut off by usage limit) - READ THIS FIRST
Owner rules added today (binding):
- Art first: finish + polish art before logic. While logic runs, keep 5 agents on logic and 1 agent auditing/polishing ALL art.
- Sprites come from the videos, BUT if a web image (official site, Steam, wiki, press kit, chess.com) is visibly the exact same art at
  higher resolution, swap it in (exact matches only, same pose/colours/framing; note the source URL in source.notes + impl report).
DONE on `rebuild` this session (all QA 390/360 0 errors): Gun King gold unlocks/grenades/gun sounds (62ae22f); Chess Arena champions,
abilities, bushes, XP orbs, group drag (4f24b71); Ouroboros node map/Armory/sacrifice/relics/draw offers (6800826); Gambonanza pixel art
wired (51d0aa5) + full logic: formation, tokens, selling, probability gambits, stage 3, burning (ce277ff); Shotgun King white queen +
white set from the Shotgun King Wiki sprites (6dece0f). Low-confidence recheck: 10/22 done (2er3r0JGeNg, C9v7G3dJl7E, QrKIKcYN5m4,
djfYBXvvaYI, lmmKhSrRn_c, nWdjqATRp5k, o8XcmMCIhIk, vDzojyJO3sI, u0hl8g63mUg, y5MBC8OCYlI; see research/recheck_report.md).
MERGED 2026-11-25 11:58 AM ET (owner: "rebuild is the central wip branch"; no more wip/cm-* side branches, they were merged here and deleted):
the former wip/cm-3d (WTTC x2 climb/jump counter/stack picker + BtB cutscene/buttons/beam/hints/hymn), wip/cm-5d (5D full 4D rules +
puzzles), wip/cm-levels (tools/g6_cf_levels.py, nothing wired), wip/cm-recheck (YZjdissxTyA + Zc8ljpWtYWQ edits), wip/cm-gambonanza
(9j7h5kF4X9s + AvZiSnngZjA art) and wip/cm-arena (index regen) are now ON rebuild, UNFINISHED and UNTESTED: finish + QA them here.
Unfinished work goes straight to rebuild with a "WIP:" commit message; never create side branches.
STILL TO DO (in owner order):
1. Art audit/polish of every mode (owner rule above), starting with blurry/low-res sprites. Only wip/cm-gambonanza started it.
2. Logic todo_pass2 left: BbgwPj-u_gs (5D), iqfHW2_sMmc + zDFsnRE_Gig (WTTC), xlErokL2-4c (Beyond the Board), oAoik9Dj2qQ +
   p6W3yDU-v88 (Chessformer real levels, pipes, one-way ledges, buttons, promotion squares), sGXmiyvZDE4 (Petrified Pawns real-time,
   HP, mana, heals, potions, more levels), spJibM5qaNQ (Survivors full acts, timer, characters, Bubbles, companion, endless).
3. Recheck remaining 12: YZjdissxTyA, Zc8ljpWtYWQ (wip), B3wErwlKytA, Cv28-UoZseg, IU9a1RB1KJw, JcpCAs1a2gc, UZ79sKLa6z4, WXcmWG7Eczs,
   gY9DNg9xDUM, piiE6JB8pWw, sO-lD2On610, x-ISu_8MDvY.
4. Full QA sweep (qa_all.py, --par 1-2), merge rebuild into main, delete README PROGRESS, then post-merge order.
5. VERY END (OWNER, 2026-11-25 12:14 PM ET; do NOT do this before everything above is finished): do NOT cram the app into one
   index.html. Ship it on main as a normal multi-file static website (index.html + css/ + js/ + data/ + assets/ as in rebuild/app),
   still openable/hostable as a website (e.g. GitHub Pages / any static host); update README run instructions to match.
Agent split that worked: one clone per agent (/workspace/work/cm_<handle>), each owns its mode files, coordinator edits NEXT_AI/README.

## Read in this order
1. `README.md` PROGRESS section: overall status. **Refresh it on every commit; delete it when the rebuild is finished.**
2. `rebuild/HANDOFF.md`: full history, decisions, low-confidence list.
3. `rebuild/ARCHITECTURE.md`: app structure (multi-file under `rebuild/app/`).
4. `rebuild/research/INDEX.md`: one row per mode (559) with kind / playable / confidence.
5. `rebuild/research/modes/<id>.json`: the spec for each video. `rebuild/research/frames/` holds frame notes (visual_a..d.jsonl) and rules.jsonl; reference sprites are MEANT TO BE SHIPPED (see Art direction below).

## Art direction (OWNER, 2026-11-24 10:13 PM ET; overrides every earlier "original art only" note)
- All mode art is copied directly from the videos: use `rebuild/research/frames/sprites/<videoId>_<thing>.png` as-is (crop / transparent background into `app/assets/modes/<id>/`) for custom pieces, opponents/avatars, overlays, boards, VFX and mode card images.
- Where no sprite exists, capture or recreate it to match the video exactly (frames via a real browser, thumbnails `i.ytimg.com/vi/<id>/maxresdefault.jpg`).
- Replace any original/invented art already in the repo with the video's art. Keep the iwantcheckmate credit.

- Effects (VFX, animations, sounds, overlays) must also match the video exactly, copied from the frames.

## Sounds (OWNER, 2026-11-24 11:41 PM ET)
- Core board sounds = chess.com's default set (app/assets/sounds/*.mp3, js/core/sound.js), incl. premove + tenseconds. Mode effect sounds =
  our own synthesised WAVs. Never extract audio from the videos. loader.to is BANNED (scam; also no cobalt/y2mate); cnvmp3.com is the only
  converter allowed if audio is ever needed again.

## Rules of thumb
- Frames beat rules.jsonl when they disagree (e.g. Backrooms = huge open yellow board, not a maze).
- `playable: false` specs (normal chess, quizzes, intros) get no mode; `kind: video_game` specs need a standalone mini-game or are skipped.
- Promotion: chess.com-style Q/R/B/N picker unless a spec says otherwise.
- UI: chess.com Android look, calm motion (piece slide ~200ms ease-out, no bounce/pop/shake, honour prefers-reduced-motion).
- Final-pass specs have `current_impl_issues` = "not checked"; diff against the old `index.html` on main when implementing.

## Two-pass plan (2026-11-24 9:24 PM ET)
Pass 1: rules/setup/board for every mode with `todo_pass2` notes; pass 2: custom art/VFX/sounds. Details in HANDOFF.md (fourth Hark session).

## Post-merge (owner): bug scan -> art polish -> gameplay polish -> bug scan. See HANDOFF.md fifth session.

## What's left (2026-11-24 midnight ET)
- Remaining generic avatar: assets/avatars/bot.svg (only where the video shows none). 2026-11-25 10:45 ET art-g4: tfPyy36nwc4 Wendy/Miguel/Li now video portraits; AaHmMC3HA0E + D8olpXjblQ0 done earlier (3d9e932); 9pHhqAbQS0s: video never shows a bot after Azeez (checked to the end), so the inferred ladder continues with chess.com's Advanced bots Wendy..Manuel using their video-cut portraits. No mode uses bot.svg now (only code fallbacks in g6_ladder.js / legacy glue). Avatars: DONE. Low-confidence spec re-checks (HANDOFF list).
- Group todo_pass2 items and no-sprite frame crops (see each research/impl_N_report.md), full QA sweep, merge to main, delete README
  PROGRESS, then the post-merge order.
- Group 6 art-g6b (2026-11-25 11:10 AM ET): Petrified Pawns tileset+units, Survivors golden chest, Chessformer x2 void look DONE.
  Gambonanza (qqvbb2r2k5I): pieces CUT (tools/g6b_gb_art.py -> app/assets/modes/qqvbb2r2k5I/{w,b}{K,Q,R,B,N,P}.png, Sk, Sn, Cp,
  board.json cream #efd6ab / maroon #964d4e) 2026-11-25 ~11:40 AM ET. Next: wire pieces.<T>.img + board colours in data/modes/qqvbb2r2k5I.js,
  remove the art todo_pass2 / 'impossible' note, QA (qa_all --ids qqvbb2r2k5I --redo --par 1).

- Group 5 art/visual items (Pawnbarian Blightvessel/sacks/promotion splash, Wizard iso + tiles, Passant Unstable + arrow trail):
  DONE and verified 2026-11-25 10:45 AM ET (art-g5); g5 has 0 todo_pass2. Who Takes the Crown x2 + Beyond the Board 3D looks belong to art-3d.
- art-g4b (2026-11-25 11:15 AM ET): DONE: Seirawan Elephant, Chess Arena pieces + results screen, Gun King exits/biomes + summary, 5D board-spawn animation. Group 4 has no art todo_pass2 left; remaining items are logic/sounds (research/impl_4_report.md 'art-g4b').
- art-3d (2026-11-25 10:55 AM ET): 3D looks DONE (commits b975c47, b550733): Who Takes the Crown x2 (iqfHW2_sMmc, zDFsnRE_Gig) tower of upright
  stacked boards + crown at the top, Beyond the Board (xlErokL2-4c) monochrome floating platforms + camera rotate, both on js/fx/g6_3d.js over
  CM.scene3d. Left (logic, not art): WTTC platformer climb / jump counter / stack picker; BtB kidnapping cutscene, tick-counter buttons, Eldritch
  hexagon beam, wall hints, music (todo_pass2 in the mode files; frames + notes in research/impl_6_report.md 'art-3d').
- art-g6c (2026-11-25 ET): Ouroboros Fool + Anarchy knook/anti-queen + Knightmare knight/rock/black army DONE from YouTube frames; Shotgun King white army/muzzle flash IN PROGRESS (see research/impl_6_report.md 'art-g6c' for frame times and what to do).

## Next steps
1. Verify the engine + UI in `rebuild/app/` (run `rebuild/tools/test_browser.py`); fix the proof modes (standard, Mini Chess 6x6 no queen, Cross Derby, Backrooms).
2. Write/confirm `rebuild/tools/spec2mode.mjs` to turn specs into `app/data/modes/<id>` files.
3. Implement modes in batches, highest-confidence first; re-run transcripts for ids in `rebuild/research/recheck_low_confidence.json`.
4. Headless QA every mode, then merge to `main` and remove the README PROGRESS section.

## Shotgun King (2026-11-25 11:15 AM ET, Hark)
- DONE: white K/N/B/R/P art + muzzle flash overlay wired in data/modes/pzxXxIsKRRo.js; QA 390/360 OK. Left: white queen art (not on any frame; try promoted pawns ~6:01-6:10).
- Remaining art after this: Gambonanza pixel set only (see art-g6b section of research/impl_6_report.md).

## 4:20 PM ET 2026-11-25: usage ran out mid polish round (WIP)
- pol-q2 STOPPED: pushed 8523423 (Phantom Rooks GawuFHUIj6o 8x10 rebuild) + Hz1J81D8rP4 avatar. Resume pol_q01 from id index 16 (sheet s016) to X-aULHXsAaI; re-run QA 390+360 for that slice; --redo GawuFHUIj6o Hz1J81D8rP4.
- pol-q1/q3/q4/pol-ui/pol-perf were still running; check each section's RESUME line in research/polish_report.md and continue from there.
- pol-human NOT dispatched yet (scope above incl. older Stockfish versions: specs name SF 17, 10, 2, 1).
- Shared-UI todo from pol-q2: clocks seem to run before first move; videos use chess.com glossy "neo" pieces, app default is flat.
- Then: full re-QA all ids, then re-ship via clean clone + merge_to_main.sh --smoke + push main. Owner still must enable GitHub Pages (main, /root).
