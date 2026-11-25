/* Can I MASTER Spell Chess?  chess.com Spell Chess vs online humans up to 1700 (goal: five wins; fifth in game 6).
   Jump spell (one piece may be jumped over), Freeze spell (3x3 area cannot move), three-turn recharge, never the same
   spell twice in a row, limited charges, king capture decides. Sources: research/modes/8CtX9G07bMU.json (bright green
   board #86c42b/#6ea122). Rules via js/modes/g6_spellc.js (read-only reuse). */
CM.mode({
  id: '8CtX9G07bMU',
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/8CtX9G07bMU/intro.png', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card from the video (tools/g4_sprites.py) */
  title: 'Can I MASTER Spell Chess?',
  name: 'Spell Chess: Master',
  category: 'Variants & Games',
  description: 'Normal chess plus spells. Freeze (x5): tap the Freeze button, then a square; pieces in that 3x3 area cannot move on your opponent\'s next turn. Jump (x2): a rook, bishop or queen may jump over one piece on its line. Each spell needs three turns to recharge. No check: capture the king to win.',
  how_to_win: 'Capture the enemy king. Goal: five wins.',
  player_side: 'white',
  opponent: { name: 'armanohzs', rating: 1600, tagline: 'Online Spell Chess player.' },
  board: { files: 8, ranks: 8, light: '#86c42b', dark: '#6ea122' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { check: 'none' },
  clock: { w: 300, b: 300, inc: 0 },
  bot: { engine: 'search', elo: 1600, depth: 3, time_ms: 800 },
  params: { jump: 2, freeze: 5, cooldown: 3, botFreeze: 0.4, icon_freeze: 'assets/modes/8CtX9G07bMU/freeze.png', icon_jump: 'assets/modes/8CtX9G07bMU/jump.png' },
  hooks: 'g6_spellc',
  source: { research: 'research/modes/8CtX9G07bMU.json', confidence: 'high', notes: 'Board colours from spec sample (may be a spell-tinted frame; re-check).' },
  todo_pass2: ['verify board colours vs frames', 'win counter to 5', 'spell VFX (freeze ice, jump arc)']
});
