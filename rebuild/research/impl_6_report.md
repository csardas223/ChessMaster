# impl-6 report (group 6, Variants C): status at 2026-11-24 10:55 PM ET

## Pass 1
- 87/87 ids in research/impl_6.json have app/data/modes/<id>.js (Table Tactics xvlHij1tgk8 is a js/games mini-game).

## Art pass (owner direction 10:13 PM ET: copy the videos' art, no invented art)
- **68/87 modes ship real video art** (png/jpg under app/assets/modes/<id>/ referenced by the mode file). Every group-6 video that has sprites in research/frames/sprites/<id>_*.png now uses them (coordinator audit: 0 left).
- Sources: research/frames/sprites (tools/g6_sprites.py: keyed/trimmed pieces, avatars, cards) and real video frames from YouTube thumbnails maxres1-3 / maxresdefault (tools/g6_thumbcrops.py: Earth Day animal portraits, Advanced-bot portraits Pablo/Arthur/Lorenzo, GothamChess, villager piece, KotB troll cut-out + cobble backdrop, Pac-Man ghosts, Petrified stone tile). tools/g6_wire_art.py wires cards (the video's title/intro art shown 1.6 s at game start; win cards for Giveaway/Knightmare), hill tiles, stone walls, Chaturaji boats, Cornered Kings yellow/red kings.
- Deleted invented art: King of the Bridge 1-bit px_*.svg set + swamp.svg + troll.svg, villager/ambush/stone/wheel SVGs, tools/g6_art.py (generated them). Spell Chess potion buttons (js/modes/g6_spellc.js) now use the video's potion crops instead of a drawn SVG.
- Small shared-engine changes (commented "impl-6" in js/game/spec-game.js): `board.squares.<sq>.image` (+opacity) draws a video image on a square; no CSS colour tint on pieces whose type ships its own art for that colour. Walls with art use `pieces['#'] = {..., overlay: null, img}`.
- Still without video art (19, no sprite exists; chess.com-look online games vs humans, standard art is what the video shows): f4O--Ai7B9A, hN-WkBw_PRs, hVOA_oScEBQ, iUUoeJL1FvY, jXOg1Py4EoA, nFY-Hn6xiOI, nXpanP8v3pg, piiE6JB8pWw, q_153NJxO1M (uses the potion crops via g6_spellc), qfHZlae8XVU, rcFGwuREQFY, smg98qv_xa0, t8VWAr2UicA, tH7eOK3Lr1A, tVAelwglnH8, xAFkE7-Jp88, xim3ocTGn4E, xt4blnOS3m8, yXE14E0QKNI. Roblox (jXOg1Py4EoA) and Choice Chess (rcFGwuREQFY) would benefit from frame crops.
- KotB x3 now use the game's pixel piece set cut from the video stills (shared from WEYUcaJTBso, group 5 tools/g5_frames.py).
- Known gaps: KotB gong/laugh .wav and Table Tactics .wav are synthesized, not the video's audio (yt-dlp is 403-blocked from cloud IPs, so no real audio/frames beyond thumbnails). Wendy (tfPyy36nwc4 first bot) and Earth-Day-style portraits for bots not on a thumbnail fall back to the generic avatar. Generic chess-piece glyph+badge pieces (Passant Empress/Amazon, Ouroboros, Pawnbarian, XXL fairies, Hawk-less Seirawan Elephant) still need crops from real frames.

## QA
- node tools/build-data.mjs --check OK. Headless at 390px (playwright copy of tools/test_browser.py with an HTTP 4xx listener for local assets): all 68 changed modes load and play 4 random moves, 0 console errors, 0 missing assets. 'no moves' for pGVRaaLnMAY (Ambush) and vqxA5bBUoVA (Setup Chess) is expected: they open with a drop/setup phase the harness does not play.

## todo_pass2
- 29 group-6 files still carry todo_pass2 notes; these are rules/VFX items (shops, real level layouts, time travel, etc.), not art.

## Eighth session (impl-6, 2026-11-24 11:25 PM - ET), resume notes
- YouTube is captcha-blocked for the sandbox (curl and headless Chromium), so 'real frames' = i.ytimg maxres1-3 stills + maxresdefault. Owner: no audio extraction; mode sounds stay synthesised.
- The 19 no-sprite online modes now copy what the stills show: opponents' chess.com avatars/names/ratings per game (`params.series` = {opponents, boxes}; rotation + 1-5 win boxes in js/game/spec-game.js 'impl-6' comments; 30 avatar crops, tools/g6_series_art.py), the ireallywantcheckmate purple-king player bar, Cloister rebuilt from the frames (4x4 checkerboard of wazirs, the video's wazir + stone-brick art, magenta move squares, 1+0), Tiny Chess army/art from the frames (dragon knight, wazir, spiked ferz; tools/g6_piece_crops.py), Choice Chess opponent Ch1knW4ng. Kept standard look (genuinely what the video shows; no further on-screen art): iUUoeJL1FvY (infinitechess.org, no opponent bar), jXOg1Py4EoA (Roblox 3D; board colours + Victory card only, the cloud sky is cluttered by characters), hN-WkBw_PRs (FICS text handles, no avatars).
- todo_pass2: h7UFq4r59tM per-player 4PC clocks (60+7, g6_4pc params.clock4). Passant x4 cleared via the new g6_levels run layer (SHOP between rounds with pieces/coins/Push+Slippy badges, Re-roll $2, Stage Select Standard/Challenging/Skip, 3 undo charges, Player Turn banner, smoke on capture, +$ payout, AI difficulty picker on dztzDlPfqSI, arrow/unstable tiles on dkCM round 2). Gaps: Passant's own 3D piece set is only partly visible in the stills (fairy pieces keep glyph+badge); coin effects beyond the spec's pawn/money coins and the tile squares are inferred.
- Remaining todo_pass2 (15 files): iqfHW2_sMmc, zDFsnRE_Gig (Who Takes the Crown platformer), oAoik9Dj2qQ, p6W3yDU-v88 (Chessformer levels), pzxXxIsKRRo (Shotgun King), qDkxrnZfeXw (Anarchy), qSwTtgUWqUw (Tiny 5D), qqvbb2r2k5I (Gambonanza), rf2HSTXTehE (Ouroboros), sGXmiyvZDE4 (Petrified Pawns), sO-lD2On610 (Pac-Man), spJibM5qaNQ (Survivors), xlErokL2-4c (Beyond the Board), zP9TzlgA-W0 (Pawnbarian), zxRM5dD5b7w (Knightmare). The g6_levels shop/stages layer (params.shop, stages, undos, banner) is reusable for Gambonanza / Shotgun King / Pawnbarian / Survivors / Ouroboros.
- QA: `python3 tools/qa_all.py --ids ... --results /workspace/work/qa_g6/res --port 8776` (own results dir/port; first cold run can time out at 390px, --redo passes).

## Art pass 2 (art-g6, 2026-11-25 00:00-00:35 ET)
- Video art: 87/87 group-6 modes reference real video art (85 from their own assets/modes/<id>/, puKYAUl9x9s + ulE3YPZI9Sc use the shared KotB pixel set from WEYUcaJTBso). Only remaining generic image: assets/avatars/bot.svg for Wendy in tfPyy36nwc4 (no sprite, no repo still, not on any YouTube still) and the g6_ladder fallback.
- New tool app/tools/g6_art_pass2.py (repo first: research/frames/sprites + research/frames/video_thumbs; YouTube stills only when the repo lacks them). Wired: Chessformer x2 (oAoik9Dj2qQ, p6W3yDU-v88) blue player set, red king, green platform block, padlock tile, board colours sampled from the frames; Pawnbarian hero + 2 monsters; Chess Survivors Joker, salmon pixel enemies, peg projectile on the Cribbage shot, title card; Who Takes the Crown x2 white pixel N/B/R/Q (promotion-dialog sprite, black outline restored) + crowned-pawn start card / crown win card; Ouroboros King (rf2HSTXTehE) unit icons shared from g5's JAz_qMQpI1o cuts, pink enemy zone, Ouroboros Queen boss face; Anarchy baby-face pawns; Gambonanza boss portrait; Pac-Man pellet/ghost item was already done (cleared).
- Note: the stills for oAoik9Dj2qQ, p6W3yDU-v88, zP9TzlgA-W0, spJibM5qaNQ were fetched from i.ytimg before the owner's 00:07 rule (repo first); they are now stored in research/frames/video_thumbs so nothing needs YouTube again.
- todo_pass2: 15 files still carry notes, all rules/logic/sound except these art items with NO repo source (no sprite / still shows them): Shotgun King white army + muzzle flash (pzxXxIsKRRo), knook + anti-queen pieces (qDkxrnZfeXw), Marching Pawn / Glass Queen / Prince icons (rf2HSTXTehE), Petrified dungeon tileset + units (sGXmiyvZDE4; sprites are 3D scene crops, not cleanly cuttable), Knightmare knight/rock (zxRM5dD5b7w); plus rendering items that need engine work: 3D tower look (iqfHW2_sMmc, zDFsnRE_Gig), 3D floating platforms (xlErokL2-4c), 5D timeline strip (qSwTtgUWqUw), black void holes in Chessformer layouts.
- QA: tools/qa_all.py --widths 390 on all 11 changed modes: 11/11 ok, 0 console errors, 0 missing assets.

## cm-g6b (2026-11-25, group 6 part B: todo_pass2 of qDkxrnZfeXw, qqvbb2r2k5I, rf2HSTXTehE, sO-lD2On610, spJibM5qaNQ, zP9TzlgA-W0, zxRM5dD5b7w; pzxXxIsKRRo already had none)
- qDkxrnZfeXw Anarchy: knook / anti-queen art declared impossible from the repo (only the jester-hat icon + underage pawn sprites, no video_thumbs; YouTube stills not allowed for an id with sprites); glyph + badge kept, reason in source.notes. todo_pass2 removed.
- zxRM5dD5b7w Knightmare: real time (turn handed back after your move; enemy moves on a per-level timer, the chosen piece wiggles 450 ms first; AI takes you / attacks you / random), red danger + green safe squares on your reachable squares, one Rock per level in hand (tap or right click; can't be taken, can't take), overworld map (padlock / cow / trophy tiles from the sprites, progress in localStorage), 3-level bracket (a loss sends you back to its start), knight-sequence memory minigame (best score kept). Knight / Rock art impossible (no repo source). todo_pass2 removed.
- sO-lD2On610 Pac-Man: Blue (out, its pieces are the pellets) + Green (bot seat, shows its last attacking/random move) chips in the top player bar; Red/Yellow keep their 3+2 clocks. Bonus real Pac-Man (13:50-15:15 of the transcript) on the video's own maze (board walls + stone tile), the video's ghost sprites, power circles on the general squares (frightened ghosts, eaten ghosts released back from the house), level up when every point is eaten, 3 lives; arrows/WASD/swipe/buttons; chess clocks frozen while it is open. Which pellets are generals: not readable from any repo source (measured the 250 px maze sprite per cell: no separable shapes), left inferred and noted in source.notes. todo_pass2 removed.
- Art items (owner: art first): Survivors movement coin + key cut from maxres3 (tools/g6b_surv_art.py; rook/knight/queen coins re-made from the coin disc + the video's own pixel silhouettes), wired on the coin pieces and above the giant pawns (key overlay on the kill); golden chest not on any repo still -> impossible, noted. Gambonanza pixel-art set + UI and the Ouroboros Fool icon: impossible from repo sources (checked every sprite/still listed in source.notes), noted and removed. Cut for the logic pass: Pawnbarian loot row (bag, crystal, nugget), upgrade icons (cardinal +, diagonal x, shield, cantrip), full/empty heart, end-turn chevrons, spark bolt (tools/g6b_pb_art.py, maxres2/3); Ouroboros relic icons (sigil, alarm bell, finisher, wings), rewind item, gold, map icon, draw-offer handshake (tools/g6b_ouro_art.py, rf2HSTXTehE_frame_82 + _RFXN1Ye3sY_frame_223).
- zP9TzlgA-W0 Pawnbarian: own hooks (no longer extends g5_pawnbarian): card upgrades (shield / diagonal splash / cardinal splash / cantrip) on each card, draw pile -> hand of 3 -> discard pile with reshuffle (Deck / Discard panels with the video's upgrade icons), spark traits after cantrips and per Spark Imp death (Knight Golem aegis + surge, Coil surge, Cappy spark walk, Spewer blight blast / spark immunity / puppeteer / moves twice leaving blight, nimble dodge per turn incl. splashes), per-monster targeted squares with red notches + damage numbers (Imp = whole row/column from maxres2), shields absorb, end-turn chevrons, hearts row, loot row (bag with run gold, heart crystal, nuggets; rightmost lost each turn), shop with hearts / cards / upgrade offers / discard a card, board colours from maxres2. Dynamic actions via V.rules.movesPerTurn set in onMake (mode-local). todo_pass2 removed.

## cm-g6a (2026-11-25, group 6 part A: iqfHW2_sMmc, zDFsnRE_Gig, oAoik9Dj2qQ, p6W3yDU-v88, xlErokL2-4c, sGXmiyvZDE4, qSwTtgUWqUw; + Roblox jXOg1Py4EoA 3D)
- Shared 3D (owner-approved 09:27 ET): three.js r170 vendored as js/vendor/three.min.js (esbuild IIFE -> window.THREE, MIT licence
  alongside), js/fx/scene3d.js (CM.scene3d.attach/detach; slab board, lathe Staunton pieces or sprite art, eased camera, raycast taps ->
  SpecGame.onTap, reduced-motion snaps, null = 2D fallback without WebGL). Documented in app/ARCHITECTURE.md section 14.
- qSwTtgUWqUw: no todo_pass2 left (timeline strip done in g6_tiny5d by the earlier g6a pass); nothing to do.
- Transcripts: analyze_video returned 429 for every id this session; video frames read through the browser instead (see below).

## art-g6c (2026-11-25, from 10:30 AM ET; owner: exact YouTube frames allowed when no repo sprite/still exists; scope: Shotgun King, Anarchy, Ouroboros icons, Knightmare)
Frames: paused 1080p full-screen youtube.com frames, one browser task per frame, committed as research/frames/video_thumbs/<id>_frame_<s>.jpg (1920x1080). Cutter: app/tools/g6c_art.py (jobs fool, anarchy, ...).
- DONE Ouroboros Fool (rf2HSTXTehE / JAz_qMQpI1o / _RFXN1Ye3sY): jester-cap icon from the Fool recruit card at 1:49 (rf2HSTXTehE_frame_109.jpg, box (1390,230)-(1510,345), cut like the Prince); black = fill/outline swap (inferred). Wired on Fo / L in all three modes. Prince, Marching Pawn, Glass Queen were already done (g5 art6 / g6b).
- DONE Anarchy (qDkxrnZfeXw): knook (white c1, black c10) + black anti-queen (i10) cut from the 1:42 board (qDkxrnZfeXw_frame_102.jpg; board x 173..1192, y 23..1042, 10x10). White anti-queen is covered on both frames (pointer at 1:42, ~85% opaque orange arrow at 1:58 = _frame_118.jpg), so it is the black cut with the white fill (shape exact, tone inferred). The 1:42 frame also shows the real back rank (R N Knook B jester K B coin anti-queen R) - jester/coin pieces unnamed, start position not changed.
- DONE Knightmare (zxRM5dD5b7w): crowned white knight, the Rock (grey stone with a stained-glass window) and the black army (K Q R B N P) cut from the 6:28 level frame (zxRM5dD5b7w_frame_388.jpg; board x 551..1367, y 137..953, 102 px squares); level board colours #fdf89d / #a4630f (the old green/brown were the overworld map, frame 3:26 = _frame_206.jpg); red/green square tints replaced by the video's red/green dots. White K/Q/R/B/P (tutorials, promotion) not on a frame taken: standard set.
- QA (390/360, --par 1): qDkxrnZfeXw, rf2HSTXTehE, JAz_qMQpI1o, _RFXN1Ye3sY, zxRM5dD5b7w 0 console errors, 0 missing assets.
- NEXT (in progress): Shotgun King white army + muzzle flash (pzxXxIsKRRo; transcript: floor 1 at ~1:43, shot at the king ~3:57, floors ~4:09, 7:51, 11:21, 13:20, 15:30; 1-bit purple/cream pixel art). Plan: frame on a floor start for the white pieces, a frame right after a shot for the muzzle flash; cut into assets/modes/pzxXxIsKRRo/, set img on the white pieces (g4_shotgun lib is read-only: wire via the mode file's pieces/vfx).

## art-3d (2026-11-25 10:30-10:55 AM ET): 3D looks for iqfHW2_sMmc, zDFsnRE_Gig, xlErokL2-4c - DONE
- Commits: b975c47 (WTTC x2 + shared js/fx/g6_3d.js + scene3d options), b550733 (Beyond the Board).
- Frames (browser, full-screen paused, captions off; stored in research/frames/video_thumbs): iqfHW2_sMmc_t1230_summit_crown.jpg (~12:30,
  summit board + crown; the 1:03/5:00/10:03/11:57 views were read in the same session), zDFsnRE_Gig_t0501_tower.jpg (5:01, stacked boards in the
  olive/wood room) + zDFsnRE_Gig_storyboard_M2.jpg, xlErokL2-4c_t2005_final_boss.jpg (20:05) + xlErokL2-4c_storyboard_M6.jpg (0:40, 3:58, 9:17,
  12:22, 14:38 were read in the same sessions).
- Who Takes the Crown (CM.g6_3d.tower): the boards stand upright and stack edge to edge, seen face-on (S.root rotated 90 deg). Live floor =
  orange #c1552f / brick #912213 (sampled), cleared floors grey #b4a998/#6e675a with the red MATED plate + padlock, upcoming floors show their
  start position, summit board cream #f8d6ad / #98836a with the game's crown (assets/modes/<id>/crown3d.png, cut from the summit frame; the
  leaderboard name on its ribbon painted out). Flat piece sprites (pixel N/B/R/Q + cburnett), teal #1f9e86 last move, plum #5a2f3d void
  (Influencer) or olive #646130 wall + wood #682708 wainscot (Famous), drifting debris, 'x ft' + stack label HUD, white pawn climber that does an
  eased super jump to the next floor after a cleared floor (camera follows, 1.1 s; snaps under reduced motion). Height in feet is inferred
  (~51 ft per floor, the video reads 33.86 / 42.30 / 50.70 ft over boards).
- Beyond the Board (CM.g6_3d.beyond): every gameplay frame is greyscale, so the old lime board (thumbnail key art) became #c6c6c6 / near-black
  #111112 on 7-unit black blocks into a #2b2b2e fog, stepped platform heights by rank band (visual only, rules unchanged), reachable squares
  glow white (the frames' lit path), red rings under enemy sentries, black king with a red glow / crimson Eldritch King on the last level,
  blocker squares = black pillar blocks, slow rising embers. Camera rotate: corner buttons, right click, Q / E (eased 90 deg). Level 1: opening
  board with the wooden frame on the light-grey cyclorama + floating chess clock sprite (0:40). Platform layouts themselves are still the
  pass-1 invented layouts.
- Shared: scene3d gained spriteFallback 'glyph' (file:// draws flat glyph sprites, canvas text never taints WebGL), spriteScale/spriteLift,
  board.basic (unlit flat squares), lastColor/lastOpacity; g6_levels exposes runLevel(ctx). Documented in app/ARCHITECTURE.md section 14.
- QA: tools/qa_all.py --ids iqfHW2_sMmc,zDFsnRE_Gig,xlErokL2-4c --redo --par 1: 6/6 ok (390+360), 0 console errors, 0 missing assets.
  Own Playwright check at 390px with SwiftShader: 3D canvas attached on every level, a raycast tap on the canvas selects a piece and a second
  tap makes the move (iqfHW2_sMmc floor 4, xlErokL2-4c level 4).
- todo_pass2 removed: '3D tower of stacked boards look, crown at the top' (x2), '3D floating-platform look over the void, camera rotate'. Left
  (logic/sound, not built): WTTC platformer climb, jump counter, stack picker; BtB kidnapping cutscene, tick-counter buttons, Eldritch hexagon
  counter + beam, wall-symbol hints, sinking hymn music.
## art-g6b (2026-11-25 ET, remaining group-6 art: Petrified Pawns, Gambonanza, Survivors chest, Chessformer void look)
Frames: paused 1080p full-screen youtube.com frames, one browser task per frame, committed as research/frames/video_thumbs/<id>_frame_<s>.jpg
(1920x1440 page, video at y 180..1260). Cut-outs of 3D-rendered pieces use rembg u2net (`pip install rembg opencv-python-headless`; the model
downloads once) on a 3x upscale; isnet models were worse.
- DONE sGXmiyvZDE4 Petrified Pawns: tools/g6b_pp_art.py from frames 21 / 192 / 471. You play the video's DARK pieces (green bars), monsters
  are the PALE ones (red bars): w = dark King/Rook (+ Knight from the repo thumbnail sprite), b = pale pawn/knight/bishop/rook/queen; board
  texture = two of the video's stone floor tiles perspective-warped top-down; walls = its stone-brick wall. Inferred: your Pawn and promotion
  Queen/Bishop (no dark one on screen) = pale cuts re-shaded dark. todo_pass2 art item removed; rules items (real time, HP, mana, spells) stay.
- DONE oAoik9Dj2qQ + p6W3yDU-v88 Chessformer "black void holes": in-play frames oAoik9Dj2qQ_frame_29 (Level 21), _frame_547 (Level 27)
  and p6W3yDU-v88_frame_149 (Level 39) show NO black cells during play; the black squares in the maxres2/3 stills are only the
  level-intro wipe. js/modes/g6_levels.js dissolve() now draws that wipe like the stills (whole black cells vanishing at random,
  white regular-weight "Level N", thin black outline, ~1/8 board high). Those three frames show full real layouts (16x10 + floor,
  pipes, thin ledges, keys, padlocks, '?' choice pieces) for whoever transcribes the real levels (todo_pass2 rules item, still open).
- DONE spJibM5qaNQ Survivors golden chest: cut (with its white down-arrow marker) from the 20:15 frame spJibM5qaNQ_frame_1215
  (tools/g6b_chest_art.py; frame_885 = 14:45, same chest mid-flash, kept as reference), shown on the "Golden chest! Pick a relic" panel.
- IN PROGRESS (not wired) qqvbb2r2k5I Gambonanza pixel-art piece set / UI. Frames committed (research/frames/video_thumbs/qqvbb2r2k5I_frame_<s>.jpg,
  1920x1440 page): 42 (0:42 stage 1 in play, 5x5 board, cells ~108 px from x 686 / y 446: wR (1128,530,1220,640), bP (690,652,790,758),
  wK (688,758,792,860)), 539 (8:59 Judit boss: skull king (915,570,1000,665) = Sk, bB (905,660,990,750), wK x3, wB in the left stock bar),
  1003 (16:43 formation phase: hatched enemy tiles, "Prepare your strategy!", Pieces n/5 + GO!! panel, Stage/Game box, Incoming Boss card),
  1168 (19:28 formation), 1193 (19:53 stage 2 in play, 6x5 board: purple-haired copycat = Cp, bP x4, wK x2, wQ x2 in stock, gambit icons
  in the right bar), 1317 (21:57 Mech Magnus: bR (805,575,875,662), skull knight (880,640,960,750) = Sn, bP (720,665,800,745),
  wQ (1045,665,1135,745), wK (885,920,965,1005)), 225 (3:45 formation, knight on hatch). Plus i.ytimg maxres1-3/maxresdefault.
  Method for the next AI: crop each box, flood-key border-connected pixels with luminance > ~60 (the pieces have a closed near-black
  outline; board cream ~#f0dcb4 / maroon ~#8b4a55, CRT scanlines), keep the largest component, square + NEAREST scale; wire as
  pieces.<T>.img {w,b} in data/modes/qqvbb2r2k5I.js. Not on screen in any frame: plain black K/N/Q, white P/N (recolour the opposite
  side's cut = inferred, note it). Board colours in the mode (#ffffff/#7e4e8a) are WRONG vs every frame: use cream/maroon sampled from
  frame 42. Also seen: stage 1 board is 5x5 and stage 2 is 6x5/6x6 (mode infers 6x6/7x7: rules item); backgrounds = dark with maroon
  (stage 1) / gold (stage 2) splotches, Judit's red wave pattern + geisha, DEEP BLU monitor with bone arms; bottom bar Crumble Mode /
  Wait 3/3 / Your turn!, $ box top right, Info + pause buttons, stock bars left/right.
## g6-3d logic pass (2026-11-25 ET): WTTC x2 (iqfHW2_sMmc, zDFsnRE_Gig) + Beyond the Board (xlErokL2-4c) - DONE
- Logic in js/fx/g6_3d.js (+ rule hooks in data/modes/xlErokL2-4c.js, runSetLevel in js/modes/g6_levels.js); sounds = our own
  synthesised WAVs (tools/g6_3d_sounds.py: jump, superjump, land, fall; beam, button, kidnap, sinking_hymn), never video audio.
- WTTC: a checkmate grants a super jump (HUD 'Jumps N' + 'need N' = 0-1 search over the ledges); the white pawn climber walks /
  jumps / super-jumps up the face of the next board (pieces = one-way ledges, seams = floors, side brackets mid-board, fall off
  the side = drop a floor); 'Replay board' (or New game / Undo mid-climb) replays the cleared board for another jump; the summit
  super jump to the crown shows 'You Take the Crown!'. zDFsnRE_Gig: Stacks picker Famous / Influencer / Random #seed (seeded
  random openings, same seed = same tower, remembered in CM.store). Inferred: physics numbers, ledge model, bracket ledges.
- BtB: kidnapping cutscene after the first check (pieces dragged up, king flees over the edge) -> rook levels; abyss squares;
  switches with a tick counter over the rook (bridges rise / sink, boss switch lifts the Eldritch King); Eldritch hexagons 0-4
  then a beam along rank/file that destroys the first piece it meets (hide behind its rooks); wall-symbol hint buttons; sinking
  plank cutscene + looping hymn from level 3; death respawns the level; final win modal. Layouts are ours: tools/btb_solve.js
  finds a line for every rook level (2, 5, 5, 7 moves).
- Fixed in this pass: the climb pad / keys stayed on screen while a floor was replayed (covered rank 1 of the board); undoing a
  won level skipped a level on the next win (g6_levels had already advanced the run) -> CM.g6_3d.undo via the mode files'
  onUndo hooks (WTTC: undo mid-climb = replay; BtB: undo inside the sinking-plank cutscene re-attaches the view); crown win
  repaints the jump HUD; BtB win line reads 'by capturing the Eldritch King at the end of the demo'.
- Play-test: tools/g6_3d_play.py (playwright, SwiftShader WebGL, real key events / taps, in-page autopilot that plans a ledge
  path): iqfHW2_sMmc 30/30, zDFsnRE_Gig 32/32, xlErokL2-4c 35/35 at 390; 360 + reduced motion 30/30 and 34/34.
- Not modelled / left: the BtB enemy rooks' patrol cycle; the real demo room geometry and the WTTC game's real positions (still
  approximations, see each mode's source.notes); BtB 'Eldritch King' opponent has no avatar (no portrait frame captured; art item).
## art-audit-final (cm-art-a, 2026-11-25 ET): art audit of data/modes from the first file through X-aULHXsAaI.js (minus qqvbb2r2k5I, oAoik9Dj2qQ, p6W3yDU-v88, spJibM5qaNQ)
- Audit: 246 mode files, 1034 image refs (226 modes reference art), 0 missing files; flagged by size (<64/<100 px), soft/upscaled, opaque PNGs, border-opaque cuts; every piece/avatar/overlay looked at on contact sheets.
- Batch 1: 19 modes used a 96px blurry 'you.png' (chess.com default pawn avatar crop) for the player -> the shared 256px iwantcheckmate avatar
  (assets/modes/uUXev8TPVak/iwantcheckmate.png, same art as the other 120+ modes). 3Sr5lJbHKKU/8rqN9o9lZOM/Vr3WOIRAXoI Fairy-Stockfish avatar
  60px -> the existing 128px cut of the same logo (assets/modes/mvPXhAMcT7I/fairy_stockfish.png). JUlTxosCXuk Stockfish avatar 64px ->
  assets/modes/U_irVoLjtNI/stockfish.png (256px, same chess.com Stockfish art). ROLL buttons (B5LG, CEkC, Cr3j, Jg-o) recut with a clean
  circular alpha from the video crops (tools/art_a_roll.py; old cuts had a jagged green/dark fringe, Cr3j was off-centre).
  Kzt9ItpGtYg Island Boss/'lion' 41px crop with the square behind it -> recut 123px transparent from frame 706 (tools/art_a_lion.py).
  OFtVdbxJI2Y fly avatar (160px, mostly transparent smudge) -> the 600px video sprite research/frames/sprites/OFtVdbxJI2Y_fly.png at 256px.
- Batch 2: 1L_sxGgxX9M (+OO3XlFQ32i0) rainbow piece 58px chopped cut with a stray arrow line -> 128px GrabCut recut of a2 in
  1L_sxGgxX9M_maxres1.jpg; 7lEglazTlo8 Sokochess black pawn 40px -> 96px from maxres1 (tools/art_a_recut2.py). GawuFHUIj6o phantom rooks
  recut from the 400px video sprite with the purple wall keyed out (old cut kept purple/grey streaks); JAz_qMQpI1o (+_RFXN1Ye3sY)
  Ouroboros unit icons: faint cream wash at low alpha removed (tools/art_a_recut3.py).
- Batch 3: chess.com default pawn avatar crops (44-96px, blurry) in 134MBhzRN2c, 1Q4rfOd0al8, 8XmhGMnypjc (millionaire), 9bvch-UHQhg,
  Fbk0Xbcz728, SmCty_pVF7A, Swv1fEVI_CM -> art-b's 256px exact-match uUXev8TPVak/default.png. I_TbJqRHtf4 secret marker recut as a
  clean disc from the 128px video crop (old: 59px upscale with board square behind); 0VbTOk8X1TY blood splat: dark square keyed out
  (tools/art_a_recut4.py).
- Left as is (checked, the video's own look or no better source): shogi lance_b/silver_b 67px (frames are only 1280 maxres; cut is
  near native), Ouroboros general/reaper icons (grey glow is in the video icon), 3Sr5lJbHKKU checker discs + H_5UviR2nTU body tile
  (flat art, 'soft' flag is just low texture), 7lEglazTlo8 undo/restart buttons (native size), small chess.com bot portraits
  (Wally/Samantha/Hustler/lvl5-15/Santa/Frosty, 66-98px) = native crops; no higher-res exact copy found in this pass (cm-art-b
  swapped other chess.com bots via the chess.com API; the same could be tried for these).

## surv2 + cu2 (2026-11-25 ~1:15 PM ET, Hark): Chess Survivors pass 2 + Chess Ultimate 2x2 Giant
- spJibM5qaNQ Chess Survivors: todo_pass2 cleared. Run-settings bar above the board (persisted in CM.store 'surv.cfg'): Acts Short
  40/30/20 (default) / Full 200/150/100 (the video) / Endless; Turn timer off / 5 s (length inferred; drawn as the video's green dashed
  ring from the 0:38 frame, it drains and passes the turn); Wait (skip a turn, "Skip this turn" 9:50); character Joker / Tiny Wizard /
  Cat, locked until a run is survived ('surv.unlocked', as the 22:06 Unlocks screen). Wizard = +1 projectile, -1 coin-turn duration
  (its tooltip in the 22:06 frame), starts with Bubbles; Cat starts with the Wandering Bot (inferred). New: Bubbles level-up, Wandering
  Bot relic (39 dmg, transcript 12:30), Immunity Idol relic, act-start relic reward, act health multipliers (Act 2 x2 from 10:05; Act 3
  x3 and endless growth inferred). Art (tools/surv2_art.py): wizard.png + cat.png from frame_1326 (22:06), bot.png from frame_472
  (7:52), bubble.png redrawn from the 7:52 bubbles (they are see-through over the bullseye). Frames committed in
  research/frames/video_thumbs (spJibM5qaNQ_frame_38/209/472/1326).
- js/modes/g4_cu.js Giant: real 2x2 piece as the game's tutorial shows (M0Nr98Axpo8 1:01-1:06, frame M0Nr98Axpo8_frame_66): anchor
  'Giant' + 3 parts (gp:1, shared gid), one double-size token (decorate), moves one block (2 squares) up/down/left/right onto a block
  with no ally and knocks out every enemy in it (up to 4); hooks.attacks covers check by a Giant; taking any of its squares knocks it
  out whole (inferred); setup hook / CM.g4cuGiant.expand grows a single-square Giant into its block. All 11 Chess Ultimate mode files
  now use gen 'cuGiant'; M0Nr98Axpo8 (draft + Giant tutorial) and I07GcHQtY2o (draft) call expand in their own setups;
  ehlf0_asIKo player army transcribed from its 5:37 frame (two squids a2-b3 / g2-h3, K a1, Sludge b1, angel-shielded pawn d2,
  Sniper f3, Turtle g1, decoy Jester h1; opponent's rocks/frogs/black holes not in the library -> classic army kept, inferred).
  Not modelled: angel shield on a Giant, Mage swap / Fisherman pull / Angel attach / Parasite take-over involving a Giant.
- QA 390/360 0 errors: spJibM5qaNQ + the 11 Chess Ultimate ids. No todo_pass2 left in js/modes or data/modes outside
  oAoik9Dj2qQ / p6W3yDU-v88 / qqvbb2r2k5I (owned by other agents).
## cf agent: Chessformer real levels (2026-11-25 ~12:50-1:25 PM ET, WIP, stopped on owner order)
- NEXT AI (cf agent, 2026-11-25 1:25 PM ET, WIP, stopped on owner order): DONE: 1080p frames of every level now committed in research/frames/video_thumbs (oAoik9Dj2qQ_frame_118 L22, 186 L23, 273 L24, 408 L25, 468 L26, 547 L27, 611 L28, 683 L29, 757 L30, 880 L31, 983 L32, 1031 L33, 1113 L34, 1138 L35, 1231 L36; p6W3yDU-v88_frame_16 L37, 75 L38, 149 L39, 197 L40 (Level-40 wipe text over it), 267 L41, 369 L42, 511 L43, 594 L44, 715 L45, 863 L46, 973 L47; frame_1087 is NOT a full-screen frame, ignore). Grid = 16 cols x 10 rows + floor, cell 98.25 px from (174,180) on the 1920x1440 frames (tools/g6_cf_classify.py prints a class grid + writes a numbered overlay). Transcribed: L21, L27, L37-L42, L45, L47 in tools/g6_cf_levels.py (all re-checked against the new frames: 0 diff rows) and L22-L26, L28-L36 in tools/g6_cf_new_levels.py. Ledge convention: a thin bar drawn at the TOP of cell (c,r) = ledges entry (c, r-1). BFS (tools/g6_cf_solve_new.py L22 ...): solvable under current rules L22 L23 L24 L28 L29 L30 L31 L32 (+ L21 L27 L37 L40 L47 earlier); NOT solvable: L25, L26 (L33-L36 not run yet). FINDING: the transcripts say 'drop onto the king' / 'drop on the king's head' (L25, L26, L45): a piece that FALLS onto the red king captures it. Add that to tools/g6_cf_levels.py Level.settle (blue piece falling >=1 square with 'k' directly below = win) and to js/modes/g6_levels.js fallLedges (white piece falling onto a black royal replaces it), then re-run BFS: L25/L26 should solve (tools/g6_cf_reach.py L25 shows a bishop reaches (13,5) above the king). LEFT: (1) fall-capture rule as above; (2) loop the button toggle + regrav in g6_levels onMake until stable (solver does); (3) Chessformer pawns: every pawn may double-step once (p6 L42 transcript) - g6_levels marks pawns off their 2nd rank as moved, add a param to skip that; (4) transcribe L43 (frame_511: 5x4 rook block + knight in cols 5-9, king in a pipe ring at (11,2)), L44 (frame_594), L46 (frame_863), L48 (capture p6 18:06, chapter 'Level 48 Platform'); (5) wire levels: board 16 x 11, rules.gravity null + params.gravity {dir:'down',exempt:['Ky','Lk','Pb']} + params.ledges true, levels from `python3 tools/g6_cf_levels.py --json` (extend it to include NEW), choice ['R','B','N','K','P'] (no queen), button tile 'o' -> tiles {sq:'button'}; (6) remove todo_pass2 items, QA qa_all.py --ids oAoik9Dj2qQ,p6W3yDU-v88 --redo --par 1 at 390/360.
## cf transcriber: Chessformer L43, L44, L46, L48 (2026-11-25 ~2:00 PM ET)
- Transcribed p6W3yDU-v88 L43 (frame_511, 8:31), L44 (frame_594, 9:54), L46 (frame_863, 14:23) and L48 (frame_1086, 18:06, the frame
  committed in 5efff0e) into app/tools/g6_cf_new_levels.py (NEW.update block, same format as L22-L36; merged by g6_cf_levels._merge).
- Every cell checked by eye on the numbered overlays (tools/g6_cf_classify.py); the classifier grid differs only on the ledge cells.
  Ledges (bar at top of cell (c,r) -> (c,r-1)): L43 (5,1),(9,1); L44 (13,1) under the king; L46 (7,0) under the top rook, (4,3) under
  the upper bishop; L48 none. L48: key (1,0), locks (8,3),(8,5), blue R B B N N K on row 9 cols 0-5 + a rook boxed in at (7,9).
- Solver: L43 SOLVED in 16 (node tools/g6_cf_solve.mjs, 2874 states). L44, L46, L48: BFS (node) and greedy (python) did not finish
  within ~110 s in the sandbox, so neither solved nor disproved; run longer: python3 tools/g6_cf_levels.py --grids > /tmp/cf.json;
  node tools/g6_cf_solve.mjs /tmp/cf.json L44 L46 L48 --limit=20000000.
- Doubt: frame_1086 assumed to be L48's start position (pieces lined up, nothing moved), not confirmed against an earlier frame.

## art-leftovers (2026-11-25 ~2 PM ET, Hark): NEXT_AI 1:30 PM item 3
- boaA9_TjXeU Thermopylae: General/Sergeant/Soldier/Archbishop recut from the 1080p piece-card frames (65/70/75/98) keeping
  the video's dark outline. Cause of the 'halo': g5_art5.py keyed the cards with abs_key(40), and the outline (~#262624) is
  within 40 of the card grey (#3a3935), so the outline was removed and only its light anti-alias ring survived. New cut:
  flood-fill the outside over pixels lighter than the outline, soft edge from darkness vs the card grey (ring -> 0).
  Green copies: red card recoloured (HSV, shading kept) to the green measured on the video's own green General icon in the
  'Ways to Win' card (maxres1, fill ~(60,188,76)); green pieces are only shown that small in the video (colour = video,
  shape = red card, inferred). Tool: app/tools/art6_thermo_recut.py. Nightrider/Wildebeest (thumbnail cuts) untouched.
- Stockfish king bar avatar (assets/avatars/stockfish.png = default Stockfish avatar for the lobby / 'stockfish' /
  UzoZVdmGpyc, and cYVauucyLyQ/bar_stockfish.png): it is chess-roulette.com's black king. The site's own asset is a
  32x32 pixel-art PNG (bK.png, inlined as a data URI in
  https://web.archive.org/web/20260519183207id_/https://chess-roulette.com/static/js/main.b306c3e9.js; the live site was
  down, no larger copy exists anywhere). Swapped the 64px blurry video crop for that exact PNG scaled 7x nearest (lossless
  pixel art, as the site draws it with image-rendering: pixelated) on the bar's #e5e5e5, 256px. Original kept in
  research/frames/sprites_web/cYVauucyLyQ_chess-roulette_bK_32.png.
- inm7KvllVu0 Stockfish avatar (52px trout head, chess.com 'Stockfish (3600)' in the Portal Chess UI): NOT swapped. No
  exact higher-res copy found: api.chess.com/pub/player/stockfish (old 'Stockfish' member art), chess.com CCC avatars
  (images.chesscomfiles.com/chess-themes/computer_chess_championship/avatars/lrg_stockfish.png, 300px) and the Wikimedia
  Stockfish icons are all different art. chess.com/variants blocks the sandbox (403); a browser look at the variants
  vs-computer screen could still find it.
- Small chess.com bot portraits -> exact chess.com art at 200px (api.chess.com/pub/player/<user> avatar), figure registered
  (scale/offset search) and tone-matched per channel onto the upscaled video crop's own background, so the video look
  (avatar square, Frosty/Cabana Santa scenery, the dimmed blindfold bars) stays. Tool: app/tools/art6_bot_portraits.py;
  downloads in research/frames/sprites_web/chesscom_<user>.png, replaced crops in research/frames/sprites_web/video_crops/.
  AaHmMC3HA0E wally.png = Wally-Jr-BOT, hustler.png = Hustler-BOT, samantha.png = Samantha-BOT;
  CHde4g8Jpuk frosty.png = Frosty-BOT, santa.png = Cabana-Santa-BOT;
  D8olpXjblQ0 lvl5/10/15/20.png = chess.com Visualization bots visualization-5/-10/-15/-20 (the blindfolded Level 5/10/15/20;
  lvl20 was a 256px upscale of the 18:07 bar avatar). lvl25 (256px thumbnail cut) kept. URLs in each mode's source.notes.
  Not done: wMdAOirSvQQ/santa.png (128px, Santa-BOT with the neighbouring gingerbread in the crop; chess.com copy exists:
  api.chess.com/pub/player/santa-bot) - not in the leftover list, left as the video crop.
- QA: tools/qa_all.py --ids boaA9_TjXeU,cYVauucyLyQ,stockfish,UzoZVdmGpyc,AaHmMC3HA0E,CHde4g8Jpuk,D8olpXjblQ0 --redo --par 1
  at 390/360: 14/14 ok, 0 errors, 0 missing; screenshots of Thermopylae + Trash Talker Bots checked by eye.
## cf-2: Chessformer real levels wired (2026-11-25 ~1:35-2:10 PM ET)
- DONE (steps a, b, c, e, f of NEXT_AI item 1; d by the cm-cf-transcribe worker in 3dd762c, L48 from p6W3yDU-v88_frame_1086.jpg = 18:06, captured here):
  oAoik9Dj2qQ = Levels 21-36 (16), p6W3yDU-v88 = Levels 37-48 (12), wired by tools/g6_cf_wire.py from tools/g6_cf_levels.py + g6_cf_new_levels.py
  (re-run the script after any transcription fix). Board 16 x 11, rules.gravity null + params.gravity {exempt Ky/Lk/Pb, fallCapture}, ledges, buttons
  (Pb + button tiles), '?' slots (Ch) with one pick per slot from R/B/N/K/P, pawnDoubleAnyRank, levelSelect; todo_pass2 cleared in both files.
- Rules added to js/modes/g6_levels.js (and the same in tools/g6_cf_levels.py + tools/g6_cf_solve.mjs):
  * king-head capture: a blue piece that ends up resting directly on the red king (falling onto it, or moved straight onto the square above it)
    captures it. Transcripts: L45 'drop on the king's head', L26 8:33 'I'm just going to move here and then drop onto the king' (a knight jump
    onto the square above the king; with a falling-only rule L26 was unsolvable, BFS exhausted 2033 states). A ledge between them blocks it.
  * settle(): gravity + purple buttons looped to a fixpoint; purple blocks have home squares (st.x.pbHome) and come back on empty home squares.
  * last key captured -> locks removed; every pawn may double-step on its first move from any rank (L42 'Can they all move two squares? Oh, they can').
  * '?' slots start as the level's first choice so the position always has legal moves; the picker sets each slot in reading order and refreshes
    the legal moves (before this fix the game sat with 0 moves after picking).
- Verified: tools/g6_cf_solve.mjs (node BFS, ~10x the python solver) solves L21-L32, L34, L35, L37, L43, L47; tools/g6_cf_play.py replays those
  lines through the real app (SpecGame + hooks) and every one ends 'the king was captured' for White; qa_all --ids oAoik9Dj2qQ,p6W3yDU-v88 --redo
  --par 1: 390 + 360 all ok, no page errors.
- NOT verified (too big for an exhaustive BFS in a 2-core sandbox, not disproven): L33, L36, L38-L42, L44-L46, L48. A background run
  (/workspace/work/cfsolve/bg.sh, 7M-state limit per level, output bg_out.txt) was started at ~2:05 PM ET; next AI: run
  `python3 tools/g6_cf_levels.py --grids > /tmp/cf.json; node --max-old-space-size=2500 tools/g6_cf_solve.mjs /tmp/cf.json L44 --limit=7000000`
  per level; a level that exhausts without a solution means a transcription error or a missing rule (compare its frame).
- Polish left: mode title 'Chessformer: Levels 21-35' now has 21-36 (rename + node tools/build-data.mjs for the index); ledge bars draw almost
  black at 390 px (decorate 'ledge').


## art-leftovers 2 (2026-11-25 ~2:30 PM ET, Hark)
- boaA9_TjXeU Thermopylae: Red's plain King (J), Queen and Bishop drew the cream set + CSS tint (only the fairy pieces had
  red art). New red art = chess.com's red 4-player pieces cut from a NEW paused full-screen 1080p youtube.com frame at 1:55
  (research/frames/video_thumbs/boaA9_TjXeU_frame_115.jpg; board x 219..1254, y 30..1065, 73.93 px squares). Tool
  app/tools/art6_thermo_red.py: every clean instance on the frame (14 queens, 15 kings, 4 bishops), 4x upscaled +
  quarter-pixel registered, per-pixel median, difference matting over the light (#dadada) and dark (#acacac) squares
  (alpha + true colour; interior forced opaque by flood fill so the kings' light holes stay piece fill as in the video).
  Bishops only stand on dark squares in that frame -> single-background matte (edge alpha = blend toward the measured
  dark-red outline (52,9,10)). Output assets/modes/boaA9_TjXeU/{king,queen,bishop}_r.png, 160px, trimmed like the other
  Thermopylae pieces. Wired as J/Q/B img {r: ...}; Blue/Yellow J/B keep the tinted set.
  Engine change (js/game/spec-game.js pieceImage): a type whose img object has no entry for a colour (and no w/n/base
  fallback) now falls back to the piece set instead of returning undefined (needed so Yellow's B / Blue's J still draw).
  Not done: Red's royal Ferz (d1) is still the letter piece (the video hides it under the 72 counter); Nightrider red copy is
  still the thumbnail-derived art (the 1:55 frame shows 6 red nightriders on light+dark squares if someone wants to recut it
  with the same tool).
- wMdAOirSvQQ/santa.png: 128px video crop (with the Gingerbread bot in its left half) -> chess.com's exact Santa-BOT avatar
  (api.chess.com/pub/player/santa-bot, 200px, kept as research/frames/sprites_web/chesscom_santa-bot.png). Registered onto
  the crop at 147px (gingerbread masked): mean abs diff 4.2/255 = same art. Composited in its own avatar framing on the
  crop's flat brown background (105,88,80; std < 3), tone-matched per channel to the crop; gingerbread excluded. Tool
  app/tools/art6_santa.py; old crop in research/frames/sprites_web/video_crops/wMdAOirSvQQ_santa.png.
- inm7KvllVu0 52px Stockfish trout head: still NOT swapped. It is the old photographic brown-trout Stockfish logo; no exact
  higher-res copy found (Wikimedia NewLogoSF / 'Stockfish icon (2010-2020)' are different, stylised art; chess.com variants
  page still blocked).
- QA: tools/qa_all.py --ids boaA9_TjXeU,wMdAOirSvQQ --redo --par 1 at 390/360: 4/4 ok, 0 errors, 0 missing. Thermopylae
  390px screenshot checked by eye (red K/Q/B on the board, Yellow/Blue unchanged); Santa compared side by side with the old crop.


## art-leftovers 3 (2026-11-25 ~2:45 PM ET, Hark) - Thermopylae (boaA9_TjXeU) piece art audit
- Owner report: the red Nightrider looked half white, half red in game. nightrider_r.png was the old thumbnail-derived
  hue-shifted copy with a white back of the head and a white base. Recut from the 1:55 1080p frame
  (research/frames/video_thumbs/boaA9_TjXeU_frame_115.jpg) with tools/art6_thermo_red.py: 8 clean instances
  (rows/cols (7,0..2), (8,0..2), (10,4), (10,6); 5 light + 3 dark squares), 4x registered per-pixel median.
- wildebeest_r.png (old thumbnail cut: over-saturated red ~(220,30,40), ragged outline) recut from the same frame:
  3 instances (10,5), (11,5), (12,3) -> fill (183,60,69) = the other board pieces.
- Edge matting changed in art6_thermo_red.py (affects king/queen/bishop/nightrider/wildebeest, all regenerated): the
  old two-background colour estimate and the colour-tolerance flood left light specks / a faint light ring around the
  pieces (visible on dark backgrounds, 300-360 semi-transparent light px per piece). Now: alpha = projection of the
  median onto the square->outline (52,9,10) line, averaged over light+dark medians; edge colour = the outline; 'outside'
  = flood over pixels that sit on that blend line (or are ~square incl. jpeg ringing) and are < 0.9 alpha, so the thick
  outline stops it and the kings' light holes stay. Result: 0-4 semi-transparent light px per piece, no halo.
  Script takes piece names: python3 tools/art6_thermo_red.py nightrider_r (no args = all five).
- Colours: the card pieces (General/Sergeant/Soldier/Archbishop, art6_thermo_recut.py) were (196,69,80) vs the board's
  (184,61,71) -> tone-matched to the board red. Green copies used the bright (60,188,76) of the small Ways-to-Win icon;
  the board frame shows Green's pieces in chess.com 4-player green (78,145,97) (= the mode's #4e9161 swatch) -> General,
  Sergeant, Soldier green copies recoloured to that. nightrider_g.png (not on the board in this setup, but wired) is now
  the new red Nightrider in that green (inferred colour; the video shows no green Nightrider).
- Checked every piece image at full size on #dedede / #aeaeae / #282828 and next to the frame instances, and in a 390px
  in-app screenshot (+ 3x DPR crop): no white patches, halos, cut-off parts or wrong colours. Blue/Yellow keep the
  tinted set (unchanged). Data comments + source.notes updated (data/modes/boaA9_TjXeU.js).
- QA: tools/qa_all.py --ids=boaA9_TjXeU --redo --par 1 (390/360): 2/2 ok, 0 errors, 0 missing.

## art-audit-q3b (2026-11-25 ~2:45-3:30 PM ET, Hark): art_audit_todo q3 items 9-15 + Non-art line - DONE
Commits: 2ca3d8f (items 9-15), e25b466 (Ouroboros icons). Tools + sources: app/tools/art_q3b/ (README.md lists each script and its input).
- 9 fRZmYTwLE54: electric_king.png keeps the king + glow within 12px (board-grid lines, purple square bleed, top-right cloud dropped);
  magnet.png recut from maxresdefault (old cut: white square filled the U, lower pole cut off; poles' left outline redrawn where lightning hid it).
- 10 mZUViBNWt6E boat_g/r/u/y = q4's oGP4TUDjSVk recut (same chess.com Chaturaji UI per tools/g6_wire_art.py).
- 11 lpqVYTH9U-A toaster.png (also used by Ji7frCIfmAQ) + thought.png: largest component only (stray lines gone).
- 12 dkCMhNcZezM + dztzDlPfqSI passant_ai.png: white UI arrow tip on the left edge repainted with the row's red.
- 13 d9oDfmcMJvA gabriel.png: statue keyed off the pink highlight square in maxres1 (200px, transparent; was an uncut photo tile).
- 14 fUQXSj5jVUk Xiangqi: the old chariot_r/_b art was really xiangqi.com's ADVISOR icon (crowned figure next to the general in
  maxres1) -> advisor_r/_b.png, wired to XA. New chariot (tower) + cannon discs: line art from xiangqi.com's own help page
  (https://www.xiangqi.com/media/en/pages/help__pieces-and-moves/chariots.png, .../cannon.w1439.webp; same icons as the video)
  laid on the set's flat disc; XC wired to cannon_r/_b (glyph/badge fallback removed). Screenshot checked at 390px.
- 15 f4O--Ai7B9A: opp2.png = d3sspair's chess.com avatar, identical art
  (https://images.chesscomfiles.com/uploads/v1/user/206219591.ce3f254d.200x200o.509ab9f1f150.jpeg, 96px is the original upload;
  copy research/frames/sprites_web/chesscom_d3sspair.jpg). opp1.png re-cropped from maxres1 without the chess.com avatar frame;
  LEFTOVER: still a 51px source upscaled to 96 (username shown truncated 'John_Doyl…'; api john_doyle is a different person).
- Non-art Y1WHtLBLloY notify.mp3: NOT A BUG, no change. assets/sounds/notify.mp3 exists (chess.com notify, 41c2b07) and loads
  200/206 in playwright for this mode; Chromium logs net::ERR_ABORTED on media preloads (premove/tenseconds too), probably what the audit saw.
- Non-art JAz_qMQpI1o general/prince/fool (w+b): rebuilt with a clean 3px contrast outline (general had the pink 'threatened'
  glow from the still -> grey halo; prince speckled outline, prince_w had no dark outline at all; fool faint grey fringe).
QA (qa_all.py --widths 390,360 --redo --par 1, results /workspace/work/qa_art-q3b, port 8793): 26/26 ok - fRZmYTwLE54 mZUViBNWt6E
lpqVYTH9U-A Ji7frCIfmAQ dkCMhNcZezM dztzDlPfqSI d9oDfmcMJvA fUQXSj5jVUk f4O--Ai7B9A JAz_qMQpI1o Y1WHtLBLloY tsqxjK8GP10.
Note for parallel QA: the default --port 8771 collides between agents (ERR_CONNECTION_REFUSED) - pass a unique --port.

## art-audit-q2 (2026-11-25 ~2:45-3:30 PM ET, Hark): art_audit_todo q2 leftovers + QA of b260142 - DONE
Commit 9332fbd (tool rebuild/tools/art_q2_fix2.py; cleaning steps read the assets at f35652a via git show, so it re-runs cleanly).
- Avatars: GQ6MT1m78Yo Martin XIII = baby from the video's maxres thumbnail (256px, thumbnail purple). SC1loYlAJRE GothamChess bot =
  thumbnail's cartoon Levy (256px); the title letters behind his hair painted over with a quadratic fit of the pink backdrop.
  VV9Wb6egokU YugoBandai = his chess.com avatar (same lion art as the video bar), 200px, white backdrop -> the bar's grey;
  source https://images.chesscomfiles.com/uploads/v1/user/191487185.ca0a57d1.200x200o.3f99e09f798d.png (api.chess.com/pub/player/yugobandai),
  copy in research/frames/sprites_web/. QrKIKcYN5m4 ilikecheese: red crop strip trimmed, stays 96px (no chess.com avatar any more).
  LEFT Oj5rYPqpldg chadkatter: 96px photo kept, no larger source (thumbnail doesn't show it, chess.com account has no avatar).
- WXcmWG7Eczs Anarchy doodles (21 files): everything outside each doodle's closed pencil outline dropped (speckle halos); white
  doodles also clipped to their black twin's silhouette (same drawing/placement), which removes R_w's blue-grey streak.
- JPDYufARCQU: star_pawn.png corner badge redrawn at 96px in the 32px sprite's colours (blue disc, white star; inferred redraw,
  the sprite is the only source). Intro overlay now secret_queen_pawn.png = the thumbnail's crowned white pawn (fit 60%).
- Re3c-3qomgQ: tnt.png = the video tile without neighbour strips, snapped back to its 16x16 Minecraft pixel grid (crisp);
  cobble.png strips cut (stays soft: tile only partly visible in the frame; wiki textures checked, not identical -> not used).
  VVuAgqLzD_o rock.png = grey tile only (no green neighbour squares). I07GcHQtY2o pit.png = hole + red rim ellipse on transparency
  (no stone tile/piece bits). Rtee8TRU0vg die.png keyed from its own thumbnail. X-aULHXsAaI flag: dark/purple fringe + specks off.
- QA (qa_all.py --widths 390,360 --redo --par 1, results /workspace/work/qa_art-q2): 9332fbd ids GQ6MT1m78Yo SC1loYlAJRE
  VV9Wb6egokU QrKIKcYN5m4 WXcmWG7Eczs JPDYufARCQU Re3c-3qomgQ VVuAgqLzD_o I07GcHQtY2o Rtee8TRU0vg 20/20 ok; b260142 ids
  HkeZayq10p8 Jg-oNqDOXtg KJYUsRlj_34 LiXg0nHrjxg OVM-2QJ2NFQ OWbQgMUwgBQ OcWzHqqeLNg RnMKtGgKknQ SJrOiyN2-HA X-aULHXsAaI 20/20 ok.
  In-game screenshots of WXcmWG7Eczs, SC1loYlAJRE, I07GcHQtY2o at 390 checked by eye.

## art-audit-q3a (2026-11-25 ~2:45-3:45 PM ET, Hark): art_audit_todo q3 items 1-8 - DONE (one leftover)
Commits: dab7265 (1-2), c7a4505 (3), a8ac66b (4), 13f2d2b (5), d2ba933 (6), 102c89c (7), 680b7af (8). Tool: app/tools/art_q3a_fix.py
(one job per item: die ornate_knight four_kings hawk_b troll goose ouroboros_queen); maxres thumbnails used are cached in
research/frames/sprites_web/thumbs/<id>_maxres.jpg (i.ytimg.com/vi/<id>/maxresdefault.jpg).
- 1 exMFzra96vo die.png: only the middle die of the 3-dice crop, grey bg keyed (rounded corners transparent), 192px; vfx fit '28%'.
- 2 gY9DNg9xDUM ornate_knight.png: the white dragon knight from frames/sprites/gY9DNg9xDUM_tiny_intro_pieces.png (bright blobs +
  bridged black lines, outline kept), 256px; fit '40%'.
- 3 h7UFq4r59tM four_kings.png: the four kings keyed off the purple card of the maxres thumbnail (bg = G~0 and B>=R), outline
  smoothed, 1100x391 transparent; no bands / magenta lines / '4 Players?' title. Piece colours: the shared CSS tints
  (css/board.css .pc--tint-r/u/y/g, sepia-based) left the white set pastel (red read as peach, blue/green grey). chess.com 4PC
  pieces are solid colours = the modes' swatches; filters refitted numerically (brightness, sepia, saturate, hue-rotate,
  brightness) so a white fill lands exactly on #bf3b43 #4185bf #c09526 #4e9161 and black stays black. This changes every
  tinted 4-player mode (incl. tintB 'y' black sets and Thermopylae blue/yellow); checked by eye in h7UFq4r59tM, OVM-2QJ2NFQ,
  IjUqZLgF_xM, oGP4TUDjSVk. No video frame of the board was available in the sandbox; the swatches match the chess.com UI colours.
- 4 hk85bBLSi7Q hawk_b.png: dark recolour of hawk_w.png (INFERRED, no black hawk in our frames): outer outline kept black, white
  body -> #282828, inner black feather lines -> light grey (default-set black-piece style).
- 5 hv_NHWqysZE troll.png (avatar for puKYAUl9x9s, ulE3YPZI9Sc too): 10 top rows (black strip + seam) cropped, re-squared, 128px.
- 6 Y7KKKTTkwNk goose.png: recut from frames/sprites/Y7KKKTTkwNk_goose.png: cream body + beak + their thick black outline,
  cut at the green ground bar, 256px (right edge stays cut as in the frame).
- 7 _RFXN1Ye3sY ouroboros_queen.png: no text-free frame or web copy (searched once); recut from the 580px sprite with the white
  title glyphs + their dark shadow inpainted (harmonic fill) and the band behind the title repainted from the navy bg; crown,
  hair and face kept. The crown tip that sat under the 's' is a soft red blur (reads fine at the 110px boss card).
- 8 Stockfish avatars ZoSm2Wxlhvo lDlOC8KH0Zc dR76717W3JM dKZfe4uB_RM Y3Jneu7zoq0 iqfHW2_sMmc -> assets/modes/U_irVoLjtNI/stockfish.png
  (same diamond-fish art, 256px); the six old crops deleted (no other references).
LEFT: inm7KvllVu0 Stockfish avatar NOT changed: it is a different art (52px photo trout head, what that video shows), not the
  diamond fish, so pointing it at U_irVoLjtNI would not match the video; no hi-res copy known (see the art-6 notes above).
  Note: U_irVoLjtNI/stockfish.png itself still has small bits of the video's board/glyph in its two left corners (q2 range, not touched).
QA: tools/qa_all.py --widths 390,360 --redo --par 1 --results /workspace/work/qa_art-q3a, ids exMFzra96vo gY9DNg9xDUM h7UFq4r59tM
  hk85bBLSi7Q hv_NHWqysZE puKYAUl9x9s ulE3YPZI9Sc Y7KKKTTkwNk _RFXN1Ye3sY ZoSm2Wxlhvo lDlOC8KH0Zc dR76717W3JM dKZfe4uB_RM Y3Jneu7zoq0
  iqfHW2_sMmc + tint check OVM-2QJ2NFQ IjUqZLgF_xM boaA9_TjXeU 8XmhGMnypjc xg_djfCrRes: 40/40 ok, 0 errors. Every new image viewed;
  390px screenshots checked for h7UFq4r59tM (overlay + pieces), gY9DNg9xDUM, hk85bBLSi7Q, IjUqZLgF_xM, OVM-2QJ2NFQ, oGP4TUDjSVk.

## art-audit-q1 (2026-11-25 ~2:45-3:50 PM ET, Hark): art_audit_todo q1 items 1-10 - DONE (leftovers in item 10)
Tool: rebuild/tools/art_q1_fix.py (one job per item; `python3 rebuild/tools/art_q1_fix.py [job]`). Every output viewed before commit.
- 1 GGvpHVEgqwY Chinese vs Modern (7152ed5): chariot/elephant/advisor/cannon recut from the video frame maxres1 (opening position,
  85px squares: a8 chariot, c8 elephant, e8 advisor, g7 cannon), keyed on the square colour, square framing kept, 96px. The old
  advisor.png was actually the elephant head; old cannon/elephant were thumbnail crops spilling off the square.
  Frame cached: research/frames/video_thumbs/GGvpHVEgqwY_maxres1.jpg. (yt-dlp is bot-blocked in the sandbox; only i.ytimg frames work.)
- 2 AWFB4EzGtDc Gun King (2c2d88b): pawn.png from frame_62 (black outline + inside), red_pawn.png from frame_492 (red outline +
  inside, neighbour pawn cut off), gun_king.png dark corners outside the round badge -> transparent (same canvas, same in-game scale).
- 3 duck (b863b11): Bzbzs0K5IBs/duck.png AND E2x-QTgBD5k/duck.png (the "clean" one had brown background-duck bits and its head
  clipped at the top) both recut from research/frames/sprites/E2x-QTgBD5k_duck.png, 256px.
- 4 9M2Mj2WFFys kfchess set (b863b11): all 12 pieces greyscaled (removes the green spill; the set has no colour); bK's white ring
  between outline and body and bN's white back line were see-through -> opaque white.
- 5 AvZiSnngZjA (cfd110a): king.png cropped to y>=58 (title + its outline gone; the crown's cross tip goes with it, it was under the
  title in the thumbnail), re-squared 256. king_b.png recut from maxres1 (the black king on a clean lavender square ~(700,470)),
  flat navy silhouette, 80px.
- 6+7 avatars (a4dcd89): leela (DStCmEElxW0) cropped below the title; tony (CSjh4NrnxLE) undo arrow + bracket filled with its flat
  background (as q4 did for xjEz7bCQxho); martin (6qVgF1OO_cw, used by 6YEM7m8owJ4 9S2QuAHo24c H_5UviR2nTU YmAkTgcRUsY nick8PeAXLA)
  magenta glyph -> white; lvl25 (D8olpXjblQ0) arrow glyph -> white. 4tDIBl14AX8 opponent avatar -> 6qVgF1OO_cw/martin.png (same art,
  256px; old 74px crop left in place unused).
- 8 D1hAji3BgJw unicorn_knight.png (cb6b64d): alpha = the piece's black outline + everything inside (magenta frame + pale square gone).
- 9 SCP tiles -fax07t_o5s/shyguy, 06OeGk5Iu-s/reptile, 4XV3SBMQgXE/mask (cb6b64d): the neighbouring dark-square strips (and their
  blend seam) repainted with the light square colour; creature pixels untouched, no rescale.
- 10 low-res (0f2a9d6): Spell Chess jump/freeze icons (8CtX9G07bMU, Ag3KKsIrax4) -> chess.com's own art at 179px from
  https://www.chess.com/terms/spell-chess (https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpwXDpIh.png,
  kept as research/frames/sprites_web/chesscom_spell_icons.png); Ag3KK's old freeze was the greyed cooldown state, the app greys a
  disabled button itself. 3PfBlaosAmY cookieVortex avatar -> chess.com API copy (same spaceship art, 114px,
  https://images.chesscomfiles.com/uploads/v1/user/116534196.821c4bd1.200x200o.2b379087d1b3.jpg; video shows it on a dimmed page).
  LEFTOVERS (no exact better source found): 4EIPARnGSSU fog.png (28px fog texture); avatars 34iAKIAMKb8 (Dan-kyu_S: account 404),
  4oJgefAYN4k (miradilzey: 404), 3_eutZExN2c (minhduc77) + 5K72RRDBN5U (PhillipsHead): API avatars are now different pictures, not
  the video's art; 88CgS9anXJs (name truncated "BobbyFisc..." in the video). Some of these 96px crops carry a 2-3px dark UI edge on
  the left/top (34iAKI, 3_eutZ, 88CgS9) - optional trim. CxtttdnwNWk/cu tokens: 3D character renders cropped from frames, no web copy.
- Leave items untouched (A7gdM2GD1b0, DZYjyPOvGho, 9j7h5kF4X9s).
QA (tools/qa_all.py --widths 390,360 --redo --par 1, results /workspace/work/qa_art-q1): 46/46 ok, 0 errors, 0 missing, for
GGvpHVEgqwY AWFB4EzGtDc Bzbzs0K5IBs E2x-QTgBD5k 9M2Mj2WFFys AvZiSnngZjA DStCmEElxW0 CSjh4NrnxLE 6qVgF1OO_cw 6YEM7m8owJ4 9S2QuAHo24c
H_5UviR2nTU YmAkTgcRUsY nick8PeAXLA D8olpXjblQ0 4tDIBl14AX8 D1hAji3BgJw -fax07t_o5s 06OeGk5Iu-s 4XV3SBMQgXE 8CtX9G07bMU Ag3KKsIrax4 3PfBlaosAmY.

## art-audit-q4 (2026-11-25 ~2:45-3:30 PM ET, Hark): QA of the pushed q4 commits + art_audit_todo q4 leftovers - DONE
Tool: app/tools/art_q4_fix.py (new jobs board_pieces, crater, golem_avatar, specks, survivors, sword_king, shotgun_king, three_plus,
ambush_gaps, klub4konej, zach, cat_knight_av; helper cutout() keys a background mask flooded from the crop border).
- QA first: the 11 ids of 9a40657 9a466c3 39ed59d (y5MBC8OCYlI sEXa38X1bhY wMdAOirSvQQ x-ISu_8MDvY qSwTtgUWqUw vDzojyJO3sI vQ3hLgU6jLA
  xjEz7bCQxho oGP4TUDjSVk tsqxjK8GP10 pHItplJMih0): 22/22 ok, nothing to fix.
- dd7a704 uncut square bgs (8): shadow, SCP-939 + Mal0 (from research/frames/video_thumbs/<id>_maxresdefault.jpg, added), lapis, orange
  knight, Landmine crater (green square keyed; the white pawn standing in it removed and the ring/pit filled by rotated copies of the
  crater = inferred, so an empty exploded square no longer shows a ghost pawn), Pawnbarian Golem Fortress avatar (maxres2 token).
  Boiled One red square kept (frames: the piece is a red square).
- 2a0b26f specks: Chaturanga chariot/elephant, sword king, Table Tactics slime, Survivors joker + peg recut from maxres3.
- 4168158 Fairy-Stockfish avatar for o8XcmMCIhIk + onv0NOspxH8 -> shared U_irVoLjtNI/stockfish.png.
- 178ce9d frame checks: 3+ icon recut, Shotgun King avatar recut, Ambush soldier/sergeant recut with the black outline lines in the
  gaps, Klub4Konej owl = chess.com avatar (https://images.chesscomfiles.com/uploads/v1/user/332003097.a562041e.200x200o.07e91296c402.jpg,
  research/frames/sprites_web/chesscom_klub4konej.png), Gambonanza scan lines = the game's CRT filter (kept).
- 6514b9e Zach = chess.com Zach-BOT (https://images.chesscomfiles.com/uploads/v1/user/560979413.a48f5f20.200x200o.eefb10043bdc.png,
  sprites_web/chesscom_zach-bot.png) on the video's purple; 67d7bbe cat_knight_av black strip.
- Note: images.chesscomfiles.com answers 403 to curl without a browser User-Agent + Referer: https://www.chess.com/; api.chess.com is
  behind Cloudflare from the sandbox (web_fetch works).
- LEFT: t61xLLQbotM magnus (14 modes): no exact copy (MagnusCarlsen's chess.com avatar is now a different picture; no Magnus bot account).
QA (qa_all.py --widths 390,360 --redo --par 1, /workspace/work/qa_art-q4): 30 ids, 60/60 ok, 0 errors, 0 missing.
