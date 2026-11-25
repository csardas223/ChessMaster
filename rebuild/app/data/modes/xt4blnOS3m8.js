/* Can I BEAT Fog of War Chess?  chess.com Fog of War: you only see your own pieces and the squares they can move to (enemy pieces included when
   you could capture them); everything else is under a grey cloud. There is no check: kings may move into danger and the
   game ends when a king is captured. Sources: research/modes/xt4blnOS3m8.json (fog cloud over unseen squares, king capture,
   fog lifted at the end for the replay). */
CM.mode({
  id: 'xt4blnOS3m8',
  name: 'Fog of War',
  category: 'Variants & Games',
  description: 'You can only see your own pieces and the squares they could move to. Everything else is hidden in fog, including most of the enemy army. There is no check or checkmate: kings can walk into danger, and whoever captures the enemy king wins.',
  how_to_win: 'Capture the enemy king.',
  player_side: 'white',
  player: { name: 'ireallywantcheckmate', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's chess.com handle + purple-king avatar from the frames */
  opponent: { name: 'piethegod', rating: 1488, avatar: 'assets/modes/xt4blnOS3m8/opp1.png', tagline: 'Hidden somewhere in the fog.' },
  board: { files: 8, ranks: 8, light: '#ebecd0', dark: '#739552' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { fog: true, check: 'none' },
  clock: { w: 180, b: 180, inc: 0 },
  bot: { engine: 'search', elo: 1550, depth: 3, time_ms: 700 },
  messages: { win: 'you captured the king', loss: 'your king was captured' },
  /* impl-6: in this video's frames the fog is not drawn: unseen squares keep the normal board colours and hidden enemy pieces are simply absent */
  params: { series: {opponents: [{name: 'piethegod', rating: 1488, avatar: 'assets/modes/xt4blnOS3m8/opp1.png'}, {name: 'lucifer9l', rating: 1624, avatar: 'assets/modes/xt4blnOS3m8/opp2.png'}], boxes: 5} },
  hooks: {
    onStart: function () {
      if (!document.getElementById('g6nofog-css')) { var c = document.createElement('style'); c.id = 'g6nofog-css'; c.textContent = 'body.g6nofog .sq.is-fog{background:var(--sq-light,#ebecd0)}body.g6nofog .sq.is-fog.is-dark{background:var(--sq-dark,#739552)}'; document.head.appendChild(c); }
      document.body.classList.add('g6nofog');
    },
    onExit: function () { document.body.classList.remove('g6nofog'); }
  },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/xt4blnOS3m8/intro.jpg', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/xt4blnOS3m8.json', confidence: 'high', notes: 'The bot sees the whole board.' }
});
