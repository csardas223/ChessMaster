/* Can I SURVIVE Horde Chess?  chess.com Horde: White has 36 pawns (ranks 1-4 plus b5, c5, f5, g5) and no king; Black has a
   normal army. White wins by checkmate, Black wins by capturing everything White has. Pawns on the first rank may also
   double-step. Sources: research/modes/hVOA_oScEBQ.json (FEN rnbqkbnr/pppppppp/8/1PP2PP1/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP, 3|2). */
CM.mode({
  id: 'hVOA_oScEBQ',
  name: 'Horde (White)',
  category: 'Variants & Games',
  description: "You are the horde: 36 pawns and no king against a full army. Push in a solid wall, keep attacked pawns defended and break through.",
  how_to_win: "Checkmate Black. Black wins by capturing every one of your pawns.",
  player_side: 'white',
  opponent: { name: 'Human opponent', rating: 1880, avatar: null, tagline: 'Online Horde player.' },
  board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/1PP2PP1/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP' },
  rules: { win: [{ type: 'checkmate' }, { type: 'eliminate', color: 'w', why: 'the horde was wiped out' }] },
  clock: { w: 180, b: 180, inc: 2 },
  bot: { engine: 'search', elo: 1880, depth: 3, time_ms: 800 },
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
  source: { research: 'research/modes/hVOA_oScEBQ.json', confidence: 'high' }
});
