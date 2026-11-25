> **NEXT AI (WIP 2026-11-25 1:25 PM ET, QA agent):** the 360px pass is still running; 'Not run' rows are modes not yet checked at 360. Resume from rebuild/app: `python3 tools/qa_all.py --widths 390,360 --par 2 --budget 98 --results <dir>` until it prints 'all done', then `--report-only`. Fixed so far: board.image/texture url 404 (ca9c282), core UI Resign/back/history/LICENSES (3f22e8e).

# Full headless QA report

Generated 2026-11-25 18:20 by `rebuild/app/tools/qa_all.py` (widths 390, 360 px, 3 human plies per mode via the real tap handlers, drops/placement included; game frames driven by keys).
A mode fails on: no start, any console/page error, a local file 4xx, horizontal overflow, board wider than the screen, a bot that never answers, or no playable first move. Warnings do not fail a mode.

| Group | Modes | Pass | Fail | Not run |
|---|---|---|---|---|
| 0 not in impl_1..6 (proof/core modes) | 6 | 0 | 0 | 6 |
| 1 Horror/Powerups/Dice | 64 | 2 | 0 | 62 |
| 2 Drawback Chess + Variant Bots | 67 | 8 | 0 | 59 |
| 3 Challenges & Odds | 102 | 5 | 0 | 97 |
| 4 Other + Variants A | 85 | 10 | 0 | 75 |
| 5 Variants B | 88 | 0 | 0 | 88 |
| 6 Variants C | 87 | 0 | 0 | 87 |
| **All** | 499 | 25 | 0 | 474 |

## Failures by group (group agents: fix these in your mode files)

None.
## Warnings (not failures)

### Group 4

- `-TKJGtBKK8U` Infinite Craft: Make Chess: 390px: game canvas did not change on arrow/jump/action keys (mouse-driven game?); 360px: game canvas did not change on arrow/jump/action keys (mouse-driven game?)

## Gravity platformer (rx-HCGCNuDo) check

```
{
 "start": {
  "kx": 4.5,
  "ky": 0,
  "vx": 0,
  "vy": 0,
  "ground": true,
  "swing": 0,
  "timer": 2.591199999999908,
  "moves": 0,
  "stabs": 0,
  "black": 16,
  "level": 0
 },
 "afterRun": {
  "kx": 6.256439999999993,
  "ky": 0,
  "vx": 0,
  "vy": 0,
  "ground": true,
  "swing": 0,
  "timer": 1.9745999999999087,
  "moves": 0,
  "stabs": 0,
  "black": 16,
  "level": 0
 },
 "peak": 1.2583658999999996,
 "afterJump": {
  "kx": 6.256439999999993,
  "ky": 0,
  "vx": 0,
  "vy": 0,
  "ground": true,
  "swing": 0,
  "timer": 0.3912999999999087,
  "moves": 0,
  "stabs": 0,
  "black": 16,
  "level": 0
 },
 "afterSwing": {
  "kx": 6.256439999999993,
  "ky": 0,
  "vx": 0,
  "vy": 0,
  "ground": true,
  "swing": 0,
  "timer": 0.10799999999990853,
  "moves": 0,
  "stabs": 0,
  "black": 16,
  "level": 0
 },
 "afterTimer": {
  "kx": 6.256439999999993,
  "ky": 0,
  "vx": 0,
  "vy": 0,
  "ground": true,
  "swing": 0,
  "timer": 1.4247999999999121,
  "moves": 1,
  "stabs": 0,
  "black": 16,
  "level": 0
 },
 "ok": true,
 "why": "",
 "over": null
}
```

