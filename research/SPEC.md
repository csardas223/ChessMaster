# Chess Master mode research spec

Goal: for every video in your batch file, record what the video ACTUALLY shows, so the game mode can be rebuilt to match it exactly. The current implementations are often wrong (e.g. Backrooms Chess, the Gravity modes, most Horror modes).

## Sources per video
1. Transcript: call deferred tool `analyze_video` with url `https://www.youtube.com/watch?v=<id>` (describe it first). It writes an .srt / transcript .md into /workspace/web/downloads/. Read it fully.
2. Visuals: download `https://i.ytimg.com/vi/<id>/maxresdefault.jpg` (fallback `hqdefault.jpg`) with curl into research/thumbs/<id>.jpg and LOOK at it with read_file. YouTube blocks yt-dlp downloads, so full frames are not available in bulk; describe what the thumbnail and transcript establish, and mark anything you inferred as inferred.
3. Current implementation (for diffing): /workspace/work/cm.html contains the existing mode rules (search for the title or keywords in the MODES array and the modes_extra block). Note what it gets wrong.

Many videos share a format (e.g. "Stockfish, But ..." bots, "1 X vs N pawns" odds). Still read each transcript; rules differ in details.

## Output
One JSON file per video at /workspace/work/chessmaster/research/modes/<id>.json:

```json
{
  "id": "xp6Pr-rB4JA",
  "title": "Backrooms Chess",
  "category": "Horror Chess",
  "summary": "one paragraph: what happens in the video",
  "rules": ["exact rule 1", "exact rule 2"],
  "win_condition": "...",
  "player_side": "white|black",
  "opponent": {"name": "Stockfish|Martin|...", "rating": 3600, "avatar_description": "what the opponent's profile pic looks like / should look like"},
  "board": {"files": 8, "ranks": 8, "shape_notes": "non-square/holes/infinite/etc", "light": "#eeeed2", "dark": "#769656", "theme_notes": "visual style: dark, glitchy, yellow backrooms wallpaper, etc"},
  "pieces": {"set": "standard|custom", "custom_pieces": [{"name": "SCP-096", "symbol": "?", "moves": "...", "look": "..."}]},
  "setup": "FEN if standard-ish, else a clear description of starting position",
  "events": ["timed/random events, jumpscares, effects, with triggers"],
  "visual_fx": ["screen effects, sounds, animations the mode needs"],
  "current_impl_issues": ["what the existing code gets wrong"],
  "confidence": "high|medium|low",
  "evidence": "transcript timestamps / thumbnail observations backing the above"
}
```

Also append one line per video to research/progress_<batch>.txt as you go so work survives interruption; skip ids that already have a JSON file (resume-safe).
Work through the entire batch. Do not stop early. At the end, write research/batch<N>_report.md with counts and the list of low-confidence ids.
