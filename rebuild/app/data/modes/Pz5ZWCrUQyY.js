/* Can 50 Puzzles Cure My Blunders?  50 tactics of mixed rating (about 450-2550), solved one after another; a wrong move
   fails that puzzle and the next one loads. Sources: research/modes/Pz5ZWCrUQyY.json (chess.com brown board #ebd8b5/
   #b48566, streak row). Puzzles: Lichess open puzzle database (CC0, database.lichess.org), ids kept in params.
   Every puzzle is shown with you as White (puzzles where Black was to move are mirrored). The opponent's first move is
   played for you, then find the line. */
(function () {
CM.mode({
  player: { name: 'You', rating: null, avatar: 'assets/modes/Pz5ZWCrUQyY/you.png' },  /* iwantcheckmate's purple king icon from the video */
  vfx: [{ type: 'overlay', at: 'board', image: 'assets/modes/Pz5ZWCrUQyY/intro.jpg', fit: 'contain', duration_ms: 1400, fade_ms: 300 }],  /* intro card = the video's thumbnail (tools/g4_thumbcrops.py) */
  id: 'Pz5ZWCrUQyY',
  title: 'Can 50 Puzzles Cure My Blunders?',
  name: '50 Puzzles Boot Camp',
  category: 'Other Videos',
  description: 'Puzzle boot camp: 50 tactics from about 450 to 2550 rating. The opponent\'s move is played, then you find the best line: checks, captures, attacks. One wrong move fails the puzzle and the next one loads.',
  how_to_win: 'Get through all 50 puzzles; your score is how many you solved.',
  player_side: 'white',
  opponent: { name: 'Puzzles', rating: null, tagline: '50 puzzles, rated 450 to 2550.' },
  board: { files: 8, ranks: 8, light: '#ebd8b5', dark: '#b48566' },
  setup: { fen: '8/8/8/8/8/8/8/8' },
  rules: { castling: true, enPassant: true, promotion: { choices: ['Q', 'N', 'R', 'B'] } },
  bot: { engine: 'search', depth: 1 },
  params: { puzzles: [["2r2Q1k/1b2N1pp/pq6/1n2p3/1P1pP3/P7/2P3PP/5R1K","c8f8 f1f8",497,"0R8P3","w"],["3q2k1/2p2ppp/2r5/pQ6/1n1PP3/1P6/P4PPP/5RK1","d8d4 b5b8 d4d8 b8d8",457,"0RXpZ","b"],["r1bq1r1k/ppp2pp1/1nnb3p/4p1N1/7P/P3P3/BPQP1PP1/RNB1K2R","d8e7 c2h7",563,"010Jc","b"],["r2q1r1k/p1p1n2p/3p2p1/1N3p2/1PBBb3/8/P1P2PPP/b2QR1K1","a1d4 d1d4 f8f6 d4f6",533,"0V7tX","b"],["r1b1r1k1/p1p2p1p/2p2p2/8/3q4/3B1P2/PPPb2PP/R2Q1R1K","d2f4 d3h7 g8h7 d1d4",680,"0LlAD","w"],["8/6k1/2n5/2N4p/p2r4/8/6PP/5RK1","a4a3 c5e6 g7g6 e6d4",712,"0Y6E1","b"],["8/2p3k1/6p1/1K6/5N1p/5P1P/3r2P1/8","d2d4 f4e6 g7f6 e6d4",725,"0CaO8","w"],["5R2/p1p3rk/8/3P2qr/8/1P1Q4/P4KP1/8","h7h6 f8h8 g7h7 h8h7",779,"05VUp","w"],["5qk1/p2nN1pp/5r2/1p1p2N1/2pP4/2P5/PPQ3PP/5RK1","f8e7 c2h7 g8f8 h7h8",859,"01wdX","w"],["5q2/5rk1/3p1np1/p1p5/1pP2NP1/3PNp1P/PP5K/3Q4","f6d7 f4e6 g7g8 e6f8",855,"00dTO","w"],["2r5/1N3kp1/4p3/pp4P1/6K1/8/4R1n1/8","a5a4 b7d6 f7e7 d6c8",861,"0PxBI","b"],["6k1/3q1bpp/1p5r/p7/3Bp3/P2pP1PP/1P3R1K/5Q2","d7h3 f1h3 h6h3 h2h3",954,"0aPOw","b"],["r1bq1rk1/ppp2ppp/2n5/3p4/1bP1n3/5NP1/PP1NPPBP/R1BQ1RK1","d5c4 d2e4 d8d1 f1d1",957,"0J3yV","b"],["5qk1/1p4r1/p1np1NQp/4p3/4P3/7P/PP6/1K2n3","g8h8 g6h6 g7h7 h6f8",1022,"03Vpy","b"],["r7/p2k1p2/2p1n3/2p2bP1/2N2p1Q/KPPP4/P3q3/R7","e2d3 c4e5 d7c7 e5d3",1107,"0AiO7","b"],["r4rk1/pp2p1bp/2n3p1/q2Bp3/3p1N2/5Q2/PPP2PPP/R4RK1","g8h8 f4g6 h7g6 f3h3 g7h6 h3h6",1066,"0QROX","w"],["rnb2rk1/ppp2ppp/8/2b5/8/2qB1Q1P/P1P2PPN/R1B2RK1","b8c6 d3h7 g8h7 f3c3",1151,"0QboJ","b"],["r7/2k3pp/2p2q2/p1Q5/1r1n1P2/6P1/P6P/3RR2K","f6d6 e1e7 d6e7 c5e7",1161,"0J33L","w"],["r5k1/5pp1/2b4p/8/1PBpnR2/2n4P/P1P3P1/5RK1","c6d5 c4d5 c3d5 f4e4",1209,"0SiCg","b"],["5k2/pppR3R/8/8/P2p4/7P/3r2PK/4r3","d2e2 h7h8",1237,"0C0ge","b"],["6Q1/p7/1p4k1/2p3p1/6p1/1P3qPP/P6K/8","g6h5 g8h7",1332,"06dfb","b"],["1b4k1/p2q1ppp/1pr5/3p4/1P6/P2QB1P1/5P1P/3R2K1","c6d6 e3f4 d6e6 f4b8",1324,"0EjG0","b"],["r3k2r/1p3ppp/p2Rpn2/q1p5/2Q1p3/4B3/PPP2PPP/2K4R","a8c8 d6e6 f7e6 c4e6 e8f8 e6c8",1389,"0BJPK","w"],["2b1r3/1pq3kp/pr3pp1/2pB2P1/2P5/2Q4P/P4P2/B4RK1","c7e5 g5f6 b6f6 c3e5 e8e5 a1e5",1397,"01aXE","b"],["2k1r3/1pp2Q2/p4B2/1b6/4q3/5P2/PP3P2/3R2K1","e4f3 f7e8 b5e8 d1d8",1492,"0FOuA","w"],["r1b3k1/pp3rpp/3p4/2p5/7q/1Q3N2/P1P3PP/RNB3K1","h4e4 b3f7 g8f7 f3g5 f7g6 g5e4",1511,"0Gdmy","b"],["b2q3r/Q7/2kp4/3p4/3P2pp/4P3/2P3PP/1R4K1","d8c7 a7a4",1543,"0BlG1","b"],["5qk1/1b3p2/pp1p1Br1/3PnN1p/PP2Q1pP/6P1/2B2RK1/8","g6f6 f5e7 f8e7 e4h7 g8f8 h7h8",1575,"09usI","w"],["3rR1k1/2p2pp1/p6p/1pqr4/8/P4PP1/1P2Q1P1/3RK3","d8e8 e2e8 g8h7 e8e4 d5f5 g3g4",1626,"0JMMn","w"],["8/8/8/5k2/4p1p1/6P1/4KP2/8","f5e5 e2e3 e5f5 e3d4 e4e3 f2e3",1683,"0L4vs","b"],["8/8/4p3/1p1PPk2/pPp5/P4K2/8/2b1B3","c1a3 d5d6 a3c1 e1h4 f5e5 d6d7",1710,"0PqR2","w"],["3qr2k/6pp/p7/1pPBNQ2/8/P3n3/6PP/5RK1","d8d5 f5f8 e8f8 f1f8 d5g8 e5f7",1747,"0WwmS","b"],["8/p1r2pkp/4q1p1/bP2P1Q1/5P2/7P/6PK/3R4","c7d7 g5f6 g7g8 f6e6",1793,"0IOlj","b"],["5bk1/1ppq1pp1/2n4p/p1n5/2P1P3/PP1p2PP/1B3PB1/3QN1K1","c5b3 d1b3 d3d2 e1d3",1871,"04V5S","b"],["8/8/6p1/1PKp3p/p2P4/2kb2PP/8/2B5","c3b3 b5b6 d3a6 c5d5 b3c2 c1a3",1947,"0Vlj1","b"],["6k1/1p3rp1/7p/3Q4/3pP3/P1qP3P/6PK/6R1","c3d3 g1c1 g8h7 d5f7",2001,"0JW6k","w"],["1r3rk1/3R2bp/6p1/1p4B1/8/3B1b2/1PP4P/2K1R3","f8f7 d7f7 g8f7 e1f1",2025,"0PCsF","w"],["1r3rk1/1q2bppp/2bp1n2/p1p2P2/2PpPB2/PP3N1P/2B1Q1P1/1R3RK1","c6e4 c2e4 f6e4 b1e1",2087,"0KWQu","w"],["4rk2/p2r1p1Q/1p1Pp1p1/2P5/P3R3/2q3PP/5P1K/4R3","b6c5 e4e5 d7d6 h7h8",2130,"0CCDn","w"],["1rb1k3/4bpp1/p1pp4/q4PP1/8/1PPB4/P2Q4/1NK4R","c8f5 h1h8 e8d7 h8b8",2110,"09eed","w"],["4rr1k/1pqbbppp/p2p4/3P4/3p1B2/2PB2Q1/PP4PP/4RRK1","d4c3 e1e7 e8e7 g3h4 e7e4 d3e4",2184,"0GftU","w"],["8/6pp/8/4Kpk1/8/5P1P/6P1/8","g7g6 g2g3 f5f4 h3h4 g5h5 e5f4",2181,"0KReq","b"],["5Bk1/8/p1p1p1K1/2Pn4/1r6/8/8/5R2","b4b2 f8d6 b2g2 g6h6",2222,"0GLTs","b"],["2krr3/8/Q6p/5N2/pP3q1P/P7/3b1PP1/3R2K1","c8d7 a6b7 d7e6 f5g7 e6f6 g7h5",2268,"05EbJ","b"],["8/6p1/p5kp/1p3p1P/1Pqp1Q2/P4P2/6P1/7K","g6h5 g2g4 h5h4 g4f5 h4h5 f4g4",2313,"0XHd1","w"],["r2r2k1/pb2b1pp/1p2p3/1N2qp2/2P1n3/P3B1Q1/1PB2PPP/2R2RK1","e5b2 g3c7 e7c5 c7b7 c5e3 f2e3",2386,"0NUvs","w"],["r4rk1/ppp2p1p/1bnp2q1/3NPR2/2BP4/3QP2P/PP4P1/6K1","a8e8 d5f6 g8h8 f5h5 g6h5 f6h5",2460,"0HvAk","w"],["8/5P1P/1p4K1/8/6P1/8/2p5/k6r","h1h6 g6h6 c2c1q g4g5 c1c6 h6g7",2474,"00EUu","w"],["3r3r/ppp3pp/2p2pk1/5b2/4n3/2PB4/PBP2PPP/3RR1K1","h8e8 g2g4 f5g4 e1e4 d8d3 e4g4",2578,"0FihT","w"],["6k1/4Kp1p/4P1pB/3B1rP1/8/8/8/8","f5e5 e7d6 f7e6 d6e5",2562,"0QjlO","w"]] },
  hooks: {
    setup: function (ctx) { ctx.game._pz = { k: 0, step: 0, res: [] }; load(ctx); },
    afterMove: function (ctx, m, info) {
      var z = ctx.game._pz, P = ctx.params.puzzles[z.k], line = P[1].split(' ');
      if (info.by !== 'player') return;
      var want = line[z.step], got = uci(ctx, m);
      if (got !== want && !(isMate(ctx))) {
        z.res.push(0); ctx.toast('Incorrect. The move was ' + want.slice(0, 2) + '-' + want.slice(2, 4));
        ctx.fx({ type: 'flash', at: ctx.name(m.t), color: '#e0533c', duration_ms: 500 });
        return wait(900).then(function () { next(ctx); });
      }
      z.step++;
      if (z.step >= line.length || isMate(ctx)) {
        z.res.push(1); ctx.fx({ type: 'flash', at: ctx.name(m.t), color: '#7fa650', duration_ms: 500 }); ctx.sound('notify');
        return wait(800).then(function () { next(ctx); });
      }
      return wait(450).then(function () { play(ctx, line[z.step]); z.step++; });
    },
    status: function (ctx) {
      var z = ctx.game._pz; if (!z) return null; var P = ctx.params.puzzles[Math.min(z.k, 49)], ok = z.res.filter(Boolean).length;
      var row = z.res.slice(-12).map(function (r) { return r ? '\u2713' : '\u2717'; }).join('');
      return ctx.over ? null : 'Puzzle ' + (z.k + 1) + '/50 · rated ' + P[2] + ' · solved ' + ok + ' ' + row;
    }
  },
  source: { research: 'research/modes/Pz5ZWCrUQyY.json', confidence: 'high', notes: 'The video uses chess.com puzzles; this mode uses a fixed set of 50 CC0 Lichess puzzles spread over the same rating range. Black-to-move puzzles mirrored so you are always White.' },
  todo_pass2: ['streak row of green/red squares under the board', '"White to Move" puzzle panel styling']
});
function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function uci(ctx, m) { return ctx.name(m.f) + ctx.name(m.t) + (m.promo ? m.promo.toLowerCase() : ''); }
function isMate(ctx) { var V = ctx.V, st = ctx.state; return V.legal(st).length === 0 && V.inCheck(st, st.turn); }
function find(ctx, s) { var L = ctx.V.legal(ctx.state); for (var i = 0; i < L.length; i++) if (uci(ctx, L[i]) === s) return L[i]; return null; }
function play(ctx, s) { var m = find(ctx, s); if (!m) { console.warn('[puzzles] move not legal: ' + s); return; } ctx.state = m.n || ctx.V.make(ctx.state, m); ctx.game.last = m; ctx.sound(m.cap ? 'capture' : 'move-opponent'); }
function load(ctx) {
  var z = ctx.game._pz, P = ctx.params.puzzles[z.k];
  ctx.state = CM.spec.initialState(ctx.V, Object.assign({}, ctx.spec, { setup: { fen: P[0], turn: 'b' } }));
  z.step = 0; var line = P[1].split(' '); play(ctx, line[0]); z.step = 1;
}
function next(ctx) {
  var z = ctx.game._pz; z.k++;
  if (z.k >= ctx.params.puzzles.length) { var ok = z.res.filter(Boolean).length; ctx.endGame(ok >= 25 ? 'player' : 'bot', ok + ' of 50 puzzles solved'); return; }
  load(ctx); ctx.toast('Puzzle ' + (z.k + 1) + ' · rated ' + ctx.params.puzzles[z.k][2]);
}
})();
