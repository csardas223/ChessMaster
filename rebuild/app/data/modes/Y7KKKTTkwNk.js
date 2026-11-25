/* Can I BEAT King of the Bridge? (Goose Ending)  Hunting the secret Goose ending of King of the Bridge: a goose
   appears in the water behind the bridge and eventually swoops in to help you win ('Get ready for my special move',
   'STOP!!'). Sources: research/modes/Y7KKKTTkwNk.json (trigger condition not established), frames (#8a8b72/#4f5540).
   Logic in js/modes/g5_troll.js; PASS 1: the goose arrives after 3 caught cheats or move 30 and carries off one
   Troll piece after each of your moves. */
CM.mode({
  id: 'Y7KKKTTkwNk',
  title: 'Can I BEAT King of the Bridge? (Goose Ending)',
  name: 'King of the Bridge: Goose Ending',
  category: 'Variants & Games',
  description: "Advanced Troll Chess on the bridge. The Troll cheats: when you think its last move broke a rule, press Accuse (or Space) and pick the rule from the rule book. A correct accusation gets the cheating piece arrested. Troll rules: pawns step forward, sideways or back and capture diagonally forward; only knights jump; the queen may not capture the king; when the Troll's king dies its crown passes to another Troll piece. If your king dies, you lose. Keep catching cheats: after three arrests (or by move 30) a goose rises from the water and carries off a Troll piece after each of your moves.",
  how_to_win: 'Survive until the goose arrives and let it clear the bridge.',
  player_side: 'white',
  opponent: { name: 'The Troll', rating: null, tagline: 'Guards the bridge. Cheats. A lot.' },
  board: { files: 8, ranks: 8, light: '#8a8b72', dark: '#4f5540' },
  theme: { background: '#1f2a2e' },
  pieces: { P: { name: 'Pawn (small-minded)', moves: 'mWfcFifmnD', pawn: true, promote: true, value: 100 } },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  rules: { check: { w: 'standard', b: 'none' }, castling: true, enPassant: false, promotion: { choices: ['Q', 'N', 'R', 'B'] }, drawPlies: 400, win: [{ type: 'checkmate' }] },
  bot: { engine: 'search', depth: 2, time_ms: 500, min_ms: 400 },
  params: { cheatChance: 0.3, falseAccusation: 'forfeit', goose: { after_ply: 60, after_catches: 3 } },
  hooks: 'g5_troll',
  todo_pass2: ['goose sprite (cream-white, orange beak, sunglasses variant) swooping over the board', 'troll dialogue boxes ("Get ready for my special move", "STOP!!")', 'pixel-art troll avatar and pixel piece set', 'goose ending cutscene'],
  source: { research: 'research/modes/Y7KKKTTkwNk.json', confidence: 'low', notes: 'Goose trigger condition invented (not established in the video).' }
});
