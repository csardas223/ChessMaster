/* Can I CONQUER Passant?  Passant, a Steam chess roguelike: you play White with a small bought army against the AI's preset army each
   round. The AI is set to Challenging: round 1 vs king, two knights and three pawns; stage 2 vs two dark-squared bishops, a rook and a pawn; a Fischer Random boss won by six checks; the demo ends with a mate by an Amazon. Victory (any one): checkmate / capture the king, check the enemy king 6 of your turns in a row,
   capture every enemy piece except the king, or stay +7 material ahead for two turns. You may move into check, but if
   your king is captured you lose. Sources: research/modes/dztzDlPfqSI.json, frames (#aeaeae/#5a9696). PASS 1: the run is a
   fixed sequence of rounds (js/modes/g6_levels.js, passant + money counters); the shop, coins and badges are pass 2.
   The Courtisan freezes the enemy pieces next to it (qZyNuiVbGMI spec). */
CM.mode({
  id: 'dztzDlPfqSI',
  title: 'Can I CONQUER Passant?',
  name: 'Passant (Challenging AI)',
  category: 'Variants & Games',
  description: 'A chess roguelike run of rounds against the Passant AI. Win a round by checkmate (or taking the king), by checking the king six of your turns in a row, by capturing everything but the king, or by staying 7 points of material ahead for two turns. You may move into check, but losing your king ends the run. Empress = rook + knight, Amazon = queen + knight; enemy pieces next to your Courtisan are frozen.',
  how_to_win: 'Clear every round of the run.',
  player_side: 'white',
  opponent: { name: 'Passant AI', rating: null, avatar: 'assets/modes/dztzDlPfqSI/passant_ai.png', tagline: 'Preset enemy armies and boss rounds.' },
  board: { files: 8, ranks: 8, light: '#aeaeae', dark: '#5a9696', background: '#1f3b3b' },
  pieces: {
    C: { name: 'Empress', moves: 'RN', value: 850, glyph: 'R', badge: 'E' },
    M: { name: 'Amazon', moves: 'QN', value: 1200, glyph: 'Q', badge: 'A' },
    Ct: { name: 'Courtisan', moves: 'K', value: 300, glyph: 'B', badge: 'Ct' },
    U: { name: 'Man', moves: 'K', value: 300, glyph: 'K', badge: 'M' },
    Dk: { name: 'Dragon King', moves: 'Q', value: 1000, royal: true, glyph: 'K', badge: 'D' },
    Rp: { name: 'Rainbow Pawn', moves: 'fmWfcFmK', value: 350, glyph: 'P', badge: 'R' }
  },
  setup: { fen: '1n2k1n1/3ppp2/8/8/8/8/PPPPPPPP/3QK3' },
  rules: { check: { w: 'none', b: 'standard' }, castling: false, enPassant: true, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'search', depth: 3, time_ms: 550 },
  params: {"run": "Round", "money": true, "passant": true, "freezer": "Ct", "levels": [{"name": "Round 1 (challenging)", "fen": "1n2k1n1/3ppp2/8/8/8/8/PPPPPPPP/3QK3", "hint": "The queen stands in for the queen coin", "reward": 10}, {"name": "Stage 2", "fen": "2b1k2r/3p4/4b3/8/8/8/PPPPPPPP/1NB1KB2", "hint": "Two dark-squared bishops, rook and pawn", "reward": 10}, {"name": "Boss: Fischer Random", "fen": "bnrkqrnb/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR", "hint": "Six checks in a row wins too", "reward": 14}, {"name": "Final round", "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/1N[C]K[M]2R", "hint": "Empress and Amazon on your side", "reward": 16}]},
  hooks: 'g6_levels',
  todo_pass2: ["shop between rounds (buy pieces, Re-roll $2, Next Round) and Standard/Challenging/Skip round choice", "coins (queen / pawn / demotion / money) and badges", "original Passant-style piece art (Empress, Amazon, Courtisan, Man, Dragon King, Rainbow pieces)", "\"Player Turn\" banner, smoke on capture, money payout popups", "undo charges", "AI difficulty picker (Standard / Challenging / Grandmaster)"],
  source: { research: 'research/modes/dztzDlPfqSI.json', confidence: 'medium', notes: 'Armies per round from the transcript summary; exact squares invented.' }
});
