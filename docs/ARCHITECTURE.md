# Chess Master: architecture and mode file format

Chess Master is a static, multi-file app (no build step to run it, no ES modules, no `fetch` of local files), so it
works on GitHub Pages and straight from `file://`. Every script is a classic script that hangs its exports on
`window.CM`. Data that must load synchronously ships as `.js` files that assign globals (`window.CM_DATA`), regenerated
by `node tools/build-data.mjs`.

**One video = one mode file**: `data/modes/<youtubeId>.js`. That file holds the data (board, pieces, setup, rules,
opponent, theme, events, VFX) and, when the mode needs it, its custom logic as inline hook functions. Implementation
agents write only that file (plus the video's art in `assets/modes/<id>/` and, for non-chess videos, a game module in
`js/games/`). After adding or renaming mode files run `node tools/build-data.mjs` so the lobby index picks them up.

## Contents

1. [File layout](#1-file-layout)
2. [Mode file](#2-mode-file)
3. [Board and theme](#3-board-and-theme)
4. [Players and colours](#4-players-and-colours)
5. [Pieces](#5-pieces)
6. [Setup](#6-setup)
7. [Rules](#7-rules)
8. [Bot and opponent](#8-bot-and-opponent)
9. [Video game frame](#9-video-game-frame-frame-game)
10. [Events](#10-events-events)
11. [VFX and sound](#11-vfx-and-sound)
12. [Hooks](#12-hooks)
13. [Tools and workflow](#13-tools-and-workflow)
14. [Status and resume notes](#14-status-and-resume-notes)
15. [Real 3D boards](#15-real-3d-boards)

---------------------------------------------------------------------------------------------------------------------

## 1. File layout

```
index.html                 lobby + game screens, options sheet, game-over modal
css/base.css               tokens (chess.com palette), buttons, underline tabs, sheet, modal
css/lobby.css  game.css  board.css  fx.css
data/videos.js             CM_DATA.videos       (generated from data/videos.json: id, title, category, date, views, dur)
data/legacy_modes.js       CM_DATA.legacyModes  (generated; config for the ported legacy library)
data/modes/index.js        CM_DATA.modeIndex    (generated: id -> {title, name, category, frame}; lobby "Remastered")
data/modes/<id>.js         one mode file per video (CM.mode({...}))
js/core/ns.js              CM namespace, CM.util (esc, norm, loadScript, ...), CM.bus, CM.store
js/core/settings.js        user settings + board themes + piece sets (CM.settings)
js/core/sound.js           pooled HTMLAudio sounds (CM.sound.play/register)
js/engine/geometry.js      boards: size, holes, masks, shapes, colour directions
js/engine/movement.js      Betza parser + built-in piece catalogue
js/engine/variant.js       rules engine (CM.Variant): moves, legality, results, evaluation, SAN
js/engine/search.js        alpha-beta (2 players) / paranoid (3-4 players) search (CM.Search)
js/engine/spec.js          normalize a spec, FEN-like setup parser, mode loader (CM.mode, CM.spec.load)
js/engine/events.js        declarative timed/random events (spec.events)
js/bot/stockfish.js        real Stockfish WASM builds from unpkg, lazy: 19 lite (default), 17.1 lite, 10 (CM.stockfish.ask)
js/bot/maia.js             Maia human-move nets 1100-1900 (lc0 weights from jsDelivr, lazy; plain-JS inference) (CM.maia)
js/bot/bot.js              bot engine choice (CM.bot.engineFor: Maia / Stockfish version / CM.Search) + styles
data/bot_engines.js        per-mode engine pins (CM_DATA.botEngines), e.g. a video that played Stockfish 10
js/fx/vfx.js               data-driven VFX (CM.VFX): play(effect), vfx_timeline triggers, darkness masks
js/fx/scene3d.js           shared REAL 3D board renderer (CM.scene3d, three.js), section 15
js/vendor/three.min.js     three.js r170 (MIT) bundled as a classic script -> window.THREE, loaded on demand by scene3d
js/ui/board-view.js        DOM board: any size, holes, coords, highlights, dots/rings, drag+click, slide animation, camera
js/ui/game-ui.js           game chrome: layout/sizing, player bars, move list, status, game-over modal, promotion picker
js/ui/settings-panel.js    options sheet (board theme, piece set, toggles)
js/game/spec-game.js       controller for chess modes (CM.SpecGame); builds ctx for hooks
js/game/game-frame.js      controller for "video game" frames (CM.GameFrame, CM.defineGame)
js/games/<name>.js         canvas mini-games for non-chess videos
js/modes/<name>.js         OPTIONAL shared hook libraries (CM.defineHooks(name, {...})) reused by several mode files
js/legacy/*                the ported 8x8 library of the original single-file app (fallback for videos with no mode file)
js/lobby/lobby.js          lobby (tabs, search, rows)
js/app.js                  boot, routing (#/ and #/play/<id>), screen crossfades, dispatch to a controller
tools/build-data.mjs       regenerate data/*.js and validate every mode file (use --check in CI)
tools/mode-kind.mjs        lobby badge heuristic used by build-data for new videos
tools/qa_ui.py             Playwright UI smoke test (lobby, settings, skins, standard game, promotion, resign)
qa/engine-sweep.mjs        build all 500 modes in a Node sandbox (npm run sweep)
qa/validate-modes.mjs      standalone mode-file validation
qa/lab.html                isolated local page for browser QA
test/rules.test.mjs        standard-chess rules tests (npm test)
```

How a video finds its mode (js/app.js): lobby row -> `CM.app.openVideo(id)`. If `CM_DATA.modeIndex[id]` exists the
mode file is loaded with a `<script>` tag (`CM.spec.load`), normalized, and started with `CM.SpecGame`
(`frame: 'chess'`, default) or `CM.GameFrame` (`frame: 'game'`). Otherwise the legacy port plays it
(`CM.legacyGame`). Writing a mode file therefore replaces the legacy version of that video automatically.

---------------------------------------------------------------------------------------------------------------------

## 2. Mode file

```js
/* <video title>: one line on what the video does. Sources: research/modes/<id>.json, transcript 0:13 ... */
CM.mode({
  id: 'xp6Pr-rB4JA',                 // REQUIRED, the YouTube id = file name. App-only modes set no_video: true
  title: 'Backrooms Chess',           // video title (lobby falls back to data/videos.json)
  name: 'Backrooms Chess',            // short mode name shown in the lobby row and top bar
  category: 'Horror Chess',
  description: 'How it works, 1-3 sentences (side panel).',
  how_to_win: 'One sentence.',
  frame: 'chess',                     // 'chess' (default) | 'game' (see section 9)
  player_side: 'white',               // 'white' | 'black' | a colour letter from players[]
  player:   { name: 'You', rating: null, avatar: 'assets/avatars/iwantcheckmate.png' },
  opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/avatars/stockfish.png', tagline: 'shown in the side panel' },
  players: null,                      // 3-4 player modes only, section 4
  board: { ... },                     // section 3
  theme: { ... },                     // section 3
  pieces: { ... },                    // section 5
  setup: { ... },                     // section 6
  rules: { ... },                     // section 7
  bot: { ... },                       // section 8
  clock: null,                        // null | '3+2' | { w: 60, b: 60, inc: 1, bot: true } (seconds)
  events: [ ... ],                    // section 10
  vfx: [ ... ],                       // effects played when a game starts (persistent ones stay)
  vfx_timeline: [ ... ],              // section 11
  sounds: { scream: 'assets/modes/<id>/scream.wav' },  // extra named sounds
  assets: { face: 'assets/modes/<id>/face.svg' },      // preloaded images (refer to them by path)
  messages: { win: 'you captured the anomalous king', loss: '...', draw: '...', win_title: 'You Escaped!' },
  params: { ... },                    // free-form numbers your hooks read via ctx.params
  hooks: { ... },                     // section 12; or 'name' -> js/modes/name.js
  game: { ... },                      // frame 'game' only, section 9
  source: { research: 'research/modes/<id>.json', confidence: 'high', notes: 'what was inferred' }
});
```
Unknown top-level keys produce a warning in the console and in `build-data.mjs`. Keys starting with `_` are ignored.

---------------------------------------------------------------------------------------------------------------------

## 3. Board and theme

```js
board: {
  files: 8, ranks: 8,                 // 1..32 each. Square names: files a..z then aa, ab, ... ; ranks 1..32
  holes: ['a1', 'h8'],                // void squares (not part of the board, drawn as background)
  mask: ['.x....x.', 'xx....xx', '........', ...],  // top row first; '.' square, 'x' ' ' '-' hole
  shape: { type: 'cross', corner: 3 } // generators: 'cross' (4-player plus board), 'diamond' {radius}
  wrapFiles: false,                   // cylinder: the a-file is next to the last file (circular / ring boards)
  walls: ['d4', 'e5'],                // immovable wall squares (type '#', drawn hatched; nothing passes)
  squares: { e4: { color: 'rgba(255,0,0,.3)', label: 'X', cls: 'my-class' } },  // static square decorations
  viewport: { files: 16, ranks: 9, mobile: { files: 9, ranks: 9 }, follow: 'player_king' },
                                      // big boards: show a window that pans (320ms ease-out) to follow a square
  image: 'assets/modes/<id>/board.png', // optional full-board image instead of coloured squares
  light: '#ebecd0', dark: '#739552'   // shorthand for theme.light/dark
}
theme: {
  light: '#bab44b', dark: '#a29423',  // square colours (applied when the user keeps "Use each mode's own board look")
  texture: { light: 'url', dark: 'url' },
  pieces: 'cburnett',                 // force a piece set from assets/pieces (open-licensed sets only)
  background: '#1d1a12'               // page background behind the board
}
```
Board geometry: square index `i = row * files + col`, row 0 = the top row from White's view (highest rank). So on
8x8 a8 = 0, h1 = 63. `geo.name(i)`, `geo.parse('e4')`, `geo.step(i, dc, dr)` (screen steps, -1 off board, -2 hole),
`geo.dist(a, b)` (king distance), `geo.relRow(i, colour)` (0 = that colour's back row), `geo.depth(colour)`.

---------------------------------------------------------------------------------------------------------------------

## 4. Players and colours

Two players by default: `w` (moves up the screen, goes first) and `b` (moves down). For 3-4 players declare them in
turn order:
```js
players: [
  { color: 'r', forward: 'up',    name: 'You',   base: 'w', swatch: '#bf3b43' },
  { color: 'u', forward: 'right', name: 'Blue',  base: 'w', swatch: '#4185bf', rating: 1800 },
  { color: 'y', forward: 'down',  name: 'Yellow',base: 'w', swatch: '#c09526' },
  { color: 'g', forward: 'left',  name: 'Green', base: 'w', swatch: '#4e9161' }
],
player_side: 'r'
```
* `forward`: 'up' | 'down' | 'left' | 'right' (screen direction the colour's pawns advance; piece vectors rotate with it).
* `team`: same value = allies (2v2). Default: everyone for themselves.
* `base`: which piece images to draw ('w' or 'b' set); colours other than w/b are tinted with CSS (`pc--tint-r|u|y|g`).
* A player with no legal moves (or whose king is captured) is knocked out: their pieces turn grey and dead
  (capturable obstacles) and they stop taking turns. Last team standing wins (or use a win condition).
* FEN letters only cover w/b; place other colours with `[r:K]` tokens or `setup.place`.

---------------------------------------------------------------------------------------------------------------------

## 5. Pieces

Built-in types (single-letter ids used in FEN): `P N B R Q K`, fairy `A` archbishop (BN), `C` chancellor (RN), `D`
dragon (QN, has art), `M` amazon (QN), `E` elephant (FA), `F` ferz, `W` wazir, `G` grasshopper, `L` nightrider,
`I` camel, `U` commoner, `X` cannon, neutral `#` wall, `*` duck. Override or add types in `pieces`:

```js
pieces: {
  S: { name: 'SCP-2774', moves: '', value: 0, capturable: false, img: 'assets/modes/JUlTxosCXuk/scp2774.png' },
  H: { name: 'Hawk', moves: 'FN', value: 600, glyph: 'B', badge: 'H' },     // drawn as a bishop with a badge
  Dragon: { name: 'Dragon', moves: 'QN', value: 1200, img: { w: '...', b: '...' } }  // long ids: [Dragon] in FEN
}
```
Fields: `name, value` (centipawns, used by the bot), `moves` (Betza string or atom list), `royal` (losing it loses /
it must not be left in check), `pawn` (drop restrictions, promotion), `promote` (this type promotes),
`promoteTo: [...]`, `promoteZone`, `enPassant`, `castle` (king-like castler), `castleRook`, `capturable: false`,
`blocker` (immovable obstacle; nothing lands or passes), `overlay: 'wall'|'duck'|'backrooms'|'void'` (CSS drawing
for blockers), `attacks` (neutral piece that gives check to both sides), `controlledBy: 'both'|'w'|'b'` (a neutral
piece a side may move), `img` (url or {w,b,n}), `glyph` (standard image to borrow) + `badge` (small label),
`cls` (extra CSS class on the image), `points` (for the points win), `gen: 'hookName'` (custom generator, section 12).

**Betza notation** (`moves`): atoms `W` (1,0) `F` (1,1) `D` (2,0) `N` (2,1) `A` (2,2) `H` (3,0) `C` (3,1) `Z` (3,2)
`G` (3,3); shorthands `K`=WF, `Q`=W0F0 (riders), `R`=W0, `B`=F0. A doubled atom (`NN`) or `0` suffix is an unlimited
rider; a number is a range (`W3` = up to 3 steps). Prefix modifiers: `f b l r v s` (forward/back/left/right/vertical/
sideways, owner's frame), `m` move only, `c` capture only, `i` only before the piece has moved, `n` lame (blockable),
`p` cannon hop (jump exactly one piece), `g` grasshopper (land right behind the hurdle). Examples: pawn `fmWfcFifmnD`,
pawn without double step `fmWfcF`, xiangqi horse `nN`, cannon `mRcpR`.
Atom objects are also accepted: `{ v: [[1,2],[2,1]], range: 1, mode: 'mc', symmetric: true }` (dx>0 = owner's
right, dy>0 = owner's forward).

---------------------------------------------------------------------------------------------------------------------

## 6. Setup

```js
setup: {
  fen: 'n*nnnn*k/**pppp**/pp4pp/8/8/PP4PP/**PPPP**/K*NNNN*N',  // rows top first, any size
  turn: 'w',                          // who moves first (default first player)
  random: 'chess960',                 // instead of fen
  place: [{ type: 'B', color: 'w', at: 'random_empty', count: 2, rows: [3,4,5] }, { type: 'K', color: 'b', at: 'p15' }],
  hands: { w: ['N'], b: [] },         // pieces in hand (drop modes)
  moved: ['e1'],                      // squares whose piece counts as already moved (no castling/double step)
  x: { anything: 1 }                  // initial custom state, read/written by hooks as state.x
}
```
FEN syntax: uppercase White, lowercase Black, digits (multi-digit ok) = empty squares, holes count as squares; `*` =
wall, `.` = one empty square, `[Id]` White piece with a long id, `[id]` Black, `[n:Id]` neutral, `[r:K]` any colour.
A setup string instead of an object is treated as `{fen}`. Pawns off their colour's second row count as moved.

---------------------------------------------------------------------------------------------------------------------

## 7. Rules

```js
rules: {
  check: 'standard',                  // 'standard' | 'none' (king capture) | per colour { b: 'standard', w: 'none' }
  castling: true, enPassant: true,
  promotion: { choices: ['Q','N','R','B'], zone: 1 },   // see below
  drops: false,                       // crazyhouse: captured pieces go to your hand, drop on empty squares
  atomic: false,                      // true | { radius: 1, spare: ['P'] }: captures explode
  gravity: null,                      // { dir: 'down'|'up'|'left'|'right', exempt: ['P','K'] } after every move
  movesPerTurn: null,                 // { w: 2, b: 1 } (a check ends the turn early)
  forcedCapture: false,               // giveaway-style compulsory captures
  friendlyCapture: false,             // capture your own pieces (not the king)
  fog: false,                         // fog of war: you only see squares your pieces can reach
  wrapFiles: false,
  stalemate: 'draw',                  // 'draw' | 'win' | 'loss' (for the side to move)
  drawPlies: 200,                     // half-moves without capture/pawn move -> draw
  royalSafety: 'all',                 // with several royals: 'all' must be safe | 'any' one is enough
  win: [ { type: 'checkmate' } ]      // list, first match wins; section 7.1
}
```
**Promotion** (`rules.promotion`), owner requirement: the player chooses on a chess.com-style vertical strip over the
promotion square (images from the current piece set; clicking outside the strip cancels the move). Bots always pick
automatically (the search ranks every promotion choice).
* `{ choices: ['Q','N','R','B'] }` (default, chess.com order; `to` is an alias of `choices`). Any custom types allowed,
  e.g. `{ choices: ['N'] }` (Cross Derby: knight only, no picker shown when there is one choice),
  `{ choices: ['Q','Dragon'] }`.
* `{ auto: 'Q' }`: no picker, always that piece. The user setting "Always promote to queen" acts like `auto: 'Q'`
  whenever Q is a choice.
* `{ none: true }` or `false`: pawns never promote.
* `zone: n` promotes on the last n rows; per type overrides `pieces.X.promoteTo` / `promoteZone`.

### 7.1 Win conditions (`rules.win`)
| type | fields | meaning |
|---|---|---|
| `checkmate` | | default; stalemate per `rules.stalemate` |
| (royal loss) | | always on: a side whose royal piece disappears loses (king capture, atomic) |
| `nchecks` | `n: 3` | give n checks |
| `reach` | `squares: 'd4 e4' or 'last_rank'`, `piece`, `color`, `why` | a piece reaching a square wins |
| `eliminate` | `result: 'loss'|'win'`, `nonRoyal`, `color`, `why` | losing all pieces loses (or wins: giveaway) |
| `capture` | `piece: 'K'` or `pieces: [...]`, `color`, `why` | capturing every piece of that type/colour wins |
| `points` | `target: 10`, `values: { P:1, N:3 }` | first to the target in capture points (shown as +N) |
| `survive` | `moves: 20` or `plies`, `color: 'b'`, `why` | that colour wins after surviving N moves |
| `turns` | `plies`, `winner: 'w'|'b'|'d'`, `why` | game ends after N plies |
Anything else: `hooks.checkWin(V, st, moves)` returning `{ w: 'w'|'b'|'d', why }`.

---------------------------------------------------------------------------------------------------------------------

## 8. Bot and opponent

```js
bot: {
  engine: 'auto',       // 'auto' (Stockfish when legal for the position) | 'stockfish' | 'search' | 'random'
  elo: 1500,            // default = opponent.rating; < 1320 or non-standard positions use CM.Search
  style: 'elo',         // 'elo' | 'best' | 'worst' | 'second' | 'random' | 'top3' | 'nth_half' | 'blunder5' | 'mix' {p} | 'drawish' | 'aggro'
  depth: 4, time_ms: 650, min_ms: 380
}
```
Real engines play only standard positions (8x8, PNBRQK, checkmate, standard check; no rule hooks unless
`hooks.stockfishOk`), with style 'elo' or 'best'; everything else uses CM.Search. Which engine (`CM.bot.engineFor`):
* `data/bot_engines.js` pins first: `{ stockfish: '10' | '17' | '19' }` (the build the video used), `{ engine: 'maia' | 'stockfish' }`.
* Stockfish (UCI_Elo when rated < 3190): style 'best', an engine-named opponent (Stockfish, Komodo, ...Fish) rated
  >= 1320, `engine: 'stockfish'`, or anyone rated > 2150.
* Maia (human-like): every other opponent (chess.com bots, people), net = nearest 100-point bucket 1100..1900, sampled
  with temperature 0.12 (>= 1700), 0.25 (1400-1699), 0.45 (1100-1399); below 1100 the 1100 net runs hotter and plays
  some random moves (rating 250: T 2.2, 35% random). `engine: 'maia'` forces it.
* Fallbacks: Maia unavailable -> Stockfish (rating >= 1320) -> CM.Search. Nothing loads before a bot needs it.
`tools/bot_engine_probe.py` lists the engine every chess mode gets; `tools/test_human_bots.py --net live|blocked|local`
plays a few moves against each engine and checks the fallbacks.
A king left en prise is always captured. `hooks.botPick(ctx, ranked)` overrides the choice (`ranked` = [{m, v}],
best first). `opponent`/`player` profiles drive the player bars, side panel and game-over modal;
`ctx.setOpponent({...})` changes them live (e.g. a bot whose rating changes every move).

---------------------------------------------------------------------------------------------------------------------

## 9. Video game frame (`frame: 'game'`)

For videos that are not a chess game on a board (platformers, shooters, ...). The chrome stays (player bars, move
list, rules, status line, action bar, game-over modal); the board is replaced by a canvas.
```js
frame: 'game',
game: { module: 'sword-king', aspect: 1, controls: ['left', 'right', '|', 'jump', 'action'], ...your settings }
```
`js/games/<module>.js`:
```js
CM.defineGame('sword-king', function (host) {
  // host.spec, host.params, host.canvas, host.g (2D context), host.size {bw, bh}, host.dpr(), host.reduced()
  // host.loop(fn(dt, t)), host.after(ms, fn), host.hud(html), host.status(text), host.toast(text)
  // host.sound(name), host.fx(effect), host.setPlayers({opp, you}), host.setThinking(t), host.setActive('top'|'bottom')
  // host.setMoves(list), host.setCaptured(topImgs, bottomImgs), host.pieceUrl(c, t)
  // host.picker(label, [{value, label}], current, onPick)   (levels / speeds in the side panel)
  // host.over({ result: 'win'|'loss'|'draw', why, title }), host.isOver
  return { start, newGame, stop, undo /* optional */, flip /* optional */, key(code, down), resize(w, h, dpr), redraw };
});
```
Keys arrive as 'left' 'right' 'up' 'down' 'jump' 'action' (arrows/WASD, Space, J/K/Enter, and the on-screen
buttons shown on touch screens). Set `wantsRawKeys: true` on the returned object to get other `KeyboardEvent.code`s.
The engine (`CM.Variant`, `CM.Search`, `CM.spec.buildVariant`) is available to game modules (see sword-king.js).

---------------------------------------------------------------------------------------------------------------------

## 10. Events (`events`)

Game-level scripted changes (never inside the search, so they may be random):
```js
events: [
  { when: 'every_plies:6', do: [{ spawn: { type: 'N', color: 'b', at: 'random_empty', count: 1 } }, { fx: 'flash:#f00' }] },
  { when: 'time:30000', once: true, do: { message: 'The lights go out.', fx: { type: 'darkness', radius: 1 } } },
  { when: 'bot_move', chance: 0.3, do: { hook: 'myHook' } }
]
```
Triggers (shared with the VFX timeline): `move`, `player_move`, `bot_move`, `capture`, `player_capture`,
`bot_capture`, `check`, `promotion`, `castle`, `game_start`, `player_turn`, `game_over`, `win`, `loss`, `draw`,
`knockout`, `ply:N`, `move_number:N`, `every_plies:N`, `random:P` (per move), `time:MS` (once), `every_ms:MS`,
`piece_captured:T`, `piece_moved:T`, `square:e4`, `event:name` (fired by `ctx.trigger('name')`). Object triggers
may filter: `{ on: 'capture', by: 'player', piece: 'Q', side: 'w', after_ply: 10 }`.
Actions: `spawn {type, color, at, count, rows, props}`, `remove {at|types|color|count}`, `transform {from, to,
to_color, at, count, fx}`, `move_toward {type, color, target: 'player_king'|'nearest_enemy', steps, captures,
win_on_reach, why}`, `fx`, `message`, `sound`, `set {key, value}` (state.x), `hook: 'name'` (calls hooks[name](ctx,
info, action)), `trigger: 'name'`, `end {winner: 'player'|'bot'|'d', why}`. Squares (`at`): 'e4', a list, 'random',
'random_empty', 'random_piece', 'to', 'from', 'player_king', 'bot_king', 'king:w', 'center', 'piece:T'.

---------------------------------------------------------------------------------------------------------------------

## 11. VFX and sound

Effects are objects or `'type:arg'` shorthands. Common fields: `duration_ms` (0 = persistent until cleared),
`delay_ms`, `at` (square spec as above, or 'board' / 'screen'), `sound`, `id` (to clear one persistent effect).
| type | fields |
|---|---|
| `flash` | color, opacity, hold, at (square = square flash) |
| `tint` | color, blend, opacity, target 'board'|'screen' |
| `vignette` | color, size (%), target |
| `overlay` | image, html, text, fit, blend, at, opacity, fade_ms |
| `jumpscare` | image, background, duration_ms (1100), intensity, shake: false, sound (default 'jumpscare') |
| `shake` | intensity px, duration_ms, target 'screen'|board (only where the video shakes) |
| `glitch` | intensity, duration_ms |
| `particles` | kind 'explosion'|'confetti'|'sparks'|'smoke'|'gold'|'blood'|'glitch'|'dust', image, count |
| `explosion` | at, radius, image (default assets/img/boom.png), shake: false |
| `text` | text, color, size, at |
| `highlight` | squares or at, color, duration_ms |
| `arrow` | from, to, color, width, duration_ms (chess.com style arrow) |
| `darkness` / `vision` | radius, source 'own_pieces'|'king'|'reach'|'squares'|'all_pieces', squares, opacity, color, soft |
| `fog` | as darkness with fog texture |
| `scanlines`, `blur` {intensity}, `invert`, `fade_board`, `shake_piece`, `piece_transform` {style 'flip'|'fade'|'flash'|'gold'} |
| `sound` | sound |
`vfx_timeline: [{ trigger, effect | effects: [...], duration_ms, sound, at, delay_ms, once, chance }]` plays effects
on the triggers of section 10. Hooks call `ctx.fx(effect)` / `ctx.clearFx(type)`. Every effect honours reduced
motion (shakes and zooms become fades). Built-in sounds: the Lichess "piano" set (assets/sounds/lichess/*.mp3,
AGPLv3+, see assets/sounds/README.md): move-self, move-opponent, capture, castle, move-check, promote, game-start,
game-end, illegal, notify, premove (played when a premove is set), tenseconds (once when the player's running clock
drops under 10 s), victory, defeat, draw. Lichess ships one move sound for both colours and none for castling,
promotion or premove, so those names share Move.mp3. Our own tick, jumpscare, explosion (.wav) are unchanged. Mode
effect sounds stay our own: add with `sounds: {name: url}`. Never extract audio from the videos.

Motion rules for all modes: piece slides ~200 ms ease-out (bot moves too), screen fades 220-300 ms ease-out,
presses darken for 120 ms; no bounce, pop or shake unless the video has it.

---------------------------------------------------------------------------------------------------------------------

## 12. Hooks

Inline in the mode file (`hooks: { ... }`) or a shared module (`hooks: 'name'` -> `js/modes/name.js` calling
`CM.defineHooks('name', {...})`). Two kinds:

**Rule hooks** (pure, also run inside the bot's search; no randomness, no DOM; treat state as copy-on-write):
* `moves(V, st, out)` add/remove pseudo-legal moves (return a new array or mutate `out`)
* `filterMoves(V, st, legal)` restrict legal moves
* `onMake(V, prevState, move, nextState)` extra effects of a move (mutate `nextState.b` / `nextState.x`)
* `attacks(V, st, sq, byColour)` extra attack sources (for check)
* `checkWin(V, st, moves)` -> `{w, why}` | null
* `evaluate(V, st)` extra score in centipawns from White's view
* `gen` named generators: `pieces.X.gen: 'name'` -> `hooks.name(V, st, from, piece, out)` pushes `{f, t, p, c, cap, capSq}`
* `stockfishOk: true` lets Stockfish play although hooks exist (only if they do not change chess rules)

**Game hooks** (real game only; may be random, may use ctx):
* `init(ctx)` once; `setup(ctx)` each new game before the first render; `onStart(ctx)` after it
* `beforeMove(ctx, move)` return false to refuse the player's move
* `afterMove(ctx, move, info)` after each move; may return a **Promise** for scripted sequences (input locked until
  it resolves; e.g. a monster moving, forced moves with arrows). `info = {ply, side, by: 'player'|'bot', piece, from,
  to, toName, capture, captured, check, move}`
* `onTurn(ctx, colour)`, `onTick(ctx, now)` (every 100 ms), `onTrigger(ctx, name, info)`, `onGameOver(ctx, result)`,
  `onUndo(ctx)`, `onExit(ctx)`
* `canDoubleTap(ctx, sq)` -> true when a double-tap on that square has an extra action; `doubleTap(ctx, sq)` runs it and
  returns true when it consumed the tap (Sniper Bishops: tap a target to capture by moving, double-tap it to shoot).
  Works with or without a selected piece, and the single tap of the pair is only delayed (300 ms) when that same tap
  would also move a piece, so ordinary moves stay instant. `doubleRightTap(ctx, sq)` is the same gesture on the right
  button (Portals: double-click an empty square for blue, double-right-click for orange).
* A move that shares `from`/`to` with an ordinary move (a hook's extra move, e.g. `snipe` / `tt`) should set
  `special: true`: a plain tap always plays the ordinary move and the special one is only reachable through
  `doubleTap`.
* `drop(ctx, from, to, info)` runs before a drag is treated as a move; return `true` to consume it. `to` is -1 when the
  pointer is released off the board, and `info.dx` / `info.dy` are the drag in squares from the piece's centre (y down),
  so a mode can use the gesture itself (Launch Pawns: pull a pawn backwards, it fires the opposite way with power equal
  to the pull length). Called only after a real pointer drag, never for a tap.
* `decorate(ctx, sq, piece)` -> `{cls, html, badge, img, hidePiece}` per square each render
* `visible(ctx, sq, piece)` -> false hides an enemy piece; `vision(ctx, maskOpts)` custom darkness set
* `status(ctx)` -> text for the line under the board
* `camera(ctx)` -> square the viewport follows; `botPick(ctx, ranked)` -> move

**ctx** (game API): `state` (get/set), `V`, `geo`, `spec`, `params`, `human`, `bot`, `colors`, `ply`, `x`, `over`,
`last`, `opponent`, `sq(name)`, `name(i)`, `at(i)`, `piece(t, c, extra)`, `set(i, p)`, `spawn(t, c, i, props)`,
`remove(i)`, `move(f, t)`, `transform(i, {type, color, props})`, `setX(k, v)`, `emptySquares(filter)`,
`pieces(filter)` (indices), `moveToward(opts)`, `fx(effect)`, `clearFx(type)`, `sound(name)`, `toast(text)`,
`trigger(name, info)`, `setOpponent(profile)`, `refresh()` (recompute legal moves/result and redraw after
mutations), `endGame(winner, why)` (winner 'player'|'bot'|'d'|colour), `after(ms, fn)` (cancelled by New game),
`random(n)`, `chance(p)`, `pick(list)`, `game` (the SpecGame). Mutations through ctx are recorded in undo history.

---------------------------------------------------------------------------------------------------------------------

## 13. Tools and workflow

1. `node tools/build-data.mjs --check` validates every mode file and the generated indexes. Run it without `--check`
   after adding or renaming a mode so the lobby picks it up.
2. `npm run validate` (`node qa/validate-modes.mjs`) checks mode files independently of the lobby data.
3. `npm run sweep` (`node qa/engine-sweep.mjs`) builds all 500 modes in a Node sandbox and reports illegal starts and
   rule warnings. Two warnings are expected by design: a random card hand and the Pac-Man maze pocket.
4. `npm test` runs the standard-chess rules tests; `npm run lint` checks the hand-written scripts and tooling.
5. Browser checks: `python3 -m http.server 8000`, or `python3 tools/qa_ui.py` (Playwright) for the standard-game UI
   smoke test. `qa/lab.html` isolates a board or mode while debugging.

Art rules (owner, 2026-11-24): standard pieces use the open-licensed sets in assets/pieces. All mode art is copied
directly from the videos: ship research/frames/sprites/<id>_*.png as-is; recreate exactly from frames where none exist.

## 14. Status and resume notes
See [STATUS.md](../STATUS.md) (what is done, what is next) and the proof modes in `data/modes/` (stockfish.js,
wTudFnunSL0.js atomic, xp6Pr-rB4JA.js Backrooms, JUlTxosCXuk.js SCP-2774, YjXV6gL8SsA.js Minihouse,
7REcDCBnXZ8.js Cross Derby, rx-HCGCNuDo.js gravity platformer via js/games/sword-king.js) as worked examples.

---------------------------------------------------------------------------------------------------------------------

## 15. Real 3D boards

`js/fx/scene3d.js` (owner-approved 2026-11-25):

three.js r170 is vendored (`js/vendor/three.min.js`, an esbuild IIFE of the npm module exposing `window.THREE`; MIT
licence in `js/vendor/three.LICENSE.txt`). No CDN: it loads with a classic `<script>` on demand, so it works from
`file://` and GitHub Pages. `CM.scene3d` lays a WebGL canvas over `#board-wrap` and makes the 2D board invisible (it
stays in the DOM: the engine, legal moves, QA clicks and undo are unchanged). Taps on the canvas are raycast to a
square and passed to `SpecGame.onTap`, so a 3D mode is still an ordinary mode file with ordinary rules.
```js
hooks: { onStart: function (ctx) {
  CM.scene3d.attach(ctx, {
    board: { light, dark, edge, thickness: 0.3 } | false,    // slab per square (holes skipped); false = draw your own
    pieces: 'mesh' | 'sprite' | false,                       // lathe-turned Staunton models, or the piece art as billboards
    colors: { w: {color, emissive, roughness}, b: {...}, n: {...} },  // MeshStandardMaterial params per colour
    pieceStyle(ctx, p, i) -> { color, emissive, scale, hide },       // per-piece override
    heightOf(ctx, i) -> y, squareVisible(ctx, i) -> bool,     // stepped / floating / vanishing platforms
    camera: { theta, phi, dist, target: [x, y, z], fov },    // spherical around target; dist defaults to fit the board
    follow(ctx) -> square, background: '#hex' | null, fog: { color, near, far }, highlights: true,
    drawBlockers: false, onFrame(S, dt, now)
  }).then(function (S) { /* S null = no WebGL: the 2D board stays (fallback) */ });
} , onExit: function () { CM.scene3d.detach(); } }
```
`S`: `THREE, scene, camera, renderer, root, canvas, sq2world(i, y), setCamera({theta, phi, dist, target}, ms)`
(eased), `rotate(dTheta, ms)`, `sync(true)` (rebuild after a hook mutated pieces outside a move), `pieceMesh(t, c)`,
`tween(fn(k), ms)` (ease-out driver; snaps under reduced motion), `tex(url)` (texture; null on `file://`, where
images taint WebGL, so sprites fall back to meshes), `add(obj)`, `dispose()`. The scene re-syncs from `ctx.state`
every frame it changes (moved piece slides ~200 ms ease-out with a small arc), and detaches itself when the game
screen changes. Square geometry: x = col - (files-1)/2, z = row - (ranks-1)/2 (row 0 = far side), y up, 1 unit =
1 square. QA: headless Chromium renders it with SwiftShader (`--use-gl=angle --use-angle=swiftshader`); without
WebGL `attach` resolves `null` and nothing breaks.
Extra options (art-3d): `spriteFallback: 'glyph'` (on `file://` sprite pieces become flat glyph sprites instead of turned meshes),
`spriteScale` (.9), `spriteLift` (.45), `board.basic` (unlit flat square colours), `lastColor` / `lastOpacity` (last-move + selection colour).
`js/fx/g6_3d.js` (loaded on demand from the mode's onStart) holds two worked examples on top of it: `CM.g6_3d.tower` (Who Takes the Crown:
`S.root.rotation.x = PI/2` stands the live board upright, the other floors are canvas-textured boxes, crown sprite, HUD) and `CM.g6_3d.beyond`
(Beyond the Board: stepped `heightOf`, own glow layer instead of `highlights`, rotate buttons/right click/Q E). Modes use
`hooks: { extends: 'g6_levels', onStart, onExit }` and call `CM.g6_3d.detach()` on exit.
