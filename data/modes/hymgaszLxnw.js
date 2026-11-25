/* Evil Martin Just Got WORSE.  Evil Martin returns: he now wakes up at -5 (was -6) and then plays like a grandmaster
   (3000) for the rest of the game. Sources: research/modes/hymgaszLxnw.json (SRT 0:00, 7:20, 18:30; frames Martin (250)
   -> Evil Martin (3000) BOT, user 2000, brown board #eadeba/#ae8a66). Avatars are original art. */
CM.mode({
  id: 'hymgaszLxnw',
  title: 'Evil Martin Just Got WORSE',
  name: 'Evil Martin (-5)',
  category: 'Other Videos',
  description: 'Evil Martin is back and wakes up sooner: as soon as the evaluation reaches -5 against him, he stops playing like Martin and plays like a grandmaster for the rest of the game. You will only notice from his moves and his face.',
  how_to_win: 'Checkmate Evil Martin.',
  player_side: 'white',
  player: { name: 'You', rating: 2000 },
  opponent: { name: 'Martin', rating: 250, avatar: 'assets/modes/LfzNhUjl3qE/sleepy_martin.png', tagline: 'Looks well asleep.' },
  board: { files: 8, ranks: 8, light: '#eadeba', dark: '#ae8a66' },
  theme: { background: '#262421' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'auto', elo: 250, depth: 3, time_ms: 700 },
  params: { trigger: 500, sleepyAvatar: 'assets/modes/LfzNhUjl3qE/sleepy_martin.png', evilAvatar: 'assets/modes/hymgaszLxnw/evil_martin.png' },
  assets: { evil: 'assets/modes/hymgaszLxnw/evil_martin.png' },
  hooks: 'g4_evil',
  source: { research: 'research/modes/hymgaszLxnw.json', confidence: 'high' }
});
