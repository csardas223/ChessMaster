/* Can I SURVIVE Horde Chess?  chess.com Horde: White has 36 pawns (ranks 1-4 plus b5, c5, f5, g5) and no king; Black has a
   normal army. White wins by checkmate, Black wins by capturing everything White has. Pawns on the first rank may also
   double-step. Sources: research/modes/smg98qv_xa0.json (FEN rnbqkbnr/pppppppp/8/1PP2PP1/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP, 3|2). */
CM.mode({
  id: 'smg98qv_xa0',
  name: 'Horde (Black)',
  category: 'Variants & Games',
  description: "You play the normal army against White's horde of 36 pawns with no king. Hold off the wall of pawns and capture every last one.",
  how_to_win: "Capture all of White's pawns and pieces. White wins by checkmating you.",
  player_side: 'black',
  opponent: { name: 'ChocoCaramelPawn', rating: 1800, avatar: null, tagline: 'Online Horde player.' },
  board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/1PP2PP1/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP' },
  rules: { win: [{ type: 'checkmate' }, { type: 'eliminate', color: 'w', why: 'the horde was wiped out' }] },
  clock: { w: 180, b: 180, inc: 2 },
  bot: { engine: 'search', elo: 1800, depth: 3, time_ms: 800 },
  hooks: {
    /* first-rank horde pawns may double-step as well (chess.com rule) */
    moves: function (V, st, out) {
      if (st.turn !== 'w') return;
      for (var c = 0; c < 8; c++) {
        var i = 56 + c, p = st.b[i];
        if (p && p.t === 'P' && p.c === 'w' && !st.b[i - 8] && !st.b[i - 16]) out.push({ f: i, t: i - 16, p: 'P', c: 'w', cap: null, dbl: i - 8 });
      }
    }
  },
  source: { research: 'research/modes/smg98qv_xa0.json', confidence: 'high' }
});
