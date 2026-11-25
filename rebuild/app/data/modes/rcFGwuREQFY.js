/* Can I BEAT DougDoug's Chess Variant? (Choice Chess)  Normal 3+0 chess, but every few turns the side to move picks one
   of three random effect cards (70+ effects on the site: instant, or lasting a few moves). Sources:
   research/modes/rcFGwuREQFY.json, frames maxres1 (dark choice cards: Second Chance, Dub Thee Knight), transcript
   (Hobbit Slaughter, Early Promotion, March of the Ponguins, Pawns Learn Strength), thumbnail cards ("Sacrifice 1 point
   of material", "Delete your firstborn child"). Every 4th move of each side; the bot picks at random. */
CM.mode({
  id: 'rcFGwuREQFY',
  title: "Can I BEAT DougDoug's Chess Variant? (Choice Chess)",
  name: 'Choice Chess (DougDoug)',
  category: 'Variants & Games',
  description: 'Normal chess with a twist every few turns: three random effect cards are drawn and one of them happens. Effects can spawn, delete, upgrade or downgrade pieces.',
  how_to_win: 'Checkmate your opponent.',
  player_side: 'white',
  opponent: { name: 'Ch1knW4ng', rating: null, tagline: 'Online opponent on the Choice Chess site.' },
  board: { files: 8, ranks: 8, light: '#eaead2', dark: '#7ea25a' },
  rules: { castling: true, enPassant: true, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  clock: { w: 180, b: 180, inc: 0, bot: false },
  bot: { engine: 'search', depth: 3, time_ms: 500 },
  params: { every: 4 },
  /* impl-6 pass 2: the site's choice UI as in the video frames (dark rounded cards, green effect name, italic text,
     duration strip, "White Turn" / "Black Turn" header). Every 4th move of a side that side picks 1 of 3 cards; the bot
     picks at random. Effects are the ones named in the video and on its thumbnail; durations as shown on the cards. */
  hooks: {
    filterMoves: function (V, st, legal) {   // Hobbit Slaughter: only pawns can die
      var x = st.x || {}; if (!(x.hobbit > 0)) return legal;
      return legal.filter(function (m) { return !m.cap || m.cap.t === 'P'; });
    },
    setup: function (ctx) { var el = document.getElementById('g6-choice'); if (el) el.remove(); },
    onExit: function () { var el = document.getElementById('g6-choice'); if (el) el.remove(); },
    status: function (ctx) {
      var x = ctx.x || {}, on = [];
      if (x.hobbit > 0) on.push('Hobbit Slaughter (' + x.hobbit + ')');
      if (x.second > 0) on.push('Second Chance (' + x.second + ')');
      if (x.early > 0) on.push('Early Promotion (' + x.early + ')');
      return on.length ? 'Active: ' + on.join(' · ') : null;
    },
    afterMove: function (ctx, mv, info) {
      if (ctx.over) return;
      var V = ctx.V, x = ctx.x || {}, me = info.side, foe = me === 'w' ? 'b' : 'w';
      /* lasting effects tick once per ply */
      if (info.capture && x.second > 0 && ctx.chance(0.5)) {
        var e0 = ctx.emptySquares(); if (e0.length) { var at0 = ctx.pick(e0); ctx.spawn(info.captured, info.capturedColor || foe, at0); ctx.fx({ type: 'flash', at: ctx.name(at0), color: '#a3d160', opacity: 0.5 }); ctx.toast('Second Chance: the piece is revived!', 2200); }
      }
      if (x.early > 0) ctx.pieces(function (p) { return p.t === 'P'; }).forEach(function (i) { var p = ctx.at(i); if (V.geo.relRow(i, p.c) >= 5) ctx.transform(i, { type: 'Q' }); });
      ['hobbit', 'second', 'early'].forEach(function (k) { if (ctx.x[k] > 0) ctx.setX(k, ctx.x[k] - 1); });
      var n = Math.ceil(info.ply / 2); if (n % (ctx.params.every || 4) !== 0) { ctx.refresh(); return; }
      var rnd = function (a, b) { return a + ctx.random(b - a + 1); };
      var mine = function (c, f) { return ctx.pieces(function (p) { return p.c === c && !V.def(p.t).royal && (!f || f(p)); }); };
      var E = [
        { n: 'Second Chance', d: 'When any Piece dies, 50% chance it is revived in a random empty square', len: '3-5 moves', run: function () { ctx.setX('second', 2 * rnd(3, 5)); } },
        { n: 'Dub Thee Knight', d: 'Two random Pawns become Knights', len: 'Instant', run: function () { var l = mine(me, function (p) { return p.t === 'P'; }); for (var k = 0; k < 2 && l.length; k++) { var i = l.splice(ctx.random(l.length), 1)[0]; ctx.transform(i, { type: 'N' }); } } },
        { n: 'Hobbit Slaughter', d: 'Only Pawns can die', len: '2-4 moves', run: function () { ctx.setX('hobbit', 2 * rnd(2, 4)); } },
        { n: 'Early Promotion', d: 'Pawns promote on the 6th rank', len: '3-5 moves', run: function () { ctx.setX('early', 2 * rnd(3, 5)); } },
        { n: 'March of the Ponguins', d: 'All Pawns advance one square if it is empty. No captures', len: 'Instant', run: function () {
            ctx.pieces(function (p) { return p.t === 'P'; }).sort(function (a, b) { return V.geo.relRow(b, ctx.at(b).c) - V.geo.relRow(a, ctx.at(a).c); }).forEach(function (i) {
              var p = ctx.at(i), j = V.geo.step(i, 0, p.c === 'w' ? -1 : 1); if (j >= 0 && !ctx.at(j) && V.geo.relRow(j, p.c) < V.geo.depth(p.c) - 1) ctx.move(i, j); }); } },
        { n: 'Sacrifice 1 point of material', d: 'A random Pawn of yours is removed', len: 'Instant', run: function () { var l = mine(me, function (p) { return p.t === 'P'; }); if (l.length) ctx.remove(ctx.pick(l)); } },
        { n: 'Delete your firstborn child', d: 'Your leftmost Pawn is removed', len: 'Instant', run: function () { var l = mine(me, function (p) { return p.t === 'P'; }); if (l.length) { l.sort(function (a, b) { return V.geo.col(a) - V.geo.col(b); }); ctx.remove(l[0]); } } }
      ];
      var draw = []; while (draw.length < 3) { var c = ctx.pick(E); if (draw.indexOf(c) < 0) draw.push(c); }
      var apply = function (card) {
        var el = document.getElementById('g6-choice'); if (el) el.remove();
        card.run(); ctx.toast((me === ctx.human ? 'You picked ' : 'Opponent picked ') + card.n, 2600); ctx.refresh();
      };
      var wrap = document.getElementById('board-wrap');
      var esc = function (t) { return String(t).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); };
      return new Promise(function (res) {
        if (!wrap) { apply(ctx.pick(draw)); return res(); }
        var el = document.createElement('div'); el.id = 'g6-choice';
        el.style.cssText = 'position:absolute;inset:0;z-index:30;display:flex;flex-direction:column;gap:6px;padding:6%;background:rgba(0,0,0,.55);font-family:inherit;opacity:0;transition:opacity .22s ease-out';
        el.innerHTML = '<div style="background:#f3f3f3;color:#222;border-radius:6px;text-align:center;font-weight:700;padding:6px">' + (me === 'w' ? 'White' : 'Black') + ' Turn</div>' +
          draw.map(function (d, k) { return '<button type="button" data-k="' + k + '" style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:4px;background:#262522;border:2px solid #f3f3f3;border-radius:8px;color:#ccc;padding:6px 8px;cursor:' + (me === ctx.human ? 'pointer' : 'default') + ';font:inherit">' +
            '<b style="color:#a3d160;font-size:15px">' + esc(d.n) + '</b><i style="font-size:12px;line-height:1.3">' + esc(d.d) + '</i>' +
            '<span style="background:#2f3b26;color:#a3d160;font-size:11px;font-weight:700;border-radius:3px;padding:2px">' + esc(d.len) + '</span></button>'; }).join('');
        wrap.appendChild(el); requestAnimationFrame(function () { el.style.opacity = '1'; });
        if (me === ctx.human) el.onclick = function (e) { var b = e.target.closest('[data-k]'); if (!b) return; apply(draw[+b.dataset.k]); res(); };
        else ctx.after(1400, function () { var k = ctx.random(3), b = el.querySelector('[data-k="' + k + '"]'); if (b) b.style.borderColor = '#a3d160'; ctx.after(500, function () { apply(draw[k]); res(); }); });
      });
    }
  },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/rcFGwuREQFY/intro.jpg', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/rcFGwuREQFY.json', confidence: 'medium', notes: 'Effects are the ones named in the video and thumbnail (the site has 70+); exact durations of lasting effects inferred from the 2-4 / 3-5 move strips on the cards.' }
});
