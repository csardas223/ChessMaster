# Copilot review (pasted by the owner 2026-11-26 6:34 PM ET), triaged by Hark

Copilot read the repo, not the live site, so some items are already true. Checked 2026-11-26:
- ALREADY DONE / WRONG: GitHub Pages IS enabled from main (live site and every play/<slug>/ page return 200; OG card
  verified as Discordbot). CI already runs lint, test, validate and the full sweep (.github/workflows/ci.yml, Node 24,
  actions pinned to v4). README numbers are already counted from the repo by tools/readme_long.py. Repo is ~314 MB
  without .git (not 350). Lobby already uses content-visibility. prefers-reduced-motion is respected (owner rule).
  "Enable Pages" / "Fix Pages before advertising share previews" items: not needed.
- DO NOT DO (conflicts with owner rules): moving promo/archive assets out of the repo (owner wants docs/promo-archive
  kept, 2026-11-26 6:26 PM). Branch protection requiring PR checks would block direct pushes to main (owner: main only,
  direct commits): only add a required status check if it still allows direct pushes, ask the owner first.

## Worth doing (priority order, cheap first)
1. 404.html with route restoration (GitHub Pages serves it for unknown paths) + robots.txt + sitemap.xml (from play/).
2. .editorconfig, CHANGELOG.md, issue templates (bug, mode mismatch, accessibility, licensing), SECURITY.md.
3. CI: check `node tools/build-data.mjs --check` / `npm run validate` leaves no git diff; Dependabot for npm + actions.
4. Settings option: disable flashes, jumpscares, screen shake and intense FX (accessibility); cap particles on low-end phones.
5. Engine robustness: session ids so stale bot replies can't touch a new game; abort engines on leave/new game;
   timeout + fallback states for Stockfish/Maia/Fairy-Stockfish loading (built-in search fallback exists; verify).
6. localStorage: version keys, sanitize corrupted values.
7. Regression tests: perft for standard movegen; table-driven special moves (castling, en passant, promotion,
   stalemate, repetition, 50-move); golden-state tests for Duck, Atomic, 4-player, portals, ladders.
8. WebGL-off fallback message for 3D/FPS modes; unsupported-browser notice.
9. Accessibility pass: board ARIA grid, aria-live for check/mate/game over, focus trap in dialogs, icon button names.
10. Performance budget + image compression (WebP) for large assets; memory check across repeated rematches.
11. Licence inventory/provenance table per asset folder (LICENSES.md exists; extend), privacy note (local storage,
    engine CDN and YouTube thumbnail requests), visible build/commit marker in the footer or About.
12. Docs: mode authoring guide with a full template, hook/lifecycle reference, troubleshooting (404, MIME, engines).
Rest of Copilot's list (ES-module migration, schema versioning, telemetry policy, preview deployments, JSON-LD,
CODEOWNERS, roadmap) is low value for a solo fan project; leave unless the owner asks.
