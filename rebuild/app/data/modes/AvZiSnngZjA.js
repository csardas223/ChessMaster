/* Can I BEAT Shotgun King?  Shotgun King: The Final Checkmate (Steam roguelike). You are the lone black King with a shotgun against the
   white army. Sources: research/modes/AvZiSnngZjA.json, frames visual_* (cream/lavender pixel squares #f8e6cb/#9887b3 on navy,
   FLOOR counter, shell HUD, red aim cone, threat '!' markers). Rules + floors + cards: js/modes/g4_shotgun.js. */
CM.mode({
  id: 'AvZiSnngZjA',
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/AvZiSnngZjA/king.png', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card from the video (tools/g4_sprites.py) */
  title: 'Can I BEAT Shotgun King?',
  name: 'Shotgun King',
  category: 'Other Videos',
  description: 'You are the black King with a shotgun. Each turn either step one square (you cannot capture by moving), or tap a white piece within range to blast a cone of pellets at it: everything in the cone takes damage (pieces have HP shown in red). Shooting uses a shell; stepping reloads one. White moves one piece per turn and captures you if you stand on a square it attacks (marked !). Kill the White King to clear the floor and draw a card. Throne mode: climb the castle floor by floor (goal: floor 12). Tutorial lesson: avoid the white bishop and keep your shotgun loaded.',
  how_to_win: 'Kill the White King on every floor (12 floors).',
  player_side: 'black',
  player: { name: 'Shotgun King', avatar: 'assets/modes/AvZiSnngZjA/king.png' },
  opponent: { name: 'The White Army', rating: null, tagline: 'Led by the White King.' },
  board: { files: 8, ranks: 8, light: '#f8e6cb', dark: '#9887b3' },
  theme: { background: '#1d2140', texture: { light: '../assets/modes/9j7h5kF4X9s/tile_light.png', dark: '../assets/modes/9j7h5kF4X9s/tile_dark.png' }  /* url() is resolved from css/ */ },
  pieces: { K: { name: 'King', moves: '', gen: 'skKing', royal: true, castle: false, value: 0 } },
  setup: { fen: '4k3/8/8/8/8/8/8/4K3', turn: 'b' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { auto: 'Q', choices: ['Q'] }, drawPlies: 400 },
  bot: { engine: 'search', depth: 2, time_ms: 450 },
  params: { rank: 1, floors: 12 },
  hooks: 'g4_shotgun',
  source: { research: 'research/modes/AvZiSnngZjA.json', confidence: 'medium', notes: 'HP values, cone width, damage falloff and the card effects are inferred approximations; floors are generated with random holes (the game uses hand-made irregular floors). Pass 2 art/UI: see js/modes/g4_shotgun.js header.' }
});
