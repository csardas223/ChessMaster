# Sounds

The board sounds are the Lichess **piano** sound set from
[lichess-org/lila `public/sound/piano`](https://github.com/lichess-org/lila/tree/master/public/sound/piano),
made by Enigmahack and licensed **AGPLv3+** (see lila's `COPYING.md`).
Files were fetched from `https://lichess1.org/assets/sound/piano/<Name>.mp3` on 2026-11-26.

They replace the chess.com default sound set that used to ship here (that set is proprietary).

| Game sound | Lichess file |
|---|---|
| `move-self`, `move-opponent`, `castle`, `promote`, `premove` | `Move.mp3` |
| `capture` | `Capture.mp3` |
| `move-check` | `Check.mp3` |
| `notify` | `Confirmation.mp3` |
| `illegal` | `Error.mp3` |
| `game-start`, `game-end` | `GenericNotify.mp3` |
| `tenseconds` | `LowTime.mp3` |
| `victory`, `defeat`, `draw` | `Victory.mp3`, `Defeat.mp3`, `Draw.mp3` |

Lichess uses a single move sound for both colours and has no separate castling, promotion or premove
sound, which is why several names share `Move.mp3`.

`tick.wav`, `jumpscare.wav` and `explosion.wav` are this project's own synthesised sounds.
Mode-specific sounds live in `assets/modes/<id>/`.
