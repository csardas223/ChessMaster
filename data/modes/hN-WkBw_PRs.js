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
  board: { files: 8, ranks: 8, light: '#dee3e6', dark: '#8ba4a9' },
  theme: { background: '#20252c' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'auto', elo: 1790, time_ms: 600 },
  intro_message: 'Your seek has been posted with index 42. Six players saw the seek.',
  params: { series: {opponents: [{name: 'family', rating: 1790}, {name: 'loveflyfishing', rating: 1682}, {name: 'fluters', rating: null}]} },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/hN-WkBw_PRs/intro.jpg', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/hN-WkBw_PRs.json', confidence: 'high' }
});
