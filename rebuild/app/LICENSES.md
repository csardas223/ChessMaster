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
- Core board sounds: chess.com's default sound set (assets/sounds/*.mp3).
- Mode effect sounds (assets/sounds/*.wav, assets/modes/*/*.wav): synthesised for this project.
- assets/pieces/staunton3d: original procedural renders (tools/g3d_staunton.py) for this project; no third-party art.

- Ji7frCIfmAQ/zombie.png: Twemoji U+1F9DF, (c) Twitter/jdecked contributors, CC-BY 4.0, https://github.com/jdecked/twemoji
- sprite-fix4: mwv48BWl2DY/scp966.png, PGBHL6Nc4X0/deer.png, gHAmif0TenY/waldo.png are the creator's own sprites from iwantcheckmate.com/challenges/<name>/ (used as fan recreation of the same channel's modes).
- sprites-hard: rf2HSTXTehE/queen_face.png, _RFXN1Ye3sY/queen_face.png and _RFXN1Ye3sY/ouroboros_queen.png are cut from the Ouroboros Queen illustration in The Ouroboros King press kit (illustration by Isaac Murgadella, (c) Oriol Cosp Games; press kit offered for coverage at https://oriolcosp.com/the-ouroboros-king). Used as fan recreation of the iwantcheckmate video that plays this game; not a free licence.
- sprites-hard: _Kx4ChHuCgI/oldman.png is the creator's own SCP-106 sprite from iwantcheckmate.com/challenges/containment-breach/assets/oldman-new.png (same basis as the sprite-fix4 line above). SCP-106 is a SCP Foundation concept (CC BY-SA 3.0).
- sprites-hard: JUlTxosCXuk/scp2774.png and U67wZoy-1fE/despair.png are cut from the videos' own frames/thumbnails (iwantcheckmate). SCP-2774 is a SCP Foundation concept (CC BY-SA 3.0).
