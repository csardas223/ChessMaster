/* Piece movement: a Betza-style notation parser and the built-in piece catalogue.

   A piece type definition (see ARCHITECTURE.md, "Pieces"):
     { name, value, moves: 'Betza string' | [atom objects], royal, pawn, enPassant, promote,
       castle, castleRook, capturable, blocker, attacks, img, glyph, badge, gen }

   Atom object (what a Betza token compiles to):
     { v: [[dx,dy],...],  // vectors in the PIECE OWNER's frame: dx>0 = to the owner's right, dy>0 = forward
       range: 1,          // 1 = leaper/step, n = up to n steps, 0 = unlimited rider
       mode: 'mc'|'m'|'c',// m = may only move to empty, c = may only capture, mc = both
       initial: false,    // only when the piece has not moved yet (piece.m === 0)
       lame: false,       // leaper blocked by pieces on the squares between (pawn double step, xiangqi horse)
       hop: null }        // 'p' = cannon (must jump exactly one piece, then slide), 'g' = grasshopper (lands right behind the hurdle)
*/
(function () {
  'use strict';
  var CM = window.CM;

  var ATOMS = { W: [1, 0], F: [1, 1], D: [2, 0], N: [2, 1], A: [2, 2], H: [3, 0], C: [3, 1], Z: [3, 2], G: [3, 3] };
  var SHORT = { K: 'WF', Q: 'W0F0', R: 'W0', B: 'F0', O: '' };

  function sym(a) { /* all 8 symmetric images of [x,y] */
    var x = a[0], y = a[1], out = [], seen = {};
    [[x, y], [y, x]].forEach(function (p) {
      [1, -1].forEach(function (sx) {
        [1, -1].forEach(function (sy) {
          var v = [p[0] * sx, p[1] * sy], k = v.join(',');
          if (!seen[k]) { seen[k] = 1; out.push(v); }
        });
      });
    });
    return out;
  }
  function dirOk(v, mods) {
    var dx = v[0], dy = v[1];
    var vert = mods.replace(/[^fbv]/g, ''), hor = mods.replace(/[^lrs]/g, '');
    function V(ch) { return ch === 'f' ? dy > 0 : ch === 'b' ? dy < 0 : (dx === 0 || Math.abs(dy) > Math.abs(dx)); }
    function H(ch) { return ch === 'l' ? dx < 0 : ch === 'r' ? dx > 0 : (dy === 0 || Math.abs(dx) > Math.abs(dy)); }
    var vm = !vert || vert.split('').some(V), hm = !hor || hor.split('').some(H);
    if (vert && hor) return { both: vm && hm, any: vert.split('').some(V) || hor.split('').some(H) };
    return { both: vm && hm, any: vm && hm };
  }

  /* 'fmWfcFifmnD' -> atoms. Throws on syntax it does not understand so spec authors notice. */
  function parseBetza(str) {
    var out = [], re = /([a-z]*)([A-Z])(\2?)(\d*)/g, m, pos = 0;
    str = String(str).replace(/\s+/g, '');
    while ((m = re.exec(str))) {
      if (m.index !== pos) throw new Error('Betza: cannot parse "' + str + '" near "' + str.slice(pos) + '"');
      pos = re.lastIndex;
      var mods = m[1], letter = m[2], doubled = !!m[3], num = m[4];
      if (SHORT[letter] !== undefined) {
        var exp = SHORT[letter];
        /* re-apply modifiers / range to each expanded atom */
        exp.replace(/([A-Z])(\d*)/g, function (_, L, n) {
          var range = num !== '' ? num : (n !== '' ? n : '');
          out.push.apply(out, parseBetza(mods + L + range));
          return '';
        });
        continue;
      }
      var base = ATOMS[letter];
      if (!base) throw new Error('Betza: unknown atom ' + letter + ' in "' + str + '"');
      var range = doubled ? 0 : (num === '' ? 1 : +num);
      var all = sym(base), dm = mods.replace(/[^fblrsv]/g, ''), vecs;
      if (dm) {
        var both = all.filter(function (v) { return dirOk(v, dm).both; });
        vecs = both.length ? both : all.filter(function (v) { return dirOk(v, dm).any; });
      } else vecs = all;
      var mode = /m/.test(mods) && !/c/.test(mods) ? 'm' : /c/.test(mods) && !/m/.test(mods) ? 'c' : 'mc';
      out.push({ v: vecs, range: range, mode: mode, initial: /i/.test(mods), lame: /n/.test(mods),
        hop: /p/.test(mods) ? 'p' : /g/.test(mods) ? 'g' : null });
    }
    if (pos !== str.length) throw new Error('Betza: cannot parse "' + str + '" near "' + str.slice(pos) + '"');
    return out;
  }

  function compileMoves(moves) {
    if (!moves) return [];
    if (typeof moves === 'string') return parseBetza(moves);
    var out = [];
    moves.forEach(function (a) {
      if (typeof a === 'string') { out.push.apply(out, parseBetza(a)); return; }
      var v = a.v || a.vectors;
      if (a.atom) v = a.atom.length === 1 && ATOMS[a.atom] ? sym(ATOMS[a.atom]) : v;
      if (a.symmetric && v) { var all = []; v.forEach(function (x) { all.push.apply(all, sym(x)); }); v = all; }
      out.push({ v: v, range: a.range == null ? 1 : a.range, mode: a.mode || 'mc', initial: !!a.initial, lame: !!a.lame, hop: a.hop || null });
    });
    return out;
  }

  /* built-in catalogue. Ids are the type keys used in FEN (single letters) or [Id] for longer ids. */
  var BUILTIN = {
    P: { name: 'Pawn', value: 100, moves: 'fmWfcFifmnD', pawn: true, enPassant: true, promote: true, san: '' },
    N: { name: 'Knight', value: 300, moves: 'N' },
    B: { name: 'Bishop', value: 320, moves: 'B' },
    R: { name: 'Rook', value: 500, moves: 'R', castleRook: true },
    Q: { name: 'Queen', value: 900, moves: 'Q' },
    K: { name: 'King', value: 0, moves: 'K', royal: true, castle: true },
    /* common fairy pieces (glyph = which standard image to draw, badge = small label). m-art 2026-11-26: A C M F W G L I carry
       chess.com's own variant piece art (assets/img/fairy, the art the videos show); the glyph+badge stays as the fallback for
       a mode that reuses the letter for a different piece (variant.js drops the inherited img when the name differs). */
    A: { name: 'Archbishop', value: 750, moves: 'BN', glyph: 'B', badge: 'BN', img: { w: 'assets/img/fairy/archbishop_w.png', b: 'assets/img/fairy/archbishop_b.png' } },
    C: { name: 'Chancellor', value: 850, moves: 'RN', glyph: 'R', badge: 'RN', img: { w: 'assets/img/fairy/chancellor_w.png', b: 'assets/img/fairy/chancellor_b.png' } },
    D: { name: 'Dragon', value: 1200, moves: 'QN', img: { w: 'assets/img/dragon_w.png', b: 'assets/img/dragon_b.png' } },
    M: { name: 'Amazon', value: 1200, moves: 'QN', glyph: 'Q', badge: 'QN', img: { w: 'assets/img/fairy/amazon_w.png', b: 'assets/img/fairy/amazon_b.png' } },
    E: { name: 'Elephant', value: 170, moves: 'FA', glyph: 'B', badge: 'E' },
    F: { name: 'Ferz', value: 180, moves: 'F', glyph: 'P', badge: 'F', img: { w: 'assets/img/fairy/ferz_w.png', b: 'assets/img/fairy/ferz_b.png' } },
    W: { name: 'Wazir', value: 180, moves: 'W', glyph: 'P', badge: 'W', img: { w: 'assets/img/fairy/wazir_w.png', b: 'assets/img/fairy/wazir_b.png' } },
    G: { name: 'Grasshopper', value: 330, moves: 'gQ', glyph: 'Q', badge: 'G', img: { w: 'assets/img/fairy/grasshopper_w.png', b: 'assets/img/fairy/grasshopper_b.png' } },
    L: { name: 'Nightrider', value: 560, moves: 'NN', glyph: 'N', badge: 'NN', img: { w: 'assets/img/fairy/nightrider_w.png', b: 'assets/img/fairy/nightrider_b.png' } },
    I: { name: 'Camel', value: 270, moves: 'C', glyph: 'N', badge: 'CA', img: { w: 'assets/img/fairy/camel_w.png', b: 'assets/img/fairy/camel_b.png' } },
    U: { name: 'Commoner', value: 300, moves: 'K', glyph: 'K', badge: 'M' },
    X: { name: 'Cannon', value: 450, moves: 'mRcpR', glyph: 'R', badge: 'X' },
    /* neutral obstacles */
    '#': { name: 'Wall', value: 0, moves: '', blocker: true, capturable: false, overlay: 'wall' },
    '*': { name: 'Duck', value: 0, moves: '', blocker: true, capturable: false, overlay: 'duck' }
  };

  CM.movement = { parseBetza: parseBetza, compileMoves: compileMoves, sym: sym, ATOMS: ATOMS, BUILTIN: BUILTIN };
})();
