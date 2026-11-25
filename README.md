# Chess Master

Fan remake of iwantcheckmate's chess-variant videos as 559 playable modes. Single-file app: open `index.html` in a browser.

Stockfish modes load Stockfish 19 lite from unpkg at runtime; thumbnails come from YouTube.

All videos © iwantcheckmate (youtube.com/@iwantcheckmate).


<!-- PROGRESS START -->
## Rebuild progress (updated 2026-11-24 8:55 PM ET)
- Overall: ~40%
- Research specs: 559/559 (100%); ~25 low confidence (see rebuild/HANDOFF.md).
- Engine + chess.com-style UI: ~60%. Verified: perft passes; headless smoke test of standard, Atomic, Backrooms, SCP-2774, Minihouse 6x6, Cross Derby, Gravity, 4-player and legacy modes loads and plays with 0 console errors at 390px.
- Mode implementation: in progress. 493 remaining ids split into rebuild/research/impl_1..6.json, six agents writing data/modes/<id>.js in parallel.
- Testing + merge to main: 0%
Start at rebuild/NEXT_AI.md; mode index in rebuild/research/INDEX.md. This section is removed once the rebuild is finished.
- Group 1 (Horror/Powerups/Dice, impl_1): 35/64 mode files (55%). All groups: 224 mode files of 559 videos (~40%), updated 2026-11-24 9:16 PM ET.
<!-- PROGRESS END -->
