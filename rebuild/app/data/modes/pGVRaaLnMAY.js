/* Can I BEAT Ambush?  chess.com community variant, 3-minute blitz vs humans. Before move 1 each player places a king
   and a rook anywhere on their own 2nd rank (placements alternate). The rest of the army is Soldiers (move and
   capture one square straight ahead) and Sergeants (one square forward or diagonally forward); neither moves back.
   Fog of war: you only see squares your pieces can reach. No check: capture the enemy king. Sources:
   research/modes/pGVRaaLnMAY.json, rules.jsonl, frames visual (grey fog, two pawn icons: normal and spiked). The exact
   unit arrangement is visual-only: here the 3rd rank alternates Soldier / Sergeant and the 2nd rank holds the king and
   rook you place. Promotion of a unit on the last rank is inferred (chess.com default). */
CM.mode({
  id: 'pGVRaaLnMAY',
  name: 'Ambush',
  category: 'Variants & Games',
  description: 'First place your king and your rook anywhere on your 2nd rank (tap a piece in your hand, then a square). Then play in fog of war: you only see squares your pieces can reach. Soldiers move and capture one square straight ahead; Sergeants one square forward or diagonally forward. There is no check.',
  how_to_win: 'Capture the hidden enemy king.',
  player_side: 'white',
  opponent: { name: 'ChocoCaramelPawn', rating: 1601, avatar: null, tagline: 'Hides the king somewhere in the fog.' },
  board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
  pieces: {
    S: { name: 'Soldier', moves: 'fW', value: 110, pawn: true, promote: true, img: { w: 'assets/modes/pGVRaaLnMAY/soldier_w.svg', b: 'assets/modes/pGVRaaLnMAY/soldier_b.svg' } },
    T: { name: 'Sergeant', moves: 'fWfF', value: 170, pawn: true, promote: true, img: { w: 'assets/modes/pGVRaaLnMAY/sergeant_w.svg', b: 'assets/modes/pGVRaaLnMAY/sergeant_b.svg' } }
  },
  setup: { fen: '8/8/tstststs/8/8/STSTSTST/8/8', hands: { w: ['K', 'R'], b: ['K', 'R'] } },
  rules: { check: 'none', castling: false, enPassant: false, fog: true, drops: true, promotion: { choices: ['Q', 'R', 'B', 'N'] } },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'search', elo: 1600, depth: 3, time_ms: 700 },
  hooks: {
    filterMoves: function (V, st, legal) {
      var h = st.hands[st.turn] || [];
      if (!h.length) return legal.filter(function (m) { return !m.drop; });
      return legal.filter(function (m) { return m.drop && V.geo.relRow(m.t, st.turn) === 1; });
    },
    checkWin: function (V, st) {
      if ((st.hands.w || []).length || (st.hands.b || []).length) return null;
      var kw = V.royals(st, 'w').length, kb = V.royals(st, 'b').length;
      if (!kw) return { w: 'b', why: 'the king was ambushed' };
      if (!kb) return { w: 'w', why: 'the king was ambushed' };
      return null;
    },
    vision: function (ctx) {
      var V = ctx.V, st = ctx.state, me = ctx.human, dist = new Array(V.geo.size).fill(99);
      st.b.forEach(function (p, i) { if (p && p.c === me) dist[i] = 0; });
      V.gen(Object.assign({}, st, { turn: me })).forEach(function (m) { if (!m.drop) dist[m.t] = 0; });
      return { dist: dist };
    },
    status: function (ctx) { var h = ctx.state.hands[ctx.human] || []; return h.length ? 'Place your ' + (h[0] === 'K' ? 'king' : 'rook') + ' on your 2nd rank.' : 'Find and capture the hidden king.'; }
  },
  source: { research: 'research/modes/pGVRaaLnMAY.json', confidence: 'medium', notes: 'Unit arrangement and promotion inferred; placement is visible to the side placing only because the fog hides the enemy 2nd rank.' }
});
