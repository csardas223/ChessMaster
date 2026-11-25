# impl-1 report (group 1: Horror / Powerups / Dice), updated 2026-11-25 01:45 AM ET

## Pass-2 wrap-up 2026-11-25 01:45 AM ET (agent-g1g4, group 1 only)
- todo_pass2: 0 items anywhere in group 1; the 19 leftover empty `todo_pass2: []` lines were removed (7csbf0L-uio, 9pHhqAbQS0s,
  AoREbapF7y0, IU9a1RB1KJw, IwbWTK5_1nY, Ji7frCIfmAQ, Re3c-3qomgQ, Ugw05nktuDM, aSc3Cs0eo7g, fRZmYTwLE54, hgU5hVwLlHo,
  p49nLVPVmws, q9-mIuPLroo, riHSnaWRQlY, rx-HCGCNuDo, ucGhD2hC_6s, vQ3hLgU6jLA, w15Ev7q2HmI, wPaOpQw4FoY). IU9a1RB1KJw's
  resolution note now lives only in its header/history (no swap rule: the purple boxes are narrator marks).
- Spec audit (visual_fx + events of all 64 research/modes/<id>.json vs the mode files): every listed effect is implemented
  except the ones below. Added: amA3ARfEoU8 SCP-173 "concrete-scrape sound on jump" (assets/modes/amA3ARfEoU8/scrape.wav,
  our own synth in tools/g1_sounds.py, played with the purple jump arrow; no video audio).
- Not done, by design: s2WDIfvefEk sound-wave ripple (spec marks it inferred; the magenta arrow the frames show is there);
  k_OvayYKZYI / IU9a1RB1KJw green/purple arrows and boxes are the narrator's analysis marks, not game VFX.
- Avatars: bot.svg only for 9pHhqAbQS0s ladder bots after Aziz ("Bot 1250"+). The video ends with the loss to Aziz (16:56), so
  no frame shows them; no browser frame can supply that art. Legit fallback, left as is.
- QA: tools/qa_all.py --group 1 at 390 and 360 px: 128/128 runs loaded, played, 0 console errors, 0 missing assets.
- Group 4 is now owned by cm-g4; this agent changed no group-4 file.


## Art status 2026-11-25 00:40 AM ET (ninth session, art-only agent): GROUP 1 ART COMPLETE
- 64/64 mode files ship video art from app/assets/modes/<id>/ (KJYUsRlj_34 + OcWzHqqeLNg: die/ROLL/YOU WIN/avatar cropped from
  their own frames, commit 6381ed3/33cfac1). Every research sprite for a g1 id is used. 0 invented SVGs. todo_pass2: 0 open
  (all 5 cleared in 2eebd9b; the "Open todo_pass2" list below is history).
- Only generic avatar left in g1: 9pHhqAbQS0s ladder bots past Aziz ("Bot <rating>") -> assets/avatars/bot.svg, because the video
  ends at Aziz and never shows them (legit fallback).
- Group 3 re-audit: 102/102 video art, 0 SVG, 0 todo_pass2, 0 missing asset paths. One real art bug fixed (b797191): the shared
  Dragon art assets/modes/cR6r8NZz-CA/dragon_w.png was the BLACK dragon and dragon_b.png the white one, so all 13 Dragon-series
  modes drew colours swapped; files swapped to match the videos' sprites. sv3DeeGsB2E keeps the shared clean dragon (its own
  research sprite is a 128px low-res copy of the same image).
- bot.svg in other groups (avatar lines only): tfPyy36nwc4 Manuel -> WciUSfeqGgs/manuel.png (same chess.com bot, video crop; c6103a2).
  Still bot.svg because the repo's frames/thumbs never show them (owner: repo first, no other sites): AaHmMC3HA0E Trash Bot 1999 +
  The Master, D8olpXjblQ0 Level 20, tfPyy36nwc4 Wendy/Miguel/Lee (g6_ladder fallback). tfPyy36nwc4 has no research thumbs; its
  storyboard frames are too small (~10 px) for an avatar crop.


## Pass 1: 64 / 64 ids in impl_1.json have a mode file (Ji7frCIfmAQ, rx-HCGCNuDo, IwbWTK5_1nY were finished earlier tonight).

## Art pass (owner direction: copy art straight from the videos)
Script: `app/tools/g1_sprites.py` (run from rebuild/app). Three sources, all from the videos, nothing generated or drawn:
1. `MAP`: research/frames/sprites/<id>_*.png copied/cropped (flood-fill background cut for pieces) into assets/modes/<id>/.
2. `FRAMES`: crops from the videos' own YouTube storyboard frames (i.ytimg.com/vi/<id>/maxres1-3 / maxresdefault):
   Martin, Zach and Aron portraits (9pHhqAbQS0s), OFFSIDE banner (ucGhD2hC_6s), clock badge (riHSnaWRQlY).
3. `DICE`: red piece-die faces (P N B R Q K) cut from the Dice Chess sprites -> assets/modes/B5LGzOEZSyo/face_*.png,
   used by js/modes/g1_dice.js for every dice mode. Each dice video with sprites also ships its own die image (intro
   overlay), its ROLL button (beside the rolled dice) and, where the video has one, its YOU WIN popup (on a win).
Stockfish opponents use the video's Stockfish fish (assets/modes/U_irVoLjtNI/stockfish.png) instead of avatars/stockfish.svg.
Portal squares (7csbf0L-uio) are flat colours sampled from the video frame (#f3861d / #2090f2), not images.

**Counts (honest, from the repo):**
- 62 / 64 mode files reference video art (png/jpg from sprites or frames) directly.
- 2 / 64 (KJYUsRlj_34, OcWzHqqeLNg) have no sprites in research/frames/sprites; they still show video art in play
  (the dice faces from the other Dice Chess videos via g1_dice.js). Their thumbnails are only a title card + generic die.
- 0 invented SVGs left in group-1 asset folders: 57 deleted this session (all SCP/creature/piece SVGs, portals, crosshair,
  grab hand, zap, clock, sword, offside flag, cracks, mask badge, secret-queen star, invented ladder/Angela avatars).
- Remaining non-video art: the app's shared placeholders `assets/avatars/bot.svg` / `you.svg` for opponents the videos
  never show with a usable portrait (online dice opponents, ladder bots Juan/Noel/Zara/Maria/Aziz in 9pHhqAbQS0s,
  Angela/"BOOM" in w15Ev7q2HmI) and the CSS pitch stripes behind the ucGhD2hC_6s board.
- Effects: overlays/badges now use video sprites (Anish grab, electrified king zap, SCP-035 mask badge, cracked/broken
  squares, clock-halving intro). Sounds are still the synthesised wavs from tools/g1_sounds.py (yt-dlp is blocked here,
  so no audio could be pulled from the videos) -> next AI: replace with audio from the videos if a downloader works.

## Open todo_pass2 (5 files)
9pHhqAbQS0s roster screen between games; IU9a1RB1KJw purple swap boxes (rule unclear); Re3c-3qomgQ chest lid animation;
Ugw05nktuDM aim line + slide animation; p49nLVPVmws big hundredths clock styling.

## QA (headless chromium, 390x800, /workspace/work/g1qa/qa.py: static asset-path check + open + 4 random moves)
- Batch 1 (16 modes) and the 8 changed dice/secret-queen modes: loaded, played, 0 console errors, 0 HTTP 404s, no overflow.
- Batches 2-4 were cut by the 120 s tool limit before reporting; see README/commit for the rerun result.
- Chromium needs LD_LIBRARY_PATH=/tmp/libs/root/usr/lib/aarch64-linux-gnu in this sandbox.

## Low confidence
IU9a1RB1KJw (swap rule not implemented), p49nLVPVmws (start time guessed), ucGhD2hC_6s (offside line), Ugw05nktuDM
(physics discretised). Martin portrait for all Martin modes is cropped from 9pHhqAbQS0s (same chess.com bot art).
