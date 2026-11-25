# Polish round report (2026-11-25)

## pol-q2
Ids GH9tTFMWEUg .. X-aULHXsAaI (125). Per id: QA 390/360, art polish (390 shot vs video thumbs/frames), gameplay check vs spec + frames.
RESUME: last id finished = GuyllCIRcQI
NEXT: continue art+gameplay pass from H34VPnGT8tA (sorted order); QA results in /workspace/work/qa_pol-q2 (sandbox).
- GH9tTFMWEUg: QA ok; art/gameplay ok.
- GQ6MT1m78Yo: QA ok; art/gameplay ok.
- GawuFHUIj6o (Phantom Rooks, medium): GAMEPLAY FIX from frames (hq1/hq2): board 8x10 (was 8x12), army row PPPKRPPP with d+e pawns in front
  (was full standard armies), back row = plain rooks, 15 potions (was 13), castling off; ART: stone wall tile cut from the 3:47 frame (was generic stripes).
- GuyllCIRcQI (Chaturanga): QA ok; LEFTOVER art: video uses chess.com Chaturanga pieces (elephant/chariot/counselor); only black elephant/chariot
  + white chariot have clean cuts elsewhere (o5yiE_GHcrQ, GGvpHVEgqwY), no clean white elephant/counselor, so badges kept.

## pol-ui
### Design brief (2026-11-25 ~5 PM ET, "make the ui not look vibecoded")
Before-shots (390 + 1280: lobby, tab, search, empty, options, game, game-over, ClockFish, a 4-player mode, Chessformer) show the
earlier pol-ui pass already removed the big tells: no purple/blue gradients, no glassmorphism or glows, no emoji icons (inline
SVG, one 1.9 stroke), chess.com palette (#312e2b / #262421, #81b64c buttons with the 4px bottom edge), flat thumbnail rows,
underline tabs, bottom action bar, 200 ms ease-out, reduced-motion handled, 44px targets. Remaining tells found and fixed:
1. Coloured accent stripe across the top of the game-over card (classic AI "accent bar") -> removed; plain chess.com header.
2. Game-over reason read "by you resigned" / "by Stockfish ran out of time" -> chess.com wording "by resignation" / "on time".
3. Desktop game: board centred in a wide column with the panel pinned to the far right edge (big dead gap) -> board + panel
   grouped in the middle with a 16px gutter like chess.com desktop.
4. Desktop lobby: app bar + tabs hugged the window edge while content sat in a 1180px column (misaligned left edges) -> aligned.
5. Phone board full-bleed but with rounded corners -> square corners (chess.com app).
6. Type scale drift (18/800 brand, 17 quick rows, 26/800 + negative tracking modal title) -> 17/700, 16, 24/700.
7. Clocks ran before the first move (ClockFish showed 9:57 untouched) -> clocks start after the first move, no increment for it.
Not done: chess.com "neo" pieces are not in assets/pieces (only open-licensed sets), so cburnett stays default (no new art).
RESUME: last step finished = commit 1 (brief + fixes 1-7); next = QA (qa_ui + qa_all 40 ids)
