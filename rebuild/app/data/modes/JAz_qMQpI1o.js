/* Can I DEFEAT Ouroboros King?  Ouroboros King run up the Ridge of Ruin to the final trio of Ouroboros bosses.
   Sources: research/modes/JAz_qMQpI1o.json (unit texts from the cards in frames, relics, node map), board colours from
   frames (#c2c7da / #323f55, pink enemy zone). Logic in js/modes/g5_ouro.js. PASS 1: battles only (no node map,
   shop, Armory upgrades or rewinds beyond Undo); units drawn with standard pieces + badges. */
CM.mode({
  id: 'JAz_qMQpI1o',
  title: 'Can I DEFEAT Ouroboros King?',
  name: 'Ouroboros King: Defeat',
  category: 'Variants & Games',
  description: 'A chess roguelite run up the Ridge of Ruin: your King and drafted army fight battle after battle on a 6x8 board. No check: kings are captured. The enemy is led by a General (G); the final battle has three Ouroboros bosses, all must fall. Prince (Pr): your king cannot be taken while within 3 squares of him. Portal Mage teleports and kills adjacent; Reaper kills non-royal enemies on its own tile colour; Glass Queen never returns once she dies. The Finisher: an enemy leader left alone means you win.',
  how_to_win: 'Capture the enemy leader in every battle of the run (or leave it alone with The Finisher).',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'Ouroboros Army', rating: null, avatar: 'assets/modes/JAz_qMQpI1o/final_bosses.png', tagline: 'Ridge of Ruin generals and the final Ouroboros trio.' },
  board: { files: 6, ranks: 8, light: '#c2c7da', dark: '#323f55' },
  theme: { background: '#14202c' },
  pieces: {
    K: { name: 'King', moves: 'K', royal: true, castle: false, value: 0, img: { w: 'assets/modes/JAz_qMQpI1o/king_w.png', b: 'assets/modes/JAz_qMQpI1o/king_b.png' } },   /* unit icons cut from the video's board (tools/g5_art4.py) */
    G: { name: 'General', badge: '' /* no built-in fairy badge over the video icon */, moves: 'K', royal: true, castle: false, value: 0, img: { w: 'assets/modes/JAz_qMQpI1o/general_w.png', b: 'assets/modes/JAz_qMQpI1o/general_b.png' } },
    Q: { name: 'Glass Queen', moves: 'Q', value: 900, img: { w: 'assets/modes/JAz_qMQpI1o/glass_queen_w.png', b: 'assets/modes/JAz_qMQpI1o/glass_queen_b.png' } },   /* cut from the _RFXN1Ye3sY 3:43 frame; black = fill/outline swap (inferred) */
    P: { name: 'Marching Pawn', moves: 'fmWfmnDfF' /* card: 'Move up to 2 squares forward or 1 square diagonally forward, can only kill diagonally' (rf2HSTXTehE 1:10) */, pawn: true, promote: true, promoteTo: ['Q'], value: 120, img: { w: 'assets/modes/JAz_qMQpI1o/marching_pawn_w.png', b: 'assets/modes/JAz_qMQpI1o/marching_pawn_b.png' } },   /* recruit-card icon, rf2HSTXTehE 1:10 frame (tools/g5_art6.py); black = fill/outline swap (inferred) */
    M: { name: 'Portal Mage', badge: '' /* no built-in fairy badge over the video icon */, moves: '', gen: 'portal', value: 350, img: { w: 'assets/modes/JAz_qMQpI1o/mage_w.png', b: 'assets/modes/JAz_qMQpI1o/mage_b.png' } },
    E: { name: 'Reaper', badge: '' /* no built-in fairy badge over the video icon */, moves: '', gen: 'reaper', value: 450, img: { w: 'assets/modes/JAz_qMQpI1o/reaper_w.png', b: 'assets/modes/JAz_qMQpI1o/reaper_b.png' } },
    I: { name: 'Prince', badge: '' /* no built-in fairy badge over the video icon */, moves: 'K', value: 300, img: { w: 'assets/modes/JAz_qMQpI1o/prince_w.png', b: 'assets/modes/JAz_qMQpI1o/prince_b.png' } },   /* laurel-crown recruit-card icon, rf2HSTXTehE 1:22 frame (tools/g5_art6.py) */
    V: { name: 'Viking', moves: 'WFnD', value: 330, img: { w: 'assets/modes/JAz_qMQpI1o/viking_w.png', b: 'assets/modes/JAz_qMQpI1o/viking_b.png' } },
    R: { name: 'Rook', value: 500, moves: 'R', castleRook: false, img: { w: 'assets/modes/JAz_qMQpI1o/rook_w.png', b: 'assets/modes/JAz_qMQpI1o/rook_b.png' } },
    N: { name: 'Knight', value: 300, moves: 'N', img: { w: 'assets/modes/JAz_qMQpI1o/knight_w.png', b: 'assets/modes/JAz_qMQpI1o/knight_b.png' } },
    O: { name: 'Ouroboros Queen', moves: 'QN', royal: true, value: 0, img: 'assets/modes/_RFXN1Ye3sY/queen_face.png', badge: '' }
  },
  setup: { fen: '1pgp2/pppppp/6/6/6/6/1PPPP1/1RKIV1' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { auto: 'Q', choices: ['Q'] }, drawPlies: 120, win: [] },
  bot: { engine: 'search', depth: 3, time_ms: 600 },
  params: {
    enemyRows: 2, victoryImg: 'assets/modes/JAz_qMQpI1o/victory.jpg',   /* the VICTORY banner from this video (frame 18:07) */ princeType: 'I', glassType: 'Q',
    battles: [
      { region: 'Ridge of Ruin', name: 'Ridge of Ruin - 1', fen: '1pgp2/pppppp/6/6/6/6/1PPPP1/1RKIV1' },
      { region: 'Ridge of Ruin', name: 'Ridge of Ruin - 4', fen: 'rvgvr1/pppppp/6/6/6/6/PPPPPP/RIKQVM' },
      { region: 'Ridge of Ruin', name: 'The Ouroboros trio', fen: 'ro1o1o/pppppp/6/6/6/6/PPPPPP/RIKQEM', boss: 'Ouroboros trio' }
    ]
  },
  hooks: 'g5_ouro',
  _art_notes: 'g5 2026-11-25: the enemy fodder was an invented "Soldier" (no Ouroboros video has one); re-cast as enemy Marching Pawns, a unit the videos show (inferred).',
  todo_pass2: ['boss intro dialogue', 'node map (Training Grounds, Ruins, Armory, shop, battles)', 'relic bar (The Finisher, Alarm Bell, Ouroboros Sigil) and rewind counter', 'Fool unit (copies the last enemy move pattern)', 'unit cards with gold costs'],
  source: { research: 'research/modes/JAz_qMQpI1o.json', confidence: 'medium', notes: 'Battle armies, the 6x8 size and the trio as three royal Ouroboros pieces are inferred.' }
});
