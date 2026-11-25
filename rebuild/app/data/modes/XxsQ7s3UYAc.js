/* Can I BEAT Infinite Chess?  infinitechess.org (by Naviary) practice checkmates: normal chess rules on an unbounded
   board, White's pieces against a lone bot-controlled king that runs away; easy levels K+2Q, three rooks, Q+R+B, then
   harder ones with fairy pieces (K+Amazon). Sources: research/modes/XxsQ7s3UYAc.json, rules.jsonl (K+2Q, K+Amazon),
   frames (beige/brown board #fcd9ab/#dcb07d, "Your move", edge arrows). The engine's maximum board is 32x32, so the
   "infinite" board is a 32x32 field seen through a 10x10 window that follows the enemy king (the edges are far away
   but exist: inferred simplification). Levels via js/modes/g5_levels.js. */
CM.mode({
  id: 'XxsQ7s3UYAc',
  title: 'Can I BEAT Infinite Chess?',
  name: 'Infinite Chess (Practice Mates)',
  category: 'Variants & Games',
  description: 'Chess on an enormous open board: sliding pieces have practically unlimited range and the lone enemy king will run as far as it can. Box it in by cutting off files and ranks, then mate it. Watch out for stalemate.',
  how_to_win: 'Checkmate the lone king in each practice level (K+2Q, three rooks, Q+R+B, K+Amazon).',
  player_side: 'white',
  opponent: { name: 'Practice bot', rating: null, tagline: 'infinitechess.org practice king: it always runs for open space.' },
  board: { files: 32, ranks: 32, light: '#fcd9ab', dark: '#dcb07d', viewport: { files: 10, ranks: 10, mobile: { files: 8, ranks: 8 }, follow: 'bot_king' } },
  pieces: { M: { name: 'Amazon', moves: 'QN', value: 1200, glyph: 'Q', badge: 'QN' } },
  setup: { fen: '32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/32' },
  rules: { castling: false },
  params: {
    levels: [
      { name: 'King and two queens', fen: '32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/18k13/32/32/32/32/14K1QQ14/32/32/32/32/32/32/32/32/32/32/32' },
      { name: 'Three rooks', fen: '32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/18k13/32/32/32/32/13RRR16/32/32/32/32/32/32/32/32/32/32/32' },
      { name: 'Queen, rook and bishop', fen: '32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/18k13/32/32/32/32/13QRB16/32/32/32/32/32/32/32/32/32/32/32' },
      { name: 'King and Amazon (hard)', fen: '32/32/32/32/32/32/32/32/32/32/32/32/32/32/32/18k13/32/32/32/32/14K1M15/32/32/32/32/32/32/32/32/32/32/32', hint: 'The Amazon moves like a queen and a knight' }
    ]
  },
  bot: { engine: 'search', depth: 3, time_ms: 500 },
  hooks: 'g5_levels',
  source: { research: 'research/modes/XxsQ7s3UYAc.json', confidence: 'medium', notes: 'Finite 32x32 field instead of an unbounded board; level positions are representative, not copied from the site.' }
});
