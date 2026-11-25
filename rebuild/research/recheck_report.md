# Low-confidence re-check (agent cm-recheck, 2026-11-25)

Scope: every id in research/recheck_low_confidence.json plus mvPXhAMcT7I, GawuFHUIj6o, R8gZYKtr-C4 (unconfirmed piece moves):
transcript via analyze_video, compared with research/modes/<id>.json and app/data/modes/<id>.js; rules/setup/opponent fixed;
spec confidence + evidence updated. Then the 61 INDEX ids without a mode file triaged (truly non-playable or implemented).

## Per id
- IU9a1RB1KJw No Captures: transcript confirms plain no-capture chess with check (no swap rule). Fixed the ladder: Martin (250) ->
  Smartin (Martin with glasses, cropped from still maxres2, now assets/modes/IU9a1RB1KJw/smartin_glasses.png) -> the evil black-faced
  Martin ("strongest iteration", name not spoken: ours "Evil Martin", old smartin.png kept under that path) played twice. Spec high.
  NOTE for group 1/2 owners: H_5UviR2nTU and q9-mIuPLroo use assets/modes/IU9a1RB1KJw/smartin.png (the black evil Martin) as
  "Smartin"; in this video Smartin is the glasses Martin (smartin_glasses.png). Not changed here (not rechecked against their videos).
- B3wErwlKytA Dragons vs TwoNiche: confirmed dragon = knight + bishop, +1 dragon per game not won (a draw does not count); 1 dragon draw,
  2 dragons win, courtesy 3-dragon win; PyChess. Header/description/notes fixed; spec high.
- Cv28-UoZseg Sergeant's Checkers: REBUILT. The old file was a frames-only checkers guess (jumps, 10x11). Transcript gives the real
  rules (sergeants fW+fF with a first-move double step, Barrelina royal mF/cfW boxed behind bricks and enemy Soldiers fW, promotion
  to Kings on the 13th rank, Kings can't take Kings, win = Barrelina on the 2x2 hill, STALEMATED side wins); start position read
  square by square from still maxres2 (14x10, side view: blue moves right). New art cut from maxres1/2 (app/tools/recheck_cv28_art.py;
  the old sergeant_b.png was actually a green soldier). Opponents Chaco / killertofu (1503?). Spec medium (promoted-King capture
  rule and double-step ranks inferred).
