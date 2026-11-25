/* Can I En Passant Checkmate?  Normal chess against Martin (250); the challenge only counts if the mating move is an
   en passant capture (Tony keeps Martin's 7th-rank pawns unmoved, promotes for a mating net and waits for ...e7-e5,
   dxe6 e.p.#). Sources: research/modes/6qVgF1OO_cw.json (transcript 0:01, 9:44), frames visual_b (Martin 250, green). */
CM.mode({
  id: '6qVgF1OO_cw',
  title: 'Can I En Passant Checkmate?',
  name: 'En Passant Checkmate',
  category: 'Other Videos',
  description: 'Normal chess against Martin, but the game only counts if your checkmating move is an en passant capture. Keep some of his pawns on their starting squares, build a mating net, and wait for a pawn to step two squares next to yours. An ordinary checkmate ends the game as a failed challenge.',
  how_to_win: 'Checkmate Martin with an en passant capture.',
  player_side: 'white',
  opponent: { name: 'Martin', rating: 250, avatar: 'assets/modes/6qVgF1OO_cw/martin.svg', tagline: 'chess.com beginner bot. Never misses a mate in one.' },
  board: { files: 8, ranks: 8, light: '#eaead2', dark: '#72a25a' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'search', elo: 250, depth: 2, time_ms: 400 },
  messages: { win_title: 'En Passant Checkmate!', draw: 'Checkmate, but not by en passant. The challenge failed.' },
  hooks: 'g4_epmate',
  source: { research: 'research/modes/6qVgF1OO_cw.json', confidence: 'high', notes: 'Non-en-passant mate scored as a draw (challenge failed); meme overlay replaced by an EN PASSANT text flash.' }
});
