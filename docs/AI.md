# Opponents and AI

Chess Master is single-player: each game is you against a bot. There is no online multiplayer, matchmaking or account
system, and moves never leave the browser. The only network requests are the versioned engine/weight files when a bot
first needs them.

## Which engine plays

`CM.bot.engineFor` chooses per position (implementation: `js/bot/bot.js`):

1. **Pins.** `data/bot_engines.js` can force a build for a video: `{ stockfish: '10' | '17' | '19' }` or
   `{ engine: 'maia' | 'stockfish' }`. A video that showed Stockfish 10 gets Stockfish 10.
2. **Stockfish** for standard 8x8 positions with no rule hooks, when the mode/opponent asks for it: an engine-named
   opponent (Stockfish, Komodo, …Fish), `engine: 'stockfish'`, an opponent rated above 2150, or a rating of 1320+.
   Rated opponents use UCI_Elo below 3190; above that, full strength.
3. **Maia** for human-like opponents (chess.com bots, named people) at 1100–1900. The nearest 100-point net is used
   with a temperature that rises as the rating falls (0.12 at 1700+, 0.25 at 1400–1699, 0.45 at 1100–1399). Below
   1100 the 1100 net runs hotter and plays some random moves (at rating 250: temperature 2.2, 35% random).
4. **`CM.Search`** for everything else: custom boards, portals, monster modes, hands, rule hooks, and non-standard
   piece sets. It searches the variant's own legal moves and evaluation, so it understands the mode.

Fallbacks are deliberately boring: if Maia cannot load or run → Stockfish (when the position is standard and the
rating is ≥ 1320) → `CM.Search`. Nothing loads before a bot needs it, and a failed engine never leaves the game stuck.

## Stockfish

- Builds: `stockfish@19.0.1` (Stockfish 19 lite, default), `stockfish@17.1.0` (17.1 lite) and `stockfish@10.0.2`
  (Stockfish 10, `stockfish.js` by Nathan Rugg), all loaded from unpkg.
- The WASM worker speaks UCI. The bot sends `position`/`go` with a time budget (`time_ms`, `min_ms`, `depth` from the
  mode) and applies the move through the same variant API as a human move.
- Stockfish is only asked in positions it can represent: 8x8, standard pieces, standard check/checkmate, no rule
  hooks (unless `hooks.stockfishOk` says otherwise).
- `CM.stockfish.state()` is `idle | loading | ready | failed`; the UI can show thinking state while the worker starts.

## Maia

`js/bot/maia.js` decodes the Leela Chess Zero network format and runs the network in plain JavaScript. Weights are
loaded lazily from jsDelivr / raw.githubusercontent.com at commit `749204c`; none are bundled. The policy output is
sampled with the temperature above, which gives human-like mistakes instead of engine lines. Maia is GPLv3 (CSSLab,
University of Toronto).

## Bot styles and overrides

Modes can set `bot.style`: `elo`, `best`, `worst`, `second`, `random`, `top3`, `nth_half`, `blunder5`,
`mix {p}`, `drawish`, `aggro`. `hooks.botPick(ctx, ranked)` can replace the choice entirely (`ranked` is best-first).
A king left en prise is always taken. `ctx.setOpponent({...})` updates the opponent card live, which some videos need
(a bot whose rating changes each move).

## Testing the bots

- `node qa/engine-sweep.mjs` builds every mode and reports illegal starts, missing engines and rule errors.
- `tools/bot_engine_probe.py` lists the engine each chess mode will get.
- `tools/test_human_bots.py --net live|blocked|local` exercises the engine selection and fallbacks with the network
  available, blocked and with local weights only.
- The rules themselves are covered by `npm test`; those tests do not need the network.

See [ARCHITECTURE.md §8](ARCHITECTURE.md#8-bot-and-opponent) for the full schema and the bot/opponent fields.
