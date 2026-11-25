/* Can I BEAT 10,000 Player Chess?  An .io-style massively multiplayer chess board (compared to Slither.io /
   Agar.io): a huge shared checkerboard where every player owns a handful of pieces and hunts the others; a
   'Captured' counter tracks kills and losing your king is 'Game Over!'. Sources: research/modes/TsA-ro0GZ0I.json,
   frames visual (#eaead2/#72a24e, scattered pieces of many colours, Captured: 3/9/17). PASS 1: turn-based on a 32x32
   board (engine max; video ~48 wide), the other players are one bot colour whose pieces spawn in as new players join. */
CM.mode({
  id: 'TsA-ro0GZ0I',
  title: 'Can I BEAT 10,000 Player Chess?',
  name: '10,000 Player Chess',
  category: 'Variants & Games',
  description: 'A giant shared board full of other players, each with a few pieces. You start with a small squad around your king. Every capture adds to your Captured counter; new players keep joining the board. Your king follows normal check rules; the other players have no king.',
  how_to_win: 'Reach 20 captures before your king is checkmated.',
  player_side: 'white',
  opponent: { name: '10,000 players', rating: null, tagline: 'Everyone else on the board (io-style).' },
  board: { files: 32, ranks: 32, light: '#eaead2', dark: '#72a24e', viewport: { files: 14, ranks: 14, mobile: { files: 10, ranks: 10 }, follow: 'player_king' } },
  setup: {
    fen: '32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/14PPP15/14NKB15/15R16/32/32/32/32/32/32/32/32/32/32/32/32/32/32',
    place: [
      { type: 'P', color: 'b', at: 'random_empty', count: 34 },
      { type: 'N', color: 'b', at: 'random_empty', count: 14 },
      { type: 'B', color: 'b', at: 'random_empty', count: 12 },
      { type: 'R', color: 'b', at: 'random_empty', count: 8 },
      { type: 'Q', color: 'b', at: 'random_empty', count: 3 }
    ]
  },
  rules: {
    check: { w: 'standard', b: 'none' }, castling: false, enPassant: false,
    promotion: { choices: ['Q', 'N', 'R', 'B'] },
    drawPlies: 400,
    win: [{ type: 'points', target: 20, values: { P: 1, N: 1, B: 1, R: 1, Q: 1, K: 1 } }, { type: 'checkmate' }]
  },
  bot: { engine: 'search', depth: 2, time_ms: 450, min_ms: 300 },
  events: [
    { when: 'every_plies:8', do: [{ spawn: { type: 'N', color: 'b', at: 'random_empty', count: 1 } }, { spawn: { type: 'P', color: 'b', at: 'random_empty', count: 2 } }] }
  ],
  messages: { loss: 'Game Over! You were checkmated.' },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/TsA-ro0GZ0I/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: {
    status: function (ctx) { var s = ctx.state.score || {}; return 'Captured: ' + (s.w || 0) + ' / 20  ·  players on board: ' + ctx.pieces(function (p) { return p.c === 'b'; }).length; }
  },
  todo_pass2: ['many-colour pieces (one tint per player)', 'real-time movement and other players moving at once', 'minimap', 'Game Over! You were ... banner'],
  source: { research: 'research/modes/TsA-ro0GZ0I.json', confidence: 'medium', notes: 'No transcript rules; win target (20 captures) chosen from the Captured counter in frames.' }
});
