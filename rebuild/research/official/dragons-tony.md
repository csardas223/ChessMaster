# iwantcheckmate.com — "How Many Dragons to Beat Tony?" challenge
Source URL: https://iwantcheckmate.com/challenges/dragons-tony/
Page <title>: "How Many Dragons to Beat Tony? — iwantcheckmate"
Observed: Tuesday, November 24, 2026. No sign-in, no purchase, free to play.

## 1. Text on the page (verbatim, as rendered)
- Page title: `How Many Dragons to Beat Tony? — iwantcheckmate`
- Nav link: `Home` (links to https://iwantcheckmate.com/)
- Opponent line: `Tony` then `(2100)` rendered as one block: `Tony (2100)`
- Intro/rules text (single paragraph, line-wrapped by the sidebar):
  `Beat Tony with as few Dragons as possible. A Dragon moves like a bishop and a knight combined.`
- Counter: `Dragons: 1`
- Buttons: `Theme`, `Add 1 Dragon`, `Resign`
- Board coordinates: ranks `8 7 6 5 4 3 2 1` (inside left-most square of each rank) and files `a b c d e f g h` (inside bottom rank squares). a1 square button name is "a 1".
- Image alt text: opponent avatar image alt = `Tony`; theme button has repeated decorative icon images (alt "Theme" x8 reported by the read, i.e. an icon inside the button).
That is ALL the text on the page — no other rules paragraphs, no modal, no help dialog.

## 2. Starting position
White (player): King on e1, Dragon on d1. No other white pieces.
Black (Tony): full standard set — Ra8, Nb8, Bc8, Qd8, Ke8, Bf8, Ng8, Ra8/h8; rank 7 all pawns (a7–h7).
- Rank 8: rook a8, knight b8, bishop c8, queen d8, king e8, bishop f8, knight g8, rook h8
- Rank 7: pawns a7,b7,c7,d7,e7,f7,g7,h7
- Rank 1: dragon d1, king e1. Ranks 2–6 empty.
Dragon count: starts at 1, shown as `Dragons: 1`. Player chooses to ADD dragons via the `Add 1 Dragon` button (increment by 1); there is no selector/number input, only the button.

## 3. Opponent
Name `Tony`, rating `(2100)`. Avatar: illustrated/cartoon head-and-shoulders portrait of a young man with short dark curly hair, glasses, purple/violet shirt, on a dark blue/grey rounded-square background (image alt "Tony"). Picture handle https://iwantcheckmate.com/bot-images/tony-normal.jpeg.

## 4. Dragon legal moves observed (from d1, empty board, position 1)
Selected square d1 is highlighted; 11 legal-move dots appear:
a4, b3, c2, e2, f3, g4, h5 (the two bishop diagonals) and b2, c3, e3, f2 (the four knight jumps).
No dot beyond blocked/unreachable squares; no capture dots in this position (none reachable).
=> Dragon = bishop + knight compound move (no sliding limit shown; d1-h5 diagonal unobstructed).## 5. Interaction / move mechanics observed hands-on
Turn order: White (player, King + Dragons) moves first; Tony replies automatically.
Click-to-move (also drag not tested). Clicking own piece selects it and paints legal moves.

### Highlights
- Selected square: filled magenta/orchid overlay (est. #C13BD6 / #BF2FD3 over the square colour).
- Last move (both sides): origin AND destination squares both filled with the same magenta overlay; it persists until the next move.
- Quiet legal move: filled grey dot centred in the square (~30% of square width). Dot colour adapts to square colour — light grey on light squares, dark grey on dark squares.
- Capture legal move: hollow ring (outline circle) drawn around the enemy piece, same grey tone.
- Check: the checked king's own square is filled RED (est. #D63A2E-ish) instead of magenta.

### Dragon move set (verified twice, from d1 and from f2)
From d1 (empty board): a4, b3, c2, e2, f3, g4, h5 (bishop diagonals, unlimited range) + b2, c3, e3, f2 (knight jumps) = 11 squares.
From f2 (after 1...d6): diagonals e3, d4, c5, b6, a7(capture ring) and g3, h4, plus own-king-blocked e1, g1; knight jumps d1, d3, e4, g4, h1, h3.
No "fire", no ranged/flame attack, no special square marking beyond the two move patterns; the dragon captures by landing on the square (captured piece simply disappears).

### Game events played
1. Dragon d1-f2 (knight jump). Tony: d7-d6.
2. Dragon f2xa7 (capture, long diagonal slide). Tony: Qd8-h4+ (check; e1 turns red).
3. King e1-e2 (only safe squares offered: d2, e2, d1, f1 — f2 correctly not offered, still on the h4-e1 diagonal). Tony: Ra8xa7 capturing the dragon (white left with only a king).
4. Clicked "Add 1 Dragon": board RESET to a fresh game — full black army restored on ranks 7-8, white King back on e1, and dragons placed on d1 and f1; counter became `Dragons: 2`. So "Add 1 Dragon" = restart the challenge with one more dragon (used after a loss / to retry with more firepower).

### Art style
Pieces: flat cartoon/emoji-style vector pieces with thick dark outlines and light shading; white pieces white with grey outline, black pieces dark grey (#4a4a4a-ish) with near-black outline. Standard Staunton-ish silhouettes (rook, knight, bishop, queen, king, pawn).
Dragon piece: a dragon head/neck on a plain base, drawn like a knight but with a scaled/serpentine neck, spikes along the back and a horned head, facing left; white version white with grey scale detailing.
Board: flat brown/tan two-tone (lichess-like). Light squares est. #F0D9B5, dark squares est. #B58863. Page background very dark grey/near-black (#1F1F1F-ish). Coordinates in small grey text inside corner of a-file and 1-rank squares.
Sidebar: rounded-square avatar, bold name, rating in parentheses in lighter weight, description text, then `Dragons: N` line.
Buttons: dark grey pill/rounded rectangles with white text ("Theme", "Add 1 Dragon", "Resign"), "Home" pill top-left.
"Theme" button cycles the board/piece theme (contains a small icon image; the read reported 8 decorative image copies for it).## 6. VFX / SFX timeline (observed, Dragons vs Tony)
No audio controls, mute button, or audio elements are exposed in the page's accessibility tree or text; no sounds could be verified in this browser environment (no speaker output is available to the agent). Everything below marked "visual" is confirmed on screen; the sound column records that no separate sound cue could be confirmed.

| # | Trigger | Visual effect | Approx. duration | Sound |
|---|---------|---------------|------------------|-------|
| 1 | Click own piece (select) | Square instantly painted magenta/orchid overlay; legal-move dots (empty target) / capture rings (enemy target) fade in with the same paint, no measurable animation delay | ~0 ms (instant; still fully drawn on a frame captured immediately after the click) | none confirmed |
| 2 | Click legal target (piece move) | Piece slides from origin to destination square; origin+destination get the magenta last-move overlay. Slide is short — a frame sampled immediately after the click already shows the piece parked on the destination, so the slide is under ~250-300 ms | <300 ms | none confirmed |
| 3 | Capture | Captured piece is simply removed at the moment the moving piece lands. NO fire, flame, particles, smoke, flash, screen shake, scale-pop or fade of the captured piece was visible in any sampled frame (frames sampled 0/300/600/900 ms after the click) | 0 ms extra (same slide as a quiet move) | none confirmed |
| 4 | Opponent (Tony) replies | Same slide animation and same magenta origin+destination overlay; bot "thinking" delay before the move lands measured between ~1.4 s and ~3.5 s (moves did not appear at 1.2 s but had appeared by 2.2-3 s) | delay ~1.5-3.5 s; animation same as #2 | none confirmed |
| 5 | Last-move overlay fading | The destination square keeps a saturated overlay and the origin square's overlay reads slightly lighter in later frames, i.e. the origin overlay fades toward a lower opacity over ~1 s after the move; both stay until the next move | ~1 s fade, persists until next move | none confirmed |
| 6 | Player king put into check | The checked king's own square is painted solid RED (instead of magenta) and stays red while the check lasts | instant, persists | none confirmed |
| 7 | Illegal move attempted (click on a non-legal target) | Nothing happens — no shake, no flash, no rejection animation; selection stays / is cleared | n/a | none confirmed |
| 8 | Resign clicked | Modal dialog fades in over a dimmed backdrop: dark rounded panel, bold white text "Are you sure you want to resign?", buttons "Cancel" (dark) and "Resign" (white) | instant appearance (no measurable animation) | none confirmed |
| 9 | Resign confirmed | Modal closes and the board is instantly reset to a new game at the current dragon count; no defeat screen, no score screen | instant | none confirmed |
| 10 | "Add 1 Dragon" clicked | Board instantly resets to a fresh game with one extra dragon placed; counter text increments. No spawn animation, glow or particle effect | instant | none confirmed |
| 11 | Theme button | Board + UI accent swap instantly between a brown/tan theme and a purple theme; no cross-fade | instant | none confirmed |

Not observed anywhere: fire/flame attack, breath weapon, screen shake, full-screen flash, confetti, win/lose banner, victory or defeat modal, sound toggle.

## 7. Win/lose conditions and post-game behaviour
- Rules are standard chess: check, checkmate, resignation. The Dragon only changes the move set of that one piece; there is no castling available to white (king+dragons only), and no white pawns, so no promotion/en-passant situations arise.
- Loss/ending handling observed: after resignation the game simply resets to a fresh position at the same dragon count (and after a resignation made while playing with 2 dragons the counter returned to 1). No "You lost"/"Tony wins" screen is shown.
- "Add 1 Dragon" is the retry/escalation control: it restarts the position with one more white dragon (1 -> 2 dragons placed on d1 and f1, king still e1) and the counter text updates. This is the "add another dragon" loop of the challenge: keep adding dragons until Tony can be beaten, with the goal of doing it with as few as possible.
- With 2 dragons the dragons start on d1 and f1 (flanking the king on e1); with 1 dragon it starts on d1. Black's setup never changes.
- The "Dragons: N" counter does not decrement when a dragon is captured (it is the number of dragons the game was started with, not pieces remaining).
- Board/piece theme toggle cycles two palettes: brown (light ~#F0D9B5, dark ~#B58863) and purple (light ~#EDE0F0, dark ~#9A5CA6); UI buttons pick up the purple accent in that theme.

## 8. Notes for the rebuild
- Board is 8x8, rendered as 64 square <button>s inside one container; rank/file labels are drawn inside the a-file and rank-1 squares as small grey text.
- Squares have no accessible piece names (pieces are images/CSS), so the tree shows only "button" per square.
- Legal-move markers: dot for quiet moves, ring for captures; both grey and adaptive to square colour.
- Highlight colours: last-move/selection = magenta/orchid; check = red.