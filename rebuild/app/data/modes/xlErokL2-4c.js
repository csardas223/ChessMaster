/* Can I BEAT Beyond the Board?  Demo of a minimalist 3D puzzle adventure: it opens as a winning chess position for White;
   when you give check the pieces are "kidnapped" and the black king flees into the abyss, so you chase it as a lone
   rook over floating platforms. Enemy rooks capture you if you step into their line of sight; the Eldritch King boss
   charges a beam. Sources: research/modes/xlErokL2-4c.json (opening up two rooks and a knight vs two dark-squared
   bishops; rook puzzles; Eldritch King), frames (research/frames/video_thumbs/xlErokL2-4c_*). PASS 1: level 1 is the
   opening position vs the bot; the rook levels are original layouts on masked boards where the enemy rooks are
   sentries (they only ever capture, js/modes/g6_levels.js captureOnly via level x).
   g6-3d logic pass (2026-11-25): rule hooks below (pure, they also run inside the bot search), views/cutscenes/HUD/music
   in js/fx/g6_3d.js (CM.g6_3d.beyond):
   * kidnapping: the first time White gives check (or takes the king) on the opening board the pieces are dragged off
     into the dark and the king flees beyond the board -> the rook levels start (transcript 0:35).
   * levels[].mask: 'x' = abyss (a 'Vd' void blocker: nothing lands, passes or sees across it; drawn as no platform).
   * levels[].buttons { sq: { ticks, bridge: [squares] } | { ticks, raise: true } }: landing on a switch starts its tick
     counter (shown over the rook): bridge squares rise out of the abyss, or the Eldritch King is elevated (it can be
     taken and stops charging); every later White move ticks it down; at 0 the bridge sinks again (whatever stands on it
     falls) / the king sinks back (transcript 3:20-5:08, 20:31).
   * boss level: the Eldritch King gains a hexagon after every White move; at 4 it fires a beam along its rank or file
     at the rook (before the enemy rooks move), destroying the FIRST piece in the line: hide behind an enemy rook and the
     beam kills the rook instead (17:30-19:57). Once no enemy rook is left it fires every turn. It can only be taken
     while a switch holds it up.
   * levels[].hints: wall symbols that reveal a hint when tapped. Death (taken, beam, falling) respawns the same level.
   Not modelled: the enemy rooks' middle/corner patrol cycle (they stay put and only strike), the real demo's room
   geometry (layouts are ours, solvability checked with tools/btb_solve.js). */
CM.mode({
  id: 'xlErokL2-4c',
  title: 'Can I BEAT Beyond the Board?',
  name: 'Beyond the Board',
  category: 'Variants & Games',
  description: 'Start from a winning position; give check and the pieces are kidnapped while the king flees beyond the board. Chase it as a lone rook across floating platforms over the void: switches raise bridges for a few moves, enemy rooks take you the moment you stop in their line, and the Eldritch King charges a beam every four moves.',
  how_to_win: 'Capture the king at the end of every level.',
  player_side: 'white',
  opponent: { name: 'Eldritch King', rating: null, tagline: 'The black king that fled beyond the board.' },
  board: { files: 8, ranks: 8, light: '#c6c6c6', dark: '#2a2a2c', background: '#2b2b2e' },   /* art-3d: the game is monochrome in every gameplay frame (0:40, 3:58, 9:17, 12:22, 14:38, 20:05); the lime checker was only the thumbnail key art */
  pieces: { Vd: { name: 'Abyss', moves: '', value: 0, blocker: true, capturable: false, overlay: 'void' } },
  setup: { fen: '2b1k3/8/8/2b5/8/8/8/R2NK2R' },
  rules: { check: 'none', castling: false, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  sounds: { hymn: 'assets/modes/xlErokL2-4c/sinking_hymn.wav', beam: 'assets/modes/xlErokL2-4c/beam.wav', kidnap: 'assets/modes/xlErokL2-4c/kidnap.wav', button: 'assets/modes/xlErokL2-4c/button.wav' },
  messages: { win_title: 'The Eldritch King falls', win: 'the end of the demo' },
  params: {
    run: 'Level',
    levels: [
      { name: 'The opening', fen: '2b1k3/8/8/2b5/8/8/8/R2NK2R', hint: 'Up two rooks and a knight: give check', x: { captureOnly: null }, kidnap: true },
      { name: 'Walk the plank', fen: '8/8/8/7k/8/8/8/R7', hint: 'A rook, a plank and a fleeing king', x: { passColor: 'b' },
        mask: ['xxxxxxxx', 'xxxxxxxx', 'xxxxxxxx', '........', '.xxxxxxx', '.xxxxxxx', '.xxxxxxx', '.xxxxxxx'], plank: true },
      { name: 'The sinking hymn', fen: '7k/8/8/8/8/8/8/R7', hint: 'Switches speak in sequence', x: { passColor: 'b' },
        mask: ['xxxxxx..', 'xxxxxx.x', 'xxxxxx.x', 'xxxxxx.x', 'xxxxxx.x', '...xxx.x', '...xxx.x', '...xxxxx'],
        buttons: { c1: { ticks: 4, bridge: ['d2', 'e2', 'f2'] } },
        hints: [{ at: 'a3', text: 'Switches speak in sequence: a switch holds its bridge for as many moves as it shows.' }] },
      { name: 'Sentries', fen: '7k/8/2r5/8/8/5r2/8/R7', hint: 'Never stop in a sentry\'s line', x: { captureOnly: 'b' },
        mask: ['.....x..', '.....x..', '........', '.xx.....', '.xx.x..x', '....x...', '.xxxx...', '.....x..'],
        buttons: { e1: { ticks: 3, bridge: ['f1'] } },
        hints: [{ at: 'a5', text: 'The red rings see along their rank and file. Pass through their line, never stop in it.' }] },
      { name: 'Eldritch King', fen: '3k2r1/8/3r4/8/8/8/8/7R', hint: 'Count the hexagons. Hide behind its rooks.', x: { captureOnly: 'b' }, boss: true,
        mask: ['xxx.....', 'xxx.....', 'x.......', '........', '.x......', '........', '........', '........'],
        buttons: { b2: { ticks: 3, raise: true } },
        hints: [{ at: 'a1', text: 'On its fourth hexagon the king fires along its rank or file. The beam stops at the first piece it meets.' },
          { at: 'h4', text: 'Only a switch can lift the king to your height.' }] }
    ]
  },
  bot: { engine: 'search', depth: 2, time_ms: 300 },
  hooks: { extends: 'g6_levels',   /* art-3d look + g6-3d logic (js/fx/g6_3d.js on CM.scene3d) */
    setup: function (ctx) {
      this._base.setup.call(this, ctx);
      var lv = (ctx.params.levels || [])[this.runLevel(ctx)] || {}, V = ctx.V, g = V.geo, st = ctx.state;
      (lv.mask || []).forEach(function (row, r) { for (var c = 0; c < row.length; c++) if (row[c] === 'x') { var i = r * g.files + c; if (!st.b[i]) st.b[i] = V.piece('Vd', 'n'); } });
      Object.keys(lv.buttons || {}).forEach(function (a) { (lv.buttons[a].bridge || []).forEach(function (nm) { var j = g.parse(nm); if (j >= 0 && !st.b[j]) st.b[j] = V.piece('Vd', 'n'); }); });
      st.x = Object.assign({}, st.x, { btns: lv.buttons || null, tick: 0, act: null, hex: 0, boss: !!lv.boss, up: !lv.boss, beam: null, fell: null });
    },
    moves: function (V, st, out) {
      out = this._base.moves.call(this, V, st, out) || out;
      var x = st.x || {};
      if (x.boss && !x.up && st.turn === 'w') out = out.filter(function (m) { return !(m.cap && V.def(m.cap.t).royal); });
      return out;
    },
    onMake: function (V, st, m, n) {
      this._base.onMake.call(this, V, st, m, n);
      var x = st.x || {}; if (st.turn !== 'w' || m.pass || m.f < 0) return;
      var g = V.geo, B = x.btns, nx = n.x;
      nx.beam = null; nx.fell = null;
      function sink(a) {
        var sw = B[a]; if (!sw) return;
        if (sw.raise) nx.up = false;
        (sw.bridge || []).forEach(function (nm) { var j = g.parse(nm); if (j < 0) return; if (n.b[j] && n.b[j].t !== 'Vd') nx.fell = j; n.b[j] = V.piece('Vd', 'n'); });
      }
      if (B) {
        var tn = g.name(m.t), sw = B[tn];
        if (sw) {
          if (x.act && x.act !== tn && x.tick > 0) sink(x.act);
          nx.act = tn; nx.tick = sw.ticks;
          if (sw.raise) nx.up = true;
          (sw.bridge || []).forEach(function (nm) { var j = g.parse(nm); if (j >= 0 && n.b[j] && n.b[j].t === 'Vd') n.b[j] = null; });
        } else if (x.tick > 0) {
          nx.tick = x.tick - 1;
          if (!nx.tick) { sink(x.act); nx.act = null; }
        }
      }
      /* the Eldritch King: one hexagon per White move; at 4 it fires along its rank / file at the rook */
      if (!x.boss) return;
      var ks = -1, rook = -1, sentries = 0;
      n.b.forEach(function (p, i) { if (!p) return; if (p.c === 'b') { if (V.def(p.t).royal) ks = i; else sentries++; } else if (p.c === 'w') rook = i; });
      if (ks < 0 || rook < 0) return;
      if (nx.up) { nx.hex = 0; return; }   /* lifted by the switch: it stops charging */
      nx.hex = sentries ? Math.min(4, (x.hex || 0) + 1) : 4;
      if (nx.hex < 4) return;
      nx.hex = 0;
      var dc = g.col(rook) - g.col(ks), dr = g.row(rook) - g.row(ks);
      if (dc && dr) { nx.beam = { f: ks, t: -1, hit: -1 }; return; }   /* not in line: the beam fizzles */
      var sx = Math.sign(dc), sy = Math.sign(dr), j = ks, end = ks, hit = -1;
      for (;;) {
        var s = g.step(j, sx, sy); if (s < 0) break;
        var q = n.b[s]; end = s; j = s;
        if (!q || q.t === 'Vd') continue;
        if (V.def(q.t).blocker) break;
        hit = s; n.b[s] = null; break;
      }
      nx.beam = { f: ks, t: end, hit: hit };
    },
    checkWin: function (V, st, moves) {
      var r = this._base.checkWin.call(this, V, st, moves); if (r) return r;
      if (!(st.start && st.start.wRoyal)) {
        var any = st.b.some(function (p) { return p && p.c === 'w'; });
        if (!any) { var x = st.x || {}; return { w: 'b', why: x.fell != null ? 'the bridge sank under you' : x.beam && x.beam.hit >= 0 ? 'the Eldritch beam' : 'an enemy rook took you' }; }
      }
      return null;
    },
    status: function (ctx) {
      var s = this._base.status.call(this, ctx), x = ctx.state.x || {};
      if (x.tick > 0) s += ' · switch ' + x.tick;
      if (x.boss) s += x.up ? ' · the king is lifted' : ' · \u2b21 ' + (x.hex || 0) + '/4';
      return s;
    },
    afterMove: function (ctx, mv, info) {
      if (this._base.afterMove) this._base.afterMove.call(this, ctx, mv, info);
      return CM.g6_3d && CM.g6_3d.btbAfterMove ? CM.g6_3d.btbAfterMove(ctx, mv, info) : null;
    },
    onGameOver: function (ctx, over) {
      var k = this.runLevel(ctx);
      this._base.onGameOver.call(this, ctx, over);
      if (CM.g6_3d && CM.g6_3d.btbOver) CM.g6_3d.btbOver(ctx, over, k);
    },
    onStart: function (ctx) { if (this._base.onStart) this._base.onStart.call(this, ctx); CM.util.loadScript('js/fx/g6_3d.js').then(function () { if (CM.gameUI.controller === ctx.game) CM.g6_3d.beyond(ctx); }).catch(function (e) { console.warn(e); }); },
    onExit: function (ctx) { if (CM.g6_3d) CM.g6_3d.detach(); if (this._base.onExit) this._base.onExit.call(this, ctx); } },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/xlErokL2-4c/chess_clock.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1600, fade_ms: 300 } }],
  source: { research: 'research/modes/xlErokL2-4c.json', confidence: 'medium', notes: 'Opening squares and rook level layouts are ours (solvability checked by tools/btb_solve.js); rules, kidnapping, switches with tick counters, sentries, Eldritch hexagon beam, wall hints and the falling hymn from the transcript and frames. The sinking hymn is our own synthesised chorale (tools/g6_3d_sounds.py), never the video audio. Not modelled: the enemy rooks\' patrol cycle.' }
});
