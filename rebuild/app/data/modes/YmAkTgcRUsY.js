/* Can I En Passant Checkmate Martin?  "The video ends when I get en passant checkmate on Martin": normal chess vs Martin
   (250), only a checkmate by an en passant capture counts (Tony fixes a b7 "dream pawn" with Bb6, boxes the king on
   a8/a7 and waits for ...b5, axb6 e.p.#). Sources: research/modes/YmAkTgcRUsY.json. */
CM.mode({
  id: 'YmAkTgcRUsY',
  title: 'Can I En Passant Checkmate Martin?',
  name: 'En Passant Mate vs Martin',
  category: 'Other Videos',
  description: 'Normal chess against Martin. Keep one of his pawns on its starting square, take everything else, box his king in and wait for that pawn to jump two squares past yours. Only a checkmate made by capturing en passant wins; any other checkmate fails the challenge.',
  how_to_win: 'Checkmate Martin with an en passant capture.',
  player_side: 'white',
  opponent: { name: 'Martin', rating: 250, avatar: 'assets/modes/6qVgF1OO_cw/martin.svg', tagline: 'chess.com beginner bot. Never misses a mate in one.' },
  board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'search', elo: 250, depth: 2, time_ms: 400 },
  messages: { win_title: 'En Passant Checkmate!', draw: 'Checkmate, but not by en passant. The challenge failed.' },
  hooks: 'g4_epmate',
  source: { research: 'research/modes/YmAkTgcRUsY.json', confidence: 'high', notes: 'Board colours: chess.com green (spec). Martin avatar shared with 6qVgF1OO_cw (original art).' }
});
