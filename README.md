# Chess Master

Fan remake of iwantcheckmate's chess-variant videos as 559 playable modes. Single-file app: open `index.html` in a browser.

Stockfish modes load Stockfish 19 lite from unpkg at runtime; thumbnails come from YouTube.

All videos © iwantcheckmate (youtube.com/@iwantcheckmate).


<!-- PROGRESS START -->
## Rebuild progress (updated 2026-11-24 9:24 PM ET)
- Overall: ~58%
- Research specs: 559/559 (100%); ~25 low confidence (see rebuild/HANDOFF.md).
- Engine + chess.com-style UI: ~60%. Verified: perft passes; headless smoke test of standard, Atomic, Backrooms, SCP-2774, Minihouse 6x6, Cross Derby, Gravity, 4-player and legacy modes loads and plays with 0 console errors at 390px.
- Mode implementation: 318/559 mode files (57%), six agents in parallel (impl_1..6.json). Group 5 (Variants B): 65/88.
- Group 6 (Variants C): 54/87 mode files (62%), updated 9:24 PM ET. Report: rebuild/research/impl_6_report.md
- Testing + merge to main: 0%
Start at rebuild/NEXT_AI.md; mode index in rebuild/research/INDEX.md. This section is removed once the rebuild is finished.
- Group 1 (Horror/Powerups/Dice, impl_1): 45/64 mode files (70%). All groups: 312 mode files of 559 videos (~56%), updated 2026-11-24 9:23 PM ET.
- Group 2 (Drawback Chess + Variant Bots, impl_2): 67/67 mode files (100%), verified vs specs; pass 2: 29/67 modes clear of todo_pass2 (77 items open). Report: rebuild/research/impl_2_report.md. Updated 2026-11-24 10:02 PM ET.
- All groups (recomputed 2026-11-24 10:02 PM ET by g2): 485 mode files in app/data/modes (87% of 559 videos); 137 still carry todo_pass2.
<!-- PROGRESS END -->
