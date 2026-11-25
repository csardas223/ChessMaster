# Chess Master

A fan remake of [iwantcheckmate](https://www.youtube.com/@iwantcheckmate)'s chess-variant videos: a lobby of all
559 videos, 500 of them remastered as playable modes with the video's own rules, opponents, art and effects, played
against Stockfish and the bots from the videos. It's styled after the chess.com Android app.

All videos, the iwantcheckmate name and logo, and the mode art cut from the videos belong to iwantcheckmate. This is an
unofficial fan project; go watch the videos: [youtube.com/@iwantcheckmate](https://www.youtube.com/@iwantcheckmate) ·
[iwantcheckmate.com](https://iwantcheckmate.com).

## Play

**Online:** https://csardas223.github.io/ChessMaster/ (GitHub Pages, once it's turned on: repo **Settings → Pages →
Build and deployment → Deploy from a branch → `main` / `/ (root)`**). The site already has a `.nojekyll` file, so Pages
serves every file as-is, including the `_`-prefixed mode files that Jekyll would otherwise drop.

**Locally:** this is a plain static website with no build step. Serve the repo root with any static server and open it:

```sh
python3 -m http.server 8000      # then open http://localhost:8000/
# or: npx serve .
```

Opening `index.html` straight from disk (`file://`) works in most browsers too: every script is a classic script and
the data ships as `.js` files. Some browsers lock down `file://` more than others, though, so use a server if something
looks off.

Network access you'll need: Stockfish 19 lite (WASM) loads from unpkg.com the first time a mode uses it, and lobby
thumbnails come from YouTube (i.ytimg.com). Everything else is in the repo.

## Layout

```
index.html        lobby + game screens
css/              styles (chess.com look)
js/               engine, bots, UI, game frames, mode hooks, legacy mode library, vendor/three.min.js
data/             videos.js + legacy_modes.js (generated from the .json next to them),
                  modes/<videoId>.js (one file per remastered video), modes/index.js (generated lobby index)
assets/           pieces, boards, sounds, avatars, and assets/modes/<videoId>/ (art cut from each video)
LICENSES.md       licenses for piece sets, sounds and bundled code
docs/ARCHITECTURE.md   how the app and the mode file format work
tools/            build-data.mjs (regenerates the generated data files), qa_ui.py (headless UI check)
```

## Development

- Add or edit a mode in `data/modes/<videoId>.js` (format in `docs/ARCHITECTURE.md`), put its art in
  `assets/modes/<videoId>/`, then run `node tools/build-data.mjs` so the lobby index picks it up
  (`node tools/build-data.mjs --check` validates every mode file).
- Keep every path relative (`assets/...`, never `/assets/...`). The site has to work at a domain root and under the
  `/ChessMaster/` Pages subpath, and Pages is case-sensitive.
- UI check: `pip install playwright && python -m playwright install --with-deps chromium`, then
  `python3 tools/qa_ui.py`.
- The research behind the rebuild (video transcripts, frame notes, per-mode specs, art-cutting scripts and the full QA
  harness) lives on the `rebuild` branch under `rebuild/`. It isn't needed to run or host the site.

## Credits

- Videos, mode concepts and mode art: [iwantcheckmate](https://www.youtube.com/@iwantcheckmate).
- Engine: [Stockfish](https://stockfishchess.org/) (GPLv3), loaded at runtime from unpkg, not bundled.
- Piece sets, board sounds and three.js: see [LICENSES.md](LICENSES.md).
