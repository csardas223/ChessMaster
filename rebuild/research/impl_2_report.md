# impl_2 report: Group 2 (Drawback Chess + Variant Bots), 67 ids

Status for the next AI. Ids: `research/impl_2.json`. Shared hooks: `app/js/modes/g2_drawback.js` (38 Drawback Chess
videos, 123-drawback catalogue), `app/js/modes/g2_fish.js` + byte-identical `g2_elofish.js` (29 Variant Bot videos:
Martinfish, rating-changing Stockfish/Martin bots, move-rule fish, WorstFish vs Zach spectator game).

## Pass 1: 67/67 mode files exist

## Verification vs specs (impl-2, 2026-11-24 ~10 PM ET)
Checked every mode file against `research/modes/<id>.json`: board size/colours, setup FEN, player side (incl. per-game
sides and `side: 'random'`), opponent name/rating/avatar, bot rule / Elo rule, per-game drawback pairs, view
(see / hidden / flash), goal, clocks. Also cross-checked drawback card texts against frame notes (research/frames).
Fixes:
- `g2_drawback.js` Rook Fan Club: frames show the full card "You must promote to rooks. Your king and queen cannot
  move diagonally"; the diagonal ban for K/Q was missing. Added.
- `ZOcZ-pkPuYQ`: video has 4 games; game 4 (White, the "King of the Hill" game) was missing. Added with random hidden
  drawbacks (King of the Hill / Body Snatcher / Nurturer card texts never shown, so not invented).
Confirmed correct (looked suspicious, are not): Lethal Attraction = "farther from the opponent's king" (frames
visual_* for ZlQHLtMma54 confirm; cvMXLpdwWsc spec's "adjacent" was a cut-off read). Horse Lover (rbfC90ZzPW8) is a
label for the unnamed "can't take knights" drawback.
Known inferences kept (documented in each file's `source.notes`): ClockFish ramp (+240/min from 250, from thumbnail),
TortureFish "31 pieces" meaning, which game had which pairing in several Drawback videos.

## Pass 2 / art pass (2026-11-24 10:45 PM ET, owner art direction: copy the videos' art)
Script: `app/tools/g2_art.py` (re-run from rebuild/app; downloads thumbnails to $G2_THUMBS or /tmp/g2thumbs).
- Variant Bots (29 modes): every avatar is the video's own art. 18 come from research/frames/sprites (commit d34107d);
  the 11 that had no sprite were previously "recreated"/edited (TiredFish, ZebraFish, PanicFish, Alternate Fish, Martin x2,
  Smarten, BetaFish SVG, Martinfish Y0LO, Zach, WorstFish SsOt) and are now straight crops of each video's maxresdefault
  thumbnail (Martin in Q6sj5N3oQjI uses the Martin art from nx6jkHl2k_Y's thumbnail). betafish.svg deleted.
- Drawback Chess (38 modes): the generated "animal" SVG avatars in g2_drawback.js were removed; the Drawback site in the
  videos shows names only, so the UI's plain initials chip is used. The drawback card was restyled to the site's card as seen
  in frames (#595391 card, centred white text, Record line) and its Easy..Hard slider is the video's own image
  (assets/modes/evpcydnu8To/drawback_slider.png). Side panel colour now the site's #2f2d55.
  Whole sprites shipped: evpcydnu8To + ypac0SBFqb8 open with the video's Lame Duck card screenshot (param intro_card);
  2r5tef-Qdyg shows the video's post-game reveal screen when the opponent's drawback is Quit Horsing Around (param reveal).
- Still not video-exact (next AI): card text is HTML in the site's style (texts vary per drawback, no frame for each);
  the slider marker is the one baked into the video image; no sounds specific to these videos were identified.
- todo_pass2: 0 items in group 2.

## QA (2026-11-24 10:45 PM ET)
Headless chromium at 390px (script used: /workspace/work/g2_qa.py, same play routine as tools/test_browser.py; needs
libatk/libXcomposite/libXdamage/libatspi on LD_LIBRARY_PATH in the sandbox): 67/67 modes load, play 4 random moves with
bot replies, 0 console errors, 0 404s, no horizontal overflow. (unpkg stockfish CORS error ignored as in test_browser.py.)

## impl-2b (2026-11-24 ~11:50 PM ET, replacing the stopped impl-2)
### Sounds (owner change 11:41 PM ET: no audio from the videos)
- Video audio extraction scrapped: no converter is used, partial downloads deleted, nothing committed.
- Core board sounds = chess.com default set, downloaded from images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/<name>.mp3
  (needs a browser User-Agent) into app/assets/sounds/*.mp3: move-self, move-opponent, capture, castle, promote, move-check,
  game-start, game-end, illegal, notify, premove, tenseconds. js/core/sound.js maps those names to the mp3s for every mode
  (spec modes, game frames, legacy port). New wiring: premove plays when a premove is set (spec-game.js setPremove);
  tenseconds plays once when the player's running clock drops under 10 s (game-ui.js setClocks).
- The 10 synthesised core WAVs were deleted; tick/jumpscare/explosion stay ours (tools/make_sounds.py now writes only those).
- Mode effect sounds (assets/modes/<id>/*.wav) unchanged, as the owner asked.
### Avatars / invented-art audit (cross-group, impl-2b)
- Removed the last invented avatar SVGs: assets/avatars/you.svg, stockfish.svg, ghost.svg; JUlTxosCXuk sloth.svg + scp.svg; xp6Pr-rB4JA backrooms.svg.
- New generic avatars copied from the videos: assets/avatars/iwantcheckmate.png (the purple-king avatar other groups use; default player
  avatar in spec.js, game-frame.js, legacy glue.js), assets/avatars/stockfish.png (chess.com's Stockfish bar avatar cut from cYVauucyLyQ;
  default for any opponent named Stockfish, lobby, legacy port). Vr3WOIRAXoI (Fairy-Stockfish) uses 3Sr5lJbHKKU/fairy_stockfish.png.
- SCP-2774 piece = research sprite JUlTxosCXuk_scp2774.png (assets/modes/JUlTxosCXuk/scp2774.png); Backrooms opponent = the video's
  horror face sprite (xp6Pr-rB4JA/horror_face.png), player = iwantcheckmate.
- Drawback Chess (38 g2 modes): player + opponent avatar null (the site shows names only), so no generic bot/you art.
- Left generic on purpose: assets/avatars/bot.svg (fallback in legacy glue.js and g6_ladder.js; still named in 9pHhqAbQS0s (g1),
  AaHmMC3HA0E + D8olpXjblQ0 (g4), tfPyy36nwc4 (g6) where those group agents were mid-edit tonight). WEYUcaJTBso/pixel/*.svg wrap PNGs cut
  from the video and cYVauucyLyQ/pieces/*.svg is the lichess cburnett set the video uses: both are real art, kept.
