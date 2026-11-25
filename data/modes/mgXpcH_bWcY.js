/* Can I BEAT Blindfold Hikaru?  chess.com's "Insane" bot Blindfolded Hikaru (~2800) can only be played blindfolded: no
   pieces are drawn on your board. The bot chats in Hikaru style. Sources: research/modes/mgXpcH_bWcY.json (game 1 draw by
   repetition, game 2 loss; "*arches eyebrows*"). Other chat lines are original. */
(function () {
  var LINES = ['*arches eyebrows*', 'Chat, this is just winning.', 'Takes takes takes.', 'I am playing this with my eyes closed. Literally.', 'Hmm. Interesting.', 'Obviously.'];
  CM.mode({
    id: 'mgXpcH_bWcY',
    name: 'Blindfold Hikaru',
    category: 'Variants & Games',
    description: 'The Insane bot: Blindfolded Hikaru, rated 2800. You must play blindfolded, so no pieces are shown on your board; only highlights and legal-move dots. A draw is already a moral victory.',
    how_to_win: 'Checkmate Hikaru without seeing the pieces (a draw counts as a moral victory).',
    player_side: 'white',
    opponent: { name: 'Blindfolded Hikaru', rating: 2800, avatar: 'assets/modes/mgXpcH_bWcY/hikaru_blind.png', tagline: 'Insane bot. Plays blindfolded too.' },
    board: { files: 8, ranks: 8, light: '#eaeed1', dark: '#749e55' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    bot: { engine: 'auto', elo: 2800, time_ms: 800 },
    hooks: {
      decorate: function (ctx, sq, p) { return p && !ctx.over ? { hidePiece: true } : null; },
      afterMove: function (ctx, m, info) { if (info.by === 'bot' && (info.ply <= 2 || Math.random() < 0.25)) ctx.toast('Hikaru: ' + ctx.pick(LINES), 2400); }
    },
    messages: { draw: 'a draw against a 2800 bot: moral victory' },
    source: { research: 'research/modes/mgXpcH_bWcY.json', confidence: 'high' }
  });
})();
