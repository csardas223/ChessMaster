/* Chess, But You Can't Capture Pieces... Normal chess movement but no piece may ever capture. Pieces still control
   squares: a king may not step into an attacked square and checks still have to be answered, so the game is won by
   checkmate. Two games: Martin (250), then his evil twin Smartin (???).
   Sources: research/modes/IU9a1RB1KJw.json (low confidence: transcript failed with 429; frames show purple boxed
   squares/arrows, Martin (250) then "Smartin (???)", green #eaf6d2/#7ea25a).
   Inferred (low confidence): the swap idea from the frames is not implemented; the title rule "no captures" is
   applied to both sides; check still applies. Re-run the transcript (recheck_low_confidence.json). */
(function () {
  var LADDER = [
    { name: 'Martin', rating: 250, avatar: 'assets/modes/9pHhqAbQS0s/martin.png', tagline: 'chess.com beginner bot.', elo: 250, style: 'elo' },
    { name: 'Smartin', rating: '???', avatar: 'assets/modes/IU9a1RB1KJw/smartin.png', tagline: "Martin's evil twin. Much sharper.", elo: 2200, style: 'best' }
  ];
  var level = 0;
  CM.mode({
    id: 'IU9a1RB1KJw',
    name: 'No Captures',
    category: 'Powerups & Rule Twists',
    description: 'Pieces move normally but nothing can ever be captured, by either side. Pieces still guard squares, so checks must be answered and a king cannot walk into an attacked square. Beat Martin, then Smartin.',
    how_to_win: 'Checkmate the bot: with no captures, you have to box the king in.',
    player_side: 'white',
    opponent: LADDER[0],
    board: { files: 8, ranks: 8 },
    theme: { light: '#eaf6d2', dark: '#7ea25a' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    rules: { enPassant: false, drawPlies: 200 },
    bot: { engine: 'search', elo: 250, depth: 3, time_ms: 500 },
    hooks: {
      filterMoves: function (V, st, legal) { return legal.filter(function (m) { return !m.cap; }); },
      setup: function (ctx) { var L = LADDER[level]; ctx.setOpponent(L); ctx.game.opponent.elo = L.elo; ctx.game.spec.bot.style = L.style; },
      onGameOver: function (ctx, r) {
        if (r.w === ctx.human && level < LADDER.length - 1) { level++; ctx.toast('Martin is gone... Smartin wants a word. Press New for game 2.', 3200); }
        else if (r.w === ctx.human) ctx.toast('You beat Smartin too!', 2600);
      },
      status: function (ctx) { return 'Game ' + (level + 1) + ' of 2 vs ' + ctx.opponent.name + '. No captures allowed.'; }
    },
    todo_pass2: ['purple boxed-square highlights from the frames (rule unclear)'],
    source: { research: 'research/modes/IU9a1RB1KJw.json', confidence: 'low', notes: 'Swap-on-contact rule from frames not confirmed; implemented plain no-capture chess.' }
  });
})();
