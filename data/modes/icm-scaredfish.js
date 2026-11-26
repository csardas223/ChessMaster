/* Stockfish, But It Thinks Your Pawns are Queens (ScaredFish). A bot from iwantcheckmate.com (#/play/scaredfish,
   studied 2026-11-26; no video yet, so no_video). Normal chess: your pawns are ordinary pawns, but ScaredFish
   chooses its move on an imaginary board where every white pawn is a queen, then plays the best of those moves that
   is legal on the real board (the site's own approach: rank the moves of the "pawns -> queens" position, keep the
   first one that is also a real legal move, else play normally). So it runs from pawns, blocks lines that only a
   queen would use and refuses captures it thinks are defended by a "queen". Rules reimplemented, no code copied. */
(function () {
  function sameMove(a, b) { return a.f === b.f && a.t === b.t && (a.promo || null) === (b.promo || null); }
  function imaginary(V, st) {
    var n = V.clone(st);
    n.b = st.b.map(function (p) { return p && p.c === 'w' && p.t === 'P' ? Object.assign({}, p, { t: 'Q' }) : p; });
    return n;
  }
  CM.mode({
    id: 'icm-scaredfish',
    no_video: true,
    lobby: { thumb: 'assets/modes/icm-scaredfish/thumb.jpg' },
    title: 'Stockfish, But It Thinks Your Pawns are Queens',
    name: 'ScaredFish',
    category: 'Variant Bots',
    description: 'ScaredFish plays Stockfish chess, but it is convinced every one of your pawns is a queen. It picks its move as if your pawns were queens, so it runs from them and fears captures they "defend". Your pawns still move like pawns.',
    how_to_win: 'Checkmate ScaredFish. Use your "queens" to scare it off good squares.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
    opponent: { name: 'ScaredFish', rating: null, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Sees a queen behind every pawn.' },
    board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    bot: { engine: 'search', depth: 4, time_ms: 700 },
    hooks: {
      botPick: function (ctx, ranked) {
        if (!ranked.length) return null;
        var V = ctx.V, st = ctx.state;
        if (!st.b.some(function (p) { return p && p.c === 'w' && p.t === 'P'; })) return ranked[0];
        try {
          var fake = imaginary(V, st), S = new CM.Search(V, {});
          var L2 = S.rank(fake, { maxDepth: 3, timeMs: 650, noise: 0 });
          for (var i = 0; i < Math.min(10, L2.length); i++) {
            var real = ranked.find(function (r) { return sameMove(r.m, L2[i].m); });
            if (real) return real;
          }
        } catch (e) { console.warn('ScaredFish imaginary board', e); }
        return ranked[0];   /* nothing from the imaginary board is legal here: play the real best move */
      },
      status: function (ctx) {
        var n = ctx.pieces(function (p) { return p.c === ctx.human && p.t === 'P'; }).length;
        return n ? 'ScaredFish sees ' + n + ' white queen' + (n === 1 ? '' : 's') + ' that are really pawns.' : 'No pawns left: ScaredFish sees the board as it is.';
      }
    },
    source: { research: 'iwantcheckmate.com (bot "scaredfish", main.js read 2026-11-26)', confidence: 'high', notes: 'The site ranks the top 10 Stockfish moves of the imaginary position; here the built-in search ranks them (no real-engine call for a non-standard FEN).' }
  });
})();
