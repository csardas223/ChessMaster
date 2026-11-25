/* Can I BEAT King of the Bridge?  Indie pixel-art game: a riddle-loving troll on a bridge challenges you to 'the 11th
   edition of Advanced Troll Chess'. A rule book lists numbered rules; the troll cheats; press Space, pick the piece
   and the rule it broke. Correct = 'Officer, arrest him' (payback); false accusation = your turn is forfeited and the
   troll cheats as revenge. Losing your king ends the game; the troll's king passes its crown. He wins by out-waiting
   the troll and catching every cheat. Sources: research/modes/WEYUcaJTBso.json (rules 00-25), frames (pixel art,
   rule book overlay). Logic in js/modes/g5_troll.js. PASS 1: the accused piece is the one that moved last; no
   slippery tiles / board flip / out-of-town bishops yet. */
CM.mode({
  id: 'WEYUcaJTBso',
  title: 'Can I BEAT King of the Bridge?',
  name: 'King of the Bridge',
  category: 'Variants & Games',
  description: "Advanced Troll Chess on the bridge. The Troll cheats: when you think its last move broke a rule, press Accuse (or Space) and pick the rule from the rule book. A correct accusation gets the cheating piece arrested. Troll rules: pawns step forward, sideways or back and capture diagonally forward; only knights jump; the queen may not capture the king; when the Troll's king dies its crown passes to another Troll piece. If your king dies, you lose. A false accusation forfeits your turn and the Troll cheats as revenge.",
  how_to_win: 'Remove every Troll piece (catch its cheats) without losing your king.',
  player_side: 'white',
  opponent: { name: 'The Troll', rating: null, tagline: 'Guards the bridge. Cheats. A lot.' },
  board: { files: 8, ranks: 8, light: '#c8b98a', dark: '#5b6b3a' },
  theme: { background: '#1f2a2e' },
  pieces: { P: { name: 'Pawn (small-minded)', moves: 'mWfcFifmnD', pawn: true, promote: true, value: 100 } },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { check: { w: 'standard', b: 'none' }, castling: true, enPassant: false, promotion: { choices: ['Q', 'N', 'R', 'B'] }, drawPlies: 400, win: [{ type: 'checkmate' }] },
  bot: { engine: 'search', depth: 2, time_ms: 500, min_ms: 400 },
  params: { cheatChance: 0.25, falseAccusation: 'forfeit' },
  hooks: 'g5_troll',
  todo_pass2: ['pixel-art troll avatar and pixel piece set', 'rule book page art with gong sound when a rule unlocks', 'hidden rules unlocking during play (16+)', 'slippery tiles that knock pieces over (click to stand up)', 'board flip when the queen slips', 'bishops working out of town (off the board edge)', 'payback cheat after a correct accusation'],
  source: { research: 'research/modes/WEYUcaJTBso.json', confidence: 'medium', notes: 'Rule set trimmed to the rules the troll is seen breaking; payback cheat replaced by arresting the piece.' }
});
