/* 1 Variant, 18 New Pieces: Tony plays "Meta Chess", where each piece slot is drafted from ~18 variant pieces and two
   immovable Rocks sit in the centre. This mode plays his drafted army (Voids for rooks, Dragonflies, Snipers, Medusa)
   against Sarah (1600) with a mixed army. Sources: research/modes/VVuAgqLzD_o.json (on-screen descriptions 5:43-7:31),
   research/frames (green board, grey rocks on d4/e5). */
(function () {
  function fr(V, c) { var R = V.geo.FR(c === 'n' ? 'w' : c); return R; }
  function step(V, i, c, vx, vy) { var R = fr(V, c); return V.geo.step(i, vx * R.R[0] + vy * R.F[0], vx * R.R[1] + vy * R.F[1]); }
  function isRock(V, p) { return p && p.t === 'Rock'; }
  var H = {
    /* Sniper: moves up to 2 left/right/back and 1 forward (empty squares only); captures only the farthest square of
       each diagonal, jumping every piece in between. */
    sniper: function (V, st, i, p, out) {
      var b = st.b;
      [[-1, 0, 2], [1, 0, 2], [0, -1, 2], [0, 1, 1]].forEach(function (d) {
        var j = i;
        for (var s = 0; s < d[2]; s++) { j = step(V, j, p.c, d[0], d[1]); if (j < 0 || b[j]) break; out.push({ f: i, t: j, p: p.t, c: p.c, cap: null }); }
      });
      [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(function (d) {
        var j = i, last = -1;
        while (true) { j = step(V, j, p.c, d[0], d[1]); if (j < 0) break; last = j; }
        if (last < 0 || last === i) return;
        var q = b[last];
        if (q && V.isEnemy(p.c, q.c) && V.canCapture(p, q)) out.push({ f: i, t: last, p: p.t, c: p.c, cap: q, capSq: last });
      });
    },
    /* Void (Phantom of the Abyss): slides left/right, passing through Rocks, capturing the first enemy beyond them. */
    voidp: function (V, st, i, p, out) {
      var b = st.b;
      [-1, 1].forEach(function (dx) {
        var j = i;
        while (true) {
          j = step(V, j, p.c, dx, 0); if (j < 0) break;
          var q = b[j];
          if (isRock(V, q)) continue;
          if (q) { if (V.isEnemy(p.c, q.c) && V.canCapture(p, q)) out.push({ f: i, t: j, p: p.t, c: p.c, cap: q, capSq: j }); break; }
          out.push({ f: i, t: j, p: p.t, c: p.c, cap: null });
        }
      });
    },
    /* Medusa: after a quiet move, non-royal enemies on the 3 squares straight in front of her turn to stone (Rocks). */
    onMake: function (V, prev, m, n) {
      if (m.p !== 'Medusa' || m.cap || m.drop) return;
      var j = m.t;
      for (var s = 0; s < 3; s++) {
        j = step(V, j, m.c, 0, 1); if (j < 0) break;
        var q = n.b[j];
        if (q && q.c !== m.c && q.c !== 'n' && !V.def(q.t).royal) { n.b[j] = { t: 'Rock', c: 'n', m: 1, stone: 1 }; n.x.petrified = (n.x.petrified || 0) + 1; }
      }
    },
    afterMove: function (ctx, m, info) {
      if (m.p === 'Medusa' && !m.cap && (ctx.x.petrified || 0) > (ctx.x._seenPet || 0)) {
        ctx.setX('_seenPet', ctx.x.petrified);
        ctx.fx({ type: 'flash', at: info.toName, color: '#3f8f46', opacity: 0.45, duration_ms: 420 });
        ctx.sound('petrify');
        ctx.toast('Medusa turns a piece to stone.', 1400);
      }
    },
    decorate: function (ctx, sq, p) { return p && p.stone ? { cls: 'mc-stone' } : null; },
    init: function () {
      if (document.getElementById('mc-css')) return;
      var s = document.createElement('style'); s.id = 'mc-css';
      s.textContent = '.sq.mc-stone .pc{filter:sepia(.25) saturate(.6) brightness(.95)}';
      document.head.appendChild(s);
    }
  };
  CM.mode({
    id: 'VVuAgqLzD_o',
    title: '1 Variant, 18 New Pieces',
    name: 'Meta Chess Draft',
    category: 'Challenges & Odds',
    description: 'Meta Chess: every slot is a drafted variant piece and two Rocks (never move, never captured) block d4 and e5. Your army: Voids (rook slots, slide sideways straight through Rocks), Dragonflies (knight leaps forward, or one step diagonally back), Snipers (step up to 2 sideways/back or 1 forward; capture only the farthest square of a diagonal, jumping everything), and Medusa (king steps, captures up to 2 squares ahead; a quiet move petrifies enemies on the 3 squares in front of her). Sarah has Sumos (capture anywhere in the 3x2 block ahead or one square behind), Camels (3,1 leap) and an Empress (rook + knight).',
    how_to_win: 'Checkmate Sarah (1600). The video took several games to win one.',
    player_side: 'white',
    player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
    opponent: { name: 'Sarah', rating: 1600, avatar: 'assets/modes/VVuAgqLzD_o/metachess.png', tagline: 'Meta Chess bot (1600)' },
    board: { files: 8, ranks: 8 },
    theme: { light: '#e9edd0', dark: '#749c53' },
    pieces: {
      Rock: { name: 'Rock', moves: '', value: 0, blocker: true, capturable: false, img: 'assets/modes/VVuAgqLzD_o/rock.png' },
      Void: { name: 'Void (Phantom of the Abyss)', value: 380, gen: 'voidp', castleRook: true, glyph: 'R' },
      Fly: { name: 'Dragonfly', value: 220, moves: [{ v: [[1, 2], [-1, 2], [2, 1], [-2, 1]] }, { v: [[1, -1], [-1, -1]] }],
        img: { w: 'assets/modes/VVuAgqLzD_o/dragonfly_w.png', b: 'assets/modes/VVuAgqLzD_o/dragonfly_w.png' } },
      Sniper: { name: 'Sniper', value: 360, gen: 'sniper', img: { w: 'assets/modes/VVuAgqLzD_o/sniper_w.png', b: 'assets/modes/VVuAgqLzD_o/sniper_w.png' } },
      Medusa: { name: 'Medusa', value: 650, moves: 'mKcfW2', img: { w: 'assets/modes/VVuAgqLzD_o/medusa_w.png', b: 'assets/modes/VVuAgqLzD_o/medusa_w.png' } },
      Sumo: { name: 'Sumo (Immovable Mountain)', value: 420, castleRook: true,
        moves: ['mK', { v: [[-1, 1], [0, 1], [1, 1], [-1, 2], [0, 2], [1, 2], [0, -1]], mode: 'c' }],
        img: { w: 'assets/modes/VVuAgqLzD_o/sumo_b.png', b: 'assets/modes/VVuAgqLzD_o/sumo_b.png' } },
      Camel: { name: 'Camel', moves: 'C', value: 270, img: { w: 'assets/modes/VVuAgqLzD_o/camel_b.png', b: 'assets/modes/VVuAgqLzD_o/camel_b.png' } },
      Empress: { name: 'Empress', moves: 'RN', value: 850, glyph: 'Q', badge: 'RN' }
    },
    setup: { fen: '[sumo][camel]b[empress]kb[camel][sumo]/pppppppp/8/4[n:Rock]3/3[n:Rock]4/8/PPPPPPPP/[Void][Fly][Sniper][Medusa]K[Sniper][Fly][Void]' },
    rules: { promotion: { choices: ['Q', 'R', 'B', 'N'] } },
    bot: { engine: 'search', elo: 1600, depth: 3, time_ms: 700 },
    sounds: { petrify: 'assets/modes/VVuAgqLzD_o/petrify.wav' },
    hooks: H,
    source: {
      research: 'research/modes/VVuAgqLzD_o.json',
      confidence: 'medium',
      notes: 'Exact drafted slots and Sarah\'s game-1 army are not fully visible: player army = Voids/Dragonflies/Snipers/Medusa (from the commentary), Sarah = Sumo/Camel/Empress (inferred). Medusa "3 tiles in front" read as the 3 squares straight ahead. Kraken/Scout/Pegasus/Jester not drafted here. Void is drawn from one image for both colours (only White has Voids).'
    }
  });
})();
