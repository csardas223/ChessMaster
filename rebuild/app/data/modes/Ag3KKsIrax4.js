/* Can I BEAT Spell Chess?  First chess.com Spell Chess video: Jump and Freeze spells, recharge, not twice in a row; he
   goes 3-1 over four games vs online opponents up to 1800. Sources: research/modes/Ag3KKsIrax4.json.
   Rules via js/modes/g6_spellc.js (read-only reuse). */
CM.mode({
  id: 'Ag3KKsIrax4',
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/Ag3KKsIrax4/intro.png', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card from the video (tools/g4_sprites.py) */
  title: 'Can I BEAT Spell Chess?',
  name: 'Spell Chess',
  category: 'Variants & Games',
  description: 'Normal chess plus spells. Freeze (x5): tap the Freeze button, then a square; pieces in that 3x3 area cannot move on your opponent\'s next turn. Jump (x2): a rook, bishop or queen may jump over one piece on its line. Each spell needs three turns to recharge. No check: capture the king to win.',
  how_to_win: 'Capture the enemy king.',
  player_side: 'white',
  opponent: { name: 'Spell Chess player', rating: 1800, tagline: 'Online opponent (up to 1800).' },
  board: { files: 8, ranks: 8, light: '#86c42b', dark: '#6ea122' },
  theme: { texture: { light: '../assets/modes/Ag3KKsIrax4/grass_light.png', dark: '../assets/modes/Ag3KKsIrax4/grass_dark.png' } },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { check: 'none' },
  clock: { w: 300, b: 300, inc: 0 },
  bot: { engine: 'search', elo: 1800, depth: 3, time_ms: 800 },
  params: { jump_arrow: true, opponents: [{ name: 'TheZest12', rating: 1423 }, { name: 'iushman', rating: 1860 }], jump: 2, freeze: 5, cooldown: 3, botFreeze: 0.4, icon_freeze: 'assets/modes/Ag3KKsIrax4/freeze.png', icon_jump: 'assets/modes/Ag3KKsIrax4/jump.png' },
  hooks: 'g6_spellc',
  source: { research: 'research/modes/Ag3KKsIrax4.json', confidence: 'high', notes: 'Opponent name generic (not given); rating 1800 = upper bound stated.' }
});
