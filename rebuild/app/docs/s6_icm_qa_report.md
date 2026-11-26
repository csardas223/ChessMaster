# Session 6: icm-qa report (2026-11-26, about 12:00 to 1:30 AM ET)

Agent: icm-qa. Branch: `main` only. `wip/sfx-v5` and `rebuild` were not touched.
All browser tests ran in headless Chromium (Playwright) at 390x844, `is_mobile` and `has_touch` on, with real touch taps on squares. The game object is `CM.app.current`. Test scripts are in `/workspace/work/icmqa/` (scratch, not in the repo).

## 1. wip/icm-coverage: tested and merged (merge 34cd76f)
- **SCP-4975 Crack (`icm-scp4975`)**: SCP-4975 starts on e4 and blocks it (e2-e4 is illegal). After each bot move it crawls one king-step to an empty square, then scans its 8 neighbours. Cracks show as hairline SVGs, and a second scan shatters the piece (seen over a 10-move game). Undo restores both the position and the cracks. Tested with reduced motion too. No page errors.
- **ScaredFish (`icm-scaredfish`)**: replies in about 1.2 to 1.6 s, and the status line counts your "queens". No errors.
- **Lobby**: both app-only rows show up in search with their local thumbnails (320x180) and the text "iwantcheckmate.com · no video yet". Tapping a row opens the mode.
- **Fix I added**: the list headers said "1 video" for app-only rows. They now say "mode(s)" when the list has an app-only row (`countLabel` in `js/lobby/lobby.js`).
- The merge was clean. The branch's copy of the 10391ba rule fixes matched main's.

## 2. Smoke test of the 10391ba rule fixes and Infinite Pawns (commit 38786b4)
Each mode got 8 moves in the browser, with no errors and no stalls:
- **Void/Darkness (`BYg7rV53WrM`)**: grows one square per round and stops when there is no candidate. OK.
- **Locust (`PDCuJf3SdRY`)**: appears, deletes its square a round later, and never re-rolls in a round with a deletion. Holes are correct. OK.
- **SCP-966 (`mwv48BWl2DY`)**: every step is orthogonal onto an empty square. Zombies form, move (pawns move up), capture both colours and promote. OK. Each round is slow, 4 to 7 s with 6 zombies, because the animations play one after another in the site's order. That is by design, but worth watching on the phone.
- **ClockFish (`0rlkE-CYRoc`)**: drops to 0 on your turn and climbs about 100 Elo per 0.14 s, reaching 3600 at 5.2 s. It plays at the rating it had when you moved. OK.
- **MirrorFish (`eCC-U9w9RvQ`)**: the pick is capped at #5. **Fixed** the toast, which still said "MirrorFish will play its #18". It now says "(worse than #4) MirrorFish will play its #5". The fix is in both `g2_fish.js` and `g2_elofish.js`, which are identical copies.
- **ZebraFish (`oJu13RUrGl4`)**: the first move lands on a light square, then the colours alternate, matching the board's `is-light`/`is-dark` classes. OK.
- **SimpFish (`My1sUnkiNfU`)**: no errors. The "most pressure on your queen" choice seldom differs from the engine's top move under random play, so it was not exercised hard.
- **Infinite Pawns `D8rD3rTwgjc`, both levels**: "and" (move, then tap a square) and "or" (tap an empty square, no selection) both work by touch. Ranks 1 and 8 are allowed. On rank 8 the promotion picker opens and the pawn promotes. The bot replies with no stall.
- **Infinite Pawns `iAwhIiexojg`, games 1 and 2**: OK.
- **Added the fade-in for placed pawns**:
  - New public `board.appear(sq, frames, dur)` in `js/ui/board-view.js`. It survives re-renders like `motion()` and returns false when animations are off or reduced motion is on.
  - `g3_odds.js` fades placed pawns in: 420 ms, from opacity 0, a touch above and slightly larger, down to place. This covers both levels.
  - Checked by sampling the opacity frame by frame: it ramps from 0 to 1. Under reduced motion it is instant (opacity 1 at once).

## 3. Boiled One freeze and SCP-409 undo/aura
**Boiled One (`xvibqyL-CqQ`)**
- A 45-move stress run with impatient taps and premoves during the monster turns did not freeze. A fuzz of the search on 244 random Boiled One positions threw nothing.
- **Found a real freeze class and fixed it.**
  - Cause: in `js/bot/bot.js` the built-in search runs inside a `setTimeout`. Any throw there escaped the promise, so `CM.bot.choose` never settled. A throw could come from a mode's `evaluate`, `filterMoves` or `botPick` hook. The bot then never moved and `busy` stayed true for ever.
  - Proof: on the old code, making the Boiled One `evaluate` throw once froze the game.
  - Fix: the throw now rejects the promise. `SpecGame.afterChange` already handles a rejection: it logs it and plays a legal move. The `choose()` call is also wrapped in `new Promise`, so a synchronous throw rejects too.
  - After the fix, the same injected throw recovers at once.
  - This fixes every mode that uses the search, not only the Boiled One.
- Whether this is exactly what the user hit is **not confirmed**, because no natural throw was found. Other causes are ruled out by reading the code: afterMove hooks are guarded (c676089), and a side with no moves always gets a result.
- **Rule fix**: a paralyzed rook could still castle. `filterMoves` now blocks castling with a paralyzed rook.

**SCP-409 solo (`ndbf05-bvgQ`)**
- **Reproduced and fixed**: undo restored `freezeNext` and the crystal's square, but not the persistent cyan aura. The aura stayed on or went out regardless of the state.
- Fix: a new `onUndo` hook clears the aura and redraws it from the state.
- Verified over 4 rounds and 3 undos: the aura shows 8 tiles exactly when the state is charged, on the crystal's ring.
- During play the aura was already right. An apparent leftover was just the 300 ms fade-out.
- Containment Breach's SCP-409 draws its aura with `decorate`, from the state, so it cannot desync.

## 4. Not done (no time this session)
- Port the Containment Breach SCP rules from the crawled `engine.js`.
- Make Portals (`7csbf0L-uio`) single-use like the site.

## Checks (on the final tree)
| Check | Result |
|---|---|
| `npm test` | 13/13 pass |
| `npm run lint` | 0 errors (87 warnings, all pre-existing) |
| `npm run sweep` | 0 failed |
| `node qa/validate-modes.mjs` | 1 error, the known `hZf3G9Pr1UU` staunton3d one |
| `tools/qa_ui.py` | 41 ok, 0 fail (run after the merge) |
| `tools/qa_motion.py` | 14 ok, 0 fail |

## SHAs pushed (main)
- 34cd76f: merge of wip/icm-coverage plus the lobby count label.
- 38786b4: Infinite Pawns fade-in and the MirrorFish toast.
- The commit carrying this report (bot freeze fix, Boiled One castling, SCP-409 aura on undo): see `git log` on main.

## Next step
Port the Containment Breach SCP rules. Read the crawled site `engine.js` (see `qa/scrape-site.mjs` and STATUS.md's coverage table), then diff each SCP's rule against `data/modes/Ji7frCIfmAQ.js`. After that, Portals `7csbf0L-uio`: after a piece passes through a portal pair, remove that pair.
