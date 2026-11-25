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
