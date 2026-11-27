# MirrorFish review validation

The MirrorFish badges (js/modes/g2_fish.js, `CM.mirrorReview`) are our add-on: iwantcheckmate.com shows no move grades.
They follow chess.com Classification V2 (expected points lost: Best 0.00 / Excellent <= 0.02 / Good <= 0.05 /
Inaccuracy <= 0.10 / Mistake <= 0.20 / Blunder; Great, Brilliant, Miss, Book). This folder checks the in-game evaluator
against a native Stockfish on 4 real games (games.pgn: Opera Game, Immortal, Evergreen, Game of the Century; 207 plies).
Both sides are graded by the same `grade()` (plus the same book, sacrifice, recapture and Miss chain), so only the
engine scores differ.

    python3 positions.py                                    # games.pgn -> positions.json
    SF=/path/to/stockfish python3 ref.py --depth 18         # native reference (resumable, rerun until 'done')
    python3 inpage.py --sf-dir <stockfish@18.0.8>/bin --depth 16   # the game's evalFen in headless Chromium (resumable)
    node compare.mjs sf18_d16 [--ref ref.json] --out report_sf18_d16.md

`--sf-dir` serves a local copy of the npm package (`npm pack stockfish@18.0.8`) for the unpkg URL the game loads, since
the sandbox cannot reach the CDN. Reference used: Debian stockfish 17 (arm64), depth 18, MultiPV 2 + searchmoves.

## Results (2026-11-26)

| in-game evaluator | same class | within one level | severe (good <-> Mistake/Miss/Blunder) |
|---|---|---|---|
| **Stockfish 18 lite NNUE, depth 16 (shipped)** | **80.7%** (167/207) | 96.1% | **0** |
| Stockfish 18 lite NNUE, depth 14 | 78.3% | 96.6% | 1 (Byrne 11.Bg5) |
| Fairy-Stockfish classical, depth 14 (fallback, 79 plies) | 64.6% | 92.4% | 1 |
| ceiling check: native Stockfish 17 depth 14 vs the same at depth 18 | 77.8% | 98.6% | 1 |

The ceiling row is the point: the reference engine itself, two depths apart, agrees on the exact class 78% of the time,
because many moves sit on a band edge (0.02 / 0.05 / 0.10) and the bands are narrow. The in-game Stockfish 18 at depth 16
matches the depth-18 reference at least as well as native Stockfish at depth 14 does, with no severe disagreements.
Disagreements are listed per ply in the report files.
