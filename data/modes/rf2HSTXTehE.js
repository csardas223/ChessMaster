/* Can I BEAT Ouroboros King?  Steam "tactical variant chess roguelite": a campaign of small battles on ~6x8 boards with
   drafted unit armies; win a battle by killing the enemy General. Units: Portal Mage (moves to any empty square, kills
   only adjacent), Reaper (king steps; kills any non-royal enemy standing on a tile of its own colour), Glass Queen,
   Marching Pawn (2 forward or 1 diagonal, kills diagonally), Prince, Knight, Viking (up to two orthogonal steps),
   General (royal king). Sources: research/modes/rf2HSTXTehE.json, frames (navy #c2c7da/#323f55), transcript.
   arena agent (2026-11-25): full Kingdom of Thessalonia run: free draft of three units, node map (Training Grounds / Ruins / Armory /
   Sacrificial Obelisk / Shop / the Capital), Armory upgrades (Mirror Queen, Quartermaster, Berserker), relic and unit sacrifice,
   relics (Finisher both sides, Alarm Bell, Ouroboros Sigil, Guardian Angel, Magic Suitcase), rewinds, AI draw offers. */
CM.mode({
  id: 'rf2HSTXTehE',
  title: 'Can I BEAT Ouroboros King?',
  name: 'Ouroboros King',
  category: 'Variants & Games',
  description: 'A roguelite campaign of small battles. Draft three units, then pick your path on the map: Training Grounds (recruit), Ruins (relics), Armory (upgrade a unit), Sacrificial Obelisk, Shop, and finally the capital. Your King and the enemy General are royal: kill the General and his army surrenders. Rewinds undo moves; the losing AI may offer a draw (accepting skips the rewards). Portal Mage teleports to any empty square but only kills next to itself; Viking makes up to two orthogonal steps; Marching Pawn moves two forward or one diagonally; Glass Queen moves like a queen.',
  how_to_win: 'Kill the enemy General in every battle and defeat the boss in the capital; losing your King ends the run.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/rf2HSTXTehE/hero.png' },
  opponent: { name: 'Ouroboros armies', rating: null, avatar: null, tagline: 'Kingdom of Thessalonia, Marsh of Madness, Ridge of Ruin.' },
  board: { files: 6, ranks: 8, light: '#c2c7da', dark: '#323f55', background: '#101826', squares: { /* art-g6: pink enemy zone (top two rows) as in the frames */ a7: { color: 'rgba(214,96,150,.22)' }, b7: { color: 'rgba(214,96,150,.22)' }, c7: { color: 'rgba(214,96,150,.22)' }, d7: { color: 'rgba(214,96,150,.22)' }, e7: { color: 'rgba(214,96,150,.22)' }, f7: { color: 'rgba(214,96,150,.22)' }, a8: { color: 'rgba(214,96,150,.22)' }, b8: { color: 'rgba(214,96,150,.22)' }, c8: { color: 'rgba(214,96,150,.22)' }, d8: { color: 'rgba(214,96,150,.22)' }, e8: { color: 'rgba(214,96,150,.22)' }, f8: { color: 'rgba(214,96,150,.22)' } } },
  pieces: { /* art-g6: Ouroboros King unit icons cut from the video board (shared with g5 JAz_qMQpI1o, tools/g5_art4.py);
              g6b: Marching Pawn + Prince from this video's recruit cards (1:10 / 1:22, tools/g6b_art.py), Glass Queen + Reaper shared
              from JAz_qMQpI1o; black = fill/outline swap (inferred) */
    K: { name: 'King', moves: 'K', value: 2000, royal: true, castle: false, img: { w: 'assets/modes/rf2HSTXTehE/king_w.png', b: 'assets/modes/rf2HSTXTehE/king_b.png' } },
    Gn: { name: 'General', moves: 'K', value: 2000, royal: true, img: { w: 'assets/modes/rf2HSTXTehE/general_w.png', b: 'assets/modes/rf2HSTXTehE/general_b.png' } },
    Pm: { name: 'Portal Mage', moves: '', value: 400, gen: 'portal', img: { w: 'assets/modes/rf2HSTXTehE/mage_w.png', b: 'assets/modes/rf2HSTXTehE/mage_b.png' } },
    /* g6b: card text "move up to two times orthogonally, directions may differ" (transcript) */
    Vk: { name: 'Viking', moves: '', gen: 'viking', value: 380, img: { w: 'assets/modes/rf2HSTXTehE/viking_w.png', b: 'assets/modes/rf2HSTXTehE/viking_b.png' } },
    /* g6b: card 1:10 "Move up to 2 squares forward or 1 square diagonally forward, can only kill diagonally. If it gets to the last row,
       it transforms into a Queen for the rest of the combat" */
    Mp: { name: 'Marching Pawn', moves: 'fmWfmnDfF', value: 150, pawn: true, promote: true, promoteTo: ['Q'], img: { w: 'assets/modes/rf2HSTXTehE/marching_pawn_w.png', b: 'assets/modes/rf2HSTXTehE/marching_pawn_b.png' } },
    Q: { name: 'Queen', moves: 'Q', value: 850, img: { w: 'assets/modes/rf2HSTXTehE/glass_queen_w.png', b: 'assets/modes/rf2HSTXTehE/glass_queen_b.png' } },
    Gq: { name: 'Glass Queen', moves: 'Q', value: 800, img: { w: 'assets/modes/rf2HSTXTehE/glass_queen_w.png', b: 'assets/modes/rf2HSTXTehE/glass_queen_b.png' } },
    /* g6b: card 1:22 "Move like a King. Your King can't be killed by other units while being 3 or less squares away vertically and horizontally from the Prince" */
    Pr: { name: 'Prince', moves: 'K', value: 350, img: { w: 'assets/modes/rf2HSTXTehE/prince_w.png', b: 'assets/modes/rf2HSTXTehE/prince_b.png' } },
    Re: { name: 'Reaper', moves: '', gen: 'reaper', value: 450, img: { w: 'assets/modes/rf2HSTXTehE/reaper_w.png', b: 'assets/modes/rf2HSTXTehE/reaper_b.png' } },
    Fo: { name: 'Fool', moves: '', gen: 'fool', value: 300, badge: '', img: { w: 'assets/modes/rf2HSTXTehE/fool_w.png', b: 'assets/modes/rf2HSTXTehE/fool_b.png' } },   /* art-g6c: jester-cap icon from the 1:49 Fool recruit card (video_thumbs/rf2HSTXTehE_frame_109.jpg, tools/g6c_art.py); black = fill/outline swap (inferred) */
    /* arena agent: Armory upgrades (names from the cards at 0:58 / 1:20 / 2:02; effects inferred), drawn with the base unit's art + a star badge */
    Mq: { name: 'Mirror Queen', moves: 'Q', value: 900, img: { w: 'assets/modes/rf2HSTXTehE/glass_queen_w.png', b: 'assets/modes/rf2HSTXTehE/glass_queen_b.png' } },
    Qm: { name: 'Quartermaster', moves: 'KfmnD', value: 260, pawn: true, promote: true, promoteTo: ['Q'], img: { w: 'assets/modes/rf2HSTXTehE/marching_pawn_w.png', b: 'assets/modes/rf2HSTXTehE/marching_pawn_b.png' } },
    Bk: { name: 'Berserker', moves: '', gen: 'berserk', value: 480, img: { w: 'assets/modes/rf2HSTXTehE/viking_w.png', b: 'assets/modes/rf2HSTXTehE/viking_b.png' } },
    Oq: { name: 'Ouroboros Queen', moves: 'QN', royal: true, value: 2000, img: 'assets/modes/rf2HSTXTehE/queen_face.png' },
    R: { img: { w: 'assets/modes/rf2HSTXTehE/rook_w.png', b: 'assets/modes/rf2HSTXTehE/rook_b.png' } }, N: { img: { w: 'assets/modes/rf2HSTXTehE/knight_w.png', b: 'assets/modes/rf2HSTXTehE/knight_b.png' } }
  },
  setup: { fen: '1r[gn]n2/2pp2/6/6/6/6/6/1R[Gq]K[Vk]1' },
  rules: { check: 'none', castling: false, enPassant: false, promotion: { auto: 'Q', choices: ['Q'] }, drawPlies: 120 },
  params: {
    /* arena agent (2026-11-25): the Kingdom of Thessalonia campaign as in the video (transcript 0:18-15:09). The run layer below
       (draft, node map, rewards, rewinds, relics, draw offers) replaces the g6_levels shop; g6_levels still loads each battle. */
    run: 'Battle', levels: [{ name: 'Kingdom of Thessalonia', fen: '2[gn]b2/2pp2/6/6/6/6/6/3K2' }],
    startGold: 300, rewinds: 6,
    /* unit costs: the Reaper costs 481 gold in the transcript (8:38), the Musketeer 687; the rest inferred */
    costs: { R: 220, Pm: 300, Re: 481, Gq: 320, Mp: 120, Pr: 260, N: 200, Fo: 220, Vk: 240 },
    /* free draft at the start, three picks of three (0:18 rook / portal mage / reaper, 0:52 glass queen / marching pawn / prince,
       1:38 knight / fool / viking) */
    draft: [['R', 'Pm', 'Re'], ['Gq', 'Mp', 'Pr'], ['N', 'Fo', 'Vk']],
    /* node map: the choices the video offers after each battle (2:39 Training Grounds | Ruins, 5:06 Armory | Training Grounds,
       8:57 Sacrificial Obelisk, 10:58 Training Grounds | Ruins, 13:49 the capital); the Shop beside the Obelisk is inferred */
    map: [['train', 'ruins'], ['armory', 'train'], ['obelisk', 'shop'], ['train', 'ruins'], ['boss']],
    /* enemy armies (top six rows, '*' = boulder): 1 general + bishop (3:05), 2 two Vikings among stones (5:30), 3 a (Pegasus) rider
       and a bishop (9:14), 4 knight, Viking and rider (11:23), boss with a Viking and a knight (14:03). Pegasus Rider / Witch Queen have
       no art, so a knight / the Ouroboros Queen stand in (inferred). */
    battles: [
      { name: 'Kingdom of Thessalonia - 1', fen: '2[gn]b2/2pp2/6/6/6/6', reward: 350 },
      { name: 'Kingdom of Thessalonia - 2', fen: '[vk]1[gn]1[vk]1/1pp1p1/6/1*4/4*1/6', reward: 300 },
      { name: 'Kingdom of Thessalonia - 3', fen: 'n1[gn]b2/1pp1p1/6/2*3/6/6', reward: 320 },
      { name: 'Kingdom of Thessalonia - 4', fen: 'n[vk][gn]1rb/pp2pp/6/6/*4*/6', reward: 400 },
      { name: 'The Capital: the Ouroboros Queen', fen: '1[vk][oq]n2/1pppp1/6/6/6/6', reward: 0, boss: true }
    ]
  },
  bot: { engine: 'search', depth: 3, time_ms: 500 },
  /* g6b: Ouroboros unit rules (Reaper, Prince, Fool, Viking) + the Finisher / Alarm Bell relics.
     arena agent (2026-11-25): run layer = draft -> node map -> battle -> node reward (Training Grounds recruit, Ruins relic, Armory
     upgrade, Sacrificial Obelisk, Shop) -> ... -> boss; rewinds (undo charges, Ouroboros Sigil +1 per battle, Guardian Angel), AI draw
     offers ("Accept the draw offer and advance without any rewards", 7:07), Glass Queen lost for good when she dies. */
  hooks: (function () {
    var D8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]], W4 = D8.slice(0, 4);
    var A = 'assets/modes/rf2HSTXTehE/';
    var RUN = null;   /* the campaign run, kept for the session */
    var UNIT = {   /* card texts from the transcript */
      R: 'Moves orthogonally any distance.', Pm: 'Move to any unoccupied square. Can only kill adjacent squares.',
      Re: 'Moves like a king. Kills any enemy on a tile of the same colour that it is on that is not a king.',
      Gq: 'Moves like a queen, but if she dies she will not come back in future combats. Upgrades to a Mirror Queen.',
      Mp: 'Moves up two squares forward or one square diagonally forward; kills diagonally; becomes a queen on the last row. Upgrades to a Quartermaster.',
      Pr: 'Moves like a king. Your King cannot be killed while within three squares of the Prince.',
      N: 'Moves just like a knight.', Fo: 'Moves with the same pattern as the last enemy move.',
      Vk: 'Move up to two times orthogonally; not all moves have to be in the same direction. Upgrades to a Berserker.',
      Mq: 'Moves like a queen. Once per combat she returns to her square when killed, and she is never lost for good (inferred).',
      Qm: 'Moves like a king or two squares forward; becomes a queen on the last row (inferred).',
      Bk: 'Up to two steps in any of the eight directions; directions may differ (inferred).'
    };
    var UPG = { Gq: 'Mq', Mp: 'Qm', Vk: 'Bk' };
    var RELIC = {
      finisher: { name: 'The Finisher', img: A + 'relic_finisher.png', txt: 'If the enemy king or general is alone and you have other units at the start of your turn, you win.' },
      bell: { name: 'Alarm Bell', img: A + 'relic_bell.png', txt: 'The alarm rings whenever your king is in danger.' },
      sigil: { name: 'Ouroboros Sigil', img: A + 'relic_sigil.png', txt: 'At the start of each battle, get a rewind.' },
      angel: { name: 'Guardian Angel', img: A + 'relic_wings.png', txt: 'If your king is in danger after you move, automatically spend three rewinds to go back in time.' },
      suitcase: { name: 'Magic Suitcase', img: null, txt: 'At the start of each battle, get a random item.' }
    };
    var NODE = {
      train: { name: 'Training Grounds', img: A + 'rook_w.png', txt: 'Recruit new units for your army. Fresh meat, ready for battle.' },
      ruins: { name: 'Ruins', img: A + 'map_icon.png', txt: 'Discover relics that will grant you permanent bonuses.' },
      armory: { name: 'Armory', img: A + 'viking_w.png', txt: 'Upgrade one of your units. Only units upgradeable at the Armory can be upgraded this way.' },
      obelisk: { name: 'Sacrificial Obelisk', img: A + 'reaper_w.png', txt: 'Sacrifice something you love for a better reward.' },
      shop: { name: 'Shop', img: A + 'gold.png', txt: 'Spend your gold on units, rewinds and relics (inferred node).' },
      boss: { name: 'The Capital', img: A + 'queen_face.png', txt: 'The capital lies ahead. It is about time I reclaim the throne.' }
    };
    var SLOTS = ['d2', 'c2', 'e2', 'b2', 'f2', 'a2', 'c1', 'e1', 'b1', 'f1', 'a1'], QSLOTS = ['c1', 'e1', 'b1', 'f1', 'a1', 'd2', 'c2', 'e2', 'b2', 'f2', 'a2'];
    function base() { return CM.hooks.g6_levels; }
    function sqc(g, i) { return (g.col(i) + g.row(i)) & 1; }
    function rnd(n) { return Math.floor(Math.random() * n); }
    function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    function has(r) { return RUN && RUN.relics.indexOf(r) >= 0; }
    function newRun(P) { RUN = { phase: 'draft', pick: 0, row: 0, gold: P.startGold, rewinds: P.rewinds, army: [{ t: 'K', sq: 'd1' }], relics: ['finisher', 'bell', 'sigil'], node: null, offerPly: -99, sigilFor: -1 }; }
    function addUnit(t) {
      var used = {}; RUN.army.forEach(function (u) { used[u.sq] = 1; });
      var order = /^(Gq|Mq)$/.test(t) ? QSLOTS : SLOTS, sq = order.filter(function (s) { return !used[s]; })[0];
      if (sq) RUN.army.push({ t: t, sq: sq }); return !!sq;
    }
    function nm(ctx, t) { return ctx.V.def(t).name || t; }
    function img(ctx, t) { return ctx.game.pieceImage({ t: t, c: ctx.human }); }
    var CSS = 'position:absolute;inset:0;z-index:30;overflow:auto;background:rgba(16,24,38,.97);padding:10px;display:flex;flex-direction:column;gap:8px;color:#fff;font:13px/1.3 system-ui,sans-serif';
    function panel(ctx, html, on) {
      var wrap = document.getElementById('board-wrap'); if (!wrap) return null; close();
      if (CM.gameUI && CM.gameUI.hideOver) CM.gameUI.hideOver();
      var el = document.createElement('div'); el.id = 'ouro-run'; el.style.cssText = CSS; el.innerHTML = html;
      el.onclick = function (e) { var b = e.target.closest('[data-a]'); if (b && !b.disabled) on(b.dataset.a, b.dataset.v); };
      wrap.appendChild(el); return el;
    }
    function close() { var e = document.getElementById('ouro-run'); if (e) e.remove(); }
    function card(a, v, icon, title, txt, foot, dis) {
      return '<button type="button" class="btn" data-a="' + a + '" data-v="' + v + '"' + (dis ? ' disabled' : '') + ' style="display:flex;flex-shrink:0;gap:8px;align-items:flex-start;text-align:left;padding:8px;background:#22304a;border:1px solid #3c4f72;white-space:normal;height:auto;min-height:0;font-weight:400">' +
        (icon ? '<img alt="" src="' + icon + '" style="width:40px;height:40px;flex:none;object-fit:contain">' : '<span style="width:40px;height:40px;flex:none;border-radius:6px;background:#5b4a7a;display:inline-flex;align-items:center;justify-content:center;font-weight:800">' + CM.util.esc(title.charAt(0)) + '</span>') +
        '<span style="flex:1"><b style="font-size:14px">' + CM.util.esc(title) + '</b>' + (foot ? '<span style="float:right;color:#ffd75a;font-weight:700">' + foot + '</span>' : '') + '<br><span style="opacity:.85;font-size:12px;font-weight:400">' + CM.util.esc(txt) + '</span></span></button>';
    }
    function head(ctx, title) {
      var rel = RUN.relics.map(function (r) { var R = RELIC[r]; return R.img ? '<img alt="' + R.name + '" title="' + R.name + '" src="' + R.img + '" style="width:20px;height:20px;vertical-align:middle">' : '<b title="' + R.name + '" style="font-size:11px;background:#5b4a7a;border-radius:4px;padding:1px 4px">' + R.name.split(' ').map(function (w) { return w.charAt(0); }).join('') + '</b>'; }).join(' ');
      var army = RUN.army.map(function (u) { return '<img alt="" title="' + CM.util.esc(nm(ctx, u.t)) + '" src="' + img(ctx, u.t) + '" style="width:24px;height:24px">'; }).join('');
      return '<b style="font-size:17px;letter-spacing:.03em;flex-shrink:0">' + title + '</b><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;flex-shrink:0"><span><img alt="" src="' + A + 'gold.png" style="width:18px;height:18px;vertical-align:middle"> <b style="color:#ffd75a">' + RUN.gold + '</b></span><span><img alt="" src="' + A + 'item_rewind.png" style="width:16px;height:16px;vertical-align:middle;filter:invert(0)"> ' + RUN.rewinds + ' rewinds</span><span style="display:inline-flex;gap:4px;align-items:center">' + rel + '</span></div><div style="display:flex;gap:3px;flex-wrap:wrap;flex-shrink:0">' + army + '</div>';
    }
    /* ---------- run screens ---------- */
    function draft(ctx) {
      var P = ctx.params, set = P.draft[RUN.pick];
      panel(ctx, head(ctx, 'Kingdom of Thessalonia') + '<div>Select a piece to recruit (' + (RUN.pick + 1) + '/' + P.draft.length + ')</div>' + set.map(function (t) { return card('d', t, img(ctx, t), nm(ctx, t), UNIT[t], 'Free'); }).join(''),
        function (a, v) { addUnit(v); RUN.pick++; ctx.sound('notify'); if (RUN.pick >= P.draft.length) { RUN.phase = 'map'; map(ctx); } else draft(ctx); });
    }
    function map(ctx) {
      var P = ctx.params, rows = P.map;
      var html = head(ctx, 'Kingdom of Thessalonia') + '<img alt="" src="' + A + 'campaign_map.png" style="width:84px;height:84px;align-self:center;border-radius:6px">' +
        '<div style="font-size:12px;opacity:.8">Step ' + (RUN.row + 1) + ' of ' + rows.length + ': choose where to go.</div>' +
        rows[RUN.row].map(function (k) { return card('n', k, NODE[k].img, NODE[k].name, NODE[k].txt, k === 'shop' ? '' : P.battles[RUN.row].name.replace('Kingdom of Thessalonia - ', 'Battle ')); }).join('');
      panel(ctx, html, function (a, v) {
        RUN.node = v; if (v === 'shop') { shop(ctx); return; }
        RUN.phase = 'battle'; close(); ctx.game.newGame();
      });
    }
    function next(ctx) { RUN.row++; RUN.node = null; RUN.phase = 'map'; if (RUN.row >= ctx.params.map.length) { newRun(ctx.params); } map(ctx); }
    function recruit(ctx, title, n, after) {
      var P = ctx.params, offer = RUN.offer || (RUN.offer = shuffle(Object.keys(P.costs)).slice(0, n));
      panel(ctx, head(ctx, title) + '<div>Select a piece to recruit</div>' + offer.map(function (t) { var c = P.costs[t]; return card('b', t, img(ctx, t), nm(ctx, t), UNIT[t], c + 'g', RUN.gold < c); }).join('') + '<button type="button" class="btn" data-a="skip" style="flex-shrink:0">Continue without recruiting</button>',
        function (a, v) { if (a === 'b') { var c = P.costs[v]; if (RUN.gold < c) return; if (!addUnit(v)) { ctx.toast('No room left on your side.'); return; } RUN.gold -= c; ctx.sound('notify'); } RUN.offer = null; after(); });
    }
    function ruins(ctx, after) {
      var pool = shuffle(Object.keys(RELIC).filter(function (r) { return !has(r); })).slice(0, 3);
      if (!pool.length) { RUN.rewinds += 2; ctx.toast('The ruins are empty: +2 rewinds.'); after(); return; }
      panel(ctx, head(ctx, 'Ruins') + '<div>Discover a relic</div>' + pool.map(function (r) { return card('r', r, RELIC[r].img, RELIC[r].name, RELIC[r].txt, ''); }).join(''),
        function (a, v) { RUN.relics.push(v); ctx.sound('promote'); after(); });
    }
    function armory(ctx, after) {
      var list = RUN.army.map(function (u, k) { return { u: u, k: k }; }).filter(function (o) { return UPG[o.u.t]; });
      if (!list.length) { ctx.toast('Armory: none of your units can be upgraded here.', 2400); after(); return; }
      panel(ctx, head(ctx, 'Armory') + '<div>Upgrade one of your units</div>' + list.map(function (o) { var to = UPG[o.u.t]; return card('u', o.k, img(ctx, to), nm(ctx, o.u.t) + ' \u2192 ' + nm(ctx, to), UNIT[to], ''); }).join('') + '<button type="button" class="btn" data-a="skip" style="flex-shrink:0">Leave</button>',
        function (a, v) { if (a === 'u') { var u = RUN.army[+v]; u.t = UPG[u.t]; ctx.sound('promote'); } after(); });
    }
    function obelisk(ctx, after) {
      var units = RUN.army.filter(function (u) { return u.t !== 'K'; }), victim = units.filter(function (u) { return u.t === 'Vk' || u.t === 'Bk'; })[0] || units[rnd(units.length)];
      var relic = has('bell') ? 'bell' : RUN.relics.filter(function (r) { return r !== 'finisher'; })[0];
      var gain = has('suitcase') ? null : 'suitcase', deals = [];
      if (victim) deals.push(card('su', 0, img(ctx, victim.t), 'Sacrifice your ' + nm(ctx, victim.t), 'Receive a Reaper: ' + UNIT.Re + ' (the video offers a Griffin, which has no art here)', ''));
      if (relic) deals.push(card('sr', 0, RELIC[relic].img, 'Sacrifice ' + RELIC[relic].name, gain ? 'Receive the Magic Suitcase: ' + RELIC.suitcase.txt : 'Receive three rewinds.', ''));
      panel(ctx, head(ctx, 'Sacrificial Obelisk') + '<div>Sacrifice something you love for a better reward.</div>' + deals.join('') + '<button type="button" class="btn" data-a="skip" style="flex-shrink:0">Leave</button>',
        function (a) {
          if (a === 'su') { RUN.army.splice(RUN.army.indexOf(victim), 1); addUnit('Re'); ctx.sound('capture'); }
          if (a === 'sr') { RUN.relics.splice(RUN.relics.indexOf(relic), 1); if (gain) RUN.relics.push(gain); else RUN.rewinds += 3; ctx.sound('capture'); }
          after();
        });
    }
    function shop(ctx) {
      var P = ctx.params; if (!RUN.stock) { var r = shuffle(Object.keys(RELIC).filter(function (x) { return !has(x); }))[0]; RUN.stock = shuffle(Object.keys(P.costs)).slice(0, 2).map(function (t) { return { k: 'u', t: t, c: P.costs[t] }; }).concat([{ k: 'w', c: 80 }]).concat(r ? [{ k: 'r', r: r, c: 260 }] : []); }
      panel(ctx, head(ctx, 'Shop') + RUN.stock.map(function (it, i) {
        if (it.sold) return '';
        if (it.k === 'u') return card('b', i, img(ctx, it.t), nm(ctx, it.t), UNIT[it.t], it.c + 'g', RUN.gold < it.c);
        if (it.k === 'w') return card('b', i, A + 'item_rewind.png', 'Rewind', 'Undo a move in battle.', it.c + 'g', RUN.gold < it.c);
        return card('b', i, RELIC[it.r].img, RELIC[it.r].name, RELIC[it.r].txt, it.c + 'g', RUN.gold < it.c);
      }).join('') + '<button type="button" class="btn" data-a="skip" style="flex-shrink:0">Leave the shop</button>',
        function (a, v) {
          if (a === 'skip') { RUN.stock = null; next(ctx); return; }
          var it = RUN.stock[+v]; if (!it || it.sold || RUN.gold < it.c) return;
          if (it.k === 'u' && !addUnit(it.t)) { ctx.toast('No room left on your side.'); return; }
          if (it.k === 'w') RUN.rewinds++; if (it.k === 'r') RUN.relics.push(it.r);
          RUN.gold -= it.c; it.sold = 1; ctx.sound('notify'); shop(ctx);
        });
    }
    function reward(ctx) {
      var k = RUN.node, done = function () { next(ctx); };
      if (k === 'train') recruit(ctx, 'Training Grounds', 3, done); else if (k === 'ruins') ruins(ctx, done); else if (k === 'armory') armory(ctx, done); else if (k === 'obelisk') obelisk(ctx, done); else done();
    }
    function drawOffer(ctx) {
      panel(ctx, '<div style="margin:auto;text-align:center;display:flex;flex-direction:column;gap:10px;align-items:center"><img alt="" src="' + A + 'draw_offer.png" style="width:72px"><b style="font-size:16px">The enemy offers a draw</b><div>Accept the draw offer and advance without any rewards.</div>' +
        '<div style="display:flex;gap:8px"><button type="button" class="btn" data-a="acc">Accept</button><button type="button" class="btn" data-a="dec" style="background:#81b64c">Decline</button></div></div>',
        function (a) { close(); if (a === 'acc') { RUN.drawn = true; ctx.endGame('d', 'draw offer accepted (no rewards)'); } else ctx.toast('Draw declined.', 1200); });
      var el = document.getElementById('ouro-run'); if (el) el.style.background = 'rgba(16,24,38,.86)';
    }
    function balance(ctx) { var V = ctx.V, s = 0; ctx.state.b.forEach(function (p) { if (!p || p.c === 'n' || V.def(p.t).royal) return; s += (p.c === ctx.bot ? 1 : -1) * (V.def(p.t).value || 0); }); return s; }
    function rewindGuard(ctx, on) {
      var b = document.getElementById('undo'); if (!b) return;
      if (b._ouro) { b.removeEventListener('click', b._ouro, true); b._ouro = null; } if (!on) return;
      b._ouro = function (e) { if (!RUN || RUN.rewinds <= 0) { e.stopImmediatePropagation(); e.preventDefault(); ctx.toast('No rewinds left.'); } };
      b.addEventListener('click', b._ouro, true);
    }
    return {
      extends: 'g6_levels',
      reaper: function (V, st, i, p, out) {   /* king steps; kills any non-royal enemy on a tile of its own colour without moving */
        var b = st.b, g = V.geo, near = {};
        D8.forEach(function (d) { var j = g.step(i, d[0], d[1]); if (j < 0) return; near[j] = 1; var q = b[j];
          if (!q) out.push({ f: i, t: j, p: p.t, c: p.c, cap: null }); else if (q.c !== p.c && q.c !== 'n') out.push({ f: i, t: j, p: p.t, c: p.c, cap: q, capSq: j }); });
        for (var j = 0; j < b.length; j++) { var q = b[j]; if (!q || q.c === p.c || q.c === 'n' || near[j] || V.def(q.t).royal || V.def(q.t).blocker) continue;
          if (sqc(g, j) === sqc(g, i)) out.push({ f: i, t: i, p: p.t, c: p.c, cap: q, capSq: j, reap: 1 }); }
      },
      viking: function (V, st, i, p, out) { return twoSteps(V, st, i, p, out, W4); },
      berserk: function (V, st, i, p, out) { return twoSteps(V, st, i, p, out, D8); },
      fool: function (V, st, i, p, out) {   /* moves with the pattern of the last enemy move (x.lt[colour] = type the enemy last moved) */
        var lt = st.x && st.x.lt && st.x.lt[p.c]; if (!lt || lt === 'Fo' || !V.types[lt]) lt = 'K';
        var b2 = st.b.slice(); b2[i] = { t: lt, c: p.c, m: 1 }; var tmp = [];
        V.genPiece(Object.assign({}, st, { b: b2 }), i, tmp, true);
        tmp.forEach(function (m) { if (m.castle || m.dbl != null) return; out.push({ f: i, t: m.t, p: p.t, c: p.c, cap: m.cap, capSq: m.capSq }); });
      },
      onMake: function (V, st, m, n) {
        base().onMake(V, st, m, n);
        if (m.f >= 0) { var lt = Object.assign({}, (st.x && st.x.lt) || {}); lt[st.turn === 'w' ? 'b' : 'w'] = m.p; n.x = Object.assign({}, n.x, { lt: lt }); }
      },
      filterMoves: function (V, st, legal) {   /* Prince: your King cannot be killed within 3 squares of him */
        var g = V.geo; legal = base().filterMoves(V, st, legal);
        return legal.filter(function (m) { if (!m.cap || !V.def(m.cap.t).royal) return true; var sq = m.capSq != null ? m.capSq : m.t;
          for (var i = 0; i < st.b.length; i++) { var q = st.b[i]; if (q && q.c === m.cap.c && q.t === 'Pr' && g.dist(i, sq) <= 3) return false; } return true; });
      },
      checkWin: function (V, st) {   /* The Finisher: a side whose leader stands alone at the start of the other side's turn loses (enemy has it too, 3:05) */
        var cnt = { w: [0, 0], b: [0, 0] };
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || !cnt[p.c] || V.def(p.t).blocker) continue; cnt[p.c][V.def(p.t).royal ? 1 : 0]++; }
        var me = st.turn, op = me === 'w' ? 'b' : 'w', mine = me === 'w' ? has('finisher') : true;
        if (mine && cnt[op][1] && !cnt[op][0] && cnt[me][0] && cnt[me][1]) return { w: me, why: 'The Finisher: the enemy leader stands alone' };
        return null;
      },
      setup: function (ctx) {
        base().setup(ctx);
        var P = ctx.params, V = ctx.V, st = ctx.state; close();
        if (!RUN) newRun(P);
        var bi = Math.min(RUN.row, P.battles.length - 1), bt = P.battles[bi];
        st.b = CM.spec.parseSetup(V, (RUN.phase === 'battle' ? bt.fen : '2[gn]3/6/6/6/6/6') + '/6/6');
        RUN.army.forEach(function (u) { var i = V.geo.parse(u.sq); if (i >= 0) st.b[i] = V.piece(u.t, 'w', V.def(u.t).pawn && u.sq.charAt(1) !== '2' ? { m: 1 } : {}); });
        st.x = Object.assign({}, st.x, { mirrorUsed: 0 });
        RUN.drawn = false; RUN.offerPly = -99;
        if (RUN.phase === 'battle') {
          if (bt.boss) Object.assign(ctx.opponent, { name: 'Ouroboros Queen', avatar: A + 'queen_face.png', tagline: 'Final boss.' }); else Object.assign(ctx.opponent, { name: bt.name, avatar: null });
          if (RUN.sigilFor !== RUN.row) {
            RUN.sigilFor = RUN.row;
            if (has('sigil')) RUN.rewinds++;
            if (has('suitcase')) { var item = rnd(3); if (item === 0) { RUN.rewinds++; RUN.item = 'a rewind'; } else if (item === 1) { RUN.gold += 50; RUN.item = '50 gold'; } else { var e = SLOTS.map(function (s) { return V.geo.parse(s); }).filter(function (i) { return i >= 0 && !st.b[i]; })[0]; if (e != null) { st.b[e] = V.piece('Mp', 'w'); RUN.item = 'a Marching Pawn for this battle'; } } }
          }
        }
        rewindGuard(ctx, true);
      },
      onStart: function (ctx) {
        if (RUN.phase === 'draft') return draft(ctx);
        if (RUN.phase === 'reward') return reward(ctx);
        if (RUN.phase === 'map') return map(ctx);
        var bt = ctx.params.battles[Math.min(RUN.row, ctx.params.battles.length - 1)];
        ctx.toast(bt.name + (RUN.item ? ' · Magic Suitcase: ' + RUN.item : '') + (RUN.rewinds ? ' · ' + RUN.rewinds + ' rewinds' : ''), 3200); RUN.item = null;
      },
      beforeMove: function () { return !(RUN && RUN.phase !== 'battle'); },
      afterMove: function (ctx, m, info) {
        if (m && m.reap) { ctx.fx({ type: 'flash', color: '#9b5cff', opacity: 0.5, at: m.capSq, duration_ms: 300 }); }
        var cap = info && info.captured;
        if (cap && cap.c === ctx.human && cap.t === 'Mq' && !(ctx.state.x || {}).mirrorUsed) {   /* Mirror Queen returns once per combat (inferred) */
          var home = RUN.army.filter(function (u) { return u.t === 'Mq'; })[0], hi = home ? ctx.sq(home.sq) : -1;
          if (hi >= 0 && !ctx.at(hi)) { ctx.spawn('Mq', ctx.human, hi); ctx.setX('mirrorUsed', 1); ctx.toast('The Mirror Queen returns!', 1600); ctx.refresh(); }
        }
        if (cap && cap.t === 'Gq' && cap.c === ctx.human) { ctx.fx({ type: 'particles', kind: 'glitch', at: info.to, count: 18 }); ctx.toast('Your Glass Queen shattered: unless you rewind, she never returns.', 2600); }
        if (info && info.by === 'player' && !ctx.over && has('angel') && RUN.rewinds >= 3) {   /* Guardian Angel */
          var k0 = ctx.V.royals(ctx.state, ctx.human)[0];
          if (k0 != null && ctx.V.attacked(ctx.state, k0, ctx.bot)) { RUN.angel = true; RUN.rewinds -= 3; ctx.toast('Guardian Angel: three rewinds spent to go back in time.', 2200); var back = function () { if (ctx.game.busy && !ctx.over) { ctx.after(120, back); return; } ctx.game.undo(); }; ctx.after(60, back); return null; }
        }
        if (info && info.by === 'bot' && !ctx.over) {
          var k = ctx.V.royals(ctx.state, ctx.human)[0];
          if (has('bell') && k != null && ctx.V.attacked(ctx.state, k, ctx.bot)) { ctx.toast('Alarm Bell: your King is in danger!', 1800); ctx.sound('notify'); }
          /* AI draw offers (7:03, 9:46, 12:42): the losing AI offers a draw now and then */
          if (ctx.ply >= 6 && ctx.ply - RUN.offerPly >= 8 && balance(ctx) <= -150 && Math.random() < 0.45) { RUN.offerPly = ctx.ply; drawOffer(ctx); }
        }
        return null;
      },
      onUndo: function (ctx) { if (RUN.angel) { RUN.angel = false; } else RUN.rewinds = Math.max(0, RUN.rewinds - 1); },
      onGameOver: function (ctx, over) {
        if (!RUN || RUN.phase !== 'battle' || RUN.angel) return;   /* a pending Guardian Angel rewind undoes this ending */
        var P = ctx.params, bt = P.battles[Math.min(RUN.row, P.battles.length - 1)];
        var keepGlass = ctx.state.b.some(function (p) { return p && p.c === ctx.human && p.t === 'Gq'; });
        if (over.w === ctx.human || over.w === 'd') {
          if (!keepGlass) RUN.army = RUN.army.filter(function (u) { return u.t !== 'Gq'; });
          if (over.w === 'd') { ctx.after(1400, function () { next(ctx); }); return; }
          RUN.gold += bt.reward || 0; RUN.phase = 'reward';
          if (bt.boss) { ctx.toast('VICTORY! The Kingdom of Thessalonia is yours. New game starts a new run.', 4200); RUN = null; return; }
          ctx.fx({ type: 'text', text: '+' + bt.reward + ' gold', at: 'board', color: '#ffd75a', size: 34, duration_ms: 1300 });
          ctx.after(1500, function () { reward(ctx); });
        } else { ctx.toast('Your King fell: the run is over. New game starts a new run.', 3600); RUN = null; }
      },
      onExit: function (ctx) { close(); rewindGuard(ctx, false); base().onExit(ctx); },
      decorate: function (ctx, sq, p) { if (p && p.c === ctx.human && /^(Mq|Qm|Bk)$/.test(p.t)) return { badge: '\u2605' }; return base().decorate(ctx, sq, p); },
      status: function (ctx) {
        if (!RUN) return 'New game starts a new run.';
        var rel = RUN.relics.map(function (r) { return RELIC[r].name; }).join(', ');
        if (RUN.phase !== 'battle') return 'Kingdom of Thessalonia · ' + RUN.gold + ' gold · relics: ' + rel;
        var bt = ctx.params.battles[Math.min(RUN.row, ctx.params.battles.length - 1)];
        return bt.name + ' · ' + RUN.gold + ' gold · ' + RUN.rewinds + ' rewinds · relics: ' + rel;
      },
      qa: function () { return RUN; }
    };
    function twoSteps(V, st, i, p, out, DIRS) {   /* Viking (orthogonal) / Berserker (any direction): one or two steps, a kill ends the move */
      var b = st.b, g = V.geo, seen = {};
      DIRS.forEach(function (d) { var a = g.step(i, d[0], d[1]); if (a < 0) return; var qa = b[a];
        if (qa) { if (qa.c !== p.c && qa.c !== 'n' && !seen[a]) { seen[a] = 1; out.push({ f: i, t: a, p: p.t, c: p.c, cap: qa }); } return; }
        if (!seen[a]) { seen[a] = 1; out.push({ f: i, t: a, p: p.t, c: p.c, cap: null }); }
        DIRS.forEach(function (e) { var c2 = g.step(a, e[0], e[1]); if (c2 < 0 || c2 === i || seen[c2]) return; var qc = b[c2];
          if (!qc) { seen[c2] = 1; out.push({ f: i, t: c2, p: p.t, c: p.c, cap: null }); } else if (qc.c !== p.c && qc.c !== 'n') { seen[c2] = 1; out.push({ f: i, t: c2, p: p.t, c: p.c, cap: qc }); } });
      });
    }
  })(),
  source: { research: 'research/modes/rf2HSTXTehE.json', confidence: 'medium', notes: 'Armies follow the transcript where it names them; Pegasus Rider / Witch Queen / Griffin have no art and are replaced (knight, Ouroboros Queen, Reaper). Inferred: Mirror Queen / Quartermaster / Berserker effects (only their names are in the video), unit costs other than the Reaper, battle rewards, the Shop node, Magic Suitcase items, when the AI offers a draw. Fool icon: cut from the 1:49 recruit card frame (art-g6c 2026-11-25).' }
});
