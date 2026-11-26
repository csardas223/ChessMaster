/* Chess, But with 10 SCPs: CONTAINMENT BREACH. An 8x20 board under fog of war, standard armies on ranks 1-2 and
   19-20, and ten SCPs placed between them. Each round: your move, Stockfish's move, then every SCP acts in a random
   order fixed for the game, each followed by the pieces it controls.
   RULES: ported from iwantcheckmate.com's own engine (challenges/containment-breach/engine.js, read 2026-11-26; no code
   copied, logic reimplemented on our board). Our square index (row 0 = rank 20, index = row * 8 + file) is the site's
   key(x, y) = y * 8 + x, so the site's coordinates carry over 1:1.
   - Placement: two lanes (files a-d / e-h) in each of five rank bands between ranks 3 and 18, one SCP per slot, jittered.
   - Effects (zombie, sleeper, toaster, host, frozen) make a piece neutral: nobody controls it, anybody may capture it,
     and an active one (zombie, sleeper, host) attacks and gives check to both sides. Frozen pieces and toasters are inert.
   - Priority: the SCP order is also the effect priority. An SCP may override an effect from an SCP with an equal or
     lower order number, never its own.
   - 035 Mask possesses the first adjacent piece clockwise from the upper left; the host then hunts the nearest king with
     its own movement. When the host is captured, overridden or teleported, the mask respawns on an empty square.
   - 049 / 966 / 426 step one orthogonal square, then affect every adjacent piece: 049 zombifies (zombie pawns move and
     capture both ways), 966 makes dark sleepers, 426 toasters; 966 and 426 next to a king kill it.
   - 096 stays still until a piece attacks its square, then rushes to the nearest attacker and captures it.
   - 106 steps toward the closest king, then teleports every adjacent piece to a random empty square (clears effects).
   - 173 moves only while no piece attacks it: a knight jump toward the closest king, capturing what it lands on.
   - 409 alternates: an orthogonal step (warning aura on its ring), then freezes the 8 pieces around it. After three of
     its turns a frozen piece thaws or shatters, 50/50.
   - 682 copies the movement of a random piece attacking it (orthogonal king step until it has one), captures its
     matching attacker when it can, otherwise the most valuable target in reach.
   - 939 steps one square toward the destination of the more valuable piece moved this round, capturing what is there.
   - Converted pieces first act the round after their conversion. A captured king ends the game.
   Our deviations: a converted/frozen KING keeps its colour (our engine needs both kings), so check rules still apply to
   it; Stockfish plays our search bot (the site uses a small heuristic AI under the Stockfish name).
   Art: all ten SCP sprites and the toaster are iwantcheckmate.com's own (challenges/containment-breach/assets/, see
   source.notes); the effect looks (zombie/sleeper/host/frozen filters, 409 aura, #c5f3a378 effect pulse) are the site's
   CSS values. lineup.png is cropped from this video's frames, credit iwantcheckmate. */
(function () {
'use strict';
var A = 'assets/modes/Ji7frCIfmAQ/';
var META = {
  '035': { name: 'SCP-035 The Possessive Mask', img: A + 'mask.png', rule: 'Possesses the first adjacent piece clockwise from the upper left. Its host pursues kings using its own movement. The mask respawns when its host is captured or overridden.' },
  '049': { name: 'SCP-049 The Plague Doctor', img: A + 'scp049.png', rule: 'Wanders one orthogonal square, then zombifies adjacent pieces. Zombies move randomly with their own movement; zombie pawns move and capture both ways.' },
  '096': { name: 'SCP-096 The Shy Guy', img: A + 'shyguy.png', rule: 'Stays still until a piece attacks its square, then rushes to and captures the nearest observer.' },
  '106': { name: 'SCP-106 The Old Man', img: A + 'oldman.png', rule: 'Steps toward the closest king, then teleports adjacent pieces to random empty squares.' },
  '173': { name: 'SCP-173 The Sculpture', img: A + 'scp173.png', rule: 'Cannot move while a piece attacks it. Unobserved, it knight-jumps toward the closest king and captures whatever is on its landing square.' },
  '409': { name: 'SCP-409 Contagious Crystal', img: A + 'scp409.png', rule: 'Alternates between an orthogonal step with a warning aura and freezing adjacent pieces. After three of its turns, each frozen piece thaws or shatters, 50/50.' },
  '426': { name: 'SCP-426 I Am a Toaster', img: A + 'toaster.png', rule: 'Wanders one orthogonal square, then turns neighbouring pieces into stationary toasters (capturable). Next to a king it is fatal.' },
  '682': { name: 'SCP-682 Hard-to-Destroy Reptile', img: A + 'lizard.png', rule: 'Copies the movement of a random piece attacking it. Prefers to capture that piece, otherwise the most valuable target.' },
  '939': { name: 'SCP-939 With Many Voices', img: A + 'scp939.png', rule: 'Follows the more valuable piece moved this round: steps one square toward where it went and captures anything there.' },
  '966': { name: 'SCP-966 The Sleep Killer', img: A + 'scp966.png', rule: 'Wanders one orthogonal square and turns adjacent pieces into dark neutral sleepers that move randomly. Next to a king it is fatal.' }
};
var IDS = Object.keys(META);
var ORTH = [[0, -1], [1, 0], [0, 1], [-1, 0]], RING = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
var KN = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
var W = 8, H = 20, VAL = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 1000 };
/* the site's effect looks (style.css) */
var CSS = '.cb-zombie{filter:sepia(1) saturate(3) hue-rotate(65deg) brightness(.65)!important}' +
  '.cb-sleeper{filter:brightness(0)!important}' +
  '.cb-host{filter:sepia(.25) drop-shadow(0 0 4px #b087d9)!important}' +
  '.cb-frozen{filter:grayscale(1) sepia(1) saturate(3) hue-rotate(145deg) brightness(1.3) drop-shadow(0 0 4px #70d6ff)!important}' +
  '.cb-mask{position:absolute;right:0;top:0;width:50%;height:50%;object-fit:contain;z-index:4;pointer-events:none;filter:drop-shadow(0 0 3px #000)}';

var inb = function (x, y) { return x >= 0 && x < W && y >= 0 && y < H; };
var I = function (x, y) { return y * W + x; };
var X = function (i) { return i % W; }, Y = function (i) { return Math.floor(i / W); };
function scpId(p) { return p && p.t.charAt(0) === 'S' && META[p.t.slice(1)] ? p.t.slice(1) : null; }
function isPiece(p) { return !!p && !scpId(p); }
function colOf(p) { return p.was || p.c; }
function baseType(p) { return p.t === 'Toast' ? (p.ot || 'P') : p.t; }
function active(p) { return isPiece(p) && p.eff !== 'frozen' && p.eff !== 'toaster' && p.t !== 'Toast'; }
function body(b, x, y) { return inb(x, y) && !!scpId(b[I(x, y)]); }
function pieceAt(b, x, y) { if (!inb(x, y)) return null; var p = b[I(x, y)]; return isPiece(p) ? p : null; }
function empty(b, x, y) { return inb(x, y) && !b[I(x, y)]; }

/* does piece p on square i attack square sq? (the site's attacks()) */
function attacks(b, i, p, sq) {
  if (!active(p) || i === sq) return false;
  var px = X(i), py = Y(i), x = X(sq), y = Y(sq), dx = x - px, dy = y - py, ax = Math.abs(dx), ay = Math.abs(dy), t = baseType(p);
  if (t === 'P') return ax === 1 && (p.eff === 'zombie' ? ay === 1 : dy === (colOf(p) === 'w' ? -1 : 1));
  if (t === 'N') return ax * ay === 2;
  if (t === 'K') return Math.max(ax, ay) === 1;
  var ok = (ax === ay && (t === 'B' || t === 'Q')) || ((dx === 0 || dy === 0) && (t === 'R' || t === 'Q'));
  if (!ok) return false;
  for (var xx = px + Math.sign(dx), yy = py + Math.sign(dy); xx !== x || yy !== y; xx += Math.sign(dx), yy += Math.sign(dy)) if (b[I(xx, yy)]) return false;
  return true;
}
function attackers(b, sq) { var o = []; for (var i = 0; i < b.length; i++) if (isPiece(b[i]) && attacks(b, i, b[i], sq)) o.push(i); return o; }
function danger(b, sq, color) { for (var i = 0; i < b.length; i++) { var p = b[i]; if (isPiece(p) && (p.eff || colOf(p) !== color) && attacks(b, i, p, sq)) return true; } return false; }
function kings(b, except) { var o = []; for (var i = 0; i < b.length; i++) if (b[i] && b[i].t === 'K' && i !== except) o.push(i); return o; }
function capturable(p, t) { return t && t !== p && (p.eff || t.eff || colOf(p) !== colOf(t)); }

/* moves for an effect piece or for SCP-682's borrowed movement (the site's rawMoves with attackKings / anomaly) */
function rawMoves(b, i, p, type, color, anomaly) {
  var out = [], x = X(i), y = Y(i);
  function add(nx, ny, promo) {
    if (!inb(nx, ny) || body(b, nx, ny) && I(nx, ny) !== i) return false;
    var t = pieceAt(b, nx, ny);
    if (!t || anomaly || capturable(p, t)) out.push({ f: i, t: I(nx, ny), promo: !!promo });
    return !t;
  }
  function rays(dirs) { dirs.forEach(function (d) { for (var s = 1; s < H; s++) if (!add(x + d[0] * s, y + d[1] * s)) break; }); }
  if (type === 'P') {
    var dirs = p && p.eff === 'zombie' ? [-1, 1] : [color === 'w' ? -1 : 1];
    dirs.forEach(function (d) {
      if (empty(b, x, y + d)) {
        add(x, y + d, y + d === 0 || y + d === H - 1);
        if (anomaly && y === (color === 'w' ? H - 2 : 1) && empty(b, x, y + 2 * d)) add(x, y + 2 * d);
      }
      [-1, 1].forEach(function (dx) { var t = pieceAt(b, x + dx, y + d); if (t && (anomaly || capturable(p, t))) add(x + dx, y + d, y + d === 0 || y + d === H - 1); });
    });
  } else if (type === 'N') KN.forEach(function (d) { add(x + d[0], y + d[1]); });
  else if (type === 'K' || type === 'O') (type === 'O' ? ORTH : RING).forEach(function (d) { add(x + d[0], y + d[1]); });
  else rays(type === 'B' ? RING.filter(function (d) { return d[0] && d[1]; }) : type === 'R' ? ORTH : RING);
  return out;
}

CM.mode({
  id: 'Ji7frCIfmAQ',
  title: 'Chess, But with 10 SCPs: CONTAINMENT BREACH',
  name: 'Containment Breach',
  category: 'Horror Chess',
  description: 'An 8x20 board in fog of war with ten SCPs loose between the armies. After your move and Stockfish\'s, every SCP acts in a random order (that order is also who overrides whom): the Mask possesses a piece and hunts kings with it, the Plague Doctor makes zombies, the Sleep Killer dark sleepers, the Toaster toasters, the Old Man teleports pieces, Shy Guy kills whoever looks at it, SCP-173 jumps at kings when unwatched, the Crystal freezes pieces (they thaw or shatter), the Reptile copies its attackers, and SCP-939 follows the biggest move. Converted pieces are neutral: anyone can take them, and they attack both sides.',
  how_to_win: 'Checkmate Stockfish or see its king captured by anyone, SCPs included. Lose your king and you lose.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Plays perfect chess. The SCPs do not care.' },
  board: { files: 8, ranks: 20, zoom: false /* fog + scripted SCP camera: no universal zoom */, viewport: { files: 8, ranks: 12, mobile: { files: 8, ranks: 11 }, follow: 'player_king' } },
  theme: { light: '#eacfac', dark: '#aa7a5b', background: '#15110f' },   /* the site's board colours */
  pieces: (function () {
    var o = {};
    IDS.forEach(function (k) { o['S' + k] = { name: META[k].name, moves: '', value: 0, capturable: false, img: META[k].img, neutralGlow: false }; });
    o.Toast = { name: 'Toaster', moves: '', value: 50, img: A + 'toaster.png', neutralGlow: false };
    return o;
  })(),
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/8/8/8/8/8/8/8/8/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { round: 1 } },
  rules: { fog: true, castling: true, enPassant: true, win: [{ type: 'checkmate' }] },
  bot: { engine: 'search', style: 'best', depth: 3, time_ms: 700 },
  params: { stepMs: 430 },
  sounds: { alarm: A + 'alarm.wav' },
  assets: { lineup: A + 'lineup.png' },
  messages: { win: 'the Stockfish king fell in the breach', win_title: 'You Survived!' },
  vfx: [{ type: 'vignette', color: 'rgba(120,0,0,.45)', size: 70, target: 'board', duration_ms: 0, id: 'cb-vig' }],
  hooks: {
    setup: function (ctx) {
      /* the site's placement: two lanes in each of five rank bands (rows 2..17), jittered */
      var slots = [];
      for (var band = 0; band < 5; band++) for (var lane = 0; lane < 2; lane++) {
        var y0 = 2 + Math.floor(band * 16 / 5), span = Math.floor((band + 1) * 16 / 5) - Math.floor(band * 16 / 5);
        slots.push(I(lane * 4 + ctx.random(4), y0 + ctx.random(span)));
      }
      var ids = shuffle(ctx, IDS);
      ids.forEach(function (k, n) { ctx.spawn('S' + k, 'n', slots[n]); });
      var order = shuffle(ctx, IDS), ord = {};
      order.forEach(function (k, n) { ord[k] = n + 1; });
      ctx.setX('order', order); ctx.setX('ord', ord); ctx.setX('round', 1); ctx.setX('c409', 0); ctx.setX('ser', 0);
      ctx.setX('liz', { t: null, c: 'w' }); ctx.setX('lm', {}); ctx.setX('ne', 0); ctx.setX('maskPend', 0);
    },
    init: function () {
      if (document.getElementById('cb-style')) return;
      var s = document.createElement('style'); s.id = 'cb-style'; s.textContent = CSS; document.head.appendChild(s);
    },
    onStart: function (ctx) {
      ctx.sound('alarm');
      var x = ctx.state.x || {};
      var rows = (x.order || IDS).map(function (k, n) { return '<div style="display:flex;align-items:center;gap:6px;margin:2px 0"><span style="font:700 10px system-ui;opacity:.7;width:12px">' + (n + 1) + '</span><img src="' + META[k].img + '" style="width:20px;height:20px;object-fit:contain" alt=""><b style="font:600 10.5px/1.15 system-ui,sans-serif">SCP-' + k + '</b></div>'; }).join('');
      ctx.fx({ type: 'overlay', at: 'screen', duration_ms: 4200, fade_ms: 300, html: '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:78%;max-width:320px;background:rgba(60,8,8,.93);border:2px solid #c23a2b;border-radius:8px;color:#f4e3df;padding:10px 12px;font:600 12px/1.25 system-ui,sans-serif;overflow:hidden"><div style="font:800 15px system-ui;letter-spacing:.08em;color:#ff6a55;margin-bottom:6px">CONTAINMENT BREACH</div><img src="' + A + 'lineup.png" alt="" style="display:block;width:100%;max-height:120px;object-fit:cover;border-radius:4px;margin-bottom:6px"><div style="display:grid;grid-template-columns:1fr 1fr;column-gap:6px">' + rows + '</div></div>' });
    },
    /* a converted king belongs to nobody: its owner cannot move it */
    filterMoves: function (V, st, legal) {
      return legal.filter(function (m) { var p = m.f >= 0 && st.b[m.f]; return !(p && p.eff); });
    },
    /* active converted pieces (zombies, sleepers, hosts) attack both sides, so they give check to either king */
    attacks: function (V, st, sq) {
      if (!st.x || !st.x.ne) return false;
      var b = st.b;
      for (var i = 0; i < b.length; i++) { var p = b[i]; if (p && p.c === 'n' && p.eff && attacks(b, i, p, sq)) return true; }
      return false;
    },
    afterMove: function (ctx, m, info) {
      if (ctx.over) return;
      var p = ctx.at(m.t);
      if (p) { var lm = Object.assign({}, ctx.state.x.lm || {}); lm[colOf(p)] = { sq: m.t, v: VAL[m.p] || VAL[p.t] || 0 }; ctx.setX('lm', lm); }
      syncMask(ctx); refreshLizard(ctx);
      if (info.by === 'player') { ctx.setX('pl', m.t); return; }
      return breachRound(ctx);
    },
    decorate: function (ctx, sq, p) {
      var x = ctx.state.x || {}, html = '';
      /* SCP-409 charged: the site's breathing cyan aura (#76d1ea45) on its 8 neighbours, beneath the pieces */
      if (x.c409) { var c = find(ctx, '409'); if (c >= 0 && sq !== c && ctx.geo.dist(sq, c) === 1) html += '<span class="fx-aura-sq" style="animation-delay:-' + Math.round(performance.now() % 2000) + 'ms"></span>'; }
      /* SCP-035 rides its host: the mask sits small on the host's square, as on the site */
      if (p && p.eff === 'host') html += '<img class="cb-mask" src="' + META['035'].img + '" alt="">';
      return html ? { html: html } : null;
    },
    camera: function (ctx) {
      var x = ctx.state.x || {};
      if (x.cam != null && x.cam >= 0) return x.cam;                 /* an SCP is acting */
      if (x.pl != null && ctx.at(x.pl) && ctx.at(x.pl).c === ctx.human) return x.pl;   /* your last moved piece */
      var k = ctx.pieces(function (p) { return p.t === 'K' && p.c === ctx.human; });
      return k.length ? k[0] : null;
    },
    onGameOver: function (ctx) { ctx.clearFx('vignette'); },
    status: function (ctx) { var x = ctx.state.x || {}; return 'Round ' + (x.round || 1) + ' · SCP order: ' + (x.order || []).join(' > '); }
  },
  source: { research: 'research/modes/Ji7frCIfmAQ.json + iwantcheckmate.com/challenges/containment-breach/engine.js', confidence: 'high', notes: 'site-cov 2026-11-26: rules ported from the site engine (10 SCPs incl. 939, effect priority by order, neutral converted pieces); site sprites. Kings keep their colour when converted (engine limitation).' }
});

function shuffle(ctx, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = ctx.random(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function find(ctx, id) { var b = ctx.state.b; for (var i = 0; i < b.length; i++) if (b[i] && b[i].t === 'S' + id) return i; return -1; }
function order(ctx, id) { return ((ctx.state.x || {}).ord || {})[id] || 0; }
function prio(ctx, p) { return p && p.own ? order(ctx, p.own) : 0; }
function canAffect(ctx, s, p) { return isPiece(p) && prio(ctx, p) <= order(ctx, s) && p.own !== s; }
function countEff(ctx) { ctx.setX('ne', ctx.pieces(function (p) { return isPiece(p) && !!p.eff; }).length); }
function pname(p) { return (colOf(p) === 'w' ? 'white ' : 'black ') + ({ P: 'pawn', N: 'knight', B: 'bishop', R: 'rook', Q: 'queen', K: 'king' }[baseType(p)] || 'piece'); }
function pulse(ctx, squares) {
  /* the site's effect pulse: #c5f3a378 over the affected square, fading over 500 ms; never on a fogged square */
  var G = ctx.game, vs = G && G.visionSet && !G.over ? G.visionSet({ source: 'reach' }) : null;
  squares = squares.filter(function (i) { return !(vs && vs.dist && vs.dist[i]); });
  if (squares.length) ctx.fx({ type: 'pulse', squares: squares, color: '#c5f3a378', peak: 1, shape: 'fade', duration_ms: 500, easing: 'ease-out', belowMask: true });
}
/* a piece is removed; a king ends the game */
function kill(ctx, i, why) {
  var p = ctx.at(i); if (!p) return false;
  if (p.eff === 'host') ctx.setX('maskPend', 1);
  ctx.remove(i);
  if (p.t === 'K') {
    var mine = colOf(p) === ctx.human;
    ctx.endGame(mine ? 'bot' : 'player', why || ((mine ? 'Your' : 'The Stockfish') + ' king was captured'));
    ctx.refresh({ instant: true });
    return true;
  }
  return false;
}
/* turn piece i into an effect piece of SCP s */
function effect(ctx, s, i, kind) {
  var p = ctx.at(i); if (!canAffect(ctx, s, p)) return false;
  if (p.eff === 'host') ctx.setX('maskPend', 1);
  var x = ctx.state.x, ser = (x.ser || 0) + 1; ctx.setX('ser', ser);
  var bt = baseType(p), col = colOf(p), np;
  var props = { eff: kind, own: s, ser: ser, born: x.round || 1, age: 0, cls: 'cb-' + kind, m: 1 };
  if (bt === 'K') np = Object.assign({}, p, props, { t: 'K', c: col });           /* our engine needs both kings: colour kept */
  else if (kind === 'toaster') np = Object.assign({}, p, props, { t: 'Toast', ot: bt, c: 'n', was: col, dead: 0, cls: '' });
  else np = Object.assign({}, p, props, { t: bt, c: 'n', dead: 1, was: col });
  delete np.id;
  ctx.set(i, np); pulse(ctx, [i]);
  return true;
}
function clearEffect(ctx, i) {
  var p = ctx.at(i); if (!p) return;
  var np = Object.assign({}, p, { t: baseType(p), c: colOf(p) });
  ['eff', 'own', 'ser', 'born', 'age', 'cls', 'was', 'dead', 'ot'].forEach(function (k) { delete np[k]; });
  ctx.set(i, np);
}
function stepSCP(ctx, s, from, to, verb) {
  if (to == null || to < 0 || scpId(ctx.at(to))) return false;
  var victim = ctx.at(to);
  ctx.setX('cam', to);
  if (victim) {
    var over = kill(ctx, to, META[s].name + ' ' + (verb || 'captured') + ' the ' + (colOf(victim) === ctx.human ? 'white' : 'black') + ' king');
    if (over) return true;
    ctx.toast(META[s].name.split(' ')[0] + ' ' + (verb || 'captured') + ' the ' + pname(victim) + '.', 1800);
    ctx.sound('capture');
  } else ctx.sound('move-opponent');
  ctx.move(from, to);
  syncMask(ctx);
  return true;
}
function wander(ctx, s, i) {
  var opts = ORTH.map(function (d) { return [X(i) + d[0], Y(i) + d[1]]; }).filter(function (q) { return empty(ctx.state.b, q[0], q[1]); });
  if (!opts.length) return i;
  var q = ctx.pick(opts), to = I(q[0], q[1]); stepSCP(ctx, s, i, to); return to;
}
/* SCP-035: respawn the mask when its host is gone (captured, overridden, teleported) */
function syncMask(ctx) {
  if (ctx.over) return;
  var hosted = ctx.pieces(function (p) { return p.eff === 'host'; }).length > 0;
  if (hosted || find(ctx, '035') >= 0) { if (ctx.state.x.maskPend) ctx.setX('maskPend', 0); return; }
  var b = ctx.state.b, all = ctx.emptySquares();
  var clear = all.filter(function (q) { return RING.every(function (d) { return !pieceAt(b, X(q) + d[0], Y(q) + d[1]); }); });
  var dest = ctx.pick(clear.length ? clear : all);
  if (dest != null && dest >= 0) { ctx.spawn('S035', 'n', dest); pulse(ctx, [dest]); }
  ctx.setX('maskPend', 0);
}
/* SCP-682 takes the movement of a random piece attacking it */
function refreshLizard(ctx) {
  if (ctx.over) return;
  var s = find(ctx, '682'); if (s < 0) return;
  var obs = attackers(ctx.state.b, s); if (!obs.length) return;
  var p = ctx.at(ctx.pick(obs)); ctx.setX('liz', { t: baseType(p), c: colOf(p) });
}
function knightDist(a, b) {
  var seen = {}, q = [[X(a), Y(a), 0]]; seen[a] = 1;
  for (var k = 0; k < q.length; k++) {
    var x = q[k][0], y = q[k][1], d = q[k][2]; if (I(x, y) === b) return d;
    for (var n = 0; n < 8; n++) { var xx = x + KN[n][0], yy = y + KN[n][1]; if (inb(xx, yy) && !seen[I(xx, yy)]) { seen[I(xx, yy)] = 1; q.push([xx, yy, d + 1]); } }
  }
  return 999;
}
function moveDist(b, start, target, p, self) {
  var t = baseType(p);
  if (t === 'P') return Math.abs(X(start) - X(target)) + Math.abs(Y(start) - Y(target)) * 2;
  var dirs = t === 'N' ? KN : t === 'B' ? RING.filter(function (d) { return d[0] && d[1]; }) : t === 'R' ? ORTH : RING, lim = (t === 'B' || t === 'R' || t === 'Q') ? 19 : 1;
  var q = [[X(start), Y(start), 0]], seen = {}; seen[start] = 1;
  for (var k = 0; k < q.length; k++) {
    var x = q[k][0], y = q[k][1], d = q[k][2]; if (I(x, y) === target) return d;
    for (var j = 0; j < dirs.length; j++) for (var n = 1; n <= lim; n++) {
      var xx = x + dirs[j][0] * n, yy = y + dirs[j][1] * n; if (!inb(xx, yy) || body(b, xx, yy)) break;
      var kk = I(xx, yy); if (!seen[kk]) { seen[kk] = 1; q.push([xx, yy, d + 1]); }
      if (b[kk] && kk !== self) break;
    }
  }
  return 999;
}

/* ---------- one SCP turn (the site's scpTurn) ---------- */
function scpTurn(ctx, s) {
  var i = find(ctx, s), b = ctx.state.b, x = ctx.state.x;
  if (s === '035') {
    if (i < 0) return;   /* riding a host: the host acts as its child */
    for (var r = 0; r < 8; r++) {
      var j = inb(X(i) + RING[r][0], Y(i) + RING[r][1]) ? I(X(i) + RING[r][0], Y(i) + RING[r][1]) : -1;
      if (j >= 0 && canAffect(ctx, s, ctx.at(j))) {
        ctx.remove(i); effect(ctx, s, j, 'host'); ctx.setX('cam', j); ctx.sound('notify');
        ctx.toast('SCP-035 possessed the ' + pname(ctx.at(j)) + '.', 1800);
        return;
      }
    }
    return;
  }
  if (i < 0) return;
  if (s === '049' || s === '966' || s === '426') {
    i = wander(ctx, s, i); if (ctx.over) return;
    var kind = s === '049' ? 'zombie' : s === '966' ? 'sleeper' : 'toaster', hit = 0;
    for (var k = 0; k < 8; k++) {
      var xx = X(i) + RING[k][0], yy = Y(i) + RING[k][1]; if (!inb(xx, yy)) continue;
      var q = I(xx, yy), p = ctx.at(q); if (!canAffect(ctx, s, p)) continue;
      if (p.t === 'K' && s !== '049') { kill(ctx, q, META[s].name + ' consumed the ' + (colOf(p) === ctx.human ? 'white' : 'black') + ' king'); return; }
      if (effect(ctx, s, q, kind)) hit++;
    }
    if (hit) { ctx.sound('notify'); ctx.toast(META[s].name.split(' ')[0] + ' turned ' + hit + ' piece' + (hit > 1 ? 's' : '') + ' into ' + (kind === 'zombie' ? 'zombies' : kind === 'sleeper' ? 'sleepers' : 'toasters') + '.', 1800); }
    ctx.setX('cam', i);
    return;
  }
  if (s === '106') {
    var ks = kings(b);
    var dist = function (q) { return Math.min.apply(null, ks.map(function (k2) { return Math.max(Math.abs(X(q) - X(k2)), Math.abs(Y(q) - Y(k2))); })); };
    var opts = RING.map(function (d) { return [X(i) + d[0], Y(i) + d[1]]; }).filter(function (q2) { return empty(b, q2[0], q2[1]); }).map(function (q2) { return I(q2[0], q2[1]); });
    opts.sort(function (a2, b2) { return dist(a2) - dist(b2); });
    if (opts.length) { stepSCP(ctx, s, i, opts[0]); i = opts[0]; }
    var targets = RING.map(function (d) { return inb(X(i) + d[0], Y(i) + d[1]) ? I(X(i) + d[0], Y(i) + d[1]) : -1; }).filter(function (q2) { return q2 >= 0 && isPiece(ctx.at(q2)); });
    var moved = [];
    targets.forEach(function (q2) {
      var p2 = ctx.at(q2); if (!canAffect(ctx, s, p2)) return;
      var bb = ctx.state.b, col = colOf(p2), bt = baseType(p2);
      var spots = ctx.emptySquares(function (e) { return (bt !== 'P' || (Y(e) !== 0 && Y(e) !== H - 1)) && (bt !== 'K' || !danger(bb, e, col)); });
      if (!spots.length) return;
      var to = ctx.pick(spots);
      if (p2.eff === 'host') ctx.setX('maskPend', 1);
      clearEffect(ctx, q2); ctx.move(q2, to); moved.push(to);
      var np = Object.assign({}, ctx.at(to), { m: 1 }); ctx.set(to, np);
    });
    if (moved.length) { pulse(ctx, moved); ctx.setX('cam', moved[moved.length - 1]); ctx.sound('move-opponent'); ctx.toast('SCP-106 dragged ' + moved.length + ' piece' + (moved.length > 1 ? 's' : '') + ' away.', 1800); }
    syncMask(ctx);
    return;
  }
  if (s === '096') {
    var obs = attackers(b, i).sort(function (a2, b2) { var da = Math.pow(X(a2) - X(i), 2) + Math.pow(Y(a2) - Y(i), 2), db = Math.pow(X(b2) - X(i), 2) + Math.pow(Y(b2) - Y(i), 2); return da - db || Y(a2) - Y(b2) || X(a2) - X(b2); });
    if (obs.length) stepSCP(ctx, s, i, obs[0], 'tore apart');
    return;
  }
  if (s === '173') {
    if (attackers(b, i).length) return;
    var ks2 = kings(b).sort(function (a2, b2) { return knightDist(i, a2) - knightDist(i, b2) || (colOf(ctx.at(a2)) === 'w' ? -1 : 1); });
    if (!ks2.length) return;
    var kt = ks2[0];
    var jumps = KN.map(function (d) { return [X(i) + d[0], Y(i) + d[1]]; }).filter(function (q2) { return inb(q2[0], q2[1]) && !body(b, q2[0], q2[1]); }).map(function (q2) { return I(q2[0], q2[1]); });
    jumps.sort(function (a2, b2) { return knightDist(a2, kt) - knightDist(b2, kt); });
    if (jumps.length) stepSCP(ctx, s, i, jumps[0], 'snapped');
    return;
  }
  if (s === '409') {
    ctx.pieces(function (p2) { return p2.own === '409' && p2.eff === 'frozen'; }).forEach(function (q2) {
      if (ctx.over) return;
      var p2 = ctx.at(q2), age = (p2.age || 0) + 1;
      if (age < 3) { ctx.set(q2, Object.assign({}, p2, { age: age })); return; }
      if (Math.random() < 0.5) { clearEffect(ctx, q2); pulse(ctx, [q2]); ctx.toast('SCP-409: the ' + pname(p2) + ' thawed.', 1500); }
      else { ctx.fx({ type: 'particles', kind: 'dust', at: q2, count: 14 }); ctx.sound('capture'); if (!kill(ctx, q2, 'SCP-409 shattered the ' + (colOf(p2) === ctx.human ? 'white' : 'black') + ' king')) ctx.toast('SCP-409: the ' + pname(p2) + ' shattered.', 1500); }
    });
    if (ctx.over) return;
    if (!x.c409) { wander(ctx, s, i); ctx.setX('c409', 1); ctx.setX('cam', find(ctx, '409')); }
    else {
      var fr = [];
      RING.forEach(function (d) { var xx2 = X(i) + d[0], yy2 = Y(i) + d[1]; if (inb(xx2, yy2) && effect(ctx, s, I(xx2, yy2), 'frozen')) fr.push(I(xx2, yy2)); });
      ctx.setX('c409', 0); ctx.setX('cam', i);
      if (fr.length) { ctx.sound('notify'); ctx.toast('SCP-409 crystallised ' + fr.length + ' piece' + (fr.length > 1 ? 's' : '') + '.', 1800); }
    }
    return;
  }
  if (s === '682') {
    refreshLizard(ctx);
    var lz = ctx.state.x.liz || {}, type = lz.t || 'O';
    var moves = rawMoves(b, i, null, type, lz.c || 'w', true);
    var viewers = attackers(b, i);
    var chosen = viewers.filter(function (v) { var pv = ctx.at(v); return baseType(pv) === lz.t && (lz.t !== 'P' || colOf(pv) === lz.c); })[0];
    var mv = chosen != null ? moves.filter(function (m2) { return m2.t === chosen; })[0] : null;
    if (!mv) {
      var best = -1, pool = [];
      moves.forEach(function (m2) { var tp = ctx.at(m2.t), v = tp ? (VAL[baseType(tp)] || 0) : 0; if (v > best) { best = v; pool = [m2]; } else if (v === best) pool.push(m2); });
      mv = pool.length ? ctx.pick(pool) : null;
    }
    if (mv) {
      stepSCP(ctx, s, i, mv.t, 'devoured');
      if (!ctx.over && lz.t === 'P' && (Y(mv.t) === 0 || Y(mv.t) === H - 1)) ctx.setX('liz', { t: 'Q', c: lz.c });
    }
    return;
  }
  if (s === '939') {
    var lm = x.lm || {}, list = Object.keys(lm).map(function (c) { return lm[c]; });
    if (!list.length) return;
    var mx = Math.max.apply(null, list.map(function (m2) { return m2.v; })), tg = ctx.pick(list.filter(function (m2) { return m2.v === mx; }));
    var nx = X(i) + Math.sign(X(tg.sq) - X(i)), ny = Y(i) + Math.sign(Y(tg.sq) - Y(i));
    if (nx !== X(i) || ny !== Y(i)) stepSCP(ctx, s, i, I(nx, ny), 'mauled');
  }
}
/* ---------- a converted piece acts (the site's childTurn) ---------- */
function childTurn(ctx, s, ser) {
  var at = ctx.pieces(function (p2) { return p2.ser === ser && p2.own === s; })[0]; if (at == null) return false;
  var p = ctx.at(at), x = ctx.state.x;
  if (!active(p) || p.born === x.round || (p.eff !== 'zombie' && p.eff !== 'sleeper' && p.eff !== 'host')) return false;
  var b = ctx.state.b, moves = rawMoves(b, at, p, baseType(p), colOf(p), false), m;
  if (!moves.length) return false;
  if (p.eff === 'host') {
    var ks = kings(b, at);
    var dist = function (q) { return ks.length ? Math.min.apply(null, ks.map(function (k) { return moveDist(b, q, k, p, at); })) : 0; };
    var close = function (q) { return ks.length ? Math.min.apply(null, ks.map(function (k) { return Math.abs(X(k) - X(q)) + Math.abs(Y(k) - Y(q)); })) : 0; };
    var val = function (q) { var t = ctx.at(q); return t ? VAL[baseType(t)] || 0 : 0; };
    moves = moves.map(function (mv) { return { m: mv, d: dist(mv.t), c: close(mv.t) }; }).sort(function (a2, b2) { return a2.d - b2.d || a2.c - b2.c || val(b2.m.t) - val(a2.m.t); }).map(function (r) { return r.m; });
    m = moves[0];
  } else m = ctx.pick(moves);
  var victim = ctx.at(m.t);
  ctx.setX('cam', m.t);
  if (victim) {
    if (kill(ctx, m.t, 'A ' + p.eff + ' ' + (p.eff === 'host' ? '(SCP-035) ' : '') + 'took the ' + (colOf(victim) === ctx.human ? 'white' : 'black') + ' king')) return true;
    ctx.sound('capture');
  } else ctx.sound('move-opponent');
  ctx.move(m.f, m.t);
  if (m.promo && baseType(p) === 'P') ctx.set(m.t, Object.assign({}, ctx.at(m.t), { t: 'Q' }));
  syncMask(ctx); refreshLizard(ctx);
  return true;
}

/* ---------- one breach round: every SCP acts in the game's order, each followed by its pieces ---------- */
function breachRound(ctx) {
  var x = ctx.state.x || {}, ord = x.order || IDS, slow = CM.settings.reducedMotion() ? 0.5 : 1, STEP = ctx.params.stepMs * slow;
  var wait = function (ms) { return new Promise(function (r) { ctx.after(ms, r); }); };
  var chain = Promise.resolve();
  ord.forEach(function (s) {
    chain = chain.then(function () {
      if (ctx.over) return;
      ctx.setX('cam', -1);
      scpTurn(ctx, s); syncMask(ctx); refreshLizard(ctx); countEff(ctx);
      if (ctx.over) return;
      ctx.refresh();
      var kids = ctx.pieces(function (p) { return p.own === s && (p.eff === 'zombie' || p.eff === 'sleeper' || p.eff === 'host'); })
        .map(function (i) { return ctx.at(i).ser; }).sort(function (a, b) { return a - b; });
      var c2 = wait(STEP);
      kids.forEach(function (ser) {
        c2 = c2.then(function () {
          if (ctx.over) return;
          if (!childTurn(ctx, s, ser)) return;
          countEff(ctx); if (!ctx.over) ctx.refresh();
          return wait(STEP * 0.8);
        });
      });
      return c2;
    });
  });
  return chain.then(function () {
    if (ctx.over) return;
    ctx.setX('round', (ctx.state.x.round || 1) + 1); ctx.setX('lm', {}); ctx.setX('cam', -1); countEff(ctx);
    ctx.refresh();
  });
}
})();
