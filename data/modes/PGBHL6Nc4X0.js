/* Chess, But SCP-2845 Alters Your Reality. Standard chess vs Stockfish (3600) with a neutral SCP-2845 (the Deer) on c4.
   It wanders one king step every round (after Black's move). Every 3 to 5 rounds (random, hidden) it alters reality:
   every piece in its 3x3 zone, either colour, is randomly rearranged among the zone's squares. That can triple pawns,
   switch a bishop's colour or leave a king capturable; capturing a king wins.
   Sources: research/modes/PGBHL6Nc4X0.json (transcript: c4 start, wanders, shuffles its 1-square radius every 3-5 turns,
   "take the king for free", ladder mate), frames (teal 3x3 aura, pink relocation paths, #ead2ba/#ae7e66).
   Shift animation matches iwantcheckmate.com/challenges/deer (teal glow under the ring fades in/out, pieces glide); no
   permanent zone highlight (2026-11-25).
   Inferred: the deer cannot be captured or blocked by being surrounded (it then stays), it keeps the centre square
   during a shuffle, pawns shuffled onto their last rank become queens. Art is original. */
(function () {
  function deerSq(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].t === 'Deer') return i; return -1; }
  function zone(ctx, s) { var g = ctx.geo, o = []; for (var dr = -1; dr <= 1; dr++) for (var dc = -1; dc <= 1; dc++) { if (!dc && !dr) continue; var j = g.step(s, dc, dr); if (j >= 0) o.push(j); } return o; }
  function nextShuffle(ctx) { return 3 + ctx.random(3); }
  function round(ctx) {
    var s = deerSq(ctx.state); if (s < 0) return null;
    var steps = zone(ctx, s).filter(function (j) { return !ctx.at(j); });
    if (steps.length) { var t = ctx.pick(steps); ctx.move(s, t); s = t; ctx.sound('deer_step'); }
    var left = (ctx.x.left == null ? nextShuffle(ctx) : ctx.x.left) - 1;
    if (left > 0) { ctx.setX('left', left); ctx.refresh(); return null; }
    ctx.setX('left', nextShuffle(ctx));
    var sq = zone(ctx, s), pieces = sq.map(function (j) { return ctx.at(j); });
    /* the glow plays even when the ring is empty (as on iwantcheckmate.com) */
    var perm = CM.util.shuffle(sq.slice()), AF = CM.abilityFx;
    /* the shift, as iwantcheckmate.com draws it: the 8 squares around the deer glow dark teal (#175b61, 85%) beneath the
       pieces over 1 s, hold 1 s, the pieces glide to their new squares (850 ms, ease-in-out), hold 1 s, the glow fades
       out over 1 s. Nothing marks the zone between shifts. */
    var stepped = steps.length > 0; ctx.refresh();
    return AF.wait(ctx, stepped ? 400 : 0)
      .then(function () { return ctx.fx({ type: 'zone', id: 'deer', squares: sq, color: '#175b61', opacity: 0.85, fade_ms: 1000, under: true }); })
      .then(function () { return AF.wait(ctx, 1000); })
      .then(function () {
        var moves = []; sq.forEach(function (from, k) { if (pieces[k] && perm[k] !== from) moves.push({ f: from, t: perm[k] }); });
        return ctx.fx({ type: 'slide', moves: moves, duration_ms: 850, easing: 'cubic-bezier(.42,0,.22,1)' });
      })
      .then(function () {
        var g = ctx.geo;
        sq.forEach(function (j) { ctx.set(j, null); });
        sq.forEach(function (from, k) {
          var p = pieces[k]; if (!p) return; var to = perm[k], np = Object.assign({}, p, { m: 1 });
          if (ctx.V.def(p.t).pawn && g.relRow(to, p.c) === g.depth(p.c) - 1) np.t = 'Q';
          ctx.set(to, np);
        });
        if (pieces.some(Boolean)) { ctx.sound('deer_alter'); ctx.toast('SCP-2845 altered reality.', 1500); }
        ctx.refresh({ instant: true });
        return AF.wait(ctx, 1000);
      })
      .then(function () { return ctx.fx({ type: 'zone_out', id: 'deer', fade_ms: 1000 }); });
  }
  CM.mode({
    id: 'PGBHL6Nc4X0',
    name: 'SCP-2845 Deer',
    category: 'Horror Chess',
    description: 'SCP-2845 starts on c4 and wanders one square every round. Every 3 to 5 rounds it alters reality: all pieces in its 3x3 zone, yours and Stockfish\'s, are shuffled randomly among those squares. A shuffle can leave a king open to capture.',
    how_to_win: 'Checkmate Stockfish, or capture its king after a shuffle exposes it.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Its calculations do not survive a reality shift.' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#ead2ba', dark: '#ae7e66' },
    pieces: { Deer: { name: 'SCP-2845', moves: '', value: 0, capturable: false, img: 'assets/modes/PGBHL6Nc4X0/deer.png', neutralGlow: false } },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', place: [{ type: 'Deer', color: 'n', at: 'c4' }] },
    bot: { engine: 'search', style: 'best', depth: 4, time_ms: 700 },
    sounds: { 'deer_step': 'assets/modes/PGBHL6Nc4X0/deer_step.wav', 'deer_alter': 'assets/modes/PGBHL6Nc4X0/deer_alter.wav' },   /* v6 per-mode sound set (tools/sfx/modes_v6.py, wire_v6.py) */
    hooks: {
      setup: function (ctx) { ctx.setX('left', nextShuffle(ctx)); },
      afterMove: function (ctx, m, info) { if (info.by !== 'bot') return null; return round(ctx); },
      status: function () { return 'Every few rounds SCP-2845 shifts reality around itself.'; }
    },
    source: { research: 'research/modes/PGBHL6Nc4X0.json', confidence: 'high', notes: 'Shuffle keeps the deer in the centre; pawns on the last rank become queens. Deer sprite (sprite-sweep): re-cut from https://i.ytimg.com/vi/PGBHL6Nc4X0/maxresdefault.jpg, chessboard and pawns keyed out, frame-cut edges feathered, centred at 90%.' }
  });
})();
