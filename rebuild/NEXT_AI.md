# Start here (for the next AI picking up the rebuild)

Branch: `rebuild` only. Never touch `main` until merge. Always `git fetch` + `git rebase origin/rebuild` before pushing; never force-push. Another AI (Claude) also pushes commented bug fixes here: keep them.

## Read in this order
1. `README.md` PROGRESS section: overall status. **Refresh it on every commit; delete it when the rebuild is finished.**
2. `rebuild/HANDOFF.md`: full history, decisions, low-confidence list.
3. `rebuild/ARCHITECTURE.md`: app structure (multi-file under `rebuild/app/`).
4. `rebuild/research/INDEX.md`: one row per mode (559) with kind / playable / confidence.
5. `rebuild/research/modes/<id>.json`: the spec for each video. `rebuild/research/frames/` holds frame notes (visual_a..d.jsonl) and rules.jsonl; reference sprites are reference only, do not ship.

## Rules of thumb
- Frames beat rules.jsonl when they disagree (e.g. Backrooms = huge open yellow board, not a maze).
- `playable: false` specs (normal chess, quizzes, intros) get no mode; `kind: video_game` specs need a standalone mini-game or are skipped.
- Promotion: chess.com-style Q/R/B/N picker unless a spec says otherwise.
- UI: chess.com Android look, calm motion (piece slide ~200ms ease-out, no bounce/pop/shake, honour prefers-reduced-motion).
- Final-pass specs have `current_impl_issues` = "not checked"; diff against the old `index.html` on main when implementing.

## Next steps
1. Verify the engine + UI in `rebuild/app/` (run `rebuild/tools/test_browser.py`); fix the proof modes (standard, Mini Chess 6x6 no queen, Cross Derby, Backrooms).
2. Write/confirm `rebuild/tools/spec2mode.mjs` to turn specs into `app/data/modes/<id>` files.
3. Implement modes in batches, highest-confidence first; re-run transcripts for ids in `rebuild/research/recheck_low_confidence.json`.
4. Headless QA every mode, then merge to `main` and remove the README PROGRESS section.
