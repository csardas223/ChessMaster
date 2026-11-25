# Chess Master rebuild: handoff prompt for the next AI

Paste this to the next assistant along with access to this repo (branch `rebuild`).

---

You're continuing a rebuild of **Chess Master**, a fan remake of iwantcheckmate's YouTube chess-variant videos (559 modes). `main` holds the original single-file version (`index.html`). The `rebuild` branch holds work in progress.

## What the owner wants (all of it, finished, before reporting back)
1. Not one HTML file: a proper multi-file static app (GitHub Pages friendly, ideally works from file://).
2. Looks like chess.com: green/cream board, coordinates, player cards with avatar/name/rating, captured pieces, SAN move list, last-move and legal-move highlights, drag + click to move, selectable board themes and piece sets (use open-licensed piece sets such as lichess cburnett/merida; do not copy chess.com art).
3. Smooth, eased animation (~180-250ms ease-out), crossfades between screens, nothing abrupt or snappy; respect prefers-reduced-motion. Must not look "vibecoded"; the UI needs a real overhaul.
4. Every mode accurate to its video: rules, setup, board size/colors/look, custom pieces and their art, opponent name/rating/profile pic, mode card image, and VFX identical to the video (overlays, darkness, jumpscares, shakes, sounds, timing). Known badly wrong before: Backrooms Chess, both Gravity modes, most Horror modes, and many more.
5. Keep the title "Chess Master" and the "iwantcheckmate fan remake" subtitle + footer credit.

## Sources
- Video list: `rebuild/videos.json` (id, title, category, date, views, duration).
- Transcripts: fetch per YouTube id (yt-dlp downloads are blocked by YouTube from cloud IPs; transcripts and thumbnails `https://i.ytimg.com/vi/<id>/maxresdefault.jpg` work; frames via a real browser).
- Official playable versions of ~30 modes on iwantcheckmate.com: see `rebuild/research/OFFICIAL_SITE.md`. Use them as ground truth (play hands-on), but don't copy their assets or code.

## Layout on `rebuild`
- `rebuild/PLAN.md` overall plan and phases.
- `rebuild/research/SPEC.md` the per-mode research JSON schema (rules, board, pieces, setup, opponent, events, visual_fx, vfx_timeline, current_impl_issues, confidence, evidence).
- `rebuild/research/batch1..5.json` the 559 videos split into 5 work batches; `rebuild/research/modes/<id>.json` finished research specs (count them to see progress; any id without a file still needs research); `progress_*.txt` logs.
- `rebuild/app/` the new multi-file app in progress; `ARCHITECTURE.md` there (if present) documents the mode spec -> hook API.

## Next steps
1. Finish research for every id missing a `research/modes/<id>.json`.
2. Finish/verify the app architecture (engine supports non-8x8 boards, holes, custom/neutral pieces, per-mode themes and opponent profiles, timed/random events, gravity-style physics, data-driven VFX timeline + sound).
3. Implement all 559 modes from the specs, with original art for custom pieces/avatars/mode images.
4. Test in a headless browser (lobby, standard game, every mode loads, no console errors), then merge `rebuild` into `main`.
