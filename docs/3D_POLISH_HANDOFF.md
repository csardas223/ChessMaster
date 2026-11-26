# 3D polish handoff (wip/3d-polish, 2026-11-25)

## Status
- Done (this branch, untested in a browser): opt-in additions to `js/fx/scene3d.js`: `orbit`, `toneMapping:'aces'`/`exposure`,
  `env` (PMREM room reflections), `shadowSize`, `maxPixelRatio` (phones now default to 1.5 instead of 2: the one
  behaviour change for existing modes), `onTap(i,e)` hook, `S.shake(amp,ms)`, `S.ease(fn,ms)`, `S.lockCam`, `S.userMoved`.
  Passes eslint (0 errors). Still to do: re-run every 3D mode after it.
- Not started: Battle Chess characters, view3d polish, the other modes.
- FPS Chess belongs to the agent fps-3d: do not touch js/modes/g5_fps.js, data/modes/PszkLYudcws.js,
  data/modes/Nz2A-g73_iM.js or the `fps` preset in view3d.js.
- Baseline screenshots + QA harness: /workspace/work/3d_polish/qa3d.py (args: repo port-root, out dir, port, ids),
  before shots in /workspace/work/3d_polish/before/ (fps numbers there are SwiftShader, not real hardware).

## Battle Chess plan (top priority, owner request)
Owner wants Battle Chess (IbRrzKtieqs, Interplay 1988 and remakes) look: animated fantasy characters, original low-poly
models (own work, licence entry in LICENSES.md), never the copyrighted art.
- Roster: pawn = armoured spearman (spear + round shield); rook = stone tower that turns into a rock golem when it moves
  or fights, then back; knight = armoured knight with a sword (no horse); bishop = robed bishop with a staff;
  queen = robed sorceress (magic bolt); king = crowned king with a sword. White = blue cloth + polished steel + gold;
  black = red cloth + dark iron, horned / spiked helms. Video (remake) look: marble floor in a castle hall with pillars,
  arched windows, purple banners, braziers (assets/modes/IbRrzKtieqs/fight_1.jpg, intro.jpg).
- New file js/fx/battle3d.js on CM.scene3d with `pieces:false, highlights:true, lights:false, orbit:true,
  toneMapping:'aces', env:.6`. Own characters keyed by square; reconcile with G.state when idle.
- Rig: root(position, rotation.y facing; white faces -z i.e. PI, black 0) > tipper (fall / sink) > scaler >
  body > hips/knees, spine > head, shoulders > elbows > hand > grip (weapon; grip.x = desired - (sh+el+spine)).
  Merge each bone's parts into one geometry per material (vertex colours, flatShading) and cache by type+colour+bone,
  so ~15 draw calls per character.
- Animation: idle (breathing, per-character phase), walk (leg/arm swing, bob; knights take the L path), attack
  keyframes per class (spear thrust, sword overhead slash, staff slam, queen bolt projectile, golem double-fist smash),
  hit recoil, death (fall back then sink through the board; golem shatters into rock chunks), cheer for the
  winners at mate. A scaled clock drives everything so Skip (button) / tap = fast-forward and a 1x/2x pill persists.
- Mode hook: data/modes/IbRrzKtieqs.js afterMove returns CM.battle3d.play(m) (a Promise: spec-game keeps input
  locked until it resolves); handle m.castle (rf/rt both walk), m.capSq (en passant), m.promo; remove
  params.cutscenes stills (the 3D fight replaces them). Camera: ease to a side-on view of the fight, then back
  to the user's camera. No WebGL: return nothing (2D board keeps working).
- Lift #board-fx above the canvas like view3d does.

## Then
view3d generic polish (all presets except fps): orbit on, captured pieces sink/shrink instead of vanishing, slightly
longer eased slides; check each preset in qa3d.py at 390x844 and 1366x900; fix hZf3G9Pr1UU validate error if in path.
Checks: npm test, npm run lint, npm run sweep, node qa/validate-modes.mjs, tools/qa_ui.py.
