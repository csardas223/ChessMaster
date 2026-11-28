/* Can I BEAT Circular Chess?  iwantcheckmate plays Circular Chess on Green Lemon Games' Deckmate (beta) as White vs the
   experimental "Circular Chess Bot", Level 1 (0:43-1:00); a draw by threefold repetition (16:23).
   Board (video top-down frames maxres2/3, measured; the developer's own "How to play Circular Chess", 2lIS76dOB2Q):
   20 files a-t round the circle x 8 ranks, rank 1 the outer ring and rank 8 the inner ring, a hole in the middle,
   152 squares: the two outer rings are missing on the four side sectors i, j, s, t ("eight squares are missing from the
   outside middle of the board to protect the back rank"). a1 dark; White's wing a-h at the bottom, Black's k-r on top.
   Ranks are rings and come full circle (1:26); files run in and out and stop at the hole; diagonals end where they meet
   the board's edge or a missing square, no bouncing (1:41). Setup: the normal back ranks on each wing (Black's king on
   n1 facing White's on e1), plus two extra knights each on the inner ring "positioned so that the respective bishops
   can easily defend them" (2:01, dev video 0:27): White j8 + s8 (on the c1 and f1 bishops' diagonals), Black i8 + t8
   (p1 and m1 bishops). Pawns of both colours move toward the centre and promote on the inner ring to a rook, bishop or
   knight only. Castling as in chess (6:20), en passant and check/stalemate as in chess.
   The engine plays this as a 20x8 grid whose files wrap (ring = rank); js/modes/circular.js draws it round. */
CM.mode({
  id: 'ePpFGTNs5sE',
  name: 'Circular Chess',
  category: 'Variants & Games',
  description: 'A round board of 20 files (a to t) and 8 rings: rank 1 is the outer ring, rank 8 the inner ring. Ranks come full circle, so rooks and queens can ride all the way round; files and diagonals stop at the edge. Each side has two extra knights on the inner ring. Pawns march toward the centre and promote there to a rook, bishop or knight.',
  how_to_win: 'Checkmate the Circular Chess Bot.',
  player_side: 'white',
  opponent: { name: 'Circular Chess Bot', rating: null, avatar: 'assets/modes/ePpFGTNs5sE/bot_avatar.png', tagline: 'Experimental. Level 1.' },
  players: [{ color: 'w', forward: 'up' }, { color: 'b', forward: 'up' }],   /* both armies' pawns head for the inner ring (row 0) */
  board: {
    files: 20, ranks: 8, wrapFiles: true,
    holes: ['i1', 'i2', 'j1', 'j2', 's1', 's2', 't1', 't2'],
    light: '#efedb2', dark: '#856347',
    viewport: { files: 8, ranks: 8 }, zoom: false   /* square board window; the round board is drawn over it */
  },
  theme: { background: '#0dd7bf', pieces: 'cburnett' },   /* Deckmate's teal; its 2D pieces are the cburnett shapes */
  setup: { fen: '8nN8Nn/20/20/20/20/20/PPPPPPPP2pppppppp2/RNBQKBNR2rnbkqbnr2' },
  rules: { castling: true, enPassant: true, promotion: { to: ['R', 'B', 'N'], zone: 1 } },
  bot: { engine: 'search', elo: 900, style: 'elo', depth: 2, time_ms: 700 },
  hooks: 'circular',
  vfx_timeline: [],
  source: {
    research: 'research/modes/ePpFGTNs5sE.json',
    confidence: 'high',
    notes: 'Geometry, colours, labels and setup measured from the video frames and the developer\'s rules video (2lIS76dOB2Q). Inferred: files do not continue across the hole (the hole is not part of the board; nothing in either video crosses it); en passant kept as in chess (not shown). The thumbnail\'s 3D board (no extra knights) is an older Deckmate start position.'
  }
});
