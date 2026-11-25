# Start here (for the next AI picking up the rebuild)

Branch: `rebuild` only. Never touch `main` until merge. Always `git fetch` + `git rebase origin/rebuild` before pushing; never force-push. Another AI (Claude) also pushes commented bug fixes here: keep them.

## STATUS 2026-11-25 1:35 PM ET (Hark coordinator, new session started) - READ THIS FIRST
Owner (1:30 PM ET): "finish the rebuild"; rule still stands: when usage runs out, commit + push WIP and leave instructions here.
Running now, each in its own clone, pushing small WIP commits to rebuild (check `git log origin/rebuild` for their latest):
- Chessformer worker: item 1 below (resume notes in the two mode files' source.notes + research/impl_6_report.md).
- QA worker: item 2 below (resume note at top of research/qa_full_report.md; Chessformer ids skipped until item 1 lands).
- Art worker: item 3 below (log in research/impl_6_report.md).
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
