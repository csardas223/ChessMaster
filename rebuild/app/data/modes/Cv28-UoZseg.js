/* Can I BEAT Sergeant's Checkers?  LOW CONFIDENCE (no transcript rules; frames only). Two armies of flat pawn-shaped
   Sergeants (blue = you, green) each led by a crowned Sergeant King, on an irregular ~10x11 board with cut corners, a
   central hole and stone wall tiles, played online. Sources: research/modes/Cv28-UoZseg.json, frames visual_* (grey
   checker #dcdcdc/#b1b1b1, cobblestone walls, fleur-de-lis king). Movement is INFERRED checkers-style: Sergeants step
   one square diagonally forward and capture by jumping an adjacent enemy diagonally (forward or back) onto the empty
   square behind it; the Sergeant King steps one square in any direction and captures the same way or by stepping onto
   an adjacent enemy. Capture the enemy Sergeant King to win. Re-run the transcript to confirm (see report). */
CM.mode({
  id: 'Cv28-UoZseg',
  title: "Can I BEAT Sergeant's Checkers?",
  name: "Sergeant's Checkers",
  category: 'Variants & Games',
  description: 'Blue Sergeants (you) against green ones on an odd-shaped board with cut corners, a hole in the middle and stone walls. Sergeants step one square diagonally forward and capture by jumping over an adjacent enemy diagonally. Your crowned Sergeant King steps one square any direction and can capture by stepping onto or jumping over an enemy.',
  how_to_win: 'Capture the green Sergeant King (or every green piece).',
  player_side: 'white',
  player: { name: 'You (Blue)' },
  opponent: { name: 'Online opponent', rating: null, tagline: 'Green army.' },
  board: { files: 10, ranks: 11, mask: ['xx......xx', 'x........x', '..........', '..........', '..........', '....xx....', '..........', '..........', '..........', 'x........x', 'xx......xx'], light: '#dcdcdc', dark: '#b1b1b1' },
  theme: { background: '#5c6a5a' },
  pieces: {
    S: { name: 'Sergeant', moves: '', gen: 'sgGen', value: 100, img: { w: 'assets/modes/Cv28-UoZseg/sergeant_w.png', b: 'assets/modes/Cv28-UoZseg/sergeant_b.png' } },
    K: { name: 'Sergeant King', moves: '', gen: 'sgGen', royal: true, castle: false, value: 0, img: 'assets/modes/Cv28-UoZseg/king_w.png' },
    '#': { name: 'Stone wall', img: 'assets/modes/Cv28-UoZseg/stone.png', overlay: null }
  },
  setup: { fen: '3[s]1[k]1[s]2/2[s]1[s]1[s]1[s]1/1[s]1[s]1[s]1[s]1[s]/10/10/2*4*2/10/10/1[S]1[S]1[S]1[S]1[S]/2[S]1[S]1[S]1[S]1/3[S][K][S]1[S]2' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: false, drawPlies: 160, win: [{ type: 'checkmate' }, { type: 'eliminate', result: 'loss' }] },
  bot: { engine: 'search', depth: 3, time_ms: 600 },
  hooks: {
    sgGen: function (V, st, i, p, out) {
      var g = V.geo, fr = g.FR(p.c), king = p.t === 'K';
      var dirs = [[1, 1], [-1, 1], [1, -1], [-1, -1]].concat(king ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : []);
      dirs.forEach(function (d) {
        var dc = d[0] * fr.R[0] + d[1] * fr.F[0], dr = d[0] * fr.R[1] + d[1] * fr.F[1], diag = d[0] && d[1];
        var j = g.step(i, dc, dr); if (j < 0) return; var q = st.b[j];
        if (!q) { if (king || d[1] > 0) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null }); return; }
        if (!V.isEnemy(p.c, q.c) && !q.probe) return;
        if (king && (V.canCapture(p, q) || q.probe)) out.push({ f: i, t: j, p: p.t, c: p.c, cap: q, capSq: j });
        if (!diag) return;
        var k = g.step(j, dc, dr); if (k < 0 || st.b[k]) return;
        out.push({ f: i, t: k, p: p.t, c: p.c, cap: q, capSq: j });
      });
    }
  },
  source: { research: 'research/modes/Cv28-UoZseg.json', confidence: 'low', notes: 'Rules unconfirmed (no transcript). Board dimensions approximate; movement inferred checkers-like. Probe capture of royal = check none, king capture wins.' },
  _gameplay_todo: ['confirm rules from the transcript (re-run analyze_video)']
});
