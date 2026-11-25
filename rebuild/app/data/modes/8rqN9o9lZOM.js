/* Chess vs Shogi.  9x9 board: Tony's chess army (chess rules, no drops) vs Fairy-Stockfish's full Shogi army (shogi
   moves, promotion on entering/moving within its last three ranks, captured pieces go to its hand and can be dropped).
   Tony mates with a rook + knight double check (~12:53). Sources: research/modes/8rqN9o9lZOM.json (transcript 0:38
   9x9, drops: rook a1, bishop f1, pawns). Chess layout on 9 files is visual-only: RNBQK.BNR with f1 empty, 9 pawns.
   Shogi pieces always promote when they can (inferred simplification).
   PASS 2 (impl-4, 8th session, stills maxres1/2): the video's GUI draws Fairy-Stockfish's shogi army with chess-set
   shapes (gold = queen crown, king, rook, bishop, knight, pawn) except the lance (spike) and the silver (crowned rook),
   which are cut from the frame (tools/g4_pass2.py). No kanji. Promoted pieces are not visible in the stills; they keep
   their base shape with a '+' mark. The side panel shows the frame's movement card (gold, king, bishop, knight, lance,
   pawn, silver, rook diagrams). Promotion plays the promote sound; no flip animation is visible in the stills. */
(function () {
  var PROMO = { SR: 'DR', SB: 'DH', SS: 'TG', SN: 'TG', SL: 'TG', SP: 'TG' };
  var BASE = { DR: 'SR', DH: 'SB', TG: 'SP' };
  var KN = { v: [[1, 2], [-1, 2]], range: 1 };
  CM.mode({
    id: '8rqN9o9lZOM',
    title: 'Chess vs Shogi',
    name: 'Chess vs Shogi',
    category: 'Other Videos',
    description: 'A 9x9 board: your normal chess army against a full Shogi army. Shogi pieces: Gold (one step any way except diagonally back), Silver (one step diagonally or straight forward), Lance (any distance straight forward), Knight (only the two forward L jumps), Pawn (one step forward, captures forward). They promote in your three back ranks, and every piece Stockfish captures goes to its hand to be dropped back anywhere. You play pure chess, no drops.',
    how_to_win: 'Checkmate the Shogi king.',
    player_side: 'white',
    opponent: { name: 'Fairy-Stockfish', rating: 3000, avatar: 'assets/modes/8rqN9o9lZOM/fairy_stockfish.png', tagline: 'Plays Shogi rules.' },
    board: { files: 9, ranks: 9, light: '#ffffde', dark: '#8aae66' },
    vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/8rqN9o9lZOM/dragon_card.png', fit: 'contain', duration_ms: 1300, fade_ms: 300 }],  /* thumbnail art from the video, shown as the intro card */
    pieces: {
      SK: { name: 'Shogi King', moves: 'K', royal: true, value: 0, glyph: 'K' },
      SR: { name: 'Rook (Hisha)', moves: 'R', value: 900, glyph: 'R' },
      SB: { name: 'Bishop (Kaku)', moves: 'B', value: 800, glyph: 'B' },
      SG: { name: 'Gold General', moves: 'WfF', value: 500, glyph: 'Q' },
      SS: { name: 'Silver General', moves: 'FfW', value: 450, img: { b: 'assets/modes/8rqN9o9lZOM/silver_b.png' } },
      SN: { name: 'Shogi Knight', moves: [KN], value: 300, glyph: 'N' },
      SL: { name: 'Lance', moves: [{ v: [[0, 1]], range: 0 }], value: 300, img: { b: 'assets/modes/8rqN9o9lZOM/lance_b.png' } },
      SP: { name: 'Shogi Pawn', moves: [{ v: [[0, 1]], range: 1 }], value: 100, glyph: 'P' },
      DR: { name: 'Dragon King', moves: 'RF', value: 1100, glyph: 'R', badge: '+' },
      DH: { name: 'Dragon Horse', moves: 'BW', value: 1000, glyph: 'B', badge: '+' },
      TG: { name: 'Promoted (Gold)', moves: 'WfF', value: 500, glyph: 'Q', badge: '+' }
    },
    setup: { fen: '[sl][sn][ss][sg][sk][sg][ss][sn][sl]/1[sr]5[sb]1/[sp][sp][sp][sp][sp][sp][sp][sp][sp]/9/9/9/PPPPPPPPP/9/RNBQK1BNR' },
    rules: { drops: true, castling: false, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 900 },
    hooks: {
      setup: function () {
        var side = document.getElementById('side'); if (!side || side.querySelector('.g4shogi-card')) return;
        var im = document.createElement('img'); im.className = 'g4shogi-card'; im.src = 'assets/modes/8rqN9o9lZOM/ref_card.png';
        im.alt = 'Shogi piece moves (from the video): gold, king, bishop, knight, lance, pawn, silver, rook';
        im.style.cssText = 'display:block;width:100%;max-width:220px;margin:0 auto 10px;border-radius:4px'; side.insertBefore(im, side.firstChild);
      },
      afterMove: function (ctx, m, info) { var p = ctx.state.b[info.to]; if (p && PROMO[info.piece] && p.t !== info.piece) ctx.sound('promote'); },
      onExit: function () { var e = document.querySelector('.g4shogi-card'); if (e) e.remove(); },
      moves: function (V, st, out) { if (st.turn === 'w') return out.filter(function (m) { return !m.drop; }); return null; },
      onMake: function (V, st, m, n) {
        var g = V.geo;
        if (m.c === 'w') { if (m.cap) { n.hands = Object.assign({}, n.hands, { w: [] }); } return; }
        if (m.cap) { var h = n.hands.b.slice(), last = h.pop(); h.push(BASE[last] || last); n.hands = Object.assign({}, n.hands, { b: h }); }
        if (m.drop) return;
        var p = n.b[m.t], to = PROMO[p.t];
        if (to && (g.relRow(m.t, 'b') >= 6 || g.relRow(m.f, 'b') >= 6)) n.b[m.t] = Object.assign({}, p, { t: to });
      }
    },
    source: { research: 'research/modes/8rqN9o9lZOM.json', confidence: 'medium', notes: 'Chess army layout on 9 files inferred; shogi always promotes; captured promoted-pawn returns as pawn (others lose promotion).' },
  });
})();
