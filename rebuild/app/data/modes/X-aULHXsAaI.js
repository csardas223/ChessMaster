/* Can I SURVIVE Racing Kings?  Racing Kings vs higher/equal-rated humans (~1590-1760), goal 3 wins; he starts as Black.
   Sources: research/modes/X-aULHXsAaI.json, frames (medleypaper 1763, user ~1593, highlighted 8th rank, chat). Rules in js/modes/g5_racing.js (no checks, race to rank 8, Black's one-move equaliser). */
CM.mode({
  id: 'X-aULHXsAaI',
  title: 'Can I SURVIVE Racing Kings?',
  name: 'Racing Kings (Survive)',
  category: 'Variants & Games',
  description: 'No pawns. Both armies start on the first two ranks (White on the right half, Black on the left) and both kings race up the board. Giving check is illegal for both sides, so kings can never be attacked.',
  how_to_win: 'Get your king to the 8th rank first. You play Black: if White arrives first you still draw by arriving on the very next move.',
  player_side: 'black',
  player: { name: 'You', rating: 1593 },
  opponent: { name: 'medleypaper', rating: 1763, tagline: 'Racing Kings opponent on chess.com.' },
  board: { files: 8, ranks: 8, light: '#ecf2d1', dark: '#7a9f57',
    squares: { a8: { color: 'rgba(255,214,0,.22)' }, b8: { color: 'rgba(255,214,0,.22)' }, c8: { color: 'rgba(255,214,0,.22)' }, d8: { color: 'rgba(255,214,0,.22)' }, e8: { color: 'rgba(255,214,0,.22)' }, f8: { color: 'rgba(255,214,0,.22)' }, g8: { color: 'rgba(255,214,0,.22)' }, h8: { color: 'rgba(255,214,0,.22)' } } },
  setup: { fen: '8/8/8/8/8/8/krbnNBRK/qrbnNBRQ' },
  rules: { castling: false, enPassant: false, promotion: false },
  bot: { engine: 'search', elo: 1763, depth: 4, time_ms: 700 },
  clock: { w: 180, b: 180, inc: 0, bot: false },
  hooks: 'g5_racing',
  source: { research: 'research/modes/X-aULHXsAaI.json', confidence: 'high', notes: 'Finish line tinted on rank 8 (frames show it highlighted).' }
});
