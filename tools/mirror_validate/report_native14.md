# MirrorFish review validation (native14)

In-game evaluator (CM.mirrorReview.evalFen, native14: sf18_* = Stockfish 18 lite NNUE, d* = Fairy-Stockfish fallback) vs native Stockfish reference (ref.json), same grade() thresholds. 207 plies from 4 games.

- same class: **161/207 (77.8%)**
- within one level: 204/207 (98.6%)
- severe (Book/Best/Great/Brilliant/Excellent vs Mistake/Miss/Blunder): **1**

| ref \ in-game | book | brilliant | great | best | excellent | good | inaccuracy | mistake | miss | blunder |
|---|---|---|---|---|---|---|---|---|---|---|
| book | 22 |  |  |  |  |  |  |  |  |  |
| brilliant |  | 5 |  |  |  |  |  |  |  |  |
| great |  |  | 24 | 1 |  |  |  |  |  |  |
| best |  |  | 1 | 77 | 11 |  |  | 1 |  |  |
| excellent |  |  |  | 9 | 9 | 3 |  |  |  |  |
| good |  |  |  | 2 | 4 | 5 | 3 |  |  |  |
| inaccuracy |  |  |  |  |  | 5 | 8 | 3 |  |  |
| mistake |  |  |  |  |  |  | 1 | 6 |  | 1 |
| miss |  |  |  |  |  |  |  |  |  |  |
| blunder |  |  |  |  |  |  |  | 1 |  | 5 |

## Disagreements

| ply | move | reference | in-game | ref EP loss | in-game EP loss |
|---|---|---|---|---|---|
| Opera Game#5 | c8g4 | inaccuracy | good | 0.050 | 0.048 |
| Opera Game#6 | d4e5 | excellent | best | 0.013 | 0.000 |
| Opera Game#7 | g4f3 | good | inaccuracy | 0.048 | 0.053 |
| Opera Game#12 | f3b3 | great | best | 0.000 | 0.000 |
| Opera Game#13 | d8e7 | best | excellent | 0.000 | 0.018 |
| Opera Game#14 | b1c3 | excellent | best | 0.011 | 0.000 |
| Opera Game#25 | d8d7 | good | best | 0.032 | 0.000 |
| Opera Game#27 | e7e6 | inaccuracy | good | 0.054 | 0.022 |
| Opera Game#28 | b5d7 | best | mistake | 0.000 | 0.170 |
| Opera Game#29 | f6d7 | good | best | 0.035 | 0.000 |
| Immortal Game#4 | f1c4 | excellent | best | 0.005 | 0.005 |
| Immortal Game#5 | d8h4 | excellent | best | 0.009 | 0.000 |
| Immortal Game#7 | b7b5 | inaccuracy | mistake | 0.051 | 0.100 |
| Immortal Game#10 | g1f3 | best | excellent | 0.002 | 0.007 |
| Immortal Game#14 | f3h4 | mistake | inaccuracy | 0.118 | 0.099 |
| Immortal Game#17 | c7c6 | excellent | good | 0.019 | 0.037 |
| Immortal Game#18 | g2g4 | inaccuracy | good | 0.051 | 0.045 |
| Immortal Game#21 | c6b5 | mistake | blunder | 0.192 | 0.216 |
| Immortal Game#25 | g6g5 | best | excellent | 0.002 | 0.011 |
| Immortal Game#27 | f6g8 | inaccuracy | good | 0.074 | 0.038 |
| Immortal Game#36 | e4e5 | inaccuracy | mistake | 0.058 | 0.140 |
| Immortal Game#40 | f5g7 | best | great | 0.000 | 0.000 |
| Evergreen Game#9 | b4a5 | best | excellent | 0.004 | 0.006 |
| Evergreen Game#11 | e5d4 | good | excellent | 0.024 | 0.011 |
| Evergreen Game#13 | d4d3 | good | inaccuracy | 0.046 | 0.059 |
| Evergreen Game#18 | f1e1 | inaccuracy | good | 0.051 | 0.046 |
| Evergreen Game#36 | a1d1 | inaccuracy | mistake | 0.056 | 0.144 |
| Game of the Century#13 | c7c6 | excellent | best | 0.010 | 0.000 |
| Game of the Century#15 | b8d7 | good | inaccuracy | 0.044 | 0.055 |
| Game of the Century#17 | d7b6 | good | excellent | 0.025 | 0.014 |
| Game of the Century#20 | f4g5 | blunder | mistake | 0.213 | 0.193 |
| Game of the Century#26 | g5e7 | excellent | good | 0.007 | 0.037 |
| Game of the Century#27 | d8b6 | excellent | good | 0.007 | 0.049 |
| Game of the Century#43 | e2c3 | excellent | best | 0.005 | 0.000 |
| Game of the Century#45 | a7b6 | best | excellent | 0.003 | 0.006 |
| Game of the Century#49 | c3d1 | excellent | best | 0.008 | 0.000 |
| Game of the Century#50 | h2h3 | best | excellent | 0.004 | 0.019 |
| Game of the Century#51 | a4a2 | best | excellent | 0.000 | 0.014 |
| Game of the Century#56 | b6d8 | best | excellent | 0.000 | 0.008 |
| Game of the Century#59 | c4d5 | excellent | best | 0.016 | 0.000 |
| Game of the Century#60 | e1f3 | excellent | best | 0.013 | 0.000 |
| Game of the Century#63 | b7b5 | good | excellent | 0.029 | 0.007 |
| Game of the Century#64 | h3h4 | best | excellent | 0.000 | 0.008 |
| Game of the Century#68 | h2g1 | good | excellent | 0.021 | 0.011 |
| Game of the Century#69 | f8c5 | best | excellent | 0.000 | 0.005 |
| Game of the Century#71 | e4g3 | best | excellent | 0.000 | 0.010 |
