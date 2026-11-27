# Under construction template

The lobby's "Coming soon" banner and screen (js/lobby/hype.js, css/hype.css) are the under-construction UI. They are
themed by the video itself: its own YouTube thumbnail, title, length and upload date, plus an optional accent colour.
Nothing here is a stub: the screen says plainly that the mode is not playable yet and lists what is built.

## 1. Add the video as coming soon (same day it is uploaded)

Add the entry to the top of `data/videos.json` (newest first), using `entry.json` in this folder:

- `views`: from the video page that day; `dur`: seconds; `date`: the upload date (YYYY-MM-DD, the RSS `<published>` date).
- `teaser`: one or two plain sentences of the rules, from the transcript. No hype words.
- `accent` (optional): a `#rrggbb` picked from the thumbnail's dominant colour (it tints the construction stripe).
  Leave it out when the thumbnail has no strong colour; amber is the default.
- `build`: what is done. Flip each to `true` only when it is really done:
  `rules` (rules match the transcript), `board` (size, setup, colours), `art` (passed new-mode/ART_CHECKLIST.md),
  `characters` (opponent name/rating/avatar, monsters), `sound`, `qa` (phone QA script passes at 390x844 and 360x780).
- `creator`: the channel name (`iwantcheckmate` today); keeps the data creator-agnostic.

Then `node tools/build-data.mjs` and commit `data/videos.json` + `data/videos.js`.

A coming-soon video uploaded after `FEATURED.date` in js/lobby/hype.js takes the lobby's hero slot by itself, so a new
upload is always featured first. The row in the list says "Coming soon", `#/play/<id>` opens the coming-soon screen,
and Random never lands on it.

## 2. While building

Update `build` in each commit that finishes a part. The banner shows "n of 6 built" and the screen lists each part.

## 3. When it is fully playable

1. Remove `coming_soon`, `build` and `accent` from the entry (keep `teaser`).
2. Point `FEATURED` in js/lobby/hype.js at the new id: `title` = the video title, `teaser`, `meta`, `family`,
   `opponent`, `rating`, `date` = upload date, and the art: `assets/lobby/featured-<id>.jpg` (1280x720) and `-640.jpg`
   from the video's own YouTube thumbnail (maxresdefault), plus up to two gameplay stills as `frames` (maxres1/2).
   Archive the old featured art first if you replace a file (docs/promo-archive rule).
3. `node tools/build-data.mjs`, run the checks, commit.

## Check

`python3 tools/qa_under_construction.py --out /tmp/qa_uc` injects a fake coming-soon entry (nothing on disk changes) and
checks the hero slot, the "n of 6 built" count, the build list, the accent and overflow at 390x844, 360x780 and the
Flip6 cover screen 360x374. Look at the screenshots it writes.
