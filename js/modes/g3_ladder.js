/* g3_ladder: shared hooks for "How many X to beat Y?" / "Until I LOSE" / bot-ladder challenge videos.
   A mode lists its games in params.levels; the player picks one in the Mode panel, and the next level is selected
   automatically after a result that the video treats as a step (params.advance):
     'fail' = after a loss or draw (How many X to BEAT ...), 'win' = after a win (Until I LOSE, bot ladders),
     'any' = after every game (one piece per game), 'none' = never (retry the same setup; attempts are counted).
   params: {
     levels: [{ label: '3 Queens', fen: '...', opponent: {name, rating, avatar, tagline}, bot: {...}, note: 'toast' }],
     advance: 'fail', unit: 'Queens' (status line), start: 0,
     random: true (pick a random level on each new game; viewer-chosen odds)
   }
   A level's opponent.rating also sets the bot strength (opponent.elo) unless the level gives elo itself.
   Game hooks only (no rule hooks), so Stockfish still plays standard-piece positions. */
(function () {
  'use strict';
  var CM = window.CM;
  var cur = {}, attempts = {}, baseBot = {};

  function levels(ctx) { return (ctx.params && ctx.params.levels) || []; }
  function key(ctx) { return ctx.spec.id; }
  function index(ctx) {
    var k = key(ctx), L = levels(ctx);
    if (cur[k] == null) { var s = CM.store.get('g3ladder.' + k, null); cur[k] = typeof s === 'number' && s >= 0 && s < L.length ? s : (ctx.params.start || 0); }
    return Math.max(0, Math.min(L.length - 1, cur[k]));
  }
  function setIndex(ctx, i) { var k = key(ctx); cur[k] = i; attempts[k] = 0; CM.store.set('g3ladder.' + k, i); drawPicker(ctx); }

  function drawPicker(ctx) {
    var L = levels(ctx); if (L.length < 2) return;
    var pane = document.getElementById('pane-info'); if (!pane) return;
    var box = pane.querySelector('.gpicker.g3ladder');
    if (!box) {
      var h = document.createElement('h2'); h.className = 'info__h g3ladder-h'; h.textContent = ctx.params.pickerLabel || 'Challenge level';
      box = document.createElement('div'); box.className = 'gpicker g3ladder'; box.setAttribute('role', 'group'); box.setAttribute('aria-label', h.textContent);
      box.style.padding = '8px 0 4px';
      var info = pane.querySelector('.info') || pane; info.appendChild(h); info.appendChild(box);
    }
    var on = index(ctx);
    box.innerHTML = L.map(function (lv, i) {
      return '<button type="button" data-lv="' + i + '" aria-pressed="' + (i === on) + '">' + CM.util.esc(lv.label || String(i + 1)) + '</button>';
    }).join('');
    box.onclick = function (e) {
      var b = e.target.closest('[data-lv]'); if (!b) return;
      setIndex(ctx, +b.dataset.lv);
      if (ctx.game && ctx.game.newGame) ctx.game.newGame();
    };
  }
  function removePicker() {
    var pane = document.getElementById('pane-info'); if (!pane) return;
    Array.prototype.forEach.call(pane.querySelectorAll('.g3ladder, .g3ladder-h'), function (n) { n.remove(); });
  }

  function applyLevel(ctx) {
    var L = levels(ctx); if (!L.length) return;
    var k = key(ctx);
    if (ctx.params.random && L.length > 1) { cur[k] = Math.floor(Math.random() * L.length); drawPicker(ctx); }
    var lv = L[index(ctx)], spec = ctx.spec;
    if (!baseBot[k]) baseBot[k] = Object.assign({}, spec.bot);
    var bot = Object.assign({}, baseBot[k], lv.bot || {});
    Object.keys(spec.bot).forEach(function (x) { delete spec.bot[x]; });
    Object.assign(spec.bot, bot);
    if (lv.fen || lv.place || lv.hands) {
      var su = Object.assign({}, spec.setup, { fen: lv.fen || spec.setup.fen });
      if (lv.place) su.place = lv.place;
      if (lv.hands) su.hands = lv.hands;
      if (lv.moved) su.moved = lv.moved;
      ctx.state = CM.spec.initialState(ctx.V, Object.assign({}, spec, { setup: su }));
    }
    var opp = Object.assign({}, spec.opponent, lv.opponent || {});
    if (lv.opponent && lv.opponent.rating != null && lv.opponent.elo == null) opp.elo = lv.opponent.rating;
    if (ctx.game && ctx.game.opponent) { Object.keys(ctx.game.opponent).forEach(function (x) { delete ctx.game.opponent[x]; }); Object.assign(ctx.game.opponent, opp); }
  }

  CM.defineHooks('g3_ladder', {
    init: function (ctx) { attempts[key(ctx)] = 0; drawPicker(ctx); },
    setup: function (ctx) { applyLevel(ctx); },
    onStart: function (ctx) {
      var L = levels(ctx), lv = L[index(ctx)];
      var k = key(ctx); attempts[k] = (attempts[k] || 0) + 1;
      if (lv && L.length > 1) ctx.toast((ctx.params.unit ? '' : 'Level: ') + (lv.label || '') + (lv.note ? '. ' + lv.note : ''), 2200);
    },
    status: function (ctx) {
      var L = levels(ctx), lv = L[index(ctx)]; if (!lv) return '';
      var a = attempts[key(ctx)] || 1, adv = ctx.params.advance || 'fail';
      var s = (ctx.params.statusPrefix || (L.length > 1 ? 'Game ' + (index(ctx) + 1) + ': ' : '')) + (lv.label || '');
      if (adv === 'none' || a > 1) s += ' (attempt ' + a + ')';
      return s;
    },
    onGameOver: function (ctx, over) {
      var L = levels(ctx), i = index(ctx), adv = ctx.params.advance || 'fail';
      var res = over.lost ? 'loss' : over.w === 'd' ? 'draw' : over.w === ctx.human ? 'win' : 'loss';
      var step = adv === 'any' || (adv === 'fail' && res !== 'win') || (adv === 'win' && res === 'win') || (adv === 'loss' && res === 'loss');
      if (adv === 'fail' && res === 'win') { ctx.toast(ctx.params.winText || ('Challenge complete with ' + (L[i].label || 'this setup') + '!'), 3200); return; }
      if (adv === 'win' && res !== 'win') { ctx.toast(ctx.params.endText || ('The run ends at ' + (L[i].label || 'this level') + '.'), 3200); return; }
      if (step && !ctx.params.random) {
        if (i + 1 < L.length) { setIndex(ctx, i + 1); ctx.toast('Next game: ' + (L[i + 1].label || 'level ' + (i + 2)) + '. Press New game.', 3200); }
        else if (ctx.params.maxText) ctx.toast(ctx.params.maxText, 3200);
      }
    },
    onExit: function () { removePicker(); }
  });
})();
