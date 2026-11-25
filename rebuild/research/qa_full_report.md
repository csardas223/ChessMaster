> **NEXT AI (WIP 2026-11-25 1:56 PM ET, QA agent cm-qa):** the old results dir was gone, so this is a FRESH sweep in `/workspace/work/cm_qa_results` (both widths re-run). Split: 360px first half of sorted mode ids = cm-qa (DONE, 250/250), 360px second half = cm-qa2; 390px all ids = cm-qa (first half done, second half in progress). Chessformer `oAoik9Dj2qQ`, `p6W3yDU-v88` deliberately skipped (being rewritten; shown as Not run). `fUQXSj5jVUk` 390 re-checked after ca9c282: PASS. All failures so far were `qa timeout (35 s)` on a CPU-saturated 2-core sandbox (Ji7frCIfmAQ, UZ79sKLa6z4, Uccowk6xbFc, _qxqjb3DseA pass on --redo --par 1; eKAOw0yaqyA 360 still to redo). No real app bug found yet. Resume from rebuild/app: `python3 tools/qa_all.py --widths 390,360 --ids=<ids minus the 2 Chessformer ids> --par 2 --budget 98 --results /workspace/work/cm_qa_results --port 8791` until 'all done' (use `--ids=` with '=', ids starting with '-' break argparse), `--redo --par 1` any 'qa timeout', then `--report-only --widths 390,360` and re-add this note.

# Full headless QA report

Generated 2026-11-25 18:55 by `rebuild/app/tools/qa_all.py` (widths 390, 360 px, 3 human plies per mode via the real tap handlers, drops/placement included; game frames driven by keys).
A mode fails on: no start, any console/page error, a local file 4xx, horizontal overflow, board wider than the screen, a bot that never answers, or no playable first move. Warnings do not fail a mode.

| Group | Modes | Pass | Fail | Not run |
|---|---|---|---|---|
| 0 not in impl_1..6 (proof/core modes) | 6 | 3 | 0 | 3 |
| 1 Horror/Powerups/Dice | 64 | 36 | 1 | 27 |
| 2 Drawback Chess + Variant Bots | 67 | 48 | 0 | 19 |
| 3 Challenges & Odds | 102 | 69 | 0 | 33 |
| 4 Other + Variants A | 85 | 70 | 0 | 15 |
| 5 Variants B | 88 | 88 | 0 | 0 |
| 6 Variants C | 87 | 6 | 0 | 81 |
| **All** | 499 | 320 | 1 | 178 |

## Failures by group (group agents: fix these in your mode files)

### Group 1 (Horror/Powerups/Dice): 1 failing

- `eKAOw0yaqyA` Dice Chess
  - 360px: load: controller never started
  - 360px: qa exception: qa timeout (35 s)

## Warnings (not failures)

### Group 1

- `I_TbJqRHtf4` Secret Queen: 390px: tap input did not move 3x (committed directly); 360px: tap input did not move 3x (committed directly)
- `JPDYufARCQU` Secret Queen (Black): 390px: tap input did not move 3x (committed directly); 360px: tap input did not move 3x (committed directly)
- `epzU65ZEdcs` SCP-096 in the Fog: 390px: game ended after 1 human plies: the king was captured

### Group 2

- `SsOtn3iDkv8` WorstFish vs Zach: 390px: tap input did not move 3x (committed directly); 360px: tap input did not move 2x (committed directly)

### Group 4

- `-TKJGtBKK8U` Infinite Craft: Make Chess: 390px: game canvas did not change on arrow/jump/action keys (mouse-driven game?); 360px: game canvas did not change on arrow/jump/action keys (mouse-driven game?)
- `6YEM7m8owJ4` Spinner Wheel vs Martin: 390px: tap input did not move 1x (committed directly); 360px: game ended after 0 human plies: the wheel picked a piece that cannot move

