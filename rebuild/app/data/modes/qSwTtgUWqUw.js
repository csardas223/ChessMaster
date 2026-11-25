/* Can I BEAT TINY 5D Chess?  5D Chess With Multiverse Time Travel on 4x4 boards: each side has K, R, B, N and four pawns;
   pieces may also move back through time (creating new timelines) and across timelines. Sources:
   research/modes/qSwTtgUWqUw.json, frames (#F6DAAD/#D3B07E, purple time arrows). PASS 1 (low fidelity): the 4x4 board
   is played as an ordinary game; time travel and timelines are listed in todo_pass2 (needs a multi-board engine). */
CM.mode({
  id: 'qSwTtgUWqUw',
  title: 'Can I BEAT TINY 5D Chess?',
  name: 'Tiny 5D Chess',
  category: 'Variants & Games',
  description: 'A 4x4 board with king, rook, bishop, knight and four pawns each. In the real 5D Chess your pieces could also travel back in time and across timelines; this version plays the present board only.',
  how_to_win: 'Checkmate the enemy king.',
  player_side: 'white',
  opponent: { name: '5D Chess opponent', rating: null, tagline: 'Multiverse time traveller.' },
  board: { files: 4, ranks: 4, light: '#f6daad', dark: '#d3b07e', background: '#c9d3dc' },
  setup: { fen: 'nbrk/pppp/PPPP/KRBN' },
  rules: { castling: false, enPassant: false, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'search', depth: 5, time_ms: 600 },
  todo_pass2: ['MULTIVERSE: moves back in time onto earlier boards (new timeline branch) and across timelines, Submit Moves button, present line', 'timeline board strip UI with purple time arrows', 'confirm the exact 4x4 setup from frames'],
  source: { research: 'research/modes/qSwTtgUWqUw.json', confidence: 'low', notes: 'Time travel not implemented; 4x4 single-board approximation. Pawns start on the second rank and meet immediately.' }
});
