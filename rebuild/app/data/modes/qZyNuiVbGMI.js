/* Can I MASTER Passant?  Passant, a Steam chess roguelike: you play White with a small bought army against the AI's preset army each
   round. A saved run: bishop, queen, Courtisan, a-pawns and king, with bought upgrades, against bosses such as a royal Dragon King. Victory (any one): checkmate / capture the king, check the enemy king 6 of your turns in a row,
   capture every enemy piece except the king, or stay +7 material ahead for two turns. You may move into check, but if
   your king is captured you lose. Sources: research/modes/qZyNuiVbGMI.json, frames (#dfc5c3/#352a20). PASS 1: the run is a
   fixed sequence of rounds (js/modes/g6_levels.js, passant + money counters); the shop, coins and badges are pass 2.
   The Courtisan freezes the enemy pieces next to it (qZyNuiVbGMI spec). */
CM.mode({
  id: 'qZyNuiVbGMI',
  title: 'Can I MASTER Passant?',
  name: 'Passant (Master run)',
  category: 'Variants & Games',
  description: 'A chess roguelike run of rounds against the Passant AI. Win a round by checkmate (or taking the king), by checking the king six of your turns in a row, by capturing everything but the king, or by staying 7 points of material ahead for two turns. You may move into check, but losing your king ends the run. Empress = rook + knight, Amazon = queen + knight; enemy pieces next to your Courtisan are frozen.',
  how_to_win: 'Clear every round of the run.',
  player_side: 'white',
  opponent: { name: 'Passant AI', rating: null, avatar: 'assets/avatars/bot.svg', tagline: 'Preset enemy armies and boss rounds.' },
  board: { files: 8, ranks: 8, light: '#dfc5c3', dark: '#352a20', background: '#1d1712' },
  pieces: {
    C: { name: 'Empress', moves: 'RN', value: 850, glyph: 'R', badge: 'E' },
    M: { name: 'Amazon', moves: 'QN', value: 1200, glyph: 'Q', badge: 'A' },
    Ct: { name: 'Courtisan', moves: 'K', value: 300, glyph: 'B', badge: 'Ct' },
    U: { name: 'Man', moves: 'K', value: 300, glyph: 'K', badge: 'M' },
    Dk: { name: 'Dragon King', moves: 'Q', value: 1000, royal: true, glyph: 'K', badge: 'D' },
    Rp: { name: 'Rainbow Pawn', moves: 'fmWfcFmK', value: 350, glyph: 'P', badge: 'R' }
  },
  setup: { fen: 'r2k3r/ppp2ppp/8/8/8/8/PP6/2BQK[Ct]2' },
  rules: { check: { w: 'none', b: 'standard' }, castling: false, enPassant: true, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'search', depth: 3, time_ms: 550 },
  params: {"run": "Round", "money": true, "passant": true, "freezer": "Ct", "levels": [{"name": "Round 1", "fen": "r2k3r/ppp2ppp/8/8/8/8/PP6/2BQK[Ct]2", "hint": "Your saved army", "reward": 8}, {"name": "Round 2 (challenging)", "fen": "rn1qk1nr/ppp2ppp/8/8/8/8/PPP5/1[C]BQK[Ct]2", "hint": "You bought a golden Empress", "reward": 10}, {"name": "Boss: Dragon King", "fen": "rnb1[dk]bnr/pppppppp/8/8/8/8/PPP[U]4/1[C]BQK[Ct]2", "hint": "The Dragon King moves like a queen", "reward": 15}]},
  hooks: 'g6_levels',
  todo_pass2: ["shop between rounds (buy pieces, Re-roll $2, Next Round) and Standard/Challenging/Skip round choice", "coins (queen / pawn / demotion / money) and badges", "original Passant-style piece art (Empress, Amazon, Courtisan, Man, Dragon King, Rainbow pieces)", "\"Player Turn\" banner, smoke on capture, money payout popups", "undo charges"],
  source: { research: 'research/modes/qZyNuiVbGMI.json', confidence: 'medium', notes: 'Saved-run army from the spec; enemy armies invented.' }
});
