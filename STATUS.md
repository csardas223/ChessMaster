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

## Horror / SCP ability animations (2026-11-25)

Default pieces are lichess **Staunty** (CC BY-NC-SA 4.0, `assets/pieces/staunty`); saved settings that never picked a
set move from cburnett to Staunty (`piecesPicked`). Monster abilities are one-shot animations in the visual language of
iwantcheckmate.com (studied, reimplemented; `js/fx/ability-fx.js`, `css/fx.css`). Under-the-pieces effects draw in
`#board-abl` (z 0, between the squares and the resting pieces), a sibling of the board view's own `.board-under`
(z 2, capture fades). Ability slides go through the board motion engine (`board.motion` + `quietNext`) and wait for
the board's own slide of the triggering move to land.

- **SCP-2845 Deer** `PGBHL6Nc4X0`: 3x3 zone glows #175b61 under the pieces (1 s), pieces glide 850 ms, glow fades 1 s.
- **SCP-2774** `JUlTxosCXuk`, **SCP-049** `byhq5v6BUWg`, **SCP-966** `mwv48BWl2DY`, **SCP-096** `-fax07t_o5s`,
  **Boiled One** `xvibqyL-CqQ`, **Locust** `PDCuJf3SdRY`: rewritten scans, sweeps, curse paths, tremble + dash, square
  shatter.
- **Mal0** `vPEVQgvjoL4`: no arrows, highlights or board fade. Staging square = the in-bounds square 3 from the prey on
  the nearest of the 8 lines; Mal0 walks there one square at a time (300 / sqrt(steps) ms each,
  cubic-bezier(.22,.61,.36,1)), eating what it walks onto but never its prey; stalking steps take 300 ms.
- **Containment Breach** `Ji7frCIfmAQ`: every affected square (converted, frozen, teleported to) gets the site's single
  pale-green pulse (#c5f3a378, 500 ms ease-out fade), never on fogged squares; captures have no flash. SCP-409 now
  alternates wander+charge / freeze; while charged its 8 neighbours breathe cyan (#76d1ea45, 2 s) beneath the pieces,
  hidden by fog.
- **SCP-106** `_Kx4ChHuCgI`, **SCP-426** `lpqVYTH9U-A`, **SCP-409** `ndbf05-bvgQ`, **SCP-939** `s2WDIfvefEk`,
  **Gabriel** `d9oDfmcMJvA`: permanent reach rings and arrows removed. Each monster glides one square (300 ms); its
  ability is a one-shot swell beneath the affected squares (106 corrosion on the ring, pieces sink and resurface with a
  stain; 426 purple then flip into toasters; 939 magenta on the square it heard; Gabriel magenta + one glitch, alternates
  glide). SCP-409 shows the breathing cyan aura only while charged, then an ice flash on each frozen square.
- **All-Consuming Darkness** `BYg7rV53WrM` (owner report 2026-11-26, "not accurate to the website or video"): eyes stay on
  the origin b4 (were moved to the newest square), fuzzy-rimmed tiles merge into one blob (site art), new square fades in
  200 ms; pink candidate markers, flash, smoke, vignette, toasts and v6 sounds removed; engine no longer sees the darkness.
- Unchanged on purpose: Despair, He Knows You Are Alone, SCP-173, SCP-682, SCP-096 in the Fog.

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

## iwantcheckmate.com coverage (2026-11-26, complete: 34/34)

Crawled the site (home bundle `assets/main-*.js`: 18 challenge pages + 16 bots at `#/play/<id>`; re-crawled 2026-11-26 10:40 AM ET,
same 34 entries; the site links no YouTube ids, so they are matched by title/rules). Every site mode exists here. Status vs our modes:

| Site page / bot | Our mode | Status |
|---|---|---|
| scp-096 | -fax07t_o5s | faithful (site acts once per round + nearest observer = our "Once per round" option; default is game 1 timing) |
| locust | PDCuJf3SdRY | fixed to site: no new roll in a deletion round, never on Stockfish's king square |
| boiled-one | xvibqyL-CqQ | faithful |
| scp-049 | byhq5v6BUWg | faithful |
| scp-966 | mwv48BWl2DY | fixed: orthogonal steps, zombies move oldest first. Still different: site starts on a random rank-5 square (ours c4 per video) |
| containment-breach | Ji7frCIfmAQ | fixed to site (d7f01a4): SCP-939 replaces the Zombie SCP, site placement bands, neutral effect pieces with SCP-order priority, 035/049/096/106/173/409/426/682/939/966 behaviour from the site engine.js |
| malo | vPEVQgvjoL4 | faithful |
| deer | PGBHL6Nc4X0 | faithful |
| waldo | gHAmif0TenY | faithful (site reveal is a pit slide; ours a jumpscare) |
| dark ("Void Stares Back") | BYg7rV53WrM | fixed to site + video (2026-11-26 owner report): uniformly random candidate square; eyes stay on b4; fuzzy merged blob (site tiles); 200 ms fade-in, no pink markers/flash/smoke/vignette/toasts; capture sound only on a consumed piece; darkness-blind engine as in the video; king consumed = confetti + loss |
| crack (SCP-4975) | HuZlhHnES7M (video 2026-11-26; was icm-scp4975, alias kept) | faithful, site art + crack lines (merged 34cd76f, a69ab76, 9e5e5bb; touch-smoked 390x844) |
| dragons-tony | CSjh4NrnxLE | faithful |
| portal-chess | 7csbf0L-uio | fixed to site (1eab2d0): both portals close after a teleport (1 s fade), site colours |
| infinite-pawns | D8rD3rTwgjc | faithful: any empty square incl. ranks 1/8 (rank 8 promotes), 'and' + 'or' levels, placed pawns fade in |
| midas-touch | LiXg0nHrjxg | faithful to video (site keeps gold pieces as inert black pieces) |
| sniper-bishops | AoREbapF7y0 | faithful |
| catapult-chess | Ugw05nktuDM | faithful |
| trojan-horse | OvQYI_S5IZg | faithful (site: double-click knight; disperses onto last rank too) |
| bot torturefish | vDzojyJO3sI | faithful |
| bot blunderfish | ROkJSsMOfu0 | faithful |
| bot geometricfish | Y0zYxMYDDWQ | faithful |
| bot stockfish-tony | Q6sj5N3oQjI | faithful (video uses Martin) |
| bot panicfish | vIvVdaTQi3s | faithful |
| bot tiredfish | Uccowk6xbFc | faithful |
| bot tony-gains | nx6jkHl2k_Y | faithful (video uses Martin) |
| bot drawfish | mUmTeprNjzU | faithful |
| bot betafish | TQR5zCSzrqw | faithful |
| bot clockfish | 0rlkE-CYRoc | fixed: drops to 0 each of your turns, +3600 over 5 s of thinking (g2_fish turnRamp) |
| bot mirrorfish | eCC-U9w9RvQ | fixed: rank capped at 5th |
| bot zebrafish | oJu13RUrGl4 | fixed: first move to a light square |
| bot simpfish | My1sUnkiNfU | fixed: hunts the queen (most attackers on it among moves within 80 cp) |
| bot checkfish | tNgzqWiYDFk | faithful |
| bot scaredfish | icm-scaredfish (no_video) | faithful (merged 34cd76f; touch-smoked 390x844) |
| bot tony-normal | xjEz7bCQxho | faithful (London setup book) |

Known differences kept on purpose: SCP-966 starts on c4 like the video (site: random rank-5 square); Midas keeps the video's gold
rule (site: gold pieces become inert black pieces); Waldo's reveal is a jumpscare (site: pit slide).
