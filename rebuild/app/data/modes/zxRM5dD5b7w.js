/* Can I BEAT Chess Knightmare?  Indie Steam game: REAL-TIME chess with no turns, you control one white piece (mostly a
   knight) and race to capture the black king while the AI's pieces move on their own and take you if you linger in
   their range. Themed levels ('10 million rooks', all dark-squared bishops), a placeable invulnerable Rock.
   Sources: research/modes/zxRM5dD5b7w.json (own srt: "no turns", wiggle tell, Rock on right click, overworld map with
   padlocks / cow / trophy, bracket, knight-sequence memory minigame with a high score of 9), frames
   (#42ba06/#723606 green/brown, red danger / green safe squares).
   cm-g6b pass 2 (2026-11-25): real time on top of the turn-based SpecGame (the g5_realtime trick: after your move the turn
   comes straight back to you; every enemy move is scheduled on a timer, the chosen piece wiggles first (the video's tell),
   then moves). Enemy AI: takes your piece when it can, else prefers moves that attack your piece, else a random move
   (inferred). Rock power-up: one Rock per level in your hand (tap it, then a free square; right click on desktop arms it
   too): it can't be taken and can't take. Overworld map (padlocked tiles = the video's locked tile, the cow tile, the trophy
   at the end; progress kept in localStorage), the bracket (three levels in a row, a loss sends you back to its start) and the
   knight-sequence memory minigame (repeat the knight's moves; score = longest sequence).
   Inferred: level armies and timers, enemy move rate. Knight / Rock art: no repo sprite or still shows them (the three
   research sprites are map tiles), so the knight is the standard piece and the Rock uses the engine's wall drawing. */
CM.mode({
  id: 'zxRM5dD5b7w',
  title: 'Can I BEAT Chess Knightmare?',
  name: 'Chess Knightmare',
  category: 'Variants & Games',
  description: 'Real time, no turns: you have one white piece, usually a knight, against a whole enemy army that moves on its own. An enemy piece wiggles just before it moves. Red squares are attacked, green ones are safe. Capture the black king; if an enemy can reach your piece it will take it. Each level gives you one Rock to drop on a free square: it blocks lines and can never be taken.',
  how_to_win: 'Capture the black king in every level of the map, bracket and final included.',
  player_side: 'white',
  opponent: { name: 'Knightmare AI', rating: null, avatar: 'assets/modes/zxRM5dD5b7w/cow.png', tagline: 'Enemy pieces wiggle before they move.' },
  board: { files: 8, ranks: 8, light: '#42ba06', dark: '#723606' },
  pieces: {
    Rk: { name: 'Rock', moves: '', value: 0, blocker: true, capturable: false, overlay: 'wall' }
  },
  setup: { fen: '4k3/8/8/8/8/8/8/4K3', hands: { w: [], b: [] } },
  rules: { check: 'none', castling: false, enPassant: false, drops: true, promotion: { auto: 'Q', choices: ['Q'] }, stalemate: 'draw', drawPlies: 9999, win: [] },
  params: {
    levels: [
      { name: 'Tutorial: king', fen: '4k3/8/8/3p4/8/8/8/4K3', ms: 1700, hint: 'You are the king this time. Take the black king.' },
      { name: 'Tutorial: pawn', fen: '4k3/8/8/8/8/8/3P4/8', ms: 1700, hint: 'Promote, then hunt' },
      { name: 'First knight', fen: '4k3/2p2p2/8/8/8/8/8/1N6', ms: 1500 },
      { name: 'Divorce', fen: '3qk3/8/8/8/8/8/8/1N6', ms: 1400, hint: 'The queen will not leave the king alone' },
      { name: 'The Swedish cow', fen: '4k3/1p1n1p2/8/8/8/8/8/6N1', ms: 1300, cow: true },
      { name: '10 million rooks', fen: 'r3k2r/8/8/r6r/8/8/8/1N6', ms: 1300, hint: 'Rooks everywhere: only the knight squares are safe' },
      { name: 'Bracket 1/3', fen: '2b1k1n1/3p4/8/8/8/8/8/1N6', ms: 1200, bracket: 1 },
      { name: 'Bracket 2/3', fen: 'r2bk3/2p1p3/8/8/8/8/8/6N1', ms: 1100, bracket: 1 },
      { name: 'Bracket 3/3', fen: '1n2k1r1/2pp4/5b2/8/8/8/8/1N6', ms: 1000, bracket: 1 },
      { name: 'Final: dark-squared bishops', fen: '1b1kb3/8/1b3b2/8/3b4/8/8/6N1', ms: 1000, hint: 'Stay on the light squares', trophy: true }
    ]
  },
  bot: { engine: 'random' },
  vfx_timeline: [{ trigger: 'win', once: true, effect: { type: 'overlay', image: 'assets/modes/zxRM5dD5b7w/trophy.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 2200, fade_ms: 300 } }],
  hooks: (function () {
    var KEY = 'knightmare.progress', run = { k: null, next: 0, plan: null, memo: null };
    function prog() { return CM.store.get(KEY, { open: 1, best: 0 }); }
    function save(p) { CM.store.set(KEY, p); }
    function L(ctx) { return ctx.params.levels; }
    function lv(ctx) { return L(ctx)[run.k] || L(ctx)[0]; }
    function mine(st) { for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === 'w' && p.t !== 'Rk') return i; } return -1; }
    function css() {
      if (document.getElementById('km-css')) return; var s = document.createElement('style'); s.id = 'km-css';
      s.textContent = '.km-red{position:absolute;inset:0;background:rgba(220,40,30,.38);pointer-events:none}.km-green{position:absolute;inset:0;background:rgba(150,255,120,.35);pointer-events:none}' +
        '#km-map{position:absolute;inset:0;z-index:30;overflow:auto;background:#42ba06;padding:10px;display:flex;flex-direction:column;gap:8px;color:#fff;font:14px/1.3 system-ui,sans-serif}' +
        '#km-map .path{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;background:#c9a26b;border-radius:14px;padding:12px}' +
        '#km-map .tile{position:relative;aspect-ratio:1;border:0;border-radius:10px;background:#723606;color:#fff;font-weight:700;font-size:12px;cursor:pointer;display:flex;align-items:flex-end;justify-content:center;padding:3px;overflow:hidden}' +
        '#km-map .tile img{position:absolute;inset:6%;width:88%;height:88%;object-fit:contain}#km-map .tile span{position:relative;text-shadow:0 1px 2px #000}' +
        '#km-map .tile.done{outline:3px solid #ffd75a}#km-map .tile:disabled{cursor:default}' +
        '#km-mem .g{display:grid;grid-template-columns:repeat(8,1fr);width:min(88vw,330px);margin:auto;border:3px solid #2b1a08}#km-mem .g i{aspect-ratio:1;display:block;transition:background .2s ease-out}' +
        '#km-mem .g i.l{background:#42ba06}#km-mem .g i.d{background:#723606}#km-mem .g i.on{background:#ffd75a}#km-mem .g i.k{background-size:90%;background-repeat:no-repeat;background-position:center}';
      document.head.appendChild(s);
    }
    function close(id) { var e = document.getElementById(id); if (e) e.remove(); }
    function map(ctx) {   /* the overworld: padlocked tiles, the cow, the trophy at the end; tap an open level to play it */
      var wrap = document.getElementById('board-wrap'); if (!wrap) return; css(); close('km-map');
      var P = prog(), el = document.createElement('div'); el.id = 'km-map';
      el.innerHTML = '<b style="font-size:18px;text-align:center;text-shadow:0 2px 0 #1f5a03">Chess Knightmare</b><div class="path">' + L(ctx).map(function (l, k) {
        var open = k < P.open, img = !open ? 'locked_level.png' : l.trophy ? 'trophy.png' : l.cow ? 'cow.png' : '';
        return '<button type="button" class="tile' + (k < P.open - 1 ? ' done' : '') + '" data-k="' + k + '"' + (open ? '' : ' disabled') + '>' + (img ? '<img alt="" src="assets/modes/zxRM5dD5b7w/' + img + '">' : '<b style="position:absolute;top:22%;font-size:26px">' + (k + 1) + '</b>') + '<span>' + CM.util.esc(l.name) + '</span></button>';
      }).join('') + '</div><button type="button" class="btn" data-mem="1" style="background:#723606">Knight memory minigame (best ' + (P.best || 0) + ')</button>' +
        (run.k != null ? '<button type="button" class="btn" data-close="1">Back to the level</button>' : '');
      el.onclick = function (e) {
        var b = e.target.closest('[data-k],[data-mem],[data-close]'); if (!b || b.disabled) return;
        if (b.dataset.mem) { memory(ctx); return; }
        el.remove(); if (b.dataset.k != null) { run.k = +b.dataset.k; ctx.game.newGame(); }
      };
      wrap.appendChild(el);
    }
    function memory(ctx) {   /* repeat the sequence of knight moves; each round adds one move */
      var wrap = document.getElementById('board-wrap'); if (!wrap) return; css(); close('km-mem');
      var el = document.createElement('div'); el.id = 'km-mem'; el.style.cssText = 'position:absolute;inset:0;z-index:31;background:rgba(20,40,8,.97);padding:10px;display:flex;flex-direction:column;gap:8px;color:#fff;font:14px/1.3 system-ui,sans-serif';
      var cells = ''; for (var i = 0; i < 64; i++) cells += '<i data-i="' + i + '" class="' + (((i >> 3) + i) % 2 ? 'd' : 'l') + '"></i>';
      el.innerHTML = '<b style="text-align:center;font-size:17px">Knight memory</b><div id="km-msg" style="text-align:center">Watch the knight, then repeat its moves.</div><div class="g">' + cells + '</div><button type="button" class="btn" data-x="1">Close</button>';
      wrap.appendChild(el);
      var g = el.querySelector('.g'), msg = el.querySelector('#km-msg'), seq = [], pos = 0, at = 0, input = false, tm = [];
      var knight = ctx.game.pieceImage({ t: 'N', c: 'w' });
      function hops(s) { var c = s & 7, r = s >> 3, o = []; [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]].forEach(function (d) { var c2 = c + d[0], r2 = r + d[1]; if (c2 >= 0 && c2 < 8 && r2 >= 0 && r2 < 8) o.push(r2 * 8 + c2); }); return o; }
      function cell(i) { return g.children[i]; }
      function put(i) { Array.prototype.forEach.call(g.children, function (c) { c.classList.remove('k'); c.style.backgroundImage = ''; }); cell(i).classList.add('k'); cell(i).style.backgroundImage = 'url("' + knight + '")'; }
      function flash(i) { cell(i).classList.add('on'); tm.push(setTimeout(function () { cell(i).classList.remove('on'); }, 380)); }
      function round() {
        var last = seq.length ? seq[seq.length - 1] : at, h = hops(last); seq.push(h[Math.floor(Math.random() * h.length)]);
        input = false; put(at); msg.textContent = 'Sequence ' + seq.length + ': watch...';
        seq.forEach(function (s, k) { tm.push(setTimeout(function () { put(s); flash(s); CM.sound.play('move-self'); }, 600 + k * 620)); });
        tm.push(setTimeout(function () { put(at); pos = 0; input = true; msg.textContent = 'Your turn: ' + seq.length + ' move' + (seq.length > 1 ? 's' : ''); }, 600 + seq.length * 620 + 300));
      }
      at = 27; round();
      el.onclick = function (e) {
        if (e.target.closest('[data-x]')) { tm.forEach(clearTimeout); el.remove(); var m = document.getElementById('km-map'); if (m) map(ctx); return; }
        var c = e.target.closest('[data-i]'); if (!c || !input) return; var i = +c.dataset.i;
        if (i === seq[pos]) { put(i); flash(i); CM.sound.play('move-self'); pos++; if (pos === seq.length) { input = false; var P = prog(); if (seq.length > (P.best || 0)) { P.best = seq.length; save(P); } msg.textContent = 'Correct! Score ' + seq.length; tm.push(setTimeout(round, 900)); } }
        else { input = false; CM.sound.play('illegal'); msg.textContent = 'Wrong square. Score ' + (seq.length - 1) + ' (best ' + prog().best + '). Tap Close or watch again.'; seq = []; tm.push(setTimeout(round, 1800)); }
      };
    }
    function give(ctx, c) {
      var G = ctx.game, st = ctx.state; if (st.turn === c) return G.moves;
      G.state = Object.assign({}, st, { turn: c, ep: -1, epv: -1 }); G._dirty = false; G.moves = ctx.V.legal(G.state); return G.moves;
    }
    function plan(ctx) {   /* choose the enemy move: take your piece, else attack it, else random */
      var V = ctx.V, st = ctx.state, me = mine(st); if (me < 0) return null;
      var bs = Object.assign({}, st, { turn: 'b' }), ms = V.legal(bs).filter(function (m) { return !m.drop && (!m.promo || m.promo === 'Q'); }); if (!ms.length) return null;
      var take = ms.filter(function (m) { return m.t === me; }); if (take.length) return take[0];
      var hit = ms.filter(function (m) { var n = V.make(bs, m); return V.attacked(n, me, 'b'); });
      return hit.length && Math.random() < 0.6 ? hit[Math.floor(Math.random() * hit.length)] : ms[Math.floor(Math.random() * ms.length)];
    }
    function rightClick(ctx) {   /* desktop: right click on a free square drops the Rock there (the game's control) */
      var bd = document.getElementById('board'); if (!bd || bd._km) return; bd._km = 1;
      bd.addEventListener('contextmenu', function (e) {
        var G = ctx.game; if (!G || G.spec.id !== 'zxRM5dD5b7w') return; e.preventDefault();
        var el = e.target.closest('.sq'); if (!el || el.dataset.i == null || G.over || G.busy) return; var i = +el.dataset.i;
        var m = G.moves.find(function (x) { return x.drop === 'Rk' && x.t === i; }); if (m) G.commit(m, {});
      });
    }
    return {
      init: function (ctx) { css(); },
      setup: function (ctx) {
        var V = ctx.V, st = ctx.state; close('km-map'); close('km-mem');
        if (run.k == null) run.k = Math.max(0, Math.min(prog().open - 1, L(ctx).length - 1));
        var l = lv(ctx); st.b = CM.spec.parseSetup(V, l.fen); st.turn = 'w';
        st.hands = { w: ['Rk'], b: [] }; st.x = { lvl: run.k };
        run.plan = null; run.next = performance.now() + 1600;
      },
      onStart: function (ctx) {
        var l = lv(ctx); rightClick(ctx);
        if (!run.seen) { run.seen = 1; map(ctx); return; }
        ctx.toast('Level ' + (run.k + 1) + ': ' + l.name + (l.hint ? '. ' + l.hint : '') + '. No turns!', 3000);
        var t = document.getElementById('km-tools'), stl = document.getElementById('status');
        if (!t && stl && stl.parentNode) { t = document.createElement('div'); t.id = 'km-tools'; t.style.cssText = 'display:flex;gap:8px;justify-content:center;margin-top:6px'; t.innerHTML = '<button type="button" class="btn" data-a="map">Map</button><button type="button" class="btn" data-a="mem">Memory minigame</button>'; stl.parentNode.insertBefore(t, stl.nextSibling);
          t.onclick = function (e) { var b = e.target.closest('[data-a]'); if (!b) return; if (b.dataset.a === 'map') map(ctx); else memory(ctx); }; }
      },
      moves: function (V, st, out) { return st.turn === 'w' ? out : out.filter(function (m) { return !m.drop; }); },
      onMake: function (V, st, m, n) { if (!m.drop) n.hands = st.hands; },
      checkWin: function (V, st) {
        var wk = 0, bk = 0; st.b.forEach(function (p) { if (!p) return; if (p.c === 'w' && p.t !== 'Rk') wk++; if (p.c === 'b' && p.t === 'K') bk++; });
        if (!bk) return { w: 'w', why: 'you captured the black king' };
        if (!wk) return { w: 'b', why: 'your piece was taken' };
        return null;
      },
      afterMove: function (ctx, m, info) {
        if (info.by === 'player' && !ctx.over) ctx.state = Object.assign({}, ctx.state, { turn: 'w', ep: -1, epv: -1 });
        if (info.by === 'player' && m.drop) ctx.toast('Rock placed: it blocks lines and cannot be taken.', 1600);
        return null;
      },
      onTick: function (ctx, now) {
        var G = ctx.game; if (!G || ctx.over || G.busy || document.getElementById('km-map') || document.getElementById('km-mem')) { run.next = Math.max(run.next, now + 400); return; }
        if (CM.gameUI.isPromoting && CM.gameUI.isPromoting()) return;
        if (now < run.next) return;
        if (!run.plan) {   /* pick the mover and wiggle it (the tell), move it 450 ms later */
          run.plan = plan(ctx); if (!run.plan) { run.next = now + 600; return; }
          ctx.fx({ type: 'shake_piece', at: run.plan.f, duration_ms: 420, intensity: 3 }); run.next = now + 450; return;
        }
        var p = run.plan; run.plan = null; var l = lv(ctx); run.next = now + (l.ms || 1300) * (0.7 + Math.random() * 0.6);
        var ms = give(ctx, 'b'), m = ms.find(function (x) { return x.f === p.f && x.t === p.t && (!x.promo || x.promo === 'Q'); });
        if (!m) { give(ctx, 'w'); G.render(); return; }
        G.commit(m, {});
      },
      decorate: function (ctx, sq, p) {   /* red = attacked by an enemy, green = safe, on the squares your piece can reach */
        var G = ctx.game; if (!G || ctx.over || p) return null; var me = mine(ctx.state); if (me < 0) return null;
        var can = G.moves.some(function (m) { return m.f === me && m.t === sq; }); if (!can) return null;
        return { html: '<span class="' + (ctx.V.attacked(ctx.state, sq, 'b') ? 'km-red' : 'km-green') + '"></span>' };
      },
      onGameOver: function (ctx, over) {
        var l = lv(ctx), P = prog(), last = L(ctx).length - 1;
        if (over.w === 'w') {
          if (run.k >= P.open - 1) { P.open = Math.min(L(ctx).length, run.k + 2); save(P); }
          if (run.k < last) { run.k++; ctx.toast('Level cleared! New game: ' + L(ctx)[run.k].name, 3000); }
          else ctx.toast('Final won: Chess Knightmare beaten!', 4000);
        } else if (l.bracket) {   /* the bracket is consecutive wins: a loss sends you back to its first level */
          while (run.k > 0 && L(ctx)[run.k - 1].bracket) run.k--; ctx.toast('Bracket lost: back to Bracket 1/3.', 2600);
        } else ctx.toast('Taken! New game retries the level.', 2200);
      },
      onExit: function () { close('km-map'); close('km-mem'); close('km-tools'); run.seen = 0; },
      status: function (ctx) { var l = lv(ctx), h = (ctx.state.hands.w || []).length; return 'Level ' + (run.k + 1) + '/' + L(ctx).length + ': ' + l.name + ' · no turns · Rock ' + (h ? 'ready (tap it, then a square)' : 'used'); }
    };
  })(),
  source: { research: 'research/modes/zxRM5dD5b7w.json', confidence: 'medium', notes: 'Real time via a timer on the turn-based engine; level armies, enemy timers and AI preferences inferred. Knight and Rock art: impossible from the repo (cm-g6b 2026-11-25): the only research sprites for this id are the map tiles (cow, padlock, trophy) and there is no video_thumbs still; owner rule allows i.ytimg stills only for ids with neither, so the knight is the standard piece and the Rock uses the engine wall drawing.' }
});
