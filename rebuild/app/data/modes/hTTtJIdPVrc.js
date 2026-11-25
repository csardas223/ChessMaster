/* Can I SURVIVE Spell Chess?  chess.com Spell Chess vs online humans (~1500-1630): standard chess plus 2 Jump spells and
   5 Freeze spells each. Freeze immobilises a 3x3 area for the opponent's next turn; Jump lets a piece jump over one
   piece. Each spell recharges for three turns. King capture decides. Shared logic: js/modes/g6_spellc.js.
   Sources: research/modes/hTTtJIdPVrc.json (transcript ~3:12, ~12:20), frames (potion inventory, orange spell circles). */
CM.mode({
  id: 'hTTtJIdPVrc',
  name: 'Spell Chess',
  category: 'Variants & Games',
  description: 'Normal chess plus spells. Freeze (×5): tap the Freeze button, then a square; pieces in that 3x3 area cannot move on your opponent\'s next turn. Jump (×2): a rook, bishop or queen may jump over one piece on its line (shown as extra legal moves). A spell needs three turns to recharge. There is no check: you win by capturing the king.',
  how_to_win: 'Capture the enemy king.',
  player_side: 'white',
  opponent: { name: '12305678A', rating: 1630, avatar: null, tagline: 'Online Spell Chess player.' },
  board: { files: 8, ranks: 8, light: '#ecf1d1', dark: '#7a9f58' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { check: 'none' },
  clock: { w: 300, b: 300, inc: 0 },
  bot: { engine: 'search', elo: 1630, depth: 3, time_ms: 800 },
  hooks: 'g6_spellc',
  params: { jump: 2, freeze: 5, cooldown: 3, botFreeze: 0.4 },
  source: { research: 'research/modes/hTTtJIdPVrc.json', confidence: 'high', notes: 'Jump modelled as sliders passing through one piece; freeze cast via a button before your move.' }
});
