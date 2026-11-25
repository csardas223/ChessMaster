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
- WIP commit: lobby search clear+sort, thumb skeletons, desktop grid, empty state, Options swatch fixes, 44px targets, opacity-only transitions. NOT re-tested after rebase onto pol-perf lazy-load. Todo: qa_ui.py --port 8808, ~30-mode qa_all, 4x CPU lobby scroll check, Speedrunner UZ79sKLa6z4 purple tint -> #7a3fa0, game fade-in, tablet 768 framing.
RESUME: last step finished = first UI commit
