/* Can I BEAT King of the Bridge? (Rules Ending)  King of the Bridge: a pixel-art chess game against the cheating Troll, who guards the bridge with a rule
   book of strange numbered rules. The Rules Ending: unlock every rule in the book for the Rule Savant award; the last one is Rule 28 (you may only move the castles, two rooks side by side, when there are three or more towers in the game). Sources: research/modes/hv_NHWqysZE.json, base rules research/modes/WEYUcaJTBso.json,
   frames (dark green pixel swamp, #8a8b72/#4f5540 board). Shared logic js/modes/g6_bridge.js. PASS 1: the rule book is a
   toast per unlocked rule, the Troll cheats at random after his moves; the accusation mode (Space) is pass 2. */
CM.mode({
  id: 'hv_NHWqysZE',
  title: 'Can I BEAT King of the Bridge? (Rules Ending)',
  name: 'King of the Bridge: Rule Savant',
  category: 'Variants & Games',
  description: 'Chess by the Troll\'s rules: pawns step one square forward, sideways or back and capture straight ahead; the Horse guy may also trot one square; the Queen may never take a king; there is no check, and when the Troll\'s king falls the crown passes to his strongest piece. Watch the Troll: he cheats.',
  how_to_win: 'Unlock every rule in the rule book (Rule Savant), or take every piece of the Troll.',
  player_side: 'white',
  opponent: { name: 'The Troll', rating: null, avatar: 'assets/avatars/bot.svg', tagline: 'Guardian of the bridge. He cheats.' },
  board: { files: 8, ranks: 8, light: '#8a8b72', dark: '#4f5540', background: '#16220f' },
  pieces: {
    P: { name: 'Small-minded one', moves: 'mWfcW', value: 100, pawn: true, promote: true, enPassant: false, san: '' },
    N: { name: 'Horse guy', moves: 'NW', value: 340 },
    K: { name: 'Crown guy', moves: 'K', value: 2000, royal: true, castle: false }
  },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'search', depth: 3, time_ms: 500 },
  params: { ending: 'rules', cheat: 0.18 },
  hooks: 'g6_bridge',
  todo_pass2: ['accusation mode (Space + point at the broken rule): correct = you may cheat once, false = turn forfeited + Troll revenge', 'pixel-art pieces, Troll avatar and swamp bridge backdrop', 'gong sound on rule unlock', 'slippery tiles (piece falls over), queen slip flips the board', 'bishops leaving the board out of town', 'intro riddle cutscene'],
  source: { research: 'research/modes/hv_NHWqysZE.json', confidence: 'medium', notes: 'Rule list condensed to 11 rules; castle rule enforced as a move restriction.' }
});
