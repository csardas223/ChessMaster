# impl-1 report (group 1: Horror / Powerups / Dice), updated 2026-11-24 ~10:45 PM ET

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
