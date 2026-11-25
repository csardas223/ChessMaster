/* Chess, But My Pawns Can Reproduce. Standard chess vs Stockfish (3600), but White's pawns follow Conway's Game of
   Life: after every White move one generation runs on the white pawns (8 neighbours, only white pawns count).
   0-1 neighbours: dies (solitude); 4+: dies (overpopulation); 2-3: survives; an empty square with exactly 3 white-pawn
   neighbours grows a new white pawn. Births and deaths are simultaneous. Black's pawns are normal.
   Sources: research/modes/wPaOpQw4FoY.json (transcript: 1.e4 pawn dies alone, births deep in enemy territory, game 1
   lost when the pawns died out, game 2 won with bishop + two knights), frames visual_* (brown #ead2ae/#ae7e66, purple
   highlights on new pawns, "Gen 1 vs Gen 99" thumbnail).
   Inferred: no births on the first or last rank, a newborn pawn counts as moved (no double step), squares holding any
   other piece cannot spawn. Pure rule (onMake) so the bot sees it. */
(function () {
  var N8 = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
  function generation(V, b) {
    var g = V.geo, kill = [], born = [];
    var wp = function (j) { var p = j >= 0 ? b[j] : null; return p && p.c === 'w' && p.t === 'P'; };
    for (var i = 0; i < b.length; i++) {
      if (!g.valid[i]) continue;
      var n = 0; for (var k = 0; k < 8; k++) if (wp(g.step(i, N8[k][0], N8[k][1]))) n++;
      if (wp(i)) { if (n < 2 || n > 3) kill.push(i); }
      else if (!b[i] && n === 3) { var r = g.rank(i); if (r > 1 && r < g.ranks) born.push(i); }
    }
    kill.forEach(function (i) { b[i] = null; });
    born.forEach(function (i) { b[i] = { t: 'P', c: 'w', m: 1, born: 1 }; });
    return { kill: kill, born: born };
  }
  CM.mode({
    id: 'wPaOpQw4FoY',
    name: 'Game of Life Pawns',
    category: 'Powerups & Rule Twists',
    description: "Your pawns live by Conway's Game of Life. After each of your moves, a white pawn with fewer than 2 or more than 3 white-pawn neighbours dies, and an empty square with exactly 3 white-pawn neighbours grows a new pawn. Black's pawns are normal.",
    how_to_win: 'Checkmate Stockfish. Keep your pawns in clusters of 2-3 or they vanish.',
    player_side: 'white',
    assets: { spaceship: 'assets/modes/wPaOpQw4FoY/spaceship_card.jpg' },
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Does not believe in spontaneous generation.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2ae', dark: '#ae7e66' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { gen: 0 } },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 800 },
    hooks: {
      onMake: function (V, st, m, n) {
        if (m.c !== 'w') return;
        var r = generation(V, n.b);
        n.x.gen = (st.x.gen || 0) + 1;
        n.x.life = r.kill.length || r.born.length ? { k: r.kill, b: r.born } : null;
      },
      afterMove: function (ctx, m) {
        var L = ctx.x.life; if (m.c !== 'w' || !L) return null;
        if (L.b.length) ctx.fx({ type: 'highlight', squares: L.b.map(ctx.name), color: 'rgba(170,70,220,.5)', duration_ms: 800 });
        var pawn = CM.settings.pieceUrl('w', 'P');
        L.k.forEach(function (i) {
          /* fade-out ghost of the dying pawn (pass 2) */
          ctx.fx({ type: 'overlay', at: ctx.name(i), duration_ms: 650, fade_ms: 600, html: '<img src="' + pawn + '" alt="" style="width:100%;height:100%;opacity:.9;filter:grayscale(.6)">' });
          ctx.fx({ type: 'particles', kind: 'dust', at: i, count: 10 });
        });
        ctx.pieces(function (p) { return p.born; }).forEach(function (i) { delete ctx.at(i).born; });
        var msg = []; if (L.b.length) msg.push(L.b.length + ' born'); if (L.k.length) msg.push(L.k.length + ' died');
        ctx.toast('Generation ' + ctx.x.gen + ': ' + msg.join(', ') + '.', 1500);
        return null;
      },
      onStart: function (ctx) {
        /* intro explainer card = the video's own 'Spaceship' Game of Life frame (storyboard maxres1, tools/g1_sprites.py
           CARDS) with the 2-3 rule under it in the chess.com dark caption style */
        ctx.fx({ type: 'overlay', at: 'board', duration_ms: 4200, fade_ms: 300, html: '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:84%;max-width:340px;background:rgba(38,36,33,.95);border-radius:10px;overflow:hidden;color:#fff;font:500 13px/1.4 system-ui,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,.5)">' +
          '<img src="assets/modes/wPaOpQw4FoY/spaceship_card.jpg" alt="Spaceship" style="display:block;width:100%;height:auto">' +
          '<div style="padding:8px 12px">0-1 neighbours: dies alone. 2-3: survives. 4+: dies of overcrowding. Empty square with 3: a pawn is born.</div></div>' });
      },
      status: function (ctx) { return 'Generation ' + (ctx.x.gen || 0) + ' - white pawns: ' + ctx.pieces(function (p) { return p.c === 'w' && p.t === 'P'; }).length; }
    },
    todo_pass2: [],
    source: { research: 'research/modes/wPaOpQw4FoY.json', confidence: 'high', notes: 'No births on ranks 1/8 and newborns count as moved (inferred).' }
  });
})();
