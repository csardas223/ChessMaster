# impl-3 report (group 3: Challenges & Odds, research/impl_3.json, 102 ids)

## Session 4 (8th Hark session, 11:25 PM - 11:50 PM ET): last generic avatars replaced; group 3 COMPLETE
- Video art: 102/102 modes ship art copied from the videos (or the exact on-screen site art). 0 generic app avatars
  (assets/avatars/*) left in group 3, 0 invented SVGs, 0 missing local assets, 0 todo_pass2.
- Last 4 generic bot.svg uses replaced (commit fc4f5cd): chess.com ladder bots Elsa (150), Noel (550), Zara (850) in
  AdbO98Fa7cY, H34VPnGT8tA, nK5WQNSbFfE, vHVSgesfZ0o now show the exact chess.com bot avatar the videos show in the player bar
  (YouTube stills never show these three; images from each bot's chess.com page, same art set as the Martin/Juan crops cut from
  the frames, flattened onto the dark player-bar grey). Recorded in tools/g3_frames.py (CHESSCOM list). These 3 are the only
  group-3 avatars not cut from a video frame: they are site art as on screen.
- vHVSgesfZ0o: transcript "Noelle (550)" is chess.com's Noel (chess.com's 550 bots are Noel, Oliver, Milica); renamed.
- Earlier this session window (commits 420d31e, 807f00c by impl-3 session 3b): Fairy-Stockfish fish avatars from each lichess
  video's thumbnail, chessreps rainbow fish, CocoCola_8/default/SpherePlays/"Opponent" replace human.svg, purple-king player
  avatar, Speedrunner duck/egg/brick.
- Sounds (owner 11:42 PM ET): mode effect sounds stay our synthesised ones; no video audio. No sound todo items left in group 3.
- Effects: every vfx/overlay item in the specs is implemented (pass 2 cleared all todo_pass2 earlier); no further effect work
  possible without real video frames (headless Chromium cannot reach youtube.com through the sandbox proxy: Page.goto timeout).
- QA (tools/qa_all.py --group 3, results /workspace/work/g3qa8/res): 204/204 runs OK (102 modes x 390+360 px): 0 console errors,
  0 local 404s, no overflow. 18 first-pass failures were all Page.goto/qa timeouts from Chromium contention (other agents);
  all passed on --redo with --par 2. Spot re-check after the chess.com core-sound commit 41c2b07: 8/8 OK. perft PASS.
  Tip: ids starting with '-' need --ids=-abc,...

Resume notes: nothing left for group 3. If anything regresses, re-run QA with --par 2 and redo timeouts before treating as failures.

## Session 3 (10:25-10:55 PM ET): video-art pass (owner art direction)
Tool: rebuild/app/tools/g3_sprites.py (run from rebuild/app). Sources only research/frames/sprites/<id>_*.png and the video's own
YouTube thumbnail (maxresdefault); pieces cut out of their tile (flood fill / tile-colour key + largest blob), avatars are square
thumbnail crops. No generated or hand-drawn art. One-off file patcher used: /workspace/work/g3patch/patch.py (outside repo).

Honest counts (real video art, not todo_pass2):
- 100/102 modes ship art copied from the videos: 53 with the video's own pieces/overlays/intro images, 47 only an opponent avatar
  from a video sprite or thumbnail (Martin, Magnus, Zach, Juan, Stockfish fish, Gotham, Ding, Leela, Hikaru, Tony, Croissant,
  streamers TwoNiche/sadisticTushi/Arturchix/jacksark/ChessVibes/ViperKing/Botez, Baby Gotham, Laura/Amir/Vin/David...).
- 87 invented SVGs deleted from group asset dirs (Amazon/Elephant/Knook/Knibis/nuke/bazooka/snake/copycat/impostor/fish/face/minion/moon,
  transformer pixel SVGs, croissant/babygotham/maximum/engine/sarah/redpanda/viper/franchise avatars, webcam, trophy, cards, void icon).
- Coordinator audit (sprites present but unused): A7gdM2GD1b0 transformer piece = video glitch sprite (+ type badge);
  D2B85mhGtT0 knight_wall, V_3rvGDzv_U queen_wall, uKy9Lb98G3E bishop_wall, KCQ75vB5Jzw multi_boards, qUROR6pcKKw promotion_picker,
  GH9tTFMWEUg eggs, D8rD3rTwgjc pawn_spawn shipped as-is as a game_start intro overlay (vfx_timeline); VVuAgqLzD_o pieces
  (Medusa/Sniper/Dragonfly(pegasus)/Camel/Sumo/Rock) from its sprites. All 9 now ship their sprites.
- Dragon-series modes share the clean cR6r8NZz-CA dragon_[wb].png (same dragon image in every video; per-video crops were low-res).
- Black copies of white-only pieces (bomb_b, grenade_b, camel_b, sumo_b) are the video pixels with the light body darkened.

Still not video art (next AI):
- human.svg avatar (uUXev8TPVak, 98Fzc7uQ7Ns, GH9tTFMWEUg): opponents are anonymous online players; no sprite.
- UZ79sKLa6z4 egg/duck/brick SVG items: hotbar sprite too small to cut; needs real frames.
- Generic app avatars (assets/avatars/bot.svg|stockfish.svg) still in 26 modes: mostly Fairy-Stockfish (lichess), plus Elsa/Noel/Noelle/Zara ladder bots, Sarah (VVuAgqLzD_o), Grasshopper Bot. Aaron/Maria/Pepe now reuse group 1/4 video crops.
  Elsa/Noel/Pepe/Aaron/Zara/Noelle ladder bots, Sarah (VVuAgqLzD_o), Grasshopper Bot. Group 1 has 9pHhqAbQS0s/aaron.png etc. (check after their push).
- VVuAgqLzD_o Void and Empress, goDcorwxJnA Moon: drawn as standard piece glyphs (no sprite of them).
- yt-dlp is blocked (403) here, so no real video frames beyond thumbnails.

QA (headless playwright, /workspace/work/g3qa/qa.py outside repo): 102/102 load at 390 and 360px, 3 plies played at 390px,
0 console/page errors, 0 local 404s, 0 broken images, no horizontal overflow. Known harness limit: D8rD3rTwgjc / iAwhIiexojg wait
for a pawn-placement click (works by hand).


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
