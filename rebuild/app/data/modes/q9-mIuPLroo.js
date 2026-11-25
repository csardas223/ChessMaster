/* Chess, But Each Piece Gets Only 5 Moves. Each of your pieces (king included) can move only five times; a red badge
   counts 5 -> 0. A piece at 0 is frozen for good: it still blocks and can be captured, but it no longer moves or
   attacks. The counter stays with the piece, so a pawn that promotes on its fifth move becomes a frozen queen.
   Castling uses the king's counter. Two games: Martin (250), then Smartin (???). The bots move freely.
   Sources: research/modes/q9-mIuPLroo.json (transcript: pawns thrown forward as "grenades", 4:53 castles, Martin game
   1 ~3:19, Smartin Nh6# ~11:45), frames visual_* (green #eaf6d2/#7ea25a, red number badges, greyed spent pieces,
   king badge showing 1).
   Inferred: frozen pieces give no check; castling only spends the king's move. */
(function () {
  var LADDER = [
    { name: 'Martin', rating: 250, avatar: 'assets/modes/6qVgF1OO_cw/martin.svg', tagline: 'chess.com beginner bot.', elo: 250, style: 'elo' },
    { name: 'Smartin', rating: '???', avatar: 'assets/modes/IU9a1RB1KJw/smartin.png', tagline: "Martin's cousin. Plays materially sound chess.", elo: 1800, style: 'elo' }
  ];
  var level = 0, LIM = 5;
  /* mode-local styles (pass 2): greyed spent pieces + red notification-style counter badge */
  if (typeof document !== 'undefined' && !document.getElementById('g1-q9-css')) {
    var css = document.createElement('style'); css.id = 'g1-q9-css';
    css.textContent = '.g1-spent{filter:grayscale(1) brightness(.78) contrast(.9);opacity:.85}' +
      '.g1-q9b{position:absolute;top:3%;right:3%;z-index:3;pointer-events:none;min-width:calc(var(--sqpx,40px)*.3);height:calc(var(--sqpx,40px)*.3);padding:0 2px;box-sizing:border-box;border-radius:999px;background:#e5322d;color:#fff;font:800 calc(var(--sqpx,40px)*.2)/calc(var(--sqpx,40px)*.3) system-ui,sans-serif;text-align:center;box-shadow:0 1px 2px rgba(0,0,0,.45)}' +
      '.g1-q9b.is-0{background:#6f6f6f}';
    document.head.appendChild(css);
  }
  var spent = {}; ['P', 'N', 'B', 'R', 'Q', 'K'].forEach(function (t) {
    spent[t + '0'] = { name: 'Frozen ' + ({ P: 'pawn', N: 'knight', B: 'bishop', R: 'rook', Q: 'queen', K: 'king' })[t], moves: '', glyph: t, value: ({ P: 60, N: 150, B: 150, R: 220, Q: 400, K: 0 })[t], royal: t === 'K', san: t === 'P' ? '' : t, cls: 'g1-spent' };
  });
  CM.mode({
    id: 'q9-mIuPLroo',
    name: 'Only 5 Moves Each',
    category: 'Powerups & Rule Twists',
    description: 'Every one of your pieces, the king too, can move only 5 times (red badge). At 0 it is frozen forever: it blocks and can be captured but never moves or attacks again. A pawn that promotes on its 5th move becomes a frozen queen. The bots move freely.',
    how_to_win: 'Checkmate Martin, then Smartin. Save your queen and rook moves for the mating attack.',
    player_side: 'white',
    opponent: LADDER[0],
    board: { files: 8, ranks: 8 },
    theme: { light: '#eaf6d2', dark: '#7ea25a' },
    pieces: spent,
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    bot: { engine: 'search', elo: 250, depth: 3, time_ms: 500 },
    params: { limit: LIM },
    hooks: {
      onMake: function (V, st, m, n) {
        if (m.c !== 'w' || m.drop) return;
        var p = n.b[m.t]; if (!p) return;
        var left = (p.left == null ? LIM : p.left) - 1, np = Object.assign({}, p, { left: left });
        if (left <= 0 && spent[np.t + '0']) np.t = np.t + '0';
        n.b[m.t] = np;
      },
      evaluate: function (V, st) { var v = 0; for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === 'w' && p.left != null) v -= (LIM - p.left) * 6; } return v; },
      setup: function (ctx) { var L = LADDER[level]; ctx.setOpponent(L); ctx.game.opponent.elo = L.elo; },
      onGameOver: function (ctx, r) {
        if (r.w === ctx.human && level < LADDER.length - 1) { level++; ctx.toast("Martin's cousin Smartin is next. Press New for game 2.", 3200); }
      },
      decorate: function (ctx, sq, p) {
        if (!p || p.c !== 'w') return null;
        var left = p.left == null ? LIM : p.left;
        if (left <= 0) return { html: '<span class="sq-tint" style="background:rgba(120,120,120,.3)"></span><span class="g1-q9b is-0">0</span>' };
        return { html: '<span class="g1-q9b">' + left + '</span>' };
      },
      status: function (ctx) { return 'Game ' + (level + 1) + ' of 2 vs ' + ctx.opponent.name + '. Badges show moves left.'; }
    },
    todo_pass2: [],
    source: { research: 'research/modes/q9-mIuPLroo.json', confidence: 'medium', notes: 'King also limited (frame badge); frozen pieces give no check (inferred).' }
  });
})();
