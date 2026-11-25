/* Can I SURVIVE Spell Chess? (second video)  chess.com Spell Chess vs higher-rated humans (~1800-2200): standard chess plus 2 Jump spells and
   5 Freeze spells each. Freeze immobilises a 3x3 area for the opponent's next turn; Jump lets a piece jump over one
   piece. Each spell recharges for three turns. King capture decides. Shared logic: js/modes/g6_spellc.js.
   Sources: research/modes/q_153NJxO1M.json (he loses game 1 to a 2200 jump-spell trick; you cannot use the same spell twice in a row). */
CM.mode({
  id: 'q_153NJxO1M',
  name: 'Spell Chess',
  category: 'Variants & Games',
  description: 'Normal chess plus spells. Freeze (×5): tap the Freeze button, then a square; pieces in that 3x3 area cannot move on your opponent\'s next turn. Jump (×2): a rook, bishop or queen may jump over one piece on its line (shown as extra legal moves). A spell needs three turns to recharge. There is no check: you win by capturing the king.',
  how_to_win: 'Capture the enemy king.',
  player_side: 'white',
  player: { name: 'ireallywantcheckmate', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's chess.com handle + purple-king avatar from the frames */
  opponent: { name: 'YyChroniX', rating: 1767, avatar: 'assets/modes/q_153NJxO1M/opp1.png', tagline: 'Knows the jump-spell king trap.' },
  board: { files: 8, ranks: 8, light: '#ecf1d1', dark: '#7a9f58' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { check: 'none' },
  clock: { w: 300, b: 300, inc: 0 },
  bot: { engine: 'search', elo: 2100, depth: 3, time_ms: 800 },
  hooks: 'g6_spellc',
  params: { jump: 2, freeze: 5, cooldown: 3, botFreeze: 0.55 },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/q_153NJxO1M/intro.jpg', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/q_153NJxO1M.json', confidence: 'high', notes: 'Jump modelled as sliders passing through one piece; freeze cast via a button before your move. art-audit-b: chess.com default avatar swapped for the exact same art at 256px (https://www.chess.com/bundles/web/images/user-image.007dad08.svg), tone-matched to the video crop.' }
});
