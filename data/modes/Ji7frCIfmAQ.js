/* Chess, But with 10 SCPs: CONTAINMENT BREACH. An 8x20 board under fog of war, standard armies on ranks 1-2 and
   19-20, and ten neutral SCPs from earlier episodes at random squares in between. After every full round (your move,
   Stockfish's move) each SCP acts by its own episode's rule, in a random order fixed for the game. Any capture of a
   king ends the game, including one made by an SCP.
   Sources: research/modes/Ji7frCIfmAQ.json (transcript 00:27 8x20 + fog + Stockfish on ranks 19-20, 00:52 Sleep
   Killer, 01:44 Old Man teleports to a random empty square, 03:18 toaster / mask / Shy Guy / Plague Doctor, 02:56 fog
   clears at the end, 09:42 Shy Guy captures the black king, 10:05 random order and placement).
   Inferred (simplified from the solo episodes): exactly what each SCP does per round (see SCP table below), SCPs
   cannot be captured (zombies and toasters can), placement on ranks 5-16 with no two SCPs touching.
   Art: SCP pieces reuse this group's episode sprites; zombie.png and the roster lineup.png are cropped from this video's frames (research/frames/sprites, owner instruction), credit iwantcheckmate. */
(function () {
'use strict';
var CB_SCPS = {
  S966: { name: 'SCP-966 Sleep Killer', img: 'assets/modes/mwv48BWl2DY/scp966.png', act: 'zombify', text: 'turns a neighbouring piece into a zombie' },
  S106: { name: 'SCP-106 Old Man', img: 'assets/modes/_Kx4ChHuCgI/oldman.png', act: 'teleport', text: 'wanders and teleports every piece beside it to a random empty square' },
  S096: { name: 'SCP-096 Shy Guy', img: 'assets/modes/-fax07t_o5s/shyguy.png', act: 'shy', text: 'captures a piece that can see (attack) it' },
  S173: { name: 'SCP-173', img: 'assets/modes/amA3ARfEoU8/scp173.png', act: 'statue', text: 'when no piece sees it, snaps the nearest piece within 2 squares' },
  S049: { name: 'SCP-049 Plague Doctor', img: 'assets/modes/byhq5v6BUWg/doctor.png', act: 'doctor', text: '"cures" a neighbouring piece: it rises as a zombie' },
  S035: { name: 'SCP-035 Mask', img: 'assets/modes/4XV3SBMQgXE/mask.png', act: 'mask', text: 'takes control of a neighbouring piece (it changes sides)' },
  S682: { name: 'SCP-682 Reptile', img: 'assets/modes/06OeGk5Iu-s/reptile.png', act: 'reptile', text: 'moves like the last piece that moved, capturing if it can' },
  S409: { name: 'SCP-409 Crystal', img: 'assets/modes/ndbf05-bvgQ/crystal.png', act: 'crystal', text: 'crystallises every piece beside it: frozen for 2 rounds' },
  S426: { name: 'SCP-426 Toaster', img: 'assets/modes/lpqVYTH9U-A/toaster.png', act: 'toaster', text: 'turns a neighbouring piece into a toaster' },
  SZom: { name: 'Zombie', img: 'assets/modes/Ji7frCIfmAQ/zombie.png', act: 'zombie', text: 'shuffles toward the nearest piece and bites it' }
};
var CB_IDS = Object.keys(CB_SCPS);

CM.mode({
  id: 'Ji7frCIfmAQ',
  title: 'Chess, But with 10 SCPs: CONTAINMENT BREACH',
  name: 'Containment Breach',
  category: 'Horror Chess',
  description: 'An 8x20 board in fog of war. Ten SCPs have escaped into the middle ranks. After each round every SCP acts in a random order: Sleep Killer and the Plague Doctor make zombies, the Old Man teleports pieces, Shy Guy kills anything that sees it, SCP-173 strikes when unobserved, the Mask steals pieces, the Reptile copies the last move, the Crystal freezes pieces and the Toaster makes toasters. SCPs cannot be captured; zombies and toasters can.',
  how_to_win: 'Checkmate Stockfish or see its king captured by anyone, SCPs included. Lose your king and you lose.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/uUXev8TPVak/iwantcheckmate.png' },   /* iwantcheckmate's own avatar (purple king) from the videos */
  opponent: { name: 'Stockfish', rating: 3600, avatar: 'assets/modes/U_irVoLjtNI/stockfish.png', tagline: 'Plays perfect chess. The SCPs do not care.' },
  board: { files: 8, ranks: 20, zoom: false /* fog + scripted SCP camera: no universal zoom */, viewport: { files: 8, ranks: 12, mobile: { files: 8, ranks: 11 }, follow: 'player_king' } },
  theme: { light: '#f0d9b5', dark: '#b58863', background: '#15110f' },
  pieces: (function () {
    var o = {};
    CB_IDS.forEach(function (k) { var s = CB_SCPS[k]; o[k] = { name: s.name, moves: '', value: 0, capturable: k === 'SZom', img: s.img }; });
    o.Toast = { name: 'Toaster', moves: '', value: 50, img: 'assets/modes/lpqVYTH9U-A/toaster.png' };
    return o;
  })(),
  setup: { fen: 'rnbqkbnr/pppppppp/8/8/8/8/8/8/8/8/8/8/8/8/8/8/8/8/PPPPPPPP/RNBQKBNR', x: { round: 0 } },
  rules: { fog: true, castling: true, enPassant: true, win: [{ type: 'checkmate' }] },
  bot: { engine: 'search', style: 'best', depth: 3, time_ms: 700 },
  params: { stepMs: 430, freezeRounds: 2 },
  sounds: { alarm: 'assets/modes/Ji7frCIfmAQ/alarm.wav' },
  assets: { zombie: 'assets/modes/Ji7frCIfmAQ/zombie.png', lineup: 'assets/modes/Ji7frCIfmAQ/lineup.png' },
  messages: { win: 'the Stockfish king fell in the breach', win_title: 'You Survived!' },
  vfx: [{ type: 'vignette', color: 'rgba(120,0,0,.45)', size: 70, target: 'board', duration_ms: 0, id: 'cb-vig' }],
  hooks: {
    setup: function (ctx) {
      var placed = [], g = ctx.geo;
      CB_IDS.forEach(function (k) {
        var free = ctx.emptySquares(function (i) { var r = g.rank(i); return r >= 5 && r <= 16 && placed.every(function (j) { return g.dist(i, j) > 1; }); });
        if (!free.length) return;
        var at = ctx.pick(free); placed.push(at); ctx.spawn(k, 'n', at);
      });
      var order = CB_IDS.slice(); for (var i = order.length - 1; i > 0; i--) { var j = ctx.random(i + 1); var t = order[i]; order[i] = order[j]; order[j] = t; }
      ctx.setX('order', order); ctx.setX('round', 0);
    },
    onStart: function (ctx) {
      ctx.sound('alarm');
      var rows = CB_IDS.map(function (k) { var s = CB_SCPS[k]; return '<div style="display:flex;align-items:center;gap:6px;margin:2px 0"><img src="' + s.img + '" style="width:20px;height:20px;border-radius:3px" alt=""><b style="font:600 10.5px/1.15 system-ui,sans-serif">' + s.name + '</b></div>'; }).join('');
      ctx.fx({ type: 'overlay', at: 'screen', duration_ms: 4200, fade_ms: 300, html: '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:78%;max-width:320px;background:rgba(60,8,8,.93);border:2px solid #c23a2b;border-radius:8px;color:#f4e3df;padding:10px 12px;font:600 12px/1.25 system-ui,sans-serif;overflow:hidden"><div style="font:800 15px system-ui;letter-spacing:.08em;color:#ff6a55;margin-bottom:6px">CONTAINMENT BREACH</div><img src="assets/modes/Ji7frCIfmAQ/lineup.png" alt="" style="display:block;width:100%;max-height:120px;object-fit:cover;border-radius:4px;margin-bottom:6px"><div style="display:grid;grid-template-columns:1fr 1fr;column-gap:6px">' + rows + '</div></div>' });
    },
    filterMoves: function (V, st, legal) {
      return legal.filter(function (m) { var p = m.f >= 0 && st.b[m.f]; return !(p && p.frz > 0); });
    },
    afterMove: function (ctx, m, info) {
      if (ctx.over) return;
      if (info.by === 'player') { ctx.setX('pl', m.t); return; }
      return breachRound(ctx, info);
    },
    decorate: function (ctx, sq, p) {
      if (p && p.frz > 0) return { html: '<span class="sq-tint" style="background:rgba(140,210,255,.45);box-shadow:inset 0 0 8px #e6f7ff"></span>' };
      return null;
    },
    camera: function (ctx) {
      var x = ctx.state.x || {};
      if (x.cam != null && x.cam >= 0) return x.cam;                 /* an SCP is acting */
      if (x.pl != null && ctx.at(x.pl) && ctx.at(x.pl).c === ctx.human) return x.pl;   /* your last moved piece */
      var k = ctx.pieces(function (p) { return p.t === 'K' && p.c === ctx.human; });
      return k.length ? k[0] : null;
    },
    onGameOver: function (ctx) { ctx.clearFx('vignette'); },
    status: function (ctx) { var x = ctx.state.x || {}; return 'Round ' + (x.round || 0) + ' · SCP order: ' + (x.order || []).map(function (k) { return k === 'SZom' ? 'Z' : k.slice(1); }).join(' > '); }
  },
  source: { research: 'research/modes/Ji7frCIfmAQ.json', confidence: 'medium', notes: 'per-SCP behaviour simplified from the solo episodes; placement ranks 5-16 inferred sprite-fix2 2026-11-25: zombie.png replaced by an ALTERNATE clean zombie, Twemoji U+1F9DF (CC-BY 4.0) https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/1f9df.svg, transparent 512px (the old frame crop had a baked background).' }
});

/* ---------- one breach round: every SCP acts in the game's order ---------- */
function breachRound(ctx, info) {
  var x = ctx.state.x || {}, order = x.order || CB_IDS, slow = CM.settings.reducedMotion() ? 0.5 : 1, STEP = ctx.params.stepMs * slow;
  var wait = function (ms) { return new Promise(function (r) { ctx.after(ms, r); }); };
  ctx.setX('round', (x.round || 0) + 1);
  /* thaw frozen pieces */
  ctx.pieces(function (p) { return p.frz > 0; }).forEach(function (i) { var p = ctx.at(i); ctx.set(i, Object.assign({}, p, { frz: p.frz - 1 })); });
  var lastType = info && info.piece ? info.piece.t || info.piece : 'N';
  var chain = Promise.resolve();
  order.forEach(function (k) {
    chain = chain.then(function () {
      if (ctx.over) return;
      var i = findType(ctx, k); if (i < 0) return;
      var did = cbAct(ctx, k, i, lastType);
      /* the zombies made by SCP-966 / SCP-049 act with the zombie */
      if (k === 'SZom') ctx.pieces(function (p) { return p.t === 'SZom' && p.made; }).forEach(function (j) { if (!ctx.over && cbAct(ctx, 'SZom', j, lastType)) did = true; });
      if (!did) return;
      ctx.refresh();
      return wait(STEP);
    });
  });
  return chain.then(function () { if (!ctx.over) { ctx.setX('cam', -1); ctx.refresh(); } });
}
function findType(ctx, k) { var b = ctx.state.b; for (var i = 0; i < b.length; i++) if (b[i] && b[i].t === k && !b[i].made) return i; return -1; }
function isArmy(p) { return p && (p.c === 'w' || p.c === 'b'); }
function neighbours(ctx, i, r) {
  var g = ctx.geo, o = []; r = r || 1;
  for (var dy = -r; dy <= r; dy++) for (var dx = -r; dx <= r; dx++) { if (!dx && !dy) continue; var j = g.step(i, dx, dy); if (j >= 0) o.push(j); }
  return o;
}
/* pieces of either army that could capture on square sq ("see" it) */
function watchers(ctx, sq) {
  var V = ctx.V, out = [];
  ['w', 'b'].forEach(function (c) {
    var st = V.clone(ctx.state); st.b = st.b.slice(); st.b[sq] = V.piece('P', c === 'w' ? 'b' : 'w'); st.turn = c;
    st.b.forEach(function (p, i) { if (!p || p.c !== c) return; var ms = []; V.genPiece(st, i, ms, true); if (ms.some(function (m) { return m.t === sq && m.f === i; })) out.push(i); });
  });
  return out;
}
function nearestArmy(ctx, i, maxD) {
  var g = ctx.geo, best = -1, bd = 99;
  ctx.pieces(function (p) { return isArmy(p); }).forEach(function (j) { var d = g.dist(i, j); if (d < bd && (!maxD || d <= maxD)) { bd = d; best = j; } });
  return best;
}
function stepToward(ctx, i, target) {
  var g = ctx.geo, best = -1, bd = 99;
  neighbours(ctx, i).forEach(function (j) { if (ctx.at(j) && j !== target) return; var d = g.dist(j, target); if (d < bd) { bd = d; best = j; } });
  return best;
}
/* capture square t with the SCP standing on i; returns true when a king fell (game over) */
function scpTake(ctx, k, i, t, verb) {
  var victim = ctx.at(t), g = ctx.geo;
  ctx.setX('cam', t);
  ctx.fx({ type: 'flash', at: t, color: '#d0021b', opacity: 0.55, duration_ms: 380 });
  ctx.move(i, t); ctx.sound('capture');
  if (victim && victim.t === 'K') {
    ctx.refresh();
    var mine = victim.c === ctx.human;
    ctx.endGame(mine ? 'bot' : 'player', CB_SCPS[k].name + ' ' + (verb || 'captured') + ' the ' + (mine ? 'white' : 'black') + ' king on ' + g.name(t));
    return true;
  }
  ctx.toast(CB_SCPS[k].name + ' ' + (verb || 'captured') + ' ' + pname(ctx, victim) + ' on ' + g.name(t) + '.', 2000);
  return false;
}
function pname(ctx, p) { if (!p) return 'nothing'; var d = ctx.V.def(p.t); return (p.c === 'w' ? 'white ' : p.c === 'b' ? 'black ' : '') + String(d.name || p.t).toLowerCase(); }
function adjArmy(ctx, i, noKing) { return neighbours(ctx, i).filter(function (j) { var p = ctx.at(j); return isArmy(p) && !(noKing && p.t === 'K'); }); }

function cbAct(ctx, k, i, lastType) {
  var g = ctx.geo, V = ctx.V, act = CB_SCPS[k].act, t, list;
  switch (act) {
    case 'zombify': case 'doctor': case 'toaster': case 'mask':
      list = adjArmy(ctx, i, true);
      if (!list.length) { t = nearestArmy(ctx, i); var s = t >= 0 ? stepToward(ctx, i, t) : -1; if (s >= 0) { ctx.move(i, s); ctx.setX('cam', s); return true; } return false; }
      t = ctx.pick(list); var p = ctx.at(t); ctx.setX('cam', t);
      if (act === 'toaster') { ctx.transform(t, { type: 'Toast', color: 'n' }); ctx.fx({ type: 'flash', at: t, color: '#ffd27a', duration_ms: 420 }); ctx.toast('SCP-426 turned the ' + pname(ctx, p) + ' into a toaster.', 2000); }
      else if (act === 'mask') { ctx.transform(t, { color: p.c === 'w' ? 'b' : 'w' }); ctx.fx({ type: 'flash', at: t, color: '#ffffff', duration_ms: 420 }); ctx.toast('SCP-035 took control of the ' + pname(ctx, p) + '.', 2000); }
      else { ctx.transform(t, { type: 'SZom', color: 'n', props: { made: 1 } }); ctx.fx({ type: 'flash', at: t, color: '#6b8f3a', duration_ms: 420 }); ctx.toast(CB_SCPS[k].name + ' turned the ' + pname(ctx, p) + ' into a zombie.', 2000); }
      ctx.sound('notify'); return true;
    case 'teleport':
      var dirs = neighbours(ctx, i).filter(function (j) { return !ctx.at(j); });
      if (dirs.length) { var to = ctx.pick(dirs); ctx.move(i, to); i = to; }
      list = adjArmy(ctx, i, false); if (!list.length) { ctx.setX('cam', i); return !!dirs.length; }
      list.forEach(function (j) {
        var empty = ctx.emptySquares(); if (!empty.length) return; var e = ctx.pick(empty), p = ctx.at(j);
        ctx.fx({ type: 'flash', at: j, color: '#2a1f14', opacity: 0.7, duration_ms: 400 }); ctx.move(j, e); ctx.setX('cam', e);
        ctx.toast('SCP-106 dragged the ' + pname(ctx, p) + ' away to ' + g.name(e) + '.', 2000);
      });
      ctx.sound('move-opponent'); return true;
    case 'shy':
      list = watchers(ctx, i); if (!list.length) return false;
      return scpTake(ctx, k, i, ctx.pick(list), 'tore apart') || true;
    case 'statue':
      if (watchers(ctx, i).length) return false;
      t = nearestArmy(ctx, i, 2);
      if (t >= 0) return scpTake(ctx, k, i, t, 'snapped') || true;
      t = nearestArmy(ctx, i); var s2 = t >= 0 ? stepToward(ctx, i, t) : -1;
      if (s2 >= 0) { ctx.move(i, s2); ctx.setX('cam', s2); return true; } return false;
    case 'reptile':
      var st = V.clone(ctx.state); st.b = st.b.slice(); st.b[i] = V.piece(V.types[lastType] ? lastType : 'N', 'w'); st.turn = 'w';
      var ms = []; V.genPiece(st, i, ms, true);
      ms = ms.filter(function (m) { var q = ctx.at(m.t); return m.f === i && (!q || isArmy(q)); });
      if (!ms.length) return false;
      var caps = ms.filter(function (m) { return ctx.at(m.t); });
      var mv = caps.length ? ctx.pick(caps) : ctx.pick(ms);
      if (ctx.at(mv.t)) return scpTake(ctx, k, i, mv.t, 'devoured') || true;
      ctx.move(i, mv.t); ctx.setX('cam', mv.t); ctx.sound('move-opponent'); return true;
    case 'crystal':
      list = adjArmy(ctx, i, false); if (!list.length) return false;
      list.forEach(function (j) { var p = ctx.at(j); ctx.set(j, Object.assign({}, p, { frz: ctx.params.freezeRounds })); });
      ctx.setX('cam', i); ctx.fx({ type: 'flash', at: i, color: '#bfe9ff', duration_ms: 500 });
      ctx.toast('SCP-409 crystallised ' + list.length + ' piece' + (list.length > 1 ? 's' : '') + '.', 1800); return true;
    case 'zombie':
      list = adjArmy(ctx, i, false);
      if (list.length) return scpTake(ctx, k, i, ctx.pick(list), 'bit') || true;
      t = nearestArmy(ctx, i); var s3 = t >= 0 ? stepToward(ctx, i, t) : -1;
      if (s3 >= 0) { ctx.move(i, s3); return true; } return false;
  }
  return false;
}
})();
