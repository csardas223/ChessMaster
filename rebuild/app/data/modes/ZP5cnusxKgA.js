/* Can I MASTER Racing Kings Chess?  five online Racing Kings games vs ~1500-1700 humans.
   Sources: research/modes/ZP5cnusxKgA.json, frames (PlayerOCh... 1676, Masoe1 1529, 1-5 counter). Rules in js/modes/g5_racing.js (no checks, race to rank 8, Black's one-move equaliser). */
CM.mode({
  id: 'ZP5cnusxKgA',
  title: 'Can I MASTER Racing Kings Chess?',
  name: 'Racing Kings (Master)',
  category: 'Variants & Games',
  description: 'No pawns. Both armies start on the first two ranks (White on the right half, Black on the left) and both kings race up the board. Giving check is illegal for both sides, so kings can never be attacked.',
  how_to_win: 'Get your king to the 8th rank first (if Black reaches it on the very next move, it is a draw). Goal: five games.',
  player_side: 'white',
  player: { name: 'You', rating: 1600 },
  opponent: { name: 'PlayerOCh', rating: 1676, tagline: 'Racing Kings opponent on chess.com.' },
  board: { files: 8, ranks: 8, light: '#eaf6d2', dark: '#7ea25a',
    squares: { a8: { color: 'rgba(255,214,0,.22)' }, b8: { color: 'rgba(255,214,0,.22)' }, c8: { color: 'rgba(255,214,0,.22)' }, d8: { color: 'rgba(255,214,0,.22)' }, e8: { color: 'rgba(255,214,0,.22)' }, f8: { color: 'rgba(255,214,0,.22)' }, g8: { color: 'rgba(255,214,0,.22)' }, h8: { color: 'rgba(255,214,0,.22)' } } },
  setup: { fen: '8/8/8/8/8/8/krbnNBRK/qrbnNBRQ' },
  rules: { castling: false, enPassant: false, promotion: false },
  bot: { engine: 'search', elo: 1676, depth: 4, time_ms: 700 },
  clock: { w: 180, b: 180, inc: 0, bot: false },
  hooks: 'g5_racing',
  source: { research: 'research/modes/ZP5cnusxKgA.json', confidence: 'high', notes: 'Finish line tinted on rank 8 (frames show it highlighted).' }
});
