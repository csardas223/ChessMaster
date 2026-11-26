#!/bin/bash
# Rebuilds js/vendor/fairy-stockfish/fairy-stockfish.{js,wasm}: Fairy-Stockfish (GPLv3) as a single-threaded
# WebAssembly worker that needs no SharedArrayBuffer / cross-origin isolation (GitHub Pages has no COOP/COEP headers).
# Source: https://github.com/fairy-stockfish/fairy-stockfish.wasm commit 718ebc6801702408f6650598cc52bcf87946696c
# (the emscripten fork of https://github.com/fairy-stockfish/Fairy-Stockfish), plus single-thread.patch:
#   - SINGLE_THREAD: no std::thread; Thread::start_searching() runs the search synchronously in the caller
#   - VariantMap::parse_istream explicit instantiations, <iterator> include (newer clang)
# Built with emscripten 7.0.1, largeboards, classical eval only (NNUE_EMBEDDING_OFF; the bot sets "Use NNUE" false).
# Usage: source <emsdk>/emsdk_env.sh && tools/fairy-stockfish/build.sh
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd); OUT=$HERE/../../js/vendor/fairy-stockfish
W=${WORK:-/tmp/fsf-build}; rm -rf "$W"; git clone -q https://github.com/fairy-stockfish/fairy-stockfish.wasm "$W"
cd "$W" && git checkout -q 718ebc6801702408f6650598cc52bcf87946696c && git apply "$HERE/single-thread.patch" && cd src
SRCS="benchmark.cpp bitbase.cpp bitboard.cpp endgame.cpp evaluate.cpp main.cpp material.cpp misc.cpp movegen.cpp movepick.cpp
 pawns.cpp position.cpp psqt.cpp search.cpp thread.cpp timeman.cpp tt.cpp uci.cpp ucioption.cpp tune.cpp syzygy/tbprobe.cpp
 nnue/evaluate_nnue.cpp nnue/features/half_ka_v2.cpp partner.cpp parser.cpp piece.cpp variant.cpp xboard.cpp
 nnue/features/half_ka_v2_variants.cpp"
mkdir -p obj
for f in $SRCS; do
  em++ -O3 -DNDEBUG -std=c++17 -fno-exceptions -Wno-everything -DIS_64BIT -DUSE_POPCNT -DLARGEBOARDS -DPRECOMPUTED_MAGICS \
    -DNNUE_EMBEDDING_OFF -DSINGLE_THREAD -DEM_COMMIT=718ebc6 -DEM_UPSTREAM=cm-single -DEM_EMSCRIPTEN=7.0.1 -I. -c "$f" -o "obj/${f//\//_}.o"
done
em++ -O3 obj/*.o -o fairy-stockfish.js --pre-js "$HERE/pre_single.js" --extern-post-js "$HERE/post_worker.js" \
  -sMODULARIZE=1 -sEXPORT_NAME=Stockfish -sENVIRONMENT=web,worker -sASYNCIFY=1 '-sASYNCIFY_IMPORTS=["emscripten_utils_getline_impl"]' \
  -sALLOW_MEMORY_GROWTH=1 -sINITIAL_MEMORY=67108864 -sMAXIMUM_MEMORY=1073741824 -sSTACK_SIZE=4194304 \
  -sALLOW_UNIMPLEMENTED_SYSCALLS -sEXIT_RUNTIME=0 -sFILESYSTEM=1
cp fairy-stockfish.js fairy-stockfish.wasm "$OUT/"
