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
  player: { name: 'ireallywantcheckmate', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's chess.com handle + purple-king avatar from the frames */
  opponent: { name: 'TheCraythi…', rating: 1877, avatar: 'assets/modes/hVOA_oScEBQ/opp1.png', tagline: 'Online Horde player.' },
  board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/1PP2PP1/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP' },
  rules: { win: [{ type: 'checkmate' }, { type: 'eliminate', color: 'w', why: 'the horde was wiped out' }] },
  clock: { w: 180, b: 180, inc: 2 },
  bot: { engine: 'search', elo: 1880, depth: 3, time_ms: 800 },
  params: { series: {opponents: [{name: 'TheCraythi…', rating: 1877, avatar: 'assets/modes/hVOA_oScEBQ/opp1.png'}, {name: 'Hyunkel18', rating: 1893, avatar: 'assets/modes/hVOA_oScEBQ/opp2.png'}]} },
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
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/hVOA_oScEBQ/intro.jpg', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/hVOA_oScEBQ.json', confidence: 'high', notes: 'art-audit-b: chess.com default avatar swapped for the exact same art at 256px (https://www.chess.com/bundles/web/images/user-image.007dad08.svg), tone-matched to the video crop.' }
});
