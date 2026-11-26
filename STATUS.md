# Project status

**Playable, actively developed.** Last verified 2026-11-26.

Chess Master is a fan project, not a hosted product: it is a static site with no accounts, backend or online
multiplayer. "Done" here means the lobby and all 500 remastered modes build and play against a bot.

## What works

- **Lobby and routing:** all 559 videos are listed with categories, search, thumbnails and a "random video" entry;
  `#/play/<youtubeId>` opens a mode directly and browser back/forward stay in step.
- **500 remastered modes:** each mode file builds, normalizes and produces a legal start position. The engine sweep
  reports 500/500 ok.
- **Opponents:** Stockfish 19/17.1/10, Maia 1100–1900 and the variant-aware `CM.Search`, with fallbacks when a CDN is
  unavailable. See [docs/AI.md](docs/AI.md).
- **Game chrome:** clocks, move list, captured pieces, promotion picker, undo, flip, resign, game-over modal, rematch,
  lobby return, sounds and mode VFX.
- **Input and accessibility:** click, drag, touch, right-click marks, double-tap mode actions, and keyboard board
  navigation (Tab, arrows, Home/End, Enter/Space, Esc).
- **Checks:** 13 engine rules tests, ESLint, mode validation and the 500-mode sweep all pass; GitHub Actions runs them
  on push/PR. See [README.md](README.md#development).

## Known limitations

- **The public demo is not published.** `https://csardas223.github.io/ChessMaster/` currently returns 404 until GitHub
  Pages is enabled in the repository settings. Run the site locally with `python3 -m http.server 8000`.
- **Single-player only.** There is no online play, matchmaking, accounts or persistent profile. Your moves stay in the
  browser; only engine/weight files and YouTube thumbnails are fetched.
- **Two sweep warnings are expected:** a random card hand (`Kzt9ItpGtYg`) and the Pac-Man maze pocket
  (`sO-lD2On610`) start with one legal move by design.
- **Lint warnings are tolerated.** `npm run lint` exits 0 with 0 errors and 75 warnings (mostly deliberately unused
  hook parameters).
- **Unit tests cover standard chess rules**, not every variant hook. Variant behaviour is covered by the sweep plus
  manual/browser play; focused regression tests for the big variant families are a sensible next addition.
- **The module split is logical, not enforced.** Directories and the `CM` namespace separate game/board/rules/UI (see
  [docs/MODULES.md](docs/MODULES.md)), but the app uses classic scripts so `file://` keeps working. `js/legacy/` is
  one shared top-level scope by design.
- **The dead-file scan is heuristic.** `qa/unused-assets.mjs` reports candidates, but mode art and sounds are often
  addressed by constructed names (`face_wP`, `floor_forest`, `host.sound('hit')`), so nothing is bulk-deleted.

## How to verify the claims

```sh
npm ci
npm test           # 13 pass
npm run lint       # 0 errors, 75 warnings
npm run validate   # 500 mode files indexed
npm run sweep      # 500/500 ok, 2 expected warnings
python3 -m http.server 8000   # play locally
```

For the browser check: open a mode, move with click/drag, then Tab to the board and use arrows + Enter. The board
should keep one tab stop and follow the focused square.

## Possible next steps

1. Enable GitHub Pages (or another static host) so the README has a working demo link.
2. Add regression tests for the highest-traffic variant families (portals, ladders, atomic, multi-player boards).
3. Reduce the lint warnings and add a short "known issues" label in the issue tracker.
4. Keep the CI workflow required on `main` once the repository has branch protection.

These are candidates, not commitments; the mode files and `docs/ARCHITECTURE.md` remain the source of truth.
