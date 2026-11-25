/* Can I MASTER Who Takes the Crown?  "Who Takes the Crown" (called "Who Wears the Crown" in the intro): a Getting-Over-It style climb up a tower of
   chessboards; each floor is a position from a real game played against an engine (~1300 Stockfish) and checkmating
   it grants the jump to the next floor. Stacks: Famous / Influencer / Random (seeded); the famous stack starts with Carlsen vs Kasparov 2004 (White bishops aimed at the kingside). Sources: research/modes/zDFsnRE_Gig.json, frames. PASS 1: the climb is a
   sequence of boards (js/modes/g6_levels.js); the platformer between boards is pass 2. Positions are not legible in
   the stills: they are original positions written in the spirit of the named games. */
CM.mode({
  id: 'zDFsnRE_Gig',
  title: 'Can I MASTER Who Takes the Crown?',
  name: 'Who Takes the Crown: Famous Games',
  category: 'Variants & Games',
  description: 'Climb the tower of chessboards. Each floor is a position from a famous game, played against Stockfish at about 1300. Checkmate it to earn the jump to the next floor; reach the top and take the crown.',
  how_to_win: 'Checkmate the engine on every floor.',
  player_side: 'white',
  opponent: { name: 'Stockfish', rating: 1300, avatar: 'assets/modes/zDFsnRE_Gig/stockfish.png', tagline: 'Level 1300 Stockfish on every floor.' },
  board: { files: 8, ranks: 8, light: '#fefefe', dark: '#4e2739' },
  pieces: { /* art-g6: the game's white pixel N/B/R/Q from its promotion dialog (tools/g6_art_pass2.py); pawns/kings keep the standard set (not legible in the stills) */
    N: { img: { w: 'assets/modes/zDFsnRE_Gig/pixel_wn.png', b: 'assets/pieces/cburnett/bN.svg' } }, B: { img: { w: 'assets/modes/zDFsnRE_Gig/pixel_wb.png', b: 'assets/pieces/cburnett/bB.svg' } }, R: { img: { w: 'assets/modes/zDFsnRE_Gig/pixel_wr.png', b: 'assets/pieces/cburnett/bR.svg' } }, Q: { img: { w: 'assets/modes/zDFsnRE_Gig/pixel_wq.png', b: 'assets/pieces/cburnett/bQ.svg' } }
  },
  setup: { fen: 'r2q1rk1/pp2bppp/2n1pn2/3p4/3P4/2NBPN2/PPQ2PPP/R1B2RK1' },
  params: { run: 'Floor', levels: [{"name": "Carlsen vs Kasparov 2004", "fen": "r2q1rk1/pp2bppp/2n1pn2/3p4/3P4/2NBPN2/PPQ2PPP/R1B2RK1", "hint": "White bishops aim at the kingside"}, {"name": "Famous board 2", "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1"}, {"name": "Famous board 3", "fen": "2r3k1/5ppp/8/8/8/8/5PPP/2R2RK1"}, {"name": "The crown", "fen": "r3k2r/ppp2ppp/2n5/3q4/3P4/2N5/PPP2PPP/R2QK2R"}] },
  bot: { engine: 'auto', elo: 1320 },
  hooks: 'g6_levels',
  todo_pass2: ["platformer climb between boards (pawn climber walk / jump / fall, Getting Over It style)", "jump counter: checkmates grant jumps", "3D tower of stacked boards look, crown at the top", "stack picker: Famous / Influencer / Random (seeded)"],
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/zDFsnRE_Gig/crowned_pawn.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }, { trigger: 'win', once: true, effect: { type: 'overlay', image: 'assets/modes/zDFsnRE_Gig/black_king_crown.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 2200, fade_ms: 300 } }],
  source: { research: 'research/modes/zDFsnRE_Gig.json', confidence: 'medium', notes: 'Carlsen-Kasparov board is an approximation; others invented.' }
});
