/* Can I BEAT Rainbow Chess?  All 32 pieces of both colours go into a bag; they are drawn at random and placed on White's
   ranks 1-2 from a1 across, then on Black's ranks 7-8, each keeping its own colour, so both camps are a mix of white and
   black pieces. Played vs Martin. Sources: research/modes/rtoo4ojjxHU.json (bag/wheel draw; no king may start in check;
   first draw a black rook on a1). Inferred: pawns that land on their own promotion rank are left as drawn (they are stuck),
   nobody can castle, pawns double-step only from their own second rank. */
CM.mode({
  id: 'rtoo4ojjxHU',
  name: 'Rainbow Chess',
  category: 'Variants & Games',
  description: 'All 32 pieces are shuffled in a bag and dealt onto ranks 1, 2, 7 and 8 regardless of colour, so a black rook might start on a1 next to your knight. Each piece still belongs to its own colour. No king starts in check. Then play normal chess against Martin.',
  how_to_win: 'Checkmate Martin.',
  player_side: 'white',
  opponent: { name: 'Martin', rating: 250, avatar: 'assets/avatars/bot.svg', tagline: 'Beginner bot. Equally confused.' },
  board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
  setup: { fen: '8/8/8/8/8/8/8/8' },
  rules: { castling: false },
  bot: { engine: 'search', elo: 250, depth: 2, time_ms: 400 },
  hooks: {
    setup: function (ctx) {
      var V = ctx.V, g = ctx.geo, bag = [];
      ['w', 'b'].forEach(function (c) { 'RNBQKBNRPPPPPPPP'.split('').forEach(function (t) { bag.push({ t: t, c: c }); }); });
      var order = [];
      [1, 2, 7, 8].forEach(function (r) { for (var f = 0; f < 8; f++) order.push(g.idx(f, 8 - r)); });
      for (var tries = 0; tries < 200; tries++) {
        var deck = CM.util.shuffle(bag.slice()), st = ctx.state;
        st.b = new Array(64).fill(null);
        order.forEach(function (sq, k) {
          var p = deck[k], own2 = V.def(p.t).pawn && g.relRow(sq, p.c) === 1;
          st.b[sq] = V.piece(p.t, p.c, { m: own2 ? 0 : 1 });
        });
        if (!V.inCheck(st, 'w') && !V.inCheck(st, 'b')) break;
      }
      st.start = { wRoyal: true, bRoyal: true };
      ctx.toast('The bag has been shuffled!', 1600);
    }
  },
  source: { research: 'research/modes/rtoo4ojjxHU.json', confidence: 'high' }
});
