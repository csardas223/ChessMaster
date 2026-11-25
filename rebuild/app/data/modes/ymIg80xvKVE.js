/* Can I SURVIVE Bughouse?  chess.com Bughouse with teammate Viper King: pieces your partner captures on the other
   board arrive in your hand and can be dropped on any empty square (pawns not on the first or last rank). Sources:
   research/modes/ymIg80xvKVE.json. The second board is simulated: your own captures drop as in crazyhouse, and every
   few moves your partner (and the enemy partner) send over a piece won on their board. */
CM.mode({
  id: 'ymIg80xvKVE',
  name: 'Bughouse',
  category: 'Variants & Games',
  description: 'Bughouse on one board: your teammate Viper King is playing the other board and keeps passing you the pieces he captures (the opponents\' partner does the same for them). Captured pieces and the pieces passed to you sit in your hand; drop one on any empty square instead of moving.',
  how_to_win: 'Checkmate the enemy king.',
  player_side: 'white',
  player: { name: 'You + Viper King', rating: 1800 },
  opponent: { name: 'Bughouse team', rating: 1800, avatar: null, tagline: 'Two online players; you face one of them.' },
  board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { drops: true },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'search', elo: 1800, depth: 3, time_ms: 700 },
  events: [{ when: 'every_plies:5', do: { hook: 'partner' } }],
  hooks: {
    partner: function (ctx) {
      var bag = ['P', 'P', 'P', 'P', 'N', 'B', 'N', 'B', 'R', 'Q'];
      var give = function () { return bag[Math.floor(Math.random() * bag.length)]; };
      var h = Object.assign({}, ctx.state.hands), a = give(), b = give();
      h[ctx.human] = h[ctx.human].concat([a]); h[ctx.bot] = h[ctx.bot].concat([b]);
      var st = Object.assign({}, ctx.state, { hands: h }); ctx.state = st;
      ctx.toast('Viper King: "Here, take a ' + ({ P: 'pawn', N: 'knight', B: 'bishop', R: 'rook', Q: 'queen' })[a] + '!"', 2400);
      ctx.refresh();
    }
  },
  source: { research: 'research/modes/ymIg80xvKVE.json', confidence: 'medium', notes: 'Second board simulated by periodic partner hand-offs (one board only in this app).' }
});
