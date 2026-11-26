# FPS Chess real-3D rebuild: work in progress (branch wip/fps-3d)

Status: NOT wired in. main's FPS Chess (js/modes/g5_fps.js, 2D tap duel) is unchanged and still what plays.
Done: js/modes/fps3d/models.js (original low-poly, code-built: human-scale lathe pieces, enemy unit with visor band,
held weapon + invisible body/head hitboxes, first-person viewmodels per class). Not yet loaded by anything; not QA'd.

Research lives in /workspace/work/ChessMaster/rebuild/research/modes/{PszkLYudcws,Nz2A-g73_iM}.json (not in this repo).
Key facts: board turns stay normal chess (check: none, king capture wins); every capture = real-time duel, 3-2-1,
winner keeps/takes the square, hp carries over (piece.hp). King melee swipe, pawn gun, knight bow + Left Shift sprint,
bishop flies, E ability, block shots; arena has cover and high ground (pawn sniped from on top).

## Plan for next AI (js/modes/fps3d/duel.js + hook change in g5_fps.js)
1. duel.js: CM.fps3d.run(ctx, {mine, foe, attacking, board snapshot}) -> Promise<{won, me, foe}> (same contract as
   duel() in g5_fps.js). Load three via CM.util.loadScript('js/vendor/three.min.js') like scene3d.js. Fallback to the
   existing 2D duel when WebGL/three fails.
2. Arena: 8x8 board floor, tile 3 m, 1-tile margin walkway, walls at +-15 m. Other board pieces = static statues at their
   squares (cover). Platforms (1.4 m) on a4/a5/h4/h5 with 0.7 m steps beside, crates in margins. PszkLYudcws: Victorian
   red room (wall #7a1f22, ceiling, fireplace light, fog). Nz2A-g73_iM: grey courtyard with gradient sky dome + fog.
   Hemi + one shadowed directional (1024 map) + permanent flash point lights (never add lights at runtime).
   Pixel ratio min(1.5, dpr), adaptive drop to 1.0.
3. Player: eye 1.6 m, WASD/arrows, pointer-lock mouse look (drag-look fallback), click fire, R reload, E ability,
   Shift sprint (bishop: fly), Q block, Space jump. Touch: left joystick, right drag look, Fire/Reload/Ability/Sprint/
   Block buttons, pointer events + touch-action:none, body overflow hidden, viewport meta user-scalable=no during the
   duel (restore after). Viewmodel in a second scene after clearDepth.
4. Weapons: P pistol hitscan 20dmg/.32s/12; Q rifle auto 13/.11s/30; R shotgun 8x10 pellets/.85s/6; B wand projectile
   26/.45s/8; N bow projectile 40/.8s/5 (gravity); K blade melee 55/.7s range 2.8. Headshot x1.5. Recoil, muzzle flash,
   pooled tracers, hit marker, damage numbers, enemy topple death + particles, ammo/health HUD, crosshair, minimap canvas.
   Sounds: assets/modes/AWFB4EzGtDc/{pistol,shotgun,machine,crossbow,grenade,reload}.wav (the FPS mode folders have no
   wavs), plus CM.sound tick/capture/explosion.
5. Enemy AI moves cell to cell in chess patterns (R orth, B diag, Q both, K 1 step, N L-jump arc, P forward/diag),
   eased slides, picks cells by preferred range + line of sight + high ground; fires with accuracy falloff
   (sprint x0.3, block = no damage). Abilities as g5_fps.js comments (pawn ally, king pull, bishop bomb, knight/rook/queen
   double damage).
6. Pause board renderer during duel at runtime via CM.scene3d.current().renderer.render override (do not edit
   scene3d.js/view3d.js). Abort via token (setup/onExit/onUndo) without resolving.
7. Expose CM.fps3d.dbg() for QA (aim, hp, positions). QA: Playwright --use-gl=swiftshader at 390x844 touch and
   1366x900; screenshots to /workspace/work/fps3d/; npm test, lint, sweep, qa/validate-modes.mjs (known hZf3G9Pr1UU
   error), tools/qa_ui.py. Add LICENSES.md line for the CC0 code-built models. Commit
   "FPS Chess: real 3D first-person shooter" to main.
