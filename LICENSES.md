# Chess Master: asset licenses

Chess Master is an unofficial iwantcheckmate fan remake. Videos, mode art cut from the videos, the iwantcheckmate name and
logo belong to iwantcheckmate (https://www.youtube.com/@iwantcheckmate).

## Piece sets (assets/pieces/)
| Set | License |
| --- | --- |
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

## Sounds
- All game sounds (assets/sounds/*.mp3, assets/sounds/{tick,jumpscare,explosion}.wav, assets/modes/*/*.wav) are made for
  this project by tools/sfx/make_sfx.py from CC0 1.0 (public domain) recordings, cut, layered and processed by us.
  The source clips live in tools/sfx/sources/; tools/sfx/sources.md lists every clip with its origin. Thanks to:
  - Kenney (kenney.nl): Impact Sounds, RPG Audio, Casino Audio, UI Audio packs, CC0 1.0.
  - VCSL, the Versilian Community Sample Library by Versilian Studios / Sam Gossner (github.com/sgossner/VCSL), CC0 1.0:
    upright piano, pipe organ, woodblock, drums.
  - Freesound (freesound.org) users acidsnowflake, AmishRob, analogchill, Bidone, elonen, florianreichelt,
    kintana24, LeMudCrab, michorvath, Mikes-MultiMedia, qubodup, rhapsodize, spookymodem, tommccann, unfa, vlammenos:
    individual sounds marked CC0 1.0 (ids and links in tools/sfx/sources.md).
- assets/sounds/lichess/*.mp3 (not used by the game): the Lichess "piano" sound set by Enigmahack, AGPLv3+,
  from lichess-org/lila `public/sound/piano`; see assets/sounds/README.md.
- assets/pieces/staunton3d: original procedural renders (tools/g3d_staunton.py) for this project; no third-party art.

- Ji7frCIfmAQ/zombie.png: Twemoji U+1F9DF, (c) Twitter/jdecked contributors, CC-BY 4.0, https://github.com/jdecked/twemoji
