# Critic report: Chess Master playtest (2026-11-27, Hark critic pass)

Tested on main at `a802da77` / `7e84e5cb`, served locally (`python3 -m http.server`), Playwright Chromium as a phone
player: 390x844 touch (DPR 2) for everything, spot checks at 360x780 (SCP-956) and 1280x800 (lobby, 4 Player Team).
16 modes opened and played with real taps on the board squares (random legal moves, captures preferred), 3D modes via
`controller.tryMove` where the canvas hides the DOM board. Screenshots: sandbox `/workspace/work/critic_shots/`
(named `<videoId>_<width>_<step>.png`; lobby shots `lobby_*`). Harness: `/workspace/work/crit_play.py`, `crit_ctl.py`.

**Sandbox caveats (not bugs):** every external request was blocked (YouTube thumbnails, Stockfish/Maia CDN), so lobby
cards show pawn placeholders and every "Stockfish" bot ran on the built-in fallback search. 3D timings are from
software rendering (SwiftShader) and are slower than a phone GPU. Sound was detected by hooking `AudioContext`/`<audio>`;
nothing was listened to.

## Verdict: 5 / 10

Broad, stable, and fast to load: 16 modes, **zero console errors or page errors**, no document overflow at 390/360,
every mode opens in ~5 s and reaches a playable board. But it plays like a 500-mode content dump wearing a Balatro skin.
The game screen is chess.com chrome with placeholder people in it: grey silhouette avatars on half the opponents,
empty or chatty status lines, raw engine notation (`*@e6`, `Bfo10`), and human-persona bots that answer in 0.1 s. The
lobby has 31 category tabs from two taxonomies stacked in one strip. The single biggest "vibecoded" tell is that nothing
on the game screen is *authored* per mode except the board: the people, the status copy and the result screen are generic.
A popular mode (Duck Chess) is visibly broken: the duck renders as a gold coin and pads the opponent's captured tray.

## Top 10 fixes (priority order)

| # | Sev | Fix | Where |
|---|-----|-----|-------|
| 1 | Major | **Duck Chess:** render the board duck with `duck.png` (it shows as a gold coin), stop counting the duck's relocation as a capture (2 ducks in Turb0Trash's tray after 4 moves), and fill the empty status line with "Move a piece" / "Now place the duck" | `js/modes/g5_duck.js` L17-20 (old duck nulled = capture diff), neutral `c:'n'` sprite lookup |
| 2 | Major | **FIXED 6430990b** (7 tabs from one list + Type picker). **Lobby tabs:** cut the 31-tab strip to ≤ 8 from ONE taxonomy. Today it mixes "Horror Chess 24" + "Horror 25", "Dice Chess 15" + "Dice 15", "Drawback Chess 38" + "Drawback 38", "Powerups & Rule Twists 29" + "Power-up 27", "Challenges & Odds 107" + "Odds 100" + "Challenge 31", and a 1-item "Guess the Elo" tab. Move the fine tags into a filter sheet | `js/lobby/lobby.js` tab build |
| 3 | Major | **FIXED 3ce69ccc** (initial + flag chip fallback, image onerror -> chip, Shotgun King / FPS art). **Kill the grey silhouette avatar.** Atomic (2025ramr), Duck (Turb0Trash), Dice (Vlad26ru), 4P (Blue), Shotgun King (The White Army), Battle Chess (Peasant), FPS (FPS Chess player) all show it. Give every persona art from its video, or a coloured monogram chip with a country flag like chess.com; never the placeholder | opponent bar, `assets/avatars` |
| 4 | Major | **4-player boards on phones:** squares are 27 CSS px at 390 (4P Team, Chaturaji, Pac-Man 14x14), below the 32 px floor the repo's own audit uses; coordinate numbers sit on top of pieces. Default the camera to the player's half at ≥ 36 px squares (the zoom pill already exists) and drop coords on 14x14 to the rim | board-view layout for 14x14 |
| 5 | Major | **Silent engine fallback:** when Stockfish/Maia fail to load, the bar still says "Stockfish (3600)" while the fallback plays 1...h5, 2...a5 and hangs a rook (SCP-956). Show "Stockfish offline: built-in bot (~1500)" in the bar and adjust the rating | `js/bot/bot.js` fallback, `CM.bus 'stockfish' 'failed'` has no UI listener |
| 6 | Major | **Generic loss copy:** Chaturaji ends with "**you were king captured**". `spec-game.js:357` builds `'you were ' + ko.why` and `why` is a noun phrase. Write the reason as a full sentence per knockout type ("Red captured your king") | `js/game/spec-game.js:357` |
| 7 | Major | **Soko Chess:** the "LEVEL 1 HUMBLE BEGINNING" banner sits on the board's top row and covers a target square. Move the banner above the board or fade it out after 1.5 s | Soko level bar |
| 8 | Minor | **4P Team at 1280:** the move list lays 4 players' moves out in chess.com 2-player triplets ("1. … d4 / Nc11 j11 k10"), so nobody can read whose move is whose. Use one row per round with 4 colour-dot columns. On phones the status pill shows bot chat ("hello I'm Croissant and I love chess") instead of the goal. Keep chat out of the status slot | move list, 4P status |
| 9 | Minor | **FIXED 4f1471ea** (js/bot/bot.js PACE: 0.6-1.8 s for human personas). **Human-persona bots reply in 0.0-0.2 s** (Fog, Spell, Duck, Atomic, Chaturaji). That reads as a machine and fights the owner's "calm UI" brief. Add a 0.6-1.8 s think delay scaled by position complexity for any bot posing as a chess.com human; Stockfish personas can stay quick | bot move scheduling |
| 10 | Minor | **FIXED 35d685e2** (onerror -> local thumb -> category-hue band with the mode name). **Result card art:** the key art is a hotlinked `i.ytimg.com` image with no `onerror`. Offline (or with YouTube blocked) it shows a broken-image icon and a 200 px empty band over "You Lost". Hide `#go-key` on error, or ship a local fallback | `js/ui/game-ui.js` ~L375-384 |

## Findings by severity, with repro

### Blocker
None found. No softlocks, no console errors, every tested mode reached a playable board.

### Major
1. **Duck renders as a coin + phantom captures + no prompt** (Duck Chess `E2x-QTgBD5k`). Repro: `#/play/E2x-QTgBD5k` at
   390, play e4, place the duck, let the bot answer twice. The board duck is a round gold token (`E2x-QTgBD5k_390_2mid.png`,
   `duck_bottom.png`), the tray above shows 2 ducks (`duck_crop.png`), and the status pill under "You" is empty. The sprite
   file itself (`assets/modes/E2x-QTgBD5k/duck.png`, `duck_sprite.png`) is fine. Move list shows raw `*@e6`; write it as "🦆e6"
   or chess.com's "@e6" with a duck glyph.
2. **Lobby taxonomy overload.** Repro: Home → scroll to "All modes" → swipe the tab strip (`lobby_390_allmodes.png`).
   31 tabs, duplicate concepts with different counts; "Multiplayer 28" shelf vs "4-Player 17" tab disagree as well.
3. **Placeholder avatars** on 7 of 16 tested modes (see the fix table). Repro: open Atomic `wTudFnunSL0`
   (`wTudFnunSL0_390_3end.png`).
4. **Tiny 4-player squares** (27 px), coords over pieces. Repro: `#/play/8XmhGMnypjc` and `#/play/sO-lD2On610` at 390
   (`8XmhGMnypjc_390_2mid.png`, `sO-lD2On610_390_2mid.png`).
5. **Silent engine fallback.** Repro: block cdn/unpkg (or play offline), open SCP-956 `agJbUnr6PCQ`: the console warns
   `[engine] Stockfish 19 unavailable`, the bar still reads Stockfish (3600), and the bot plays like a 1200
   (`agJbUnr6PCQ_360_3end.png`: white bishop took h8 by move 4).
6. **"you were king captured".** Repro: `#/play/OVM-2QJ2NFQ`, let your king get taken (`OVM-2QJ2NFQ_390_3end.png`).
7. **Soko banner over the board.** Repro: `#/play/7lEglazTlo8` at 390 (`7lEglazTlo8_390_2mid.png`).
8. **Duolingo Oscar bubble covers black's back rank** on the PLAY screen. Repro: `#/play/eCzxOgc4fTY` → PLAY
   (`duo_play.png`). Fix: anchor the bubble beside the avatar, off the board, or auto-dismiss it on the first move.

### Minor
- **4P move list at desktop** unreadable; **status slot shows chat** (`8XmhGMnypjc_1280_2mid.png`). Two seats share the
  same Mona Lisa avatar.
- **Instant human-persona replies** (timings in `critic_shots/*_390.json`, `bot_s`).
- **Broken result art offline** (`wTudFnunSL0_390_3end.png`).
- **FIXED (cm_pol, Fog)** (player bar says "You" in the 3 series modes, handle kept as `player.handle`; boxes labelled "Wins"). **Fog of War names the player "ireallywan…"** (truncated) where every other mode says "You"; the "1 2 3 4 5" chips
  next to it have no label (games won? games left?). Repro: `#/play/nXpanP8v3pg` (`nXpanP8v3pg_390_3end.png`).
- **FIXED (cm_pol, SCP-4975)** (css/board.css draws the full-frame art at 0.88 of the square; inside its square at 390/360). **SCP-4975's crawler sprite overflows its square** into the neighbours (`HuZlhHnES7M_390_2mid.png`). Scale it to 0.9 of a
  square, or let it overflow only upward like a tall piece.
- **Spell Chess:** the frozen-piece ice cube covers most of the piece (g2 in `Ag3KKsIrax4_390_2mid.png`). Make it a 40 %
  translucent tint plus a small corner snowflake. The lime grass board fights the dark felt shell; use the video's flatter greens.
- **FIXED (cm_pol, Shotgun stats)** (status line is now a prompt; floor/shells/power/range/arc only in the HUD panel, which gains the /12). **Shotgun King:** the chess.com player bars and the pixel-art HUD both report state (the status line repeats
  "FLOOR 1/12 · shells 2/2 · power 2 · range 3 · arc 55°" under a panel that already shows it). Drop the duplicate line and
  re-skin the bars in the game's pixel style (`AvZiSnngZjA_390_2mid.png`).
- **FIXED 677c0ef0** (readable labels: "Bishop → o10", drops "Duck on e6"). **Backrooms move list** shows `Bci16`, `Bfo10` on the 30-file board, and the default zoom shows no coordinates. Show
  coords at every zoom, or hide the SAN strip and show "Bishop → o10" (`xp6Pr-rB4JA_390_2mid.png`).
- **FIXED (cm_pol, lobby)** (meta line wraps before the date, date never splits; identical titles/card names for different videos get a muted "· 2025" / "· Mar 2026" subtitle). **Lobby list:** the date is cut ("Nov 2…") on every row at 390, and the same mode carries two names ("SCP-956" on cards,
  "Chess, But SCP-956 Is After the Children" in the list). Two search results for "atomic" are both titled "Can I SURVIVE
  Atomic Chess?" with nothing to tell them apart (`lobby_390_search_atomic.png`). Add the opponent or the year as a subtitle.
- **Home is 6,345 px tall at 390** (7.5 screens), mostly lazy family shelves. Cap Home at hero + Continue + 3 shelves +
  "All modes"; move the family shelves behind "Browse".

### Polish
- **Dice Chess dice** are small piece chips under "You", not dice. There is no roll moment, so the luck that drives the
  video never lands. Show 3 dice faces that tumble for 400 ms (calm, no bounce) beside the board. Rules match the video
  (3 piece dice, king capture wins, castling needs a K and an R die).
- **FPS Chess VS card:** the 3D knight has a visible hole in the head mesh, and the orange "Vs" on beige is low contrast
  (`PszkLYudcws_390ctl_cap10.png`). Check the knight's normals and give "Vs" a dark outline.
- **SCP-956 pacing:** after 6 moves each there were 10 hidden pinatas and 3 pawns left (`agJbUnr6PCQ_360_3end.png`). The
  gimmick burns out into pawnless chess by move 8. Re-check the bonk/spawn cadence against the video's mid-game frames.
- **FIXED a3c2da00** (repeat piece-pair fights auto-skip; "New fights / All fights" pill). **Battle Chess:** about 7 s per ply including the fight (software GL). Skip and 1x are there, but offer "auto-skip
  fights after the first of each piece pair" so a 40-move game is not 5 minutes of cutscenes.

## Per-mode table

| Mode | Id | Score /10 | Biggest problem | Fix |
|------|----|-----------|-----------------|-----|
| Lobby / Home | – | 5 | 31 tabs from two overlapping taxonomies; 7.5-screen home | ≤ 8 tabs from one taxonomy; tags in a filter sheet; shorter Home |
| SCP-956 Pinata (featured) | agJbUnr6PCQ | 6 | Board is pawnless by move ~8; ~~"Stockfish 3600" when the engine fails~~ FIXED (cm_cfa critic fix 5: "Built-in bot (~1500)" + quiet offline line) | Tune spawn cadence vs video |
| SCP-4975 | HuZlhHnES7M | 6 | ~~Crawler sprite spills into neighbouring squares~~ FIXED (cm_pol) | Fit sprite to 0.9 square |
| Atomic | wTudFnunSL0 | 6 | Grey placeholder opponent; broken art band on the result card offline | Persona avatar; `onerror` hide |
| Fog of War | nXpanP8v3pg | 6 | ~~Player shown as truncated "ireallywan…", unlabelled 1-5 chips~~ FIXED (cm_pol) | "You" + label the chips |
| Duck Chess | E2x-QTgBD5k | 4 | ~~Duck drawn as a coin, phantom captures, no placement prompt~~ FIXED (cm_cfa critic fix 1): duck.png on board, no duck in the tray, status prompts each step | Move list still raw `*@e6` |
| Dice Chess | CEkC0TINhm8 | 6 | Dice are tiny chips; no roll moment; opponent has no rating | Real dice faces with a calm tumble |
| 4 Player Team | 8XmhGMnypjc | 4 | ~~27 px squares; desktop move list unreadable; chat in status slot~~ FIXED (cm_cfa critic fixes 4 + 6: goal + turn in the pill; opens at 36 px on your side with Fit toggle; coords off pieces; one move row per round with colour dots) | Croissant and Green share one avatar |
| Chaturaji (4P) | OVM-2QJ2NFQ | 5 | ~~"you were king captured"~~ FIXED (cm_cfa critic fix 2): "Red captured your king." | 27 px squares (see 4P row) |
| Battle Chess (3D) | IbRrzKtieqs | 7 | ~7 s per ply with fights; placeholder Peasant avatar | Auto-skip repeat fights; avatar |
| FPS Chess (3D) | PszkLYudcws | 5 | Knight mesh hole on the VS card; "FPS Chess player" placeholder name | Fix mesh; name the opponent |
| Shotgun King | AvZiSnngZjA | 6 | chess.com bars clash with the pixel game; ~~duplicated stats~~ FIXED (cm_pol) | Pixel-skinned bars; one stat readout |
| Pac-Man Chess | sO-lD2On610 | 6 | ~~14x14 at 27 px squares~~ FIXED (cm_cfa critic fix 6: opens at 36 px on your king, Fit toggle); dense glyphs (rules match the video) | Bigger glyphs |
| Spell Chess | Ag3KKsIrax4 | 6 | Ice cube hides frozen piece; garish grass board | Translucent freeze tint; flatter greens |
| Soko Chess | 7lEglazTlo8 | 6 | ~~Level banner covers the top row/target~~ FIXED (cm_cfa critic fix 3): centred title card on level open only, faded (1.4 s, input held) before play | – |
| Duolingo: Oscar | eCzxOgc4fTY | 6 | Oscar's bubble covers black's back rank | Bubble off-board / dismiss on first move |
| Backrooms | xp6Pr-rB4JA | 6 | Unreadable SAN (`Bfo10`), no coords at default zoom | Coords at every zoom; plain-language moves |

## Video accuracy spot checks (transcripts via analyze_video)
- **Dice Chess `CEkC0TINhm8`:** matches. 3 dice per turn, one move per die, king capture wins, castling needs a rook and a
  king die (0:01-1:38).
- **Pac-Man Chess `sO-lD2On610`:** matches. Red/Yellow players, the wazir "Bob" survives 3 checks, points for blue
  pieces, the green bot plays 50 % attack / 50 % random and is uncapturable, Captain Rex 1476 (0:03-0:44). The status
  pill shows points and checks left.
- **Duck Chess `E2x-QTgBD5k`:** rules match (0:01). The visuals do not: the video's duck is a duck, the board shows a coin.
- 4 Player Team `8XmhGMnypjc`: the transcript service returned 404; not checked.

## Sound (detected, not heard)
Every mode fired a themed start sting plus move sounds; captures used themed sets (`arena_capture`, `magic_capture`,
`pac_chomp`, `pinata_bonk`). Shotgun King fired no gun sound in 8 random moves; check that a shot plays one. FPS fired
3 sounds in 6 moves.
