// Holes are terrain. The marked square stays ordinary terrain until it breaks.
const holes = new Set();
let locust = null;
const squareId = (f, r) => r * 8 + f;
const isHole = (f, r) => holes.has(squareId(f, r));
function squareLayer(className, {f, r}) {
  const layer = document.createElement('div');
  layer.className = className;
  layer.style.left = f * 12.5 + '%';
  layer.style.top = r * 12.5 + '%';
  board.appendChild(layer);
  return layer;
}

async function afterBlackMove() {
  if (locust) {
    await collapse();
    return;
  }
  if (Math.random() >= .66) return;
  const eligible = [];
  for (let r = 0; r < 8; r++) for (let f = 0; f < 8; f++) {
    if (!isHole(f, r) && B[r][f] !== 'bK') eligible.push({f, r});
  }
  const square = eligible[Math.floor(Math.random() * eligible.length)];
  if (!square) return;
  const layer = squareLayer('locust', square);
  const image = new Image();
  image.src = './locust.png';
  image.alt = 'The Locust';
  layer.style.opacity = 0;
  layer.appendChild(image);
  locust = {square, layer, image};
  await image.decode().catch(() => {});
  layer.style.opacity = 1;
  await layer.animate([{opacity: 0}, {opacity: 1}], 1000).finished;
}

// Shared fracture edges make adjacent shards fit, even where a crack branches.
function fracture() {
  const points = {
    a:[0,0], b:[34,0], c:[76,0], d:[100,0], e:[100,52], f:[100,100],
    g:[67,100], h:[22,100], i:[0,100], j:[0,47],
    u:[26,31], v:[60,25], w:[44,67], x:[78,63]
  };
  const faces = ['abuj', 'bcvu', 'cdexv', 'uvxw', 'juwhi', 'hwxg', 'gxef'];
  for (const key of 'uvwx') points[key] = points[key].map(n => n + Math.random()*8 - 4);
  const edges = new Map();
  const rotation = Math.floor(Math.random()*4);
  function edge(a,b) {
    const key = [a,b].sort().join('');
    if (!edges.has(key)) {
      const [start,end] = [...key].map(id => points[id]);
      const dx = end[0]-start[0], dy = end[1]-start[1];
      const outside = (dx===0 && [0,100].includes(start[0])) || (dy===0 && [0,100].includes(start[1]));
      const path = [start];
      if (!outside) for (const t of [.21,.46,.68,.84]) {
        const offset = (Math.random()-.5)*.17;
        path.push([start[0]+dx*t-dy*offset, start[1]+dy*t+dx*offset]);
      }
      edges.set(key, [...path,end]);
    }
    const path = edges.get(key);
    return (a===key[0] ? path : [...path].reverse()).slice(0,-1);
  }
  return faces.map(face => {
    const polygon = [...face].flatMap((id,i) => edge(id,face[(i+1)%face.length]));
    return polygon.map(([x,y]) => {
      for (let k=0;k<rotation;k++) [x,y]=[100-y,x];
      return [x,y];
    });
  });
}

function drop(node, dx, spin, tilt, duration, delay) {
  return node.animate([
    {transform:'translate(0%,0%) rotate(0deg) rotateX(0deg)',filter:'brightness(1)'},
    {transform:`translate(${dx}%,185%) rotate(${spin}deg) rotateX(${tilt}deg)`,filter:'brightness(.45)'}
  ], {duration, delay, easing:'cubic-bezier(.48,0,.87,.58)', fill:'both'}).finished;
}

async function collapse() {
  const {square, layer, image} = locust;
  const {f,r} = square;
  const piece = B[r][f];
  const rubble = squareLayer('fallWindow', square);
  holes.add(squareId(f,r));
  B[r][f] = null;
  if (piece) halfmove = 0;
  if (piece?.[1] === 'R' && r === (piece[0]==='w'?7:0) && (f===0 || f===7))
    castle[piece[0]+(f===0?'Q':'K')] = 0;
  if (ep && (same(ep,square) || (piece==='bP' && f===ep.f && r===ep.r+1))) ep=null;
  render();
  const tremor = image.animate([
    {transform:'translate(0,0)'}, {transform:'translateX(1%)'},
    {transform:'translateX(-1.4%)'}, {transform:'translateX(.6%)'},
    {transform:'translate(0,0)'}
  ], {duration:95, iterations:Infinity});
  const falling = [];
  for (const polygon of fracture()) {
    const shard = document.createElement('div');
    shard.className = 'shard';
    shard.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue((f+r)%2 ? '--dark' : '--light').trim();
    shard.style.clipPath = 'polygon('+polygon.map(([x,y])=>x+'% '+y+'%').join(',')+')';
    const center = polygon.reduce(([x,y],[a,b])=>[x+a/polygon.length,y+b/polygon.length],[0,0]);
    shard.style.transformOrigin = center.map(n => n+'%').join(' ');
    rubble.appendChild(shard);
    falling.push(drop(shard,(center[0]-50)*.35,(Math.random()-.5)*70,Math.random()*75-25,
      680+Math.random()*270,Math.random()*95));
  }
  let occupant;
  if (piece) {
    occupant = squareLayer('fallWindow occupant', square);
    const lost = new Image();
    lost.src = A + imgs[piece];
    lost.className = 'lostPiece';
    occupant.appendChild(lost);
    falling.push(drop(lost,5,14,-32,880,70));
  }
  await Promise.all(falling);
  rubble.remove();
  occupant?.remove();
  tremor.cancel();
  await layer.animate([{opacity:1},{opacity:0}], {duration:1000,fill:'forwards'}).finished;
  layer.remove();
  locust = null;
}
