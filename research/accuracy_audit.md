# Accuracy audit (m-accuracy, 2026-11-26)

Scope: every research spec with `playable: false`, `kind: video_game` or low confidence, every id in
`research/recheck_low_confidence.json`, mode files with `confidence: low` or `_deferred` gaps, and videos with no mode file.
Sources: research/modes/<id>.json (summary/rules/evidence), the mode file in data/modes/, data/legacy_modes.json (what the
app falls back to when there is no mode file). Priority: P1 = the video is a different game/look than the app and it is
cheap to fix with existing modules; P2 = real gap that needs a new module or transcript work; P3 = known, documented
approximation; OK = matches.

## Prioritised gaps

| id | what the video shows | what the app does | gap | priority / status |
|---|---|---|---|---|
| C9v7G3dJl7E | Steam roguelike Once a Pawn a King: tutorial + Cellars rooms, patrols with order numbers, Pull/Hop, mana, Butcher, keys/chests | (before) no mode: legacy fallback | whole game missing | P1 - FIXED (this session: frame game js/games/once-pawn-king.js) |
| vcMhd5Vd1mM | Normal chess inside a Roblox chess game: 3D lobby, VS splash mo_waffles vs check_zeejay, brown 3D board, magenta neon walls | no mode file: legacy "gauntlet" (2D generic bots) | no Roblox look, wrong opponent framing | P1 - FIXED (m3-salvage: mode file, robloxTable 3D view, transcript opponents/ratings/clock) |
| dDtGI5U0HQk | Normal rated chess in a Roblox chess experience (tavern lobby, rating HUD ~1486-1535) | no mode file: legacy gauntlet | no Roblox look/rating HUD | P1 - FIXED (m3-salvage: mode file, robloxTable 3D view, transcript opponents/ratings/clock) |
| ls3U1YKj9As | Normal rated chess in a Roblox chess experience (VS Chip131213 vs mo_waffles, rating 1430-1460) | no mode file: legacy gauntlet | no Roblox look | P1 - FIXED (m3-salvage: mode file, robloxTable 3D view, transcript opponents/ratings/clock) |
| jmdkuvE2ApQ | Infinite Craft (neal.fun): craft Chess -> Checkmate -> Want + Checkmate = iwantcheckmate | no mode file: legacy "craft" stand-in | not the crafting sandbox; target differs from -TKJGtBKK8U | P1 - FIXED (m3-salvage: frame game g4_craft with params.craft; goal Checkmate as reached in the video; transcript shows iwantcheckmate is never found, so the thumbnail recipe is not used) |
| xRximnDlQtI | Chess Ultimate (3D): new Cosmic Mage skin + ranked matches with the Mage | no mode file: legacy "fairy" Mage | not Chess Ultimate at all | P1 - FIXED (m-accuracy 2: data/modes/xRximnDlQtI.js on js/modes/cu_mage.js over g4_cu: 8x10 board, MAKE A TEAM! 100 pts on ranks 1-3, IWC Mage skin art, Mage swap promotes a pawn, squid 1 pt, 60 s turns, the 4 transcript opponents in order; lineups inferred) |
| 4FRsSJoxMkE | Chess Ultimate (3D): "MAKE A TEAM!" draft with costs (wizard, pink octopus), 60 s turns, online matches | no mode file: legacy "fairy" Mage | not Chess Ultimate | P1 - FIXED (m-accuracy 2: data/modes/4FRsSJoxMkE.js, same module: bomb setup, Bomb 20 pts, King Hedgehog / Tiuri / Julian#6 from the transcript; lineups inferred) |
| UzoZVdmGpyc | Who Wears the Crown?: Getting-Over-It style platformer climbing a tower of chessboards | sequence of 3 board positions vs Stockfish 1300 (g5_levels) | platformer climb between boards not built (_deferred) | P2 |
| Y7KKKTTkwNk | King of the Bridge, secret Goose ending | Troll chess (g5_troll) with a goose that arrives after ply 60 / 3 catches | goose trigger invented (confidence low) | P2 - FIXED (m-accuracy 2: transcript: goose comes after ~25 moves whether you cheat or not, you put the Troll King on it, Bon Voyage ending; g5_troll params.goose.carry) |
| SMOXF1bSsDk | 3D exploration game (black void / accretion disk) | 2D board, invented level layouts (confidence low) | no 3D camera; layouts invented | P2 (3D: m-3d area, not touched) |
| RDl-EmbTRWc | Chessformer levels 1-20 (puzzle platformer with gravity) | two legible levels + gravity | other levels not legible; move-then-fall slide | P3 (m-levels area) |
| M0rsyuvaTrk | King of the Bridge (base) | Troll chess | bishop gift pickups, ending cutscene (_deferred) | P3 |
| WEYUcaJTBso | King of the Bridge (base) | Troll chess | bishops working out of town, rules 7/12/14/24 (_deferred) | P3 |
| NK4Upb_s8Ok | Shotgun King Rank 3: 12 floors with irregular boards | 6 floors on 8x8 | floor count/board shapes, card downsides (_deferred) | P3 |
| CONozr99agQ | Chess Arena: real-time 40-player 3D battle royale | g4_rt 2D real-time, 8 kings | 2D, 8 not 40 players | P3 (3D: other agent) |
| xvlHij1tgk8 | Table Tactics 3D physics diorama | g6_table_tactics 2D top-down | 2D not 3D | P3 (3D: other agent) |
| boaA9_TjXeU | community variant (confidence low) | reconstructed walls/armies | army squares, walls inferred | P3 |
| xg_djfCrRes | community variant (confidence low) | walls/armies read from one frame | a few pieces may have moved in the frame | P3 |
| x-ISu_8MDvY | 6-round 5+0 Finegold arena | mode file exists (rounds rotate, Finegold 2700) | none found: the brief said it had no mode, but data/modes/x-ISu_8MDvY.js exists | OK |

## Video-game modes that already match (spot-checked against spec summary)

These `kind: video_game` specs have a dedicated mode (custom hooks or a game module) whose rules follow the video; no
accuracy gap beyond art/3D items tracked elsewhere:

- `0LO0D0rOif0` Can I BEAT King of the Bridge? (Good Ending) -> chess mode, hooks
- `1L_sxGgxX9M` Can I BEAT Passant? [Conclusion] -> chess mode, hooks
- `2er3r0JGeNg` Can I BEAT a 2000 ELO with 1 Pawn? -> chess mode, hooks
- `9j7h5kF4X9s` Can I BEAT Shotgun King? [RANK 4] -> chess mode, hooks
- `AWFB4EzGtDc` Can I BEAT Gun King? -> game g4_gunking mode, data only
- `AvZiSnngZjA` Can I BEAT Shotgun King? -> chess mode, hooks
- `B3wErwlKytA` How Many Dragons to BEAT a Chess YouTuber? (feat. two niche) -> chess mode, hooks
- `BbgwPj-u_gs` Can I BEAT 5D Chess? -> game g4_5d mode, data only
- `Cs6knoD0INQ` Can I BEAT YouTube Chess? -> chess mode, hooks
- `Cv28-UoZseg` Can I BEAT Sergeant's Checkers? -> chess mode, hooks
- `CxtttdnwNWk` I Entered a Chess Ultimate Tournament... -> chess mode, hooks
- `DMtaRFMpCWc` Can I BEAT Wizard Chess? -> chess mode, hooks
- `EqOwqolOZOo` Can I MASTER Roblox Chess? -> chess mode, hooks
- `F0nfkeR-QEg` The END of Ninja + Angel | Chess Ultimate UPDATE -> chess mode, hooks
- `FxpWhTj2Cv4` Can I BREAK Chess Ultimate? (OP Strategy) -> chess mode, hooks
- `I07GcHQtY2o` Can I BEAT Chess Ultimate? (Ninja Method REFUTED) -> chess mode, hooks
- `IU9a1RB1KJw` Chess, But You Can't Capture Pieces... -> chess mode, hooks
- `JAz_qMQpI1o` Can I DEFEAT Ouroboros King? -> chess mode, hooks
- `JcpCAs1a2gc` Can I BEAT Anarchy Chess? -> chess mode, hooks
- `Kzt9ItpGtYg` Can I BEAT Pawnbarian? -> chess mode, hooks
- `M0Nr98Axpo8` Can I BEAT Chess Ultimate? -> chess mode, hooks
- `OO3XlFQ32i0` Can I BEAT Passant? [Full Release] -> chess mode, hooks
- `PszkLYudcws` Can I BEAT FPS Chess? -> chess mode, hooks
- `QrKIKcYN5m4` Can I BEAT Stone Gravitation? -> chess mode, hooks
- `UZ79sKLa6z4` 1 Chess Speedrunner vs 3 Hunters -> chess mode, hooks
- `WXcmWG7Eczs` I Challenge a Dev to their OWN Chess Variant (Anarchy Chess) -> chess mode, hooks
- `YZjdissxTyA` Can I BEAT Cross Derby? (NEW Variant) -> chess mode, data only
- `Zc8ljpWtYWQ` Can I BEAT Behind the Mirror? -> chess mode, hooks
- `_RFXN1Ye3sY` Can I MASTER Ouroboros King? -> chess mode, hooks
- `d8pJkdxtXAA` Can I BEAT Hyper Chess? -> chess mode, hooks
- `dKBSZUzVQ1E` Can I BEAT Chess Ultimate with a Normal Chess Setup? -> chess mode, hooks
- `djfYBXvvaYI` Can I BEAT Villagers Chess? -> chess mode, data only
- `dkCMhNcZezM` Can I BEAT Passant? [Full Release - Part 2] -> chess mode, hooks
- `dztzDlPfqSI` Can I CONQUER Passant? -> chess mode, hooks
- `ehlf0_asIKo` I Tried WEIRD Chess Ultimate Setups... -> chess mode, hooks
- `gY9DNg9xDUM` Can I MASTER Tiny Chess? -> chess mode, data only
- `lmmKhSrRn_c` Can I BEAT Explosive Magic? -> chess mode, hooks
- `nWdjqATRp5k` 1 Amazon vs. 1 Queen -> chess mode, data only
- `o8XcmMCIhIk` How Many Dragons to BEAT Stockfish? -> chess mode, hooks
- `oAoik9Dj2qQ` Can I MASTER Chessformer? -> chess mode, hooks
- `onr_ABfEMGk` I Played Only WEIRD Chess Ultimate Pieces... -> chess mode, hooks
- `pPQDMtvu5rk` I Played RANKED Chess Ultimate... -> chess mode, hooks
- `piiE6JB8pWw` Can I BEAT Tiny Chess? -> chess mode, data only
- `puKYAUl9x9s` Can I BEAT King of the Bridge? (Bullet Ending) -> chess mode, hooks
- `pzxXxIsKRRo` Can I BEAT Shotgun King? [RANK 2] -> chess mode, hooks
- `qZyNuiVbGMI` Can I MASTER Passant? -> chess mode, hooks
- `qqvbb2r2k5I` Can I BEAT Gambonanza? -> chess mode, hooks
- `rMSar6g_2HY` Can I BEAT Passant? -> chess mode, hooks
- `rf2HSTXTehE` Can I BEAT Ouroboros King? -> chess mode, hooks
- `rx-HCGCNuDo` Chess, But My Pieces Have Gravity -> game sword-king mode, data only
- `sGXmiyvZDE4` Can I BEAT Petrified Pawns? -> chess mode, hooks
- `sO-lD2On610` Can I BEAT Pac-Man Chess? -> chess mode, hooks
- `spJibM5qaNQ` Can I BEAT Chess Survivors? -> chess mode, hooks
- `tm24Uq9nlBc` Can I Beat LUXURY Chess? -> chess mode, hooks
- `u0hl8g63mUg` Can I BEAT the 12 Pawns Opening? -> chess mode, hooks
- `ulE3YPZI9Sc` Can I BEAT King of the Bridge? (Ascension Ending) -> chess mode, hooks
- `vDzojyJO3sI` Stockfish, But It Takes 31 Pieces Before Checkmating You -> chess mode, hooks
- `w4L_Obw74dE` I Tried INSANE Chess Ultimate Setups -> chess mode, hooks
- `wwVvGHfEfPI` Is the BEST Strategy Nerfed? (Chess Ultimate) -> chess mode, hooks
- `y5MBC8OCYlI` Can I BEAT Cornered Kings? -> chess mode, data only
- `zP9TzlgA-W0` Can I MASTER Pawnbarian? -> chess mode, hooks
- `zxRM5dD5b7w` Can I BEAT Chess Knightmare? -> chess mode, hooks

## No mode file, legacy fallback is acceptable (normal-chess videos)

These are normal chess, bot gauntlets, opening drills or explainer Shorts. The legacy port plays a fitting stand-in
(gauntlet of bots, forced opening, fairy-piece demo, puzzle). Priority P3: only worth a mode file for flavour
(opponent names/ratings/boards from the frames).

- `-2PdVk71D1Q` return of the mack (n/a) -> legacy `roulette` "Return of the Mack"
- `2Nvg8xDNnkA` I Played Chess in Minecraft (feat. ViperKing) (n/a) -> legacy `blocks` "Chess in Minecraft"
- `3dZa3R5KQag` Can I BEAT the Chess Piece Bots? (September) (n/a) -> legacy `gauntlet` "The Chess Piece Bots"
- `4tpkxYdDafE` Can I BEAT Higher Ground Achievement? (achievement_hunt) -> legacy `base:King of the Hill` "Higher Ground"
- `5iSjXn71oJg` Can I BEAT the Karate Bots? (chess_variant) -> legacy `gauntlet` "The Karate Bots"
- `5znG8YxoU0A` Can Martin Get to Grandmaster? (normal_chess) -> legacy `shiftelo` "Martin's Road to Grandmaster"
- `6FTov-lER7k` Can I BEAT Mix Master? (achievement_hunt) -> legacy `base:Chess960` "Mix Master"
- `92iLZk0a3nw` Am I Still a SMURF? (standard_chess) -> legacy `gauntlet` "Am I Still a Smurf?"
- `A82x0ireZjU` Can I BEAT the Heist Crew? (bot_gauntlet) -> legacy `heist` "The Heist · Beat"
- `AQUZ910edmY` What is my Chess Personality? (n/a) -> legacy `classic` "What Is My Chess Personality?"
- `B0F9nSVSB-k` Can I Make Martin a Grandmaster? (n/a) -> legacy `shiftelo` "Teach Martin to Be a Grandmaster"
- `CfNegcvzrFw` Can I LEARN 1. e4 in 24 Hours? (chess_variant) -> legacy `opening` "Forced Opening: 1. e4 · Learn"
- `EbMPOuH0a28` How much is a King worth? #chess (chess_variant) -> legacy `fairy` "How Much Is a King Worth?"
- `Eet1MTWuNBE` Can I Solve a 3600 ELO Puzzle? (puzzle_ladder) -> legacy `puzzle` "3600 Puzzle (smothered mate)"
- `Exu676O9sxE` I Played the Spookiest Halloween Opening... (n/a) -> legacy `opening` "Forced Opening: Halloween Gambit"
- `F3CgCAxsTcI` I Played a National Master In My FIRST Tournament... (n/a) -> legacy `classic` "First Tournament vs a National Master"
- `FHkTnUyAWLA` Can I SURVIVE Lichess? (n/a) -> legacy `classic` "Survive Lichess vs Lichess Stockfish (level 8)"
- `GYdiE3h5mLM` ENOUGH is ENOUGH (standard_chess) -> legacy `roulette` "ENOUGH is ENOUGH"
- `GbyaIV7Vd1c` Can I SURVIVE the Sodium Attack? (n/a) -> legacy `opening` "Forced Opening: Sodium Attack (1. Na3) · Survive"
- `HOLAoBdsalA` How Much is a Knook Worth? (explainer) -> legacy `fairy` "How Much Is a Knook Worth?"
- `K48JtWGS0Tc` a very normal chess video (standard_chess) -> legacy `roulette` "A Very Normal Chess Video"
- `KSjhrEtd0tE` How much is a Wildebeest worth? (explainer) -> legacy `fairy` "How Much Is a Wildebeest Worth?"
- `N9oTio7G4vc` Magnus vs. Martin with 8 QUEENS (bot_vs_bot) -> legacy `howmany` "8 Queens vs Martin"
- `NTZVWUtp2DM` Road to NM: The Beginning (n/a) -> legacy `gauntlet` "Road to National Master"
- `PY0828x1VBc` Can I BEAT 99.9% of Chess Players? (again) (n/a) -> legacy `gauntlet` "Top 0.1% (again)"
- `SziPGAIumqE` Average London System Propaganda | Should YOU Play It? (opening_video) -> legacy `opening` "London System Propaganda"
- `TGBWoxXqzOg` Martin is (√5776)% Grandmaster (normal_chess) -> legacy `martinfish` "Martin, 76% Grandmaster"
- `ULUmwre92Cc` Can a Chess Player Solve a MURDER? (video_game) -> legacy `murder` "Whodunit"
- `XfTqjcXKqF4` How much is a knight-rider worth? (explainer) -> legacy `fairy` "How Much Is a Knightrider Worth?"
- `YVhTi1FeTso` i'm not crazy i'm not crazy i'm not crazy i'm not crazy i'm  (n/a) -> legacy `roulette` "I'm Not Crazy"
- `b_BKi_Q4LfU` How Much is a Dragon Bishop Worth? (chess_variant) -> legacy `lone` "How Much Is a Dragon Bishop Worth?"
- `bzaVzl9friM` DON'T LOOK DOWN | Rating Climb Ep. 1 (n/a) -> legacy `gauntlet` "Don't Look Down: Rating Climb"
- `eCzxOgc4fTY` Can I BEAT Duolingo Chess? (app_review) -> legacy `hearts` "Duolingo Chess"
- `eEarfgeHByE` Can I BEAT a Chess Cheater? (chess_variant) -> legacy `classic` "Beat a Chess Cheater"
- `ehmkD8nOG0g` Can I BEAT Mad Scientist? (achievement_hunt) -> legacy `craft` "Mad Scientist"
- `f5gm9cPvu3g` Can I BEAT the BBQ Bots? (August Bots) (n/a) -> legacy `gauntlet` "The BBQ Bots"
- `hCKu-RjDEAk` Can I BEAT 99.9% of the World? (n/a) -> legacy `gauntlet` "Beat 99.9% of the World"
- `hm0op9p3RVk` danish is a dessert best served cold | Learning an Opening i (n/a) -> legacy `opening` "Forced Opening: Danish Gambit"
- `ijWyDYdELkg` GRANDMASTER GRANDMASTER GRANDMASTER GRANDMASTER GRANDMASTER (normal_chess) -> legacy `gauntlet` "Grandmaster x5"
- `jQmUHscKQvk` I Was Bamboozled, Can I Fight My Way Back? (n/a) -> legacy `classic` "Bamboozled: Fight Back"
- `jVy2dkoM-9g` Can I BEAT 99.9% of the World? (i am running out of graphs) (n/a) -> legacy `gauntlet` "Top 0.1% (out of graphs)"
- `je1fukNFWSw` Can I BEAT the Halloween Bots? (n/a) -> legacy `gauntlet` "The Halloween Bots"
- `lBBL4aOMENY` Can I BEAT 3 Strikes? (achievement_hunt) -> legacy `base:3-Check` "3 Strikes"
- `qDKQ0TZbSKo` Can I BEAT the London System? (n/a) -> legacy `opening` "Forced Opening: London System · Beat"
- `s59xwt9TDMU` face reveal + updates (channel_update) -> legacy `roulette` "Face Reveal Special"
- `u5qp8WJSOSg` I Played a Tournament as the Lowest Rated Player... (standard_chess) -> legacy `gauntlet` "Lowest Rated in the Tournament"
- `ufZ_nZCkaII` Am I a SMURF? (standard_chess) -> legacy `gauntlet` "Am I a Smurf?"
- `vGfdq7j_deY` I Hijacked This Streamer's Chess Tournament (chess_variant) -> legacy `gauntlet` "Hijacked a Streamer's Tournament"
- `xi8OzINkaiA` My Last Video (April Fools) (standard_chess) -> legacy `roulette` "April Fools"
- `ySfA6lWFTcY` Geeked vs Locked In Chess (standard_chess) -> legacy `classic` "Geeked vs Locked In"
- `yktO2PgN_JA` Last Chance to Beat 99.9% Of the World? (n/a) -> legacy `gauntlet` "Last Chance at the Top 0.1%"
- `ylsnkIXgqzw` Can I BEAT the French Defense in 24 Hours? (n/a) -> legacy `opening` "Forced Opening: French Defense · Beat"
- `yuOnzbeYI1k` Can I Learn the King's Gambit in 24 Hours? (chess_variant) -> legacy `opening` "Forced Opening: King's Gambit"

Generated from tools-free dump (research specs + data/legacy_modes.json); hand-assessed rows above.
