/* Can I Beat EVEN MORE Dice Chess?: Dice Chess on a dice-chess site vs online humans. Three piece dice per turn, one move per die,
   no check, capture the king to win. Shared rules in js/modes/g1_dice.js.
   Sources: research/modes/OcWzHqqeLNg.json, frames research/frames/visual_*.jsonl (wood board #debaa2/#a27e66, three red
   piece dice, ROLL button, 'YOU WIN King captured' popup). Inferred: dice roll automatically (no ROLL button press),
   no clocks, coin stakes left out. */
CM.mode({
  id: 'OcWzHqqeLNg',
  name: 'Dice Chess',
  category: 'Dice Chess',
  description: 'Every turn three dice are rolled, each showing a piece type. Make one move per die with a piece of that type (the same piece can use several dice). Unusable dice are skipped. There is no check: kings can be left hanging. Castling needs a king and a rook die.',
  how_to_win: 'Capture the enemy king.',
  player_side: 'white',
  opponent: { name: "Annachess2001", rating: null, avatar: 'assets/avatars/bot.svg', tagline: 'Dice Chess player from the video.' },
  board: { files: 8, ranks: 8 },
  theme: { light: '#debaa2', dark: '#a27e66', background: '#22382b' },
  rules: { check: 'none', castling: true, enPassant: true, promotion: { choices: ['Q', 'R', 'B', 'N'] }, drawPlies: 300 },
  bot: { engine: 'search', elo: 1500, depth: 3, time_ms: 600, min_ms: 420 },
  messages: { win: 'King captured', win_title: 'You Win', loss: 'your king was captured', loss_title: 'You Lose' },
  hooks: 'g1_dice',
  source: { research: 'research/modes/OcWzHqqeLNg.json', confidence: 'medium', notes: 'Shared dice rules; per-video differences are only the opponent and side.' }
});
