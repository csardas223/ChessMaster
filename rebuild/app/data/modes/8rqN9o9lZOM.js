/* Chess vs Shogi.  9x9 board: Tony's chess army (chess rules, no drops) vs Fairy-Stockfish's full Shogi army (shogi
   moves, promotion on entering/moving within its last three ranks, captured pieces go to its hand and can be dropped).
   Tony mates with a rook + knight double check (~12:53). Sources: research/modes/8rqN9o9lZOM.json (transcript 0:38
   9x9, drops: rook a1, bishop f1, pawns). Chess layout on 9 files is visual-only: RNBQK.BNR with f1 empty, 9 pawns.
   Shogi pieces always promote when they can (inferred simplification). */
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
    opponent: { name: 'Fairy-Stockfish', rating: 3000, avatar: 'assets/avatars/stockfish.svg', tagline: 'Plays Shogi rules.' },
    board: { files: 9, ranks: 9, light: '#ffffde', dark: '#8aae66' },
    vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/8rqN9o9lZOM/dragon_card.png', fit: 'contain', duration_ms: 1300, fade_ms: 300 }],  /* thumbnail art from the video, shown as the intro card */
    pieces: {
      SK: { name: 'Shogi King', moves: 'K', royal: true, value: 0, glyph: 'K', badge: '王' },
      SR: { name: 'Rook (Hisha)', moves: 'R', value: 900, glyph: 'R', badge: '飛' },
      SB: { name: 'Bishop (Kaku)', moves: 'B', value: 800, glyph: 'B', badge: '角' },
      SG: { name: 'Gold General', moves: 'WfF', value: 500, glyph: 'Q', badge: '金' },
      SS: { name: 'Silver General', moves: 'FfW', value: 450, glyph: 'B', badge: '銀' },
      SN: { name: 'Shogi Knight', moves: [KN], value: 300, glyph: 'N', badge: '桂' },
      SL: { name: 'Lance', moves: [{ v: [[0, 1]], range: 0 }], value: 300, glyph: 'R', badge: '香' },
      SP: { name: 'Shogi Pawn', moves: [{ v: [[0, 1]], range: 1 }], value: 100, glyph: 'P', badge: '歩' },
      DR: { name: 'Dragon King', moves: 'RF', value: 1100, glyph: 'R', badge: '龍' },
      DH: { name: 'Dragon Horse', moves: 'BW', value: 1000, glyph: 'B', badge: '馬' },
      TG: { name: 'Promoted (Gold)', moves: 'WfF', value: 500, glyph: 'Q', badge: 'と' }
    },
    setup: { fen: '[sl][sn][ss][sg][sk][sg][ss][sn][sl]/1[sr]5[sb]1/[sp][sp][sp][sp][sp][sp][sp][sp][sp]/9/9/9/PPPPPPPPP/9/RNBQK1BNR' },
    rules: { drops: true, castling: false, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
    bot: { engine: 'search', style: 'best', depth: 3, time_ms: 900 },
    hooks: {
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
    todo_pass2: ['shogi piece art (kanji tiles) instead of badged chess glyphs', 'promotion flip VFX', 'side shogi reference card']
  });
})();
