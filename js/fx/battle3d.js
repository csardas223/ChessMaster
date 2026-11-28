/* battle3d: Battle Chess (IbRrzKtieqs) in real 3D: animated fantasy characters fight on every capture.
   Own work (code-built low-poly models, no outside art; LICENSES.md "battle3d"). The look follows the 1988 game and its
   remake only in roster and staging; Interplay's art is copyrighted and nothing of it is copied:
     pawn = armoured spearman (spear + round shield)     rook = stone tower that wakes up as a rock golem to move / fight
     knight = plate knight with a sword (no horse)        bishop = robed bishop with a crook staff
     queen = robed sorceress (magic bolt)                  king = crowned king with a sword
   White = blue cloth, polished steel, gold. Black = red cloth, dark iron, horned / spiked helms.
   Hall: marble board in a pillared castle hall with arched windows, purple banners and braziers (the video's remake look).

   Runs on CM.scene3d (pieces:false; our own characters keyed by square, reconciled with G.state whenever no sequence
   runs). The mode's afterMove returns CM.battle3d.play(ctx, m, info): a Promise, so spec-game keeps input locked until
   the walk / fight is over. Everything animates on a scaled clock: tap the board or press Skip to fast-forward, and the
   1x / 2x pill (kept in localStorage) sets the normal pace. Reduced motion / animation off: play() returns nothing and
   the characters simply stand on their new squares. No WebGL: attach() resolves null and the 2D board stays.

   Rig (per character): root (square position, facing: white looks at -z, black at +z) > tipper (fall / sink) > scaler >
   body (hips; skirt / robe) > legL, legR, spine (torso + head) > shL / shR (upper arm) > elL / elR (forearm + hand,
   shield on elL) > grip (weapon; grip.x = wanted weapon pitch - (spine + shoulder + elbow)). Each bone's parts are merged
   into one geometry per material (vertex colours, flat faces) and cached by type + colour + bone: ~14 draw calls each. */
(function () {
  'use strict';
  var CM = window.CM;
  var B = null;                     /* the running battle view */
  var GEO = {};                     /* geometry cache: type + colour + bone -> { c, m, e } (kept across attaches) */
  var SPEED_KEY = 'cm.battle3d.speed';
  /* cfb-fights (critic 2026-11-27: ~7 s a capture made a 40-move game 5 minutes of cutscenes): each pair of piece types
     fights in full the first time in a game; a repeat pair fast-forwards (B.ff, ~1 s). The pill beside the speed pill
     ('New fights' / 'All fights') is the setting, saved under this key; 'all' always shows every fight. */
  var FIGHTS_KEY = 'cm.battle3d.fights';
  var HUMAN_H = 1.84;               /* canonical humanoid height (feet at -0.92 below the hip pivot) */
  var HEIGHT = { P: .98, N: 1.12, B: 1.1, Q: 1.08, K: 1.2, R: 1.16 };   /* fin-battle: bigger, like the game (characters nearly fill a square) */
  var GIRTH = 1.18;                 /* chunky heroic proportions: x / z stretch of every humanoid */

  function animMs() { return CM.settings && CM.settings.animMs ? CM.settings.animMs() : 200; }
  function clamp01(k) { return k < 0 ? 0 : k > 1 ? 1 : k; }
  function sm(k) { k = clamp01(k); return k * k * (3 - 2 * k); }
  function seg(k, a, b) { return clamp01((k - a) / (b - a)); }
  function angLerp(a, b, k) { var d = ((b - a + Math.PI * 3) % (Math.PI * 2)) - Math.PI; return a + d * k; }
  function typeOf(ctx, p) { var d = ctx.V.def(p.t) || {}, g = d.glyph || p.t; return 'PNBRQK'.indexOf(g) >= 0 ? g : 'P'; }

  /* ---------------- palettes ---------------- */
  var PAL = {
    w: { cloth: '#2c5cc0', cloth2: '#1b3a85', trim: '#e3c15e', steel: '#c9cfd8', gold: '#dcab3c', skin: '#e9ba97', leather: '#6f4a2b', wood: '#86602f',
      hair: '#ece6d6', qhair: '#e2bd6a', mail: '#a3abb5', mozz: '#f4f1ea', stone: '#bfc3ca', stone2: '#8f959f', eye: '#8fe0ff', magic: '#86d8ff', plume: '#3a7cf0', robe: '#e8e4da', fur: '#f4f1ea', dark: '#151820' },
    b: { cloth: '#a5171e', cloth2: '#5c0d12', trim: '#9c7a32', steel: '#4b4c54', gold: '#a37b2c', skin: '#dc9e78', leather: '#4a2e1b', wood: '#4d3420',
      hair: '#2b1d16', qhair: '#4a2618', mail: '#6a6b72', mozz: '#f1ede4', stone: '#5d5559', stone2: '#3d373a', eye: '#ff5a1e', magic: '#ff4d7a', plume: '#c41a1a', robe: '#2a1517', fur: '#3a3436', dark: '#0d0d10' }
  };

  /* ---------------- geometry helpers ---------------- */
  function X(T, g, x, y, z, rx, ry, rz) {
    if (rx || ry || rz) g.applyMatrix4(new T.Matrix4().makeRotationFromEuler(new T.Euler(rx || 0, ry || 0, rz || 0)));
    g.translate(x || 0, y || 0, z || 0); return g;
  }
  function plainMerge(T, geos) {   /* position + normal + uv merge of plain geometries (static scenery) */
    if (!geos.length) return null;
    var pos = [], nor = [], uvs = [];
    geos.forEach(function (g0) {
      var g = g0.index ? g0.toNonIndexed() : g0, a = g.attributes;
      pos.push.apply(pos, a.position.array); nor.push.apply(nor, a.normal.array);
      if (a.uv) uvs.push.apply(uvs, a.uv.array); else for (var i = 0; i < a.position.count; i++) uvs.push(0, 0);
      g0.dispose(); if (g !== g0) g.dispose();
    });
    var out = new T.BufferGeometry(); out.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new T.Float32BufferAttribute(nor, 3)); out.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
    out.computeBoundingSphere(); return out;
  }
  function merge(T, parts) {
    var out = {};
    ['c', 'm', 'e'].forEach(function (k) {
      var ps = parts.filter(function (p) { return p[2] === k; }); if (!ps.length) return;
      var pos = [], col = [];
      ps.forEach(function (p) {
        var g = p[0].index ? p[0].toNonIndexed() : p[0], a = g.attributes.position.array, c = new T.Color(p[1]), nz = p[3] || 0;
        for (var i = 0; i < a.length; i += 3) {
          var f = 1;
          if (nz) {   /* m-3d: per-face brightness jitter (rock / stone texture without a texture map: the batches are vertex-coloured) */
            var t = Math.floor(i / 9), h = Math.sin(t * 12.9898 + a[i - (i % 9)] * 78.233 + a[i - (i % 9) + 1] * 37.719) * 43758.5453;
            f = 1 + (h - Math.floor(h) - .5) * 2 * nz;
          }
          pos.push(a[i], a[i + 1], a[i + 2]); col.push(c.r * f, c.g * f, c.b * f);
        }
        p[0].dispose(); if (g !== p[0]) g.dispose();
      });
      var g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new T.Float32BufferAttribute(col, 3));
      g.computeVertexNormals(); g.computeBoundingSphere(); g.userData.keep = true; out[k] = g;
    });
    return out;
  }

  /* ---------------- character builders: bone -> parts [geometry, colour, 'c' cloth | 'm' metal | 'e' glow] ----------- */
  function humanoid(T, pal, o) {
    var P = { body: [], legL: [], legR: [], knL: [], knR: [], spine: [], shL: [], shR: [], elL: [], elR: [], grip: [] };
    function add(b, g, c, k) { P[b].push([g, c, k || 'c']); }
    var cyl = function (rt, rb, h, s) { return new T.CylinderGeometry(rt, rb, h, s || 7); };
    var box = function (w, h, d) { return new T.BoxGeometry(w, h, d); };
    var sph = function (r, a, b) { return new T.SphereGeometry(r, a || 7, b || 5); };
    /* legs (pivot at the hip, feet at -0.92); m3-fps: shin + boot hang from a knee bone 0.46 below the hip so walks bend the knee */
    [['legL', 'knL'], ['legR', 'knR']].forEach(function (b) {
      add(b[0], X(T, cyl(.08, .068, .46), 0, -.24, 0), o.thigh || pal.cloth2, o.thighK);
      add(b[1], X(T, sph(.066, 6, 4), 0, 0, 0), o.shin || pal.leather, o.shinK);
      add(b[1], X(T, cyl(.068, .058, .4), 0, -.2, 0), o.shin || pal.leather, o.shinK);
      add(b[1], X(T, box(.14, .1, .25), 0, -.41, .04), o.boot || pal.leather, o.bootK);
    });
    /* hips: belt + skirt / robe */
    add('body', X(T, cyl(.2, .21, .1, 8), 0, .02, 0), o.belt || pal.leather, o.beltK);
    if (o.robe) add('body', X(T, cyl(.22, o.robe, .86, 9), 0, -.45, 0), o.robeC || pal.cloth);
    else add('body', X(T, cyl(.2, .27, .32, 8), 0, -.14, 0), o.skirt || pal.cloth);
    /* torso */
    add('spine', X(T, cyl(o.chestR || .21, .18, .58, 8), 0, .33, 0), o.chest || pal.cloth, o.chestK);
    add('spine', X(T, cyl(.06, .07, .1, 6), 0, .66, 0), pal.skin);
    add('spine', X(T, sph(.125, 8, 6), 0, .8, .01), pal.skin);
    add('spine', X(T, box(.035, .06, .05), 0, .79, .125), pal.skin);   /* nose */
    /* arms: shoulder pivot (±0.25, 0.56); elbow 0.3 lower; hand 0.28 below the elbow */
    [['shL', 'elL', 1], ['shR', 'elR', -1]].forEach(function (a) {
      add(a[0], X(T, cyl(.068, .058, .3), 0, -.15, 0), o.sleeve || pal.cloth, o.sleeveK);
      if (o.pauldron) add(a[0], X(T, sph(.105, 7, 4), 0, .01, 0), o.pauldron, 'm');
      add(a[1], X(T, cyl(.058, .05, .26), 0, -.13, 0), o.fore || o.sleeve || pal.cloth, o.foreK || o.sleeveK);
      add(a[1], X(T, sph(.058, 6, 4), 0, -.29, .01), o.hand || pal.skin, o.handK);
    });
    return { P: P, add: add, cyl: cyl, box: box, sph: sph };
  }
  function horns(h, T, b, y, col) {   /* a pair of curved-ish horns on a helmet (black army) */
    [1, -1].forEach(function (s) {
      h.add(b, X(T, new T.ConeGeometry(.035, .16, 5), s * .15, y + .02, 0, 0, 0, s * -1.0), col, 'c');
      h.add(b, X(T, new T.ConeGeometry(.022, .12, 5), s * .22, y + .12, 0, 0, 0, s * -.25), col, 'c');
    });
  }
  function shieldRound(h, T, col, trim, boss) {
    h.add('elL', X(T, new T.CylinderGeometry(.2, .2, .035, 10), .085, -.17, .03, 0, 0, Math.PI / 2), col);
    h.add('elL', X(T, new T.TorusGeometry(.2, .018, 4, 12), .105, -.17, .03, 0, Math.PI / 2, 0), trim, 'm');
    h.add('elL', X(T, new T.SphereGeometry(.05, 6, 4), .11, -.17, .03), boss, 'm');
  }
  function sword(h, T, pal, len) {
    h.add('grip', X(T, new T.BoxGeometry(.055, len, .016), 0, .1 + len / 2, 0), pal.steel, 'm');
    h.add('grip', X(T, new T.ConeGeometry(.04, .1, 4), 0, .15 + len, 0, 0, Math.PI / 4, 0), pal.steel, 'm');
    h.add('grip', X(T, new T.BoxGeometry(.22, .035, .045), 0, .09, 0), pal.gold, 'm');
    h.add('grip', X(T, new T.CylinderGeometry(.02, .02, .13, 5), 0, .02, 0), pal.leather);
    h.add('grip', X(T, new T.SphereGeometry(.033, 5, 4), 0, -.06, 0), pal.gold, 'm');
  }
  var BUILD = {
    P: function (T, pal, c) {
      var h;
      if (c === 'b') {   /* red army: a burly bare-chested brute under a big round helm, red skirt, studded arm bands (spear kept) */
        h = humanoid(T, pal, { chest: pal.skin, chestR: .25, sleeve: pal.skin, fore: pal.skin, thigh: pal.skin, shin: pal.leather, skirt: pal.cloth, belt: pal.leather });
        var belly = new T.SphereGeometry(.3, 10, 8); belly.scale(1.04, .95, 1.0);   /* m3-fps: rounder belly (intro.jpg) */ h.add('spine', X(T, belly, 0, .19, .07), pal.skin);
        var pec = new T.SphereGeometry(.2, 9, 6); pec.scale(1.25, .7, .8); h.add('spine', X(T, pec, 0, .47, .06), pal.skin);
        h.add('spine', X(T, h.box(.07, .78, .04), 0, .33, .25, 0, 0, .62), pal.leather);          /* shoulder strap */
        var helm = new T.SphereGeometry(.2, 10, 7, 0, Math.PI * 2, 0, Math.PI * .64); h.add('spine', X(T, helm, 0, .79, .01), '#a4a6ad', 'm');   /* polished steel gladiator helm (fight_1.jpg) */
        h.add('spine', X(T, new T.TorusGeometry(.17, .025, 4, 12), 0, .7, .01, Math.PI / 2, 0, 0), pal.gold, 'm');
        h.add('spine', X(T, h.box(.03, .07, .34), 0, .97, 0), pal.gold, 'm');                   /* crest ridge */
        h.add('spine', X(T, h.box(.18, .03, .02), 0, .78, .19), pal.dark);                       /* eye slit */
        [['shL', 'elL'], ['shR', 'elR']].forEach(function (a) {
          h.add(a[0], X(T, h.cyl(.078, .078, .06, 7), 0, -.08, 0), pal.leather);
          h.add(a[1], X(T, h.cyl(.07, .066, .14, 7), 0, -.17, 0), pal.cloth);                      /* red studded bracer */
          h.add(a[1], X(T, h.cyl(.074, .074, .02, 7), 0, -.1, 0), pal.gold, 'm');
          h.add(a[1], X(T, h.cyl(.07, .07, .02, 7), 0, -.24, 0), pal.gold, 'm');
          for (var st = 0; st < 5; st++) { var aa = st / 5 * Math.PI * 2; h.add(a[1], X(T, new T.SphereGeometry(.013, 4, 3), Math.sin(aa) * .071, -.17, Math.cos(aa) * .071), pal.gold, 'm'); }   /* m3-fps: gold studs (intro.jpg) */
        });
        h.add('body', X(T, h.box(.12, .34, .02), 0, -.16, .25, -.12, 0, 0), pal.cloth2);         /* loin flap */
      } else {   /* blue army: tunic soldier with mail sleeves, leather belt and a kettle helm */
        h = humanoid(T, pal, { chest: pal.cloth, chestR: .21, sleeve: pal.mail, sleeveK: 'm', fore: pal.mail, foreK: 'm', thigh: pal.cloth2, shin: pal.leather, skirt: pal.cloth, pauldron: pal.leather });
        h.add('spine', X(T, h.box(.32, .06, .03), 0, .08, .2), pal.leather);
        h.add('spine', X(T, h.box(.34, .05, .04), 0, .55, .14), pal.trim);                        /* collar trim */
        h.add('spine', X(T, new T.SphereGeometry(.15, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2), 0, .83, 0), pal.steel, 'm');   /* kettle hat */
        h.add('spine', X(T, h.cyl(.23, .23, .02, 12), 0, .83, 0), pal.steel, 'm');
        h.add('spine', X(T, new T.ConeGeometry(.03, .12, 5), 0, 1.0, 0), pal.gold, 'm');
        h.add('spine', X(T, h.cyl(.13, .14, .06, 8), 0, .7, -.01), pal.mail, 'm');                 /* mail coif */
      }
      h.add('grip', X(T, h.cyl(.02, .02, 1.55, 5), 0, .33, 0), pal.wood);         /* spear */
      h.add('grip', X(T, new T.ConeGeometry(.045, .2, 4), 0, 1.2, 0), pal.steel, 'm');
      h.add('grip', X(T, h.cyl(.03, .03, .04, 5), 0, 1.09, 0), pal.cloth);
      shieldRound(h, T, c === 'b' ? pal.wood : pal.cloth, pal.trim, pal.steel);
      return h.P;
    },
    N: function (T, pal, c) {   /* plate knight with a sword */
      var h = humanoid(T, pal, { chest: pal.steel, chestK: 'm', chestR: .23, sleeve: pal.steel, sleeveK: 'm', thigh: pal.steel, thighK: 'm', shin: pal.steel, shinK: 'm', boot: pal.steel, bootK: 'm', hand: pal.steel, handK: 'm', pauldron: pal.steel, skirt: pal.cloth });
      var bp = new T.SphereGeometry(.24, 10, 7, 0, Math.PI * 2, 0, Math.PI * .62); bp.scale(1.05, 1.1, .82);
      h.add('spine', X(T, bp, 0, .3, .02, Math.PI, 0, 0), pal.steel, 'm');                  /* m-3d: rounded plate breastplate (intro.jpg) */
      h.add('spine', X(T, h.cyl(.235, .2, .07, 10), 0, .5, 0), pal.steel, 'm');              /* gorget */
      h.add('spine', X(T, h.box(.2, .36, .03), 0, .2, .215), pal.cloth);                     /* tabard */
      h.add('spine', X(T, h.box(.22, .035, .035), 0, .37, .22), pal.trim, 'm');
      h.add('body', X(T, h.cyl(.22, .28, .2, 10), 0, -.08, 0), pal.steel, 'm');              /* faulds */
      h.add('body', X(T, h.box(.18, .3, .02), 0, -.24, .25, -.14, 0, 0), pal.cloth);         /* tabard skirt */
      h.add('legL', X(T, h.cyl(.075, .075, .07, 7), 0, -.45, .03), pal.gold, 'm');          /* knee cops (legR shares legL's geometry) */
      h.add('spine', X(T, h.box(.52, .2, .03), 0, .44, -.21, -.2, 0, 0), c === 'w' ? pal.cloth : pal.cloth2);   /* cape: shoulders ... */
      h.add('spine', X(T, new T.CylinderGeometry(.2, .36, 1.05, 9, 1, true, Math.PI / 2, Math.PI), 0, -.05, -.06, -.1, 0, 0), c === 'w' ? pal.cloth : pal.cloth2);   /* ... flaring out to the calves (blue knights' long cape, intro.jpg) */
      h.add('spine', X(T, new T.CylinderGeometry(.365, .365, .04, 9, 1, true, Math.PI / 2, Math.PI), 0, -.57, -.11, -.1, 0, 0), pal.trim, 'm');
      h.add('spine', X(T, h.cyl(.14, .135, .27, 8), 0, .82, 0), pal.steel, 'm');           /* great helm */
      h.add('spine', X(T, h.cyl(.06, .14, .05, 8), 0, .98, 0), pal.steel, 'm');
      h.add('spine', X(T, h.box(.2, .025, .02), 0, .81, .135), pal.dark);                 /* visor slit */
      if (c === 'b') { horns(h, T, 'spine', .9, '#e1d6bd'); [-1, 0, 1].forEach(function (s) { h.add('shR', X(T, new T.ConeGeometry(.025, .1, 4), s * .04, .1, 0), pal.steel, 'm'); h.add('shL', X(T, new T.ConeGeometry(.025, .1, 4), s * .04, .1, 0), pal.steel, 'm'); }); }
      else h.add('spine', X(T, h.box(.04, .2, .3), 0, 1.07, -.04), pal.plume);           /* plume crest */
      sword(h, T, pal, .66);
      h.add('shL', X(T, new T.SphereGeometry(.125, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), 0, .0, 0), pal.steel, 'm');   /* layered pauldron */
      h.add('shL', X(T, new T.TorusGeometry(.12, .012, 4, 12), 0, -.005, 0, Math.PI / 2, 0, 0), pal.gold, 'm');
      h.add('elL', X(T, h.box(.035, .36, .26), .085, -.17, .03), pal.cloth);              /* kite-ish shield */
      h.add('elL', X(T, new T.ConeGeometry(.13, .16, 4), .085, -.42, .03, Math.PI, Math.PI / 4, 0), pal.cloth);
      h.add('elL', X(T, h.box(.04, .3, .05), .095, -.19, .03), pal.trim, 'm');
      return h.P;
    },
    B: function (T, pal) {   /* robed bishop: team-colour robe, white cape, gold cross panel, mitre, crook staff */
      var h = humanoid(T, pal, { robe: .4, robeC: pal.cloth, chest: pal.cloth, sleeve: pal.cloth, fore: pal.mozz, belt: pal.trim, beltK: 'm' });
      h.add('body', X(T, h.box(.24, .82, .02), 0, -.42, .3, -.25, 0, 0), pal.mozz);          /* front panel */
      h.add('body', X(T, h.box(.045, .5, .025), 0, -.36, .31, -.25, 0, 0), pal.gold, 'm');     /* gold cross */
      h.add('body', X(T, h.box(.2, .045, .025), 0, -.24, .282, -.25, 0, 0), pal.gold, 'm');
      h.add('spine', X(T, h.box(.24, .5, .02), 0, .3, .2), pal.mozz);
      h.add('spine', X(T, h.box(.04, .3, .025), 0, .32, .215), pal.gold, 'm');
      h.add('spine', X(T, h.box(.16, .04, .025), 0, .4, .215), pal.gold, 'm');
      h.add('spine', X(T, h.cyl(.29, .22, .2, 10), 0, .56, 0), pal.mozz);                     /* white cape / mozzetta */
      h.add('spine', X(T, h.box(.5, .8, .02), 0, .15, -.22, -.08, 0, 0), pal.mozz);
      h.add('spine', X(T, new T.ConeGeometry(.14, .4, 4), 0, 1.03, 0, 0, Math.PI / 4, 0), pal.cloth);   /* mitre */
      h.add('spine', X(T, h.box(.035, .32, .2), 0, 1.0, 0), pal.gold, 'm');
      h.add('spine', X(T, h.cyl(.135, .135, .05, 8), 0, .88, 0), pal.gold, 'm');
      h.add('spine', X(T, new T.ConeGeometry(.08, .16, 5), 0, .71, .1, 2.6, 0, 0), pal.hair);   /* beard */
      h.add('spine', X(T, new T.TorusGeometry(.13, .01, 3, 12, Math.PI), 0, .58, .1, Math.PI * .62, 0, 0), pal.gold, 'm');   /* m3-fps: pectoral chain ... */
      h.add('spine', X(T, h.box(.03, .12, .02), 0, .46, .23), pal.gold, 'm'); h.add('spine', X(T, h.box(.08, .025, .02), 0, .48, .23), pal.gold, 'm');   /* ... and cross */
      [['elL'], ['elR']].forEach(function (a) { h.add(a[0], X(T, new T.ConeGeometry(.1, .14, 8, 1, true), 0, -.2, 0, Math.PI, 0, 0), pal.cloth); });   /* wide sleeve cuffs */
      h.add('grip', X(T, h.cyl(.022, .022, 1.6, 5), 0, .35, 0), pal.gold, 'm');        /* staff + crook */
      h.add('grip', X(T, new T.TorusGeometry(.09, .022, 4, 8, Math.PI * 1.3), -.09, 1.17, 0, 0, 0, -.3), pal.gold, 'm');
      h.add('grip', X(T, new T.OctahedronGeometry(.05), 0, 1.06, 0), pal.magic, 'e');
      return h.P;
    },
    Q: function (T, pal) {   /* sorceress */
      var h = humanoid(T, pal, { robe: .46, robeC: pal.cloth, chest: pal.cloth2, chestR: .18, sleeve: pal.cloth, fore: pal.cloth, belt: pal.gold, beltK: 'm' });
      h.add('spine', X(T, new T.ConeGeometry(.32, .5, 8, 1, true), 0, .5, -.02), pal.cloth2);   /* flared shoulders / high collar */
      h.add('spine', X(T, new T.SphereGeometry(.14, 8, 6), 0, .83, -.03), pal.qhair);          /* hair */
      h.add('spine', X(T, new T.ConeGeometry(.17, .78, 8), 0, .44, -.11, -.1, 0, 0), pal.qhair);   /* m-3d: long flowing hair to the waist */
      [1, -1].forEach(function (sd) { h.add('spine', X(T, new T.ConeGeometry(.05, .4, 5), sd * .11, .6, .05, 0, 0, sd * -.12), pal.qhair); });   /* side locks */
      h.add('spine', X(T, h.box(.2, .03, .02), 0, .68, .118), pal.mozz);                        /* neckline */
      h.add('body', X(T, h.cyl(.47, .47, .05, 12), 0, -.86, 0), pal.trim, 'm');                  /* gold hem */
      h.add('body', X(T, h.box(.12, .84, .02), 0, -.44, .33, -.27, 0, 0), pal.cloth2);           /* front robe panel */
      h.add('body', X(T, new T.ConeGeometry(.3, .9, 10, 1, true), 0, -.42, -.05, .08, 0, 0), pal.cloth2);   /* trailing overskirt */
      h.add('elL', X(T, new T.ConeGeometry(.12, .22, 8, 1, true), 0, -.2, 0, Math.PI, 0, 0), pal.cloth2);   /* flared sleeves */
      h.add('elR', X(T, new T.ConeGeometry(.12, .22, 8, 1, true), 0, -.2, 0, Math.PI, 0, 0), pal.cloth2);
      h.add('spine', X(T, h.box(.24, .3, .02), 0, .4, .17), pal.trim);   /* bodice lacing panel */
      for (var k = 0; k < 7; k++) { var a = k / 7 * Math.PI * 2; h.add('spine', X(T, new T.ConeGeometry(.03, .16, 4), Math.sin(a) * .12, .98, Math.cos(a) * .12), pal.gold, 'm'); }
      h.add('spine', X(T, h.cyl(.13, .13, .03, 8), 0, .91, 0), pal.gold, 'm');
      h.add('spine', X(T, new T.OctahedronGeometry(.035), 0, .97, .13), pal.magic, 'e');
      h.add('spine', X(T, new T.TorusGeometry(.1, .012, 4, 10), 0, .62, .03, Math.PI / 2 - .3, 0, 0), pal.gold, 'm');
      h.add('grip', X(T, h.cyl(.016, .02, .5, 5), 0, .15, 0), pal.gold, 'm');          /* wand + orb */
      h.add('grip', X(T, new T.IcosahedronGeometry(.07, 0), 0, .44, 0), pal.magic, 'e');
      return h.P;
    },
    K: function (T, pal, c) {   /* crowned king with a sword */
      var h = humanoid(T, pal, { robe: .4, robeC: pal.cloth, chest: pal.cloth, chestR: .23, sleeve: pal.cloth, fore: pal.cloth, belt: pal.gold, beltK: 'm' });
      h.add('spine', X(T, h.box(.5, .95, .03), 0, .1, -.21, -.1, 0, 0), pal.cloth2);    /* cape */
      h.add('spine', X(T, new T.TorusGeometry(.2, .06, 5, 10), 0, .6, 0, Math.PI / 2, 0, 0), pal.fur);   /* fur collar */
      h.add('body', X(T, h.box(.06, .8, .02), 0, -.42, .31, -.24, 0, 0), pal.fur);
      h.add('spine', X(T, new T.SphereGeometry(.135, 8, 6), 0, .82, -.03), pal.hair);
      h.add('spine', X(T, h.box(.27, .3, .07), 0, .68, -.1), pal.hair);                          /* m3-fps: shoulder-length hair (fight_1.jpg) */
      var bd = new T.SphereGeometry(.11, 8, 6); bd.scale(1.05, 1.15, .7); h.add('spine', X(T, bd, 0, .7, .08), pal.hair);   /* full beard */
      h.add('spine', X(T, new T.ConeGeometry(.09, .2, 6), 0, .58, .1, 2.8, 0, 0), pal.hair);
      h.add('spine', X(T, h.cyl(.14, .13, .1, 8), 0, .94, 0), pal.gold, 'm');               /* crown */
      for (var k = 0; k < 8; k++) { var a = k / 8 * Math.PI * 2; h.add('spine', X(T, new T.ConeGeometry(.03, c === 'b' ? .17 : .1, 4), Math.sin(a) * .13, c === 'b' ? 1.06 : 1.03, Math.cos(a) * .13), pal.gold, 'm'); }
      h.add('spine', X(T, new T.OctahedronGeometry(.03), 0, .95, .14), c === 'b' ? '#ff3030' : '#3aa0ff', 'e');
      if (c === 'b') horns(h, T, 'spine', .93, '#d8ccb2');
      /* m3-fps: the king swings a great war hammer (fight_1.jpg: grey stone head on a gold-banded haft), not a sword */
      h.add('grip', X(T, h.cyl(.024, .024, .95, 6), 0, .38, 0), pal.wood);
      h.add('grip', X(T, h.cyl(.03, .03, .05, 6), 0, .02, 0), pal.gold, 'm');
      h.add('grip', X(T, h.cyl(.028, .028, .04, 6), 0, .62, 0), pal.gold, 'm');
      var hd = new T.CylinderGeometry(.11, .11, .34, 9); hd.rotateZ(Math.PI / 2); h.add('grip', X(T, hd, 0, .9, 0), c === 'b' ? '#6d6a6e' : '#a9a8a4');
      [-.17, .17].forEach(function (s) { var cap = new T.CylinderGeometry(.118, .118, .03, 9); cap.rotateZ(Math.PI / 2); h.add('grip', X(T, cap, s, .9, 0), pal.gold, 'm'); });
      return h.P;
    },
    G: function (T, pal) {   /* rock golem (the rook awake): faceted boulders with per-face rock texture, glowing cracks, moss */
      var P = { body: [], legL: [], legR: [], spine: [], shL: [], shR: [], elL: [], elR: [], grip: [] };
      function add(b, g, c, k, n) { P[b].push([g, c, k || 'c', n]); }
      function rock(r, d) { return new T.DodecahedronGeometry(r, d == null ? 1 : d); }
      function rk(b, g, c) { add(b, g, c, 'c', .22); }
      rk('body', X(T, rock(.22), 0, 0, 0), pal.stone2);
      ['legL', 'legR'].forEach(function (b) { rk(b, X(T, rock(.16), 0, -.22, 0), pal.stone); rk(b, X(T, rock(.11, 0), .02, -.36, .05), pal.stone2); rk(b, X(T, new T.BoxGeometry(.24, .14, .3), 0, -.48, .04), pal.stone2); });
      var t = rock(.42); t.scale(1.15, .9, .85); rk('spine', X(T, t, 0, .42, 0), pal.stone);
      rk('spine', X(T, rock(.14, 0), .2, .72, -.06), pal.stone2); rk('spine', X(T, rock(.12, 0), -.22, .68, .05), pal.stone2);
      rk('spine', X(T, rock(.15), 0, .78, .16), pal.stone);
      rk('spine', X(T, rock(.1, 0), .34, .5, .12), pal.stone2); rk('spine', X(T, rock(.09, 0), -.36, .38, -.1), pal.stone2); rk('spine', X(T, rock(.11, 0), .05, .62, -.32), pal.stone2);
      [[.18, .45, .36, .5], [-.15, .3, .37, -.6], [.02, .2, .37, .2]].forEach(function (q) { add('spine', X(T, new T.BoxGeometry(.18, .018, .02), q[0], q[1], q[2], 0, 0, q[3]), pal.eye, 'e'); });   /* glowing cracks */
      add('spine', X(T, new T.SphereGeometry(.16, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2.4), -.12, .74, .02), pal.moss || '#5b6e3a', 'c', .2);   /* moss tuft */
      function moss(b, x, y, z, r) { add(b, X(T, new T.SphereGeometry(r, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2.3), x, y, z), pal.moss || '#5b6e3a', 'c', .25); }
      moss('spine', .16, .8, -.14, .12); moss('spine', -.3, .66, -.12, .1); moss('spine', .3, .62, .02, .09);   /* s5-3d: moss over the shoulders and back (intro.jpg golem) */
      moss('shL', 0, -.01, 0, .11); moss('shR', 0, -.01, 0, .11);
      add('spine', X(T, new T.BoxGeometry(.06, .03, .03), .06, .8, .3), pal.eye, 'e'); add('spine', X(T, new T.BoxGeometry(.06, .03, .03), -.06, .8, .3), pal.eye, 'e');
      add('spine', X(T, new T.BoxGeometry(.5, .08, .4), 0, .3, .05, 0, 0, .5), pal.cloth);   /* team sash */
      [['shL', 'elL'], ['shR', 'elR']].forEach(function (a) { rk(a[0], X(T, rock(.15), 0, -.12, 0), pal.stone2); rk(a[1], X(T, rock(.13), 0, -.12, 0), pal.stone); rk(a[1], X(T, rock(.19), 0, -.34, .02), pal.stone2); rk(a[1], X(T, rock(.07, 0), .08, -.46, .08), pal.stone); });
      return P;
    },
    TOWER: function (T, pal) {
      var P = { tower: [] }; function add(g, c, k, n) { P.tower.push([g, c, k || 'c', n]); }
      add(X(T, new T.CylinderGeometry(.31, .37, .74, 12, 5), 0, .37, 0), pal.stone, 'c', .16);   /* m-3d: banded rows of faces = masonry courses */
      add(X(T, new T.CylinderGeometry(.38, .34, .12, 12), 0, .8, 0), pal.stone2, 'c', .14);
      add(X(T, new T.CylinderGeometry(.4, .42, .08, 12), 0, .04, 0), pal.stone2, 'c', .14);
      for (var k = 0; k < 6; k++) { var a = k / 6 * Math.PI * 2; add(X(T, new T.BoxGeometry(.14, .14, .12), Math.sin(a) * .31, .93, Math.cos(a) * .31, 0, a, 0), pal.stone, 'c', .18); }
      add(X(T, new T.BoxGeometry(.16, .26, .05), 0, .13, .345), pal.dark);
      add(X(T, new T.BoxGeometry(.06, .12, .04), 0, .5, .33), pal.eye, 'e');               /* lit slit window: the golem's eye */
      add(X(T, new T.CylinderGeometry(.012, .012, .4, 4), 0, 1.06, 0), pal.wood);
      add(X(T, new T.BoxGeometry(.2, .12, .01), .1, 1.18, 0), pal.cloth);
      return P;
    }
  };
  function bones(T, kind, c) {
    var key = kind + c; if (GEO[key]) return GEO[key];
    var P = BUILD[kind](T, PAL[c], c), out = {};
    Object.keys(P).forEach(function (b) { if (P[b].length && b !== 'legR' && b !== 'shR' && b !== 'knR') out[b] = merge(T, P[b]); else if (P[b].length) P[b].forEach(function (q) { q[0].dispose(); }); });
    if (out.legL) out.legR = out.legL; if (out.knL) out.knR = out.knL; if (out.shL) out.shR = out.shL;   /* the builders make both legs / upper arms alike: share them (one instanced batch) */
    Object.keys(out).forEach(function (b) { Object.keys(out[b]).forEach(function (k) { out[b][k].userData.id = key + ':' + (b === 'legR' ? 'legL' : b === 'knR' ? 'knL' : b === 'shR' ? 'shL' : b) + ':' + k; }); });
    GEO[key] = out; return out;
  }

  /* ---------------- rig ---------------- */
  var LAYOUT = {   /* bone -> [parent, x, y, z] */
    human: { body: ['scaler', 0, .92, 0], legL: ['body', .11, 0, 0], legR: ['body', -.11, 0, 0], spine: ['body', 0, .03, 0], shL: ['spine', .26, .56, 0], shR: ['spine', -.26, .56, 0],
      knL: ['legL', 0, -.46, 0], knR: ['legR', 0, -.46, 0], elL: ['shL', 0, -.3, 0], elR: ['shR', 0, -.3, 0], grip: ['elR', 0, -.29, .02] },
    golem: { body: ['scaler', 0, .56, 0], legL: ['body', .17, 0, 0], legR: ['body', -.17, 0, 0], spine: ['body', 0, .05, 0], shL: ['spine', .46, .58, 0], shR: ['spine', -.46, .58, 0],
      elL: ['shL', 0, -.26, 0], elR: ['shR', 0, -.26, 0], grip: ['elR', 0, -.34, 0] }
  };
  /* every bone of every character is drawn through one InstancedMesh per geometry (type + colour + bone + material):
     ~130 draw calls for the whole army instead of ~550 meshes. The rig itself is plain Object3D nodes. */
  function batch(geo, k) {
    var id = geo.userData.id, b = B.batches[id];
    if (!b) {
      var T = B.S.THREE, im = new T.InstancedMesh(geo, B.mat[k], 18); im.count = 0; im.frustumCulled = false; im.castShadow = k !== 'e';
      im.instanceMatrix.setUsage(T.DynamicDrawUsage); B.S.root.add(im); b = B.batches[id] = { im: im, n: 0 };
    }
    return b;
  }
  function node(T, geos, list, owner) {
    var g = new T.Group();
    ['c', 'm', 'e'].forEach(function (k) { if (geos[k]) list.push([g, batch(geos[k], k), owner]); });
    return g;
  }
  function buildRig(T, kind, c, layout, list) {
    var geos = bones(T, kind, c), L = LAYOUT[layout], R = { scaler: new T.Group() };
    Object.keys(L).forEach(function (b) { var n = R[b] = node(T, geos[b] || {}, list, 'rig'); n.position.set(L[b][1], L[b][2], L[b][3]); R[L[b][0]].add(n); });
    return R;
  }
  function draw() {   /* upload this frame's bone matrices to the batches */
    Object.keys(B.batches).forEach(function (k) { B.batches[k].n = 0; });
    var all = Object.keys(B.map).map(function (k) { return B.map[k]; }).concat(B.extra || []);
    all.forEach(function (ch) {
      if (ch.dead) return;
      ch.root.updateMatrixWorld(true);
      var rig = ch.rig.scaler.visible, tw = ch.tower ? ch.tower.visible : false;
      ch.parts.forEach(function (q) {
        if (q[2] === 'rig' ? !rig : !tw) return;
        var b = q[1]; if (b.n >= b.im.instanceMatrix.count) return;
        b.im.setMatrixAt(b.n++, q[0].matrixWorld);
      });
    });
    Object.keys(B.batches).forEach(function (k) { var b = B.batches[k]; b.im.count = b.n; b.im.instanceMatrix.needsUpdate = true; });
  }
  function makeChar(S, t, c, sq) {
    var T = S.THREE, root = new T.Group(), tipper = new T.Group(); root.add(tipper);
    var ch = { t: t, c: c, sq: sq, root: root, tipper: tipper, ph: Math.random() * 6.28, act: null, path: null, face: c === 'w' ? Math.PI : 0, faceTo: null, y: 0 };
    var cls = t === 'R' ? 'G' : t;
    ch.cls = cls; ch.parts = [];
    ch.rig = buildRig(T, cls, c, cls === 'G' ? 'golem' : 'human', ch.parts);
    var s0 = (HEIGHT[t] || .8) / (cls === 'G' ? 1.25 : HUMAN_H); ch.rig.scaler.scale.set(s0 * GIRTH, s0, s0 * GIRTH); ch.baseS = ch.rig.scaler.scale.clone();
    tipper.add(ch.rig.scaler);
    if (t === 'R') {   /* the rook rests as a tower; the golem only shows while it moves or fights */
      ch.tower = node(T, bones(T, 'TOWER', c).tower, ch.parts, 'tower'); ch.tower.scale.setScalar(1.08); tipper.add(ch.tower);
      ch.awake = 0; ch.rig.scaler.visible = false;
    }
    if (!B.hitGeo) { B.hitGeo = new T.CylinderGeometry(.34, .34, 1, 8).translate(0, .5, 0); B.hitGeo.userData.keep = true; B.hitMat = new T.MeshBasicMaterial({ visible: false }); }
    var hb = new T.Mesh(B.hitGeo, B.hitMat); hb.scale.y = HEIGHT[t] || .8; root.add(hb);   /* invisible tap target (never drawn) */
    root.position.copy(S.sq2world(sq)); root.rotation.y = ch.face;
    root.traverse(function (o) { o.userData.sq = sq; });
    S.root.add(root);
    return ch;
  }
  function setSq(ch, sq) { ch.sq = sq; ch.root.traverse(function (o) { o.userData.sq = sq; }); }
  function removeChar(ch) { if (ch.root.parent) ch.root.parent.remove(ch.root); ch.dead = true; }

  /* ---------------- poses ---------------- */
  var KEYS = ['bodyY', 'bodyZ', 'spineX', 'spineY', 'shRx', 'shRz', 'elRx', 'shLx', 'shLz', 'elLx', 'legLx', 'legRx', 'knLx', 'knRx', 'wpn'];
  function idlePose(ch) {
    var p = { bodyY: 0, bodyZ: 0, spineX: 0, spineY: 0, shRx: -.25, shRz: -.12, elRx: -.7, shLx: -.15, shLz: .14, elLx: -.8, legLx: 0, legRx: 0, knLx: .05, knRx: .05, wpn: .9 };
    if (ch.cls === 'P') { p.elRx = -1.0; p.wpn = .08; }
    if (ch.cls === 'B') { p.elRx = -1.0; p.wpn = .02; p.shLx = -.1; p.elLx = -.5; }
    if (ch.cls === 'Q') { p.shRx = -.3; p.elRx = -.9; p.wpn = .5; p.shLx = -.25; p.elLx = -1.0; }
    if (ch.cls === 'K') { p.wpn = .55; p.elRx = -.85; p.shLx = -.05; p.elLx = -.3; }
    if (ch.cls === 'G') { p.shRx = 0; p.shRz = -.22; p.elRx = -.25; p.shLx = 0; p.shLz = .22; p.elLx = -.25; p.wpn = 0; }
    return p;
  }
  /* attack keyframes: [time 0..1, pose overrides]; impact = fraction where the blow lands */
  var ATTACK = {
    P: { dur: .9, impact: .46, k: [[0, {}], [.36, { shRx: .35, elRx: -1.7, spineX: -.12, bodyZ: -.06, wpn: 1.45 }], [.48, { shRx: -1.35, elRx: -.15, spineX: .3, bodyZ: .26, wpn: 1.57, legLx: -.5, legRx: .3 }], [.72, { shRx: -1.3, elRx: -.15, spineX: .25, bodyZ: .22, wpn: 1.57, legLx: -.4, legRx: .25 }], [1, {}]] },
    N: { dur: 1.0, impact: .53, k: [[0, {}], [.4, { shRx: -2.9, elRx: -.6, spineX: -.15, spineY: .3, wpn: -.4, shLx: -.5 }], [.55, { shRx: -.8, elRx: -.2, spineX: .35, spineY: -.25, bodyZ: .16, wpn: 2.1, legLx: -.45 }], [.74, { shRx: -.8, elRx: -.2, spineX: .3, spineY: -.2, bodyZ: .14, wpn: 2.0, legLx: -.4 }], [1, {}]] },
    K: { dur: 1.0, impact: .53, k: [[0, {}], [.4, { shRx: -2.7, elRx: -.7, spineX: -.12, spineY: .35, wpn: -.3 }], [.55, { shRx: -.9, elRx: -.15, spineX: .3, spineY: -.3, bodyZ: .14, wpn: 2.0, legLx: -.4 }], [.74, { shRx: -.9, elRx: -.15, spineX: .25, spineY: -.25, bodyZ: .12, wpn: 1.9, legLx: -.35 }], [1, {}]] },
    B: { dur: 1.1, impact: .58, k: [[0, {}], [.45, { shRx: -2.8, elRx: -.3, shLx: -2.7, shLz: -.05, elLx: -.3, spineX: -.22, wpn: -.25 }], [.6, { shRx: -1.1, elRx: -.1, shLx: -1.0, elLx: -.1, spineX: .4, bodyZ: .16, wpn: 1.85, legLx: -.4 }], [.8, { shRx: -1.05, elRx: -.1, shLx: -1.0, elLx: -.1, spineX: .35, bodyZ: .14, wpn: 1.8, legLx: -.35 }], [1, {}]] },
    Q: { dur: 1.25, impact: .45, ranged: true, k: [[0, {}], [.38, { shRx: -1.0, elRx: -.9, shLx: -1.0, elLx: -.9, spineX: -.15, wpn: .3, bodyY: .03 }], [.47, { shRx: -1.62, elRx: 0, shLx: -1.55, elLx: 0, spineX: .18, wpn: 1.6, bodyY: .05 }], [.8, { shRx: -1.55, elRx: 0, shLx: -1.5, elLx: 0, spineX: .12, wpn: 1.6, bodyY: .04 }], [1, {}]] },
    G: { dur: 1.2, impact: .6, k: [[0, {}], [.45, { shRx: -2.9, shRz: -.05, elRx: -.2, shLx: -2.9, shLz: .05, elLx: -.2, spineX: -.25, bodyY: .07 }], [.6, { shRx: -.85, elRx: 0, shLx: -.85, elLx: 0, spineX: .55, bodyY: -.1, bodyZ: .12 }], [.8, { shRx: -.85, elRx: 0, shLx: -.85, elLx: 0, spineX: .5, bodyY: -.08, bodyZ: .1 }], [1, {}]] }
  };
  var BLOCK = { dur: .7, k: [[0, {}], [.25, { shLx: -1.55, shLz: -.15, elLx: -.55, spineX: -.12, bodyZ: -.06 }], [.6, { shLx: -1.5, shLz: -.15, elLx: -.55, spineX: -.2, bodyZ: -.1 }], [1, {}]] };
  var BUMP = { dur: 1.0, k: [[0, {}], [.35, { shRx: -1.35, shRz: -.1, elRx: -.35, spineX: .1, wpn: .2 }], [.5, { shRx: -1.5, shRz: -.1, elRx: -.1, spineX: .16, wpn: .3 }], [.75, { shRx: -2.7, elRx: -.4, wpn: 0 }], [1, {}]] };
  var FIDGET = {   /* idle personality (one at a time, every few seconds, on a random resting character) */
    P: { dur: 1.8, k: [[0, {}], [.25, { shRx: -.6, elRx: -1.35, wpn: .3 }], [.42, { shRx: -.2, elRx: -.95, wpn: .08, bodyY: -.02 }], [.7, { spineY: .45 }], [1, {}]] },
    Pb: { dur: 2.0, k: [[0, {}], [.3, { shRx: -.25, shRz: -1.45, elRx: -2.0, shLx: -.25, shLz: 1.45, elLx: -2.0, spineX: -.06, wpn: 1.2 }], [.7, { shRx: -.25, shRz: -1.5, elRx: -2.1, shLx: -.25, shLz: 1.5, elLx: -2.1, spineX: -.1, wpn: 1.2 }], [1, {}]] },   /* strongman flex */
    N: { dur: 1.9, k: [[0, {}], [.35, { shRx: -1.95, elRx: -1.25, wpn: -.15 }], [.65, { shRx: -1.95, elRx: -1.25, wpn: -.15, spineY: .2 }], [1, {}]] },     /* sword salute */
    B: { dur: 2.1, k: [[0, {}], [.35, { shRx: -1.25, elRx: -.5, wpn: .1, spineY: -.35 }], [.7, { spineY: .35 }], [1, {}]] },
    Q: { dur: 1.9, k: [[0, {}], [.3, { shRx: -1.4, elRx: -.6, wpn: 1.0 }], [.6, { shRx: -1.75, elRx: -.3, wpn: 1.45, shLx: -.9 }], [1, {}]], sparkle: .5 },  /* wand flourish */
    K: { dur: 1.7, k: [[0, {}], [.4, { shRx: -2.65, elRx: -.3, wpn: 0, spineX: -.08 }], [.7, { shRx: -2.65, elRx: -.3, wpn: 0, spineX: -.08 }], [1, {}]] }      /* sword raised */
  };
  var HIT = { dur: .6, k: [[0, {}], [.22, { spineX: -.42, bodyZ: -.16, shRx: -.6, shLx: -.9, elLx: -1.4 }], [1, {}]] };
  var DIE = { dur: 1.5, k: [[0, {}], [.14, { spineX: -.45, bodyZ: -.12, shRx: -.8, shLx: -.8 }], [.5, { spineX: -.15, shRx: -2.4, shLx: -2.3, elRx: -.2, elLx: -.2, legLx: -.3 }], [1, { spineX: -.15, shRx: -2.4, shLx: -2.3, elRx: -.2, elLx: -.2, legLx: -.3 }]] };
  function keyed(base, kf, k) {
    var p = Object.assign({}, base), i = 0;
    while (i < kf.length - 2 && k > kf[i + 1][0]) i++;
    var a = kf[i], b = kf[i + 1], w = sm((k - a[0]) / Math.max(1e-4, b[0] - a[0]));
    KEYS.forEach(function (n) { var va = a[1][n] != null ? a[1][n] : base[n], vb = b[1][n] != null ? b[1][n] : base[n]; p[n] = va + (vb - va) * w; });
    return p;
  }
  function poseChar(ch, now, dt) {
    var R = ch.rig, p = idlePose(ch), br = Math.sin(now * 2.1 + ch.ph);
    p.spineX += .03 * br; p.shRx += .04 * br; p.shLx += .04 * br; p.bodyY += .006 * br;
    if (ch.path) {   /* walk cycle by distance travelled */
      var ph = ch.path.d * (ch.cls === 'G' ? 4.2 : 6.2), w = Math.sin(ph), cw = Math.cos(ph), amp = ch.cls === 'G' ? .45 : .6;
      p.legLx = w * amp; p.legRx = -w * amp;
      p.knLx = .08 + .85 * Math.max(0, -cw); p.knRx = .08 + .85 * Math.max(0, cw);   /* the swinging leg bends at the knee, the planted one stays straight */ p.shLx += -w * .35; p.shRx += w * .2; p.bodyY += Math.abs(w) * .025; p.spineY += w * .06;
    }
    if (ch.cheer) { var j = Math.abs(Math.sin(now * 5 + ch.ph)); p.shRx = -2.9; p.elRx = -.2; p.wpn = 0; p.shLx = -2.6 + j * .3; p.elLx = -.3; p.bodyY += j * .1; p.legLx = -j * .3; }
    var a = ch.act;
    if (a) {
      var k = clamp01((now - a.t0) / a.dur);
      p = keyed(p, a.kf, k);
      if (a.name === 'die') {
        var stl = a.style || 'fall', bs = ch.baseS;
        if (stl === 'squash') {   /* the golem's double-fist smash flattens it, then it sinks */
          var q = sm(seg(k, 0, .1)); ch.rig.scaler.scale.set(bs.x * (1 + .5 * q), Math.max(.001, bs.y * (1 - .88 * q)), bs.z * (1 + .5 * q));
          ch.tipper.position.y = -1.3 * sm(seg(k, .6, 1));
        } else if (stl === 'vanish') {   /* the sorceress's bolt: lifted, spun, gone in sparks */
          var q2 = seg(k, 0, .7), g2 = Math.max(.001, 1 - sm(seg(k, .3, .72)));
          ch.tipper.position.y = .55 * sm(q2); ch.tipper.rotation.y = q2 * q2 * 14; ch.rig.scaler.scale.set(bs.x * g2, bs.y * g2, bs.z * g2);
        } else if (stl === 'blast' && a.dir) {   /* the bishop's staff slam knocks it flying */
          var q3 = sm(seg(k, 0, .38)); ch.root.position.copy(a.from).addScaledVector(a.dir, 1.05 * q3);
          ch.tipper.rotation.x = -1.5 * sm(seg(k, 0, .4)); ch.tipper.position.y = Math.sin(seg(k, 0, .38) * Math.PI) * .45 - 1.3 * sm(seg(k, .62, 1));
        } else {
          ch.tipper.rotation.x = -1.45 * Math.pow(seg(k, .12, .48), 2) + Math.sin(seg(k, .48, .6) * Math.PI) * .12;
          ch.tipper.position.y = -1.3 * sm(seg(k, .62, 1));
        }
      }
      if (k >= 1 && a.name !== 'die') ch.act = null;
    }
    if (ch.promoT != null) { var kp = clamp01((now - ch.promoT) / .7); ch.tipper.rotation.y = kp * kp * 16; ch.tipper.position.y = .45 * sm(kp); }
    R.body.position.y = (ch.cls === 'G' ? .56 : .92) + p.bodyY; R.body.position.z = p.bodyZ;
    R.spine.rotation.set(p.spineX, p.spineY, 0);
    R.shR.rotation.set(p.shRx, 0, p.shRz); R.elR.rotation.x = p.elRx; R.shL.rotation.set(p.shLx, 0, p.shLz); R.elL.rotation.x = p.elLx;
    R.legL.rotation.x = p.legLx; R.legR.rotation.x = p.legRx;
    if (R.knL) { R.knL.rotation.x = p.knLx + Math.max(0, -p.legLx) * .55; R.knR.rotation.x = p.knRx + Math.max(0, -p.legRx) * .55; }   /* a lunge (leg forward) bends that knee */
    R.grip.rotation.x = p.wpn - (p.spineX + p.shRx + p.elRx);
    /* facing */
    if (ch.faceTo != null) { ch.face = angLerp(ch.face, ch.faceTo, Math.min(1, dt * 9)); }
    ch.root.rotation.y = ch.face;
    /* rook: tower <-> golem */
    if (ch.tower && ch.shattered) { ch.tower.visible = false; ch.rig.scaler.visible = false; }
    else if (ch.tower) {
      var aw = ch.awake;
      ch.tower.visible = aw < .55; ch.tower.scale.set(1.08, 1.08 * (1 - sm(seg(aw, 0, .55))), 1.08);
      ch.rig.scaler.visible = aw > .35; var gs = Math.max(.001, sm(seg(aw, .35, 1))); if (!(ch.act && ch.act.name === 'die')) ch.rig.scaler.scale.set(ch.baseS.x * gs, ch.baseS.y * gs, ch.baseS.z * gs);
      ch.rig.scaler.rotation.y = (1 - gs) * 2.5;
    }
  }

  /* ---------------- scaled clock, waits, particles ---------------- */
  function speed() { return B.ff ? 7 : B.speed; }
  function wait(s) { return new Promise(function (res) { B.waits.push({ at: B.clock + s, res: res }); }); }
  function act(ch, name, def) { ch.act = { name: name, kf: def.k, dur: def.dur, t0: B.clock }; return wait(def.dur); }
  function walk(ch, pts, v) {
    var lens = [], tot = 0;
    for (var i = 1; i < pts.length; i++) { var l = pts[i].distanceTo(pts[i - 1]); lens.push(l); tot += l; }
    if (tot < 1e-3) return Promise.resolve();
    var dur = tot / (v || (ch.cls === 'G' ? 1.7 : 2.3)) + .05;
    ch.path = { pts: pts, lens: lens, tot: tot, t0: B.clock, dur: dur, d: 0 };
    return wait(dur).then(function () { if (ch.path) { ch.root.position.copy(pts[pts.length - 1]); ch.path = null; } });
  }
  function stepPath(ch) {
    var P = ch.path; if (!P) return;
    var k = clamp01((B.clock - P.t0) / P.dur), d = P.tot * (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2) * .15 + P.tot * k * .85;   /* gentle start / stop */
    P.d = d; var i = 0, acc = 0;
    while (i < P.lens.length - 1 && acc + P.lens[i] < d) { acc += P.lens[i]; i++; }
    var a = P.pts[i], b = P.pts[i + 1], f = P.lens[i] ? clamp01((d - acc) / P.lens[i]) : 1;
    ch.root.position.lerpVectors(a, b, f);
    var dx = b.x - a.x, dz = b.z - a.z; if (Math.abs(dx) + Math.abs(dz) > 1e-4) ch.faceTo = Math.atan2(dx, dz);
  }
  function awaken(ch, on) {   /* the tower crumbles into a golem (or the golem settles back) on the scaled clock */
    if (!ch.tower) return Promise.resolve();
    var from = ch.awake, to = on ? 1 : 0, t0 = B.clock, dur = .55;
    if (from === to) return Promise.resolve();
    ch.awakeTw = function () { var k = clamp01((B.clock - t0) / dur); ch.awake = from + (to - from) * k; if (k >= 1) ch.awakeTw = null; };
    dust(ch.root.position, PAL[ch.c].stone, 10);
    return wait(dur);
  }
  function glowTex(T) {
    if (B.glow) return B.glow;
    var cv = document.createElement('canvas'); cv.width = cv.height = 64; var g = cv.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.3, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    B.glow = new T.CanvasTexture(cv); return B.glow;
  }
  function spark(pos, color, n, spd, size) {
    var T = B.S.THREE;
    for (var i = 0; i < n; i++) {
      var s = new T.Sprite(new T.SpriteMaterial({ map: glowTex(T), color: color, transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
      s.scale.setScalar(size || .14); s.position.copy(pos); B.S.root.add(s);
      var v = new T.Vector3(Math.random() - .5, Math.random() * .9 + .1, Math.random() - .5).normalize().multiplyScalar((spd || 2.2) * (.5 + Math.random()));
      B.fx.push({ o: s, v: v, life: .35 + Math.random() * .3, age: 0, g: 5, fade: true });
    }
  }
  function dust(pos, color, n) {
    var T = B.S.THREE; if (!B.rockGeo) B.rockGeo = new T.DodecahedronGeometry(.06, 0);
    var m = B.rockMat[color] || (B.rockMat[color] = new T.MeshStandardMaterial({ color: color, roughness: .9, flatShading: true }));
    for (var i = 0; i < n; i++) {
      var r = new T.Mesh(B.rockGeo, m); r.position.set(pos.x + (Math.random() - .5) * .4, pos.y + .2 + Math.random() * .5, pos.z + (Math.random() - .5) * .4); r.scale.setScalar(.5 + Math.random());
      B.S.root.add(r); B.fx.push({ o: r, v: new T.Vector3((Math.random() - .5) * 2, Math.random() * 2, (Math.random() - .5) * 2), life: 1.1, age: 0, g: 7, spin: true, floor: 0.03 });
    }
  }
  function stepFx(dt) {
    B.fx = B.fx.filter(function (f) {
      f.age += dt; var k = f.age / f.life;
      if (k >= 1) { if (f.track) f.track(f, 1); if (f.o.parent) f.o.parent.remove(f.o); if (f.o.material && f.fade) f.o.material.dispose(); return false; }   /* a slow frame can jump past the end: tracks always see k = 1 */
      f.v.y -= f.g * dt; f.o.position.addScaledVector(f.v, dt);
      if (f.floor != null && f.o.position.y < f.floor) { f.o.position.y = f.floor; f.v.multiplyScalar(.4); f.v.y = Math.abs(f.v.y) * .3; }
      if (f.floor != null && k > .7) f.o.position.y -= dt * .4;
      if (f.spin) { f.o.rotation.x += dt * 6; f.o.rotation.z += dt * 4; }
      if (f.fade) f.o.material.opacity = 1 - k;
      if (f.track) f.track(f, k);
      return true;
    });
  }
  function chest(ch) { var p = ch.root.position.clone(); p.y += (HEIGHT[ch.t] || .8) * .55; return p; }
  function handPos(ch) { var v = new B.S.THREE.Vector3(); ch.rig.grip.updateWorldMatrix(true, false); ch.rig.grip.getWorldPosition(v); B.S.root.worldToLocal(v); return v; }
  function glowSprite(color, size) {
    var T = B.S.THREE, sp = new T.Sprite(new T.SpriteMaterial({ map: glowTex(T), color: color, transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
    sp.scale.setScalar(size); B.S.root.add(sp); return sp;
  }
  function mote(pos, v, color, size, life) {   /* one additive glow that drifts and fades (no gravity) */
    var s = glowSprite(color, size); s.position.copy(pos); B.fx.push({ o: s, v: v, life: life, age: 0, g: 0, fade: true });
  }
  function charge(ch, color, dur) {   /* s5-3d: the sorceress gathers the spell in her wand hand before the bolt (motes pulled in, orb swelling) */
    var T = B.S.THREE, orb = glowSprite(color, .02), core = glowSprite('#ffffff', .01);
    B.fx.push({ o: orb, v: new T.Vector3(), life: Math.max(.05, dur), age: 0, g: 0, track: function (f, k) {
      var hp = handPos(ch); orb.position.copy(hp); core.position.copy(hp);
      orb.scale.setScalar(.06 + .34 * k * k); core.scale.setScalar(.03 + .12 * k); orb.material.opacity = .45 + .55 * k;
      if (k < 1 && Math.random() < .55) { var off = new T.Vector3(Math.random() - .5, Math.random() - .3, Math.random() - .5).normalize().multiplyScalar(.32 + Math.random() * .12); mote(hp.clone().add(off), off.clone().multiplyScalar(-2.6), color, .09, .3); }
      if (k >= 1) { if (core.parent) core.parent.remove(core); core.material.dispose(); orb.material.dispose(); }
    } });
  }
  function burst(pos, color) {   /* s5-3d: bolt impact = white flash + a wide coloured halo + a spray of sparks */
    var T = B.S.THREE, fl = glowSprite('#ffffff', .2), halo = glowSprite(color, .3); fl.position.copy(pos); halo.position.copy(pos);
    B.fx.push({ o: fl, v: new T.Vector3(), life: .18, age: 0, g: 0, fade: true, track: function (f, k) { fl.scale.setScalar(.2 + 1.0 * k); } });
    B.fx.push({ o: halo, v: new T.Vector3(), life: .45, age: 0, g: 0, fade: true, track: function (f, k) { halo.scale.setScalar(.3 + 1.6 * Math.sqrt(k)); } });
    spark(pos, color, 16, 3.2, .1);
  }
  function bolt(from, to, color) {   /* the sorceress's magic bolt: a glowing orb with a sparkling trail */
    var T = B.S.THREE, dur = .32;
    var core = new T.Sprite(new T.SpriteMaterial({ map: glowTex(T), color: color, transparent: true, blending: T.AdditiveBlending, depthWrite: false })); core.scale.setScalar(.52);
    var hot = new T.Sprite(new T.SpriteMaterial({ map: glowTex(T), color: '#ffffff', transparent: true, blending: T.AdditiveBlending, depthWrite: false })); hot.scale.setScalar(.18);
    B.S.root.add(core); B.S.root.add(hot);
    return new Promise(function (res) {
      B.fx.push({ o: core, v: new T.Vector3(), life: dur, age: 0, g: 0, track: function (f, k) {
        k = Math.min(1, k); core.position.lerpVectors(from, to, k); core.position.y += Math.sin(k * Math.PI) * .25; hot.position.copy(core.position);
        if (Math.random() < .7) spark(core.position, color, 1, .5, .1);
        mote(core.position, new T.Vector3(), color, .3 * (1 - .4 * k), .22);   /* s5-3d: fading comet trail */
        if (k > .97 && !f.done) { f.done = true; B.S.root.remove(hot); B.S.root.remove(core); hot.material.dispose(); core.material.dispose(); res(); }
      } });
    });
  }

  /* ---------------- camera ---------------- */
  function camTo(c, dur) {
    var S = B.S, a = { theta: S.cam.theta, phi: S.cam.phi, dist: S.cam.dist, target: S.cam.target.clone() }, t0 = B.clock;
    B.camTw = function () {
      var k = sm((B.clock - t0) / dur);
      S.cam.theta = angLerp(a.theta, c.theta, k); S.cam.phi = a.phi + (c.phi - a.phi) * k; S.cam.dist = a.dist + (c.dist - a.dist) * k; S.cam.target.lerpVectors(a.target, c.target, k);
      if (k >= 1) B.camTw = null;
    };
    return wait(dur);
  }
  function saveCam() { var c = B.S.cam; return { theta: c.theta, phi: c.phi, dist: c.dist, target: c.target.clone() }; }
  function fightCam(pa, pb, actors) {   /* a low three-quarter view of the fight from the side with the fewest characters in the way */
    var S = B.S, T = S.THREE, mid = pa.clone().add(pb).multiplyScalar(.5), dx = pb.x - pa.x, dz = pb.z - pa.z;
    var t1 = Math.atan2(dz, -dx), t2 = Math.atan2(-dz, dx), cur = S.cam.theta, phi = 1.08, dist = 3.6 + Math.min(2.2, Math.hypot(dx, dz) * .5);
    var tgt = new T.Vector3(mid.x, .5, mid.z), others = Object.keys(B.map).map(function (k) { return B.map[k]; }).filter(function (c) { return actors.indexOf(c) < 0; });
    var best = null;
    [t1, t2, t1 + .55, t1 - .55, t2 + .55, t2 - .55].forEach(function (th) {
      var cam = new T.Vector3().setFromSpherical(new T.Spherical(dist, phi, th)).add(tgt), seg3 = new T.Line3(cam, tgt), cp = new T.Vector3(), score = 0;
      [pa, pb].forEach(function (end) {   /* sight lines to both fighters */
        var e3 = end.clone(); e3.y = .55; seg3.set(cam, e3);
        others.forEach(function (c) {
          var q = c.root.position.clone(); q.y = .55; var f = seg3.closestPointToPointParameter(q, true); seg3.at(f, cp);
          if (f > .02 && f < .93 && cp.distanceTo(q) < .62) score += 1;
        });
      });
      score += Math.abs(angLerp(cur, th, 1) - cur) * .15 + (th === t1 || th === t2 ? 0 : .25);
      if (!best || score < best.s) best = { s: score, th: th };
    });
    return { theta: best.th, phi: phi, dist: dist, target: tgt };
  }

  /* ---------------- sequences ---------------- */
  function knightPath(S, f, t) {
    var g = B.ctx.V.geo, fc = g.col(f), fr = g.row(f), tc = g.col(t), tr = g.row(t), a = S.sq2world(f), b = S.sq2world(t), mid = a.clone();
    if (Math.abs(tc - fc) > Math.abs(tr - fr)) mid.x = b.x; else mid.z = b.z;
    return [a, mid, b];
  }
  function pathFor(S, ch, f, t) { return ch.t === 'N' ? knightPath(S, f, t) : [S.sq2world(f), S.sq2world(t)]; }
  function trimPath(pts, stop) {   /* stop `stop` short of the last point */
    var a = pts[pts.length - 2], b = pts[pts.length - 1], l = a.distanceTo(b), out = pts.slice(0, -1);
    out.push(l > stop ? a.clone().lerp(b, (l - stop) / l) : a.clone()); return out;
  }
  var REACH = { P: .82, N: .72, B: .76, K: .72, G: .8, Q: 1.6 };
  var DIE_STYLE = { G: 'squash', Q: 'vanish', B: 'blast' };
  function strike(att, vic, final, blocked) {   /* one attack of att on vic; resolves when it is over */
    var A = ATTACK[att.cls], done = act(att, 'attack', A), col = PAL[att.c];
    if (!A.ranged) wait(A.dur * A.impact * .45).then(function () { if (B) sfx('swing'); });
    if (blocked) wait(A.dur * A.impact * .55).then(function () { if (B) act(vic, 'block', BLOCK); });
    var hit = function () {
      if (!B) return;
      if (blocked) { spark(chest(vic), '#fff2c0', 14, 2.8, .12); sfx('stab'); B.S.shake(.06, 220); return; }
      if (final) {
        act(vic, 'die', DIE); vic.dying = true;
        if (vic.cls === 'G') shatter(vic);
        else { vic.act.style = DIE_STYLE[att.cls] || 'fall'; vic.act.from = vic.root.position.clone(); vic.act.dir = vic.root.position.clone().sub(att.root.position).setY(0).normalize(); }
        if (vic.act.style === 'vanish') spark(chest(vic), col.magic, 26, 2.2, .16);
        if (vic.act.style === 'squash') dust(vic.root.position, '#8c8678', 10);
      }
      else act(vic, 'hit', HIT);
      sfx(att.cls === 'P' || att.cls === 'N' || att.cls === 'K' ? 'stab' : 'capture');
      spark(chest(vic), att.cls === 'Q' ? col.magic : '#ffd27a', att.cls === 'G' ? 6 : 12, 2.4);
      if (att.cls === 'G' || att.cls === 'B') dust(vic.root.position, '#8c8678', 6);
      B.S.shake(att.cls === 'G' ? .22 : final ? .14 : .08, 320);
    };
    if (A.ranged) {
      wait(A.dur * .12).then(function () { if (B) charge(att, col.magic, A.dur * (A.impact - .12)); });
      return wait(A.dur * A.impact).then(function () { return bolt(handPos(att), chest(vic), col.magic); }).then(function () { if (B && !blocked) burst(chest(vic), col.magic); hit(); return done; });
    }
    return Promise.all([wait(A.dur * A.impact).then(hit), done]);
  }
  var SND = { swing: 'assets/modes/rx-HCGCNuDo/swing.wav', stab: 'assets/modes/rx-HCGCNuDo/stab.wav' };
  function sfx(n) { try { if (CM.sound && !B.ff) CM.sound.play(SND[n] || n); } catch (e) { /* no audio */ } }
  function shatter(ch) { dust(ch.root.position, PAL[ch.c].stone, 22); ch.rig.scaler.visible = false; ch.shattered = true; }

  async function sequence(m, info, my) {
    var S = B.S, ctx = B.ctx, ok = function () { return B && B.seq === my; };
    var att = B.map[m.f]; if (!att) return;
    var capSq = m.cap ? (m.capSq != null ? m.capSq : m.t) : -1, vic = capSq >= 0 ? B.map[capSq] : null;
    var rook = m.castle ? B.map[m.castle.rf] : null;
    delete B.map[m.f]; if (rook) delete B.map[m.castle.rf];
    B.extra = [att, rook, vic].filter(Boolean);   /* posed by onFrame while out of the square map */
    if (vic) {
      delete B.map[capSq];
      var pair = [att.cls, vic.cls].sort().join('-');   /* cfb-fights: a repeat pair of piece types skips its cutscene */
      if (!B.allFights && B.seen[pair]) B.ff = true;
      B.seen[pair] = 1;
      var saved = saveCam(), pts = pathFor(S, att, m.f, capSq), reach = REACH[att.cls] || .75;
      var tp = trimPath(pts, reach), stand = tp[tp.length - 1];
      att.act = null; vic.act = null;
      S.lockCam = true;
      await Promise.all([camTo(fightCam(stand, vic.root.position, [att, vic]), .7), awaken(att, true)]); if (!ok()) return;
      if (stand.distanceTo(pts[0]) > .02) { await walk(att, tp); if (!ok()) return; }
      var face = Math.atan2(vic.root.position.x - stand.x, vic.root.position.z - stand.z);
      att.faceTo = face; vic.faceTo = face + Math.PI; await awaken(vic, true); await wait(.2); if (!ok()) return;
      if (vic.cls === 'P' || vic.cls === 'N') {   /* shield bearers: the first blow rings off the shield, they hit back, then fall */
        await strike(att, vic, false, true); if (!ok()) return;
        await wait(.05); await strike(vic, att, false); if (!ok()) return;
      } else { await strike(vic, att, false); if (!ok()) return; }   /* the defender strikes first */
      await wait(.1); await strike(att, vic, true); if (!ok()) return;
      await wait(.55); if (!ok()) return;
      var rest = [att.root.position.clone(), S.sq2world(m.t)];
      if (rest[0].distanceTo(rest[1]) > .02) { await walk(att, rest); if (!ok()) return; }
      await wait(.15);
      removeChar(vic);
      att.faceTo = att.c === 'w' ? Math.PI : 0;
      await Promise.all([camTo(saved, .7), awaken(att, false)]); if (!ok()) return;
      S.lockCam = false;
    } else {
      var jobs = rook ? [] : [awaken(att, true).then(function () { return walk(att, pathFor(S, att, m.f, m.t)); }).then(function () { att.faceTo = att.c === 'w' ? Math.PI : 0; return awaken(att, false); })];
      if (rook) {   /* castling: king and golem meet and bump fists (the video's castling gag) */
        jobs = [awaken(att, true).then(function () { return walk(att, pathFor(S, att, m.f, m.t)); })];
        jobs.push(awaken(rook, true).then(function () { return walk(rook, [S.sq2world(m.castle.rf), S.sq2world(m.castle.rt)]); }));
        await Promise.all(jobs); if (!ok()) return;
        var ka = att.root.position, ra = rook.root.position, fk = Math.atan2(ra.x - ka.x, ra.z - ka.z);
        att.faceTo = fk; rook.faceTo = fk + Math.PI; await wait(.3); if (!ok()) return;
        act(att, 'bump', BUMP); act(rook, 'bump', BUMP);
        await wait(BUMP.dur * .45); spark(ka.clone().lerp(ra, .5).setY(.62), '#ffe08a', 16, 2, .14); sfx('stab'); B.S.shake(.05, 200);
        await wait(BUMP.dur * .6); if (!ok()) return;
        att.faceTo = att.c === 'w' ? Math.PI : 0; rook.faceTo = rook.c === 'w' ? Math.PI : 0;
        await Promise.all([awaken(rook, false), wait(.3)]);
      }
      await Promise.all(jobs); if (!ok()) return;
    }
    B.map[m.t] = att; setSq(att, m.t);
    if (rook) { B.map[m.castle.rt] = rook; setSq(rook, m.castle.rt); }
    if (m.promo) {   /* the pawn is crowned: a golden flash and it becomes the new piece */
      att.promoT = B.clock; sfx('promote');
      for (var pk = 0; pk < 3; pk++) { spark(chest(att), '#ffd84a', 10, 1.8, .16); await wait(.22); if (!ok()) return; }
      spark(chest(att), '#fff6c8', 24, 2.8, .2);
      var np = ctx.game.state.b[m.t];
      removeChar(att);
      if (np) { var nc = B.map[m.t] = makeChar(S, typeOf(ctx, np), np.c, m.t); nc.tipper.position.y = .45; S.tween(function (k) { nc.tipper.position.y = .45 * (1 - k); }, 500); }
      await wait(.5);
    }
    B.extra = [];
    void info;
  }

  /* reconcile the characters with the engine state (start, undo, new game, hook mutations): identical pieces that
     only changed square walk there quickly; the rest rise out of / sink into the board */
  function reconcile(instant) {
    var S = B.S, st = B.ctx.game.state; if (!st) return;
    var want = {}, have = B.map, free = [], gone = [];
    st.b.forEach(function (p, i) { if (!p) return; var d = B.ctx.V.def(p.t) || {}; if (d.blocker) return; want[i] = typeOf(B.ctx, p) + p.c; });
    Object.keys(have).forEach(function (i) { var ch = have[i]; if (want[i] !== ch.t + ch.c || ch.dying) { (ch.dying ? gone : free).push(ch); delete have[i]; } });
    Object.keys(want).forEach(function (i) {
      i = +i; if (have[i]) return;
      var key = want[i], best = -1, bd = 1e9, to = S.sq2world(i);
      free.forEach(function (ch, k) { if (ch.t + ch.c !== key) return; var d = ch.root.position.distanceTo(to); if (d < bd) { bd = d; best = k; } });
      if (best >= 0 && !instant) {
        var ch = free.splice(best, 1)[0], a = ch.root.position.clone(); have[i] = ch; setSq(ch, i); ch.act = null; ch.tipper.rotation.x = 0; ch.tipper.position.y = 0;
        S.tween(function (k) { ch.root.position.lerpVectors(a, to, k); }, Math.max(animMs(), 260));
      } else if (best >= 0) { var c2 = free.splice(best, 1)[0]; have[i] = c2; setSq(c2, i); c2.root.position.copy(to); }
      else {
        var nc = have[i] = makeChar(S, key[0], key[1], i);
        if (!instant && animMs()) { nc.tipper.position.y = -1.2; var d0 = Math.random() * 120; S.tween(function (k) { nc.tipper.position.y = -1.2 * (1 - k); }, 420 + d0); }
      }
    });
    free.concat(gone).forEach(function (ch) {
      if (instant || !animMs() || ch.dying) { removeChar(ch); return; }
      S.tween(function (k) { ch.tipper.position.y = -1.3 * k; if (k >= 1) removeChar(ch); }, 380);
    });
    B.sig = sigOf();
  }
  function sigOf() { var G = B.ctx.game; return G.gid + '|' + G.state.b.map(function (p) { return p ? p.t + p.c : ''; }).join(','); }

  /* ---------------- hall ---------------- */
  function marbleTex(T, base, vein, n, seed) {
    var cv = document.createElement('canvas'); cv.width = cv.height = 256; var g = cv.getContext('2d'), r = seed || 1;
    function rnd() { r = (r * 16807) % 2147483647; return r / 2147483647; }
    g.fillStyle = base; g.fillRect(0, 0, 256, 256);
    for (var k = 0; k < 600; k++) { g.fillStyle = 'rgba(' + (rnd() < .5 ? '255,255,255' : '0,0,0') + ',' + (rnd() * .05) + ')'; g.fillRect(rnd() * 256, rnd() * 256, 3 + rnd() * 18, 3 + rnd() * 18); }
    g.strokeStyle = vein; g.lineCap = 'round';
    for (var v = 0; v < n; v++) {
      var x = rnd() * 256, y = rnd() * 256; g.globalAlpha = .25 + rnd() * .35; g.lineWidth = .6 + rnd() * 1.8; g.beginPath(); g.moveTo(x, y);
      for (var s = 0; s < 6; s++) { x += (rnd() - .3) * 70; y += (rnd() - .5) * 60; g.lineTo(x, y); }
      g.stroke();
    }
    g.globalAlpha = 1;
    var tx = new T.CanvasTexture(cv); tx.colorSpace = T.SRGBColorSpace; tx.wrapS = tx.wrapT = T.RepeatWrapping; tx.anisotropy = 4; return tx;
  }
  function stoneTex(T) {
    var cv = document.createElement('canvas'); cv.width = cv.height = 256; var g = cv.getContext('2d');
    g.fillStyle = '#b4b6ba'; g.fillRect(0, 0, 256, 256);
    for (var row = 0; row < 8; row++) for (var col = 0; col < 5; col++) {
      var x = col * 56 + (row % 2) * 28 - 28, y = row * 32, l = 206 + Math.floor(Math.random() * 30);
      g.fillStyle = 'rgb(' + l + ',' + (l + 3) + ',' + (l + 8) + ')'; g.fillRect(x + 2, y + 2, 52, 28);
    }
    var tx = new T.CanvasTexture(cv); tx.colorSpace = T.SRGBColorSpace; tx.wrapS = tx.wrapT = T.RepeatWrapping; return tx;
  }
  function hall(S, T) {
    var sc = S.scene, coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
    /* lights: window light from one side (shadows) + a cool sky fill + warm braziers */
    sc.add(new T.HemisphereLight('#dfe6f2', '#4a423b', .62));
    var sun = new T.DirectionalLight('#ffeccc', 1.75); sun.castShadow = true; sun.shadow.mapSize.set(coarse ? 1024 : 2048, coarse ? 1024 : 2048);
    var cam = sun.shadow.camera; cam.left = -6.5; cam.right = 6.5; cam.top = 6.5; cam.bottom = -6.5; cam.near = 1; cam.far = 40; sun.shadow.bias = -.0006; sun.shadow.normalBias = .02;
    sc.add(sun); sc.add(sun.target); S.sun = sun;
    /* board: polished marble squares (two merged meshes, each square a different patch of the veins) on a stone slab with
       a gilded frame. Drawn here instead of scene3d's per-square boxes (64 x 6 draw calls); taps are mapped in onTap. */
    var g = B.ctx.V.geo, light = marbleTex(T, '#f3f1ec', '#b6b0a3', 6, 7), dark = marbleTex(T, '#17151a', '#48424f', 5, 13), tops = { l: [], d: [] };
    for (var i = 0; i < g.size; i++) {
      if (!g.valid[i]) continue;
      var q = new T.PlaneGeometry(.995, .995).rotateX(-Math.PI / 2), uv = q.attributes.uv, ou = ((i * 37) % 8) / 8, ov = ((i * 53) % 8) / 8;
      for (var u = 0; u < uv.count; u++) uv.setXY(u, ou + uv.getX(u) * .5, ov + uv.getY(u) * .5);
      var w = S.sq2world(i); q.translate(w.x, 0, w.z); tops[(g.col(i) + g.row(i)) % 2 === 0 ? 'l' : 'd'].push(q);
    }
    [['l', light], ['d', dark]].forEach(function (a) {
      var mg = plainMerge(T, tops[a[0]]); if (!mg) return;
      var m = new T.Mesh(mg, new T.MeshStandardMaterial({ map: a[1], roughness: .12, metalness: .05 })); m.receiveShadow = true; S.root.add(m);
    });
    var W = g.files, D = g.ranks, fm = new T.MeshStandardMaterial({ color: '#4f453f', roughness: .5 }), gm = new T.MeshStandardMaterial({ color: '#c39a3e', roughness: .3, metalness: .9 });
    var slab = new T.Mesh(new T.BoxGeometry(W + .9, .3, D + .9), fm); slab.position.y = -.151; slab.receiveShadow = true; S.root.add(slab);
    var rim = new T.Mesh(plainMerge(T, [new T.BoxGeometry(W + .3, .025, .05).translate(0, 0, -(D / 2 + .12)), new T.BoxGeometry(W + .3, .025, .05).translate(0, 0, D / 2 + .12),
      new T.BoxGeometry(.05, .025, D + .3).translate(-(W / 2 + .12), 0, 0), new T.BoxGeometry(.05, .025, D + .3).translate(W / 2 + .12, 0, 0)]), gm); S.root.add(rim);
    /* floor */
    var ft = marbleTex(T, '#85837f', '#5c5853', 10, 31); ft.repeat.set(10, 10);   /* m-3d: grey polished marble like fight_1.jpg (was near-white, blew out under ACES) */
    var floor = new T.Mesh(new T.PlaneGeometry(26, 26).rotateX(-Math.PI / 2), new T.MeshStandardMaterial({ map: ft, roughness: .55, metalness: 0, envMapIntensity: .35 })); floor.position.y = -.28; floor.receiveShadow = true; sc.add(floor);
    /* walls with arched windows and purple banners */
    var st = stoneTex(T); st.repeat.set(6, 3);
    var wm = new T.MeshStandardMaterial({ map: st, color: '#b4b3b8', roughness: .9 }), win = new T.MeshBasicMaterial({ color: '#e3efff' }), ban = new T.MeshStandardMaterial({ color: '#4a1757', roughness: .85 }), banT = new T.MeshStandardMaterial({ color: '#d7aa45', roughness: .4, metalness: .7 });
    var arch = new T.Shape(); arch.moveTo(-.8, 0); arch.lineTo(-.8, 3.6); arch.absarc(0, 3.6, .8, Math.PI, 0, true); arch.lineTo(.8, 0); arch.lineTo(-.8, 0);
    var walls = [], wins = [], bans = [], gold = [], rotY = function (geo, w) { return geo.applyMatrix4(new T.Matrix4().makeRotationY(w * Math.PI / 2)); };
    for (var w2 = 0; w2 < 4; w2++) {
      walls.push(rotY(new T.PlaneGeometry(26, 11).translate(0, 5.2, -12), w2));
      for (var k = -1; k <= 1; k++) {
        wins.push(rotY(new T.ShapeGeometry(arch, 8).translate(k * 6, 1.1, -11.95), w2));
        gold.push(rotY(new T.BoxGeometry(.08, 4.3, .04).translate(k * 6, 3.3, -11.93), w2), rotY(new T.BoxGeometry(1.6, .08, .04).translate(k * 6, 3.4, -11.93), w2));   /* mullions */
        bans.push(rotY(new T.PlaneGeometry(1.3, 4.2).translate(k * 6 + 3, 5.4, -11.9), w2));
        bans.push(rotY(new T.ConeGeometry(.65, .7, 3).rotateZ(Math.PI).scale(1, 1, .02).translate(k * 6 + 3, 2.95, -11.9), w2));
        gold.push(rotY(new T.BoxGeometry(1.5, .12, .08).translate(k * 6 + 3, 7.5, -11.88), w2));
      }
    }
    sc.add(new T.Mesh(plainMerge(T, walls), wm)); sc.add(new T.Mesh(plainMerge(T, wins), win)); sc.add(new T.Mesh(plainMerge(T, bans), ban)); sc.add(new T.Mesh(plainMerge(T, gold), banT));
    /* pillars */
    var pm = new T.MeshStandardMaterial({ color: '#cfd1cf', roughness: .55 });
    var pil = [];
    [-7.5, 7.5].forEach(function (x) { [-7.5, -2.5, 2.5, 7.5].forEach(function (z) {
      pil.push(new T.CylinderGeometry(.42, .48, 8, 12).translate(x, 3.7, z), new T.BoxGeometry(1.2, .35, 1.2).translate(x, -.1, z), new T.BoxGeometry(1.2, .35, 1.2).translate(x, 7.6, z));
    }); });
    /* braziers (two lit: point lights are the expensive part on phones) */
    B.flames = []; var bowls = [];
    var bowlM = new T.MeshStandardMaterial({ color: '#2a2a2c', roughness: .35, metalness: .8 }), pedM = new T.MeshStandardMaterial({ color: '#d6d4ce', roughness: .6 });
    [[-5.6, 4.6], [5.6, -4.6], [5.6, 4.6], [-5.6, -4.6]].forEach(function (p, k) {
      pil.push(new T.CylinderGeometry(.25, .4, 1, 8).translate(p[0], .22, p[1])); bowls.push(new T.CylinderGeometry(.75, .3, .35, 10).translate(p[0], .9, p[1]));
      var fl = new T.Mesh(new T.ConeGeometry(.38, .9, 7), new T.MeshBasicMaterial({ color: '#ff7a1e', transparent: true, opacity: .55, blending: T.AdditiveBlending, depthWrite: false }));
      fl.position.set(p[0], 1.55, p[1]); sc.add(fl);
      var gl = new T.Sprite(new T.SpriteMaterial({ map: glowTex(T), color: '#ff9a2a', transparent: true, blending: T.AdditiveBlending, depthWrite: false })); gl.scale.setScalar(2.4); gl.position.set(p[0], 1.6, p[1]); sc.add(gl);
      var light = null; if (k < 2) { light = new T.PointLight('#ff9d3c', 5, 9, 1.6); light.position.set(p[0], 1.9, p[1]); sc.add(light); }
      B.flames.push({ m: fl, g: gl, l: light, ph: k * 1.7 });
    });
    sc.add(new T.Mesh(plainMerge(T, pil), pm)); sc.add(new T.Mesh(plainMerge(T, bowls), bowlM)); void pedM;
    sc.fog = new T.Fog('#9a9da6', 16, 38); sc.background = new T.Color('#9a9da6');   /* m-3d: greyer stone hall like fight_1.jpg (was near-white) */
    var band = new T.Mesh(new T.PlaneGeometry(W + 2.4, D + 2.4).rotateX(-Math.PI / 2), new T.MeshStandardMaterial({ color: '#a3854a', roughness: .55, metalness: .2 })); band.position.y = -.276; band.receiveShadow = true; S.root.add(band);   /* gold carpet border round the board */
  }

  /* ---------------- UI: skip + speed pill ---------------- */
  function ui() {
    var wrap = document.getElementById('board-wrap'); if (!wrap) return;
    if (!document.getElementById('b3-css')) {
      var cs = document.createElement('style'); cs.id = 'b3-css';
      cs.textContent = '.b3-ui{position:absolute;right:8px;bottom:8px;z-index:7;display:flex;gap:6px;pointer-events:none}' +
        '.b3-ui button{pointer-events:auto;font:600 13px/1 system-ui,sans-serif;color:#fff;background:rgba(20,18,26,.72);border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:8px 12px;min-height:34px;-webkit-tap-highlight-color:transparent}' +
        '.b3-ui .b3-skip{display:none}.b3-ui.on .b3-skip{display:block}';
      document.head.appendChild(cs);
    }
    var d = document.createElement('div'); d.className = 'b3-ui';
    d.innerHTML = '<button class="b3-skip" type="button" aria-label="Skip the fight">Skip \u25b8\u25b8</button><button class="b3-fights" type="button" aria-label="Which fights to show"></button><button class="b3-spd" type="button" aria-label="Animation speed"></button>';
    wrap.appendChild(d); B.ui = d;
    var sp = d.querySelector('.b3-spd'), sk = d.querySelector('.b3-skip'), fb = d.querySelector('.b3-fights');
    function label() {
      sp.textContent = B.speed + 'x';
      fb.textContent = B.allFights ? 'All fights' : 'New fights';
      fb.title = B.allFights ? 'Every capture plays its fight' : 'A fight between the same two piece types plays once, then skips';
      fb.setAttribute('aria-pressed', String(!!B.allFights));
    }
    label();
    sp.addEventListener('click', function (e) { e.stopPropagation(); B.speed = B.speed === 1 ? 2 : 1; try { localStorage.setItem(SPEED_KEY, String(B.speed)); } catch (_) { /* private mode */ } label(); });
    sk.addEventListener('click', function (e) { e.stopPropagation(); B.ff = true; });
    fb.addEventListener('click', function (e) { e.stopPropagation(); B.allFights = !B.allFights; try { localStorage.setItem(FIGHTS_KEY, B.allFights ? 'all' : 'new'); } catch (_) { /* private mode */ } label(); });
  }

  /* ---------------- attach / detach / play ---------------- */
  function attach(ctx) {
    detach();
    if (!CM.scene3d || !CM.scene3d.supported()) return Promise.resolve(null);
    var G = ctx.game, fl = !!(G.flipped && G.flipped()), sp = 1;
    try { sp = +localStorage.getItem(SPEED_KEY) === 2 ? 2 : 1; } catch (_) { sp = 1; }
    var fa = false; try { fa = localStorage.getItem(FIGHTS_KEY) === 'all'; } catch (_) { fa = false; }
    var me = B = { ctx: ctx, map: {}, waits: [], fx: [], clock: 0, speed: sp, ff: false, allFights: fa, seen: {}, seq: 0, busy: false, rockMat: {}, flip: fl, batches: {}, flames: [] };
    return CM.scene3d.attach(ctx, {
      board: false, pieces: false, highlights: true, lights: false,
      orbit: { minPhi: .35, maxPhi: 1.35 }, toneMapping: 'aces', exposure: 1.05, env: .6, background: '#c3c6cd',
      camera: { theta: fl ? Math.PI : 0, phi: .98, fov: 36, dist: 14.4, target: [0, 0, .55] }, lastColor: '#f6d860', lastOpacity: .38,
      onTap: function (i, e) {
        if (B !== me) return false;
        if (B.busy) { B.ff = true; return true; }   /* a tap during a fight fast-forwards it */
        if (i >= 0 || !me.S) return false;
        var S = me.S, T = S.THREE, r = S.canvas.getBoundingClientRect(), ray = new T.Raycaster(), hit = new T.Vector3();   /* the board itself: ray onto y = 0 */
        ray.setFromCamera(new T.Vector2((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1), S.camera);
        if (!ray.ray.intersectPlane(new T.Plane(new T.Vector3(0, 1, 0), 0), hit)) return true;
        var g = ctx.V.geo, col = Math.round(hit.x + (g.files - 1) / 2), row = Math.round(hit.z + (g.ranks - 1) / 2);
        for (var k = 0; k < g.size; k++) if (g.valid[k] && g.col(k) === col && g.row(k) === row) { ctx.game.onTap(k, {}); break; }
        return true;
      },
      onFrame: function (S, dt, now) {
        if (B !== me || !me.S) return;
        var t = now / 1000, sdt = dt * speed();
        B.clock += sdt;
        B.waits = B.waits.filter(function (w) { if (B.clock >= w.at) { w.res(); return false; } return true; });
        if (B.camTw) B.camTw();
        var f2 = !!(G.flipped && G.flipped()); if (f2 !== B.flip) { B.flip = f2; S.setCamera({ theta: S.cam.theta + Math.PI }, 700); }
        if (!B.busy && G.state && sigOf() !== B.sig) reconcile(false);
        var won = G.over && !B.busy ? G.over.w : null;
        if (won && (won === 'w' || won === 'b') && /mate/i.test(G.over.why || '') && B.mated !== B.sig) {   /* checkmate: the beaten king falls */
          B.mated = B.sig; Object.keys(B.map).forEach(function (k) { var ch = B.map[k]; if (ch.t === 'K' && ch.c !== won) { ch.faceTo = ch.face; act(ch, 'die', DIE); ch.act.style = 'fall'; } });
        }
        if (!B.busy && !won && animMs() && B.clock > (B.nextFidget || 3)) {
          B.nextFidget = B.clock + 1.6 + Math.random() * 2.4;
          var idle = Object.keys(B.map).map(function (k) { return B.map[k]; }).filter(function (c) { return !c.act && !c.path && !c.tower && !c.cheer; });
          var fc = idle[Math.floor(Math.random() * idle.length)];
          if (fc) { var fd = FIDGET[fc.cls === 'P' && fc.c === 'b' ? 'Pb' : fc.cls]; if (fd) { act(fc, 'fidget', fd); if (fd.sparkle) { var fcc = fc; wait(fd.dur * fd.sparkle).then(function () { if (B && !fcc.dead) spark(handPos(fcc), PAL[fcc.c].magic, 8, 1.2, .1); }); } } }
        }
        Object.keys(B.map).forEach(function (k) { var ch = B.map[k]; ch.cheer = !!won && ch.c === won; });
        var all = Object.keys(B.map).map(function (k) { return B.map[k]; }).concat(B.extra || []);
        all.forEach(function (ch) { if (ch.awakeTw) ch.awakeTw(); stepPath(ch); poseChar(ch, B.clock, sdt); });
        draw(); stepFx(sdt);
        B.flames.forEach(function (f) { var s = 1 + Math.sin(t * 9 + f.ph) * .08 + Math.sin(t * 23 + f.ph) * .05; f.m.scale.set(1, s, 1); if (f.l) f.l.intensity = 5 * (.85 + .15 * s); f.g.material.opacity = .55 + .1 * s; });
        if (B.ui) B.ui.classList.toggle('on', B.busy);
      }
    }).then(function (S) {
      if (!S || B !== me) return null;
      me.S = S;
      me.mat = { c: new S.THREE.MeshStandardMaterial({ vertexColors: true, roughness: .78, metalness: 0, side: S.THREE.DoubleSide }),
        m: new S.THREE.MeshStandardMaterial({ vertexColors: true, roughness: .3, metalness: .88 }),
        e: new S.THREE.MeshBasicMaterial({ vertexColors: true }) };
      try { hall(S, S.THREE); } catch (e) { console.warn('[battle3d] hall', e); B.flames = B.flames || []; }
      reconcile(false);
      /* lift the VFX layer (#board-fx: overlays, banners) above the canvas, as view3d does */
      var fx = document.getElementById('board-fx'), wrap = document.getElementById('board-wrap');
      if (fx && wrap) { me.fxHome = fx.parentNode; me.fxNext = fx.nextSibling; wrap.appendChild(fx); fx.style.zIndex = '6'; me.fxEl = fx; }
      if (wrap) wrap.classList.add('v3d-on');
      ui();
      if (animMs()) { var c0 = { theta: S.cam.theta, phi: S.cam.phi, dist: S.cam.dist }; S.cam.phi = .5; S.cam.dist = 15; S.setCamera(c0, 1100); }
      return S;
    }).catch(function (e) { console.warn('[battle3d] 3D unavailable, keeping the 2D board:', e && e.message); detach(); return null; });
  }
  function detach() {
    var me = B; if (!me) return; B = null;
    me.waits.forEach(function (w) { w.res(); });
    if (me.ui && me.ui.parentNode) me.ui.parentNode.removeChild(me.ui);
    if (me.fxEl && me.fxHome) { me.fxEl.style.zIndex = ''; me.fxHome.insertBefore(me.fxEl, me.fxNext && me.fxNext.parentNode === me.fxHome ? me.fxNext : null); }
    var wrap = document.getElementById('board-wrap'); if (wrap) wrap.classList.remove('v3d-on');
    if (me.S && CM.scene3d.current() === me.S) CM.scene3d.detach();
    if (me.mat) Object.keys(me.mat).forEach(function (k) { me.mat[k].dispose(); });
  }
  /* scene3d detaches itself when the game screen changes; make sure we let go too */
  setInterval(function () { if (B && B.S && CM.scene3d.current() !== B.S) detach(); }, 1000);

  function play(ctx, m, info) {
    if (!B || !B.S || B.ctx !== ctx || !animMs() || m.drop || m.f == null || m.f < 0 || !B.map[m.f]) return null;
    var me = B, my = ++B.seq, gid = ctx.game.gid;
    B.busy = true; B.ff = false;
    var t0 = performance.now();
    var guard = setInterval(function () { if (B !== me || ctx.game.gid !== gid || performance.now() - t0 > 45000) {   /* left / new game / watchdog: never keep the board locked */ clearInterval(guard); me.seq++; me.waits.forEach(function (w) { w.res(); }); } }, 250);
    return sequence(m, info, my).catch(function (e) { console.warn('[battle3d] sequence', e); }).then(function () {
      clearInterval(guard);
      if (B !== me) return;
      B.busy = false; B.ff = false; B.S.lockCam = false;
      if (B.seq === my) reconcile(false);
      else { (B.extra || []).forEach(removeChar); B.extra = []; reconcile(true); }   /* aborted (new game): drop the actors, snap to the state */
    });
  }
  CM.battle3d = { attach: attach, detach: detach, play: play, current: function () { return B; } };
})();
