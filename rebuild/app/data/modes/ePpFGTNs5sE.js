/* Can I BEAT Circular Chess?  Circular chess on Deckmate vs the experimental Circular Chess Bot (level 1). The ring
   board (4 rings x 16 cells, hole in the middle; frames) is drawn unrolled as 8x8: each ring is one rank on the White
   half plus its mirror rank on the Black half, so moving sideways past the a- or h-file continues around the ring onto
   the mirror rank (rank r <-> rank 9-r) and back the other way. Rooks, queens and kings travel around the ring this way;
   diagonals stop at the sector breaks (transcript) so bishops do not wrap. Sources: research/modes/ePpFGTNs5sE.json,
   frames visual (4x16 ring, cream/brown). The transcript's "extra knights" and a-t lettering conflict with the frames
   (frames win); not implemented. */
(function () {
  function ringStep(g, i, dir) {        /* one sideways step along the ring; returns [square, newDir] */
    var c = g.col(i), r = g.row(i), nc = c + dir;
    if (nc >= 0 && nc < g.files) return [g.idx(nc, r), dir];
    return [g.idx(c, g.ranks - 1 - r), -dir];
  }
  var RIDERS = { R: 1, Q: 1 }, KINGS = { K: 1 };
  function has(out, f, t) { for (var k = 0; k < out.length; k++) if (out[k].f === f && out[k].t === t) return true; return false; }
  function wrapMoves(V, st, i, p, out) {
    var g = V.geo, b = st.b, slide = RIDERS[p.t], one = KINGS[p.t];
    if (!slide && !one) return;
    [-1, 1].forEach(function (d0) {
      var j = i, dir = d0, wrapped = false;
      for (var s = 0; s < 16; s++) {
        var nx = ringStep(g, j, dir); if (g.row(nx[0]) !== g.row(j)) wrapped = true;
        j = nx[0]; dir = nx[1]; if (j === i) break;
        var q = b[j];
        if (wrapped) {
          if (q) { if (V.canCapture(p, q) && !has(out, i, j)) out.push({ f: i, t: j, p: p.t, c: p.c, cap: q, capSq: j, ring: 1 }); break; }
          if (!has(out, i, j)) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null, ring: 1 });
        } else if (q) break;
        if (one) break;
      }
    });
  }
  CM.mode({
    id: 'ePpFGTNs5sE',
    name: 'Circular Chess',
    category: 'Variants & Games',
    description: 'The board is a ring: each rank joins its mirror rank around the outside (shown unrolled here). Rooks, queens and kings moving sideways off the a- or h-file continue around the ring onto the mirror rank. Diagonals stop at the sector breaks, so bishops and knights move as usual.',
    how_to_win: 'Checkmate the bot.',
    player_side: 'white',
    opponent: { name: 'Circular Chess Bot', rating: null, avatar: null, tagline: 'Experimental bot, level 1.' },
    board: { files: 8, ranks: 8, light: '#f2e6b0', dark: '#b5512f' },
    theme: { background: '#4a1d3f' },
    setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR' },
    bot: { engine: 'search', elo: 900, style: 'elo', depth: 3, time_ms: 600 },
    hooks: {
      moves: function (V, st, out) {
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (p && p.c === st.turn && !p.dead) wrapMoves(V, st, i, p, out); }
      },
      attacks: function (V, st, sq, by) {
        for (var i = 0; i < st.b.length; i++) {
          var p = st.b[i]; if (!p || p.c !== by || (!RIDERS[p.t] && !KINGS[p.t])) continue;
          var tmp = [], save = st.b[sq]; if (!save) st.b[sq] = { t: '?', c: '?', probe: 1 };
          wrapMoves(V, st, i, p, tmp); st.b[sq] = save;
          for (var k = 0; k < tmp.length; k++) if (tmp[k].t === sq) return true;
        }
        return false;
      }
    },
    source: { research: 'research/modes/ePpFGTNs5sE.json', confidence: 'medium', notes: 'Ring drawn unrolled; extra knights from the transcript omitted (frames show standard armies).' }
  });
})();
