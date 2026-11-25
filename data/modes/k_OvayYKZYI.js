/* I Upgraded Rooks to BEAT Stockfish. Your rooks are Dragon Rooks: rook + knight (chancellor). You cannot castle; Fairy-Stockfish can. Standard chess otherwise.
   Sources: research/modes/k_OvayYKZYI.json (0:01 "dragon rook moves like a rook and a knight", 1:31 castling disabled for me, enabled for Stockfish, 11:02 loss), frames visual_a (green #fefede/#89af68, winged rook).
   Opponent label is not visible in the frames; Fairy-Stockfish shown as 3000+ like the rest of the Upgrade series (spec says 3600). Art is original. */
CM.mode({
  id: 'k_OvayYKZYI',
  name: 'Dragon Rooks',
  category: 'Powerups & Rule Twists',
  description: 'Your rooks are Dragon Rooks: they move like a rook or jump like a knight. You cannot castle, Fairy-Stockfish can. Trade down into an endgame where your dragons outclass its rooks.',
  how_to_win: 'Checkmate Fairy-Stockfish.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'Fairy-Stockfish', rating: 3000, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Fairy-Stockfish knows every fairy piece.' },
  board: { files: 8, ranks: 8 },
  theme: { light: '#fefede', dark: '#89af68' },
  pieces: {
    Dr: { name: 'Dragon Rook', moves: 'RN', value: 850, img: { w: 'assets/modes/k_OvayYKZYI/dragon_rook.png' }, san: 'D' }
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/[Dr]NBQKBN[Dr]' },
  bot: { engine: 'search', style: 'best', depth: 4, time_ms: 900 },
  source: { research: 'research/modes/k_OvayYKZYI.json', confidence: 'high', notes: 'Dragon rooks have no castleRook flag, so only Black can castle.' }
});
