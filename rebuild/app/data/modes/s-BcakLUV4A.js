/* Can I BEAT Stockfih?  "Stockfih" has 8 of Stockfish's 9 letters, so it plays 8 moves as Stockfish and every 9th move as
   Martin (the 250 beginner bot), cycling. Sources: research/modes/s-BcakLUV4A.json (cycle rule, Tony as White, ended in a
   loss to a triple battery). Implementation: before each bot move the engine strength is switched (3200 / 250). */
(function () {
  var CYCLE = 9;
  function setFor(ctx) {
    var n = (ctx.x.botMoves || 0) + 1, martin = n % CYCLE === 0;
    Object.assign(ctx.opponent, martin ? { elo: 250, rating: 250, name: 'stockfih (Martin move)' } : { elo: 3200, rating: 3200, name: 'stockfih' });
    return martin;
  }
  CM.mode({
    id: 's-BcakLUV4A',
    name: 'Stockfih',
    category: 'Variants & Games',
    description: 'Stockfih is Stockfish missing one letter: it plays eight moves at full Stockfish strength, then its ninth move is played by Martin, the 250-rated beginner bot. The cycle repeats every nine moves. Survive the engine moves and punish the Martin move.',
    how_to_win: 'Checkmate Stockfih.',
    player_side: 'white',
    opponent: { name: 'stockfih', rating: 3200, avatar: 'assets/avatars/stockfish.svg', tagline: '8/9 Stockfish, 1/9 Martin.' },
    board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    bot: { engine: 'auto', elo: 3200, time_ms: 700 },
    hooks: {
      setup: function (ctx) { ctx.setX('botMoves', 0); setFor(ctx); },
      afterMove: function (ctx, m, info) {
        if (info.by === 'bot') {
          var n = (ctx.x.botMoves || 0) + 1; ctx.setX('botMoves', n);
          if (n % CYCLE === 0) ctx.toast('That was a Martin move!', 1800);
        }
        if (setFor(ctx) && info.by === 'player') ctx.toast('Martin is playing the next move...', 1600);
      },
      status: function (ctx) { var n = (ctx.x.botMoves || 0) % CYCLE; return 'Bot move ' + (n + 1) + ' of ' + CYCLE + (n + 1 === CYCLE ? ': Martin plays this one' : ': Stockfish'); }
    },
    source: { research: 'research/modes/s-BcakLUV4A.json', confidence: 'high' }
  });
})();
