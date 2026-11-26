/* Can I BEAT Duolingo Chess?  s6c rebuild (owner 2026-11-26 "duolingo didn't match"; the old legacy mode was an invented
   "hearts vs Duo the owl" game). Sources: full transcript of eCzxOgc4fTY (analyze_video, 2026-11-26):
   - 0:44 placement by Elo -> "section four", 0:50-2:16 Oscar's checkmate practice (mate in 1 and one mate in 2: Qxf7,
     back-rank mates, Qh7), 2:16 result "100% 1 minute 35".
   - 3:12-3:15 "Play chess: 20-minute matches with Oscar"; 3:21 Oscar: "I'll go easy on you."
   - Game 1 (3:24-6:03): Oscar plays strongly and wins ("he says bye-bye", "the attitude is insane").
   - Game 2 (6:14-7:35): the "adaptive AI" hangs its queen and pieces ("everything is free now", "you took my pony").
   - Game 3 (7:54-): in between ("not playing as bad as the second round, not as well as the first"), "some pawns
     aren't built to last", "equal and opposite reaction".
   So: 20-minute games vs Oscar whose strength moves game to game the way the video's three games did (strong, then
   blundering, then middling; params.elo.starts), Oscar's lines from the video as speech toasts, Duolingo colours.
   INFERRED: Oscar's exact Elo per game (1800 / 450 / 1100), when each line is said, the board colours (Duolingo green
   on near-white, matching "white on white" pieces at 0:56). Not built: the lesson path, XP, streak screens and ads. */
(function () {
  'use strict';
  var LINES = {
    start: ["I'll go easy on you.", "Let's kick things off!", 'Ready for a rematch?'],
    takePawn: ["Some pawns aren't built to last."],
    recapture: ['Equal and opposite reaction.'],
    takeQueen: ['Bye-bye!'],
    lostKnight: ['You took my pony!'],
    check: ['Check!'],
    win: ['You know your chess... but not today.'],
    lose: ['You know your chess!']
  };
  function say(ctx, k) { var a = LINES[k]; if (!a) return; var z = ctx.game._duo = ctx.game._duo || { n: 0 }; z.n++; ctx.toast('Oscar: ' + a[z.n % a.length], 2200); }
  CM.mode({
    id: 'eCzxOgc4fTY',
    title: 'Can I BEAT Duolingo Chess?',
    name: 'Duolingo Chess: Oscar',
    category: 'Variants & Games',
    description: "Duolingo's chess course: 20-minute matches against Oscar, Duolingo's chess coach. His play adapts from game to game like in the video: game 1 he plays hard, game 2 he gives pieces away, game 3 he lands in between. Oscar talks back with his lines from the video.",
    how_to_win: 'Checkmate Oscar. Each new game, his strength changes like the video\'s three games.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
    opponent: { name: 'Oscar', rating: 1800, avatar: 'assets/avatars/bot.svg', tagline: "Duolingo's chess coach. 20-minute matches." },
    board: { files: 8, ranks: 8, light: '#f4f7ee', dark: '#89cc4f' },
    theme: { light: '#f4f7ee', dark: '#89cc4f', background: '#58cc02' },
    clock: { w: 1200, b: 1200, inc: 0 },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    params: { elo: { starts: [1800, 450, 1100], max: 3600 } },
    hooks: {
      extends: 'g2_elofish',
      onStart: function (ctx) { if (this._base && this._base.onStart) this._base.onStart.apply(this, arguments); ctx.after(1400, function () { say(ctx, 'start'); }); },
      afterMove: function (ctx, m, info) {
        var r = this._base && this._base.afterMove ? this._base.afterMove.apply(this, arguments) : null;
        if (ctx.over) { say(ctx, ctx.over.w === ctx.human ? 'lose' : 'win'); return r; }
        var z = ctx.game._duo = ctx.game._duo || { n: 0 };
        if (info.by === 'bot') {
          if (info.capture && info.captured === 'Q') say(ctx, 'takeQueen');
          else if (info.capture && z.lastPlayerCapTo === info.to) say(ctx, 'recapture');
          else if (info.capture && info.captured === 'P' && Math.random() < 0.5) say(ctx, 'takePawn');
        } else {
          z.lastPlayerCapTo = info.capture ? info.to : -1;
          if (info.capture && info.captured === 'N') say(ctx, 'lostKnight');
        }
        return r;
      }
    },
    source: { research: 'research/modes/eCzxOgc4fTY.json', confidence: 'medium', notes: 'Rebuilt s6c from the transcript (see header); replaces the invented hearts-vs-Duo legacy mode.' }
  });
})();
