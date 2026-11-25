/* Can I BEAT Anarchy Chess?  A 10x10 board built from r/AnarchyChess memes vs the Anarchy bot (800): the underage pawn
   (a pawn your bishop can see must be captured), nuclear fusion (a knight and a rook moving onto the same square merge
   into a knook = rook + knight), the anti-queen (moves to any square a queen could NOT reach), long passant, pawn
   throwing. Sources: research/modes/qDkxrnZfeXw.json (frames: 10x10 #eaead2/#5a7296), research JcpCAs1a2gc for the bot.
   PASS 1: underage pawn, fusion and anti-queen implemented; the start position is a 10x10 layout with one anti-queen
   per side (exact start not captured).
   impl-6a pass 2 (2026-11-25): pawn throwing + stun, long passant chains, il vaticano, rules intro toast, bot chat lines
   (Anarchy bot dialogue as read out in the JcpCAs1a2gc transcript), copypasta line on its loss. Throw distance (3 ahead,
   3 landing files) and the il vaticano geometry are inferred from the transcripts, not measured from frames. */
var CHAT = ['Seriously, all they taught me were Reddit memes.', 'I still haven\'t figured out why you need so many pawns.', 'I don\'t even know how the horsey moves.', 'Please, I have children to feed. They don\'t pay me if I lose.', 'Is that how the horsey moves?', 'Google il vaticano.', 'Google en passant.', 'Holy hell.'];
CM.mode({
  id: 'qDkxrnZfeXw',
  title: 'Can I BEAT Anarchy Chess?',
  name: 'Anarchy Chess',
  category: 'Variants & Games',
  description: 'Holy hell. A 10x10 board of meme rules: if your bishop can see an enemy pawn you MUST take it (the pawn is underage); move a knight onto your own rook (or a rook onto your knight) and they fuse into a Knook (rook + knight); the Anti-queen jumps to any square a queen could not reach from where it stands. A pawn with one of your pieces right behind it can be thrown three squares ahead (it is stunned for a move); en passant chains into Long Passant; two bishops with two enemy pawns between them play Il Vaticano.',
  how_to_win: 'Checkmate the Anarchy bot.',
  intro_message: 'Anarchy rules: underage pawns, nuclear fusion (knook), anti-queen, long passant, pawn throwing, il vaticano. Holy hell.',
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
      var g = V.geo, c = st.turn, b = st.b, f = g.fwd(c), add = [];
      /* nuclear fusion: knight onto own rook / rook onto own knight = Knook */
      b.forEach(function (p, i) {
        if (!p || p.c !== c || (p.t !== 'N' && p.t !== 'R')) return;
        var want = p.t === 'N' ? 'R' : 'N';
        b.forEach(function (q, j) {
          if (!q || q.c !== c || q.t !== want) return;
          var dc = Math.abs(g.col(j) - g.col(i)), dr = Math.abs(g.row(j) - g.row(i)), ok = false;
          if (p.t === 'N') ok = (dc === 1 && dr === 2) || (dc === 2 && dr === 1);
          else if (dc === 0 || dr === 0) { ok = true; var sc = Math.sign(g.col(j) - g.col(i)), sr = Math.sign(g.row(j) - g.row(i)), k = g.step(i, sc, sr); while (k >= 0 && k !== j) { if (b[k]) { ok = false; break; } k = g.step(k, sc, sr); } }
          if (ok) add.push({ f: i, t: j, p: p.t, c: c, cap: null, fuse: 1 });
        });
      });
      /* impl-6a: PAWN THROWING (transcripts: "drag your pawn back onto one of these pieces, and then launch it forwards";
         3 highlighted landing squares; the thrown pawn is stunned for a move). A pawn with a friendly non-pawn piece directly
         behind it can be launched 3 squares ahead (straight or one file to either side), flying over pieces, onto an
         empty square. Distance inferred. A pawn that is stunned cannot be thrown again. */
      var taken = {}; out.forEach(function (m) { taken[m.f + '>' + m.t] = 1; });
      b.forEach(function (p, i) {
        if (!p || p.c !== c || p.t !== 'P' || p.stun) return;
        var bh = g.step(i, 0, -f), q = bh >= 0 ? b[bh] : null;
        if (!q || q.c !== c || q.t === 'P') return;
        [-1, 0, 1].forEach(function (dc) {
          var j = g.step(i, dc, 3 * f); if (j < 0 || !g.isValid(j) || b[j] || taken[i + '>' + j]) return;
          var m = { f: i, t: j, p: 'P', c: c, cap: null, thrown: 1 };
          if (g.relRow(j, c) === g.depth(c) - 1) m.promo = 'Q';
          add.push(m);
        });
      });
      /* impl-6a: LONG PASSANT (chained en passant): after an en passant capture the pawn may keep going, capturing every
         further enemy pawn that stands beside it on its new rank by hopping diagonally forward behind it (landing empty). */
      out.forEach(function (m) {
        if (!m.ep) return;
        (function chain(at, caps) {
          [-1, 1].forEach(function (dc) {
            var side = g.step(at, dc, 0), land = g.step(at, dc, f); if (side < 0 || land < 0 || !g.isValid(land)) return;
            var e = b[side]; if (!e || e.c === c || e.t !== 'P' || b[land] || caps.indexOf(side) >= 0 || side === m.capSq) return;
            var nc = caps.concat([side]), mm = { f: m.f, t: land, p: 'P', c: c, cap: m.cap, capSq: m.capSq, ep: true, chain: nc };
            if (g.relRow(land, c) === g.depth(c) - 1) mm.promo = 'Q';
            add.push(mm); if (nc.length < 6) chain(land, nc);
          });
        })(m.t, []);
      });
      /* impl-6a: IL VATICANO: two of your bishops on one rank or file with exactly two enemy pawns between them swap places
         and capture both pawns (r/AnarchyChess meme; the bot says "Google il vaticano"). */
      b.forEach(function (p, i) {
        if (!p || p.c !== c || p.t !== 'B') return;
        [[1, 0], [0, 1]].forEach(function (d) {
          var a1 = g.step(i, d[0], d[1]), a2 = a1 >= 0 ? g.step(a1, d[0], d[1]) : -1, j = a2 >= 0 ? g.step(a2, d[0], d[1]) : -1;
          if (j < 0 || !b[j] || b[j].c !== c || b[j].t !== 'B') return;
          var e1 = b[a1], e2 = b[a2]; if (!e1 || !e2 || e1.c === c || e2.c === c || e1.t !== 'P' || e2.t !== 'P') return;
          add.push({ f: i, t: j, p: 'B', c: c, cap: null, vatican: [a1, a2] });
          add.push({ f: j, t: i, p: 'B', c: c, cap: null, vatican: [a1, a2] });
        });
      });
      /* stunned pieces (thrown last turn) sit this move out */
      return out.concat(add).filter(function (m) { var q = m.f >= 0 ? b[m.f] : null; return !(q && q.stun); });
    },
    onMake: function (V, st, m, n) {
      var c = st.turn;
      /* the mover's stun wears off after it has sat out one move */
      n.b.forEach(function (q, i) { if (q && q.c === c && q.stun && i !== m.t) n.b[i] = Object.assign({}, q, { stun: 0 }); });
      if (m.fuse) n.b[m.t] = { t: 'Kn', c: c, m: 1 };
      if (m.thrown) n.b[m.t] = Object.assign({}, n.b[m.t], { stun: 1 });
      if (m.chain) m.chain.forEach(function (sq) { n.b[sq] = null; });
      if (m.vatican) { n.b[m.f] = st.b[m.t]; m.vatican.forEach(function (sq) { n.b[sq] = null; }); n.half = 0; }
    },
    filterMoves: function (V, st, legal) {
      var forced = legal.filter(function (m) { var cp = m.f >= 0 && st.b[m.f], tg = st.b[m.capSq != null ? m.capSq : m.t]; return cp && cp.t === 'B' && !m.vatican && tg && tg.t === 'P' && tg.c !== st.turn; });
      return forced.length ? forced : legal;
    },
    evaluate: function (V, st) { var v = 0; st.b.forEach(function (p) { if (p && p.stun) v += p.c === 'w' ? -15 : 15; }); return v; },
    decorate: function (ctx, sq, p) { return p && p.stun ? { badge: 'zz' } : null; },
    afterMove: function (ctx, mv) {
      if (!mv) return;
      if (mv.fuse) { ctx.toast('Nuclear fusion! Knight + rook = KNOOK', 2200); ctx.fx({ type: 'flash', color: '#fff6a0', opacity: 0.5, at: ctx.name(mv.t) }); }
      else if (mv.thrown) { ctx.toast('Pawn thrown! It is stunned for a move.', 1800); ctx.fx({ type: 'particles', kind: 'smoke', at: ctx.name(mv.t), count: 10 }); }
      else if (mv.chain) { ctx.toast('LONG PASSANT! ' + (mv.chain.length + 1) + ' pawns in one move. Holy hell.', 2200); }
      else if (mv.vatican) { ctx.toast('IL VATICANO!', 2200); ctx.fx({ type: 'flash', color: '#ffe680', opacity: 0.55, at: ctx.name(mv.t) }); }
      else if (mv.p === 'B' && mv.cap && mv.cap.t === 'P') ctx.toast('That pawn was underage.', 1800);
      /* impl-6a: the Anarchy bot's chat lines (dialogue voted by r/AnarchyChess, quoted in iwantcheckmate's Anarchy bot game) */
      if (mv.c === 'b' && !mv.fuse && !mv.thrown && !mv.chain && !mv.vatican) {
        var z = ctx.game._anChat = (ctx.game._anChat || 0) + 1;
        if (z % 4 === 1) ctx.toast('Anarchy bot: ' + CHAT[Math.floor(z / 4) % CHAT.length], 2600);
      }
    },
    onGameOver: function (ctx, over) { if (over && over.w === 'w') ctx.toast('Anarchy bot: The chess speaks for itself.', 3200); },
  },
  todo_pass2: ['knook and anti-queen piece art: no repo sprite/still shows them (glyph + badge kept)'],
  source: { research: 'research/modes/qDkxrnZfeXw.json', confidence: 'medium', notes: 'Start position and anti-queen count invented.' }
});
