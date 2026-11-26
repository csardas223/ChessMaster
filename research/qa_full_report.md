> **s5-qa interim (2026-11-26 3:40 PM ET, main after 076f5718). Full qa_all RUNNING, not finished.**
> - Run: `python3 tools/qa_all.py --widths 390,360 --par 1` over all 509 modes, cache `/workspace/work/s5_qa_res` (209/1018 mode x width cached at 3:40 PM, 390 px pass first, ids `-` .. `P`). Loop: `nohup setsid /workspace/work/s5_qa_logs/run.sh &` (stops when "all done", or `touch /workspace/work/s5_qa_logs/STOP`); log `/workspace/work/s5_qa_logs/qa_all.log`. Rewrite this table with `python3 tools/qa_all.py --report-only --widths 390,360 --results /workspace/work/s5_qa_res` and keep this header. If the sandbox lost /workspace/work/s5_qa_res, rerun from scratch (~5-10 s per run at par 1). Setup: HANDOFF.md "Checks before pushing" (playwright + /tmp/libs).
> - Real failures so far: **none** (0 console/page errors, 0 overflow, 0 stuck bots in 209 runs).
> - 3D/load timeouts from m4-uiqa redone with `--redo --par 1` at 390 + 360: CxtttdnwNWk EqOwqolOZOo F0nfkeR-QEg FxpWhTj2Cv4 HuZlhHnES7M I07GcHQtY2o XhtzHTEsh9Q vcMhd5Vd1mM all **PASS** (vcMhd5Vd1mM's old qa_all timeout = box load, HANDOFF #13).
> - OvQYI_S5IZg board 392 px: **not real** - PASS at 390 and 360 (no board/page overflow); the 392 px was transient under load.
> - IbRrzKtieqs Battle Chess: qa_all "controller never started" (35 s cap) twice under box load 13-15. Direct probe (s5_qa_logs/bc.py, 70 s cap): page `load` 23 s (three.js + software WebGL), controller at 25 s, no app errors (only sandbox CDN 407/CORS + a GPU ReadPixels perf warning). Environment, not an app bug; the real check for it is tools/qa_battle3d.py.
> - **Home scroll jank (HANDOFF #10, jank part): FIXED in 076f5718**, perf only, look pixel-identical (4 scroll positions at 390x844: 0 px diff). Cause: the m4-home family shelves added 70 cards whose placeholder pawn spin + skeleton sweep (thumbs never load in the sandbox; slow networks on phones) restyled every frame, + DOM 2.4x at load. Fix: `.mcard__th { content-visibility: auto }` (off-screen thumbs skip style/paint) + family shelves fill their cards lazily (IntersectionObserver, 1200 px margin, empty row keeps the filled height). tools/qa_scroll_jank.py `--cpu 4 --steps 30 --trace` (deterministic devtools counts; frame times are noise on this shared box, load 12-20):
>
> | Home, 390x844, 4x CPU, 30 wheel steps | elements restyled | paints | DOM nodes at load | cards at load |
> |---|---|---|---|---|
> | df207f83 (before family shelves) | 3864 | 355 | 1112 | 44 |
> | 5e2a9da..e9247338 (family shelves) | 8116 | 435 | 2661 | 114 |
> | 076f5718 (s5-qa fix) | 2637 | 352 | 1507 | 44 (rest fill on scroll) |

# Full headless QA report

Generated 2026-11-26 20:34 by `tools/qa_all.py` (widths 390, 360 px, 3 human plies per mode via the real tap handlers, drops/placement included; game frames driven by keys).
A mode fails on: no start, any console/page error, a local file 4xx, horizontal overflow, board wider than the screen, a bot that never answers, or no playable first move. Warnings do not fail a mode.

| Group | Modes | Pass | Fail | Not run |
|---|---|---|---|---|
| 0 not in impl_1..6 (proof/core modes) | 16 | 2 | 0 | 14 |
| 1 Horror/Powerups/Dice | 64 | 1 | 0 | 63 |
| 2 Drawback Chess + Variant Bots | 67 | 0 | 0 | 67 |
| 3 Challenges & Odds | 102 | 0 | 0 | 102 |
| 4 Other + Variants A | 85 | 3 | 0 | 82 |
| 5 Variants B | 88 | 3 | 0 | 85 |
| 6 Variants C | 87 | 0 | 0 | 87 |
| **All** | 509 | 9 | 0 | 500 |

## Failures by group (group agents: fix these in your mode files)

None.
## Warnings (not failures)

None.
