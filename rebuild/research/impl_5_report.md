# impl-5 report (group 5, research/impl_5.json, 88 ids)

Status: art pass done as far as the sources allow (updated with every push). Last update 2026-11-25 ~12:45 AM ET (Hark art-g5 session).

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

## Pass 2 (todo_pass2)
11 files carry todo_pass2. Art items left (~13, all blocked on the source or on a logic hook):
Wizard Chess (iso 3D view, units other than the Bard are ~30 px blurs, Cloaky dialogue not in a still, magenta/green move tiles need a
hook), Ouroboros x2 (Prince/Glass Queen/Marching Pawn/Soldier icons not in a still, VICTORY screen), Pawnbarian (lightning VFX and
later-area monsters not in a still; promotion splash art shipped but needs a trigger), Passant special tiles (sprites exist, rules
unknown), Thermopylae General/Sergeant/Soldier/Archbishop (not identifiable). Non-art items (sounds/logic/UI) left as todo_pass2 in
I07GcHQtY2o, M0Nr98Axpo8, Nz2A-g73_iM, OO3XlFQ32i0, QrKIKcYN5m4 (rules), c-_Th-jjfyM and the files above.

## QA
Headless playwright at 390 px (/workspace/work/g5qa.py, sandbox only: open each mode, up to 4 random plies incl. drops
for placement-phase modes, console/page errors, local 404s, horizontal overflow). 2026-11-24 11:05 PM ET re-run:
**88/88 load and play, 0 console errors, 0 local 404s, 0 overflow** (the earlier "28/88" line was stale). 2026-11-25: modes changed
in art pass 4 re-checked with tools/qa_all.py --par 1 at 390 px: 8/8 OK, 0 console errors.
Not yet covered by that smoke test: the FPS duel overlay (only fires on a capture) - dedicated QA path in progress.
