# tools/qa_cine: horror cinematic layer QA (js/fx/horror-cine.js, css/cine.css)
Needs python3 + playwright (chromium). Serves the repo root itself. Output pngs go to $OUT (default /tmp/qa_cine).
- `python3 tools/qa_cine/cine.py <id,id,...> [moves]` plays N touch moves at 390x844, forces a dilation/heartbeat/flicker/blink/alarm,
  resigns, checks title card, ambience, ending caption, clean reset and 0 console errors. `RM=1` = reduced motion, `SHOT=1` = screenshots.
- `python3 tools/qa_cine/still.py <ids>` freezes the title card at `T` ms (default 1300) and an ending caption (`CAP=loss|win`) for contact sheets.
- `python3 tools/qa_cine/rmcheck.py <ids>` reduced motion: lists every running animation that moves/scales/blurs (should only be the
  `board cine-dead` filter fade).
- `python3 tools/qa_cine/hold.py` rAF frame-time sample during the intro + checks the game-over modal waits for the ending beat.
The 24 mode ids: see REG in js/fx/horror-cine.js. Run at most ~4 ids per call (the sandbox kills commands after 120 s); use distinct PORT= for parallel runs.
