/* Can I CRUSH Dragon Bishop Chess? (Paradigm30)  Paradigm30 vs ~2000 humans in bullet, three wins in a row.
   Sources: research/modes/XbCdL3oL_18.json, frames (iWill-win2, user 1684, zoomed dragon inset, bullet clocks). Dragon Bishop = type D 'BnN' (lame knight leg = the orthogonal step); js/modes/g5_dragon.js
   turns the bishops into dragons after the Chess960 shuffle. */
CM.mode({
  id: 'XbCdL3oL_18',
  title: 'Can I CRUSH Dragon Bishop Chess? (Paradigm30)',
  name: 'Dragon Bishop Chess (Paradigm30)',
  category: 'Variants & Games',
  description: 'Paradigm30: both bishops are Dragon Bishops (bishop + knight, but the knight part cannot jump) and the back-rank pieces are shuffled Chess960-style, the same for both sides. Castling is allowed.',
  how_to_win: 'Checkmate. Goal: three wins in a row against ~2000 players.',
  player_side: 'white',
  player: { name: 'You', rating: 1684 },
  opponent: { name: 'iWill-win2', rating: 2000, tagline: 'Paradigm30 opponent on chess.com (bullet).' },
  board: { files: 8, ranks: 8, light: '#ecf2d1', dark: '#7a9f57' },
  pieces: {
    D: { name: 'Dragon Bishop', moves: 'BnN', value: 620, img: { w: 'assets/modes/HtNZ9DTxHUs/dragon_w.svg', b: 'assets/modes/HtNZ9DTxHUs/dragon_b.svg' } }
  },
  setup: { random: 'chess960' },
  rules: { promotion: { choices: ['Q', 'N', 'R', 'D'] } },
  bot: { engine: 'search', elo: 2000, depth: 4, time_ms: 750 },
  clock: { w: 60, b: 60, inc: 0, bot: false },
  hooks: 'g5_dragon',
  source: { research: 'research/modes/XbCdL3oL_18.json', confidence: 'high', notes: 'Bullet clock length assumed 1 minute.' }
});
