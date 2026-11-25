/* Can I MASTER Ouroboros King?  Ouroboros King roguelite run through Kingdom of Thessalonia and the Marsh of Madness to the Ouroboros Queen boss.
   Sources: research/modes/_RFXN1Ye3sY.json (unit texts from the cards in frames, relics, node map), board colours from
   frames (#c2c7da / #323f55, pink enemy zone). Logic in js/modes/g5_ouro.js. PASS 1: battles only (no node map,
   shop, Armory upgrades or rewinds beyond Undo); units drawn with standard pieces + badges. */
CM.mode({
  id: '_RFXN1Ye3sY',
  title: 'Can I MASTER Ouroboros King?',
  name: 'Ouroboros King: Master',
  category: 'Variants & Games',
  description: 'A chess roguelite: your King leads a small drafted army through a run of battles on a 6x8 board. No check: kings are captured. Portal Mage (M) teleports to any empty square but only kills next to itself; Reaper (Re) steps like a king and also kills any non-royal enemy on a tile of its own colour; Viking (V) takes up to two orthogonal steps; Marching Pawns move two forward or one diagonally forward and kill diagonally. The Finisher relic: if the enemy leader stands alone while you still have units, you win. Lose a battle and the run restarts.',
  how_to_win: 'Capture the enemy leader in every battle of the run (or leave it alone with The Finisher).',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'Ouroboros Army', rating: null, avatar: 'assets/modes/_RFXN1Ye3sY/queen_face.png', tagline: 'Thessalonia soldiers, marsh warbands and the Ouroboros Queen.' },
  board: { files: 6, ranks: 8, light: '#c2c7da', dark: '#323f55' },
  theme: { background: '#14202c' },
  pieces: {
    K: { name: 'King', moves: 'K', royal: true, castle: false, value: 0, img: { w: 'assets/modes/JAz_qMQpI1o/king_w.png', b: 'assets/modes/JAz_qMQpI1o/king_b.png' } },   /* unit icons cut from the video's board (tools/g5_art4.py) */
    G: { name: 'General', moves: 'K', royal: true, castle: false, value: 0, img: { w: 'assets/modes/JAz_qMQpI1o/general_w.png', b: 'assets/modes/JAz_qMQpI1o/general_b.png' } },
    Q: { name: 'Glass Queen', moves: 'Q', value: 900, img: { w: 'assets/modes/JAz_qMQpI1o/glass_queen_w.png', b: 'assets/modes/JAz_qMQpI1o/glass_queen_b.png' } },   /* cut from the _RFXN1Ye3sY 3:43 frame; black = fill/outline swap (inferred) */
    P: { name: 'Marching Pawn', moves: 'fmnDfF', pawn: true, promote: true, promoteTo: ['Q'], value: 120 },
    M: { name: 'Portal Mage', moves: '', gen: 'portal', value: 350, img: { w: 'assets/modes/JAz_qMQpI1o/mage_w.png', b: 'assets/modes/JAz_qMQpI1o/mage_b.png' } },
    E: { name: 'Reaper', moves: '', gen: 'reaper', value: 450, img: { w: 'assets/modes/JAz_qMQpI1o/reaper_w.png', b: 'assets/modes/JAz_qMQpI1o/reaper_b.png' } },
    I: { name: 'Prince', moves: 'K', value: 300, glyph: 'K', badge: 'Pr' },
    V: { name: 'Viking', moves: 'WFnD', value: 330, img: { w: 'assets/modes/JAz_qMQpI1o/viking_w.png', b: 'assets/modes/JAz_qMQpI1o/viking_b.png' } },
    R: { name: 'Rook', value: 500, moves: 'R', castleRook: false, img: { w: 'assets/modes/JAz_qMQpI1o/rook_w.png', b: 'assets/modes/JAz_qMQpI1o/rook_b.png' } },
    N: { name: 'Knight', value: 300, moves: 'N', img: { w: 'assets/modes/JAz_qMQpI1o/knight_w.png', b: 'assets/modes/JAz_qMQpI1o/knight_b.png' } },
    U: { name: 'Soldier', moves: 'K', value: 200, glyph: 'P', badge: 'S' },
    O: { name: 'Ouroboros Queen', moves: 'QN', royal: true, value: 0, img: 'assets/modes/_RFXN1Ye3sY/queen_face.png', badge: '' }
  },
  setup: { fen: 'u1g1u1/6/1uuuu1/6/6/6/1PPPP1/1RKMN1' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { auto: 'Q', choices: ['Q'] }, drawPlies: 120, win: [] },
  bot: { engine: 'search', depth: 3, time_ms: 600 },
  params: {
    enemyRows: 2, victoryImg: 'assets/modes/_RFXN1Ye3sY/victory.jpg',   /* the VICTORY banner from this video (frame 19:25) */ princeType: 'I', glassType: 'Q',
    battles: [
      { region: 'Kingdom of Thessalonia', name: 'Training skirmish', fen: 'u1g1u1/6/1uuuu1/6/6/6/1PPPP1/1RKMN1' },
      { region: 'Marsh of Madness', name: 'Bog patrol', fen: '1vgv2/1uuuu1/6/6/6/6/1PPPP1/1MKQV1' },
      { region: 'Marsh of Madness', name: 'Marsh warband', fen: 'rngnr1/uuuuuu/6/6/6/6/PPPPPP/RMKQVN' },
      { region: 'Marsh of Madness', name: 'The Ouroboros Queen', fen: 'rnobnr/uuuuuu/6/6/6/6/PPPPPP/RMKQEN', boss: 'Ouroboros Queen' }
    ]
  },
  hooks: 'g5_ouro',
  todo_pass2: ['unit icons still missing: Prince, Marching Pawn, Soldier (not in either Ouroboros video: the transcripts only name the Princess; their recruit/board frames show other units)', 'boss intro dialogue', 'node map (Training Grounds, Ruins, Armory, shop, battles)', 'relic bar (The Finisher, Alarm Bell, Ouroboros Sigil) and rewind counter', 'Fool unit (copies the last enemy move pattern)', 'unit cards with gold costs'],
  source: { research: 'research/modes/_RFXN1Ye3sY.json', confidence: 'medium', notes: 'Battle armies and the 6x8 size are inferred from frames; real runs draft units between battles.' }
});
