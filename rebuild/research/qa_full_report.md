> **NEXT AI (WIP 2026-11-25 1:27 PM ET, QA agent, stopped by owner):** 676/998 mode×width runs done: 390px all 499 modes, 360px 177/499 (the rest not run yet, shown as 'Not run' below). Only failure seen: `fUQXSj5jVUk` 390 (404 css/assets/modes/fUQXSj5jVUk/board.png), FIXED in shared code by ca9c282 (CM.util.cssUrl), but its cached result predates the fix, so re-check it with `--ids fUQXSj5jVUk --redo`. Core UI scan `python3 tools/qa_ui.py` (390px): 41/41 pass after 3f22e8e (Resign button, back/history, LICENSES.md). To resume, from rebuild/app run `python3 tools/qa_all.py --widths 390,360 --par 2 --budget 98 --results /workspace/work/cm_qa_results --port 8791` repeatedly until it prints 'all done'. If that dir is gone, use a fresh dir and both widths are rerun. Then run `python3 tools/qa_all.py --ids fUQXSj5jVUk --redo --results <dir>` and `python3 tools/qa_all.py --report-only --results <dir>`.

# Full headless QA report

Generated 2026-11-25 18:25 by `rebuild/app/tools/qa_all.py` (widths 390, 360 px, 3 human plies per mode via the real tap handlers, drops/placement included; game frames driven by keys).
A mode fails on: no start, any console/page error, a local file 4xx, horizontal overflow, board wider than the screen, a bot that never answers, or no playable first move. Warnings do not fail a mode.

| Group | Modes | Pass | Fail | Not run |
|---|---|---|---|---|
| 0 not in impl_1..6 (proof/core modes) | 6 | 2 | 0 | 4 |
| 1 Horror/Powerups/Dice | 64 | 20 | 0 | 44 |
| 2 Drawback Chess + Variant Bots | 67 | 22 | 0 | 45 |
| 3 Challenges & Odds | 102 | 40 | 0 | 62 |
| 4 Other + Variants A | 85 | 59 | 0 | 26 |
| 5 Variants B | 88 | 34 | 0 | 54 |
| 6 Variants C | 87 | 0 | 0 | 87 |
| **All** | 499 | 177 | 0 | 322 |

## Failures by group (group agents: fix these in your mode files)

None.
## Warnings (not failures)

### Group 1

- `I_TbJqRHtf4` Secret Queen: 390px: tap input did not move 3x (committed directly); 360px: tap input did not move 3x (committed directly)
- `JPDYufARCQU` Secret Queen (Black): 390px: tap input did not move 3x (committed directly); 360px: tap input did not move 3x (committed directly)

### Group 4

- `-TKJGtBKK8U` Infinite Craft: Make Chess: 390px: game canvas did not change on arrow/jump/action keys (mouse-driven game?); 360px: game canvas did not change on arrow/jump/action keys (mouse-driven game?)
- `6YEM7m8owJ4` Spinner Wheel vs Martin: 390px: tap input did not move 3x (committed directly); 360px: game ended after 0 human plies: the wheel picked a piece that cannot move

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

