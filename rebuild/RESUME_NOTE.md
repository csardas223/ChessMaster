# Resume note (written 2026-11-25 9:35 PM ET, paused at the daily usage cap)

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
1. Sprites still bad. rembg failed on these, so they need found images or hand composites:
   - rf2HSTXTehE and _RFXN1Ye3sY queen_face
   - mwv48BWl2DY scp966
   - U67wZoy-1fE despair
   - JUlTxosCXuk scp2774
   - M0rsyuvaTrk and WEYUcaJTBso troll
   - Redo PGBHL6Nc4X0 deer, _Kx4ChHuCgI oldman and gHAmif0TenY waldo (only edge-faded).
   - Then BLURRY_SPRITES.md (research/, 342 auto-marked, 255 used by mode files), then the rest of the sweep's flagged list (the sprite-sweep section of research/polish_report.md).
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
