/* Chess, But You Can't Capture Pieces... Normal chess movement but no piece may ever capture (either side). Pieces still
   control squares: checks must be answered ("we are put in check, but I can just slide out of the way", 3:56) and the
   game is won by checkmate. Four games: Martin (250) 0:01-2:04, Smartin (???, Martin with glasses) 2:04-5:24, then
   "a new character ... the strongest iteration of Martin we've ever had" (5:24, the evil black-faced Martin of the
   thumbnail), beaten at 7:34 and again in a rematch 7:54-9:06.
   Sources: research/modes/IU9a1RB1KJw.json, transcript (recheck 2026-11-25, analyze_video), still maxres2 (Smartin card,
   research/frames/video_thumbs/IU9a1RB1KJw_maxres2.jpg), thumbnail (evil Martin). The purple boxes/arrows are the
   narrator's analysis marks, not a swap rule. The third bot's on-screen name is not spoken: "Evil Martin" is ours. */
(function () {
  var LADDER = [
    { name: 'Martin', rating: 250, avatar: 'assets/modes/9pHhqAbQS0s/martin.png', tagline: 'chess.com beginner bot.', elo: 250, style: 'elo' },
    { name: 'Smartin', rating: '???', avatar: 'assets/modes/IU9a1RB1KJw/smartin_glasses.png', tagline: "Martin's cousin. Hopefully plays a little smarter.", elo: 1400, style: 'elo' },
    { name: 'Evil Martin', rating: '???', avatar: 'assets/modes/IU9a1RB1KJw/smartin.png', tagline: 'The strongest iteration of Martin ever. Beat him twice.', elo: 2200, style: 'best', games: 2 }
  ];
  var level = 0, wins = 0;
  function gameNo() { return [1, 2, 3][level] + wins; }
  CM.mode({
    id: 'IU9a1RB1KJw',
    name: 'No Captures',
    category: 'Powerups & Rule Twists',
    description: 'Pieces move normally but nothing can ever be captured, by either side. Pieces still guard squares, so checks must be answered and a king cannot walk into an attacked square. Beat Martin, Smartin, then the evil Martin twice.',
    how_to_win: 'Checkmate the bot: with no captures, you have to box the king in.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
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
        if (r.w !== ctx.human) return;
        wins++;
        if (wins < (LADDER[level].games || 1)) { ctx.toast(LADDER[level].name + ' wants a rematch. Press New.', 3000); return; }
        if (level < LADDER.length - 1) { level++; wins = 0; ctx.toast(LADDER[level].name + ' is next. Press New for game ' + (gameNo()) + '.', 3200); }
        else ctx.toast('You beat every Martin!', 2600);
      },
      status: function (ctx) { return 'Game ' + gameNo() + ' of 4 vs ' + ctx.opponent.name + '. No captures allowed.'; }
    },
    source: { research: 'research/modes/IU9a1RB1KJw.json', confidence: 'high', notes: 'Rechecked against the transcript 2026-11-25: plain no-capture chess, check applies, 3 bots / 4 games. Evil Martin name and bot strengths are ours.' }
  });
})();
