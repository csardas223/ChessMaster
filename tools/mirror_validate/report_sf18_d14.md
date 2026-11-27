# MirrorFish review validation (sf18_d14)

In-game evaluator (CM.mirrorReview.evalFen, sf18_d14: sf18_* = Stockfish 18 lite NNUE, d* = Fairy-Stockfish fallback) vs native Stockfish reference (ref.json), same grade() thresholds. 207 plies from 4 games.

- same class: **162/207 (78.3%)**
- within one level: 200/207 (96.6%)
- severe (Book/Best/Great/Brilliant/Excellent vs Mistake/Miss/Blunder): **1**

| ref \ in-game | book | brilliant | great | best | excellent | good | inaccuracy | mistake | miss | blunder |
|---|---|---|---|---|---|---|---|---|---|---|
| book | 22 |  |  |  |  |  |  |  |  |  |
| brilliant |  | 5 |  |  |  |  |  |  |  |  |
| great |  |  | 23 | 2 |  |  |  |  |  |  |
| best |  |  | 2 | 78 | 8 | 2 |  |  |  |  |
| excellent |  |  |  | 9 | 7 | 4 | 1 |  |  |  |
| good |  |  |  | 2 | 2 | 9 | 1 |  |  |  |
| inaccuracy |  |  |  |  | 1 | 5 | 7 | 3 |  |  |
| mistake |  |  |  |  |  |  | 2 | 6 |  |  |
| miss |  |  |  |  |  |  |  |  |  |  |
| blunder |  |  |  |  | 1 |  |  |  |  | 5 |

## Disagreements

| ply | move | reference | in-game | ref EP loss | in-game EP loss |
|---|---|---|---|---|---|
| Opera Game#5 | c8g4 | inaccuracy | good | 0.050 | 0.027 |
| Opera Game#6 | d4e5 | excellent | best | 0.013 | 0.000 |
| Opera Game#7 | g4f3 | good | inaccuracy | 0.048 | 0.078 |
| Opera Game#10 | f1c4 | excellent | best | 0.019 | 0.000 |
| Opera Game#12 | f3b3 | great | best | 0.000 | 0.000 |
| Opera Game#13 | d8e7 | best | excellent | 0.000 | 0.012 |
| Opera Game#14 | b1c3 | excellent | good | 0.011 | 0.020 |
| Opera Game#15 | c7c6 | best | good | 0.000 | 0.022 |
| Opera Game#23 | a8d8 | best | good | 0.000 | 0.025 |
| Opera Game#25 | d8d7 | good | excellent | 0.032 | 0.017 |
| Opera Game#27 | e7e6 | inaccuracy | excellent | 0.054 | 0.010 |
| Opera Game#29 | f6d7 | good | best | 0.035 | 0.000 |
| Immortal Game#4 | f1c4 | excellent | best | 0.005 | 0.000 |
| Immortal Game#5 | d8h4 | excellent | best | 0.009 | 0.000 |
| Immortal Game#9 | g8f6 | excellent | best | 0.019 | 0.005 |
| Immortal Game#12 | d2d3 | inaccuracy | good | 0.074 | 0.025 |
| Immortal Game#14 | f3h4 | mistake | inaccuracy | 0.118 | 0.076 |
| Immortal Game#19 | h5f6 | excellent | inaccuracy | 0.009 | 0.061 |
| Immortal Game#27 | f6g8 | inaccuracy | good | 0.074 | 0.030 |
| Immortal Game#28 | c1f4 | best | excellent | 0.000 | 0.016 |
| Immortal Game#31 | f8c5 | mistake | inaccuracy | 0.111 | 0.089 |
| Immortal Game#32 | c3d5 | inaccuracy | mistake | 0.062 | 0.101 |
| Immortal Game#33 | f6b2 | best | great | 0.000 | 0.000 |
| Immortal Game#36 | e4e5 | inaccuracy | mistake | 0.058 | 0.198 |
| Immortal Game#40 | f5g7 | best | great | 0.000 | 0.000 |
| Evergreen Game#11 | e5d4 | good | best | 0.024 | 0.001 |
| Evergreen Game#20 | c1a3 | inaccuracy | good | 0.066 | 0.043 |
| Evergreen Game#22 | b3b5 | excellent | good | 0.016 | 0.025 |
| Evergreen Game#24 | b5a4 | great | best | 0.000 | 0.000 |
| Evergreen Game#25 | a5b6 | excellent | good | 0.014 | 0.030 |
| Evergreen Game#31 | f5h5 | best | excellent | 0.003 | 0.010 |
| Evergreen Game#36 | a1d1 | inaccuracy | mistake | 0.056 | 0.112 |
| Game of the Century#13 | c7c6 | excellent | best | 0.010 | 0.001 |
| Game of the Century#17 | d7b6 | good | excellent | 0.025 | 0.015 |
| Game of the Century#18 | c4c5 | inaccuracy | good | 0.052 | 0.032 |
| Game of the Century#20 | f4g5 | blunder | excellent | 0.213 | 0.012 |
| Game of the Century#26 | g5e7 | excellent | best | 0.007 | 0.000 |
| Game of the Century#30 | e7c5 | best | excellent | 0.000 | 0.018 |
| Game of the Century#43 | e2c3 | excellent | best | 0.005 | 0.000 |
| Game of the Century#49 | c3d1 | excellent | best | 0.008 | 0.000 |
| Game of the Century#50 | h2h3 | best | excellent | 0.004 | 0.019 |
| Game of the Century#55 | e8e1 | excellent | good | 0.016 | 0.036 |
| Game of the Century#64 | h3h4 | best | excellent | 0.000 | 0.016 |
| Game of the Century#69 | f8c5 | best | excellent | 0.000 | 0.009 |
| Game of the Century#70 | g1f1 | best | excellent | 0.004 | 0.018 |
