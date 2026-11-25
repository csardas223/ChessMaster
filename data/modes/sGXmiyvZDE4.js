/* Can I BEAT Petrified Pawns?  A real-time dungeon RPG with chess-piece units: escort your King to the end of each level
   past pale chess-piece monsters; units attack with their chess pattern and have health bars, mana from boxes and vases
   pays for healing spells, chests hold weapons, potions, keys and gold, and a new piece joins after each level.
   Sources: research/modes/sGXmiyvZDE4.json, the video's own transcript (analyze_video 2026-11-25, 6340 words) and frames
   0:21 / 3:12 / 7:51 (research/frames/video_thumbs/sGXmiyvZDE4_frame_*).
   art-g6b (2026-11-25): in the video you command the DARK pieces (green health bars) and the monsters are the PALE pieces (red
   bars), so w = the dark King/Rook/Knight cut-outs, b = the pale pawn/knight/bishop/rook/queen; the floor squares are two of the
   video's stone floor tiles warped top-down and walls are its stone-brick wall. Inferred: your Pawn and promotion Queen/Bishop
   (no frame shows a dark one) are the pale cuts re-shaded dark.
   cm-ps pass 2 (2026-11-25): the game itself.
   - Real time (the g5_realtime / Knightmare trick on the turn-based SpecGame): you may move ANY of your units at any moment
     (left click / tap selects, right click or a second tap moves: 0:12-0:18 "select a chess piece with left click ... move
     with right click"); the turn comes straight back to you. A combat round runs every 1.4 s and awake monsters move on their
     own about every 0.9 s.
   - Attack by standing close (0:58, 1:08 "as long as I don't stand an L-shaped distance away"): every unit damages the
     lowest-health enemy inside its attack pattern each round by its Strength (+/-15%). Patterns: King 1 tile any way (7:51 info
     box), Rook orthogonal and Bishop diagonal up to 2 tiles ("attacks close by units in the same direction", 2:29), Queen both,
     Knight the L, Pawn the 4 diagonal neighbours ("can only attack diagonally", 2:43). Moving onto an enemy is only allowed as
     a finishing blow when its health is at or below your Strength ("we can actually capture it because it's so low", 6:17).
   - Health: King 2610 HP / +374 Strength and Pawn 1300 HP / +217 (info boxes at 7:51 / 3:12), Rook 1862 (3:36), enemy queen
     2000 (7:47), cannon 600 HP / 400 Strength firing every second round (4:51), crossbow 1000 HP / 200 Strength, shoots from
     range, sets the tile on fire and backs away from close opponents (9:41-9:51). The other numbers are inferred.
   - Mana (blue bar): crates +300 (0:34), vases +150 (inferred). Spells 1/2/3 = Lesser Heal (+800, 0:49), Greater Heal (+1870,
     3:36), Bouncing Orb (orb on a tile heals 1000 and jumps to another tile, 12:43); costs and cooldowns in YOUR moves are
     inferred ("they replenish ... every six moves", 5:59). Gold bags (+35) and chests (+65 / +83) buy more spells in the Shop
     (19:42-21:31): Chain Heal (bounces to up to 5 units, ~700), Diagonal Heal (units diagonal to the tile +1200), Holy Nova
     (detonates two moves later, +1000 to every unit within 2 tiles), Lightning Shield (10 moves: healing the unit strikes the
     enemies next to it).
   - Inventory: the video's chest loot per level (1:30 dull blade + key, 6:45 bishop's save + potion of stamina, 10:49 hammer +
     speed potion, 13:51 simple axe + lesser health potion, 15:57 primal hatchet + strength + holy potion); weapons and
     stamina/strength potions are permanent, health potions regenerate after 27 of your moves (16:20).
   - Levels = the four from the video: The Guarded Entrance (2 knights, chest with the key, locked door), the platforms level
     (pawns, bishops, rooks, knights, the queen, a cannon, exit door), The Quarry (bridge, crossbows, the enemy king: "we just
     eliminated the king", 16:54) and The Trap (spikes that pop up from holes, a lever that releases caged waves of 2, 7, then
     a horde of pawns + rooks + bishops; the queen and king hidden at the back; 17:42-21:22). Layouts are inferred from the
     narration; the video says there are 18 levels but only shows these four.
   - Before levels 2-4: "Pick a chess piece" (2:22): Bishop (armor +37 for all your units, 9:26), Rook (mana discount, every
     spell costs 100 less, 2:32), Pawn (Fortunate: +2% chance per pawn to critically heal x1.5, 2:47); place it on a glowing
     start tile. Your units, gold, mana, spells and inventory carry over; if the King dies the level restarts as it began.
   - Art pass 2 (tools/pp2_art.py): crate + objective marker (0:21), chest, vase, cannon, spell icons, inventory icons and gold
     icon (frames 0:21 / 7:51); monster King = the dark King cut re-shaded pale (inferred). No frame in the repo shows the
     crossbow, lever, door or key up close: crossbow = the pale bishop cut with an XB badge, door = the wall tile with the
     game's yellow objective marker, lever = a lettered token (all inferred). */
CM.mode({
  id: 'sGXmiyvZDE4',
  title: 'Can I BEAT Petrified Pawns?',
  name: 'Petrified Pawns',
  category: 'Variants & Games',
  description: 'Real time: select any of your dark units and move it whenever you like (tap / left click selects, a second tap or right click moves). Units hit every enemy-in-pattern each round; red health bars are monsters. Break crates and vases for mana, cast heals from the spell bar, open chests for weapons, potions and keys, and escort your King to the exit. If the King dies, the level restarts.',
  how_to_win: 'Escort your King out of all four dungeon levels from the video.',
  player_side: 'white',
  player: { name: 'You', rating: null, avatar: 'assets/modes/sGXmiyvZDE4/wK.png' },
  opponent: { name: 'Dungeon monsters', rating: null, avatar: 'assets/modes/sGXmiyvZDE4/bN.png', tagline: 'Pale chess-piece monsters with red health bars.' },
  board: { files: 10, ranks: 16, light: '#8a8a6a', dark: '#3a3d4a', background: '#16161c', viewport: { files: 10, ranks: 11, mobile: { files: 9, ranks: 10 }, follow: 'player_king' }, texture: { light: 'assets/modes/sGXmiyvZDE4/floor_light.jpg', dark: 'assets/modes/sGXmiyvZDE4/floor_dark.jpg' } },
  pieces: {
    '#': { overlay: null, img: 'assets/modes/sGXmiyvZDE4/wall.jpg' },
    K: { img: { w: 'assets/modes/sGXmiyvZDE4/wK.png' } },
    Q: { img: { w: 'assets/modes/sGXmiyvZDE4/wQ.png', b: 'assets/modes/sGXmiyvZDE4/bQ.png' } },
    R: { img: { w: 'assets/modes/sGXmiyvZDE4/wR.png', b: 'assets/modes/sGXmiyvZDE4/bR.png' } },
    B: { img: { w: 'assets/modes/sGXmiyvZDE4/wB.png', b: 'assets/modes/sGXmiyvZDE4/bB.png' } },
    N: { img: { w: 'assets/modes/sGXmiyvZDE4/wN.png', b: 'assets/modes/sGXmiyvZDE4/bN.png' } },
    P: { name: 'Pawn', moves: 'fmWsmWifmnDcF', value: 100, promote: true, img: { w: 'assets/modes/sGXmiyvZDE4/wP.png', b: 'assets/modes/sGXmiyvZDE4/bP.png' } },
    Ek: { name: 'King', moves: 'K', value: 0, img: 'assets/modes/sGXmiyvZDE4/bK.png' },
    Cn: { name: 'Cannon', moves: '', value: 0, img: 'assets/modes/sGXmiyvZDE4/cannon.png' },
    Xb: { name: 'Crossbow', moves: 'mK', value: 0, img: 'assets/modes/sGXmiyvZDE4/bB.png' },
    Bx: { name: 'Crate', moves: '', value: 0, img: 'assets/modes/sGXmiyvZDE4/crate.png', neutralGlow: false },
    Vs: { name: 'Vase', moves: '', value: 0, img: 'assets/modes/sGXmiyvZDE4/vase.png', neutralGlow: false },
    Ch: { name: 'Chest', moves: '', value: 0, img: 'assets/modes/sGXmiyvZDE4/chest.png', neutralGlow: false },
    Gd: { name: 'Gold', moves: '', value: 0, img: 'assets/modes/sGXmiyvZDE4/gold.png', neutralGlow: false },
    Or: { name: 'Healing orb', moves: '', value: 0, img: 'assets/modes/sGXmiyvZDE4/sp_orb.png', neutralGlow: false, cls: 'pp-orb' },
    Lv: { name: 'Lever', moves: '', value: 0, badge: 'Lvr' },
    Dr: { name: 'Locked door', moves: '', value: 0, img: 'assets/modes/sGXmiyvZDE4/wall.jpg', neutralGlow: false },
    Ex: { name: 'Exit', moves: '', value: 0, img: 'assets/modes/sGXmiyvZDE4/marker.png', neutralGlow: false, cls: 'pp-exit' }
  },
  /* the real levels are built by hooks.setup from params.levels; this FEN only gives the engine a royal King to track */
  setup: { fen: '10/10/10/10/10/10/10/10/10/10/10/10/10/10/10/4K5' },
  rules: { check: 'none', castling: false, enPassant: false, drawPlies: 99999, stalemate: 'draw', promotion: { choices: ['Q', 'N', 'R', 'B'] }, win: [] },
  bot: { engine: 'search', depth: 1, time_ms: 200 },
  params: {
    round_ms: 1400, move_ms: [650, 1150], wake: 4,
    /* map legend: # wall, . floor, K your King, s start tile (your other units / the new piece), p n b r q k monsters (k = king),
       C cannon, X crossbow, x crate, v vase, c chest (loot in order), g gold, D locked door (needs the key), E exit,
       L lever, ^ spike hole, w cage (released by the lever) */
    levels: [
      { name: 'The Guarded Entrance', goal: 'exit', intro: 'Break the crate for mana, beat the two knights, take the key from the chest and open the door.',
        map: ['##########', '####D#####', '###....###', '##.v..v..#', '#....n...#', '#.c......#', '#...v..n.#', '###.....##', '####...###', '###..x..##', '###.....##', '####.K.###', '##########', '##########', '##########', '##########'],
        chests: [{ items: ['blade', 'key'], gold: 0 }] },
      { name: 'The Platforms', goal: 'exit', intro: 'Pawns, bishops, rooks, knights, the queen and a cannon that fires every second round. Walk the King out of the exit.',
        map: ['#####E####', '###.....##', '#q..#..g.#', '#...#..C.#', '#.b.#....#', '#...v..p.#', '##.#####.#', '#p.....r.#', '#.v.b..p.#', '#.p..#.c.#', '#....#..g#', '##.p.....#', '#..v.n..v#', '#........#', '#.s.K.s..#', '##########'],
        chests: [{ items: ['save', 'stamina'], gold: 65 }] },
      { name: 'The Quarry', goal: 'king', intro: 'Crossbows shoot from range and set tiles on fire. Cross the bridge and take down the enemy king.',
        map: ['####k#####', '##.r.b.X##', '#p.......#', '#..c..v.p#', '###....###', '#####.####', '#####.####', '#X..#.#..#', '#.p.....X#', '#..b..p..#', '#.v..c...#', '###.....##', '#g.......#', '#..v...v.#', '#.s.K.s..#', '##########'],
        chests: [{ items: ['hatchet', 'strength', 'holy'], gold: 83 }, { items: ['hammer', 'speed', 'lpot'], gold: 65 }] },
      { name: 'The Trap', goal: 'king', intro: 'Spikes pop out of the holes. Step on the lever to open the cages one wave at a time; the queen and king hide at the back.',
        map: ['###q.k.###', '###.r.b.##', '##^^^^^^^#', '#ww....ww#', '#w..^^..w#', '#..p..p..#', '#^.^..^.^#', '#....L...#', '#w.^..^.w#', '#ww....ww#', '#..v..v..#', '#.^....^.#', '#...g....#', '#.v....v.#', '#.s.K.s..#', '##########'],
        chests: [], waves: [['P', 'P'], ['P', 'P', 'P', 'P', 'P', 'P', 'P'], ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'R', 'R', 'R', 'B', 'B']] }
    ]
  },
  hooks: (function () {
    var UNIT = { K: [2610, 374], Q: [2000, 320], R: [1862, 300], B: [1300, 230], N: [1400, 240], P: [1300, 217] };
    var MON = { P: [700, 120], N: [900, 150], B: [900, 160], R: [1700, 240], Q: [2000, 300], Ek: [2400, 300], Cn: [600, 400], Xb: [1000, 200] };
    var CH = { p: 'P', n: 'N', b: 'B', r: 'R', q: 'Q', k: 'Ek', C: 'Cn', X: 'Xb' }, PROP = { x: 'Bx', v: 'Vs', g: 'Gd', D: 'Dr', E: 'Ex', L: 'Lv' };
    var MAXM = 1000, A = 'assets/modes/sGXmiyvZDE4/';
    var SP = {
      lesser: { name: 'Lesser Heal', cost: 200, cd: 6, icon: 'sp_lesser.png', target: 'unit', text: 'Instantly heals a friendly unit for 800 health.' },
      greater: { name: 'Greater Heal', cost: 400, cd: 6, icon: 'sp_greater.png', target: 'unit', text: 'Heals a friendly unit for 1870 health.' },
      orb: { name: 'Bouncing Orb', cost: 300, cd: 8, icon: 'sp_orb.png', target: 'empty', text: 'Places a healing orb: a unit touching it heals 1000, then the orb relocates.' },
      chain: { name: 'Chain Heal', cost: 300, cd: 8, price: 150, target: 'unit', text: 'Heal that bounces to nearby units up to five times for 700.' },
      diag: { name: 'Diagonal Heal', cost: 300, cd: 6, price: 150, target: 'tile', text: 'Heals units standing diagonal to the chosen tile for 1200.' },
      nova: { name: 'Holy Nova', cost: 400, cd: 8, price: 200, target: 'tile', text: 'Detonates two moves later: every unit within 2 tiles heals 1000.' },
      shield: { name: 'Lightning Shield', cost: 300, cd: 10, price: 200, target: 'unit', text: '10 moves: healing this unit strikes nearby enemies for 300.' }
    };
    var IT = {
      key: { name: 'Key', text: 'Opens the locked door.' },
      blade: { name: 'Dull Blade', icon: 'it_blade.png', text: '+60 Strength (equip on a unit).', str: 60 },
      save: { name: "Bishop's Save", text: '+60 Strength, +800 Health.', str: 60, max: 800 },
      hammer: { name: 'Hammer', text: '+80 Strength.', str: 80 },
      axe: { name: 'Simple Axe', text: '+70 Strength.', str: 70 },
      hatchet: { name: 'Primal Hatchet', icon: 'it_staff.png', text: '+46 Strength, +700 Health.', str: 46, max: 700 },
      stamina: { name: 'Potion of Stamina', text: '+400 maximum health.', max: 400 },
      strength: { name: 'Strength Potion', text: '+150 Strength.', str: 150 },
      speed: { name: 'Speed Potion', text: '+1 tile: the unit may also step 2 tiles in a straight line.', spd: 1 },
      lpot: { name: 'Lesser Health Potion', icon: 'it_potion.png', text: 'Heals 900. Regenerates after 27 moves.', heal: 900, regen: 27 },
      holy: { name: 'Holy Potion', text: 'Fully heals a unit. Regenerates after 27 moves.', full: 1, regen: 27 }
    };
    var PICK = [
      { t: 'B', tr: 'armor', name: 'Bishop', text: 'Moves and attacks diagonally. Armor: all your units take 37 less damage per hit.' },
      { t: 'R', tr: 'disc', name: 'Rook', text: 'Moves and attacks orthogonally. Mana discount: every spell costs 100 less.' },
      { t: 'P', tr: 'fort', name: 'Pawn', text: 'Moves forward and side to side, double first move, attacks diagonally. Fortunate: +2% critical heals.' }
    ];
    var NAME = { K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight', P: 'Pawn', Ek: 'King', Cn: 'Cannon', Xb: 'Crossbow' };
    var DESC = { K: 'Can move and attack 1 tile in every direction.', Q: 'Moves like a queen, attacks 2 tiles in every line.', R: 'Moves forward and backwards as well as side to side. Attacks close by units in the same direction.',
      B: 'Moves and attacks diagonally.', N: 'Moves and attacks in an L.', P: 'Moves forward as well as side to side. The first move has double range. Can only attack diagonally.',
      Ek: 'Enemy king: 1 tile in every direction.', Cn: 'Fires a cannonball every second round.', Xb: 'Shoots arrows from range and sets the tile on fire. Moves away from opponents that are too close.' };
    var run = { k: 0, roster: null, keep: null, snap: null, nextRound: 0, nextMove: 0, rounds: 0, fire: {}, arm: null, rr: 0 };
    var ORTH = [[1, 0], [-1, 0], [0, 1], [0, -1]], DIAG = [[1, 1], [1, -1], [-1, 1], [-1, -1]], KN = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];

    function L(ctx) { return ctx.params.levels; }
    function lv(ctx) { return L(ctx)[run.k] || L(ctx)[0]; }
    function isUnit(p) { return p && (p.c === 'w' || p.c === 'b') && p.max; }
    function king(st) { for (var i = 0; i < st.b.length; i++) if (st.b[i] && st.b[i].c === 'w' && st.b[i].t === 'K') return i; return -1; }
    function rays(g, st, i, dirs, range) {
      var out = []; dirs.forEach(function (d) { var j = i; for (var k = 0; k < range; k++) { j = g.step(j, d[0], d[1]); if (j < 0) break; out.push(j); if (st.b[j]) break; } }); return out;
    }
    function atk(g, st, i) {   /* the squares a unit damages (its chess pattern, close range) */
      var p = st.b[i], t = p.t;
      if (t === 'K' || t === 'Ek') return rays(g, st, i, ORTH.concat(DIAG), 1);
      if (t === 'P') return rays(g, st, i, DIAG, 1);
      if (t === 'N') return KN.map(function (d) { return g.step(i, d[0], d[1]); }).filter(function (j) { return j >= 0; });
      if (t === 'B') return rays(g, st, i, DIAG, 2);
      if (t === 'R') return rays(g, st, i, ORTH, 2);
      if (t === 'Q') return rays(g, st, i, ORTH.concat(DIAG), 2);
      return [];
    }
    function costOf(x, id) { return Math.max(100, SP[id].cost - 100 * (x.disc || 0)); }

    /* ---------------- level building ---------------- */
    function stats(t, c, extra) { var s = (c === 'w' ? UNIT : MON)[t] || [1000, 150]; return Object.assign({ hp: s[0], max: s[0], str: s[1] }, t === 'Xb' ? { badge: 'XB' } : {}, extra || {}); }
    function build(ctx) {
      var V = ctx.V, g = V.geo, l = lv(ctx), b = new Array(g.size).fill(null), starts = [], k0 = -1, chestN = 0, spikes = [], cages = [], lever = -1;
      for (var r = 0; r < g.ranks; r++) for (var c = 0; c < g.files; c++) {
        var ch = (l.map[r] || '')[c] || '#', i = g.idx(c, r);
        if (ch === '#') b[i] = V.piece('#', 'n');
        else if (ch === 'w') { b[i] = V.piece('#', 'n'); cages.push(i); }
        else if (ch === '^') spikes.push(i);
        else if (ch === 'K') k0 = i;
        else if (ch === 's') starts.push(i);
        else if (ch === 'c') b[i] = V.piece('Ch', 'n', { loot: chestN++ });
        else if (CH[ch]) b[i] = V.piece(CH[ch], 'b', stats(CH[ch], 'b'));
        else if (PROP[ch]) { b[i] = V.piece(PROP[ch], 'n'); if (ch === 'L') lever = i; }
      }
      /* your army: the King + the units that survived the earlier levels (healed between levels, inferred) */
      var ros = run.roster || [{ t: 'K', max: UNIT.K[0], str: UNIT.K[1] }], free = starts.slice();
      ros.forEach(function (u) {
        var at = u.t === 'K' ? k0 : free.shift(); if (at == null || at < 0) return;
        b[at] = V.piece(u.t, 'w', { hp: u.max, max: u.max, str: u.str, tr: u.tr, spd: u.spd, m: 1 });
      });
      return { b: b, starts: free, spikes: spikes, cages: cages, lever: lever };
    }

    /* ---------------- pure rule hooks ---------------- */
    var api = {
      moves: function (V, st, out) {   /* Speed potion: +1 tile, a straight 2-step through an empty square */
        if (st.turn !== 'w') return out; var g = V.geo, add = [];
        for (var i = 0; i < st.b.length; i++) { var p = st.b[i]; if (!p || p.c !== 'w' || !p.spd) continue;
          ORTH.concat(DIAG).forEach(function (d) { var a = g.step(i, d[0], d[1]); if (a < 0 || st.b[a]) return; var t = g.step(a, d[0], d[1]); if (t < 0 || st.b[t]) return;
            if (!out.some(function (m) { return m.f === i && m.t === t; })) add.push({ f: i, t: t, p: p.t, c: 'w', cap: null }); }); }
        return add.length ? out.concat(add) : out;
      },
      filterMoves: function (V, st, legal) {
        var x = st.x || {};
        return legal.filter(function (m) {
          var q = m.cap || st.b[m.t], mv = st.b[m.f]; if (!q || !mv) return true;
          if (q.c === 'b') return q.hp != null && mv.str != null && q.hp <= mv.str;   /* finishing blow only */
          if (q.t === 'Dr') return mv.t === 'K' && (x.inv || []).some(function (it) { return it.id === 'key'; });
          if (q.t === 'Ex') return mv.t === 'K';
          return true;
        });
      },
      onMake: function (V, st, m, n) {
        if (st.turn !== 'w') return;
        var x = n.x = Object.assign({}, st.x), q = m.cap, me = st.b[m.f], ev = [];
        x.mv = (x.mv || 0) + 1;
        var landed = n.b[m.t];
        if (landed && me && landed.max == null && me.max) n.b[m.t] = Object.assign({}, landed, { hp: me.hp, max: me.max, str: me.str, tr: me.tr, spd: me.spd });   /* promotion keeps the unit's stats */
        if (q) {
          if (q.c === 'b') { x.kills = (x.kills || 0) + 1; ev.push('kill:' + q.t); }
          else if (q.t === 'Bx' || q.t === 'Vs') { var gain = q.t === 'Bx' ? 300 : 150; x.mana = Math.min(MAXM, (x.mana || 0) + gain); ev.push('mana:' + gain); }
          else if (q.t === 'Gd') { x.gold = (x.gold || 0) + 35; ev.push('gold:35'); }
          else if (q.t === 'Ch') { var lo = (x.loot || [])[q.loot] || { items: [], gold: 0 }; x.gold = (x.gold || 0) + (lo.gold || 0);
            x.inv = (x.inv || []).concat(lo.items.map(function (id) { return { id: id }; })); ev.push('chest:' + q.loot); }
          else if (q.t === 'Or') { var u = n.b[m.t]; if (u && u.max) n.b[m.t] = Object.assign({}, u, { hp: Math.min(u.max, u.hp + 1000) }); ev.push('orb'); }
          else if (q.t === 'Lv') ev.push('lever');
          else if (q.t === 'Dr') { x.won = 1; x.inv = (x.inv || []).filter(function (it) { return it.id !== 'key'; }); }
          else if (q.t === 'Ex') x.won = 1;
        }
        x.ev = ev;
      },
      checkWin: function (V, st) {
        var x = st.x || {}; if (king(st) < 0) return { w: 'b', why: 'your King fell: the level restarts' };
        if (x.won) return { w: 'w', why: 'the King escaped the level' };
        if (x.goal === 'king' && !st.b.some(function (p) { return p && p.t === 'Ek'; })) return { w: 'w', why: 'the enemy king fell' };
        return null;
      },
      evaluate: function () { return 0; }
    };

    /* ---------------- game side ---------------- */
    function css() {
      if (document.getElementById('pp-css')) return; var s = document.createElement('style'); s.id = 'pp-css';
      s.textContent =
        '.pp-hp{position:absolute;left:14%;right:14%;top:3%;height:6%;min-height:3px;background:rgba(0,0,0,.65);border-radius:2px;pointer-events:none;z-index:4}' +
        '.pp-hp i{display:block;height:100%;border-radius:2px;transition:width .2s ease-out}.pp-hp--w i{background:#46c84a}.pp-hp--b i{background:#d6383a}' +
        '.pp-fire{position:absolute;inset:8%;border-radius:40%;background:radial-gradient(circle at 50% 70%,rgba(255,206,64,.85),rgba(232,92,20,.6) 45%,rgba(120,20,0,0) 72%);pointer-events:none;z-index:2}' +
        '.pp-spk{position:absolute;inset:0;pointer-events:none;z-index:2;background:radial-gradient(circle,#15151b 0 12%,transparent 13%) 0 0/50% 50%}' +
        '.pp-spk.up{background:conic-gradient(from 150deg at 25% 15%,#c8ccd2 0 60deg,transparent 0) 0 0/50% 50%,linear-gradient(rgba(90,20,30,.35),rgba(90,20,30,.35))}' +
        '.pp-nova{position:absolute;inset:6%;border:3px solid #7cf08e;border-radius:50%;box-shadow:0 0 10px #7cf08e;pointer-events:none;z-index:3;color:#d8ffd9;font:700 14px/1 system-ui;display:flex;align-items:center;justify-content:center}' +
        '.pp-aim{box-shadow:inset 0 0 0 3px #e8d050}.pp-start{box-shadow:inset 0 0 0 3px #e8d050;background-image:linear-gradient(rgba(232,208,80,.25),rgba(232,208,80,.25))}' +
        '.pp-door-mk{position:absolute;left:30%;top:-10%;width:40%;pointer-events:none;z-index:4}' +
        '.pp-exit,.pp-orb{opacity:.92}' +
        '#pp-hud{margin:6px auto 0;max-width:560px;display:flex;flex-direction:column;gap:6px;color:#e9e6df;font:13px/1.3 system-ui,sans-serif}' +
        '#pp-hud .row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}' +
        '#pp-hud .mana{flex:1;min-width:120px;height:14px;background:#14162a;border:1px solid #2b3160;border-radius:3px;position:relative;overflow:hidden}' +
        '#pp-hud .mana i{position:absolute;left:0;top:0;bottom:0;background:#2f53e0;transition:width .2s ease-out}#pp-hud .mana b{position:relative;font-size:11px;padding-left:6px;color:#fff}' +
        '#pp-hud .gold{display:flex;align-items:center;gap:3px;font-weight:700}#pp-hud .gold img{width:20px;height:20px}' +
        '#pp-hud .sp,#pp-hud .it{position:relative;width:44px;height:44px;padding:0;border:2px solid #5a4a2e;border-radius:4px;background:#2a2620;color:#fff;cursor:pointer;overflow:hidden;font:600 9px/1.1 system-ui}' +
        '#pp-hud .sp img,#pp-hud .it img{width:100%;height:100%;object-fit:cover;display:block}' +
        '#pp-hud .sp.off img,#pp-hud .it.off img{filter:grayscale(1) sepia(1) saturate(6) hue-rotate(-40deg) brightness(.55)}#pp-hud .sp.off,#pp-hud .it.off{color:#c88}' +
        '#pp-hud .sp.on,#pp-hud .it.on{border-color:#e8d050;box-shadow:0 0 0 2px #e8d050}' +
        '#pp-hud .sp small,#pp-hud .it small{position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);font-size:9px;text-align:center}' +
        '#pp-hud .sp .n{position:absolute;left:2px;top:1px;font-size:10px;text-shadow:0 1px 2px #000}' +
        '#pp-hud .btn{min-height:32px}' +
        '#pp-hud .info{background:#2b2924;border-radius:4px;padding:6px 8px;font-size:12px}#pp-hud .info b{font-size:13px}' +
        '#pp-pick{position:absolute;inset:0;z-index:30;background:rgba(18,18,24,.94);padding:12px;display:flex;flex-direction:column;gap:8px;justify-content:center;color:#fff;font:14px/1.3 system-ui,sans-serif}' +
        '#pp-pick button{display:flex;gap:10px;align-items:center;text-align:left;padding:8px;background:#34302a;border:1px solid #5a4a2e;border-radius:6px;color:#fff;cursor:pointer}' +
        '#pp-pick button img{width:46px;height:46px;object-fit:contain;flex:none}#pp-pick button:disabled{opacity:.45;cursor:default}';
      document.head.appendChild(s);
    }
    function closeEl(id) { var e = document.getElementById(id); if (e) e.remove(); }
    function overlay(ctx, title, items, cb, closeable) {
      var wrap = document.getElementById('board-wrap'); if (!wrap) { if (items[0]) cb(items[0]); return; } css(); closeEl('pp-pick');
      var el = document.createElement('div'); el.id = 'pp-pick';
      el.innerHTML = '<b style="font-size:17px;text-align:center">' + title + '</b>' + items.map(function (it, k) {
        return '<button type="button" data-k="' + k + '"' + (it.disabled ? ' disabled' : '') + '>' + (it.img ? '<img alt="" src="' + it.img + '">' : '') + '<span><b>' + CM.util.esc(it.name) + '</b><br><small>' + CM.util.esc(it.text) + '</small></span></button>';
      }).join('') + (closeable ? '<button type="button" data-x="1" style="justify-content:center">Close</button>' : '');
      el.onclick = function (e) { var b = e.target.closest('button'); if (!b || b.disabled) return; el.remove(); if (b.dataset.x) { cb(null); return; } cb(items[+b.dataset.k]); };
      wrap.appendChild(el);
    }
    function paused(ctx) { return !!(document.getElementById('pp-pick') || run.arm); }
    function hpFx(ctx, i, txt, col) { ctx.fx({ type: 'text', text: txt, at: ctx.name(i), color: col, size: 16, duration_ms: 750 }); }
    function heal(ctx, i, amt) {
      var p = ctx.at(i); if (!p || p.c !== 'w' || !p.max) return;
      var fort = ctx.pieces(function (q) { return q.c === 'w' && q.tr === 'fort'; }).length, crit = fort && Math.random() < 0.02 * fort;
      if (crit) amt = Math.round(amt * 1.5);
      ctx.transform(i, { props: { hp: Math.min(p.max, p.hp + amt) } }); hpFx(ctx, i, (crit ? 'CRIT +' : '+') + amt, '#7cf08e');
      if (p.sh && p.sh > (ctx.state.x.mv || 0)) {   /* Lightning Shield: the heal discharges a lightning strike on the enemies next to it */
        rays(ctx.V.geo, ctx.state, i, ORTH.concat(DIAG), 1).forEach(function (j) { var q = ctx.at(j); if (q && q.c === 'b' && q.max) { ctx.fx({ type: 'flash', color: '#9fd3ff', at: ctx.name(j), opacity: 0.7, duration_ms: 260 }); hurt(ctx, j, 300); } });
      }
    }
    function hurt(ctx, j, d) {
      var p = ctx.at(j); if (!p || !p.max) return; d = Math.max(1, Math.round(d));
      hpFx(ctx, j, '-' + d, p.c === 'w' ? '#ff6b6b' : '#ffffff');
      if (p.hp - d > 0) { ctx.transform(j, { props: { hp: p.hp - d } }); return; }
      ctx.remove(j); ctx.fx({ type: 'particles', kind: 'dust', at: ctx.name(j), count: 14 });
      if (p.c === 'w' && p.t !== 'K') ctx.toast('Your ' + NAME[p.t] + ' crumbles.', 1600);
    }
    function round(ctx) {
      var st = ctx.state, b = st.b, g = ctx.V.geo, x = st.x || {}, dmg = {}, add = function (j, d) { dmg[j] = (dmg[j] || 0) + d; };
      var armor = 37 * ctx.pieces(function (q) { return q.c === 'w' && q.tr === 'armor'; }).length;
      run.rounds++;
      for (var i = 0; i < b.length; i++) {
        var p = b[i]; if (!isUnit(p)) continue;
        if (p.t === 'Cn') {   /* fires a cannonball every second round down its row / file */
          if (run.rounds % 2) continue;
          ORTH.forEach(function (d) { var j = i; for (var s = 0; s < 7; s++) { j = g.step(j, d[0], d[1]); if (j < 0) break; var q = b[j]; if (!q) continue; if (q.c === 'w') { ctx.fx({ type: 'explosion', at: ctx.name(j), radius: 0.6 }); add(j, p.str); } break; } });
          continue;
        }
        if (p.t === 'Xb') {   /* shoots the nearest unit within 5 tiles and sets that tile on fire */
          var best = -1, bd = 99; for (var j = 0; j < b.length; j++) { if (b[j] && b[j].c === 'w' && b[j].max) { var dd = g.dist(i, j); if (dd <= 5 && dd < bd) { bd = dd; best = j; } } }
          if (best >= 0) { ctx.fx({ type: 'arrow', from: ctx.name(i), to: ctx.name(best), color: 'rgba(214,56,58,.8)', width: 4, duration_ms: 380 }); add(best, p.str); run.fire[best] = 3; }
          continue;
        }
        var tg = atk(g, st, i).filter(function (j) { var q = b[j]; return isUnit(q) && q.c !== p.c; });
        if (!tg.length) continue;
        tg.sort(function (a, c) { return b[a].hp - b[c].hp; });
        add(tg[0], Math.max(1, p.str * (0.85 + Math.random() * 0.3) - (b[tg[0]].c === 'w' ? armor : 0)));
      }
      Object.keys(run.fire).forEach(function (k) { var j = +k, q = b[j]; if (isUnit(q)) add(j, 100); if (--run.fire[k] <= 0) delete run.fire[k]; });
      if (spikesUp()) (run.spikes || []).forEach(function (j) { if (isUnit(b[j])) add(j, 400); });
      Object.keys(dmg).forEach(function (k) { hurt(ctx, +k, dmg[k]); });
      ctx.refresh();
    }
    function spikesUp() { return run.spikes && run.spikes.length && (run.rounds % 4) < 2; }
    function monsterMove(ctx) {
      var st = ctx.state, b = st.b, g = ctx.V.geo, V = ctx.V, wake = ctx.params.wake || 4, mine = [];
      for (var i = 0; i < b.length; i++) if (b[i] && b[i].c === 'w' && b[i].max) mine.push(i);
      if (!mine.length) return;
      var list = [];
      for (var k = 0; k < b.length; k++) { var p = b[k]; if (!p || p.c !== 'b' || !p.max || p.t === 'Cn') continue;
        if (!p.aw && mine.some(function (j) { return g.dist(j, k) <= wake; })) { ctx.transform(k, { props: { aw: 1 } }); p = ctx.at(k); }
        if (p.aw) list.push(k); }
      if (!list.length) return;
      var f = list[run.rr++ % list.length], me = b[f], out = [];
      V.genPiece(Object.assign({}, st, { turn: 'b' }), f, out, false);
      var dests = out.filter(function (m) { return !m.cap && m.t >= 0 && !b[m.t] && g.valid[m.t]; }).map(function (m) { return m.t; });
      if (!dests.length) return;
      var hit = function (sq) { var tmp = b.slice(); tmp[f] = null; tmp[sq] = me; var s2 = Object.assign({}, st, { b: tmp }); return atk(g, s2, sq).filter(function (j) { return tmp[j] && tmp[j].c === 'w' && tmp[j].max; }).length; };
      var danger = function (sq) { var tmp = b.slice(); tmp[f] = null; tmp[sq] = me; var s2 = Object.assign({}, st, { b: tmp }), n = 0; mine.forEach(function (j) { if (atk(g, s2, j).indexOf(sq) >= 0) n++; }); return n; };
      var near = function (sq) { var d = 99; mine.forEach(function (j) { d = Math.min(d, g.dist(j, sq)); }); return d; };
      var flee = me.t === 'Xb' || (me.t === 'Q' && near(f) <= 1);   /* crossbows and the queen keep away from close opponents */
      var bestS = -1e9, bestT = -1, cur = hit(f) * 10 - danger(f) * 7;
      dests.forEach(function (t) {
        var s = flee ? Math.min(near(t), 4) * 6 - danger(t) * 7 : hit(t) * 10 - danger(t) * 7 - near(t);
        if (spikesUp() && run.spikes.indexOf(t) >= 0) s -= 30;
        s += Math.random() * 2;
        if (s > bestS) { bestS = s; bestT = t; }
      });
      if (bestT < 0 || (!flee && hit(f) && bestS < cur)) return;
      ctx.move(f, bestT); refreshQuiet(ctx);
      CM.sound.play('move-opponent');
    }
    function refreshQuiet(ctx) { var G = ctx.game; G._dirty = false; G.moves = ctx.V.legal(G.state); var r = !G.over && ctx.V.result(G.state, G.moves); if (r) { G.over = r; G.finish(); return; } G.render(); }
    function releaseWave(ctx) {
      var l = lv(ctx), w = (l.waves || [])[run.wave || 0]; if (!w) { ctx.toast('The lever does nothing more.', 1400); return false; }
      run.wave = (run.wave || 0) + 1;
      var spots = run.cages.filter(function (i) { var p = ctx.at(i); return p && p.t === '#'; });
      var extra = ctx.emptySquares(function (i) { return ctx.V.geo.row(i) <= 4; });
      w.forEach(function (t) { var at = spots.length ? spots.shift() : extra.length ? extra.splice(ctx.random(extra.length), 1)[0] : -1; if (at >= 0) ctx.set(at, ctx.V.piece(t, 'b', stats(t, 'b', { aw: 1 }))); });
      ctx.fx({ type: 'shake', intensity: 3, duration_ms: 250 });
      ctx.toast('The cages open: ' + w.length + ' pieces released!', 2000);
      return true;
    }
    function spellReady(x, id) { var cd = (x.cd || {})[id] || 0; return (x.mv || 0) >= cd; }
    function useArm(ctx, i) {   /* a tap while a spell / item / new piece is armed */
      var a = run.arm, x = ctx.state.x, p = ctx.at(i), g = ctx.V.geo; if (!a) return false;
      var ownUnit = p && p.c === 'w' && p.max, empty = !p && g.valid[i];
      if (a.place) {
        if (run.starts.indexOf(i) < 0 || p) { ctx.toast('Place it on a glowing start tile.', 1400); return true; }
        ctx.set(i, ctx.V.piece(a.place.t, 'w', stats(a.place.t, 'w', { tr: a.place.tr, m: 1 })));
        if (a.place.tr === 'disc') ctx.setX('disc', (x.disc || 0) + 1);
        run.arm = null; ctx.refresh(); ctx.toast('The ' + a.place.name + ' joins you. ' + lv(ctx).intro, 3200); return true;
      }
      if (a.spell) {
        var s = SP[a.spell], ok = s.target === 'unit' ? ownUnit : s.target === 'empty' ? empty : g.valid[i] && !(p && p.t === '#');
        if (!ok) { CM.sound.play('illegal'); run.arm = null; ctx.toast(s.target === 'unit' ? 'Pick one of your units.' : 'Pick a free tile.', 1300); ctx.refresh(); return true; }
        ctx.setX('mana', (x.mana || 0) - costOf(x, a.spell)); var cd = Object.assign({}, x.cd); cd[a.spell] = (x.mv || 0) + s.cd; ctx.setX('cd', cd);
        if (a.spell === 'lesser') heal(ctx, i, 800);
        else if (a.spell === 'greater') heal(ctx, i, 1870);
        else if (a.spell === 'orb') ctx.set(i, ctx.V.piece('Or', 'n'));
        else if (a.spell === 'chain') { var done = [i], at = i; heal(ctx, i, 700);
          for (var n = 0; n < 4; n++) { var nx = ctx.pieces(function (q, j) { return q.c === 'w' && q.max && done.indexOf(j) < 0 && g.dist(j, at) <= 3; }); if (!nx.length) break; at = ctx.pick(nx); done.push(at); heal(ctx, at, 700); } }
        else if (a.spell === 'diag') DIAG.forEach(function (d) { var j = g.step(i, d[0], d[1]); if (j >= 0) heal(ctx, j, 1200); });
        else if (a.spell === 'nova') ctx.setX('nova', { at: i, due: (x.mv || 0) + 2 });
        else if (a.spell === 'shield') { ctx.transform(i, { props: { sh: (x.mv || 0) + 10 } }); ctx.fx({ type: 'flash', color: '#9fd3ff', at: ctx.name(i), opacity: 0.6, duration_ms: 400 }); }
        CM.sound.play('promote'); run.arm = null; ctx.refresh(); return true;
      }
      if (a.item != null) {
        var it = (x.inv || [])[a.item], d = it && IT[it.id]; run.arm = null;
        if (!d || !ownUnit) { CM.sound.play('illegal'); ctx.refresh(); return true; }
        var pr = {};
        if (d.str) pr.str = p.str + d.str;
        if (d.max) { pr.max = p.max + d.max; pr.hp = p.hp + d.max; }
        if (d.spd) pr.spd = 1;
        if (Object.keys(pr).length) { ctx.transform(i, { props: pr }); hpFx(ctx, i, d.name, '#e8d050'); }
        if (d.heal) heal(ctx, i, d.heal);
        if (d.full) heal(ctx, i, p.max - p.hp);
        var inv = (x.inv || []).slice();
        if (d.regen) inv[a.item] = { id: it.id, ready: (x.mv || 0) + d.regen }; else inv.splice(a.item, 1);
        ctx.setX('inv', inv); CM.sound.play('promote'); ctx.refresh(); return true;
      }
      return false;
    }
    function shop(ctx) {
      var x = ctx.state.x, have = x.spells || [];
      var items = Object.keys(SP).filter(function (k) { return SP[k].price; }).map(function (k) { var s = SP[k], own = have.indexOf(k) >= 0;
        return { id: k, name: s.name + (own ? ' (owned)' : ' \u2014 ' + s.price + ' gold'), text: s.text + ' Mana ' + costOf(x, k) + ', ' + s.cd + ' move cooldown.', disabled: own || (x.gold || 0) < s.price }; });
      overlay(ctx, 'Spell shop (' + (x.gold || 0) + ' gold)', items, function (it) {
        if (!it) return; ctx.setX('gold', (ctx.state.x.gold || 0) - SP[it.id].price); ctx.setX('spells', (ctx.state.x.spells || []).concat([it.id])); CM.sound.play('promote'); ctx.toast(SP[it.id].name + ' added to your spell bar.', 1600); ctx.refresh();
      }, true);
    }
    function hud(ctx) {
      var G = ctx.game, stl = document.getElementById('status'); if (!stl || !stl.parentNode) return; css();
      var el = document.getElementById('pp-hud');
      if (!el) { el = document.createElement('div'); el.id = 'pp-hud'; stl.parentNode.insertBefore(el, stl.nextSibling);
        el.onclick = function (e) {
          var b = e.target.closest('[data-sp],[data-it],[data-a]'); if (!b || ctx.over) return; var x = ctx.state.x;
          if (b.dataset.a === 'shop') { run.arm = null; shop(ctx); return; }
          if (b.dataset.sp) { var id = b.dataset.sp;
            if (run.arm && run.arm.spell === id) { run.arm = null; ctx.refresh(); return; }
            if ((x.mana || 0) < costOf(x, id)) { CM.sound.play('illegal'); ctx.toast('Not enough mana: break crates and vases.', 1500); return; }
            if (!spellReady(x, id)) { CM.sound.play('illegal'); ctx.toast(SP[id].name + ' recharges in ' + (x.cd[id] - (x.mv || 0)) + ' moves.', 1400); return; }
            run.arm = { spell: id }; G.sel = -1; ctx.toast(SP[id].name + ': ' + (SP[id].target === 'unit' ? 'tap one of your units.' : 'tap a tile.'), 1500); ctx.refresh(); return; }
          if (b.dataset.it != null) { var k = +b.dataset.it, it = (x.inv || [])[k]; if (!it) return;
            if (it.id === 'key') { ctx.toast('The key opens the locked door: walk your King into it.', 1600); return; }
            if (it.ready && it.ready > (x.mv || 0)) { CM.sound.play('illegal'); ctx.toast(IT[it.id].name + ' regenerates in ' + (it.ready - (x.mv || 0)) + ' moves.', 1400); return; }
            run.arm = run.arm && run.arm.item === k ? null : { item: k }; G.sel = -1; if (run.arm) ctx.toast(IT[it.id].name + ': tap one of your units.', 1400); ctx.refresh(); }
        };
      }
      var x = ctx.state.x || {}, mana = x.mana || 0, spells = ['lesser', 'greater', 'orb'].concat(x.spells || []);
      var sel = G.sel >= 0 && ctx.at(G.sel) && ctx.at(G.sel).max ? G.sel : king(ctx.state), u = sel >= 0 ? ctx.at(sel) : null;
      el.innerHTML =
        '<div class="row"><div class="mana"><i style="width:' + Math.round(100 * mana / MAXM) + '%"></i><b>' + mana + ' mana</b></div><span class="gold"><img alt="gold" src="' + A + 'gold.png">' + (x.gold || 0) + '</span><button type="button" class="btn" data-a="shop">Shop</button></div>' +
        '<div class="row">' + spells.map(function (id, k) { var s = SP[id], off = mana < costOf(x, id) || !spellReady(x, id), left = (x.cd || {})[id] - (x.mv || 0);
          return '<button type="button" class="sp' + (off ? ' off' : '') + (run.arm && run.arm.spell === id ? ' on' : '') + '" data-sp="' + id + '" title="' + CM.util.esc(s.name + ': ' + s.text + ' Mana ' + costOf(x, id)) + '" aria-label="' + CM.util.esc(s.name) + '">' + (s.icon ? '<img alt="" src="' + A + s.icon + '">' : '<span style="padding:2px;display:block">' + CM.util.esc(s.name) + '</span>') + '<span class="n">' + (k + 1) + '</span><small>' + (left > 0 ? left + ' mv' : costOf(x, id)) + '</small></button>'; }).join('') +
        (x.inv || []).map(function (it, k) { var d = IT[it.id], off = it.ready && it.ready > (x.mv || 0);
          return '<button type="button" class="it' + (off ? ' off' : '') + (run.arm && run.arm.item === k ? ' on' : '') + '" data-it="' + k + '" title="' + CM.util.esc(d.name + ': ' + d.text) + '" aria-label="' + CM.util.esc(d.name) + '">' + (d.icon ? '<img alt="" src="' + A + d.icon + '">' : '<span style="padding:2px;display:block">' + CM.util.esc(d.name) + '</span>') + (off ? '<small>' + (it.ready - (x.mv || 0)) + ' mv</small>' : '') + '</button>'; }).join('') + '</div>' +
        (u ? '<div class="info"><b>' + NAME[u.t] + '</b> &middot; +' + u.str + ' Strength &middot; ' + Math.max(0, u.hp) + ' / ' + u.max + ' Health' + (u.tr ? ' &middot; ' + ({ armor: 'Armor +37', disc: 'Mana discount', fort: 'Fortunate' })[u.tr] : '') + (u.spd ? ' &middot; +1 tile' : '') + '<br>' + DESC[u.t] + '</div>' : '');
    }
    function rightClick(ctx) {
      var bd = document.getElementById('board'); if (!bd || bd._pp) return; bd._pp = 1;
      bd.addEventListener('contextmenu', function (e) {
        var G = ctx.game; if (!G || G.spec.id !== 'sGXmiyvZDE4') return; e.preventDefault();
        var el = e.target.closest('.sq'); if (!el || el.dataset.i == null || G.over || G.busy) return; var i = +el.dataset.i;
        if (run.arm) { useArm(G.ctx, i); return; }
        if (G.sel >= 0 && G.moves.some(function (m) { return m.f === G.sel && m.t === i; })) G.tryMove(G.sel, i, false);
      });
    }
    api.init = function () { css(); };
    api.setup = function (ctx) {
      var st = ctx.state, l = lv(ctx); closeEl('pp-pick'); run.arm = null;
      if (!run.snap || run.snap.k !== run.k) run.snap = { k: run.k, roster: run.roster, keep: run.keep };
      run.roster = run.snap.roster; run.keep = run.snap.keep;   /* a retry restarts the level as it began */
      var B = build(ctx); st.b = B.b; st.turn = 'w';
      run.starts = B.starts; run.spikes = B.spikes; run.cages = B.cages; run.wave = 0; run.fire = {}; run.rounds = 0; run.rr = 0;
      var k = run.keep || {};
      st.x = { goal: l.goal, lvl: run.k, mana: k.mana || 0, gold: k.gold || 0, inv: (k.inv || []).map(function (it) { return { id: it.id }; }), spells: (k.spells || []).slice(), disc: k.disc || 0, cd: {}, mv: 0, loot: l.chests || [] };
      var now = performance.now(); run.nextRound = now + 1800; run.nextMove = now + 1500;
    };
    api.onStart = function (ctx) {
      rightClick(ctx); var l = lv(ctx);
      ctx.toast('Level ' + (run.k + 1) + '/' + L(ctx).length + ': ' + l.name + '. ' + (run.k ? '' : l.intro), 3200);
      if (run.k > 0 && run.starts.length) {
        overlay(ctx, 'Pick a chess piece', PICK.map(function (p) { return Object.assign({ img: A + 'w' + p.t + '.png' }, p); }), function (p) {
          run.arm = { place: p }; ctx.toast('Place the ' + p.name + ' on a glowing start tile.', 2000); ctx.refresh();
        });
      }
    };
    api.afterMove = function (ctx, m, info) {
      if (info.by !== 'player' || ctx.over) return null;
      ctx.state = Object.assign({}, ctx.state, { turn: 'w', ep: -1, epv: -1 });
      var x = ctx.state.x, ev = x.ev || []; ctx.setX('ev', null);
      ev.forEach(function (e) {
        if (e.indexOf('mana:') === 0) { ctx.fx({ type: 'text', text: '+' + e.slice(5) + ' mana', at: info.toName, color: '#7fa0ff', size: 16, duration_ms: 800 }); }
        else if (e.indexOf('gold:') === 0) ctx.fx({ type: 'text', text: '+' + e.slice(5) + ' gold', at: info.toName, color: '#f2c94c', size: 16, duration_ms: 800 });
        else if (e.indexOf('chest:') === 0) { var lo = (x.loot || [])[+e.slice(6)] || { items: [] }; ctx.toast('Rewards: ' + lo.items.map(function (id) { return IT[id].name; }).concat(lo.gold ? [lo.gold + ' gold'] : []).join(', ') + '.', 2600);
          ctx.fx({ type: 'overlay', image: A + 'chest_open.png', at: info.toName, fit: 'contain', duration_ms: 900, fade_ms: 250 }); }
        else if (e === 'orb') { hpFx(ctx, info.to, '+1000', '#7cf08e'); var g = ctx.V.geo, sp = ctx.emptySquares(function (i) { return g.dist(i, info.to) <= 4 && g.dist(i, info.to) >= 2; }); if (sp.length) ctx.set(ctx.pick(sp), ctx.V.piece('Or', 'n')); }
        else if (e === 'lever') { if (releaseWave(ctx) && (lv(ctx).waves || [])[run.wave]) { var near = ctx.emptySquares(function (i) { return ctx.V.geo.dist(i, info.to) === 1; }); if (near.length) ctx.set(ctx.pick(near), ctx.V.piece('Lv', 'n')); } }
      });
      var nv = ctx.state.x.nova; if (nv && (ctx.state.x.mv || 0) >= nv.due) { ctx.setX('nova', null); ctx.fx({ type: 'flash', color: '#7cf08e', at: ctx.name(nv.at), opacity: 0.6, duration_ms: 400 });
        ctx.pieces(function (q, j) { return q.c === 'w' && q.max && ctx.V.geo.dist(j, nv.at) <= 2; }).forEach(function (j) { heal(ctx, j, 1000); }); }
      return null;
    };
    api.onTick = function (ctx, now) {
      var G = ctx.game; if (!G || ctx.over || G.busy || paused(ctx)) { run.nextRound = Math.max(run.nextRound, now + 300); run.nextMove = Math.max(run.nextMove, now + 300); return; }
      if (CM.gameUI.isPromoting && CM.gameUI.isPromoting()) return;
      var p = ctx.params;
      if (now >= run.nextMove) { var mm = p.move_ms || [650, 1150]; run.nextMove = now + mm[0] + Math.random() * (mm[1] - mm[0]); monsterMove(ctx); if (ctx.over) return; }
      if (now >= run.nextRound) { run.nextRound = now + (p.round_ms || 1400); round(ctx); }
    };
    api.onTap = function (ctx, i) { return run.arm ? useArm(ctx, i) : false; };
    api.decorate = function (ctx, i, p) {
      var html = '', cls = '';
      if (run.fire[i]) html += '<span class="pp-fire"></span>';
      if (run.spikes && run.spikes.indexOf(i) >= 0) html += '<span class="pp-spk' + (spikesUp() ? ' up' : '') + '"></span>';
      var nv = (ctx.state.x || {}).nova; if (nv && nv.at === i) html += '<span class="pp-nova">' + Math.max(0, nv.due - (ctx.state.x.mv || 0)) + '</span>';
      if (p && p.t === 'Dr') html += '<img class="pp-door-mk" alt="" src="' + A + 'marker.png">';
      if (p && p.max && (p.c === 'w' || p.c === 'b')) html += '<span class="pp-hp pp-hp--' + p.c + '"><i style="width:' + Math.max(0, Math.round(100 * p.hp / p.max)) + '%"></i></span>';
      var a = run.arm;
      if (a && a.place && run.starts.indexOf(i) >= 0 && !p) cls = 'pp-start';
      else if (a && (a.item != null || (a.spell && SP[a.spell].target === 'unit')) && p && p.c === 'w' && p.max) cls = 'pp-aim';
      else if (a && a.spell === 'orb' && !p && ctx.V.geo.valid[i]) cls = 'pp-aim';
      return html || cls ? { html: html, cls: cls } : null;
    };
    api.camera = function (ctx) { var G = ctx.game; return G && G.sel >= 0 ? G.sel : king(ctx.state); };
    api.status = function (ctx) {
      hud(ctx); var l = lv(ctx);
      return 'Level ' + (run.k + 1) + '/' + L(ctx).length + ': ' + l.name + ' \u00b7 ' + (l.goal === 'king' ? 'defeat the enemy king' : 'escort your King to the exit') + (run.arm ? ' \u00b7 time is paused while you aim' : ' \u00b7 real time');
    };
    api.onGameOver = function (ctx, over) {
      closeEl('pp-pick'); run.arm = null;
      if (over.w !== 'w') { ctx.toast('The King fell. New game restarts ' + lv(ctx).name + '.', 2600); return; }
      var st = ctx.state, x = st.x || {}, ros = [];
      st.b.forEach(function (p) { if (p && p.c === 'w' && p.max) ros.push({ t: p.t, max: p.max, str: p.str, tr: p.tr, spd: p.spd }); });
      ros.sort(function (a, b) { return a.t === 'K' ? -1 : b.t === 'K' ? 1 : 0; });
      if (run.k < L(ctx).length - 1) {
        run.k++; run.roster = ros; run.keep = { mana: x.mana || 0, gold: x.gold || 0, inv: x.inv || [], spells: x.spells || [], disc: x.disc || 0 }; run.snap = null;
        ctx.toast('Victory! New game: ' + L(ctx)[run.k].name + '.', 3000);
      } else { ctx.toast('Every level from the video is cleared!', 4000); run.k = 0; run.roster = null; run.keep = null; run.snap = null; }
    };
    api.onExit = function () { closeEl('pp-pick'); closeEl('pp-hud'); run.arm = null; };
    /* QA / tests: jump to a level (window.CM_PP.level(3)) */
    window.CM_PP = { run: run, level: function (k) { run.k = k; run.snap = null; } };
    return api;
  })(),
  vfx: [{ type: 'vignette', color: 'rgba(40,20,70,.55)', size: 70 }],
  source: { research: 'research/modes/sGXmiyvZDE4.json', confidence: 'medium', notes: 'Real time via timers on the turn-based engine (combat rounds 1.4 s, monster steps ~0.9 s). Numbers quoted in the video are used (King 2610/+374, Pawn 1300/+217, Rook 1862, queen 2000, cannon 600/400, crossbow 1000/200, heals 800/1870/1000/700/1200/1000, crate +300 mana, chest loot); the rest (other HP, vase mana, spell costs/cooldowns, shop prices, attack ranges, level layouts) is inferred. Art from the video frames (0:21, 3:12, 7:51; tools/g6b_pp_art.py + tools/pp2_art.py); dark pawn / promotion queen + bishop re-shaded from the pale cuts, pale monster king re-shaded from the dark king, crossbow = pale bishop with an XB badge, lever = lettered token, door = wall tile + the game objective marker (inferred: no repo frame shows them).' }
});
