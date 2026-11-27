# MirrorFish review validation (sf18_d16)

In-game evaluator (CM.mirrorReview.evalFen, sf18_d16: sf18_* = Stockfish 18 lite NNUE, d* = Fairy-Stockfish fallback) vs native Stockfish reference (ref.json), same grade() thresholds. 207 plies from 4 games.

- same class: **167/207 (80.7%)**
- within one level: 199/207 (96.1%)
- severe (Book/Best/Great/Brilliant/Excellent vs Mistake/Miss/Blunder): **0**

| ref \ in-game | book | brilliant | great | best | excellent | good | inaccuracy | mistake | miss | blunder |
|---|---|---|---|---|---|---|---|---|---|---|
| book | 22 |  |  |  |  |  |  |  |  |  |
| brilliant |  | 5 |  |  |  |  |  |  |  |  |
| great |  |  | 23 | 2 |  |  |  |  |  |  |
| best |  |  | 1 | 79 | 8 | 2 |  |  |  |  |
| excellent |  |  |  | 8 | 8 | 5 |  |  |  |  |
| good |  |  |  | 2 | 2 | 10 |  |  |  |  |
| inaccuracy |  |  |  |  | 3 | 3 | 9 | 1 |  |  |
| mistake |  |  |  |  |  |  | 1 | 6 |  | 1 |
| miss |  |  |  |  |  |  |  |  |  |  |
| blunder |  |  |  |  |  |  | 1 |  |  | 5 |

## Disagreements

| ply | move | reference | in-game | ref EP loss | in-game EP loss |
|---|---|---|---|---|---|
| Opera Game#5 | c8g4 | inaccuracy | good | 0.050 | 0.027 |
| Opera Game#6 | d4e5 | excellent | best | 0.013 | 0.004 |
| Opera Game#12 | f3b3 | great | best | 0.000 | 0.000 |
| Opera Game#13 | d8e7 | best | excellent | 0.000 | 0.012 |
| Opera Game#14 | b1c3 | excellent | good | 0.011 | 0.033 |
| Opera Game#19 | c6b5 | mistake | inaccuracy | 0.104 | 0.081 |
| Opera Game#23 | a8d8 | best | excellent | 0.000 | 0.010 |
| Opera Game#27 | e7e6 | inaccuracy | good | 0.054 | 0.046 |
| Immortal Game#4 | f1c4 | excellent | best | 0.005 | 0.000 |
| Immortal Game#19 | h5f6 | excellent | good | 0.009 | 0.022 |
| Immortal Game#27 | f6g8 | inaccuracy | excellent | 0.074 | 0.007 |
| Immortal Game#29 | g5f6 | best | excellent | 0.000 | 0.006 |
| Immortal Game#30 | b1c3 | great | best | 0.000 | 0.000 |
| Immortal Game#32 | c3d5 | inaccuracy | mistake | 0.062 | 0.108 |
| Immortal Game#35 | c5g1 | mistake | blunder | 0.115 | 0.202 |
| Immortal Game#36 | e4e5 | inaccuracy | excellent | 0.058 | 0.020 |
| Immortal Game#40 | f5g7 | best | great | 0.000 | 0.000 |
| Evergreen Game#9 | b4a5 | best | good | 0.004 | 0.020 |
| Evergreen Game#11 | e5d4 | good | best | 0.024 | 0.000 |
| Evergreen Game#12 | e1g1 | best | excellent | 0.000 | 0.015 |
| Evergreen Game#20 | c1a3 | inaccuracy | excellent | 0.066 | 0.018 |
| Evergreen Game#22 | b3b5 | excellent | best | 0.016 | 0.000 |
| Evergreen Game#25 | a5b6 | excellent | good | 0.014 | 0.032 |
| Evergreen Game#28 | d2e4 | best | excellent | 0.000 | 0.006 |
| Evergreen Game#31 | f5h5 | best | good | 0.003 | 0.025 |
| Game of the Century#6 | d2d4 | excellent | best | 0.015 | 0.003 |
| Game of the Century#11 | d5c4 | good | excellent | 0.029 | 0.017 |
| Game of the Century#16 | a1d1 | best | excellent | 0.005 | 0.006 |
| Game of the Century#17 | d7b6 | good | excellent | 0.025 | 0.014 |
| Game of the Century#18 | c4c5 | inaccuracy | good | 0.052 | 0.043 |
| Game of the Century#20 | f4g5 | blunder | inaccuracy | 0.213 | 0.051 |
| Game of the Century#26 | g5e7 | excellent | best | 0.007 | 0.002 |
| Game of the Century#27 | d8b6 | excellent | good | 0.007 | 0.043 |
| Game of the Century#41 | d4e2 | best | excellent | 0.000 | 0.008 |
| Game of the Century#43 | e2c3 | excellent | best | 0.005 | 0.003 |
| Game of the Century#49 | c3d1 | excellent | best | 0.008 | 0.000 |
| Game of the Century#59 | c4d5 | excellent | best | 0.016 | 0.000 |
| Game of the Century#66 | f3e5 | excellent | good | 0.016 | 0.030 |
| Game of the Century#68 | h2g1 | good | best | 0.021 | 0.002 |
| Game of the Century#70 | g1f1 | best | excellent | 0.004 | 0.009 |
