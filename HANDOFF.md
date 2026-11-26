# HANDOFF: notes for the next AI working on Chess Master

Last updated: 2026-11-26, 11:55 AM ET. Read this first, then `STATUS.md`, `CONTRIBUTING.md`, `LICENSES.md`,
`docs/ARCHITECTURE.md`. This file replaces the old main HANDOFF and the rebuild notes (`rebuild/NEXT_AI.md`,
`rebuild/HANDOFF.md`, `rebuild/RESUME_NOTE.md`, kept as history in `research/history/REBUILD_*.md`).

## OWNER REQUESTS 2026-11-26 1:00-1:35 PM ET (Hark session 2; binding, check each is done)
- REPO ROOT CLEANUP (owner 1:52 PM ET, DONE): the ~500 per-mode share-page folders no longer sit at the repo root. tools/build-share.mjs now writes them to play/<slug>/index.html (SHARE_DIR) and deletes any old root-level share folder; share links are <site>/play/<slug>/. Never write generated folders to the repo root again.
- m2_fps (FPS Chess + Jupiter, stopped 1:40 PM): FPS duel rewritten to the video (musket/bow/long musket/sniper/minigun/sword, board-on-table room, tiles + cracked-glass HUD, LShift/E, climb, KILL CAM); Jupiter on the traced 45x23 Skeld + video start + video sprites (board limit now 64). NEXT: rerun tools/qa_fps3d.py phone/desk1/desk2 to green, update docs/fps3d-wip.md + FPS mode texts; Chessformer p6W3yDU-v88 final levels not started (m-fps / m-levels RESUME in research/polish_report.md).
Agents this session (RESUME lines in research/polish_report.md): m-qa, m-art, m-accuracy, m-3d, m-fps / m-levels, m-sfx / m-og (+ README), m-ui, m-themes.
- MAIN ONLY: work only on `main`. No side branches at all (local or remote). Commit + push often; when usage runs out, commit what you have and leave clear next steps here.
- LICENCE (DONE 550c1bd): the project's own code is Apache-2.0 (LICENSE, NOTICE, package.json). Third-party assets and iwantcheckmate's material keep their own terms (LICENSES.md). Never write MIT again.
- MIDAS TOUCH (m-art, DONE b26a0d5): gilded piece = the active set's own sprite (same box/silhouette), one #cm-gold SVG filter + glow for every type; QA tools/qa_midas.py. Also m-art: WLmt62Ll9Hs/vHVSgesfZ0o bots = Azeez/Emir/Vinh/Laura chess.com originals; built-in fairy pieces A C M F W G L I = chess.com art (assets/img/fairy, 2a8ac320). PIECE-ART SWEEP done (tools/art_sweep.py, all 503 at 390x844): fix list = end of research/BLURRY_SPRITES.md; next = staunton3d re-render SPAN=1.42 CY=0.41, clipped HtNZ9DTxHUs dragons / 3Sr5lJbHKKU checker / 4XV3SBMQgXE mask / Kzt9ItpGtYg hero / WXcmWG7Eczs Q+Iq, then 160 px chess.com custom pieces (cR6r8NZz-CA dragon x13 modes, nuke_w x8).
- README (m-og agent): must read like a Steam store page and work as ADVERTISING: hero key-art banner, pitch, animated clips of standout modes (not just static screenshots), feature tiles, mode showcase grid, tag chips, play-now button, requirements box; dev/credits/licence compact at the bottom.
- UI (m-ui): make the lobby + game chrome more interesting (premium game-hub feel within the chess.com Android look, no vibecoded styling). FIRST: the lobby had two separate sorting tab bars; merge into ONE.
  - m-ui status 1:45 PM: ONE TAB BAR DONE (f613cdb1, merged b18d8bff): #tabs = All + categories (+3D tag) | divider | every video type (global counts, most common first); old #kinds chip row removed; one option active at a time (type tab id `k:<type>` sets CM.lobby.kind, searches whole library); sort dropdown unchanged. Shots research/ref/m-ui/tabs_{before,after,after_type}_0.png + tabs_after_divider.png. "More interesting" UI NOT STARTED: next = (1) continue-playing row (localStorage, recent modes) on the home tab, (2) mode intro card before a game (title, opponent avatar+rating, rules summary from the spec), (3) css/game.css gamebar/pbar/status/side-panel polish + game-over modal with result art, (4) card press/lift states (~200 ms ease-out, reduced motion = none); judge each with 390x844 touch shots and tools/qa_scroll_jank.py at 4x.
- LOBBY SPLIT (owner 1:49 PM ET, top priority; m3-ui, DONE): "Recommended for you" and the randomizer were combined (shuffle button inside the recommended card + a "Random mode" quick row). Now two separate sections on Home: #hero = "Recommended for you / today's pick" (one panel card, thumbnail + name + Play, no shuffle) and #randomizer = "Random mode / any of the N" (shows the rolled mode's thumbnail, type and name, Roll + Play; never the same roll twice in a row). The Random quick row is gone (Play Stockfish stays). Also new: "Continue playing" shelf (localStorage cm.recent, last 10 opened, shown from 2 entries, Clear). Shots research/ref/m3-ui/before_home*.png vs after_home*.png (390x844 touch).
- FAMILY CHROME (owner 2:05 PM ET "Don't just do good vfx and UI for the horror, do it for the others"; m3-ui, DONE chrome side): js/ui/family.js gives every non-horror family a title strip on open, family icon + accent in the HUD, themed intro card and result screen (win art = family icon). In-board VFX = cm2-art. Shots research/ref/m3-ui/family/. Mode intro card (once per mode) + game-over result art + README store page also done (m3-ui RESUME in research/polish_report.md).
- SKINS (m-themes): more piece SKINS (visual sets only; NO new piece types, NO bot changes) and board skins, with a preview picker in settings. Open-licensed sets with licence rows; ALSO chess.com piece sets/boards the videos show (Neo etc.), listed in LICENSES.md as (c) Chess.com, not covered by Apache. Modes with their own video pieces/boards keep them.
  - m3-themes status 2:05 PM (DONE, ae54e4db + be1ad11d + this commit): 23 more lichess sets in assets/pieces/<set>/ (each with LICENSE.txt; LICENSES.md rows; licences read from lila COPYING.md free table at 917efac): maestro fresca cardinal icpieces gioco tatiana dubrovny california caliente anarcandy cooke monarchy(webp; PIECES[k].ext) minimal-warmth chessboart horsey xkcd (CC BY-NC-SA) / firi kiwen-suwi (CC BY) / shapes (CC BY-SA) / rhosgfx (CC0) / letter pirouetti pixel (AGPLv3+). Skipped: lila non-free table, governor + kosal (not in COPYING.md), mono + disguised (both colours identical). Boards: + marble, night, contrast (High contrast), sand, teal, rose; per-board hl (last-move/selected tint) + dot (legal dot/capture ring) as CSS vars --hl-last/--dot (css/board.css), mode boards keep defaults. Options sheet: live Preview strip (board + set + last-move/selection/dots/capture ring/check, own CSS vars), piece swatches drawn on the chosen board colours. Check: tools/m3_themes_shots.py (readability >= thresholds on all 16 boards + every set drawn; shots research/ref/m3-themes/ at 390x844); qa_ui 43/43. OPEN QUESTION (owner): Chess.com Neo pieces / board art NOT copied (proprietary Chess.com art; redistribution needs Chess.com's permission, a LICENSES.md note does not cover it). The Green board uses colour values only. Possible next: 'Show all sets' collapse if the 31-set grid feels long; per-set preview of all 12 pieces.
- 3D (m-3d, DONE 1:45 PM): Battle Chess look pass 2; Chess Arena CONozr99agQ + Table Tactics xvlHij1tgk8 now real three.js 3D (js/games/lift3d.js under the canvas game; tools/m3d_canvas3d_qa.py PASS). Next: real-phone fps/tap check of both, qa_battle3d desktop + full phone --slow rerun, Battle Chess bishop/king/pawn polish (m-3d RESUME).

## SESSION 2026-11-26 12:20 PM-1:00 PM ET (Hark, 8 agents; stopped at usage limit) - READ FIRST
Each agent's exact next steps are its RESUME line in research/polish_report.md (sections m-qa, m-3d, m-art, m-art2, m-levels, m-ui, m-fps, m-sfx, m-og, all 2026-11-26).
Owner requests from this session (binding, check each is done):
- LOADING SCREEN (DONE ca2c8c2, 69b7c0b): loader = lobby thumbnail placeholder tile with a flat 2D pawn spinning on Y; >=1.3 s, waits for art/sounds/pieces/engine warm-up, 7 s cap; tools/qa_loader.py.
- START SOUNDS (m-sfx, check its commits/RESUME): match-start sound gets 3-4 subtle variants (no immediate repeat), a different cinematic/gamey start per mode family + standout modes, and extra mode sounds where the defaults feel off. Sound rules in this file still apply.
- LINK PREVIEWS + SHORT LINKS (m-og, check its commits/RESUME): og/twitter tags + 1200x630 image on index.html; every mode gets a readable slug (e.g. /ChessMaster/scp-4975/) with a static share page carrying that mode's title, description and image, redirecting into the app; old #/play/<id> links keep working; share buttons hand out the slug link. Generated from tools/build-data.mjs.
- VIDEO ACCURACY (NOT STARTED): some modes are not video-accurate. Example: C9v7G3dJl7E "Once a Pawn a King" (Steam roguelike Once Upon a King) has NO mode (spec says playable:false). Build it from research/modes/C9v7G3dJl7E.json + frames (dungeon rooms, Pongement, white patrols that move first with order numbers, End Turn, Pull/Hop blessings with mana 50/room +10/kill, butcher army cap 2, keys/chests, tutorial + first rooms). Then audit every playable:false / video_game / low-confidence spec into research/accuracy_audit.md and fix by priority.
- PIECE ART STILL BAD (owner 12:58 PM): there are still pieces that are clipped, blurry, or not fully visible on the board. Run a full sweep: render every mode at 390x844, crop each piece square, flag clipped edges (alpha touching the PNG border), low-res sources (<256 px or upscaled), and pieces drawn outside or cut by their square; fix with clean >=512 px transparent PNGs centred at ~90% (owner art rules above). Record the list in research/BLURRY_SPRITES.md.
Done this session: m-art (f091a58, c46de40, 96561f3, e51eec9, c822dfa) ~40 bot avatars + Chaturanga/Amazon/Hawk/Grasshopper/XXL/Gothic/Seirawan fairy pieces at 512 px; Shotgun King wiki set verified exact. m-levels: Chessformer 28 levels proven solvable (433412b, tools/cf_bfs_verify.mjs); todo_pass2 is now EMPTY. m-3d: Chess Ultimate cutouts kept/fixed (9700e7e), staunton3d 512 px (7cedbb7, validate 0 errors), 3D audit batch 2 (Roblox table/sky, luxury, fly, abyss, dungeon), Battle Chess hall started. m-ui: loader, badges slide with pieces, SCP-4975 verified, scroll jank tool.
Open bugs/next: Abyss SMOXF1bSsDk tap selects but won't move (check on e6f63e0 first); Gabriel glitch above pieces; SCP-409 undo aura desync; Boiled One freeze; Jupiter Mg2Upjjo2yg map/sprites (steps in m-levels RESUME); Chess Arena + Table Tactics still 2D (videos are 3D); Battle Chess characters; FPS Chess (m-fps RESUME); 3 photo avatars unsourceable; WLmt62Ll9Hs/laura.png likely wrong; art passes art1/art2/art3 (m-art2 RESUME); full qa_all + desktop FPS/battle3d (m-qa RESUME).

## What this is
Chess Master is a static web game that recreates the chess modes from the iwantcheckmate YouTube videos and
iwantcheckmate.com (503 mode files, `data/modes/<youtubeId>.js`, index generated into `data/modes/index.js`).
- Repo: `csardas223/ChessMaster` (public). Live site: https://csardas223.github.io/ChessMaster/ (GitHub Pages from `main`, root).
- Mirror: https://chessmaster-game.github.io/ (repo `chessmaster-game/chessmaster-game.github.io`), a scheduled workflow
  that pulls main. Its cron stopped firing at 9:10 PM ET on 2026-11-25: press "Run workflow" in the mirror repo's Actions
  tab to refresh it. The org's OAuth policy blocks token push/dispatch (403). Vercel is disconnected and stale: ignore it.
- The owner plays on a Samsung Galaxy Z Flip6 (Android Chrome). Test at 390x844 touch.

## Workflow: main only (since 2026-11-26 11:45 AM ET)
- **`main` is the only branch.** On 2026-11-26 every other branch (rebuild, qa/playtest-fixes, wip/3d-polish, wip/fps-3d,
  wip/game-fx, wip/horror-cine, wip/icm-coverage, wip/jupiter, wip/lobby, wip/sfx-guns, wip/sfx-v5) was merged into main
  and deleted. Their history is all in main. There is no rebuild branch any more, no `rebuild/app`, no patch syncing,
  and no `merge_to_main.sh` (deleted: it wiped main-only commits).
- The app lives at the repo root. Research lives in `research/` (was `rebuild/research/`): per-mode specs
  `research/modes/<id>.json`, frame notes `research/frames/*.jsonl`, the **681 reference sprites cut from the videos in
  `research/frames/sprites/`**, video stills `research/frames/video_thumbs/`, reports (`impl_1..6_report.md`,
  `polish_report.md`, `BLURRY_SPRITES.md`, `qa_full_report.md`), evidence `research/ref/<section>/`. Old one-off rebuild
  scripts: `research/rebuild_tools/`. App-side art/QA scripts: `tools/`. Old notes that say `rebuild/research/X` mean
  `research/X`; `rebuild/app/X` means `X` at the repo root.
- Work in a fresh clone, small commits straight to main (or a short-lived branch merged the same session and deleted).
  Commit identity: `git -c user.name=csardas223 -c user.email=232940379+csardas223@users.noreply.github.com`.
  `git fetch` + `git pull --no-rebase` before every push. Never force-push. Several agents push at once.
- **Commit and push often** (at least every ~15 min of work), with a RESUME line in `research/polish_report.md` under
  your section, so nothing lives only in a sandbox. When usage runs low: commit, push, and update this file.

### Checks before pushing (baseline on main acc3b76+, 2026-11-26)
| check | expected |
|---|---|
| `npm test` | 13 pass |
| `npm run lint` | 0 errors (~90 warnings tolerated) |
| `npm run sweep` | 503 ok, 0 failed (2 expected 1-legal-move warnings: Kzt9ItpGtYg, sO-lD2On610) |
| `node qa/validate-modes.mjs` | 1 known error: `hZf3G9Pr1UU` missing `assets/pieces/staunton3d/*.png` |
| `python3 tools/qa_ui.py` | 43/43 |
| `python3 tools/qa_motion.py` | 14 ok (slide `mid_frames` checks are flaky under heavy CPU load: compare against main) |
| feature QA | `tools/qa_battle3d.py --slow`, `tools/qa_fps3d.py --only phone`, `tools/qa_cine/cine.py <ids>`, `tools/sfx/qa_sound.py` |
`node tools/build-data.mjs --check` rewrites `data/modes/index.js`; run `node tools/build-data.mjs` after adding/removing
modes and commit the regenerated data. Headless Chromium here: `pip install playwright && python3 -m playwright install chromium`;
on Debian trixie arm64 also unpack libatk1.0-0t64, libxcomposite1, libxdamage1, libatspi2.0-0t64, libxres1 (from
deb.debian.org pool, `dpkg-deb -x`) into /tmp/libs/root and export
`LD_LIBRARY_PATH=/tmp/libs/root/usr/lib/aarch64-linux-gnu:/tmp/libs/root/lib/aarch64-linux-gnu`. CDN engines (Stockfish,
Maia from unpkg/jsDelivr) fail from the sandbox with 407 / ERR_TUNNEL: that is the environment, not an app error.

## Owner's standing rules
- **Faithful to the videos and iwantcheckmate.com.** Every mode on the site exists here (coverage table in STATUS.md,
  34/34). Rules, setup, board, opponent name/rating/avatar, mode card and effects match the video.
- **Art and effects are copied directly from the iwantcheckmate videos**, using the reference sprites in
  `research/frames/sprites/` (and stills in `research/frames/video_thumbs/`). Where no sprite exists, recreate it exactly
  from the frames. Copy chess.com art only where a video shows it, as a clean original (owner 2026-11-26 11:48 AM ET). Bad sprites (blurry upscale, jaggy crop, halo/box, half-coloured, clipped):
  find the same image online, else the best alternate, else a clean composite; never faded edges; transparent PNG at
  least 512 px (2x square), centred at about 90%; source in the mode folder's `source.notes`. The creator's own art on
  iwantcheckmate.com (`/challenges/<name>/<name>.png`, list in the site's main JS) is checked first.
- **Standard pieces:** open-licensed sets only, each with its licence in `LICENSES.md`. Default is Staunty (lichess,
  CC BY-NC-SA 4.0, non-commercial); cburnett/merida/etc. stay selectable.
- **Motion:** pieces slide (~200 ms ease-out), never teleport (board motion engine: `board.motion`, `board.quietNext`,
  `board.settle`). `prefers-reduced-motion` = instant/calm. Ability effects are one-shot pulses, never permanent danger
  rings (`js/fx/ability-fx.js`, layer `#board-abl`).
- **Promotion:** chess.com-style picker Q/R/B/N unless the mode's video says otherwise.
- **Branding:** keep the title "Chess Master", the "iwantcheckmate fan remake" subtitle and the footer credit.
- **UI:** chess.com Android look, not "vibecoded" (no gradient blobs, glass, emoji icons, pill overload); Lucide icons.
- **Zoom:** limited-view modes (Backrooms, Petrified Pawns, SCP Containment Breach) have no zoom; big maps get phone zoom.
- **Sound:** modern, cinematic, premium game-UI sound with trailer weight; each event its own design. Never clone the
  owner's reference clip (`intro_sfx_v3`, sandbox only, never in git): genre reference only, every big event must stay
  < 0.6 Pearson envelope correlation (`tools/sfx/similarity.py`; do not change that test without asking the owner), no
  near-duplicate pairs, `tools/sfx/ring_check.py` 0 struck rings. No bells, chimes, dings, glass pings, synth leads,
  chiptune, cartoon brass. CC0 sources only (`tools/sfx/sources.md`). No audio extracted from the videos; loader.to,
  cobalt and y2mate are banned (cnvmp3.com is the only allowed converter if video audio is ever needed again).
  Regenerate with `tools/sfx/make_sfx.py` (> 2 min in full: regenerate single recipes). Agents can't listen: say so.
- **3D modes** must be video-accurate. Battle Chess (`IbRrzKtieqs`) looks like the original game in original/CC0
  low-poly characters; FPS Chess is a real three.js first-person shooter (WASD + mouse; phone joystick, look-drag, fire).
- **Infinite Pawns** (`D8rD3rTwgjc`, `iAwhIiexojg`): place a pawn on any empty square. **Catapult** (`Ugw05nktuDM`):
  slingshot physics.
- **New videos:** a daily Hark task checks youtube.com/@iwantcheckmate. New video -> add to `data/videos.json` with
  `coming_soon: true` and a transcript-based `teaser`, run `node tools/build-data.mjs`, commit to main. The lobby hero is
  pinned by `FEATURED` in `js/lobby/hype.js` (currently `icm-scp4975`, art `assets/lobby/featured-scp4975.jpg`), so the
  daily task does not override it; the hype banner otherwise features the newest coming_soon video.

## What landed in the 2026-11-26 consolidation (main de7b49f / acc3b76)
- Merged: wip/lobby (featured SCP-4975 hero, infinite-scroll feed, Lucide icons), wip/horror-cine (cinematic layer for
  24 horror modes, `js/fx/horror-cine.js`, `css/cine.css`), wip/3d-polish (Battle Chess roster/fights + untested Chess
  Ultimate cutout audit batch 1), wip/fps-3d (FPS duel input fixes, red room), qa/playtest-fixes (already on main as dd220d6).
- From rebuild (ported as a 3-way patch from rebuild 0463918..586085e, then real merge): fin-sprites-b art (Arthur,
  Pac-Man pellets, reserve icon, Fairy-Stockfish logo, 2Sud5/AtmctmxLq58/Cs6knoD0INQ/QXSrAkEF744/XhtzHTEsh9Q/amZRnocbNr8
  avatars), game-fx presets for 68 modes (both halves), rebuild art/QA tools into `tools/`.
- Conflict decisions: main kept SFX v5/v5b (all wavs/mp3, `tools/sfx/*`, LICENSES sound credits), lobby/index.html,
  Containment Breach site rules (no zombie.png), STATUS.md, build-data.mjs; rebuild won `js/fx/game-fx*.js` and
  `tools/sprite_repix.py`. 46 sprites deleted on main as unused stayed deleted.
- Checks on the merged tree: test 13/13, lint 0 errors, sweep 503/503, validate only hZf3G9Pr1UU, qa_ui 43/43,
  qa_motion 14 ok, qa_battle3d --slow pass, qa_fps3d phone pass, qa_cine 3 modes ok, headless 390x844 smoke of lobby +
  16 modes 0 console errors.

## Remaining work (prioritised; one owner per line, RESUME lines in research/polish_report.md)
1. **QA not yet run after the consolidation:** full `tools/qa_all.py --widths 390,360` over all 503 modes (report ->
   `research/qa_full_report.md`), `tools/qa_fps3d.py --only desk1` then `--only desk2` (desktop FPS; desk2 checks quick
   clicks fire), `tools/qa_cine/rmcheck.py` + `cine.py` on all 24 horror ids, `tools/qa_battle3d.py` desktop, owner
   listen test of SFX v5.
2. **Untested WIP now on main:** Chess Ultimate 3D cutouts (`134b237`, `js/fx/view3d.js` 'cu' preset,
   `assets/modes/CxtttdnwNWk/cu3d`) - browser-check vs `research/ref/fin-battle/sheets/ref_cu.jpg`; revert that preset if bad.
   game-fx second-half presets (47 ids) were only vfxqa-tested on rebuild.
3. **3D video-accuracy audit (fin-battle, polish_report):** batch 2 = robloxTable `EqOwqolOZOo` (blocky avatar + brick
   room), robloxSky, luxury, fly, hyper, abyss, dungeon; screenshots still missing for sGXmiyvZDE4, iqfHW2_sMmc,
   zDFsnRE_Gig, xlErokL2-4c, hZf3G9Pr1UU, CONozr99agQ, xvlHij1tgk8. Chess Arena `CONozr99agQ` and Table Tactics
   `xvlHij1tgk8` are still 2D. `hZf3G9Pr1UU` 3D Glasses lacks `assets/pieces/staunton3d/*.png` (render with `tools/g3d_staunton.py`).
4. **Battle Chess characters:** roster/fights are in; still code-built approximations - polish toward the original
   game's look (armored spearmen, stone golems, sorceress queen ...), idle/walk/attack animations, per `docs/3D_POLISH_HANDOFF.md`.
5. **FPS Chess:** Q/R/B weapons, R/Q abilities, block key and all numbers are inferred (`docs/fps3d-wip.md`); props are
   code-built, sounds synthesised.
6. **Jupiter 2011 (`Mg2Upjjo2yg`):** replace the map with the traced Skeld mask (`research/ref/fin2-jupiter/`,
   45x23, pod row 11 cols 42-44), crisp CSS squares, sprites matching the video (fin2-jupiter RESUME has exact steps).
7. **SCP-4975:** the video is `HuZlhHnES7M` (16:12, 2026-11-26), not in `data/videos.json` yet; add it, point
   `icm-scp4975` (or a new mode file) at it, check board colours/sprite vs the thumbnail, read transcript 7:00-16:12 for
   edge cases, then point `FEATURED.art` at the video's maxresdefault (`research/ref/fin2-scp4975/`).
8. **Art still invented or weak:** `research/impl_1..6_report.md` leftovers (bot avatars with no frame: Trash Bot 1999 /
   The Master `AaHmMC3HA0E`, Level 20 `D8olpXjblQ0`, Wendy/Miguel/Lee `tfPyy36nwc4`, post-Aziz bots `9pHhqAbQS0s` still
   use bot.svg; Seirawan Elephant; Chess Arena piece models; Gun King biomes), `BLURRY_SPRITES.md` 3 unticked photo
   avatars (t8VWAr2UicA opp1/opp2, xAFkE7-Jp88 opp1), art passes art1 (from CRrPXR1WuDo), art2 (from UECeBEOHoy0),
   art3 (order lines 81-166), Chaturanga elephant/counselor art (`GuyllCIRcQI`), trout avatar `inm7KvllVu0`.
9. **todo_pass2:** only `p6W3yDU-v88` (Chessformer final levels: buttons/ledges/choice, 8x8 placeholders) remains.
10. **Game chrome UI polish** (fin2-lobby step 3: css/game.css gamebar/pbar/status/side panel) + infinite-scroll jank
    check at 4x CPU throttle.
11. **Known issues:** Boiled One (`xvibqyL-CqQ`) freeze not reproduced (root cause unconfirmed); SCP-409 solo undo can
    desync the aura; Gabriel's glitch can briefly draw above pieces; badges don't slide with pieces;
    `assets/sounds/lichess/` (AGPLv3) unused; Fairy-Stockfish is a custom single-thread WASM (no SharedArrayBuffer on Pages).
12. Smoke-test the 10391ba rule fixes (Void/Darkness, Locust, SCP-966, ClockFish, MirrorFish, ZebraFish, SimpFish) by
    playing in a browser.

## Questions still open with the owner
- Staunty is non-commercial: switch to a free-licence default?
- Sound peak standard: older rule -6 dBFS peaks vs current builds at <= -1.2 dBTP true peak.
- DECIDED by the owner 2026-11-26 11:48 AM ET: chess.com avatars/icons that appear in the videos (Arthur, Neo-knight
  reserve icon, Elsa/Noel/Zara, ...) are COPIED, but cleanly: crisp transparent PNG, no baked background, no clipped or
  faded edges; find the clean original image online first. This replaces "never copy chess.com art" for anything the
  videos show (chess.com art the videos never show is still off limits).
- Make the mirror update on every push (blocked by org OAuth policy)?
- Speedrunner vs 3 Hunters (`UZ79sKLa6z4`): lock zoom too?
- Add the flat Minecraft and Roblox Survive modes to the 3D tab?
