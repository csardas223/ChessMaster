# FPS Chess real-3D duel (PszkLYudcws, Nz2A-g73_iM)

Status (2026-11-26, fin-fps): wired in. Every capture attempt in both FPS Chess modes opens the three.js first-person duel
(`js/modes/fps3d/duel.js`, models in `js/modes/fps3d/models.js`); `js/modes/g5_fps.js` keeps the 2D tap duel as the
fallback when WebGL / three.js is unavailable or `params.fps3d === false`.

## Video accuracy (owner rule 2026-11-26: 3D modes must match the videos)
References: thumbnails + maxres1-3 stills of both videos, VS-card cut-outs in assets/modes/{PszkLYudcws,Nz2A-g73_iM}/.
- Arena = the game's own Victorian room at piece scale (PszkLYudcws duel still): you fight on the floor under the giant
  table (chessboard + the rest of the position on top), chandelier (ship-wheel ring of bulbs), red wood-grain walls,
  plank floor, red carpet with gold diamonds, fireplace + painting, sconces with white shades, pink-red curtains, door.
  Both videos are the same game, so both modes use this room.
- High ground: chair seats (giant-book steps lead up) and two book perches (the pawn that sniped from on top, Nz2A 2:16).
- Pieces: glossy cream / black Staunton (VS cards). VS card: grey left / cream right diagonal split, names top, orange Vs.
- Weapons: pawn AK (Nz2A thumbnail), knight wooden crossbow (PszkLYudcws still), king blade swipe (transcript 0:35);
  queen battle rifle, rook shotgun, bishop wand are INFERRED (not shown).
- HUD: bottom-left white ability tiles "Left Shift" and "E" (still), 4-tick crosshair, health bars (Nz2A visual_fx).
- Rules: 3-2-1 then fight; winner keeps / takes the square; hp carries over; Left Shift sprint (bishop flies), E ability
  once per duel, block shots (Q / Block; key not named in the video: inferred); time cap 60 s = defender holds.

## Gaps not closed
- Exact game meshes/textures are not available (no model files); everything is code-built approximations.
- Weapons for Q / R / B, ability effects for R / Q, the block key and all numbers (hp, damage, rates) are inferred.
- Sounds are our own synthesised WAVs (assets/modes/AWFB4EzGtDc/), not the game's.

## QA
`python3 tools/qa_fps3d.py [--only phone|desk1|desk2]` (Playwright + SwiftShader): 390x844 touch (joystick, look-drag,
Fire) and 1366x900 desktop (WASD, Space, Q, mouse); wins and loses duels and checks the board result + 0 console errors.
SwiftShader is slow: the script measures movement in game time (dbg().clock). CM.fps3d.qaHold freezes enemy fire (QA only).

## Status 2026-11-26 11:21 AM ET (fin-fps, cut off by usage)
- Input fix on wip/fps-3d (1b6ad45, js/modes/fps3d/duel.js): every click queues one shot (`D.fireQ` counter, max 4;
  `Dp.pull`), chorded left presses (pointermove with button 0) count, queued clicks may fire several shots in one slow
  frame (`D.rawDt / rate`, max 4, `Dp.shootOnce`), reload finishes on real time. Not yet proven by desk2.
- tools/qa_fps3d.py: desk2 checks 6 quick clicks -> 6 shots and shots vs clicks; loops/waits sized for sandbox load.
- desk1 rerun 11:10-11:21 ET (load 30-44): ok through "bot attack opens a defend duel" (WASD, jump, Q block, drag-look,
  idle LOSS, knight survives); killed during duel B (king vs knight) by the wrap-up. desk2 not rerun.
  Log + screenshots: research/ref/fin-fps/qa/ (desk_4/desk_5 jpg may be from an earlier run).
- Merged to main 2026-11-26 (4d03b49); phone QA re-passed on main. desk1/desk2 not rerun. Next steps: RESUME line of ## fin-fps in research/polish_report.md.
