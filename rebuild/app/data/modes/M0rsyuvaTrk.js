/* Can I BEAT King of the Bridge? (Impatience Award)  Speedrun of King of the Bridge for the 'Impatience' achievement
   (finish under 15 minutes): he skips the troll's intro, shuffles pawns while waiting for cheats and accuses each one
   from the rule book; a false accusation loses immediately (cost him attempt 1); run 2 finishes at 10:20.
   Sources: research/modes/M0rsyuvaTrk.json (speedrun timer top-left, false accusation = loss, rules 2/4/7/25).
   Logic in js/modes/g5_troll.js (timer: true, falseAccusation: 'lose'). */
CM.mode({
  id: 'M0rsyuvaTrk',
  title: 'Can I BEAT King of the Bridge? (Impatience Award)',
  name: 'King of the Bridge: Impatience',
  category: 'Variants & Games',
  description: "Advanced Troll Chess on the bridge. The Troll cheats: when you think its last move broke a rule, press Accuse (or Space) and pick the rule from the rule book. A correct accusation gets the cheating piece arrested. Troll rules: pawns step forward, sideways or back and capture diagonally forward; only knights jump; the queen may not capture the king; when the Troll's king dies its crown passes to another Troll piece. If your king dies, you lose. Speedrun: a false accusation loses at once, and the clock is running. The striped tile is slippery: a piece landing there falls over and must spend a turn standing up. Win in under 15:00 for the Impatience achievement.",
  how_to_win: 'Remove every Troll piece in under 15:00 for the Impatience award.',
  player_side: 'white',
  opponent: { name: 'The Troll', rating: null, avatar: 'assets/modes/M0rsyuvaTrk/troll.png', tagline: 'Guards the bridge. Cheats. A lot.' },
  board: { files: 8, ranks: 8, light: '#c8b98a', dark: '#5b6b3a' },
  theme: { background: '#1f2a2e', pieces: '../modes/WEYUcaJTBso/pixel' },
  pieces: { P: { name: 'Pawn (small-minded)', moves: 'mWfcFifmnD', pawn: true, promote: true, value: 100 } },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { check: { w: 'standard', b: 'none' }, castling: true, enPassant: false, promotion: { choices: ['Q', 'N', 'R', 'B'] }, drawPlies: 400, win: [{ type: 'checkmate' }] },
  bot: { engine: 'search', depth: 2, time_ms: 500, min_ms: 400 },
  params: { cheatChance: 0.3, falseAccusation: 'lose', timer: true, slippery: ['d5'], bookImg: 'assets/modes/M0rsyuvaTrk/rulebook.png', trollImg: 'assets/modes/M0rsyuvaTrk/troll.png', intro: ['You again? Fine. Same bridge, same rules.', 'Accuse me wrongly even once and you lose. Clock is ticking!'] },
  sounds: { arrest: 'assets/modes/WEYUcaJTBso/arrest.wav', achievement: 'assets/modes/M0rsyuvaTrk/achievement.wav' },
  hooks: 'g5_troll',
  _deferred: ['gift pickups made by bishops', 'ending cutscene (you turn into the troll)'],
  source: { research: 'research/modes/M0rsyuvaTrk.json', confidence: 'medium', notes: 'Pieces/rules shared with WEYUcaJTBso; speedrun goal from the transcript.' }
});
