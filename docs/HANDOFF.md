# Handoff: visual-polish branch

Read this first if you are an AI agent picking this work up. Branch `visual-polish` is a visuals-only pass, started 2026-11-25
from Nathan's brief. Gameplay fixes happen separately (another agent works on rules/engine/bots), so on this branch **do not
change rules, move generation, bots, or win conditions**.

## The owner's brief
- No funky, blurry, or unclean sprites. They ruin immersion.
- Any mode that is 3D in its video must render in real 3D on the site.
- Clean, polished game UI and lobby, with a recommended mode to play on the homepage.
- To replace a bad sprite, try these in order:
  1. Use an exactly matching image from the web, cleaned up.
  2. Edit the existing art ("photoshop" it).
  3. Redraw it in SVG as accurately as possible.

## Quality bar for sprites
- Size: at least 256 px on the long side for pieces and avatars, at least 128 px for icons. They have to stay crisp on 2x phones.
- Alpha: clean, with no halo, no leftover background, and no caption text or UI cut from the video.
- Framing: tight, even crop.
- Look: matches the video, with one consistent style across a mode's whole set.
- File names: keep them unchanged when you replace a raster, so mode files need no edits. If you redraw one as an SVG, rasterise it to a 512 px PNG under the same name and keep the `.svg` next to it.
- Reference frames for each video are on the `rebuild` branch:
  - `rebuild/research/frames/sprites/<id>_*.png`
  - `rebuild/research/frames/video_thumbs/`
  - `rebuild/research/modes/<id>.json`

## Status
| Area | State |
|---|---|
| Lobby and game UI cleanup, plus the recommended-mode hero (`js/lobby/lobby.js` `renderHero`, `css/lobby.css`) | Done (commit "UI: ...") |
| Sprites in `assets/modes/*`, split into 4 slices by folder | Slice 4 (about 100 folders, plus assets/img, avatars, boards) done in commit "Sprites (slice 4)". Slices 1-3 are in progress. |
| Real 3D (`js/fx/presets3d.js` plus `CM.scene3d`) for videos that are 3D: Chess Ultimate, Roblox, Hyper Chess, Petrified Pawns, Infinite, Battle Chess, Table Tactics, Battle Royale, Wizard | In progress |

## Remaining / known gaps
- `xlErokL2-4c/chess_clock.png` has a black bar at the top. `js/fx/g6_3d.js` trims that texture in code, so fix the image and that code together.
- About 20 photo-style avatars are 128-200 px and a bit soft (the D8olpXjblQ0 level bots, Noel, Santa, the yeti). No exact web match turned up for any of them.
- Tiny 5D's grey "Undo / Submit" pills are low-contrast. They copy the game's own look, so they were left as they are.
- Any sprite folder that is not listed as done in a commit message still needs an audit.

## How to verify
- Serve the site: `python3 -m http.server 8000`
- Run the UI check: `python3 tools/qa_ui.py`
- Render 3D in headless Chromium: launch it with `--use-gl=angle --use-angle=swiftshader`.
- Always look at the before/after screenshots yourself before you call something fixed.
