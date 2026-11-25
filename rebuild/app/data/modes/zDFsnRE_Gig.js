/* Can I MASTER Who Takes the Crown?  "Who Takes the Crown" (called "Who Wears the Crown" in the intro): a Getting-Over-It style climb up a tower of
   chessboards; each floor is a position from a real game played against an engine (~1300 Stockfish) and checkmating
   it grants the jump to the next floor. Stacks: Famous / Influencer / Random (seeded); the famous stack starts with Carlsen vs Kasparov 2004 (White bishops aimed at the kingside). Sources: research/modes/zDFsnRE_Gig.json, frames. PASS 1: the climb is a
   sequence of boards (js/modes/g6_levels.js); the platformer between boards is pass 2. Positions are not legible in
   the stills: they are original positions written in the spirit of the named games.
   g6-3d logic pass (2026-11-25, js/fx/g6_3d.js): a checkmate grants a super jump (jump counter top right); then the white
   pawn climber is yours: walk / jump / super jump up the face of the next board (its pieces are ledges, the seams between
   boards are floors, fall off the side and you drop a floor; Getting Over It style, transcript 0:01, 5:56). Reaching the top
   seam starts the next floor; 'Replay board' (or New game during a climb) replays the cleared board for another jump; a
   super jump to the crown on the summit wins the run. Stack picker under the board: Famous / Influencer / Random
   (seeded random openings, same seed = same tower). Sounds: our own synthesised WAVs (tools/g6_3d_sounds.py). */
CM.mode({
  id: 'zDFsnRE_Gig',
  title: 'Can I MASTER Who Takes the Crown?',
  name: 'Who Takes the Crown: Famous Games',
  category: 'Variants & Games',
  description: 'Climb the tower of chessboards. Each floor is a position from a famous game, played against Stockfish at about 1300. Checkmate it to earn the jump to the next floor; reach the top and take the crown.',
  how_to_win: 'Checkmate the engine on every floor.',
  player_side: 'white',
  opponent: { name: 'Stockfish', rating: 1300, avatar: 'assets/modes/zDFsnRE_Gig/stockfish.png', tagline: 'Level 1300 Stockfish on every floor.' },
  board: { files: 8, ranks: 8, light: '#c1552f', dark: '#912213' },   /* art-3d: the live board's orange/brick squares sampled from the frames (zDFsnRE_Gig 5:01, iqfHW2_sMmc 1:03) */
  pieces: { /* art-g6: the game's white pixel N/B/R/Q from its promotion dialog (tools/g6_art_pass2.py); pawns/kings keep the standard set (not legible in the stills) */
    N: { img: { w: 'assets/modes/zDFsnRE_Gig/pixel_wn.png', b: 'assets/pieces/cburnett/bN.svg' } }, B: { img: { w: 'assets/modes/zDFsnRE_Gig/pixel_wb.png', b: 'assets/pieces/cburnett/bB.svg' } }, R: { img: { w: 'assets/modes/zDFsnRE_Gig/pixel_wr.png', b: 'assets/pieces/cburnett/bR.svg' } }, Q: { img: { w: 'assets/modes/zDFsnRE_Gig/pixel_wq.png', b: 'assets/pieces/cburnett/bQ.svg' } }
  },
  setup: { fen: 'r2q1rk1/pp2bppp/2n1pn2/3p4/3P4/2NBPN2/PPQ2PPP/R1B2RK1' },
  params: { run: 'Floor', levels: [{"name": "Carlsen vs Kasparov 2004", "fen": "r2q1rk1/pp2bppp/2n1pn2/3p4/3P4/2NBPN2/PPQ2PPP/R1B2RK1", "hint": "White bishops aim at the kingside"}, {"name": "Famous board 2", "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1"}, {"name": "Famous board 3", "fen": "2r3k1/5ppp/8/8/8/8/5PPP/2R2RK1"}, {"name": "The crown", "fen": "r3k2r/ppp2ppp/2n5/3q4/3P4/2N5/PPP2PPP/R2QK2R"}],
    /* g6-3d: the Stacks picker (Famous / Influencer / Random seeded); Influencer = the iqfHW2_sMmc boards */
    stacks: { Famous: [{"name": "Carlsen vs Kasparov 2004", "fen": "r2q1rk1/pp2bppp/2n1pn2/3p4/3P4/2NBPN2/PPQ2PPP/R1B2RK1", "hint": "White bishops aim at the kingside"}, {"name": "Famous board 2", "fen": "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1"}, {"name": "Famous board 3", "fen": "2r3k1/5ppp/8/8/8/8/5PPP/2R2RK1"}, {"name": "The crown", "fen": "r3k2r/ppp2ppp/2n5/3q4/3P4/2N5/PPP2PPP/R2QK2R"}],
      Influencer: [{"name": "XQC vs MoistCr1TiKaL", "fen": "r1b1k2r/ppp2ppp/2n5/2b1p1q1/2B1P3/2NP1N2/PPP2PPP/R2QK2R", "hint": "Up a piece, but watch f2"}, {"name": "Sardoche vs Ludwig", "fen": "r4rk1/pp3ppp/2n1b3/3q4/3P4/2PB1N2/P4PPP/R2Q1RK1"}, {"name": "Influencer board 3", "fen": "2kr3r/ppp2ppp/2n5/2b5/8/2N5/PPP2PPP/R1B2RK1", "hint": "Opposite-side kings: attack first"}, {"name": "The crown", "fen": "6k1/5ppp/8/8/8/8/5PPP/1Q4K1"}] } },
  bot: { engine: 'auto', elo: 1320 },
  sounds: { jump: 'assets/modes/zDFsnRE_Gig/jump.wav', superjump: 'assets/modes/zDFsnRE_Gig/superjump.wav', land: 'assets/modes/zDFsnRE_Gig/land.wav', fall: 'assets/modes/zDFsnRE_Gig/fall.wav' },
  hooks: { extends: 'g6_levels',   /* art-3d: the 3D tower of stacked boards with the crown on top; g6-3d: jumps, climb, stacks (js/fx/g6_3d.js on CM.scene3d) */
    setup: function (ctx) { if (CM.g6_3d) CM.g6_3d.towerSetup(ctx); this._base.setup.call(this, ctx); },
    onGameOver: function (ctx, over) { var k = this.runLevel(ctx); this._base.onGameOver.call(this, ctx, over); if (CM.g6_3d) CM.g6_3d.towerOver(ctx, over, k); },
    onStart: function (ctx) { if (this._base.onStart) this._base.onStart.call(this, ctx); CM.util.loadScript('js/fx/g6_3d.js').then(function () { if (CM.gameUI.controller === ctx.game) CM.g6_3d.tower(ctx, { stack: 'Famous Boards', room: true, stacks: ctx.params.stacks }); }).catch(function (e) { console.warn(e); }); },
    onUndo: function (ctx) { if (this._base.onUndo) this._base.onUndo.call(this, ctx); if (CM.g6_3d) CM.g6_3d.undo(ctx); },   /* undoing a won level keeps the run on it */
    onExit: function (ctx) { if (CM.g6_3d) CM.g6_3d.detach(); if (this._base.onExit) this._base.onExit.call(this, ctx); } },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/zDFsnRE_Gig/crowned_pawn.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }, { trigger: 'win', once: true, effect: { type: 'overlay', image: 'assets/modes/zDFsnRE_Gig/black_king_crown.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 2200, fade_ms: 300 } }],
  source: { research: 'research/modes/zDFsnRE_Gig.json', confidence: 'medium', notes: 'Carlsen-Kasparov board is an approximation; others invented.' }
});
