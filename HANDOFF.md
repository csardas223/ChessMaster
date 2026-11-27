# HANDOFF: notes for contributors working on Chess Master

Last updated: 2026-11-26, 6:20 PM ET (done items removed; old notes in research/history/HANDOFF_2026-11-26.md). Read this first, then `STATUS.md`, `CONTRIBUTING.md`, `LICENSES.md`,
`docs/ARCHITECTURE.md`. This file replaces the old main HANDOFF and the rebuild notes (`rebuild/NEXT_AI.md`,
`rebuild/HANDOFF.md`, `rebuild/RESUME_NOTE.md`, kept as history in `research/history/REBUILD_*.md`).

## NEXT AI: read this first (Hark, 2026-11-26 6:10 PM ET)
Shipped today on main: SFX v8 themed captures; Spinner Wheel stop angle; SCP-409 aura follows board flip; new social card
(assets/og/og-default.png, works on Discord/X); mobile UI sweep + ONE button system (css/balatro.css "BUTTON SYSTEM",
tools/qa_mobile_sweep.py); longer README (tools/readme_store.py --capture && tools/readme_long.py --capture).
Do next, in order: (1) wait for owner feedback on the look/buttons on the Z Flip6 and iterate; (2) DONE 752787cf: README in-game cards
(Backrooms, 4 Player, Chessformer, Atomic, Dice) cropped to the board, mid-game (`readme_long.py --capture --ingame-cards`); (3) accuracy rows RDl-EmbTRWc, M0rsyuvaTrk (DONE t2b),
WEYUcaJTBso (DONE t2b), NK4Upb_s8Ok, boaA9_TjXeU, xg_djfCrRes; (4) DONE (t3a/t3b, re-checked t3b-jupiter): mobile leftovers in item 6 (4p team chips at 360px, cover screen
per-mode, 3D/FPS buttons); (5) older backlog below. Owner-only: listen test of SFX v7/v8, Soko playtest, delete the
chessmaster-game repo, open questions (piece-set licence, peak standard, zoom lock UZ79sKLa6z4, Minecraft/Roblox 3D tab).
SCP-4975 (HuZlhHnES7M, Hark cm_4975, 7:30 PM ET): video id confirmed (oEmbed + watch page: 137,008 views, 16:12), views in data/videos.json, research/modes/HuZlhHnES7M.json (rules with timestamps), trout Stockfish avatar like the video, shattered-king game over now says why (was "the king was captured"), hero title = video title; QA `python3 tools/qa_scp4975.py` (alias #/play/icm-scp4975 -> /play/scp-4975/, crawl/crack/shatter per round, king shatter). SFX keys still say icm-scp4975 (tools/sfx/modes_v6.py, assets stay in assets/modes/icm-scp4975/): fine, don't rename.
Lobby thumbnails audited vs YouTube (thumbs-audit, 65ea64cf/8379203f): 18 local `assets/modes/<id>/thumb.jpg` on video modes compared to i.ytimg.com maxresdefault (SCP-4975/HuZlhHnES7M + icm-* skipped); 15 were already identical, 3 site cards did not match and now carry the real YouTube thumbnail (7csbf0L-uio Portals, BYg7rV53WrM Darkness, vPEVQgvjoL4 Mal0; old files in docs/promo-archive/2026-11-26_65ea64cf). Every other video mode hotlinks i.ytimg.com (mqdefault 200 for all 561 videos). A new thumb.jpg must be the video's own YouTube thumbnail.
README audited as GitHub renders it (t1b, 1718b2b1): all 49 images load, all 26 play/<slug>/ + repo links 200, numbers band = repo (511/561/5/31/16), alt texts fixed to lobby names, caption says card titles are video thumbnails (Evil Joker Chess? = Chess Survivors, Boat Chess? = Chaturaji), Gun King still added (tools/readme_gunking.py), 390px render: no overflow, images scale (requirements table scrolls sideways, like any GitHub table).

Jupiter 2011 Mg2Upjjo2yg (t3b-jupiter): the traced 45x23 Skeld, grey pod (row 11 cols 42-44), video start position and plain CSS squares were
already on main (16d7ceca); now also no coordinates on the board (new spec flag `board.coords: false`, js/ui/board-view.js), lichess cburnett
white pieces (theme.pieces), and the astronauts are video-style greyscale busts (thumbnail faces on a spacesuit collar,
tools/art_jupiter_busts.py; owner to judge them on the phone). HUD astronaut chips are 32 px tap targets.

## START HERE (contributors)
Anyone can pick up an item below. When you finish an item, REMOVE it (note the commit in the NEXT AI block or your report);
when you start one, put your handle on it. Write facts, not session logs.

### Open, in priority order
1. **Owner judges the new look** (direction 4:26 PM: "Balatro + chess.com + Steam store page"). Shipped: css/balatro.css
   (card-table theme over the chess.com layout: Jersey 15 pixel display type, swirling felt, rimmed slabs with hard
   shadows, sinking colour buttons, tilting cards, dealt-card match banner) and the README rebuilt as a Steam store page
   with static art in that style (tools/readme_store.py, no GIFs). Next: iterate on owner feedback; candidates: Balatro-
   style result screen, chip/score counters that tick up, card-deal animation on Home shelves, a lobby "deck" view.
2. **Clipping sweep** continues (see 6).
3. **Soko Chess owner playtest** on a phone (rebuilt this session, below). Unknown real layouts: if anyone has the Steam game,
   transcribe levels 1-3, 5-8, 10 into `LEVELS` (same row format) and rerun `node tools/soko_bfs_verify.mjs`.
4. **QA / accuracy backlog**: qa_all sweep finish (`## s5-qa`), 3D QA reruns + Chess Arena/Table Tactics camera (`## s5-3d`) [qa3d working on both, 7 PM ET],
   accuracy audit rows [IN PROGRESS cm_acc 2026-11-26 7 PM: NK4Upb_s8Ok, boaA9_TjXeU, xg_djfCrRes, RDl-EmbTRWc] RDl-EmbTRWc, M0rsyuvaTrk (DONE t2b: gifts, payback any-piece, ending cutscene; tools/qa_kotb.py), WEYUcaJTBso (DONE t2b: out-of-town ring, rules 7/12/14/24 cheats, real rule book), NK4Upb_s8Ok, boaA9_TjXeU, xg_djfCrRes (`## s5-accuracy`),
5. **More mode sound effects** (owner 4:33 PM; captures DONE 5:50 PM, see checklist; left: owner listen, optional check stingers): give modes extra SFX that fit each mode's theme and make sense for what
   happens on the board (a spell cast, a gun, a monster step, a level clear), but keep them subtle: short, quiet
   (match the -1.2 dBTP true-peak standard, sit under the move sounds), no long loops, no repeats on every move, never
   obnoxious. Own or open-licensed sounds only, with a LICENSES.md row. Wire them through `sounds:` in the mode file or
   js/core/sound-sets.js; check with tools/sfx/qa_sound.py.
6. **Clipping / "unclean" sweep**: owner reports clipping bugs. Fixed so far: Most watched rank numerals hidden under the art,
   two-digit ranks, game-frame HUD text over pieces, status pill accent bent into a bracket. Keep hunting with full-page
   shots at 390x844 and 1366x800 (any mode via `#/play/<id>`), fix, and list what you fixed here.
   **Mobile UI sweep 2026-11-26 (Hark)**, Galaxy Z Flip6 sizes 390x844, 360x780, 412x915 and the cover screen 360x374,
   touch + DPR 2.6. Tools: `tools/qa_mobile_sweep.py OUT [--sizes 390x844,360x780] [--modes ids]` (needs a server on :8765:
   `python3 -m http.server 8765`; full-page + per-viewport shots of Home, search, options, 11 modes, promotion, game over,
   loading, plus an audit of document overflow, elements past the viewport, clipped text, tap targets < 32 px) and
   `tools/qa_button_inventory.py OUT` (computed style of every button on 11 screens). Fixed:
   - c6456296 **one button system** (owner 5:45 PM "make the buttons consistent"): `--btn-*` tokens + "BUTTON SYSTEM" block
     at the end of css/balatro.css. Primary `.btn--primary` green #81b64c / edge #45753c, secondary `.btn` #3c3a37 / edge
     #1f1e1c, 12 px corners, 3 px hard bottom edge that sinks 2 px on press, tiers 44 px/15 px and 52 px/18 px
     (`.btn--big`, Play now, game-over New Game), icon tier 44x44; bold sans everywhere (Tap to start no longer Jersey 15);
     Play/Roll/See all/Clear/tabs/hero/randomizer/game-over/intro/hype/odds Peek/plain mode buttons/gctl pad all on it;
     sort select, search clear, HUD chips (Jupiter Key lines/Map), option selects now 44 px tap areas. Themed video UIs
     keep their look on purpose (Soko level bar, Duolingo, Ouroboros book, Wizard cards, Chess Arena, FPS/3D HUDs).
   - b1dc56bf 4-player bars: opponent name was "B..." at 390 and empty at 360 (team chips ate the row).
   - 865d8e70 Pac-Man sO-lD2On610 seat chips wrapped to 2 lines and poked above the top bar, name cut to "C"; names
     keep full width everywhere, rating drops out first; multi-line buttons get vertical padding.
   - 37fc805c long mode titles in the game bar lost their last word at 360-390 px (now step down to ~14-15 px);
     board/piece swatch names ("High contrast", "Classic (cburnett)") wrap instead of ellipsis.
   - 95a91e8c game-over / intro card on the Flip cover screen (360x374) was cut top and bottom with no scroll; now fits
     and scrolls inside.
   Checked: re-shot every fix, audit 0 document overflow / 0 elements past the viewport on all screens, npm test 13,
   lint 0 errors, qa_ui 43/43.
   **Leftovers part A (Hark t3a, 2026-11-26 ~7 PM ET)**:
   - [x] b682e83e 4-player team chips cut names at 360 ("Croiss...", "Gr..."): on phones (<= 420 px) the other players stack
     as two compact one-line rows (17 px avatar, 11.5 px bold) beside the opponent's name; full names at 360/412, 0 clipped text.
   - [x] cover screen 360x374 checked per mode (25 modes: Stockfish, SCP-096, Boiled One, Backrooms, Shotgun King, 4 Player
     Team, Chaturaji, Labyrinth 82, Chessformer final, 50 Puzzles, Nuke vs Pawn Ocean, Nuke vs 100 Pawns, Jupiter 2011,
     Pac-Man, Soko, Duolingo, Dice, Spell, Duck, Fog of War, Atomic, Wizard, Gun King, 5D, Chess Arena). Found + fixed:
     b8a81a21 the board (300 px floor) was taller than the band between the sticky game bar (52) and the fixed action bar
     (58), so a rank was always hidden and big boards' zoom row was covered (now <= H-116, min 200; taller phones unchanged);
     dea6b85f player bars/HUD sized to the narrower board overflowed (Spell Chess bottom bar -> page 370 px wide, Chrome
     zoomed out), now full width on phones; 3ab5486e 5D Chess canvas pills "Undo Move"/"Submit Moves" overlapped and the
     caption ran under the zoom pills, now shrink to fit; 416fc620 qa_mobile_sweep dismisses the real `.tapstart`.
     Checked: every mode's board/game frame fits the visible band, 0 document overflow, Chess Arena champion list scrolls
     inside (g4ar-pick overflow auto), npm test 13, lint 0 errors, qa_ui 43/43. Shots: sandbox /workspace/work/t3a-shots/.
   LEFT: Gun King canvas HUD text wraps to 2 lines over the arena's top row at 360 (canvas-drawn,
   minor); horror VHS/trailer title card covers the lower board for its ~4 s run (by design); owner should judge on the phone.
   **Leftovers part B (Hark t3b, 2026-11-26 ~7 PM ET)**, checked at 390x844 + 412x915 touch, shots in sandbox /workspace/work/t3b-shots/:
   - [x] b2ca8b67 3D/FPS buttons inventoried: `tools/qa_button_inventory.py OUT --set 3d [--size 412x915] [--base URL]`
     (14 screens: FPS Chess + Bongcloud, Battle Chess 3D, Chess Arena, Table Tactics, Chess Ultimate, Roblox, Beyond the
     Board, Who Takes the Crown, Hyper, The Fly, Luxury, 3D Glasses, Petrified Pawns). Each row is tagged themed / nav /
     ok and the run ends with an OFF-SYSTEM list: 28 before, 0 after. Run it alone (heavy, ~3 min).
   - [x] 4da61b4e 3D/FPS buttons on the system (block "3D / FPS modes" in css/balatro.css): Battle Chess Skip / 1x pill,
     BtB camera rotate, WTTC climb pad (super jump keeps its orange) and stack picks (pressed = green), Table Tactics
     toolbar (36 px plate + 44 px hit area so it covers less of the diorama; aria-pressed replaces inline styles in
     js/games/g6_table_tactics.js), FPS 2D duel Block/Sprint/Ability, Chess Ultimate Tutorials/Draft/CPU bar. Kept on
     purpose (copy the game's UI): FPS duel ability tiles + round FIRE/JUMP/BLOCK thumb pad (tools/qa_fps3d.py checks
     them), Chess Arena champion select, Petrified Pawns spell/item slots, BtB wall symbols, CU draft roster cards.
   - [x] b4795f42 footer links 30 -> 44 px tap height (line-height on the link row; same text, wrap and colour).
   - [x] Soko level bar: decided NO hard edge. Its buttons are bare white glyphs (prev / undo / restart / next) on the
     dark panel, copying the Soko game's own flat icon row; there is no plate for an edge to sit under, and they are
     already 48 px tall. Left as is (themed).

### Copilot review backlog
- [ ] Owner pasted a Copilot repo review (2026-11-26 6:34 PM): triaged list in research/copilot_review.md (what's already done,
  what conflicts with owner rules, 12 worth-doing items in order). Work it after the current batches.

### Still open from owner requests (done items removed 2026-11-26 6:20 PM ET; history in research/history/HANDOFF_2026-11-26.md)
- Soko Chess rebuilt: [ ] owner phone playtest; [ ] real layouts for L1-3, 5-8, 10 if anyone owns the Steam game (none published).
- Gravity Sword King: [ ] owner to judge the swing.
- Mirror dropped: [ ] the owner deletes the chessmaster-game repo/org on GitHub.
- Look: [ ] owner still finds parts "vibecoded": next passes remove decoration, match chess.com spacing/type side by side.
- README (store page, made longer in the OG card's look): [ ] owner to judge.
- Duolingo Chess (eCzxOgc4fTY) (Hark duo, 2026-11-26 ~8 PM ET, a1ab843f + fd4cc4a0): owner 6:22 PM "Duolingo isn't accurate in
  art or animation". [x] Opens on a course path (SECTION 4, UNIT 1 Checkmate practice, round 3D lesson nodes, START bubble,
  streak/XP/hearts chips, "Play chess: 20-minute matches with Oscar" card). [x] Lesson = the video's 7 mates in its order
  (Qxf7, back rank, mate in 2 "your queen can seal the deal", Qg7 with knight, Qh7, 2 back-rank mates; all verified with
  python-chess): progress bar, 5 hearts, coach speech bubble, green/red footer + CONTINUE, SKIP, board shake + heart pop,
  coach happy/sad, result screen (XP / time / accuracy count-up), 1-day streak screen, gold node pop back on the path.
  [x] Matches: light app chrome, coach speech bubbles (video lines), BACK TO COURSE. [x] Art is ORIGINAL (tools/duo_art.py,
  CC0): flat chunky piece set and a purple rook-tower coach. Deliberately NOT a copy of Oscar or Duo (trademarked/copyrighted
  characters); the name "Oscar" stays as the video's opponent name. Nunito font (OFL) for the rounded type. LICENSES rows added.
  Checked at 390x844 + 360x740 + 360x374 touch: full scripted run (wrong move, all 7 puzzles, done, streak, path, match),
  0 page errors, 0 horizontal overflow; npm test, lint 0 errors, validate 0 errors, sweep OK. Shots: sandbox /workspace/work/duo-shots/.
  LEFT: [ ] only thumbnail stills exist for this video (app home with owl, ad, icon), no lesson/board frames, so board colours,
  piece look and lesson layout are inferred from the transcript ("white on white", "pieces kind of cute"); owner to judge on
  the phone. [ ] 360x374 cover: lesson footer sits over the bottom rank until you scroll (minor). [ ] Matches are still
  8x8 (the video's matches were 8x8 too; the 4x4 is only the card art).
- [ ] MirrorFish (eCC-U9w9RvQ) move-quality badges like chess.com (owner request) [IN PROGRESS Hark cm_mirror 2026-11-26 7:30 PM ET].
- MORE MODE SFX: [ ] owner listen test.
- [ ] Modes that don't match their videos: owner named Duolingo (remade again by duo, see above). Next: research/accuracy_audit.md rows
      RDl-EmbTRWc, M0rsyuvaTrk + WEYUcaJTBso (DONE t2b), NK4Upb_s8Ok, boaA9_TjXeU, xg_djfCrRes, then playable:false specs. Ask
      the owner which other modes look wrong to them.
- [ ] Older open items: qa_all sweep,
      3D QA reruns + Chess Arena / Table Tactics camera (see research/polish_report.md s5 sections).

### Decisions (owner, binding)
- **No Chess.com piece sets or board art** (2026-11-26 4:02 PM ET). The Neo question is closed; don't add them.
- **One repo only**: csardas223/ChessMaster and its GitHub Pages site. The chessmaster-game mirror is dropped
  (2026-11-26 4:14 PM ET); don't link to it or rely on it.
- **Never waste promo art** (owner 2026-11-26 6:26 PM ET): before replacing or deleting any README, social-card or promo
  image, copy the old file to `docs/promo-archive/<date>_<commit>/<original path>` and add a row to its README.md.
- Main branch only, small commits, `git pull --no-rebase` before every push, never force-push.

## What this is
Chess Master is a static web game that recreates the chess modes from the iwantcheckmate YouTube videos and
iwantcheckmate.com (503 mode files, `data/modes/<youtubeId>.js`, index generated into `data/modes/index.js`).
- Repo: `csardas223/ChessMaster` (public). Live site: https://csardas223.github.io/ChessMaster/ (GitHub Pages from `main`, root).
- No mirror: the chessmaster-game mirror was dropped by the owner (2026-11-26). Vercel is disconnected and stale: ignore it.
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
  your section, so nothing lives only on one machine. Before you stop: commit, push, and update this file.

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

## Remaining work (older backlog; done items removed)
1. **Full QA (s5-qa, IN PROGRESS 2026-11-26 3:40 PM ET; qa3d rerunning from 7 PM ET):** `tools/qa_all.py --widths 390,360 --par 1` over all 509 modes is
   running resumably (cache `/workspace/work/s5_qa_res`, loop `/workspace/work/s5_qa_logs/run.sh`); 209/1018 runs at 3:40 PM,
   0 real failures. The m4-uiqa 3D/load timeouts all PASS on `--redo --par 1`; OvQYI_S5IZg 392 px was not real; Battle Chess
   IbRrzKtieqs only times out under box load (starts in 25 s, no errors). NEXT: let the loop finish (or rerun it), then
   `--report-only --results /workspace/work/s5_qa_res`, keep the s5-qa header in `research/qa_full_report.md`, fix real fails
   (small commit each). Still open from the old list: `tools/qa_fps3d.py --only desk1`/`desk2`, `tools/qa_cine/rmcheck.py` +
   `cine.py` on the 24 horror ids, `tools/qa_battle3d.py` desktop, owner listen test of SFX v5.
3. **3D video-accuracy audit: batch 2 DONE** (m-3d: robloxTable/Sky, luxury, fly, abyss, dungeon; screenshots in
   research/ref/m-3d; Chess Arena + Table Tactics now three.js 3D; staunton3d rendered, validate 0 errors; s5-3d: Hyper
   matches). Abyss `SMOXF1bSsDk` "tap selects but won't move": DONE (s5-3d; level 2 was unwinnable, fixed 6232e68d; both
   levels now clear through real 3D taps, `tools/qa_abyss3d.py`; scene3d taps fall back to the board plane). Left: owner
   phone look at Chess Arena / Table Tactics fps + taps.
4. **Battle Chess characters:** roster/fights + pass 2 + m3-fps details + s5-3d queen bolt fx (charge-up, comet trail,
   impact burst; look INFERRED, no video frame of the bolt) + golem moss are in; still code-built. Next: `python3
   tools/qa_battle3d.py --only desktop --slow` and full `--only phone --slow` rerun after these (s5-3d RESUME says if
   run), real-phone fps check.
5. **FPS Chess:** duel matches the videos' weapons/HUD/room (`docs/fps3d-wip.md`); qa_fps3d phone + desk2 green, desk1
   green except its last duel-B poll (fixed via `CM.fps3d.lastResult`); s5-3d desk1 rerun: Space-jump check failed only because Space came while airborne (QA now waits for ground), rerun desk1/desk2/phone + update docs/fps3d-wip.md (s5-3d RESUME). Chess Arena / Table Tactics camera check (TT castle under toolbar?) also still open (s5-3d RESUME). Still inferred: rook hop / queen dash
   effects and all numbers; props code-built, sounds synthesised, tile icons are HTML entities.
8. **Art still invented or weak:** (s5-art 2026-11-26 re-check) DONE: bot avatars AaHmMC3HA0E Trash Bot 1999/The Master, D8olpXjblQ0 Level 20, tfPyy36nwc4 Wendy/Miguel/Li, 9pHhqAbQS0s post-Azeez ladder (all chess.com originals at 512 px, earlier m-art/art-audit-b; no mode uses bot.svg any more, only the generic fallbacks in js/legacy/glue.js + js/modes/g6_ladder.js); Seirawan Hawk/Elephant (chess.com S-Chess art, deduped to assets/img/fairy for all 4 S-Chess modes, s5-art); Chaturanga elephant/counselor/chariot GuyllCIRcQI (chess.com, m-art); trout inm7KvllVu0 (site stockfish-profile.jpeg, fin-art-b); WLmt62Ll9Hs/laura.png = chess.com laura-bot (m-art); Kzt9ItpGtYg hero (press kit), 4XV3SBMQgXE mask (site art), WXcmWG7Eczs Q/Iq, vzNwF2BH8jg impostor, 06OeGk5Iu-s reptile (site lizard) (s5-art). LEFT: 3 photo avatars t8VWAr2UicA opp1/opp2, xAFkE7-Jp88 opp1 (no source); Chess Arena piece models; Gun King biomes; optional WXcmWG7Eczs set re-trace (tools/art_s5_wxcm.py works but drops the light-grey shading and thickens U_w's outline: add a shade colour per piece before applying); art passes art1/art2/art3 (m-art2 RESUME).
11. **Known issues:** Boiled One (`xvibqyL-CqQ`) freeze not reproduced (root cause unconfirmed); Gabriel's glitch can
    briefly draw above pieces;
    `assets/sounds/lichess/` (AGPLv3) unused; Fairy-Stockfish is a custom single-thread WASM (no SharedArrayBuffer on Pages).
13. **m3-salvage (2026-11-26) leftovers:** old rebuild clones agent-lowconf/agent-g5/agent-g4 are fully triaged (ported or
    rejected with reasons in research/polish_report.md "m3-salvage"); do not port from them again. Chess Ultimate P1 pair
    xRximnDlQtI / 4FRsSJoxMkE: DONE (m-accuracy 2, js/modes/cu_mage.js; see research/accuracy_audit.md); vcMhd5Vd1mM times out in tools/qa_all.py (35 s) though a
    direct 390x844 probe loads it with 0 errors; qqvbb2r2k5I closed in research/recheck_low_confidence.json (s5-accuracy: it was rechecked by recheck4, smoke 0 errors).

## Questions still open with the owner
- Staunty is non-commercial: switch to a free-licence default?
- Sound peak standard: older rule -6 dBFS peaks vs current builds at <= -1.2 dBTP true peak.
- Speedrunner vs 3 Hunters (`UZ79sKLa6z4`): lock zoom too?
- Add the flat Minecraft and Roblox Survive modes to the 3D tab?


