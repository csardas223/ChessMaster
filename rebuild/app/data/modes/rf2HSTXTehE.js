/* Can I BEAT Ouroboros King?  Steam "tactical variant chess roguelite": a campaign of small battles on ~6x8 boards with
   drafted unit armies; win a battle by killing the enemy General. Units: Portal Mage (moves to any empty square, kills
   only adjacent), Reaper (king steps; kills any non-royal enemy standing on a tile of its own colour), Glass Queen,
   Marching Pawn (2 forward or 1 diagonal, kills diagonally), Prince, Knight, Viking (up to two orthogonal steps),
   General (royal king). Sources: research/modes/rf2HSTXTehE.json, frames (navy #c2c7da/#323f55). PASS 1: a run of
   three battles (js/modes/g6_levels.js) with fixed armies; relics, rewinds and recruiting are pass 2. */
CM.mode({
  id: 'rf2HSTXTehE',
  title: 'Can I BEAT Ouroboros King?',
  name: 'Ouroboros King',
  category: 'Variants & Games',
  description: 'Small tactical battles with strange units. Your King and the enemy General are royal: kill the General and his army surrenders. Portal Mage teleports to any empty square but only kills next to itself; Viking makes up to two orthogonal steps; Marching Pawn moves two forward or one diagonally; Glass Queen moves like a queen.',
  how_to_win: 'Kill the enemy General in every battle.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/rf2HSTXTehE/hero.png' },
  opponent: { name: 'Ouroboros armies', rating: null, avatar: null, tagline: 'Kingdom of Thessalonia, Marsh of Madness, Ridge of Ruin.' },
  board: { files: 6, ranks: 8, light: '#c2c7da', dark: '#323f55', background: '#101826', squares: { /* art-g6: pink enemy zone (top two rows) as in the frames */ a7: { color: 'rgba(214,96,150,.22)' }, b7: { color: 'rgba(214,96,150,.22)' }, c7: { color: 'rgba(214,96,150,.22)' }, d7: { color: 'rgba(214,96,150,.22)' }, e7: { color: 'rgba(214,96,150,.22)' }, f7: { color: 'rgba(214,96,150,.22)' }, a8: { color: 'rgba(214,96,150,.22)' }, b8: { color: 'rgba(214,96,150,.22)' }, c8: { color: 'rgba(214,96,150,.22)' }, d8: { color: 'rgba(214,96,150,.22)' }, e8: { color: 'rgba(214,96,150,.22)' }, f8: { color: 'rgba(214,96,150,.22)' } } },
  pieces: { /* art-g6: Ouroboros King unit icons cut from the video board (shared with g5 JAz_qMQpI1o, tools/g5_art4.py);
              g6b: Marching Pawn + Prince from this video's recruit cards (1:10 / 1:22, tools/g6b_art.py), Glass Queen + Reaper shared
              from JAz_qMQpI1o; black = fill/outline swap (inferred) */
    K: { name: 'King', moves: 'K', value: 2000, royal: true, castle: false, img: { w: 'assets/modes/rf2HSTXTehE/king_w.png', b: 'assets/modes/rf2HSTXTehE/king_b.png' } },
    Gn: { name: 'General', moves: 'K', value: 2000, royal: true, img: { w: 'assets/modes/rf2HSTXTehE/general_w.png', b: 'assets/modes/rf2HSTXTehE/general_b.png' } },
    Pm: { name: 'Portal Mage', moves: '', value: 400, gen: 'portal', img: { w: 'assets/modes/rf2HSTXTehE/mage_w.png', b: 'assets/modes/rf2HSTXTehE/mage_b.png' } },
    /* g6b: card text "move up to two times orthogonally, directions may differ" (transcript) */
    Vk: { name: 'Viking', moves: '', gen: 'viking', value: 380, img: { w: 'assets/modes/rf2HSTXTehE/viking_w.png', b: 'assets/modes/rf2HSTXTehE/viking_b.png' } },
    /* g6b: card 1:10 "Move up to 2 squares forward or 1 square diagonally forward, can only kill diagonally. If it gets to the last row,
       it transforms into a Queen for the rest of the combat" */
    Mp: { name: 'Marching Pawn', moves: 'fmWfmnDfF', value: 150, pawn: true, promote: true, promoteTo: ['Q'], img: { w: 'assets/modes/rf2HSTXTehE/marching_pawn_w.png', b: 'assets/modes/rf2HSTXTehE/marching_pawn_b.png' } },
    Q: { name: 'Queen', moves: 'Q', value: 850, img: { w: 'assets/modes/rf2HSTXTehE/glass_queen_w.png', b: 'assets/modes/rf2HSTXTehE/glass_queen_b.png' } },
    Gq: { name: 'Glass Queen', moves: 'Q', value: 800, img: { w: 'assets/modes/rf2HSTXTehE/glass_queen_w.png', b: 'assets/modes/rf2HSTXTehE/glass_queen_b.png' } },
    /* g6b: card 1:22 "Move like a King. Your King can't be killed by other units while being 3 or less squares away vertically and horizontally from the Prince" */
    Pr: { name: 'Prince', moves: 'K', value: 350, img: { w: 'assets/modes/rf2HSTXTehE/prince_w.png', b: 'assets/modes/rf2HSTXTehE/prince_b.png' } },
    Re: { name: 'Reaper', moves: '', gen: 'reaper', value: 450, img: { w: 'assets/modes/rf2HSTXTehE/reaper_w.png', b: 'assets/modes/rf2HSTXTehE/reaper_b.png' } },
    Fo: { name: 'Fool', moves: '', gen: 'fool', value: 300, glyph: 'B', badge: 'Fo' },   /* no Fool icon on any repo frame: glyph + badge */
    Oq: { name: 'Ouroboros Queen', moves: 'QN', royal: true, value: 2000, img: 'assets/modes/rf2HSTXTehE/queen_face.png' },
    R: { img: { w: 'assets/modes/rf2HSTXTehE/rook_w.png', b: 'assets/modes/rf2HSTXTehE/rook_b.png' } }, N: { img: { w: 'assets/modes/rf2HSTXTehE/knight_w.png', b: 'assets/modes/rf2HSTXTehE/knight_b.png' } }
  },
  setup: { fen: '1r[gn]n2/2pp2/6/6/6/6/6/1R[Gq]K[Vk]1' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { auto: 'Q', choices: ['Q'] }, drawPlies: 120 },
  vfx_timeline: [{ trigger: 'game_start', once: true, effect: { type: 'overlay', image: 'assets/modes/rf2HSTXTehE/campaign_map.png', fit: 'contain', at: 'board', opacity: 1, duration_ms: 1500, fade_ms: 300 } }],   /* g6b: the node map shown between battles */
  params: {
    /* g6b: Training Grounds after every won battle (the recruit card frames 1:10/1:22: three units offered, 500 gold shown;
       the Reaper costs 481 gold in the transcript); other costs inferred. Rewinds: the Items bar shows 5 (frame 1:10). */
    run: 'Battle', money: true, undos: 5,
    shop: { title: 'Training Grounds: select a piece to recruit', offer: 3, reroll: 60,
      pieces: [{ t: 'Gq', cost: 320 }, { t: 'Mp', cost: 120 }, { t: 'Pr', cost: 260 }, { t: 'Re', cost: 481 }, { t: 'Pm', cost: 300 }, { t: 'N', cost: 200 }, { t: 'Fo', cost: 220 }, { t: 'Vk', cost: 240 }, { t: 'R', cost: 350 }] },
    levels: [
      { name: 'Kingdom of Thessalonia', fen: '1r[gn]n2/2pp2/6/6/6/6/6/1R[Gq]K[Vk]1', reward: 500 },
      { name: 'Kingdom of Thessalonia - 2', fen: 'n1[gn]1r1/1pppp1/6/6/6/6/6/1R[Gq]K[Vk]1', reward: 350 },
      { name: 'Marsh of Madness', fen: 'n1[gn]1rb/1pppp1/6/6/6/6/2[Mp][Mp]2/1R[Gq]K[Vk][Pm]', reward: 400 },
      { name: 'Boss: the Ouroboros Queen', fen: 'rn[oq][re]bn/pppppp/6/6/6/6/1[Mp][Mp][Mp]2/[Pm]R[Gq]K[Vk][Pr]', reward: 600, opponent: { name: 'Ouroboros Queen', rating: null, avatar: 'assets/modes/rf2HSTXTehE/queen_face.png', tagline: 'Final boss.' } }
    ]
  },
  bot: { engine: 'search', depth: 3, time_ms: 500 },
  /* g6b: g6_levels run layer (rounds, Training Grounds shop, rewinds) + the Ouroboros unit rules: Reaper, Prince, Fool, Viking,
     The Finisher and Alarm Bell relics, the Glass Queen never returning once she dies (session) */
  hooks: (function () {
    var D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]], W4 = D8.slice(0, 4), glassLost = { v: 0 };
    function base() { return CM.hooks.g6_levels; }
    function sqc(g, i) { return (g.col(i) + g.row(i)) & 1; }
    return {
      extends: 'g6_levels',
      reaper: function (V, st, i, p, out) {   /* king steps; kills any non-royal enemy on a tile of its own colour without moving */
        var b = st.b, g = V.geo, near = {};
        D8.forEach(function (d) { var j = g.step(i, d[0], d[1]); if (j < 0) return; near[j] = 1; var q = b[j];
          if (!q) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null }); else if (q.c !== p.c && q.c !== 'n') out.push({ f: i, t: j, p: p.t, c: p.c, cap: q, capSq: j }); });
        for (var j = 0; j < b.length; j++) { var q = b[j]; if (!q || q.c === p.c || q.c === 'n' || near[j] || V.def(q.t).royal || V.def(q.t).blocker) continue;
          if (sqc(g, j) === sqc(g, i)) out.push({ f: i, t: i, p: p.t, c: p.c, cap: q, capSq: j, reap: 1 }); }
      },
      viking: function (V, st, i, p, out) {   /* one or two orthogonal steps, the second may turn; a kill ends the move */
        var b = st.b, g = V.geo, seen = {};
        W4.forEach(function (d) { var a = g.step(i, d[0], d[1]); if (a < 0) return; var qa = b[a];
          if (qa) { if (qa.c !== p.c && qa.c !== 'n' && !seen[a]) { seen[a] = 1; out.push({ f: i, t: a, p: p.t, c: p.c, cap: qa }); } return; }
          if (!seen[a]) { seen[a] = 1; out.push({ f: i, t: a, p: p.t, c: p.c, cap: null }); }
          W4.forEach(function (e) { var c2 = g.step(a, e[0], e[1]); if (c2 < 0 || c2 === i || seen[c2]) return; var qc = b[c2];
            if (!qc) { seen[c2] = 1; out.push({ f: i, t: c2, p: p.t, c: p.c, cap: null }); } else if (qc.c !== p.c && qc.c !== 'n') { seen[c2] = 1; out.push({ f: i, t: c2, p: p.t, c: p.c, cap: qc }); } });
        });
      },
      fool: function (V, st, i, p, out) {   /* moves with the pattern of the last enemy move (x.lt[colour] = type the enemy last moved) */
        var lt = st.x && st.x.lt && st.x.lt[p.c]; if (!lt || lt === 'Fo' || !V.types[lt]) lt = 'K';
        var b2 = st.b.slice(); b2[i] = { t: lt, c: p.c, m: 1 }; var tmp = [];
        V.genPiece(Object.assign({}, st, { b: b2 }), i, tmp, true);
        tmp.forEach(function (m) { if (m.castle || m.dbl != null) return; out.push({ f: i, t: m.t, p: p.t, c: p.c, cap: m.cap, capSq: m.capSq }); });
      },
      onMake: function (V, st, m, n) {
        base().onMake(V, st, m, n);
        if (m.f >= 0) { var lt = Object.assign({}, (st.x && st.x.lt) || {}); lt[st.turn === 'w' ? 'b' : 'w'] = m.p; n.x = Object.assign({}, n.x, { lt: lt }); }
      },
      filterMoves: function (V, st, legal) {   /* Prince: your King cannot be killed within 3 squares of him */
        var g = V.geo; legal = base().filterMoves(V, st, legal);
        return legal.filter(function (m) { if (!m.cap || !V.def(m.cap.t).royal) return true; var sq = m.capSq != null ? m.capSq : m.t;
          for (var i = 0; i < st.b.length; i++) { var q = st.b[i]; if (q && q.c === m.cap.c && q.t === 'Pr' && g.dist(i, sq) <= 3) return false; } return true; });
      },
      checkWin: function (V, st) {   /* The Finisher relic (player only): enemy leader alone at the start of your turn while you have units */
        if (st.turn !== 'w') return null; var mine = 0, theirs = 0, theirR = 0;
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || p.c === 'n') continue; var r = V.def(p.t).royal; if (p.c === 'w' && !r) mine++; if (p.c === 'b') { if (r) theirR++; else theirs++; } }
        if (theirR && !theirs && mine && V.royals(st, 'w').length) return { w: 'w', why: 'The Finisher: the enemy leader stands alone' };
        return null;
      },
      setup: function (ctx) {
        base().setup(ctx);
        if (glassLost.v) { var b = ctx.state.b; for (var i = 0; i < b.length; i++) if (b[i] && b[i].c === ctx.human && b[i].t === 'Gq') b[i] = null; }
      },
      afterMove: function (ctx, m, info) {
        if (m && m.reap) { ctx.fx({ type: 'flash', color: '#9b5cff', opacity: 0.5, at: m.capSq, duration_ms: 300 }); }
        if (info && info.captured && info.captured.t === 'Gq' && info.captured.c === ctx.human) { glassLost.v = 1; ctx.fx({ type: 'particles', kind: 'glitch', at: info.to, count: 18 }); ctx.toast('Your Glass Queen shattered: she never returns.', 2600); }
        if (info && info.by === 'bot' && !ctx.over) {   /* Alarm Bell relic: warns when your King is in danger */
          var k = ctx.V.royals(ctx.state, ctx.human)[0];
          if (k != null && ctx.V.attacked(ctx.state, k, ctx.bot)) { ctx.toast('Alarm Bell: your King is in danger!', 1800); ctx.sound('notify'); }
        }
        return null;
      },
      onGameOver: function (ctx, over) {
        if (over.w !== ctx.human) glassLost.v = 0;
        base().onGameOver(ctx, over);
      },
      status: function (ctx) { return base().status(ctx) + ' · Relics: The Finisher, Alarm Bell, Ouroboros Sigil'; }
    };
  })(),
  todo_pass2: ['node map choices (Training Grounds / Ruins / Armory / shop nodes; only the map image and a recruit shop between battles are shown)', 'Armory unit upgrades (Mirror Queen, Quartermaster, Berserker), relic sacrifice, AI draw offers'],
  source: { research: 'research/modes/rf2HSTXTehE.json', confidence: 'medium', notes: 'Armies invented; several unit powers simplified. Fool icon: impossible from the repo (cm-g6b 2026-11-25): no repo sprite or still of this game shows the Fool (checked rf2HSTXTehE_frame_70/82, JAz_qMQpI1o_frame_1087/maxres2, _RFXN1Ye3sY_frame_223/1165 and every Ouroboros sprite); the id has sprites, so no YouTube still: glyph + badge kept.' }
});
