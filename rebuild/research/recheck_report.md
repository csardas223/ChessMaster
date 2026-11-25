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
- UZ79sKLa6z4 Speedrunner vs 3 Hunters: REBUILT from the full transcript + still maxres2. Map = four 8x8 boards staggered 6 files
  sideways (two overlapping files; 14x32 mask; the zig-zag beyond the two boards on the still is inferred); tan board #ead3b4/#af8263
  sampled. Rules fixed: hotbar pieces can only be placed on the board your king stands on (6:19, 18:37; was "within 2 of your king");
  the nuke is collectible and blows up when its owner tries to move it (8:27-8:58; radius 2 inferred), instead of "any side next to a
  neutral nuke"; Shy Guy (SCP-096, art from -fax07t_o5s) eats a piece that moves to attack him, gone once captured (2:57, 3:56); the
  Alibaba rider (DD+AA rider, 3:13, 13:47) added; the duck is collectible and never moves (19:37). Bot eval now treats a lost king as
  lost (a hunter walked into Shy Guy in testing). Play-tested: drops only on the king's board, nuke knocks out Red Panda and play goes
  on with ViperKing/Franchise, Shy Guy eats a rook, only the speedrunner may take the egg (= win). Not established: exact piece
  positions, the dog, the Barrelina, the bazooka's moves, the duck "blocks nothing"; 5-minute clocks omitted (2-player clocks only).
  Spec low -> medium.
- sO-lD2On610 Pac-Man Chess: the mode had already been rebuilt from the full transcript by g6b (rules, 3-check Bob, scoring,
  50/50 green bot, 3+2, opponents) but its spec was still the old low one, and the general squares were a guess. The full-resolution
  still maxres1 shows the whole start position: walls, ghost house and Bobs matched; the 8 generals (+5) are at (row from top, col)
  (2,5) (2,8) (3,0) (3,13) (9,6) (9,7) (11,6) (11,7), all other pellets dabbabas: FEN fixed (the bonus Pac-Man game's power circles
  follow the generals). Spec rewritten from the transcript, low -> high (green pawn step still inferred).
- x-ISu_8MDvY Can I BEAT GM Ben Finegold?: was "not playable, frames show normal blitz, no Finegold game visible". The transcript
  says it is a 6-round 5+0 arena hosted by GM Ben Finegold (0:01-0:11), and round 5 IS against him ("2700 rated", White, London,
  lost ~26:20); 4 wins, 2 losses, 4th on tie-break. NEW mode data/modes/x-ISu_8MDvY.js "Finegold Arena (5+0)": normal chess, 5+0,
  params.series rotates the six rounds (1323 SacToTheFuture, 1589 player1245763 from the frames, 1500, 1900, GM Ben Finegold 2700
  with the thumbnail portrait from research/frames/sprites, 1800), bot elo per round. Colours per round not modelled. Spec high.
- Cv28-UoZseg Sergeant's Checkers: transcript re-read confirms the first-pass rebuild: 8:01-8:12 neither King could take the other's
  King (the opponent had to bring a sergeant), 8:23-8:58 the stalemated side wins, 12:42 back sergeants step two, 14:37-14:51 the
  barrelina covers the square in front of it. Spec + mode medium -> high (promoted King = chess king still inferred, minor).
- WXcmWG7Eczs Anarchy Chess vs slomg: transcript re-read: knook (knight + rook up to 2, 7:23), 5+0 game 2 (13:00), overtime bored
  pieces (20:24-20:37) all match the mode. New detail logged in the spec but NOT modelled (mechanics never shown precisely): pawn
  launching (1:53 drag the pawn back onto a piece behind it and launch it forward; 17:47 a launched pawn stuns the piece it hits
  instead of capturing), chained long passant, super fusion. Stills maxres1-3 are mid-game only: start position still unconfirmed.
  Stays medium.
- B3wErwlKytA, IU9a1RB1KJw, JcpCAs1a2gc, gY9DNg9xDUM, piiE6JB8pWw (first-pass transcript rechecks): now also checked against the
  stills (dragon start/flip view + 5+0; Martin/Smartin/evil Martin; Anarchy Bot 1660 vs 2205; Tiny House start fnwk/3p/P3/KWNF read
  from piiE maxres3, 1+0, opponents Klub4Konej 1460? / purrberry 1479?). All match; specs stay high.
- research/INDEX.md regenerated (tools/make_index.py): the only spec still "low" is qqvbb2r2k5I (Gambonanza, owned by cm-arena /
  cm-gambonanza, not part of this pass).
- QA: qa_all.py --ids <the 12> --redo --par 1 (390/360): 24/24 ok, 0 errors. Targeted play-tests (tools in /workspace/work, not
  committed): Zc8 royal-king badge 5 + status; UZ79 drop zone, nuke knockout with play continuing, Shy Guy, egg win; Finegold round 5.
