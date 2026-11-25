/* Can I BEAT 3 Check on Lichess? Three-check vs 2000-2200 lichess players (player Black in game 1).
   Sources: research/modes/Zdkiyvn1iLA.json, frames: lichess board #fefedc/#89ae66. */
CM.mode({
  id: "Zdkiyvn1iLA",
  name: "3 Check on Lichess",
  category: "Variants & Games",
  description: "Normal chess, but every check counts. The first player to give three checks wins on the spot; checkmate also wins.",
  how_to_win: "Give three checks or checkmate.",
  player_side: "black",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: {"name": "SimpleChessAmateur", "rating": 2200, "tagline": "lichess three-check player"},
  board: {"files": 8, "ranks": 8, "light": "#fefedc", "dark": "#89ae66"},
  theme: { pieces: "cburnett" },   /* lichess's default piece set, as in the frames */
  rules: {"win": [{"type": "checkmate"}, {"type": "nchecks", "n": 3}]},
  bot: {"engine": "search", "elo": 2200, "depth": 4, "time_ms": 650},
  vfx_timeline: [{"trigger": "check", "effect": {"type": "flash", "at": "to", "color": "#e8433a", "opacity": 0.35, "duration_ms": 300}}],
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/Zdkiyvn1iLA/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  hooks: {
    status: function (ctx) { var c = ctx.state.checks || {}, me = ctx.human, op = ctx.bot; return 'Checks given: you ' + (c[me] || 0) + '/3, opponent ' + (c[op] || 0) + '/3'; }
  },
  source: {"research": "research/modes/Zdkiyvn1iLA.json", "confidence": "high"}
});
