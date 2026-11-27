# FPS Chess real-3D duel (PszkLYudcws, Nz2A-g73_iM)

Status (2026-11-26 2:00 PM ET, m3-fps): wired in and rewritten to the videos (m-fps / m2_fps). Every capture attempt in
both FPS Chess modes opens the three.js first-person duel (`js/modes/fps3d/duel.js`, weapon models in
`js/modes/fps3d/models.js`); `js/modes/g5_fps.js` keeps the 2D tap duel as the fallback when WebGL / three.js is
unavailable or `params.fps3d === false`. Evidence of what the videos show: `research/ref/m-fps/SPEC.md` (+ frames and
transcripts of both videos in that folder).

## What matches the videos
- Arena: you are a tiny chess piece standing ON the board, which sits on a table in a giant room. Jump off to the floor
  (red carpet with cream diamonds, toy train on a track, record player on a cabinet, bookshelf with green books, red
  high-back chairs, window with blue sky, fireplace + portrait, twin sconces, chandelier, pink curtains, doorway with a
  pink banner) and hold Space against a wall / table leg to climb back up. The other pieces of the position stand on
  their squares as full-size statues (cover).
- Weapons (tinted by piece colour): pawn flintlock musket (smoke puff), knight bow (hold to draw, release), bishop long
  musket, rook scoped sniper, queen minigun (no reload), king big flat sword.
- Controls: hold left click to shoot, hold right click to block shots (Q also blocks), Left Shift movement ability,
  E second ability, Space jump / hold on a wall to climb. No reload. Phone: joystick, look-drag, FIRE, BLOCK, JUMP and
  the two ability tiles (tiles sit above the phone pad, z-index fixed in m2_fps).
- HUD: only the two white tiles bottom-left ("Left Shift", "E"), dimmed with a cooldown number while recharging, and
  the dashed + crosshair. No health bar, ammo, damage numbers, minimap or timer. Damage = white cracked-glass overlay;
  health regenerates; damage carries over between duels. A hit foe glows white with a red X.
- 3-2-1, GO, "<PIECE> WINS", KILL CAM.
- Abilities (Left Shift / E): P sprint / hire a helper pawn; N gallop / arrows curve inwards; B fly (hold) / bomb;
  R hop / brick wall; Q dash / throw a piece; K leap / pull the enemy in.

## Gaps not closed (INFERRED)
- No game model files exist: rooms, pieces and weapons are code-built approximations of the frames.
- Effects of the abilities the videos never show (rook hop, queen dash) and all numbers (hp, damage, fire rates,
  cooldowns other than the seen 1/2/3/8 s) are inferred. A hidden time cap (`params.duel3d_ms`, default 60 s) ends a
  stalled duel and the defender holds (the videos show no timer).
- Ability tile icons are HTML entities, not the game's own icon art.
- Sounds are our own synthesised WAVs (assets/modes/AWFB4EzGtDc/), not the game's.

## QA
`python3 tools/qa_fps3d.py --only phone|desk1|desk2` (Playwright + SwiftShader; LD_LIBRARY_PATH per HANDOFF): 390x844
touch (5 controls, HUD, Left Shift tile cooldown, joystick, look-drag, held FIRE win) and 1366x900 desktop (desk1: walkway
WASD, Space jump, right-click block, HUD, LShift + E cooldowns, climb a table leg, mouse look, idle LOSS, bot attack ->
defend duel won by fire/melee; desk2: 3 quick clicks -> 3 shots, mouse fire win, board matches). Movement is measured
in game time (`dbg().clock`). `CM.fps3d.qaHold` freezes enemy fire; `CM.fps3d.lastResult` keeps the last duel's
result after the overlay closes (m3-fps: duel B's end could close before the poll saw it).

Runs 2026-11-26 (qa3d, ~7:10-8:00 PM ET, shared box, load 4-15): **phone, desk1 and desk2 ALL GREEN.** desk1: Space jump
[0, 0.4, ground true] now that QA waits for the ground; climb, mouse look, idle LOSS, duel B resolved (attacker knocked out,
the knight survives). desk2: 3 quick clicks -> 3 shots (per click [1, 1, 1]), mouse fire win, white pawn on d3. QA fixes on
the way (no game code changed): every tool presses the "Tap to start" plate a direct `#/play/<id>` open shows; desk2 reads
the shot count from `lastResult` when the duel closed between polls and holds the bot's reply (`G.holdBot`) until the d3
check (a fast reply moved d3's pawn away / opened a defend duel). Seen once under load, not reproduced: 3 quick clicks gave
5 shots (QA now logs shots per click to catch it).