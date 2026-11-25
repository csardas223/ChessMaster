/* Can I BEAT King of the Bridge?  Indie pixel-art game: a riddle-loving troll on a bridge challenges you to 'the 11th
   edition of Advanced Troll Chess'. A rule book lists numbered rules; the troll cheats; press Space, pick the piece
   and the rule it broke. Correct = 'Officer, arrest him' (payback); false accusation = your turn is forfeited and the
   troll cheats as revenge. Losing your king ends the game; the troll's king passes its crown. He wins by out-waiting
   the troll and catching every cheat. Sources: research/modes/WEYUcaJTBso.json (rules 00-25), frames (pixel art,
   rule book overlay). Logic in js/modes/g5_troll.js. PASS 2: the game's pixel pieces cut from the video stills (tools/g5_frames.py) + the troll from the video (tools/g5_sprites.py), synthesised sounds (tools/g5_sounds.py), dialogue, slippery tiles, rule unlocks, payback. Still missing: see _deferred. */
CM.mode({
  id: 'WEYUcaJTBso',
  title: 'Can I BEAT King of the Bridge?',
  name: 'King of the Bridge',
  category: 'Variants & Games',
  description: "Advanced Troll Chess on the bridge. The Troll cheats: when you think its last move broke a rule, press Accuse (or Space) and pick the rule from the rule book. A correct accusation gets the cheating piece arrested. Troll rules: pawns step forward, sideways or back and capture diagonally forward; only knights jump; the queen may not capture the king; when the Troll's king dies its crown passes to another Troll piece. If your king dies, you lose. A false accusation forfeits your turn and the Troll cheats as revenge. Striped tiles are slippery: a piece landing there falls over and must spend a turn standing up (a slipping queen flips the board). New rules join the book as the game goes on (gong). Catch a cheat and you may cheat once yourself as payback: any piece may step one square like a king.",
  how_to_win: 'Remove every Troll piece (catch its cheats) without losing your king.',
  player_side: 'white',
  opponent: { name: 'The Troll', rating: null, avatar: 'assets/modes/WEYUcaJTBso/troll.png', tagline: 'Guards the bridge. Cheats. A lot.' },
  board: { files: 8, ranks: 8, light: '#c8b98a', dark: '#5b6b3a' },
  theme: { background: '#1f2a2e', pieces: '../modes/WEYUcaJTBso/pixel' },
  pieces: { P: { name: 'Pawn (small-minded)', moves: 'mWfcFifmnD', pawn: true, promote: true, value: 100 } },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { check: { w: 'standard', b: 'none' }, castling: true, enPassant: false, promotion: { choices: ['Q', 'N', 'R', 'B'] }, drawPlies: 400, win: [{ type: 'checkmate' }] },
  bot: { engine: 'search', depth: 2, time_ms: 500, min_ms: 400 },
  params: { cheatChance: 0.25, falseAccusation: 'forfeit', payback: true, unlock: { 13: 12, 9: 24 }, slippery: ['c4', 'f5'], bookImg: 'assets/modes/M0rsyuvaTrk/rulebook.png', trollImg: 'assets/modes/WEYUcaJTBso/troll.png', intro: ['Halt! None shall cross my bridge...', 'Unless you beat me at the 11th edition of Advanced Troll Chess.', 'The rules are in the book. I would NEVER cheat. Hehehe.'] },
  sounds: { gong: 'assets/modes/WEYUcaJTBso/gong.wav', arrest: 'assets/modes/WEYUcaJTBso/arrest.wav' },
  hooks: 'g5_troll',
  _deferred: ['bishops working out of town (off the board edge)', 'rules 7/12/14/24 special patterns (knight trot, lazy king, rook special move)'],
  source: { research: 'research/modes/WEYUcaJTBso.json', confidence: 'medium', notes: 'Rule set trimmed to the rules the troll is seen breaking; payback cheat replaced by arresting the piece.' }
});
