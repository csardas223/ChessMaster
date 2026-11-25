/* Chess, But Waldo Finds YOU. Standard chess vs Stockfish (3600). SCP-4885 "Waldo" hides on a random empty square that
   neither side can see (the engine does not know either). Any piece that moves onto his square is taken, the square is
   blacked out for the rest of the game, and Waldo hides again on another random empty square. Walking your king into
   Waldo loses.
   Sources: research/modes/gHAmif0TenY.json (transcript: invisible to both sides, "if I walk into Waldo with my king, I
   lose", 13:05 squares "forever taken away from the board", final game stalemate), frames (blacked-out squares, pink
   arrows, horror Waldo pop-up, #ead2ba/#ae7e66). Inferred: Waldo starts on ranks 3-6 and re-hides on any empty square.
   Art is original. */
(function () {
  function hide(ctx, rows) {
    var g = ctx.geo, cand = ctx.emptySquares(function (i) { return !rows || rows.indexOf(g.rank(i)) >= 0; });
    ctx.setX('waldo', cand.length ? ctx.pick(cand) : -1);
  }
  CM.mode({
    id: 'gHAmif0TenY',
    name: 'Waldo Finds You',
    category: 'Horror Chess',
    description: 'Waldo hides on a random empty square. Nobody can see him, not even Stockfish. Whatever moves onto his square is taken, the square turns black and is gone for good, and Waldo hides somewhere else. If your king finds him, you lose.',
    how_to_win: 'Checkmate Stockfish without stepping on Waldo.',
    player_side: 'white',
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/avatars/stockfish.svg', tagline: 'Cannot find Waldo either.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2ba', dark: '#ae7e66' },
    pieces: { Gone: { name: 'Taken square', moves: '', value: 0, blocker: true, capturable: false, overlay: 'void' } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { waldo: -1 } },
    bot: { engine: 'search', style: 'best', depth: 4, time_ms: 700 },
    hooks: {
      setup: function (ctx) { hide(ctx, [3, 4, 5, 6]); },
      afterMove: function (ctx, m, info) {
        var w = ctx.x.waldo; if (w == null || w < 0) return null;
        var hit = m.t === w ? m.t : (m.castle && m.castle.rt === w ? w : -1);
        if (hit < 0) return null;
        var victim = ctx.at(hit), V = ctx.V;
        ctx.set(hit, ctx.piece('Gone', 'n'));
        ctx.fx({ type: 'jumpscare', image: 'assets/modes/gHAmif0TenY/waldo.png', duration_ms: 900, background: 'rgba(10,0,0,.88)' });
        ctx.toast('Waldo found the ' + (victim.c === 'w' ? 'white ' : 'black ') + (V.def(victim.t).name || victim.t).toLowerCase() + ' on ' + ctx.name(hit) + '.', 2000);
        if (V.def(victim.t).royal) { ctx.endGame(victim.c === ctx.human ? 'bot' : 'player', victim.c === ctx.human ? 'your king walked into Waldo' : 'the Stockfish king walked into Waldo'); return null; }
        hide(ctx, null);
        return null;
      },
      decorate: function (ctx, sq, p) {
        if (p && p.t === 'Gone') return { html: '<span class="sq-tint" style="background:#000"></span>' };
        if (ctx.over && sq === ctx.x.waldo) return { html: '<img alt="" src="assets/modes/gHAmif0TenY/waldo.png" style="position:absolute;inset:6%;width:88%;height:88%;z-index:3;pointer-events:none">' };
        return null;
      },
      status: function (ctx) { var n = ctx.pieces(function (p) { return p.t === 'Gone'; }).length; return 'Waldo is hiding somewhere. ' + (n ? n + ' square' + (n === 1 ? '' : 's') + ' taken.' : ''); }
    },
    source: { research: 'research/modes/gHAmif0TenY.json', confidence: 'medium', notes: 'Start rows 3-6 and re-hide on any empty square inferred.' }
  });
})();
