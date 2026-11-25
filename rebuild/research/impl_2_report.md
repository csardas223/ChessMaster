# impl_2 report: Group 2 (Drawback Chess + Variant Bots), 67 ids

Status for the next AI. Ids: `research/impl_2.json`. Shared hooks: `app/js/modes/g2_drawback.js` (38 Drawback Chess
videos, 123-drawback catalogue), `app/js/modes/g2_fish.js` + byte-identical `g2_elofish.js` (29 Variant Bot videos:
Martinfish, rating-changing Stockfish/Martin bots, move-rule fish, WorstFish vs Zach spectator game).

## Pass 1: 67/67 mode files exist

## Verification vs specs (impl-2, 2026-11-24 ~10 PM ET)
Checked every mode file against `research/modes/<id>.json`: board size/colours, setup FEN, player side (incl. per-game
sides and `side: 'random'`), opponent name/rating/avatar, bot rule / Elo rule, per-game drawback pairs, view
(see / hidden / flash), goal, clocks. Also cross-checked drawback card texts against frame notes (research/frames).
Fixes:
- `g2_drawback.js` Rook Fan Club: frames show the full card "You must promote to rooks. Your king and queen cannot
  move diagonally"; the diagonal ban for K/Q was missing. Added.
- `ZOcZ-pkPuYQ`: video has 4 games; game 4 (White, the "King of the Hill" game) was missing. Added with random hidden
  drawbacks (King of the Hill / Body Snatcher / Nurturer card texts never shown, so not invented).
Confirmed correct (looked suspicious, are not): Lethal Attraction = "farther from the opponent's king" (frames
visual_* for ZlQHLtMma54 confirm; cvMXLpdwWsc spec's "adjacent" was a cut-off read). Horse Lover (rbfC90ZzPW8) is a
label for the unnamed "can't take knights" drawback.
Known inferences kept (documented in each file's `source.notes`): ClockFish ramp (+240/min from 250, from thumbnail),
TortureFish "31 pieces" meaning, which game had which pairing in several Drawback videos.

## Pass 2
(in progress, see below)

## QA
(pending)
