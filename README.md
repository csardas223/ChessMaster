# Chess Master

Fan remake of iwantcheckmate's chess-variant videos as 559 playable modes. Single-file app: open `index.html` in a browser.

Stockfish modes load Stockfish 19 lite from unpkg at runtime; thumbnails come from YouTube.

All videos © iwantcheckmate (youtube.com/@iwantcheckmate).


<!-- PROGRESS START -->
## Rebuild progress (updated 2026-11-24 9:21 PM ET)
- Overall: ~51%
- Research specs: 559/559 (100%); ~25 low confidence (see rebuild/HANDOFF.md).
- Engine + chess.com-style UI: ~60%. Verified: perft passes; headless smoke test of standard, Atomic, Backrooms, SCP-2774, Minihouse 6x6, Cross Derby, Gravity, 4-player and legacy modes loads and plays with 0 console errors at 390px.
- Mode implementation: 256/559 mode files (46%), six agents in parallel (impl_1..6.json). Group 5 (Variants B): 58/88.
- Group 2 (Drawback Chess + Variant Bots, impl_2.json): 15/67 mode files (22%), updated 2026-11-24 9:22 PM ET. All mode files on rebuild: 286/559 (51%).
- Group 6 (Variants C): 48/87 mode files (55%), updated 9:19 PM ET. Report: rebuild/research/impl_6_report.md
- Testing + merge to main: 0%
Start at rebuild/NEXT_AI.md; mode index in rebuild/research/INDEX.md. This section is removed once the rebuild is finished.
<!-- PROGRESS END -->
