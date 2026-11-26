/* fps3d/models: original low-poly models for the 3D FPS Chess duel (js/modes/fps3d/duel.js), built in code from
   primitives (lathe-turned chess pieces at human scale and the class weapons the videos show). No external
   model files: everything here is original work released CC0 with the project (see LICENSES.md).
   Units are metres. A piece's model stands on y = 0 and faces -z (its weapon on the right, +x). */
(function () {
  'use strict';
  var CM = window.CM;
  /* heights in metres: a pawn is a person, the king a giant (the strongest fighter, transcript 0:35) */
  var HEIGHT = { P: 1.8, N: 2.3, B: 2.5, R: 2.2, Q: 2.75, K: 2.95 };
  /* lathe profiles [radius, height] in a unit-height space (radius is scaled by the same factor) */
  var PROFILE = {
    P: [[0, 0], [.36, 0], [.36, .07], [.3, .11], [.2, .16], [.13, .42], [.21, .46], [.2, .5], [.12, .53], [.17, .6], [.2, .72], [.17, .84], [.09, .92], [0, .95]],
    R: [[0, 0], [.38, 0], [.38, .08], [.31, .13], [.25, .2], [.22, .66], [.3, .72], [.31, .9], [.24, .9], [.24, .84], [0, .84]],
    B: [[0, 0], [.36, 0], [.36, .07], [.29, .12], [.19, .18], [.12, .52], [.21, .56], [.13, .6], [.19, .7], [.2, .8], [.14, .9], [.06, .96], [.08, .98], [0, 1]],
    Q: [[0, 0], [.37, 0], [.37, .07], [.3, .12], [.2, .19], [.12, .6], [.22, .64], [.14, .68], [.24, .9], [.18, .92], [.1, .95], [0, .97]],
    K: [[0, 0], [.37, 0], [.37, .07], [.3, .12], [.2, .19], [.13, .62], [.23, .66], [.15, .7], [.23, .86], [.16, .89], [.07, .9], [0, .9]],
    N: [[0, 0], [.36, 0], [.36, .07], [.3, .12], [.24, .18], [.22, .3], [0, .3]]
  };
  var geoCache = {};
  function key(t) { return 'PNBRQK'.indexOf(t) >= 0 ? t : 'P'; }
  /* geometry parts of one piece type at its real height: [{ geo, part }] (part 'body' | 'trim'), cached per type */
  function pieceParts(T, t) {
    t = key(t);
    if (geoCache[t]) return geoCache[t];
    var H = HEIGHT[t], pts = PROFILE[t].map(function (p) { return new T.Vector2(p[0] * H, p[1] * H); });
    var parts = [{ geo: new T.LatheGeometry(pts, 20), part: 'body' }];   /* 20 segments: smooth glossy Staunton pieces like the VS cards */
    if (t === 'K') {
      parts.push({ geo: new T.BoxGeometry(.13 * H, .1 * H, .13 * H).translate(0, .95 * H, 0), part: 'body' });
      parts.push({ geo: new T.BoxGeometry(.06 * H, .16 * H, .06 * H).translate(0, 1.07 * H, 0), part: 'trim' });
      parts.push({ geo: new T.BoxGeometry(.17 * H, .05 * H, .06 * H).translate(0, 1.08 * H, 0), part: 'trim' });
    }
    if (t === 'Q') for (var i = 0; i < 6; i++) {
      var a = i * Math.PI / 3;
      parts.push({ geo: new T.IcosahedronGeometry(.035 * H, 0).translate(Math.cos(a) * .2 * H, .96 * H, Math.sin(a) * .2 * H), part: 'trim' });
    }
    if (t === 'Q') parts.push({ geo: new T.IcosahedronGeometry(.05 * H, 0).translate(0, 1.0 * H, 0), part: 'trim' });
    if (t === 'R') for (var k = 0; k < 4; k++) {
      var b = k * Math.PI / 2 + Math.PI / 4;
      parts.push({ geo: new T.BoxGeometry(.13 * H, .1 * H, .13 * H).translate(Math.cos(b) * .24 * H, .93 * H, Math.sin(b) * .24 * H), part: 'body' });
    }
    if (t === 'B') parts.push({ geo: new T.BoxGeometry(.03 * H, .14 * H, .3 * H).rotateX(.5).translate(0, .82 * H, -.06 * H), part: 'trim' });
    if (t === 'N') {   /* horse head: an extruded side silhouette, muzzle towards -z */
      var s = new T.Shape(), q = [[.2, .28], [-.18, .28], [-.16, .5], [-.34, .6], [-.38, .72], [-.2, .88], [-.06, .99], [.0, 1.05], [.06, .95],
        [.18, .88], [.24, .66], [.2, .28]];
      s.moveTo(q[0][0] * H, q[0][1] * H); for (var j = 1; j < q.length; j++) s.lineTo(q[j][0] * H, q[j][1] * H);
      var ex = new T.ExtrudeGeometry(s, { depth: .22 * H, bevelEnabled: true, bevelSize: .025 * H, bevelThickness: .025 * H, bevelSegments: 1 });
      ex.translate(0, 0, -.11 * H); ex.rotateY(-Math.PI / 2);
      parts.push({ geo: ex, part: 'body' });
      parts.push({ geo: new T.BoxGeometry(.05 * H, .3 * H, .05 * H).translate(0, .86 * H, .15 * H), part: 'trim' });   /* mane ridge */
    }
    geoCache[t] = parts;
    return parts;
  }
  /* a piece model: Group with userData.height / radius. opts: { body: Material, trim: Material, shadow: bool } */
  function piece(T, t, opts) {
    var g = new T.Group(), H = HEIGHT[key(t)];
    pieceParts(T, t).forEach(function (pp) {
      var m = new T.Mesh(pp.geo, pp.part === 'trim' && opts.trim ? opts.trim : opts.body);
      m.castShadow = opts.shadow !== false; m.receiveShadow = false; g.add(m);
    });
    g.userData.height = H; g.userData.radius = PROFILE[key(t)][1][0] * H;
    return g;
  }
  /* the duelling unit: the piece holding its weapon (tinted by the piece colour) plus an invisible hitbox (body cylinder
     + head sphere) that the hitscan raycasts against. opts: { body, trim, c: 'w' | 'b' } */
  function unit(T, t, opts) {
    var g = piece(T, t, opts), H = g.userData.height, R = g.userData.radius;
    var w = weapon(T, t, opts.c || 'w'); w.scale.setScalar(1.7); w.position.set(R * 1.05, H * .5, -R * .3); g.add(w);
    g.userData.weapon = w; g.userData.muzzle = w.userData.muzzle;
    var hidden = new T.MeshBasicMaterial({ visible: false });
    var body = new T.Mesh(new T.CylinderGeometry(R * .9, R * 1.05, H * .78, 8), hidden); body.position.y = H * .39; body.userData.hit = 'body';
    var head = new T.Mesh(new T.SphereGeometry(R * .75, 8, 6), hidden); head.position.y = H * .86; head.userData.hit = 'head';
    g.add(body); g.add(head); g.userData.hitboxes = [body, head];
    return g;
  }
  /* weapon colours: a white piece's gun is tan / cream, a black piece's dark (PszkLYudcws, Nz2A-g73_iM duel frames) */
  var TINT = {
    w: { wood: '#d8bf93', wood2: '#c4a676', metal: '#b9ae98', dark: '#8a7d66', blade: '#ece4d0' },
    b: { wood: '#3a302a', wood2: '#2a221d', metal: '#4a4847', dark: '#1d1b1a', blade: '#5a5856' }
  };
  /* the class weapons as the videos show them (research/ref/m-fps/SPEC.md), built in camera-space metres (forward = -z):
     P flintlock musket, N bow with a nocked arrow, B long dark musket with a round muzzle ball, R scoped sniper rifle,
     Q minigun (spinning barrel cluster), K big flat sword. userData: muzzle (Object3D at the barrel tip), arrow / string
     (bow draw), spin (minigun barrels) */
  function weapon(T, t, c) {
    var k = TINT[c === 'b' ? 'b' : 'w'], g = new T.Group(), mz = new T.Object3D();
    var mats = {}; function M(col) { return mats[col] || (mats[col] = new T.MeshLambertMaterial({ color: col })); }
    var wood = M(k.wood), wood2 = M(k.wood2), metal = M(k.metal), dark = M(k.dark);
    function box(w, h, d, x, y, z, m, p) { var b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x, y, z); (p || g).add(b); return b; }
    function cyl(r, l, x, y, z, m, p, r2) { var cc = new T.Mesh(new T.CylinderGeometry(r, r2 == null ? r : r2, l, 10).rotateX(Math.PI / 2), m); cc.position.set(x, y, z); (p || g).add(cc); return cc; }
    if (t === 'P') {   /* flintlock musket: long wooden stock to the muzzle, metal barrel on top, lock + hammer, curved butt */
      box(.06, .07, .78, 0, -.01, -.34, wood); var butt = box(.065, .13, .24, 0, -.05, .12, wood); butt.rotation.x = -.18;
      cyl(.014, .86, 0, .035, -.42, metal); box(.03, .04, .09, .03, .03, -.02, metal); var ham = box(.012, .05, .02, .03, .07, .02, dark); ham.rotation.x = -.5;
      box(.012, .02, .012, 0, .055, -.8, metal); cyl(.018, .025, 0, .035, -.85, dark);
      mz.position.set(0, .035, -.87);
    } else if (t === 'N') {   /* bow: upright curved limbs, a string, an arrow nocked on the string (pulled back while drawing) */
      var limb = new T.Mesh(new T.TorusGeometry(.34, .014, 5, 20, Math.PI * .9), wood); limb.rotation.set(0, Math.PI / 2, Math.PI / 2 + Math.PI * .05); limb.position.set(0, 0, -.3); g.add(limb);
      box(.035, .1, .04, 0, 0, -.62, wood2);
      var str = new T.Mesh(new T.BoxGeometry(.004, .62, .004), new T.MeshBasicMaterial({ color: c === 'b' ? '#777' : '#eee' })); str.position.set(0, 0, -.3); g.add(str);
      var arrow = new T.Group(); cyl(.006, .62, 0, 0, -.31, wood2, arrow); var tip = new T.Mesh(new T.ConeGeometry(.016, .05, 6).rotateX(-Math.PI / 2), metal); tip.position.z = -.64; arrow.add(tip);
      box(.002, .03, .06, 0, .012, -.02, M('#c0392b'), arrow); arrow.position.set(0, 0, -.3); g.add(arrow);
      g.userData.arrow = arrow; g.userData.string = str;
      mz.position.set(0, 0, -.95);
    } else if (t === 'B') {   /* long dark musket with a round ball at the muzzle */
      box(.055, .065, .9, 0, -.01, -.4, wood2); box(.06, .12, .22, 0, -.05, .14, wood2);
      cyl(.016, 1.1, 0, .03, -.55, dark); var ball = new T.Mesh(new T.SphereGeometry(.034, 10, 8), dark); ball.position.set(0, .03, -1.12); g.add(ball);
      box(.03, .04, .08, .03, .025, -.03, metal);
      mz.position.set(0, .03, -1.16);
    } else if (t === 'R') {   /* scoped sniper rifle */
      box(.06, .08, .5, 0, 0, -.18, dark); box(.055, .11, .26, 0, -.03, .18, wood); box(.04, .11, .05, 0, -.1, -.04, wood);
      cyl(.013, .62, 0, .015, -.73, metal); cyl(.02, .05, 0, .015, -1.03, dark);
      cyl(.022, .3, 0, .085, -.2, dark); cyl(.03, .03, 0, .085, -.36, dark); cyl(.028, .03, 0, .085, -.04, dark);
      box(.012, .03, .012, 0, .055, -.26, metal); box(.012, .03, .012, 0, .055, -.13, metal);
      mz.position.set(0, .015, -1.06);
    } else if (t === 'Q') {   /* minigun: six barrels round a spinning axle, a boxy housing and a carry handle */
      box(.13, .13, .3, 0, -.02, .02, dark); box(.04, .06, .14, 0, .08, .02, metal);
      var spin = new T.Group(); spin.position.set(0, 0, -.14); g.add(spin);
      for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3; cyl(.012, .62, Math.cos(a) * .035, Math.sin(a) * .035, -.31, metal, spin); }
      cyl(.05, .03, 0, 0, -.12, dark, spin); cyl(.05, .03, 0, 0, -.55, dark, spin);
      g.userData.spin = spin;
      mz.position.set(0, 0, -.8);
    } else {   /* king: a big flat sword (Nz2A-g73_iM 10:08) */
      var blade = M(k.blade);
      box(.15, .018, 1.05, 0, 0, -.66, blade); var pt = new T.Mesh(new T.ConeGeometry(.106, .16, 4).rotateX(-Math.PI / 2).rotateZ(Math.PI / 4), blade); pt.scale.set(1, .17, 1); pt.position.z = -1.26; g.add(pt);
      box(.32, .04, .05, 0, 0, -.12, metal); box(.04, .04, .18, 0, 0, -.01, wood2); var pm = new T.Mesh(new T.SphereGeometry(.035, 8, 6), metal); pm.position.z = .1; g.add(pm);
      mz.position.set(0, 0, -1.3);
    }
    g.add(mz); g.userData.muzzle = mz;
    return g;
  }
  /* first-person viewmodel: the class weapon tinted by the player's piece colour */
  function viewmodel(T, t, c) { return weapon(T, t, c); }
  CM.fps3dModels = { HEIGHT: HEIGHT, piece: piece, unit: unit, weapon: weapon, viewmodel: viewmodel };
})();
