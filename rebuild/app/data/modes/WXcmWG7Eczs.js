/* I Challenge a Dev to their OWN Chess Variant (Anarchy Chess): 10x10 meme chess (r/AnarchyChess) vs its developer slomg
   (~1214). Sources: research/modes/WXcmWG7Eczs.json (frames: slate-blue/cream #5f7291/#dfe8e1, cartoon pieces, orange
   last-move highlight). LOW CONFIDENCE: the exact start position is visual-only; this one is inferred.
   Implemented meme rules: pawns move up to 3 squares (en passant still on); Underage pawns must be captured by any
   enemy bishop that sees them (forced); a Knight and Rook of the same side landing on each other fuse into a Knook
   (knight + rook up to 2 squares); Bishops bounce once off the board edge; the Inverse Queen jumps to every square a
   queen could NOT reach; Checkers pieces step diagonally forward and capture by jumping; the two shared Title Rooks are
   neutral and can be moved by either side. Not modelled: pawn launching, chained long passant, super fusion, overtime
   "bored" pieces leaving the board (pass 2 below). */
(function () {
  'use strict';
  var D4 = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  CM.mode({
  player: { name: 'You', rating: null, avatar: 'assets/modes/WXcmWG7Eczs/you.png' },  /* iwantcheckmate's purple king icon from the video */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/WXcmWG7Eczs/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
    id: 'WXcmWG7Eczs',
    title: 'I Challenge a Dev to their OWN Chess Variant (Anarchy Chess)',
    name: 'Anarchy Chess',
    category: 'Variants & Games',
    description: 'Meme chess on a 10x10 board. Pawns can move up to three squares. Underage pawns must be taken by any enemy bishop that can see them. Move a knight onto your rook (or a rook onto your knight) to fuse them into a Knook. Bishops bounce off the edge of the board. The Inverse Queen jumps to every nearby square (up to 3 away) that a queen could not reach. Checkers pieces step diagonally and capture by jumping. The grey Title Rooks belong to nobody: either side may move them.',
    how_to_win: 'Checkmate slomg.',
    player_side: 'white',
    opponent: { avatar: 'assets/modes/WXcmWG7Eczs/opponent.png', name: 'slomg', rating: 1214, tagline: 'Made Anarchy Chess. Destroy the children.' },
    board: { files: 10, ranks: 10, light: '#dfe8e1', dark: '#5f7291' },
    theme: { background: '#22262e' },
    pieces: {
      P: { name: 'Pawn', moves: 'fmW3fcF', pawn: true, promote: true, enPassant: true, value: 100, img: { w: 'assets/modes/WXcmWG7Eczs/P_w.png', b: 'assets/modes/WXcmWG7Eczs/P_b.png' } },
      K: { name: 'King', img: { w: 'assets/modes/WXcmWG7Eczs/K_w.png', b: 'assets/modes/WXcmWG7Eczs/K_b.png' } },
      Q: { name: 'Queen', img: { w: 'assets/modes/WXcmWG7Eczs/Q_w.png', b: 'assets/modes/WXcmWG7Eczs/Q_b.png' } },
      R: { name: 'Rook', img: { w: 'assets/modes/WXcmWG7Eczs/R_w.png', b: 'assets/modes/WXcmWG7Eczs/R_b.png' } },
      N: { name: 'Knight', img: { w: 'assets/modes/WXcmWG7Eczs/N_w.png', b: 'assets/modes/WXcmWG7Eczs/N_b.png' } },
      U: { name: 'Underage pawn', moves: 'fmW3fcF', pawn: true, promote: true, value: 90, glyph: null, badge: null, img: { w: 'assets/modes/WXcmWG7Eczs/U_w.png', b: 'assets/modes/WXcmWG7Eczs/U_b.png' } },
      B: { name: 'Bouncing bishop', moves: '', gen: 'bounce', value: 360, img: { w: 'assets/modes/WXcmWG7Eczs/B_w.png', b: 'assets/modes/WXcmWG7Eczs/B_b.png' } },
      Knook: { name: 'Knook', moves: 'NW2', value: 700, img: { w: 'assets/modes/WXcmWG7Eczs/Knook_w.png', b: 'assets/modes/WXcmWG7Eczs/Knook_b.png' } },
      Iq: { name: 'Inverse Queen', moves: '', gen: 'inverse', value: 600, img: { w: 'assets/modes/WXcmWG7Eczs/Iq_w.png', b: 'assets/modes/WXcmWG7Eczs/Iq_b.png' } },
      Ch: { name: 'Checkers piece', moves: '', gen: 'checker', value: 150, img: { w: 'assets/modes/WXcmWG7Eczs/Ch_w.png', b: 'assets/modes/WXcmWG7Eczs/Ch_b.png' } },
      T: { name: 'Title Rook', moves: 'R', value: 500, controlledBy: 'both', img: { n: 'assets/modes/WXcmWG7Eczs/T_n.png' } }
    },
    setup: { fen: 'rnbqk[iq]b[ch]nr/ppp[u]pppp[u]pp/10/10/[n:T]9/9[n:T]/10/10/PPP[U]PPPP[U]PP/RNBQK[Iq]B[Ch]NR' },
    clock: { w: 300, b: 300, inc: 3, bot: false },  /* site clock; length inferred (the video only shows the 30 s first-move timer) */
    rules: { castling: true, enPassant: true, promotion: { choices: ['Q', 'Knook', 'R', 'B', 'N'] }, drawPlies: 200 },
    bot: { engine: 'search', elo: 1214, depth: 2, time_ms: 700, min_ms: 350 },
    hooks: {
      bounce: function (V, st, i, p, out) {
        var g = V.geo;
        D4.forEach(function (d) {
          var c = g.col(i), r = g.row(i), dc = d[0], dr = d[1], bounced = false, n = 0;
          while (n++ < 30) {
            var nc = c + dc, nr = r + dr;
            if (nc < 0 || nc >= g.files) { if (bounced) break; dc = -dc; bounced = true; nc = c + dc; }
            if (nr < 0 || nr >= g.ranks) { if (bounced) break; dr = -dr; bounced = true; nr = r + dr; }
            if (nc < 0 || nc >= g.files || nr < 0 || nr >= g.ranks) break;
            c = nc; r = nr; var j = g.idx(c, r); if (j === i) break; var q = st.b[j];
            if (!q) { out.push({ f: i, t: j, p: p.t, c: p.c, cap: null }); continue; }
            if (V.isEnemy(p.c, q.c) || q.probe || q.c === 'n') { if (V.canCapture(p, q)) out.push({ f: i, t: j, p: p.t, c: p.c, cap: q, capSq: j }); }
            break;
          }
        });
      },
      inverse: function (V, st, i, p, out) {
        var g = V.geo, c0 = g.col(i), r0 = g.row(i);
        for (var j = 0; j < st.b.length; j++) {
          var dc = g.col(j) - c0, dr = g.row(j) - r0; if (!dc || !dr || Math.abs(dc) === Math.abs(dr) || Math.max(Math.abs(dc), Math.abs(dr)) > 3) continue; /* range 3 (inferred) */
          var q = st.b[j];
          if (!q) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null });
          else if ((V.isEnemy(p.c, q.c) || q.probe || q.c === 'n') && V.canCapture(p, q)) out.push({ f: i, t: j, p: p.t, c: p.c, cap: q, capSq: j });
        }
      },
      checker: function (V, st, i, p, out) {
        var g = V.geo, fr = g.FR(p.c);
        [[1, 1], [-1, 1]].forEach(function (d) {
          var dc = d[0] * fr.R[0] + d[1] * fr.F[0], dr = d[0] * fr.R[1] + d[1] * fr.F[1], j = g.step(i, dc, dr); if (j < 0) return; var q = st.b[j];
          if (!q) { out.push({ f: i, t: j, p: p.t, c: p.c, cap: null }); return; }
          if (!(V.isEnemy(p.c, q.c) || q.probe) || !V.canCapture(p, q)) return;
          var k = g.step(j, dc, dr); if (k < 0 || st.b[k]) return;
          out.push({ f: i, t: k, p: p.t, c: p.c, cap: q, capSq: j });
        });
      },
      /* nuclear fusion: knight onto own rook or rook onto own knight */
      moves: function (V, st, out) {
        var me = st.turn, g = V.geo, b = st.b;
        for (var i = 0; i < b.length; i++) {
          var p = b[i]; if (!p || p.c !== me || (p.t !== 'N' && p.t !== 'R')) continue;
          var want = p.t === 'N' ? 'R' : 'N', tmp = [];
          var saved = {}; /* temporarily mark own partner pieces as enemies to reuse the generator */
          for (var j = 0; j < b.length; j++) if (b[j] && b[j].c === me && b[j].t === want) { saved[j] = b[j]; b[j] = { t: '?', c: '?', m: 1, probe: 1 }; }
          V.genPiece(st, i, tmp, true);
          Object.keys(saved).forEach(function (j) { b[j] = saved[j]; });
          tmp.forEach(function (m) { if (saved[m.t]) out.push({ f: i, t: m.t, p: p.t, c: me, cap: null, fuse: 1 }); });
        }
        return out;
      },
      onMake: function (V, st, m, n) { if (m.fuse) n.b[m.t] = { t: 'Knook', c: m.c, m: 1 }; },
      /* underage pawns: a bishop that sees one must take it */
      filterMoves: function (V, st, legal) {
        var forced = legal.filter(function (m) { return m.p === 'B' && m.cap && m.cap.t === 'U'; });
        return forced.length ? forced : legal;
      },
      /* overtime (transcript): when your clock runs out you do not flag; your pieces get bored and leave one by one */
      onTick: function (ctx, now) {
        var G = ctx.game, h = ctx.human; if (!G.clock || ctx.over || ctx.state.turn !== h) return;
        if (G.clock[h] - (now - G.clock.t) > 250) return;
        G.clock[h] += 1500;
        var mine = ctx.pieces(function (p) { return p.c === h && p.t !== 'K'; }); if (!mine.length) return;
        var i = ctx.pick(mine); ctx.fx({ type: 'particles', kind: 'dust', at: ctx.name(i), count: 10 }); ctx.remove(i); ctx.refresh();
        if (!G._bored) { G._bored = 1; ctx.toast('Overtime! Your pieces are bored and start leaving the board.'); }
      },
      init: function () {
        if (document.getElementById('g4anar-css')) return; var c = document.createElement('style'); c.id = 'g4anar-css';
        c.textContent = '.m-anarchy .sq.is-last::before{background:rgba(243,186,131,.92)}';  /* orange last-move squares sampled from the frame (#f3ba83) */
        document.head.appendChild(c);
      },
      setup: function () { document.body.classList.add('m-anarchy'); },
      onExit: function () { document.body.classList.remove('m-anarchy'); },
      afterMove: function (ctx, m) {
        if (m.fuse) ctx.fx({ type: 'flash', at: ctx.name(m.t), color: '#ffd23f', duration_ms: 600 });
        if (m.cap && m.cap.t === 'U' && m.p === 'B') ctx.toast('The bishop had to take the underage pawn.');
      }
    },
    source: { research: 'research/modes/WXcmWG7Eczs.json', confidence: 'low', notes: 'Start position inferred; Title Rooks simplified to "either side may move" (the game gives them to the side with an adjacent piece); bishops bounce once. PASS 2 (impl-4): every piece is the site\'s doodle cut from the 50%/75% stills (tools/g4_pass2.py; bishop = flame-top pawn, queen = jester crown, inverse queen = upside-down crown, knook = horse on a rook, title rook = half white/half black); white inverse queen recoloured from the black one (only white copy in the stills is under an arrow); orange last-move squares #f3ba83; overtime with bored pieces. NOT modelled (mechanics not readable from the stills/transcript): pawn launching, chained long passant, double-click super fusion; orange arrows are the app\'s own right-drag arrows.' },
  });
})();
