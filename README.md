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
- Group 6 (Variants C, impl_6): pass 1 87/87 mode files; video art shipped in 68/87 modes (all 68 group-6 videos that have sprites in research/frames/sprites, plus frame crops); 0 invented SVGs left in group 6; 19 modes still show only the standard chess.com-style look (no sprite exists: online standard-look variants vs humans); todo_pass2 notes left 29 (rules/VFX, not art); headless QA 390px: 68 changed modes load + play, 0 console errors (2026-11-24 10:55 PM ET)
- Testing + merge to main: ~25%. QA harness ready (2026-11-24 11:20 PM ET): `rebuild/app/tools/qa_all.py` QAs all 498 modes at 390+360px (real board clicks, drops/placement phases, square prompts, game frames, Gravity platformer check; fails on console errors, local 404s, overflow, stuck bot); `tools/test_browser.py` now covers Duck, Setup, Ambush, pawn placement and the Gravity platformer. Full sweep + `research/qa_full_report.md` wait until the art/pass-2 work is done (owner); perft passes. Merge to main not started.
Start at rebuild/NEXT_AI.md; mode index in rebuild/research/INDEX.md. This section is removed once the rebuild is finished.
- Group 3 (Challenges & Odds, impl_3): 102/102 mode files; video art: 100/102 modes ship art copied from the videos (53 with the video's own pieces/overlays, 47 opponent avatars only), 2 still use an invented human avatar; 26 still show the generic app bot/Stockfish avatar somewhere (mostly Fairy-Stockfish; no video art found). Headless QA 102/102 OK (390+360px, 0 console errors). Updated 11:00 PM ET. Report: rebuild/research/impl_3_report.md
- Group 2 (Drawback Chess + Variant Bots, impl_2): 67/67 mode files; video-art pass done 67/67 (29 bot avatars copied from video sprites/thumbnails, 0 invented SVGs left; 38 Drawback modes use the site's look: no avatars as in the videos, card + slider from the video); headless QA 67/67 load+play, 0 console errors at 390px. Updated 2026-11-24 10:45 PM ET. Report: rebuild/research/impl_2_report.md
- Group 4 (Other + Variants A, impl_4): pass 1 85/85 mode files; video art in 67/85 modes (18 have no sprite yet: frame/thumbnail crops in progress); 0 invented SVGs left (5 unreferenced avatar SVGs deleted); todo_pass2 notes left in 26/85 files (59 cleared); updated 2026-11-24 11:05 PM ET (impl-4, seventh session). Report: rebuild/research/impl_4_report.md
- All groups (recomputed 2026-11-24 10:19 PM ET by g6): 498 of 559 videos have a mode file (89%); 102 mode files still carry todo_pass2.
- Group 1 (Horror/Powerups/Dice, impl_1): pass 1 64/64 mode files; video art 62/64 mode files ship video sprites/frame crops (2 have no sprites, show video dice faces), 0 invented SVGs left (57 deleted), 5 todo_pass2 open; updated 10:46 PM ET. Report: rebuild/research/impl_1_report.md
- Group 5 (Variants B, impl_5): 88/88 mode files; real video art in 88/88 modes (27 no-sprite modes got the video title card + chess.com bar avatars / S-Chess hawk+elephant cut from the video stills); todo_pass2 still in 19; QA 88/88 at 390px, 0 console errors; FPS duel QA path in progress; updated 2026-11-24 11:20 PM ET. Report: rebuild/research/impl_5_report.md
<!-- PROGRESS END -->
