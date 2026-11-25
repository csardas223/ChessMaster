/* Chess, But I Have King Midas' Touch. Standard chess vs Stockfish (3600). Any black piece that one of your pieces
   attacks can be turned to gold by double-tapping it: it becomes nobody's piece, a gold statue that never moves,
   captures or defends, and that no piece can enter or pass. Gilding is a free action (it does not use your move).
   Kings cannot be gilded. Do not wall up the board so much that checkmate becomes impossible.
   Sources: research/modes/LiXg0nHrjxg.json (transcript 00:01 "any piece attacked by a white piece can be turned golden
   and rendered useless", 00:29 double click, "nobody's pawn... can't move to that square", 01:18 bishop gilded, 03:45
   position stuck, 15:51 win), frames visual_b (brown #ead2ba/#ae7e66, gold pieces, purple arrows, Midas hand); the
   Snipers video (AoREbapF7y0 00:01) confirms gilding was free. Inferred: no usage limit; kings immune. */
(function () {
  function gild(ctx, i) {
    var p = ctx.at(i), V = ctx.V;
    ctx.set(i, { t: 'Gold', c: 'n', m: 1, was: p.t, img: CM.settings.pieceUrl('w', V.def(p.t).glyph || p.t), cls: 'g1-gold' });
    ctx.fx({ type: 'piece_transform', at: i, style: 'gold' });
    ctx.fx({ type: 'particles', kind: 'gold', at: i, count: 18 });
    ctx.sound('promote');
    ctx.toast('The ' + (V.def(p.t).name || p.t).toLowerCase() + ' on ' + ctx.name(i) + ' turned to gold.', 1500);
    ctx.setX('gilded', (ctx.x.gilded || 0) + 1);
    ctx.refresh();
  }
  CM.mode({
    id: 'LiXg0nHrjxg',
    name: 'Midas Touch',
    category: 'Powerups & Rule Twists',
    description: 'Double-tap any black piece that one of your pieces attacks to turn it to gold. Gold pieces belong to nobody: they never move or capture, and no piece can enter or pass their square. Gilding is free (it does not use your move). Kings cannot be gilded.',
    how_to_win: 'Checkmate Stockfish, without walling the board shut.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Watches its pieces turn to gold.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2ba', dark: '#ae7e66' },
    pieces: { Gold: { name: 'Gold statue', moves: '', value: 0, blocker: true, capturable: false, neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    bot: { engine: 'auto', style: 'best', depth: 4, time_ms: 800 },
    hooks: {
      init: function (ctx) {
        if (!document.getElementById('g1-gold-css')) {
          var s = document.createElement('style'); s.id = 'g1-gold-css';
          s.textContent = '.g1-gold{filter:sepia(1) saturate(10) hue-rotate(-14deg) brightness(.97) drop-shadow(0 0 2px rgba(255,214,90,.8)) !important}';
          document.head.appendChild(s);
        }
        var G = ctx.game; if (G._g1midas) return; G._g1midas = 1;
        var tap = G.onTap, last = { i: -1, t: 0 };
        G.onTap = function (i, o) {
          var now = Date.now(), dbl = last.i === i && now - last.t < 450; last = { i: i, t: now };
          var p = G.state.b[i];
          if (dbl && !ctx.over && p && p.c === G.botColor && !G.V.def(p.t).royal && G.state.turn === G.human && !G.busy) {
            if (G.V.attacked(G.state, i, G.human)) { last.i = -1; G.sel = -1; gild(ctx, i); return; }
            ctx.toast('Only pieces you attack can be turned to gold.', 1400);
          }
          return tap.call(G, i, o);
        };
      },
      decorate: function (ctx, sq, p) {
        if (!p || ctx.over || ctx.state.turn !== ctx.human || p.c !== ctx.bot || ctx.V.def(p.t).royal) return null;
        if (ctx.V.attacked(ctx.state, sq, ctx.human)) return { html: '<span style="position:absolute;inset:0;box-shadow:inset 0 0 0 3px rgba(230,180,40,.55);pointer-events:none"></span>' };
        return null;
      },
      status: function (ctx) { var n = ctx.x.gilded || 0; return 'Double-tap an attacked black piece to turn it to gold.' + (n ? ' Gilded: ' + n + '.' : ''); }
    },
    source: { research: 'research/modes/LiXg0nHrjxg.json', confidence: 'medium', notes: 'Free action, no limit, kings immune (inferred / from the Snipers video).' }
  });
})();
