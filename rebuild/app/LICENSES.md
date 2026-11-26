# Chess Master: asset licenses

Chess Master is an unofficial iwantcheckmate fan remake. Videos, mode art cut from the videos, the iwantcheckmate name and
logo belong to iwantcheckmate (https://www.youtube.com/@iwantcheckmate).

## Piece sets (assets/pieces/)
| Set | License |
| --- | --- |
| Staunty (default) | CC BY-NC-SA 4.0, by sadsnake1, as distributed by lichess.org (lichess-org/lila `public/piece/staunty`, commit 5b44d71); see assets/pieces/LICENSE-staunty-CC-BY-NC-SA-4.0.txt. Unmodified. The same set iwantcheckmate.com uses. NonCommercial: this fan project is free and non-commercial. |
| Classic (cburnett) | GPLv2+ (Colin M.L. Burnett, as distributed by lichess.org) |
| Merida | GPLv2+ (Armando Hernandez Marroquin, as distributed by lichess.org) |
| Chessnut | Apache-2.0, see assets/pieces/LICENSE-chessnut-Apache-2.0.txt |
| Fantasy, Celtic, Spatial | MIT (Maurizio Monge, chess-art), see assets/pieces/LICENSE-chess-art-MIT.txt |
| MPChess | GPLv3+ (as distributed by lichess.org) |

## Code
- three.js r170 (MIT), js/vendor/three.min.js, see js/vendor/three.LICENSE.txt
- Stockfish (GPLv3) is loaded at runtime from unpkg; it is not bundled. Builds: stockfish@19.0.1 (Stockfish 19 lite),
  stockfish@17.1.0 (Stockfish 17.1 lite), stockfish@10.0.2 (Stockfish 10, stockfish.js by Nathan Rugg).
- Maia chess weights (GPLv3, CSSLab, University of Toronto, https://github.com/CSSLab/maia-chess) are loaded at runtime
  from jsDelivr / raw.githubusercontent.com (commit 749204c); they are not bundled. js/bot/maia.js decodes the
  Leela Chess Zero network format (lczero-common net.proto, GPLv3) and runs the network.
- Fairy-Stockfish (GPLv3, Fabian Fichter and the Stockfish developers, https://github.com/fairy-stockfish/Fairy-Stockfish)
  is bundled in js/vendor/fairy-stockfish/ (fairy-stockfish.js + fairy-stockfish.wasm, license text in COPYING.txt) as
  the bot for variant modes listed in data/fairy_modes.js. It is a single-threaded WebAssembly build made for this
  project from fairy-stockfish/fairy-stockfish.wasm commit 718ebc6801702408f6650598cc52bcf87946696c; the complete
  corresponding source is that commit plus tools/fairy-stockfish/single-thread.patch, pre_single.js and post_worker.js,
  built by tools/fairy-stockfish/build.sh.

## Sounds
- All game sounds (assets/sounds/*.mp3, assets/sounds/{tick,jumpscare,explosion}.wav, assets/modes/*/*.wav) are made for
  this project by tools/sfx/make_sfx.py: CC0 1.0 (public domain) recordings, cut, layered and processed by us, plus
  noise risers and sine sub booms we synthesise ourselves. The source clips live in tools/sfx/sources/;
  tools/sfx/sources.md lists every clip with its origin. Thanks to:
  - Kenney (kenney.nl): Impact Sounds, RPG Audio, Casino Audio, UI Audio packs, CC0 1.0.
  - VCSL, the Versilian Community Sample Library by Versilian Studios / Sam Gossner (github.com/sgossner/VCSL), CC0 1.0:
    pipe organ, woodblock, drums.
  - VSCO 2 Community Edition by Versilian Studios / Sam Gossner (github.com/sgossner/VSCO-2-CE), CC0 1.0:
    cello / viola / violin section sustains (the warm pads), timpani.
  - Freesound (freesound.org) users acidsnowflake, AmishRob, analogchill, AudioPapkin, Bidone, elonen, florianreichelt,
    Jofae, kintana24, LeMudCrab, michorvath, Mikes-MultiMedia, newagesoup, qubodup, Qvantor, spookymodem, tommccann,
    unfa, vlammenos: individual sounds marked CC0 1.0 (ids and links in tools/sfx/sources.md).
- assets/sounds/lichess/*.mp3 (not used by the game): the Lichess "piano" sound set by Enigmahack, AGPLv3+,
  from lichess-org/lila `public/sound/piano`; see assets/sounds/README.md.
- assets/pieces/staunton3d: original procedural renders (tools/g3d_staunton.py) for this project; no third-party art.

- Ji7frCIfmAQ/zombie.png: Twemoji U+1F9DF, (c) Twitter/jdecked contributors, CC-BY 4.0, https://github.com/jdecked/twemoji
- sprite-fix4: mwv48BWl2DY/scp966.png, PGBHL6Nc4X0/deer.png, gHAmif0TenY/waldo.png are the creator's own sprites from iwantcheckmate.com/challenges/<name>/ (used as fan recreation of the same channel's modes).
- sprites-hard: rf2HSTXTehE/queen_face.png, _RFXN1Ye3sY/queen_face.png and _RFXN1Ye3sY/ouroboros_queen.png are cut from the Ouroboros Queen illustration in The Ouroboros King press kit (illustration by Isaac Murgadella, (c) Oriol Cosp Games; press kit offered for coverage at https://oriolcosp.com/the-ouroboros-king). Used as fan recreation of the iwantcheckmate video that plays this game; not a free licence.
- sprites-hard: _Kx4ChHuCgI/oldman.png is the creator's own SCP-106 sprite from iwantcheckmate.com/challenges/containment-breach/assets/oldman-new.png (same basis as the sprite-fix4 line above). SCP-106 is a SCP Foundation concept (CC BY-SA 3.0).
- site-cov: icm-scp4975/scp4975.png and icm-scp4975/thumb.jpg are the creator's own SCP-4975 sprite and thumbnail from iwantcheckmate.com/challenges/crack/crack.png and /challenge-thumbnails/crack.png (same basis as the sprite-fix4 line above). SCP-4975 is a SCP Foundation concept (CC BY-SA 3.0).
- sprites-hard: JUlTxosCXuk/scp2774.png and U67wZoy-1fE/despair.png are cut from the videos' own frames/thumbnails (iwantcheckmate). SCP-2774 is a SCP Foundation concept (CC BY-SA 3.0).
- blurry-a (s6): JAz_qMQpI1o piece icons are from The Ouroboros King (c) Oriol Cosp, taken from the game's official press kit screenshots (https://oriolcosp.com/the-ouroboros-king/), used for a non-commercial fan recreation of the iwantcheckmate video.

## Sprites replaced by blurry-b (2026-11-26)
- game-icons.net icons (CC BY 3.0, https://game-icons.net, SVGs from https://github.com/game-icons/icons), rendered to 512px PNG:
  rf2HSTXTehE/draw_offer.png "Shaking hands" by Delapouite; gold.png "Cash" by Lorc; item_rewind.png "Anticlockwise rotation" by Delapouite;
  relic_bell.png "Ringing bell" by Lorc; relic_finisher.png "Flanged mace" by Delapouite; relic_sigil.png "Ouroboros" by Lorc; relic_wings.png "Angel outfit" by Lorc.
- chess.com profile pictures of the opponents shown in the videos (fan recreation, as the existing avatars): vwJw6aaggn8/pepe.png (pepe-bot), tVAelwglnH8/opp2.png (genkiman), yXE14E0QKNI/opp1.png (professork2014); tH7eOK3Lr1A/opp1.png redrawn from ib_q's chess.com letter avatar.
- pzxXxIsKRRo/w*.png and muzzle.png: the existing Shotgun King pixel sprites scaled up nearest-neighbour (no new art).
- blurry-a (s6): BYg7rV53WrM/darkness.png (dark-fuzz + dark-eyes) and mm11vzcLPhk/you.png (channel-logo.png) are the creator's own art from iwantcheckmate.com. Opponent avatars 134MBhzRN2c/johnnyearp+will, WXcmWG7Eczs/opponent, GGvpHVEgqwY/opponent, f4O--Ai7B9A/opp2, 3PfBlaosAmY/opponent are those players' own chess.com profile pictures (fan use, unchanged except resizing).
- blurry-a (s6): Kzt9ItpGtYg gem/nugget/gold_bag from Pawnbarian (c) j4nw, official press-kit screenshot (https://j4nw.com/pawnbarian/presskit), fan use. Kzt9ItpGtYg/heart.png: 'heart-organ' by Lorc, game-icons.net, CC BY 3.0 (recoloured).
- blurry-b: zP9TzlgA-W0/hero.png is Pawnbarian's class art (c) j4nw, from the Pawnbarian Fandom wiki, re-traced for a non-commercial fan recreation of the iwantcheckmate video.
- blurry-b: sprites marked "re-traced" in source.notes are the existing video crops re-drawn as clean vectors with tools/sprite_vec.py (no new third-party art); w15Ev7q2HmI/x.png and zP9TzlgA-W0/heart_full.png are drawn/composited for this project.
- bl-1 (s7): chess.com bot avatars (fan use, resized only): 2Sud5_YAp84/djron+ghosted+trisha, AtmctmxLq58/azeez+vinh, XhtzHTEsh9Q/opponent (Martin), QXSrAkEF744/sinta_bot, amZRnocbNr8/opponent (11-Year-Old Judit Polgar bot, chess.com news art). Cs6knoD0INQ/ai.png is built from YouTube Playables "Chess Classic" (c) Famobi assets (parchment pad + redrawn cpu icon).
- bl-2 (s7): zP9TzlgA-W0/cappy_bear.png is Pawnbarian enemy art (c) j4nw from the Pawnbarian Fandom wiki (File:Spark_Imp.jpg), re-rendered for a non-commercial fan recreation of the iwantcheckmate video. prd7LxnJtL4/die.png uses the cburnett queen (GPLv2+, as assets/pieces/cburnett). Other bl-2 sprites are the existing video crops re-drawn (tools/bl2/, tools/sprite_repix.py) or drawn for this project (procedural tiles, trophy, bubble); no new third-party art unless named here.
- sync-qa (2026-11-26): hTTtJIdPVrc/freeze_potion.png and jump_potion.png are game-icons.net 'square-bottle' and 'round-bottom-flask' by Lorc (CC BY 3.0, https://game-icons.net), recoloured; JAz_qMQpI1o/gold.png, relic_sigil.png, rewind.png reuse the game-icons.net icons listed above for rf2HSTXTehE; B5LGzOEZSyo/face_*.png use the cburnett piece set (assets/pieces/cburnett, see its licence above); zP9TzlgA-W0/loot_crystal.png and loot_gold.png reuse the Pawnbarian press-kit gem/nugget listed above for Kzt9ItpGtYg.

## Sprites replaced by fin-sprites-a (2026-11-26)
- 8XmhGMnypjc/opponent.png: Mona Lisa, Leonardo da Vinci (public domain), Wikimedia Commons scan by C2RMF.
- BbgwPj-u_gs/opponent.png: 5D Chess With Multiverse Time Travel (c) Thunkspace, official Steam store screenshot, fan use (non-commercial recreation).
- YZjdissxTyA/opponent.png: Goomba sprite from Super Mario Bros. (c) Nintendo, as the chess.com user's avatar in the video, fan use.
- DoImibR93tA/solo.png: chess.com Solo Chess logo (c) Chess.com, redrawn, fan use. LfzNhUjl3qE/sleepy_martin.png: chess.com Martin bot (c) Chess.com, redrawn, fan use.
- Other fin-sprites-a avatars (3_eutZExN2c, 5K72RRDBN5U, 88CgS9anXJs, 98Fzc7uQ7Ns, GH9tTFMWEUg, Oj5rYPqpldg, QrKIKcYN5m4, UZ79sKLa6z4, f4O--Ai7B9A/opp1, inm7KvllVu0/stockfish, nFY-Hn6xiOI/opp3, boaA9_TjXeU/bot_icon, Ugw05nktuDM/slingshot, ZP5cnusxKgA) are AI-assisted restorations / redraws of the video crops made for this project (see each source.notes); hv_NHWqysZE/swamp.jpg is the video background re-thresholded. No new third-party art beyond what is named here.
- fin-sprites-b (2026-11-26): sGXmiyvZDE4/gold.png = game-icons.net 'gold-nuggets' by Delapouite (CC BY 3.0, https://game-icons.net), recoloured. yXE14E0QKNI/opp2.png from the CC0 'Trafalgar law logo' (OpenClipart via https://freesvg.org/trafalgar-law-logo; the One Piece emblem itself is Eiichiro Oda / Shueisha, fan use as the opponent's avatar). vvCAEWKttT4/solo.png = chess.com's Solo Chess icon (chess.com, fan use, as shown in the video). smg98qv_xa0/opp1.png = the player's own chess.com avatar (fan use, as shown in the video). vIvVdaTQi3s/panicfish.png = iwantcheckmate.com's PanicFish art (the creator's own). qfHZlae8XVU/opp1, xim3ocTGn4E/opp3, qUROR6pcKKw/promotion_picker (cburnett pieces, see above), sGXmiyvZDE4 wB/wP/orb: original redraws.
- fin-sprites-b (2026-11-26): nick8PeAXLA/wheel.png and 6YEM7m8owJ4/wheel.png are original vector redraws (6YEM icons = cburnett pieces, see above).
- fin2-fx-b (2026-11-26): tfPyy36nwc4/arthur.png = chess.com Arthur bot avatar (c) Chess.com, upscaled, fan use. mvPXhAMcT7I/fairy_stockfish.png = Fairy-Stockfish logo, CC BY-NC-SA 4.0 by the Fairy-Stockfish team (https://github.com/fairy-stockfish). v2QhfoGAp_I/reserve_icon.png uses the chess.com Neo knight (c) Chess.com, fan use. sO-lD2On610/pellet_rook.png + pellet_pawn.png are original vector redraws.
