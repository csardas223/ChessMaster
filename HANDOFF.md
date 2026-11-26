# HANDOFF: notes for contributors working on Chess Master

Last updated: 2026-11-26, 6:10 PM ET. Read this first, then `STATUS.md`, `CONTRIBUTING.md`, `LICENSES.md`,
`docs/ARCHITECTURE.md`. This file replaces the old main HANDOFF and the rebuild notes (`rebuild/NEXT_AI.md`,
`rebuild/HANDOFF.md`, `rebuild/RESUME_NOTE.md`, kept as history in `research/history/REBUILD_*.md`).

## NEXT AI: read this first (Hark, 2026-11-26 6:10 PM ET)
Shipped today on main: SFX v8 themed captures; Spinner Wheel stop angle; SCP-409 aura follows board flip; new social card
(assets/og/og-default.png, works on Discord/X); mobile UI sweep + ONE button system (css/balatro.css "BUTTON SYSTEM",
tools/qa_mobile_sweep.py); longer README (tools/readme_store.py --capture && tools/readme_long.py --capture).
Do next, in order: (1) wait for owner feedback on the look/buttons on the Z Flip6 and iterate; (2) README in-game cards
(Backrooms, 4 Player, Chessformer, Atomic, Dice) crop tighter on the board; (3) accuracy rows RDl-EmbTRWc, M0rsyuvaTrk,
WEYUcaJTBso, NK4Upb_s8Ok, boaA9_TjXeU, xg_djfCrRes; (4) mobile leftovers in item 6 (4p team chips at 360px, cover screen
per-mode, 3D/FPS buttons); (5) older backlog below. Owner-only: listen test of SFX v7/v8, Soko playtest, delete the
chessmaster-game repo, open questions (piece-set licence, peak standard, zoom lock UZ79sKLa6z4, Minecraft/Roblox 3D tab).

## START HERE (contributors, updated 2026-11-26 4:20 PM ET)
Anyone can pick up an item below. Keep this file current for the next contributor: when you finish an item, move it to
"Done" with the commit, how you checked it, and what is left; when you start one, put your name or handle on it so two
people don't take the same one. Write facts (what changed, how to verify, what is open), not session logs.

### Open, in priority order
1. **Owner judges the new look** (direction 4:26 PM: "Balatro + chess.com + Steam store page"). Shipped: css/balatro.css
   (card-table theme over the chess.com layout: Jersey 15 pixel display type, swirling felt, rimmed slabs with hard
   shadows, sinking colour buttons, tilting cards, dealt-card match banner) and the README rebuilt as a Steam store page
   with static art in that style (tools/readme_store.py, no GIFs). Next: iterate on owner feedback; candidates: Balatro-
   style result screen, chip/score counters that tick up, card-deal animation on Home shelves, a lobby "deck" view.
2. **Clipping sweep** continues (see 6).
3. **Soko Chess owner playtest** on a phone (rebuilt this session, below). Unknown real layouts: if anyone has the Steam game,
   transcribe levels 1-3, 5-8, 10 into `LEVELS` (same row format) and rerun `node tools/soko_bfs_verify.mjs`.
4. **QA / accuracy backlog**: qa_all sweep finish (`## s5-qa`), 3D QA reruns + Chess Arena/Table Tactics camera (`## s5-3d`),
   accuracy audit rows RDl-EmbTRWc, M0rsyuvaTrk, WEYUcaJTBso, NK4Upb_s8Ok, boaA9_TjXeU, xg_djfCrRes (`## s5-accuracy`),
   (wheel stop-angle bug + SCP-409 aura on flip DONE.)
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
   lint 0 errors, qa_ui 43/43. LEFT: 4-player team chip names still ellipsize at 360 ("Croiss...", design choice: chips
   shrink so the opponent keeps the name); footer links are 30 px tall (fine as inline text links); Soko level-bar
   buttons have no hard edge (themed, left alone); the 360x374 cover screen only checked for game over / promotion /
   Home, not every mode; 3D/FPS HUD buttons not inventoried; owner should judge the button system on the phone.

### CHECKLIST: every owner request from the 2026-11-26 3:55-5:26 PM ET chat (s6), state as of 5:26 PM ET
Done = pushed to main and checked headless (npm test 13, lint 0 errors, sweep 0 failed, validate 0 errors, qa_ui 43/43).
- [x] Soko Chess rebuilt (rules, 10 levels, BFS proof) + look fixed (gapped tiles, smaller pieces, no blurry level card).
      [ ] owner phone playtest; [ ] real layouts for L1-3, 5-8, 10 if anyone owns the Steam game (none published).
- [x] Gravity Sword King: default upright king, video sword, polished swing. [ ] owner to judge the swing.
- [x] Desktop-only arrows: right-drag, family colour, Nukes-vs-Gotham shape, L-shaped knight arrows, grow-in, smooth
      live preview, start/target pieces outlined while drawing, cleared on every new game/mode.
- [x] Readable links /play/<slug>/ + per-mode social previews (title, image, description).
- [x] OG image refreshed 2026-11-26 (Hark): assets/og/og-default.png (1200x630, ~530 KB) in the current look: Jersey 15
      title, "iwantcheckmate fan remake", green "500+ CHESS MODES from the videos" slab, wall of real art (board shots from
      docs/media/shots + video stills). Generator: `python3 tools/og_image.py` (needs Pillow, fontTools, brotli; uses
      tools/readme_store.py helpers; replaces tools/og/). index.html + build-share fallback use `?v=20261126`: bump it
      (and rerun `node tools/build-data.mjs`) whenever the image changes. Commit 9d375df5.
- [x] Mirror dropped (README/HANDOFF refs gone). [ ] the owner deletes the chessmaster-game repo/org on GitHub.
- [x] No Chess.com piece sets (decision recorded).
- [x] Rounder corners; clipping fixes (Most watched numerals, HUD pills, status accent, Home button edges, card lift,
      capture ghost over the capturer, board corner radius cutting corner pieces).
- [x] Look: chess.com colours with a slight Balatro feel (css/balatro.css); decorative icons removed.
      [ ] owner still finds parts "vibecoded": next passes remove decoration, match chess.com spacing/type side by side.
- [x] README rebuilt as a Steam store page, no GIFs, art in the current look from real screenshots (tools/readme_store.py).
      [ ] owner to judge; re-run `python3 tools/readme_store.py --capture` after UI changes.
- [x] README made longer in the OG card's look (owner 5:5x PM, Hark 2026-11-26): hero = docs/media/banner.jpg (og card widened), "by the numbers" band (counted from play/ + data/ + settings at build), pick/play/share strip, 6 theme shelves x 3-6 cards -> play/<slug>/. Regenerate: `python3 tools/readme_store.py --capture && python3 tools/readme_long.py --capture`. [ ] owner to judge.
- [x] No big fading intro image in any mode (start overlays skipped, g3 zoom intro off).
- [x] Match start: sound when the match starts, bot waits 1 s after it, "Tap to start" only on reload / direct link,
      banner + horror title cards + game_start wait for it.
- [x] Recommended for you: same daily mode for everyone by formula (L.dailyIndex).
- [x] Most watched: gold / silver / bronze ranks, views + "x ago" on every card.
- [x] Loading screen skeleton at the final position and size from the first frame (PC + phone).
- [x] No green board flash when leaving a game.
- [x] Duolingo Chess rebuilt (vs Oscar, adaptive per game). [ ] lesson path (checkmate practice), Oscar avatar.
- [x] MORE MODE SFX (owner 5:18 PM: "more sfx to better suit the modes, no overly obnoxious sounds, but they must suit
      the theme"). DONE 2026-11-26 5:50 PM ET (Hark): tools/sfx/modes_v8.py + make_v8.py build 11 subtle family
      captures in assets/sounds/sets/ (boom, dice, scifi, puzzle, fish, fog, duck, rush, drawback, arena, odds; 0.15-0.45 s,
      FX_LUFS-2.5 or quieter, true peak <= -1.6 dBTP, CC0 sources only, no tonal tails); medieval now reuses sword_capture.
      Wired in tools/sfx/wire_v7.py FAMILIES (386/511 modes have a family) -> js/core/sound-sets.js. Checks: npm test 13,
      ring_check 0 struck rings, qa_sound 62 files load+play, CM.sound api ok, 0 console errors (qa_sound now waits for and taps
      the "Tap to start" plate on its direct open: PASS, game-start take + move-self + move-opponent played). Not listened to (agents can't): [ ] owner listen test.
      Optional next: `move-check` stingers for guns/battle/magic/dragon/horror (same rules).
- [ ] Modes that don't match their videos: owner named Duolingo (done). Next: research/accuracy_audit.md rows
      RDl-EmbTRWc, M0rsyuvaTrk, WEYUcaJTBso, NK4Upb_s8Ok, boaA9_TjXeU, xg_djfCrRes, then playable:false specs. Ask
      the owner which other modes look wrong to them.
- [x] Wheel stop-angle bug: DONE 2026-11-26 (Hark): js/modes/g4_wheel.js LAYOUT maps each slice of both wheel images; the
      wheel now stops with the picked slice under the pointer (+-32% slice jitter; action wheel picks one of the matching
      slices). Odds unchanged (uniform per outcome). Checked by rotating both wheel.png by the computed angle (N, Check).
- [x] SCP-409 aura on board flip: DONE 2026-11-26 (Hark): board-view.js fires `cm:boardflip` on a flip, ability-fx fx_aura
      re-places its tiles (listener removed with the aura). tools/qa_scp409_undo.py (now taps Tap to start) 14 steps incl.
      flips: ok, 0 page errors. (fx_zone could get the same listener if a zone mode shows the same bug.)
- [ ] Older open items: qa_all sweep,
      3D QA reruns + Chess Arena / Table Tactics camera (see research/polish_report.md s5 sections).

### Owner feedback 2026-11-26 4:25-5:03 PM ET (s6b/s6c), what was done, what is left
- "Balatro + chess.com + Steam store page", then "chess.com colour scheme", then "slightly more chess.com, keep a slight
  Balatro feel, it feels vibecoded": css/balatro.css now = chess.com palette (#312e2b / #262421 / #3c3a37 / #81b64c),
  Jersey 15 pixel face ONLY on big titles, chess.com bold sans for everything small, grey category labels (no coloured
  caps), no family chips on every card, flat tabs, buttons with a hard bottom edge that sink, cards that lift/tilt a
  little. LEFT: owner still judges it "vibecoded"; next passes should remove decoration rather than add it (compare
  side by side with chess.com's app at 390x844: spacing, type sizes, one accent colour, no gradients).
- Buttons clipping on Home (pressed-edge cut by the card): fixed (room under button rows, overflow visible).
- "Big image that fades out" on game open: all start overlays with an image are skipped (js/game/spec-game.js), and
  the g3 zoom-out intro canvas (Nuke vs a Pawn Ocean and other big boards) is off (`params.introEnabled` to re-enable).
- Match-start sound plays when the match starts (after the loading screen), the bot's first move waits 1 s after it;
  "Tap to start" appears ONLY when a mode is opened straight from its address (reload or a link), never from the lobby
  (CM.app.bootOpen); the match banner waits for that tap. The banner on non-horror modes is a dealt card.
- Recommended for you = same mode for everyone each day, no server: pool = every playable mode sorted by id,
  index = (year * 37 + dayOfYear * s) mod N with s coprime to N (js/lobby/lobby.js L.dailyIndex, UTC date).
- Loading screen skeleton now tracks the real game layout every frame and starts from the last layout seen at that
  window size (js/ui/loader.js); checked at 390x844 and 1366x800 (blocks match the board, player bars and side panel).
- Capture "clipping": the fading captured piece drew over the capturer after it landed (ghost layer z-index 2 -> 0)
  and the 12 px board corner radius cut corner pieces (back to 4 px).
- Arrows (owner 5:16 PM): drawn in the mode family's colour, same shape as the mode VFX arrows (Nukes vs Baby Gotham),
  grow in over 180 ms, and a preview arrow follows the pointer smoothly while the right button is held (board-view.js).
- Icons (owner 5:07 PM "some icons look vibecoded"): decorative icons removed (section-title icon chips, family chips on
  cards/hero/random, the family icon in the game title and banner); only working icons stay. README art rebuilt in
  the same chess.com look from fresh screenshots (tools/readme_store.py --capture).
- Most watched: ranks gold / silver / bronze then grey, every card shows views + how long ago it was posted, card lift no
  longer clipped by the row (js/lobby/lobby.js watchedLine, css/balatro.css).
- Soko Chess look (s6b): gapped flat tiles, ~66% pieces, outlined priority numbers, no blurry 205 px level card.
- Duolingo Chess eCzxOgc4fTY rebuilt from the transcript: 20-minute games vs Oscar whose strength follows the video's
  three games (1800 / 450 / 1100, inferred), his lines as toasts, Duolingo colours. LEFT: the lesson path (checkmate
  practice puzzles, XP/100%/time result), a real Oscar avatar (none in the frames we have).
- Gravity Sword King: default upright king, sword swing polished (wind-up, crescent trail, ghost blades, settle).
- More themed, subtle SFX per mode: see open item 5.
- "Modes that don't match their videos": owner named Duolingo (done above). LEFT: research/accuracy_audit.md rows
  RDl-EmbTRWc, M0rsyuvaTrk, WEYUcaJTBso, NK4Upb_s8Ok, boaA9_TjXeU, xg_djfCrRes, then any playable:false spec. Ask the
  owner which others they noticed.

### Done 2026-11-26 (s6)
- **Soko Chess 7lEglazTlo8 rebuilt** (data/modes/7lEglazTlo8.js): rules from the full transcript (push one square, no pushing
  off the board or into pieces, white pawns push diagonally, black pawns/rooks capture onto the square in priority order,
  typed pawn/rook targets, sacrifices allowed), 9x7 board, 10 levels with names from the video: L9 Sacrifice All exact and
  L4 Cunning Pawns map/targets exact from the frames; the others are new layouts (no level maps are published in text:
  Steam guides, reviews and YouTube checked). Level select + unlock progress (localStorage `cm.soko.unlocked`), yellow
  pushable pieces, priority badges, pushed pieces slide (new `m.slides` move hint in js/game/spec-game.js). Own flat art:
  tools/soko_art.py. **Proof**: `node tools/soko_bfs_verify.mjs` (real engine + mode hooks, every level SOLVABLE, 4-35 moves).
- **Gravity Sword King rx-HCGCNuDo**: the king is the active set's default white king, upright (no tilt); only the video's
  diamond sword swings (assets/modes/rx-HCGCNuDo/sword.png, cut from sword_king.png).
- **Arrows on PC** (js/ui/board-view.js, css/board.css): with a mouse, right-drag square to square draws a chess.com-style
  orange arrow (knight jumps bend into an L, the same drag again removes it); right-click still marks a square; left click
  clears both. Touch devices get none.
- **Readable, shareable mode links** (js/app.js, index.html): opening a mode shows `<site>/play/<slug>/` in the address bar
  (the static share page from tools/build-share.mjs with that mode's og/twitter title, image and description), so a pasted
  link unfurls on social media. index.html sets `<base href>` to the site root; old `#/play/<youtubeId>` links still open.
  file:// falls back to `#/play/<slug>`. Use `CM.app.curId` for the open mode's id (not `location.hash`).
- **Rounder UI**: radius scale roughly doubled in css/base, lobby, game, hud, hype, board (cards, thumbnails, hero, buttons,
  sheets, board corners on desktop).
- Checks run: npm test 13 pass, lint 0 errors, sweep 510 ok / 0 failed (2 known warnings), validate 0 errors, headless
  390x844 + 1366x800 shots, a scripted Soko L1 solve, URL open/reload/back.

### Decisions (owner, binding)
- **No Chess.com piece sets or board art** (2026-11-26 4:02 PM ET). The Neo question is closed; don't add them.
- **One repo only**: csardas223/ChessMaster and its GitHub Pages site. The chessmaster-game mirror is dropped
  (2026-11-26 4:14 PM ET); don't link to it or rely on it.
- Main branch only, small commits, `git pull --no-rebase` before every push, never force-push.

## SESSION 5 NOTES (history; open items moved into START HERE above)
Agents s5-qa, s5-art, s5-accuracy, s5-vfx, s5-3d, s5-ui, s5-soko. Each one's exact next steps are its `## s5-<name>` RESUME section in research/polish_report.md.
Open owner asks, in priority order for the next session:
1. SOKO CHESS 7lEglazTlo8 (owner 3:31 PM "soko chess is still shit"): NOT rebuilt yet, research only (research/modes/7lEglazTlo8.json key s5_soko_research_2026_11_26). Rewrite the mode with the corrected rules + levels + solver, steps in `## s5-soko`.
2. README "more stimulating" (owner 3:17 PM): NOT started. Plan in `## s5-ui`: animated hero montage, mode-montage strip, horror jumpscare / nuke / Gun King clips (<3 MB), punchier copy, check on github.com.
3. UI "looks vibecoded, more stimulating" (owner 3:17 PM): first pass DONE (f243afae, e00568aa); owner to judge. Next ideas: animated stills on phones (card nearest centre), further polish per owner feedback.
4. Rest: qa_all sweep finish (`## s5-qa`), 3D QA reruns + Chess Arena/Table Tactics camera (`## s5-3d`), accuracy audit rows RDl-EmbTRWc, M0rsyuvaTrk, WEYUcaJTBso, NK4Upb_s8Ok, boaA9_TjXeU, xg_djfCrRes (`## s5-accuracy`), wheel stop-angle bug js/modes/g4_wheel.js (`## s5-vfx`), SCP-409 aura on board flip (`## s5-ui`).

## OWNER REQUESTS 2026-11-26 1:00-1:35 PM ET (Hark session 2; binding, check each is done)
- INTRO SHORTER + NO AUTO RULES (owner 2:31 PM ET; m4-uiqa, DONE): the family title strip on game open is about half as long (js/ui/family.js: 0.9 s hold, 180 ms in / 200 ms out; was 1.9 s + 300/300 ms; reduced motion 0.7 s opacity-only). The mode intro card with the rules no longer opens automatically on game open (js/ui/game-ui.js setOpponentCard no longer calls UI.intro; UI.intro stays callable, nothing opens it). The rules stay where they already were: the panel's "How it works / How to win" (Mode tab on desktop, the panel under the board on phones). No new info button (owner: one already exists). Checked at 390x844 touch (tools: sandbox /workspace/work/m4ui/introchk.py): strip visible 1.06-1.19 s incl. fades, intro card never opens, rules text present in #pane-info; qa_ui 43/43; shot research/ref/m4-ui/intro_strip_no_card_390.jpg.
- HOME UI PASS (owner 2:40 PM ET "Make home UI more interesting visually but not vibecoded look"; m4-home, FIRST PASS PUSHED): family chips on every Home card (js/ui/family.js icon + accent), Recommended = full-width key-art card, section headers with icon/count/See all, up to 5 family shelves (See all = family list, L.setFam, Clear in the feed header). Files js/lobby/lobby.js + css/lobby.css (m4-home block). Shots research/ref/cm-home/{before,after}_home_*.jpg. Open: qa_ui 43/43 + qa_scroll_jank --cpu 4 rerun on an idle box (m4-home RESUME in research/polish_report.md).
- REPO ROOT CLEANUP (owner 1:52 PM ET, DONE): the ~500 per-mode share-page folders no longer sit at the repo root. tools/build-share.mjs now writes them to play/<slug>/index.html (SHARE_DIR) and deletes any old root-level share folder; share links are <site>/play/<slug>/. Never write generated folders to the repo root again.
- m2_fps (FPS Chess + Jupiter, stopped 1:40 PM): FPS duel rewritten to the video (musket/bow/long musket/sniper/minigun/sword, board-on-table room, tiles + cracked-glass HUD, LShift/E, climb, KILL CAM); Jupiter on the traced 45x23 Skeld + video start + video sprites (board limit now 64). NEXT: rerun tools/qa_fps3d.py phone/desk1/desk2 to green, update docs/fps3d-wip.md + FPS mode texts; Chessformer p6W3yDU-v88 final levels not started (m-fps / m-levels RESUME in research/polish_report.md).
- m3-fps (2:20 PM ET): qa_fps3d phone ALL GREEN, desk2 click->shot fix verified (3/3), desk1 16/17 (duel-B poll, fixed in QA); FPS texts + docs/fps3d-wip.md updated; Chessformer final levels verified solvable, todo_pass2 gone; Battle Chess knees/king hammer/pawn/bishop details. RESUME in research/polish_report.md ## m3-fps.
Agents this session (RESUME lines in research/polish_report.md): m-qa, m-art, m-accuracy, m-3d, m-fps / m-levels, m-sfx / m-og (+ README), m-ui, m-themes.
- MAIN ONLY: work only on `main`. No side branches at all (local or remote). Commit + push often, and leave clear next steps here.
- LICENCE (DONE 550c1bd): the project's own code is Apache-2.0 (LICENSE, NOTICE, package.json). Third-party assets and iwantcheckmate's material keep their own terms (LICENSES.md). Never write MIT again.
- MIDAS TOUCH (m-art, DONE b26a0d5): gilded piece = the active set's own sprite (same box/silhouette), one #cm-gold SVG filter + glow for every type; QA tools/qa_midas.py. Also m-art: WLmt62Ll9Hs/vHVSgesfZ0o bots = Azeez/Emir/Vinh/Laura chess.com originals; built-in fairy pieces A C M F W G L I = chess.com art (assets/img/fairy, 2a8ac320). PIECE-ART SWEEP done (tools/art_sweep.py, all 503 at 390x844): fix list = end of research/BLURRY_SPRITES.md; staunton3d, HtNZ/cR6r dragons, 3Sr5 checker, nuke dedupe DONE (m3-art); 4XV3SBMQgXE mask, Kzt9ItpGtYg hero, WXcmWG7Eczs Q+Iq DONE (s5-art); 128 px / pixel lists DONE (m-art3). Left: vzNwF2BH8jg impostor (needs a clean frame), bust portraits (scp4975/oldman/reptile/despair, decide per video), HANDOFF #8 (s5-art RESUME).
- README (m-og agent): must read like a Steam store page and work as ADVERTISING: hero key-art banner, pitch, animated clips of standout modes (not just static screenshots), feature tiles, mode showcase grid, tag chips, play-now button, requirements box; dev/credits/licence compact at the bottom.
  - README REBUILD (m-readme, 2026-11-26 3:00 PM ET, DONE; owner 2:36 PM "README still looks not interesting enough"): store page with docs/media/hero.jpg key art (wall of video stills + Cinzel title + iwantcheckmate credit), image PLAY NOW + MIRROR buttons, tag-chip image, 6 feature tiles, 12 mode cards -> play/<slug>/, requirements table, compact credits/Apache-2.0 + iwantcheckmate footer; 6 captioned GIF clips (scp-4975, spell-chess, fps-chess, duck-chess, pac-man-chess, battle-chess; all <2.5 MB). Rebuild: tools/readme_art.py (static art), tools/readme_clips.py (board clips), tools/readme_media.py fps|battle|gunking + tools/readme_compose.py (caption, <3 MB). Checked on github.com (all images load, GIFs animate, no raw HTML). No README PROGRESS section existed. NEXT: Gun King clip (readme_media.py gunking records, but the king dies in wave 1 by frame ~14: add auto-fire/strafe smarter, then compose), a live Battle Chess recording on an idle box (current clip = slow push-in over real QA frames), old docs/img/readme removed.
- UI (m-ui): make the lobby + game chrome more interesting (premium game-hub feel within the chess.com Android look, no vibecoded styling). FIRST: the lobby had two separate sorting tab bars; merge into ONE.
  - m-ui status 1:45 PM: ONE TAB BAR DONE (f613cdb1, merged b18d8bff): #tabs = All + categories (+3D tag) | divider | every video type (global counts, most common first); old #kinds chip row removed; one option active at a time (type tab id `k:<type>` sets CM.lobby.kind, searches whole library); sort dropdown unchanged. Shots research/ref/m-ui/tabs_{before,after,after_type}_0.png + tabs_after_divider.png. "More interesting" UI NOT STARTED: next = (1) continue-playing row (localStorage, recent modes) on the home tab, (2) mode intro card before a game (title, opponent avatar+rating, rules summary from the spec), (3) css/game.css gamebar/pbar/status/side-panel polish + game-over modal with result art, (4) card press/lift states (~200 ms ease-out, reduced motion = none); judge each with 390x844 touch shots and tools/qa_scroll_jank.py at 4x.
- LOBBY SPLIT (owner 1:49 PM ET, top priority; m3-ui, DONE): "Recommended for you" and the randomizer were combined (shuffle button inside the recommended card + a "Random mode" quick row). Now two separate sections on Home: #hero = "Recommended for you / today's pick" (one panel card, thumbnail + name + Play, no shuffle) and #randomizer = "Random mode / any of the N" (shows the rolled mode's thumbnail, type and name, Roll + Play; never the same roll twice in a row). The Random quick row is gone (Play Stockfish stays). Also new: "Continue playing" shelf (localStorage cm.recent, last 10 opened, shown from 2 entries, Clear). Shots research/ref/m3-ui/before_home*.png vs after_home*.png (390x844 touch).
- FAMILY CHROME (owner 2:05 PM ET "Don't just do good vfx and UI for the horror, do it for the others"; m3-ui, DONE chrome side): js/ui/family.js gives every non-horror family a title strip on open, family icon + accent in the HUD, themed intro card and result screen (win art = family icon). In-board VFX = cm2-art. Shots research/ref/m3-ui/family/. Mode intro card (once per mode) + game-over result art + README store page also done (m3-ui RESUME in research/polish_report.md).
- SKINS (m-themes): more piece SKINS (visual sets only; NO new piece types, NO bot changes) and board skins, with a preview picker in settings. Open-licensed sets with licence rows; ALSO chess.com piece sets/boards the videos show (Neo etc.), listed in LICENSES.md as (c) Chess.com, not covered by Apache. Modes with their own video pieces/boards keep them.
  - m3-themes status 2:05 PM (DONE, ae54e4db + be1ad11d + this commit): 23 more lichess sets in assets/pieces/<set>/ (each with LICENSE.txt; LICENSES.md rows; licences read from lila COPYING.md free table at 917efac): maestro fresca cardinal icpieces gioco tatiana dubrovny california caliente anarcandy cooke monarchy(webp; PIECES[k].ext) minimal-warmth chessboart horsey xkcd (CC BY-NC-SA) / firi kiwen-suwi (CC BY) / shapes (CC BY-SA) / rhosgfx (CC0) / letter pirouetti pixel (AGPLv3+). Skipped: lila non-free table, governor + kosal (not in COPYING.md), mono + disguised (both colours identical). Boards: + marble, night, contrast (High contrast), sand, teal, rose; per-board hl (last-move/selected tint) + dot (legal dot/capture ring) as CSS vars --hl-last/--dot (css/board.css), mode boards keep defaults. Options sheet: live Preview strip (board + set + last-move/selection/dots/capture ring/check, own CSS vars), piece swatches drawn on the chosen board colours. Check: tools/m3_themes_shots.py (readability >= thresholds on all 16 boards + every set drawn; shots research/ref/m3-themes/ at 390x844); qa_ui 43/43. OPEN QUESTION (owner): Chess.com Neo pieces / board art NOT copied (proprietary Chess.com art; redistribution needs Chess.com's permission, a LICENSES.md note does not cover it). The Green board uses colour values only. Possible next: 'Show all sets' collapse if the 31-set grid feels long; per-set preview of all 12 pieces.
- 3D (m-3d, DONE 1:45 PM): Battle Chess look pass 2; Chess Arena CONozr99agQ + Table Tactics xvlHij1tgk8 now real three.js 3D (js/games/lift3d.js under the canvas game; tools/m3d_canvas3d_qa.py PASS). Next: real-phone fps/tap check of both, qa_battle3d desktop + full phone --slow rerun, Battle Chess bishop/king/pawn polish (m-3d RESUME).

- DARKNESS (owner report 2026-11-26 afternoon "All-Consuming Darkness is not accurate to the website or video"; agent darkfix, DONE): data/modes/BYg7rV53WrM.js rewritten to iwantcheckmate.com/challenges/dark (page script studied + 12-move hands-on) and the video (transcript + maxres2 frame): eyes fixed on b4, fuzzy merged blob from the site's dark_fuzz.png/dark_eyes.png, 200 ms fade-in, no pink candidate markers/flash/smoke/vignette/toasts, plain capture sound only when a piece is consumed, engine blind to the darkness, consumed king = confetti + loss with its own reason. QA: tools/qa_dark.py (390x844 touch, random play + forced king case) PASS, 0 console errors. Left as is: horror-cine trailer layer (title card/ambience, all horror modes). Next: owner look on a phone.

- UI "NOT VIBECODED + MORE STIMULATING" (owner 3:17 PM ET, s5-ui, FIRST PASS PUSHED): Home = featured banner montage of the video's own stills + big heavy title, flat cards, heavy section titles with family bar, poster-size Official challenges, ranked Most watched, hover/focus animated video stills (L.thAnim), filler subtitles gone; game chrome = family rule under the top bar, result card on the mode's key art. Shots research/ref/s5-ui/. Next steps in research/polish_report.md ## s5-ui (README stimulation next).

## SESSION 2026-11-26 12:20 PM-1:00 PM ET (history)
Each agent's exact next steps are its RESUME line in research/polish_report.md (sections m-qa, m-3d, m-art, m-art2, m-levels, m-ui, m-fps, m-sfx, m-og, all 2026-11-26).
Owner requests from this session (binding, check each is done):
- LOADING SCREEN (DONE ca2c8c2, 69b7c0b): loader = lobby thumbnail placeholder tile with a flat 2D pawn spinning on Y; >=1.3 s, waits for art/sounds/pieces/engine warm-up, 7 s cap; tools/qa_loader.py.
- START SOUNDS (m-sfx, check its commits/RESUME): match-start sound gets 3-4 subtle variants (no immediate repeat), a different cinematic/gamey start per mode family + standout modes, and extra mode sounds where the defaults feel off. Sound rules in this file still apply.
- LINK PREVIEWS + SHORT LINKS (m-og, check its commits/RESUME): og/twitter tags + 1200x630 image on index.html; every mode gets a readable slug (e.g. /ChessMaster/scp-4975/) with a static share page carrying that mode's title, description and image, redirecting into the app; old #/play/<id> links keep working; share buttons hand out the slug link. Generated from tools/build-data.mjs.
- VIDEO ACCURACY (IN PROGRESS: C9v7G3dJl7E built by m-accuracy; m3-salvage fixed P1 Roblox trio vcMhd5Vd1mM/dDtGI5U0HQk/ls3U1YKj9As + Infinite Craft jmdkuvE2ApQ; NEXT P1 = Chess Ultimate xRximnDlQtI + 4FRsSJoxMkE, then P2 rows of research/accuracy_audit.md): some modes are not video-accurate. Example: C9v7G3dJl7E "Once a Pawn a King" (Steam roguelike Once Upon a King) has NO mode (spec says playable:false). Build it from research/modes/C9v7G3dJl7E.json + frames (dungeon rooms, Pongement, white patrols that move first with order numbers, End Turn, Pull/Hop blessings with mana 50/room +10/kill, butcher army cap 2, keys/chests, tutorial + first rooms). Then audit every playable:false / video_game / low-confidence spec into research/accuracy_audit.md and fix by priority.
- PIECE ART STILL BAD (owner 12:58 PM): there are still pieces that are clipped, blurry, or not fully visible on the board. Run a full sweep: render every mode at 390x844, crop each piece square, flag clipped edges (alpha touching the PNG border), low-res sources (<256 px or upscaled), and pieces drawn outside or cut by their square; fix with clean >=512 px transparent PNGs centred at ~90% (owner art rules above). Record the list in research/BLURRY_SPRITES.md.
Done this session: m-art (f091a58, c46de40, 96561f3, e51eec9, c822dfa) ~40 bot avatars + Chaturanga/Amazon/Hawk/Grasshopper/XXL/Gothic/Seirawan fairy pieces at 512 px; Shotgun King wiki set verified exact. m-levels: Chessformer 28 levels proven solvable (433412b, tools/cf_bfs_verify.mjs); todo_pass2 is now EMPTY. m-3d: Chess Ultimate cutouts kept/fixed (9700e7e), staunton3d 512 px (7cedbb7, validate 0 errors), 3D audit batch 2 (Roblox table/sky, luxury, fly, abyss, dungeon), Battle Chess hall started. m-ui: loader, badges slide with pieces, SCP-4975 verified, scroll jank tool.
Open bugs/next: Abyss SMOXF1bSsDk tap selects but won't move (check on e6f63e0 first); Gabriel glitch above pieces; SCP-409 undo aura desync; Boiled One freeze; Jupiter Mg2Upjjo2yg map/sprites (steps in m-levels RESUME); Chess Arena + Table Tactics still 2D (videos are 3D); Battle Chess characters; FPS Chess (m-fps RESUME); 3 photo avatars unsourceable; WLmt62Ll9Hs/laura.png likely wrong; art passes art1/art2/art3 (m-art2 RESUME); full qa_all + desktop FPS/battle3d (m-qa RESUME).

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
1. **Full QA (s5-qa, IN PROGRESS 2026-11-26 3:40 PM ET):** `tools/qa_all.py --widths 390,360 --par 1` over all 509 modes is
   running resumably (cache `/workspace/work/s5_qa_res`, loop `/workspace/work/s5_qa_logs/run.sh`); 209/1018 runs at 3:40 PM,
   0 real failures. The m4-uiqa 3D/load timeouts all PASS on `--redo --par 1`; OvQYI_S5IZg 392 px was not real; Battle Chess
   IbRrzKtieqs only times out under box load (starts in 25 s, no errors). NEXT: let the loop finish (or rerun it), then
   `--report-only --results /workspace/work/s5_qa_res`, keep the s5-qa header in `research/qa_full_report.md`, fix real fails
   (small commit each). Still open from the old list: `tools/qa_fps3d.py --only desk1`/`desk2`, `tools/qa_cine/rmcheck.py` +
   `cine.py` on the 24 horror ids, `tools/qa_battle3d.py` desktop, owner listen test of SFX v5.
2. **Chess Ultimate 3D cutouts: DONE** (m-3d browser check + s5-3d re-check vs `research/ref/fin-battle/sheets/ref_cu.jpg`: KEPT).
   game-fx second-half presets (47 ids): vfxqa-tested by m-3d (94/94) + browser-checked DONE by s5-vfx (tools/vfxqa_presets.py: 47/47 0 errors, 0 leftovers; ring/banner glow removed).
   NON-HORROR IN-BOARD VFX batches b-g (s5-vfx, DONE): Pac-Man bite, Spell freeze/jump, Duck drop, Dice tumble, Wheel
   pointer flicks, Pawnbarian/Ouroboros/Gambonanza, Drawback reveal in `js/fx/game-fx-families.js` batch 2; QA
   `tools/vfxqa_fam2.py` (s5-vfx RESUME in research/polish_report.md).
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
6. **Jupiter 2011 (`Mg2Upjjo2yg`):** replace the map with the traced Skeld mask (`research/ref/fin2-jupiter/`,
   45x23, pod row 11 cols 42-44), crisp CSS squares, sprites matching the video (fin2-jupiter RESUME has exact steps).
7. **SCP-4975: DONE** (51d9c9e: HuZlhHnES7M in data/videos.json, mode renamed, FEATURED art = the video's maxresdefault; checked by s5-accuracy). Old note: the video is `HuZlhHnES7M` (16:12, 2026-11-26), not in `data/videos.json` yet; add it, point
   `icm-scp4975` (or a new mode file) at it, check board colours/sprite vs the thumbnail, read transcript 7:00-16:12 for
   edge cases, then point `FEATURED.art` at the video's maxresdefault (`research/ref/fin2-scp4975/`).
8. **Art still invented or weak:** (s5-art 2026-11-26 re-check) DONE: bot avatars AaHmMC3HA0E Trash Bot 1999/The Master, D8olpXjblQ0 Level 20, tfPyy36nwc4 Wendy/Miguel/Li, 9pHhqAbQS0s post-Azeez ladder (all chess.com originals at 512 px, earlier m-art/art-audit-b; no mode uses bot.svg any more, only the generic fallbacks in js/legacy/glue.js + js/modes/g6_ladder.js); Seirawan Hawk/Elephant (chess.com S-Chess art, deduped to assets/img/fairy for all 4 S-Chess modes, s5-art); Chaturanga elephant/counselor/chariot GuyllCIRcQI (chess.com, m-art); trout inm7KvllVu0 (site stockfish-profile.jpeg, fin-art-b); WLmt62Ll9Hs/laura.png = chess.com laura-bot (m-art); Kzt9ItpGtYg hero (press kit), 4XV3SBMQgXE mask (site art), WXcmWG7Eczs Q/Iq, vzNwF2BH8jg impostor, 06OeGk5Iu-s reptile (site lizard) (s5-art). LEFT: 3 photo avatars t8VWAr2UicA opp1/opp2, xAFkE7-Jp88 opp1 (no source); Chess Arena piece models; Gun King biomes; optional WXcmWG7Eczs set re-trace (tools/art_s5_wxcm.py works but drops the light-grey shading and thickens U_w's outline: add a shade colour per piece before applying); art passes art1/art2/art3 (m-art2 RESUME).
9. **todo_pass2: DONE** (m3-fps 2026-11-26): `p6W3yDU-v88` L37-L48 are the real 16x11 layouts, all 12 proven solvable by
   `tools/cf_bfs_verify.mjs`; promotion = top row (the video marks no squares); `grep todo_pass2 data/modes` = 0.
10. **Game chrome UI polish**: DONE by s5-ui (e00568aa nits + key-art result card / family rule). The Home scroll-jank
    part is DONE (s5-qa 076f5718: off-screen card thumbs `content-visibility: auto` + lazy family shelves; elements restyled
    8116 -> 2637, below df207f83's 3864; numbers in research/qa_full_report.md). Judge future Home changes with
    `tools/qa_scroll_jank.py --cpu 4 --steps 30 --trace` A/B (trace counts, not frame times, on a shared box).
11. **Known issues:** Boiled One (`xvibqyL-CqQ`) freeze not reproduced (root cause unconfirmed); SCP-409 solo undo can
    desync the aura; Gabriel's glitch can briefly draw above pieces; badges don't slide with pieces;
    `assets/sounds/lichess/` (AGPLv3) unused; Fairy-Stockfish is a custom single-thread WASM (no SharedArrayBuffer on Pages).
12. **DONE (s5-accuracy 2026-11-26):** smoke test of the 10391ba rule fixes: tools/qa_all.py --widths 390 --plies 6 --par 1 on
    BYg7rV53WrM, PDCuJf3SdRY, mwv48BWl2DY, 0rlkE-CYRoc, My1sUnkiNfU, eCC-U9w9RvQ, oJu13RUrGl4: all load + 7 plays, 0 console errors.
    (Random play only; a hands-on rule check vs the site was done earlier in 3a66dd5.)

13. **m3-salvage (2026-11-26) leftovers:** old rebuild clones agent-lowconf/agent-g5/agent-g4 are fully triaged (ported or
    rejected with reasons in research/polish_report.md "m3-salvage"); do not port from them again. Chess Ultimate P1 pair
    xRximnDlQtI / 4FRsSJoxMkE: DONE (m-accuracy 2, js/modes/cu_mage.js; see research/accuracy_audit.md); vcMhd5Vd1mM times out in tools/qa_all.py (35 s) though a
    direct 390x844 probe loads it with 0 errors; qqvbb2r2k5I closed in research/recheck_low_confidence.json (s5-accuracy: it was rechecked by recheck4, smoke 0 errors).

## Questions still open with the owner
- Staunty is non-commercial: switch to a free-licence default?
- Sound peak standard: older rule -6 dBFS peaks vs current builds at <= -1.2 dBTP true peak.
- DECIDED by the owner 2026-11-26 11:48 AM ET: chess.com avatars/icons that appear in the videos (Arthur, Neo-knight
  reserve icon, Elsa/Noel/Zara, ...) are COPIED, but cleanly: crisp transparent PNG, no baked background, no clipped or
  faded edges; find the clean original image online first. This replaces "never copy chess.com art" for anything the
  videos show (chess.com art the videos never show is still off limits).
- Speedrunner vs 3 Hunters (`UZ79sKLa6z4`): lock zoom too?
- Add the flat Minecraft and Roblox Survive modes to the 3D tab?

- [ ] Soko Chess (7lEglazTlo8) rebuild, owner: 'still shit'. Research DONE (research/modes/7lEglazTlo8.json `s5_soko_research_2026_11_26`); implementation NOT started. Next steps in research/polish_report.md `## s5-soko`.
