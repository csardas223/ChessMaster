/* Can I BEAT Every Christmas Bot?  Normal chess against a ladder of holiday bots. Sources: research/modes/wMdAOirSvQQ.json
   (Yeti 450 speaks Yeti with a translation, Gingerbread "don't eat me yet", Santa, Holly 1800, Penguin 2250 honks,
   Evil Santa final boss "Tonight shall be the silentest of nights"). Ratings of Gingerbread (~800), Santa (1200, from
   frames) and Evil Santa (2500) are inferred. Other lines are original. */
CM.mode({
  id: 'wMdAOirSvQQ',
  name: 'Christmas Bots',
  category: 'Variants & Games',
  description: 'Normal chess against six holiday bots in rising order: the Yeti, the Gingerbread Man, Santa, Holly, the angry Penguin and finally Evil Santa. Each one chats in character. Win to face the next.',
  how_to_win: 'Checkmate every bot, Evil Santa last.',
  player_side: 'white',
  opponent: { name: 'Yeti', rating: 450, avatar: 'assets/avatars/bot.svg', tagline: 'Holiday bot' },
  board: { files: 8, ranks: 8, light: '#f0d9b5', dark: '#b58863' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'auto', elo: 450, time_ms: 600 },
  params: {
    chance: 0.35,
    ladder: [
      { name: 'Yeti', rating: 450, lines: ['Hrrrnnggh! (Translation: I like your pawns.)', 'Rrraaah mmf. (Translation: it is cold up here.)', 'Hmmfgh! (Translation: I will keep this pawn, thank you.)'] },
      { name: 'Gingerbread Man', rating: 800, lines: ["Don't eat me yet!", 'Run, run, as fast as you can!', 'I am a little crumbly today.'] },
      { name: 'Santa', rating: 1200, lines: ['Ho ho ho! Have you been good this year?', 'I checked my list twice. You are on it.', 'Rudolph would have played that better.'] },
      { name: 'Holly', rating: 1800, lines: ['Deck the halls with checks and captures.', 'A bit of holly, a bit of tactics.', 'Merry everything!'] },
      { name: 'Penguin', rating: 2250, lines: ['HONK.', 'HONK HONK.', 'Honk. (It sounds angry.)'], win_line: 'HONK!' },
      { name: 'Evil Santa', rating: 2500, lines: ['Tonight shall be the silentest of nights.', 'You are on the naughty list now.', 'No presents for you.'], win_line: 'Coal for you this year.' }
    ]
  },
  hooks: 'g6_ladder',
  source: { research: 'research/modes/wMdAOirSvQQ.json', confidence: 'high', notes: 'Gingerbread, Santa, Evil Santa ratings and most chat lines are inferred/original.' }
});
