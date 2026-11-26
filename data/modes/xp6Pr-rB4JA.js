/* Backrooms Chess. A lone black king lost on a huge open yellow board hunts the "anomalous" white king while White
   spawns a new bishop, knight and pawn every turn.
   Sources: transcript "Backrooms Chess transcript.md" (0:13 every turn white spawns pieces; 0:24 checks; 4:20 the
   900-tile setup: white starts with K, B, N, P and spawns B+N+P every turn; 3:40 "a 30 by 30 grid"; 3:59 "you can
   still only see 16 by 9 squares"), frames research/frames/visual_*.jsonl (open yellow/olive board #bab44b/#a29423,
   no walls visible, legal-move dots around the black king). Inferred: where pieces spawn (random, not next to your
   king), the light flicker (ambient, not in the video), White's king ignores check (it is "anomalous" and can be
   captured, which is how game 2 ends). */
CM.mode({
  id: 'xp6Pr-rB4JA',
  name: 'Backrooms Chess',
  category: 'Horror Chess',
  description: 'You are a lone black king on a 30 by 30 board and can only see a small window around you. Every turn White moves one piece and spawns a brand new bishop, knight and pawn somewhere in the Backrooms. They move normally and can check you.',
  how_to_win: 'Find the anomalous white king and capture it before White\'s growing army traps your king.',
  player_side: 'black',
  player: { name: 'You', rating: null, avatar: 'assets/avatars/iwantcheckmate.png' },
  opponent: { name: 'The Backrooms', rating: null, avatar: 'assets/modes/xp6Pr-rB4JA/horror_face.png', tagline: 'Every move you make spawns three more pieces.' },
  board: { files: 30, ranks: 30, zoom: false /* the small window is the game: no universal zoom */, viewport: { files: 16, ranks: 9, mobile: { files: 9, ranks: 9 }, follow: 'player_king' } },
  theme: { light: '#bab44b', dark: '#a29423', background: '#24200f' },
  setup: { turn: 'b' },
  rules: { check: { b: 'standard', w: 'none' }, castling: false, enPassant: false, drawPlies: 100000, promotion: { auto: 'Q' } },
  bot: { engine: 'search', style: 'best', depth: 2, time_ms: 500, min_ms: 300 },
  params: { spawn: ['B', 'N', 'P'], start: ['K', 'B', 'N', 'P'], minSpawnDist: 2, kingStartDist: 9 },
  vfx_timeline: [
    { trigger: 'every_ms:8000', chance: 0.4, effect: { type: 'flash', color: '#fff6c4', opacity: 0.16, hold: 0.1, duration_ms: 260, at: 'screen' } }
  ],
  vfx: [{ type: 'vignette', color: 'rgba(20, 16, 0, 0.55)', size: 62, opacity: 0.7 }],
  messages: { win: 'you captured the anomalous king', win_title: 'You Escaped!', loss: 'the Backrooms got you' },
  hooks: {
    setup: function (ctx) {
      var g = ctx.geo, P = ctx.params, empties = ctx.emptySquares();
      var bk = ctx.pick(empties.filter(function (i) { return g.dist(i, g.idx(15, 15)) <= 6; }));
      ctx.spawn('K', 'b', bk);
      P.start.forEach(function (t) {
        var far = t === 'K' ? P.kingStartDist : 4;
        var cand = ctx.emptySquares(function (i) { return g.dist(i, bk) >= far && (t !== 'P' || (g.rank(i) > 1 && g.rank(i) < g.ranks)); });
        ctx.spawn(t, 'w', ctx.pick(cand));
      });
      ctx.state.start = { wRoyal: true, bRoyal: true };
    },
    /* every White turn: spawn one new bishop, knight and pawn (game 1 and 2 rules) */
    afterMove: function (ctx, m, info) {
      if (info.by !== 'bot') return;
      var g = ctx.geo, P = ctx.params, bk = ctx.V.royals(ctx.state, 'b')[0];
      if (bk == null) return;
      P.spawn.forEach(function (t) {
        var cand = ctx.emptySquares(function (i) { return g.dist(i, bk) >= P.minSpawnDist && (t !== 'P' || (g.rank(i) > 1 && g.rank(i) < g.ranks)); });
        if (cand.length) ctx.spawn(t, 'w', ctx.pick(cand));
      });
    },
    /* White hunts: pieces drift toward your king, its own king keeps away */
    evaluate: function (V, st) {
      var g = V.geo, b = st.b, bk = -1, wk = -1, v = 0, i;
      for (i = 0; i < b.length; i++) { var p = b[i]; if (p && p.t === 'K') { if (p.c === 'b') bk = i; else wk = i; } }
      if (bk < 0) return 0;
      for (i = 0; i < b.length; i++) { var q = b[i]; if (q && q.c === 'w' && q.t !== 'K') v += Math.max(0, 12 - g.dist(i, bk)) * 6; }
      if (wk >= 0) v += Math.min(g.dist(wk, bk), 12) * 25;
      return v;
    },
    status: function (ctx) {
      var n = ctx.pieces(function (p) { return p.c === 'w'; }).length;
      return n + ' anomalous piece' + (n === 1 ? '' : 's') + ' in the Backrooms';
    }
  },
  source: { research: 'research/frames (xp6Pr-rB4JA), transcript', confidence: 'high' }
});
