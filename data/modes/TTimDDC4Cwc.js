/* Can I MASTER Seirawan Chess?  S-Chess revisited vs online humans incl. a FIDE Master (1900): Hawk (bishop + knight)
   and Elephant (rook + knight) in reserve, gated onto the square a back-rank piece vacates on its first move.
   Sources: research/modes/TTimDDC4Cwc.json, frames visual (#ebf2d0/#7b9d58, reserve icons by the board, 3-min clocks,
   1-5 round counter). Gating via js/modes/g5_seirawan.js. */
CM.mode({
  id: 'TTimDDC4Cwc',
  title: 'Can I MASTER Seirawan Chess?',
  name: 'Seirawan Chess (Master)',
  category: 'Variants & Games',
  description: 'S-Chess: each side holds a Hawk (bishop + knight) and an Elephant (rook + knight). When a back-rank piece makes its first move you may place one reserve piece on the square it left (pick the moving piece itself in the picker to skip). Once every original back-rank piece has moved, unused reserves are gone.',
  how_to_win: 'Checkmate a FIDE Master on a 3-minute clock.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'FM opponent', rating: 1900, tagline: 'Titled S-Chess player (FM) on chess.com.' },
  board: { files: 8, ranks: 8, light: '#ebf2d0', dark: '#7b9d58' },
  pieces: {
    H: { img: { w: 'assets/img/fairy/hawk_w.png', b: 'assets/img/fairy/hawk_b.png' }, name: 'Hawk', moves: 'BN', value: 760 },
    E: { name: 'Elephant', moves: 'RN', value: 860, glyph: 'R', badge: null, img: { w: 'assets/img/fairy/elephant_w.png', b: 'assets/img/fairy/elephant_b.png' } }
  },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { res: { w: 'HE', b: 'HE' } } },
  rules: { promotion: { choices: ['Q', 'N', 'R', 'B', 'H', 'E'] } },
  bot: { engine: 'search', elo: 1900, depth: 4, time_ms: 900 },
  clock: { w: 180, b: 180, inc: 0, bot: false },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/img/fairy/hawk_w.png', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: 'g5_seirawan',
  source: { research: 'research/modes/TTimDDC4Cwc.json', confidence: 'high', notes: 'FM username not legible; shown as "FM opponent".' }
});
