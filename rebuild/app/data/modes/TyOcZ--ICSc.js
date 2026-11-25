/* Can I SURVIVE Paradigm Chess?  Paradigm30 vs higher-rated humans, three wins wanted: Dragon Bishops with a lame knight move and a 960-style scrambled start.
   Sources: research/modes/TyOcZ--ICSc.json (transcript rule explanation), frames (GOLDMEN 1754/1759, user ~1611-1621, orange arrows). Dragon Bishop = type D 'BnN' (lame knight leg = the orthogonal step); js/modes/g5_dragon.js
   turns the bishops into dragons after the Chess960 shuffle. */
CM.mode({
  id: 'TyOcZ--ICSc',
  title: 'Can I SURVIVE Paradigm Chess?',
  name: 'Paradigm Chess',
  category: 'Variants & Games',
  description: 'Paradigm30: bishops become Dragon Bishops (bishop + a knight move that cannot jump: one square orthogonally, then one diagonally outward, blocked if that first square is occupied). The back rank is scrambled Chess960-style, mirrored for both sides.',
  how_to_win: 'Checkmate a much higher-rated opponent. You play Black.',
  player_side: 'black',
  player: { name: 'You', rating: 1611, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { name: 'GOLDMEN', rating: 1759, tagline: 'Paradigm30 opponent on chess.com.' },
  board: { files: 8, ranks: 8, light: '#ecf2d1', dark: '#76a057' },
  pieces: {
    D: { name: 'Dragon Bishop', moves: 'BnN', value: 620, img: { w: 'assets/modes/HtNZ9DTxHUs/dragon_w.png', b: 'assets/modes/HtNZ9DTxHUs/dragon_b.png' } }
  },
  setup: { random: 'chess960' },
  rules: { promotion: { choices: ['Q', 'N', 'R', 'D'] } },
  bot: { engine: 'search', elo: 1759, depth: 4, time_ms: 750 },
  clock: { w: 180, b: 180, inc: 0, bot: false },
  hooks: 'g5_dragon',
  source: { research: 'research/modes/TyOcZ--ICSc.json', confidence: 'high', notes: 'Promotion to a Dragon Bishop offered (Paradigm30). Clock ~3 min inferred.' }
});
