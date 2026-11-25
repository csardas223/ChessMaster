#!/bin/bash
# usage: sheet.sh out.jpg id1 id2 ...
out=$1; shift; args=()
for i in "$@"; do args+=("thumbs/$i.jpg"); done
cd /workspace/work/chessmaster/research
montage "${args[@]}" -resize 640x360 -set label '%t' -pointsize 22 -tile 2x -geometry +4+4 "$out"
