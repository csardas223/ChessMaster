/* Can I CONQUER Passant?  Passant, a Steam chess roguelike: you play White with a small bought army against the AI's preset army each
   round. The AI is set to Challenging: round 1 vs king, two knights and three pawns; stage 2 vs two dark-squared bishops, a rook and a pawn; a Fischer Random boss won by six checks; the demo ends with a mate by an Amazon. Victory (any one): checkmate / capture the king, check the enemy king 6 of your turns in a row,
   capture every enemy piece except the king, or stay +7 material ahead for two turns. You may move into check, but if
   your king is captured you lose. Sources: research/modes/dztzDlPfqSI.json, frames (#aeaeae/#5a9696). PASS 1: the run is a
   fixed sequence of rounds (js/modes/g6_levels.js, passant + money counters); the shop, coins and badges are pass 2.
   The Courtisan freezes the enemy pieces next to it (qZyNuiVbGMI spec).    impl-6 pass 2 (8th session, js/modes/g6_levels.js run layer): SHOP between rounds (pieces / coins / Push + Slippy
   badges, Re-roll $2, Next Round), Stage Select (Standard / Challenging / Skip Round), 3 undo charges, 'Player Turn'
   banner, smoke on capture, +$ payout popup. Coin effects beyond the spec's pawn/money coins and the tile squares are
   inferred. Passant's own 3D piece set is only partly visible in the stills (no queen/rook/fairy pieces), so the
   fairy pieces keep glyph + badge. */
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
  params: { shop: { pieces: [{ t: 'P', cost: 2 }, { t: 'N', cost: 4 }, { t: 'B', cost: 4 }, { t: 'R', cost: 5 }, { t: 'Q', cost: 9 }], coins: ['queen', 'pawn', 'demotion', 'money'], coinCost: 3, badges: [{ id: 'push', name: 'Push', cost: 5 }, { id: 'slippy', name: 'Slippy', cost: 4 }], offer: 3, reroll: 2 }, stages: true, undos: 3, banner: 'Player Turn', difficulty: [{ name: 'Standard', elo: 1500, depth: 2 }, { name: 'Challenging', elo: 1900, depth: 3 }, { name: 'Grandmaster', elo: 2400, depth: 4 }], "run": "Round", "money": true, "passant": true, "freezer": "Ct", "levels": [{"name": "Round 1 (challenging)", "fen": "1n2k1n1/3ppp2/8/8/8/8/PPPPPPPP/3QK3", "hint": "The queen stands in for the queen coin", "reward": 10}, {"name": "Stage 2", "fen": "2b1k2r/3p4/4b3/8/8/8/PPPPPPPP/1NB1KB2", "hint": "Two dark-squared bishops, rook and pawn", "reward": 10}, {"name": "Boss: Fischer Random", "fen": "bnrkqrnb/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR", "hint": "Six checks in a row wins too", "reward": 14}, {"name": "Final round", "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/1N[C]K[M]2R", "hint": "Empress and Amazon on your side", "reward": 16}]},
  vfx_timeline: [{ trigger: 'capture', effect: { type: 'particles', kind: 'smoke', at: 'to', count: 14 } }],
  hooks: 'g6_levels',
  source: { research: 'research/modes/dztzDlPfqSI.json', confidence: 'medium', notes: 'Armies per round from the transcript summary; exact squares invented.' }
});
