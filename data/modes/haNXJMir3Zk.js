/* Can I GAMBLE Dice Chess?: Dice Chess on a dice-chess site vs online humans. Three piece dice per turn, one move per die,
   no check, capture the king to win. Shared rules in js/modes/g1_dice.js.
   Sources: research/modes/haNXJMir3Zk.json, frames research/frames/visual_*.jsonl (wood board #e0bc9f/#a48063, three red
   piece dice, ROLL button, 'YOU WIN King captured' popup). Inferred: dice roll automatically (no ROLL button press),
   no clocks, coin stakes left out. */
CM.mode({
  id: 'haNXJMir3Zk',
  name: 'Dice Chess',
  category: 'Dice Chess',
  description: 'Every turn three dice are rolled, each showing a piece type. Make one move per die with a piece of that type (the same piece can use several dice). Unusable dice are skipped. There is no check: kings can be left hanging. Castling needs a king and a rook die.',
  how_to_win: 'Capture the enemy king.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Veer2929", rating: null, avatar: 'assets/modes/KJYUsRlj_34/avatar.png', tagline: 'Dice Chess player from the video.' },
  board: { files: 8, ranks: 8 },
  theme: { light: '#e0bc9f', dark: '#a48063', background: '#22382b' },
  rules: { check: 'none', castling: true, enPassant: true, promotion: { choices: ['Q', 'R', 'B', 'N'] }, drawPlies: 300 },
  bot: { engine: 'search', elo: 1500, depth: 3, time_ms: 600, min_ms: 420 },
  sounds: { 'tick': 'assets/modes/B5LGzOEZSyo/dice_roll.wav' },   /* v6 per-mode sound set (tools/sfx/modes_v6.py, wire_v6.py) */
  messages: { win: 'King captured', win_title: 'You Win', loss: 'your king was captured', loss_title: 'You Lose' },
  params: { dieImg: 'assets/modes/haNXJMir3Zk/die.png' },   /* _g1art: video sprites (tools/g1_sprites.py) */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/haNXJMir3Zk/die.png', fit: 'contain', duration_ms: 1400, fade_ms: 250 }],   /* the video's own die (research/frames/sprites) */
  hooks: 'g1_dice',
  source: { research: 'research/modes/haNXJMir3Zk.json', confidence: 'high', notes: 'Shared dice rules; per-video differences are only the opponent and side. art-audit-b: die overlay recut transparent at 256px from research/frames/sprites (<id>_piece_die / infinity_die); old cut kept the magenta background + the black dice behind.' }
});
