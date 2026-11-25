/* Can I BEAT Chess Roulette? (feat. Stockfish).  Rematch on the Chess Roulette site after the dev fixed the engine:
   Stockfish 3200. Each side has 5 bullets; whenever a piece moves it has a 1 in 6 chance to explode (removed after
   moving), using up a bullet; once a side's 5 bullets are spent its pieces are safe. Tony burns his bullets on one-square
   pawn pushes; Stockfish keeps moving big pieces. Sources: research/modes/0VbTOk8X1TY.json (0:01, 0:23, 10:12), frames
   visual_d (grey monochrome board #a5a5a5/#4c4c4c, red blood-splatter squares, revolver cylinder above the board).
   Inferred: kings never explode. */
(function () {
  function cylinder(n) {
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="54" height="54"><circle cx="30" cy="30" r="27" fill="#2c2c2c" stroke="#bdbdbd" stroke-width="2"/>';
    for (var k = 0; k < 6; k++) { var a = k * Math.PI / 3 - Math.PI / 2, x = 30 + 15 * Math.cos(a), y = 30 + 15 * Math.sin(a); s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6" fill="' + (k < n ? '#d4a13a' : '#111') + '" stroke="#777"/>'; }
    return s + '<circle cx="30" cy="30" r="4" fill="#777"/></svg>';
  }
  CM.mode({
    id: '0VbTOk8X1TY',
    title: 'Can I BEAT Chess Roulette? (feat. Stockfish)',
    name: 'Chess Roulette vs Stockfish',
    category: 'Variants & Games',
    description: 'Each side has 5 bullets in the chamber. Every time a piece moves there is a 1 in 6 chance it explodes after moving, using up one bullet. Once a side has used all 5 bullets its pieces are safe. Kings never explode. Stockfish ignores the bullets; you do not have to.',
    how_to_win: 'Checkmate Stockfish 3200.',
    player_side: 'white',
    opponent: { name: 'Stockfish', rating: 3200, avatar: 'assets/avatars/stockfish.svg', tagline: 'The roulette site engine, now fixed. It still ignores the gun.' },
    board: { files: 8, ranks: 8, light: '#a5a5a5', dark: '#4c4c4c' },
    theme: { background: '#151515' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    bot: { engine: 'auto', elo: 3200, time_ms: 700 },
    params: { bullets: 5, odds: 6 },
    hooks: {
      stockfishOk: true,
      setup: function (ctx) { ctx.setX('bullets', { w: ctx.params.bullets, b: ctx.params.bullets }); ctx.setX('splat', []); },
      afterMove: function (ctx, m, info) {
        var bl = ctx.x.bullets || {}, c = info.side; if (!bl[c] || ctx.over) return;
        var p = ctx.at(info.to); if (!p || ctx.V.def(p.t).royal) return;
        if (ctx.random(ctx.params.odds) !== 0) { ctx.sound('tick'); return; }
        var nb = Object.assign({}, bl); nb[c]--; ctx.setX('bullets', nb);
        ctx.setX('splat', (ctx.x.splat || []).concat([info.to]));
        ctx.remove(info.to);
        ctx.fx({ type: 'explosion', at: info.to, radius: 0, shake: false }); ctx.sound('explosion');
        ctx.toast((c === ctx.human ? 'BANG! Your ' : 'BANG! Stockfish\'s ') + (ctx.V.def(p.t).name || p.t).toLowerCase() + ' exploded. ' + nb[c] + ' bullet' + (nb[c] === 1 ? '' : 's') + ' left.', 2200);
      },
      decorate: function (ctx, sq) {
        if ((ctx.x.splat || []).indexOf(sq) < 0) return null;
        return { html: '<span class="sq-tint" style="background:radial-gradient(circle at 45% 55%,rgba(170,10,10,.85) 0 22%,rgba(170,10,10,.45) 23% 34%,transparent 35%)"></span>' };
      },
      onStart: function (ctx) { ctx.fx({ type: 'overlay', at: 'board', html: '<div style="position:absolute;top:6px;right:6px;opacity:.9">' + cylinder(6) + '</div>', duration_ms: 1600, fade_ms: 200 }); },
      status: function (ctx) { var b = ctx.x.bullets || {}; return 'Bullets left: you ' + (b[ctx.human] || 0) + ' · Stockfish ' + (b[ctx.bot] || 0) + ' · 1 in 6 per move'; }
    },
    source: { research: 'research/modes/0VbTOk8X1TY.json', confidence: 'high', notes: 'Kings exempt (inferred). Pixel-font UI and dice icon of the site not reproduced; cylinder, splatter and click/bang sounds are original.' }
  });
})();
