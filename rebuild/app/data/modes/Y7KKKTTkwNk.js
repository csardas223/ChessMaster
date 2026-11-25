/* Can I BEAT King of the Bridge? (Goose Ending)  Hunting the secret Goose ending of King of the Bridge: a goose
   appears in the water behind the bridge and eventually swoops in to help you win ('Get ready for my special move',
   'STOP!!'). Sources: research/modes/Y7KKKTTkwNk.json (trigger condition not established), frames (#8a8b72/#4f5540).
   Logic in js/modes/g5_troll.js; PASS 2: the game's pixel pieces cut from the video stills (tools/g5_frames.py) + the troll from the video (tools/g5_sprites.py), synthesised sounds (tools/g5_sounds.py), dialogue, slippery tiles, rule unlocks, payback. Still missing: see _deferred. */
CM.mode({
  id: 'Y7KKKTTkwNk',
  title: 'Can I BEAT King of the Bridge? (Goose Ending)',
  name: 'King of the Bridge: Goose Ending',
  category: 'Variants & Games',
  description: "Advanced Troll Chess on the bridge. The Troll cheats: when you think its last move broke a rule, press Accuse (or Space) and pick the rule from the rule book. A correct accusation gets the cheating piece arrested. Troll rules: pawns step forward, sideways or back and capture diagonally forward; only knights jump; the queen may not capture the king; when the Troll's king dies its crown passes to another Troll piece. If your king dies, you lose. Keep catching cheats: after three arrests (or by move 30) a goose rises from the water and carries off a Troll piece after each of your moves.",
  how_to_win: 'Survive until the goose arrives and let it clear the bridge.',
  player_side: 'white',
  opponent: { name: 'The Troll', rating: null, avatar: 'assets/modes/WEYUcaJTBso/troll.png', tagline: 'Guards the bridge. Cheats. A lot.' },
  board: { files: 8, ranks: 8, light: '#8a8b72', dark: '#4f5540' },
  theme: { background: '#1f2a2e', pieces: '../modes/WEYUcaJTBso/pixel' },
  pieces: { P: { name: 'Pawn (small-minded)', moves: 'mWfcFifmnD', pawn: true, promote: true, value: 100 } },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { check: { w: 'standard', b: 'none' }, castling: true, enPassant: false, promotion: { choices: ['Q', 'N', 'R', 'B'] }, drawPlies: 400, win: [{ type: 'checkmate' }] },
  bot: { engine: 'search', depth: 2, time_ms: 500, min_ms: 400 },
  params: { cheatChance: 0.3, falseAccusation: 'forfeit', goose: { after_ply: 60, after_catches: 3 }, bookImg: 'assets/modes/M0rsyuvaTrk/rulebook.png', trollImg: 'assets/modes/WEYUcaJTBso/troll.png', gooseImg: 'assets/modes/Y7KKKTTkwNk/goose.png', intro: ['Halt! None shall cross my bridge...', 'Unless you beat me at the 11th edition of Advanced Troll Chess.', 'The rules are in the book. I would NEVER cheat. Hehehe.'], gooseLines: ['Get ready for my special move!', 'Wait... what is that in the water?', 'HONK.', 'STOP!! Not my pieces!'], gooseEnd: ['The goose takes the last Troll piece and waddles off.', 'The bridge is yours. HONK.'] },
  sounds: { arrest: 'assets/modes/WEYUcaJTBso/arrest.wav', honk: 'assets/modes/Y7KKKTTkwNk/honk.wav' },
  assets: { goose: 'assets/modes/Y7KKKTTkwNk/goose.png' },
  hooks: 'g5_troll',
  source: { research: 'research/modes/Y7KKKTTkwNk.json', confidence: 'low', notes: 'Goose trigger condition invented (not established in the video).' }
});
