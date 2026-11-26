# fin2-lobby: lobby + game chrome de-vibecode, featured hero, infinite scroll (2026-11-26, owner 10:58 AM ET)

Work happens on **main** (live site) in js/lobby/*, js/ui/*, css/*, index.html. WIP branch: `wip/lobby`.
Shots in this folder: `before/` (main 8a23f0d/67a731d, before any change) and `after/` (wip/lobby f935779+), each at
390x844 and 360x800 (device scale 2, saved at half size): lobby, lobby_scrolled, tab_horror, search, game_scp4975,
game_stockfish, options. `before_sheet.jpg` / `after2_sheet.jpg` = side-by-side contact sheets.

## Design brief
Target: chess.com Android app. A real product, not an AI template.
- Remove tells: gradient/tinted banners (old green "NEW" strip), blurred glass pills (old "Recommended" badge),
  drop shadows on cards, play-circle overlays on thumbnails, pill chips (17px radius), oversize 800-weight titles,
  generic copy ("Jump into any of the 562 modes"), hand-drawn inconsistent icon strokes (1.8/1.9/2.6).
- Type scale: 12 (meta/eyebrow) / 13 (row meta) / 15 (row title, body) / 17 (app name, section head) / 22 (hero title,
  26 desktop). Weights 400 / 700 only (buttons keep chess.com 800).
- Spacing: 4/8 grid; page gutter 16px (12px under 380px); sections 16px top / 8px bottom.
- Radius: 4 (thumbs, avatars, logo), 6 (buttons, chips, quick rows, desktop hero). Nothing rounder except switches.
- Palette unchanged (chess.com #312e2b / #262421 / #81b64c); green only for the primary button and the small eyebrow.
- Icons: Lucide (ISC), stroke 2, via js/ui/icons.js `CM.icon(name)`; inline copies in index.html.
- Hierarchy on the lobby: app bar (logo, "Chess Master", "iwantcheckmate fan remake") > tabs > search/sort > type
  chips > FEATURED hero (full-bleed 16:9 art, eyebrow, title, 3-line teaser, full-width "Play now") > Recommended
  today (one compact row) > Play Stockfish / Random mode > "All modes" feed. Footer credit unchanged.

## Featured mode (config, not data)
`js/lobby/hype.js` -> `FEATURED = { id, eyebrow, title, teaser, meta, art, artSmall }`. Currently `icm-scp4975`
("SCP-4975 cracks your pieces"), art `assets/lobby/featured-scp4975.jpg` (1280x720, iwantcheckmate.com's own
challenge thumbnail; lobby-owned copy, the mode's own folder is not touched). The daily new-video task only edits
data/videos.json (`coming_soon`), so it can't override the hero. `FEATURED = null` -> old behaviour (newest
coming_soon video gets the "mode in development" banner). While FEATURED is set, lobby.js drops its "new video"
strip and keeps the featured id out of Recommended.

## Infinite scroll
lobby.js `L.render` builds one feed per view (All / tab / type chip / search), renders PAGE=24 rows (48 at >=900px),
then an IntersectionObserver on `#feed-more` (rootMargin 1200px below) appends the next page with one
insertAdjacentHTML; `topUp()` keeps filling while the sentinel stays in the band. Any tab/chip/sort/search change
re-renders from page 1. Rows keep loading="lazy" thumbs + content-visibility. Event `cm:lobby-rows` fires after each
page (hype.js marks coming-soon rows on it). The old "See all N" category previews are gone (the tabs do that).
