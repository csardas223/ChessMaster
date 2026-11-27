> **qa3d full run (finished 2026-11-26 9:10 PM ET, main after 1f33f508). 510 modes x 2 widths = 1020 runs, all done.**
> - Run: `python3 tools/qa_all.py --widths 390,360 --par 1 --budget 600` from a fresh cache `/workspace/work/s5_qa_res` (7:30-9:10 PM ET, loop `qa3d_logs/run3.sh`), then the fails redone with `--ids=IbRrzKtieqs,mwv48BWl2DY --redo --par 1`, then `--report-only`. Setup: HANDOFF.md "Checks before pushing" (playwright + /tmp/libs).
> - First pass: **390 px 508/510, 360 px 510/510**. After the redo: **510/510 at both widths** (table below).
> - `mwv48BWl2DY` SCP-966 at 390: page scrollWidth 393. **Real, FIXED in c05a34ac.** A queen/rook capture in a horror-cine mode runs the board-wrap shake (translate ±6 px) plus the time-dilation `scale: 1.035`, which pushed #board-wrap past a 390 px screen for about 1 s (probe: scrollWidth 395). The fix clips `.board-col` sideways (`overflow-x: clip`, css/cine.css) only while a horror cine is running, so other modes are untouched. Probe after the fix: scrollWidth 390. qa_all now measures the board box once its animations settle, and still checks page scrollWidth mid-animation (1f33f508). 360 px runs use reduced motion, so they never saw it.
> - `IbRrzKtieqs` Battle Chess at 390: "controller never started" (35 s cap). **Not an app bug**: box load (three.js + software WebGL load takes about 23 s). PASS on the redo; tools/qa_battle3d.py is the real check for it.
> - Open, not failed: the generic `fx_shake` (js/fx/vfx.js, used by explosions etc. in many modes) can still push the page 1 px wide (scrollWidth 391) for about 0.4 s at 390. Left alone on purpose (shared code across all modes); clip `.board-col` globally if a phone shows a sideways wobble.
> - **Home scroll jank (HANDOFF #10, jank part): FIXED in 076f5718**, perf only, look pixel-identical (4 scroll positions at 390x844: 0 px diff). Cause: the m4-home family shelves added 70 cards whose placeholder pawn spin + skeleton sweep (thumbs never load in the sandbox; slow networks on phones) restyled every frame, + DOM 2.4x at load. Fix: `.mcard__th { content-visibility: auto }` (off-screen thumbs skip style/paint) + family shelves fill their cards lazily (IntersectionObserver, 1200 px margin, empty row keeps the filled height). tools/qa_scroll_jank.py `--cpu 4 --steps 30 --trace` (deterministic devtools counts; frame times are noise on this shared box, load 12-20):
>
> | Home, 390x844, 4x CPU, 30 wheel steps | elements restyled | paints | DOM nodes at load | cards at load |
> |---|---|---|---|---|
> | df207f83 (before family shelves) | 3864 | 355 | 1112 | 44 |
> | 5e2a9da..e9247338 (family shelves) | 8116 | 435 | 2661 | 114 |
> | 076f5718 (s5-qa fix) | 2637 | 352 | 1507 | 44 (rest fill on scroll) |


# Full headless QA report

Generated 2026-11-27 02:12 by `tools/qa_all.py` (widths 390, 360 px, 3 human plies per mode via the real tap handlers, drops/placement included; game frames driven by keys).
A mode fails on: no start, any console/page error, a local file 4xx, horizontal overflow, board wider than the screen, a bot that never answers, or no playable first move. Warnings do not fail a mode.

| Group | Modes | Pass | Fail | Not run |
|---|---|---|---|---|
| 0 not in impl_1..6 (proof/core modes) | 17 | 17 | 0 | 0 |
| 1 Horror/Powerups/Dice | 64 | 64 | 0 | 0 |
| 2 Drawback Chess + Variant Bots | 67 | 67 | 0 | 0 |
| 3 Challenges & Odds | 102 | 102 | 0 | 0 |
| 4 Other + Variants A | 85 | 85 | 0 | 0 |
| 5 Variants B | 88 | 88 | 0 | 0 |
| 6 Variants C | 87 | 87 | 0 | 0 |
| **All** | 510 | 510 | 0 | 0 |

## Failures by group (group agents: fix these in your mode files)

None.
## Warnings (not failures)

### Group 0

- `eCzxOgc4fTY` Duolingo Chess: Oscar: 390px: tap input did not move 3x (committed directly); 360px: tap input did not move 3x (committed directly)
- `jmdkuvE2ApQ` Infinite Craft: Checkmate: 390px: game canvas did not change on arrow/jump/action keys (mouse-driven game?); 360px: game canvas did not change on arrow/jump/action keys (mouse-driven game?)

### Group 1

- `I_TbJqRHtf4` Secret Queen: 390px: tap input did not move 3x (committed directly); 360px: tap input did not move 3x (committed directly)
- `JPDYufARCQU` Secret Queen (Black): 390px: tap input did not move 3x (committed directly); 360px: tap input did not move 3x (committed directly)
- `U_irVoLjtNI` Secret Queen vs Stockfish: 390px: tap input did not move 3x (committed directly)
- `vQ3hLgU6jLA` Place Mines: 390px: tap input did not move 1x (committed directly); 360px: tap input did not move 1x (committed directly)
- `w15Ev7q2HmI` Landmine Chess: 390px: tap input did not move 1x (committed directly); 360px: tap input did not move 1x (committed directly)

### Group 2

- `SsOtn3iDkv8` WorstFish vs Zach: 390px: tap input did not move 3x (committed directly); 360px: tap input did not move 3x (committed directly)

### Group 3

- `vzNwF2BH8jg` Impostor vs Stockfish: 390px: tap input did not move 1x (committed directly); 360px: tap input did not move 1x (committed directly)

### Group 4

- `-TKJGtBKK8U` Infinite Craft: Make Chess: 390px: game canvas did not change on arrow/jump/action keys (mouse-driven game?); 360px: game canvas did not change on arrow/jump/action keys (mouse-driven game?)
- `6YEM7m8owJ4` Spinner Wheel vs Martin: 390px: tap input did not move 1x (committed directly); 390px: game ended after 1 human plies: the wheel picked a piece that cannot move; 360px: game ended after 0 human plies: the wheel picked a piece that cannot move
- `nick8PeAXLA` Spinner Wheel: Rematch: 390px: tap input did not move 3x (committed directly); 360px: tap input did not move 2x (committed directly)

### Group 6

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
  "timer": 1.6076000000005597,
  "moves": 0,
  "stabs": 0,
  "black": 16,
  "level": 0
 },
 "afterRun": {
  "kx": 6.200339999999993,
  "ky": 0,
  "vx": 0,
  "vy": 0,
  "ground": true,
  "swing": 0,
  "timer": 1.0075000000005594,
  "moves": 0,
  "stabs": 0,
  "black": 16,
  "level": 0
 },
 "peak": 1.2668319,
 "afterJump": {
  "kx": 6.200339999999993,
  "ky": 0,
  "vx": 0,
  "vy": 0,
  "ground": true,
  "swing": 0,
  "timer": 2.457500000000561,
  "moves": 1,
  "stabs": 0,
  "black": 16,
  "level": 0
 },
 "afterSwing": {
  "kx": 6.200339999999993,
  "ky": 0,
  "vx": 0,
  "vy": 0,
  "ground": true,
  "swing": 0.056699999999999785,
  "timer": 2.1742000000005617,
  "moves": 1,
  "stabs": 0,
  "black": 16,
  "level": 0
 },
 "afterTimer": {
  "kx": 6.200339999999993,
  "ky": 0,
  "vx": 0,
  "vy": 0,
  "ground": true,
  "swing": 0,
  "timer": 1.274300000000563,
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

