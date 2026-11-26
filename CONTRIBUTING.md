# Contributing

Thanks for helping with Chess Master. This is a static fan project: no build step, no backend, no framework. The most
useful contributions are fixes to mode rules, engine/UI bugs and accessibility.

## Setup

```sh
git clone https://github.com/csardas223/ChessMaster.git
cd ChessMaster
python3 -m http.server 8000        # play at http://localhost:8000/
npm ci                             # only for tests/lint/validation (Node 20.19+)
```

`npm ci` installs the pinned dev tooling; the site itself loads nothing from `node_modules`.

## Before opening a PR

Run the same commands CI runs:

```sh
npm run lint       # ESLint (0 errors; warnings are tolerated)
npm test           # engine rules tests
npm run validate   # every mode file + generated data
npm run sweep      # build all 500 modes in the Node sandbox
```

If you changed a mode, also open it in the browser (local server, lobby → the video) and play through the changed
mechanic. If you changed the board, check click, drag, keyboard (Tab/arrows/Enter) and a narrow viewport.

## Mode changes

- Mode files live in `data/modes/<videoId>.js` and are plain classic scripts calling `CM.mode({...})`. The schema is
  documented in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- Art belongs in `assets/modes/<videoId>/`; keep paths relative and lowercase, because Pages is case-sensitive.
- After adding/removing a mode, run `node tools/build-data.mjs` and include the regenerated data files.
- Keep the video's rules. If the video is ambiguous, put the decision and a link/timestamp in `source.notes` rather
  than silently inventing a different rule.
- Modes that share a concept (portals, ladders, nukes, …) should behave consistently. If a difference is intentional,
  document it in the mode's `source.notes`.

## Code style

- The site is classic scripts (`<script src>`, IIFEs, `window.CM` namespace) so `file://` keeps working. Keep new code
  in the existing directories rather than adding a bundler.
- `js/legacy/` is one shared top-level scope across files; do not rename its globals casually.
- Use `CM.util` helpers (`$`, `el`, `esc`, `loadScripts`, …) and the existing board/engine APIs instead of new
  dependencies. Adding a runtime library needs a pinned version and a `LICENSES.md` entry.
- Keep UI text in the app's voice and make interactive elements real `<button>`/`<a>` elements with labels.

## Assets and licensing

- Do not add art, videos, fonts or sounds you do not have the right to redistribute. Mode art must come from the
  corresponding iwantcheckmate video, with its source noted in the mode file.
- Record every new third-party asset in [LICENSES.md](LICENSES.md), including author, license and URL/commit.
- The project code is MIT; bundled assets keep their own licenses (some are GPL/AGPL). Do not relicense them.

## Reporting bugs

Include the mode/video id (the `#/play/<id>` URL), what you did, what happened, what you expected, browser/OS, and a
screenshot if it is visual. For engine-sweep findings, paste the warning and the mode id.
