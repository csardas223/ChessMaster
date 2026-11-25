# impl-5 report (group 5, research/impl_5.json, 88 ids)

Status: art pass done as far as the sources allow (updated with every push). Last update 2026-11-25 ~2:00 AM ET (Hark art-g5v session, art pass 5).

## Art pass (owner 2026-11-24: all art copied from the videos)
Tools: `app/tools/g5_sprites.py` + `g5_sprite_jobs.py` (earlier crops), `app/tools/g5_frames.py` (cuts from the
1280x720 video stills i.ytimg.com/vi/<id>/maxres1..3.jpg; yt-dlp is blocked in the sandbox with 403/429),
`app/tools/g5_wire_sprites.py` (ships every research sprite of the group and wires it: piece img, opponent/ladder
avatar, or a 1.6 s start overlay of the video's own art).

- Modes shipping real video art: **61/88**. Every mode that has research sprites now uses them (0 unused).
- Invented art removed: tools/g5_art.py (hand-drawn pixel sets, troll/goose SVGs), Shotgun King pixel set +
  shotgun_king.svg, Pawnbarian cappy/horned_cappy/boss/hero SVGs, duck.svg, phantom/dragon/disc SVGs, stone.svg,
  the drawn FPS arena + gun SVG.
- Replacements: King of the Bridge pieces cut from M0rsyuvaTrk/WEYUcaJTBso stills (black R/N/B/Q/K = same sprite
  with the real black pawn's fill: inferred); Pawnbarian monsters from Kzt9ItpGtYg maxres3; FPS duel title card +
  Victorian room from the stills; Petrified stones = the chess.com piece greyed (as in both videos).
- Known gaps: Shotgun King white pieces (outline-only sprites, JPEG stills too noisy to cut) use the standard set;
  Chess Ultimate characters (devil/giant sprites are ~30 px blurs; group 4 is cutting CU art, reuse when pushed);
  Chaturanga chariot/elephant on-board crops too small to key; sounds are still synthesised (no audio source).
- The 27 no-sprite modes: video title card (maxresdefault) + chess.com bar avatar where the bar shows one (tools/g5_thumbcrops.py),
  plus game art where the video has any (g5_frames2.py: Roulette pixel set, Battle Chess cutscenes, Judit portraits, Hyper Chess,
  10,000 Player colours; g5_art4.py: Martin's Family ladder avatars). Most of them are plain chess.com/lichess variants whose videos
  show only the standard set, so there is no custom piece art to cut. Real video art: **88/88**.

## Art pass 4 (2026-11-25, tools/g5_art4.py; stills read from research/frames/video_thumbs first)
Owner 2026-11-25: use research/frames/sprites + research/frames/video_thumbs before YouTube; only fetch the exact still for an id
with neither. Stills used here are committed to research/frames/video_thumbs (boaA9_TjXeU, QrKIKcYN5m4, GQ6MT1m78Yo, JAz_qMQpI1o,
DMtaRFMpCWc); g5_art4.py reads that copy first.
- Ouroboros King (JAz_qMQpI1o, _RFXN1Ye3sY): King, General, Viking, Portal Mage, Rook, Knight, Reaper icons cut from the board in
  JAz maxres2; the other side = same icon with fill/outline swapped (as the game shows the General/knight; inferred for the rest).
- Thermopylae: Wildebeest (red bull head) + Nightrider (double knight; red = hue-shifted copy, inferred) from the thumbnail;
  Ways to Win card as the start overlay; chess.com bot icon on the Blue/Yellow bots.
- Stone Gravitation: ilikecheese bar avatar; the meme clip overlay (shown once at ply 16: timing inferred).
- Martin's Family: Martin M. Martin + Martin XIII ladder avatars (Jr., Marty, Martina are in no still).
- Pawnbarian: pink diagonal slash splash (from slash_ref) + '1 damage' text on every hero attack.
- Wizard Chess: board colours sampled from the still (tan #b98e59 / maroon #3e1229); Teacher (Minotaur) dialogue frame as the start overlay.

## Art pass 5 (2026-11-25, tools/g5_art5.py; owner-approved video frames)
Owner 2026-11-25: grab frames from the videos for art the repo stills don't show. Method: the browser opens the video on
youtube.com, sets 1080p, seeks, pauses, goes full screen, hides the controls and ENDS the task on that frame; the task's last
screenshot (get_browser_result -> last_screenshot_key -> download_artifact) is the 1920x1440 page with the 1920x1080 video at
y 180..1260. Only the LAST screenshot of a browser task is retrievable, so it is one frame per task (start_url must differ per
task, e.g. &t=<s>, or the dispatcher skips it as a repeat). No downloaders, no audio. 20 frames committed as
research/frames/video_thumbs/<id>_frame_<seconds>.jpg.
- Wizard Chess (DMtaRFMpCWc): dog, merc, javelina, druid, rogue (blue) + golden skeleton and guard cut from the 15:22 frame (no stat
  badges during the boss-reveal dialogue); the player's Guard = blue copy of the golden one (inferred); Cloaky = his cloaked sprite from
  the 1:58 dialogue scene (the magenta boss unit at 17:05 always has its ATK/DEF badge across the robe); Cloaky's "Conspiratorial
  whispers" dialogue box shown when the boss room starts (params.bossIntro, g5_wizard onStart). Skeleton Brute uses the golden Guard sprite.
- Ouroboros King (JAz_qMQpI1o, _RFXN1Ye3sY): Glass Queen icon from the _RFXN1Ye3sY 3:43 board (black = fill/outline swap, inferred);
  each video's own VICTORY banner (JAz 18:07, the pointer patched with the same banner pixels from _RFXN 19:25) shown on a battle win
  (params.victoryImg, g5_ouro onGameOver).
- Pawnbarian (Kzt9ItpGtYg): Goblin Caves monsters as round tokens cut from their cells (Spidertoad 11:43, Champion Goblin Shaman 15:40,
  Goblin Blightvessel + Blightsack 22:20; a transparent cut-out was not reliable: blight tint, claw notches and champion rings touch the
  outlines); new floor "The Goblin Caves" (Spidertoads, Shaman, horned Cappy Bears); the cantrip zap burst (11:43) plays with the slash
  on every hero attack. The "lightning attack" in the video is the cantrip card's bolt icon + this zap glint, not a separate bolt VFX.
- Thermopylae (boaA9_TjXeU): General, Sergeant, Soldier, Archbishop from the video's piece-introduction cards (1:05 Archbishop, 1:10
  General, 1:15 Sergeant, 1:38 Soldier; red); Green's General/Sergeants/Soldiers are hue-shifted copies (inferred).

## Pass 2 (todo_pass2)
11 files carry todo_pass2. Art items left after pass 5:
- Ouroboros x2: Prince, Marching Pawn, Soldier icons: not in either Ouroboros video (transcripts name only the Princess; recruit/board
  frames show other units), so they stay standard pieces + badges until another Ouroboros video is sourced.
- Pawnbarian: Blightvessel art shipped but not placed (needs a second boss type with its own image in g5_pawnbarian); Blightsack art
  shipped but not placed (sacks spawn on deaths: needs a hook; a lone sack would stalemate the monster side); promotion splash trigger.
- Wizard Chess: isometric view and magenta/green move tiles (engine/hook work); Passant special tiles (rules unknown).
Non-art items (sounds/logic/UI) left as todo_pass2 in I07GcHQtY2o, M0Nr98Axpo8, Nz2A-g73_iM, OO3XlFQ32i0, QrKIKcYN5m4 (rules),
c-_Th-jjfyM and the files above.

## QA
Headless playwright at 390 px (/workspace/work/g5qa.py, sandbox only: open each mode, up to 4 random plies incl. drops
for placement-phase modes, console/page errors, local 404s, horizontal overflow). 2026-11-24 11:05 PM ET re-run:
**88/88 load and play, 0 console errors, 0 local 404s, 0 overflow** (the earlier "28/88" line was stale). 2026-11-25: modes changed
in art pass 4 re-checked with tools/qa_all.py --par 1 at 390 px: 8/8 OK, 0 console errors.
2026-11-25 ~2 AM ET: art-pass-5 modes (DMtaRFMpCWc, JAz_qMQpI1o, _RFXN1Ye3sY, Kzt9ItpGtYg, boaA9_TjXeU) re-checked with
tools/qa_all.py --par 1 at 390 + 360 px: 10/10 OK, 0 console errors, 0 missing assets.
Not yet covered by that smoke test: the FPS duel overlay (only fires on a capture) - dedicated QA path in progress.
