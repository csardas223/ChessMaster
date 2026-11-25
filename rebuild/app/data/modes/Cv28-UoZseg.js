/* Can I BEAT Sergeant's Checkers?  Rebuilt from the transcript + the video's own stills (cm-recheck 2026-11-25; the old
   frames-only checkers guess is gone). Sources: research/modes/Cv28-UoZseg.json; transcript 0:01 ("your king is a barrelina
   which captures forwards and moves diagonally, and the first player to place their barrelina in the center wins. The army is
   made of sergeants, pawns that move and capture forward and diagonally. Sergeants promote to kings on the 13th rank"),
   0:43-1:31 (kings stuck in a corner behind bricks, guarded by the enemy's soldiers which "only capture and move straight
   ahead"; promote, come back, free the barrelina), 2:32 (the first two ranks of sergeants may move two on their first move,
   diagonally too), 7:54 ("we can't trade kings"), 8:15 + 14:50 (the STALEMATED side wins), 14:50 (the barrelina covers the
   square in front of it, so it gives check); still maxres2 = the whole start position seen from the side (blue moves right,
   green left, 3+0 / "3-2" clock, "Reach the hill while advancing your pawns as far as possible", 2x2 hill in the centre).
   Opponents: Chaco (game 1, won when he stalemated us), killertofu (1503?) (game 2, lost by stalemating him).
   Inferred: the promoted King moves like a chess king and may not capture an enemy promoted King (7:54); checkmating the
   barrelina still wins; the double step is for the sergeants on ranks 1-2 (Blue's files a-b). Piece art: cut from maxres1/2
   by app/tools/recheck_cv28_art.py (promoted King = the crowned piece without the royal fleur-de-lis badge, inferred). */
(function () {
  var ID = 'Cv28-UoZseg', A = 'assets/modes/' + ID + '/';
  var OPP = [
    { name: 'Chaco', rating: null, tagline: '"And we meet again. Good luck."' },
    { name: 'killertofu', rating: '1503?', tagline: 'Goes for the brick-wall setup.' }
  ];
  var game = 0;
  CM.mode({
    id: ID,
    title: "Can I BEAT Sergeant's Checkers?",
    name: "Sergeant's Checkers",
    category: 'Variants & Games',
    description: 'Seen from the side: Blue (you) moves right, Green moves left. Sergeants move and capture one square forward or diagonally forward (the two back ranks may step two on their first move). Your Barrelina (fleur-de-lis) is boxed in behind stone bricks and two enemy Soldiers, which only move and capture straight ahead. It moves one square diagonally and captures only straight forward. Sergeants promote to Kings on the 13th rank; a King cannot capture a King. Slip a sergeant through, promote, come back and free your Barrelina.',
    how_to_win: 'Put your Barrelina on the 2x2 hill in the centre (or checkmate it). Careful: a side with no legal move WINS, so never stalemate your opponent.',
    player_side: 'w',
    players: [
      { color: 'w', forward: 'right', name: 'ireallywantcheckmate', rating: 1634, swatch: '#4286c4', base: 'w', avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
      { color: 'b', forward: 'left', name: 'Chaco', rating: null, swatch: '#56965f', base: 'b' }
    ],
    player: { name: 'ireallywantcheckmate', rating: 1634, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },
    opponent: OPP[0],
    board: {
      files: 14, ranks: 10,
      mask: ['xxx........xxx', '..............', '..............', '..............', '..............',
             '..............', '..............', '..............', '..............', 'xxx........xxx'],
      squares: { g5: { cls: 'cv-hill' }, g6: { cls: 'cv-hill' }, h5: { cls: 'cv-hill' }, h6: { cls: 'cv-hill' } },
      light: '#dcdcdc', dark: '#b1b1b1'
    },
    theme: { background: '#2c2c2c' },
    pieces: {
      S: { name: 'Sergeant', moves: 'fWfFifmnDifmnA', value: 120, promote: true, promoteTo: ['Kg'], promoteZone: 2,
           img: { w: A + 'sergeant_w.png', b: A + 'sergeant_b.png' } },
      O: { name: 'Soldier', moves: 'fW', value: 60, img: { w: A + 'soldier_w.png', b: A + 'soldier_b.png' } },
      K: { name: 'Barrelina', moves: 'mFcfW', royal: true, castle: false, value: 0, img: { w: A + 'barrelina_w.png', b: A + 'barrelina_b.png' } },
      Kg: { name: 'King', moves: 'K', value: 450, img: { w: A + 'king_w.png', b: A + 'king_b.png' } },
      '#': { name: 'Brick', img: A + 'stone.png', overlay: null }
    },
    setup: {
      fen: '4S5s3/1S1S5s2O*/S1S1S5s1*k/1S1S5s2O*/S1S1S5s3/3S5s1s1s/*o2S5s1s1/K*1S5s1s1s/*o2S5s1s1/3S5s4',
      turn: 'w',
      moved: ['e10', 'd9', 'e8', 'd7', 'e6', 'd5', 'e4', 'd3', 'e2', 'd1', 'c8', 'c6', 'j1', 'k2', 'j3', 'k4', 'j5', 'k6', 'j7', 'k8', 'j9', 'k10', 'l3', 'l5']
    },
    rules: {
      check: 'standard', castling: false, enPassant: false,
      promotion: { choices: ['Kg'], zone: 2 },
      stalemate: 'win', drawPlies: 200,
      win: [{ type: 'reach', squares: 'g5 g6 h5 h6', piece: 'K', why: 'Barrelina reached the hill' }, { type: 'checkmate' }]
    },
    clock: { w: 180, b: 180, inc: 2, bot: false },
    bot: { engine: 'search', depth: 3, time_ms: 700 },
    messages: { win_title: 'Barrelina on the hill!', draw: 'move limit' },
    hooks: {
      /* 7:54 "we can't trade kings": a promoted King may not capture an enemy King */
      filterMoves: function (V, st, legal) { return legal.filter(function (m) { return !(m.cap && m.p === 'Kg' && m.cap.t === 'Kg'); }); },
      evaluate: function (V, st) {
        /* reward a free Barrelina and sergeants advanced toward promotion */
        var g = V.geo, v = 0;
        for (var i = 0; i < st.b.length; i++) {
          var p = st.b[i]; if (!p || (p.c !== 'w' && p.c !== 'b')) continue;
          var s = p.c === 'w' ? 1 : -1, d = g.relRow(i, p.c);
          if (p.t === 'S') v += s * d * 6;
          if (p.t === 'K') { var c = g.parse('g5'), dd = Math.min(g.dist(i, g.parse('g5')), g.dist(i, g.parse('h6')), g.dist(i, g.parse('g6')), g.dist(i, g.parse('h5'))); v -= s * dd * 25; }
        }
        return v;
      },
      init: function () {
        if (document.getElementById('cv-css')) return;
        var s = document.createElement('style'); s.id = 'cv-css';
        s.textContent = '.sq.cv-hill::before{content:"";position:absolute;inset:0;box-shadow:inset 0 0 0 2px rgba(60,60,60,.55);background:rgba(255,255,255,.12);pointer-events:none}';
        document.head.appendChild(s);
      },
      setup: function (ctx) { ctx.setOpponent(OPP[game % 2]); },
      onGameOver: function (ctx) { game++; },
      status: function (ctx) { return 'Game ' + (game % 2 + 1) + ' of 2 vs ' + ctx.opponent.name + '. Reach the hill; never stalemate your opponent.'; }
    },
    source: { research: 'research/modes/' + ID + '.json', confidence: 'medium', notes: 'Rules and start position from the transcript and still maxres2 (rechecked 2026-11-25). Inferred: promoted King = chess king that cannot take a King, double step for ranks 1-2 only, checkmate also wins, blue moves first.' }
  });
})();
