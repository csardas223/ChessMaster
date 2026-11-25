/* You're Not Ready for Evil Martin (feat. wintrcat).  Evil Martin plays like Sleepy Martin (250) until the eval reaches
   -6 for him, then plays like a grandmaster (3000) for the rest of the game; his icon changes (viewers see it, the
   player is not told). Sources: research/modes/LfzNhUjl3qE.json (SRT 0:00, 0:30, 3:20, 9:20; frames 'Sleepy Martin
   (250)' -> 'Evil Martin (3000)' BOT, brown board). Avatars are original art. */
CM.mode({
  id: 'LfzNhUjl3qE',
  title: "You're Not Ready for Evil Martin (feat. wintrcat)",
  name: 'Evil Martin (-6)',
  category: 'Other Videos',
  description: 'A custom bot: Evil Martin plays like a sleepy 250-rated Martin, until the evaluation reaches -6 against him. Then he wakes up and plays like a grandmaster for the rest of the game. Be careful which free pieces you take.',
  how_to_win: 'Checkmate Evil Martin.',
  player_side: 'white',
  player: { name: 'You', rating: 2000 },
  opponent: { name: 'Martin', rating: 250, avatar: 'assets/modes/LfzNhUjl3qE/sleepy_martin.svg', tagline: 'Looks well asleep.' },
  board: { files: 8, ranks: 8, light: '#e8d8b0', dark: '#b08060' },
  theme: { background: '#262421' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'auto', elo: 250, depth: 3, time_ms: 700 },
  params: { trigger: 600, sleepyAvatar: 'assets/modes/LfzNhUjl3qE/sleepy_martin.svg', evilAvatar: 'assets/modes/LfzNhUjl3qE/evil_martin.svg' },
  assets: { evil: 'assets/modes/LfzNhUjl3qE/evil_martin.svg' },
  hooks: 'g4_evil',
  source: { research: 'research/modes/LfzNhUjl3qE.json', confidence: 'high', notes: 'Trigger measured with a 2-ply search after each player move; GM phase uses Stockfish at 3000.' }
});
