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
- sprites-hard: JUlTxosCXuk/scp2774.png and U67wZoy-1fE/despair.png are cut from the videos' own frames/thumbnails (iwantcheckmate). SCP-2774 is a SCP Foundation concept (CC BY-SA 3.0).

## Sprites replaced by blurry-b (2026-11-26)
- game-icons.net icons (CC BY 3.0, https://game-icons.net, SVGs from https://github.com/game-icons/icons), rendered to 512px PNG:
  rf2HSTXTehE/draw_offer.png "Shaking hands" by Delapouite; gold.png "Cash" by Lorc; item_rewind.png "Anticlockwise rotation" by Delapouite;
  relic_bell.png "Ringing bell" by Lorc; relic_finisher.png "Flanged mace" by Delapouite; relic_sigil.png "Ouroboros" by Lorc; relic_wings.png "Angel outfit" by Lorc.
- chess.com profile pictures of the opponents shown in the videos (fan recreation, as the existing avatars): vwJw6aaggn8/pepe.png (pepe-bot), tVAelwglnH8/opp2.png (genkiman), yXE14E0QKNI/opp1.png (professork2014); tH7eOK3Lr1A/opp1.png redrawn from ib_q's chess.com letter avatar.
- pzxXxIsKRRo/w*.png and muzzle.png: the existing Shotgun King pixel sprites scaled up nearest-neighbour (no new art).
- blurry-b: zP9TzlgA-W0/hero.png is Pawnbarian's class art (c) j4nw, from the Pawnbarian Fandom wiki, re-traced for a non-commercial fan recreation of the iwantcheckmate video.
- blurry-b: sprites marked "re-traced" in source.notes are the existing video crops re-drawn as clean vectors with tools/sprite_vec.py (no new third-party art); w15Ev7q2HmI/x.png and zP9TzlgA-W0/heart_full.png are drawn/composited for this project.
