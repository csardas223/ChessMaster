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

## Pass 2 / art pass (2026-11-24 10:45 PM ET, owner art direction: copy the videos' art)
Script: `app/tools/g2_art.py` (re-run from rebuild/app; downloads thumbnails to $G2_THUMBS or /tmp/g2thumbs).
- Variant Bots (29 modes): every avatar is the video's own art. 18 come from research/frames/sprites (commit d34107d);
  the 11 that had no sprite were previously "recreated"/edited (TiredFish, ZebraFish, PanicFish, Alternate Fish, Martin x2,
  Smarten, BetaFish SVG, Martinfish Y0LO, Zach, WorstFish SsOt) and are now straight crops of each video's maxresdefault
  thumbnail (Martin in Q6sj5N3oQjI uses the Martin art from nx6jkHl2k_Y's thumbnail). betafish.svg deleted.
- Drawback Chess (38 modes): the generated "animal" SVG avatars in g2_drawback.js were removed; the Drawback site in the
  videos shows names only, so the UI's plain initials chip is used. The drawback card was restyled to the site's card as seen
  in frames (#595391 card, centred white text, Record line) and its Easy..Hard slider is the video's own image
  (assets/modes/evpcydnu8To/drawback_slider.png). Side panel colour now the site's #2f2d55.
  Whole sprites shipped: evpcydnu8To + ypac0SBFqb8 open with the video's Lame Duck card screenshot (param intro_card);
  2r5tef-Qdyg shows the video's post-game reveal screen when the opponent's drawback is Quit Horsing Around (param reveal).
- Still not video-exact (next AI): card text is HTML in the site's style (texts vary per drawback, no frame for each);
  the slider marker is the one baked into the video image; no sounds specific to these videos were identified.
- todo_pass2: 0 items in group 2.

## QA (2026-11-24 10:45 PM ET)
Headless chromium at 390px (script used: /workspace/work/g2_qa.py, same play routine as tools/test_browser.py; needs
libatk/libXcomposite/libXdamage/libatspi on LD_LIBRARY_PATH in the sandbox): 67/67 modes load, play 4 random moves with
bot replies, 0 console errors, 0 404s, no horizontal overflow. (unpkg stockfish CORS error ignored as in test_browser.py.)
