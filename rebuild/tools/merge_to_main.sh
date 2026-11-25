#!/usr/bin/env bash
# merge_to_main.sh: build the `main` tree of Chess Master from the `rebuild` branch and commit it locally. It never pushes.
#
# What main gets (a plain multi-file static website, hostable on GitHub Pages at / or /ChessMaster/):
#   index.html  css/  js/  data/  assets/  LICENSES.md  .nojekyll      <- rebuild/app runtime files, copied as they are
#   README.md                                                          <- rebuild/tools/README_main.md (counts filled in)
#   docs/ARCHITECTURE.md                                               <- rebuild/app/ARCHITECTURE.md (contributor docs)
#   tools/build-data.mjs  tools/qa_ui.py                               <- the only dev tools that work without research/
# What stays on the rebuild branch only: rebuild/ (research, frames, specs, PLAN/HANDOFF/NEXT_AI, the ~70 art/frame
# scripts in rebuild/app/tools that read ../research, the full QA harness qa_all.py) and rebuild/app/STATUS.md.
# main's history gets one ordinary commit on top of origin/main (no merge commit), so none of the rebuild research
# history becomes part of main's history. The commit message names the rebuild commit it was built from.
#
# Usage (from the root of a clean clone; `git status` must be empty):
#   bash rebuild/tools/merge_to_main.sh [--source <ref>] [--no-fetch] [--smoke]
#     --source <ref>  rebuild commit to ship (default: origin/rebuild)
#     --no-fetch      don't `git fetch origin` first (offline / scratch dry runs)
#     --smoke         after committing, run rebuild/tools/smoke_site.py (from the source ref) on the new tree; needs
#                     python3 + playwright: pip install playwright && python -m playwright install --with-deps chromium
# Then review (`git show --stat HEAD`, serve it: `python3 -m http.server`) and push yourself: git push origin main
# To throw the result away before pushing: git reset --hard origin/main && git checkout rebuild
set -euo pipefail

SOURCE=origin/rebuild; FETCH=1; SMOKE=0
while [ $# -gt 0 ]; do
  case "$1" in
    --source) SOURCE="$2"; shift 2 ;;
    --no-fetch) FETCH=0; shift ;;
    --smoke) SMOKE=1; shift ;;
    -h|--help) sed -n '2,26p' "$0"; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

die() { echo "merge_to_main: $*" >&2; exit 1; }
say() { echo "== $*"; }

ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || die "run this inside a clone of the ChessMaster repo"
cd "$ROOT"
[ -z "$(git status --porcelain)" ] || die "working tree is not clean; commit or stash first"
git rev-parse -q --verify "refs/remotes/origin/main" >/dev/null || [ $FETCH = 1 ] || die "origin/main not found"

if [ $FETCH = 1 ]; then say "git fetch origin"; git fetch -q origin; fi
SRC_SHA=$(git rev-parse --verify "$SOURCE^{commit}") || die "source ref $SOURCE not found"
SRC_SHORT=$(git rev-parse --short "$SRC_SHA")
git cat-file -e "$SRC_SHA:rebuild/app/index.html" 2>/dev/null || die "$SOURCE has no rebuild/app/index.html"
git cat-file -e "$SRC_SHA:rebuild/tools/README_main.md" 2>/dev/null || die "$SOURCE has no rebuild/tools/README_main.md"

TMP=$(mktemp -d "${TMPDIR:-/tmp}/cm_merge.XXXXXX")
trap 'rm -rf "$TMP"' EXIT
say "exporting rebuild/app from $SOURCE ($SRC_SHORT)"
git archive "$SRC_SHA" rebuild/app rebuild/tools | tar -x -C "$TMP"
APP="$TMP/rebuild/app"; RT="$TMP/rebuild/tools"
for f in index.html css js data assets LICENSES.md .nojekyll ARCHITECTURE.md tools/build-data.mjs tools/qa_ui.py; do
  [ -e "$APP/$f" ] || die "rebuild/app/$f missing in $SOURCE"
done

# --- pre-flight on the source tree ---------------------------------------------------------------------------------
if command -v node >/dev/null 2>&1; then
  say "pre-flight: node tools/build-data.mjs --check (generated data must be up to date)"
  mkdir -p "$TMP/gen" && cp -a "$APP/data" "$TMP/gen/data"
  (cd "$APP" && node tools/build-data.mjs --check) || die "build-data --check failed in $SOURCE"
  diff -rq "$TMP/gen/data" "$APP/data" >/dev/null \
    || die "data/*.js in $SOURCE are stale: run 'node tools/build-data.mjs' in rebuild/app on rebuild, commit, retry"
else
  echo "   (node not found: skipping build-data --check)"
fi
if command -v python3 >/dev/null 2>&1 && [ -f "$RT/check_site_paths.py" ]; then
  say "pre-flight: check_site_paths.py (relative, inside the site, case-exact)"
  python3 "$RT/check_site_paths.py" "$APP" || die "path check failed in $SOURCE"
fi
BIG=$(find "$APP" -type f -size +95M | sed "s#^$APP/##")
[ -z "$BIG" ] || die "files over GitHub's 100 MB limit: $BIG"

# --- switch to main and replace its tree ---------------------------------------------------------------------------
say "checking out main (fast-forward to origin/main)"
git checkout -q main 2>/dev/null || git checkout -q -b main --track origin/main
git merge -q --ff-only origin/main || die "local main has diverged from origin/main; sort that out first"
[ -z "$(git status --porcelain)" ] || die "main working tree is not clean"
OLD_MAIN=$(git rev-parse --short HEAD)

say "replacing main's tree"
git rm -rq --ignore-unmatch -- . >/dev/null
for f in index.html css js data assets LICENSES.md .nojekyll; do cp -a "$APP/$f" "$ROOT/$f"; done
mkdir -p "$ROOT/docs" "$ROOT/tools"
cp -a "$APP/ARCHITECTURE.md" "$ROOT/docs/ARCHITECTURE.md"
cp -a "$APP/tools/build-data.mjs" "$APP/tools/qa_ui.py" "$ROOT/tools/"
find "$ROOT/css" "$ROOT/js" "$ROOT/data" "$ROOT/assets" "$ROOT/tools" \
  \( -name __pycache__ -o -name '*.pyc' -o -name .DS_Store \) -prune -exec rm -rf {} + 2>/dev/null || true

VIDEO_COUNT=$(grep -o '"id":' "$ROOT/data/videos.json" | wc -l | tr -d ' ')
MODE_COUNT=$(find "$ROOT/data/modes" -maxdepth 1 -name '*.js' ! -name index.js | wc -l | tr -d ' ')
sed -e "s/{{VIDEO_COUNT}}/$VIDEO_COUNT/g" -e "s/{{MODE_COUNT}}/$MODE_COUNT/g" "$RT/README_main.md" > "$ROOT/README.md"
grep -q '{{' "$ROOT/README.md" && die "README placeholders left unfilled"
grep -qi 'PROGRESS' "$ROOT/README.md" && die "README must not carry a PROGRESS section"

if command -v python3 >/dev/null 2>&1 && [ -f "$RT/check_site_paths.py" ]; then
  say "post-check: check_site_paths.py on the new main tree"
  python3 "$RT/check_site_paths.py" "$ROOT" || die "path check failed on the main tree (nothing committed; git reset --hard to undo)"
fi

# --- commit (local only) ------------------------------------------------------------------------------------------
git add -A
NAME=$(git config user.name || true); EMAIL=$(git config user.email || true)
IDENT=()
[ -n "$NAME" ] || IDENT+=(-c user.name=csardas223)
[ -n "$EMAIL" ] || IDENT+=(-c user.email=232940379+csardas223@users.noreply.github.com)
git ${IDENT[@]+"${IDENT[@]}"} commit -q -F - <<EOF
Chess Master: ship the rebuild as a multi-file static website

Built from rebuild@$SRC_SHORT ($SRC_SHA) by rebuild/tools/merge_to_main.sh.
Replaces the old single-file index.html with the rebuild/app site: index.html + css/ js/ data/ assets/,
$MODE_COUNT remastered modes across $VIDEO_COUNT videos. Hostable on GitHub Pages (.nojekyll, relative paths)
or any static server.

docs/ARCHITECTURE.md and tools/build-data.mjs + tools/qa_ui.py come along for contributors. The research,
per-mode specs, art scripts and QA history stay on the rebuild branch under rebuild/.
EOF
NEW=$(git rev-parse --short HEAD)
say "committed $NEW on main (was $OLD_MAIN); NOT pushed"
git show --stat --format='%h %s' HEAD | tail -1
du -sh --exclude=.git "$ROOT" 2>/dev/null | sed 's/^/   tree size: /' || true

if [ $SMOKE = 1 ]; then
  say "smoke test (root + /ChessMaster/ subpath, 3 modes)"
  python3 "$RT/smoke_site.py" "$ROOT" || die "smoke test failed (commit $NEW is local; git reset --hard $OLD_MAIN to undo)"
fi

cat <<EOF

Done. main is now $NEW (local only).
  review:  git show --stat HEAD | less ; python3 -m http.server 8000  (open http://localhost:8000/)
  ship:    git push origin main      then enable Pages: Settings -> Pages -> Deploy from a branch -> main, / (root)
  undo:    git reset --hard $OLD_MAIN && git checkout rebuild
EOF
