/* pol-human: per-mode engine pins, read by js/bot/bot.js (CM.bot.engineFor). Mode files stay untouched; a mode not listed
   here gets the automatic choice (Maia for human/chess.com-style opponents in standard positions, Stockfish 19 for
   engine opponents, CM.Search for variants). Keys: engine 'maia'|'stockfish', stockfish '10'|'17'|'19' (js/bot/stockfish.js).
   Each pin names the evidence (research/modes/<id>.json). */
window.CM_DATA = window.CM_DATA || {};
CM_DATA.botEngines = {
  /* "How Many Queens to BEAT Stockfish 17?": "Tony plays real Stockfish 17 at depth 35". npm has no 17.0 build;
     stockfish@17.1.0 (Stockfish 17.1) is the nearest real build. */
  '-cQ58zhZrSo': { stockfish: '17', note: 'video: Stockfish 17 (depth 35); build: Stockfish 17.1 lite (nearest real build)' },
  /* "How Many ROOKS to BEAT Stockfish?" (opponent card "Stockfish 17", transcript 0:01 "stockfish 17... depth of 35") */
  'vEk6QGmqLdA': { stockfish: '17', note: 'video: Stockfish 17 (depth 35); build: Stockfish 17.1 lite (nearest real build)' },
  /* "How Many Queens to BEAT Stockfish 10? (NOT Komodo)": "real Stockfish 10 (via external software, depth 25)" */
  'COBnLrfJVpE': { stockfish: '10', note: 'video: Stockfish 10 (depth 25); build: stockfish@10.0.2 (Stockfish 10 WASM)' }
};
