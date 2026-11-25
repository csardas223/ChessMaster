/* Can I MASTER Fog of War Chess?  chess.com Fog of War: you only see your own pieces and the squares they can move to (enemy pieces included when
   you could capture them); everything else is under a grey cloud. There is no check: kings may move into danger and the
   game ends when a king is captured. Sources: research/modes/nXpanP8v3pg.json (fog cloud over unseen squares, king capture,
   fog lifted at the end for the replay). */
CM.mode({
  id: 'nXpanP8v3pg',
  name: 'Fog of War',
  category: 'Variants & Games',
  description: 'You can only see your own pieces and the squares they could move to. Everything else is hidden in fog, including most of the enemy army. There is no check or checkmate: kings can walk into danger, and whoever captures the enemy king wins.',
  how_to_win: 'Capture the enemy king.',
  player_side: 'white',
  opponent: { name: 'RobJo94', rating: 1600, avatar: null, tagline: 'Hidden somewhere in the fog.' },
  board: { files: 8, ranks: 8, light: '#ebf3d0', dark: '#7b9e58' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { fog: true, check: 'none' },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'search', elo: 1600, depth: 3, time_ms: 700 },
  messages: { win: 'you captured the king', loss: 'your king was captured' },
  /* impl-6 art: fog squares use the video's grey cloud tile (assets/modes/nXpanP8v3pg/fog.jpg, frame crop, tools/g6_frames19.py) */
  hooks: {
    onStart: function () {
      if (!document.getElementById('g6fog-css')) { var c = document.createElement('style'); c.id = 'g6fog-css'; c.textContent = 'body.g6fog .sq.is-fog{background:url(assets/modes/nXpanP8v3pg/fog.jpg) center/cover}'; document.head.appendChild(c); }
      document.body.classList.add('g6fog');
    },
    onExit: function () { document.body.classList.remove('g6fog'); }
  },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/nXpanP8v3pg/intro.jpg', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/nXpanP8v3pg.json', confidence: 'high', notes: 'The bot sees the whole board.' }
});
