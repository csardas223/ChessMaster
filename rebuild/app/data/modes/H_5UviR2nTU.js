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
    S: { name: 'Snake head', moves: 'W', value: 900, capturable: false, glyph: 'P', badge: 'S' },
    Z: { name: 'Snake body', moves: '', value: 0, capturable: false, blocker: true, overlay: 'wall' }
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/3S4/3Z4/4K3', x: { snake: [43, 51] } },
  rules: { check: { w: 'standard', b: 'none' }, castling: false },
  bot: { engine: 'search', elo: 250, depth: 2, time_ms: 450 },
  hooks: {
    onMake: function (V, st, m, n) {
      if (m.p !== 'S') return;
      var old = st.x.snake || [m.f], grow = !!m.cap, body = [m.t].concat(old.slice(0, grow ? old.length : old.length - 1));
      old.forEach(function (s, k) { if (k > 0 && n.b[s] && n.b[s].t === 'Z') n.b[s] = null; });
      for (var k = 1; k < body.length; k++) n.b[body[k]] = { t: 'Z', c: 'w', m: 1 };
      n.x.snake = body;
    },
    status: function (ctx) { return ctx.over ? null : 'Snake length ' + ((ctx.x.snake || []).length); }
  },
  source: { research: 'research/modes/H_5UviR2nTU.json', confidence: 'medium', notes: 'Snake moves one orthogonal step (inferred from arcade Snake); body drawn as wall overlay in pass 1.' },
  todo_pass2: ['snake art: bright green segments, head with eyes facing travel direction', 'Smartin (???) level + length-4 restart', 'segment slide animation']
});
