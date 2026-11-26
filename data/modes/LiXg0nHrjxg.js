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
    /* owner bug 2026-11-26: a gilded piece is the SAME sprite as the normal piece (active set, same type, same box), only
       gold. Every type gets one treatment: the set's white piece through the #cm-gold SVG filter (luminance -> the video's
       gold: dark-brown outline #6e4808, gold body #fbcf3c, amber shading, light-gold highlight) plus the video's soft glow.
       The old cut gold_pawn.png (bigger, different shape) and the flat sepia tint are gone. */
    ctx.set(i, { t: 'Gold', c: 'n', m: 1, was: p.t, img: ctx.game.pieceImage({ t: p.t, c: 'w' }), cls: 'g1-gold' });
    ctx.setX('gildAt', { sq: i, t: Date.now() });
    /* the video's Midas hand (cartoon glove) points at the piece as it turns to gold */
    var east = ctx.name(i).charCodeAt(0) >= 103;   /* g/h file: point from the left (mirrored) so it stays on the board */
    ctx.fx({ type: 'overlay', at: ctx.name(i), duration_ms: 900, fade_ms: 350, html: '<img src="assets/modes/LiXg0nHrjxg/midas_hand.png" alt="" style="position:absolute;' + (east ? 'right:38%;transform:scaleX(-1)' : 'left:38%') + ';top:-30%;width:95%;height:auto;pointer-events:none;z-index:3">' });
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
    assets: { midas_hand: 'assets/modes/LiXg0nHrjxg/midas_hand.png' },
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
          var T = { r: '0.227 0.270 0.312 0.355 0.397 0.443 0.500 0.558 0.616 0.673 0.731 0.788 0.816 0.843 0.871 0.898 0.925 0.946 0.968 0.987 1.000',
            g: '0.149 0.177 0.205 0.232 0.260 0.291 0.332 0.374 0.416 0.458 0.499 0.541 0.571 0.601 0.631 0.660 0.690 0.734 0.777 0.819 0.855',
            b: '0.008 0.013 0.018 0.023 0.027 0.033 0.039 0.045 0.052 0.058 0.064 0.071 0.083 0.096 0.108 0.121 0.133 0.170 0.206 0.252 0.333' };
          var L = '0.2126 0.7152 0.0722 0 0 ';
          var host = document.createElement('div'); host.id = 'g1-gold-svg'; host.setAttribute('aria-hidden', 'true');
          host.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
          host.innerHTML = '<svg width="0" height="0"><filter id="cm-gold" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="' + L + L + L + '0 0 0 1 0"/>' +
            '<feComponentTransfer><feFuncR type="table" tableValues="' + T.r + '"/><feFuncG type="table" tableValues="' + T.g + '"/><feFuncB type="table" tableValues="' + T.b + '"/></feComponentTransfer></filter></svg>';
          document.body.appendChild(host);
          var glow = 'drop-shadow(0 0 calc(var(--sqpx, 40px) * 0.06) rgba(255, 200, 60, 0.85))';
          var s = document.createElement('style'); s.id = 'g1-gold-css';
          s.textContent = '.pc.g1-gold{filter:url(#cm-gold) ' + glow + ' !important}' +
            '.g1-new > .pc.g1-gold{animation:g1-gild .8s ease-out}' +
            '@keyframes g1-gild{from{filter:url(#cm-gold) brightness(1.7) drop-shadow(0 0 calc(var(--sqpx, 40px) * 0.2) rgba(255, 220, 90, 1))}to{filter:url(#cm-gold) ' + glow + '}}' +
            '@media (prefers-reduced-motion: reduce){.g1-new > .pc.g1-gold{animation:none}}';
          document.head.appendChild(s);
        }
      },
      /* the site's gesture: double-click any black piece White attacks. Free, so it never goes through tryMove */
      canDoubleTap: function (ctx, sq) {
        var p = ctx.at(sq);
        if (!p || p.c !== ctx.bot || ctx.V.def(p.t).royal || ctx.over || ctx.busy) return false;
        return !!ctx.V.attacked(ctx.state, sq, ctx.human);
      },
      doubleTap: function (ctx, sq) {
        var p = ctx.at(sq);
        if (!p || p.c !== ctx.bot || ctx.V.def(p.t).royal) return false;
        if (!ctx.V.attacked(ctx.state, sq, ctx.human)) { ctx.toast('Only pieces you attack can be turned to gold.', 1400); return false; }
        ctx.game.sel = -1;
        gild(ctx, sq);
        return true;
      },
      decorate: function (ctx, sq, p) {
        /* gilded piece: always the active set's own sprite for its type (follows a piece-set change), gold via .g1-gold */
        if (p && p.t === 'Gold') {
          var g = ctx.x.gildAt, fresh = g && g.sq === sq && Date.now() - g.t < 900;
          return { img: ctx.game.pieceImage({ t: p.was || 'P', c: 'w' }), cls: fresh ? 'g1-new' : '' };
        }
        if (!p || ctx.over || ctx.state.turn !== ctx.human || p.c !== ctx.bot || ctx.V.def(p.t).royal) return null;
        if (ctx.V.attacked(ctx.state, sq, ctx.human)) return { html: '<span style="position:absolute;inset:0;box-shadow:inset 0 0 0 3px rgba(230,180,40,.55);pointer-events:none"></span>' };
        return null;
      },
      status: function (ctx) { var n = ctx.x.gilded || 0; return 'Double-tap an attacked black piece to turn it to gold.' + (n ? ' Gilded: ' + n + '.' : ''); }
    },
    source: { research: 'research/modes/LiXg0nHrjxg.json', confidence: 'medium', notes: 'Free action, no limit, kings immune (inferred / from the Snipers video).' }
  });
})();
