/* Chess, But My Pieces Have Magnets. Chess vs Stockfish (3600); every white piece carries a magnet that attracts LIKE
   enemy pieces it currently attacks (bishop-bishop, knight-knight, rook-rook, queen-queen). As your move you can pull
   such an enemy piece one square toward the attacker, dragging it out of its defences so you can take it next turn.
   Pawn magnets are decorative (pawns only attack adjacent squares), and kings do not pull.
   Sources: research/modes/fRZmYTwLE54.json (transcript 00:01 "magnets that can attract to like pieces that are
   currently under attack", 00:55 knights, 01:21 bishop pulled to e5, 02:14 pawns decorative, 05:16 rooks on the c-file,
   10:42 ladder mate), frames visual_c (#E9D3B0/#AF8164, red horseshoe badges, blue crackle on the pulled piece).
   UI: tap the enemy piece (a purple ring marks pullable ones), then the square it is pulled to.
   Inferred: the pull costs your turn; a knight pulls its target one king-step toward itself; no pull onto an occupied
   square or when the pieces are adjacent. */
(function () {
  var TYPES = { N: 1, B: 1, R: 1, Q: 1 };
  function pulls(V, st) {
    var g = V.geo, out = [], seen = {};
    for (var i = 0; i < st.b.length; i++) {
      var p = st.b[i]; if (!p || p.c !== 'w' || !TYPES[p.t]) continue;
      var tmp = []; V.genPiece(st, i, tmp, true);
      tmp.forEach(function (m) {
        if (!m.cap || m.cap.c !== 'b' || m.cap.t !== p.t) return;
        var j = m.t, dc = Math.sign(g.col(i) - g.col(j)), dr = Math.sign(g.row(i) - g.row(j)), d = g.step(j, dc, dr);
        if (d < 0 || d === i || st.b[d] || seen[j + ':' + d]) return; seen[j + ':' + d] = 1;
        out.push({ f: j, t: d, p: m.cap.t, c: 'w', cap: null, magnet: i });
      });
    }
    return out;
  }
  CM.mode({
    id: 'fRZmYTwLE54',
    name: 'Magnet Pieces',
    category: 'Powerups & Rule Twists',
    description: 'Your pieces have magnets that attract the same kind of enemy piece they attack: bishop pulls bishop, knight pulls knight, rook pulls rook, queen pulls queen. As your move, pull it one square toward you, out of its defences. Tap a ringed enemy piece, then the pull square.',
    how_to_win: 'Checkmate Stockfish. Pull pieces out of their protection and pick them off.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Feels a strange attraction.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#e9d3b0', dark: '#af8164' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 800 },
    sounds: { zap: 'assets/modes/fRZmYTwLE54/zap.wav' },
    hooks: {
      moves: function (V, st, out) { if (st.turn !== 'w') return out; return out.concat(pulls(V, st)); },
      afterMove: function (ctx, m) {
        if (m.magnet == null) return null;
        ctx.fx({ type: 'arrow', from: ctx.name(m.f), to: ctx.name(m.magnet), color: 'rgba(150,80,220,.85)', duration_ms: 700 });
        ctx.fx({ type: 'overlay', at: m.t, image: 'assets/modes/fRZmYTwLE54/electric_king.png', duration_ms: 650, fade_ms: 150 });
        ctx.sound('zap');
        return null;
      },
      decorate: function (ctx, sq, p) {
        if (!p || ctx.over) return null;
        if (p.c === 'w' && p.t !== 'K') return { html: '<img alt="" src="assets/modes/fRZmYTwLE54/magnet.png" style="position:absolute;right:3%;bottom:3%;width:30%;height:30%;z-index:4;pointer-events:none">' };
        if (p.c === 'b' && ctx.state.turn === ctx.human && ctx.game.moves.some(function (m) { return m.f === sq && m.magnet != null; }))
          return { html: '<span class="sq-tint" style="box-shadow:inset 0 0 0 4px rgba(150,80,220,.85)"></span>' };
        return null;
      },
      status: function (ctx) { var n = ctx.state.turn === ctx.human ? ctx.game.moves.filter(function (m) { return m.magnet != null; }).length : 0; return n ? n + ' magnet pull' + (n > 1 ? 's' : '') + ' available: tap a ringed enemy piece.' : 'Attack a like piece to switch its magnet on.'; }
    },
    todo_pass2: [],
    source: { research: 'research/modes/fRZmYTwLE54.json', confidence: 'medium', notes: 'Pull costs the turn; knight pull direction inferred.' }
  });
})();
