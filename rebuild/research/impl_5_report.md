# impl-5 report (group 5, research/impl_5.json, 88 ids)

Status: pass-2 finish in progress (Hark g5 finish session, 2026-11-25 from 9:15 AM ET; see "Pass 2 finish" at the end). Earlier: art pass done as far as the sources allow (art pass 5, ~2:00 AM ET).

## Art pass (owner 2026-11-24: all art copied from the videos)
Tools: `app/tools/g5_sprites.py` + `g5_sprite_jobs.py` (earlier crops), `app/tools/g5_frames.py` (cuts from the
1280x720 video stills i.ytimg.com/vi/<id>/maxres1..3.jpg; yt-dlp is blocked in the sandbox with 403/429),
`app/tools/g5_wire_sprites.py` (ships every research sprite of the group and wires it: piece img, opponent/ladder
avatar, or a 1.6 s start overlay of the video's own art).

- Modes shipping real video art: **61/88**. Every mode that has research sprites now uses them (0 unused).
- Invented art removed: tools/g5_art.py (hand-drawn pixel sets, troll/goose SVGs), Shotgun King pixel set +
  shotgun_king.svg, Pawnbarian cappy/horned_cappy/boss/hero SVGs, duck.svg, phantom/dragon/disc SVGs, stone.svg,
  the drawn FPS arena + gun SVG.
- Replacements: King of the Bridge pieces cut from M0rsyuvaTrk/WEYUcaJTBso stills (black R/N/B/Q/K = same sprite
  with the real black pawn's fill: inferred); Pawnbarian monsters from Kzt9ItpGtYg maxres3; FPS duel title card +
  Victorian room from the stills; Petrified stones = the chess.com piece greyed (as in both videos).
- Known gaps: Shotgun King white pieces (outline-only sprites, JPEG stills too noisy to cut) use the standard set;
  Chess Ultimate characters (devil/giant sprites are ~30 px blurs; group 4 is cutting CU art, reuse when pushed);
  Chaturanga chariot/elephant on-board crops too small to key; sounds are still synthesised (no audio source).
- The 27 no-sprite modes: video title card (maxresdefault) + chess.com bar avatar where the bar shows one (tools/g5_thumbcrops.py),
  plus game art where the video has any (g5_frames2.py: Roulette pixel set, Battle Chess cutscenes, Judit portraits, Hyper Chess,
  10,000 Player colours; g5_art4.py: Martin's Family ladder avatars). Most of them are plain chess.com/lichess variants whose videos
  show only the standard set, so there is no custom piece art to cut. Real video art: **88/88**.

## Art pass 4 (2026-11-25, tools/g5_art4.py; stills read from research/frames/video_thumbs first)
Owner 2026-11-25: use research/frames/sprites + research/frames/video_thumbs before YouTube; only fetch the exact still for an id
with neither. Stills used here are committed to research/frames/video_thumbs (boaA9_TjXeU, QrKIKcYN5m4, GQ6MT1m78Yo, JAz_qMQpI1o,
DMtaRFMpCWc); g5_art4.py reads that copy first.
- Ouroboros King (JAz_qMQpI1o, _RFXN1Ye3sY): King, General, Viking, Portal Mage, Rook, Knight, Reaper icons cut from the board in
  JAz maxres2; the other side = same icon with fill/outline swapped (as the game shows the General/knight; inferred for the rest).
- Thermopylae: Wildebeest (red bull head) + Nightrider (double knight; red = hue-shifted copy, inferred) from the thumbnail;
  Ways to Win card as the start overlay; chess.com bot icon on the Blue/Yellow bots.
- Stone Gravitation: ilikecheese bar avatar; the meme clip overlay (shown once at ply 16: timing inferred).
- Martin's Family: Martin M. Martin + Martin XIII ladder avatars (Jr., Marty, Martina are in no still).
- Pawnbarian: pink diagonal slash splash (from slash_ref) + '1 damage' text on every hero attack.
- Wizard Chess: board colours sampled from the still (tan #b98e59 / maroon #3e1229); Teacher (Minotaur) dialogue frame as the start overlay.

## Art pass 5 (2026-11-25, tools/g5_art5.py; owner-approved video frames)
Owner 2026-11-25: grab frames from the videos for art the repo stills don't show. Method: the browser opens the video on
youtube.com, sets 1080p, seeks, pauses, goes full screen, hides the controls and ENDS the task on that frame; the task's last
screenshot (get_browser_result -> last_screenshot_key -> download_artifact) is the 1920x1440 page with the 1920x1080 video at
y 180..1260. Only the LAST screenshot of a browser task is retrievable, so it is one frame per task (start_url must differ per
task, e.g. &t=<s>, or the dispatcher skips it as a repeat). No downloaders, no audio. 20 frames committed as
research/frames/video_thumbs/<id>_frame_<seconds>.jpg.
- Wizard Chess (DMtaRFMpCWc): dog, merc, javelina, druid, rogue (blue) + golden skeleton and guard cut from the 15:22 frame (no stat
  badges during the boss-reveal dialogue); the player's Guard = blue copy of the golden one (inferred); Cloaky = his cloaked sprite from
  the 1:58 dialogue scene (the magenta boss unit at 17:05 always has its ATK/DEF badge across the robe); Cloaky's "Conspiratorial
  whispers" dialogue box shown when the boss room starts (params.bossIntro, g5_wizard onStart). Skeleton Brute uses the golden Guard sprite.
- Ouroboros King (JAz_qMQpI1o, _RFXN1Ye3sY): Glass Queen icon from the _RFXN1Ye3sY 3:43 board (black = fill/outline swap, inferred);
  each video's own VICTORY banner (JAz 18:07, the pointer patched with the same banner pixels from _RFXN 19:25) shown on a battle win
  (params.victoryImg, g5_ouro onGameOver).
- Pawnbarian (Kzt9ItpGtYg): Goblin Caves monsters as round tokens cut from their cells (Spidertoad 11:43, Champion Goblin Shaman 15:40,
  Goblin Blightvessel + Blightsack 22:20; a transparent cut-out was not reliable: blight tint, claw notches and champion rings touch the
  outlines); new floor "The Goblin Caves" (Spidertoads, Shaman, horned Cappy Bears); the cantrip zap burst (11:43) plays with the slash
  on every hero attack. The "lightning attack" in the video is the cantrip card's bolt icon + this zap glint, not a separate bolt VFX.
- Thermopylae (boaA9_TjXeU): General, Sergeant, Soldier, Archbishop from the video's piece-introduction cards (1:05 Archbishop, 1:10
  General, 1:15 Sergeant, 1:38 Soldier; red); Green's General/Sergeants/Soldiers are hue-shifted copies (inferred).

## Art pass 6: research only, handed off (Hark g5f session, 2026-11-25 ~1:20 AM ET; owner called wrap-up)
No code changed. 3 frames committed (paused 1080p full-screen youtube.com frames, 1920x1080) + findings below.
- **Ouroboros Prince + Marching Pawn**: FOUND in the third Ouroboros video rf2HSTXTehE (in videos.json; group 6 mode). Recruit cards:
  `rf2HSTXTehE_frame_70.jpg` (1:10, Marching pawn card; auto-captions on at the bottom, icon unaffected) and `rf2HSTXTehE_frame_82.jpg`
  (1:22, Prince = laurel-wreath crown). Card icon sits at about (1395,240)-(1505,345) on both frames. Cut it like g5_art5.ouro() does
  the Glass Queen (abs_key(crop,30) + autocontrast + trim/square, black = invert_rgb, inferred), save as JAz_qMQpI1o/prince_w|b.png and
  marching_pawn_w|b.png, set img on JAz_qMQpI1o / _RFXN1Ye3sY pieces I and P (and rf2HSTXTehE Pr / Mp, group 6) and drop glyph/badge.
- **Ouroboros "Soldier"**: not a game unit. No transcript of rf2HSTXTehE / JAz_qMQpI1o names it (checked full transcripts); it is the
  rebuild's invented enemy filler ('u', K moves). Real enemy units in the videos are Bishops, Mage, Princess, Bowman, Viking, Pegasus
  Rider, Andromeda, Witch queen. Nothing to cut: either keep the badge or re-cast the fodder as a unit the video shows.
- **Passant special tiles (OO3XlFQ32i0)**: rules now known from the transcript + `OO3XlFQ32i0_frame_1078.jpg` (17:58, boss round):
  - *Unstable* = round-3 boss badge "Cracked Vase" (16:21-17:50): "When your pieces take, they become unstable"; an unstable piece
    "has a one in three chance to destroy itself when capturing any future piece" (not on plain moves). The frame shows a floating
    white bold "Unstable" label (dark drop shadow) over the piece at ~(760,210)-(900,300). It is a piece status, not a tile.
  - *Pink arrow tiles* = last-move trail: the squares the moved piece left get a pink (#ffdcf5) arrow pointing along the move
    (a7 and a5 for the pawn that went a7-a5 and slipped to a4), and the moved piece gets a pink ring (#ffdcf5, dark outline).
    Arrow cut box ~(555,310)-(665,420) on the frame (a7, dark square): keep r>180 & b>170 & g>120, rotate per direction in CSS.
  - Wiring plan (g5_passant.js): params.rounds[2].boss='Cracked Vase'; onMake: human capture sets piece prop un:1, a capture by an
    un piece is destroyed on a deterministic 1/3 (hash of ply/from/to, search must stay deterministic); decorate: arrow html on
    st.x.trail squares + ring class on the last 'to' square + "Unstable" tag on un pieces; scope CSS under body.m-passant.
  - The ARCHER (9:20) and "two for one" / field-promotion badges (9:31, 14:51) are shop items, not tiles.
- **Pawnbarian (Kzt9ItpGtYg)**, rules from the transcript:
  - Goblin Blightvessel (22:19-22:30): champion ("has to be the last one": immune while any other monster, sacks included, is on
    the board, 24:10-24:19), nimble (dodges the first attack), blight caller: "spawns a Blightsack on an empty adjacent square whenever
    any non-blight enemy dies"; sacks never spawn sacks (24:19). Plan: new type V (img blightvessel.png) on a 6th floor, e.g.
    'j1v1j/1s1m1/5/5/2H2'; onMake spawns J next to a live V when a non-J monster dies; add a `moves` hook that passes
    ({f:i,t:i,pass:1}, as g5_wizard does) when the monster side has no move, so lone sacks don't stalemate.
  - Blight Matron (tutorial boss, 5:13-6:00): after death spawns sacks on empty diagonally adjacent squares.
  - Promotion splash (16:25-16:35, 20:16): reaching the top row turns pawn cards into queens ("You just promoted one of your pawns into
    a queen", 1:56) and that queen "gives us diagonal splash". Plan: in afterMove, when hand P->Q play splash.png overlay on the hero +
    that toast; a capture with a promoted Q card also hits monsters diagonally adjacent to the landing square.
- **Wizard Chess (DMtaRFMpCWc)**: frames already in the repo (`DMtaRFMpCWc_frame_1025.jpg` 17:05, `DMtaRFMpCWc_maxres2.jpg`).
  Green rounded diamonds = the selected unit's move squares; magenta = move squares in reach of an enemy (inferred from maxres2).
  Plan (no engine change needed): decorate adds class g5wz-near to empty squares adjacent to an enemy; CSS `.sq.is-target` green
  (#7cff2a), `.sq.is-target.g5wz-near` magenta (#ff2bd6). Isometric view: in init add class to #board-wrap (remove in onExit), CSS
  `#board{transform:translateY(12%) scale(.7,.35) rotate(45deg)}` and on `#board .pc, #board .pc-badge` the individual properties
  `rotate:-45deg; scale:1 2; translate:-21% -21%` (these compose with the move animation's `transform`, so animation stays correct);
  hide .coord; tap input works through elementFromPoint. Not built or tested.

## Pass 2 (todo_pass2)
11 files carry todo_pass2. Art items left after pass 5:
- Ouroboros x2: Prince, Marching Pawn, Soldier icons: not in either Ouroboros video (transcripts name only the Princess; recruit/board
  frames show other units), so they stay standard pieces + badges until another Ouroboros video is sourced.
- Pawnbarian: Blightvessel art shipped but not placed (needs a second boss type with its own image in g5_pawnbarian); Blightsack art
  shipped but not placed (sacks spawn on deaths: needs a hook; a lone sack would stalemate the monster side); promotion splash trigger.
- Wizard Chess: isometric view and magenta/green move tiles (engine/hook work); Passant special tiles (rules unknown).
Non-art items (sounds/logic/UI) left as todo_pass2 in I07GcHQtY2o, M0Nr98Axpo8, Nz2A-g73_iM, OO3XlFQ32i0, QrKIKcYN5m4 (rules),
c-_Th-jjfyM and the files above.

## QA
Headless playwright at 390 px (/workspace/work/g5qa.py, sandbox only: open each mode, up to 4 random plies incl. drops
for placement-phase modes, console/page errors, local 404s, horizontal overflow). 2026-11-24 11:05 PM ET re-run:
**88/88 load and play, 0 console errors, 0 local 404s, 0 overflow** (the earlier "28/88" line was stale). 2026-11-25: modes changed
in art pass 4 re-checked with tools/qa_all.py --par 1 at 390 px: 8/8 OK, 0 console errors.
2026-11-25 ~2 AM ET: art-pass-5 modes (DMtaRFMpCWc, JAz_qMQpI1o, _RFXN1Ye3sY, Kzt9ItpGtYg, boaA9_TjXeU) re-checked with
tools/qa_all.py --par 1 at 390 + 360 px: 10/10 OK, 0 console errors, 0 missing assets.
Not yet covered by that smoke test: the FPS duel overlay (only fires on a capture) - dedicated QA path in progress.

## Pass 2 finish (Hark g5 finish session, 2026-11-25 from 9:15 AM ET)
Already built before this session (commits 66ef87a, b56577f, 59849ad, 486afc1), verified here: Wizard Chess isometric view +
green/magenta move tiles; Passant Cracked Vase / Unstable + pink arrow trail; Pawnbarian Blightvessel floor + Blightsack spawns +
promotion splash; FPS duel controls; Ouroboros Prince / Marching Pawn icons.
- **QrKIKcYN5m4 Stone Gravitation: rules confirmed.** It is chess.com's 'Stone Gravitation' (formerly 'Locked', RALRAL3333, 2019):
  standard rules from a locked custom start position. FEN `6nk/3p2pr/p2Pp1pb/p2pP1p1/Pp1Pp1P1/1P1pP3/NR1P4/KNB5 w` from the variant's
  own tournament page (chess.com/tournament/locked-custom-position), matches both stills; Red moves first (transcript 0:12), queen
  promotion allowed (3:35). You play Red (game 1). Promoted pieces keep their army tint (per-square CSS).
- **boaA9_TjXeU Thermopylae: play as Green.** 'Play as Red / Green' picker in the info pane (stored per device); as Green, Red is the
  online opponent (search bot), Blue/Yellow stay the check-happy random bots; Green wins by surviving 72 Red moves or by a bot taking
  its General.
- **c-_Th-jjfyM War for Throne: 3|2 clocks for all four players** (row of four chess.com-style clocks under the board; a bot whose flag
  falls is eliminated, your flag ends the game) **+ end-of-game placement table** (1st-4th by points) in the game-over card.
- **I07GcHQtY2o Chess Ultimate ranked:** BAN phase (each side bans one of the 15-30 pot, banned for both: inferred), 100-point draft
  (score shown as '067 / 100' like the video's '096'), 58 s turn timer on the clock (reset every turn; random move on timeout,
  inferred), SPAWN MINION / UNIQUE MOVE button under the board for characters with an ability (highlights the ability targets and
  restricts the next move to them). Pits kept after a custom draft.

## art-g5 verification (Hark art-g5 session, 2026-11-25 10:28-10:45 AM ET; owner scope: Pawnbarian, Wizard, Passant only)
No code change was needed: all three art/visual items were already built (66ef87a Wizard, b56577f Passant, Pawnbarian in
g5_pawnbarian.js) and survived the later pass-2 commits (f4f95cc Pawnbarian card hand, 98bdd9f Passant shop, 0447468 Wizard stats).
Each was checked in headless Chromium at 390 px by driving the live controller (CM.gameUI.controller) and looking at the screenshot:
- **Pawnbarian Kzt9ItpGtYg: DONE.** Blightvessel floor ('Goblin Caves: the Blightvessel', 6th floor) shows the Blightvessel token
  (blightvessel.png) and Blightsacks (blightsack.png); a queen-card capture of a non-blight monster next to a live Blightvessel
  spawned a sack (x.sacks) and the promoted-queen diagonal splash killed the diagonal neighbour (x.splash); the Blightvessel stayed
  immune (champion). Lone-sack pass move present (moves hook), so the monster side cannot stalemate. Promotion splash overlay + toast
  on P->Q in afterMove. (zP9TzlgA-W0 Golem Fortress has no Blightvessel in its video; its own hooks are cm-g6b's.)
- **Wizard Chess DMtaRFMpCWc: DONE.** Isometric diamond board with upright sprites; tapping a unit gives green move tiles (5) and the
  magenta g5wz-near class on squares next to an enemy; tap input works (onTap through the rotated board).
- **Passant OO3XlFQ32i0: DONE.** Pink arrow trail on the squares the last piece left + pink ring on the mover (17:58 frame); round 3
  'Cracked Vase' boss: capturing pieces get the floating white "Unstable" label, deterministic 1-in-3 self-destruct on later captures.
- g5 todo_pass2: 0 of 88 files carry it now.
- QA: tools/qa_all.py --ids Kzt9ItpGtYg,DMtaRFMpCWc,OO3XlFQ32i0 --redo --par 1: 6/6 ok (390 + 360), 0 console errors, 0 local 404s.
- Sandbox Chromium (playwright 1.5x, chromium_headless_shell-1255, Debian trixie arm64): the five libs from HANDOFF come from
  deb.debian.org/debian/pool/main/{a/at-spi2-core (libatk1.0-0t64, libatspi2.0-0t64), libx/libxcomposite, libx/libxdamage,
  libx/libxres}; `mkdir -p /tmp/libs/root` before `dpkg-deb -x`.
