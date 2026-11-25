/* Spinner Wheel Chess | The REMATCH.  Same series vs Martin, new wheel: MOVE (free move), CAPTURE (must make a legal
   capture even if it loses material), CHECK (must give a legal check), BLUNDER (must try to lose at least 3 points).
   If the demanded move type is impossible, play a normal move. Tony opens d4, first spin is BLUNDER (Bh6), wins with
   Qa8# (series 1-1). Sources: research/modes/nick8PeAXLA.json (SRT 0:00, 0:50, 22:00, 25:50), frames visual_b (brown board
   #eadeae/#ae8a66, wheel beside the board). Blunder moves are judged by a 2-ply search (inferred threshold 2.6 pawns). */
CM.mode({
  id: 'nick8PeAXLA',
  title: 'Spinner Wheel Chess | The REMATCH',
  name: 'Spinner Wheel: Rematch',
  category: 'Other Videos',
  description: 'Before every one of your moves the wheel lands on MOVE (play anything), CAPTURE (you must capture, even if it loses material), CHECK (you must give check) or BLUNDER (you must give away at least 3 points of material). If the wheel asks for something impossible, play any move. Play aggressively: a short game means fewer bad spins.',
  how_to_win: 'Checkmate Martin.',
  player_side: 'white',
  opponent: { name: 'Martin', rating: 250, avatar: 'assets/modes/6qVgF1OO_cw/martin.svg', tagline: 'chess.com beginner bot. Series score 1-0 to Martin.' },
  board: { files: 8, ranks: 8, light: '#eadeae', dark: '#ae8a66' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'search', elo: 250, depth: 2, time_ms: 400 },
  params: { wheel: 'action', side: 'w' },
  hooks: 'g4_wheel',
  source: { research: 'research/modes/nick8PeAXLA.json', confidence: 'high' }
});
