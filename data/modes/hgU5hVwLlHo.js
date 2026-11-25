/* Chess, But Anish Giri GRABS Pieces Off the Board. Standard chess vs Fairy-Stockfish (UI "Stockfish (3600)") with a
   one-time power-up: once per game you can call Anish, who removes one random enemy piece (never the king) for good.
   Sources: research/modes/hgU5hVwLlHo.json (transcript 00:01 "only use Anish once per game... randomly select one of
   Stockfish's pieces, except for the king, and remove it permanently... 50% chance he just gets rid of a pawn", 15:31
   ladder mate), frames visual_a (brown #e9d3b3/#ae8265, cartoon Anish with a stretchy arm).
   Inferred: calling Anish is instant (no move used) and only allowed on your turn. */
(function () {
  function bar(ctx, html, on) {
    var el = document.getElementById('game-controls'); if (!el) return;
    el.innerHTML = '<div class="grp">' + html + '</div>'; el.hidden = false;
    el.onpointerdown = el.onpointerup = el.onpointercancel = null;
    el.onclick = function (e) { var b = e.target.closest('[data-k]'); if (b && !b.disabled) on(b.dataset.k); };
    CM.gameUI.layout();
  }
  function unbar() { var el = document.getElementById('game-controls'); if (!el) return; el.hidden = true; el.innerHTML = ''; el.onclick = null; CM.gameUI.layout(); }
  function draw(ctx) {
    var used = ctx.x.anish, mine = ctx.state.turn === ctx.human && !ctx.over && !ctx.game.busy;
    bar(ctx, '<button type="button" class="gctl gctl--primary" data-k="anish" style="width:auto;padding:0 16px;font-weight:700;font-size:14px;gap:8px;display:flex;align-items:center"' + (used || !mine ? ' disabled' : '') +
      '><img alt="" src="assets/modes/hgU5hVwLlHo/anish.png" style="width:30px;height:30px">' + (used ? 'Anish used' : 'Call Anish (1)') + '</button>', function () { grab(ctx); });
  }
  function grab(ctx) {
    if (ctx.x.anish || ctx.over || ctx.state.turn !== ctx.human || ctx.game.busy) return;
    var V = ctx.V, list = ctx.pieces(function (p) { return p.c === ctx.bot && !V.def(p.t).royal; });
    if (!list.length) { ctx.toast('Nothing left for Anish to steal.'); return; }
    var at = ctx.pick(list), p = ctx.at(at), nm = (V.def(p.t).name || p.t).toLowerCase();
    ctx.setX('anish', 1);
    ctx.fx({ type: 'highlight', squares: [ctx.name(at)], color: 'rgba(214,60,200,.55)', duration_ms: 650 });
    ctx.fx({ type: 'overlay', at: at, image: 'assets/modes/hgU5hVwLlHo/anish.png', duration_ms: 700, fade_ms: 160 });
    ctx.sound('capture');
    ctx.game.cap[ctx.human] = (ctx.game.cap[ctx.human] || []).concat([{ t: p.t, c: p.c }]);
    ctx.remove(at);
    ctx.toast(p.t === 'P' ? 'Missing pawn? Who would ever steal a pawn...' : 'Anish grabbed the ' + nm + ' on ' + ctx.name(at) + '!', 2200);
    ctx.refresh(); draw(ctx);
  }
  CM.mode({
    id: 'hgU5hVwLlHo',
    name: 'Anish Grabs Pieces',
    category: 'Powerups & Rule Twists',
    description: 'Normal chess, plus Anish Giri on your side. Once per game, tap "Call Anish" on your turn and he snatches one random enemy piece (never the king) off the board for good. It does not use your move.',
    how_to_win: 'Checkmate Stockfish. Trade off pawns first so the steal is more likely to hit a big piece.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Fairy-Stockfish. Keep an eye on your pieces.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#e9d3b3', dark: '#ae8265' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { anish: 0 } },
    bot: { engine: 'auto', style: 'best', elo: 3600, depth: 4, time_ms: 800 },
    assets: { anish: 'assets/modes/hgU5hVwLlHo/anish.png' },
    hooks: {
      stockfishOk: true,
      onStart: function (ctx) { draw(ctx); },
      onTurn: function (ctx) { draw(ctx); },
      afterMove: function (ctx) { draw(ctx); return null; },
      onUndo: function (ctx) { ctx.after(30, function () { draw(ctx); }); },
      onGameOver: function (ctx) { draw(ctx); },
      onExit: function () { unbar(); },
      status: function (ctx) { return ctx.x.anish ? 'Anish has been used this game.' : 'Anish is ready: one random steal per game.'; }
    },
    source: { research: 'research/modes/hgU5hVwLlHo.json', confidence: 'high', notes: 'Calling Anish is instant (inferred).' }
  });
})();
