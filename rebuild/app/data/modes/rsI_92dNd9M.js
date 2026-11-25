/* Chess, But My Knights Can MATE. Standard chess vs Stockfish (3600), but your knights are horses that breed: when one
   of your knights ends its move next to another of your knights, a new knight is born on a random empty square next
   to the knight that moved. Moves that end away from other knights breed nothing. No limit on the herd.
   Sources: research/modes/rsI_92dNd9M.json (transcript 00:01 "knights placed adjacently reproduce to an empty
   square", 00:29 Nd4 spawns a horse on e5, 00:57 sac on d5 creates one on c6, 03:23 no spawn after a far capture),
   frames visual_a (brown #e9d3b3/#ae8265, White's knights drawn as orange horses, 4+ by midgame, purple arrows).
   Inferred: the spawn square is next to the moving knight (falls back to next to its partner); only your knights
   breed; no cap. Horse art is original. */
CM.mode({
  id: 'rsI_92dNd9M',
  name: 'Breeding Knights',
  category: 'Powerups & Rule Twists',
  description: 'Your knights are horses. Whenever one of your knights finishes a move next to another of your knights, they breed: a new knight appears on a random empty square next to the knight that moved. There is no limit, but spawning can stalemate Stockfish, so be careful.',
  how_to_win: 'Checkmate Stockfish with a herd of horses.',
  player_side: 'white',
  opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/avatars/stockfish.svg', tagline: 'Has no idea where the horses keep coming from.' },
  board: { files: 8, ranks: 8 },
  theme: { light: '#e9d3b3', dark: '#ae8265' },
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
  bot: { engine: 'search', style: 'best', depth: 4, time_ms: 800 },
  assets: { horse: 'assets/modes/rsI_92dNd9M/horse.png' },
  hooks: {
    afterMove: function (ctx, m, info) {
      if (info.by !== 'player' || ctx.over) return null;
      var p = ctx.at(m.t); if (!p || p.t !== 'N' || p.c !== ctx.human) return null;
      var g = ctx.geo, near = function (i) { var o = []; for (var dc = -1; dc <= 1; dc++) for (var dr = -1; dr <= 1; dr++) { if (!dc && !dr) continue; var j = g.step(i, dc, dr); if (j >= 0) o.push(j); } return o; };
      var mates = near(m.t).filter(function (j) { var q = ctx.at(j); return q && q.t === 'N' && q.c === ctx.human; });
      if (!mates.length) return null;
      var spots = near(m.t).filter(function (j) { return !ctx.at(j); });
      if (!spots.length) mates.forEach(function (k) { near(k).forEach(function (j) { if (!ctx.at(j) && spots.indexOf(j) < 0) spots.push(j); }); });
      if (!spots.length) return null;
      var at = ctx.pick(spots);
      ctx.spawn('N', ctx.human, at, { m: 1 });
      ctx.fx({ type: 'particles', kind: 'confetti', at: at, count: 14 });
      ctx.fx({ type: 'piece_transform', at: at, style: 'fade' });
      ctx.sound('promote');
      ctx.toast('A new horse was born on ' + ctx.name(at) + '.', 1500);
      ctx.refresh();
      return null;
    },
    decorate: function (ctx, sq, p) { if (p && p.t === 'N' && p.c === 'w') return { img: 'assets/modes/rsI_92dNd9M/horse.png' }; return null; },
    status: function (ctx) { var n = ctx.pieces(function (p) { return p.t === 'N' && p.c === ctx.human; }).length; return 'Your herd: ' + n + ' horse' + (n === 1 ? '' : 's') + '.'; }
  },
  source: { research: 'research/modes/rsI_92dNd9M.json', confidence: 'high', notes: 'Spawn square next to the mover, no cap (inferred).' }
});
