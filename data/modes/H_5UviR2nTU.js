/* Snake vs Chess.  Tony (White) has only a king plus an uncapturable Snake vs Martin's full army. Each turn the snake head
   steps one square orthogonally (arcade Snake), the body follows; body squares block everything; eating a piece makes it
   one segment longer. White wins by capturing Black's king with the snake head; Black wins by checkmating White's king.
   Sources: research/modes/H_5UviR2nTU.json, rules.jsonl, frames visual_a (green #ecf2d1/#7b9e58, bright green segments,
   head with eyes). Start: Ke1, snake of length 2 (head d3, body d2), inferred; Smartin / length-4 restart not modelled. */
CM.mode({
  id: 'H_5UviR2nTU',
  title: 'Snake vs Chess',
  name: 'Snake vs Chess',
  category: 'Other Videos',
  description: 'You have a king and a Snake. Each turn move either your king or the snake: the head steps one square up, down, left or right and the body follows. The snake can never be captured and its body blocks every piece (including your own king). Eating a piece makes the snake one square longer.',
  how_to_win: 'Eat Martin\'s king with the snake head. Martin wins if he checkmates your king.',
  player_side: 'white',
  opponent: { name: 'Martin', rating: 250, avatar: 'assets/modes/6qVgF1OO_cw/martin.png', tagline: 'chess.com beginner bot.' },
  board: { files: 8, ranks: 8, light: '#ecf2d1', dark: '#7b9e58' },
  pieces: {
    S: { name: 'Snake head', moves: 'W', value: 900, capturable: false, img: 'assets/modes/H_5UviR2nTU/head.png' },  /* the video's snake head */
    Z: { name: 'Snake body', moves: '', value: 0, capturable: false, blocker: true, img: 'assets/modes/H_5UviR2nTU/body.png' }
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/3S4/3Z4/4K3', x: { snake: [43, 51] } },
  rules: { check: { w: 'standard', b: 'none' }, castling: false },
  bot: { engine: 'search', elo: 250, depth: 2, time_ms: 450 },
  params: { levels: [
    { name: 'Game 1 vs Martin', len: 2, opp: { name: 'Martin', rating: 250, avatar: 'assets/modes/6qVgF1OO_cw/martin.png' } },
    { name: 'Game 2 vs Smartin', len: 2, opp: { name: 'Smartin', rating: null, avatar: 'assets/modes/IU9a1RB1KJw/smartin.png', tagline: 'Rating ???' } },
    { name: 'Game 3 vs Smartin (length 4)', len: 4, opp: { name: 'Smartin', rating: null, avatar: 'assets/modes/IU9a1RB1KJw/smartin.png', tagline: 'Rating ???' } }
  ] },
  hooks: {
    onMake: function (V, st, m, n) {
      if (m.p !== 'S') return;
      var old = st.x.snake || [m.f], grow = !!m.cap, body = [m.t].concat(old.slice(0, grow ? old.length : old.length - 1));
      old.forEach(function (s, k) { if (k > 0 && n.b[s] && n.b[s].t === 'Z') n.b[s] = null; });
      for (var k = 1; k < body.length; k++) n.b[body[k]] = { t: 'Z', c: 'w', m: 1 };
      n.x.snake = body;
      var d = m.t - m.f; n.x.dir = d === 1 ? 'r' : d === -1 ? 'l' : d > 0 ? 'd' : 'u';  /* head faces its travel direction */
    },
    /* the video's run: game 1 vs Martin (snake length 2), game 2 vs Smartin, game 3 vs Smartin with a length-4 snake;
       a win moves you to the next game (kept in localStorage) */
    setup: function (ctx) {
      var L = ctx.params.levels, k = Math.min(CM.store.get('g4snake.level', 0), L.length - 1), lv = L[k];
      ctx.setOpponent(Object.assign({}, ctx.opponent, lv.opp));
      if (lv.len > 2) { var extra = [59, 58]; extra.forEach(function (i) { ctx.set(i, { t: 'Z', c: 'w', m: 1 }); }); ctx.setX('snake', [43, 51].concat(extra)); }
      ctx.setX('dir', 'u');
    },
    onGameOver: function (ctx, res) {
      var k = CM.store.get('g4snake.level', 0);
      if (res && res.w === ctx.human) { if (k < ctx.params.levels.length - 1) { CM.store.set('g4snake.level', k + 1); ctx.toast('Next game: ' + ctx.params.levels[k + 1].name, 2400); } else { CM.store.set('g4snake.level', 0); ctx.toast('All three games won!', 2400); } }
    },
    decorate: function (ctx, sq, p) { if (p && p.t === 'S') return { cls: 'g4snake-' + (ctx.x.dir || 'u') }; return null; },
    status: function (ctx) {
      if (!document.getElementById('g4snake-css')) { var c = document.createElement('style'); c.id = 'g4snake-css'; c.textContent = '.g4snake-r .pc{rotate:90deg}.g4snake-d .pc{rotate:180deg}.g4snake-l .pc{rotate:-90deg}'; document.head.appendChild(c); }
      var k = Math.min(CM.store.get('g4snake.level', 0), ctx.params.levels.length - 1);
      return ctx.over ? null : ctx.params.levels[k].name + ' · Snake length ' + ((ctx.x.snake || []).length);
    }
  },
  source: { research: 'research/modes/H_5UviR2nTU.json', confidence: 'medium', notes: 'Snake moves one orthogonal step (inferred from arcade Snake). Head/body art from the video sprite. The head slides; body segments redraw in place (no per-segment slide). Smartin plays at the same search depth (its strength is ??? in the video).' }
});
