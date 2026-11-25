/* Can I BEAT Anarchy Chess?  A 10x10 board built from r/AnarchyChess memes vs the Anarchy bot (800): the underage pawn
   (a pawn your bishop can see must be captured), nuclear fusion (a knight and a rook moving onto the same square merge
   into a knook = rook + knight), the anti-queen (moves to any square a queen could NOT reach), long passant, pawn
   throwing. Sources: research/modes/qDkxrnZfeXw.json (frames: 10x10 #eaead2/#5a7296), research JcpCAs1a2gc for the bot.
   PASS 1: underage pawn, fusion and anti-queen implemented; the start position is a 10x10 layout with one anti-queen
   per side (exact start not captured). */
CM.mode({
  id: 'qDkxrnZfeXw',
  title: 'Can I BEAT Anarchy Chess?',
  name: 'Anarchy Chess',
  category: 'Variants & Games',
  description: 'Holy hell. A 10x10 board of meme rules: if your bishop can see an enemy pawn you MUST take it (the pawn is underage); move a knight onto your own rook (or a rook onto your knight) and they fuse into a Knook (rook + knight); the Anti-queen jumps to any square a queen could not reach from where it stands.',
  how_to_win: 'Checkmate the Anarchy bot.',
  player_side: 'white',
  opponent: { name: 'Anarchy bot', rating: 800, avatar: 'assets/modes/qDkxrnZfeXw/anarchy_bot.png', tagline: 'Google en passant. Holy hell.' },
  board: { files: 10, ranks: 10, light: '#eaead2', dark: '#5a7296' },
  pieces: {
    P: { img: { w: 'assets/modes/qDkxrnZfeXw/baby_pawn_w.png', b: 'assets/modes/qDkxrnZfeXw/baby_pawn_b.png' } }, /* art-g6: the video's baby-face underage pawn (research sprite) */
    Kn: { name: 'Knook', moves: 'RN', value: 850, glyph: 'R', badge: 'N' },
    Aq: { name: 'Anti-queen', moves: '', value: 450, glyph: 'Q', badge: 'anti', gen: 'antiQueen' }
  },
  setup: { fen: 'rnb[aq]qkbnr1/pppppppppp/10/10/10/10/10/10/PPPPPPPPPP/RNB[Aq]QKBNR1' },
  rules: { castling: false, enPassant: true, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'search', depth: 2, time_ms: 450, elo: 800, style: 'blunder5' },
  hooks: {
    antiQueen: function (V, st, from, p, out) {
      var g = V.geo, reach = {};
      [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function (d) { var j = from; for (;;) { j = g.step(j, d[0], d[1]); if (j < 0) break; reach[j] = 1; if (st.b[j]) break; } });
      for (var i = 0; i < st.b.length; i++) { if (i === from || reach[i] || !g.isValid(i)) continue; var q = st.b[i]; if (q && (q.c === p.c || V.def(q.t).royal)) continue; out.push({ f: from, t: i, p: p.t, c: p.c, cap: q || null }); }
    },
    moves: function (V, st, out) {
      var g = V.geo, c = st.turn;
      st.b.forEach(function (p, i) {
        if (!p || p.c !== c || (p.t !== 'N' && p.t !== 'R')) return;
        var want = p.t === 'N' ? 'R' : 'N';
        st.b.forEach(function (q, j) {
          if (!q || q.c !== c || q.t !== want) return;
          var dc = Math.abs(g.col(j) - g.col(i)), dr = Math.abs(g.row(j) - g.row(i)), ok = false;
          if (p.t === 'N') ok = (dc === 1 && dr === 2) || (dc === 2 && dr === 1);
          else if (dc === 0 || dr === 0) { ok = true; var sc = Math.sign(g.col(j) - g.col(i)), sr = Math.sign(g.row(j) - g.row(i)), k = g.step(i, sc, sr); while (k >= 0 && k !== j) { if (st.b[k]) { ok = false; break; } k = g.step(k, sc, sr); } }
          if (ok) out.push({ f: i, t: j, p: p.t, c: c, cap: null, fuse: 1 });
        });
      });
      return out;
    },
    onMake: function (V, st, m, n) { if (m.fuse) n.b[m.t] = { t: 'Kn', c: st.turn, m: 1 }; },
    filterMoves: function (V, st, legal) {
      var forced = legal.filter(function (m) { var cp = m.f >= 0 && st.b[m.f], tg = st.b[m.capSq != null ? m.capSq : m.t]; return cp && cp.t === 'B' && tg && tg.t === 'P' && tg.c !== st.turn; });
      return forced.length ? forced : legal;
    },
    afterMove: function (ctx, mv) { if (mv && mv.fuse) { ctx.toast('Nuclear fusion! Knight + rook = KNOOK', 2200); ctx.fx({ type: 'flash', color: '#fff6a0', opacity: 0.5, at: ctx.name(mv.t) }); } else if (mv && mv.p === 'B' && mv.cap && mv.cap.t === 'P') ctx.toast('That pawn was underage.', 1800); }
  },
  todo_pass2: ['pawn throwing (piece behind a pawn throws it to one of three squares; stunned for a move)', 'long passant (chained en passant)', 'more r/AnarchyChess rules flashed on screen', 'knook and anti-queen piece art (original)', 'Anarchy bot meme chat lines', 'il vaticano'],
  source: { research: 'research/modes/qDkxrnZfeXw.json', confidence: 'medium', notes: 'Start position and anti-queen count invented.' }
});
