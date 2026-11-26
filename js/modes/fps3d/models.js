/* fps3d/models: original low-poly models for the 3D FPS Chess duel (js/modes/fps3d/duel.js), built in code from
   primitives (lathe-turned chess pieces at human scale, first-person weapon viewmodels, arena props). No external
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
  /* the duelling unit: the piece plus a glowing visor band (team colour), a held weapon and an invisible hitbox
     (body cylinder + head sphere) that the hitscan raycasts against */
  function unit(T, t, opts) {
    var g = piece(T, t, opts), H = g.userData.height, R = g.userData.radius;
    if (opts.band) { var band = new T.Mesh(new T.TorusGeometry(R * .55, .045 * H * .6, 4, 12), opts.band); band.rotation.x = Math.PI / 2; band.position.y = H * (t === 'N' ? .8 : .74); g.add(band); }
    var w = handWeapon(T, t, opts.metal || opts.trim || opts.body); w.position.set(R * 1.05, H * .48, -R * .3); g.add(w);
    g.userData.muzzle = w.userData.muzzle;
    var hidden = new T.MeshBasicMaterial({ visible: false });
    var body = new T.Mesh(new T.CylinderGeometry(R * .9, R * 1.05, H * .78, 8), hidden); body.position.y = H * .39; body.userData.hit = 'body';
    var head = new T.Mesh(new T.SphereGeometry(R * .75, 8, 6), hidden); head.position.y = H * .86; head.userData.hit = 'head';
    g.add(body); g.add(head); g.userData.hitboxes = [body, head];
    return g;
  }
  /* a simple held weapon for the enemy unit (third person), userData.muzzle = Object3D at the barrel tip */
  function handWeapon(T, t, mat) {
    var g = new T.Group(), mz = new T.Object3D();
    if (t === 'K') { g.add(new T.Mesh(new T.BoxGeometry(.08, .08, 1.5).translate(0, 0, -.75), mat)); g.add(new T.Mesh(new T.BoxGeometry(.4, .06, .08), mat)); mz.position.set(0, 0, -1.5); }
    else if (t === 'N') {   /* crossbow (PszkLYudcws duel still): stock along -z, horizontal limbs at the front */
      var wd = new T.MeshLambertMaterial({ color: '#6b4226' }); g.add(new T.Mesh(new T.BoxGeometry(.12, .12, 1).translate(0, 0, -.4), wd));
      var prod = new T.Mesh(new T.TorusGeometry(.42, .03, 3, 10, Math.PI), mat); prod.rotation.set(-Math.PI / 2, 0, 0); prod.position.set(0, .03, -.75); g.add(prod); mz.position.set(0, .05, -.95);
    }
    else if (t === 'B') { g.add(new T.Mesh(new T.CylinderGeometry(.03, .04, .9, 5).rotateX(Math.PI / 2).translate(0, 0, -.45), mat)); mz.position.set(0, 0, -.95); }
    else if (t === 'P') {   /* AK (Nz2A-g73_iM thumbnail): black receiver, wooden stock and handguard, curved magazine */
      var akw = new T.MeshLambertMaterial({ color: '#c0782f' }); g.add(new T.Mesh(new T.BoxGeometry(.1, .13, .55).translate(0, 0, -.3), mat));
      g.add(new T.Mesh(new T.BoxGeometry(.09, .14, .4).translate(0, -.02, .12), akw)); g.add(new T.Mesh(new T.BoxGeometry(.1, .1, .3).translate(0, 0, -.7), akw));
      g.add(new T.Mesh(new T.CylinderGeometry(.025, .025, .35, 6).rotateX(Math.PI / 2).translate(0, .03, -1), mat));
      var mg = new T.Mesh(new T.BoxGeometry(.07, .28, .1), mat); mg.position.set(0, -.17, -.42); mg.rotation.x = .35; g.add(mg); mz.position.set(0, .03, -1.18);
    }
    else { var L = t === 'Q' ? 1.1 : .95; g.add(new T.Mesh(new T.BoxGeometry(.12, .16, L).translate(0, 0, -L / 2), mat)); mz.position.set(0, .02, -L); }
    g.add(mz); g.userData.muzzle = mz;
    return g;
  }
  /* first-person viewmodel per class weapon: Group placed in the viewmodel scene in camera space, userData.muzzle */
  function viewmodel(T, t, accent) {
    var g = new T.Group(), mz = new T.Object3D();
    var dark = new T.MeshLambertMaterial({ color: '#2b2d31' }), steel = new T.MeshLambertMaterial({ color: '#8d939b' });
    var wood = new T.MeshLambertMaterial({ color: '#6b4226' }), glow = new T.MeshBasicMaterial({ color: accent || '#9fd8ff' });
    var gold = new T.MeshLambertMaterial({ color: '#c9a227' }), skin = new T.MeshLambertMaterial({ color: '#d9c4a0' });
    function box(w, h, d, x, y, z, m) { var b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x, y, z); g.add(b); return b; }
    function cyl(r, l, x, y, z, m) { var c = new T.Mesh(new T.CylinderGeometry(r, r, l, 8).rotateX(Math.PI / 2), m); c.position.set(x, y, z); g.add(c); return c; }
    if (t === 'P') {   /* AK rifle (Nz2A-g73_iM thumbnail): black receiver, orange-brown wood stock / handguard / grip, curved magazine */
      var akw = new T.MeshLambertMaterial({ color: '#c0782f' });
      box(.07, .09, .42, 0, 0, -.2, dark); box(.065, .08, .26, 0, -.005, -.5, akw); box(.06, .1, .3, 0, -.03, .14, akw); box(.045, .11, .06, 0, -.1, -.04, akw);
      cyl(.012, .26, 0, .025, -.74, dark); box(.012, .05, .012, 0, .06, -.82, dark); box(.05, .025, .2, 0, .055, -.22, steel);
      [0, 1, 2].forEach(function (k) { var mg = box(.05, .07, .07, 0, -.08 - k * .06, -.27 + k * .025, dark); mg.rotation.x = .2 + k * .12; });
      mz.position.set(0, .025, -.88);
    } else if (t === 'Q') {   /* rifle */
      box(.08, .1, .7, 0, 0, -.25, dark); box(.06, .12, .26, 0, -.02, .2, wood); box(.05, .16, .08, 0, -.12, -.2, dark); cyl(.02, .3, 0, .02, -.72, steel);
      box(.05, .05, .16, 0, .08, -.2, steel); box(.06, .14, .06, 0, -.1, -.02, wood);
      mz.position.set(0, .02, -.88);
    } else if (t === 'R') {   /* double-barrel shotgun */
      cyl(.03, .7, -.032, .02, -.38, steel); cyl(.03, .7, .032, .02, -.38, steel); box(.11, .09, .34, 0, -.02, .04, wood); box(.07, .15, .1, 0, -.1, .16, wood);
      mz.position.set(0, .02, -.75);
    } else if (t === 'N') {   /* wooden crossbow (PszkLYudcws duel still: turned-wood stock with a big round butt, bolt on top, prod at the front) */
      var wd2 = new T.MeshLambertMaterial({ color: '#7a4a28' }), wd3 = new T.MeshLambertMaterial({ color: '#4e2e18' });
      box(.07, .08, .62, 0, 0, -.22, wd2); var butt = cyl(.1, .1, 0, -.03, .12, wd3); butt.scale.set(1, 1.15, 1); cyl(.06, .08, 0, -.01, .03, wd2);
      var prod = new T.Mesh(new T.TorusGeometry(.26, .014, 4, 14, Math.PI), wd3); prod.rotation.set(-Math.PI / 2, 0, 0); prod.position.set(0, .03, -.48); g.add(prod);
      var str = new T.Mesh(new T.BoxGeometry(.5, .004, .004), new T.MeshBasicMaterial({ color: '#ddd' })); str.position.set(0, .03, -.36); g.add(str);
      var arrow = cyl(.007, .42, 0, .05, -.4, steel); box(.02, .02, .05, 0, .05, -.63, steel); g.userData.arrow = arrow;
      mz.position.set(0, .05, -.66);
    } else if (t === 'B') {   /* wand */
      cyl(.012, .5, 0, 0, -.25, wood); var gem = new T.Mesh(new T.IcosahedronGeometry(.035, 0), glow); gem.position.set(0, 0, -.52); g.add(gem); g.userData.gem = gem;
      box(.05, .07, .09, 0, -.02, .02, skin);
      mz.position.set(0, 0, -.56);
    } else {   /* king: royal blade */
      box(.06, .015, .95, 0, 0, -.55, steel); box(.2, .03, .04, 0, 0, -.06, gold); box(.035, .035, .16, 0, 0, .04, wood); box(.05, .05, .05, 0, 0, .13, gold);
      mz.position.set(0, 0, -1);
    }
    g.add(mz); g.userData.muzzle = mz;
    return g;
  }
  CM.fps3dModels = { HEIGHT: HEIGHT, piece: piece, unit: unit, viewmodel: viewmodel };
})();
