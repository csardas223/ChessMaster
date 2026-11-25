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
- JcpCAs1a2gc Anarchy Bot: transcript shows plain chess vs the Anarchy creator bot; the guessed forced-en-passant rule is removed;
  bot chat replaced with the video's actual lines (greeting, ~15 quotes, quiet when losing, "The chess speaks for itself" on loss). Spec high.
- WXcmWG7Eczs Anarchy Chess vs slomg: transcript fixes: underage-pawn rule applies to ANY bishop (own too) and triggers when a move
  puts the pawn in sight (own-bishop captures added, forced only then); title rooks movable only by the side with an adjacent piece;
  inverse queen = knight ("just turns it into a knight"); checkers piece jumps its own pieces; no check rule (castle through check,
  king capture); clock 5+0. Still not modelled: pawn launching/stun, chained long passant, super fusion (no readable mechanics).
  Spec medium (start position visual-only).
- piiE6JB8pWw Tiny House Chess: transcript confirms drops, Ferz/Wazir and promotion; FIXED the knight to the non-jumping Dragon
  Knight (lame 'nN'), renamed Tiny House Chess. Spec high.
- gY9DNg9xDUM Tiny House Chess 2: REWRITTEN. The old file guessed an R N B K + pawn army; transcript says it is the same Tiny House
  variant (drops, Bob/Ferz/Dragon Knight), five wins, 1+1. Reuses the first episode's setup and art. Spec high.

## recheck3 (agent cm-recheck, 2026-11-25 ~12:15 PM ET): last 12 low-confidence ids
Method as recheck2: transcript via analyze_video, stills i.ytimg.com/vi/<id>/maxres{default,1,2,3}.jpg, spec vs mode file, fix, QA 390/360.
- YZjdissxTyA Cross Derby (the merged WIP): verified. Still maxres1 = mode FEN + hole mask square by square; transcript 0:01-0:05
  rules, 3:50-4:02 checks can only be met by capturing. Fixed the clock 1+0 -> 3+0 (9:48 "almost a minute left" and 10:17 "down to 50
  seconds" deep in game 4 rule out 1 minute; 3+0 as in the other Cross Derby videos, inferred). Spec high.
- Zc8ljpWtYWQ Behind the Mirror (the merged WIP): verified. Still maxres2 (Black's view) re-read square by square: the WIP FEN is right
  (royal kings White file 11 / Black file 2, playable kings opposite). Finished: the '5' over each royal king now counts DOWN as it is
  checked, as in the video (1:36, 1:47 "down to three checks"); status line used White's count although you play Black (fixed to ctx.human).
  Opponent "Jme Meister" games 1+3, Delhy game 2. Spec high.
