# impl-5 report (group 5, research/impl_5.json, 88 ids)

Status: IN PROGRESS (updated with every push). Last update 2026-11-24 ~10:50 PM ET.

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
- 27 modes have no research sprite (mostly plain variants / bot matches): frame-based art still todo.

## Pass 2 (todo_pass2)
19 files still carry todo_pass2 (see README). Art items in them are covered above where a sprite/frame existed.

## QA
Headless playwright at 390 px (/workspace/work/g5qa.py: open, 4 random plies, console/page errors, local 404s,
overflow). Batch 1-2 (28 modes): all load, play, 0 errors.
