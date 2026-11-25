/* Legacy 8x8 engine + original mode table, ported verbatim from the single-file Chess Master (index.html, commit a30f6bc).
   Classic script: its top-level declarations are shared globals that js/legacy/glue.js and js/legacy/modes_extra.js use and wrap.
   Do not add new modes here; new modes are spec JSON + hooks (see ARCHITECTURE.md). */
/* ---------- engine ---------- */
const KN=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];
const KG=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
const OR=KG.slice(0,4),DI=KG.slice(4);
const VAL={P:100,N:300,B:320,R:500,Q:900,D:1200,K:0};
const col=p=>p?(p===p.toUpperCase()?'w':'b'):null, up=p=>p.toUpperCase(), opp=c=>c==='w'?'b':'w';
const on=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
const sqName=i=>'abcdefgh'[i&7]+(8-(i>>3));
const kingSq=(b,c)=>b.indexOf(c==='w'?'K':'k');
var MODE={},ARG=null,CNT=4,G=null,busy=false;

function parse(fen){const b=[];for(const ch of fen.split(' ')[0].replace(/\//g,''))/\d/.test(ch)?b.push(...Array(+ch).fill(null)):b.push(ch);
  return {b,turn:'w',cr:'KQkq',ep:-1,chk:{w:0,b:0},hand:{w:[],b:[]},mon:-1}}
function clone(s){return {b:s.b.slice(),turn:s.turn,cr:s.cr,ep:s.ep,chk:{w:s.chk.w,b:s.chk.b},hand:{w:s.hand.w.slice(),b:s.hand.b.slice()},mon:s.mon}}

function attacked(b,sq,by){const r=sq>>3,c=sq&7;
  const is=(rr,cc,set)=>{if(!on(rr,cc))return false;const p=b[rr*8+cc];return p&&col(p)===by&&set.includes(up(p))};
  for(const[d,e]of KN)if(is(r+d,c+e,'ND'))return true;
  for(const[d,e]of KG)if(is(r+d,c+e,'K'))return true;
  const pr=by==='w'?r+1:r-1;if(is(pr,c-1,'P')||is(pr,c+1,'P'))return true;
  for(const[d,e]of KG){const set=d&&e?'BQD':'RQD';let rr=r+d,cc=c+e;
    while(on(rr,cc)){const p=b[rr*8+cc];if(p){if(col(p)===by&&set.includes(up(p)))return true;break}rr+=d;cc+=e}}
  return false}

function gen(s){const b=s.b,me=s.turn,W=me==='w',mv=[],them=opp(me);
  for(let i=0;i<64;i++){const p=b[i];if(!p||col(p)!==me)continue;const r=i>>3,c=i&7,t=up(p);
    const add=(j,x)=>mv.push(Object.assign({f:i,t:j},x));
    if(t==='P'){const d=W?-1:1,r1=r+d,last=W?0:7;
      if(on(r1,c)&&!b[r1*8+c]){add(r1*8+c,r1===last?{pr:1}:{});
        if(r===(W?6:1)&&!b[(r+2*d)*8+c])add((r+2*d)*8+c,{dbl:1})}
      for(const e of[-1,1]){if(!on(r1,c+e))continue;const j=r1*8+c+e,q=b[j];
        if(q&&col(q)!==me)add(j,r1===last?{pr:1}:{});else if(j===s.ep&&!q)add(j,{ep:1})}
      continue}
    const jumps=t==='N'||t==='D'?KN:t==='K'?KG:null;
    if(jumps)for(const[d,e]of jumps){if(!on(r+d,c+e))continue;const j=(r+d)*8+c+e;if(!b[j]||col(b[j])!==me)add(j)}
    const dirs=t==='B'?DI:t==='R'?OR:t==='Q'||t==='D'?KG:null;
    if(dirs)for(const[d,e]of dirs){let rr=r+d,cc=c+e;while(on(rr,cc)){const j=rr*8+cc;if(b[j]){if(col(b[j])!==me)add(j);break}add(j);rr+=d;cc+=e}}
    if(t==='K'&&!MODE.giveaway){const home=W?60:4,R=W?'R':'r',k=W?'K':'k',q=W?'Q':'q';
      if(i===home&&!attacked(b,i,them)){
        if(s.cr.includes(k)&&b[i+3]===R&&!b[i+1]&&!b[i+2]&&!attacked(b,i+1,them)&&!attacked(b,i+2,them))add(i+2,{cs:i+3,cd:i+1});
        if(s.cr.includes(q)&&b[i-4]===R&&!b[i-1]&&!b[i-2]&&!b[i-3]&&!attacked(b,i-1,them)&&!attacked(b,i-2,them))add(i-2,{cs:i-4,cd:i-1})}}}
  if(MODE.hand)for(const t of new Set(s.hand[me]))for(let j=0;j<64;j++){if(b[j])continue;if(t==='P'&&(j<8||j>55))continue;mv.push({f:-1,t:j,drop:t})}
  return mv}

const CR={K:[60,63],Q:[60,56],k:[4,7],q:[4,0]};
function fall(b){for(let c=0;c<8;c++)for(let r=6;r>=0;r--){const p=b[r*8+c];if(!p||'PK'.includes(up(p)))continue;let rr=r;while(rr<7&&!b[(rr+1)*8+c])rr++;if(rr!==r){b[rr*8+c]=p;b[r*8+c]=null}}}

function make(s,m){const n=clone(s),b=n.b,me=s.turn,W=me==='w';n.ep=-1;let cap=null;
  if(m.drop){b[m.t]=W?m.drop:m.drop.toLowerCase();const h=n.hand[me];h.splice(h.indexOf(m.drop),1)}
  else{let p=b[m.f];cap=b[m.t];
    if(m.ep){const cs=m.t+(W?8:-8);cap=b[cs];b[cs]=null}
    b[m.f]=null;if(m.pr)p=W?'Q':'q';b[m.t]=p;
    if(m.dbl)n.ep=(m.f+m.t)/2;
    if(m.cs!=null){b[m.cd]=b[m.cs];b[m.cs]=null}
    if(n.cr)n.cr=n.cr.split('').filter(k=>!CR[k].includes(m.f)&&!CR[k].includes(m.t)).join('');
    if(cap){if(MODE.hand&&up(cap)!=='K')n.hand[me].push(up(cap));
      if(MODE.atomic){b[m.t]=null;const r=m.t>>3,c=m.t&7;for(const[d,e]of KG)if(on(r+d,c+e)){const j=(r+d)*8+c+e;if(b[j]&&up(b[j])!=='P')b[j]=null}}}}
  if(MODE.gravity)fall(b);
  if(MODE.checks){const k=kingSq(b,opp(me));if(k>=0&&attacked(b,k,me))n.chk[me]++}
  n.turn=opp(me);return n}

function legal(s){const me=s.turn,them=opp(me),hadK=kingSq(s.b,me)>=0;
  let ms=gen(s).filter(m=>{
    if(MODE.atomic&&!m.drop&&up(s.b[m.f])==='K'&&s.b[m.t])return false;
    const n=m.n=make(s,m);if(MODE.giveaway)return true;
    const k=kingSq(n.b,me);if(k<0)return !hadK;
    if(MODE.atomic&&kingSq(n.b,them)<0)return true;
    if(attacked(n.b,k,them))return false;
    if(MODE.racing){const ek=kingSq(n.b,them);if(ek>=0&&attacked(n.b,ek,me))return false}
    return true});
  if(MODE.giveaway){const c=ms.filter(m=>s.b[m.t]||m.ep);if(c.length)ms=c}
  return ms}

function result(s,ms){const w=MODE.win&&MODE.win(s);if(w)return w;
  if(!ms.length){if(MODE.giveaway)return{w:s.turn,why:'no moves left wins Giveaway'};
    const k=kingSq(s.b,s.turn);
    if(k<0)return{w:opp(s.turn),why:'no pieces left to move'};
    if(attacked(s.b,k,opp(s.turn)))return{w:opp(s.turn),why:'checkmate'};
    return{w:'d',why:'stalemate'}}
  return null}

function evalS(s){let v=0;
  for(let i=0;i<64;i++){const p=s.b[i];if(!p)continue;const t=up(p),W=col(p)==='w',r=i>>3,c=i&7;
    let x=t==='K'?(MODE.giveaway?150:0):VAL[t];
    if(t!=='K')x+=(3.5-Math.abs(3.5-c))*4+(3.5-Math.abs(3.5-r))*3;
    if(t==='P')x+=(W?6-r:r-1)*8;v+=W?x:-x}
  if(MODE.giveaway)v=-v;if(MODE.ev)v+=MODE.ev(s);return v}

function nega(s,d,a,bt){
  if(d===0){const w=MODE.win&&MODE.win(s);if(w)return w.w==='d'?0:(w.w===s.turn?1e5:-1e5);return(s.turn==='w'?1:-1)*evalS(s)}
  const ms=legal(s),r=result(s,ms);if(r)return r.w==='d'?0:(r.w===s.turn?1e5+d:-1e5-d);
  ms.sort((x,y)=>(s.b[y.t]?1:0)-(s.b[x.t]?1:0));
  let best=-1e9;for(const m of ms){const v=-nega(m.n,d-1,-bt,-a);if(v>best)best=v;if(v>a)a=v;if(a>=bt)break}return best}

function rank(s,ms){const D=MODE.depth||((gen(Object.assign({},s,{turn:'w'})).length>50||s.hand.b.length||s.hand.w.length)?2:3);
  return ms.map(m=>({m,v:-nega(m.n,D-1,-1e9,1e9)+Math.random()*6})).sort((a,b)=>b.v-a.v)}

/* ---------- modes ---------- */
const best=L=>L[0];
const PC={queens:'Q',knights:'N',rooks:'R',bishops:'B',pawns:'P',dragons:'D'};
const HILL=[27,28,35,36];
const noKing=(s,c)=>!s.b.some(p=>p&&col(p)===c);
const randEmpty=(b,rows)=>{const e=[];for(const r of rows)for(let c=0;c<8;c++)if(!b[r*8+c])e.push(r*8+c);return e.length?e[Math.floor(Math.random()*e.length)]:-1};
var MODES=[
  {re:/2nd best/i,name:'2nd Best Move',rule:'The bot always plays its second-best move.',policy:L=>L[Math.min(1,L.length-1)]},
  {re:/nth best|top 3|random/i,name:'Random Top 3',rule:'The bot picks at random from its three best moves.',policy:L=>L[Math.floor(Math.random()*Math.min(3,L.length))]},
  {re:/chance of blunder/i,name:'5% Blunder',rule:'Each move, the bot has a 5% chance of playing a random move.',policy:L=>Math.random()<0.05?L[Math.floor(Math.random()*L.length)]:L[0]},
  {re:/give check, it must|must give check/i,name:'Must Give Check',rule:'If the bot can give check, it must.',policy:L=>{const c=L.filter(x=>{const k=kingSq(x.m.n.b,'w');return k>=0&&attacked(x.m.n.b,k,'b')});return(c.length?c:L)[0]}},
  {re:/capture your queen/i,name:'Queen Hunter',rule:'If the bot can capture your queen, it always does.',policy:(L,s)=>(L.filter(x=>s.b[x.m.t]==='Q')[0])||L[0]},
  {re:/worstfish/i,name:'WorstFish',rule:'The bot plays the worst move it can find. Can you still lose?',policy:L=>L[L.length-1]},
  {re:/atomic/i,name:'Atomic',atomic:1,rule:'Captures explode, destroying every non-pawn piece around them. Blow up the enemy king.',
    win:s=>kingSq(s.b,'b')<0?{w:'w',why:'enemy king exploded'}:kingSq(s.b,'w')<0?{w:'b',why:'your king exploded'}:null},
  {re:/horde/i,name:'Horde',fen:'rnbqkbnr/pppppppp/8/1PP2PP1/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP',rule:'You are 36 kingless pawns. Checkmate the king before the horde is wiped out.',
    win:s=>noKing(s,'w')?{w:'b',why:'the horde was wiped out'}:null},
  {re:/king of the hill/i,name:'King of the Hill',hill:1,rule:'Checkmate, or walk your king onto one of the four centre squares.',
    win:s=>HILL.includes(kingSq(s.b,'w'))?{w:'w',why:'your king took the hill'}:HILL.includes(kingSq(s.b,'b'))?{w:'b',why:'the bot king took the hill'}:null,
    ev:s=>{const d=i=>i<0?0:Math.max(Math.abs(3.5-(i>>3)),Math.abs(3.5-(i&7)));return (d(kingSq(s.b,'b'))-d(kingSq(s.b,'w')))*40}},
  {re:/3 check|three.check/i,name:'3-Check',checks:1,rule:'Give check three times to win.',
    win:s=>s.chk.w>=3?{w:'w',why:'three checks'}:s.chk.b>=3?{w:'b',why:'three checks'}:null,ev:s=>(s.chk.w-s.chk.b)*250},
  {re:/giveaway|antichess/i,name:'Giveaway',giveaway:1,rule:'Captures are forced and the king is just a piece. Lose all your pieces to win.',
    win:s=>noKing(s,'w')?{w:'w',why:'you gave everything away'}:noKing(s,'b')?{w:'b',why:'the bot gave everything away'}:null},
  {re:/960/,name:'Chess960',rule:'The back rank is shuffled at random. No castling here.',setup:s=>{
    const a=Array(8).fill(null),pick=f=>{const e=a.map((x,i)=>x?-1:i).filter(i=>i>=0&&f(i));return e[Math.floor(Math.random()*e.length)]};
    a[pick(i=>i%2===0)]='B';a[pick(i=>i%2===1)]='B';a[pick(()=>1)]='Q';a[pick(()=>1)]='N';a[pick(()=>1)]='N';
    const rest=a.map((x,i)=>x?-1:i).filter(i=>i>=0);a[rest[0]]='R';a[rest[1]]='K';a[rest[2]]='R';
    for(let c=0;c<8;c++){s.b[56+c]=a[c];s.b[c]=a[c].toLowerCase()}s.cr=''}},
  {re:/racing kings/i,name:'Racing Kings',racing:1,fen:'8/8/8/8/8/8/krbnNBRK/qrbnNBRQ',rule:'No checks allowed. First king to reach the top rank wins.',
    win:s=>kingSq(s.b,'w')<8?{w:'w',why:'your king crossed the line'}:kingSq(s.b,'b')<8?{w:'b',why:'the bot king crossed the line'}:null,
    ev:s=>((kingSq(s.b,'b')>>3)-(kingSq(s.b,'w')>>3))*90},
  {re:/fog of war/i,name:'Fog of War',fog:1,rule:'You only see enemy pieces on squares your pieces can reach.'},
  {re:/crazyhouse/i,name:'Crazyhouse-lite',hand:1,depth:2,rule:'Captured pieces join your hand. Tap one, then an empty square, to drop it.'},
  {re:/landmine|place mines/i,name:'Landmines',rule:'Four hidden mines lie in the middle of the board. Any piece but a king that steps on one is destroyed.',
    setup:(s,g)=>{g.mines=new Set();while(g.mines.size<4)g.mines.add(16+Math.floor(Math.random()*32))},
    after:(g,m)=>{if(m.drop||!g.mines.has(m.t)||up(g.s.b[m.t])==='K')return;g.s.b[m.t]=null;g.mines.delete(m.t);g.boom.add(m.t);g.msg='Boom! A mine went off on '+sqName(m.t)+'.'}},
  {re:/gravity/i,name:'Gravity',gravity:1,rule:'After every move, all pieces except pawns and kings fall toward the bottom of the board.'},
  {re:/how many (queens|knights|rooks|bishops|pawns|dragons)/i,name:'How Many',count:1,rule:'',
    setup:s=>{let n=CNT;for(const r of[5,4,3,2])for(let c=0;c<8;c++)if(n>0&&!s.b[r*8+c]){s.b[r*8+c]=ARG;n--}}},
  {re:/∞ pawns|infinite pawns/i,name:'∞ Pawns',fen:'rnbqkbnr/pppppppp/8/8/8/PPPPPPPP/PPPPPPPP/PPPPKPPP',rule:'You have only pawns, and a fresh one appears on your second rank after every move.',
    after:(g,m)=>{if(g.s.turn!=='b')return;const j=randEmpty(g.s.b,[6,5]);if(j>=0)g.s.b[j]='P'}},
  {re:/scp|spc-/i,horror:1,name:'SCP Containment Breach',rule:'A monster steps toward your king every turn and eats whatever it lands on. Sacrifice a piece onto it to banish it.',
    setup:s=>{s.mon=24+Math.floor(Math.random()*8)},
    after:(g,m)=>{const s=g.s;
      if(s.turn==='b'){if(m.t===s.mon){s.b[m.t]=null;s.mon=Math.floor(Math.random()*8);g.msg='Your piece banished the monster to the top rank.'}return}
      const K=kingSq(s.b,'w');if(K<0)return;const r=s.mon>>3,c=s.mon&7;
      const nm=(r+Math.sign((K>>3)-r))*8+c+Math.sign((K&7)-c);
      if(nm===K){s.mon=nm;g.over={w:'b',why:'the monster reached your king'};return}
      if(s.b[nm]&&up(s.b[nm])!=='K'){g.msg='The monster ate a piece on '+sqName(nm)+'.';s.b[nm]=null}
      s.mon=nm}},
  {re:/stockfish/i,name:'Stockfish',rule:'Play the real Stockfish 19 engine.'}
];
const HOW={
  'Atomic':'Capture a piece next to the bot king so the blast takes the king with it. Never capture next to your own king.',
  'Horde':'Checkmate the bot king with your pawns before every one of them is captured.',
  'King of the Hill':'Walk your king onto d4, e4, d5 or e5, or checkmate the bot first.',
  '3-Check':'Put the bot king in check three times before it does the same to you.',
  'Giveaway':'Lose every piece you have, or run out of legal moves.',
  'Racing Kings':'Be first to reach the top rank with your king. Moves that give check are not allowed.',
  'SCP Containment Breach':'Checkmate the bot before the monster reaches your king. Land a piece on it to send it away.',
  'Landmines':'Checkmate the bot. Mines can blow up either side, so the middle of the board is a gamble.'
};
MODES.forEach(m=>{if(HOW[m.name])m.how=HOW[m.name]});
const FALLBACK=MODES.find(m=>m.name==='Stockfish');
function modeFor(title,cat){
  for(const m of MODES){const x=title.match(m.re);if(x)return{m,arg:m.count?PC[x[1].toLowerCase()]:null}}
  const B=n=>({m:MODES.find(m=>m.name===n),arg:null}),HM=a=>({m:MODES.find(m=>m.count),arg:a});
  if(/nuke|bomb|explod/i.test(title))return B('Atomic');
  if(/gravity|fall/i.test(title))return B('Gravity');
  if(/mine/i.test(title))return B('Landmines');
  if(/960|random/i.test(title))return B('Chess960');
  if(/hill/i.test(title))return B('King of the Hill');
  if(/check/i.test(title)&&/3|three/i.test(title))return B('3-Check');
  if(/∞ pawns|infinite pawns/i.test(title))return B('∞ Pawns');
  if(/horde/i.test(title))return B('Horde');
  if(/amazons?/i.test(title))return HM('Q');
  if(/knooks?/i.test(title))return HM('N');
  if(/roo+ks/i.test(title))return HM('R');
  switch(cat){
    case 'Horror Chess':return /darkness|can't look|fog|096/i.test(title)?B('Fog of War'):B('SCP Containment Breach');
    case 'Drawback Chess':return B('5% Blunder');
    case 'Dice Chess':return B('Random Top 3');
    case 'Variant Bots':return B('2nd Best Move');
    case 'Challenges & Odds':return HM('Q');
    default:return B('Stockfish')}}

