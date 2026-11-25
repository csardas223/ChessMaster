/* Can I BEAT the OLDEST Chess Website?  3-minute blitz on FICS (freechess.org, 1995) against human seekers.
   Sources: research/modes/hN-WkBw_PRs.json (3+0, first opponent 'family' 1790, player starts unrated), frames: blue-grey
   FICS web client board, console log. Board colours approximate the retro client; console messages are paraphrased. */
CM.mode({
  id: 'hN-WkBw_PRs',
  name: 'FICS Blitz',
  category: 'Variants & Games',
  description: 'Normal chess on the oldest chess server still running, the Free Internet Chess Server. You post a seek, get paired with a real regular, and play 3-minute blitz with no increment.',
  how_to_win: 'Win one game: checkmate, or make your opponent run out of time.',
  player_side: 'white',
  player: { name: 'iwantcheckmate', rating: null },
  opponent: { name: 'family', rating: 1790, avatar: null, tagline: 'FICS regular. Text-only handle, no avatar.' },
  board: { files: 8, ranks: 8, light: '#dfe3e8', dark: '#8a9bb0' },
  theme: { background: '#20252c' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'auto', elo: 1790, time_ms: 600 },
  intro_message: 'Your seek has been posted with index 42. Six players saw the seek.',
  source: { research: 'research/modes/hN-WkBw_PRs.json', confidence: 'high' }
});
