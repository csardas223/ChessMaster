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
  description: "Advanced Troll Chess on the bridge, speedrun. The Troll cheats: when his last move broke a rule, press Accuse (or Space) and pick that rule from the rule book; a correct accusation gets the cheating piece arrested, a false one loses at once. Troll rules (the game's rule book): pawns step one square forward, sideways or back and never diagonally; only the horse guy jumps; the crown guy is lazy (one square); towers move straight; only bishops work out of town (the dark ring around the board) and they drop a gift of knowledge on every tile they leave: whatever lands on a gift blows up with it, sliders pass over it; the queen may not touch the king, and a queen capture flips the world sideways; pawns on the far row ascend; you may also move the Troll's queen once rule 3 is in the book; hidden slippery tiles knock a piece over (spend a turn standing it up); when the Troll's king dies the crown passes on, so you win only when every Troll piece is gone. If your king dies, you lose. Catch a cheat and you may cheat once yourself: move any piece anywhere, drop a Troll piece on a gift, or tap a gift and then a Troll piece. The clock runs until the ending cutscene ends: win in under 15:00 for the Impatience achievement.",
  how_to_win: 'Remove every Troll piece in under 15:00 for the Impatience award.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'The Troll', rating: null, avatar: 'assets/modes/M0rsyuvaTrk/troll.png', tagline: 'Guards the bridge. Cheats. A lot.' },
  board: { files: 10, ranks: 10, light: '#c8b98a', dark: '#5b6b3a' },
  theme: { background: '#1f2a2e', pieces: '../modes/WEYUcaJTBso/pixel' },
  pieces: { P: { name: 'Pawn (small-minded)', moves: 'W', pawn: true, promote: false, value: 100 } },
  setup: { fen: '10/1rnbqkbnr1/1pppppppp1/10/10/10/10/1PPPPPPPP1/1RNBQKBNR1/10' },
  rules: { check: { w: 'none', b: 'none' }, castling: false, enPassant: false, drawPlies: 400, win: [{ type: 'checkmate' }] },
  bot: { engine: 'search', depth: 2, time_ms: 500, min_ms: 400 },
  params: { cheatChance: 0.3, falseAccusation: 'lose', timer: true, payback: 'any', fullBook: true, outOfTown: true, gifts: true, giftImg: 'assets/modes/M0rsyuvaTrk/gift.svg', ascend: true, queenMirror: true, slipRandom: 2, bookImg: 'assets/modes/M0rsyuvaTrk/rulebook.png', trollImg: 'assets/modes/M0rsyuvaTrk/troll.png', intro: ['You again? Fine. Same bridge, same rules.', 'Accuse me wrongly even once and you lose. Clock is ticking!'], endCutscene: ['Cheater.', 'I may not have won the game, but at least I will leave a worthy successor.', 'You treated me so nicely. I hated you for no reason.', 'Your final evolution: you become the Troll.', 'You remain on the bridge.'] },
  sounds: { arrest: 'assets/modes/WEYUcaJTBso/arrest.wav', achievement: 'assets/modes/M0rsyuvaTrk/achievement.wav' },
  hooks: 'g5_troll',
  _deferred: ['valorite scraps / castles (rules 16-17, 23, 28: not shown in this video)', 'the walk to the bridge and the troll riddle intro (skipped in the video)'],
  source: { research: 'research/modes/M0rsyuvaTrk.json', confidence: 'medium', notes: 'Pieces/rules shared with WEYUcaJTBso; speedrun goal from the transcript. acc 2026-11-26: full rule book (numbers/wording from the game pages read in WEYUcaJTBso and the Steam rule-book guide), out-of-town ring, gifts, payback any-piece cheat, ending cutscene. Inferred: the 10x10 ring standing in for off-board space, gift art traced from the maxres2 still, cutscene line order.' }
});
