/* Can I BEAT Villagers Chess?  1-minute games vs ~1500 humans with non-standard armies that include Villagers (a pawn
   with a fleur-de-lis badge; the thumbnail shows three pawns merging into one). Sources: research/modes/djfYBXvvaYI.json
   (LOW confidence: transcript failed), frames visual (White back rank pawn-like, N, R, villager, N, pawn-like, B).
   Inferred: a Villager is worth "three pawns" and moves/captures one square forward or diagonally forward; the king
   fills the unseen back-rank square. Re-check against the transcript when it can be fetched. */
CM.mode({
  id: 'djfYBXvvaYI',
  name: 'Villagers Chess',
  category: 'Variants & Games',
  description: 'Each army mixes normal pieces with Villagers: tough pawns that move or capture one square straight or diagonally forward and never move back. A Villager reaching the last rank promotes like a pawn.',
  how_to_win: 'Checkmate the enemy king.',
  player_side: 'white',
  opponent: { name: 'Delhy', rating: 1514, avatar: null, tagline: '1-minute Villagers Chess.' },
  board: { files: 8, ranks: 8, light: '#ecf2d1', dark: '#7b9f59' },
  pieces: {
    V: { name: 'Villager', moves: 'fWfF', value: 260, pawn: true, promote: true, img: { w: 'assets/modes/djfYBXvvaYI/villager_w.svg', b: 'assets/modes/djfYBXvvaYI/villager_b.svg' } }
  },
  setup: { fen: 'bvnkvrnv/pppppppp/8/8/8/8/PPPPPPPP/VNRVKNVB' },
  rules: { castling: false },
  clock: { w: 60, b: 60, inc: 0 },
  bot: { engine: 'search', elo: 1514, depth: 3, time_ms: 500 },
  source: { research: 'research/modes/djfYBXvvaYI.json', confidence: 'low', notes: 'Villager movement and the full lineup are inferred (no transcript).' }
});
