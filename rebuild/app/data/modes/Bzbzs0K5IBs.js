/* Can I SURVIVE Duck Chess?  chess.com Duck Chess vs online humans (Lux11d ~1541 first, a 2700 at the end); Tony plays
   Black. After every move the mover places the uncapturable duck on a different empty square; no check, capture the king.
   Sources: research/modes/Bzbzs0K5IBs.json, frames visual_c (green board, yellow duck). Duck art is original
   (copy of E2x-QTgBD5k/duck.svg). Rules via the shared js/modes/g5_duck.js (read-only reuse). */
CM.mode({
  id: 'Bzbzs0K5IBs',
  title: 'Can I SURVIVE Duck Chess?',
  name: 'Duck Chess (survive)',
  category: 'Variants & Games',
  description: 'Each turn has two steps: make a normal move, then move the duck to any other empty square. Nothing can capture the duck or pass through it (knights still jump). There is no check: you may leave your king attacked, and the game ends when a king is captured.',
  how_to_win: 'Capture the enemy king.',
  player_side: 'black',
  opponent: { name: 'Lux11d', rating: 1541, tagline: 'Duck Chess opponent on chess.com' },
  board: { files: 8, ranks: 8, light: '#ebf3d1', dark: '#7a9f59' },
  pieces: { '*': { name: 'Duck', img: 'assets/modes/Bzbzs0K5IBs/duck.png' }, K: { royal: false } },
  rules: { check: 'none', drops: true, movesPerTurn: { w: 2, b: 2 }, stalemate: 'win', drawPlies: 400, win: [{ type: 'capture', piece: 'K', why: 'the king was captured' }] },
  bot: { engine: 'search', elo: 1541, depth: 3, time_ms: 700 },
  hooks: 'g5_duck',
  source: { research: 'research/modes/Bzbzs0K5IBs.json', confidence: 'high', notes: 'The later 2700 opponent is not modelled as a separate level.' }
});
