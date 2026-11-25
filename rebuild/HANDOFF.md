# Chess Master rebuild: handoff prompt for the next AI

Paste this to the next assistant along with access to this repo (branch `rebuild`).

---

You're continuing a rebuild of **Chess Master**, a fan remake of iwantcheckmate's YouTube chess-variant videos (559 modes). `main` holds the original single-file version (`index.html`). The `rebuild` branch holds work in progress.

## What the owner wants (all of it, finished, before reporting back)
1. Not one HTML file: a proper multi-file static app (GitHub Pages friendly, ideally works from file://).
2. Looks like chess.com: green/cream board, coordinates, player cards with avatar/name/rating, captured pieces, SAN move list, last-move and legal-move highlights, drag + click to move, selectable board themes and piece sets (standard pieces: open-licensed sets such as cburnett/merida).
3. Smooth, eased animation (~180-250ms ease-out), crossfades between screens, nothing abrupt or snappy; respect prefers-reduced-motion. Must not look "vibecoded"; the UI needs a real overhaul.
4. Every mode accurate to its video: rules, setup, board size/colors/look, custom pieces and their art, opponent name/rating/profile pic, mode card image, and VFX identical to the video (overlays, darkness, jumpscares, shakes, sounds, timing). Known badly wrong before: Backrooms Chess, both Gravity modes, most Horror modes, and many more.
5. Promotion: let the player choose the piece with a chess.com-style picker (Q/R/B/N), unless a mode's video says otherwise.
6. Keep the title "Chess Master" and the "iwantcheckmate fan remake" subtitle + footer credit.

## Sources
- Video list: `rebuild/videos.json` (id, title, category, date, views, duration).
- Transcripts: fetch per YouTube id (yt-dlp downloads are blocked by YouTube from cloud IPs; transcripts and thumbnails `https://i.ytimg.com/vi/<id>/maxresdefault.jpg` work; frames via a real browser).
- Official playable versions of ~30 modes on iwantcheckmate.com: see `rebuild/research/OFFICIAL_SITE.md`. Use them as ground truth (play hands-on), but don't copy their assets or code.

## Layout on `rebuild`
- `rebuild/PLAN.md` overall plan and phases.
- `rebuild/research/SPEC.md` the per-mode research JSON schema (rules, board, pieces, setup, opponent, events, visual_fx, vfx_timeline, current_impl_issues, confidence, evidence).
- `rebuild/research/batch1..5.json` the 559 videos split into 5 work batches; `rebuild/research/modes/<id>.json` finished research specs (count them to see progress; any id without a file still needs research); `progress_*.txt` logs.
- `rebuild/app/` the new multi-file app in progress; `ARCHITECTURE.md` there (if present) documents the mode spec -> hook API.

## Status at pause (2026-11-24 7:52 PM ET, usage limit)
- Research: 135 of 559 specs done in research/modes/. By batch: b1 (Horror, Powerups, Dice, Drawback, Variant Bots) 0/112 written as specs, though its agent was playing the official horror/powerup scenarios hands-on (notes in research/official/); b2 33/112, b3 44/112, b4 33/112, b5 25/111. Resume-safe: skip ids that already have a JSON.
- App: rebuild/app/ has the new multi-file structure (js/engine, js/game, js/ui, js/fx, js/bot, js/legacy port, data/, assets/ with open-licensed piece sets and board textures, tools/). Not finished: no ARCHITECTURE.md yet, data/modes/ empty, not yet tested end to end.
- Official site code was only studied for reference and is deliberately not committed.

## Next steps
1. Finish research for every id missing a `research/modes/<id>.json`.
2. Finish/verify the app architecture (engine supports non-8x8 boards, holes, custom/neutral pieces, per-mode themes and opponent profiles, timed/random events, gravity-style physics, data-driven VFX timeline + sound).
3. Implement all 559 modes from the specs, with original art for custom pieces/avatars/mode images.
4. Test in a headless browser (lobby, standard game, every mode loads, no console errors), then merge `rebuild` into `main`.

## Update 2026-11-24 8:10 PM ET (second Hark session)
- Added `rebuild/research/frames/`: frame-watched observations for 527/559 videos (visual_a..d.jsonl: board size/shape, sampled board_theme hex, piece_style, opponent UI, effects, mismatches), transcript rules for idx 0-164 (rules.jsonl), and ~680 reference sprites cropped from video frames (reference only; redraw original art, do not ship them).
- Missing specs were split into research/todo_1..5.json and assigned to 5 research agents writing research/modes/<id>.json (progress_r1..r5.txt, r1..r5_report.md when done). Any todo id without a modes JSON still needs research.
- An architect agent is finishing app/ (ARCHITECTURE.md, data/modes/<id>.js format, tools/spec2mode.mjs converter, chess.com-style UI, proof modes: Backrooms xp6Pr-rB4JA, standard, Atomic, Gravity, Horror SCP, Mini Chess 6x6 YjXV6gL8SsA, Cross Derby 7REcDCBnXZ8, headless tests at 360/390px).
- After that: implement every mode file from its spec in parallel batches, QA headless, merge rebuild into main.

## Status at pause 2026-11-24 8:22 PM ET (daily usage limit ~82%, agents stopped)
- Research: 452 of 559 specs in research/modes/. The 107 still missing are listed in research/todo_remaining.json. Use research/frames/*.jsonl first (frame observations), then transcripts.
- App: app/ARCHITECTURE.md exists (read it first: mode spec format). app/data/modes/ has 7 files: 7REcDCBnXZ8.js, JUlTxosCXuk.js, YjXV6gL8SsA.js, index.js, stockfish.js, wTudFnunSL0.js, xp6Pr-rB4JA.js. tools/test_browser.py is the headless test harness. The architect was mid-way: verify the proof modes (Backrooms, standard, Atomic, Gravity, Horror SCP, Mini Chess 6x6, Cross Derby) and the chess.com promotion picker (Q/R/B/N unless a mode says otherwise) actually work; it was stopped before reporting.
- Claude (owner's) may also push bug fixes here; each fix carries a comment. Keep them when merging; never force-push.
- Every commit: update the % progress section in README.md (PROGRESS markers); delete it when the rebuild is finished (owner request).
- Next: finish missing specs, finish/verify engine + UI, write tools/spec2mode.mjs, implement all modes, headless QA at 360/390px, merge rebuild into main.

## Research finished 2026-11-24 8:28 PM ET
- All 559 ids have research/modes/<id>.json. Specs written in the final pass have current_impl_issues marked "not checked (budget)".
- Low confidence (transcripts failed with 429/404; re-run analyze_video): vDzojyJO3sI, o8XcmMCIhIk, nWdjqATRp5k, 2er3r0JGeNg, IU9a1RB1KJw, Cv28-UoZseg, C9v7G3dJl7E, u0hl8g63mUg, djfYBXvvaYI, y5MBC8OCYlI, QrKIKcYN5m4, sO-lD2On610, lmmKhSrRn_c, B3wErwlKytA, JcpCAs1a2gc, gY9DNg9xDUM, piiE6JB8pWw, x-ISu_8MDvY; unconfirmed piece moves: mvPXhAMcT7I, GawuFHUIj6o, R8gZYKtr-C4.
- Backrooms (xp6Pr-rB4JA): build from frames (huge open yellow board), not the rules.jsonl maze description.
- Next: engine/UI verification, spec2mode converter, implement all modes, QA, merge.

## Update 2026-11-24 8:55 PM ET (third Hark session)
- Verified engine (tools/perft.js all PASS) and UI (tools/test_browser.py: all proof modes load + play, 0 console errors).
- tools/spec2mode.mjs not written; agents author mode files directly from specs instead.
- Implementation split: research/impl_1..6.json (1 Horror/Powerups/Dice, 2 Drawback/Variant Bots, 3 Challenges & Odds, 4 Other + Variants A, 5 Variants B, 6 Variants C). Shared hook libs are js/modes/gN_*.js. Agents never commit generated data/*.js; regenerate with node tools/build-data.mjs. Reports land in research/impl_N_report.md.

## Update 2026-11-24 9:24 PM ET (fourth Hark session): TWO-PASS PLAN (owner approved)
To speed things up, mode implementation is now two passes:
- **Pass 1 (now):** every remaining mode gets a working `app/data/modes/<id>.js` with correct rules, setup, board size/shape/colours, opponent name/rating, and win conditions. Reuse existing piece sets, generic avatars and shared gN_* hook libs. Skip custom piece art, custom avatars and heavy VFX/sound for now, but add `todo_pass2: [...]` in each mode file (e.g. "custom piece art: dragon", "jumpscare VFX at move 10") so pass 2 knows what is missing.
- **Pass 2 (after all 559 load and play):** grep `todo_pass2` and add the custom art, avatars, mode images, VFX timeline and sounds per spec.
- Six agents (impl-1..6) are running pass 1 on research/impl_1..6.json. If they stopped (usage limit), resume: any id in impl_N.json without a data/modes/<id>.js still needs pass 1.
- Owner instruction: once EVERYTHING in these notes is done (both passes, headless QA of every mode, 0 console errors), merge `rebuild` into `main` and delete the README PROGRESS section.

## Update 2026-11-24 9:35 PM ET (fifth Hark session)
- Six agents (impl-1..6) restarted on research/impl_1..6.json: finish pass 1 for missing ids, then pass 2 for their group, headless QA. Each writes status to research/impl_N_report.md; resume from those if stopped.
- Commit small batches; on near usage limit, commit + push and update notes (impl_N_report.md, this file) for the next AI.
- Owner instruction, AFTER everything is complete and `rebuild` is merged into `main`, in this order:
  1. Final bug scan (every mode, headless, 0 console errors).
  2. Art polish pass.
  3. Gameplay polish pass.
  4. One more final bug scan.


## Update 2026-11-24 10:13 PM ET: ART DIRECTION (owner)
All mode art must be copied directly from the videos. Ship the sprites in rebuild/research/frames/sprites/ as-is; recreate exactly from frames where none exist; replace original/invented art already made. This overrides every earlier "original art only" / "reference only" note.
