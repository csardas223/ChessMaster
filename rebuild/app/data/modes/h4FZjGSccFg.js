/* Can I Beat GothamChess? TIEBREAKER  Normal chess against chess.com's GothamChess bot (2500) after two earlier draws.
   Sources: research/modes/h4FZjGSccFg.json (bot 2500, gambit accepted, opposite-coloured-bishop draw), frames: brown
   board, bot chat bubble. Chat lines are original (Levy-style catchphrases). */
CM.mode({
  id: 'h4FZjGSccFg',
  name: 'GothamChess Bot (Tiebreaker)',
  category: 'Variants & Games',
  description: 'Normal chess against the GothamChess bot, rated 2500. The first two games were drawn, so this is the tiebreaker. Expect gambits and a bot that loves to talk.',
  how_to_win: 'Checkmate the GothamChess bot.',
  player_side: 'white',
  opponent: { name: 'GothamChess', rating: 2500, avatar: 'assets/avatars/bot.svg', tagline: 'International Master bot. Loves gambits.' },
  board: { files: 8, ranks: 8, light: '#f0d9b5', dark: '#b58863' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'auto', elo: 2500, time_ms: 700 },
  vfx_timeline: [ { trigger: 'ply:2', effect: { type: 'text', text: 'GothamChess: Get ready for the tiebreak.', at: 'board', duration_ms: 1800 } } ],
  messages: { draw: 'another draw: the rivalry continues' },
  source: { research: 'research/modes/h4FZjGSccFg.json', confidence: 'high' }
});
