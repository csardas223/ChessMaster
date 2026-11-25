/* Legacy glue: the game loop, renderer and bot of the original single-file Chess Master, re-pointed at the new
   UI (CM.BoardView + CM.gameUI). engine8.js and modes_extra.js run unchanged on top of these globals; this lets
   every video without a remastered mode file (data/modes/<id>.js) stay playable.
   Classic script: top-level declarations here are shared globals that modes_extra.js wraps by reassignment
   (render, tap, openMode, useSF, ...). Do not wrap this file in an IIFE. New modes never touch this file. */
var GID = 0, FLIP = false, VIDEOS = [];
var $ = function (id) { return document.getElementById(id); };
const PCIMG = { P: 'P', N: 'N', B: 'B', R: 'R', Q: 'Q', K: 'K' };
const IMG = function (n) {
  if (n === 'scp' || n === 'boom' || n === 'dragon_w' || n === 'dragon_b') return 'assets/img/' + n + '.png';
  return CM.settings.pieceUrl(n[0], n[1].toUpperCase());
};
const PN = { Q: 'queens', N: 'knights', R: 'rooks', B: 'bishops', P: 'pawns', D: 'dragons' };
const MAT = { P: 1, N: 3, B: 3, R: 5, Q: 9, D: 12, K: 0 };
function pieceSrc(p) { const t = up(p), c = col(p); return t === 'D' ? 'assets/img/dragon_' + c + '.png' : CM.settings.pieceUrl(c, PCIMG[t] || 'P'); }
function sfx(n) { CM.sound.play(n); }
function toast(t) { CM.gameUI.toast(t, 2400); }

var LEG = { justSel: -1, hint: null, shownOver: -1 };

function newGame() {
  GID++; busy = false; const s = parse(MODE.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
  G = { s, sel: -1, hand: null, over: null, last: null, boom: new Set(), msg: '', cap: { w: [], b: [] }, sans: [], undo: [] };
  if (MODE.setup) MODE.setup(s, G);
  CM.gameUI.hideOver(); LEG.hint = null; LEG.shownOver = -1;
  G.ms = legal(s); render();
  sfx('game-start');
}
const counts = b => { const o = { w: {}, b: {} }; for (const p of b) if (p) { const c = col(p), t = up(p); if (o[c]) o[c][t] = (o[c][t] || 0) + 1; } return o; };
function san(s, ms, m, n) {
  const F = 'abcdefgh'; let t;
  if (m.drop) t = m.drop + '@' + sqName(m.t);
  else if (m.cs != null) t = m.t > m.f ? 'O-O' : 'O-O-O';
  else {
    const p = up(s.b[m.f]), cap = s.b[m.t] || m.ep;
    if (p === 'P') t = (cap ? F[m.f & 7] + 'x' : '') + sqName(m.t) + (m.pr ? '=Q' : '');
    else {
      const o = ms.filter(x => x !== m && !x.drop && x.f >= 0 && x.t === m.t && s.b[x.f] === s.b[m.f]); let d = '';
      if (o.length) d = !o.some(x => (x.f & 7) === (m.f & 7)) ? F[m.f & 7] : !o.some(x => (x.f >> 3) === (m.f >> 3)) ? String(8 - (m.f >> 3)) : sqName(m.f);
      t = p + d + (cap ? 'x' : '') + sqName(m.t);
    }
  }
  if (!MODE.giveaway) { const k = kingSq(n.b, n.turn); if (k >= 0 && attacked(n.b, k, s.turn)) t += G.over && G.over.why === 'checkmate' ? '#' : '+'; }
  return t;
}
function undo() {
  if (!G || busy || !G.undo.length) return; const u = G.undo.pop();
  Object.assign(G, { s: u.s, last: u.last, boom: u.boom, cap: u.cap, over: null, sel: -1, hand: null, msg: '' }); if (u.mines) G.mines = u.mines;
  G.sans.length = u.n; G.ms = legal(G.s); LEG.hint = null; LEG.shownOver = -1; CM.gameUI.hideOver(); render();
}
function moveSound(m, mover, chk, capd) {
  if (G.over) { if (G.over.why === 'checkmate') { sfx('move-check'); setTimeout(() => sfx('game-end'), 280); } else sfx('game-end'); return; }
  sfx(chk ? 'move-check' : m.pr ? 'promote' : m.cs != null ? 'castle' : capd ? 'capture' : mover === 'w' ? 'move-self' : 'move-opponent');
  if (G.msg) setTimeout(() => sfx('notify'), 160);
}
/* the board view animates the move from the diff, so play() commits at once */
function play(m, drag) { LEG.hint = [m.cs != null ? { f: m.cs, t: m.cd } : null, { f: m.f, t: m.t, dragged: !!drag }].filter(Boolean); commit(m); }
function commit(m) {
  const prev = G.s, pms = G.ms, mover = prev.turn, c0 = counts(prev.b), nc0 = G.cap.w.length + G.cap.b.length;
  if (mover === 'w') G.undo.push({ s: clone(prev), last: G.last, boom: new Set(G.boom), mines: G.mines ? new Set(G.mines) : null, cap: { w: G.cap.w.slice(), b: G.cap.b.slice() }, n: G.sans.length });
  G.s = m.n; G.last = m; G.sel = -1; G.hand = null; G.msg = '';
  if (MODE.after) MODE.after(G, m);
  if (m.pr) { c0[mover].P--; c0[mover].Q = (c0[mover].Q || 0) + 1; }
  const c1 = counts(G.s.b);
  for (const c of ['w', 'b']) for (const t in c0[c]) { const d = c0[c][t] - (c1[c][t] || 0); for (let k = 0; k < d; k++) G.cap[opp(c)].push(t); }
  G.ms = legal(G.s); if (!G.over) G.over = result(G.s, G.ms);
  G.sans.push(san(prev, pms, m, G.s)); render();
  const k = kingSq(G.s.b, G.s.turn), chk = !MODE.giveaway && k >= 0 && attacked(G.s.b, k, mover);
  moveSound(m, mover, chk, G.cap.w.length + G.cap.b.length > nc0);
  if (!G.over) {
    let t = G.msg; if (chk && MODE.checks) t = (t ? t + ' ' : '') + `Checks: you ${G.s.chk.w}, bot ${G.s.chk.b}.`;
    if (t) toast(t);
  }
  if (!G.over && G.s.turn === 'b') { busy = true; render(); const id = GID; setTimeout(() => botMove(id), 380); }
}

/* ---------- bot ---------- */
function useSF() { const M = MODE; return !M.policy && !M.atomic && !M.hill && !M.checks && !M.giveaway && !M.racing && !M.fog && !M.hand && !M.gravity && !M.horror && !M.fen && !M.after && !M.win && (!M.setup || M.count) && !(M.count && ARG === 'D'); }
function toFEN(s) {
  const rows = []; for (let r = 0; r < 8; r++) { let row = '', n = 0; for (let c = 0; c < 8; c++) { const p = s.b[r * 8 + c]; if (!p) { n++; continue; } if (n) { row += n; n = 0; } row += p; } if (n) row += n; rows.push(row); }
  return `${rows.join('/')} ${s.turn} ${s.cr || '-'} ${s.ep >= 0 ? sqName(s.ep) : '-'} 0 1`;
}
function fromUCI(ms, u) {
  if (!u || u.length < 4) return null; const sq = x => (8 - (+x[1])) * 8 + (x.charCodeAt(0) - 97);
  const f = sq(u.slice(0, 2)), t = sq(u.slice(2, 4)), pr = u[4];
  return ms.find(m => m.f === f && m.t === t && (pr ? m.pr && pr === 'q' : !m.pr)) || null;
}
function botMove(id) {
  if (id !== GID || !G || G.s.turn !== 'b') return; if (G.over) { busy = false; return; } const g = G;
  if (useSF() && CM.stockfish.state() !== 'failed') {
    render();
    CM.stockfish.ask(toFEN(g.s), { movetime: 600 }).then(u => { if (g !== G || G.over || id !== GID) return; const m = fromUCI(g.ms, u); if (m) { busy = false; play(m); } else customMove(g); });
    return;
  }
  setTimeout(() => customMove(g), 20);
}
function customMove(g) {
  if (g !== G || G.over) { if (G === g) busy = false; return; }
  const L = rank(g.s, g.ms); if (g !== G) return; busy = false; if (!L.length) { render(); return; }
  play((MODE.policy || best)(L, g.s).m);
}

/* ---------- input ---------- */
function tap(i) {
  if (!G || G.over || busy || G.s.turn !== 'w') return;
  if (G.hand) { const m = G.ms.find(x => x.drop === G.hand && x.t === i); G.hand = null; if (m) return play(m); sfx('illegal'); render(); return; }
  if (G.sel >= 0) { const m = G.ms.find(x => x.f === G.sel && x.t === i); if (m) return play(m); }
  const p = G.s.b[i]; if (G.sel >= 0 && G.sel !== i && !(p && col(p) === 'w')) sfx('illegal');
  G.sel = p && col(p) === 'w' && G.sel !== i ? i : -1; render();
}

/* ---------- render: legacy state -> BoardView model + chrome ---------- */
function render() {
  if (!G || CM.gameUI.controller !== CM.legacyGame) return;
  const s = G.s, b = s.b, UI = CM.gameUI; let vis = null;
  if (MODE.fog && !G.over) { vis = new Set(); for (let i = 0; i < 64; i++) if (b[i] && col(b[i]) === 'w') vis.add(i); for (const m of gen(Object.assign({}, s, { turn: 'w' }))) vis.add(m.t); }
  const tg = new Set(), capT = new Set();
  if (CM.settings.get('legalDots')) (G.sel >= 0 ? G.ms.filter(m => m.f === G.sel) : G.hand ? G.ms.filter(m => m.drop === G.hand) : []).forEach(m => { tg.add(m.t); if (b[m.t] || m.ep) capT.add(m.t); });
  const wk = kingSq(b, 'w'), inChk = !MODE.giveaway && wk >= 0 && attacked(b, wk, 'b');
  const lastOn = CM.settings.get('lastMove');
  const sqs = new Array(64);
  for (let i = 0; i < 64; i++) {
    const p = b[i], fog = vis && !vis.has(i) && !(p && col(p) === 'w'), cls = [];
    if (lastOn && G.last && (G.last.t === i || G.last.f === i)) cls.push('is-last');
    if (G.sel === i) cls.push('is-sel');
    if (inChk && i === wk) cls.push('is-check');
    if (vis && !vis.has(i)) cls.push('is-fog');
    if (tg.has(i)) cls.push(capT.has(i) ? 'is-target-cap' : 'is-target');
    let html = '';
    if (MODE.hill && HILL.includes(i)) html += '<span class="sq-tint" style="background:rgba(255,190,60,.35)"></span>';
    if (s.mon === i) html += '<span class="lg-mon"></span>';
    if (G.boom.has(i) && !p) html += '<span class="lg-boom"></span>';
    const piece = p && !fog ? { src: pieceSrc(p), key: p, label: (col(p) === 'w' ? 'white ' : 'black ') + up(p) } : null;
    sqs[i] = { valid: true, piece, cls: cls.join(' '), html };
  }
  UI.board.on(LEG.cbs);
  UI.board.render({ files: 8, ranks: 8, flip: FLIP, squares: sqs }, LEG.hint ? { hint: LEG.hint } : {});
  LEG.hint = null;
  /* hand (drops) */
  const hw = s.hand.w;
  $('hand').innerHTML = MODE.hand && hw.length ? [...new Set(hw)].map(t => `<button type="button" data-drop="${t}" aria-pressed="${G.hand === t}"><img src="${pieceSrc(t)}" alt=""><small>${hw.filter(x => x === t).length}</small></button>`).join('') : '';
  /* chrome */
  const sf = useSF() && CM.stockfish.state() !== 'failed', c = (MODE.cfg || MODE.cfgDef || {});
  const oppName = sf ? 'Stockfish' : (c.who || 'Bot'), oppRating = sf ? 3600 : (c.elo || '');
  const opp = { name: oppName, rating: oppRating, avatar: /stockfish/i.test(oppName) ? 'assets/avatars/stockfish.png' : 'assets/avatars/bot.svg' };
  const you = { name: 'You', avatar: 'assets/avatars/iwantcheckmate.png' };
  UI.setPlayers(FLIP ? { top: you, bottom: opp } : { top: opp, bottom: you });
  UI.setOpponentCard({ avatar: opp.avatar, name: opp.name, rating: opp.rating, tagline: '' });
  const mv = x => x.reduce((a, t) => a + (MAT[t] || 0), 0), adv = mv(G.cap.w) - mv(G.cap.b);
  const imgs = (a, cc) => a.slice().sort((x, y) => 'PNBRQDK'.indexOf(x) - 'PNBRQDK'.indexOf(y)).map(t => pieceSrc(cc === 'w' ? t : t.toLowerCase()));
  const topCaps = imgs(G.cap.b, 'w'), botCaps = imgs(G.cap.w, 'b');
  if (FLIP) UI.setCaptured(botCaps, topCaps, adv > 0 ? adv : 0, adv < 0 ? -adv : 0); else UI.setCaptured(topCaps, botCaps, adv < 0 ? -adv : 0, adv > 0 ? adv : 0);
  const topTurn = FLIP ? 'w' : 'b';
  UI.setActive(G.over ? null : (s.turn === topTurn ? 'top' : 'bottom'));
  UI.setThinking(busy && !G.over ? (sf && CM.stockfish.state() === 'loading' ? 'Loading engine…' : 'Thinking…') : '');
  UI.setMoves(G.sans);
  UI.setUndoEnabled(!busy && G.undo.length > 0);
  if (G.over && LEG.shownOver !== GID) {
    LEG.shownOver = GID; const res = G.over.w === 'w' ? 'win' : G.over.w === 'b' ? 'loss' : 'draw';
    UI.showOver({ result: res, why: G.over.why, you, opp });
  }
}
LEG.cbs = {
  canDrag: i => { if (!G || G.over || busy || G.s.turn !== 'w' || G.hand) return false; const p = G.s.b[i]; return !!(p && col(p) === 'w' && !'#$@%'.includes(p)); },
  onDragStart: i => { if (G.sel !== i) { G.sel = i; LEG.justSel = i; render(); } },
  onTap: (i, o) => {
    if (o && o.dragCancel) { LEG.justSel = -1; return; }
    if (LEG.justSel === i) { LEG.justSel = -1; return; }
    LEG.justSel = -1; tap(i);
  },
  onDrop: (f, t) => { LEG.justSel = -1; if (!G || G.over || busy) return; const m = G.ms.find(x => x.f === f && x.t === t); if (m) play(m, true); else { sfx('illegal'); G.sel = -1; render(); } }
};

/* ---------- explanations ---------- */
const cap1 = t => t.replace(/^./, x => x.toUpperCase());
function modeName(m, arg) { return m.count ? 'How Many ' + cap1(PN[arg] || 'pieces') : m.name; }
function ruleFor(m, arg) { return m.count ? `You get extra ${PN[arg]} on your side${arg === 'D' ? ' (a dragon moves like a queen and a knight)' : ''}. Pick how many, then beat the bot.` : m.rule; }
function explainOf(v) { return v.explain || ruleFor(v.mode.m, v.mode.arg); }

function isBuilt(v) { return !!(v.mode && v.mode.m !== FALLBACK); }
function countBuilt() { return VIDEOS.filter(isBuilt).length; }

/* openMode(m, arg) starts a legacy game (modes_extra.js wraps this) */
function openMode(m, arg) {
  MODE = m; ARG = arg;
  const UI = CM.gameUI;
  $('cntwrap').hidden = !MODE.count; $('cnt').value = CNT; $('cntlab').textContent = MODE.count ? `Extra ${PN[ARG]}: ${CNT}` : '';
  UI.setInfo(MODE.count ? ruleFor(MODE, ARG) : (MODE.rule || ''), MODE.how || '');
  newGame();
}

/* ---------- controller for CM.gameUI ---------- */
CM.legacyGame = {
  frame: 'chess',
  start: function (v) {
    const UI = CM.gameUI; UI.attach(this);
    CM.settings.applyBoard(null);
    UI.setTitle(v[1], v[2], v[0]);
    FLIP = false;
    openMode(v.mode.m, v.mode.arg);
    UI.setInfo(v.exp || (MODE.rule || ''), MODE.how || '');
    UI.layout();
  },
  newGame: function () { newGame(); },
  undo: function () { undo(); },
  flip: function () { FLIP = !FLIP; render(); },
  resign: function () { if (!G || G.over) return; G.over = { w: 'b', why: 'you resigned' }; busy = false; render(); },  /* QA 2026-11-25: Resign button */
  render: function () { render(); },
  detach: function () { GID++; G = null; busy = false; $('cntwrap').hidden = true; },
  afterRender: function () {
    if (!G || CM.gameUI.controller !== this) return;
    const c = (MODE.cfg || MODE.cfgDef || {});
    if (c.who) { $('botname').textContent = c.who; $('botrating').textContent = c.elo ? '(' + c.elo + ')' : ''; if (FLIP) { $('youname').textContent = c.who; } }
    CM.gameUI.setStatus(G.xline || '');
  }
};
document.addEventListener('DOMContentLoaded', function () {
  $('cnt').addEventListener('input', e => { if (CM.gameUI.controller !== CM.legacyGame) return; CNT = +e.target.value; $('cntlab').textContent = MODE.cntLabel ? MODE.cntLabel() : `Extra ${PN[ARG]}: ${CNT}`; newGame(); });
  $('hand').addEventListener('click', e => { if (CM.gameUI.controller !== CM.legacyGame) return; const t = e.target.closest('[data-drop]'); if (!t || busy || !G || G.over) return; G.sel = -1; G.hand = G.hand === t.dataset.drop ? null : t.dataset.drop; render(); });
});
