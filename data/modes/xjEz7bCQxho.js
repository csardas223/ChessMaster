/* Can I BEAT Myself as a Chess Bot?  The "Tony" bot on iwantcheckmate.com (2100) imitates the creator: London System ideas
   and an obsession with ladder mates. Sources: research/modes/xjEz7bCQxho.json (London vs London game 1, ladder mate game 2,
   purple site board). The bot plays a symmetrical London setup (d5, Bf5, e6, Nf6, c6, Nbd7, Bd6) as Black when it can, then
   searches normally. Chat lines are original. */
(function () {
  var BOOK = ['d7d5', 'c8f5', 'e7e6', 'g8f6', 'c7c6', 'b8d7', 'f8d6'];
  var LINES = ['Ladder mate incoming.', 'London System, obviously.', 'Rooks on the seventh, then the ladder.', 'I want checkmate.', 'This bishop goes to f5. Always.'];
  CM.mode({
    id: 'xjEz7bCQxho',
    name: 'Tony Bot',
    category: 'Variants & Games',
    description: 'Normal chess against the Tony bot from iwantcheckmate.com, programmed to play like the creator: a London System setup, active bishops and a love of ladder mates.',
    how_to_win: 'Checkmate the Tony bot.',
    player_side: 'white',
    opponent: { name: 'Tony', rating: 2100, avatar: 'assets/modes/xjEz7bCQxho/tony.png', tagline: 'Plays the London. Wants ladder mates.' },
    board: { files: 8, ranks: 8, light: '#e8dcf2', dark: '#9b7bbf' },
    theme: { background: '#2a1d3a' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    bot: { engine: 'search', elo: 2100, depth: 4, time_ms: 800 },
    hooks: {
      botPick: function (ctx, ranked) {
        var V = ctx.V, g = V.geo;
        if (ctx.ply < 16) for (var k = 0; k < BOOK.length; k++) {
          var f = g.parse(BOOK[k].slice(0, 2)), t = g.parse(BOOK[k].slice(2));
          var hit = ranked.find(function (r) { return r.m.f === f && r.m.t === t; });
          if (hit && hit.v > ranked[0].v - 60) return hit.m;
        }
        return ranked[0].m;
      },
      afterMove: function (ctx, m, info) { if (info.by === 'bot' && Math.random() < 0.25) ctx.toast('Tony: ' + ctx.pick(LINES), 2400); }
    },
    source: { research: 'research/modes/xjEz7bCQxho.json', confidence: 'medium', notes: 'Opening book and chat lines inferred from the London/ladder-mate description.' }
  });
})();
