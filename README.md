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
- Group 6 (Variants C, impl_6): pass 1 87/87; pass 2 audited 4/87, todo_pass2 left 29; QA pending · rebuild/app/assets/modes (2026-11-24 10:19 PM ET)
- Testing + merge to main: 0%
Start at rebuild/NEXT_AI.md; mode index in rebuild/research/INDEX.md. This section is removed once the rebuild is finished.
- Group 3 (Challenges & Odds, impl_3): 102/102 mode files; pass 2: 102/102 without todo_pass2 (0 left), updated 10:19 PM ET. Report: rebuild/research/impl_3_report.md
- Group 5 (Variants B, impl_5): 88/88 mode files; pass 2: 69/88 without todo_pass2 (19 left), updated 2026-11-24 10:17 PM ET. Report: rebuild/research/impl_5_report.md
- Group 2 (Drawback Chess + Variant Bots, impl_2): 67/67 mode files; video-art pass done 67/67 (29 bot avatars copied from video sprites/thumbnails, 0 invented SVGs left; 38 Drawback modes use the site's look: no avatars as in the videos, card + slider from the video); headless QA 67/67 load+play, 0 console errors at 390px. Updated 2026-11-24 10:45 PM ET. Report: rebuild/research/impl_2_report.md
- Group 4 (Other + Variants A, impl_4): pass 1 85/85 mode files (100%); pass 2 9/35 todo_pass2 files cleared (26 left); updated 10:16 PM ET. Report: rebuild/research/impl_4_report.md
- All groups (recomputed 2026-11-24 10:19 PM ET by g6): 498 of 559 videos have a mode file (89%); 102 mode files still carry todo_pass2.
- Group 1 (Horror/Powerups/Dice, impl_1): pass 1 64/64 mode files; video art 62/64 mode files ship video sprites/frame crops (2 have no sprites, show video dice faces), 0 invented SVGs left (57 deleted), 5 todo_pass2 open; updated 10:46 PM ET. Report: rebuild/research/impl_1_report.md
<!-- PROGRESS END -->
