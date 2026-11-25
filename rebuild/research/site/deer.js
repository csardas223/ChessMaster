// Deer is stored on the board so every sliding ray and castling path respects it.
const DEER = 'xD';
let deerSquare, turnsUntilShuffle;
const nextInterval = () => 3 + Math.floor(Math.random() * 3);
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

function neighbors(square) {
  const result = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let df = -1; df <= 1; df++) {
      const f = square.f + df, r = square.r + dr;
      if ((df || dr) && inb(f, r)) result.push({f, r});
    }
  }
  return result;
}

function kingSafe(side, boardState) {
  const king = findKing(side, boardState);
  return king && !attacked(king.f, king.r, opp(side), boardState);
}

function shuffled(items) {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function planShuffle(ring) {
  const occupied = ring.filter(({f, r}) => B[r][f]);
  const men = shuffled(occupied).map(from => ({from, piece:B[from.r][from.f]}));
  const trial = cloneBoard(B);
  for (const {from} of men) trial[from.r][from.f] = null;
  const moves = [];
  const whiteWasSafe = kingSafe('w', B);

  // Search at most eight squares. Keep all writes inside the highlighted ring.
  function assign(index, available, required) {
    if (moves.length + men.length - index < required) return null;
    if (index === men.length) {
      if (!kingSafe('b', trial) || (whiteWasSafe && !kingSafe('w', trial))) return null;
      return {moves:moves.slice(), result:cloneBoard(trial)};
    }
    const {piece, from} = men[index];
    for (const to of available) {
      if (piece[1] === 'P' && (to.r === 0 || to.r === 7)) continue;
      const moving = !same(from, to);
      if (moving) moves.push({piece, from, to});
      trial[to.r][to.f] = piece;
      const plan = assign(index + 1, available.filter(s => s !== to), required);
      trial[to.r][to.f] = null;
      if (moving) moves.pop();
      if (plan) return plan;
    }
    return null;
  }

  for (let required = men.length; required > 0; required--) {
    const plan = assign(0, shuffled(ring), required);
    if (plan) return plan;
  }
  return {moves:[], result:cloneBoard(B)};
}

function updateShuffleRights(moves, result) {
  for (const {piece, from} of moves) {
    const side = piece[0], home = side === 'w' ? 7 : 0;
    if (piece[1] === 'K') castle[side+'K'] = castle[side+'Q'] = 0;
    if (piece[1] === 'R' && from.r === home) {
      if (from.f === 0) castle[side+'Q'] = 0;
      if (from.f === 7) castle[side+'K'] = 0;
    }
  }
  // The shuffle follows Black's move, so only a just-advanced black pawn qualifies.
  if (ep && (result[ep.r][ep.f] || moves.some(({from}) => from.f === ep.f && from.r === ep.r + 1))) ep = null;
}

async function shufflePosition() {
  const ring = neighbors(deerSquare);
  const {moves, result} = planShuffle(ring);
  const glow = document.getElementById('deerGlow');
  for (const square of ring) {
    const tile = document.createElement('div');
    tile.className = 'glowTile';
    tile.style.left = square.f * 12.5 + '%';
    tile.style.top = square.r * 12.5 + '%';
    glow.appendChild(tile);
  }
  const fade = (from, to) => glow.animate([{opacity:from}, {opacity:to}],
    {duration:1000, easing:'linear', fill:'forwards'});
  const light = fade(0, 0.85);
  await light.finished;
  await pause(1000);
  const slides = moves.map(({from, to}) => {
    const sprite = piecesEl.querySelector('[data-square="' + from.f + ',' + from.r + '"]');
    const dx = (to.f - from.f) * 100, dy = (to.r - from.r) * 100;
    return sprite.animate([{transform:'translate(0,0)'}, {transform:'translate(' + dx + '%,' + dy + '%)'}],
      {duration:850, easing:'cubic-bezier(.42,0,.22,1)', fill:'forwards'});
  });
  await Promise.all(slides.map(slide => slide.finished));
  B = result;
  updateShuffleRights(moves, result);
  lastMove = null;
  render();
  await pause(1000);
  const dark = fade(0.85, 0);
  await dark.finished;
  glow.replaceChildren();
  light.cancel();
  dark.cancel();
}

async function deerTurn() {
  clearAnnotations();
  if (--turnsUntilShuffle === 0) {
    await shufflePosition();
    turnsUntilShuffle = nextInterval();
    return;
  }
  const options = neighbors(deerSquare).filter(s => {
    if (B[s.r][s.f]) return false;
    const trial = cloneBoard(B);
    trial[deerSquare.r][deerSquare.f] = null;
    trial[s.r][s.f] = DEER;
    return kingSafe('b', trial);
  });
  if (!options.length) return;
  const from = deerSquare, to = shuffled(options)[0];
  const mover = makeMover(DEER, from);
  B[from.r][from.f] = null;
  B[to.r][to.f] = DEER;
  deerSquare = to;
  if (same(ep, to)) ep = null;
  render([to]);
  await animateElement(mover, from, to);
  mover.remove();
  render();
}
