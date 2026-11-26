p='js/fx/battle3d.js'; s=open(p).read()
def rep(a,b):
    global s
    assert a in s, a[:90]
    s=s.replace(a,b,1)

# ---- keyframe sets: block, fidgets, bump
rep("  var HIT = { dur: .6,",
r'''  var BLOCK = { dur: .7, k: [[0, {}], [.25, { shLx: -1.55, shLz: -.15, elLx: -.55, spineX: -.12, bodyZ: -.06 }], [.6, { shLx: -1.5, shLz: -.15, elLx: -.55, spineX: -.2, bodyZ: -.1 }], [1, {}]] };
  var BUMP = { dur: 1.0, k: [[0, {}], [.35, { shRx: -1.35, shRz: -.1, elRx: -.35, spineX: .1, wpn: .2 }], [.5, { shRx: -1.5, shRz: -.1, elRx: -.1, spineX: .16, wpn: .3 }], [.75, { shRx: -2.7, elRx: -.4, wpn: 0 }], [1, {}]] };
  var FIDGET = {   /* idle personality (one at a time, every few seconds, on a random resting character) */
    P: { dur: 1.8, k: [[0, {}], [.25, { shRx: -.6, elRx: -1.35, wpn: .3 }], [.42, { shRx: -.2, elRx: -.95, wpn: .08, bodyY: -.02 }], [.7, { spineY: .45 }], [1, {}]] },
    Pb: { dur: 2.0, k: [[0, {}], [.3, { shRx: -.25, shRz: -1.45, elRx: -2.0, shLx: -.25, shLz: 1.45, elLx: -2.0, spineX: -.06, wpn: 1.2 }], [.7, { shRx: -.25, shRz: -1.5, elRx: -2.1, shLx: -.25, shLz: 1.5, elLx: -2.1, spineX: -.1, wpn: 1.2 }], [1, {}]] },   /* strongman flex */
    N: { dur: 1.9, k: [[0, {}], [.35, { shRx: -1.95, elRx: -1.25, wpn: -.15 }], [.65, { shRx: -1.95, elRx: -1.25, wpn: -.15, spineY: .2 }], [1, {}]] },     /* sword salute */
    B: { dur: 2.1, k: [[0, {}], [.35, { shRx: -1.25, elRx: -.5, wpn: .1, spineY: -.35 }], [.7, { spineY: .35 }], [1, {}]] },
    Q: { dur: 1.9, k: [[0, {}], [.3, { shRx: -1.4, elRx: -.6, wpn: 1.0 }], [.6, { shRx: -1.75, elRx: -.3, wpn: 1.45, shLx: -.9 }], [1, {}]], sparkle: .5 },  /* wand flourish */
    K: { dur: 1.7, k: [[0, {}], [.4, { shRx: -2.65, elRx: -.3, wpn: 0, spineX: -.08 }], [.7, { shRx: -2.65, elRx: -.3, wpn: 0, spineX: -.08 }], [1, {}]] }      /* sword raised */
  };
  var HIT = { dur: .6,''')

# ---- die styles in poseChar
rep('''      if (a.name === 'die') {
        ch.tipper.rotation.x = -1.45 * Math.pow(seg(k, .12, .48), 2) + Math.sin(seg(k, .48, .6) * Math.PI) * .12;
        ch.tipper.position.y = -1.3 * sm(seg(k, .62, 1));
      }''',
'''      if (a.name === 'die') {
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
      }''')
# promotion spin
rep("    R.body.position.y = (ch.cls === 'G' ? .56 : .92) + p.bodyY;",
'''    if (ch.promoT != null) { var kp = clamp01((now - ch.promoT) / .7); ch.tipper.rotation.y = kp * kp * 16; ch.tipper.position.y = .45 * sm(kp); }
    R.body.position.y = (ch.cls === 'G' ? .56 : .92) + p.bodyY;''')

# ---- sounds helper + strike rework
rep("  function shatter(ch) {",
'''  var SND = { swing: 'assets/modes/rx-HCGCNuDo/swing.wav', stab: 'assets/modes/rx-HCGCNuDo/stab.wav' };
  function sfx(n) { try { if (CM.sound && !B.ff) CM.sound.play(SND[n] || n); } catch (e) { /* no audio */ } }
  function shatter(ch) {''')
rep('''  function strike(att, vic, final) {   /* one attack of att on vic; resolves when it is over */
    var A = ATTACK[att.cls], done = act(att, 'attack', A), col = PAL[att.c];
    var hit = function () {
      if (final) { act(vic, 'die', DIE); vic.dying = true; if (vic.cls === 'G') shatter(vic); }
      else act(vic, 'hit', HIT);''',
'''  var DIE_STYLE = { G: 'squash', Q: 'vanish', B: 'blast' };
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
      sfx(att.cls === 'P' || att.cls === 'N' || att.cls === 'K' ? 'stab' : 'capture');''')

# ---- sequence: queen walks to range, defender response, castle bump, promotion spin
rep('''      var ranged = att.cls === 'Q' && pts[0].distanceTo(pts[pts.length - 1]) > reach + .2;
      var stand = ranged ? pts[0].clone() : trimPath(pts, reach)[trimPath(pts, reach).length - 1];
      S.lockCam = true;
      await Promise.all([camTo(fightCam(stand, vic.root.position), .7), awaken(att, true)]); if (!ok()) return;
      if (!ranged) { await walk(att, trimPath(pts, reach)); if (!ok()) return; }''',
'''      var tp = trimPath(pts, reach), stand = tp[tp.length - 1];
      att.act = null; vic.act = null;
      S.lockCam = true;
      await Promise.all([camTo(fightCam(stand, vic.root.position, [att, vic]), .7), awaken(att, true)]); if (!ok()) return;
      if (stand.distanceTo(pts[0]) > .02) { await walk(att, tp); if (!ok()) return; }''')
rep('''      await strike(vic, att, false); if (!ok()) return;        /* the defender strikes first */
      await wait(.1); await strike(att, vic, true); if (!ok()) return;''',
'''      if (vic.cls === 'P' || vic.cls === 'N') {   /* shield bearers: the first blow rings off the shield, they hit back, then fall */
        await strike(att, vic, false, true); if (!ok()) return;
        await wait(.05); await strike(vic, att, false); if (!ok()) return;
      } else { await strike(vic, att, false); if (!ok()) return; }   /* the defender strikes first */
      await wait(.1); await strike(att, vic, true); if (!ok()) return;''')
rep('''      if (rook) jobs.push(awaken(rook, true).then(function () { return walk(rook, [S.sq2world(m.castle.rf), S.sq2world(m.castle.rt)]); }).then(function () { rook.faceTo = rook.c === 'w' ? Math.PI : 0; return awaken(rook, false); }));
      await Promise.all(jobs); if (!ok()) return;''',
'''      if (rook) {   /* castling: king and golem meet and bump fists (the video's castling gag) */
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
      await Promise.all(jobs); if (!ok()) return;''')
rep('''      spark(chest(att), '#ffd84a', 24, 2.6, .18); await wait(.25); if (!ok()) return;
      var np = ctx.game.state.b[m.t];
      removeChar(att); if (np) { B.map[m.t] = makeChar(S, typeOf(ctx, np), np.c, m.t); }
      await wait(.35);''',
'''      att.promoT = B.clock; sfx('promote');
      for (var pk = 0; pk < 3; pk++) { spark(chest(att), '#ffd84a', 10, 1.8, .16); await wait(.22); if (!ok()) return; }
      spark(chest(att), '#fff6c8', 24, 2.8, .2);
      var np = ctx.game.state.b[m.t];
      removeChar(att);
      if (np) { var nc = B.map[m.t] = makeChar(S, typeOf(ctx, np), np.c, m.t); nc.tipper.position.y = .45; S.tween(function (k) { nc.tipper.position.y = .45 * (1 - k); }, 500); }
      await wait(.5);''')

# ---- fight camera with occlusion scoring
rep('''  function fightCam(pa, pb) {
    var S = B.S, T = S.THREE, mid = pa.clone().add(pb).multiplyScalar(.5), dx = pb.x - pa.x, dz = pb.z - pa.z;
    var t1 = Math.atan2(dz, -dx), t2 = Math.atan2(-dz, dx), cur = S.cam.theta;   /* the two side-on views; take the nearer */
    var d1 = Math.abs(angLerp(cur, t1, 1) - cur), d2 = Math.abs(angLerp(cur, t2, 1) - cur);
    return { theta: d1 <= d2 ? t1 : t2, phi: 1.22, dist: 3.3 + Math.min(2.2, Math.hypot(dx, dz) * .5), target: new T.Vector3(mid.x, .4, mid.z) };
  }''',
'''  function fightCam(pa, pb, actors) {   /* a low three-quarter view of the fight from the side with the fewest characters in the way */
    var S = B.S, T = S.THREE, mid = pa.clone().add(pb).multiplyScalar(.5), dx = pb.x - pa.x, dz = pb.z - pa.z;
    var t1 = Math.atan2(dz, -dx), t2 = Math.atan2(-dz, dx), cur = S.cam.theta, phi = 1.08, dist = 3.6 + Math.min(2.2, Math.hypot(dx, dz) * .5);
    var tgt = new T.Vector3(mid.x, .5, mid.z), others = Object.keys(B.map).map(function (k) { return B.map[k]; }).filter(function (c) { return actors.indexOf(c) < 0; });
    var best = null;
    [t1, t2, t1 + .55, t1 - .55, t2 + .55, t2 - .55].forEach(function (th) {
      var cam = new T.Vector3().setFromSpherical(new T.Spherical(dist, phi, th)).add(tgt), seg3 = new T.Line3(cam, tgt), cp = new T.Vector3(), score = 0;
      others.forEach(function (c) {
        var q = c.root.position.clone(); q.y = .5; var f = seg3.closestPointToPointParameter(q, true); seg3.at(f, cp);
        if (f > .04 && f < .9 && cp.distanceTo(q) < .5) score += 1;
      });
      score += Math.abs(angLerp(cur, th, 1) - cur) * .15 + (th === t1 || th === t2 ? 0 : .25);
      if (!best || score < best.s) best = { s: score, th: th };
    });
    return { theta: best.th, phi: phi, dist: dist, target: tgt };
  }''')

# ---- reconcile: a dead/dying character never stays
rep("Object.keys(have).forEach(function (i) { var ch = have[i]; if (want[i] !== ch.t + ch.c) { free.push(ch); delete have[i]; } });",
    "Object.keys(have).forEach(function (i) { var ch = have[i]; if (want[i] !== ch.t + ch.c || ch.dying) { (ch.dying ? gone : free).push(ch); delete have[i]; } });")
rep("var want = {}, have = B.map, free = [];", "var want = {}, have = B.map, free = [], gone = [];")
rep('''    free.forEach(function (ch) {
      if (instant || !animMs()) { removeChar(ch); return; }''','''    free.concat(gone).forEach(function (ch) {
      if (instant || !animMs() || ch.dying) { removeChar(ch); return; }''')

# ---- onFrame: fidgets + mate
rep("        var won = G.over && !B.busy ? G.over.w : null;",
'''        var won = G.over && !B.busy ? G.over.w : null;
        if (won && (won === 'w' || won === 'b') && /mate/i.test(G.over.why || '') && B.mated !== B.sig) {   /* checkmate: the beaten king falls */
          B.mated = B.sig; Object.keys(B.map).forEach(function (k) { var ch = B.map[k]; if (ch.t === 'K' && ch.c !== won) { ch.faceTo = ch.face; act(ch, 'die', DIE); ch.act.style = 'fall'; } });
        }
        if (!B.busy && !won && animMs() && B.clock > (B.nextFidget || 3)) {
          B.nextFidget = B.clock + 1.6 + Math.random() * 2.4;
          var idle = Object.keys(B.map).map(function (k) { return B.map[k]; }).filter(function (c) { return !c.act && !c.path && !c.tower && !c.cheer; });
          var fc = idle[Math.floor(Math.random() * idle.length)];
          if (fc) { var fd = FIDGET[fc.cls === 'P' && fc.c === 'b' ? 'Pb' : fc.cls]; if (fd) { act(fc, 'fidget', fd); if (fd.sparkle) { var fcc = fc; wait(fd.dur * fd.sparkle).then(function () { if (B && !fcc.dead) spark(handPos(fcc), PAL[fcc.c].magic, 8, 1.2, .1); }); } } }
        }''')
open(p,'w').write(s); print('ok')
