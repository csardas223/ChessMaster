/* Can I BEAT Bughouse? (feat. Will Taylor Chess)  Online Bughouse as a team with Will Taylor vs human teams (~1200-1300),
   goal three wins. Pieces your partner captures arrive in your hand and can be dropped. Sources:
   research/modes/134MBhzRN2c.json. PASS 1: second board simulated like ymIg80xvKVE (periodic partner hand-offs). */
CM.mode({
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/134MBhzRN2c/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: '134MBhzRN2c',
  title: 'Can I BEAT Bughouse? (feat. Will Taylor Chess)',
  name: 'Bughouse with Will Taylor',
  category: 'Other Videos',
  description: 'Bughouse on one board: your teammate Will Taylor plays the other board and passes you every piece he captures (the other team does the same). Pieces in your hand can be dropped on any empty square instead of moving (pawns not on the first or last rank). Ask for pieces, sacrifice on f7, mate with drops.',
  how_to_win: 'Checkmate the enemy king (or flag him). Goal in the video: three team wins.',
  player_side: 'white',
  player: { avatar: 'assets/modes/134MBhzRN2c/you.png', name: 'You + Will Taylor', rating: 1300 },
  opponent: { name: 'Bughouse team', rating: 1250, tagline: 'Two online players (~1200-1300).' },
  board: { files: 8, ranks: 8, light: '#eeeed2', dark: '#769656' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { drops: true },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'search', elo: 1250, depth: 3, time_ms: 700 },
  events: [{ when: 'every_plies:5', do: { hook: 'partner' } }],
  hooks: {
    partner: function (ctx) {
      var bag = ['P', 'P', 'P', 'P', 'N', 'B', 'N', 'B', 'R', 'Q'];
      var give = function () { return bag[Math.floor(Math.random() * bag.length)]; };
      var h = Object.assign({}, ctx.state.hands), a = give(), b = give();
      h[ctx.human] = h[ctx.human].concat([a]); h[ctx.bot] = h[ctx.bot].concat([b]);
      ctx.state = Object.assign({}, ctx.state, { hands: h });
      ctx.toast('Will Taylor: "Take a ' + ({ P: 'pawn', N: 'knight', B: 'bishop', R: 'rook', Q: 'queen' })[a] + '!"', 2400);
      ctx.refresh();
    }
  },
  source: { research: 'research/modes/134MBhzRN2c.json', confidence: 'medium', notes: 'Second board simulated by periodic partner hand-offs (pattern from ymIg80xvKVE).' },
  todo_pass2: ['second-board mini view', 'voice-chat style partner lines', 'team score to 3 wins', 'avatars']
});
