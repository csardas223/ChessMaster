/* Chess, But My Pieces Have Gravity: a real-time side-view platformer. Your king runs, jumps and swings a sword on a
   gravity board while Stockfish moves its full army on a timer (3 s, 2 s, 1 s, 0.5 s). Game module js/games/sword-king.js.
   Sources: research/modes/rx-HCGCNuDo.json (transcript 00:01, 00:30, 02:14). Sword-king sprite cropped from the video (research/frames/sprites, owner instruction; credit iwantcheckmate);
   sounds synthesised (tools/g1_sounds.py). Inferred: jump height, run speed, sword reach, start square. */
CM.mode({
  id: 'rx-HCGCNuDo',
  title: 'Chess, But My Pieces Have Gravity',
  name: 'Gravity Sword King',
  category: 'Powerups & Rule Twists',
  description: 'The board is seen from the side and gravity pulls your king down to rank 1. Run, jump and stand on Black\'s pieces, and swing your sword to remove the piece in front of you (or below you in mid-air). Stockfish moves on a timer; for its move your king counts as standing on the nearest square (shown in red). Pawns cannot move backwards, so standing on them is safer.',
  how_to_win: 'Stab the black king before a black piece lands on your square. Beat all four speeds: 3 s, 2 s, 1 s and 0.5 s per move.',
  frame: 'game',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/avatars/you.svg' },
  opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/avatars/stockfish.svg', tagline: 'Moves on a timer. You have a sword.' },
  game: { module: 'sword-king', aspect: 1, controls: ['left', 'right', '|', 'jump', 'action'] },
  params: { jumpSquares: 1.35, runSpeed: 3.4 },
  sounds: { swing: 'assets/modes/rx-HCGCNuDo/swing.wav', stab: 'assets/modes/rx-HCGCNuDo/stab.wav', jump: 'assets/modes/rx-HCGCNuDo/jump.wav' },
  assets: { sword: 'assets/modes/rx-HCGCNuDo/sword.svg', king: 'assets/modes/rx-HCGCNuDo/sword_king.png' },
  todo_pass2: [],
  source: { research: 'research/modes/rx-HCGCNuDo.json', confidence: 'medium', notes: 'black pieces stay on their squares (pawn ladders b3-c5 in the video); jump height and sword reach inferred' }
});
