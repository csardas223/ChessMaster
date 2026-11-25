/* Can I BEAT Martin with 3 PAWNS?  Odds game: you have only a king and three pawns against Martin's full army.
   Sources: research/modes/fnDkGF-EF44.json (K+3P vs full army, frames confirm; later a promoted queen; brown board).
   Pawn files inferred (d, e, f). */
CM.mode({
  id: 'fnDkGF-EF44',
  name: 'Martin vs 3 Pawns',
  category: 'Variants & Games',
  description: 'You start with only your king and three pawns. Martin, the 250-rated beginner bot, has his whole army. Promote a pawn and hunt down his king.',
  how_to_win: 'Checkmate Martin.',
  player_side: 'white',
  opponent: { name: 'Martin', rating: 250, avatar: 'assets/modes/fnDkGF-EF44/martin.png', tagline: 'Beginner bot. Very friendly.' },
  board: { files: 8, ranks: 8, light: '#ebd9b0', dark: '#b08666' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/3PPP2/4K3' },
  rules: { castling: false },
  bot: { engine: 'search', elo: 250, depth: 2, time_ms: 400 },
  source: { research: 'research/modes/fnDkGF-EF44.json', confidence: 'medium' }
});
