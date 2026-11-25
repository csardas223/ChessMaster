# Start here (for the next AI picking up the rebuild)

Branch: `rebuild` only. Never touch `main` until merge. Always `git fetch` + `git rebase origin/rebuild` before pushing; never force-push. Another AI (Claude) also pushes commented bug fixes here: keep them.

## Read in this order
1. `README.md` PROGRESS section: overall status. **Refresh it on every commit; delete it when the rebuild is finished.**
2. `rebuild/HANDOFF.md`: full history, decisions, low-confidence list.
3. `rebuild/ARCHITECTURE.md`: app structure (multi-file under `rebuild/app/`).
4. `rebuild/research/INDEX.md`: one row per mode (559) with kind / playable / confidence.
5. `rebuild/research/modes/<id>.json`: the spec for each video. `rebuild/research/frames/` holds frame notes (visual_a..d.jsonl) and rules.jsonl; reference sprites are MEANT TO BE SHIPPED (see Art direction below).

## Art direction (OWNER, 2026-11-24 10:13 PM ET; overrides every earlier "original art only" note)
- All mode art is copied directly from the videos: use `rebuild/research/frames/sprites/<videoId>_<thing>.png` as-is (crop / transparent background into `app/assets/modes/<id>/`) for custom pieces, opponents/avatars, overlays, boards, VFX and mode card images.
- Where no sprite exists, capture or recreate it to match the video exactly (frames via a real browser, thumbnails `i.ytimg.com/vi/<id>/maxresdefault.jpg`).
- Replace any original/invented art already in the repo with the video's art. Keep the iwantcheckmate credit.

- Effects (VFX, animations, sounds, overlays) must also match the video exactly, copied from the frames.

## Sounds (OWNER, 2026-11-24 11:41 PM ET)
- Core board sounds = chess.com's default set (app/assets/sounds/*.mp3, js/core/sound.js), incl. premove + tenseconds. Mode effect sounds =
  our own synthesised WAVs. Never extract audio from the videos. loader.to is BANNED (scam; also no cobalt/y2mate); cnvmp3.com is the only
  converter allowed if audio is ever needed again.

## Rules of thumb
- Frames beat rules.jsonl when they disagree (e.g. Backrooms = huge open yellow board, not a maze).
- `playable: false` specs (normal chess, quizzes, intros) get no mode; `kind: video_game` specs need a standalone mini-game or are skipped.
- Promotion: chess.com-style Q/R/B/N picker unless a spec says otherwise.
- UI: chess.com Android look, calm motion (piece slide ~200ms ease-out, no bounce/pop/shake, honour prefers-reduced-motion).
- Final-pass specs have `current_impl_issues` = "not checked"; diff against the old `index.html` on main when implementing.

## Two-pass plan (2026-11-24 9:24 PM ET)
Pass 1: rules/setup/board for every mode with `todo_pass2` notes; pass 2: custom art/VFX/sounds. Details in HANDOFF.md (fourth Hark session).

## Post-merge (owner): bug scan -> art polish -> gameplay polish -> bug scan. See HANDOFF.md fifth session.

## What's left (2026-11-24 midnight ET)
- Remaining generic avatar: assets/avatars/bot.svg (only where the video shows none). 2026-11-25 10:45 ET art-g4: tfPyy36nwc4 Wendy/Miguel/Li now video portraits; AaHmMC3HA0E + D8olpXjblQ0 done earlier (3d9e932); 9pHhqAbQS0s: video never shows a bot after Azeez (checked to the end), so the inferred ladder continues with chess.com's Advanced bots Wendy..Manuel using their video-cut portraits. No mode uses bot.svg now (only code fallbacks in g6_ladder.js / legacy glue). Avatars: DONE. Low-confidence spec re-checks (HANDOFF list).
- Group todo_pass2 items and no-sprite frame crops (see each research/impl_N_report.md), full QA sweep, merge to main, delete README
  PROGRESS, then the post-merge order.

- Group 5 art/visual items (Pawnbarian Blightvessel/sacks/promotion splash, Wizard iso + tiles, Passant Unstable + arrow trail):
  DONE and verified 2026-11-25 10:45 AM ET (art-g5); g5 has 0 todo_pass2. Who Takes the Crown x2 + Beyond the Board 3D looks belong to art-3d.
- art-g4b (2026-11-25 ET): Seirawan Elephant (done earlier) + Chess Arena pieces/end stats DONE; Gun King biomes/summary and 5D board-spawn animation IN PROGRESS (research/impl_4_report.md 'art-g4b' has frames and the plan).
- art-g6c (2026-11-25 ET): Ouroboros Fool + Anarchy knook/anti-queen DONE from YouTube frames; Shotgun King white army/muzzle flash and Knightmare knight/rock IN PROGRESS (see research/impl_6_report.md 'art-g6c' for frame times and what to do).

## Next steps
1. Verify the engine + UI in `rebuild/app/` (run `rebuild/tools/test_browser.py`); fix the proof modes (standard, Mini Chess 6x6 no queen, Cross Derby, Backrooms).
2. Write/confirm `rebuild/tools/spec2mode.mjs` to turn specs into `app/data/modes/<id>` files.
3. Implement modes in batches, highest-confidence first; re-run transcripts for ids in `rebuild/research/recheck_low_confidence.json`.
4. Headless QA every mode, then merge to `main` and remove the README PROGRESS section.
