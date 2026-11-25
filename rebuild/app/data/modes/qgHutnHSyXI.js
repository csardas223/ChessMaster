/* How Many Pawns to BEAT Magnus (15 pawns on ranks 1-2, +2 per game). Sources: research/modes/qgHutnHSyXI.json. */
CM.mode({
  id: "qgHutnHSyXI",
  title: "How Many Pawns to BEAT Magnus?",
  name: "How many pawns?",
  category: "Challenges & Odds",
  description: "How Many Pawns to BEAT Magnus? Game 1: ranks 1 and 2 full of pawns around your king against Magnus's full army; two more pawns every game. Pawns on rank 1 step one square.",
  how_to_win: "Checkmate Magnus. The video stopped at about 40 pawns without a win.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: "Magnus", rating: 2882, avatar: "assets/modes/t61xLLQbotM/magnus.png", tagline: "chess.com Magnus Carlsen bot" },
  board: { files: 8, ranks: 8 },
  theme: { light: "#ebd9b4", dark: "#b28567" },
  setup: { fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/PPPPKPPP" },
  params: {
    levels: [
      { label: "15 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/PPPPKPPP" },
      { label: "17 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/3PP3/PPPPPPPP/PPPPKPPP" },
      { label: "19 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/2PPPP2/PPPPPPPP/PPPPKPPP" },
      { label: "21 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/1PPPPPP1/PPPPPPPP/PPPPKPPP" },
      { label: "23 Pawns", fen: "rnbqkbnr/pppppppp/8/8/8/PPPPPPPP/PPPPPPPP/PPPPKPPP" },
      { label: "25 Pawns", fen: "rnbqkbnr/pppppppp/8/8/3PP3/PPPPPPPP/PPPPPPPP/PPPPKPPP" },
      { label: "27 Pawns", fen: "rnbqkbnr/pppppppp/8/8/2PPPP2/PPPPPPPP/PPPPPPPP/PPPPKPPP" }
    ],
    advance: "fail",
    unit: "Pawns"
  },
  hooks: {
    extends: "g3_ladder",
    /* pol-q4: a pawn that steps from rank 1 onto rank 2 may still double-step later, like in the video (the engine marks it
       as moved, so reset its moved flag once it lands on its own second rank) */
    afterMove: function (ctx, m, info) {
      var p = ctx.at(m.t), g = ctx.geo;
      if (p && p.m && ctx.V.def(p.t).pawn && g.relRow(m.f, p.c) === 0 && g.relRow(m.t, p.c) === 1) ctx.transform(m.t, { props: { m: 0 } });
      return this._base.afterMove ? this._base.afterMove(ctx, m, info) : null;
    }
  },
  source: {
    confidence: "medium",
    notes: "Pawns on rank 1 step one square; once on rank 2 they may double-step (afterMove resets the moved flag, pol-q4).",
    research: "research/modes/qgHutnHSyXI.json"
  }
});
