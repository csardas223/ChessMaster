/* Can I BEAT Chess Roulette? Every move has a 1-in-6 chance to explode the moved piece, 5 bullets per side.
   Sources: research/modes/cYVauucyLyQ.json. */
CM.mode({
  id: "cYVauucyLyQ",
  name: "Chess Roulette",
  category: "Variants & Games",
  description: "Each side has 5 bullets. Every time a piece moves there is a 1 in 6 chance it explodes, using up one bullet. Once a side has used all 5 bullets its pieces are safe. Kings never explode.",
  how_to_win: "Checkmate the engine.",
  player_side: "white",
  opponent: {"name": "Stockfish", "rating": 1200, "tagline": "The roulette site's Stockfish. It ignores the bullets."},
  board: {"files": 8, "ranks": 8, "light": "#eeeed2", "dark": "#769656"},
  bot: {"engine": "search", "elo": 1200, "depth": 3, "time_ms": 600},
  params: {"bullets": 5, "odds": 6},
  hooks: {
    setup: function (ctx) { ctx.setX('bullets', { w: ctx.params.bullets, b: ctx.params.bullets }); },
    afterMove: function (ctx, m, info) {
      var bl = ctx.x.bullets || {}, c = info.side; if (!bl[c] || ctx.over) return;
      var p = ctx.at(info.to); if (!p || ctx.V.def(p.t).royal || ctx.random(ctx.params.odds) !== 0) return;
      var nb = Object.assign({}, bl); nb[c]--; ctx.setX('bullets', nb);
      ctx.remove(info.to);
      ctx.fx({ type: 'explosion', at: info.to, radius: 0, shake: false }); ctx.sound('explosion');
      ctx.toast((c === ctx.human ? 'Your ' : 'Stockfish\'s ') + (ctx.V.def(p.t).name || p.t).toLowerCase() + ' exploded! ' + nb[c] + ' bullet' + (nb[c] === 1 ? '' : 's') + ' left.', 2400);
    },
    status: function (ctx) { var b = ctx.x.bullets || {}; return 'Bullets left: you ' + (b[ctx.human] || 0) + ', Stockfish ' + (b[ctx.bot] || 0); }
  },
  source: {"notes": "Kings exempt from exploding (inferred); 1/6 per move, 5 bullets per side from the transcript.", "research": "research/modes/cYVauucyLyQ.json", "confidence": "high"}
});
