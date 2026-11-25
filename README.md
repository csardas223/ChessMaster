# Chess Master

Fan remake of iwantcheckmate's chess-variant videos as 559 playable modes. Single-file app: open `index.html` in a browser.

Stockfish modes load Stockfish 19 lite from unpkg at runtime; thumbnails come from YouTube.

All videos © iwantcheckmate (youtube.com/@iwantcheckmate).


<!-- PROGRESS START -->
## Rebuild progress (updated 2026-11-24 10:07 PM ET)
- Overall: ~58%
- Research specs: 559/559 (100%); ~25 low confidence (see rebuild/HANDOFF.md).
- Engine + chess.com-style UI: ~60%. Verified: perft passes; headless smoke test of standard, Atomic, Backrooms, SCP-2774, Minihouse 6x6, Cross Derby, Gravity, 4-player and legacy modes loads and plays with 0 console errors at 390px.
- Mode implementation: 494/559 mode files (88%), six agents in parallel (impl_1..6.json). Group 5 (Variants B): 88/88.
- Group 6 (Variants C, impl_6): pass 1 87/87; pass 2 audited 1/87, todo_pass2 left 32; QA pending (2026-11-24 10:07 PM ET)
- Testing + merge to main: 0%
Start at rebuild/NEXT_AI.md; mode index in rebuild/research/INDEX.md. This section is removed once the rebuild is finished.
- Group 3 (Challenges & Odds, impl_3): 102/102 mode files; pass 2: 99/102 without todo_pass2 (3 left), updated 10:07 PM ET. Report: rebuild/research/impl_3_report.md
- Group 5 (Variants B, impl_5): 88/88 mode files; pass 2: 65/88 without todo_pass2 (23 left), updated 2026-11-24 10:06 PM ET. Report: rebuild/research/impl_5_report.md
- Group 1 (Horror/Powerups/Dice, impl_1): pass 1 63/64 mode files (98%); pass 2 0/64 audited and clear of todo_pass2 (8 files still list todo_pass2); updated 10:05 PM ET. Report: rebuild/research/impl_1_report.md
- Group 2 (Drawback Chess + Variant Bots, impl_2): 67/67 mode files (100%), verified vs specs; pass 2: 67/67 modes clear of todo_pass2 (0 items open). Report: rebuild/research/impl_2_report.md. Updated 2026-11-24 10:06 PM ET.
- Group 4 (Other + Variants A, impl_4): pass 1 82/85 mode files (96%); pass 2 0/33 todo_pass2 files cleared (33 left); updated 10:06 PM ET. Report: rebuild/research/impl_4_report.md
- All groups (recomputed 2026-11-24 10:07 PM ET by g6): 494 of 559 videos have a mode file (88%); 110 mode files still carry todo_pass2.

- All groups (recount by impl-3, 10:07 PM ET): 494/559 mode files (88%), 109 still carry todo_pass2.
<!-- PROGRESS END -->
