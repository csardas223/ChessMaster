/* Chess, But Captures are Permanent Between Games... A gauntlet up the chess.com bot ladder (Zach 1, Martin 250,
   Juan 400, Noel 550, Aaron 700, Zara 850, Maria 1000, Aziz 1100, then stronger bots) where every piece of yours that
   gets captured is gone from your starting army for all later games. The bots always start with a full army. The run
   ends at your first loss.
   Sources: research/modes/9pHhqAbQS0s.json (transcript ladder names/ratings, "any piece I lose is lost permanently",
   16:56 mated by Aziz), frames visual_b (green #eaead2/#72a25a, "Game 100" thumbnail with K, N and two pawns).
   Inferred: a promoted piece that is captured costs the original pawn; draws keep the run going at the same bot; the
   ladder above Aziz continues in 150-point steps; the run lives in this browser tab (New game after a loss restarts). */
(function () {
  var L = [
    ['Zach', 1, 'assets/modes/9pHhqAbQS0s/zach.png'], ['Martin', 250, 'assets/modes/9pHhqAbQS0s/martin.png'],
    ['Juan', 400, 'assets/modes/nK5WQNSbFfE/juan.png'], ['Noel', 550, 'assets/avatars/bot.svg'],
    ['Aaron', 700, 'assets/modes/9pHhqAbQS0s/aaron.png'], ['Zara', 850, 'assets/avatars/bot.svg'],
    ['Maria', 1000, 'assets/modes/AtmctmxLq58/maria.png'], ['Aziz', 1100, 'assets/avatars/bot.svg']
  ];
  function bot(k) {
    if (k < L.length) return { name: L[k][0], rating: L[k][1], avatar: L[k][2], elo: Math.max(1, L[k][1]) };
    var r = 1100 + 150 * (k - L.length + 1); return { name: 'Bot ' + r, rating: r, avatar: 'assets/avatars/bot.svg', elo: r };
  }
  var run = { level: 0, lost: {}, dead: false, game: 1 };
  CM.mode({
    id: '9pHhqAbQS0s',
    name: 'Permanent Captures',
    category: 'Powerups & Rule Twists',
    description: 'Climb the chess.com bot ladder from 1 Elo upward. Every piece of yours that gets captured is missing from your starting army in every later game; the bots always start with everything. The run ends at your first loss.',
    how_to_win: 'Beat as many bots in a row as you can. Avoid trades at all costs.',
    player_side: 'white',
    opponent: { name: 'Zach', rating: 1, avatar: 'assets/modes/9pHhqAbQS0s/zach.png', tagline: 'The first rung of the ladder.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#eaead2', dark: '#72a25a' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    bot: { engine: 'auto', elo: 1, depth: 3, time_ms: 500 },
    hooks: {
      stockfishOk: true,
      setup: function (ctx) {
        if (run.dead) run = { level: 0, lost: {}, dead: false, game: 1 };
        var b = bot(run.level), st = ctx.state;
        ctx.setOpponent({ name: b.name, rating: b.rating, avatar: b.avatar, tagline: 'Game ' + run.game + ' of the gauntlet.' }); ctx.game.opponent.elo = b.elo;
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || p.c !== ctx.human) continue;
          var o = ctx.name(i); if (run.lost[o]) st.b[i] = null; else st.b[i] = Object.assign({}, p, { o: o }); }
      },
      onGameOver: function (ctx, r) {
        var have = {}; ctx.state.b.forEach(function (p) { if (p && p.o) have[p.o] = 1; });
        var gone = [];
        ['a1','b1','c1','d1','e1','f1','g1','h1','a2','b2','c2','d2','e2','f2','g2','h2'].forEach(function (s) { if (!run.lost[s] && !have[s]) { run.lost[s] = 1; gone.push(s); } });
        var left = 16 - Object.keys(run.lost).length;
        if (r.w === ctx.human) { run.level++; run.game++; ctx.toast('Win! ' + (gone.length ? gone.length + ' piece' + (gone.length > 1 ? 's' : '') + ' lost for good. ' : 'No losses! ') + left + ' pieces carry over. Next: ' + bot(run.level).name + '.', 3600); }
        else if (r.w === 'd') { run.game++; ctx.toast('Draw: replay ' + bot(run.level).name + ' with ' + left + ' pieces.', 3200); }
        else { run.dead = true; ctx.toast('Run over after ' + run.level + ' win' + (run.level === 1 ? '' : 's') + '. New starts a fresh run.', 3600); }
      },
      status: function (ctx) { var n = Object.keys(run.lost).length; return 'Game ' + run.game + ' - ' + run.level + ' win' + (run.level === 1 ? '' : 's') + ' so far - ' + (16 - n) + '/16 pieces left.'; }
    },
    todo_pass2: ['roster / army carry-over screen between games'],
    source: { research: 'research/modes/9pHhqAbQS0s.json', confidence: 'high', notes: 'Ladder above Aziz and draw handling inferred.' }
  });
})();
