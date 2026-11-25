/* Can I BEAT Passant? [Full Release - Part 2]  Passant, a Steam chess roguelike: you play White with a small bought army against the AI's preset army each
   round. Full release, setup 4 "Slip and Push": six pawns, two bishops and the king with the Slippy badge (a piece that moved in a straight line slides one more square if it can, possibly off the board). Victory (any one): checkmate / capture the king, check the enemy king 6 of your turns in a row,
   capture every enemy piece except the king, or stay +7 material ahead for two turns. You may move into check, but if
   your king is captured you lose. Sources: research/modes/dkCMhNcZezM.json, frames (#e8b8c8/#70361c). PASS 1: the run is a
   fixed sequence of rounds (js/modes/g6_levels.js, passant + money counters); the shop, coins and badges are pass 2.
   The Courtisan freezes the enemy pieces next to it (qZyNuiVbGMI spec). */
CM.mode({
  id: 'dkCMhNcZezM',
  title: 'Can I BEAT Passant? [Full Release - Part 2]',
  name: 'Passant: Slip and Push',
  category: 'Variants & Games',
  description: 'A chess roguelike run of rounds against the Passant AI. Win a round by checkmate (or taking the king), by checking the king six of your turns in a row, by capturing everything but the king, or by staying 7 points of material ahead for two turns. You may move into check, but losing your king ends the run. Empress = rook + knight, Amazon = queen + knight; enemy pieces next to your Courtisan are frozen. Slippy: your piece slides one more square after a straight move.',
  how_to_win: 'Clear every round of the run.',
  player_side: 'white',
  opponent: { name: 'Passant AI', rating: null, avatar: 'assets/modes/dkCMhNcZezM/passant_ai.png', tagline: 'Preset enemy armies and boss rounds.' },
  board: { files: 8, ranks: 8, light: '#e8b8c8', dark: '#70361c', background: '#a26535' },
  pieces: {
    C: { name: 'Empress', moves: 'RN', value: 850, glyph: 'R', badge: 'E' },
    M: { name: 'Amazon', moves: 'QN', value: 1200, glyph: 'Q', badge: 'A' },
    Ct: { name: 'Courtisan', moves: 'K', value: 300, glyph: 'B', badge: 'Ct' },
    U: { name: 'Man', moves: 'K', value: 300, glyph: 'K', badge: 'M' },
    Dk: { name: 'Dragon King', moves: 'Q', value: 1000, royal: true, glyph: 'K', badge: 'D' },
    Rp: { name: 'Rainbow Pawn', moves: 'fmWfcFmK', value: 350, glyph: 'P', badge: 'R' }
  },
  setup: { fen: '3k4/2ppp3/8/8/8/8/1PPPPPP1/2B1KB2' },
  rules: { check: { w: 'none', b: 'standard' }, castling: false, enPassant: true, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'search', depth: 3, time_ms: 550 },
  params: {"run": "Round", "money": true, "passant": true, "freezer": "Ct", "levels": [{"name": "Level 1, round 1", "fen": "3k4/2ppp3/8/8/8/8/1PPPPPP1/2B1KB2", "reward": 8}, {"name": "Level 1, round 2", "fen": "1n1k2n1/2ppp3/8/8/8/8/1PPPPPP1/2B1KB2", "reward": 8}, {"name": "Boss: Enemy Rainbow Pawn", "fen": "r2k3r/2p[rp][rp]p2/8/8/8/8/1PPPPPP1/2B1KB2", "hint": "Rainbow pawns step in any direction", "reward": 12}], "slippy": true},
  hooks: 'g6_levels',
  todo_pass2: ["shop between rounds (buy pieces, Re-roll $2, Next Round) and Standard/Challenging/Skip round choice", "coins (queen / pawn / demotion / money) and badges", "original Passant-style piece art (Empress, Amazon, Courtisan, Man, Dragon King, Rainbow pieces)", "\"Player Turn\" banner, smoke on capture, money payout popups", "undo charges", "Push badge (non-capturing moves push neighbours)", "Unstable / arrow special tiles", "pink-and-brown full-release board art"],
  source: { research: 'research/modes/dkCMhNcZezM.json', confidence: 'medium', notes: 'Push badge and unstable tiles not modelled; boss armies invented.' }
});
