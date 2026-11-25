# Chess Master

Fan remake of iwantcheckmate's chess-variant videos as 559 playable modes. Single-file app: open `index.html` in a browser.

Stockfish modes load Stockfish 19 lite from unpkg at runtime; thumbnails come from YouTube.

All videos © iwantcheckmate (youtube.com/@iwantcheckmate).


<!-- PROGRESS START -->
## Rebuild progress (updated 2026-11-24 9:24 PM ET)
- Overall: ~58%
- Research specs: 559/559 (100%); ~25 low confidence (see rebuild/HANDOFF.md).
- Engine + chess.com-style UI: ~60%. Verified: perft passes; headless smoke test of standard, Atomic, Backrooms, SCP-2774, Minihouse 6x6, Cross Derby, Gravity, 4-player and legacy modes loads and plays with 0 console errors at 390px.
- Mode implementation: 488/559 mode files (87%), six agents in parallel (impl_1..6.json). Group 5 (Variants B): 87/88.
- Group 6 (Variants C): 54/87 mode files (62%), updated 9:24 PM ET. Report: rebuild/research/impl_6_report.md
- Testing + merge to main: 0%
Start at rebuild/NEXT_AI.md; mode index in rebuild/research/INDEX.md. This section is removed once the rebuild is finished.
- Group 1 (Horror/Powerups/Dice, impl_1): 45/64 mode files (70%). All groups: 312 mode files of 559 videos (~56%), updated 2026-11-24 9:23 PM ET.
- Group 3 (Challenges & Odds, impl_3): 102/102 mode files; pass 2: 96/102 without todo_pass2 (6 left), updated 10:03 PM ET. Report: rebuild/research/impl_3_report.md
- All groups (recount, 2026-11-24 10:04 PM ET): 488/559 mode files (87%), 145 still carry todo_pass2.
- Group 4 (Other + Variants A, impl_4): pass 1 80/85 mode files (94%); pass 2 -1/30 todo_pass2 files cleared (31 left); updated 10:03 PM ET. Report: rebuild/research/impl_4_report.md
- Group 5 (Variants B, impl_5): 87/88 mode files; pass 2: 66/88 without todo_pass2 (22 left), updated 2026-11-24 10:04 PM ET. Report: rebuild/research/impl_5_report.md
- Group 2 (Drawback Chess + Variant Bots, impl_2): 67/67 mode files (100%), verified vs specs; pass 2: 66/67 modes clear of todo_pass2 (1 items open). Report: rebuild/research/impl_2_report.md. Updated 2026-11-24 10:04 PM ET.
- All groups (recomputed 2026-11-24 10:04 PM ET by g2): 489 mode files in app/data/modes (87% of 559 videos); 100 still carry todo_pass2.
<!-- PROGRESS END -->
