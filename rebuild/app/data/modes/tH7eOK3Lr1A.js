/* Can I BEACHCAFE OPENING?  Rosen Score word opening: the first letters of your first moves must spell BEACHCAFE, and the trophy only
   counts if you then win. Sources: research/modes/tH7eOK3Lr1A.json (word BEACHCAFE, opponents lb_q ~2033, Mahak8160 ~2024). A pawn move counts as its file letter, a piece move as its piece letter. */
CM.mode({
  id: 'tH7eOK3Lr1A',
  name: 'BeachCafe Opening',
  category: 'Variants & Games',
  description: 'A Rosen Score challenge: your first moves must spell BEACHCAFE (B, E, A, C, H, C, A, F, E: bishop, e-pawn, a-pawn, c-pawn, h-pawn, c-pawn, a-pawn, f-pawn, e-pawn). Pawn moves count as their file letter (e4 and exd5 are both E), piece moves as their letter (B, N, R, Q, K). While a move fits the next letter, only fitting moves are allowed.',
  how_to_win: 'Spell BEACHCAFE with your opening, then win the game to unlock the trophy.',
  player_side: 'white',
  opponent: { name: 'lb_q', rating: 2033, avatar: null, tagline: 'Online opponent who does not know your plan.' },
  board: { files: 8, ranks: 8, light: '#eaedd1', dark: '#759e55' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'search', elo: 2033, depth: 4, time_ms: 700 },
  params: { word: 'BEACHCAFE', side: 'w', title: 'BeachCafe Opening' },
  hooks: 'g6_rosen',
  source: { research: 'research/modes/tH7eOK3Lr1A.json', confidence: 'medium' }
});
