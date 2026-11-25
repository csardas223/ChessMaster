/* Can I MASTER Dragon Bishop Chess?  five online Dragon Bishop games vs ~1500 humans at 3 minutes; orange knight-leap and diagonal arrows from the dragons.
   Sources: research/modes/R8gZYKtr-C4.json, frames (kuba_121_1 1524, khoaisga 1498, orange arrows, 1-5 counter). Dragon Bishop = type D 'BnN' (lame knight leg = the orthogonal step); js/modes/g5_dragon.js
   turns the bishops into dragons. */
CM.mode({
  id: 'R8gZYKtr-C4',
  title: 'Can I MASTER Dragon Bishop Chess?',
  name: 'Dragon Bishop Chess (Master)',
  category: 'Variants & Games',
  description: 'Every bishop is a winged Dragon Bishop: it moves as a bishop or as a knight, but the knight move cannot jump. A piece on the orthogonal square next to it on the way blocks the leap.',
  how_to_win: 'Checkmate. Goal: five wins against ~1500 players on 3-minute clocks.',
  player_side: 'white',
  player: { name: 'You', rating: 1495 },
  opponent: { name: 'kuba_121_1', rating: 1524, tagline: 'Dragon Bishop opponent on chess.com.' },
  board: { files: 8, ranks: 8, light: '#ECF2D1', dark: '#7BA059' },
  pieces: {
    D: { name: 'Dragon Bishop', moves: 'BnN', value: 620, img: { w: 'assets/modes/HtNZ9DTxHUs/dragon_w.png', b: 'assets/modes/HtNZ9DTxHUs/dragon_b.png' } }
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { promotion: { choices: ['Q', 'N', 'R', 'D'] } },
  bot: { engine: 'search', elo: 1524, depth: 4, time_ms: 750 },
  clock: { w: 180, b: 180, inc: 0, bot: false },
  hooks: 'g5_dragon',
  source: { research: 'research/modes/R8gZYKtr-C4.json', confidence: 'high', notes: 'Spec infers a plain bishop + knight; chess.com Dragon Bishop rules (and the sister videos HtNZ9DTxHUs/TyOcZ--ICSc) make the knight move non-leaping, used here. Standard start (no shuffle) per the frames back rank.' }
});
