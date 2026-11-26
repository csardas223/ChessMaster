
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

/* ---------- game UI ---------- */
const PCIMG={P:'p',N:'n',B:'b',R:'r',Q:'q',K:'k'};
const IMG=n=>document.getElementById('img-'+n).getAttribute('src');
const glyph=p=>{const t=up(p),c=col(p);return `<img class="x-pc" src="${IMG(t==='D'?'dragon_'+c:c+PCIMG[t])}" draggable="false" alt="">`};
var $=id=>document.getElementById(id);
const PN={Q:'queens',N:'knights',R:'rooks',B:'bishops',P:'pawns',D:'dragons'};

/* ---------- sound ---------- */
let SOUND_ON=true,LAST_START=-1e4;const SND={};
['move-self','move-opponent','capture','castle','move-check','promote','game-start','game-end','illegal','notify'].forEach(n=>{const a=$('snd-'+n);if(a){a.preload='auto';try{a.load()}catch(_){}SND[n]=a}});
function sfx(n){const a=SND[n];if(!SOUND_ON||!a)return;if(a._u){a._w=true;return}
  try{a.muted=false;a.currentTime=0;const p=a.play();if(p&&p.catch)p.catch(()=>{})}catch(_){}}
function unlockAudio(){document.removeEventListener('pointerdown',unlockAudio,true);document.removeEventListener('keydown',unlockAudio,true);
  Object.values(SND).forEach(a=>{try{a._u=true;a.muted=true;const p=a.play();
    const done=()=>{a._u=false;if(a._w){a._w=false;a.currentTime=0;a.muted=false;if(a.paused)a.play().catch(()=>{});return}a.pause();a.currentTime=0;a.muted=false};
    if(p&&p.then)p.then(done).catch(()=>{a._u=false;a.muted=false});else done()}catch(_){a._u=false;a.muted=false}})}
document.addEventListener('pointerdown',unlockAudio,true);document.addEventListener('keydown',unlockAudio,true);
function setSound(on){SOUND_ON=on;const b=$('mute');b.setAttribute('aria-pressed',on);b.setAttribute('aria-label',on?'Sound on':'Sound off');
  $('snd-on').toggleAttribute('hidden',!on);$('snd-off').toggleAttribute('hidden',on);
  if(!on)Object.values(SND).forEach(a=>{try{a.pause()}catch(_){}})}
$('mute').addEventListener('click',()=>setSound(!SOUND_ON));
function moveSound(m,mover,chk,capd){
  if(G.over){if(G.over.why==='checkmate'){sfx('move-check');setTimeout(()=>sfx('game-end'),280)}else sfx('game-end');return}
  sfx(chk?'move-check':m.pr?'promote':m.cs!=null?'castle':capd?'capture':mover==='w'?'move-self':'move-opponent');
  if(G.msg)setTimeout(()=>sfx('notify'),160)}

var GID=0,FLIP=false,TT=0;
function newGame(){GID++;busy=false;const s=parse(MODE.fen||'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
  G={s,sel:-1,hand:null,over:null,last:null,boom:new Set(),msg:'',cap:{w:[],b:[]},sans:[],undo:[]};
  if(MODE.setup)MODE.setup(s,G);
  $('status').classList.remove('is-show');
  G.ms=legal(s);render();
  const now=performance.now();if(now-LAST_START>600)sfx('game-start');LAST_START=now}
function toast(t){const e=$('status');e.textContent=t;e.classList.add('is-show');clearTimeout(TT);TT=setTimeout(()=>e.classList.remove('is-show'),2000)}
const counts=b=>{const o={w:{},b:{}};for(const p of b)if(p){const c=col(p),t=up(p);o[c][t]=(o[c][t]||0)+1}return o};
const MAT={P:1,N:3,B:3,R:5,Q:9,D:12,K:0};
function san(s,ms,m,n){const F='abcdefgh';let t;
  if(m.drop)t=m.drop+'@'+sqName(m.t);
  else if(m.cs!=null)t=m.t>m.f?'O-O':'O-O-O';
  else{const p=up(s.b[m.f]),cap=s.b[m.t]||m.ep;
    if(p==='P')t=(cap?F[m.f&7]+'x':'')+sqName(m.t)+(m.pr?'=Q':'');
    else{const o=ms.filter(x=>x!==m&&!x.drop&&x.f>=0&&x.t===m.t&&s.b[x.f]===s.b[m.f]);let d='';
      if(o.length)d=!o.some(x=>(x.f&7)===(m.f&7))?F[m.f&7]:!o.some(x=>(x.f>>3)===(m.f>>3))?String(8-(m.f>>3)):sqName(m.f);
      t=p+d+(cap?'x':'')+sqName(m.t)}}
  if(!MODE.giveaway){const k=kingSq(n.b,n.turn);if(k>=0&&attacked(n.b,k,s.turn))t+=G.over&&G.over.why==='checkmate'?'#':'+'}
  return t}
function capsHTML(a,c){const o='PNBRQDK';return a.slice().sort((x,y)=>o.indexOf(x)-o.indexOf(y)).map((t,k,arr)=>
  `<img class="x-cp${k&&arr[k-1]===t?' is-same':''}" src="${IMG(t==='D'?'dragon_'+c:c+PCIMG[t])}" alt="${t}">`).join('')}
function undo(){if(!G||busy||!G.undo.length)return;const u=G.undo.pop();
  Object.assign(G,{s:u.s,last:u.last,boom:u.boom,cap:u.cap,over:null,sel:-1,hand:null,msg:''});if(u.mines)G.mines=u.mines;
  G.sans.length=u.n;G.ms=legal(G.s);$('status').classList.remove('is-show');render()}

const sqEl=i=>$('board').querySelector(`[data-i="${i}"]`);
const pcEl=i=>{const q=sqEl(i);return q&&q.querySelector(':scope > .x-pc')};
function ghostOf(i){const q=sqEl(i),pc=pcEl(i);if(!q||!pc)return null;const r=q.getBoundingClientRect(),g=pc.cloneNode(true);
  g.className='x-pc x-ghost';g.style.width=r.width+'px';g.style.height=r.height+'px';document.body.appendChild(g);return g}
function slide(f,t,done){const a=sqEl(f),z=sqEl(t),pc=pcEl(f),g=ghostOf(f);if(!a||!z||!g){if(g)g.remove();return done()}
  const ra=a.getBoundingClientRect(),rz=z.getBoundingClientRect();pc.style.visibility='hidden';
  g.style.transform=`translate(${ra.left}px,${ra.top}px)`;g.getBoundingClientRect();g.classList.add('is-slide');
  g.style.transform=`translate(${rz.left}px,${rz.top}px)`;let fin=false;
  const end=()=>{if(fin)return;fin=true;g.remove();done()};g.addEventListener('transitionend',end);setTimeout(end,230)}
function play(m,drag){if(drag||m.drop||m.f<0)return commit(m);const g=G;busy=true;
  slide(m.f,m.t,()=>{if(g!==G)return;busy=false;commit(m)})}
function commit(m){const prev=G.s,pms=G.ms,mover=prev.turn,c0=counts(prev.b),nc0=G.cap.w.length+G.cap.b.length;
  if(mover==='w')G.undo.push({s:clone(prev),last:G.last,boom:new Set(G.boom),mines:G.mines?new Set(G.mines):null,cap:{w:G.cap.w.slice(),b:G.cap.b.slice()},n:G.sans.length});
  G.s=m.n;G.last=m;G.sel=-1;G.hand=null;G.msg='';
  if(MODE.after)MODE.after(G,m);
  if(m.pr){c0[mover].P--;c0[mover].Q=(c0[mover].Q||0)+1}
  const c1=counts(G.s.b);
  for(const c of['w','b'])for(const t in c0[c]){const d=c0[c][t]-(c1[c][t]||0);for(let k=0;k<d;k++)G.cap[opp(c)].push(t)}
  G.ms=legal(G.s);if(!G.over)G.over=result(G.s,G.ms);
  G.sans.push(san(prev,pms,m,G.s));render();
  {const k=kingSq(G.s.b,G.s.turn),chk=!MODE.giveaway&&k>=0&&attacked(G.s.b,k,mover);moveSound(m,mover,chk,G.cap.w.length+G.cap.b.length>nc0)}
  if(!G.over){const k=kingSq(G.s.b,G.s.turn),chk=!MODE.giveaway&&k>=0&&attacked(G.s.b,k,mover);let t=G.msg;
    if(chk)t=(t?t+' ':'')+'Check!';
    if(chk&&MODE.checks)t+=` Checks: you ${G.s.chk.w}, bot ${G.s.chk.b}.`;
    if(t)toast(t)}
  if(!G.over&&G.s.turn==='b'){busy=true;render();const id=GID;setTimeout(()=>botMove(id),400)}}

/* ---------- Stockfish 19 ---------- */
const SF_BASE='https://unpkg.com/stockfish@19.0.1/bin/stockfish-19-lite-single';
let SF=null,SF_FAILED=false,SF_LOADING=false,SF_READY=false,SF_TIMER=0;const SF_Q=[],SF_PEND=[];
function useSF(){const M=MODE;return !M.policy&&!M.atomic&&!M.hill&&!M.checks&&!M.giveaway&&!M.racing&&!M.fog&&!M.hand&&!M.gravity&&!M.horror&&!M.fen&&!M.after&&!M.win&&(!M.setup||M.count)&&!(M.count&&ARG==='D')}
function sfFail(){SF_FAILED=true;SF_LOADING=false;clearTimeout(SF_TIMER);try{if(SF)SF.terminate()}catch(_){}SF=null;SF_PEND.length=0;
  const q=SF_Q.splice(0);q.forEach(cb=>cb(null));if(G)render()}
function loadSF(){if(SF||SF_FAILED||SF_LOADING)return;SF_LOADING=true;
  SF_TIMER=setTimeout(()=>{if(!SF_READY)sfFail()},8000);
  try{fetch(SF_BASE+'.js').then(r=>{if(!r.ok)throw new Error('load');return r.text()}).then(src=>{if(SF_FAILED)return;
    const url=URL.createObjectURL(new Blob([src],{type:'text/javascript'}));
    SF=new Worker(url+'#'+encodeURIComponent(SF_BASE+'.wasm'));SF.onmessage=e=>onSF(String(e.data));SF.onerror=sfFail;
    SF.postMessage('uci');SF.postMessage('isready')}).catch(sfFail)}catch(e){sfFail()}}
function onSF(line){
  if(line==='readyok'&&!SF_READY){SF_READY=true;SF_LOADING=false;clearTimeout(SF_TIMER);SF_PEND.splice(0).forEach(sfGo);if(G)render();return}
  if(line.startsWith('bestmove')){clearTimeout(SF_TIMER);const cb=SF_Q.shift();if(cb)cb(line.split(/\s+/)[1])}}
function sfGo(fen){SF.postMessage('position fen '+fen);SF.postMessage('go movetime 600');clearTimeout(SF_TIMER);SF_TIMER=setTimeout(sfFail,8000)}
function sfAsk(fen,cb){SF_Q.push(cb);if(SF_READY)sfGo(fen);else SF_PEND.push(fen)}
function toFEN(s){const rows=[];for(let r=0;r<8;r++){let row='',n=0;
    for(let c=0;c<8;c++){const p=s.b[r*8+c];if(!p){n++;continue}if(n){row+=n;n=0}row+=p}
    if(n)row+=n;rows.push(row)}
  return `${rows.join('/')} ${s.turn} ${s.cr||'-'} ${s.ep>=0?sqName(s.ep):'-'} 0 1`}
function fromUCI(ms,u){if(!u||u.length<4)return null;const sq=x=>(8-(+x[1]))*8+(x.charCodeAt(0)-97);
  const f=sq(u.slice(0,2)),t=sq(u.slice(2,4)),pr=u[4];
  return ms.find(m=>m.f===f&&m.t===t&&(pr?m.pr&&pr==='q':!m.pr))||null}

function botMove(id){if(id!==GID||!G||G.s.turn!=='b')return;if(G.over){busy=false;return}const g=G;
  if(useSF()&&!SF_FAILED){loadSF();
    if(!SF_FAILED){render();sfAsk(toFEN(g.s),u=>{if(g!==G||G.over)return;const m=fromUCI(g.ms,u);if(m){busy=false;play(m)}else customMove(g)});return}}
  customMove(g)}
function customMove(g){if(g!==G||G.over){if(G===g)busy=false;return}
  const L=rank(g.s,g.ms);if(g!==G)return;busy=false;play((MODE.policy||best)(L,g.s).m)}

function tap(i){if(!G||G.over||busy||G.s.turn!=='w')return;
  if(G.hand){const m=G.ms.find(x=>x.drop===G.hand&&x.t===i);G.hand=null;if(m)return play(m);sfx('illegal');render();return}
  if(G.sel>=0){const m=G.ms.find(x=>x.f===G.sel&&x.t===i);if(m)return play(m)}
  const p=G.s.b[i];if(G.sel>=0&&G.sel!==i&&!(p&&col(p)==='w'))sfx('illegal');G.sel=p&&col(p)==='w'&&G.sel!==i?i:-1;render()}

function render(){const s=G.s,b=s.b;let vis=null;
  if(MODE.fog){vis=new Set();for(let i=0;i<64;i++)if(b[i]&&col(b[i])==='w')vis.add(i);for(const m of gen(Object.assign({},s,{turn:'w'})))vis.add(m.t)}
  const tg=new Set(G.sel>=0?G.ms.filter(m=>m.f===G.sel).map(m=>m.t):G.hand?G.ms.filter(m=>m.drop===G.hand).map(m=>m.t):[]);
  const wk=kingSq(b,'w'),inChk=!MODE.giveaway&&wk>=0&&attacked(b,wk,'b');
  let h='';
  for(let k=0;k<64;k++){const i=FLIP?63-k:k,r=i>>3,c=i&7,fog=vis&&!vis.has(i),p=b[i];
    const cls=['x-sq',(r+c)%2?'is-dark':'',G.last&&(G.last.t===i||G.last.f===i)?'is-last':'',G.sel===i?'is-sel':'',inChk&&i===wk?'is-check':'',MODE.hill&&HILL.includes(i)?'is-hill':'',fog?'is-fog':''].join(' ');
    let inner=p&&!fog?glyph(p):'';
    if(s.mon===i)inner+=`<span class="x-mark${p?'':' big'}"><img class="x-pc" src="${IMG('scp')}" alt="monster"></span>`;
    if(G.boom.has(i)&&!p)inner+=`<span class="x-mark big"><img class="x-pc x-boom" src="${IMG('boom')}" alt=""></span>`;
    if(tg.has(i))inner+=p?'<span class="x-ring"></span>':'<span class="x-dot"></span>';
    if(c===(FLIP?7:0))inner+=`<span class="x-coord">${8-r}</span>`;
    if(r===(FLIP?0:7))inner+=`<span class="x-coord x-coord--f">${'abcdefgh'[c]}</span>`;
    h+=`<button class="${cls}" type="button" data-i="${i}" aria-label="${sqName(i)}${p&&!fog?' '+p:''}">${inner}</button>`}
  $('board').innerHTML=h;
  const hw=s.hand.w;$('hand').innerHTML=MODE.hand&&hw.length?[...new Set(hw)].map(t=>`<button type="button" data-drop="${t}" aria-pressed="${G.hand===t}">${glyph(t)}<small>${hw.filter(x=>x===t).length}</small></button>`).join(''):'';
  $('botst').textContent=busy&&!G.over?(SF_LOADING&&!SF_READY&&!SF_FAILED&&useSF()?'Loading Stockfish…':'Thinking…'):'';
  const mv=x=>x.reduce((a,t)=>a+(MAT[t]||0),0),adv=mv(G.cap.w)-mv(G.cap.b);
  $('capw').innerHTML=capsHTML(G.cap.w,'b');$('capb').innerHTML=capsHTML(G.cap.b,'w');
  $('advw').textContent=adv>0?'+'+adv:'';$('advb').textContent=adv<0?'+'+(-adv):'';
  $('pyou').classList.toggle('is-active',!G.over&&s.turn==='w');$('pbot').classList.toggle('is-active',!G.over&&s.turn==='b');
  $('table').classList.toggle('is-flip',FLIP);$('undo').disabled=busy||!G.undo.length;
  const ml=$('moves'),N=G.sans.length;
  ml.innerHTML=G.sans.map((x,k)=>(k%2?'':`<span class="x-mn">${k/2+1}.</span>`)+`<span class="x-mv${k===N-1?' is-cur':''}">${x}</span>`).join('');
  ml.scrollLeft=ml.scrollWidth;
  $('botname').textContent=useSF()&&!SF_FAILED?'Stockfish 19':'Bot';
  const go=G.over;$('gover').classList.toggle('is-open',!!go);
  if(go){$('gotitle').textContent=go.w==='w'?'You Won!':go.w==='b'?'You Lost':'Draw';$('gowhy').textContent=go.why.replace(/^./,x=>x.toUpperCase())+'.'}}
$('botava').innerHTML=glyph('n');
document.documentElement.style.setProperty('--x-scp',`url("${IMG('scp')}")`);document.documentElement.style.setProperty('--x-boom',`url("${IMG('boom')}")`);

let DR=null,noClick=0;
const sqAt=(x,y)=>{const e=document.elementFromPoint(x,y),q=e&&e.closest('#board [data-i]');return q?+q.dataset.i:-1};
function dragEnd(){if(!DR)return;if(DR.g)DR.g.remove();const pc=pcEl(DR.i);if(pc)pc.style.visibility='';
  $('board').querySelectorAll('.is-hover').forEach(q=>q.classList.remove('is-hover'));DR=null}
$('board').addEventListener('pointerdown',e=>{if(DR||!G||G.over||busy||G.s.turn!=='w'||G.hand||e.button>0)return;
  const q=e.target.closest('[data-i]');if(!q)return;const i=+q.dataset.i,p=G.s.b[i];if(!p||col(p)!=='w')return;
  e.preventDefault();const wasSel=G.sel===i;if(!wasSel){G.sel=i;render()}
  const g=ghostOf(i);if(!g)return;const r=sqEl(i).getBoundingClientRect();
  const touch=e.pointerType==='touch';
  DR={i,wasSel,g,id:e.pointerId,x:e.clientX,y:e.clientY,w:r.width,h:r.height,lift:touch?r.height:0,moved:false};
  g.classList.add('is-drag');g.classList.toggle('is-touch',touch);g.style.left=(e.clientX-r.width/2)+'px';g.style.top=(e.clientY-r.height/2-DR.lift)+'px';
  pcEl(i).style.visibility='hidden';try{$('board').setPointerCapture(e.pointerId)}catch(_){}});
$('board').addEventListener('pointermove',e=>{if(!DR||e.pointerId!==DR.id)return;
  if(Math.hypot(e.clientX-DR.x,e.clientY-DR.y)>4)DR.moved=true;
  DR.g.style.left=(e.clientX-DR.w/2)+'px';DR.g.style.top=(e.clientY-DR.h/2-DR.lift)+'px';
  const t=sqAt(e.clientX,e.clientY-DR.lift);$('board').querySelectorAll('.is-hover').forEach(q=>{if(+q.dataset.i!==t)q.classList.remove('is-hover')});
  if(t>=0)sqEl(t).classList.add('is-hover')});
$('board').addEventListener('pointerup',e=>{if(!DR||e.pointerId!==DR.id)return;const d=DR,t=sqAt(e.clientX,e.clientY-d.lift);dragEnd();noClick=performance.now();
  if(!d.moved||t===d.i){if(!d.moved&&d.wasSel){G.sel=-1;render()}return}
  const m=G.ms.find(x=>x.f===d.i&&x.t===t);if(m)play(m,true);else sfx('illegal')});
$('board').addEventListener('pointercancel',dragEnd);
$('board').addEventListener('click',e=>{if(performance.now()-noClick<500)return;const t=e.target.closest('[data-i]');if(t)tap(+t.dataset.i)});
$('gonew').addEventListener('click',newGame);
$('golobby').addEventListener('click',closeGame);
$('hand').addEventListener('click',e=>{const t=e.target.closest('[data-drop]');if(!t||busy||G.over)return;G.sel=-1;G.hand=G.hand===t.dataset.drop?null:t.dataset.drop;render()});
$('newg').addEventListener('click',newGame);
$('flip').addEventListener('click',()=>{FLIP=!FLIP;$('flip').setAttribute('aria-pressed',FLIP);if(G)render()});
$('undo').addEventListener('click',undo);
$('lobby').addEventListener('click',closeGame);
$('cnt').addEventListener('input',e=>{CNT=+e.target.value;$('cntlab').textContent=`Extra ${PN[ARG]}: ${CNT}`;newGame()});
/* ---------- explanations, info sheet, first-time intro ---------- */
const cap1=t=>t.replace(/^./,x=>x.toUpperCase());
function modeName(m,arg){return m.count?'How Many '+cap1(PN[arg]):m.name}
function ruleFor(m,arg){return m.count?`You get extra ${PN[arg]} on your side${arg==='D'?' (a dragon moves like a queen and a knight)':''}. Pick how many, then beat the bot.`:m.rule}
function explainOf(v){return v.explain||ruleFor(v.mode.m,v.mode.arg)}
function infoHTML(m,arg,exp){return `<div class="x-info"><div><span class="x-tag">${esc(modeName(m,arg))}</span></div>`+
  `<div class="x-info__sec"><p class="x-label">The twist</p><p>${esc(exp)}</p></div>`+
  (m.how?`<div class="x-info__sec"><p class="x-label">How to win</p><p>${esc(m.how)}</p></div>`:'')+'</div>'}
let CURV=null,SHEET_RET=null;
const sheetOpen=()=>$('sheet').classList.contains('is-open');
function openSheet(title,html,ret){$('sheettitle').textContent=title;$('sheetbody').innerHTML=html;const s=$('sheet');
  s.classList.add('is-open');s.setAttribute('aria-hidden','false');SHEET_RET=ret||null;setTimeout(()=>$('sheetclose').focus(),30)}
function closeSheet(noFocus){if(!sheetOpen())return;const s=$('sheet');s.classList.remove('is-open');s.setAttribute('aria-hidden','true');
  $('info').setAttribute('aria-expanded','false');const r=SHEET_RET;SHEET_RET=null;if(!noFocus&&r&&r.focus)r.focus()}
$('sheetclose').addEventListener('click',()=>closeSheet());
$('sheetbg').addEventListener('click',()=>closeSheet());
function infoOpen(o){if(!o)return closeSheet(true);
  openSheet(CURV?CURV[1]:modeName(MODE,ARG),infoHTML(MODE,ARG,CURV?explainOf(CURV):ruleFor(MODE,ARG)),$('info'));$('info').setAttribute('aria-expanded','true')}
$('info').addEventListener('click',()=>infoOpen(!sheetOpen()));

const PLAYED=new Set();
try{const a=JSON.parse(localStorage.getItem('ca-played')||'[]');if(Array.isArray(a))a.forEach(x=>PLAYED.add(x))}catch(_){}
function markPlayed(id){if(!id)return;PLAYED.delete(id);PLAYED.add(id);try{localStorage.setItem('ca-played',JSON.stringify([...PLAYED]))}catch(_){}}
const introOpen=()=>$('intro').classList.contains('is-open');
function showIntro(v){$('introtitle').textContent=v[1];$('introbody').innerHTML=infoHTML(v.mode.m,v.mode.arg,explainOf(v));
  const d=$('intro');d.classList.add('is-open');d.setAttribute('aria-hidden','false');setTimeout(()=>$('introgo').focus(),30)}
function hideIntro(){const d=$('intro');d.classList.remove('is-open');d.setAttribute('aria-hidden','true')}
$('introgo').addEventListener('click',()=>{hideIntro();if(CURV)markPlayed(CURV[0]);sfx('game-start');LAST_START=performance.now();$('back').focus()});

function closeGame(){GID++;G=null;busy=false;hideIntro();infoOpen(false);$('ov').classList.remove('is-open');document.body.style.overflow='';CURV=null;
  if(VIDEOS.length&&lastPlayed()!==HOME.last)buildHome()}
$('back').addEventListener('click',closeGame);
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;
  if(introOpen())$('introgo').click();else if(sheetOpen())closeSheet();else if(G)closeGame()});

function openGame(v){CURV=v;const first=!PLAYED.has(v[0]);if(!first)markPlayed(v[0]);openMode(v.mode.m,v.mode.arg,v[1],first)}
function openMode(m,arg,from,intro){MODE=m;ARG=arg;
  $('mname').textContent=MODE.count?modeName(MODE,ARG)+'?':MODE.name;
  infoOpen(false);$('cntwrap').hidden=!MODE.count;$('cnt').value=CNT;$('cntlab').textContent=MODE.count?`Extra ${PN[ARG]}: ${CNT}`:'';
  $('ov').classList.add('is-open');document.body.style.overflow='hidden';
  if(intro&&CURV){LAST_START=performance.now();newGame();showIntro(CURV)}else{newGame();$('back').focus()}}

/* ---------- video list ---------- */
var VIDEOS=[];
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=t=>String(t).normalize('NFKD').replace(/[\u0300-\u036f\u0483-\u0489\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/g,'').toLowerCase();
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtDate=d=>{if(!d)return '';const[y,m,dd]=d.split('-');return `${MON[+m-1]} ${+dd}, ${y}`};
const fmtViews=n=>{const f=(x,u)=>(x>=10?Math.floor(x):Math.floor(x*10)/10)+u;return (n>=1e9?f(n/1e9,'B'):n>=1e6?f(n/1e6,'M'):n>=1e3?f(n/1e3,'K'):String(n))+' views'};
const fmtDur=s=>{const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=String(s%60).padStart(2,'0');return h?`${h}:${String(m).padStart(2,'0')}:${x}`:`${m}:${x}`};
const metaLine=v=>[fmtDate(v.date),v.views?fmtViews(v.views):''].filter(Boolean).join(' · ');
const thumbURL=(id,q)=>`https://i.ytimg.com/vi/${encodeURIComponent(id)}/${q}.jpg`;
const ytURL=id=>'https://www.youtube.com/watch?v='+encodeURIComponent(id);
const SVG_PLAY='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z"/></svg>';
const SVG_DOTS='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>';
const SVG_SHUF='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>';
const SVG_CHECK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const SVG_EXT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
const SORTS=[['shuffle','Shuffled'],['trend','Trending'],['new','Newest'],['old','Oldest'],['views','Most viewed'],['long','Longest'],['az','A–Z']];
let cat='All',SORT='shuffle',ORDER=[],FEAT=-1;

function readJSON(id,file){const t=document.getElementById(id).textContent.trim();return t?Promise.resolve(JSON.parse(t)):fetch(file).then(r=>r.json())}
/* wait for later scripts (modes_extra.js) so the list is built once with the full mode table */
function loadList(){
  /* the pack's random maze fits at most 3 walls in each of 4 rows; a larger count never finishes placing */
  const VC=window.ARCADE_EXTRA&&ARCADE_EXTRA.VIDEO_CONFIG;
  if(VC)for(const k in VC){const c=VC[k],a=c&&c.params;if(c.mode==='maze'&&a&&(a.layout||'random')==='random'&&a.n>12)a.n=12}
  Promise.all([readJSON('videos','videos_compact.json'),readJSON('meta','video_meta.json').catch(()=>({}))]).then(([d,m])=>renderList(d,m))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadList);else setTimeout(loadList,0);

/* number of videos with a mode of their own (not the plain Stockfish fallback) */
function isBuilt(v){return !!(v.mode&&v.mode.m!==FALLBACK)}
function countBuilt(){return VIDEOS.filter(isBuilt).length}
/* indices of the videos shown in the lobby: only those with a built mode */
function shownIdx(){return VIDEOS.map((v,i)=>i).filter(i=>isBuilt(VIDEOS[i]))}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function applySort(){const V=VIDEOS,I=shownIdx();
  const by={new:(a,b)=>V[b].date.localeCompare(V[a].date)||a-b,old:(a,b)=>V[a].date.localeCompare(V[b].date)||b-a,
    views:(a,b)=>V[b].views-V[a].views,trend:(a,b)=>V[b].vpd-V[a].vpd,long:(a,b)=>V[b].dur-V[a].dur,az:(a,b)=>V[a].sortT.localeCompare(V[b].sortT)};
  ORDER=SORT==='shuffle'?shuffle(I):I.sort(by[SORT]);
  const lab=SORTS.find(s=>s[0]===SORT)[1];$('sortlab').textContent=lab;$('sortbtn').setAttribute('aria-label','Sort videos, currently '+lab)}

function rowHTML(i){const v=VIDEOS[i];
  return `<article class="x-row" data-i="${i}"><div class="x-row__side"><div class="x-th">${v[0]?`<img loading="lazy" src="${thumbURL(v[0],'mqdefault')}" alt="" onerror="this.remove()">`:''}${v.dur?`<span class="x-dur">${fmtDur(v.dur)}</span>`:''}</div><span class="x-tag">${esc(v.md)}</span></div>`+
  `<div class="x-row__body"><h3 class="x-row__title x-clamp">${esc(v[1])}</h3><p class="x-meta">${metaLine(v)}</p><p class="x-row__exp x-clamp">${esc(v.exp)}</p>`+
  `<div class="x-row__foot">${v[0]?`<button class="x-icon" type="button" data-more="${i}" aria-label="More options">${SVG_DOTS}</button>`:''}<button class="x-pbtn" type="button" data-play="${i}">${SVG_PLAY}Play</button></div></div></article>`}

function renderRows(){const q=norm($('q').value.trim()),N=ORDER.length;
  const list=ORDER.filter(i=>{const v=VIDEOS[i];return (cat==='All'||v[2]===cat)&&(!q||v.s.includes(q))});
  $('rows').innerHTML=list.map(rowHTML).join('');$('empty').hidden=!!list.length;
  $('lhead').textContent=(list.length===N?`${N} videos`:`${list.length} of ${N} videos`)+' · '+$('sortlab').textContent}

/* ---------- home feed ---------- */
const DAY=864e5;let IDX=new Map(),CATS_B=[],TAB='home';const TABY={home:0,all:0};
let HOME={rank:[],used:new Set(),seen:new Set(),last:null,see:[]};
function prepStats(){const S=shownIdx();let ref=Date.now();
  S.forEach(i=>{const t=Date.parse(VIDEOS[i].date);if(t>ref)ref=t});
  VIDEOS.forEach(v=>{const t=Date.parse(v.date);v.age=isNaN(t)?1e4:Math.max(0,(ref-t)/DAY);v.vpd=v.views/Math.max(1,v.age);v.lv=Math.log(1+v.views)})}
function lastPlayed(){const a=[...PLAYED];for(let k=a.length-1;k>=0;k--){const i=IDX.get(a[k]);if(i!=null&&isBuilt(VIDEOS[i]))return i}return null}
function cardHTML(i){const v=VIDEOS[i];
  return `<article class="x-card" data-i="${i}"><div class="x-th">${v[0]?`<img loading="lazy" src="${thumbURL(v[0],'mqdefault')}" alt="" onerror="this.remove()">`:''}${v.dur?`<span class="x-dur">${fmtDur(v.dur)}</span>`:''}</div>`+
  `<h3 class="x-card__t x-clamp">${esc(v[1])}</h3><p class="x-meta">${metaLine(v)}</p><button class="x-pbtn" type="button" data-play="${i}">${SVG_PLAY}Play</button></article>`}
function buildHome(){const V=VIDEOS,S=shownIdx();
  if(!S.length){$('feat').hidden=true;$('shelves').innerHTML='';return}
  const mm=k=>{let lo=Infinity,hi=-Infinity;for(const i of S){const x=V[i][k];if(x<lo)lo=x;if(x>hi)hi=x}return x=>hi>lo?(x-lo)/(hi-lo):0};
  const nL=mm('lv'),nV=mm('vpd'),cc={};let np=0;
  PLAYED.forEach(id=>{const i=IDX.get(id);if(i==null)return;np++;cc[V[i][2]]=(cc[V[i][2]]||0)+1});
  for(const i of S){const v=V[i];
    v.score=0.35*nL(v.lv)+0.25*nV(v.vpd)+0.15*Math.pow(0.5,v.age/60)+0.15*(np?(cc[v[2]]||0)/np:0)+0.10*Math.random()-(PLAYED.has(v[0])?10:0)}
  const rank=S.slice().sort((a,b)=>V[b].score-V[a].score);
  /* hero: weighted random from the top 20 */
  const top=rank.slice(0,20),mn=V[top[top.length-1]].score,w=top.map(i=>V[i].score-mn+0.02);
  let r=Math.random()*w.reduce((a,b)=>a+b,0),hero=top[0];
  for(let k=0;k<top.length;k++){r-=w[k];if(r<=0){hero=top[k];break}}
  /* shelves, deduped in order */
  const used=new Set([hero]),shelves=[];
  const add=(title,list,see,sub)=>{const out=[];for(const i of list){if(used.has(i))continue;out.push(i);if(out.length>=10)break}
    if(out.length<3)return false;out.forEach(i=>used.add(i));shelves.push({title,sub,items:out,see});return true};
  add('Trending now',S.filter(i=>V[i].age<=90).sort((a,b)=>V[b].vpd-V[a].vpd),{sort:'trend',cat:'All'});
  add('New uploads',S.slice().sort((a,b)=>V[b].date.localeCompare(V[a].date)||a-b),{sort:'new',cat:'All'});
  const last=lastPlayed();
  if(last!=null){const L=V[last];add('Because you played '+L[1],rank.filter(i=>i!==last&&(V[i][2]===L[2]||V[i].md===L.md)),{sort:'views',cat:L[2]})}
  add('Most popular',S.slice().sort((a,b)=>V[b].views-V[a].views),{sort:'views',cat:'All'});
  const cats=shuffle(CATS_B.slice()),fresh=cats.filter(c=>!cc[c]);let diff=null;
  for(const c of fresh){if(add('Try something different',S.filter(i=>V[i][2]===c).sort((a,b)=>V[b].views-V[a].views),{sort:'views',cat:c},c)){diff=c;break}}
  let n=0;for(const c of cats){if(n>=2)break;if(c===diff)continue;if(add(c+' picks',rank.filter(i=>V[i][2]===c),{sort:'views',cat:c}))n++}
  HOME={rank,used,seen:new Set([hero]),last,see:shelves.map(s=>s.see)};
  $('shelves').innerHTML=shelves.map((s,k)=>`<section class="x-shelf" aria-labelledby="shh-${k}"><div class="x-shead"><h2 id="shh-${k}" title="${esc(s.title)}">${esc(s.title)}${s.sub?`<small>${esc(s.sub)}</small>`:''}</h2><button class="x-see" type="button" data-see="${k}">See all</button></div>`+
    `<div class="x-rail">${s.items.map(cardHTML).join('')}</div></section>`).join('');
  renderFeat(hero)}
/* shuffle: the next-best by score not yet shown as hero, preferring videos not already on a shelf */
function nextHero(){const R=HOME.rank,cur=FEAT;
  const find=ok=>{for(const i of R)if(i!==cur&&ok(i))return i;return -1};
  let pick=find(i=>!HOME.seen.has(i)&&!HOME.used.has(i));
  if(pick<0)pick=find(i=>!HOME.seen.has(i));
  if(pick<0){HOME.seen=new Set([cur]);pick=find(()=>true)}
  if(pick<0)return;HOME.seen.add(pick);renderFeat(pick)}
function setTab(t,keep){if(t===TAB&&!keep)return;TABY[TAB]=window.scrollY;TAB=t;
  $('home').hidden=t!=='home';$('all').hidden=t!=='all';$('allctl').hidden=t!=='all';$('sortbtn').hidden=t!=='all';
  document.querySelectorAll('#tabs [data-tab]').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===t));
  $('topbar').classList.remove('is-hide');window.scrollTo(0,keep?0:TABY[t]);lastY=window.scrollY}
function seeAll(s){SORT=s.sort;cat=s.cat;$('q').value='';
  document.querySelectorAll('.x-chip').forEach(b=>b.setAttribute('aria-pressed',b.dataset.cat===cat));
  applySort();renderRows();setTab('all',true);
  const c=document.querySelector('.x-chip[aria-pressed="true"]'),w=$('chips');
  if(c)w.scrollLeft+=c.getBoundingClientRect().left-w.getBoundingClientRect().left-16}
$('tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b)setTab(b.dataset.tab)});

function renderFeat(i){FEAT=i;const v=VIDEOS[i];
  $('feat').innerHTML=`<div class="x-feat__thumb">${v[0]?`<img src="${thumbURL(v[0],'hqdefault')}" alt="" onerror="this.remove()">`:''}${v.dur?`<span class="x-dur">${fmtDur(v.dur)}</span>`:''}</div>`+
  `<div class="x-feat__body"><div class="x-feat__top"><p class="x-label">Recommended for you</p><button class="x-icon" type="button" id="featshuf" aria-label="Recommend another video">${SVG_SHUF}</button></div>`+
  `<h2 class="x-clamp">${esc(v[1])}</h2><p class="x-meta">${metaLine(v)}</p><div><span class="x-tag">${esc(v.md)}</span></div><p class="x-feat__exp">${esc(v.exp)}</p>`+
  `<button class="x-pbtn x-pbtn--big" type="button" data-play="${i}">${SVG_PLAY}Play</button></div>`;
  $('feat').hidden=false}

function renderList(data,meta){
  VIDEOS.push(...data);
  VIDEOS.forEach(v=>{v.mode=modeFor(v[1],v[2]);const mt=(meta&&meta[v[0]])||[];v.date=mt[0]||'';v.views=+mt[1]||0;v.dur=+mt[2]||0;
    v.md=modeName(v.mode.m,v.mode.arg);v.exp=explainOf(v);const t=norm(v[1]);v.sortT=t.replace(/^chess,?\s+but\s+/,'');v.s=t+' '+v.md.toLowerCase()+' '+v[2].toLowerCase()});
  const CAT_ORDER=['Variants & Games','Variant Bots','Challenges & Odds','Powerups & Rule Twists','Drawback Chess','Dice Chess','Horror Chess','Other Videos'];
  const CATS=[...CAT_ORDER.filter(c=>VIDEOS.some(v=>v[2]===c)),...new Set(VIDEOS.map(v=>v[2]).filter(c=>!CAT_ORDER.includes(c)))];
  const N=VIDEOS.length,B=countBuilt();
  $('built').textContent=B;$('total').textContent=N;$('builtfill').style.width=(N?B/N*100:0)+'%';
  $('builtbar').setAttribute('aria-valuemax',N);$('builtbar').setAttribute('aria-valuenow',B);
  $('q').placeholder=`Search ${B} videos`;
  const catN=c=>VIDEOS.filter(v=>isBuilt(v)&&v[2]===c).length;
  $('chips').innerHTML=['All',...CATS.filter(c=>catN(c)>0)].map(c=>`<button class="x-chip" type="button" data-cat="${esc(c)}" aria-pressed="${c==='All'}">${esc(c)}<small>${c==='All'?B:catN(c)}</small></button>`).join('');
  IDX=new Map(VIDEOS.map((v,i)=>[v[0],i]));CATS_B=CATS.filter(c=>catN(c)>0);prepStats();
  applySort();renderRows();buildHome()}

let QT=0;$('q').addEventListener('input',()=>{cancelAnimationFrame(QT);QT=requestAnimationFrame(renderRows)});
$('chips').addEventListener('click',e=>{const t=e.target.closest('[data-cat]');if(!t)return;cat=t.dataset.cat;
  document.querySelectorAll('.x-chip').forEach(b=>b.setAttribute('aria-pressed',b===t));renderRows()});
$('list').addEventListener('click',e=>{
  if(e.target.closest('#featshuf'))return nextHero();
  const see=e.target.closest('[data-see]');if(see)return seeAll(HOME.see[+see.dataset.see]);
  const more=e.target.closest('[data-more]');
  if(more){const i=+more.dataset.more,v=VIDEOS[i];
    return openSheet(v[1],`<div class="x-opts"><a class="x-opt" href="${ytURL(v[0])}" target="_blank" rel="noopener" data-close>Watch on YouTube${SVG_EXT}</a><button class="x-opt" type="button" data-play="${i}">Play ${esc(v.md)}${SVG_PLAY}</button></div>`,more)}
  const p=e.target.closest('[data-play]');if(p)return openGame(VIDEOS[+p.dataset.play]);
  const r=e.target.closest('.x-row,.x-card');if(r)openGame(VIDEOS[+r.dataset.i])});
$('sortbtn').addEventListener('click',()=>openSheet('Sort by',`<div class="x-opts" role="radiogroup" aria-label="Sort by">${SORTS.map(([k,l])=>
  `<button class="x-opt" type="button" role="radio" data-sort="${k}" aria-checked="${k===SORT}">${l}${SVG_CHECK}</button>`).join('')}</div>`,$('sortbtn')));
$('sheetbody').addEventListener('click',e=>{
  const s=e.target.closest('[data-sort]');
  if(s){SORT=s.dataset.sort;applySort();renderRows();closeSheet();return}
  const p=e.target.closest('[data-play]');if(p){closeSheet(true);openGame(VIDEOS[+p.dataset.play]);return}
  if(e.target.closest('[data-close]'))closeSheet()});

let lastY=0;
window.addEventListener('scroll',()=>{const y=window.scrollY,t=$('topbar');
  if(document.activeElement===$('q')||y<120){t.classList.remove('is-hide');lastY=y;return}
  if(y>lastY+8){t.classList.add('is-hide');lastY=y}else if(y<lastY-8){t.classList.remove('is-hide');lastY=y}},{passive:true});
    