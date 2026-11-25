/* Can I BEAT The Dragon Bishop? (Rare Variant)  chess.com Dragon Bishop: bishops replaced by Dragon Bishops (bishop + non-leaping knight), random 960-style back rank, 10-minute games.
   Sources: research/modes/HtNZ9DTxHUs.json (0:01 and 4:27 blocked/allowed squares, 0:34 shuffled back rank, 5:09 long castle, 12:07 wings), frames (BrunTurum, PhilHarris 1698, me 1553-1568). Dragon Bishop = type D 'BnN' (lame knight leg = the orthogonal step); js/modes/g5_dragon.js
   turns the bishops into dragons after the Chess960 shuffle. */
CM.mode({
  id: 'HtNZ9DTxHUs',
  title: 'Can I BEAT The Dragon Bishop? (Rare Variant)',
  name: 'Dragon Bishop (Shuffled)',
  category: 'Variants & Games',
  description: 'Both bishops are Dragon Bishops: they move like a bishop or like a knight, but the knight move cannot jump. It is blocked when the square one step orthogonally toward the target is occupied. The back rank is shuffled Chess960-style (same for both sides).',
  how_to_win: 'Checkmate. Dragons can switch square colour with their knight move.',
  player_side: 'white',
  player: { name: 'You', rating: 1553 },
  opponent: { name: 'PhilHarris', rating: 1698, tagline: 'Dragon Bishop opponent on chess.com (10-minute games).' },
  board: { files: 8, ranks: 8, light: '#EDF1D1', dark: '#7B9F59' },
  pieces: {
    D: { name: 'Dragon Bishop', moves: 'BnN', value: 620, img: { w: 'assets/modes/HtNZ9DTxHUs/dragon_w.svg', b: 'assets/modes/HtNZ9DTxHUs/dragon_b.svg' } }
  },
  setup: { random: 'chess960' },
  rules: { promotion: { choices: ['Q', 'N', 'R', 'D'] } },
  bot: { engine: 'search', elo: 1698, depth: 4, time_ms: 750 },
  clock: { w: 600, b: 600, inc: 0, bot: false },
  hooks: 'g5_dragon',
  source: { research: 'research/modes/HtNZ9DTxHUs.json', confidence: 'high', notes: 'Castling on shuffled starts uses the engine generic rule (king two squares toward the rook). Dragon art is original (assets/modes/HtNZ9DTxHUs).' }
});
