/* Can I BEAT Hyper Chess?  Hyper Chess (Steam): real-time chess with no turns, a MOVES meter, pieces that travel and
   can be intercepted mid-path; king capture wins, castling unavailable. He plays online games (e.g. vs 'Clob') and
   wins 3 of 5. Sources: research/modes/d8pJkdxtXAA.json (transcript 00:00:01 rules, frames: white/blue 3D board).
   PASS 1: played turn-based (king capture, no check, no castling) as a best-of-5 match; the real-time engine is pass 2. */
(function () {
  var match = { you: 0, them: 0, games: 0 };
  CM.mode({
    id: 'd8pJkdxtXAA',
    title: 'Can I BEAT Hyper Chess?',
    name: 'Hyper Chess',
    category: 'Variants & Games',
    description: 'Hyper Chess has no check and no castling: the king is simply captured like any other piece, so watch every attack on it. In the video the game is real time (both sides move whenever their MOVES meter allows); here it is played move by move as a best-of-five match.',
    how_to_win: 'Capture the enemy king. Win 3 games of the 5-game match.',
    player_side: 'black',
    opponent: { name: 'Clob', rating: null, tagline: 'Online Hyper Chess player.' },
    board: { files: 8, ranks: 8, light: '#f6f6f6', dark: '#66aed2' },
    theme: { background: '#16222c' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    rules: { check: 'none', castling: false, enPassant: true, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
    bot: { engine: 'search', depth: 3, time_ms: 600 },
    params: { games: 5, need: 3, reward: 75 },
    hooks: {
      setup: function (ctx) { if (match.you >= ctx.params.need || match.them >= ctx.params.need || match.games >= ctx.params.games) match = { you: 0, them: 0, games: 0 }; },
      onStart: function (ctx) { ctx.toast('Game ' + (match.games + 1) + ' of ' + ctx.params.games + ': no check, capture the king!', 2800); },
      onGameOver: function (ctx, over) {
        match.games++;
        if (over.w === ctx.human) { match.you++; ctx.toast('You win! +$' + ctx.params.reward + '. Match ' + match.you + '-' + match.them + (match.you >= ctx.params.need ? ': three wins, match won!' : ''), 3600); }
        else if (over.w !== 'd') { match.them++; ctx.toast('Match ' + match.you + '-' + match.them + (match.them >= ctx.params.need ? ': match lost.' : ''), 3200); }
      },
      status: function (ctx) { return 'Match ' + match.you + '-' + match.them + ' (game ' + Math.min(match.games + 1, ctx.params.games) + '/' + ctx.params.games + ', first to ' + ctx.params.need + ')'; }
    },
    todo_pass2: ['real-time play: no turns, MOVES meter that refills, pieces travel over time and can be intercepted mid-path (knights cannot)', 'MOVES meter bar UI', 'win screen with flag and +$ reward', 'knight flying-away capture animation', 'upbeat win music'],
    source: { research: 'research/modes/d8pJkdxtXAA.json', confidence: 'high', notes: 'Real time is approximated as alternating moves for pass 1; reward amount per win simplified to $75.' }
  });
})();
