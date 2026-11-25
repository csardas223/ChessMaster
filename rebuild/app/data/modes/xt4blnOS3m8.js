/* Can I BEAT Fog of War Chess?  chess.com Fog of War: you only see your own pieces and the squares they can move to (enemy pieces included when
   you could capture them); everything else is under a grey cloud. There is no check: kings may move into danger and the
   game ends when a king is captured. Sources: research/modes/xt4blnOS3m8.json (fog cloud over unseen squares, king capture,
   fog lifted at the end for the replay). */
CM.mode({
  id: 'xt4blnOS3m8',
  name: 'Fog of War',
  category: 'Variants & Games',
  description: 'You can only see your own pieces and the squares they could move to. Everything else is hidden in fog, including most of the enemy army. There is no check or checkmate: kings can walk into danger, and whoever captures the enemy king wins.',
  how_to_win: 'Capture the enemy king.',
  player_side: 'white',
  opponent: { name: 'Online opponent', rating: 1550, avatar: null, tagline: 'Hidden somewhere in the fog.' },
  board: { files: 8, ranks: 8, light: '#ebecd0', dark: '#739552' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { fog: true, check: 'none' },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'search', elo: 1550, depth: 3, time_ms: 700 },
  messages: { win: 'you captured the king', loss: 'your king was captured' },
  source: { research: 'research/modes/xt4blnOS3m8.json', confidence: 'high', notes: 'The bot sees the whole board.' }
});
