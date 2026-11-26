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
    K: { name: 'King', moves: 'K', royal: true, castle: false, value: 0, img: { w: 'assets/modes/_RFXN1Ye3sY/king_w.png', b: 'assets/modes/_RFXN1Ye3sY/king_b.png' } },   /* unit icons cut from the video's board (tools/g5_art4.py) */
    G: { name: 'General', badge: '' /* no built-in fairy badge over the video icon */, moves: 'K', royal: true, castle: false, value: 0, img: { w: 'assets/modes/_RFXN1Ye3sY/general_w.png', b: 'assets/modes/_RFXN1Ye3sY/general_b.png' } },
    Q: { name: 'Glass Queen', moves: 'Q', value: 900, img: { w: 'assets/modes/_RFXN1Ye3sY/glass_queen_w.png', b: 'assets/modes/_RFXN1Ye3sY/glass_queen_b.png' } },   /* cut from the _RFXN1Ye3sY 3:43 frame; black = fill/outline swap (inferred) */
    P: { name: 'Marching Pawn', moves: 'fmWfmnDfF' /* card: 'Move up to 2 squares forward or 1 square diagonally forward, can only kill diagonally' (rf2HSTXTehE 1:10) */, pawn: true, promote: true, promoteTo: ['Q'], value: 120, img: { w: 'assets/modes/_RFXN1Ye3sY/marching_pawn_w.png', b: 'assets/modes/_RFXN1Ye3sY/marching_pawn_b.png' } },   /* recruit-card icon, rf2HSTXTehE 1:10 frame (tools/g5_art6.py); black = fill/outline swap (inferred) */
    M: { name: 'Portal Mage', badge: '' /* no built-in fairy badge over the video icon */, moves: '', gen: 'portal', value: 350, img: { w: 'assets/modes/_RFXN1Ye3sY/mage_w.png', b: 'assets/modes/_RFXN1Ye3sY/mage_b.png' } },
    E: { name: 'Reaper', badge: '' /* no built-in fairy badge over the video icon */, moves: '', gen: 'reaper', value: 450, img: { w: 'assets/modes/_RFXN1Ye3sY/reaper_w.png', b: 'assets/modes/_RFXN1Ye3sY/reaper_b.png' } },
    I: { name: 'Prince', badge: '' /* no built-in fairy badge over the video icon */, moves: 'K', value: 300, img: { w: 'assets/modes/_RFXN1Ye3sY/prince_w.png', b: 'assets/modes/_RFXN1Ye3sY/prince_b.png' } },   /* laurel-crown recruit-card icon, rf2HSTXTehE 1:22 frame (tools/g5_art6.py) */
    V: { name: 'Viking', moves: 'WFnD', value: 330, img: { w: 'assets/modes/_RFXN1Ye3sY/viking_w.png', b: 'assets/modes/_RFXN1Ye3sY/viking_b.png' } },
    R: { name: 'Rook', value: 500, moves: 'R', castleRook: false, img: { w: 'assets/modes/_RFXN1Ye3sY/rook_w.png', b: 'assets/modes/_RFXN1Ye3sY/rook_b.png' } },
    N: { name: 'Knight', value: 300, moves: 'N', img: { w: 'assets/modes/_RFXN1Ye3sY/knight_w.png', b: 'assets/modes/_RFXN1Ye3sY/knight_b.png' } },
    L: { name: 'Fool', moves: '', gen: 'fool', value: 300, badge: '', img: { w: 'assets/modes/_RFXN1Ye3sY/fool_w.png', b: 'assets/modes/_RFXN1Ye3sY/fool_b.png' } },   /* 'moves with the same pattern as the last enemy move' (g5_ouro fool); art-g6c: jester-cap icon from the rf2HSTXTehE 1:49 Fool recruit card (video_thumbs/rf2HSTXTehE_frame_109.jpg, tools/g6c_art.py); black = fill/outline swap (inferred) */
    O: { name: 'Ouroboros Queen', moves: 'QN', royal: true, value: 0, img: 'assets/modes/_RFXN1Ye3sY/queen_face.png', badge: '' }
  },
  setup: { fen: 'p1g1p1/6/1pppp1/6/6/6/1PPPP1/1RKMN1' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { auto: 'Q', choices: ['Q'] }, drawPlies: 120, win: [] },
  bot: { engine: 'search', depth: 3, time_ms: 600 },
  params: {
    enemyRows: 2, victoryImg: 'assets/modes/_RFXN1Ye3sY/victory.jpg',   /* the VICTORY banner from this video (frame 19:25) */ princeType: 'I', glassType: 'Q',
    /* g5 pass 2: run layer (g5_ouro): rewinds per battle, relics, gold, node map, recruit cards (Reaper 481 gold from the video; other prices inferred), boss intro */
    run: { gold: 300, reward: 220, rewinds: 3, relics: { finisher: 1 }, bossIntro: { img: 'assets/modes/_RFXN1Ye3sY/ouroboros_queen.png', name: 'The Ouroboros Queen', text: 'The Ouroboros Queen rises from the Marsh of Madness to end your run.' },
      recruits: [{ t: 'R', cost: 300 }, { t: 'N', cost: 240 }, { t: 'V', cost: 280 }, { t: 'P', cost: 120 }, { t: 'M', cost: 340 }, { t: 'E', cost: 481 }, { t: 'I', cost: 320 }, { t: 'L', cost: 220 }] },
    battles: [
      { region: 'Kingdom of Thessalonia', name: 'Training skirmish', fen: 'p1g1p1/6/1pppp1/6/6/6/1PPPP1/1RKMN1' },
      { region: 'Marsh of Madness', name: 'Bog patrol', fen: '1vgv2/1pppp1/6/6/6/6/1PPPP1/1MKQV1' },
      { region: 'Marsh of Madness', name: 'Marsh warband', fen: 'rngnr1/pppppp/6/6/6/6/PPPPPP/RMKQVN' },
      { region: 'Marsh of Madness', name: 'The Ouroboros Queen', fen: 'rnobnr/pppppp/6/6/6/6/PPPPPP/RMKQEN', boss: 'Ouroboros Queen' }
    ]
  },
  sounds: { 'reap': 'assets/modes/_RFXN1Ye3sY/reap.wav' },   /* v6 per-mode sound set (tools/sfx/modes_v6.py, wire_v6.py) */
  hooks: 'g5_ouro',
  _art_notes: 'g5 2026-11-25: the enemy fodder was an invented "Soldier" (no Ouroboros video has one); re-cast as enemy Marching Pawns, a unit the videos show (inferred).',
  source: { research: 'research/modes/_RFXN1Ye3sY.json', confidence: 'medium', notes: 'Battle armies and the 6x8 size are inferred from frames; real runs draft units between battles.' }
});
