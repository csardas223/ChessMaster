# Chess Master

Fan remake of iwantcheckmate's chess-variant videos as 559 playable modes. Single-file app: open `index.html` in a browser.

Stockfish modes load Stockfish 19 lite from unpkg at runtime; thumbnails come from YouTube.

All videos © iwantcheckmate (youtube.com/@iwantcheckmate).


<!-- PROGRESS START -->
## Rebuild progress (updated 2026-11-24 10:19 PM ET)
- Overall: ~58%
- Research specs: 559/559 (100%); ~25 low confidence (see rebuild/HANDOFF.md).
- Engine + chess.com-style UI: ~60%. Verified: perft passes; headless smoke test of standard, Atomic, Backrooms, SCP-2774, Minihouse 6x6, Cross Derby, Gravity, 4-player and legacy modes loads and plays with 0 console errors at 390px.
- Mode implementation: 498/559 mode files (89%), six agents in parallel (impl_1..6.json). Group 5 (Variants B): 88/88.
- Group 6 (Variants C, impl_6): 87/87 mode files; video art 87/87 (art pass 2 2026-11-25: Chessformer blue set/terrain, Pawnbarian, Survivors, Who Takes the Crown pixel set, Ouroboros icons, Anarchy pawns, Gambonanza boss, all cut from repo sprites/stills via app/tools/g6_art_pass2.py); todo_pass2 left in 15 files (rules/logic/sound + ~11 art items with no repo source or needing engine work, listed in research/impl_6_report.md); QA of changed modes 0 errors; updated 2026-11-25 00:35 ET
- Testing + merge to main: ~25%. QA harness ready (2026-11-24 11:20 PM ET): `rebuild/app/tools/qa_all.py` QAs all 498 modes at 390+360px (real board clicks, drops/placement phases, square prompts, game frames, Gravity platformer check; fails on console errors, local 404s, overflow, stuck bot); `tools/test_browser.py` now covers Duck, Setup, Ambush, pawn placement and the Gravity platformer. Full sweep + `research/qa_full_report.md` wait until the art/pass-2 work is done (owner); perft passes. Merge to main not started.
Start at rebuild/NEXT_AI.md; mode index in rebuild/research/INDEX.md. This section is removed once the rebuild is finished.
- Group 3 (Challenges & Odds, impl_3): 102/102 mode files; video art 102/102 (0 generic avatars: the last ones, chess.com bots Elsa/Noel/Zara, now show the exact chess.com avatars the videos show), 0 invented SVGs, 0 todo_pass2. Headless QA 204/204 OK (390+360px, 0 console errors, 0 404s, no overflow), perft PASS. DONE. Updated 11:50 PM ET. Report: rebuild/research/impl_3_report.md
- Group 2 (Drawback Chess + Variant Bots, impl_2): 67/67 mode files; video-art pass done 67/67 (29 bot avatars copied from video sprites/thumbnails, 0 invented SVGs left; 38 Drawback modes use the site's look: no avatars as in the videos, card + slider from the video); headless QA 67/67 load+play, 0 console errors at 390px. Updated 2026-11-24 10:45 PM ET. Report: rebuild/research/impl_2_report.md
- Group 4 (Other + Variants A, impl_4): 85/85 mode files; video art 85/85 (repo stills only); 0 invented SVGs; todo_pass2 left in 8/85 files: 7 art items (3 avatars + Seirawan Elephant not in any repo still, Chess Arena piece models, Gun King biomes/summary, 5D spawn animation) plus non-art logic/sound items. Chess Ultimate tokens now use the video's side cue (cyan ring = you, red ring = opponent; same character art both sides). Updated 2026-11-25 00:50 ET (tenth session). Report: rebuild/research/impl_4_report.md
- All groups (recomputed 2026-11-24 10:19 PM ET by g6): 498 of 559 videos have a mode file (89%); 102 mode files still carry todo_pass2.
- Group 1 (Horror/Powerups/Dice, impl_1): pass 1 64/64; video art 64/64 (0 invented SVGs, only bot.svg for 9pHhqAbQS0s ladder bots the video never shows); todo_pass2 0 (empty arrays removed from all 19 files); SCP-173 scrape sound added; QA 128/128 (64 modes x 390/360) 0 console errors; updated 2026-11-25 01:45 AM ET. Report: rebuild/research/impl_1_report.md
- Group 5 (Variants B, impl_5): 88/88 mode files; real video art in 88/88 modes; art pass 5 from owner-approved 1080p video frames (Wizard Chess units + Cloaky + dialogue, Ouroboros Glass Queen + VICTORY banners, Pawnbarian Goblin Caves monsters + zap, Thermopylae General/Sergeant/Soldier/Archbishop); art left: Ouroboros Prince/Marching Pawn/Soldier (not in either video), Pawnbarian Blightvessel/Blightsack placement (hook), Wizard iso view/move tiles (engine); QA 88/88 at 390px, 0 console errors (pass-5 modes re-checked 10/10); updated 2026-11-25 2:00 AM ET. Report: rebuild/research/impl_5_report.md
- Sounds (impl-2b, 2026-11-24 11:50 PM ET): core board sounds are now chess.com's default set (12 mp3s in rebuild/app/assets/sounds, incl. premove + tenseconds, wired into the shared UI for every mode); mode effect sounds stay our own synthesised WAVs; no audio is taken from the videos (owner).
<!-- PROGRESS END -->
