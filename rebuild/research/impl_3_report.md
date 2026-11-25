# impl-3 report (group 3: Challenges & Odds, research/impl_3.json, 102 ids)

Updated 2026-11-24 10:10 PM ET (impl-3 session 2, in progress).

## Session 2 (10 PM ET) so far
- 2er3r0JGeNg reworked from the transcript: vs Croissant (2000), K + h-pawn, 3 cheats as player-bar buttons (one per turn, before your move):
  intern steals an enemy piece (original runner SVG + run-across animation), delete an empty square (neutral Void blocker; knights jump it), spawn one pawn.
- mvPXhAMcT7I, uUXev8TPVak: transcripts fetched; nuke = queen + nightrider (no blast) confirmed; three-check now a rating-climb ladder (CocoCola_8, Jim Bob, 1600, Kruzu 1590, 1765).
- All todo_pass2 in group 3 cleared (102/102): GH9tTFMWEUg 30s bullet clock; YrxMDVnjri8 zoom-out intro (g3_odds 'intro');
  lX407_vwgaA Croissant POV caption toasts + "You Won!"; pbtCSkxUg9Y Viewer board toggle (mini board + material eval bar) and
  blindfold review card (g3_odds 'peek'); KCQ75vB5Jzw + X1aDgLuvLMU show one 8x8 board at a time on phones (board.viewport.mobile,
  Board 1/2 toggle, auto-pan to the board of the pending move).
- Audit: original piece art replaces glyph+badge for Amazon (G3Helsp7ytI, nWEiDXSnEwc, onv0NOspxH8), Elephant (ZoSm2Wxlhvo,
  FxQ-A3nbBzU), Knook (RcpgDq_LNlk), Knibis (RqXorBCKAdA, Y3Jneu7zoq0); generator /workspace/work/g3art/gen.py (outside repo).
- g3_odds ladder levels may now switch sides: lv.side ('w'|'b') + lv.movesPerTurn. B2kYQGiuZZk and wD9UssXbCqA include the video's second game as Black.

## Pass 1: 102/102 done
Last three written this session (commit be1ebb5): L_6xy4JxrKA (Grasshopper explainer -> queens are grasshoppers, inferred),
UZ79sKLa6z4 (Speedrunner vs 3 Hunters: 4-player 8x32 map, hotbar drops, nuke, egg; low confidence),
VVuAgqLzD_o (Meta Chess draft: Void/Dragonfly/Sniper/Medusa vs Sarah's Sumo/Camel/Empress, Rocks d4/e5). All with original SVG art + synth sounds.

## Pass 2: 22 of 28 modes with todo_pass2 fully cleared
Cleared: 5m6UP0ghvdA, 7LBERB7y2hs, A7gdM2GD1b0, D8rD3rTwgjc, JW9VnzQocLk, QHykgd_HEtg, R2e56aLNWR4, UuuPPo3lBnY,
X1aDgLuvLMU, Yp7AnbFcgHI, d-4NWgCwzco, iAwhIiexojg, lfxkP2cWADg, nWdjqATRp5k (transcript confirmed: player holds the Amazon),
patgvfwk5gA, vg3CybHYuIc, vzNwF2BH8jg, yjXcBxP6uyI (+ partial on the ones below).
New shared presentation features in js/modes/g3_odds.js: rangedots, ghost, drawkings, turnorder, tbArrows, killSound,
explodeSound, blast-shape highlight, transform arrow, copycat badge, styled check badges, vent fade.

Remaining todo_pass2 (grep todo_pass2 in group files):
- 2er3r0JGeNg: NEEDS REWORK, transcript now available (see todo text): vs Croissant, K + h-pawn + 3 cheats (delete piece via Among Us crewmate, delete squares, spawn a pawn).
- uUXev8TPVak: transcript re-run still 429.
- mvPXhAMcT7I: transcript re-run still 429 (nuke movement/blast unconfirmed).
- B2kYQGiuZZk, wD9UssXbCqA: bonus games as Black need a side-switching ladder level.
- GH9tTFMWEUg: 30s bullet clock option. KCQ75vB5Jzw: mobile two-board layout (needs shared board-view change).
- YrxMDVnjri8: zoom-out camera intro. lX407_vwgaA: Croissant POV caption panel, "You Won!" popup styling.
- pbtCSkxUg9Y: optional viewer mini board/eval bar, accuracy review card.
- Mode card images (assets/modes/<id>/card.svg via `assets.card`) are drawn but the lobby still shows YouTube thumbnails (lobby change needed, out of group scope).

## QA (headless, 390px plays 3 moves, 360px loads): 102/102 load at both widths, 0 console errors, no horizontal overflow
Scripts outside the repo: /workspace/work/g3qa/qa.py (+run.sh, chunks.txt), functional checks /workspace/work/g3qa/func.py
(range dots, pawn placement, two-board arrows, speedrunner nuke/drops all OK). Note: the random-move harness stalls at the
pawn-placement step of D8rD3rTwgjc / iAwhIiexojg (needs a square click; func.py confirms it works).

## Files touched outside group mode files
Only js/modes/g3_odds.js (own lib). Assets reused read-only: assets/modes/5m6UP0ghvdA/nuke_w.svg, assets/modes/7LBERB7y2hs/bazooka_*.svg.
No engine/UI/README changes. Generated data/*.js not committed.

## Low confidence
UZ79sKLa6z4 (map layout, bazooka/dog moves inferred, no clocks), VVuAgqLzD_o (drafted slots inferred), L_6xy4JxrKA (no game in video),
2er3r0JGeNg (wrong rules until reworked), mvPXhAMcT7I, uUXev8TPVak.
