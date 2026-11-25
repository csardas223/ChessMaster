/* Can I BEAT Bughouse? (feat. Will Taylor Chess)  Online Bughouse as a team with Will Taylor vs human teams (~1200-1300),
   goal three wins. Pieces your partner captures arrive in your hand and can be dropped. Sources:
   research/modes/134MBhzRN2c.json. PASS 1: second board simulated like ymIg80xvKVE (periodic partner hand-offs). */
CM.mode({
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/134MBhzRN2c/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: '134MBhzRN2c',
  title: 'Can I BEAT Bughouse? (feat. Will Taylor Chess)',
  name: 'Bughouse with Will Taylor',
  category: 'Other Videos',
  description: 'Bughouse on one board: your teammate Will Taylor plays the other board and passes you every piece he captures (the other team does the same). Pieces in your hand can be dropped on any empty square instead of moving (pawns not on the first or last rank). Ask for pieces, sacrifice on f7, mate with drops.',
  how_to_win: 'Checkmate the enemy king (or flag him). Goal in the video: three team wins.',
  player_side: 'white',
  player: { avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png', name: 'You + Will Taylor', rating: 1300 },
  opponent: { name: 'WolverineSpartan', rating: 1278, avatar: 'assets/modes/uUXev8TPVak/default.png', tagline: 'Plays with Johnnyearp (1322) on the other board.' },
  board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { drops: true },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'search', elo: 1250, depth: 3, time_ms: 700 },
  events: [{ when: 'every_plies:4', do: { hook: 'partner' } }],
  hooks: (function () {
    /* PASS 2 (impl-4, 8th session): the partner board is a real second game (Will Taylor, black, vs Johnnyearp) drawn as a
       mini board in the side panel like the video's right-hand board; every few plies each side there makes a move
       (captures preferred) and every piece captured on it goes to the right hand (Will's captures -> your hand, his
       opponent's captures -> your opponent's hand), as in bughouse. Will's lines appear as voice-chat captions with his
       avatar; the team score counts to 3 wins (kept between games). Avatars cut from the 25% still (tools/g4_pass2.py). */
    var A = 'assets/modes/134MBhzRN2c/', NAMES = { P: 'pawn', N: 'knight', B: 'bishop', R: 'rook', Q: 'queen' };
    var STD = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
    function mini(ctx) {
      var z = ctx.game._bh;
      if (!z.V) { var sp = CM.spec.normalize({ id: '_bh2', board: { files: 8, ranks: 8 }, setup: { fen: STD } }); z.V = CM.spec.buildVariant(sp, {}); z.sp = sp; }
      z.st = CM.spec.initialState(z.V, z.sp);
    }
    function say(ctx, text) { var z = ctx.game._bh; z.line = text; panel(ctx); }
    function panel(ctx) {
      var side = document.getElementById('side'), z = ctx.game._bh; if (!side || !z) return;
      var el = side.querySelector('.g4bh'); if (!el) { el = document.createElement('div'); el.className = 'g4bh'; side.insertBefore(el, side.firstChild); }
      var g = z.V.geo, cells = '';
      for (var r = g.ranks - 1; r >= 0; r--) for (var c = g.files - 1; c >= 0; c--) {  /* Will plays Black: his board is seen from Black's side */
        var i = g.idx(c, r), p = z.st.b[i], dark = (c + r) % 2 === 1;
        cells += '<i class="' + (dark ? 'd' : 'l') + '">' + (p ? '<img alt="" src="' + CM.settings.pieceUrl(p.c, p.t) + '">' : '') + '</i>';
      }
      el.innerHTML = '<div class="pl"><img alt="" src="' + A + 'johnnyearp.png"><b>Johnnyearp</b><span>(1322)</span></div><div class="mb">' + cells + '</div>' +
        '<div class="pl"><img alt="" src="' + A + 'will.png"><b>willtaylorchessonyt</b><span>(1604)</span></div>' +
        (z.line ? '<div class="vc"><img alt="" src="' + A + 'will.png"><span><b>Will Taylor</b> ' + z.line + '</span></div>' : '') +
        '<div class="sc">Team wins: <b>' + CM.store.get('g4bh.wins', 0) + '/3</b></div>';
    }
    function step(ctx, side) {
      var z = ctx.game._bh, V = z.V, st = z.st; st.turn = side;
      var ms = V.legal(st); if (!ms.length) { mini(ctx); return null; }
      var caps = ms.filter(function (m) { return m.cap; }), pool = caps.length && Math.random() < 0.7 ? caps : ms, m = pool[Math.floor(Math.random() * pool.length)];
      z.st = V.make(st, m); return m.cap && m.cap.t !== 'K' ? m.cap.t : null;
    }
    return {
      setup: function (ctx) {
        ctx.game._bh = ctx.game._bh || {}; mini(ctx); ctx.game._bh.line = 'Good luck, let\'s get three wins!';
        var c = document.getElementById('g4bh-css');
        if (!c) { c = document.createElement('style'); c.id = 'g4bh-css'; c.textContent = '.g4bh{margin-bottom:10px;font:12px/1.3 system-ui,sans-serif;color:#ddd}.g4bh .pl{display:flex;align-items:center;gap:6px;margin:3px 0}.g4bh .pl img{width:22px;height:22px;border-radius:2px}.g4bh .pl span{opacity:.7}' +
          '.g4bh .mb{display:grid;grid-template-columns:repeat(8,1fr);width:100%;max-width:200px;aspect-ratio:1}.g4bh .mb i{position:relative}.g4bh .mb i.l{background:#eeeed2}.g4bh .mb i.d{background:#769656}.g4bh .mb img{position:absolute;inset:0;width:100%;height:100%}' +
          '.g4bh .vc{display:flex;gap:6px;align-items:center;background:#2b2a27;border-left:3px solid #81b64c;border-radius:4px;padding:5px;margin-top:6px}.g4bh .vc img{width:26px;height:26px;border-radius:50%}.g4bh .sc{margin-top:6px}.g4bh .sc b{color:#81b64c}'; document.head.appendChild(c); }
        panel(ctx);
      },
      partner: function (ctx) {
        var got = step(ctx, 'b'), lost = step(ctx, 'w'), h = Object.assign({}, ctx.state.hands);
        if (got) { h[ctx.human] = (h[ctx.human] || []).concat([got]); }
        if (lost) { h[ctx.bot] = (h[ctx.bot] || []).concat([lost]); }
        ctx.state = Object.assign({}, ctx.state, { hands: h });
        if (got) say(ctx, '"Take the ' + NAMES[got] + '! Drop it!"'); else if (lost) say(ctx, '"They got a ' + NAMES[lost] + ', watch out for drops."'); else panel(ctx);
        ctx.refresh();
      },
      onGameOver: function (ctx, over) {
        if (over.w === ctx.human) { var n = CM.store.get('g4bh.wins', 0) + 1; CM.store.set('g4bh.wins', n >= 3 ? 0 : n); say(ctx, n >= 3 ? '"THREE WINS! We did it!"' : '"Let\'s go! ' + n + ' down."'); }
        else say(ctx, '"Unlucky, next one."');
      },
      onExit: function () { var e = document.querySelector('.g4bh'); if (e) e.remove(); }
    };
  })(),
  source: { research: 'research/modes/134MBhzRN2c.json', confidence: 'medium', notes: 'Second board is a simulated random game (captures preferred) shown as a mini board; its captures feed both hands.' }
});
