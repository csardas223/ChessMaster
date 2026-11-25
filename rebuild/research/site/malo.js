// Board coordinates use file and row, with a8 at (0, 0).
const MALO = 'm*';
let malo, target, route;

function resetMalo() {
  malo = {f: 2, r: 4};
  B[malo.r][malo.f] = MALO;
  target = null;
  acquireTarget();
}

function acquireTarget() {
  if (target) return;
  const candidates = [];
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = B[r][f];
      if (!piece || piece === MALO) continue;
      candidates.push({f, r});
    }
  }
  target = candidates[Math.floor(Math.random() * candidates.length)] || null;
  route = [];
}

function trackPlayerMove(move, rook) {
  if (target) {
    const captured = move.ep ? {f: move.b.f, r: move.a.r} : move.b;
    if (same(target, captured)) target = null;
    else if (same(target, move.a)) target = {...move.b};
    else if (rook && same(target, rook.a)) target = {...rook.b};
    else return;
    route = target && distance(malo, target) <= 3 ? travelPath(malo, target, null) : [];
  }
  acquireTarget();
}

function distance(a, b) {
  return Math.max(Math.abs(a.f - b.f), Math.abs(a.r - b.r));
}

function approachRoute() {
  let best, lowest = Infinity;
  for (let df = -1; df <= 1; df++) {
    for (let dr = -1; dr <= 1; dr++) {
      if (!df && !dr) continue;
      const line = [3, 2, 1, 0].map(n => ({f: target.f + n * df, r: target.r + n * dr}));
      if (!inb(line[0].f, line[0].r)) continue;
      const cost = Math.hypot(line[0].f - malo.f, line[0].r - malo.r);
      if (cost < lowest) { lowest = cost; best = line; }
    }
  }
  return best;
}

// Take a shortest path to the staging square, staying close to the straight line.
// Protect the target from an early capture when staging near a board edge.
function travelPath(start, end, protectedSquare) {
  const queue = [{at: start, path: []}];
  const seen = new Set([start.r * 8 + start.f]);
  for (let i = 0; i < queue.length; i++) {
    const {at, path} = queue[i];
    if (same(at, end)) return path;
    const next = [];
    for (let df = -1; df <= 1; df++) {
      for (let dr = -1; dr <= 1; dr++) {
        const s = {f: at.f + df, r: at.r + dr};
        if (!inb(s.f,s.r) || same(s,protectedSquare) || seen.has(s.r * 8 + s.f)) continue;
        next.push(s);
      }
    }
    const error = s => Math.abs((end.f-start.f)*(s.r-start.r) - (end.r-start.r)*(s.f-start.f));
    next.sort((a,b) => distance(a,end)-distance(b,end) || error(a)-error(b));
    for (const s of next) {
      seen.add(s.r * 8 + s.f);
      queue.push({at:s, path:[...path,s]});
    }
  }
  throw new Error('No Malo staging path');
}

async function maloTurn() {
  acquireTarget();
  if (!target) return;
  if (!route.length) route = approachRoute();
  const end = route.shift();
  const path = travelPath(malo, end, route.length ? target : null);
  // Malo can already occupy the three-square staging point.
  if (path.length) clearAnnotations();
  for (const s of path) {
    const victim = B[s.r][s.f];
    const mover = makeMover(MALO, malo);
    render([malo]);
    await animateElement(mover, malo, s, ANIM_MS / Math.sqrt(path.length));
    B[malo.r][malo.f] = null;
    B[s.r][s.f] = MALO;
    if (victim) {
      halfmove = 0;
      if (victim[1] === 'R' && s.r === (victim[0] === 'w' ? 7 : 0)) {
        if (s.f === 0) castle[victim[0]+'Q'] = 0;
        if (s.f === 7) castle[victim[0]+'K'] = 0;
      }
    }
    malo = s;
    if (ep && (same(malo,ep) || B[ep.r+1]?.[ep.f] !== 'bP')) ep = null;
    mover.remove();
    render();
    if (victim || same(s,end)) playSound(!!victim);
    if (victim?.[1] === 'K') {
      finish({type:'mate', loser:victim[0], square:s});
      return;
    }
  }
  if (!route.length) {
    target = null;
    acquireTarget();
  }
}
