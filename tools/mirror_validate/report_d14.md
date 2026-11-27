# MirrorFish review validation (d14)

In-game evaluator (CM.mirrorReview.evalFen, d14: sf18_* = Stockfish 18 lite NNUE, d* = Fairy-Stockfish fallback) vs native Stockfish reference (ref.json), same grade() thresholds. 79 plies from 4 games.

- same class: **51/79 (64.6%)**
- within one level: 73/79 (92.4%)
- severe (Book/Best/Great/Brilliant/Excellent vs Mistake/Miss/Blunder): **1**

| ref \ in-game | book | brilliant | great | best | excellent | good | inaccuracy | mistake | miss | blunder |
|---|---|---|---|---|---|---|---|---|---|---|
| book | 10 |  |  |  |  |  |  |  |  |  |
| brilliant |  | 2 |  |  |  |  |  |  |  |  |
| great |  |  | 10 | 3 |  |  |  |  |  |  |
| best |  |  | 3 | 20 | 2 |  |  |  |  |  |
| excellent |  |  |  | 3 | 2 | 1 | 1 | 1 |  |  |
| good |  |  |  | 1 |  | 1 | 1 |  |  |  |
| inaccuracy |  |  |  | 1 | 1 | 5 | 1 | 2 | 1 |  |
| mistake |  |  |  |  |  |  | 1 | 3 | 1 |  |
| miss |  |  |  |  |  |  |  |  |  |  |
| blunder |  |  |  |  |  |  |  |  |  | 2 |

## Disagreements

| ply | move | reference | in-game | ref EP loss | in-game EP loss |
|---|---|---|---|---|---|
| Opera Game#5 | c8g4 | inaccuracy | good | 0.050 | 0.028 |
| Opera Game#7 | g4f3 | good | inaccuracy | 0.048 | 0.060 |
| Opera Game#10 | f1c4 | excellent | best | 0.019 | 0.000 |
| Opera Game#11 | g8f6 | inaccuracy | good | 0.090 | 0.031 |
| Opera Game#12 | f3b3 | great | best | 0.000 | 0.000 |
| Opera Game#14 | b1c3 | excellent | best | 0.011 | 0.000 |
| Opera Game#17 | b7b5 | inaccuracy | mistake | 0.063 | 0.105 |
| Opera Game#25 | d8d7 | good | best | 0.032 | 0.000 |
| Opera Game#27 | e7e6 | inaccuracy | best | 0.054 | 0.000 |
| Immortal Game#5 | d8h4 | excellent | good | 0.009 | 0.043 |
| Immortal Game#7 | b7b5 | inaccuracy | mistake | 0.051 | 0.110 |
| Immortal Game#9 | g8f6 | excellent | best | 0.019 | 0.003 |
| Immortal Game#12 | d2d3 | inaccuracy | good | 0.074 | 0.036 |
| Immortal Game#13 | f6h5 | inaccuracy | good | 0.088 | 0.042 |
| Immortal Game#14 | f3h4 | mistake | inaccuracy | 0.118 | 0.084 |
| Immortal Game#16 | h4f5 | great | best | 0.000 | 0.000 |
| Immortal Game#17 | c7c6 | excellent | mistake | 0.019 | 0.131 |
| Immortal Game#18 | g2g4 | inaccuracy | good | 0.051 | 0.048 |
| Immortal Game#19 | h5f6 | excellent | inaccuracy | 0.009 | 0.077 |
| Immortal Game#20 | h1g1 | best | great | 0.000 | 0.000 |
| Immortal Game#28 | c1f4 | best | excellent | 0.000 | 0.010 |
| Immortal Game#29 | g5f6 | best | excellent | 0.000 | 0.013 |
| Immortal Game#32 | c3d5 | inaccuracy | excellent | 0.062 | 0.009 |
| Immortal Game#35 | c5g1 | mistake | miss | 0.115 | 0.596 |
| Immortal Game#36 | e4e5 | inaccuracy | miss | 0.058 | 0.357 |
| Immortal Game#37 | b2a1 | best | great | 0.000 | 0.000 |
| Immortal Game#38 | f1e2 | great | best | 0.000 | 0.000 |
| Immortal Game#40 | f5g7 | best | great | 0.000 | 0.000 |
