import re
p='js/fx/battle3d.js'; s=open(p).read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)>=1, a[:80]
    s=s.replace(a,b,cnt)

rep("var HEIGHT = { P: .74, N: .92, B: .94, Q: .97, K: 1.04, R: .98 };",
    "var HEIGHT = { P: .98, N: 1.12, B: 1.1, Q: 1.08, K: 1.2, R: 1.16 };   /* fin-battle: bigger, like the game (characters nearly fill a square) */\n  var GIRTH = 1.18;                 /* chunky heroic proportions: x / z stretch of every humanoid */")
# palettes
rep("hair: '#ece6d6', stone: '#bfc3ca'", "hair: '#ece6d6', qhair: '#e2bd6a', mail: '#a3abb5', mozz: '#f4f1ea', stone: '#bfc3ca'")
rep("hair: '#2b1d16', stone: '#5d5559'", "hair: '#2b1d16', qhair: '#4a2618', mail: '#6a6b72', mozz: '#f1ede4', stone: '#5d5559'")
rep("skin: '#d2a07c', leather: '#3d2718'", "skin: '#dc9e78', leather: '#4a2e1b'")

# pawn builder
old_p = s[s.index("    P: function (T, pal, c) {   /* armoured spearman */"):s.index("    N: function (T, pal, c) {   /* plate knight with a sword */")]
new_p = r'''    P: function (T, pal, c) {
      var h;
      if (c === 'b') {   /* red army: a burly bare-chested brute under a big round helm, red skirt, studded arm bands (spear kept) */
        h = humanoid(T, pal, { chest: pal.skin, chestR: .25, sleeve: pal.skin, fore: pal.skin, thigh: pal.skin, shin: pal.leather, skirt: pal.cloth, belt: pal.leather });
        var belly = new T.SphereGeometry(.28, 10, 8); belly.scale(1.02, .92, .92); h.add('spine', X(T, belly, 0, .19, .07), pal.skin);
        var pec = new T.SphereGeometry(.2, 9, 6); pec.scale(1.25, .7, .8); h.add('spine', X(T, pec, 0, .47, .06), pal.skin);
        h.add('spine', X(T, h.box(.07, .78, .04), 0, .33, .25, 0, 0, .62), pal.leather);          /* shoulder strap */
        var helm = new T.SphereGeometry(.2, 10, 7, 0, Math.PI * 2, 0, Math.PI * .64); h.add('spine', X(T, helm, 0, .79, .01), pal.steel, 'm');
        h.add('spine', X(T, new T.TorusGeometry(.17, .025, 4, 12), 0, .7, .01, Math.PI / 2, 0, 0), pal.gold, 'm');
        h.add('spine', X(T, h.box(.03, .07, .34), 0, .97, 0), pal.gold, 'm');                   /* crest ridge */
        h.add('spine', X(T, h.box(.18, .03, .02), 0, .78, .19), pal.dark);                       /* eye slit */
        [['shL', 'elL'], ['shR', 'elR']].forEach(function (a) {
          h.add(a[0], X(T, h.cyl(.078, .078, .06, 7), 0, -.08, 0), pal.leather);
          h.add(a[1], X(T, h.cyl(.07, .066, .14, 7), 0, -.17, 0), pal.cloth);                      /* red studded bracer */
          h.add(a[1], X(T, h.cyl(.074, .074, .02, 7), 0, -.1, 0), pal.gold, 'm');
          h.add(a[1], X(T, h.cyl(.07, .07, .02, 7), 0, -.24, 0), pal.gold, 'm');
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
'''
s=s.replace(old_p,new_p)

# bishop builder
old_b = s[s.index("    B: function (T, pal) {   /* robed bishop with a crook staff */"):s.index("    Q: function (T, pal) {   /* sorceress */")]
new_b = r'''    B: function (T, pal) {   /* robed bishop: team-colour robe, white cape, gold cross panel, mitre, crook staff */
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
      h.add('grip', X(T, h.cyl(.022, .022, 1.6, 5), 0, .35, 0), pal.gold, 'm');        /* staff + crook */
      h.add('grip', X(T, new T.TorusGeometry(.09, .022, 4, 8, Math.PI * 1.3), -.09, 1.17, 0, 0, 0, -.3), pal.gold, 'm');
      h.add('grip', X(T, new T.OctahedronGeometry(.05), 0, 1.06, 0), pal.magic, 'e');
      return h.P;
    },
'''
s=s.replace(old_b,new_b)
# queen: hair colour + taller crown
rep("h.add('spine', X(T, new T.SphereGeometry(.14, 8, 6), 0, .83, -.03), pal.hair);          /* hair */\n      h.add('spine', X(T, new T.ConeGeometry(.15, .55, 7), 0, .55, -.1, -.12, 0, 0), pal.hair);",
    "h.add('spine', X(T, new T.SphereGeometry(.14, 8, 6), 0, .83, -.03), pal.qhair);          /* hair */\n      h.add('spine', X(T, new T.ConeGeometry(.15, .55, 7), 0, .55, -.1, -.12, 0, 0), pal.qhair);\n      h.add('spine', X(T, h.box(.24, .3, .02), 0, .4, .17), pal.trim);   /* bodice lacing panel */")
rep("h.add('spine', X(T, new T.ConeGeometry(.022, .1, 4), Math.sin(a) * .12, .95, Math.cos(a) * .12), pal.gold, 'm'); }",
    "h.add('spine', X(T, new T.ConeGeometry(.03, .16, 4), Math.sin(a) * .12, .98, Math.cos(a) * .12), pal.gold, 'm'); }")
# girth + base scale
rep("ch.rig.scaler.scale.setScalar((HEIGHT[t] || .8) / (cls === 'G' ? 1.25 : HUMAN_H));",
    "var s0 = (HEIGHT[t] || .8) / (cls === 'G' ? 1.25 : HUMAN_H); ch.rig.scaler.scale.set(s0 * GIRTH, s0, s0 * GIRTH); ch.baseS = ch.rig.scaler.scale.clone();")
rep("ch.tower = node(T, bones(T, 'TOWER', c).tower, ch.parts, 'tower'); ch.tower.scale.setScalar(.95);",
    "ch.tower = node(T, bones(T, 'TOWER', c).tower, ch.parts, 'tower'); ch.tower.scale.setScalar(1.08);")
rep("ch.tower.visible = aw < .55; ch.tower.scale.set(.95, .95 * (1 - sm(seg(aw, 0, .55))), .95);",
    "ch.tower.visible = aw < .55; ch.tower.scale.set(1.08, 1.08 * (1 - sm(seg(aw, 0, .55))), 1.08);")
rep("var gs = sm(seg(aw, .35, 1)); ch.rig.scaler.scale.setScalar(Math.max(.001, gs * (HEIGHT.R / 1.25)));",
    "var gs = Math.max(.001, sm(seg(aw, .35, 1))); if (!(ch.act && ch.act.name === 'die')) ch.rig.scaler.scale.set(ch.baseS.x * gs, ch.baseS.y * gs, ch.baseS.z * gs);")
open(p,'w').write(s)
print('ok')
