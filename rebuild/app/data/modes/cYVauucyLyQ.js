/* Can I BEAT Chess Roulette? Every move has a 1-in-6 chance to explode the moved piece, 5 bullets per side.
   Sources: research/modes/cYVauucyLyQ.json. */
CM.mode({
  id: "cYVauucyLyQ",
  name: "Chess Roulette",
  category: "Variants & Games",
  description: "Each side has 5 bullets. Every time a piece moves there is a 1 in 6 chance it explodes, using up one bullet. Once a side has used all 5 bullets its pieces are safe. Kings never explode.",
  how_to_win: "Checkmate the engine.",
  player_side: "white",
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: {"avatar": "assets/modes/cYVauucyLyQ/bar_stockfish.png" /* the site's bar icon (maxres2) */, "name": "Stockfish", "rating": 1200, "tagline": "The roulette site's Stockfish. It ignores the bullets."},
  board: {"files": 8, "ranks": 8, "light": "#ababab", "dark": "#4d4d4d"},   /* the roulette site's grey board, sampled from maxres1 */
  theme: { pieces: '../modes/cYVauucyLyQ/pieces', background: '#000000' },   /* the site's pixel silhouette set, cut from the stills (tools/g5_frames2.py) */
  assets: { splat: 'assets/modes/cYVauucyLyQ/splat.png', skull: 'assets/modes/cYVauucyLyQ/skull.png' },
  bot: {"engine": "search", "elo": 1200, "depth": 3, "time_ms": 600},
  params: {"bullets": 5, "odds": 6},
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/cYVauucyLyQ/intro.jpg', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }],
  /* As in the video: an exploded piece leaves a red splat on its square for the rest of the game, and the site shows
     its white skull card while the shot goes off (maxres1/maxres2 stills). */
  hooks: {
    setup: function (ctx) { ctx.setX('bullets', { w: ctx.params.bullets, b: ctx.params.bullets }); ctx.setX('splats', []); },
    afterMove: function (ctx, m, info) {
      var bl = ctx.x.bullets || {}, c = info.side; if (!bl[c] || ctx.over) return;
      var p = ctx.at(info.to); if (!p || ctx.V.def(p.t).royal || ctx.random(ctx.params.odds) !== 0) return;
      var nb = Object.assign({}, bl); nb[c]--; ctx.setX('bullets', nb);
      ctx.remove(info.to); ctx.setX('splats', (ctx.x.splats || []).concat([info.to]));
      ctx.fx({ type: 'overlay', at: 'board', image: ctx.spec.assets.skull, fit: '44% auto', duration_ms: 900, fade_ms: 120, id: 'g5skull' }); ctx.sound('explosion');
      ctx.toast((c === ctx.human ? 'Your ' : 'Stockfish\'s ') + (ctx.V.def(p.t).name || p.t).toLowerCase() + ' exploded! ' + nb[c] + ' bullet' + (nb[c] === 1 ? '' : 's') + ' left.', 2400);
    },
    decorate: function (ctx, sq, p) {
      return !p && (ctx.x.splats || []).indexOf(sq) >= 0 ? { html: '<img alt="" src="' + ctx.spec.assets.splat + '" style="position:absolute;inset:4%;width:92%;height:92%;pointer-events:none;image-rendering:pixelated">' } : null;
    },
    status: function (ctx) { var b = ctx.x.bullets || {}; return 'Bullets left: you ' + (b[ctx.human] || 0) + ', Stockfish ' + (b[ctx.bot] || 0); }
  },
  source: {"notes": "Kings exempt from exploding (inferred); 1/6 per move, 5 bullets per side from the transcript.", "research": "research/modes/cYVauucyLyQ.json", "confidence": "high"}
});
