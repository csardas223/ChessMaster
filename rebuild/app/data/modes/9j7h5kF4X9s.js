/* Can I BEAT Shotgun King? [RANK 4]  Shotgun King: The Final Checkmate (Steam roguelike). You are the lone black King with a shotgun against the
   white army. Sources: research/modes/9j7h5kF4X9s.json, frames visual_* (cream/lavender pixel squares #f2e6ce/#8b86b8 on navy,
   FLOOR counter, shell HUD, red aim cone, threat '!' markers). Rules + floors + cards: js/modes/g4_shotgun.js. */
CM.mode({
  id: '9j7h5kF4X9s',
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/9j7h5kF4X9s/title.png', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card from the video (tools/g4_sprites.py) */
  title: 'Can I BEAT Shotgun King? [RANK 4]',
  name: 'Shotgun King: Rank 4',
  category: 'Other Videos',
  description: 'You are the black King with a shotgun. Each turn either step one square (you cannot capture by moving), or tap a white piece within range to blast a cone of pellets at it: everything in the cone takes damage (pieces have HP shown in red). Shooting uses a shell; stepping reloads one. White moves one piece per turn and captures you if you stand on a square it attacks (marked !). Kill the White King to clear the floor and draw a card. Rank 4: White plays one level smarter and brings an extra pawn each floor. Flashing lights off, default shotgun only.',
  how_to_win: 'Kill the White King on every floor (12 floors).',
  player_side: 'black',
  player: { name: 'Shotgun King', avatar: 'assets/modes/9j7h5kF4X9s/king.png' },
  opponent: { name: 'The White Army', rating: null, tagline: 'Led by the White King.' },
  board: { files: 8, ranks: 8, light: '#f2e6ce', dark: '#8b86b8' },
  theme: { background: '#1d2140', texture: { light: '../assets/modes/9j7h5kF4X9s/tile_light.png', dark: '../assets/modes/9j7h5kF4X9s/tile_dark.png' }  /* url() is resolved from css/ */ },
  pieces: {   /* art-audit 2026-11-25: the game's white army sprites (Shotgun King Wiki, palette-mapped to the videos' cream/navy/lavender;
     shared with pzxXxIsKRRo, tools/audit_sk_wiki.py) instead of the standard set; the black king keeps the lib KING image */
    K: { name: 'King', moves: '', gen: 'skKing', royal: true, castle: false, value: 0, img: { w: 'assets/modes/pzxXxIsKRRo/wK.png' } },
    Q: { img: { w: 'assets/modes/pzxXxIsKRRo/wQ.png' } }, R: { img: { w: 'assets/modes/pzxXxIsKRRo/wR.png' } }, B: { img: { w: 'assets/modes/pzxXxIsKRRo/wB.png' } }, N: { img: { w: 'assets/modes/pzxXxIsKRRo/wN.png' } }, P: { img: { w: 'assets/modes/pzxXxIsKRRo/wP.png' } }
  },
  setup: { fen: '4k3/8/8/8/8/8/8/4K3', turn: 'b' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { auto: 'Q', choices: ['Q'] }, drawPlies: 400 },
  bot: { engine: 'search', depth: 3, time_ms: 700 },
  params: { rank: 4, floors: 12 },
  hooks: 'g4_shotgun',
  source: { research: 'research/modes/9j7h5kF4X9s.json', confidence: 'medium', notes: 'HP values, cone width, damage falloff and the card effects are inferred approximations; floors are generated with random holes (the game uses hand-made irregular floors). Pass 2 art/UI: see js/modes/g4_shotgun.js header. Art-audit 2026-11-25: white army = the game sprites from the Shotgun King Wiki (https://static.wikia.nocookie.net/shotgun-king/images/{1/1d/King,a/ab/Queen,1/1b/Rook,f/f0/Bishop,6/6b/Knight,f/f4/Pawn}.png, CC-BY-SA), same art as the video, palette-mapped.' }
});
