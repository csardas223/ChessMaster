/* Can I Beat Every Advanced Bot?  Speedrun: beat chess.com's Advanced bots in rating order with a running timer.
   Sources: research/modes/tfPyy36nwc4.json (Wendy 1500, Pablo 1600, Arthur 1700, Lorenzo 1800, Miguel 1900, Li 2000 (chapter 'Lee', on screen 'Li'),
   Manuel 2100; a loss ends the run), frames: brown board, large elapsed timer. Chat lines are original. */
CM.mode({
  id: 'tfPyy36nwc4',
  name: 'Advanced Bots Speedrun',
  category: 'Variants & Games',
  description: 'A speedrun through the seven Advanced bots, from Wendy (1500) to Manuel (2100). The timer runs across every game. Win to face the next bot; a loss ends the run and the next game starts a new one.',
  how_to_win: 'Checkmate all seven bots in a row as fast as you can.',
  player_side: 'white',
  opponent: { name: 'Wendy', rating: 1500, avatar: 'assets/modes/tfPyy36nwc4/wendy.png', tagline: 'Advanced bot' },  /* chess.com bot portraits Wendy/Miguel/Li from the 0:17 / 21:56 / 27:37 frames (tools/g4_art5.py) */
  board: { files: 8, ranks: 8, light: '#eadeba', dark: '#ba8a66' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'auto', elo: 1500, time_ms: 600 },
  params: {
    speedrun: true, chance: 0.2,
    ladder: [
      { name: 'Wendy', rating: 1500, avatar: 'assets/modes/tfPyy36nwc4/wendy.png', lines: ['Let us see how fast you really are.', 'Nice try!'] },
      { name: 'Pablo', rating: 1600, avatar: 'assets/modes/tfPyy36nwc4/pablo.png', lines: ['Hola! Ready for a real game?', 'Hmm, interesting.'] },
      { name: 'Arthur', rating: 1700, avatar: 'assets/modes/tfPyy36nwc4/arthur.png', lines: ['A gentleman never rushes.', 'Indeed.'] },
      { name: 'Lorenzo', rating: 1800, avatar: 'assets/modes/tfPyy36nwc4/lorenzo.png', lines: ['Speed is nothing without accuracy.', 'Bellissimo.'] },
      { name: 'Miguel', rating: 1900, avatar: 'assets/modes/tfPyy36nwc4/miguel.png', lines: ['The clock is ticking for you, not me.', 'Careful now.'] },
      { name: 'Li', rating: 2000, avatar: 'assets/modes/tfPyy36nwc4/li.png' /* the chapter says 'Lee'; the chess.com bar at 27:37 reads 'Li (2000)' */, lines: ['You made it this far. Impressive.', 'Calculate.'] },
      { name: 'Manuel', rating: 2100, avatar: 'assets/modes/WciUSfeqGgs/manuel.png' /* same chess.com Manuel bot, cropped from the WciUSfeqGgs video frame */, lines: ['The last boss of the Advanced bots.', 'That pawn is going all the way.'] }
    ]
  },
  hooks: 'g6_ladder',
  source: { research: 'research/modes/tfPyy36nwc4.json', confidence: 'high', notes: 'art-audit-b: chess.com bot avatars swapped for the exact same art at 200px from the chess.com API (api.chess.com/pub/player/<name>-bot avatar on images.chesscomfiles.com), on the video\'s dark avatar background.' }
});
