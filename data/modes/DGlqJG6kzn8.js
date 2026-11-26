/* Can I BEAT Seirawan Chess?  S-Chess vs online humans: each side keeps a Hawk (bishop + knight, he also calls it the
   Eagle) and an Elephant (rook + knight) in reserve and may gate one onto the square a back-rank piece vacates on its
   first move. Sources: research/modes/DGlqJG6kzn8.json (0:01 rules, 0:33 vacated-square drop, 8:06 restriction,
   19:02 promotes to elephant, 20:33 elephant + eagle mate). Gating via js/modes/g5_seirawan.js (picker on the
   destination square: the moving piece itself = no gate). Gating while castling goes on the king's square only. */
CM.mode({
  id: 'DGlqJG6kzn8',
  title: 'Can I BEAT Seirawan Chess?',
  name: 'Seirawan Chess',
  category: 'Variants & Games',
  description: 'Normal chess plus a Hawk (bishop + knight) and an Elephant (rook + knight) in reserve. When a back-rank piece moves for the first time you may drop a reserve piece onto the square it just left: the picker appears, choose the moving piece itself to skip. Reserves left over once every back-rank piece has moved are lost.',
  how_to_win: 'Checkmate. Pawns may also promote to a Hawk or an Elephant.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'S-Chess opponent', rating: 1500, tagline: 'Online Seirawan Chess player on chess.com.' },
  board: { files: 8, ranks: 8, light: '#ebecd0', dark: '#739552' },
  pieces: {
    H: { img: { w: 'assets/img/fairy/hawk_w.png', b: 'assets/img/fairy/hawk_b.png' },  name: 'Hawk', moves: 'BN', value: 760 },
    E: { img: { w: 'assets/img/fairy/elephant_w.png', b: 'assets/img/fairy/elephant_b.png' },  name: 'Elephant', moves: 'RN', value: 860 }
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { res: { w: 'HE', b: 'HE' } } },
  rules: { promotion: { choices: ['Q', 'N', 'R', 'B', 'H', 'E'] } },
  bot: { engine: 'search', elo: 1500, depth: 3, time_ms: 750 },
  clock: { w: 600, b: 600, inc: 0, bot: false },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/DGlqJG6kzn8/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: 'g5_seirawan',
  source: { research: 'research/modes/DGlqJG6kzn8.json', confidence: 'high', notes: 'Opponents are unnamed humans; rating 1500 assumed. Clock length not stated (10 min assumed).' }
});
