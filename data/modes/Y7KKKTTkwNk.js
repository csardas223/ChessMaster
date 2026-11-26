/* Can I BEAT King of the Bridge? (Goose Ending)  Hunting the secret Goose ending of King of the Bridge: a goose
   swims up behind the bridge after ~25 moves whether you cheat or not; you put the Troll King on it and it carries him off
   (Bon Voyage ending: you stay on the bridge). m-accuracy 2026-11-26 from the transcript (5:06-7:07); frames (#8a8b72/#4f5540).
   Logic in js/modes/g5_troll.js; PASS 2: the game's pixel pieces cut from the video stills (tools/g5_frames.py) + the troll from the video (tools/g5_sprites.py), synthesised sounds (tools/g5_sounds.py), dialogue, slippery tiles, rule unlocks, payback. Still missing: see _deferred. */
CM.mode({
  id: 'Y7KKKTTkwNk',
  title: 'Can I BEAT King of the Bridge? (Goose Ending)',
  name: 'King of the Bridge: Goose Ending',
  category: 'Variants & Games',
  description: "Advanced Troll Chess on the bridge. The Troll cheats: when you think its last move broke a rule, press Accuse (or Space) and pick the rule from the rule book. A correct accusation gets the cheating piece arrested. Troll rules: pawns step forward, sideways or back and capture diagonally forward; only knights jump; the queen may not capture the king; when the Troll's king dies its crown passes to another Troll piece. If your king dies, you lose. Just survive: after about 25 moves the goose swims up behind the bridge (whether you cheat or not). Then press Put the King on the goose and it carries the Troll away.",
  how_to_win: 'Survive until the goose arrives, then put the Troll King on the goose (Bon Voyage ending).',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'The Troll', rating: null, avatar: 'assets/modes/WEYUcaJTBso/troll.png', tagline: 'Guards the bridge. Cheats. A lot.' },
  board: { files: 8, ranks: 8, light: '#8a8b72', dark: '#4f5540' },
  theme: { background: '#1f2a2e', pieces: '../modes/WEYUcaJTBso/pixel' },
  pieces: { P: { name: 'Pawn (small-minded)', moves: 'mWfcFifmnD', pawn: true, promote: true, value: 100 } },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { check: { w: 'standard', b: 'none' }, castling: true, enPassant: false, promotion: { choices: ['Q', 'N', 'R', 'B'] }, drawPlies: 400, win: [{ type: 'checkmate' }] },
  bot: { engine: 'search', depth: 2, time_ms: 500, min_ms: 400 },
  params: { cheatChance: 0.3, falseAccusation: 'forfeit', goose: { after_ply: 50, carry: true, why: 'Bon Voyage: the goose carried the Troll away (you remain on the bridge)' }, bookImg: 'assets/modes/M0rsyuvaTrk/rulebook.png', trollImg: 'assets/modes/WEYUcaJTBso/troll.png', gooseImg: 'assets/modes/Y7KKKTTkwNk/goose.png', intro: ['Halt! None shall cross my bridge...', 'Unless you beat me at the 11th edition of Advanced Troll Chess.', 'The rules are in the book. I would NEVER cheat. Hehehe.'], gooseLines: ['HONK.', 'The goose swims up behind the bridge. Pick it up, grab the Troll King and put him on the goose.'], gooseEnd: ['Put me back right now! Get me off this chicken!', "Don't think you can outsmart me. When I get off this animal, I'll find another bridge.", 'Bon Voyage: you got rid of the Troll... but you remain on the bridge.'] },
  sounds: { arrest: 'assets/modes/WEYUcaJTBso/arrest.wav', honk: 'assets/modes/Y7KKKTTkwNk/honk.wav' },
  assets: { goose: 'assets/modes/Y7KKKTTkwNk/goose.png' },
  hooks: 'g5_troll',
  source: { research: 'research/modes/Y7KKKTTkwNk.json', confidence: 'medium', notes: 'm-accuracy 2026-11-26 from the transcript: the goose comes on its own whether you cheat or not (1:04) after ~25 of your moves (5:06; exact trigger not shown, ply 50 inferred); you put the Troll King on the goose and it carries him off (5:35-5:52); ending Bon Voyage = you remain on the bridge (6:42-7:07). Accusing does not summon it (0:33).' }
});
