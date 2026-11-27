# Maintainer guide

Chess Master has a daily maintainer (Hark, since 2026-11-26). The owner checks in now and then; the binding owner rules
are in HANDOFF.md ("Owner's standing rules") and CONTRIBUTING.md. This file is the routine and the tools for it.

## Daily routine, in priority order

1. **New videos first.** Read the channel feed
   (`https://www.youtube.com/feeds/videos.xml?channel_id=UCLcvOp09qfzMdm4zl9z5Hhg`) and compare its ids with
   `data/videos.json`. For each new upload:
   - Normal-chess or quiz video: add a data entry only (views from the video page).
   - Variant video: add it as coming soon with the **under construction template** (`templates/under-construction/`),
     which puts it in the lobby's hero slot by itself. Research it from the video (transcript, thumbnail, frames) into
     `research/modes/<id>.json` from `templates/new-mode/research.json`, build `data/modes/<id>.js` from
     `templates/new-mode/mode.js`, art through `templates/new-mode/ART_CHECKLIST.md`, phone QA from
     `templates/new-mode/qa_mode.py`. Flip each `build` part to true as it lands. When it is fully playable, point
     `FEATURED` (js/lobby/hype.js) at it and drop `coming_soon`.
2. **Video accuracy.** Pick a few rows from `research/accuracy_ledger.md`, oldest-checked first (never-checked rows are
   ordered by views). Compare rules, board, art, characters and pacing with the video; fix what differs; set the date
   and a short result on the row.
3. **QA.** Every day: `npm test`, `npm run lint` (0 errors), `npm run sweep`, `node qa/validate-modes.mjs`,
   `python3 tools/qa_ui.py`, `python3 tools/qa_motion.py`. Rotate one heavy suite per day:
   `tools/qa_all.py --widths 390,360 --par 1` (about an hour), `tools/qa_battle3d.py --slow`, `tools/qa_fps3d.py`,
   `tools/qa_cine/cine.py <ids>`. Phone size is 390x844 touch (owner's Galaxy Z Flip6; cover screen 360x374).
4. **Art.** Screenshot what changed and look at every shot at full size and at phone size
   (`templates/new-mode/ART_CHECKLIST.md`).
5. **HANDOFF.md.** Finish its open items; when none are left, move lasting facts into STATUS.md or docs/ and delete it.
6. **Large updates** in multi-day steps; a UI pass on lobby, menus, HUD and transitions every week or two, with
   before/after screenshots.

## Rotation log

| date | heavy suite | result |
|---|---|---|
| 2026-11-26 | qa_all 390+360 (earlier session) | 510/510 |
| 2026-11-26 | qa_battle3d --slow (desktop + phone) | PASS, 61 ok (taps on the 3D board fall back to tryMove in headless; fps is software GL, not a phone number) |

Next in rotation: qa_fps3d, then qa_cine/cine.py on the horror ids, then qa_all.

## Templates

See `templates/README.md`. The under-construction UI is the lobby's coming-soon banner + screen (js/lobby/hype.js,
css/hype.css): video-themed by its own thumbnail and an optional `accent`, with a six-part `build` list
(rules, board, art, characters, sound, phone QA) so an unfinished mode never looks finished.
Check it with `python3 tools/qa_under_construction.py --out /tmp/qa_uc`.

## Environment notes (sandbox)

- Headless Chromium: `LD_LIBRARY_PATH=/tmp/libs/root/usr/lib/aarch64-linux-gnu:/tmp/libs/root/lib/aarch64-linux-gnu`
  (unpack libatk1.0-0t64, libxcomposite1, libxdamage1, libatspi2.0-0t64, libxres1 there if missing; see HANDOFF.md).
- CDN engines (Stockfish/Maia on unpkg/jsDelivr) fail from the sandbox with 407 / ERR_TUNNEL: environment, not an app error.
- Fresh clone per day; small commits; `git pull --no-rebase` before every push; never force-push; main only.

## Creators

Data and UI should stay creator-agnostic: new entries carry `creator` (`iwantcheckmate` today). Other creators' videos
are added only after the owner approves the creator list.

## Owner questions

Ask at most one short question per daily report, only for decisions that are the owner's (taste, scope, new creators,
anything destructive). Open ones are listed in HANDOFF.md "Questions still open with the owner".
