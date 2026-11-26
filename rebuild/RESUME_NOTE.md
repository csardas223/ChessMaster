# Resume note (updated 2026-11-25 11:45 PM ET, paused at the daily usage cap)

## State
- `main` = dd220d6, synced from rebuild 0463918. Smoke PASS, `node --test` OK.
- Main-only commits that `merge_to_main.sh` wipes (re-apply after every sync with `git cherry-pick -X theirs`, in order): the main-history equivalents of Freebuff 37789de, owner 9c370ae (synth SFX), owner 16aa456 (pycache), and Freebuff 4161da3. On main today these are ebd99df, 06f3551, 2cc1c08 and dd220d6. After the picks, check that js/ui/loader.js, js/fx/vfx.js and js/core/settings.js still equal rebuild's.
- Landed tonight:
  - loader-v2 3b0a602: thumbnail-shimmer loader with a small pawn, plus a vfx.js gate that blocks image overlays at game start.
  - newvid-mode da592d7: Jupiter 2011, Mg2Upjjo2yg.
  - glasses-3d a43e504: staunton3d PNG set.
  - sprite-sweep ed14711 and 6317b22.
  - sprite-fix2 92659ea.
  - sprite-fix3 9206b19 and 0463918.

## Owner art rule (Nov 25)
For a sprite with a baked-in background or clipped edges, try these in order:
1. Find the same image on the web.
2. Else, use the best alternate.
3. Else, composite it from clean parts, e.g. a king image plus a Minecraft sword image.

Never use faded edges as the fix. Output a transparent PNG of at least 2× the square (512 px), centred at about 90%. Put sources in `source.notes`.

## Next (in order)
1. Sprites still bad. rembg failed on these, so don't retry it; they need found images or hand composites.
   - DONE 11:39 PM Nov 25 (sprite-fix4, rebuild 064d93d..258fc7d, main 559af10): scp966, deer and waldo use the creator's own transparent art at https://iwantcheckmate.com/challenges/<name>/<name>.png. Only 18 challenges are hosted there; the list is in the site's main JS, so **check there first** for any sprite. Both trolls are composites (/workspace/work/sf4_troll.py).
   - TODO rf2HSTXTehE and _RFXN1Ye3sY queen_face: no web copy yet. Try Ouroboros King on Steam or its press kit.
   - TODO U67wZoy-1fE despair: source creature unknown ("Chess, But He Knows How to Despair You", Nov 10 2026).
   - TODO JUlTxosCXuk scp2774: SCP wiki New_Slothman.jpg and the "Fear the Sloth" art have backgrounds. Cut one cleanly or composite.
   - TODO _Kx4ChHuCgI oldman (SCP-106): the closest alternate, the SCP Tower Defense 3D render, doesn't match the 2D bust style. Find a 2D bust or composite.
   - Then BLURRY_SPRITES.md (research/, 342 auto-marked, 255 used by mode files; only waldo ticked), then the rest of the sweep's flagged list (the sprite-sweep section of research/polish_report.md). Tick lines as you go.
   - A Hark task resumes this at 7:50 PM ET Thu Nov 26, after the usage reset.
2. Loader: owner chose pure thumbnail shimmer (pawn and tint removed, 2026-11-25).
3. Jupiter 2011: the exact ship map and the Key count are inferred (medium confidence).
4. Still 2D: Chess Arena CONozr99agQ and Table Tactics xvlHij1tgk8.
5. Art passes: art1 next is CRrPXR1WuDo, art2 next is UECeBEOHoy0, art3 order lines 81-166.

## New videos (daily check)
A daily Hark task checks youtube.com/@iwantcheckmate. When a new video appears:
- Add it to data/videos.json with `coming_soon: true` and a `teaser` written from the video's transcript.
- Run `node tools/build-data.mjs`.
- Commit to rebuild, then sync main.

The banner (js/lobby/hype.js) features the newest coming_soon video.

## WARNING (9:45 PM Nov 25; still true 11:45 PM)
Main now has direct pushes that rebuild lacks: 82137ea "SFX v2" and 8f0bec2 "Jupiter 2011: Skeld map + video-accurate Keys", plus merges. Main is b5b774e. Before running merge_to_main.sh again, port these into rebuild, or ship rebuild changes to main as patches (git diff --relative=rebuild/app A B | git apply --3way), so they aren't wiped. The loader went to main that way.

Main is now 559af10, on top of 8a2223f "Add HANDOFF.md for the next AI", another direct push. Read HANDOFF.md on main too. It lists wip/* branches (sfx-v5, fps-3d, 3d-polish, icm-coverage) that rebuild doesn't know about. Ship rebuild changes to main with `git diff --binary --relative=rebuild/app A B -- rebuild/app | git apply --3way`. **--binary is required for PNGs.**
