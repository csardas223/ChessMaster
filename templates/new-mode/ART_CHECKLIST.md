# Art checklist (every new or changed sprite, three passes)

Owner rules: nothing may look vibecoded; triple-check art for defects and for accuracy to the video before pushing.
Only owner-made, CC0 or open-licensed art, never Chess.com or Duolingo art, piece sets or badges.

## Source
- [ ] Creator's own art checked first (iwantcheckmate.com `/challenges/<name>/<name>.png`), then a clean trace of a video
      frame, then an original drawing in the video's style. Source + frame time in the mode folder's `source.notes`.
- [ ] `LICENSES.md` row (author, licence, URL or "traced from video frame m:ss").
- [ ] A new `thumb.jpg` is the video's own YouTube thumbnail (i.ytimg.com maxresdefault), nothing else.
- [ ] Replacing a README, social or promo image: old file archived under `docs/promo-archive/<date>_<commit>/` with a row
      in that folder's README first.

## File
- [ ] Transparent PNG, at least 512 px (2x a square), subject centred at about 90% of the canvas.
- [ ] No faded or feathered edges, no halo or leftover box, no stray pixels in the empty area (check alpha on black and
      on white backgrounds).
- [ ] No upscale blur: zoom to 400%; edges stay crisp. Downscaled from a bigger source only.

## Pass 1: alone, full size
- [ ] Silhouette matches the video frame side by side (proportions, facing direction, outline weight).
- [ ] Colours sampled from the frame (hex in `source.notes`), both sides' versions consistent.
- [ ] Nothing clipped at the canvas edge.

## Pass 2: on the board, desktop 1366x800
- [ ] Screenshot the mode with the piece on light and dark squares, selected, last-move tinted, under any fog/darkness.
- [ ] Same visual weight as the standard pieces next to it; nothing pokes out of its square unless the video does it.

## Pass 3: on the phone, 390x844 and 360x780 touch (Galaxy Z Flip6), plus the 360x374 cover screen
- [ ] Still readable at phone size; outline does not vanish; no shimmer when it slides.
- [ ] Open every screenshot yourself at full size and at phone size. Note what you looked at in the commit message.
