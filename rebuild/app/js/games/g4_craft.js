/* g4_craft (group 4): Infinite Craft (-TKJGtBKK8U), a crafting sandbox. Start with Water, Fire, Earth and Wind;
   pick two items to combine them into a new one. Goal: craft "Chess" (the video's route: ... Warrior + Excalibur =
   King, Blade + King = Knight, Blade + Knight = Chess). Tap one item, then another (or drag one onto another).
   The recipe table is hand-written from the items named in the video; combinations not in it give nothing.
   Original UI (white canvas, emoji chips); no assets copied from neal.fun. */
(function () {
  'use strict';
  var CM = window.CM;
  var E = { Water: '💧', Fire: '🔥', Earth: '🌍', Wind: '🌬️', Steam: '💨', Plant: '🌱', Lava: '🌋', Dust: '🌫️', Wave: '🌊', Smoke: '🚬', Lake: '🏞️', Land: '🗺️', Tree: '🌳',
    Stone: '🪨', Boulder: '🪨', Mountain: '⛰️', Swamp: '🐊', Dragon: '🐉', Sand: '🏖️', Mud: '🟫', Clay: '🧱', Pottery: '🏺', Metal: '⚙️', Blade: '🗡️', Pyramid: '🔺',
    Pharaoh: '🤴', 'King Tut': '⚱️', 'Sword in the Stone': '🗿', Excalibur: '⚔️', 'King Arthur': '🛡️', Human: '🧍', Warrior: '🥷', King: '👑', Riddle: '❓', Sphinx: '🦁',
    Knight: '🐴', Chess: '♟️', Pawn: '♙', Rook: '♜', Queen: '♛', Bishop: '♝', Checkmate: '🏁', Rain: '🌧️', Cloud: '☁️', Forest: '🌲', Island: '🏝️', Volcano: '🌋', Sun: '☀️', Ocean: '🌊', Plain: '🌾' };
  var RAW = [
    'Water+Fire=Steam', 'Water+Earth=Plant', 'Fire+Earth=Lava', 'Wind+Earth=Dust', 'Wind+Water=Wave', 'Wind+Fire=Smoke', 'Water+Water=Lake', 'Earth+Earth=Land',
    'Fire+Fire=Sun', 'Wind+Wind=Cloud', 'Cloud+Water=Rain', 'Steam+Wind=Cloud', 'Plant+Earth=Tree', 'Tree+Tree=Forest', 'Lava+Water=Stone', 'Stone+Stone=Boulder',
    'Boulder+Boulder=Mountain', 'Plant+Water=Swamp', 'Swamp+Fire=Dragon', 'Dust+Dust=Sand', 'Dust+Water=Mud', 'Mud+Stone=Clay', 'Clay+Fire=Pottery', 'Stone+Fire=Metal',
    'Metal+Metal=Blade', 'Metal+Stone=Blade', 'Sand+Mountain=Pyramid', 'Pyramid+Pottery=Pharaoh', 'Pharaoh+Dragon=King Tut', 'Blade+Stone=Sword in the Stone',
    'Sword in the Stone+Lake=Excalibur', 'Excalibur+Dragon=King Arthur', 'Clay+Wind=Human', 'Mud+Wind=Human', 'Human+Blade=Warrior', 'Warrior+Excalibur=King',
    'King Arthur+Blade=Warrior', 'Pharaoh+Human=King', 'Pyramid+Wind=Riddle', 'King+Riddle=Sphinx', 'Blade+King=Knight', 'Blade+Knight=Chess',
    'Chess+Plant=Pawn', 'Chess+Mountain=Rook', 'Chess+King=Checkmate', 'Chess+Pharaoh=Bishop', 'Chess+Dragon=Queen', 'Lake+Lake=Ocean', 'Ocean+Land=Island',
    'Lava+Mountain=Volcano', 'Land+Plant=Plain', 'Wave+Sand=Island'
  ];
  var REC = {};
  RAW.forEach(function (r) { var m = /^(.+)\+(.+)=(.+)$/.exec(r); REC[[m[1], m[2]].sort().join('|')] = m[3]; });
  var BASE = ['Water', 'Fire', 'Earth', 'Wind'];

  CM.defineGame('g4_craft', function (host) {
    var have, sel, box, list, bench, done, made;
    var css = 'position:absolute;inset:0;display:flex;flex-direction:column;background:#fff;color:#222;font:500 14px/1.2 system-ui,sans-serif;';
    function chip(n, extra) { return '<button type="button" data-i="' + n.replace(/"/g, '&quot;') + '" style="display:inline-flex;align-items:center;gap:6px;margin:4px;padding:7px 11px;border:1px solid #d6d6d6;border-radius:8px;background:' + (sel === n ? '#e8f0fe' : '#fff') + ';box-shadow:0 1px 0 rgba(0,0,0,.06);font:inherit;color:#222;cursor:pointer;touch-action:manipulation;transition:background-color 150ms ease-out">' + (E[n] || '✨') + ' ' + n + (extra || '') + '</button>'; }
    function render() {
      list.innerHTML = have.map(function (n) { return chip(n); }).join('');
      host.hud('<span style="color:#444;text-shadow:none">' + have.length + ' items</span><span style="color:#444;text-shadow:none">Goal: ♟️ Chess</span>');
    }
    function show(html) { bench.innerHTML = html; }
    function combine(a, b) {
      var r = REC[[a, b].sort().join('|')];
      if (!r) { show('<span style="color:#888">' + (E[a] || '') + ' ' + a + ' + ' + (E[b] || '') + ' ' + b + ' = nothing</span>'); host.sound('illegal'); return; }
      var fresh = have.indexOf(r) < 0;
      if (fresh) { have.push(r); made.push(a + ' + ' + b + ' = ' + r); host.setMoves(made.slice()); }
      show(chip(a) + ' + ' + chip(b) + ' = ' + chip(r, fresh ? ' <small style="color:#1a7f37;font-weight:700">New Discovery</small>' : ''));
      host.sound(fresh ? 'promote' : 'move-self');
      render();
      if (r === 'Chess' && !done) { done = true; host.toast('You crafted Chess!', 2200); host.after(900, function () { host.over({ result: 'win', why: 'crafting Blade + Knight = Chess (' + made.length + ' discoveries)', title: 'Chess Crafted!' }); }); }
    }
    function pickItem(n) {
      if (!sel) { sel = n; show(chip(n) + ' + <span style="color:#999">pick another item</span>'); render(); return; }
      var a = sel; sel = null; combine(a, n);
    }
    var drag = null;
    function onDown(e) { var b = e.target.closest('[data-i]'); if (!b) return; drag = { n: b.dataset.i, x: e.clientX, y: e.clientY, moved: false }; }
    function onMove(e) {
      if (!drag) return; if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 10 && !drag.moved) { drag.moved = true; drag.ghost = document.createElement('div'); drag.ghost.style.cssText = 'position:fixed;pointer-events:none;z-index:50;padding:7px 11px;border:1px solid #bbb;border-radius:8px;background:#fff;box-shadow:0 4px 12px rgba(0,0,0,.2);font:500 14px system-ui'; drag.ghost.textContent = (E[drag.n] || '') + ' ' + drag.n; document.body.appendChild(drag.ghost); }
      if (drag.ghost) { drag.ghost.style.left = (e.clientX - 20) + 'px'; drag.ghost.style.top = (e.clientY - 16) + 'px'; }
    }
    function onUp(e) {
      if (!drag) return; var d = drag; drag = null; if (d.ghost) d.ghost.remove();
      if (!d.moved) { pickItem(d.n); return; }
      var el = document.elementFromPoint(e.clientX, e.clientY), b = el && el.closest && el.closest('[data-i]');
      if (b && box.contains(b)) { sel = null; combine(d.n, b.dataset.i); }
    }
    function newGame() { have = BASE.slice(); sel = null; done = false; made = []; host.setMoves([]); show('<span style="color:#999">Tap two items to combine them (or drag one onto another).</span>'); render(); host.status('Craft Chess. Start: Water, Fire, Earth, Wind.'); }
    return {
      start: function () {
        box = document.createElement('div'); box.style.cssText = css;
        box.innerHTML = '<div data-b style="min-height:64px;padding:30px 10px 8px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px;border-bottom:1px solid #eee;background:#fafafa"></div><div data-l style="flex:1;overflow-y:auto;padding:6px;align-content:flex-start;-webkit-overflow-scrolling:touch"></div>';
        host.el.appendChild(box); bench = box.querySelector('[data-b]'); list = box.querySelector('[data-l]');
        box.addEventListener('pointerdown', onDown); window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
        var hud = host.el.querySelector('.game-frame__hud'); if (hud) host.el.appendChild(hud);
        newGame();
      },
      newGame: newGame,
      stop: function () { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); },
      key: function () {}, resize: function () {}, redraw: function () {}
    };
  });
})();
