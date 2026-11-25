/* Can I BEAT Who Takes the Crown? (Influencer Levels)  "Who Takes the Crown" (called "Who Wears the Crown" in the intro): a Getting-Over-It style climb up a tower of
   chessboards; each floor is a position from a real game played against an engine (~1300 Stockfish) and checkmating
   it grants the jump to the next floor. This video plays the Influencer stack: XQC vs MoistCr1TiKaL (PogChamps, mate threat on f2), Sardoche vs Ludwig, and boards played as Black. Sources: research/modes/iqfHW2_sMmc.json, frames. PASS 1: the climb is a
   sequence of boards (js/modes/g6_levels.js); the platformer between boards is pass 2. Positions are not legible in
   the stills: they are original positions written in the spirit of the named games. */
CM.mode({
  id: 'iqfHW2_sMmc',
  title: 'Can I BEAT Who Takes the Crown? (Influencer Levels)',
  name: 'Who Takes the Crown: Influencers',
  category: 'Variants & Games',
  description: 'Climb the tower of chessboards. Each floor is a position from a famous game, played against Stockfish at about 1300. Checkmate it to earn the jump to the next floor; reach the top and take the crown.',
  how_to_win: 'Checkmate the engine on every floor.',
  player_side: 'white',
  opponent: { name: 'Stockfish', rating: 1300, avatar: 'assets/modes/iqfHW2_sMmc/stockfish.png', tagline: 'Level 1300 Stockfish on every floor.' },
  board: { files: 8, ranks: 8, light: '#fefefe', dark: '#4e2739' },
  pieces: { /* art-g6: the game's white pixel N/B/R/Q from its promotion dialog (tools/g6_art_pass2.py); pawns/kings keep the standard set (not legible in the stills) */
    N: { img: { w: 'assets/modes/iqfHW2_sMmc/pixel_wn.png', b: 'assets/pieces/cburnett/bN.svg' } }, B: { img: { w: 'assets/modes/iqfHW2_sMmc/pixel_wb.png', b: 'assets/pieces/cburnett/bB.svg' } }, R: { img: { w: 'assets/modes/iqfHW2_sMmc/pixel_wr.png', b: 'assets/pieces/cburnett/bR.svg' } }, Q: { img: { w: 'assets/modes/iqfHW2_sMmc/pixel_wq.png', b: 'assets/pieces/cburnett/bQ.svg' } }
  },
  setup: { fen: 'r1b1k2r/ppp2ppp/2n5/2b1p1q1/2B1P3/2NP1N2/PPP2PPP/R2QK2R' },
  params: { run: 'Floor', levels: [{"name": "XQC vs MoistCr1TiKaL", "fen": "r1b1k2r/ppp2ppp/2n5/2b1p1q1/2B1P3/2NP1N2/PPP2PPP/R2QK2R", "hint": "Up a piece, but watch f2"}, {"name": "Sardoche vs Ludwig", "fen": "r4rk1/pp3ppp/2n1b3/3q4/3P4/2PB1N2/P4PPP/R2Q1RK1"}, {"name": "Influencer board 3", "fen": "2kr3r/ppp2ppp/2n5/2b5/8/2N5/PPP2PPP/R1B2RK1", "hint": "Opposite-side kings: attack first"}, {"name": "The crown", "fen": "6k1/5ppp/8/8/8/8/5PPP/1Q4K1"}] },
  bot: { engine: 'auto', elo: 1320 },
  hooks: 'g6_levels',
  todo_pass2: ["platformer climb between boards (pawn climber walk / jump / fall, Getting Over It style)", "jump counter: checkmates grant jumps", "3D tower of stacked boards look, crown at the top"],
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/iqfHW2_sMmc/crowned_pawn.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }, { trigger: 'win', once: true, effect: { type: 'overlay', image: 'assets/modes/iqfHW2_sMmc/black_king_crown.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 2200, fade_ms: 300 } }],
  source: { research: 'research/modes/iqfHW2_sMmc.json', confidence: 'medium', notes: 'Positions invented in the spirit of the named games (exact FENs not established).' }
});
