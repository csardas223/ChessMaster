> **m4-uiqa interim (2026-11-26 3:10 PM ET, main 5e2a9da incl. cm-home 67bea1ee). qa_all PAUSED by owner order (CPU for cm-home/cm-readme).**
> - qa_all 2026-11-26 run: 227/~1006 mode x width cached in `/workspace/work/m4qa/res` (390 px pass, ids `-...` to ~`R`). Fails so far are all `load: controller never started` / qa or goto timeout at box load 20-36 (CONozr99agQ CxtttdnwNWk EqOwqolOZOo F0nfkeR-QEg FxpWhTj2Cv4 I07GcHQtY2o IbRrzKtieqs Ji7frCIfmAQ KJYUsRlj_34 M0Nr98Axpo8 Mg2Upjjo2yg Nz2A-g73_iM OFtVdbxJI2Y + a few more): redo with `--ids <list> --redo --par 1` when the box is quiet. No rule/UI failure seen yet. OvQYI_S5IZg at 390: PASS now (no board overflow; the 392 px was transient), 360 not run yet.
> - Resume: `nohup setsid /workspace/work/m4qa/run.sh &` (cached per mode+width), then this file = `python3 tools/qa_all.py --report-only --results /workspace/work/m4qa/res`.
> - qa_ui (tools/qa_ui.py): 43/43 on 5e2a9da (after the css/game.css .btn narrowing and the Home pass). Skins step now waits up to 4 s for SVG piece sets (was a 250 ms load flake).
> - npm test 13/13, lint 0 errors (83 warnings), sweep 508/508 ok 0 failed, validate-modes 0 errors (162 warnings: missing title / default opponent) on efba328.
> - **Home regression (for cm-home, lobby not touched here):** tools/qa_scroll_jank.py 4x CPU, same box load (~20), base df207f83 vs 5e2a9da: p50 200-250 ms -> 517-783 ms, p95 400 -> 750-1633 ms, longest task ~470 -> 890-1640 ms, wheel steps in 12 s 17-26 -> 9-13, feed pages appended 3 -> 0. Deterministic DOM count at load (390x844): nodes 1112 -> 2660, cards 44 -> 114, imgs 66 -> 136, spinning placeholders 70 -> 140, shelves 3 -> 8, "All modes" feed top 1890 -> 3399 px. --nospin does not remove it (p50 667), dropping the new card box-shadow/::after/:has rules only helps a little (p50 533): the cost is the 2.4x DOM from the 5 family shelves. Suggest: `content-visibility: auto; contain-intrinsic-size: auto 260px` on `.shelf`, or render family shelves lazily (IntersectionObserver) / fewer cards per shelf. Absolute numbers are inflated by box load; the A/B ratio is the signal. Logs: /workspace/work/m4qa/logs/jank_*.txt.

> **NEXT AI (DONE 2026-11-25 2:13 PM ET, QA agents cm-qa + cm-qa2):** sweep COMPLETE: 994/994 mode x width runs (497 modes x 390/360 px), **497 pass, 0 fail**. Fresh results dir `/workspace/work/cm_qa_results` (the earlier one was lost, so both widths were re-run on current rebuild code). `fUQXSj5jVUk` re-checked after ca9c282: PASS. Every failure seen during the run was a `qa timeout` / `Page.goto timeout` on a CPU-saturated sandbox (Ji7frCIfmAQ, UZ79sKLa6z4, Uccowk6xbFc, _qxqjb3DseA, eKAOw0yaqyA, iqfHW2_sMmc); each passed on `--redo --par 1`. No real app bug found, so no code fix commits. **Left:** Chessformer `oAoik9Dj2qQ` + `p6W3yDU-v88` (2 'Not run', skipped on purpose while being rewritten): run `python3 tools/qa_all.py --widths 390,360 --ids=oAoik9Dj2qQ,p6W3yDU-v88 --redo --par 1 --results /workspace/work/cm_qa_results` then `--report-only --widths 390,360` and re-add this note. Warnings below are known/by design (Secret Queen tap fallback, Spinner Wheel loses when it picks an unmovable piece per its how_to_win). Tip: pass ids as `--ids=...` (ids starting with '-' break argparse).

# Full headless QA report

Generated 2026-11-25 19:08 by `rebuild/app/tools/qa_all.py` (widths 390, 360 px, 3 human plies per mode via the real tap handlers, drops/placement included; game frames driven by keys).
A mode fails on: no start, any console/page error, a local file 4xx, horizontal overflow, board wider than the screen, a bot that never answers, or no playable first move. Warnings do not fail a mode.

| Group | Modes | Pass | Fail | Not run |
|---|---|---|---|---|
| 0 not in impl_1..6 (proof/core modes) | 6 | 6 | 0 | 0 |
| 1 Horror/Powerups/Dice | 64 | 64 | 0 | 0 |
| 2 Drawback Chess + Variant Bots | 67 | 67 | 0 | 0 |
| 3 Challenges & Odds | 102 | 102 | 0 | 0 |
| 4 Other + Variants A | 85 | 85 | 0 | 0 |
| 5 Variants B | 88 | 88 | 0 | 0 |
| 6 Variants C | 87 | 85 | 0 | 2 |
| **All** | 499 | 497 | 0 | 2 |

## Failures by group (group agents: fix these in your mode files)

None.
## Warnings (not failures)

### Group 1

- `I_TbJqRHtf4` Secret Queen: 390px: tap input did not move 3x (committed directly); 360px: tap input did not move 3x (committed directly)
- `JPDYufARCQU` Secret Queen (Black): 390px: tap input did not move 3x (committed directly); 360px: tap input did not move 3x (committed directly)
- `epzU65ZEdcs` SCP-096 in the Fog: 390px: game ended after 1 human plies: the king was captured
- `vQ3hLgU6jLA` Place Mines: 390px: tap input did not move 1x (committed directly); 360px: tap input did not move 1x (committed directly)
- `w15Ev7q2HmI` Landmine Chess: 390px: tap input did not move 1x (committed directly); 360px: tap input did not move 1x (committed directly)

### Group 2

- `SsOtn3iDkv8` WorstFish vs Zach: 390px: tap input did not move 3x (committed directly); 360px: tap input did not move 2x (committed directly)

### Group 3

- `vzNwF2BH8jg` Impostor vs Stockfish: 390px: tap input did not move 1x (committed directly); 360px: tap input did not move 1x (committed directly)

### Group 4

- `-TKJGtBKK8U` Infinite Craft: Make Chess: 390px: game canvas did not change on arrow/jump/action keys (mouse-driven game?); 360px: game canvas did not change on arrow/jump/action keys (mouse-driven game?)
- `6YEM7m8owJ4` Spinner Wheel vs Martin: 390px: tap input did not move 1x (committed directly); 360px: game ended after 0 human plies: the wheel picked a piece that cannot move
- `nick8PeAXLA` Spinner Wheel: Rematch: 390px: tap input did not move 2x (committed directly); 360px: tap input did not move 2x (committed directly)

### Group 6

- `qSwTtgUWqUw` Tiny 5D Chess: 390px: game canvas did not change on arrow/jump/action keys (mouse-driven game?); 360px: game canvas did not change on arrow/jump/action keys (mouse-driven game?)
- `rf2HSTXTehE` Ouroboros King: 390px: tap input did not move 3x (committed directly); 360px: tap input did not move 3x (committed directly)

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
  "timer": 1.6384780000000498,
  "moves": 0,
  "stabs": 0,
  "black": 16,
  "level": 0
 },
 "afterRun": {
  "kx": 6.1996600000000015,
  "ky": 0,
  "vx": 0,
  "vy": 0,
  "ground": true,
  "swing": 0,
  "timer": 0.9552780000000489,
  "moves": 0,
  "stabs": 0,
  "black": 16,
  "level": 0
 },
 "peak": 1.1416833,
 "afterJump": {
  "kx": 6.1996600000000015,
  "ky": 0,
  "vx": 0,
  "vy": 0,
  "ground": true,
  "swing": 0,
  "timer": 2.4057780000000504,
  "moves": 1,
  "stabs": 0,
  "black": 16,
  "level": 0
 },
 "afterSwing": {
  "kx": 6.1996600000000015,
  "ky": 0,
  "vx": 0,
  "vy": 0,
  "ground": true,
  "swing": 0.046699999999999874,
  "timer": 2.172478000000051,
  "moves": 1,
  "stabs": 0,
  "black": 16,
  "level": 0
 },
 "afterTimer": {
  "kx": 6.1996600000000015,
  "ky": 0,
  "vx": 0,
  "vy": 0,
  "ground": true,
  "swing": 0,
  "timer": 1.2725780000000522,
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

