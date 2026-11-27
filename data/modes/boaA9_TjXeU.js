/* Can I BEAT Thermopylae?  A 2-human puzzle variant on a chess.com 4-player board: Red (a huge army of kings,
   queens, bishops and fairy pieces) must capture Green's General; Green (a General with Soldiers and Sergeants) wins
   if a bot takes its General or by surviving 72 moves, because Yellow's rook keeps checking Red's trapped royal Ferz
   and 72 checks = Red loses. Blue and Yellow are random bots that prefer giving checks. He wins as both colours.
   Sources: research/modes/boaA9_TjXeU.json, transcript (rules 0:18-1:46, games 1:51-31:18), the 1:55 1080p start
   frame research/frames/video_thumbs/boaA9_TjXeU_frame_115.jpg (game #90754406 "started" with the variant's rule text).
   cm_acc 2026-11-26: the start position is now transcribed square by square from that frame (was reconstructed): Green's
   camp is the top arm (General e14 with the 73 counter, archbishops, wildebeests, 7 soldiers that march LEFT and promote on
   the d-file), Red fills the left arm and bottom-left quarter, grey stone walls everywhere else, Blue's rook j11 + pawns
   m9/m7, Yellow's king l4 (999 checks) and rook i1 that checks Red's Ferz on k1 every turn. Yellow's and Blue's pieces
   cannot be captured (rule text); bots give a check whenever they can (any royal: Ferz, General, Yellow king); every
   check counts down the royal's counter (Ferz 72, General 73, Yellow king 999) drawn over the piece like chess.com. */
CM.mode({
  id: 'boaA9_TjXeU',
  title: 'Can I BEAT Thermopylae?',
  name: 'Thermopylae',
  category: 'Variants & Games',
  description: "You are Red: a horde of kings (ordinary, non-royal), queens, bishops, Nightriders (repeat a knight jump in a line), Wildebeests (an L of length two or three), Archbishops (bishop + knight), Generals (king + knight) and Sergeants (move and capture forward or diagonally forward). Your royal piece is Spiky the Ferz, trapped in the corner: Yellow's rook checks it every turn and each check costs one of its 72 lives. Green's General (king + knight, 73 lives) hides behind stone walls with archbishops, wildebeests, kings and Soldiers (move and capture only forward; they promote). Blue and Yellow are random bots that give a check whenever they can, and their pieces cannot be captured. Red moves first; there is no check rule: royals are captured.",
  how_to_win: "Red: capture Green's General yourself before the Ferz's 72 checks run out. Green (pick it under Play as): survive 72 moves, or get a bot to capture your General.",
  player_side: 'r',
  player: { name: 'You', rating: 2150, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
  opponent: { avatar: 'assets/modes/boaA9_TjXeU/bot_icon.png', name: 'Green (online)', rating: 2100, tagline: 'Online human (2100-2200); Blue and Yellow are random bots.' },
  players: [
    { color: 'r', forward: 'up', name: 'You', swatch: '#bf3b43', base: 'w' },
    { color: 'u', forward: 'right', name: 'F-Checker', swatch: '#4185bf', base: 'w', rating: null, avatar: 'assets/modes/boaA9_TjXeU/bot_icon.png' },   /* chess.com bot icon from the video's Ways to Win card */
    { color: 'y', forward: 'down', name: 'Checker', swatch: '#c09526', base: 'w', rating: null, avatar: 'assets/modes/boaA9_TjXeU/bot_icon.png' },
    { color: 'g', forward: 'left', name: 'Green (online)', swatch: '#4e9161', base: 'w', rating: 2100 }
  ],
  board: { files: 14, ranks: 14, shape: { type: 'cross', corner: 3 }, light: '#dedede', dark: '#aeaeae' },
  pieces: {
    /* chess.com 4PC variant art. Red K/Q/B/N/Wildebeest/Archbishop/General/Sergeant/Soldier and the green General/
       Sergeant/Soldier/Nightrider: see source.notes. cm_acc: ferz_r.png drawn from the 1:55 frame (tools/art_thermo_ferz.py;
       the only Ferz on screen sits under its 72 counter); green King/Queen/Archbishop/Wildebeest = the red art recoloured
       to the board green (tools/art_thermo_green.py, checked against the template-rendered general_g, mean error ~1/255). */
    '#': { name: 'Wall', value: 0, moves: '', blocker: true, capturable: false, overlay: null, img: 'assets/modes/xg_djfCrRes/stone_wall.png' },   /* chess.com grey cobblestone wall square (same tile as Labyrinth 82) */
    F: { name: 'Ferz', moves: 'F', value: 2000, royal: true, capturable: false, glyph: 'P', img: { r: 'assets/modes/boaA9_TjXeU/ferz_r.png' } },
    P: { promote: false },   /* Blue's two pawns are walled in; nothing in the video promotes but Green's soldiers */
    J: { name: 'King', moves: 'K', value: 320, glyph: 'K', castle: false, img: { r: 'assets/modes/boaA9_TjXeU/king_r.png', g: 'assets/modes/boaA9_TjXeU/king_g.png' } },
    Q: { img: { r: 'assets/modes/boaA9_TjXeU/queen_r.png', g: 'assets/modes/boaA9_TjXeU/queen_g.png' } },
    B: { img: { r: 'assets/modes/boaA9_TjXeU/bishop_r.png' } },
    Y: { name: 'Wildebeest', moves: 'NC', value: 450, glyph: 'N', img: { r: 'assets/modes/boaA9_TjXeU/wildebeest_r.png', g: 'assets/modes/boaA9_TjXeU/wildebeest_g.png' } },
    L: { name: 'Nightrider', moves: 'NN', value: 560, glyph: 'N', badge: '', img: { r: 'assets/modes/boaA9_TjXeU/nightrider_r.png', g: 'assets/modes/boaA9_TjXeU/nightrider_g.png' } },
    O: { name: 'General', moves: 'KN', value: 2000, royal: true, glyph: 'K', badge: '', img: { r: 'assets/modes/boaA9_TjXeU/general_r.png', g: 'assets/modes/boaA9_TjXeU/general_g.png' } },
    H: { name: 'General', moves: 'KN', value: 520, glyph: 'K', badge: '', img: { r: 'assets/modes/boaA9_TjXeU/general_r.png', g: 'assets/modes/boaA9_TjXeU/general_g.png' } },   /* Red's two plain Generals (n3/o3 in the frame) and Green's promotions (19:00, 20:55) */
    A: { name: 'Archbishop', moves: 'BN', value: 750, glyph: 'B', badge: '', img: { r: 'assets/modes/boaA9_TjXeU/archbishop_r.png', g: 'assets/modes/boaA9_TjXeU/archbishop_g.png' } },
    S: { name: 'Sergeant', moves: 'fWfF', value: 160, glyph: 'P', badge: '', img: { r: 'assets/modes/boaA9_TjXeU/sergeant_r.png', g: 'assets/modes/boaA9_TjXeU/sergeant_g.png' } },
    /* Soldier: moves and captures one square forward. Green's forward is left (6:15 "green's soldiers advance this way");
       they promote on the d-file, the 11th rank (4:49 the first soldier promotes at once; 14:06 wildebeest ("camel"),
       19:00 / 20:55 general, 29:01 queen, 28:26 archbishop). */
    T: { name: 'Soldier', moves: 'fW', value: 110, glyph: 'P', badge: '', promote: true, promoteZone: 4, promoteTo: ['Q', 'A', 'H', 'Y'], img: { r: 'assets/modes/boaA9_TjXeU/soldier_r.png', g: 'assets/modes/boaA9_TjXeU/soldier_g.png' } }
  },
  setup: { fen: '4[g:Y][g:A]1[g:O][g:A][g:Y][g:A]3/4[g:T][g:T][g:T][g:T][g:T][g:T][g:T]3/3*6*3/[r:Q][r:Q]***2*1*[u:R]3/[r:Q][r:Q][r:Q]****[g:J]**4/[r:S][r:S][r:S][r:J]**[g:J][g:J]**2[u:P]*/[r:S][r:S][r:S][r:J][r:J]1*1**1*2/[r:L][r:L][r:L][r:J][r:J]*2[r:J][r:Q]*[r:A][u:P]*/[r:L][r:L][r:L]*[r:J][r:J][r:J]*[r:J][r:Q][r:A][r:Q]2/[r:B][r:Q][r:B][r:Q][r:J][r:J][r:J][r:J][r:J][r:A][r:Q]*1*/[r:Q][r:B][r:Q][r:B][r:L][r:Y][r:L][r:A]***[y:K]2/3[r:H][r:H][r:Y][r:A]****3/3[r:Y][r:Q][r:A]*****3/3[r:Q][r:A]***[y:R]1[r:F]3', turn: 'r' },   /* transcribed from the 1:55 frame, rows top first */
  rules: { check: 'none', castling: false, enPassant: false, promotion: { choices: ['Q', 'A', 'H', 'Y'], zone: 4 }, drawPlies: 9999, win: [] },
  bot: { engine: 'search', depth: 2, time_ms: 380, min_ms: 260 },
  params: { limit: 72, genLives: 73, yLives: 999 },
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/boaA9_TjXeU/ways_to_win.jpg', fit: 'contain', duration_ms: 2400, id: 'g5intro' /* video art */ }],
  hooks: {
    /* pass 2: play as Red or Green (the video plays both: Red first, then Green). Stored per device; the side picker sits in
       the info pane. As Green, Red becomes the online opponent (search bot that marches on the General). */
    setup: function (ctx) {
      var side = CM.store.get('g5thermo.side', 'r') === 'g' ? 'g' : 'r', G = ctx.game, sp = ctx.spec;
      /* losing the General is a win condition for Green (checkWin), not a knock-out: keep the engine from knocking Green
         out (and ending the game as "you were king captured") before checkWin can award it */
      if (ctx.state && ctx.state.start) ctx.state.start = Object.assign({}, ctx.state.start, { gRoyal: false });
      G.human = side; G.botColor = side === 'r' ? 'g' : 'r'; sp.player_side = side;
      sp.players[0].name = side === 'r' ? 'You' : 'Red (online)'; sp.players[0].rating = side === 'r' ? null : 2150;
      sp.players[3].name = side === 'g' ? 'You' : 'Green (online)'; sp.players[3].rating = side === 'g' ? null : 2100;
      sp.player.rating = side === 'r' ? 2150 : 2100;
      Object.assign(G.opponent, side === 'r' ? { name: 'Green (online)', rating: 2100 } : { name: 'Red (online)', rating: 2150, tagline: 'Online human with the big army; Blue and Yellow are random bots.' });
      var pane = document.getElementById('pane-info'), box = pane && pane.querySelector('.g5thermo');
      if (pane && !box) {
        var h = document.createElement('h2'); h.className = 'info__h g5thermo-h'; h.textContent = 'Play as';
        box = document.createElement('div'); box.className = 'gpicker g5thermo'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Play as'); box.style.padding = '8px 0 4px';
        var info = pane.querySelector('.info') || pane; info.appendChild(h); info.appendChild(box);
      }
      if (box) {
        box.innerHTML = ['r', 'g'].map(function (c) { return '<button type="button" data-side="' + c + '" aria-pressed="' + (c === side) + '">' + (c === 'r' ? 'Red' : 'Green') + '</button>'; }).join('');
        box.onclick = function (e) { var b = e.target.closest('[data-side]'); if (!b || b.dataset.side === side) return; CM.store.set('g5thermo.side', b.dataset.side); G.newGame(); };
      }
    },
    onStart: function (ctx) { ctx.toast(ctx.human === 'g' ? "You are Green: survive 72 Red moves, or let a bot capture your General." : "You are Red: capture Green's General before 72 moves.", 3200); },
    onExit: function () { var pane = document.getElementById('pane-info'); if (pane) Array.prototype.forEach.call(pane.querySelectorAll('.g5thermo, .g5thermo-h'), function (n) { n.remove(); }); },
    /* Yellow's and Blue's pieces cannot be captured (rule text in the 1:55 frame) */
    moves: function (V, st, out) { return out.filter(function (m) { return !(m.cap && (m.cap.c === 'u' || m.cap.c === 'y')); }); },
    /* every move that checks a royal costs that royal one life: Red's Ferz 72, Green's General 73, Yellow's king 999 */
    onMake: function (V, st, m, n) {
      var x = n.x = Object.assign({}, n.x), sx = st.x || {};
      if (m.cap && m.cap.t === 'O') x.genBy = m.c;
      if (st.turn === 'r') x.redMoves = (sx.redMoves || 0) + 1;
      [['r', 'ferzChecks'], ['g', 'genChecks'], ['y', 'yChecks']].forEach(function (rc) {
        if (rc[0] === m.c) return;
        var R = V.royals(n, rc[0]); if (R.length && V.attacked(n, R[0], m.c)) x[rc[1]] = (sx[rc[1]] || 0) + 1;
      });
    },
    checkWin: function (V, st) {
      var x = st.x || {}, P = V.cfg.params || {}, lim = P.limit || 72;
      if (x.genBy) return x.genBy === 'r' ? { w: 'r', why: "Red captured Green's General" } : { w: 'g', why: "a bot captured Green's General" };
      if ((x.genChecks || 0) >= (P.genLives || 73)) return { w: 'r', why: "Green's General ran out of checks" };
      if ((x.ferzChecks || 0) >= lim) return { w: 'g', why: "Red's Ferz was checked " + lim + ' times' };
      if ((x.redMoves || 0) >= lim) return { w: 'g', why: 'Green survived ' + lim + ' moves' };
      return null;
    },
    evaluate: function (V, st, c) {
      if (c !== 'r') return 0;
      var O = null; for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.t === 'O') { O = i; break; } }
      if (O == null) return 0; var v = 0;
      for (var j = 0; j < st.b.length; j++) { var q = st.b[j]; if (q && q.c === 'r' && q.t !== 'F') v -= 4 * V.geo.dist(j, O); }
      return v;
    },
    /* Blue (F-Checker, "a Futer with checking preference") and Yellow (Checker): random moves, but a move that gives
       check to any royal comes first (1:37 "prefer to give checks over any other move") */
    botPick: function (ctx, ranked) {
      var V = ctx.V, me = ctx.state.turn;
      if (me !== 'u' && me !== 'y') return null;
      var checks = ranked.filter(function (r) {
        var n = r.m.n || V.make(ctx.state, r.m); return ['r', 'g', 'y'].some(function (c) { return c !== me && V.royals(n, c).some(function (s) { return V.attacked(n, s, me); }); });
      });
      return ctx.pick(checks.length ? checks : ranked);
    },
    /* chess.com draws each royal's checks-left counter in big white numerals over the piece; Blue's and Yellow's
       uncapturable pieces sit in a dark inset frame (1:55 frame) */
    decorate: function (ctx, sq, p) {
      if (!p) return null;
      var x = ctx.state.x || {}, P = ctx.params, n = null;
      if (p.t === 'F' && p.c === 'r') n = (P.limit || 72) - (x.ferzChecks || 0);
      else if (p.t === 'O' && p.c === 'g') n = (P.genLives || 73) - (x.genChecks || 0);
      else if (p.t === 'K' && p.c === 'y') n = (P.yLives || 999) - (x.yChecks || 0);
      var html = n == null ? '' : '<span class="th-lives">' + Math.max(0, n) + '</span>';
      var cls = p.c === 'u' || p.c === 'y' ? 'th-shield' : '';
      return html || cls ? { cls: cls, html: html } : null;
    },
    init: function () {
      if (typeof document === 'undefined' || document.getElementById('th-css')) return;
      var c = document.createElement('style'); c.id = 'th-css';
      c.textContent = '.th-lives{position:absolute;inset:0;display:grid;place-items:center;z-index:4;pointer-events:none;font:800 clamp(11px,3.6vw,30px)/1 system-ui,sans-serif;color:rgba(255,255,255,.9);letter-spacing:-.04em;text-shadow:0 0 2px rgba(0,0,0,.55),0 1px 3px rgba(0,0,0,.4)}' +
        '#board .sq.th-shield{box-shadow:inset 0 0 0 3px rgba(84,60,36,.55),inset 0 0 10px 4px rgba(70,50,30,.45)}';
      document.head.appendChild(c);
    },
    status: function (ctx) { var x = ctx.state.x || {}, lim = ctx.params.limit || 72; return 'Ferz ' + Math.max(0, lim - (x.ferzChecks || 0)) + ' checks left  ·  General ' + Math.max(0, (ctx.params.genLives || 73) - (x.genChecks || 0)) + '  ·  Red moves ' + (x.redMoves || 0) + '/' + lim; }
  },
  source: { research: 'research/modes/boaA9_TjXeU.json', confidence: 'medium', notes: 'cm_acc 2026-11-26: start position, walls, bot names (Checker / F-Checker), uncapturable bot pieces and check counters from the 1:55 1080p frame + its rule text; soldier promotion (d-file, 11th rank) and choices Q/A/General/Wildebeest from the transcript (4:49, 14:06, 19:00, 20:55, 28:26, 29:01). Inferred: promotion rank (only the first promotion is seen happening at once), counting a check once per checking move per royal, which piece the 15:21 "two-eyed hat" / 16:06 camel rider is (not offered). Not built: 2:00 clocks with 5 s delay. The game in the frame says 76 moves; the Ways to Win card, the Ferz counter and the transcript say 72, which is used. Earlier: Art 2026-11-25 PM ET: General/Sergeant/Soldier/Archbishop recut from the 1080p piece cards (frames 65/70/75/98) keeping the dark outline (old cut had lost it and showed a light halo); Green copies recoloured to the green of the video\'s Ways to Win General icon (maxres1), tools/art6_thermo_recut.py. Red\'s plain King/Queen/Bishop (were the cream set + CSS tint): chess.com red 4-player pieces cut from a paused full-screen 1080p youtube.com frame at 1:55 (research/frames/video_thumbs/boaA9_TjXeU_frame_115.jpg), median of 14 queens / 15 kings / 4 bishops, difference-matted over the light and dark squares (bishops: dark squares only, edge = outline blend), tools/art6_thermo_red.py; other colours keep the set. Art-leftovers 3 (2026-11-25 PM ET): Nightrider red recut from 8 board instances on the 1:55 1080p frame (old thumbnail copy had a white head-back and base); Wildebeest red recut from that frame (old thumbnail cut was over-saturated with a ragged outline); K/Q/B/N/Wildebeest edges re-matted against the dark outline (no light specks); card pieces tone-matched to the board red; all green copies (General, Sergeant, Soldier, Nightrider) now the board green #4e9161-ish (78,145,97) instead of the bright Ways-to-Win icon green.' }
});
