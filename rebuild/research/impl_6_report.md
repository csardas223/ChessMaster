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
