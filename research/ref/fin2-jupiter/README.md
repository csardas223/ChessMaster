# fin2-jupiter reference (Jupiter 2011 Chess, Mg2Upjjo2yg)

Owner asks (2026-11-26 ET): 11:04 "make jupiter 2011's sprites video accurate"; 11:13 "Skeld map must be video accurate as well but not blurry"; 11:14 write everything down in the repo, images included.

## Files
- `thumbs/` YouTube stills from i.ytimg.com/vi/Mg2Upjjo2yg/: maxresdefault (thumbnail: KIES label, red F Key, colour astronaut portraits of Speed / Queso / Creek), maxres1-3 (1280x720 in-game stills: maxres1 = Creek in check, maxres2 = Speed caught + Queso in Cafeteria, maxres3 = end card), hq/sd variants.
- `video/full_map_t0000_1440p.jpg`: the video frame at 0:00 played at 1440p (Hark browser session "youtube-jupiter-frames", 2026-11-26 ~11:10 ET). The whole ship is visible: this is the game's start position. `video/watchpage_t0000.webp` is the full screenshot it was cut from.
- `skeld_mask_45x23.txt`: the board traced from that frame (sampled at the 4 corners of each square; pitch 28.31 px, origin x=56,y=112 of the screenshot). `.` = square, `x` = void, `P` = escape pod (3 grey squares, row 11, cols 42-44). Light square when (row+col) is even (row 0 = top).
- `skeld_mask_vs_video.jpg`: video crop (top) vs the mask redrawn (bottom); every square matches.

## Start position read from the 0:00 frame (row, col; row 0 = top)
- Astronauts: Creek (2,13) Cafeteria; Speed (6,4) left corridor; Queso (19,30) lower right.
- White: N (0,14) (4,20) (8,16) (16,18); R (2,7) (6,17) (12,25) (13,21); B (10,24) (14,1) (16,5) (16,15); Q (8,17) (21,24);
  P (2,14) (3,5) (3,12) (3,19) (3,29) (4,22) (5,4) (5,15) (8,1) (9,0) (9,27) (17,7) (17,14) (17,19) (19,5) (19,9).
- 30 Keys (transcript 3:11 "three different keys out of 30"): (2,17) (2,20) (3,6) (4,12) (4,32) (5,17) (6,14) (6,22) (7,14) (8,21) (8,22) (9,11) (9,33) (10,40) (11,4) (11,23) (13,31) (14,9) (14,11) (15,22) (16,9) (16,17) (16,28) (16,30) (17,28) (18,6) (18,26) (19,3) (20,23) (22,23).
- Board colours in the frame: light ~#e5d3b5, dark ~#ad8465 (lichess brown #f0d9b5/#b58863 after video compression), void #292728, pod squares light grey.
- No room names, vents or other markings are drawn on the video's board.
