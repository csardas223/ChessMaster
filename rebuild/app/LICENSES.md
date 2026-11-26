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
- blurry-a (s6): JAz_qMQpI1o piece icons are from The Ouroboros King (c) Oriol Cosp, taken from the game's official press kit screenshots (https://oriolcosp.com/the-ouroboros-king/), used for a non-commercial fan recreation of the iwantcheckmate video.

## Sprites replaced by blurry-b (2026-11-26)
- game-icons.net icons (CC BY 3.0, https://game-icons.net, SVGs from https://github.com/game-icons/icons), rendered to 512px PNG:
  rf2HSTXTehE/draw_offer.png "Shaking hands" by Delapouite; gold.png "Cash" by Lorc; item_rewind.png "Anticlockwise rotation" by Delapouite;
  relic_bell.png "Ringing bell" by Lorc; relic_finisher.png "Flanged mace" by Delapouite; relic_sigil.png "Ouroboros" by Lorc; relic_wings.png "Angel outfit" by Lorc.
- chess.com profile pictures of the opponents shown in the videos (fan recreation, as the existing avatars): tVAelwglnH8/opp2.png (genkiman), yXE14E0QKNI/opp1.png (professork2014); tH7eOK3Lr1A/opp1.png redrawn from ib_q's chess.com letter avatar.
- pzxXxIsKRRo/w*.png and muzzle.png: the existing Shotgun King pixel sprites scaled up nearest-neighbour (no new art).
- blurry-a (s6): BYg7rV53WrM/darkness.png (dark-fuzz + dark-eyes) and mm11vzcLPhk/you.png (channel-logo.png) are the creator's own art from iwantcheckmate.com. Opponent avatars 134MBhzRN2c/johnnyearp+will, WXcmWG7Eczs/opponent, GGvpHVEgqwY/opponent, f4O--Ai7B9A/opp2, 3PfBlaosAmY/opponent are those players' own chess.com profile pictures (fan use, unchanged except resizing).
- blurry-a (s6): Kzt9ItpGtYg gem/nugget/gold_bag from Pawnbarian (c) j4nw, official press-kit screenshot (https://j4nw.com/pawnbarian/presskit), fan use. Kzt9ItpGtYg/heart.png: 'heart-organ' by Lorc, game-icons.net, CC BY 3.0 (recoloured).
