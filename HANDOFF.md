# HANDOFF: notes for the next AI working on Chess Master

Last updated: 2026-11-25, 11:30 PM ET. Read this first, then `STATUS.md`, `CONTRIBUTING.md`, `LICENSES.md`.

## What this is
Chess Master is a static web game that recreates the chess modes from iwantcheckmate.com and the YouTube videos (about 300 mode entries, `data/modes/<youtubeId>.js`, indexed in `data/modes/index.js`).
- Repo: `csardas223/ChessMaster` (public). Live site: https://csardas223.github.io/ChessMaster/ (GitHub Pages from `main`).
- Mirror: https://chessmaster-game.github.io/ (repo `chessmaster-game/chessmaster-game.github.io`). It's a scheduled workflow that pulls main. **Its cron stopped firing at 9:10 PM on 2026-11-25.** Run "Run workflow" manually in the mirror repo's Actions tab to refresh it. The org's OAuth policy blocks token push/dispatch (403).
- Vercel deployment is disconnected and stale. Ignore it.
- The user plays on a Samsung Galaxy Z Flip6 (Android Chrome). Test at 390x844 touch.

## Rules for working in the repo
- Commit identity: `git -c user.name=csardas223 -c user.email=232940379+csardas223@users.noreply.github.com`.
- `git pull --no-rebase`. Never force-push. Several agents may push at once. Use a fresh clone per job.
- Checks before pushing: `npm test`, `npm run lint` (0 errors), `npm run sweep`, `node qa/validate-modes.mjs` (known pre-existing error: `hZf3G9Pr1UU` missing staunton3d assets), `python3 tools/qa_ui.py`, `python3 tools/qa_motion.py`.
- Assets must be original, CC0, or have their licence recorded in `LICENSES.md`.

## What the user wants (standing preferences)
- **Faithful to iwantcheckmate.com.** Every mode on the site must exist here. Rules and ability effects should match the site and videos.
- **Pieces slide, never teleport** (board motion engine: `board.motion`, `board.quietNext`, `board.settle`). Reduced-motion stays instant.
- **Ability effects are one-shot pulses**, not permanent danger rings (`js/fx/ability-fx.js`, layer `#board-abl`).
- **Default piece set: Staunty** (lichess, CC BY-NC-SA 4.0, non-commercial). Other sets stay selectable.
- **Zoom:** limited-view modes (Backrooms, Petrified Pawns, SCP Containment Breach) have no zoom. Big maps get phone zoom. 8x8 modes unchanged.
- **Sound:** modern, cinematic, premium game-UI sound with trailer weight. Each event gets its own sound design. **Never clone the user's reference clip** (`intro_sfx_v3`); use it for genre only, never as a source or template (envelope corr < 0.6). No bells, chimes, dings, glass pings, synth leads, chiptune, cartoon brass. CC0 sources only. Regenerate with `python3 tools/sfx/make_sfx.py`. Agents can't listen, so say that when reporting sound work. Open question: the peak target (an older rule said peaks at or below -6 dBFS; the v4/v5 builds use true peak at or below -1.2 dBTP). Confirm with the user.
- **3D modes:** the user says Battle Chess and FPS Chess felt rushed.
  - Battle Chess pieces should look like the original game. Use original or CC0 low-poly animated characters in that style, since Interplay's art is copyrighted: armored spearmen pawns, stone-golem rooks, sword knights, robed bishops with staffs, a sorceress queen, a crowned king with a sword. Idle, walk and attack animations, and a capture fight.
  - FPS Chess must be a real 3D first-person shooter (three.js, WASD and mouse on desktop; joystick, look-drag and fire buttons on phone).
- **Infinite Pawns modes** (`D8rD3rTwgjc`, `iAwhIiexojg`): the player may place a pawn on any empty square.
- **Catapult** (`Ugw05nktuDM`): slingshot physics like the original, not an arc.

## Work in flight at handoff (2026-11-25, 11:30 PM ET)
Merged to main:
- `10391ba` rule fixes to match iwantcheckmate.com: Void/Darkness picks a random square, Locust, SCP-966 orthogonal moves, ClockFish resets each turn, MirrorFish cap, ZebraFish, SimpFish hunts the queen. Coverage table in STATUS.md. Only tests and sweep were run, with no browser play, so smoke-test these modes.
- `25f6ee7` (merge `fb4a59d`) Infinite Pawns: place on any empty square; rank 8 promotes. `js/bot/bot.js` skips Stockfish (uses the built-in search bot) while a pawn sits on rank 1 or 8. TODO: a fade-in for placed pawns; the "or" level is not fully tested.

Unfinished, on branches (none merged):
- **`wip/sfx-v5` (`b7e5caf`)**: per-event sound redesign in `tools/sfx/events.py`, `similarity.py`, 44 new CC0 clips. Main still plays v4. 10/20 events still score too close to the reference (Pearson envelope corr > 0.6), plus 5 near-duplicate pairs. The Pearson metric scores any hit-and-decay sound high; a concordance-correlation gate (`/workspace/work/sfx5/ccc.py`) separates better. **Ask the user before changing the test.** Next: rework failing sounds, ring_check, update sources.md, LICENSES.md, preview.py, then merge.
- **`wip/fps-3d` (`7c3556e`)**: `js/modes/fps3d/models.js` (code-built pieces and weapons) and the plan in `docs/fps3d-wip.md`. The game loop `duel.js`, controls, HUD and AI are NOT written. Gun sounds live in `assets/modes/AWFB4EzGtDc/`. The FPS research files are on the `rebuild` branch (`research/modes/PszkLYudcws.json`, `Nz2A-g73_iM.json`).
- **`wip/3d-polish` (`6567c48`)**: optional `scene3d.js` features (orbit, tone mapping, reflections, tap hook, camera shake/tweens). It also lowers the phone pixel ratio to 1.5 for all 3D modes. Untested in a browser. Plan in `docs/3D_POLISH_HANDOFF.md`. **Battle Chess characters (`IbRrzKtieqs`) are not started**: build `js/fx/battle3d.js` per that doc.
- **`wip/icm-coverage` (`21c758d`)**: two app-only modes missing from our site, SCP-4975 Crack (`icm-scp4975`) and ScaredFish (`icm-scaredfish`), plus lobby rows for no-video modes. Needs a browser test (the game object is `CM.app.current`), then merge. Still different from the site: Containment Breach SCP rules (port from the crawled `engine.js`) and single-use Portals (`7csbf0L-uio`).

Suggested order: merge icm-coverage after a test, then Battle Chess, FPS 3D, SFX v5.

## Known issues and caveats
- Boiled One (`xvibqyL-CqQ`) freeze reported by the user was not reproduced on main. `spec-game.js` now guards `afterMove` hooks, but the root cause is unconfirmed.
- SCP-409 solo: undo can desync the aura. Gabriel's glitch can briefly draw the pulse above pieces. Badges don't slide with pieces.
- `assets/sounds/lichess/` (AGPLv3) is in the repo but unused.
- Branch `rebuild` holds about 228 reworked modes, not merged. Ask the user before merging.
- Fairy-Stockfish is a custom single-thread WASM build (no SharedArrayBuffer on Pages).

## Questions still open with the user
- Staunty is non-commercial: switch to a free-licence default?
- Make the mirror update on every push (blocked by org OAuth policy)?
- Merge `rebuild` into `main`?
- Speedrunner vs 3 Hunters (`UZ79sKLa6z4`): lock zoom too?
- Add the flat Minecraft and Roblox Survive modes to the 3D tab?
- Sound peak standard (see above).
