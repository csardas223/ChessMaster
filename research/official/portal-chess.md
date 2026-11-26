# Portal Chess — iwantcheckmate.com (hands-on notes)

URL: https://iwantcheckmate.com/challenges/portal-chess/
Page title: "Portal Chess — iwantcheckmate.com"
Date played: 2026-11-24 (browser session)

## Verbatim page text (entire page text read via accessibility/page text)
Home
8 7 6 5 4 3 2 (rank labels) / a 1 b c d e f g h (file labels)
Theme
Clear
New Game
Stockfish
(3600)
"Double left click on a square to place a blue portal. Double right click on a square to place an orange portal. Move a piece onto a blue square to teleport between the blue and orange portals."

That is the ONLY rules/intro text on the page. No other intro/paragraph text. Page has no sign-in, no paywall, no purchase.

## Opponent panel
- Name: "Stockfish"  Rating: "(3600)"  (NOTE: task's extra context expected 'Tony (2100)' — the live official page shows Stockfish (3600).)
- Avatar: small rounded-square photo of a fish (golden/yellow fish head, "Stockfish" = the fish joke), image alt text "Stockfish". Picture handle: https://iwantcheckmate.com/challenges/portal-chess/stockfish-profile.jpeg
- Panel sits right of the board: avatar, name+rating, then the rules text.

## Buttons on page
Theme, Clear, New Game, plus 64 square buttons; a "Home" link to https://iwantcheckmate.com/

## Starting position
Standard chess start, white (player) at bottom, black (Stockfish) at top. No portals on board at start.

## Observed so far
- Move by click-drag works: dragged e2->e4, pawn moved; from- and to-squares both highlighted solid magenta/purple (~#c040c8 / orchid), highlight persists (it is the last-move highlight, not a fading animation).
- Stockfish replied ...e7-e5 after roughly 2-5 s; its from/to squares then highlighted magenta.
- Board light square ~#f0d9b5 beige, dark square ~#a87c5f brown (close-up sampled visually).
- Piece art: flat 2D vector, thick dark outline; white pieces white w/ light gray shading, black pieces dark gray.
- Double left click on empty square (tested d5, c6, e3, e4, board center) did NOT visibly place a portal; square button gains focus, whole square-button list re-renders. Portal placement not yet reproduced.
## Portal mechanics observed hands-on
- Portal placement: TWO rapid left clicks on a square (the site's own double-click detection; a synthetic double-click that is slightly slow does NOT register, two fast single clicks do) fills the whole square solid blue (~#1e90ff dodger blue). No piece is needed; empty squares accepted; both light and dark squares accepted; any square on the board (own half and enemy half).
- Only ONE blue portal at a time: placing a second blue portal removes the first one (blue moved c4 -> f5).
- Placing a portal does NOT count as a move: Stockfish did not reply after a portal was placed.
- Portal persists indefinitely (observed >30 s across several moves); no cooldown, no timer. It is removed only by the "Clear" button or "New Game".
- A piece can stand on a blue portal square: after Nf3 the knight sits on top of the still-blue square (portal colour remains visible behind/under the piece; portal colour wins over last-move highlight colour).
- Orange portal could NOT be placed: the site requires a DOUBLE RIGHT click, and the automation API has no right-click/context-menu primitive (no Menu/F10 key). Long-press (pressAndHold 1500 ms x2) does not place an orange portal either. Therefore teleport itself could not be reproduced in this session.
- Bot: played ordinary chess moves (…e5, …d5); no portal-related behaviour seen; blue portal has no effect on bot moves observed.

## Buttons
- Clear: removes portal(s) from the board instantly (no animation observed).
- New Game: resets to the standard starting position instantly, new game, white to move.
- Theme: cycles board/UI colour theme. Click 1 -> purple theme (dark squares ~#9c5fa8, light ~#f0e0f0, page accent buttons turn purple); click 2 -> back to default brown/beige. Two themes total.

## Move/last-move highlight
- Both from- and to-squares of the most recent move (own and bot) are filled solid magenta/orchid (~#cf4ed3 on light squares, brighter ~#e07ae6 on dark squares). Highlight is static (no fade observed), persists until the next move.
- Moves are made click-drag (pointer drag) from piece to destination; a plain single click on a piece produced no selection dot or legal-move dots.

## Engine timing
- Stockfish reply arrived roughly 2-5 s after the player's move (was not done at +1.5 s, was done by +5.5 s).

## Games played hands-on (Portal Chess, vs Stockfish 3600)

Game 1 (white pieces, human; drag-to-move):
1. Nf3 d5 2. g3 Nf6 3. Bg2 c5 4. Nxe5 (capture) …e6 5. Nf3?? (drag rejected) …Bb6 6. b3 Bxe5 (black captures our knight) 7. Nc3 — game abandoned via New Game.
Notes: every capture tested (Nxe5 by us; Bxe5 by bot) removed the captured piece instantly, no fade/pop/scaling frame visible in the settled screenshot; no separate capture particle or flash.
Game 2 (fresh game from New Game): 1. f3 d5 2. g4 e6 3. e3 e5/d4 4. Bb5+ (check) …Nf6 (blocks) — no check-specific visual: no red king tint, no banner, no text node in the accessibility tree; only the magenta from/to highlight. Stockfish declined an early Qh4 mate line (played …e6), as expected at 3600.

## VFX / sound timeline (as observed; ms are approximations from settle-window screenshots)

| # | Trigger | Effect observed | Duration (approx) | Sound |
|---|---------|-----------------|-------------------|-------|
| 1 | Page load | Board renders instantly at starting position; no entrance/deal animation, no board fade-in | 0 ms (instant) | none observed |
| 2 | Piece moved (pointer drag) | Piece jumps to destination square (no glide/lerp animation frame captured); from-square and to-square filled solid magenta (~#cf4ed3 on light, ~#e07ae6 on dark squares) | highlight is static, persists until the next move; no fade-out | not verifiable |
| 3 | Piece captured | Captured piece removed immediately; no fade, scale, particle or square flash beyond the magenta last-move highlight | 0 ms (instant) | not verifiable |
| 4 | Check given (Bb5+) | No additional board effect: no king tint/flash, no banner, no toast; only last-move highlight | none observed | not verifiable |
| 5 | Blue portal placed (2 rapid left clicks on a square) | Whole square filled solid blue (~#1e90ff), square-corner-to-corner, no pulse/glow ring or spawn animation captured in the settled frame; a piece standing on the square keeps the blue visible behind it | static while placed | not verifiable |
| 6 | Blue portal re-placed elsewhere | Old square reverts to its normal light/dark colour at once, new square turns blue at once (portal is moved, not added) | instant | not verifiable |
| 7 | Clear button | Blue portal removed at once | instant | not verifiable |
| 8 | New Game button | Board resets to the starting position at once; last-move highlight and portals cleared | instant | not verifiable |
| 9 | Theme button | Instant swap of the whole palette (no cross-fade): light/dark board and UI accent colours change | instant | not verifiable |
| 10 | Bot reply | Bot move appears 2,000–5,000 ms after the human move settles (no "thinking" indicator, spinner or dot animation on the panel) | reply latency ~2–5 s | not verifiable |
| 11 | Win / lose (checkmate, stalemate, resign) | NOT REACHED — see blocked items | — | — |

Audio: the page exposes no visible mute/sound control in the accessibility tree (only Home, Theme, Clear, New Game and the 64 squares), and no audio element state can be read from the accessibility tree or screenshots, so individual sound effects could not be confirmed. Treat every sound entry as unverified rather than absent.

## Blocked items (for the parent)

1. Orange portal + teleport animation: rules require a double RIGHT click; the automation API offers click/doubleClick/pressAndHold but no right-click / contextmenu dispatch. Verified non-substitutes: Menu key, F10, pressAndHold 1500 ms x2, two doubleClicks. Teleport (piece entering one portal and leaving the other) therefore could not be reproduced, and neither could a piece sliding through a portal.
2. Win/lose screen: no resign, draw-offer or "flip/undo" control exists; reaching checkmate against Stockfish (3600) is many dozens of moves and the site exposes no fast-forward. Never observed.
3. Sounds: not observable from the accessibility tree / screenshots.
