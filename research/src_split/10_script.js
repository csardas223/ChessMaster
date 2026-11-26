/* modes_extra.js - extra game modes + complete title->mode mapping for Chess Master.
   Load AFTER the page's main inline script:  <script src="modes_extra.js"><\/script>
   Relies on the page's top-level globals (shared classic-script scope): MODES, MODE, ARG, CNT, G, busy, GID,
   VAL, PN, KN, KG, col, up, opp, sqName, kingSq, parse, clone, attacked, gen, make, legal, result, evalS,
   nega, rank, render, tap, openMode, useSF, VIDEOS, renderList, cat, $, IMG.
   Function declarations (gen, make, legal, ...) are wrapped by reassignment; nothing in index.html is edited.

   CSS injected below (as a <style id="x-extra-css"> element):
   .x-blk          absolutely positioned overlay span inside a square, used for blockers
   .x-blk--wall    grey hatched wall (Maze), --yellow (Backrooms wallpaper), --dark (Pocket Dimension)
   .x-blk--gold    gold nugget (Midas), --duck (yellow duck), --block (grass block), --hole (broken square),
   .x-blk--tail    snake tail, --zone (Battle Royale closed zone), --stone (Petrified stone)
   .x-crack        faint crack on a square that will break next time it is left
   .x-portal       glowing ring on a portal square (--b second colour)
   .x-ice          frozen-piece tint, .x-monst monster sprite (scp.png), .x-nk boom.png badge for nukes,
   .x-fy           small text badge naming a fairy piece / moves left, .x-secret gold outline, .x-mark2 hint ring
   .x-clock        clock line under the status, .x-hb hand button block swatch
*/
(function(){
'use strict';
if(typeof MODES==='undefined'||typeof gen!=='function'){console.warn('modes_extra.js: page engine not found');return}

const CSS=`
.x-blk{position:absolute;inset:0;z-index:2;pointer-events:none}
.x-blk--wall{background:repeating-linear-gradient(45deg,#57524d 0 6px,#45413d 6px 12px);box-shadow:inset 0 0 0 2px #2c2926}
.x-blk--yellow{background:repeating-linear-gradient(90deg,#c9b458 0 5px,#b9a24a 5px 10px);box-shadow:inset 0 0 0 2px #7d6c25}
.x-blk--dark{background:radial-gradient(circle,#1a1410 0 45%,#3a2a20 75%);box-shadow:inset 0 0 0 2px #120d0a}
.x-blk--gold{inset:10%;border-radius:8px;background:radial-gradient(circle at 35% 30%,#fff0b0,#d9a520 55%,#8a6508);box-shadow:0 2px 3px rgba(0,0,0,.4)}
.x-blk--duck{inset:20%;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ffe27a,#f2b81c 70%);box-shadow:inset -3px -3px 0 #c58e0c,0 0 0 2px #6b4c00}
.x-blk--block{inset:4%;background:linear-gradient(#6fa63c 0 24%,#8a5f37 24% 100%);box-shadow:inset 0 0 0 2px #3b2716}
.x-blk--hole{background:radial-gradient(circle,#0b0a09 0 52%,#2b2826 68%,transparent 72%)}
.x-blk--tail{inset:14%;border-radius:35%;background:#3f7d2c;box-shadow:inset 0 0 0 2px #1f4415}
.x-blk--zone{background:rgba(160,30,30,.55);box-shadow:inset 0 0 0 2px #5a0c0c}
.x-blk--shy{inset:4%;background:url(scp.png) center/contain no-repeat}
.x-blk--stone{inset:8%;border-radius:10px;background:radial-gradient(circle at 35% 30%,#bdb8b0,#7d7872 60%,#4f4b47);box-shadow:0 2px 3px rgba(0,0,0,.4)}
.x-crack{position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(135deg,transparent 46%,rgba(0,0,0,.45) 48%,transparent 52%),linear-gradient(45deg,transparent 60%,rgba(0,0,0,.35) 62%,transparent 65%)}
.x-portal{position:absolute;inset:8%;border-radius:50%;z-index:0;pointer-events:none;border:4px solid #7b4dff;box-shadow:0 0 10px #7b4dff,inset 0 0 10px #7b4dff}
.x-portal--b{border-color:#ff7a1a;box-shadow:0 0 10px #ff7a1a,inset 0 0 10px #ff7a1a}
.x-ice{position:absolute;inset:0;z-index:2;pointer-events:none;background:rgba(150,210,255,.45);box-shadow:inset 0 0 0 3px #9fd8ff}
.x-monst{position:absolute;inset:4%;z-index:3;pointer-events:none;background:url(scp.png) center/contain no-repeat}
.x-nk{position:absolute;right:0;top:0;width:46%;height:46%;z-index:3;pointer-events:none;background:url(boom.png) center/contain no-repeat}
.x-fy{position:absolute;right:2px;bottom:2px;z-index:3;pointer-events:none;font:700 10px/1.25 -apple-system,"Segoe UI",sans-serif;background:#b5852a;color:#fff;border-radius:3px;padding:0 3px}
.x-secret{position:absolute;inset:0;z-index:2;pointer-events:none;box-shadow:inset 0 0 0 3px #e0b020}
.x-warn{position:absolute;inset:0;z-index:2;pointer-events:none;background:rgba(220,30,30,.35);box-shadow:inset 0 0 0 3px #d01818}
.x-mark2{position:absolute;inset:0;z-index:2;pointer-events:none;box-shadow:inset 0 0 0 3px rgba(255,255,255,.7)}
.x-clock{font:600 13px/1.35 -apple-system,"Segoe UI",sans-serif;text-align:center;margin:4px 0;color:#C3C2C1}
.x-hb{display:inline-block;width:26px;height:26px;background:linear-gradient(#6fa63c 0 24%,#8a5f37 24% 100%);box-shadow:inset 0 0 0 2px #3b2716;vertical-align:middle}
`;
const HAS_DOM=typeof document!=='undefined'&&typeof document.createElement==='function';
if(HAS_DOM&&!document.getElementById('x-extra-css')){const st=document.createElement('style');st.id='x-extra-css';st.textContent=CSS;(document.head||document.body).appendChild(st)}

/* ---------- shared helpers ---------- */
const WALL={'#':'wall','$':'gold','@':'duck','%':'shy'};
const isWall=p=>!!(p&&WALL[p]);
const rnd=n=>Math.floor(Math.random()*n);
const pick=a=>a[rnd(a.length)];
const R_=i=>i>>3,C_=i=>i&7;
const inB=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
const isCap=(s,m)=>!m.drop&&m.f>=0&&(!!s.b[m.t]||!!m.ep);
const pcOf=(s,m)=>m.f>=0?s.b[m.f]:null;
const FAIRY='CAGWLEFMHU';
const FNAME={C:'Knook',A:'Archbishop',G:'Grasshopper',W:'Wildebeest',L:'Knightrider',E:'Elephant',F:'Ferz',M:'Commoner',H:'Fly',U:'Nuke'};
const FTAG={C:'RN',A:'BN',G:'G',W:'W',L:'NN',E:'E',F:'F',M:'M',H:'FLY',U:'NUKE'};
const FIMG={C:'R',A:'B',G:'Q',W:'N',L:'N',E:'B',F:'Q',M:'K',H:'N',U:'Q'};
Object.assign(VAL,{C:850,A:750,G:330,W:520,L:560,E:170,F:180,M:300,H:260,U:1500,'#':0,'$':0,'@':0,'%':0});
Object.assign(PN,{C:'knooks',A:'archbishops',G:'grasshoppers',W:'wildebeests',L:'knightriders',E:'elephants',F:'ferzes',M:'commoners',H:'flies',U:'nukes'});
const F={on:false,walls:false};               // per-game engine switches (set when a mode opens)
function X(s){return s.x||(s.x={ply:0})}
function setFen(s,rows){const t=parse(rows+' w - - 0 1');s.b=t.b;s.cr='';s.ep=-1}
function fixCR(s){const b=s.b;let cr='';
  if(b[60]==='K'){if(b[63]==='R')cr+='K';if(b[56]==='R')cr+='Q'}
  if(b[4]==='k'){if(b[7]==='r')cr+='k';if(b[0]==='r')cr+='q'}s.cr=s.cr?cr.split('').filter(k=>s.cr.includes(k)).join(''):''}
function emptySq(b,rows,cols){const e=[];for(const r of rows)for(const c of (cols||[0,1,2,3,4,5,6,7]))if(!b[r*8+c])e.push(r*8+c);return e}
function countPieces(b,c){let n=0;for(const p of b)if(p&&!isWall(p)&&col(p)===c&&up(p)!=='K')n++;return n}
function placeMany(b,list,squares){let k=0;for(const sq of squares){if(k>=list.length)break;if(!b[sq]){b[sq]=list[k++]}}return k}
const CENTER_OUT=[3,4,2,5,1,6,0,7];
function rowSquares(r){return CENTER_OUT.map(c=>r*8+c)}
function kingsReachable(b){ // flood fill (king steps) over non-wall squares from the white king; must reach the black king
  const a=kingSq(b,'w'),z=kingSq(b,'b');if(a<0||z<0)return true;const seen=new Set([a]),q=[a];
  while(q.length){const i=q.pop();for(const[d,e]of KG){const r=R_(i)+d,c=C_(i)+e;if(!inB(r,c))continue;const j=r*8+c;if(seen.has(j)||isWall(b[j]))continue;seen.add(j);q.push(j)}}
  return seen.has(z)}

/* ---------- fairy pieces ---------- */
const CAMEL=[[3,1],[1,3],[-3,1],[-1,3],[3,-1],[1,-3],[-3,-1],[-1,-3]];
const ALFIL=[[2,2],[2,-2],[-2,2],[-2,-2]];
const FLY=[];for(let d=-2;d<=2;d++)for(let e=-2;e<=2;e++)if(d||e)FLY.push([d,e]);
function fairyTargets(b,i,t,c){const r=R_(i),q=C_(i),out=[];
  const can=j=>{const p=b[j];return !p||(!isWall(p)&&col(p)!==c)};
  const jump=L=>{for(const[d,e]of L){const rr=r+d,cc=q+e;if(inB(rr,cc)&&can(rr*8+cc))out.push(rr*8+cc)}};
  const slide=L=>{for(const[d,e]of L){let rr=r+d,cc=q+e;while(inB(rr,cc)){const j=rr*8+cc;if(b[j]){if(can(j))out.push(j);break}out.push(j);rr+=d;cc+=e}}};
  if(t==='C'){slide(OR);jump(KN)}
  else if(t==='A'){slide(DI);jump(KN)}
  else if(t==='W'){jump(KN);jump(CAMEL)}
  else if(t==='E')jump(ALFIL);
  else if(t==='F')jump(DI);
  else if(t==='M')jump(KG);
  else if(t==='H')jump(FLY);
  else if(t==='U'){slide(KG);for(const[d,e]of KN){let rr=r+d,cc=q+e;while(inB(rr,cc)){const j=rr*8+cc;if(b[j]){if(can(j))out.push(j);break}out.push(j);rr+=d;cc+=e}}}
  else if(t==='L'){for(const[d,e]of KN){let rr=r+d,cc=q+e;while(inB(rr,cc)){const j=rr*8+cc;if(b[j]){if(can(j))out.push(j);break}out.push(j);rr+=d;cc+=e}}}
  else if(t==='G'){for(const[d,e]of KG){let rr=r+d,cc=q+e;while(inB(rr,cc)&&!b[rr*8+cc]){rr+=d;cc+=e}
    if(!inB(rr,cc))continue;rr+=d;cc+=e;if(inB(rr,cc)&&can(rr*8+cc))out.push(rr*8+cc)}}
  return out}
function addFairy(s,mv){const b=s.b,me=s.turn;
  for(let i=0;i<64;i++){const p=b[i];if(!p||isWall(p)||col(p)!==me)continue;const t=up(p);if(!FAIRY.includes(t))continue;
    for(const j of fairyTargets(b,i,t,me))mv.push({f:i,t:j})}}
function fairyAtt(b,sq,by){for(let i=0;i<64;i++){const p=b[i];if(!p||isWall(p)||col(p)!==by)continue;const t=up(p);if(!FAIRY.includes(t))continue;
    if(fairyTargets(b,i,t,by).includes(sq))return true}return false}

/* ---------- cylinder board (files wrap around) ---------- */
function wrapTargets(b,i,t,c){const r=R_(i),q=C_(i),out=[];
  const can=j=>{const p=b[j];return !p||(!isWall(p)&&col(p)!==c)};
  const jump=L=>{for(const[d,e]of L){const rr=r+d,cc=(q+e+8)%8;if(rr>=0&&rr<8&&can(rr*8+cc))out.push(rr*8+cc)}};
  const slide=L=>{for(const[d,e]of L){let rr=r+d,cc=(q+e+8)%8,k=0;while(rr>=0&&rr<8&&k<7){const j=rr*8+cc;if(j===i)break;if(b[j]){if(can(j))out.push(j);break}out.push(j);rr+=d;cc=(cc+e+8)%8;k++}}};
  if(t==='N')jump(KN);else if(t==='K')jump(KG);else if(t==='B')slide(DI);else if(t==='R')slide(OR);else if(t==='Q'||t==='D'){slide(KG);if(t==='D')jump(KN)}
  return [...new Set(out)]}
function attWrap(b,sq,by){for(let i=0;i<64;i++){const p=b[i];if(!p||isWall(p)||col(p)!==by)continue;const t=up(p);
    if(t==='P'){const d=by==='w'?-1:1,rr=R_(i)+d;if(rr===R_(sq)&&(((C_(i)+1)%8)===C_(sq)||((C_(i)+7)%8)===C_(sq)))return true;continue}
    if(wrapTargets(b,i,t,by).includes(sq))return true}return false}
function genWrap(s,mv){const b=s.b,me=s.turn,out=mv.filter(m=>m.drop||up(b[m.f])==='P'&&Math.abs(C_(m.f)-C_(m.t))<=1);
  for(let i=0;i<64;i++){const p=b[i];if(!p||isWall(p)||col(p)!==me)continue;const t=up(p);
    if(t==='P'){const d=me==='w'?-1:1,rr=R_(i)+d,last=me==='w'?0:7;if(rr<0||rr>7)continue;
      for(const cc of[C_(i)===0?7:-1,C_(i)===7?0:-1]){if(cc<0)continue;const j=rr*8+cc,q=b[j];if(q&&!isWall(q)&&col(q)!==me)out.push(rr===last?{f:i,t:j,pr:1}:{f:i,t:j})}continue}
    for(const j of wrapTargets(b,i,t,me))out.push({f:i,t:j})}
  return out}

/* ---------- engine wrappers ---------- */
const _gen=gen,_make=make,_legal=legal,_clone=clone,_evalS=evalS,_att=attacked;
clone=function(s){const n=_clone(s);if(s.x)n.x=Object.assign({},s.x);return n};
gen=function(s){let mv=_gen(s);const M=MODE;
  if(!M.xm&&!F.on)return mv;
  if(M.wrap)mv=genWrap(s,mv);
  if(F.on)addFairy(s,mv);
  if(M.xgen)mv=M.xgen(s,mv)||mv;
  if(F.walls)mv=mv.filter(m=>!isWall(s.b[m.t])&&(m.f<0||!isWall(s.b[m.f])));
  return mv};
make=function(s,m){const n=_make(s,m);const M=MODE;if(!M.xm)return n;
  const x=n.x||(n.x={});x.ply=((s.x&&s.x.ply)||0)+1;x.die=0;x.frz=-1;x.choice=null;
  if(M.xmake)M.xmake(s,m,n);
  if(M.multi){const N=M.multi(),me=s.turn,sub=((s.x&&s.x.sub)||0)+1,ek=kingSq(n.b,opp(me));
    if(sub<(N[me]||1)&&n.turn!==me&&!(ek>=0&&attacked(n.b,ek,me))){n.turn=me;n.ep=-1;x.sub=sub}else x.sub=0}
  return n};
legal=function(s){const M=MODE;let ms;
  if(M.xm&&M.nocheck){ms=gen(s);for(const m of ms)m.n=make(s,m)}else ms=_legal(s);
  if(M.xm&&M.xlegal){const f=M.xlegal(s,ms);if(f&&(f.length||M.strict))ms=f}
  return ms};
evalS=function(s){if(!F.walls)return _evalS(s);const b=s.b;let w=false;for(let i=0;i<64;i++)if(isWall(b[i])){w=true;break}
  if(!w)return _evalS(s);const t=Object.assign({},s,{b:b.map(p=>isWall(p)?null:p)});return _evalS(t)};
attacked=function(b,sq,by){const M=MODE;if(M.wrap)return attWrap(b,sq,by);if(_att(b,sq,by))return true;
  if(F.on&&fairyAtt(b,sq,by))return true;if(M.xatt&&M.xatt(b,sq,by))return true;return false};
/* turn-aware search: a move that keeps the same side to move (double-move modes) is not negated */
nega=function(s,d,a,bt){
  if(d===0){const w=MODE.win&&MODE.win(s);if(w)return w.w==='d'?0:(w.w===s.turn?1e5:-1e5);return(s.turn==='w'?1:-1)*evalS(s)}
  const ms=legal(s),r=result(s,ms);if(r)return r.w==='d'?0:(r.w===s.turn?1e5+d:-1e5-d);
  ms.sort((x,y)=>(s.b[y.t]?1:0)-(s.b[x.t]?1:0));
  let bv=-1e9;for(const m of ms){const v=m.n.turn===s.turn?nega(m.n,d-1,a,bt):-nega(m.n,d-1,-bt,-a);if(v>bv)bv=v;if(v>a)a=v;if(a>=bt)break}return bv};
rank=function(s,ms){const D=MODE.depth||((gen(Object.assign({},s,{turn:'w'})).length>50||s.hand.b.length||s.hand.w.length)?2:3);
  return ms.map(m=>({m,v:(m.n.turn===s.turn?nega(m.n,D-1,-1e9,1e9):-nega(m.n,D-1,-1e9,1e9))+Math.random()*6})).sort((a,b)=>b.v-a.v)};

/* ---------- mode registry + shared per-game layers ---------- */
const MX={};                                   // id -> base mode object
const A=()=>(ARG&&typeof ARG==='object')?ARG:(MODE.def||{});   // current mode config
const C=()=>MODE.cfg||MODE.cfgDef||{};                                       // current per-video layers
function add(id,o){o.id=id;o.xm=1;const st=o.setup,af=o.after;
  o.setup=function(s,g){X(s);s.x.ply=0;g.xprev=s;g.hist=[s];g.xmsg='';if(st)st.call(this,s,g);
    F.on=!!MODE.fairy||s.b.some(p=>p&&FAIRY.includes(up(p)));F.walls=!!MODE.walls||s.b.some(isWall);
    layerSetup(s,g,C());if(MODE.onTurn)MODE.onTurn(g,s);g.hist=[s];
    if(s.turn==='b'){const gg=g;setTimeout(()=>{if(G===gg&&!gg.over&&G.s.turn==='b'&&!busy){busy=true;render();botMove(GID)}},450)}};
  o.after=function(g,m){const prev=g.xprev;g.xmsg='';if(af)af(g,m,prev);if(!g.over)layerAfter(g,m,prev,C());
    if(!g.over&&MODE.onTurn)MODE.onTurn(g,g.s);
    if(g.s.turn==='w'&&g.hist)g.hist.push(g.s);
    g.xprev=g.s};
  MODES.push(o);MX[id]=o;return o}

/* strength: 0 = random mover, 1 = always the engine's first choice */
const eloSt=e=>Math.max(0,Math.min(1,(e-250)/3350));
function pickSt(L,st){if(L.length<2)return L[0];if(Math.random()<st*st)return L[0];
  const k=Math.max(2,Math.ceil(L.length*(1-st)));return L[rnd(Math.min(k,L.length))]}
/* how good was White's move m (made from state prev)? 1-ply look-ahead with the bot's reply */
function quality(prev,m){if(!prev)return{pct:0,best:true,worst:false,loss:0};const ms=_legal(prev);if(ms.length<2)return{pct:0,best:true,worst:false,loss:0};
  const sc=ms.map(x=>({x,v:-nega(x.n,1,-1e9,1e9)})).sort((a,b)=>b.v-a.v);
  const i=sc.findIndex(o=>o.x.f===m.f&&o.x.t===m.t&&o.x.drop===m.drop);const v=i<0?sc[sc.length-1].v:sc[i].v;
  return{pct:i<0?1:i/(sc.length-1),best:v>=sc[0].v-5,worst:v<=sc[sc.length-1].v+5,loss:sc[0].v-v}}
const isMate=(s)=>{const ms=legal(s);if(ms.length)return false;const k=kingSq(s.b,s.turn);return k>=0&&attacked(s.b,k,opp(s.turn))};
const fmtT=ms=>{ms=Math.max(0,ms);const t=Math.ceil(ms/1000);return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};

/* layers every per-video mode can carry in cfg: who/elo/style (bot persona), clock, rewind, speed (move limit), hearts */
function layerSetup(s,g,cfg){
  if(cfg.clock){g.clk={left:cfg.clock.total*1000,start:Date.now()}}
  if(cfg.rewind)g.rew=cfg.rewind;
  if(cfg.hearts)g.hearts=cfg.hearts;
  if(cfg.gauntlet){const k=g.gk=cfg.gauntlet.key;if(!(k in GL))GL[k]=0}
  g.pmoves=0}
function layerAfter(g,m,prev,cfg){
  const wMoved=prev?prev.turn==='w':g.s.turn==='b';
  if(wMoved){ /* White just moved */
    g.pmoves++;
    if(g.clk){const used=Date.now()-g.clk.start;g.clk.left-=used;
      if(g.clk.left<=0&&!g.over){g.over={w:'b',why:'you ran out of time'};return}
      if(cfg.clock.halve)g.clk.left=Math.max(500,g.clk.left/2);g.clk.left+=(cfg.clock.inc||0)*1000}
    if(g.hearts&&prev){const q=quality(prev,m);if(q.loss>=150){g.hearts--;g.xmsg=g.hearts>0?'Ouch, that move lost a heart.':'';
      if(g.hearts<=0&&!g.over)g.over={w:'b',why:'you lost all your hearts'}}}
    if(cfg.speed&&g.pmoves>=cfg.speed&&!g.over){const ms=legal(g.s);const r=result(g.s,ms);
      if(!(r&&r.w==='w'))g.over={w:'b',why:'you did not win within '+cfg.speed+' moves'}}
    if(g.clk&&g.s.turn==='w')g.clk.start=Date.now();
    if(cfg.who&&cfg.taunts&&Math.random()<.5)g.xmsg=cfg.who+': "'+pick(cfg.taunts)+'"';
  } else if(g.clk&&g.s.turn==='w')g.clk.start=Date.now()}
const GL={};          // gauntlet progress per video key
function gauntletElo(cfg,g){const L=cfg.gauntlet.levels;return L[Math.min(GL[cfg.gauntlet.key]||0,L.length-1)]}
function botElo(){const c=C();if(c.gauntlet&&G)return gauntletElo(c,G);return c.elo}
/* persona policy: strength from Elo plus an optional style */
function personaPick(L,s){const c=C(),e=botElo(),st=e==null?1:eloSt(e),sty=c.style;
  let P=L;
  if(sty==='worst'){const nm=P.filter(x=>!(MODE.id==='selfmate'&&isMate(x.m.n)));return (nm.length?nm:P)[(nm.length?nm:P).length-1]}
  if(sty==='drawfish')return P.reduce((a,b)=>Math.abs(b.v)<Math.abs(a.v)?b:a);
  if(sty==='nof6'){P=L.filter(x=>!(x.m.f>=0&&s.b[x.m.f]==='p'&&C_(x.m.f)===5));if(!P.length)P=L}
  if(sty==='aggro'){const a=P.filter(x=>isCap(s,x.m)||(()=>{const k=kingSq(x.m.n.b,'w');return k>=0&&attacked(x.m.n.b,k,'b')})());if(a.length&&Math.random()<.7)return a[0]}
  if(sty==='cheater'){const v=P[0].v;return v< -150?P[0]:pickSt(P,.3)}
  if(sty==='geeked'){G.gk2=(G.gk2||0)+1;return G.gk2%2?P[rnd(P.length)]:P[0]}
  if(sty==='mix')return Math.random()<(c.p||.5)?P[0]:P[rnd(P.length)];
  if(sty==='chatgpt')return Math.random()<.3?P[rnd(P.length)]:pickSt(P,.45);
  if(sty==='trap'){const t=P.slice(0,6).filter(x=>isCap(s,x.m)===false&&x.v>P[0].v-120);if(t.length&&Math.random()<.5)return pick(t)}
  return pickSt(P,st)}

/* =================== BOARD / BLOCKER MODES =================== */
function mazeWalls(s,a){const b=s.b;const lay=a.layout||'random';
  const put=L=>{for(const j of L)if(!b[j])b[j]='#'};
  if(lay==='pass')put([24,25,26,29,30,31,32,33,34,37,38,39]);
  else if(lay==='cross')put([18,21,42,45,24,31,32,39]);
  else if(lay==='cloister')put([18,19,20,21,42,43,44,45,26,29,34,37].filter((_,k)=>k!==1&&k!==6));
  else if(lay==='crates'){for(let t=0;t<200;t++){const E=emptySq(b,[2,3,4,5]);const j=pick(E);b[j]='#';if(!kingsReachable(b)||E.length<26)b[j]=null;if(b.filter(p=>p==='#').length>=(a.n||6))break}}
  else{const n=a.n||10;for(let t=0;t<40;t++){const keep=b.slice();let k=0;
      while(k<n){const j=pick(emptySq(b,[2,3,4,5]));const r=R_(j);if(b.slice(r*8,r*8+8).filter(p=>p==='#').length>=3)continue;b[j]='#';k++}
      if(kingsReachable(b))break;for(let i=0;i<64;i++)b[i]=keep[i]}}}
add('maze',{name:'Maze',def:{layout:'random',style:'wall',n:10},walls:1,
  rule:'Wall squares block the board. No piece can land on a wall or slide through it.',
  label:a=>a.layout==='pass'?'Narrow Pass':a.layout==='cross'?'Blocked Intersection':a.layout==='cloister'?'Cloister Walls':a.layout==='crates'?'Crate Yard':a.style==='yellow'?'Backrooms Maze':'Maze',
  ruleFor:a=>({pass:'A wall of stone fills ranks 4 and 5. Only the d- and e-files are open, so every attack has to squeeze through the narrow pass.',
    cross:'Eight wall squares box in the centre crossroads. Pieces cannot land on or slide through walls.',
    cloister:'Walls ring the centre like a cloister, with two gaps. Pieces cannot land on or slide through walls.',
    crates:'Crates are scattered across the middle of the board. Nothing can enter a crate square or slide through it.'}[a.layout]||
    (a.style==='yellow'?'You noclipped into the Backrooms. Yellow wall squares fill the middle of the board and nothing can enter or pass through them. The layout changes every game.':
    'Random wall squares fill the middle of the board. Nothing can enter a wall or slide through it. The layout changes every game.')),
  wallStyle:()=>A().style||'wall',
  setup:(s)=>mazeWalls(s,A())});

add('duck',{name:'Duck Chess',walls:1,depth:2,
  rule:'After every move a rubber duck is dropped on the square that blocks the most of the opponent\'s moves. Nothing can land on or pass through the duck.',
  after:g=>{const s=g.s,x=s.x;if(x.duck>=0&&s.b[x.duck]==='@')s.b[x.duck]=null;
    const opp_=gen(s),cnt={};for(const m of opp_)cnt[m.t]=(cnt[m.t]||0)+1;
    const E=emptySq(s.b,[1,2,3,4,5,6]).filter(j=>j!==x.duck);let bj=-1,bv=-1;
    for(const j of E){const v=(cnt[j]||0)+Math.random();if(v>bv){bv=v;bj=j}}
    if(bj>=0){s.b[bj]='@';x.duck=bj}},
  setup:s=>{s.x.duck=-1}});

add('blocks',{name:'Minecraft Blocks',walls:1,depth:2,def:{n:4},
  rule:'Instead of moving, you may place a block on any empty square in the middle four ranks. Tap the block in your hand, then a square. Blocks stop every piece. Each side has 4 blocks.',
  ruleFor:a=>`Instead of moving, you may place a block on any empty square in the middle four ranks (tap the block under the board, then a square). Blocks stop every piece. Each side has ${a.n||4} blocks.`,
  setup:s=>{const n=A().n||4;s.x.bw=n;s.x.bb=n},
  xgen:(s,mv)=>{const left=s.turn==='w'?s.x.bw:s.x.bb;if(left>0)for(const j of emptySq(s.b,[2,3,4,5]))mv.push({f:-1,t:j,drop:'#'});return mv},
  xmake:(s,m,n)=>{if(m.drop==='#'){if(s.turn==='w')n.x.bw--;else n.x.bb--}},
  wallStyle:()=>'block',status:g=>`Blocks: you ${g.s.x.bw}, bot ${g.s.x.bb}`});

add('breaking',{name:'Breaking Squares',walls:1,
  rule:'Middle squares crack when a piece leaves them. The second time a piece leaves a cracked square it breaks into a hole that nothing can enter.',
  setup:s=>{s.x.crk=''},
  xmake:(s,m,n)=>{if(m.f<0)return;const r=R_(m.f);if(r<2||r>5)return;const k=','+m.f+',';
    if(n.x.crk.includes(k)){n.x.crk=n.x.crk.replace(k,',');if(!n.b[m.f])n.b[m.f]='#'}else n.x.crk+=k},
  wallStyle:()=>'hole'});

add('royale',{name:'Battle Royale',walls:1,
  rule:'The storm closes in. After move 10 the outer ring of the board is wiped out, and after move 20 the next ring. Anything caught there is destroyed (kings are pushed inward).',
  status:g=>{const p=g.s.x.ply;return p<20?`Storm closes in ${Math.ceil((20-p)/2)} moves`:p<40?`Next storm in ${Math.ceil((40-p)/2)} moves`:'Final circle'},
  after:g=>{const s=g.s,p=s.x.ply;if(p!==20&&p!==40)return;const ring=p===20?0:1;
    const inRing=i=>{const r=R_(i),c=C_(i);return Math.min(r,c,7-r,7-c)===ring};
    for(let i=0;i<64;i++){if(!inRing(i))continue;const q=s.b[i];
      if(q&&up(q)==='K'&&!isWall(q)){const E=[];for(let j=0;j<64;j++){const r=R_(j),c=C_(j);if(Math.min(r,c,7-r,7-c)>ring&&!s.b[j])E.push(j)}
        E.sort((a,b)=>Math.max(Math.abs(R_(a)-R_(i)),Math.abs(C_(a)-C_(i)))-Math.max(Math.abs(R_(b)-R_(i)),Math.abs(C_(b)-C_(i))));
        if(E.length)s.b[E[0]]=q}
      s.b[i]='#'}
    s.cr='';s.ep=-1;g.msg='The storm swallowed ring '+(ring+1)+'.';
    if(kingSq(s.b,'w')<0)g.over={w:'b',why:'the storm got your king'};else if(kingSq(s.b,'b')<0)g.over={w:'w',why:'the storm got the bot king'}},
  wallStyle:()=>'zone'});

add('mini',{name:'Mini Board',walls:1,def:{v:'6x6'},
  label:a=>a.v==='mini6'?'Mini Chess 6x6 (drops)':a.v==='1d'?'1D Chess':a.v==='5x5'?'Tiny Chess 5x5':a.v==='minihouse'?'Minihouse':'Mini Chess 6x6',
  ruleFor:a=>a.v==='mini6'?'A 6x6 board with rook, knight, bishop, queen, king, rook and six pawns each. Captured pieces join your reserve and can be dropped back on the board as a move. Pawns promote on the far rank.':a.v==='1d'?'The whole game is one row of eight squares: king, rook and a hopping fly on each side. Rooks slide along the row, flies jump up to two squares. Checkmate as usual.':
    a.v==='5x5'?'A 5x5 board: king, queen, rook, bishop, knight and five pawns each. Pawns move one square and promote on the last row.':
    a.v==='minihouse'?'A 6x6 board where captured pieces join your hand and can be dropped back in, like Crazyhouse.':
    'A 6x6 board (Los Alamos chess): no bishops, pawns move one square and promote on the last row, no castling.',
  rule:'A smaller board: walls cut it down to 6x6. Pawns move one square and promote on the last row.',
  setup:s=>{const v=A().v||'6x6';const b=s.b;for(let i=0;i<64;i++)b[i]='#';s.cr='';
    const putRow=(r,c0,str)=>{for(let k=0;k<str.length;k++)b[r*8+c0+k]=str[k]===' '?null:str[k]};
    if(v==='1d'){putRow(3,0,'KRH  hrk');s.x.prw=-1;s.x.prb=-1}
    else if(v==='5x5'){putRow(2,1,'rnbqk');putRow(3,1,'ppppp');putRow(4,1,'     ');putRow(5,1,'PPPPP');putRow(6,1,'RNBQK');s.x.prw=2;s.x.prb=6}
    else if(v==='mini6'){putRow(2,1,'rnbqkr');putRow(3,1,'pppppp');putRow(4,1,'      ');putRow(5,1,'      ');putRow(6,1,'PPPPPP');putRow(7,1,'RNBQKR');s.x.prw=2;s.x.prb=7}
    else{putRow(2,1,'rnqknr');putRow(3,1,'pppppp');putRow(4,1,'      ');putRow(5,1,'      ');putRow(6,1,'PPPPPP');putRow(7,1,'RNQKNR');s.x.prw=2;s.x.prb=7}},
  get hand(){return (ARG&&(ARG.v==='minihouse'||ARG.v==='mini6'))?1:0},
  xgen:(s,mv)=>mv.filter(m=>!m.dbl&&!(m.drop&&isWall(s.b[m.t]))),
  xmake:(s,m,n)=>{const p=n.b[m.t];if(!p||up(p)!=='P')return;const r=R_(m.t);if(col(p)==='w'&&r===s.x.prw)n.b[m.t]='Q';if(col(p)==='b'&&r===s.x.prb)n.b[m.t]='q'}});

add('wrap',{name:'Cylinder Chess',depth:2,
  rule:'The board wraps around: the a-file and h-file are neighbours, so pieces can slide off one side and come back on the other. No castling.',
  label:a=>a.lbl||'Cylinder Chess',
  ruleFor:a=>(a.lbl?a.lbl+': ':'')+'the board has no left or right edge. The a- and h-files touch, so pieces slide off one side and reappear on the other. No castling.',
  wrap:1,setup:s=>{s.cr=''}});

add('portals',{name:'Portals',
  rule:'Two portal squares are linked. A piece that ends its move on one portal steps out of the other (if it is empty).',
  setup:s=>{const a=pick([16+rnd(8),24+rnd(8)]),c=pick([32+rnd(8),40+rnd(8)]);s.x.por=[a,c]},
  xmake:(s,m,n)=>{const P=s.x.por;const k=P.indexOf(m.t);if(k<0)return;const o=P[1-k];if(n.b[o]||!n.b[m.t])return;n.b[o]=n.b[m.t];n.b[m.t]=null;n.ep=-1}});

add('magnets',{name:'Magnets',
  rule:'Every piece is a magnet. After a move, enemy pieces two squares away in a straight line are pulled one square toward the piece that moved (kings are too heavy).',
  xmake:(s,m,n)=>{const b=n.b,t=m.t,me=s.turn,r=R_(t),c=C_(t);if(!b[t]||isWall(b[t]))return;
    for(const[d,e]of KG){const r1=r+d,c1=c+e,r2=r+2*d,c2=c+2*e;if(!inB(r2,c2))continue;const j1=r1*8+c1,j2=r2*8+c2,p=b[j2];
      if(!b[j1]&&p&&!isWall(p)&&col(p)!==me&&up(p)!=='K'){if(up(p)==='P'&&(r1===0||r1===7))continue;b[j1]=p;b[j2]=null}}
    if(n.cr)fixCR(n)}});

add('midas',{name:'Midas Touch',walls:1,
  rule:'Whatever captures turns to gold. A piece (not a king) that makes a capture becomes a solid gold block on that square.',
  xmake:(s,m,n)=>{if(!isCap(s,m))return;const p=n.b[m.t];if(p&&up(p)!=='K')n.b[m.t]='$'},wallStyle:()=>'gold'});

add('reproduce',{name:'Pawns Reproduce',def:{max:14},
  rule:'When one of your pawns steps forward next to another of your pawns, a baby pawn is born on the square it left (up to 14 pawns).',
  xmake:(s,m,n)=>{if(s.turn!=='w'||m.f<0||s.b[m.f]!=='P'||isCap(s,m))return;const b=n.b,c=C_(m.t);
    if(!((c>0&&b[m.t-1]==='P')||(c<7&&b[m.t+1]==='P')))return;if(b.filter(p=>p==='P').length>=(A().max||14))return;b[m.f]='P'}});

add('breed',{name:'Knights Can MATE',
  rule:'When two of your knights stand side by side after a knight move, they have a baby knight on a free square next to them (up to 6 knights).',
  xmake:(s,m,n)=>{if(s.turn!=='w'||m.f<0||s.b[m.f]!=='N')return;const b=n.b,r=R_(m.t),c=C_(m.t);
    if(!KG.some(([d,e])=>inB(r+d,c+e)&&b[(r+d)*8+c+e]==='N'))return;if(b.filter(p=>p==='N').length>=6)return;
    const E=[];for(const[d,e]of KG){const rr=r+d,cc=c+e;if(inB(rr,cc)&&!b[rr*8+cc])E.push(rr*8+cc)}if(E.length)b[pick(E)]='N'}});

add('trojan',{name:'Trojan Knights',
  rule:'Your knights are Trojan horses. When the bot captures one, two of your pawns jump out onto free squares next to it.',
  xmake:(s,m,n)=>{if(s.turn!=='b'||s.b[m.t]!=='N')return;const b=n.b,r=R_(m.t),c=C_(m.t);let k=0;
    for(const[d,e]of KG){const rr=r+d,cc=c+e;if(k<2&&inB(rr,cc)&&rr>=2&&rr<=6&&!b[rr*8+cc]){b[rr*8+cc]='P';k++}}}});

add('secretq',{name:'Secret Queen',
  rule:'One of your pawns (outlined in gold) is secretly a queen. It can move like a pawn or like a queen. The first time it moves like a queen it is revealed.',
  setup:s=>{s.x.sq=48+rnd(8)},
  win:s=>kingSq(s.b,'b')<0?{w:'w',why:'your secret queen captured the king'}:null,
  xgen:(s,mv)=>{const q=s.x.sq;if(s.turn!=='w'||q<0||s.b[q]!=='P')return mv;const b=s.b,r=R_(q),c=C_(q);
    for(const[d,e]of KG){let rr=r+d,cc=c+e;while(inB(rr,cc)){const j=rr*8+cc;if(b[j]){if(!isWall(b[j])&&col(b[j])==='b')mv.push({f:q,t:j,sec:1});break}
      if(!mv.some(o=>o.f===q&&o.t===j))mv.push({f:q,t:j,sec:1});rr+=d;cc+=e}}return mv},
  xmake:(s,m,n)=>{const q=s.x.sq;if(q<0)return;
    if(m.f===q){if(m.sec||m.pr){n.b[m.t]='Q';n.x.sq=-1}else n.x.sq=m.t;return}
    if(s.turn==='b'&&(m.t===q||(m.ep&&m.t-8===q)))n.x.sq=-1}});

add('sideways',{name:'Sideways Pawns',
  rule:'Pawns may also step one square sideways onto an empty square.',
  xgen:(s,mv)=>{const b=s.b,me=s.turn,P=me==='w'?'P':'p';for(let i=0;i<64;i++){if(b[i]!==P)continue;const c=C_(i);
    if(c>0&&!b[i-1])mv.push({f:i,t:i-1});if(c<7&&!b[i+1])mv.push({f:i,t:i+1})}return mv}});

add('torpedo',{name:'Torpedo Pawns',
  rule:'Pawns may move two squares forward from any rank, not just their first move (en passant still applies).',
  xgen:(s,mv)=>{const b=s.b,me=s.turn,W=me==='w',P=W?'P':'p',d=W?-1:1,last=W?0:7;for(let i=0;i<64;i++){if(b[i]!==P)continue;const r=R_(i),c=C_(i);
    if(r===(W?6:1))continue;const r1=r+d,r2=r+2*d;if(r2<0||r2>7)continue;if(!b[r1*8+c]&&!b[r2*8+c])mv.push(r2===last?{f:i,t:r2*8+c,pr:1}:{f:i,t:r2*8+c,dbl:1})}return mv}});

add('launch',{name:'Launch Pawns',
  rule:'Your pawns can be launched: a pawn may leap 2 or 3 squares straight ahead over anything in the way, landing on an empty square.',
  xgen:(s,mv)=>{if(s.turn!=='w')return mv;const b=s.b;for(let i=0;i<64;i++){if(b[i]!=='P')continue;const r=R_(i),c=C_(i);
    for(const k of[2,3]){const rr=r-k;if(rr<0)continue;const j=rr*8+c;if(b[j])continue;if(k===2&&!b[(r-1)*8+c]&&r===6)continue;mv.push(rr===0?{f:i,t:j,pr:1}:{f:i,t:j})}}return mv}});

add('captureany',{name:'Capture Anything',
  rule:'You may capture your own pieces too (never a king). Sometimes clearing a line is worth a piece.',
  xgen:(s,mv)=>{const b=s.b,me=s.turn;const own=j=>b[j]&&!isWall(b[j])&&col(b[j])===me&&up(b[j])!=='K';
    for(let i=0;i<64;i++){const p=b[i];if(!p||isWall(p)||col(p)!==me)continue;const t=up(p),r=R_(i),c=C_(i);
      if(t==='P'){const d=me==='w'?-1:1;for(const e of[-1,1])if(inB(r+d,c+e)&&own((r+d)*8+c+e))mv.push({f:i,t:(r+d)*8+c+e,pr:(r+d===0||r+d===7)?1:undefined});continue}
      if('NK'.includes(t))for(const[d,e]of t==='N'?KN:KG){if(inB(r+d,c+e)&&own((r+d)*8+c+e))mv.push({f:i,t:(r+d)*8+c+e})}
      const dirs=t==='B'?DI:t==='R'?OR:t==='Q'?KG:null;
      if(dirs)for(const[d,e]of dirs){let rr=r+d,cc=c+e;while(inB(rr,cc)){const j=rr*8+cc;if(b[j]){if(own(j))mv.push({f:i,t:j});break}rr+=d;cc+=e}}}
    return mv}});

add('nocap',{name:'No Captures Yet',def:{until:10,side:'both'},
  label:a=>a.side==='w'?'You Can\'t Capture':a.until>=99?'Zero Damage':'No Captures Until Move '+a.until,
  ruleFor:a=>a.side==='w'?`You cannot capture anything for the first ${a.until} moves. The bot can.`:a.until>=99?'Your pieces deal 0% damage: you can never capture. Win by checkmate (or stalemate the bot into a draw).':`Nobody may capture until move ${a.until}. Plan your attack, then strike.`,
  rule:'Nobody may capture for the first 10 moves.',
  xlegal:(s,ms)=>{const a=A();if(a.side==='w'&&s.turn!=='w')return ms;if(s.x.ply>=(a.until||10)*2&&a.until<99)return ms;return ms.filter(m=>!isCap(s,m))}});

add('fivemoves',{name:'Five Moves Each',def:{n:5},
  rule:'Every piece except the king may move only 5 times. The badge shows how many moves it has left.',
  setup:s=>{s.x.mc={}},
  xmake:(s,m,n)=>{if(m.f<0)return;const mc=Object.assign({},s.x.mc);const k=(mc[m.f]||0)+1;delete mc[m.f];mc[m.t]=k;
    if(m.cs!=null){mc[m.cd]=mc[m.cs]||0;delete mc[m.cs]}n.x.mc=mc},
  xlegal:(s,ms)=>{const n=A().n||5;return ms.filter(m=>m.f<0||up(s.b[m.f])==='K'||(s.x.mc[m.f]||0)<n)},strict:1,
  badge:(s,i)=>{const p=s.b[i];if(!p||isWall(p)||up(p)==='K')return'';return String((A().n||5)-(s.x.mc[i]||0))}});

add('offside',{name:'Offside Rule',
  rule:'Offside: your pieces (not pawns or king) may not move to a rank behind the bot\'s second-last line of pieces unless they capture.',
  xlegal:(s,ms)=>{if(s.turn!=='w')return ms;const rows=[];for(let i=0;i<64;i++){const p=s.b[i];if(p&&!isWall(p)&&col(p)==='b')rows.push(R_(i))}
    rows.sort((a,b)=>a-b);const lim=rows.length>1?rows[1]:0;return ms.filter(m=>m.f<0||'PK'.includes(up(s.b[m.f]))||isCap(s,m)||R_(m.t)>=lim)}});

add('shapeshift',{name:'Shapeshifters',def:{lone:false},
  rule:'After a piece moves it transforms into the next shape: knight, bishop, rook, queen, then back to knight. Kings and pawns stay as they are.',
  label:a=>a.lone?'1 Transforming Piece':'Shapeshifters',
  ruleFor:a=>(a.lone?'You have only your king, your pawns and one transforming piece. ':'')+'After a piece moves it transforms: knight to bishop to rook to queen, then back to knight. Kings and pawns never change.',
  setup:s=>{if(A().lone){for(const i of[56,57,58,59,61,62,63])s.b[i]=null;s.b[57]='N';s.cr=''}},
  xmake:(s,m,n)=>{if(m.f<0)return;const p=n.b[m.t];if(!p||isWall(p))return;const t=up(p);const nx={N:'B',B:'R',R:'Q',Q:'N'}[t];if(!nx||m.pr)return;
    n.b[m.t]=col(p)==='w'?nx:nx.toLowerCase()}});

add('anarchy',{name:'Anarchy Chess',
  rule:'En passant is forced: if an en passant capture is available it must be played. Holy hell.',
  xlegal:(s,ms)=>{const e=ms.filter(m=>m.ep);return e.length?e:ms}});

add('craft',{name:'Infinite Craft',
  rule:'Move a piece onto one of your own pieces to craft them together: knight + bishop = archbishop, knight + rook = knook, bishop + rook = queen, queen + knight = dragon, pawn + pawn = commoner.',
  xgen:(s,mv)=>{const b=s.b,me=s.turn;const rec=(a,c)=>RECIPE[[a,c].sort().join('')];
    for(let i=0;i<64;i++){const p=b[i];if(!p||isWall(p)||col(p)!==me)continue;const t=up(p);if(!'NBRQP'.includes(t))continue;
      const tmp=b.slice();const reach=[];
      // reuse normal movement: pretend all own pieces are enemies to find reachable own squares
      for(let j=0;j<64;j++){const q=b[j];if(j!==i&&q&&!isWall(q)&&col(q)===me&&up(q)!=='K')tmp[j]=me==='w'?q.toLowerCase():q.toUpperCase()}
      const fake=_gen(Object.assign({},s,{b:tmp,turn:me,cr:''}));
      for(const m of fake)if(m.f===i&&b[m.t]&&col(b[m.t])===me&&up(b[m.t])!=='K'&&rec(t,up(b[m.t])))reach.push(m.t);
      for(const j of reach)mv.push({f:i,t:j,craft:rec(t,up(b[j]))})}
    return mv},
  xmake:(s,m,n)=>{if(m.craft)n.b[m.t]=s.turn==='w'?m.craft:m.craft.toLowerCase()}});
const RECIPE={BN:'A',NR:'C',BR:'Q',NQ:'D',PP:'M'};

/* =================== TURN RULES =================== */
const DTYPE='PNBRQK',DNAME={P:'pawn',N:'knight',B:'bishop',R:'rook',Q:'queen',K:'king'};
add('dice',{name:'Dice Chess',def:{n:1},depth:2,
  label:a=>a.n>1?'Dice Chess (two dice)':a.botFree?'Dice Chess (only you roll)':'Dice Chess',
  ruleFor:a=>(a.n>1?'Two dice are rolled each turn; you may move either piece type they show.':'A die is rolled each turn and picks which piece type must move: 1 pawn, 2 knight, 3 bishop, 4 rook, 5 queen, 6 king. Faces with no legal move are rerolled.')+(a.botFree?' The bot does not roll.':' The bot rolls too.'),
  rule:'A die picks which piece type must move each turn.',
  onTurn:(g,s)=>{const a=A();if(a.botFree&&s.turn==='b')return;const ms=legal(s);const have=new Set(ms.map(m=>m.drop?'':up(s.b[m.f])));
    let roll='';for(let t=0;t<30;t++){roll='';for(let k=0;k<(a.n||1);k++)roll+=DTYPE[rnd(6)];if([...roll].some(c=>have.has(c)))break}
    if(![...roll].some(c=>have.has(c)))roll=pick([...have].filter(Boolean));s.x.die=roll},
  xlegal:(s,ms)=>s.x.die?ms.filter(m=>!m.drop&&s.x.die.includes(up(s.b[m.f]))):ms,
  status:g=>g.s.x.die&&g.s.turn==='w'?'You rolled: '+[...g.s.x.die].map(c=>(DTYPE.indexOf(c)+1)+' ('+DNAME[c]+')').join(' and '):''});

const DRAWBACKS=[
  ['Your pawns cannot capture',(s,m)=>up(s.b[m.f])==='P'&&isCap(s,m)],
  ['Your knights cannot move backward',(s,m)=>up(s.b[m.f])==='N'&&(col(s.b[m.f])==='w'?R_(m.t)>R_(m.f):R_(m.t)<R_(m.f))],
  ['You cannot move onto the a- or h-file',(s,m)=>C_(m.t)===0||C_(m.t)===7],
  ['Your king cannot capture',(s,m)=>up(s.b[m.f])==='K'&&isCap(s,m)],
  ['Your queen cannot capture',(s,m)=>up(s.b[m.f])==='Q'&&isCap(s,m)],
  ['Your bishops cannot move more than 2 squares',(s,m)=>up(s.b[m.f])==='B'&&Math.abs(R_(m.t)-R_(m.f))>2],
  ['You cannot capture on light squares',(s,m)=>isCap(s,m)&&(R_(m.t)+C_(m.t))%2===0],
  ['Your rooks cannot move sideways',(s,m)=>up(s.b[m.f])==='R'&&R_(m.t)===R_(m.f)],
  ['You cannot castle',(s,m)=>m.cs!=null],
  ['Your pieces cannot retreat',(s,m)=>!'PK'.includes(up(s.b[m.f]))&&(col(s.b[m.f])==='w'?R_(m.t)>R_(m.f):R_(m.t)<R_(m.f))],
  ['You cannot move the same piece twice in a row',(s,m)=>m.f===(s.turn==='w'?s.x.lw:s.x.lb)],
  ['Your pawns cannot move two squares',(s,m)=>!!m.dbl],
  ['You cannot capture with a knight',(s,m)=>up(s.b[m.f])==='N'&&isCap(s,m)],
  ['Your queen cannot move more than 3 squares',(s,m)=>up(s.b[m.f])==='Q'&&Math.max(Math.abs(R_(m.t)-R_(m.f)),Math.abs(C_(m.t)-C_(m.f)))>3]];
add('drawback',{name:'Drawback Chess',def:{show:false,hard:0,seed:0},
  label:a=>'Drawback Chess'+(a.tag?' · '+a.tag:''),
  ruleFor:a=>`Each side secretly has a drawback that forbids certain moves.${a.hard?' Hard mode: you carry two drawbacks.':''} ${a.show?'You can see yours: '+a.mine.map(k=>DRAWBACKS[k][0].toLowerCase()).join(', and ')+'.':'Yours is hidden. If a move does nothing, it broke your drawback.'}${a.botShown?' The bot\'s drawback: '+DRAWBACKS[a.bot][0].toLowerCase()+'.':' The bot\'s drawback is revealed when the game ends.'}`,
  rule:'Each side secretly has a drawback that forbids certain moves. Yours is hidden; both are revealed at the end.',
  setup:s=>{const a=A();s.x.dw=a.mine||[rnd(DRAWBACKS.length)];s.x.db=a.bot!=null?a.bot:rnd(DRAWBACKS.length);s.x.lw=-1;s.x.lb=-1},
  xmake:(s,m,n)=>{if(s.turn==='w')n.x.lw=m.t;else n.x.lb=m.t},
  xlegal:(s,ms)=>{const L=s.turn==='w'?s.x.dw:[s.x.db];return ms.filter(m=>m.drop||!L.some(k=>DRAWBACKS[k][1](s,m)))},
  status:g=>A().show?'Your drawback: '+g.s.x.dw.map(k=>DRAWBACKS[k][0]).join(' + '):'Your drawback is hidden',
  overText:g=>'Your drawback was: '+g.s.x.dw.map(k=>DRAWBACKS[k][0]).join(' + ')+'. Bot\'s: '+DRAWBACKS[g.s.x.db][0]+'.'});

add('petrified',{name:'Petrified',def:{who:'both',only:''},
  label:a=>a.lbl||(a.only==='P'?'Petrified Pawns':'Petrified'),
  ruleFor:a=>(a.lbl?a.lbl+'. ':'')+`Each turn one random ${a.only==='P'?'pawn':'piece'} of ${a.who==='w'?'yours':'the side to move'} is turned to stone (shown frozen) and cannot move that turn.`,
  rule:'Each turn one random piece of the side to move is frozen and cannot move.',
  onTurn:(g,s)=>{const a=A();if(a.who==='w'&&s.turn!=='w')return;const ms=legal(s);const by={};for(const m of ms)if(m.f>=0)(by[m.f]=by[m.f]||0,by[m.f]++);
    const cand=Object.keys(by).map(Number).filter(i=>up(s.b[i])!=='K'&&(!a.only||up(s.b[i])===a.only)&&by[i]<ms.length);if(cand.length)s.x.frz=pick(cand)},
  xlegal:(s,ms)=>s.x.frz>=0?ms.filter(m=>m.f!==s.x.frz):ms});

add('choice',{name:'Choice Chess',def:{k:3},
  label:a=>a.lbl||'Choice Chess',
  ruleFor:a=>(a.lbl?a.lbl+': ':'')+`each turn you are offered only ${a.k||3} random legal moves (marked on the board). Pick the best of them.`,
  rule:'Each turn you may only choose from 3 random legal moves.',
  onTurn:(g,s)=>{if(s.turn!=='w')return;const ms=legal(s);const k=A().k||3;const sh=ms.slice().sort(()=>Math.random()-.5).slice(0,k);s.x.choice=sh.map(m=>m.f+'-'+m.t+'-'+(m.drop||''))},
  xlegal:(s,ms)=>s.x.choice?ms.filter(m=>s.x.choice.includes(m.f+'-'+m.t+'-'+(m.drop||''))):ms});

add('multi',{name:'Double Move',def:{w:2,b:1},depth:2,
  label:a=>a.lbl||(a.w>1&&a.b>1?'Double Move (both sides)':a.w>1?`${a.w} Moves vs ${a.b||1}`:`1 Move vs ${a.b}`),
  ruleFor:a=>(a.lbl?a.lbl+': ':'')+`You make ${a.w||1} move${(a.w||1)>1?'s':''} per turn, the bot makes ${a.b||1}. A move that gives check ends that side's turn early.`,
  rule:'You make two moves per turn. A move that gives check ends the turn.',
  multi:()=>{const a=A();return{w:a.w||1,b:a.b||1}},
  win:s=>kingSq(s.b,'b')<0?{w:'w',why:'you captured the king'}:kingSq(s.b,'w')<0?{w:'b',why:'your king was captured'}:null,
  status:g=>{const a=A(),t=g.s.turn,N=(t==='w'?a.w:a.b)||1;return N>1?`${t==='w'?'Your':'Bot'} move ${(g.s.x.sub||0)+1} of ${N}`:''}});

add('snipers',{name:'Sniper Bishops',
  rule:'Your bishops are snipers: when a bishop captures, it shoots the target and stays where it is.',
  xmake:(s,m,n)=>{if(s.turn!=='w'||m.f<0||s.b[m.f]!=='B'||!s.b[m.t])return;n.b[m.f]='B';n.b[m.t]=null}});

function rays(b,K,range,cb){const r=R_(K),c=C_(K);for(const[d,e]of KG){let rr=r+d,cc=c+e,k=1;while(inB(rr,cc)&&k<=range){const j=rr*8+cc;if(b[j]){cb(j,k);break}rr+=d;cc+=e;k++}}}
add('shotgun',{name:'Shotgun King',def:{rank:1,range:2},depth:2,
  label:a=>(a.gun?'Gun King':'Shotgun King')+(a.rank>1?' · Rank '+a.rank:''),
  ruleFor:a=>`You are a lone king with a ${a.gun?'gun':'shotgun'}: besides normal king moves, you shoot any enemy piece up to ${a.range||2} squares away in a straight line without moving. The bot's army grows with the rank${a.rank>1?' (rank '+a.rank+')':''}. Win by checkmate or by clearing the board.`,
  rule:'A lone king that shoots enemies up to 2 squares away in a straight line. Clear the board or checkmate.',
  setup:s=>{const a=A();setFen(s,['rnbqkbnr','pppppppp','8','8','8','8','8','4K3'].join('/'));
    const keep=[[1,2,3,4,5,6],[1,2,3,4,5,6,0,7],[0,1,2,3,4,5,6,7]][Math.min(2,(a.rank||1)-1)];
    for(let c=0;c<8;c++)if(!keep.includes(c))s.b[8+c]=null;if((a.rank||1)<3){s.b[3]=null}if((a.rank||1)<2){s.b[0]=null;s.b[7]=null}},
  win:s=>countPieces(s.b,'b')===0&&kingSq(s.b,'b')>=0?{w:'w',why:'you cleared the board'}:null,
  xgen:(s,mv)=>{if(s.turn!=='w')return mv;const K=kingSq(s.b,'w');if(K<0)return mv;const rg=A().range||2;
    rays(s.b,K,rg,(j,k)=>{const p=s.b[j];if(k>=2&&!isWall(p)&&col(p)==='b'&&up(p)!=='K')mv.push({f:K,t:j,shot:1})});return mv},
  xmake:(s,m,n)=>{if(m.shot){n.b[m.f]='K';n.b[m.t]=null}},
  xatt:(b,sq,by)=>{if(by!=='w'||MODE.id!=='shotgun')return false;const K=kingSq(b,'w');if(K<0)return false;let hit=false;const rg=(ARG&&ARG.range)||2;
    const r=R_(K),c=C_(K);for(const[d,e]of KG){let rr=r+d,cc=c+e,k=1;while(inB(rr,cc)&&k<=rg){const j=rr*8+cc;if(j===sq&&k>=2){hit=true;break}if(b[j])break;rr+=d;cc+=e;k++}if(hit)break}return hit}});

/* =================== SET-UP / ODDS MODES =================== */
const PIECE_SQ={w:[59,57,62,58,61,56,63,60],b:[3,1,6,2,5,0,7,4]};
function addPieces(s,side,type,n){const rows=side==='b'?[2,1,0,3]:[5,6,7,4];const L=Array(n).fill(side==='b'?type.toLowerCase():type);let k=0;
  for(const r of rows){k+=placeMany(s.b,L.slice(k),rowSquares(r));if(k>=n)break}}
function removeOrder(s,side,n){const ord=side==='w'?['Q','R','R','B','B','N','N','P','P','P','P','P','P','P','P']:['q','r','r','b','b','n','n','p','p','p','p','p','p','p','p'];let k=0;
  for(const t of ord){if(k>=n)break;const i=s.b.indexOf(t);if(i>=0){s.b[i]=null;k++}}fixCR(s)}
function armyRows(s,side,str){/* str: FEN rows for that side's half, from its back rank forward */const rows=str.split('/');
  for(let k=0;k<rows.length;k++){const r=side==='b'?k:7-k;let c=0;for(const ch of rows[k]){if(/\d/.test(ch)){for(let z=0;z<+ch;z++)s.b[r*8+c++]=null}else s.b[r*8+c++]=side==='b'?ch.toLowerCase():ch.toUpperCase()}}}
add('howmany',{name:'How Many Pieces?',def:{t:'Q',n:4},xcount:1,depth:2,
  label:a=>`How Many ${PN[a.t].replace(/^./,x=>x.toUpperCase())}${a.who?' to Beat '+a.who:''}?`,
  ruleFor:a=>`You get extra ${PN[a.t]} (${FNAME[a.t]?FNAME[a.t].toLowerCase()+' = '+FDESC[a.t]:a.t==='D'?'a dragon moves like a queen and a knight':'placed in front of your army'}). Use the slider to pick how many, then beat ${a.who||'the bot'}.`,
  rule:'You get extra pieces. Pick how many with the slider, then beat the bot.',
  cntLabel:()=>`Your extra ${PN[A().t||'Q']}: ${CNT}`,
  setup:s=>{const a=A();addPieces(s,'w',a.t||'Q',CNT)}});
add('gift',{name:'Gift Pieces',def:{t:'Q'},xcount:1,depth:2,
  label:a=>`Give ${a.who||'the Bot'} Extra ${PN[a.t].replace(/^./,x=>x.toUpperCase())}`,
  ruleFor:a=>`${a.who||'The bot'} starts with extra ${PN[a.t]}${FNAME[a.t]?' ('+FDESC[a.t]+')':''}. Add one more each time you win (use the slider) and see how far you get before you lose.`,
  rule:'The bot starts with extra pieces. Add one more each time you win.',
  cntLabel:()=>`Bot's extra ${PN[A().t||'Q']}: ${CNT}`,
  setup:s=>{addPieces(s,'b',A().t||'Q',CNT)}});
add('botodds',{name:'Piece Odds',def:{n:1},xcount:1,
  label:a=>a.lbl||'Piece Odds',
  ruleFor:a=>(a.lbl?a.lbl+'. ':'')+`${a.who||'The bot'} starts without pieces: the slider sets how many it gives up (queen first, then rooks, bishops, knights). Remove one more each time you lose.`,
  rule:'The bot starts without some of its pieces. The slider sets how many.',
  cntLabel:()=>`Pieces the bot is missing: ${CNT}`,
  setup:s=>{removeOrder(s,'b',CNT)}});
add('handicap',{name:'Handicap',def:{keep:'noQ'},
  label:a=>a.lbl||'Handicap: '+HL[a.keep],
  ruleFor:a=>`You play ${HCAP[a.keep][0]} against ${a.who||'the bot'}'s full army.`,
  rule:'You start without some of your pieces.',
  setup:s=>{HCAP[A().keep||'noQ'][1](s);fixCR(s)}});
const HL={noQ:'No Queen',P1:'Only 1 Pawn',R1:'Only 1 Rook',Q1:'Only 1 Queen',N1:'Only 1 Knight',P3:'Only 3 Pawns',pawns:'No Pieces',piece1:'Only 1 Piece'};
const keepOnly=(s,keep)=>{for(let i=48;i<64;i++)if(s.b[i]&&s.b[i]!=='K')s.b[i]=null;for(const[sq,p]of keep)s.b[sq]=p};
const HCAP={noQ:['without your queen',s=>{s.b[59]=null}],
  P1:['with just your king and one pawn',s=>keepOnly(s,[[52,'P']])],
  R1:['with just your king and one rook',s=>keepOnly(s,[[56,'R']])],
  Q1:['with just your king and one queen',s=>keepOnly(s,[[59,'Q']])],
  N1:['with just your king and one knight',s=>keepOnly(s,[[62,'N']])],
  P3:['with your king and three pawns',s=>keepOnly(s,[[51,'P'],[52,'P'],[53,'P']])],
  pawns:['with no pieces at all, only your king and pawns',s=>{for(const i of[56,57,58,59,61,62,63])s.b[i]=null}],
  piece1:['with one piece (a queen) besides your king and pawns',s=>{for(const i of[56,57,58,61,62,63])s.b[i]=null}]};
const LONE={
  N100:['1 Knight vs 100 Pawns','You have a king and one knight. The bot has a king and a wall of 24 pawns.','4k3/pppppppp/pppppppp/pppppppp/8/8/8/1N2K3'],
  D50:['1 Amazon vs 50 Pawns','You have a king and one amazon (queen + knight moves). The bot has a king and 24 pawns.','4k3/pppppppp/pppppppp/pppppppp/8/8/8/3DK3'],
  DQ:['1 Amazon vs 1 Queen','Your king and amazon (queen + knight moves) against the bot\'s king and queen.','3qk3/8/8/8/8/8/8/3DK3'],
  QI:['1 Queen vs 1 Impostor','Your king and queen against the bot\'s king and an impostor: a piece that looks like a queen but secretly moves like an amazon (queen + knight).','3dk3/8/8/8/8/8/8/3QK3'],
  A1:['Dragon Bishop Mate','You have a king and one dragon bishop (moves like a bishop or a knight). It can checkmate a lone king by itself, so prove it.','4k3/8/8/8/8/8/8/2A1K3'],
  run:['Speedrunner vs 3 Hunters','You are the speedrunner: get your king to the top rank to win. The bot has three hunter knights and a king trying to catch you.','1n2k1n1/8/3n4/8/8/8/2P2P2/4K3']};
add('lone',{name:'Lone Piece vs Army',def:{k:'N100'},depth:2,
  label:a=>LONE[a.k][0],ruleFor:a=>LONE[a.k][1],rule:'One piece and a king against a whole army.',
  setup:s=>{setFen(s,LONE[A().k||'N100'][2])},
  win:s=>A().k==='run'&&R_(kingSq(s.b,'w'))===0?{w:'w',why:'the speedrunner reached the finish'}:null});

const FOES={pawns:['100 Pawns','4k3/pppppppp/pppppppp/pppppppp'],pawns2:['250,000 Pawns','4k3/pppppppp/pppppppp/pppppppp/pppppppp'],
  knights:['10 Knights','nnnnknnn/2nnn3'],queen:['1 Queen','3qk3'],dragon:['1 Dragon','3dk3'],army:['a full army','rnbqkbnr/pppppppp']};
add('nuke',{name:'Nukes',def:{foe:'pawns',n:1},depth:2,fairy:1,
  label:a=>a.lbl||`${a.n||1} Nuke${(a.n||1)>1?'s':''} vs ${FOES[a.foe][0]}`,
  ruleFor:a=>`The Nuke moves like a queen and a knightrider combined (any queen line, or knight jumps repeated in one direction). You have a king and ${a.n>1?a.n+' nukes':'one nuke'}${a.pawns?' plus your pawns':''} against ${FOES[a.foe][0]}${a.who?' ('+a.who+')':''}. Checkmate the king before a pawn promotes.`,
  rule:'The Nuke moves like a queen plus a knightrider. Checkmate with it.',
  setup:s=>{const a=A();for(let i=0;i<64;i++)s.b[i]=null;const rows=FOES[a.foe||'pawns'][1].split('/');
    for(let r=0;r<rows.length;r++){let c=0;for(const ch of rows[r]){if(/\d/.test(ch))c+=+ch;else s.b[r*8+c++]=ch}}
    s.b[60]='K';const sq=[59,61,58,62,57];const n=a.xcount?CNT:(a.n||1);for(let k=0;k<Math.min(n,5);k++)s.b[sq[k]]='U';
    if(a.pawns)for(let c=0;c<8;c++)s.b[48+c]='P';s.cr=''},
  get xcount(){return !!(ARG&&ARG.xcount)},cntLabel:()=>`Nukes: ${CNT}`});
const LADDERS={up:['P','Q','D','L','U'],down:['U','Q','R','B','N','P']};
const PNAME={P:'pawn',Q:'queen',D:'amazon',L:'knightrider',U:'nuke',R:'rook',B:'bishop',N:'knight',A:'dragon (knight + bishop)'};
add('onepiece',{name:'1 Piece vs an Army',def:{ladder:'up'},xcount:1,depth:2,
  label:a=>a.lbl||'1 Piece vs an Army',
  ruleFor:a=>`You have only your king and ONE piece against a full army. The slider picks the piece: ${LADDERS[a.ladder].map(t=>PNAME[t]).join(', then ')}${a.ladder==='up'?' (it upgrades after each loss)':' (it downgrades after each win)'}. Amazon = queen + knight, knightrider = repeated knight jumps, nuke = queen + knightrider.`,
  rule:'King and one piece against a full army.',
  cntLabel:()=>{const L=LADDERS[A().ladder||'up'];return 'Your piece: '+PNAME[L[Math.min(CNT,L.length)-1]]},
  setup:s=>{const L=LADDERS[A().ladder||'up'];const t=L[Math.min(Math.max(CNT,1),L.length)-1];for(let i=48;i<64;i++)if(s.b[i]!=='K')s.b[i]=null;s.b[t==='P'?55:59]=t;s.cr=s.cr.replace(/[KQ]/g,'')}});
add('kingplus',{name:'King Plus',def:{t:'P',n:1},xcount:1,depth:2,
  label:a=>a.lbl||`How Many ${PN[a.t].replace(/^./,x=>x.toUpperCase())}?`,
  ruleFor:a=>`You have only your king and ${PN[a.t]} (${a.t==='A'?'a dragon here moves like a knight and a bishop':'no other pieces'}); the bot has its full army. Start with ${a.n||1} and add one more after every loss until you win.`,
  rule:'Only your king plus a few pieces of one type, against a full army.',
  cntLabel:()=>`Your ${PN[A().t||'P']}: ${CNT}`,
  setup:s=>{const a=A();for(let i=48;i<64;i++)if(s.b[i]!=='K')s.b[i]=null;s.cr=s.cr.replace(/[KQ]/g,'');
    const order=a.t==='P'?[55,54,53,52,51,50,49,48,47,46,45,44]:[59,61,58,62,57,63,56,51,52,50,53];let k=0;for(const j of order){if(k>=CNT)break;if(!s.b[j]){s.b[j]=a.t;k++}}}});
add('setuppos',{name:'Custom Start',def:{k:'corner'},
  label:a=>SETUPS[a.k][0],ruleFor:a=>SETUPS[a.k][1],rule:'A different starting position.',
  setup:s=>{setFen(s,SETUPS[A().k||'corner'][2])}});
const SETUPS={corner:['Cornered Kings','Both kings start in the corner (h1 and h8) with the rook beside them. No castling.','rnbqrbnk/pppppppp/8/8/8/8/PPPPPPPP/RNBQRBNK'],
  twelve:['The 12 Pawns Opening','You start with 12 pawns: four extra pawns replace your knights and bishops.','rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RPPQKPPR'],
  luxury:['Luxury Chess','Everything is upgraded: both sides start with two queens and their bishops replaced by archbishops.','rnaqkanr/pppppppp/8/8/8/8/PPPPPPPP/RNAQKANR'],
  hyper:['Hyper Chess','Hyper pieces: every knight is a knightrider and every bishop an archbishop, for both sides.','rlaqkalr/pppppppp/8/8/8/8/PPPPPPPP/RLAQKALR']};

add('promote',{name:'Once a Pawn, a King',
  rule:'Your pawns promote early: a pawn that reaches the 6th rank becomes a commoner (moves like a king but is not royal).',
  xmake:(s,m,n)=>{if(s.turn!=='w'||m.f<0||s.b[m.f]!=='P')return;if(R_(m.t)<=2)n.b[m.t]='M'}});

/* =================== FAIRY PIECES =================== */
const FDESC={C:'a knook moves like a rook and a knight',A:'an archbishop moves like a bishop and a knight',G:'a grasshopper slides along queen lines but must hop over exactly one piece and land just behind it',
  W:'a wildebeest jumps like a knight or a camel (3 by 1)',L:'a knightrider makes repeated knight jumps in one direction',E:'an elephant jumps exactly two squares diagonally',
  F:'a ferz steps one square diagonally',M:'a commoner moves like a king but is not royal',H:'a fly hops to any square up to two squares away, over anything',D:'a dragon moves like a queen and a knight'};
const FAIRY_SETS={
  G:{name:'Grasshopper',swap:{w:{59:'G'}}},C:{name:'Knook',swap:{w:{59:'C'}}},W:{name:'Wildebeest',swap:{w:{59:'W'}}},L:{name:'Knightrider',swap:{w:{59:'L'}}},
  A:{name:'Dragon Bishop',swap:{w:{58:'A',61:'A'},b:{2:'a',5:'a'}}},M:{name:'King (commoner)',swap:{w:{59:'M'}}},
  fly:{name:'The Fly',swap:{b:{3:'h',1:'h',6:'h'}}},unicorn:{name:'Unicorn',swap:{w:{57:'L',62:'L'}}},
  gothic:{name:'Gothic Chess',swap:{w:{57:'A',62:'C'},b:{1:'a',6:'c'}}},
  ultimate:{name:'Chess Ultimate',swap:{w:{57:'A',62:'C',58:'W',61:'L'},b:{1:'a',6:'c',2:'w',5:'l'}}},
  ultimateB:{name:'Ultimate vs Normal',swap:{b:{1:'a',6:'c',2:'w',5:'l',3:'d'}}},
  ninja:{name:'Ninja + Angel',swap:{w:{57:'H',61:'A'},b:{1:'h',5:'a'}}},
  knightmare:{name:'Knightmare',swap:{w:{57:'L',62:'L'},b:{1:'l',6:'l'}}},
  wizard:{name:'Wizard Chess',swap:{w:{58:'H',61:'H'},b:{2:'h',5:'h'}}},
  mage:{name:'The Mage',swap:{w:{59:'A'},b:{3:'a'}}},
  upR:{name:'Upgraded Rooks',swap:{w:{56:'C',63:'C'}}},upB:{name:'Upgraded Bishops',swap:{w:{58:'A',61:'A'}}},upN:{name:'Upgraded Knights',swap:{w:{57:'L',62:'L'}}},
  mix:{name:'18 New Pieces',random:1},rainbow:{name:'Rainbow Chess',random:1}};
add('fairy',{name:'Fairy Pieces',def:{k:'G'},fairy:1,depth:2,
  label:a=>a.lbl||FAIRY_SETS[a.k].name,
  ruleFor:a=>{const F_=FAIRY_SETS[a.k];if(F_.random)return 'Every knight, bishop and rook on both sides is replaced by a random fairy piece (the badge names it): knooks, archbishops, grasshoppers, wildebeests, knightriders and more.';
    const ts=[...new Set([...Object.values(F_.swap.w||{}),...Object.values(F_.swap.b||{})].map(p=>p.toUpperCase()))];
    return (F_.swap.w&&!F_.swap.b?'Your queen is replaced: ':F_.swap.b&&!F_.swap.w?'The bot fields fairy pieces: ':'Both sides field fairy pieces: ')+ts.map(t=>FDESC[t]).join('; ')+'.'},
  rule:'Your queen is replaced by a fairy piece. The badge names it.',
  setup:s=>{const F_=FAIRY_SETS[A().k||'G'];if(F_.random){const pool='CAGWLNBR';for(const i of[56,57,58,61,62,63]){const t=pool[rnd(pool.length)];s.b[i]=t;s.b[i-56]=t.toLowerCase()}s.cr=''}
    else{for(const side of['w','b'])for(const[k,v]of Object.entries(F_.swap[side]||{}))s.b[+k]=v;fixCR(s)}}});

add('ancient',{name:'Ancient Chess',def:{k:'chaturanga'},fairy:1,
  label:a=>({chaturanga:'Chaturanga',xiangqi:'Xiangqi-style Ancient Chess',shatranj:'Shatranj',chaturaji:'Chaturaji'}[a.k]),
  ruleFor:a=>(a.k==='shatranj'?'Shatranj, the chess of the medieval Islamic world: ':a.k==='xiangqi'?'Ancient rules in the spirit of Chinese chess: ':'')+'the queen is a ferz (one step diagonally), bishops are elephants (jump exactly two squares diagonally), pawns move one square and promote to a ferz, and there is no castling.',
  rule:'Ferz instead of queen, elephants instead of bishops, no castling, pawns promote to ferz.',
  setup:s=>{setFen(s,'rnefkenr/pppppppp/8/8/8/8/PPPPPPPP/RNEFKENR')},
  xgen:(s,mv)=>mv.filter(m=>!m.dbl),
  xmake:(s,m,n)=>{if(m.pr)n.b[m.t]=s.turn==='w'?'F':'f'}});

/* =================== OPENINGS =================== */
const OPEN={london:['London System','d2d4 d7d5 c1f4 g8f6'],bongcloud:['Bongcloud','e2e4 e7e5 e1e2 b8c6'],kg:["King's Gambit",'e2e4 e7e5 f2f4 e5f4'],
  h4:['1. h4','h2h4 e7e5'],e4:['1. e4','e2e4 c7c5'],french:['French Defense','e2e4 e7e6 d2d4 d7d5'],danish:['Danish Gambit','e2e4 e7e5 d2d4 e5d4 c2c3 d4c3'],
  sodium:['Sodium Attack (1. Na3)','b1a3 e7e5'],halloween:['Halloween Gambit','e2e4 e7e5 g1f3 b8c6 b1c3 g8f6 f3e5 c6e5'],
  beachcafe:['BeachCafe Opening','e2e4 e7e5 d1h5 b8c6 f1c4 g8f6'],egg:['Egg Opening','e2e3 e7e5 d2d3 d7d5'],
  banned:['Banned Opening (Fried Liver)','e2e4 e7e5 g1f3 b8c6 f1c4 g8f6 f3g5 d7d5 e4d5 f6d5'],
  unicorn:['Unicorn Attack','e2e4 e7e5 g1f3 b8c6 h2h4 g8f6'],nocastle:['No Castling',''],badegg:['The Bad Egg','g2g4 e7e5']};
add('opening',{name:'Forced Opening',def:{k:'london'},sf:1,
  label:a=>(a.k==='nocastle'?'No Castling':'Forced Opening: '+OPEN[a.k][0])+(a.who?' vs '+a.who:''),
  ruleFor:a=>a.k==='nocastle'?'Neither side may ever castle. Find another way to get your king safe.':`The game starts with the ${OPEN[a.k][0]} already on the board (${OPEN[a.k][1].split(' ').length} moves). Play it out from there.`,
  rule:'The game starts from a forced opening line.',
  setup:(s)=>{const a=A();if(a.k==='nocastle'){s.cr='';return}
    for(const u of OPEN[a.k||'london'][1].split(' ')){const sq=x=>(8-(+x[1]))*8+(x.charCodeAt(0)-97);const f=sq(u.slice(0,2)),t=sq(u.slice(2,4));
      const ms=_legal(s);const m=ms.find(z=>z.f===f&&z.t===t);if(!m)break;const n=m.n;s.b=n.b;s.turn=n.turn;s.cr=n.cr;s.ep=n.ep;s.x.ply=0}}});

/* =================== HORROR: STALKERS =================== */
function monsterStep(s,from,target,avoid){let best=-1,bd=1e9;
  for(const[d,e]of KG){const r=R_(from)+d,c=C_(from)+e;if(!inB(r,c))continue;const j=r*8+c,p=s.b[j];
    if(isWall(p)||(p&&col(p)==='b')||avoid.includes(j))continue;const dd=Math.max(Math.abs(R_(target)-r),Math.abs(C_(target)-c))+Math.random()*.5;if(dd<bd){bd=dd;best=j}}return best}
function stalker(id,name,rule,cfg){return add(id,Object.assign({name,rule,scfg:cfg,
  setup:s=>{const n=cfg.n!=null?cfg.n:1;s.x.mons=[];for(let k=0;k<n;k++){const E=emptySq(s.b,[cfg.start!=null?cfg.start:2]);s.x.mons.push(E.length?pick(E):16+k)}s.x.mt=0;s.x.tail=[];
    if(cfg.walls)mazeWalls(s,{n:cfg.walls})},
  xlegal:(s,ms)=>s.x.mons?ms.filter(m=>!(s.turn==='w'&&up(s.b[m.f]||'')==='K'&&s.x.mons.includes(m.t))):ms,
  status:g=>{const s=g.s;const n=(s.x.mons||[]).length;return cfg.grab?`The hand strikes every 3rd bot move`:n?`${n>1?n+' monsters':'The monster'} move${n>1?'':'s'} every ${cfg.every||2} bot moves`:''},
  after:(g,m)=>{const s=g.s,x=s.x;
    if(s.turn==='b'){if(x.mons&&x.mons.includes(m.t)&&!m.drop){const k=x.mons.indexOf(m.t);x.mons=x.mons.slice();
        if(cfg.tough){s.b[m.t]=null;const r=Math.max(0,R_(m.t)-2);x.mons[k]=r*8+C_(m.t);g.msg='It cannot be killed. It shrugged off your piece and stepped back.'}
        else{s.b[m.t]=null;const E=emptySq(s.b,[0,1]).filter(j=>!x.mons.includes(j));x.mons[k]=E.length?pick(E):C_(m.t);g.msg='Your piece sacrificed itself and banished the monster.'}}
      if(cfg.hear&&!m.drop)x.heard=m.t;return}
    x.mt++;const b=s.b;const whites=()=>{const L=[];for(let i=0;i<64;i++)if(b[i]&&!isWall(b[i])&&col(b[i])==='w'&&up(b[i])!=='K')L.push(i);return L};
    const near=(i,d)=>x.mons.some(q=>Math.max(Math.abs(R_(q)-R_(i)),Math.abs(C_(q)-C_(i)))<=d);
    if(cfg.grab&&x.mt%3===0){const W=whites();if(W.length){W.sort((a,c)=>VAL[up(b[c])]-VAL[up(b[a])]);const j=W[0];g.msg=`${cfg.grab} grabbed your ${DNAME[up(b[j])]||'piece'} off the board.`;b[j]=null}}
    if(cfg.mind&&x.mt%3===0){const W=whites().filter(i=>cfg.mind==='any'||near(i,2));if(W.length){const j=pick(W);b[j]=b[j].toLowerCase();g.msg='One of your pieces was taken over and now fights for the bot.'}}
    if(cfg.reality&&x.mt%3===0){const W=whites().filter(i=>up(b[i])!=='P');if(W.length>1){const a=pick(W),c=pick(W.filter(i=>i!==a));const t=b[a];b[a]=b[c];b[c]=t;g.msg='Reality shifted: two of your pieces swapped places.'}}
    if(cfg.toast&&x.mt%3===0){const W=whites().filter(i=>up(b[i])!=='P'&&R_(i)>0&&near(i,2));if(W.length){const j=pick(W);b[j]='P';g.msg='One of your pieces now believes it is a toaster (a pawn).'}}
    if(!x.mons||!x.mons.length)return;
    if(x.mt%(cfg.every||2))return;
    const K=kingSq(b,'w');if(K<0)return;x.mons=x.mons.slice();
    for(let k=0;k<x.mons.length;k++){let steps=cfg.speed||1;const q=x.mons[k];
      if(cfg.statue){const seen=attacked(b,q,'w');if(seen){continue}steps=2}
      for(let st=0;st<steps;st++){const from=x.mons[k],tgt=cfg.hear&&x.heard>=0&&b[x.heard]?x.heard:K;
        const nm=monsterStep(s,from,tgt,x.mons);if(nm<0)break;
        if(nm===K){x.mons[k]=nm;g.over={w:'b',why:cfg.catchWhy||'the monster reached your king'};return}
        if(cfg.tail){if(!b[from]){b[from]='#';x.tail=x.tail.concat([from])}while(x.tail.length>cfg.tail){const o=x.tail[0];x.tail=x.tail.slice(1);if(b[o]==='#')b[o]=null}}
        const p=b[nm];if(p&&col(p)==='w'&&!isWall(p)){
          if(cfg.cure&&R_(nm)>0&&R_(nm)<7){b[nm]='p';g.msg='The doctor "cured" your piece. It now serves the bot as a pawn.'}
          else{b[nm]=null;g.msg='The monster devoured your piece on '+sqName(nm)+'.'}}
        x.mons[k]=nm}}
    if(s.cr)fixCR(s)},
  visible:(s,i)=>!cfg.hidden||[...Array(64).keys()].some(j=>s.b[j]&&!isWall(s.b[j])&&col(s.b[j])==='w'&&Math.max(Math.abs(R_(j)-R_(i)),Math.abs(C_(j)-C_(i)))<=1)},
  cfg.walls?{walls:1,wallStyle:()=>'dark'}:cfg.tail?{walls:1,wallStyle:()=>'tail'}:{}))}
stalker('scp173','SCP-173','SCP-173 only moves when nobody is looking. If none of your pieces attack its square, it lunges two squares toward your king and snaps anything in its way. Keep it in sight, or sacrifice a piece onto it to banish it.',{statue:1,every:1});
stalker('scp939','SCP-939','SCP-939 hunts by sound. Every other turn it creeps toward the square of your last move and devours what it finds. Sacrifice a piece onto it to banish it.',{hear:1});
stalker('scp682','SCP-682','SCP-682 cannot be destroyed. It advances every turn and eats your pieces. Sacrificing a piece onto it only knocks it back two ranks.',{tough:1,every:1,start:0});
stalker('scp049','SCP-049','SCP-049, the Plague Doctor, walks toward your king. Pieces it touches are "cured" and become bot pawns. Sacrifice a piece onto it to banish it.',{cure:1});
stalker('scp035','SCP-035','SCP-035 stalks your king, and every third bot move it mind-controls one of your pieces near it, which switches sides.',{mind:'near'});
stalker('scp2845','SCP-2845','SCP-2845 alters reality: every third bot move two of your pieces swap places, while it hunts your king.',{reality:1});
stalker('scp426','SCP-426','SCP-426 makes your pieces think they are toasters: every third bot move a piece near it becomes a pawn. It also hunts your king.',{toast:1});
stalker('scp966','SCP-966','SCP-966 is invisible unless one of your pieces is right next to it. It hunts your king every other turn.',{hidden:1});
stalker('scp2774','SCP-2774','SCP-2774 is inside your head: every third bot move one of your pieces anywhere on the board switches sides, while it hunts your king.',{mind:'any'});
stalker('scp106','SCP-106 Pocket Dimension','You are trapped in SCP-106\'s pocket dimension: dark walls block the board and the Old Man hunts your king through it.',{walls:9});
stalker('breach','Containment Breach','Containment breach: three monsters hunt your king at once. Each eats what it lands on. Sacrifice pieces onto them to banish them.',{n:3,every:3});
stalker('watcher','The Watcher','Something is watching. An unseen monster (visible only next to your pieces) hunts your king every other turn.',{hidden:1});
stalker('stalker','Stalker','A monster stalks your king every other turn and eats what it lands on. Sacrifice a piece onto it to banish it.',{});
stalker('snake','Snake','A snake slithers toward your king every other turn, leaving a three-square tail that blocks the board, and eats what it reaches.',{tail:3});
stalker('pacman','Pac-Man Chess','Two ghosts chase your king around the board, eating any piece they catch. Sacrifice a piece onto a ghost to send it home.',{n:2,every:2,start:0});
stalker('grab','The Grabbing Hand','Every third bot move a hand reaches in and grabs your most valuable piece off the board.',{n:0,grab:'The hand'});

/* =================== WIN-CONDITION TWISTS =================== */
add('specialmate',{name:'Special Checkmate',def:{k:'pawn'},
  label:a=>({pawn:'Rarest Checkmate',castle:'Castling Checkmate',ep:'En Passant Checkmate',knight:'Knight Checkmate'})[a.k],
  ruleFor:a=>`Only a special checkmate counts: you win only if the mating move is ${({pawn:'made by a pawn',castle:'castling',ep:'an en passant capture',knight:'made by a knight'})[a.k]}. Any other checkmate is a draw. En passant is forced whenever it is available.`,
  rule:'Only a special checkmate counts.',
  xmake:(s,m,n)=>{n.x.lk=m.cs!=null?'castle':m.ep?'ep':m.f>=0?(up(s.b[m.f])==='P'?'pawn':up(s.b[m.f])==='N'?'knight':''):''},
  xlegal:(s,ms)=>{if(A().k!=='ep')return ms;const e=ms.filter(m=>m.ep);return e.length?e:ms},
  win:s=>{if(s.turn!=='b')return null;const k=kingSq(s.b,'b');if(k<0||!_att(s.b,k,'w'))return null;if(_legal(s).length)return null;
    const a=A();return s.x.lk===a.k||(a.k==='pawn'&&s.x.lk==='ep')?{w:'w',why:'a special checkmate'}:{w:'d',why:'that checkmate did not count'}}});
add('selfmate',{name:'Try to Lose',
  rule:'Reverse chess: you win if the bot checkmates you. If you checkmate the bot, you lose. The bot does its best not to mate you.',
  win:s=>{const k=kingSq(s.b,s.turn);if(k<0||!_att(s.b,k,opp(s.turn)))return null;if(_legal(s).length)return null;
    return s.turn==='w'?{w:'w',why:'you got yourself checkmated'}:{w:'b',why:'you checkmated the bot by mistake'}}});
add('murder',{name:'Whodunit',
  rule:'One of the bot\'s pieces is secretly the murderer. Capture it to win (or checkmate as usual). It is revealed when the game ends.',
  setup:s=>{const L=[];for(let i=0;i<16;i++)if(s.b[i]&&s.b[i]!=='k')L.push(i);s.x.cul=pick(L)},
  xmake:(s,m,n)=>{if(s.x.cul<0)return;if(s.turn==='b'&&m.f===s.x.cul)n.x.cul=m.t;else if(s.turn==='w'&&m.t===s.x.cul)n.x.cul=-2},
  win:s=>s.x&&s.x.cul===-2?{w:'w',why:'you caught the murderer'}:null,
  overText:g=>g.s.x.cul>=0?'The murderer was the piece on '+sqName(g.s.x.cul)+'.':''});
add('heist',{name:'The Heist',
  rule:'Crack the vault: get any of your pieces onto d8 or e8 (the bot\'s royal squares) and survive one bot move... or simply land there. Checkmate also wins.',
  win:s=>{for(const j of[3,4]){const p=s.b[j];if(p&&!isWall(p)&&col(p)==='w')return{w:'w',why:'you cracked the vault'}}return null}});
add('rosen',{name:'Rosen Score',
  rule:'Trap the queen: win the bot\'s queen and you win the game. Checkmate also wins.',
  win:s=>s.b.indexOf('q')<0?{w:'w',why:'you trapped the queen'}:null});
const PUZ=[['Back-rank Puzzle','6k1/5ppp/8/8/8/8/5PPP/3R2K1',1],['Smothered Puzzle','6rk/6pp/7N/8/8/8/6PP/3Q2K1',2],['Opening Trap Puzzle','r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR',1]];
add('puzzle',{name:'Puzzle Rush',def:{k:0},
  label:a=>PUZ[a.k][0],ruleFor:a=>`Solve it: White to move and win within ${PUZ[a.k][2]+2} moves, or the puzzle counts as failed.`,
  rule:'Solve a tactical puzzle within a few moves.',
  setup:s=>{setFen(s,PUZ[A().k||0][1])},
  win:s=>s.x&&s.turn==='w'&&s.x.ply>=(PUZ[A().k||0][2]+2)*2?{w:'b',why:'the puzzle clock ran out'}:null});
add('hearts',{name:'Lesson Hearts',
  rule:'Like a language lesson: you have 3 hearts. Any move that throws away 1.5 pawns or more of value costs a heart. Lose them all and you fail the lesson.',
  cfgDef:{hearts:3}});
add('permacap',{name:'Permanent Captures',
  rule:'Captures are permanent between games: every piece either side loses stays lost in the next game (for up to 5 games, then the board resets).',
  setup:(s,g)=>{PERMA.games++;if(PERMA.games>5){PERMA.w=[];PERMA.b=[];PERMA.games=1}
    for(const t of PERMA.w){const i=s.b.indexOf(t);if(i>=0)s.b[i]=null}for(const t of PERMA.b){const i=s.b.indexOf(t.toLowerCase());if(i>=0)s.b[i]=null}fixCR(s);
    g.start={w:s.b.filter(p=>p&&col(p)==='w').map(up),b:s.b.filter(p=>p&&col(p)==='b').map(up)}},
  status:()=>PERMA.w.length||PERMA.b.length?`Carried losses: you ${PERMA.w.join('')||'none'}, bot ${PERMA.b.join('')||'none'}`:'',
  onOver:g=>{for(const c of['w','b']){const now=g.s.b.filter(p=>p&&!isWall(p)&&col(p)===c).map(up);const left=now.slice();
    for(const t of g.start[c]){const k=left.indexOf(t);if(k>=0)left.splice(k,1);else if(t!=='K')PERMA[c].push(t)}}}});
const PERMA={w:[],b:[],games:0};

/* =================== TRANSCRIPT-BASED MODES =================== */
/* Backrooms Chess (video xp6Pr-rB4JA): you are a lone king in a walled maze with limited vision, hunting the hidden
   "anomalous" enemy king. The enemy starts with king + bishop + knight + pawn and spawns a new bishop, knight or pawn
   every turn. Find and catch the anomalous king before the spawns trap you. */
add('backrooms',{name:'Backrooms Chess',walls:1,depth:2,def:{walls:10,spawnCap:14,vision:2},
  rule:'You are a lone king lost in the Backrooms. Walls block the board and you only see two squares around you. The enemy starts with a king, bishop, knight and pawn and spawns a new bishop, knight or pawn every turn. Find the anomalous king and step next to it to capture it.',
  setup:s=>{const a=A();for(let i=0;i<64;i++)s.b[i]=null;s.cr='';
    for(let t=0;t<50;t++){for(let i=0;i<64;i++)s.b[i]=null;
      const wk=56+rnd(8);s.b[wk]='K';const far=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].filter(i=>Math.max(Math.abs(R_(i)-R_(wk)),Math.abs(C_(i)-C_(wk)))>=5);s.b[pick(far)]='k';
      let k=0;while(k<(a.walls||10)){const j=16+rnd(40);if(!s.b[j]){s.b[j]='#';k++}}
      if(kingsReachable(s.b))break}
    for(const p of['b','n','p']){const E=emptySq(s.b,[0,1,2,3]).filter(j=>!(p==='p'&&R_(j)===0));const j=pick(E);s.b[j]=p}
    s.x.spawn=0},
  xlegal:(s,ms)=>{if(s.turn!=='b')return ms;const nk=ms.filter(m=>s.b[m.f]!=='k');return nk.length?nk:ms},
  win:s=>{const a=kingSq(s.b,'w'),z=kingSq(s.b,'b');if(a<0||z<0)return null;return Math.max(Math.abs(R_(a)-R_(z)),Math.abs(C_(a)-C_(z)))<=1&&s.turn==='b'?{w:'w',why:'you caught the anomalous king'}:null},
  after:g=>{const s=g.s;if(s.turn!=='w')return;if(!legal(s).length&&!g.over){g.over={w:'b',why:'you were trapped with no moves'};return}if(countPieces(s.b,'b')>=(A().spawnCap||14))return;
    const t='bnp'[s.x.spawn++%3];const K=kingSq(s.b,'w');
    const E=emptySq(s.b,[0,1,2,3,4,5,6]).filter(j=>{if(t==='p'&&(R_(j)===0||R_(j)>=6))return false;if(Math.max(Math.abs(R_(j)-R_(K)),Math.abs(C_(j)-C_(K)))<=2)return false;
      const tb=s.b.slice();tb[j]=t;return !_att(tb,K,'b')});
    if(E.length){s.b[pick(E)]=t;g.msg='Something new spawned in the Backrooms.'}},
  hidden:(s,i)=>{const p=s.b[i];if(!p||isWall(p)||col(p)!=='b')return false;const K=kingSq(s.b,'w');return K<0?false:Math.max(Math.abs(R_(K)-R_(i)),Math.abs(C_(K)-C_(i)))>(A().vision||2)},
  wallStyle:()=>'yellow'});

/* SCP-096 / Shy Guy (video -fax07t_o5s): normal game; a neutral Shy Guy stands on the board. After every move, if any
   piece of either colour attacks his square, he moves onto that piece and eats it (kings included), and can chain on
   later turns. Lure him toward the enemy king. */
function attackersOf(b,sq){const L=[];const r=R_(sq),c=C_(sq);
  for(let i=0;i<64;i++){const p=b[i];if(!p||isWall(p))continue;const t=up(p),w=col(p)==='w',ri=R_(i),ci=C_(i),dr=r-ri,dc=c-ci;let hit=false;
    if(t==='P')hit=dr===(w?-1:1)&&Math.abs(dc)===1;
    else if(t==='N')hit=(Math.abs(dr)===1&&Math.abs(dc)===2)||(Math.abs(dr)===2&&Math.abs(dc)===1);
    else if(t==='K')hit=Math.max(Math.abs(dr),Math.abs(dc))===1;
    else if('BRQD'.includes(t)){if(t==='D'&&((Math.abs(dr)===1&&Math.abs(dc)===2)||(Math.abs(dr)===2&&Math.abs(dc)===1)))hit=true;
      const diag=Math.abs(dr)===Math.abs(dc)&&dr!==0,orth=(dr===0)!==(dc===0);
      if(!hit&&((diag&&'BQD'.includes(t))||(orth&&'RQD'.includes(t)))){const sr=Math.sign(dr),sc=Math.sign(dc);let rr=ri+sr,cc=ci+sc;hit=true;
        while(rr!==r||cc!==c){if(b[rr*8+cc]){hit=false;break}rr+=sr;cc+=sc}}}
    if(hit)L.push(i)}return L}
add('shyguy',{name:"Don't Look at SCP-096",walls:1,def:{every:'ply'},
  rule:'A neutral Shy Guy (SCP-096) stands on the board. After every move, if any piece of either side attacks his square, he leaps onto that piece and eats it, kings included. He blocks lines and cannot be captured. Lure him into a chain that ends on the enemy king.',
  label:a=>a.every==='round'?"Don't Look at SCP-096 (moves once per round)":"Don't Look at SCP-096",
  setup:s=>{const E=[24,32,31,39].filter(j=>!s.b[j]);const j=pick(E);s.b[j]='%';s.x.sg=j},
  win:s=>{if(kingSq(s.b,'b')<0)return{w:'w',why:'Shy Guy ate the bot king'};if(kingSq(s.b,'w')<0)return{w:'b',why:'Shy Guy ate your king'};
    const K=kingSq(s.b,s.turn),g=s.x&&s.x.sg;if(g==null||K<0||Math.max(Math.abs(R_(K)-R_(g)),Math.abs(C_(K)-C_(g)))>1)return null;
    return _legal(s).length?null:{w:opp(s.turn),why:s.turn==='w'?'your king looked at Shy Guy':'the bot king looked at Shy Guy'}},
  xmake:(s,m,n)=>{const a=A();if(a.every==='round'&&s.turn==='w')return;const sg=n.x.sg;if(sg==null||n.b[sg]!=='%')return;const att=attackersOf(n.b,sg);if(!att.length)return;
    att.sort((x,y)=>(up(n.b[y])==='K'?1e4:VAL[up(n.b[y])])-(up(n.b[x])==='K'?1e4:VAL[up(n.b[x])])||x-y);const j=att[0];
    n.b[sg]=null;n.b[j]='%';n.x.sg=j;n.x.ate=1;if(n.cr)fixCR(n)},
  xlegal:(s,ms)=>ms,
  wallStyle:()=>'shy'});

/* SCP-173 (video amA3ARfEoU8): neutral, uncapturable statue on a4. After every move, if no piece of either side attacks
   its square, it makes one knight jump toward the nearest king, destroying whatever it lands on. Watched = frozen. */
const kingDist=(b,j)=>{let d=99;for(const c of['w','b']){const k=kingSq(b,c);if(k>=0)d=Math.min(d,Math.max(Math.abs(R_(k)-R_(j)),Math.abs(C_(k)-C_(j))))}return d};
const neutralWin=who=>s=>{if(kingSq(s.b,'b')<0)return{w:'w',why:who+' got the bot king'};if(kingSq(s.b,'w')<0)return{w:'b',why:who+' got your king'};return null};
add('scp173n',{name:'SCP-173 Is Coming',walls:1,
  rule:'SCP-173 is a neutral statue that cannot be captured. After every move, if no piece of either side attacks its square, it makes one knight jump toward the nearest king and destroys whatever it lands on. Keep it watched, or steer it into the enemy king.',
  setup:s=>{s.b[32]='%';s.x.sg=32},win:neutralWin('SCP-173'),
  xmake:(s,m,n)=>{const g=n.x.sg;if(g==null||n.b[g]!=='%')return;if(attackersOf(n.b,g).length)return;
    let best=-1,bd=99;for(const[d,e]of KN){const r=R_(g)+d,c=C_(g)+e;if(!inB(r,c))continue;const j=r*8+c;if(isWall(n.b[j]))continue;const k=kingDist(n.b,j)+(n.b[j]&&up(n.b[j])==='K'?-5:0);if(k<bd){bd=k;best=j}}
    if(best<0)return;n.b[g]=null;n.b[best]='%';n.x.sg=best;if(n.cr)fixCR(n)},
  wallStyle:()=>'shy'});
/* "He Knows You Are Alone" (video mymJwfSPeFA): neutral Room starts on b4 and hunts isolated pieces (no friendly piece
   next to them) of either side, one king step per move; if its target is still alone when it arrives, it is captured. */
const isolated=(b,i)=>{const c=col(b[i]);for(const[d,e]of KG){const r=R_(i)+d,cc=C_(i)+e;if(!inB(r,cc))continue;const p=b[r*8+cc];if(p&&!isWall(p)&&col(p)===c)return false}return true};
add('room',{name:'He Knows You Are Alone',walls:1,
  rule:'A neutral entity hunts lonely pieces of both sides: each move it steps one square toward the nearest piece with no friendly piece next to it, and captures it if it is still alone when it arrives. Keep your pieces in pairs.',
  setup:s=>{s.b[33]='%';s.x.sg=33},win:neutralWin('The entity'),
  xmake:(s,m,n)=>{const g=n.x.sg;if(g==null||n.b[g]!=='%')return;const b=n.b;let tgt=-1,td=99;
    for(let i=0;i<64;i++){const p=b[i];if(!p||isWall(p))continue;if(!isolated(b,i))continue;const d=Math.max(Math.abs(R_(i)-R_(g)),Math.abs(C_(i)-C_(g)));if(d<td){td=d;tgt=i}}
    if(tgt<0)return;if(td===1){b[g]=null;b[tgt]='%';n.x.sg=tgt;if(n.cr)fixCR(n);return}
    let best=-1,bd=99;for(const[d,e]of KG){const r=R_(g)+d,c=C_(g)+e;if(!inB(r,c))continue;const j=r*8+c;if(b[j])continue;const k=Math.max(Math.abs(R_(tgt)-r),Math.abs(C_(tgt)-c));if(k<bd){bd=k;best=j}}
    if(best>=0){b[g]=null;b[best]='%';n.x.sg=best}},
  wallStyle:()=>'shy'});
/* Setup Chess (video nFY-Hn6xiOI): each side spends 39 points (P1 N3 B3 R5 Q9) placing pieces on its first three ranks,
   king included, pawns not on the back rank. Here the placement is drafted at random for both sides. */
add('setupchess',{name:'Setup Chess',
  rule:'Each side spends 39 points of material (pawn 1, knight or bishop 3, rook 5, queen 9) and places it anywhere on its first three ranks, king included. This arcade drafts both armies at random each game, then normal chess follows.',
  setup:s=>{for(let i=0;i<64;i++)s.b[i]=null;s.cr='';const V={P:1,N:3,B:3,R:5,Q:9};
    for(const side of['w','b']){const rows=side==='w'?[7,6,5]:[0,1,2];const back=rows[0];let pts=39;const L=[];
      while(pts>0){const ok=Object.keys(V).filter(t=>V[t]<=pts);const t=pick(ok.concat(['P','P','N','B']).filter(x=>V[x]<=pts));L.push(t);pts-=V[t]}
      const sq=[];for(const r of rows)for(let c=0;c<8;c++)sq.push(r*8+c);
      const kp=pick(sq.filter(j=>R_(j)===back));s.b[kp]=side==='w'?'K':'k';
      for(const t of L){const E=sq.filter(j=>!s.b[j]&&!(t==='P'&&R_(j)===back));if(!E.length)break;const j=pick(E);s.b[j]=side==='w'?t:t.toLowerCase()}}
    const kb=kingSq(s.b,'b');if(_att(s.b,kb,'w'))for(const[d,e]of KG){const r=R_(kb)+d,c=C_(kb)+e;if(inB(r,c)){const j=r*8+c;const p=s.b[j];if(p&&col(p)==='w'&&up(p)!=='K'&&_att(s.b,kb,'w'))s.b[j]=null}}
    for(let i=0;i<64;i++){const p=s.b[i];if(p&&col(p)==='w'&&up(p)!=='K'){const t=s.b.slice();t[i]=null;if(_att(s.b,kb,'w')&&!_att(t,kb,'w'))s.b[i]=null}}}});

/* =================== BOT PERSONAS / POLICIES =================== */
add('classic',{name:'Persona Bot',sf:1,cfgDef:{who:'Stockfish',elo:3200},
  label:()=> 'Persona Bot',rule:'Normal chess against a bot persona with its own strength and quirks.'});
add('gauntlet',{name:'Bot Gauntlet',cfgDef:{gauntlet:{key:'default',levels:[400,800,1200,1600,2000,2400],names:['Beginner','Novice','Club','Intermediate','Advanced','Master']}},
  rule:'Climb the ladder: each win promotes you to a stronger bot. Losing keeps you on the same rung.'});
add('martinfish',{name:'Martinfish',def:{p:.5},
  rule:'Half Martin, half Stockfish: every move the bot flips a coin between a beginner move and the engine\'s best move.',
  policy:(L)=>Math.random()<(A().p||.5)?L[0]:L[rnd(L.length)]});
add('drawfish',{name:'DrawFish',rule:'DrawFish always plays the move that keeps the evaluation closest to 0.00.',
  policy:L=>L.reduce((a,b)=>Math.abs(b.v)<Math.abs(a.v)?b:a)});
add('copybot',{name:'Copycat Quality',rule:'The bot copies the quality of your last move: play the best move and it plays its best; blunder and it blunders too.',
  after:(g,m,prev)=>{if(prev&&prev.turn==='w')g.cq=quality(prev,m).pct},
  policy:L=>L[Math.round((G&&G.cq||0)*(L.length-1))]});
add('geometric',{name:'nth Best Move',rule:'The bot plays its nth best move with probability (1/2)^n: usually its best, sometimes its 2nd, rarely worse.',
  policy:L=>{let i=0;while(i<L.length-1&&Math.random()<.5)i++;return L[i]}});
add('colorbot',{name:'Light and Dark',rule:'The bot alternates: one move must land on a light square, the next on a dark square.',
  policy:(L,s)=>{G.cb=(G.cb||0)+1;const want=G.cb%2;const f=L.filter(x=>(R_(x.m.t)+C_(x.m.t))%2===want);return(f.length?f:L)[0]}});
add('rooksac',{name:'Rook Sacrificer',rule:'If the bot can put a rook where you can capture it, it must.',
  policy:L=>{const f=L.filter(x=>x.m.f>=0&&G.s.b[x.m.f]==='r'&&attacked(x.m.n.b,x.m.t,'w'));return(f.length?f:L)[0]}});
add('greedy',{name:'Greedy Bot',rule:'The bot refuses to checkmate you while you still have pieces besides your king. It wants to take all 31 first.',
  policy:(L,s)=>{const more=countPieces(s.b,'w')>0;let P=more?L.filter(x=>!isMate(x.m.n)):L;if(!P.length)P=L;const c=P.filter(x=>isCap(s,x.m));return(c.length&&c[0].v>P[0].v-300?c:P)[0]}});
add('mirror',{name:'Mirror Bot',rule:'The bot is your reflection: it copies your last move mirrored across the board whenever that is legal, otherwise it plays its best move.',
  policy:L=>{const lm=G&&G.last;if(lm&&lm.f>=0){const mf=(7-R_(lm.f))*8+C_(lm.f),mt=(7-R_(lm.t))*8+C_(lm.t);const x=L.find(o=>o.m.f===mf&&o.m.t===mt);if(x)return x}return L[0]}});
const SHIFT={bmove:'every move it makes',pbest:'every time you play the best move',pnotbest:'every time you do not play the best move',
  pworst:'every time you play the worst move',pcheck:'every time you give check',bcapchk:'every time it captures or gives check',cap:'on every capture (it alternates between 250 and 3600)'};
add('shiftelo',{name:'Shifting Elo',def:{start:3600,rule:'bmove',d:-50},
  label:a=>a.lbl||'Shifting Elo',
  ruleFor:a=>`The bot starts at ${a.start} Elo and ${a.rule==='cap'?'switches strength':(a.d>0?'gains ':'loses ')+Math.abs(a.d)+' Elo'} ${SHIFT[a.rule]}. Its current rating is shown under the board.`,
  rule:'The bot\'s rating changes as the game goes.',
  setup:(s,g)=>{g.elo=A().start||3600},
  after:(g,m,prev)=>{const a=A();if(!prev)return;const wm=prev.turn==='w';let d=0;
    if(a.rule==='bmove'&&!wm)d=a.d;
    if(wm&&(a.rule==='pbest'||a.rule==='pnotbest'||a.rule==='pworst')){const q=quality(prev,m);if((a.rule==='pbest'&&q.best)||(a.rule==='pnotbest'&&!q.best)||(a.rule==='pworst'&&q.worst))d=a.d}
    if(wm&&a.rule==='pcheck'){const k=kingSq(g.s.b,'b');if(k>=0&&attacked(g.s.b,k,'w'))d=a.d}
    if(!wm&&a.rule==='bcapchk'){const k=kingSq(g.s.b,'w');if(isCap(prev,m)||(k>=0&&attacked(g.s.b,k,'b')))d=a.d}
    if(a.rule==='cap'&&isCap(prev,m)){g.elo=g.elo>1000?250:3600;return}
    g.elo=Math.max(100,Math.min(3600,g.elo+d))},
  status:g=>'Bot Elo: '+g.elo,
  policy:L=>pickSt(L,eloSt(G.elo))});
add('fogx',{name:'Limited Vision',def:{v:'radius'},
  label:a=>a.lbl||({half:'3D Glasses',radius:'First-Person View',dark:'Total Darkness',blind:'Blindfold'})[a.v],
  ruleFor:a=>(a.lbl?a.lbl+': ':'')+({half:'through the glasses you only see enemy pieces on dark squares.',radius:'you only see enemy pieces within two squares of your own pieces.',dark:'the darkness hides every enemy piece that is not right next to one of yours.',blind:'enemy pieces are invisible. Only their last move is highlighted.'})[a.v],
  rule:'You only see enemy pieces close to your own pieces.',
  hidden:(s,i)=>{const v=A().v||'radius',p=s.b[i];if(!p||isWall(p)||col(p)!=='b')return false;
    if(v==='blind')return true;if(v==='rooks')return up(p)==='R';if(v==='half')return (R_(i)+C_(i))%2===0;const d=v==='dark'?1:2;
    for(let j=0;j<64;j++){const q=s.b[j];if(q&&!isWall(q)&&col(q)==='w'&&Math.max(Math.abs(R_(j)-R_(i)),Math.abs(C_(j)-C_(i)))<=d)return false}return true}});
add('pawndrop',{name:'Infinite Pawn Drops',def:{},depth:2,
  rule:'You start with only your king and one pawn. After each of your moves you gain a pawn, and placing a pawn on any empty square (not the first or last rank) counts as your move.',
  setup:s=>{for(let i=48;i<64;i++)if(s.b[i]!=='K')s.b[i]=null;s.b[52]='P';s.cr=s.cr.replace(/[KQ]/g,'');s.x.pd=0},
  xgen:(s,mv)=>{if(s.turn==='w'&&s.x.pd>0)for(const j of emptySq(s.b,[1,2,3,4,5,6]))mv.push({f:-1,t:j,drop:'P'});return mv},
  xmake:(s,m,n)=>{if(s.turn!=='w')return;if(m.drop==='P')n.x.pd=s.x.pd-1;else n.x.pd=s.x.pd+1},
  status:g=>'Pawns to place: '+g.s.x.pd});
add('fogking',{name:'Fog of War (capture the king)',nocheck:1,
  rule:'You only see your own pieces and the squares they can move to. There is no check: kings may walk into danger, and you win by capturing the enemy king.',
  win:s=>kingSq(s.b,'b')<0?{w:'w',why:'you captured the king'}:kingSq(s.b,'w')<0?{w:'b',why:'your king was captured'}:null,
  hidden:(s,i)=>{const p=s.b[i];if(!p||isWall(p)||col(p)!=='b')return false;const own=gen(Object.assign({},s,{turn:'w'}));return !own.some(m=>m.t===i)}});
add('troll',{name:'King of the Bridge (Troll Chess)',def:{every:4},
  rule:'You play against the Troll. Every few turns the Troll cheats: one of its pieces makes an illegal queen-style move. When it cheats, you get payback: two moves in a row on your next turn. Checkmate the Troll to cross the bridge.',
  multi:()=>({w:G&&G.s&&G.s.x&&G.s.x.pay?2:1,b:1}),
  after:(g,m,prev)=>{const s=g.s;if(prev&&prev.turn==='w'&&s.x.pay&&s.turn==='b')s.x.pay=0;if(s.turn!=='w'||g.over)return;s.x.tc=(s.x.tc||0)+1;if(s.x.tc%(A().every||4))return;
    const K=kingSq(s.b,'w');const L=[];for(let i=0;i<64;i++){const p=s.b[i];if(!p||isWall(p)||col(p)!=='b'||up(p)==='K')continue;
      for(const[d,e]of KG){let rr=R_(i)+d,cc=C_(i)+e;while(inB(rr,cc)){const j=rr*8+cc;if(s.b[j])break;if(!(up(p)==='P'&&(rr===7)))L.push([i,j]);rr+=d;cc+=e}}}
    const ok=L.filter(([i,j])=>{const tb=s.b.slice();tb[j]=tb[i];tb[i]=null;return K<0||true});if(!ok.length)return;const[i,j]=pick(ok);s.b[j]=s.b[i];s.b[i]=null;s.x.pay=1;s.cr='';
    g.msg='The Troll cheated ('+sqName(i)+' to '+sqName(j)+')! Payback: you get two moves.'},
  status:g=>g.s.x.pay&&g.s.turn==='w'?'Payback: you move twice':'',
  win:s=>kingSq(s.b,'b')<0?{w:'w',why:'you captured the Troll king'}:null});
add('chessformer',{name:'Chessformer',walls:1,depth:3,
  rule:'A side-view platform level. Your pieces fall straight down after every move until they land on a platform or another piece. Capture the red king (land a piece where it attacks the king) to clear the level.',
  setup:s=>{for(let i=0;i<64;i++)s.b[i]=null;s.cr='';for(let c=0;c<8;c++)s.b[56+c]='#';
    for(const j of[34,35,36, 29,30,31, 2,8,9,17,40])s.b[j]='#';s.b[0]='r';s.b[22]='k';s.b[48]='K';s.b[50]='R';s.b[51]='B'},
  xlegal:(s,ms)=>{if(s.turn!=='b')return ms;const nk=ms.filter(m=>s.b[m.f]!=='k');return nk.length?nk:ms},
  xmake:(s,m,n)=>{if(s.turn!=='w'||m.f<0)return;let j=m.t;const p=n.b[j];if(!p)return;while(R_(j)<7&&!n.b[j+8]){n.b[j+8]=p;n.b[j]=null;j+=8}},
  win:s=>{const k=kingSq(s.b,'b');if(k<0)return{w:'w',why:'you captured the red king'};return s.turn==='b'&&_att(s.b,k,'w')?{w:'w',why:'you captured the red king'}:null},
  wallStyle:()=>'wall'});
add('locust',{name:'The Locust',walls:1,def:{p:.66},
  rule:'After every full turn there is a 66% chance the Locust marks a random square (shown in red). One turn later that square is evaporated for the rest of the game, together with any piece still on it. Move your pieces off marked squares in time.',
  after:g=>{const s=g.s;if(s.turn!=='w')return;
    if(s.x.lt>=0){const j=s.x.lt,p=s.b[j];s.b[j]='#';s.x.lt=-1;if(p&&!isWall(p)){g.msg='The Locust evaporated '+sqName(j)+' and the piece on it.';if(up(p)==='K'){g.over=col(p)==='w'?{w:'b',why:'the Locust deleted your king'}:{w:'w',why:'the Locust deleted the bot king'};return}}else g.msg='The Locust evaporated '+sqName(j)+'.';if(s.cr)fixCR(s)}
    else if(Math.random()<(A().p||.66)){const E=[];for(let i=0;i<64;i++)if(!isWall(s.b[i]))E.push(i);s.x.lt=pick(E);g.msg='The Locust is targeting '+sqName(s.x.lt)+'.'}},
  setup:s=>{s.x.lt=-1},status:g=>g.s.x.lt>=0?'Locust target: '+sqName(g.s.x.lt):'',wallStyle:()=>'hole'});
add('clock',{name:'Time Pressure',cfgDef:{clock:{total:60,inc:0}},rule:'You play on a clock. Run out of time and you lose; the bot moves instantly.'});
add('speedrun',{name:'Speedrun',cfgDef:{speed:25},rule:'Win within 25 of your moves, or the run fails.'});
const ROUL=['maze','duck','dice','petrified','snipers','magnets','midas','portals','sideways','torpedo','captureany','anarchy','shapeshift','wrap','breaking','fivemoves','craft','trojan','secretq'];
add('roulette',{name:'Variant Roulette',def:{hide:false},
  label:a=>a.lbl||'Variant Roulette',
  ruleFor:a=>(a.lbl?a.lbl+': ':'')+(a.hide?'one secret twist from the arcade is active this game. Figure out which before it costs you.':'each new game spins a random twist from the arcade (named under the board).'),
  rule:'Each new game spins a random twist from the arcade.',
  setup:(s,g)=>{const base=MX[pick(ROUL)];const keep=MODE;const sub=Object.create(base);sub.cfg=keep.cfg;sub.rspin=keep.rspin||keep;
    sub.name=keep.name;sub.rule=keep.rule;sub.def=base.def;sub.label=base.label;
    // the roulette object stays the "entry" so New game spins again
    sub.setup=function(s2,g2){return MODE.rspin.setup(s2,g2)};MODE=sub;F.walls=!!base.walls;F.on=!!base.fairy;
    g.spin=base.name;base.setup.call(sub,s,g)},
  status:g=>g.spin?(A().hide&&!g.over?'Twist: hidden':'Twist: '+g.spin):''});

add('timetravel',{name:'Time Travel',cfgDef:{rewind:1},
  rule:'Your pieces can travel back in time: once per game press Rewind to take back your last move and the bot\'s reply.'});
add('fourp',{name:'4 Player Chess',def:{w:1,b:2},depth:2,multi:()=>{const a=A();return{w:a.w||1,b:a.b||2}},
  label:a=>a.lbl||'4 Player Chess',
  ruleFor:a=>(a.team?'You and your teammate share White and make 2 moves per turn; the two enemy armies share Black and make 2. ':'You face several opponents at once: the bot side moves twice per turn while you move once. ')+'A move that gives check ends that side\'s turn early.',
  rule:'Several opponents at once: the bot side moves twice per turn.',
  win:s=>kingSq(s.b,'b')<0?{w:'w',why:'you captured the king'}:kingSq(s.b,'w')<0?{w:'b',why:'your king was captured'}:null,
  status:g=>{const N=MODE.multi()[g.s.turn];return N>1?`${g.s.turn==='w'?'Your':'Bot'} move ${(g.s.x.sub||0)+1} of ${N}`:''}});

/* =================== UI WRAPPERS =================== */
function wallStyle(p){if(p==='$')return 'gold';if(p==='@')return 'duck';if(p==='%')return 'shy';return MODE.wallStyle?MODE.wallStyle():'wall'}
function decorate(){const bd=$('board');const kids=bd&&bd.children;if(!kids||kids.length<64||!G)return;const s=G.s,x=s.x||{},M=MODE;
  for(let i=0;i<64;i++){const p=s.b[i];let h='';
    if(isWall(p))h+=`<span class="x-blk x-blk--${wallStyle(p)}"></span>`;
    else if(p&&FAIRY.includes(up(p))&&!(M.hidden&&!G.over&&M.hidden(s,i)))h+=`<span class="x-fy">${FTAG[up(p)]}</span>`;
    if(x.frz===i)h+='<span class="x-ice"></span>';
    if(x.mons&&x.mons.includes(i)&&(!M.visible||G.over||M.visible(s,i)))h+='<span class="x-monst"></span>';
    if(x.por&&x.por.includes(i))h+=`<span class="x-portal${x.por[1]===i?' x-portal--b':''}"></span>`;
    if(x.sq===i&&p==='P')h+='<span class="x-secret"></span>';
    if(x.nk&&x.nk.includes(i)&&p==='Q')h+='<span class="x-nk"></span>';
    if(x.lt>=0&&x.lt===i)h+='<span class="x-warn"></span>';
    if(x.crk&&x.crk.includes(','+i+','))h+='<span class="x-crack"></span>';
    if(x.choice&&s.turn==='w'&&x.choice.some(k=>+k.split('-')[0]===i))h+='<span class="x-mark2"></span>';
    if(M.badge&&p&&col(p)==='w'&&!isWall(p)){const t=M.badge(s,i);if(t)h+=`<span class="x-fy">${t}</span>`}
    const el=kids[(typeof FLIP!=='undefined'&&FLIP)?63-i:i];if(h&&el&&el.insertAdjacentHTML)el.insertAdjacentHTML('beforeend',h)}}
function extraStatus(){if(!G)return'';const c=C(),parts=[];
  if(MODE.status){const t=MODE.status(G);if(t)parts.push(t)}
  if(c.gauntlet){const k=GL[c.gauntlet.key]||0,L=c.gauntlet.levels;parts.push(`Rung ${Math.min(k,L.length-1)+1} of ${L.length}: ${(c.gauntlet.names||[])[Math.min(k,L.length-1)]||''} (${L[Math.min(k,L.length-1)]})`)}
  else if(c.who&&c.elo&&!MODE.status)parts.push(`${c.who} (${c.elo})`);
  if(G.hearts!=null)parts.push('Hearts: '+Math.max(0,G.hearts));
  if(c.speed)parts.push(`Moves left: ${Math.max(0,c.speed-(G.pmoves||0))}`);
  if(G.rew!=null)parts.push('Rewinds left: '+G.rew);
  if(G.over&&MODE.overText){const t=MODE.overText(G);if(t)parts.push(t)}
  return parts.join(' · ')}
let REW=null,INFO=null;
if(HAS_DOM){try{const ref=$('undo')||$('newg');if(ref&&ref.parentNode){REW=document.createElement('button');REW.type='button';REW.className=ref.className||'btn';REW.id='xrew';REW.textContent='Rewind';REW.hidden=true;
    ref.parentNode.insertBefore(REW,ref);REW.addEventListener('click',()=>rewind())}
  const mv=$('moves')||$('status');if(mv&&mv.parentNode){INFO=document.createElement('p');INFO.className='x-clock';INFO.id='xinfo';INFO.hidden=true;mv.parentNode.insertBefore(INFO,mv)}
  setInterval(()=>{if(!G||!G.clk||!INFO)return;const left=G.clk.left-(G.s.turn==='w'&&!G.over&&!busy?Date.now()-G.clk.start:0);INFO.textContent=infoLine(left);
    if(left<=0&&!G.over&&G.s.turn==='w'){G.over={w:'b',why:'you ran out of time'};render()}},250)}catch(e){console.warn(e)}}
function infoLine(left){const ex=extraStatus();const parts=[];if(G.clk)parts.push('Your clock '+fmtT(left!=null?left:G.clk.left));if(ex)parts.push(ex);if(G.xmsg&&!G.over)parts.push(G.xmsg);return parts.join(' · ')}
function rewind(){if(!G||busy||G.over||G.s.turn!=='w'||!(G.rew>0)||!G.hist||G.hist.length<2)return false;
  G.hist.pop();G.s=G.hist[G.hist.length-1];G.rew--;G.sel=-1;G.hand=null;G.last=null;G.xprev=G.s;if(G.clk)G.clk.start=Date.now();
  G.ms=legal(G.s);G.msg='You traveled back in time one move.';render();return true}
const _render=render;
render=function(){if(!G||!G.s)return _render();const s=G.s,real=s.b,M=MODE;
  if(!M.xm&&!M.cfg&&!F.on)return _render();
  const disp=real.map((p,i)=>{if(!p)return p;if(isWall(p))return null;if(M.hidden&&!G.over&&M.hidden(s,i))return null;const t=up(p);
    if(FAIRY.includes(t))return col(p)==='w'?FIMG[t]:FIMG[t].toLowerCase();return p});
  if(G.over&&!G.xdone){G.xdone=1;try{if(M.onOver)M.onOver(G);const c=C();if(c.gauntlet&&G.over.w==='w'){const k=c.gauntlet.key;GL[k]=Math.min((GL[k]||0)+1,c.gauntlet.levels.length-1)}}catch(e){}}
  if(G.cap){const fx=a=>a.filter(t=>!WALL[t]).map(t=>FAIRY.includes(t)?FIMG[t]:t);G.cap.w=fx(G.cap.w);G.cap.b=fx(G.cap.b)}
  s.b=disp;try{_render()}finally{s.b=real}
  decorate();
  const line=infoLine();if(INFO){INFO.textContent=line;INFO.hidden=!line}G.xline=line;
  const c=C();if(c.who&&$('botname'))$('botname').textContent=c.who+(c.elo?' · '+c.elo:'');
  if(c.gauntlet&&$('botname')){const k=Math.min(GL[c.gauntlet.key]||0,c.gauntlet.levels.length-1);$('botname').textContent=(c.gauntlet.names[k]||'Bot')+' · '+c.gauntlet.levels[k]}
  if(M.id==='blocks'||(M.rspin&&M.id==='blocks')){const left=s.x.bw;const hd=$('hand');if(hd)hd.innerHTML=left>0&&s.turn==='w'&&!G.over?`<button type="button" data-drop="#" aria-pressed="${G.hand==='#'}"><span class="x-hb"></span><small>${left}</small></button>`:''}
  if(M.xcount&&$('cntlab')&&M.cntLabel)$('cntlab').textContent=M.cntLabel();
  if(REW){REW.hidden=!(G.rew!=null);REW.textContent='Rewind ('+(G.rew||0)+')';REW.disabled=!(G.rew>0)}
  if(G.rew!=null&&$('undo'))$('undo').disabled=true;};
const _tap=tap;
tap=function(i){if(G&&G.s&&isWall(G.s.b[i])&&!G.hand){G.sel=-1;render();return}
  if(G&&!G.over&&!busy&&G.s.turn==='w'&&G.sel>=0&&MODE.xm&&MODE.xlegal&&!G.ms.find(x=>x.f===G.sel&&x.t===i)&&_legal(G.s).find(x=>x.f===G.sel&&x.t===i)){
    G.msg=MODE.id==='drawback'?'That move breaks your hidden drawback.':'That move is not allowed right now.';G.sel=-1;render();return}
  return _tap(i)};
const _useSF=useSF;
useSF=function(){const M=MODE;if(!M.xm&&!M.cfg)return !F.on&&!F.walls&&_useSF();
  if(!M.xm)return false;if(!M.sf||M.policy||F.on||F.walls||M.hand)return false;const e=botElo();return e==null||e>=2700};
const _open=openMode;
openMode=function(m,arg,from,intro){F.on=false;F.walls=false;ARG=arg;
  const xc=m.xcount;if(xc){CNT=(arg&&arg.n)||(m.def&&m.def.n)||1;const ip=$('cnt');if(ip&&ip.max!=null)ip.max=16}
  _open(m,arg,from,intro);
  if(MODE.xm||MODE.cfg){if($('mname'))$('mname').textContent=MODE.name;if($('mrule'))$('mrule').textContent=MODE.rule;
    if(MODE.xcount){$('cntwrap').hidden=false;$('cnt').value=CNT;if(MODE.cntLabel)$('cntlab').textContent=MODE.cntLabel()}}};

/* =================== PER-VIDEO MAPPING =================== */
const BYNAME=n=>MODES.find(m=>m.name===n&&!m.xm);
const norm=t=>t.normalize('NFD').replace(/[\u0300-\u036f\u0489]/g,'').replace(/\s+/g,' ').trim();
const VERB={SURVIVE:2200,MASTER:2600,BEAT:1600,CRUSH:1000,DESTROY:1100,DOMINATE:1200,DEMOLISH:1000,SMASH:1000,POUND:1000,SLAY:1100,DEFEAT:1400,CONQUER:1800,
  OUTPLAY:1500,OUTSMART:1700,ENDURE:2000,DEVOUR:900,GOBBLE:900,DECIMATE:1100,GAMBLE:1300,BAMBOOZLE:1300,FIRMLY:1500,DISMANTLE:1200,SILENCE:1300,UNSEE:1500,
  IGNORE:1200,WIN:1700,LEARN:1200,PODIUM:2000,COMEBACK:1500,SOLVE:1600};
function verbOf(t){const m=t.match(/Can I ([A-Z]{3,})/);return m&&VERB[m[1]]?m[1]:null}
const cap=w=>w.charAt(0)+w.slice(1).toLowerCase();
function personaOf(t){const f=t.match(/feat\.? ([^)]+)\)/i);
  const P=[[/stockfish 17/i,'Stockfish 17',3600],[/stockfish 10/i,'Stockfish 10',3300],[/stockfih/i,'Stockfih (a bootleg Stockfish)',1100,'chatgpt'],[/stockfish/i,'Stockfish',3600],
    [/komodo/i,'Komodo',3200],[/leela/i,'Leela',3400],[/magnus/i,'Magnus',2850],[/hikaru/i,'Hikaru',2800],[/ding liren/i,'Ding Liren',2780],
    [/gotham ?baby/i,'Gotham Baby',600],[/gothamchess|gotham/i,'GothamChess',2300],[/ben finegold/i,'GM Ben Finegold',2500],[/evil martin/i,'Evil Martin',2600],
    [/martins?\b/i,'Martin',250],[/zach/i,'Zach',1400],[/granny/i,'Granny',400],[/judit polgar/i,'Judit Polgar',2700],[/2000 elo/i,'a 2000-rated player',2000],
    [/3200 engine/i,'a 3200 engine',3200],[/national master/i,'a National Master',2200],[/chatgpt/i,'ChatGPT',600,'chatgpt'],[/goose/i,'the Goose',150],
    [/lapeace/i,'LaPeace Bot',2100],[/manuel/i,'Manuel Bot',1900],[/sinta/i,'The SINTA Bot',1700],[/chess cheater/i,'a Chess Cheater',1300,'cheater'],
    [/chess youtuber/i,f?f[1]:'a Chess YouTuber',2000],[/grandmaster/i,'a Grandmaster',2500],[/lichess/i,'Lichess Stockfish (level 8)',2900],[/hunters/i,'the Hunters',1500]];
  for(const[re,who,elo,style]of P)if(re.test(t))return{who,elo,style};return null}
const GSETS={
  beginner:[[250,400,550,700,850],['Beginner 1','Beginner 2','Beginner 3','Beginner 4','Beginner 5']],
  intermediate:[[1000,1150,1300,1450,1600],['Intermediate 1','Intermediate 2','Intermediate 3','Intermediate 4','Intermediate 5']],
  advanced:[[1600,1800,2000,2200,2400],['Advanced 1','Advanced 2','Advanced 3','Advanced 4','Advanced 5']],
  christmas:[[500,900,1300,1700,2200],['Elf','Snowman','Reindeer','Mrs. Claus','Santa']],
  halloween:[[500,900,1300,1700,2200],['Ghost','Witch','Vampire','Werewolf','Pumpkin King']],
  karate:[[400,800,1200,1600,2100],['White Belt','Yellow Belt','Green Belt','Brown Belt','Black Belt']],
  bbq:[[500,900,1300,1700,2100],['Grill Apprentice','Burger Flipper','Pitmaster','Smoke Lord','BBQ Champion']],
  runescape:[[400,800,1200,1700,2300],['Goblin','Guard','Knight','Wizard','Dragon']],
  earth:[[400,800,1200,1600,2000],['Seedling','Sapling','Oak','Rainforest','Gaia']],
  december:[[500,900,1300,1800,2300],['Snowflake','Icicle','Blizzard','Frost Giant','Winter King']],
  judit:[[1200,1700,2200,2500,2735],['Young Judit','Prodigy Judit','IM Judit','GM Judit','Peak Judit']],
  pieces:[[300,700,1000,1400,1900,2400],['Pawn Bot','Knight Bot','Bishop Bot','Rook Bot','Queen Bot','King Bot']],
  trash:[[600,1000,1400,1800,2200],['Mouthy','Loudmouth','Smack Talker','Roaster','Trash King']],
  gm:[[2500,2550,2600,2650,2700],['GM #1','GM #2','GM #3','GM #4','GM #5']],
  top:[[1800,2000,2200,2400,2600],['Top 10%','Top 5%','Top 1%','Top 0.5%','Top 0.1%']],
  smurf:[[800,1200,1600,2000,2400],['800 player','1200 player','1600 player','2000 player','2400 player']],
  nm:[[1500,1700,1900,2100,2200],['Class C','Class B','Class A','Expert','National Master']],
  tour:[[1400,1600,1800,2000,2200],['Round 1','Round 2','Round 3','Semifinal','Final']],
  roblox:[[300,600,900,1200,1500],['Noob','Guest','Builder','Pro','Admin']],
  cbeasy:[[1,100,150,250,400,550],['Zach','Pepe','150 Bot','Martin','Juan','550 Bot']],
  battle:[[400,700,1000,1300,1600,1900],['Peasant','Farmer','Artisan','Nobleman','Clergyman','Monarch']],
  family:[[250,400,600,900,1300],['Baby Martin','Martin','Martin\'s Sister','Martin\'s Dad','Martin\'s Grandma']]};
const G_=(key,set,extra)=>Object.assign({gauntlet:{key,levels:GSETS[set][0],names:GSETS[set][1]}},extra||{});
const TRASH=['Is that your best move?','My grandma plays faster.','I have seen better moves from a toaster.','You call that an attack?','Resign already.'];
const PIECE_W={queens:'Q',queen:'Q',knights:'N',knight:'N',rooks:'R',rook:'R',roooooks:'R',bishops:'B',bishop:'B',pawns:'P',pawn:'P',dragons:'A',dragon:'A',
  amazons:'D',knooks:'C',knibis:'A',elephants:'E',elephant:'E',snakes:'G',snake:'G',fish:'N',minions:'P',nukes:'Q'};
/* Each rule: [regex on normalised title, (title,match,cat) => spec]. spec = {id | base, a: config, c: layers, name, why} */
const RULES=[
 [/^Backrooms Chess$/i,()=>({id:'maze',a:{layout:'random',style:'yellow',n:12},name:'Backrooms Maze'})],
 [/pocket dimension|scp-?106/i,()=>({id:'scp106'})],
 [/darkness/i,()=>({id:'fogx',a:{v:'dark',lbl:'The Darkness'},name:'The All-Consuming Darkness'})],
 [/can't look at (scp|spc)-?096/i,()=>({id:'fogx',a:{v:'blind',lbl:'SCP-096'},name:"Don't Look at SCP-096"})],
 [/(scp|spc)-?096/i,()=>({id:'fogx',a:{v:'radius',lbl:'SCP-096 in the Fog'},name:'SCP-096 in the Fog'})],
 [/scp-?173/i,()=>({id:'scp173n'})],[/scp-?939/i,()=>({id:'scp939'})],[/scp-?682/i,()=>({id:'scp682'})],[/scp-?049/i,()=>({id:'scp049'})],
 [/scp-?035/i,()=>({id:'scp035'})],[/scp-?2845/i,()=>({id:'scp2845'})],[/scp-?426/i,()=>({id:'scp426'})],[/scp-?966/i,()=>({id:'scp966'})],
 [/scp-?2774/i,()=>({id:'scp2774'})],[/scp-?409/i,()=>({id:'petrified',a:{who:'w',lbl:'SCP-409 Freezes Your Pieces'},name:'SCP-409 Freeze'})],
 [/10 scps|containment breach/i,()=>({id:'breach'})],
 [/boiled one/i,()=>({id:'petrified',a:{who:'w',lbl:'The Boiled One Paralyzes You'},name:'The Boiled One'})],
 [/waldo/i,()=>({id:'watcher',name:'Waldo Finds You'})],[/mal0/i,()=>({id:'stalker',name:'Mal0 Is Stalking You'})],
 [/he brings you despair/i,()=>({id:'stalker',name:'He Brings You Despair',c:{every:1}})],[/gabriel/i,()=>({id:'scp2845',name:'Archangel Gabriel'})],
 [/he knows you are alone/i,()=>({id:'room',name:'He Knows You Are Alone'})],[/locust/i,()=>({id:'locust',name:'The Locust Is In Your Computer'})],
 [/anish giri grabs/i,()=>({id:'grab',name:'Anish Giri Grabs Pieces'})],[/snake vs chess/i,()=>({id:'snake',name:'Snake vs Chess'})],
 [/pac-man/i,()=>({id:'pacman'})],
 // ---- drawback / dice ----
 [/drawback|paranoia/i,(t)=>{const h=hash(t);const show=/I KNOW|I Can SEE|EXPOSED/i.test(t);const hard=/HARD|HARDEST/i.test(t);
   const mine=[h%DRAWBACKS.length];if(hard)mine.push((h>>>3)%DRAWBACKS.length===mine[0]?(mine[0]+1)%DRAWBACKS.length:(h>>>3)%DRAWBACKS.length);
   const v=verbOf(t);const tag=/paranoia/i.test(t)?'Paranoia':/YOU Don't Know MY/i.test(t)?'You Don\'t Know Mine':/I KNOW/i.test(t)?'I Know Mine':/SEE/i.test(t)?'I Can See Mine':/Don't Know My/i.test(t)?'Hidden Drawback':/HARDEST/i.test(t)?'Hardest':/HARD/i.test(t)?'Hard':/EVEN MORE/i.test(t)?'Even More':/MORE/i.test(t)?'More'+(v?' · '+cap(v):''):v?cap(v):'Classic';
   return{id:'drawback',a:{show,hard:hard?1:0,mine,bot:(h>>>6)%DRAWBACKS.length,botShown:/YOU Don't Know MY/i.test(t)?false:show&&/SEE/i.test(t),tag}}}],
 [/dice chess/i,(t)=>{const v=verbOf(t)||'';const two=/MORE/i.test(t);return{id:'dice',a:{n:two?2:1,botFree:/GAMBLE|BAMBOOZLE/i.test(t)},name:'Dice Chess'+(two?' (two dice)':'')+(v?' · '+cap(v):'')}}],
 // ---- powerups & twists ----
 [/duck/i,()=>({id:'duck'})],
 [/place mines|landmines/i,()=>({base:'Landmines'})],
 [/breaking squares/i,()=>({id:'breaking'})],
 [/stone gravitation/i,()=>({base:'Gravity',name:'Stone Gravitation'})],[/with gravity/i,()=>({base:'Gravity',name:'Conquer Chess with Gravity'})],[/have gravity/i,()=>({base:'Gravity',name:'My Pieces Have Gravity'})],
 [/upgraded (rooks|bishops|knights)/i,(t,m)=>({id:'fairy',a:{k:{rooks:'upR',bishops:'upB',knights:'upN'}[m[1].toLowerCase()]}})],[/upgraded pawns/i,()=>({id:'torpedo',name:'Upgraded Pawns (torpedo pawns)'})],
 [/martin's family/i,()=>({id:'gauntlet',c:G_('family','family'),name:"Martin's Family"})],
 [/pieces can time travel/i,()=>({id:'timetravel'})],[/captures are permanent/i,()=>({id:'permacap'})],
 [/tiny 5d/i,()=>({id:'mini',a:{v:'5x5'},c:{rewind:2},name:'Tiny 5D Chess'})],[/5d chess/i,()=>({id:'timetravel',c:{rewind:3},name:'5D Chess (3 rewinds)'})],
 [/knights can mate/i,()=>({id:'breed'})],[/pawns can reproduce/i,()=>({id:'reproduce'})],[/2 eggs/i,()=>({id:'reproduce',name:'2 Eggs Are Better Than 1',a:{max:16}})],
 [/magnets/i,()=>({id:'magnets'})],[/midas/i,()=>({id:'midas'})],[/portals?/i,(t)=>({id:'portals',name:/Added/i.test(t)?'I Added Portals':'Portals'})],
 [/minecraft blocks/i,()=>({id:'blocks'})],[/chess in minecraft/i,()=>({id:'blocks',a:{n:6},name:'Chess in Minecraft'})],[/soko/i,()=>({id:'maze',a:{layout:'crates',n:6},name:'Soko Chess'})],
 [/snipers/i,()=>({id:'snipers'})],[/secret(ly)? (a )?queen/i,(t)=>({id:'secretq',name:/Stockfish/i.test(t)?'Secret Queen vs Stockfish':/Can I BEAT Secret/i.test(t)?'Secret Queen Chess':'Secretly a Queen'})],
 [/trojan/i,()=>({id:'trojan'})],[/launch/i,()=>({id:'launch'})],[/torpedo/i,()=>({id:'torpedo'})],[/sideways pawns/i,()=>({id:'sideways'})],
 [/capture anything/i,()=>({id:'captureany'})],[/can't capture pieces/i,()=>({id:'nocap',a:{side:'w',until:99}})],
 [/0% damage/i,()=>({id:'nocap',a:{side:'w',until:99},name:'0% Damage'})],[/with no captures/i,()=>({id:'nocap',a:{side:'both',until:10}})],
 [/only 5 moves/i,()=>({id:'fivemoves'})],[/offside/i,()=>({id:'offside'})],
 [/lose half my time/i,()=>({id:'clock',c:{clock:{total:120,halve:true}},name:'Half My Time Every Move'})],
 [/laws of islam/i,()=>({id:'ancient',a:{k:'shatranj'},name:'Shatranj (Medieval Islamic Chess)'})],
 [/1 nuke vs\.? 1 dragon/i,()=>({id:'nuke',a:{foe:'dragon',n:1}})],[/1 nuke vs\.? 1 queen/i,()=>({id:'nuke',a:{foe:'queen',n:1}})],
 [/1 nuke vs 10 knights/i,()=>({id:'nuke',a:{foe:'knights',n:1}})],[/1 nuke vs 250,000/i,()=>({id:'nuke',a:{foe:'pawns2',n:1}})],
 [/1 nuke vs 100 pawns/i,()=>({id:'nuke',a:{foe:'pawns',n:1}})],[/3 bombs/i,()=>({id:'nuke',a:{foe:'army',n:3,pawns:1,lbl:'3 Bombs vs Stockfish'}})],
 [/how many nukes/i,()=>({id:'nuke',a:{foe:'army',n:2,xcount:1,pawns:1,lbl:'How Many Nukes to Beat Gotham Baby?'}})],
 [/bazooka/i,()=>({id:'nuke',a:{foe:'army',n:1,pawns:1,lbl:'1 Bazooka vs 1 Granny'}})],
 [/martin explodes/i,()=>({base:'Atomic',name:'Martin Explodes My Pieces'})],[/explosive magic/i,()=>({base:'Atomic',name:'Explosive Magic'})],[/atomic/i,()=>({base:'Atomic'})],
 [/∞ pawns/i,()=>({id:'pawndrop'})],[/horde/i,()=>({base:'Horde'})],
 [/king of the hill/i,()=>({base:'King of the Hill'})],[/king of the bridge/i,(t)=>{const e=t.match(/\((.+?) Ending\)|\((.+?) Award\)/);return{base:'King of the Hill',name:'King of the Bridge'+(e?' · '+(e[1]||e[2]):'')}}],
 [/higher ground/i,()=>({base:'King of the Hill',name:'Higher Ground'})],[/war for throne/i,()=>({base:'King of the Hill',name:'War for the Throne'})],
 [/who takes the crown/i,(t)=>({base:'King of the Hill',name:'Who Takes the Crown'+(/Influencer/i.test(t)?' · Influencer Levels':/MASTER/.test(t)?' · Master':'')})],
 [/3\+ chess tournament/i,()=>({id:'clock',c:Object.assign(G_('3plus','tour'),{clock:{total:180,inc:2}}),name:'3+2 Tournament'})],
 [/3 check|3 strikes/i,(t)=>({base:'3-Check',name:/strikes/i.test(t)?'3 Strikes':undefined})],
 [/4 player giveaway/i,()=>({base:'Giveaway',name:'4 Player Giveaway'})],[/giveaway|antichess/i,()=>({base:'Giveaway'})],
 [/checkers|clobber/i,(t)=>({base:'Giveaway',name:/sergeant/i.test(t)?"Sergeant's Checkers":/clobber/i.test(t)?'Clobber':'Checkers Chess'})],
 [/4 player team/i,()=>({id:'fourp',a:{w:2,b:2,team:1,lbl:'4 Player Team Chess'}})],[/4 player/i,()=>({id:'fourp',a:{w:1,b:2}})],
 [/960|freestyle/i,()=>({base:'Chess960'})],[/mix master/i,()=>({base:'Chess960',name:'Mix Master'})],
 [/chess roulette/i,(t)=>({id:'roulette',a:{lbl:'Chess Roulette'+(/Stockfish/i.test(t)?' vs Stockfish':'')}})],[/spinner wheel/i,(t)=>({id:'roulette',a:{lbl:/REMATCH/.test(t)?'Spinner Wheel: The Rematch':/^Spinner/.test(t)?'Spinner Wheel Chess':'Spinner Wheel'}})],
 [/rainbow/i,()=>({id:'fairy',a:{k:'rainbow'}})],[/racing kings/i,()=>({base:'Racing Kings'})],[/fog of war/i,()=>({base:'Fog of War'})],
 [/blindfolded bots/i,()=>({id:'fogx',a:{v:'blind',lbl:'Blindfolded Bots'},c:G_('blindbots','beginner')})],[/blindfold/i,(t)=>({id:'fogx',a:{v:'blind',lbl:/Hikaru/i.test(t)?'Blindfold Hikaru':'Blindfold Chess'}})],
 [/ambush/i,()=>({id:'fogx',a:{v:'radius',lbl:'Ambush'}})],[/phantom rooks/i,()=>({id:'fogx',a:{v:'rooks',lbl:'Phantom Rooks'}})],
 [/fps chess/i,()=>({id:'fogx',a:{v:'radius',lbl:'FPS Chess'}})],[/3d glasses/i,()=>({id:'fogx',a:{v:'half',lbl:'3D Glasses'}})],
 [/tinyhouse|minihouse/i,()=>({id:'mini',a:{v:'minihouse'},name:'Tinyhouse'})],
 [/setup chess/i,(t)=>({id:'setupchess',name:'Setup Chess'})],
 [/crazyhouse|bughouse|seirawan|setup chess|spell chess|shogi/i,(t)=>({base:'Crazyhouse-lite',name:(t.match(/crazyhouse|bughouse|seirawan|setup chess|spell chess|shogi/i)[0]).replace(/\b\w/g,x=>x.toUpperCase())})],
 [/mini chess/i,()=>({id:'mini',a:{v:'6x6'}})],[/tiny chess/i,()=>({id:'mini',a:{v:'5x5'}})],[/1d chess/i,()=>({id:'mini',a:{v:'1d'}})],
 [/speedrunner/i,()=>({id:'lone',a:{k:'run'}})],
 [/2 moves vs 1 move/i,()=>({id:'multi',a:{w:2,b:1}})],[/1 move vs 2 martins/i,()=>({id:'multi',a:{w:1,b:2,lbl:'1 Move vs 2 Martins'}})],
 [/2 moves vs 3200/i,()=>({id:'multi',a:{w:2,b:1,lbl:'2 Moves vs a 3200 Engine'}})],[/3 martins vs 1 move/i,()=>({id:'multi',a:{w:1,b:3,lbl:'3 Martins vs 1 Move'}})],
 [/1 move on 2 boards/i,()=>({id:'multi',a:{w:1,b:2,lbl:'1 Move on 2 Boards'}})],[/1 move vs 5 moves/i,()=>({id:'multi',a:{w:1,b:5,lbl:'1 Move vs 5 Moves'}})],
 [/kung fu/i,()=>({id:'multi',a:{w:2,b:2,lbl:'Kung Fu Chess'}})],[/how many martins/i,()=>({id:'multi',a:{w:2,b:1,lbl:'How Many Martins to Beat Stockfish'}})],
 [/hyper chess/i,()=>({id:'setuppos',a:{k:'hyper'}})],[/luxury/i,()=>({id:'setuppos',a:{k:'luxury'}})],[/cornered kings/i,()=>({id:'setuppos',a:{k:'corner'}})],
 [/12 pawns/i,()=>({id:'setuppos',a:{k:'twelve'}})],
 [/chaturaji/i,()=>({id:'ancient',a:{k:'chaturaji'}})],[/chaturanga|ancient chess/i,()=>({id:'ancient',a:{k:'chaturanga'}})],
 [/xian?gqi|chinese chess/i,(t)=>({id:'ancient',a:{k:'xiangqi'},name:/vs Modern/i.test(t)?'Chinese Chess vs Modern Chess':'Xiangqi-style Ancient Chess'})],
 [/grasshopper/i,()=>({id:'fairy',a:{k:'G'},name:'How Much Is a Grasshopper Worth?'})],[/how much is a knook/i,()=>({id:'fairy',a:{k:'C'},name:'How Much Is a Knook Worth?'})],
 [/wildebeest/i,()=>({id:'fairy',a:{k:'W'},name:'How Much Is a Wildebeest Worth?'})],[/knight-rider/i,()=>({id:'fairy',a:{k:'L'},name:'How Much Is a Knightrider Worth?'})],
 [/how much is a dragon bishop/i,()=>({id:'fairy',a:{k:'A'},name:'How Much Is a Dragon Bishop Worth?'})],[/how much is a king/i,()=>({id:'fairy',a:{k:'M'},name:'How Much Is a King Worth?'})],
 [/dragon bishop|paradigm/i,(t)=>({id:'fairy',a:{k:'A'},name:/paradigm/i.test(t)&&!/dragon/i.test(t)?'Paradigm Chess':'Dragon Bishop Chess'})],
 [/a fly at chess/i,()=>({id:'fairy',a:{k:'fly'},name:'Beat a Fly at Chess'})],[/unicorn/i,()=>({id:'opening',a:{k:'unicorn'}})],
 [/gothic/i,()=>({id:'fairy',a:{k:'gothic'}})],[/xxl/i,()=>({id:'fairy',a:{k:'gothic',lbl:'XXL Chess'}})],
 [/chess ultimate with a normal/i,()=>({id:'fairy',a:{k:'ultimateB'}})],[/ninja/i,()=>({id:'fairy',a:{k:'ninja'}})],
 [/chess ultimate/i,(t)=>({id:'fairy',a:{k:'ultimate',lbl:'Chess Ultimate'+(/RANKED/.test(t)?' · Ranked':/Tournament/i.test(t)?' · Tournament':/WEIRD/.test(t)?' · Weird Pieces':/INSANE/.test(t)?' · Insane Setups':/Nerfed/i.test(t)?' · Nerfed':/OP Strategy/i.test(t)?' · OP Strategy':/REFUTED/.test(t)?' · Ninja Method':/NEW/.test(t)?' · New Pieces':'')}})],
 [/knightmare|cross derby/i,(t)=>({id:'fairy',a:{k:'knightmare',lbl:/derby/i.test(t)?'Cross Derby':'Chess Knightmare'}})],
 [/wizard chess/i,()=>({id:'fairy',a:{k:'wizard'}})],[/iwantcheckmage|new mage/i,()=>({id:'fairy',a:{k:'mage'}})],[/18 new pieces/i,()=>({id:'fairy',a:{k:'mix'}})],
 [/transforming piece/i,()=>({id:'shapeshift',a:{lone:true}})],[/chessformer/i,()=>({id:'shapeshift',name:'Chessformer'})],
 [/how many knights and bishops/i,()=>({id:'howmany',a:{t:'A',n:2},name:'How Many Knights and Bishops (archbishops) to Beat Martin?'})],
 [/how many minions/i,()=>({id:'howmany',a:{t:'P',n:8},name:'How Many Minions to Steal the Moon?'})],
 [/how many fish/i,()=>({id:'howmany',a:{t:'N',n:4},name:'How Many Fish (knights) to Beat Stockfish?'})],
 [/how many bots can i beat with no queen|bots with no queen|no queen/i,()=>({id:'handicap',a:{keep:'noQ'}})],
 [/how many bots can i beat with 1 (pawn|rook|queen)/i,(t,m)=>({id:'handicap',a:{keep:{pawn:'P1',rook:'R1',queen:'Q1'}[m[1].toLowerCase()]},c:G_('hm1'+m[1],'beginner')})],
 [/how many (queens|knights|ro+ks|bishops|pawns|dragons|amazons|knooks|knibis|elephants|snakes)/i,(t,m)=>({id:'kingplus',a:{t:/^ro+ks$/i.test(m[1])?'R':/dragons/i.test(m[1])?'A':PIECE_W[m[1].toLowerCase()],n:1}})],
 [/added 1 dragon each game/i,()=>({id:'kingplus',a:{t:'A',n:1},name:'Add 1 Dragon Each Game'})],[/5 dragons vs/i,()=>({id:'kingplus',a:{t:'A',n:5},name:'5 Dragons vs 1 Chess YouTuber'})],
 [/8 queens/i,()=>({id:'howmany',a:{t:'Q',n:8},name:'8 Queens vs Martin'})],
 [/(gave|giving|give)\b.*?1 (?:extra )?(queen|rook|knight|bishop|pawn|dragon|snake|knibis|elephant)/i,(t,m)=>({id:'gift',a:{t:PIECE_W[m[2].toLowerCase()],n:1}})],
 [/removing 1 piece/i,()=>({id:'botodds',a:{n:1}})],[/leela piece odds/i,()=>({id:'botodds',a:{n:1,lbl:'Leela Piece Odds'}})],[/with odds/i,()=>({id:'botodds',a:{n:2,lbl:'Viewers vs Me with Odds'}})],
 [/with 1 pawn/i,()=>({id:'handicap',a:{keep:'P1'}})],[/with 1 rook/i,()=>({id:'handicap',a:{keep:'R1'}})],[/with 1 queen/i,()=>({id:'handicap',a:{keep:'Q1'}})],
 [/with 1 piece/i,()=>({id:'handicap',a:{keep:'piece1'}})],[/no pieces/i,()=>({id:'handicap',a:{keep:'pawns'}})],[/3 pawns/i,()=>({id:'handicap',a:{keep:'P3'}})],
 [/1 copycat/i,()=>({id:'mirror',name:'Martin with 1 Copycat'})],
 [/1 knight vs 100 pawns/i,()=>({id:'lone',a:{k:'N100'}})],[/1 amazon vs 50 pawns/i,()=>({id:'lone',a:{k:'D50'}})],[/1 amazon vs\.? 1 queen/i,()=>({id:'lone',a:{k:'DQ'}})],
 [/impostor/i,()=>({id:'lone',a:{k:'QI'}})],
 [/london/i,(t)=>({id:'opening',a:{k:'london'},name:/Propaganda/i.test(t)?'London System Propaganda':undefined})],[/bongcloud/i,()=>({id:'opening',a:{k:'bongcloud'}})],
 [/king's gambit/i,()=>({id:'opening',a:{k:'kg'}})],[/1\. ?h4/i,()=>({id:'opening',a:{k:'h4'}})],[/1\. ?e4/i,()=>({id:'opening',a:{k:'e4'}})],
 [/french defense/i,()=>({id:'opening',a:{k:'french'}})],[/danish/i,()=>({id:'opening',a:{k:'danish'}})],[/sodium/i,()=>({id:'opening',a:{k:'sodium'}})],
 [/halloween opening/i,()=>({id:'opening',a:{k:'halloween'}})],[/beachcafe/i,()=>({id:'opening',a:{k:'beachcafe'}})],[/egg opening/i,()=>({id:'opening',a:{k:'egg'}})],
 [/bad egg/i,()=>({id:'opening',a:{k:'badegg'}})],[/banned chess opening/i,()=>({id:'opening',a:{k:'banned'}})],[/no castling/i,()=>({id:'opening',a:{k:'nocastle'}})],
 [/castling checkmate|by castling/i,()=>({id:'specialmate',a:{k:'castle'}})],[/en passant checkmate/i,(t)=>({id:'specialmate',a:{k:'ep'},name:'En Passant Checkmate'+(/Martin/i.test(t)?' vs Martin':'')})],
 [/rarest checkmate/i,()=>({id:'specialmate',a:{k:'pawn'}})],[/anarchy/i,(t)=>({id:'anarchy',name:/Dev/i.test(t)?'Anarchy Chess vs Its Dev':/again/i.test(t)?'Anarchy Chess (again)':'Anarchy Chess'})],
 // ---- bot policies ----
 [/2nd best/i,()=>({base:'2nd Best Move'})],[/nth best|p\(n\)/i,()=>({id:'geometric'})],[/1 of 3 top/i,()=>({base:'Random Top 3'})],
 [/chance of blunder/i,()=>({base:'5% Blunder'})],[/if it can give check/i,()=>({base:'Must Give Check'})],[/capture your queen/i,()=>({base:'Queen Hunter'})],
 [/sacrifice a rook/i,()=>({id:'rooksac'})],[/worstfish/i,(t)=>({base:'WorstFish',name:/Zach/i.test(t)?'WorstFish vs Zach':'Lose to WorstFish'})],
 [/drawfish|0\.00/i,(t)=>({id:'drawfish',name:/LOSE/.test(t)?'Lose to DrawFish':'0.00 Evaluation'})],[/light and dark/i,()=>({id:'colorbot'})],
 [/copies your last move/i,()=>({id:'copybot'})],[/takes 31/i,()=>({id:'greedy'})],
 [/gains 3600 elo in 5/i,()=>({id:'shiftelo',a:{start:250,rule:'bmove',d:700,lbl:'+3600 Elo in 5 Seconds'}})],
 [/alternates 250 elo to 3600/i,()=>({id:'shiftelo',a:{start:250,rule:'cap',d:0,lbl:'250 to 3600 Every Capture'}})],
 [/gains 200 elo if i don't make the best/i,()=>({id:'shiftelo',a:{start:250,rule:'pnotbest',d:200,lbl:'Martin +200 If I Miss the Best Move'}})],
 [/gains 1000 elo if he captures/i,()=>({id:'shiftelo',a:{start:250,rule:'bcapchk',d:1000,lbl:'Martin +1000 on Captures and Checks'}})],
 [/loses 500 elo if i play the worst/i,()=>({id:'shiftelo',a:{start:3600,rule:'pworst',d:-500,lbl:'-500 Elo When I Play the Worst Move'}})],
 [/loses 300 elo when i give check/i,()=>({id:'shiftelo',a:{start:3600,rule:'pcheck',d:-300,lbl:'-300 Elo When I Give Check'}})],
 [/loses 100 elo if i play the best/i,()=>({id:'shiftelo',a:{start:3600,rule:'pbest',d:-100,lbl:'-100 Elo When I Play the Best Move'}})],
 [/gains 100 elo every move/i,()=>({id:'shiftelo',a:{start:250,rule:'bmove',d:100,lbl:'Martin +100 Elo Every Move'}})],
 [/loses 50 elo every move/i,()=>({id:'shiftelo',a:{start:3600,rule:'bmove',d:-50,lbl:'Stockfish -50 Elo Every Move'}})],
 [/can martin get to grandmaster/i,()=>({id:'shiftelo',a:{start:250,rule:'bmove',d:60,lbl:'Martin\'s Road to Grandmaster'}})],
 [/make martin a grandmaster/i,()=>({id:'shiftelo',a:{start:250,rule:'pbest',d:150,lbl:'Teach Martin to Be a Grandmaster'}})],
 [/√5776/i,()=>({id:'martinfish',a:{p:.76},name:'Martin, 76% Grandmaster'})],
 [/martinfish/i,(t)=>{const p=/3\.0/.test(t)?.7:/2\.0/.test(t)?.6:/WORSE/.test(t)?.35:/BACK/.test(t)?.5:/Not Ready/i.test(t)?.55:.45;return{id:'martinfish',a:{p},name:'Martinfish'+(/3\.0/.test(t)?' 3.0':/2\.0/.test(t)?' 2.0':/WORSE/.test(t)?' (Worse)':/BACK/.test(t)?' Is Back':/Not Ready/i.test(t)?' (You\'re Not Ready)':'')}}],
 [/evil martin|replaced martin/i,(t)=>({id:'classic',c:{who:'Evil Martin',elo:/WORSE/.test(t)?2900:2600,taunts:['I am not the Martin you know.','Hello again.','You thought I was 250?']},name:/WORSE/.test(t)?'Evil Martin (Worse)':/Not Ready/i.test(t)?"You're Not Ready for Evil Martin":'They Replaced Martin'})],
 [/infinite craft/i,(t)=>({id:'craft',name:/Myself/i.test(t)?'Find Myself in Infinite Craft':'Infinite Craft'})],
 [/myself/i,(t)=>({id:'mirror',name:/COMPETITIVELY/.test(t)?'Myself, Competitively':/as a Chess Bot/i.test(t)?'Beat Myself as a Bot':'I Played With Myself'})],
 [/behind the mirror/i,()=>({id:'mirror',name:'Behind the Mirror'})],
 [/can i lose to/i,()=>({id:'selfmate',name:'Can I Lose to Zach?'})],
 [/murder/i,()=>({id:'murder'})],[/villagers/i,()=>({id:'murder',name:'Villagers Chess (find the werewolf)'})],[/heist/i,()=>({id:'heist'})],[/rosen score/i,(t)=>({id:'rosen',name:'Rosen Score'+(/MASTER/.test(t)?' · Master':'')})],
 [/3600 elo puzzle/i,()=>({id:'puzzle',a:{k:1},name:'3600 Puzzle (smothered mate)'})],[/50 puzzles/i,()=>({id:'puzzle',a:{k:0},name:'Puzzle Cure (back-rank)'})],
 [/duolingo/i,()=>({id:'hearts',c:{who:'Duo the Owl',elo:1000,hearts:3},name:'Duolingo Chess'})],
 [/battle royale/i,()=>({id:'royale'})],
 [/pawnbarian/i,(t)=>({id:'handicap',a:{keep:'pawns',lbl:'Pawnbarian'},name:'Pawnbarian'+(/MASTER/.test(t)?' · Master':'')})],
 [/ouroboros/i,(t)=>({id:'gift',a:{t:'N',n:1},name:'Ouroboros King · '+cap(verbOf(t)||'Beat')})],
 [/passant\?/i,(t)=>{const e=t.match(/\[(.+?)\]/);return{id:'choice',a:{k:4,lbl:'Passant'},name:'Passant'+(e?' · '+e[1]:/MASTER/.test(t)?' · Master':/CONQUER/.test(t)?' · Conquer':'')}}],
 [/chess survivors/i,()=>({id:'breach',name:'Chess Survivors'})],[/killer king/i,()=>({id:'shotgun',a:{rank:1,range:2},name:'Killer King'})],
 [/mad scientist/i,()=>({id:'craft',name:'Mad Scientist'})],[/beyond the board/i,(t)=>{const e=t.match(/\((.+?)\)/);return{id:'wrap',a:{lbl:'Beyond the Board'},name:'Beyond the Board'+(e?' · '+e[1]:'')}}],
 [/table tactics/i,()=>({id:'choice',a:{k:3,lbl:'Table Tactics'}})],[/gambonanza/i,()=>({id:'dice',a:{n:1},name:'Gambonanza'})],
 [/battle chess/i,()=>({id:'classic',c:{who:'Battle Chess (1988)',elo:1400},name:'Battle Chess'})],
 [/shotgun king/i,(t)=>{const r=t.match(/RANK (\d)/);return{id:'shotgun',a:{rank:r?+r[1]:1,range:2}}}],[/gun king/i,()=>({id:'shotgun',a:{rank:1,range:3,gun:1}})],
 [/infinite chess/i,(t)=>({id:'wrap',a:{lbl:'Infinite Chess'},name:'Infinite Chess'+(/TwoNiche/i.test(t)?' vs TwoNiche':/Pjschess/i.test(t)?' vs Pjschess':/MASTER/.test(t)?' · Master':'')})],
 [/circular chess/i,()=>({id:'wrap',a:{lbl:'Circular Chess'}})],[/1 million chessboards/i,()=>({id:'wrap',a:{lbl:'1 Million Chessboards'}})],
 [/10,000 player/i,()=>({id:'choice',a:{k:3,lbl:'10,000 Player Chess'}})],[/youtube chess/i,()=>({id:'choice',a:{k:3,lbl:'YouTube Chess'}})],[/choice chess/i,()=>({id:'choice',a:{k:2,lbl:"DougDoug's Choice Chess"}})],
 [/thermopylae/i,()=>({id:'maze',a:{layout:'pass'},name:'Thermopylae'})],[/dangerous intersection/i,()=>({id:'maze',a:{layout:'cross'},name:'Dangerous Intersection'})],
 [/cloister/i,()=>({id:'maze',a:{layout:'cloister'},name:'Cloister'})],[/labyrinth/i,()=>({id:'maze',a:{layout:'random',n:14},name:'Labyrinth 82'})],
 [/in a maze/i,()=>({id:'maze',a:{layout:'random',n:10},name:'Stockfish in a Maze'})],
 [/once a pawn a king/i,()=>({id:'promote'})],[/petrified pawns/i,()=>({id:'petrified',a:{only:'P',who:'both'}})],[/petrified/i,(t)=>({id:'petrified',a:{who:'both',lbl:'Petrified Chess'},name:'Petrified Chess'+(verbOf(t)?' · '+cap(verbOf(t)):'')})],
 // ---- gauntlets, personas, clocks ----
 [/how fast can i beat beginner/i,()=>({id:'speedrun',c:Object.assign(G_('fastbeg','beginner'),{speed:25}),name:'Speedrun the Beginner Bots'})],
 [/beginner bots?/i,(t)=>({id:/NO QUEEN/i.test(t)?'handicap':'gauntlet',a:{keep:'noQ'},c:G_('beg','beginner')})],
 [/intermediate bots?/i,()=>({id:'gauntlet',c:G_('inter','intermediate')})],[/advanced bot/i,()=>({id:'gauntlet',c:G_('adv','advanced'),name:'Every Advanced Bot'})],
 [/judit polgar/i,()=>({id:'gauntlet',c:G_('judit','judit'),name:'The Judit Polgar Bots'})],[/christmas bot/i,()=>({id:'gauntlet',c:G_('xmas','christmas'),name:'Every Christmas Bot'})],
 [/halloween bots/i,()=>({id:'gauntlet',c:G_('hallow','halloween'),name:'The Halloween Bots'})],[/karate bots/i,()=>({id:'gauntlet',c:G_('karate','karate'),name:'The Karate Bots'})],
 [/bbq bots/i,()=>({id:'gauntlet',c:G_('bbq','bbq'),name:'The BBQ Bots'})],[/runescape/i,()=>({id:'gauntlet',c:G_('rs','runescape'),name:'RuneScape Chess Bots'})],
 [/earth day/i,()=>({id:'gauntlet',c:G_('earth','earth'),name:'Earth Day Bots'})],[/december bots/i,()=>({id:'gauntlet',c:G_('dec','december'),name:'The December Bots'})],
 [/chess piece bots/i,()=>({id:'gauntlet',c:G_('pieces','pieces'),name:'The Chess Piece Bots'})],
 [/trash talking/i,()=>({id:'gauntlet',c:G_('trash','trash',{taunts:TRASH,who:'Trash Talker'}),name:'Trash Talking Bots'})],
 [/(GRANDMASTER ){3,}/i,()=>({id:'gauntlet',c:G_('gm5','gm'),name:'Grandmaster x5'})],
 [/99\.9%/i,(t)=>({id:'gauntlet',c:G_('top'+hash(t)%97,'top'),name:/Last Chance/i.test(t)?'Last Chance at the Top 0.1%':/again/i.test(t)?'Top 0.1% (again)':/graphs/i.test(t)?'Top 0.1% (out of graphs)':'Beat 99.9% of the World'})],
 [/smurf/i,(t)=>({id:'gauntlet',c:G_('smurf'+(/Still/i.test(t)?2:1),'smurf'),name:/Still/i.test(t)?'Am I Still a Smurf?':'Am I a Smurf?'})],
 [/road to nm/i,()=>({id:'gauntlet',c:G_('nm','nm'),name:'Road to National Master'})],[/rating climb/i,()=>({id:'gauntlet',c:G_('climb','smurf'),name:"Don't Look Down: Rating Climb"})],
 [/lowest rated/i,()=>({id:'gauntlet',c:G_('lowest','tour'),name:'Lowest Rated in the Tournament'})],[/hijacked/i,()=>({id:'gauntlet',c:G_('hijack','tour'),name:"Hijacked a Streamer's Tournament"})],
 [/bamboozled/i,()=>({id:'classic',c:{who:'The Bamboozler',elo:1800,style:'trap'},name:'Bamboozled: Fight Back'})],
 [/national master/i,()=>({id:'classic',c:{who:'a National Master',elo:2200},name:'First Tournament vs a National Master'})],
 [/magnus play bullet/i,()=>({id:'clock',c:{who:'Magnus',elo:2850,clock:{total:60}},name:'Bullet vs Magnus (1 minute)'})],
 [/tiebreaker/i,()=>({id:'clock',c:{who:'GothamChess',elo:2300,clock:{total:180,inc:2}},name:'GothamChess Tiebreaker (3+2)'})],
 [/geeked vs locked in/i,()=>({id:'classic',c:{who:'Geeked / Locked In',elo:1800,style:'geeked'},name:'Geeked vs Locked In'})],
 [/chess personality/i,()=>({id:'classic',c:{who:'Personality Bot',elo:1500,style:'aggro'},name:'What Is My Chess Personality?'})],
 [/ben finegold/i,()=>({id:'classic',c:{who:'GM Ben Finegold',elo:2500,style:'nof6'},name:'GM Ben Finegold (never plays f6)'})],
 [/oldest chess website/i,()=>({id:'classic',c:{who:'The Oldest Chess Website',elo:1300,style:'chatgpt'},name:'The Oldest Chess Website'})],
 [/a very normal chess video/i,()=>({id:'roulette',a:{hide:true,lbl:'A Very Normal Chess Video'}})],[/april fools/i,()=>({id:'roulette',a:{hide:true,lbl:'April Fools'}})],
 [/until i am unstoppable/i,()=>({id:'roulette',a:{lbl:'Variant Until Unstoppable'}})],[/losing my mind over a niche/i,()=>({id:'roulette',a:{lbl:'Niche Variant'}})],
 [/roblox/i,(t)=>({id:'gauntlet',c:G_('roblox'+hash(t)%97,'roblox'),name:'Roblox Chess'+(verbOf(t)?' · '+cap(verbOf(t)):'')})],
 [/lichess/i,()=>({id:'classic',c:{who:'Lichess Stockfish (level 8)',elo:2900},name:'Survive Lichess'})],
 [/stockfih/i,()=>({id:'classic',name:'Stockfih'})],[/chatgpt/i,()=>({id:'classic',name:'ChatGPT Plays Chess'})],[/goose/i,()=>({id:'classic',c:{style:'chatgpt'},name:'A Goose at Chess'})],
 [/lapeace/i,()=>({id:'classic',name:'LaPeace Bot'})],[/manuel/i,()=>({id:'classic',name:'Manuel Bot'})],[/sinta/i,()=>({id:'classic',name:'The SINTA Bot'})],
 [/chess cheater/i,()=>({id:'classic',name:'Beat a Chess Cheater'})],[/gothamchess/i,()=>({id:'classic',name:'Beat GothamChess'})],
 [/enough is enough/i,()=>({id:'roulette',a:{lbl:'ENOUGH is ENOUGH'},why:'no twist in the title'})],[/face reveal/i,()=>({id:'roulette',a:{lbl:'Face Reveal Special'},why:'channel update, no twist in the title'})],
 [/return of the mack/i,()=>({id:'roulette',a:{lbl:'Return of the Mack'},why:'no twist in the title'})],[/i'm not crazy/i,()=>({id:'roulette',a:{lbl:"I'm Not Crazy",hide:true},why:'no twist in the title'})],
];
const CAT_DEF={'Horror Chess':{id:'stalker'},'Drawback Chess':{id:'drawback'},'Dice Chess':{id:'dice'},'Variant Bots':{id:'martinfish'},
  'Challenges & Odds':{id:'handicap',a:{keep:'noQ'}},'Powerups & Rule Twists':{id:'roulette'},'Variants & Games':{id:'roulette'},'Other Videos':{id:'classic'}};
function hash(t){let h=7;for(const ch of t)h=(h*31+ch.charCodeAt(0))>>>0;return h}

/* =================== EXPLANATIONS =================== */
const MATE='Checkmate the bot to win.';
const EXPL={
 maze:a=>a.style==='yellow'?'Walls block parts of the board like the Backrooms. Pieces can\'t land on or pass through them. Checkmate the bot to escape.':a.layout==='pass'?'A stone wall fills the middle; only the d- and e-files are open. Squeeze your attack through the pass and checkmate the bot.':'Wall squares block the board and nothing can enter or slide through them. Find a way around and checkmate the bot.',
 duck:()=>'After every move a duck drops on the square that blocks the most enemy moves, and nothing can pass it. '+MATE,
 blocks:()=>'On your turn you may place a block instead of moving (4 each). Wall off the bot\'s attacks, then checkmate it.',
 breaking:()=>'Middle squares crack when a piece leaves them and break into holes the second time. '+MATE,
 royale:()=>'The storm wipes out the outer ring after move 10 and the next ring after move 20. Checkmate the bot inside the shrinking zone.',
 mini:a=>a.v==='1d'?'The whole game is one row: kings, rooks and hopping flies. Trap the enemy king on the line to win.':a.v==='minihouse'?'A 6x6 board where captured pieces join your hand and can be dropped back in. '+MATE:'A cut-down board with fewer pieces; pawns step one square and promote at the far edge. '+MATE,
 wrap:()=>'The left and right edges are joined, so pieces slide off one side and come back on the other. '+MATE,
 portals:()=>'Two linked portals teleport any piece that stops on one to the other. Use them for surprise attacks and checkmate the bot.',
 magnets:()=>'Each moved piece pulls enemy pieces two squares away one step closer. Drag the bot\'s army out of place and checkmate it.',
 midas:()=>'Any piece (not a king) that captures turns into a gold block on the spot. Trade carefully and checkmate the bot.',
 reproduce:()=>'A pawn that steps up beside another of your pawns leaves a baby pawn behind. Build a pawn wall and checkmate the bot.',
 breed:()=>'Two of your knights side by side make a baby knight (up to 6). Grow a cavalry and checkmate the bot.',
 trojan:()=>'When the bot takes one of your knights, two of your pawns jump out of it. '+MATE,
 secretq:()=>'One of your pawns (gold outline) can secretly move like a queen. Spring the surprise and checkmate the bot.',
 sideways:()=>'Pawns can also step one square sideways. Use the extra pawn moves to break through and checkmate the bot.',
 torpedo:()=>'Pawns can move two squares forward from any rank. Race them up the board and checkmate the bot.',
 launch:()=>'Your pawns can leap 2 or 3 squares straight ahead over anything. Launch them toward promotion and checkmate the bot.',
 captureany:()=>'You may capture your own pieces (not the king) to open lines. '+MATE,
 nocap:a=>a.side==='w'?(a.until>=99?'You can never capture, but the bot can. Win by checkmate alone.':'You cannot capture early on. Survive, then checkmate the bot.'):'Nobody may capture until move '+a.until+'. Set up your pieces, then strike and checkmate the bot.',
 fivemoves:()=>'Every piece except the king may only move 5 times (badges count down). Spend your moves wisely and checkmate the bot.',
 offside:()=>'Offside rule: your pieces can\'t run past the bot\'s second-last line unless they capture. '+MATE,
 shapeshift:a=>(a.lone?'You get one transforming piece plus king and pawns. ':'')+'Pieces change shape after moving: knight, bishop, rook, queen, repeat. '+MATE,
 anarchy:()=>'En passant is forced whenever it is possible. Exploit it, then checkmate the bot.',
 craft:()=>'Move a piece onto your own piece to craft a stronger one (knight + rook = knook). '+MATE,
 dice:a=>(a.n>1?'Two dice pick which piece types you may move each turn.':'A die picks which piece type must move each turn.')+' '+MATE,
 drawback:a=>(a.show?'Your drawback ('+DRAWBACKS[a.mine[0]][0].toLowerCase()+') is shown':'You and the bot each have a hidden drawback that forbids some moves')+'. '+MATE,
 petrified:a=>'Each turn one random '+(a.only==='P'?'pawn':'piece')+(a.who==='w'?' of yours':'')+' is frozen and cannot move. '+MATE,
 choice:a=>'Each turn you may only pick from '+(a.k||3)+' random legal moves (outlined). Choose well and checkmate the bot.',
 multi:a=>`You make ${a.w} move${a.w>1?'s':''} per turn, the bot makes ${a.b}; a check ends the turn. `+MATE,
 fourp:a=>(a.team?'You and the bot each move twice per turn, like two teams.':'The bot\'s side moves twice per turn, like several opponents.')+' Checkmate or capture the enemy king.',
 snipers:()=>'Your bishops shoot what they capture and stay where they are. Pick the bot apart and checkmate it.',
 shotgun:a=>`You are a lone king that shoots enemies up to ${a.range||2} squares away in a straight line. Clear the board or checkmate to win.`,
 howmany:a=>`You start with extra ${PN[a.t]} (pick how many). Beat the bot with as few as you can.`,
 gift:a=>`The bot gets extra ${PN[a.t]}; add one more after every win. See how many you can give and still win.`,
 botodds:()=>'The bot starts without some pieces; the slider sets how many. Remove fewer each time and checkmate it.',
 handicap:a=>`You play ${HCAP[a.keep][0]}. `+MATE,
 lone:a=>a.k==='run'?'You are the speedrunner: walk your king to the top rank while three hunter knights chase you.':LONE[a.k][1].split('. ')[0]+'. '+MATE,
 nuke:a=>`You have a king and ${a.n>1?a.n+' nukes':'one nuke'}: a nuke moves like a queen plus a knightrider. Checkmate the king before the pawns promote.`,
 onepiece:a=>'You have a king and one piece against a full army; the piece '+(a.ladder==='up'?'upgrades after each loss':'downgrades after each win')+'. '+MATE,
 kingplus:a=>`You have only your king and ${PN[a.t]} against a full army; add one more after each loss. `+MATE,
 pawndrop:()=>'You start with a king and one pawn and gain a pawn after every move; dropping one is a move. Build a pawn army and checkmate.',
 fogking:()=>'You only see squares your pieces can reach and there is no check. Capture the enemy king to win.',
 troll:()=>'The Troll cheats every few turns; each time you get two moves in a row as payback. Checkmate the Troll.',
 chessformer:()=>'Your pieces fall after every move like a platformer. Get a piece into a square that attacks the red king to clear the level.',
 locust:()=>'The Locust marks a random square, then evaporates it and any piece on it a turn later. Dodge it and checkmate the bot.',
 backrooms:()=>'You are a lone king in a walled maze, hunting a hidden king while enemies spawn every turn. Catch the king to escape.',
 scp173n:()=>'A neutral statue jumps like a knight toward the nearest king whenever nobody attacks it. Watch it, or steer it into the enemy king.',
 room:()=>'A neutral entity hunts pieces with no friendly neighbour and eats them. Keep your pieces in pairs and checkmate the bot.',
 setupchess:()=>'Both armies are drafted from 39 points and placed on the first three ranks. Then play normal chess and checkmate the bot.',
 shyguy:()=>'A neutral Shy Guy eats any piece that attacks his square. Lure him into a chain of captures that ends on the enemy king.',
 setuppos:a=>SETUPS[a.k][1].split('. ')[0]+'. '+MATE,
 promote:()=>'Your pawns become commoners (non-royal kings) on the 6th rank. Use them to checkmate the bot.',
 fairy:a=>(FAIRY_SETS[a.k].random?'Knights, bishops and rooks are swapped for random fairy pieces':'Fairy pieces join the board (badges name them)')+'. Learn their moves and checkmate the bot.',
 ancient:()=>'Ancient rules: a weak ferz replaces the queen and elephants jump two squares diagonally. '+MATE,
 opening:a=>a.k==='nocastle'?'Nobody may castle. Keep your king safe another way and checkmate the bot.':`The game starts from the ${OPEN[a.k][0]}. Play on from there and checkmate the bot.`,
 specialmate:a=>`Only a ${({pawn:'pawn',castle:'castling',ep:'en passant',knight:'knight'})[a.k]} checkmate counts; any other mate is a draw. Set up the special finish.`,
 selfmate:()=>'Reverse chess: you win if the bot checkmates you, and lose if you mate it. Force it to mate you.',
 murder:()=>'One bot piece is secretly the murderer. Capture it, or checkmate the bot, to win.',
 heist:()=>'Get any of your pieces onto the bot\'s d8 or e8 vault square to win, or checkmate it.',
 rosen:()=>'Trap and win the bot\'s queen and you win the game instantly. Checkmate also wins.',
 puzzle:a=>`White to move: solve the puzzle and win within ${PUZ[a.k][2]+2} moves or it counts as failed.`,
 hearts:()=>'You have 3 hearts; every move that throws away material costs one. Checkmate the bot before your hearts run out.',
 permacap:()=>'Pieces lost by either side stay lost in the next game, for up to 5 games. '+MATE,
 timetravel:(a,c)=>`Press Rewind to take back your last move and the bot's reply (${c.rewind||1} per game). `+MATE,
 classic:()=>'Normal chess rules against this bot persona. '+MATE,
 gauntlet:()=>'Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.',
 martinfish:a=>`Each move the bot plays its best move ${Math.round((a.p||.5)*100)}% of the time and a beginner move otherwise. `+MATE,
 drawfish:()=>'The bot always heads for a 0.00 evaluation. Break the balance and checkmate it.',
 copybot:()=>'The bot copies the quality of your last move: play well and so does it. '+MATE,
 geometric:()=>'The bot usually plays its best move but sometimes its 2nd, 3rd or worse. '+MATE,
 colorbot:()=>'The bot must alternate moving to light and dark squares. Exploit the pattern and checkmate it.',
 rooksac:()=>'Whenever the bot can hang a rook, it must. Collect the rooks and checkmate it.',
 greedy:()=>'The bot will not checkmate you until it has taken all your pieces. Use the time to checkmate it first.',
 mirror:()=>'The bot mirrors your last move whenever it can. Use the reflection against it and checkmate it.',
 shiftelo:a=>`The bot starts at ${a.start} Elo and its rating shifts as the game goes (shown below the board). `+MATE,
 fogx:a=>({half:'You only see enemy pieces on dark squares.',radius:'You only see enemy pieces within two squares of yours.',dark:'You only see enemy pieces right next to yours.',blind:'Enemy pieces are invisible; only their last move is highlighted.',rooks:'The bot\'s rooks are invisible phantoms.'})[a.v]+' '+MATE,
 clock:(a,c)=>`You play on a ${fmtT(c.clock.total*1000)} clock${c.clock.halve?' that halves after every move':c.clock.inc?' +'+c.clock.inc+'s':''}. Checkmate the bot before your time runs out.`,
 speedrun:(a,c)=>`Checkmate the bot within ${c.speed} of your moves or the run fails.`,
 roulette:a=>a.hide?'One hidden twist from the arcade is active. Work out which one and checkmate the bot.':'Each game spins a random twist from the arcade (named below the board). '+MATE,
 Landmines:()=>'Four hidden mines sit in the middle of the board and destroy any non-king piece that steps on one. '+MATE,
 Atomic:()=>'Captures explode and destroy every non-pawn piece around them. Blow up the enemy king to win.',
 '∞ Pawns':()=>'You have only pawns and a new one appears after every move. Swarm and checkmate the king.',
 Horde:()=>'You are 36 pawns with no king. Checkmate the bot before your horde is wiped out.',
 'King of the Hill':()=>'Checkmate the bot, or walk your king onto one of the four centre squares to win.',
 '3-Check':()=>'Give check three times to win, or checkmate the bot.',
 Giveaway:()=>'Captures are forced and the king is just a piece. Lose all your pieces to win.',
 Chess960:()=>'The back rank is shuffled at random and there is no castling. '+MATE,
 'Racing Kings':()=>'No checks allowed. Race your king to the top rank first to win.',
 'Fog of War':()=>'You only see enemy pieces on squares your pieces can reach. '+MATE,
 'Crazyhouse-lite':()=>'Captured pieces join your hand and can be dropped back on the board. '+MATE,
 Gravity:()=>'After every move all pieces except pawns and kings fall toward the bottom. '+MATE,
 '2nd Best Move':()=>'The bot always plays its second-best move. '+MATE,'Random Top 3':()=>'The bot picks randomly from its three best moves. '+MATE,
 '5% Blunder':()=>'Each move the bot has a 5% chance of playing a random move. '+MATE,'Must Give Check':()=>'If the bot can give check, it must. '+MATE,
 'Queen Hunter':()=>'If the bot can capture your queen, it always will. Use your queen as bait and checkmate it.',
 WorstFish:()=>'The bot plays the worst move it can find. Win, or try to lose if you dare.'};

const STALK_EX={scp173:'SCP-173 lunges at your king whenever none of your pieces watch its square. Keep it in sight and checkmate the bot.',
 scp939:'SCP-939 creeps toward the square of your last move and eats what it finds. Banish it with a sacrifice and checkmate the bot.',
 scp682:'SCP-682 eats your pieces every turn and cannot be destroyed, only knocked back. Checkmate the bot before it reaches your king.',
 scp049:'SCP-049 walks toward your king and turns pieces it touches into bot pawns. Banish it with a sacrifice and checkmate the bot.',
 scp035:'SCP-035 hunts your king and every third bot move takes over one of your nearby pieces. Checkmate the bot first.',
 scp2845:'A reality-bending monster hunts your king and swaps your pieces around every third bot move. Checkmate the bot first.',
 scp426:'SCP-426 hunts your king and turns nearby pieces into pawns (toasters). Checkmate the bot before it gets you.',
 scp966:'An invisible monster, seen only next to your pieces, hunts your king. Banish it with a sacrifice and checkmate the bot.',
 scp2774:'A monster hunts your king and every third bot move one of your pieces switches sides. Checkmate the bot first.',
 scp106:'Dark walls block the board and SCP-106 hunts your king through them. Checkmate the bot to escape.',
 breach:'Three monsters hunt your king and eat what they land on. Sacrifice pieces to banish them and checkmate the bot.',
 watcher:'An unseen monster, visible only next to your pieces, hunts your king. Checkmate the bot before it finds you.',
 stalker:'A monster stalks your king and eats what it lands on. Sacrifice a piece to banish it and checkmate the bot.',
 snake:'A snake slithers toward your king, leaving a tail that blocks the board. Keep away from it and checkmate the bot.',
 pacman:'Two ghosts chase your king and eat any piece they catch. Dodge them and checkmate the bot.',
 grab:'Every third bot move a hand grabs your most valuable piece off the board. Checkmate the bot quickly.'};
/* =================== DERIVE ONE MODE PER VIDEO =================== */
const DCACHE={};
function derive(spec,title){
  const base=spec.base?BYNAME(spec.base):MX[spec.id];if(spec.c&&spec.c.forbid)delete spec.c.forbid;if(!base)throw new Error('no base for '+JSON.stringify(spec));
  const a=Object.assign({},base.def||{},spec.a||{}),per=personaOf(title),v=verbOf(title);
  const c=Object.assign({},base.cfgDef||{},spec.c||{});
  if(per&&!(spec.c&&spec.c.who)&&!c.gauntlet){c.who=per.who;c.elo=per.elo;if(per.style&&!c.style)c.style=per.style}
  if(c.elo==null&&!c.gauntlet)c.elo=v?VERB[v]:1600;
  const d=Object.create(base);d.cfg=c;d.def=a;d.vid=title;
  let name=spec.name||(base.label?base.label(a):base.name);
  const lw=per?per.who.toLowerCase().split(' ').pop():'';
  if(per&&c.who===per.who&&!name.toLowerCase().includes(lw)&&!/Martinfish|Martin/.test(name))name+=' vs '+per.who;
  else if(!spec.name&&v&&!per&&!name.includes(cap(v)))name+=' · '+cap(v);
  d.name=name;
  let rule=base.ruleFor?base.ruleFor(a):base.rule;
  if(c.gauntlet)rule+=' Ladder: '+c.gauntlet.names.join(', ')+'.';
  else if(c.who)rule+=` Opponent: ${c.who} (about ${c.elo} Elo).`;else if(!base.policy)rule+=` Bot strength: about ${c.elo} Elo.`;
  if(c.clock&&base.id!=='clock')rule+=` You have ${fmtT(c.clock.total*1000)} on your clock.`;
  if(c.clock&&base.id==='clock')rule=`You have ${fmtT(c.clock.total*1000)} on your clock${c.clock.halve?', and it is cut in half after every move you make':c.clock.inc?' plus '+c.clock.inc+' seconds per move':''}. Run out and you lose; the bot moves instantly.`+(c.who?` Opponent: ${c.who} (about ${c.elo} Elo).`:'');
  if(c.rewind&&base.id!=='timetravel')rule+=` You may rewind ${c.rewind} time${c.rewind>1?'s':''} per game.`;
  if(c.hearts&&base.id!=='hearts')rule+=` You have ${c.hearts} hearts.`;
  if(base.id==='timetravel'&&c.rewind>1)rule=rule.replace('once per game',c.rewind+' times per game');
  if(c.speed)rule+=` Win within ${c.speed} moves.`;
  d.rule=rule;
  const ex=EXPL[base.id||base.name]||(base.scfg&&STALK_EX[base.id]&&(()=>STALK_EX[base.id]));let e=ex?ex(a,c):base.rule;
  const tail=c.gauntlet?'':c.who?` Bot: ${c.who}.`:'';if((e+tail).length<=180)e+=tail;
  d.explain=e;if(!base.how){const ss=e.split(/(?<=\.) /);d.how=ss[ss.length-1]}
  if(!base.policy&&(c.gauntlet||c.style||c.elo<2700||!base.sf))d.policy=personaPick;
  if(!base.xm){const bs=base.setup,ba=base.after;d.xlayer=1;
    d.setup=function(s,g){if(bs)bs.call(this,s,g);g.xprev=s;g.xmsg='';layerSetup(s,g,c)};
    d.after=function(g,m){const prev=g.xprev;if(ba)ba.call(this,g,m);if(!g.over)layerAfter(g,m,prev,c);g.xprev=g.s}}
  return{m:d,arg:a,spec:{mode:base.xm?base.id:'base:'+base.name,params:a,cfg:spec.c||{},name:d.name}}}
function modeFor2(title,cat){const t=norm(title);let spec=null;
  for(const[re,fn]of RULES){const x=t.match(re);if(x){spec=fn(t,x,cat);break}}
  if(!spec)spec=Object.assign({why:'category default'},CAT_DEF[cat]||{id:'roulette'});
  const key=title+'|'+cat;if(DCACHE[key])return DCACHE[key];
  const r=derive(spec,t);r.why=spec.why||null;return DCACHE[key]=r}
modeFor=modeFor2;

/* =================== APPLY TO THE VIDEO LIST =================== */
/* VIDEO_CONFIG: the per-video source of truth, id -> {mode, params, cfg, name, explain, src}.
   mode   = an id from MX (see the list in the report) or "base:<name>" for one of the page's original modes
   params = that mode's settings (ARG), cfg = layers {who, elo, style, clock:{total,inc,halve}, rewind, hearts, speed, gauntlet}
   src    = "transcript" when the entry was checked against the video's transcript (rules.jsonl), else "title".
   Edit an entry here to revise a video; titles not listed fall back to the RULES table above. Generated by mx/gen_tables.js. */
const VIDEO_CONFIG=/*VIDEO_CONFIG_JSON*/{
"JUlTxosCXuk":{"mode":"scp2774","params":{},"cfg":{},"name":"SCP-2774","explain":"A monster hunts your king and every third bot move one of your pieces switches sides. Checkmate the bot first.","src":"title"},
"BYg7rV53WrM":{"mode":"fogx","params":{"v":"dark","lbl":"The Darkness"},"cfg":{},"name":"The All-Consuming Darkness","explain":"You only see enemy pieces right next to yours. Checkmate the bot to win.","src":"title"},
"gHAmif0TenY":{"mode":"watcher","params":{},"cfg":{},"name":"Waldo Finds You","explain":"An unseen monster, visible only next to your pieces, hunts your king. Checkmate the bot before it finds you.","src":"title"},
"PGBHL6Nc4X0":{"mode":"scp2845","params":{},"cfg":{},"name":"SCP-2845","explain":"A reality-bending monster hunts your king and swaps your pieces around every third bot move. Checkmate the bot first.","src":"title"},
"vPEVQgvjoL4":{"mode":"stalker","params":{},"cfg":{},"name":"Mal0 Is Stalking You","explain":"A monster stalks your king and eats what it lands on. Sacrifice a piece to banish it and checkmate the bot.","src":"title"},
"UZ79sKLa6z4":{"mode":"lone","params":{"k":"run"},"cfg":{},"name":"Speedrunner vs 3 Hunters","explain":"You are the speedrunner: walk your king to the top rank while three hunter knights chase you. Bot: the Hunters.","src":"title"},
"U67wZoy-1fE":{"mode":"stalker","params":{},"cfg":{"every":1},"name":"He Brings You Despair","explain":"A monster stalks your king and eats what it lands on. Sacrifice a piece to banish it and checkmate the bot.","src":"title"},
"d9oDfmcMJvA":{"mode":"scp2845","params":{},"cfg":{},"name":"Archangel Gabriel","explain":"A reality-bending monster hunts your king and swaps your pieces around every third bot move. Checkmate the bot first.","src":"title"},
"mymJwfSPeFA":{"mode":"room","params":{},"cfg":{"who":"Stockfish","elo":3600},"name":"Chess, But He Knows You Are Alone","explain":"A monster walks one square at a time toward any piece left alone and eats it if it's still alone when he arrives. Keep your pieces in pairs.","src":"transcript"},
"D8rD3rTwgjc":{"mode":"pawndrop","params":{},"cfg":{},"name":"Infinite Pawn Drops vs Stockfish","explain":"You start with a king and one pawn and gain a pawn after every move; dropping one is a move. Build a pawn army and checkmate. Bot: Stockfish.","src":"title"},
"xvibqyL-CqQ":{"mode":"petrified","params":{"who":"w","only":"","lbl":"The Boiled One Paralyzes You"},"cfg":{},"name":"The Boiled One","explain":"Each turn one random piece of yours is frozen and cannot move. Checkmate the bot to win.","src":"title"},
"PDCuJf3SdRY":{"mode":"locust","params":{"p":0.66},"cfg":{"who":"Stockfish","elo":3600},"name":"Chess, But the Locust Is In Your Computer","explain":"Each turn the Locust may land on a square. Next turn it deletes that square, and any piece on it, forever. Dodge it and beat Stockfish.","src":"transcript"},
"Fs4G5lQTuuE":{"mode":"drawback","params":{"show":true,"hard":0,"seed":0,"mine":[3],"bot":4,"botShown":false,"tag":"I Know Mine"},"cfg":{},"name":"Drawback Chess · I Know Mine","explain":"Your drawback (your king cannot capture) is shown. Checkmate the bot to win.","src":"title"},
"Ji7frCIfmAQ":{"mode":"breach","params":{},"cfg":{},"name":"Containment Breach","explain":"Three monsters hunt your king and eat what they land on. Sacrifice pieces to banish them and checkmate the bot.","src":"title"},
"mwv48BWl2DY":{"mode":"scp966","params":{},"cfg":{},"name":"SCP-966","explain":"An invisible monster, seen only next to your pieces, hunts your king. Banish it with a sacrifice and checkmate the bot.","src":"title"},
"s2WDIfvefEk":{"mode":"scp939","params":{},"cfg":{},"name":"SCP-939","explain":"SCP-939 creeps toward the square of your last move and eats what it finds. Banish it with a sacrifice and checkmate the bot.","src":"title"},
"ndbf05-bvgQ":{"mode":"petrified","params":{"who":"w","only":"","lbl":"SCP-409 Freezes Your Pieces"},"cfg":{},"name":"SCP-409 Freeze","explain":"Each turn one random piece of yours is frozen and cannot move. Checkmate the bot to win.","src":"title"},
"06OeGk5Iu-s":{"mode":"scp682","params":{},"cfg":{},"name":"SCP-682","explain":"SCP-682 eats your pieces every turn and cannot be destroyed, only knocked back. Checkmate the bot before it reaches your king.","src":"title"},
"4XV3SBMQgXE":{"mode":"scp035","params":{},"cfg":{},"name":"SCP-035","explain":"SCP-035 hunts your king and every third bot move takes over one of your nearby pieces. Checkmate the bot first.","src":"title"},
"_Kx4ChHuCgI":{"mode":"scp106","params":{},"cfg":{},"name":"SCP-106 Pocket Dimension","explain":"Dark walls block the board and SCP-106 hunts your king through them. Checkmate the bot to escape.","src":"title"},
"vQ3hLgU6jLA":{"mode":"base:Landmines","params":{},"cfg":{},"name":"Landmines (I Can Place Mines)","explain":"Four hidden mines sit in the middle of the board and destroy any non-king piece that steps on one. Checkmate the bot to win.","src":"title"},
"byhq5v6BUWg":{"mode":"scp049","params":{},"cfg":{},"name":"SCP-049","explain":"SCP-049 walks toward your king and turns pieces it touches into bot pawns. Banish it with a sacrifice and checkmate the bot.","src":"title"},
"epzU65ZEdcs":{"mode":"fogx","params":{"v":"radius","lbl":"SCP-096 in the Fog"},"cfg":{},"name":"SCP-096 in the Fog","explain":"You only see enemy pieces within two squares of yours. Checkmate the bot to win.","src":"title"},
"lpqVYTH9U-A":{"mode":"scp426","params":{},"cfg":{},"name":"SCP-426","explain":"SCP-426 hunts your king and turns nearby pieces into pawns (toasters). Checkmate the bot before it gets you.","src":"title"},
"-fax07t_o5s":{"mode":"shyguy","params":{"every":"ply"},"cfg":{"who":"Stockfish","elo":3600},"name":"Chess, But You Can't Look at SCP-096","explain":"A neutral Shy Guy eats any piece that attacks its square. Lure him into a chain of captures that ends on the enemy king.","src":"transcript"},
"amA3ARfEoU8":{"mode":"scp173n","params":{},"cfg":{"who":"Stockfish","elo":3600},"name":"Chess, But SCP-173 Is Coming For You","explain":"SCP-173 leaps like a knight toward the nearest king whenever no piece is looking at it. Keep it watched, or steer it at Stockfish's king.","src":"transcript"},
"L_6xy4JxrKA":{"mode":"fairy","params":{"k":"G"},"cfg":{"elo":1500},"name":"How Much Is a Grasshopper Worth?","explain":"The Grasshopper moves like a queen but must hop over a piece, landing right behind it. Strong in crowded positions.","src":"transcript"},
"aSc3Cs0eo7g":{"mode":"breaking","params":{},"cfg":{},"name":"Breaking Squares","explain":"Middle squares crack when a piece leaves them and break into holes the second time. Checkmate the bot to win.","src":"title"},
"riHSnaWRQlY":{"mode":"timetravel","params":{},"cfg":{},"name":"Time Travel","explain":"Press Rewind to take back your last move and the bot's reply (1 per game). Checkmate the bot to win.","src":"title"},
"rsI_92dNd9M":{"mode":"breed","params":{},"cfg":{"who":"Stockfish","elo":3600},"name":"Chess, But My Knights Can MATE","explain":"Move a knight next to another of your knights and they breed a new knight on a random adjacent square. Swarm the king.","src":"transcript"},
"wPaOpQw4FoY":{"mode":"reproduce","params":{"max":14},"cfg":{},"name":"Pawns Reproduce","explain":"A pawn that steps up beside another of your pawns leaves a baby pawn behind. Build a pawn wall and checkmate the bot.","src":"title"},
"2i9QlDwuZZ4":{"mode":"drawback","params":{"show":true,"hard":0,"seed":0,"mine":[2],"bot":6,"botShown":true,"tag":"I Can See Mine"},"cfg":{},"name":"Drawback Chess · I Can See Mine","explain":"Your drawback (you cannot move onto the a- or h-file) is shown. Checkmate the bot to win.","src":"title"},
"fRZmYTwLE54":{"mode":"magnets","params":{},"cfg":{},"name":"Magnets","explain":"Each moved piece pulls enemy pieces two squares away one step closer. Drag the bot's army out of place and checkmate it.","src":"title"},
"iAwhIiexojg":{"mode":"pawndrop","params":{},"cfg":{"who":"Magnus","elo":2850},"name":"1 Magnus vs ∞ Pawns","explain":"You start with a king and one pawn but get a new pawn every move to drop anywhere (not the back rank). Beat Magnus.","src":"transcript"},
"hN-WkBw_PRs":{"mode":"classic","params":{},"cfg":{"who":"The Oldest Chess Website","elo":1300,"style":"chatgpt"},"name":"The Oldest Chess Website","explain":"Normal chess rules against this bot persona. Checkmate the bot to win. Bot: The Oldest Chess Website.","src":"title"},
"hgU5hVwLlHo":{"mode":"grab","params":{},"cfg":{},"name":"Anish Giri Grabs Pieces","explain":"Every third bot move a hand grabs your most valuable piece off the board. Checkmate the bot quickly.","src":"title"},
"92iLZk0a3nw":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"smurf2","levels":[800,1200,1600,2000,2400],"names":["800 player","1200 player","1600 player","2000 player","2400 player"]}},"name":"Am I Still a Smurf?","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"eHMLdUzYvzo":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[9],"bot":8,"botShown":false,"tag":"Paranoia"},"cfg":{},"name":"Drawback Chess · Paranoia","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"ufZ_nZCkaII":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"smurf1","levels":[800,1200,1600,2000,2400],"names":["800 player","1200 player","1600 player","2000 player","2400 player"]}},"name":"Am I a Smurf?","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"GGvpHVEgqwY":{"mode":"ancient","params":{"k":"xiangqi"},"cfg":{},"name":"Chinese Chess vs Modern Chess","explain":"Ancient rules: a weak ferz replaces the queen and elephants jump two squares diagonally. Checkmate the bot to win.","src":"title"},
"rx-HCGCNuDo":{"mode":"base:Gravity","params":{},"cfg":{},"name":"My Pieces Have Gravity","explain":"After every move all pieces except pawns and kings fall toward the bottom. Checkmate the bot to win.","src":"title"},
"D1hAji3BgJw":{"mode":"opening","params":{"k":"unicorn"},"cfg":{},"name":"Forced Opening: Unicorn Attack · Beat","explain":"The game starts from the Unicorn Attack. Play on from there and checkmate the bot.","src":"title"},
"H34VPnGT8tA":{"mode":"handicap","params":{"keep":"P1"},"cfg":{"gauntlet":{"key":"hm1Pawn","levels":[250,400,550,700,850],"names":["Beginner 1","Beginner 2","Beginner 3","Beginner 4","Beginner 5"]}},"name":"Handicap: Only 1 Pawn · Beat","explain":"You play with just your king and one pawn. Checkmate the bot to win.","src":"title"},
"q8dteqd_2YY":{"mode":"opening","params":{"k":"h4"},"cfg":{},"name":"Forced Opening: 1. h4 vs a 2000-rated player","explain":"The game starts from the 1. h4. Play on from there and checkmate the bot. Bot: a 2000-rated player.","src":"title"},
"MHt-q7r8hBc":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[6],"bot":13,"botShown":false,"tag":"You Don't Know Mine"},"cfg":{},"name":"Drawback Chess · You Don't Know Mine","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"AoREbapF7y0":{"mode":"snipers","params":{},"cfg":{},"name":"Sniper Bishops","explain":"Your bishops shoot what they capture and stay where they are. Pick the bot apart and checkmate it.","src":"title"},
"JPDYufARCQU":{"mode":"secretq","params":{},"cfg":{},"name":"Secretly a Queen","explain":"One of your pawns (gold outline) can secretly move like a queen. Spring the surprise and checkmate the bot.","src":"title"},
"LiXg0nHrjxg":{"mode":"midas","params":{},"cfg":{},"name":"Midas Touch","explain":"Any piece (not a king) that captures turns into a gold block on the spot. Trade carefully and checkmate the bot.","src":"title"},
"OFtVdbxJI2Y":{"mode":"fairy","params":{"k":"fly"},"cfg":{},"name":"Beat a Fly at Chess","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"QZuydaTUCGE":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[12],"bot":3,"botShown":false,"tag":"Hidden Drawback"},"cfg":{},"name":"Drawback Chess · Hidden Drawback (Drawback Chess, But I)","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"nK5WQNSbFfE":{"mode":"handicap","params":{"keep":"R1"},"cfg":{"gauntlet":{"key":"hm1Rook","levels":[250,400,550,700,850],"names":["Beginner 1","Beginner 2","Beginner 3","Beginner 4","Beginner 5"]}},"name":"Handicap: Only 1 Rook · Beat","explain":"You play with just your king and one rook. Checkmate the bot to win.","src":"title"},
"Ugw05nktuDM":{"mode":"launch","params":{},"cfg":{},"name":"Launch Pawns","explain":"Your pawns can leap 2 or 3 squares straight ahead over anything. Launch them toward promotion and checkmate the bot.","src":"title"},
"Re3c-3qomgQ":{"mode":"blocks","params":{"n":4},"cfg":{},"name":"Minecraft Blocks","explain":"On your turn you may place a block instead of moving (4 each). Wall off the bot's attacks, then checkmate it.","src":"title"},
"OvQYI_S5IZg":{"mode":"trojan","params":{},"cfg":{},"name":"Trojan Knights","explain":"When the bot takes one of your knights, two of your pawns jump out of it. Checkmate the bot to win.","src":"title"},
"I_TbJqRHtf4":{"mode":"secretq","params":{},"cfg":{},"name":"Secret Queen Chess","explain":"One of your pawns (gold outline) can secretly move like a queen. Spring the surprise and checkmate the bot.","src":"title"},
"JW9VnzQocLk":{"mode":"nuke","params":{"foe":"dragon","n":1},"cfg":{},"name":"1 Nuke vs 1 Dragon","explain":"You have a king and one nuke: a nuke moves like a queen plus a knightrider. Checkmate the king before the pawns promote.","src":"title"},
"sPNWgAzFzxM":{"mode":"classic","params":{},"cfg":{},"name":"LaPeace Bot","explain":"Normal chess rules against this bot persona. Checkmate the bot to win. Bot: LaPeace Bot.","src":"title"},
"9pHhqAbQS0s":{"mode":"permacap","params":{},"cfg":{},"name":"Permanent Captures","explain":"Pieces lost by either side stay lost in the next game, for up to 5 games. Checkmate the bot to win.","src":"title"},
"vHVSgesfZ0o":{"mode":"handicap","params":{"keep":"noQ"},"cfg":{},"name":"Handicap: No Queen · Beat","explain":"You play without your queen. Checkmate the bot to win.","src":"title"},
"ULUmwre92Cc":{"mode":"murder","params":{},"cfg":{},"name":"Whodunit","explain":"One bot piece is secretly the murderer. Capture it, or checkmate the bot, to win.","src":"title"},
"RhncYQJA-FQ":{"mode":"onepiece","params":{"ladder":"up","n":1},"cfg":{"who":"Magnus","elo":2850},"name":"Can I BEAT Magnus with 1 Piece?","explain":"Just your king and one piece vs Magnus's full army. Each loss upgrades the piece, up to the Nuke (queen + knightrider).","src":"transcript"},
"AdbO98Fa7cY":{"mode":"handicap","params":{"keep":"Q1"},"cfg":{"gauntlet":{"key":"q1bots","levels":[1,100,150,250,400,550],"names":["Zach","Pepe","150 Bot","Martin","Juan","550 Bot"]}},"name":"How Many Bots Can I BEAT with 1 Queen?","explain":"King and queen only vs a full army. Beat bots of increasing rating until one beats you.","src":"transcript"},
"inm7KvllVu0":{"mode":"portals","params":{},"cfg":{},"name":"I Added Portals","explain":"Two linked portals teleport any piece that stops on one to the other. Use them for surprise attacks and checkmate the bot.","src":"title"},
"7csbf0L-uio":{"mode":"portals","params":{},"cfg":{},"name":"Portals","explain":"Two linked portals teleport any piece that stops on one to the other. Use them for surprise attacks and checkmate the bot.","src":"title"},
"Swv1fEVI_CM":{"mode":"mini","params":{"v":"minihouse"},"cfg":{},"name":"Tinyhouse (Is Tinyhouse Chess Solvable)","explain":"A 6x6 board where captured pieces join your hand and can be dropped back in. Checkmate the bot to win.","src":"title"},
"ZOcZ-pkPuYQ":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[8],"bot":7,"botShown":false,"tag":"Hidden Drawback"},"cfg":{},"name":"Drawback Chess · Hidden Drawback (#2)","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"vDzojyJO3sI":{"mode":"greedy","params":{},"cfg":{},"name":"Greedy Bot vs Stockfish","explain":"The bot will not checkmate you until it has taken all your pieces. Use the time to checkmate it first. Bot: Stockfish.","src":"title"},
"SG_N0fW1YO8":{"mode":"selfmate","params":{},"cfg":{"who":"DrawFish","elo":3600,"style":"drawfish"},"name":"Can I LOSE to DrawFish?","explain":"DrawFish always plays the move that keeps the eval nearest 0.00. Win by getting yourself checkmated: build an edge until its only near-0 move is mate.","src":"transcript","rule":"Reverse chess: you win only if DrawFish checkmates you. DrawFish always plays the move that keeps the evaluation closest to 0.00."},
"CSjh4NrnxLE":{"mode":"kingplus","params":{"t":"A","n":1},"cfg":{},"name":"How Many Archbishops?","explain":"You have only your king and archbishops against a full army; add one more after each loss. Checkmate the bot to win.","src":"title"},
"tNgzqWiYDFk":{"mode":"base:Must Give Check","params":{},"cfg":{},"name":"Must Give Check vs Stockfish","explain":"If the bot can give check, it must. Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"My1sUnkiNfU":{"mode":"base:Queen Hunter","params":{},"cfg":{},"name":"Queen Hunter vs Stockfish","explain":"If the bot can capture your queen, it always will. Use your queen as bait and checkmate it. Bot: Stockfish.","src":"title"},
"0i5a9jD1e5Y":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[8],"bot":12,"botShown":false,"tag":"Beat"},"cfg":{},"name":"Drawback Chess · Beat","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"oJu13RUrGl4":{"mode":"colorbot","params":{},"cfg":{},"name":"Light and Dark vs Stockfish","explain":"The bot must alternate moving to light and dark squares. Exploit the pattern and checkmate it. Bot: Stockfish.","src":"title"},
"eCC-U9w9RvQ":{"mode":"copybot","params":{},"cfg":{},"name":"Copycat Quality vs Stockfish","explain":"The bot copies the quality of your last move: play well and so does it. Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"0rlkE-CYRoc":{"mode":"shiftelo","params":{"start":250,"rule":"bmove","d":700,"lbl":"+3600 Elo in 5 Seconds"},"cfg":{},"name":"+3600 Elo in 5 Seconds vs Stockfish","explain":"The bot starts at 250 Elo and its rating shifts as the game goes (shown below the board). Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"fUQXSj5jVUk":{"mode":"ancient","params":{"k":"xiangqi"},"cfg":{},"name":"Xiangqi-style Ancient Chess","explain":"Ancient rules: a weak ferz replaces the queen and elephants jump two squares diagonally. Checkmate the bot to win.","src":"title"},
"TGBWoxXqzOg":{"mode":"martinfish","params":{"p":0.76},"cfg":{},"name":"Martin, 76% Grandmaster","explain":"Each move the bot plays its best move 76% of the time and a beginner move otherwise. Checkmate the bot to win. Bot: Martin.","src":"title"},
"xjEz7bCQxho":{"mode":"mirror","params":{},"cfg":{},"name":"Beat Myself as a Bot","explain":"The bot mirrors your last move whenever it can. Use the reflection against it and checkmate it.","src":"title"},
"g1i9Bp0WbJs":{"mode":"rooksac","params":{},"cfg":{},"name":"Rook Sacrificer vs Stockfish","explain":"Whenever the bot can hang a rook, it must. Collect the rooks and checkmate it. Bot: Stockfish.","src":"title"},
"nx6jkHl2k_Y":{"mode":"shiftelo","params":{"start":250,"rule":"pnotbest","d":200,"lbl":"Martin +200 If I Miss the Best Move"},"cfg":{},"name":"Martin +200 If I Miss the Best Move","explain":"The bot starts at 250 Elo and its rating shifts as the game goes (shown below the board). Checkmate the bot to win. Bot: Martin.","src":"title"},
"Q6sj5N3oQjI":{"mode":"shiftelo","params":{"start":250,"rule":"cap","d":0,"lbl":"250 to 3600 Every Capture"},"cfg":{},"name":"250 to 3600 Every Capture vs Stockfish","explain":"The bot starts at 250 Elo and its rating shifts as the game goes (shown below the board). Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"Y0zYxMYDDWQ":{"mode":"geometric","params":{},"cfg":{},"name":"nth Best Move vs Stockfish","explain":"The bot usually plays its best move but sometimes its 2nd, 3rd or worse. Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"0gnWnkyg6VA":{"mode":"shiftelo","params":{"start":250,"rule":"bcapchk","d":1000,"lbl":"Martin +1000 on Captures and Checks"},"cfg":{},"name":"Martin +1000 on Captures and Checks","explain":"The bot starts at 250 Elo and its rating shifts as the game goes (shown below the board). Checkmate the bot to win. Bot: Martin.","src":"title"},
"SbPYufgaG-I":{"mode":"shiftelo","params":{"start":3600,"rule":"pworst","d":-500,"lbl":"Pity Fish: -500 Elo per Worst Move"},"cfg":{},"name":"Stockfish, But It Loses 500 ELO If I Play the WORST Move","explain":"Play the worst move and Stockfish loses 500 Elo. Find 'worst' moves that don't actually hurt you.","src":"transcript"},
"vIvVdaTQi3s":{"mode":"shiftelo","params":{"start":3600,"rule":"pcheck","d":-300,"lbl":"Panic Fish: -300 Elo per Check"},"cfg":{},"name":"Stockfish, But It Loses 300 ELO When I Give Check","explain":"Stockfish loses 300 Elo every time you check it. Spam checks to weaken it, then win.","src":"transcript"},
"U6J7XjR_5Ik":{"mode":"shiftelo","params":{"start":3600,"rule":"pbest","d":-100,"lbl":"Tiltfish: -100 Elo per Best Move"},"cfg":{},"name":"Stockfish, But It Loses 100 ELO If I Play the BEST Move","explain":"Every time you play the engine's best move, Stockfish loses 100 Elo. Play accurately to wear it down.","src":"transcript"},
"PPvPTwZg0JQ":{"mode":"shiftelo","params":{"start":250,"rule":"bmove","d":100,"lbl":"Martin +100 Elo Every Move"},"cfg":{},"name":"Martin +100 Elo Every Move","explain":"The bot starts at 250 Elo and its rating shifts as the game goes (shown below the board). Checkmate the bot to win. Bot: Martin.","src":"title"},
"Uccowk6xbFc":{"mode":"shiftelo","params":{"start":3600,"rule":"bmove","d":-50,"lbl":"Stockfish -50 Elo Every Move"},"cfg":{},"name":"Stockfish -50 Elo Every Move","explain":"The bot starts at 3600 Elo and its rating shifts as the game goes (shown below the board). Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"ROkJSsMOfu0":{"mode":"base:5% Blunder","params":{},"cfg":{},"name":"5% Blunder vs Stockfish","explain":"Each move the bot has a 5% chance of playing a random move. Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"D8olpXjblQ0":{"mode":"fogx","params":{"v":"blind","lbl":"Blindfolded Bots"},"cfg":{"gauntlet":{"key":"blindbots","levels":[250,400,550,700,850],"names":["Beginner 1","Beginner 2","Beginner 3","Beginner 4","Beginner 5"]}},"name":"Blindfolded Bots","explain":"Enemy pieces are invisible; only their last move is highlighted. Checkmate the bot to win.","src":"title"},
"XhtzHTEsh9Q":{"mode":"nocap","params":{"until":99,"side":"w"},"cfg":{},"name":"0% Damage vs Martin","explain":"You can never capture, but the bot can. Win by checkmate alone. Bot: Martin.","src":"title"},
"qJLOLAKx6Fo":{"mode":"base:Random Top 3","params":{},"cfg":{},"name":"Random Top 3 vs Stockfish","explain":"The bot picks randomly from its three best moves. Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"mUmTeprNjzU":{"mode":"drawfish","params":{},"cfg":{},"name":"0.00 Evaluation vs Stockfish","explain":"The bot always heads for a 0.00 evaluation. Break the balance and checkmate it. Bot: Stockfish.","src":"title"},
"TQR5zCSzrqw":{"mode":"base:2nd Best Move","params":{},"cfg":{},"name":"2nd Best Move vs Stockfish","explain":"The bot always plays its second-best move. Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"EggsUiFTAwI":{"mode":"gift","params":{"t":"Q","n":1},"cfg":{},"name":"Give the Bot Extra Queens vs Zach","explain":"The bot gets extra queens; add one more after every win. See how many you can give and still win. Bot: Zach.","src":"title"},
"SsOtn3iDkv8":{"mode":"base:WorstFish","params":{},"cfg":{},"name":"WorstFish vs Zach","explain":"The bot plays the worst move it can find. Win, or try to lose if you dare. Bot: Zach.","src":"title"},
"A0mFldyCgfw":{"mode":"selfmate","params":{},"cfg":{"who":"Zach","elo":1,"style":"worst"},"name":"Can I LOSE to Zach?","explain":"Zach is chess.com's weakest bot. Try to get yourself checkmated by it.","src":"transcript","rule":"Reverse chess: you win only if Zach (rated 1) checkmates you. Weaken your own king and force him to deliver mate."},
"vwJw6aaggn8":{"mode":"classic","params":{},"cfg":{"who":"Evil Martin","elo":2600,"taunts":["I am not the Martin you know.","Hello again.","You thought I was 250?"]},"name":"They Replaced Martin","explain":"Normal chess rules against this bot persona. Checkmate the bot to win. Bot: Evil Martin.","src":"title"},
"xp6Pr-rB4JA":{"mode":"backrooms","params":{"walls":10,"spawnCap":14,"vision":2},"cfg":{},"name":"Backrooms Chess","explain":"You are a lone king lost in a walled maze, hunting the hidden anomalous king while new enemy pieces spawn every turn. Catch the king before they trap you.","src":"transcript","approx":"video board is 30x30 / 100x100 with 3 spawns per turn; here 8x8, one spawn per turn, catching = stepping next to the king"},
"YrxMDVnjri8":{"mode":"nuke","params":{"foe":"pawns2","n":1},"cfg":{"who":"Martin","elo":250},"name":"1 Nuke vs 250,000 Pawns","explain":"Your king and one Nuke (queen + knightrider moves) face half a board of pawns with the king hidden behind them. Checkmate the king.","src":"transcript","approx":"video uses a 1000x1000 board; here half of an 8x8 board is pawns"},
"30CbSsx8ixM":{"mode":"base:Atomic","params":{},"cfg":{},"name":"Martin Explodes My Pieces","explain":"Captures explode and destroy every non-pawn piece around them. Blow up the enemy king to win. Bot: Martin.","src":"title"},
"ucGhD2hC_6s":{"mode":"offside","params":{},"cfg":{},"name":"Offside Rule","explain":"Offside rule: your pieces can't run past the bot's second-last line unless they capture. Checkmate the bot to win.","src":"title"},
"HOLAoBdsalA":{"mode":"fairy","params":{"k":"C"},"cfg":{"elo":1500},"name":"How Much Is a Knook Worth?","explain":"The Knook moves like a rook or a knight. It can fork in 12 directions at once.","src":"transcript"},
"IjUqZLgF_xM":{"mode":"fourp","params":{"w":1,"b":2},"cfg":{},"name":"4 Player Chess · Beat (again)","explain":"The bot's side moves twice per turn, like several opponents. Checkmate or capture the enemy king.","src":"title"},
"o8XcmMCIhIk":{"mode":"kingplus","params":{"t":"A","n":1},"cfg":{},"name":"How Many Archbishops? vs Stockfish (How Many Dragons to)","explain":"You have only your king and archbishops against a full army; add one more after each loss. Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"s-BcakLUV4A":{"mode":"classic","params":{},"cfg":{},"name":"Stockfih vs Stockfih (a bootleg Stockfish)","explain":"Normal chess rules against this bot persona. Checkmate the bot to win. Bot: Stockfih (a bootleg Stockfish).","src":"title"},
"5znG8YxoU0A":{"mode":"shiftelo","params":{"start":250,"rule":"bmove","d":60,"lbl":"Martin's Road to Grandmaster"},"cfg":{},"name":"Martin's Road to Grandmaster","explain":"The bot starts at 250 Elo and its rating shifts as the game goes (shown below the board). Checkmate the bot to win. Bot: Martin.","src":"title"},
"RcpgDq_LNlk":{"mode":"kingplus","params":{"t":"C","n":1},"cfg":{},"name":"How Many Knooks? vs Stockfish","explain":"You have only your king and knooks against a full army; add one more after each loss. Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"nWdjqATRp5k":{"mode":"lone","params":{"k":"DQ"},"cfg":{},"name":"1 Amazon vs 1 Queen","explain":"Your king and amazon (queen + knight moves) against the bot's king and queen.. Checkmate the bot to win.","src":"title"},
"p49nLVPVmws":{"mode":"clock","params":{},"cfg":{"clock":{"total":120,"halve":true}},"name":"Half My Time Every Move","explain":"You play on a 2:00 clock that halves after every move. Checkmate the bot before your time runs out.","src":"title"},
"G3Helsp7ytI":{"mode":"kingplus","params":{"t":"D","n":1},"cfg":{},"name":"How Many Dragons? vs Magnus","explain":"You have only your king and dragons against a full army; add one more after each loss. Checkmate the bot to win. Bot: Magnus.","src":"title"},
"R2e56aLNWR4":{"mode":"lone","params":{"k":"N100"},"cfg":{},"name":"1 Knight vs 100 Pawns","explain":"You have a king and one knight. Checkmate the bot to win.","src":"title"},
"ijWyDYdELkg":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"gm5","levels":[2500,2550,2600,2650,2700],"names":["GM #1","GM #2","GM #3","GM #4","GM #5"]}},"name":"Grandmaster x5","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"A7gdM2GD1b0":{"mode":"shapeshift","params":{"lone":true},"cfg":{},"name":"1 Transforming Piece vs Martin","explain":"You get one transforming piece plus king and pawns. Pieces change shape after moving: knight, bishop, rook, queen, repeat. Checkmate the bot to win. Bot: Martin.","src":"title"},
"mvPXhAMcT7I":{"mode":"nuke","params":{"foe":"knights","n":1},"cfg":{},"name":"1 Nuke vs 10 Knights","explain":"You have a king and one nuke: a nuke moves like a queen plus a knightrider. Checkmate the king before the pawns promote.","src":"title"},
"2er3r0JGeNg":{"mode":"handicap","params":{"keep":"P1"},"cfg":{},"name":"Handicap: Only 1 Pawn vs a 2000-rated player","explain":"You play with just your king and one pawn. Checkmate the bot to win. Bot: a 2000-rated player.","src":"title"},
"B0F9nSVSB-k":{"mode":"shiftelo","params":{"start":250,"rule":"pbest","d":150,"lbl":"Teach Martin to Be a Grandmaster"},"cfg":{},"name":"Teach Martin to Be a Grandmaster","explain":"The bot starts at 250 Elo and its rating shifts as the game goes (shown below the board). Checkmate the bot to win. Bot: Martin.","src":"title"},
"IU9a1RB1KJw":{"mode":"nocap","params":{"until":99,"side":"w"},"cfg":{},"name":"You Can't Capture","explain":"You can never capture, but the bot can. Win by checkmate alone.","src":"title"},
"q9-mIuPLroo":{"mode":"fivemoves","params":{"n":5},"cfg":{},"name":"Five Moves Each","explain":"Every piece except the king may only move 5 times (badges count down). Spend your moves wisely and checkmate the bot.","src":"title"},
"H_5UviR2nTU":{"mode":"snake","params":{},"cfg":{},"name":"Snake vs Chess","explain":"A snake slithers toward your king, leaving a tail that blocks the board. Keep away from it and checkmate the bot.","src":"title"},
"6YEM7m8owJ4":{"mode":"roulette","params":{"hide":false,"lbl":"Spinner Wheel"},"cfg":{},"name":"Spinner Wheel vs Martin","explain":"Each game spins a random twist from the arcade (named below the board). Checkmate the bot to win. Bot: Martin.","src":"title"},
"UuuPPo3lBnY":{"mode":"nuke","params":{"foe":"pawns","n":1},"cfg":{"who":"Martin","elo":250},"name":"1 Nuke vs 100 Pawns","explain":"Your king and one Nuke (queen + knightrider moves) face a wall of pawns. Checkmate the king before a pawn promotes.","src":"transcript","approx":"video brick is 5x20 pawns; here 3 full ranks"},
"VVuAgqLzD_o":{"mode":"fairy","params":{"k":"mix"},"cfg":{"who":"Sarah","elo":1600},"name":"1 Variant, 18 New Pieces","explain":"Draft-style army: your knights, bishops and rooks become random fairy pieces (badges name them). Checkmate the bot.","src":"transcript","approx":"the video's 18 Meta Chess pieces (Scout, Sumo, Medusa, Kraken...) are approximated with this arcade's fairy pieces"},
"rtoo4ojjxHU":{"mode":"fairy","params":{"k":"rainbow"},"cfg":{},"name":"Rainbow Chess · Beat","explain":"Knights, bishops and rooks are swapped for random fairy pieces. Learn their moves and checkmate the bot.","src":"title"},
"wD9UssXbCqA":{"mode":"multi","params":{"w":2,"b":1},"cfg":{},"name":"2 Moves vs 1 vs Stockfish","explain":"You make 2 moves per turn, the bot makes 1; a check ends the turn. Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"Vr3WOIRAXoI":{"mode":"maze","params":{"layout":"random","style":"wall","n":10},"cfg":{},"name":"Stockfish in a Maze","explain":"Wall squares block the board and nothing can enter or slide through them. Find a way around and checkmate the bot. Bot: Stockfish.","src":"title"},
"KCQ75vB5Jzw":{"mode":"multi","params":{"w":1,"b":2,"lbl":"1 Move vs 2 Martins"},"cfg":{},"name":"1 Move vs 2 Martins","explain":"You make 1 move per turn, the bot makes 2; a check ends the turn. Checkmate the bot to win. Bot: Martin.","src":"title"},
"4tDIBl14AX8":{"mode":"base:Chess960","params":{},"cfg":{},"name":"Chess960 vs Martin","explain":"The back rank is shuffled at random and there is no castling. Checkmate the bot to win. Bot: Martin.","src":"title"},
"k_OvayYKZYI":{"mode":"fairy","params":{"k":"upR"},"cfg":{},"name":"Upgraded Rooks vs Stockfish","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot. Bot: Stockfish.","src":"title"},
"WXcmWG7Eczs":{"mode":"anarchy","params":{},"cfg":{},"name":"Anarchy Chess vs Its Dev","explain":"En passant is forced whenever it is possible. Exploit it, then checkmate the bot.","src":"title"},
"K48JtWGS0Tc":{"mode":"roulette","params":{"hide":true,"lbl":"A Very Normal Chess Video"},"cfg":{},"name":"A Very Normal Chess Video","explain":"One hidden twist from the arcade is active. Work out which one and checkmate the bot.","src":"title"},
"cR6r8NZz-CA":{"mode":"kingplus","params":{"t":"A","n":1},"cfg":{"who":"a Grandmaster","elo":2500},"name":"How Many Dragons to BEAT a Grandmaster?","explain":"King plus a few Dragons (bishop+knight) vs a full army. Add a dragon after every loss.","src":"transcript"},
"0VbTOk8X1TY":{"mode":"roulette","params":{"hide":false,"lbl":"Chess Roulette vs Stockfish"},"cfg":{},"name":"Chess Roulette vs Stockfish","explain":"Each game spins a random twist from the arcade (named below the board). Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"9S2QuAHo24c":{"mode":"specialmate","params":{"k":"pawn"},"cfg":{},"name":"Rarest Checkmate","explain":"Only a pawn checkmate counts; any other mate is a draw. Set up the special finish.","src":"title"},
"2xysVDt8Qzs":{"mode":"mini","params":{"v":"1d"},"cfg":{},"name":"1D Chess · Beat","explain":"The whole game is one row: kings, rooks and hopping flies. Trap the enemy king on the line to win.","src":"title"},
"B2kYQGiuZZk":{"mode":"multi","params":{"w":2,"b":1,"lbl":"2 Moves vs a 3200 Engine"},"cfg":{},"name":"2 Moves vs a 3200 Engine","explain":"You make 2 moves per turn, the bot makes 1; a check ends the turn. Checkmate the bot to win. Bot: a 3200 engine.","src":"title"},
"6qVgF1OO_cw":{"mode":"specialmate","params":{"k":"ep"},"cfg":{},"name":"En Passant Checkmate","explain":"Only a en passant checkmate counts; any other mate is a draw. Set up the special finish.","src":"title"},
"cYVauucyLyQ":{"mode":"roulette","params":{"hide":false,"lbl":"Chess Roulette"},"cfg":{},"name":"Chess Roulette · Beat","explain":"Each game spins a random twist from the arcade (named below the board). Checkmate the bot to win.","src":"title"},
"QHykgd_HEtg":{"mode":"multi","params":{"w":1,"b":3,"lbl":"3 Martins vs 1 Move"},"cfg":{},"name":"3 Martins vs 1 Move","explain":"You make 1 move per turn, the bot makes 3; a check ends the turn. Checkmate the bot to win. Bot: Martin.","src":"title"},
"IwbWTK5_1nY":{"mode":"ancient","params":{"k":"shatranj"},"cfg":{},"name":"Shatranj (Medieval Islamic Chess)","explain":"Ancient rules: a weak ferz replaces the queen and elephants jump two squares diagonally. Checkmate the bot to win.","src":"title"},
"qqvbb2r2k5I":{"mode":"dice","params":{"n":1},"cfg":{},"name":"Gambonanza","explain":"A die picks which piece type must move each turn. Checkmate the bot to win.","src":"title"},
"Eet1MTWuNBE":{"mode":"puzzle","params":{"k":1},"cfg":{},"name":"3600 Puzzle (smothered mate)","explain":"White to move: solve the puzzle and win within 4 moves or it counts as failed.","src":"title"},
"rcFGwuREQFY":{"mode":"choice","params":{"k":2,"lbl":"DougDoug's Choice Chess"},"cfg":{},"name":"DougDoug's Choice Chess · Beat","explain":"Each turn you may only pick from 2 random legal moves (outlined). Choose well and checkmate the bot.","src":"title"},
"d-4NWgCwzco":{"mode":"nuke","params":{"foe":"army","n":3,"pawns":1,"lbl":"3 Bombs vs Stockfish"},"cfg":{},"name":"3 Bombs vs Stockfish","explain":"You have a king and 3 nukes: a nuke moves like a queen plus a knightrider. Checkmate the king before the pawns promote. Bot: Stockfish.","src":"title"},
"X1aDgLuvLMU":{"mode":"multi","params":{"w":1,"b":2,"lbl":"1 Move on 2 Boards"},"cfg":{},"name":"1 Move on 2 Boards vs Martin","explain":"You make 1 move per turn, the bot makes 2; a check ends the turn. Checkmate the bot to win. Bot: Martin.","src":"title"},
"u5qp8WJSOSg":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"lowest","levels":[1400,1600,1800,2000,2200],"names":["Round 1","Round 2","Round 3","Semifinal","Final"]}},"name":"Lowest Rated in the Tournament","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"vg3CybHYuIc":{"mode":"nocap","params":{"until":10,"side":"both"},"cfg":{},"name":"No Captures Until Move 10 vs Martin","explain":"Nobody may capture until move 10. Set up your pieces, then strike and checkmate the bot. Bot: Martin.","src":"title"},
"qDkxrnZfeXw":{"mode":"anarchy","params":{},"cfg":{},"name":"Anarchy Chess","explain":"En passant is forced whenever it is possible. Exploit it, then checkmate the bot.","src":"title"},
"w15Ev7q2HmI":{"mode":"base:Landmines","params":{},"cfg":{},"name":"Landmines (there are landmines )","explain":"Four hidden mines sit in the middle of the board and destroy any non-king piece that steps on one. Checkmate the bot to win.","src":"title"},
"tpXg3mxSfY0":{"mode":"specialmate","params":{"k":"castle"},"cfg":{},"name":"Castling Checkmate vs Stockfish","explain":"Only a castling checkmate counts; any other mate is a draw. Set up the special finish. Bot: Stockfish.","src":"title"},
"lfxkP2cWADg":{"mode":"multi","params":{"w":1,"b":5,"lbl":"1 Move vs 5 Moves"},"cfg":{},"name":"1 Move vs 5 Moves","explain":"You make 1 move per turn, the bot makes 5; a check ends the turn. Checkmate the bot to win.","src":"title"},
"8rqN9o9lZOM":{"mode":"base:Crazyhouse-lite","params":{},"cfg":{},"name":"Shogi","explain":"Captured pieces join your hand and can be dropped back on the board. Checkmate the bot to win.","src":"title"},
"3Sr5lJbHKKU":{"mode":"base:Giveaway","params":{},"cfg":{},"name":"Checkers Chess (Chess vs Checkers)","explain":"Captures are forced and the king is just a piece. Lose all your pieces to win.","src":"title"},
"o5yiE_GHcrQ":{"mode":"ancient","params":{"k":"chaturanga"},"cfg":{},"name":"Chaturanga","explain":"Ancient rules: a weak ferz replaces the queen and elephants jump two squares diagonally. Checkmate the bot to win.","src":"title"},
"goDcorwxJnA":{"mode":"howmany","params":{"t":"P","n":8},"cfg":{},"name":"How Many Minions to Steal the Moon?","explain":"You start with extra pawns (pick how many). Beat the bot with as few as you can.","src":"title"},
"k0EOBEhh85w":{"mode":"kingplus","params":{"t":"A","n":1},"cfg":{},"name":"Add 1 Dragon Each Game","explain":"You have only your king and archbishops against a full army; add one more after each loss. Checkmate the bot to win.","src":"title"},
"sEXa38X1bhY":{"mode":"kingplus","params":{"t":"A","n":5},"cfg":{},"name":"5 Dragons vs 1 Chess YouTuber","explain":"You have only your king and archbishops against a full army; add one more after each loss. Checkmate the bot to win. Bot: a Chess YouTuber.","src":"title"},
"ioA1tvVO1qA":{"mode":"fairy","params":{"k":"upB"},"cfg":{},"name":"Upgraded Bishops vs Stockfish","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot. Bot: Stockfish.","src":"title"},
"vzNwF2BH8jg":{"mode":"lone","params":{"k":"QI"},"cfg":{},"name":"1 Queen vs 1 Impostor","explain":"Your king and queen against the bot's king and an impostor: a piece that looks like a queen but secretly moves like an amazon (queen + knight).. Checkmate the bot to win.","src":"title"},
"oWZa73IODRU":{"mode":"fairy","params":{"k":"upN"},"cfg":{},"name":"Upgraded Knights vs Stockfish","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot. Bot: Stockfish.","src":"title"},
"jHtJ8zYDF8M":{"mode":"torpedo","params":{},"cfg":{},"name":"Upgraded Pawns (torpedo pawns) vs Stockfish","explain":"Pawns can move two squares forward from any rank. Race them up the board and checkmate the bot. Bot: Stockfish.","src":"title"},
"7LBERB7y2hs":{"mode":"nuke","params":{"foe":"army","n":1,"pawns":1,"lbl":"1 Bazooka vs 1 Granny"},"cfg":{},"name":"1 Bazooka vs 1 Granny","explain":"You have a king and one nuke: a nuke moves like a queen plus a knightrider. Checkmate the king before the pawns promote. Bot: Granny.","src":"title"},
"ySfA6lWFTcY":{"mode":"classic","params":{},"cfg":{"who":"Geeked / Locked In","elo":1800,"style":"geeked"},"name":"Geeked vs Locked In","explain":"Normal chess rules against this bot persona. Checkmate the bot to win. Bot: Geeked / Locked In.","src":"title"},
"Ev0RO3V2_uE":{"mode":"onepiece","params":{"ladder":"down","n":1},"cfg":{"who":"Martin","elo":250},"name":"Can I BEAT Martin with 1 Piece?","explain":"Beat Martin with just your king and one piece, starting with a Nuke and stepping down to a lone pawn.","src":"transcript"},
"5m6UP0ghvdA":{"mode":"nuke","params":{"foe":"queen","n":1},"cfg":{},"name":"1 Nuke vs 1 Queen","explain":"You have a king and one nuke: a nuke moves like a queen plus a knightrider. Checkmate the king before the pawns promote.","src":"title"},
"gOtyz9YEBC4":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[0],"bot":3,"botShown":false,"tag":"Firmly"},"cfg":{},"name":"Drawback Chess · Firmly","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"1_FSHqyc904":{"mode":"fairy","params":{"k":"ultimate","lbl":"Chess Ultimate · New Pieces"},"cfg":{},"name":"Chess Ultimate · New Pieces · Beat","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"nWEiDXSnEwc":{"mode":"lone","params":{"k":"D50"},"cfg":{},"name":"1 Amazon vs 50 Pawns","explain":"You have a king and one amazon (queen + knight moves). Checkmate the bot to win.","src":"title"},
"Yp7AnbFcgHI":{"mode":"nuke","params":{"foe":"pawns","n":1},"cfg":{},"name":"1 Nuke vs 100 Pawns","explain":"You have a king and one nuke: a nuke moves like a queen plus a knightrider. Checkmate the king before the pawns promote.","src":"title"},
"yjXcBxP6uyI":{"mode":"mirror","params":{},"cfg":{},"name":"Martin with 1 Copycat","explain":"The bot mirrors your last move whenever it can. Use the reflection against it and checkmate it. Bot: Martin.","src":"title"},
"patgvfwk5gA":{"mode":"nuke","params":{"foe":"army","n":2,"xcount":1,"pawns":1,"lbl":"How Many Nukes to Beat Gotham Baby?"},"cfg":{},"name":"How Many Nukes to Beat Gotham Baby?","explain":"You have a king and 2 nukes: a nuke moves like a queen plus a knightrider. Checkmate the king before the pawns promote. Bot: Gotham Baby.","src":"title"},
"U_irVoLjtNI":{"mode":"secretq","params":{},"cfg":{},"name":"Secret Queen vs Stockfish","explain":"One of your pawns (gold outline) can secretly move like a queen. Spring the surprise and checkmate the bot. Bot: Stockfish.","src":"title"},
"dKZfe4uB_RM":{"mode":"multi","params":{"w":2,"b":1,"lbl":"How Many Martins to Beat Stockfish"},"cfg":{},"name":"How Many Martins to Beat Stockfish","explain":"You make 2 moves per turn, the bot makes 1; a check ends the turn. Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"onv0NOspxH8":{"mode":"kingplus","params":{"t":"D","n":1},"cfg":{},"name":"How Many Dragons? vs Stockfish","explain":"You have only your king and dragons against a full army; add one more after each loss. Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"j5na3lPhw7g":{"mode":"howmany","params":{"t":"N","n":4},"cfg":{},"name":"How Many Fish (knights) to Beat Stockfish?","explain":"You start with extra knights (pick how many). Beat the bot with as few as you can. Bot: Stockfish.","src":"title"},
"sv3DeeGsB2E":{"mode":"gift","params":{"t":"A","n":1},"cfg":{},"name":"Give the Bot Extra Archbishops vs a Chess YouTuber","explain":"The bot gets extra archbishops; add one more after every win. See how many you can give and still win. Bot: a Chess YouTuber.","src":"title"},
"Bzbzs0K5IBs":{"mode":"duck","params":{},"cfg":{},"name":"Duck Chess · Survive","explain":"After every move a duck drops on the square that blocks the most enemy moves, and nothing can pass it. Checkmate the bot to win.","src":"title"},
"GYdiE3h5mLM":{"mode":"roulette","params":{"hide":false,"lbl":"ENOUGH is ENOUGH"},"cfg":{},"name":"ENOUGH is ENOUGH","explain":"Each game spins a random twist from the arcade (named below the board). Checkmate the bot to win.","src":"title"},
"ymIg80xvKVE":{"mode":"base:Crazyhouse-lite","params":{},"cfg":{},"name":"Bughouse (Survive)","explain":"Captured pieces join your hand and can be dropped back on the board. Checkmate the bot to win.","src":"title"},
"amZRnocbNr8":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"judit","levels":[1200,1700,2200,2500,2735],"names":["Young Judit","Prodigy Judit","IM Judit","GM Judit","Peak Judit"]}},"name":"The Judit Polgar Bots","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"smg98qv_xa0":{"mode":"base:Horde","params":{},"cfg":{},"name":"Horde · Survive","explain":"You are 36 pawns with no king. Checkmate the bot before your horde is wiped out.","src":"title"},
"cxUz0IjYQMQ":{"mode":"setupchess","params":{},"cfg":{},"name":"Setup Chess (Survive)","explain":"Both armies are drafted from 39 points and placed on the first three ranks. Then play normal chess and checkmate the bot.","src":"title"},
"DStCmEElxW0":{"mode":"botodds","params":{"n":1,"lbl":"Leela Piece Odds"},"cfg":{},"name":"Leela Piece Odds","explain":"The bot starts without some pieces; the slider sets how many. Remove fewer each time and checkmate it. Bot: Leela.","src":"title"},
"7lEglazTlo8":{"mode":"maze","params":{"layout":"crates","style":"wall","n":6},"cfg":{},"name":"Soko Chess","explain":"Wall squares block the board and nothing can enter or slide through them. Find a way around and checkmate the bot.","src":"title"},
"XrS4pFAd56c":{"mode":"base:Crazyhouse-lite","params":{},"cfg":{},"name":"Crazyhouse (Survive)","explain":"Captured pieces join your hand and can be dropped back on the board. Checkmate the bot to win.","src":"title"},
"MvVT7xDW4ow":{"mode":"classic","params":{},"cfg":{},"name":"ChatGPT Plays Chess","explain":"Normal chess rules against this bot persona. Checkmate the bot to win. Bot: ChatGPT.","src":"title"},
"evpcydnu8To":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[9],"bot":1,"botShown":false,"tag":"Devour"},"cfg":{},"name":"Drawback Chess · Devour","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"9npKP-fqq9U":{"mode":"base:Giveaway","params":{},"cfg":{},"name":"Giveaway · Survive","explain":"Captures are forced and the king is just a piece. Lose all your pieces to win.","src":"title"},
"zxRM5dD5b7w":{"mode":"fairy","params":{"k":"knightmare","lbl":"Chess Knightmare"},"cfg":{},"name":"Chess Knightmare · Beat","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"tsqxjK8GP10":{"mode":"ancient","params":{"k":"chaturaji"},"cfg":{},"name":"Chaturaji · Survive","explain":"Ancient rules: a weak ferz replaces the queen and elephants jump two squares diagonally. Checkmate the bot to win.","src":"title"},
"PhcIDwTqQKA":{"mode":"base:Atomic","params":{},"cfg":{},"name":"Atomic · Survive","explain":"Captures explode and destroy every non-pawn piece around them. Blow up the enemy king to win.","src":"title"},
"4EIPARnGSSU":{"mode":"base:Fog of War","params":{},"cfg":{},"name":"Fog of War · Survive","explain":"You only see enemy pieces on squares your pieces can reach. Checkmate the bot to win.","src":"title"},
"hTTtJIdPVrc":{"mode":"base:Crazyhouse-lite","params":{},"cfg":{},"name":"Spell Chess (Survive)","explain":"Captured pieces join your hand and can be dropped back on the board. Checkmate the bot to win.","src":"title"},
"WGuczpW2zds":{"mode":"fourp","params":{"w":1,"b":2},"cfg":{},"name":"4 Player Chess · Survive","explain":"The bot's side moves twice per turn, like several opponents. Checkmate or capture the enemy king.","src":"title"},
"s59xwt9TDMU":{"mode":"roulette","params":{"hide":false,"lbl":"Face Reveal Special"},"cfg":{},"name":"Face Reveal Special","explain":"Each game spins a random twist from the arcade (named below the board). Checkmate the bot to win.","src":"title"},
"W_RqmvTVTNs":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[5],"bot":4,"botShown":false,"tag":"Outsmart"},"cfg":{},"name":"Drawback Chess · Outsmart","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"4FRsSJoxMkE":{"mode":"fairy","params":{"k":"mage"},"cfg":{},"name":"The Mage (RETURN of the iwantcheckmage)","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"Cv28-UoZseg":{"mode":"base:Giveaway","params":{},"cfg":{},"name":"Sergeant's Checkers","explain":"Captures are forced and the king is just a piece. Lose all your pieces to win.","src":"title"},
"CHde4g8Jpuk":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"dec","levels":[500,900,1300,1800,2300],"names":["Snowflake","Icicle","Blizzard","Frost Giant","Winter King"]}},"name":"The December Bots","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"X5kLXAJeAQI":{"mode":"opening","params":{"k":"nocastle"},"cfg":{},"name":"No Castling · Beat","explain":"Nobody may castle. Keep your king safe another way and checkmate the bot.","src":"title"},
"ul-ZFraZdkc":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[0],"bot":7,"botShown":false,"tag":"I Can See Mine"},"cfg":{},"name":"Drawback Chess · I Can See Mine · Unsee","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"xRximnDlQtI":{"mode":"fairy","params":{"k":"mage"},"cfg":{},"name":"The Mage (and he wants checkmate)","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"qDKQ0TZbSKo":{"mode":"opening","params":{"k":"london"},"cfg":{},"name":"Forced Opening: London System · Beat","explain":"The game starts from the London System. Play on from there and checkmate the bot.","src":"title"},
"pGVRaaLnMAY":{"mode":"fogx","params":{"v":"radius","lbl":"Ambush"},"cfg":{},"name":"Ambush · Beat","explain":"You only see enemy pieces within two squares of yours. Checkmate the bot to win.","src":"title"},
"prd7LxnJtL4":{"mode":"dice","params":{"n":1,"botFree":false},"cfg":{},"name":"Dice Chess · Gobble","explain":"A die picks which piece type must move each turn. Checkmate the bot to win.","src":"title"},
"C9v7G3dJl7E":{"mode":"promote","params":{},"cfg":{},"name":"Once a Pawn, a King · Beat","explain":"Your pawns become commoners (non-royal kings) on the 6th rank. Use them to checkmate the bot.","src":"title"},
"u0hl8g63mUg":{"mode":"setuppos","params":{"k":"twelve"},"cfg":{},"name":"The 12 Pawns Opening · Beat","explain":"You start with 12 pawns: four extra pawns replace your knights and bishops.. Checkmate the bot to win.","src":"title"},
"AQUZ910edmY":{"mode":"classic","params":{},"cfg":{"who":"Personality Bot","elo":1500,"style":"aggro"},"name":"What Is My Chess Personality?","explain":"Normal chess rules against this bot persona. Checkmate the bot to win. Bot: Personality Bot.","src":"title"},
"djfYBXvvaYI":{"mode":"murder","params":{},"cfg":{},"name":"Villagers Chess (find the werewolf)","explain":"One bot piece is secretly the murderer. Capture it, or checkmate the bot, to win.","src":"title"},
"y5MBC8OCYlI":{"mode":"setuppos","params":{"k":"corner"},"cfg":{},"name":"Cornered Kings · Beat","explain":"Both kings start in the corner (h1 and h8) with the rook beside them. Checkmate the bot to win.","src":"title"},
"2Nvg8xDNnkA":{"mode":"blocks","params":{"n":6},"cfg":{},"name":"Chess in Minecraft","explain":"On your turn you may place a block instead of moving (4 each). Wall off the bot's attacks, then checkmate it.","src":"title"},
"QrKIKcYN5m4":{"mode":"base:Gravity","params":{},"cfg":{},"name":"Stone Gravitation","explain":"After every move all pieces except pawns and kings fall toward the bottom. Checkmate the bot to win.","src":"title"},
"8bnedvYyipA":{"mode":"base:Giveaway","params":{},"cfg":{},"name":"Clobber","explain":"Captures are forced and the king is just a piece. Lose all your pieces to win.","src":"title"},
"oqbNs-QtgaU":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[3],"bot":10,"botShown":false,"tag":"Dismantle"},"cfg":{},"name":"Drawback Chess · Dismantle","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"DZYjyPOvGho":{"mode":"base:Giveaway","params":{},"cfg":{},"name":"4 Player Giveaway","explain":"Captures are forced and the king is just a piece. Lose all your pieces to win.","src":"title"},
"sO-lD2On610":{"mode":"pacman","params":{},"cfg":{},"name":"Pac-Man Chess · Beat","explain":"Two ghosts chase your king and eat any piece they catch. Dodge them and checkmate the bot.","src":"title"},
"-2PdVk71D1Q":{"mode":"roulette","params":{"hide":false,"lbl":"Return of the Mack"},"cfg":{},"name":"Return of the Mack","explain":"Each game spins a random twist from the arcade (named below the board). Checkmate the bot to win.","src":"title"},
"G4zH8iKfIi0":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"rs","levels":[400,800,1200,1700,2300],"names":["Goblin","Guard","Knight","Wizard","Dragon"]}},"name":"RuneScape Chess Bots","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"GawuFHUIj6o":{"mode":"fogx","params":{"v":"rooks","lbl":"Phantom Rooks"},"cfg":{},"name":"Phantom Rooks · Beat","explain":"The bot's rooks are invisible phantoms. Checkmate the bot to win.","src":"title"},
"Zc8ljpWtYWQ":{"mode":"mirror","params":{},"cfg":{},"name":"Behind the Mirror","explain":"The bot mirrors your last move whenever it can. Use the reflection against it and checkmate it.","src":"title"},
"lmmKhSrRn_c":{"mode":"base:Atomic","params":{},"cfg":{},"name":"Explosive Magic","explain":"Captures explode and destroy every non-pawn piece around them. Blow up the enemy king to win.","src":"title"},
"B3wErwlKytA":{"mode":"kingplus","params":{"t":"A","n":1},"cfg":{},"name":"How Many Archbishops? vs two niche","explain":"You have only your king and archbishops against a full army; add one more after each loss. Checkmate the bot to win. Bot: two niche.","src":"title"},
"KSjhrEtd0tE":{"mode":"fairy","params":{"k":"W"},"cfg":{"elo":1500},"name":"How Much Is a Wildebeest Worth?","explain":"The Wildebeest jumps like a knight or a camel (a longer 1-by-3 L). Deadly in closed positions, easy prey on open lines.","src":"transcript"},
"qfHZlae8XVU":{"mode":"maze","params":{"layout":"cloister","style":"wall","n":10},"cfg":{},"name":"Cloister","explain":"Wall squares block the board and nothing can enter or slide through them. Find a way around and checkmate the bot.","src":"title"},
"c-_Th-jjfyM":{"mode":"base:King of the Hill","params":{},"cfg":{},"name":"War for the Throne","explain":"Checkmate the bot, or walk your king onto one of the four centre squares to win.","src":"title"},
"xg_djfCrRes":{"mode":"maze","params":{"layout":"random","style":"wall","n":14},"cfg":{},"name":"Labyrinth 82","explain":"Wall squares block the board and nothing can enter or slide through them. Find a way around and checkmate the bot.","src":"title"},
"boaA9_TjXeU":{"mode":"maze","params":{"layout":"pass","style":"wall","n":10},"cfg":{},"name":"Thermopylae","explain":"A stone wall fills the middle; only the d- and e-files are open. Squeeze your attack through the pass and checkmate the bot.","src":"title"},
"XfTqjcXKqF4":{"mode":"fairy","params":{"k":"L"},"cfg":{"elo":1500},"name":"How Much Is a Knightrider Worth?","explain":"The Knightrider keeps leaping in the same L-direction as far as it likes, like a bishop made of knight jumps.","src":"transcript"},
"fRoyaduwh5I":{"mode":"kingplus","params":{"t":"A","n":1},"cfg":{},"name":"How Many Archbishops? vs Chess Vibes","explain":"You have only your king and archbishops against a full army; add one more after each loss. Checkmate the bot to win. Bot: Chess Vibes.","src":"title"},
"o8Hm32z3gQU":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[9],"bot":9,"botShown":false,"tag":"Silence"},"cfg":{},"name":"Drawback Chess · Silence","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"wqaQeZHJKhk":{"mode":"fairy","params":{"k":"knightmare","lbl":"Cross Derby"},"cfg":{},"name":"Cross Derby · Crush","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"CuwO5ygTGCM":{"mode":"dice","params":{"n":1,"botFree":false},"cfg":{},"name":"Dice Chess · Decimate","explain":"A die picks which piece type must move each turn. Checkmate the bot to win.","src":"title"},
"YjXV6gL8SsA":{"mode":"mini","params":{"v":"6x6"},"cfg":{},"name":"Mini Chess 6x6 · Crush","explain":"A cut-down board with fewer pieces; pawns step one square and promote at the far edge. Checkmate the bot to win.","src":"title"},
"xu4yhPGGjTg":{"mode":"kingplus","params":{"t":"A","n":1},"cfg":{},"name":"How Many Archbishops? vs Alexandra Botez","explain":"You have only your king and archbishops against a full army; add one more after each loss. Checkmate the bot to win. Bot: Alexandra Botez.","src":"title"},
"XbCdL3oL_18":{"mode":"fairy","params":{"k":"A"},"cfg":{},"name":"Dragon Bishop Chess (Crush)","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"Exu676O9sxE":{"mode":"opening","params":{"k":"halloween"},"cfg":{},"name":"Forced Opening: Halloween Gambit","explain":"The game starts from the Halloween Gambit. Play on from there and checkmate the bot.","src":"title"},
"CxtttdnwNWk":{"mode":"fairy","params":{"k":"ultimate","lbl":"Chess Ultimate · Tournament"},"cfg":{},"name":"Chess Ultimate · Tournament","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"eJsNNi7rBro":{"mode":"kingplus","params":{"t":"A","n":1},"cfg":{},"name":"How Many Archbishops? vs jacksark","explain":"You have only your king and archbishops against a full army; add one more after each loss. Checkmate the bot to win. Bot: jacksark.","src":"title"},
"AtBtzQUjAIE":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[2],"bot":6,"botShown":false,"tag":"Ignore"},"cfg":{},"name":"Drawback Chess · Ignore","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"DMtaRFMpCWc":{"mode":"fairy","params":{"k":"wizard"},"cfg":{},"name":"Wizard Chess · Beat","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"ZZMXaJ0vbgQ":{"mode":"kingplus","params":{"t":"A","n":1},"cfg":{},"name":"How Many Archbishops? vs sadisticTushi","explain":"You have only your king and archbishops against a full army; add one more after each loss. Checkmate the bot to win. Bot: sadisticTushi.","src":"title"},
"pPQDMtvu5rk":{"mode":"fairy","params":{"k":"ultimate","lbl":"Chess Ultimate · Ranked"},"cfg":{},"name":"Chess Ultimate · Ranked","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"CONozr99agQ":{"mode":"royale","params":{},"cfg":{},"name":"Battle Royale","explain":"The storm wipes out the outer ring after move 10 and the next ring after move 20. Checkmate the bot inside the shrinking zone.","src":"title"},
"Zdkiyvn1iLA":{"mode":"base:3-Check","params":{},"cfg":{},"name":"3-Check vs Lichess Stockfish (level 8)","explain":"Give check three times to win, or checkmate the bot. Bot: Lichess Stockfish (level 8).","src":"title"},
"2cYI0ddgmrA":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[6],"bot":12,"botShown":false,"tag":"Pound"},"cfg":{},"name":"Drawback Chess · Pound","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"hMC2ZvGkDEQ":{"mode":"kingplus","params":{"t":"A","n":1},"cfg":{},"name":"How Many Archbishops? vs ViperKing","explain":"You have only your king and archbishops against a full army; add one more after each loss. Checkmate the bot to win. Bot: ViperKing.","src":"title"},
"tH7eOK3Lr1A":{"mode":"opening","params":{"k":"beachcafe"},"cfg":{},"name":"Forced Opening: BeachCafe Opening · Beat","explain":"The game starts from the BeachCafe Opening. Play on from there and checkmate the bot.","src":"title"},
"onr_ABfEMGk":{"mode":"fairy","params":{"k":"ultimate","lbl":"Chess Ultimate · Weird Pieces"},"cfg":{},"name":"Chess Ultimate · Weird Pieces (Played Only WEIRD Chess)","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"FBrM-CLBZDA":{"mode":"kingplus","params":{"t":"A","n":1},"cfg":{},"name":"How Many Archbishops? vs Croissant","explain":"King plus Dragons (bishop+knight) vs a YouTuber's full army. One more dragon each game.","src":"transcript","review":"explain from transcript; mode still title-based"},
"je1fukNFWSw":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"hallow","levels":[500,900,1300,1700,2200],"names":["Ghost","Witch","Vampire","Werewolf","Pumpkin King"]}},"name":"The Halloween Bots","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"yktO2PgN_JA":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"top89","levels":[1800,2000,2200,2400,2600],"names":["Top 10%","Top 5%","Top 1%","Top 0.5%","Top 0.1%"]}},"name":"Last Chance at the Top 0.1%","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"SJrOiyN2-HA":{"mode":"fairy","params":{"k":"knightmare","lbl":"Cross Derby"},"cfg":{},"name":"Cross Derby · Podium","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"LjehdkzmCho":{"mode":"base:Crazyhouse-lite","params":{},"cfg":{},"name":"Seirawan (Tried to Qualify for)","explain":"Captured pieces join your hand and can be dropped back on the board. Checkmate the bot to win.","src":"title"},
"2r5tef-Qdyg":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[0],"bot":12,"botShown":false,"tag":"Smash"},"cfg":{},"name":"Drawback Chess · Smash","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"jVy2dkoM-9g":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"top26","levels":[1800,2000,2200,2400,2600],"names":["Top 10%","Top 5%","Top 1%","Top 0.5%","Top 0.1%"]}},"name":"Top 0.1% (out of graphs)","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"F0nfkeR-QEg":{"mode":"fairy","params":{"k":"ninja"},"cfg":{},"name":"Ninja + Angel","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"vvCAEWKttT4":{"mode":"mirror","params":{},"cfg":{},"name":"Myself, Competitively","explain":"The bot mirrors your last move whenever it can. Use the reflection against it and checkmate it.","src":"title"},
"jQmUHscKQvk":{"mode":"classic","params":{},"cfg":{"who":"The Bamboozler","elo":1800,"style":"trap"},"name":"Bamboozled: Fight Back","explain":"Normal chess rules against this bot persona. Checkmate the bot to win. Bot: The Bamboozler.","src":"title"},
"PY0828x1VBc":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"top56","levels":[1800,2000,2200,2400,2600],"names":["Top 10%","Top 5%","Top 1%","Top 0.5%","Top 0.1%"]}},"name":"Top 0.1% (again)","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"dKBSZUzVQ1E":{"mode":"fairy","params":{"k":"ultimateB"},"cfg":{},"name":"Ultimate vs Normal · Beat","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"E9HD9Sc6tzM":{"mode":"roulette","params":{"hide":false,"lbl":"Variant Until Unstoppable"},"cfg":{},"name":"Variant Until Unstoppable","explain":"Each game spins a random twist from the arcade (named below the board). Checkmate the bot to win.","src":"title"},
"uUXev8TPVak":{"mode":"base:3-Check","params":{},"cfg":{},"name":"3-Check","explain":"Give check three times to win, or checkmate the bot.","src":"title"},
"Erv3pR1bWnE":{"mode":"mini","params":{"v":"minihouse"},"cfg":{},"name":"Tinyhouse (investigating opponents to climb)","explain":"A 6x6 board where captured pieces join your hand and can be dropped back in. Checkmate the bot to win.","src":"title"},
"cFV76CnbFQk":{"mode":"mini","params":{"v":"minihouse"},"cfg":{},"name":"Tinyhouse (size doesn't matter, tinyhouse)","explain":"A 6x6 board where captured pieces join your hand and can be dropped back in. Checkmate the bot to win.","src":"title"},
"hm0op9p3RVk":{"mode":"opening","params":{"k":"danish"},"cfg":{},"name":"Forced Opening: Danish Gambit","explain":"The game starts from the Danish Gambit. Play on from there and checkmate the bot.","src":"title"},
"GH9tTFMWEUg":{"mode":"reproduce","params":{"max":16},"cfg":{},"name":"2 Eggs Are Better Than 1","explain":"A pawn that steps up beside another of your pawns leaves a baby pawn behind. Build a pawn wall and checkmate the bot.","src":"title"},
"7REcDCBnXZ8":{"mode":"roulette","params":{"hide":false,"lbl":"Niche Variant"},"cfg":{},"name":"Niche Variant","explain":"Each game spins a random twist from the arcade (named below the board). Checkmate the bot to win.","src":"title"},
"zP9TzlgA-W0":{"mode":"handicap","params":{"keep":"pawns","lbl":"Pawnbarian"},"cfg":{},"name":"Pawnbarian · Master","explain":"You play with no pieces at all, only your king and pawns. Checkmate the bot to win.","src":"title"},
"Kzt9ItpGtYg":{"mode":"handicap","params":{"keep":"pawns","lbl":"Pawnbarian"},"cfg":{},"name":"Pawnbarian","explain":"You play with no pieces at all, only your king and pawns. Checkmate the bot to win.","src":"title"},
"xvlHij1tgk8":{"mode":"choice","params":{"k":3,"lbl":"Table Tactics"},"cfg":{},"name":"Table Tactics · Beat","explain":"Each turn you may only pick from 3 random legal moves (outlined). Choose well and checkmate the bot.","src":"title"},
"JAz_qMQpI1o":{"mode":"gift","params":{"t":"N","n":1},"cfg":{},"name":"Ouroboros King · Defeat","explain":"The bot gets extra knights; add one more after every win. See how many you can give and still win.","src":"title"},
"_RFXN1Ye3sY":{"mode":"gift","params":{"t":"N","n":1},"cfg":{},"name":"Ouroboros King · Master","explain":"The bot gets extra knights; add one more after every win. See how many you can give and still win.","src":"title"},
"rf2HSTXTehE":{"mode":"gift","params":{"t":"N","n":1},"cfg":{},"name":"Ouroboros King · Beat","explain":"The bot gets extra knights; add one more after every win. See how many you can give and still win.","src":"title"},
"spJibM5qaNQ":{"mode":"breach","params":{},"cfg":{},"name":"Chess Survivors","explain":"Three monsters hunt your king and eat what they land on. Sacrifice pieces to banish them and checkmate the bot.","src":"title"},
"YVhTi1FeTso":{"mode":"roulette","params":{"hide":true,"lbl":"I'm Not Crazy"},"cfg":{},"name":"I'm Not Crazy","explain":"One hidden twist from the arcade is active. Work out which one and checkmate the bot.","src":"title"},
"id4UXy5PmV8":{"mode":"drawback","params":{"show":false,"hard":1,"seed":0,"mine":[2,12],"bot":12,"botShown":false,"tag":"Hardest"},"cfg":{},"name":"Drawback Chess · Hardest","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"iZQGpWbIwWI":{"mode":"fairy","params":{"k":"knightmare","lbl":"Cross Derby"},"cfg":{},"name":"Cross Derby · Destroy","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"DoImibR93tA":{"mode":"mirror","params":{},"cfg":{},"name":"I Played With Myself","explain":"The bot mirrors your last move whenever it can. Use the reflection against it and checkmate it.","src":"title"},
"mm11vzcLPhk":{"mode":"opening","params":{"k":"banned"},"cfg":{},"name":"Forced Opening: Banned Opening (Fried Liver)","explain":"The game starts from the Banned Opening (Fried Liver). Play on from there and checkmate the bot.","src":"title"},
"jmdkuvE2ApQ":{"mode":"craft","params":{},"cfg":{},"name":"Find Myself in Infinite Craft","explain":"Move a piece onto your own piece to craft a stronger one (knight + rook = knook). Checkmate the bot to win.","src":"title"},
"w4L_Obw74dE":{"mode":"fairy","params":{"k":"ultimate","lbl":"Chess Ultimate · Insane Setups"},"cfg":{},"name":"Chess Ultimate · Insane Setups","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"sGXmiyvZDE4":{"mode":"petrified","params":{"who":"both","only":"P"},"cfg":{},"name":"Petrified Pawns · Beat","explain":"Each turn one random pawn is frozen and cannot move. Checkmate the bot to win.","src":"title"},
"3dZa3R5KQag":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"pieces","levels":[300,700,1000,1400,1900,2400],"names":["Pawn Bot","Knight Bot","Bishop Bot","Rook Bot","Queen Bot","King Bot"]}},"name":"The Chess Piece Bots","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"wwVvGHfEfPI":{"mode":"fairy","params":{"k":"ultimate","lbl":"Chess Ultimate · Nerfed"},"cfg":{},"name":"Chess Ultimate · Nerfed","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"V3oH98OLYfU":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[5],"bot":10,"botShown":false,"tag":"Slay"},"cfg":{},"name":"Drawback Chess · Slay","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"GbyaIV7Vd1c":{"mode":"opening","params":{"k":"sodium"},"cfg":{},"name":"Forced Opening: Sodium Attack (1. Na3) · Survive","explain":"The game starts from the Sodium Attack (1. Na3). Play on from there and checkmate the bot.","src":"title"},
"ehlf0_asIKo":{"mode":"fairy","params":{"k":"ultimate","lbl":"Chess Ultimate · Weird Pieces"},"cfg":{},"name":"Chess Ultimate · Weird Pieces (Tried WEIRD Chess Ultimate)","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"hCKu-RjDEAk":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"top71","levels":[1800,2000,2200,2400,2600],"names":["Top 10%","Top 5%","Top 1%","Top 0.5%","Top 0.1%"]}},"name":"Beat 99.9% of the World","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"AWFB4EzGtDc":{"mode":"shotgun","params":{"rank":1,"range":3,"gun":1},"cfg":{},"name":"Gun King · Beat","explain":"You are a lone king that shoots enemies up to 3 squares away in a straight line. Clear the board or checkmate to win.","src":"title"},
"3_eutZExN2c":{"mode":"base:Giveaway","params":{},"cfg":{},"name":"Giveaway · Beat (BEAT Giveaway Chess )","explain":"Captures are forced and the king is just a piece. Lose all your pieces to win.","src":"title"},
"B5LGzOEZSyo":{"mode":"dice","params":{"n":1,"botFree":false},"cfg":{},"name":"Dice Chess · Crush","explain":"A die picks which piece type must move each turn. Checkmate the bot to win.","src":"title"},
"_qxqjb3DseA":{"mode":"opening","params":{"k":"badegg"},"cfg":{},"name":"Forced Opening: The Bad Egg · Beat","explain":"The game starts from the The Bad Egg. Play on from there and checkmate the bot.","src":"title"},
"ylsnkIXgqzw":{"mode":"opening","params":{"k":"french"},"cfg":{},"name":"Forced Opening: French Defense · Beat","explain":"The game starts from the French Defense. Play on from there and checkmate the bot.","src":"title"},
"I07GcHQtY2o":{"mode":"fairy","params":{"k":"ninja"},"cfg":{},"name":"Ninja + Angel · Beat","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"FxpWhTj2Cv4":{"mode":"fairy","params":{"k":"ultimate","lbl":"Chess Ultimate · OP Strategy"},"cfg":{},"name":"Chess Ultimate · OP Strategy","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"M0Nr98Axpo8":{"mode":"fairy","params":{"k":"ultimate","lbl":"Chess Ultimate"},"cfg":{},"name":"Chess Ultimate · Beat","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"1L_sxGgxX9M":{"mode":"choice","params":{"k":4,"lbl":"Passant"},"cfg":{},"name":"Passant · Conclusion","explain":"Each turn you may only pick from 4 random legal moves (outlined). Choose well and checkmate the bot.","src":"title"},
"dkCMhNcZezM":{"mode":"choice","params":{"k":4,"lbl":"Passant"},"cfg":{},"name":"Passant · Full Release - Part 2","explain":"Each turn you may only pick from 4 random legal moves (outlined). Choose well and checkmate the bot.","src":"title"},
"OO3XlFQ32i0":{"mode":"choice","params":{"k":4,"lbl":"Passant"},"cfg":{},"name":"Passant · Full Release","explain":"Each turn you may only pick from 4 random legal moves (outlined). Choose well and checkmate the bot.","src":"title"},
"OWbQgMUwgBQ":{"mode":"torpedo","params":{},"cfg":{},"name":"Torpedo Pawns · Survive","explain":"Pawns can move two squares forward from any rank. Race them up the board and checkmate the bot.","src":"title"},
"vcMhd5Vd1mM":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"roblox3","levels":[300,600,900,1200,1500],"names":["Noob","Guest","Builder","Pro","Admin"]}},"name":"Roblox Chess · Survive","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"d8pJkdxtXAA":{"mode":"setuppos","params":{"k":"hyper"},"cfg":{},"name":"Hyper Chess · Beat","explain":"Hyper pieces: every knight is a knightrider and every bishop an archbishop, for both sides.. Checkmate the bot to win.","src":"title"},
"QArt8jaaUsA":{"mode":"drawback","params":{"show":false,"hard":1,"seed":0,"mine":[3,7],"bot":11,"botShown":false,"tag":"Hard"},"cfg":{},"name":"Drawback Chess · Hard · Beat","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"FHkTnUyAWLA":{"mode":"classic","params":{},"cfg":{"who":"Lichess Stockfish (level 8)","elo":2900},"name":"Survive Lichess vs Lichess Stockfish (level 8)","explain":"Normal chess rules against this bot persona. Checkmate the bot to win. Bot: Lichess Stockfish (level 8).","src":"title"},
"pHItplJMih0":{"mode":"opening","params":{"k":"egg"},"cfg":{},"name":"Forced Opening: Egg Opening · Survive","explain":"The game starts from the Egg Opening. Play on from there and checkmate the bot.","src":"title"},
"dwiAKx06Q9E":{"mode":"dice","params":{"n":2,"botFree":false},"cfg":{},"name":"Dice Chess (two dice) · Survive","explain":"Two dice pick which piece types you may move each turn. Checkmate the bot to win.","src":"title"},
"oGP4TUDjSVk":{"mode":"ancient","params":{"k":"chaturaji"},"cfg":{},"name":"Chaturaji · Survive","explain":"Ancient rules: a weak ferz replaces the queen and elephants jump two squares diagonally. Checkmate the bot to win.","src":"title"},
"f5gm9cPvu3g":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"bbq","levels":[500,900,1300,1700,2100],"names":["Grill Apprentice","Burger Flipper","Pitmaster","Smoke Lord","BBQ Champion"]}},"name":"The BBQ Bots","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"tVAelwglnH8":{"mode":"captureany","params":{},"cfg":{},"name":"Capture Anything · Survive","explain":"You may capture your own pieces (not the king) to open lines. Checkmate the bot to win.","src":"title"},
"ppwoznHliD8":{"mode":"petrified","params":{"who":"both","only":"","lbl":"Petrified Chess"},"cfg":{},"name":"Petrified Chess · Survive","explain":"Each turn one random piece is frozen and cannot move. Checkmate the bot to win.","src":"title"},
"8uamUF9_3is":{"mode":"base:Chess960","params":{},"cfg":{},"name":"Chess960 · Survive","explain":"The back rank is shuffled at random and there is no castling. Checkmate the bot to win.","src":"title"},
"h7UFq4r59tM":{"mode":"fourp","params":{"w":1,"b":2},"cfg":{},"name":"4 Player Chess · Survive","explain":"The bot's side moves twice per turn, like several opponents. Checkmate or capture the enemy king.","src":"title"},
"ypac0SBFqb8":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[6],"bot":10,"botShown":false,"tag":"Survive"},"cfg":{},"name":"Drawback Chess · Survive","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"92d9wLU4g8U":{"mode":"base:3-Check","params":{},"cfg":{},"name":"3-Check · Survive","explain":"Give check three times to win, or checkmate the bot.","src":"title"},
"PPe7vscru0o":{"mode":"base:King of the Hill","params":{},"cfg":{},"name":"King of the Hill · Survive","explain":"Checkmate the bot, or walk your king onto one of the four centre squares to win.","src":"title"},
"vqxA5bBUoVA":{"mode":"setupchess","params":{},"cfg":{},"name":"Setup Chess (Survive)","explain":"Both armies are drafted from 39 points and placed on the first three ranks. Then play normal chess and checkmate the bot.","src":"title"},
"q_153NJxO1M":{"mode":"base:Crazyhouse-lite","params":{},"cfg":{},"name":"Spell Chess (Survive)","explain":"Captured pieces join your hand and can be dropped back on the board. Checkmate the bot to win.","src":"title"},
"hVOA_oScEBQ":{"mode":"base:Horde","params":{},"cfg":{},"name":"Horde · Survive","explain":"You are 36 pawns with no king. Checkmate the bot before your horde is wiped out.","src":"title"},
"lDlOC8KH0Zc":{"mode":"gift","params":{"t":"G","n":1},"cfg":{},"name":"Give the Bot Extra Grasshoppers vs Stockfish","explain":"The bot gets extra grasshoppers; add one more after every win. See how many you can give and still win. Bot: Stockfish.","src":"title"},
"Y3Jneu7zoq0":{"mode":"gift","params":{"t":"A","n":1},"cfg":{},"name":"Give the Bot Extra Archbishops vs Stockfish (Gave Stockfish 1 Knibis)","explain":"The bot gets extra archbishops; add one more after every win. See how many you can give and still win. Bot: Stockfish.","src":"title"},
"FxQ-A3nbBzU":{"mode":"gift","params":{"t":"E","n":1},"cfg":{},"name":"Give the Bot Extra Elephants vs Stockfish","explain":"The bot gets extra elephants; add one more after every win. See how many you can give and still win. Bot: Stockfish.","src":"title"},
"MSNUaDps49U":{"mode":"gift","params":{"t":"A","n":1},"cfg":{},"name":"Give the Bot Extra Archbishops vs Stockfish (Gave 1 Dragon to)","explain":"The bot gets extra archbishops; add one more after every win. See how many you can give and still win. Bot: Stockfish.","src":"title"},
"M0rsyuvaTrk":{"mode":"base:King of the Hill","params":{},"cfg":{},"name":"King of the Bridge · Impatience","explain":"Checkmate the bot, or walk your king onto one of the four centre squares to win.","src":"title"},
"X-aULHXsAaI":{"mode":"base:Racing Kings","params":{},"cfg":{},"name":"Racing Kings · Survive","explain":"No checks allowed. Race your king to the top rank first to win.","src":"title"},
"MQAC6oSeQzk":{"mode":"duck","params":{},"cfg":{},"name":"Duck Chess · Survive","explain":"After every move a duck drops on the square that blocks the most enemy moves, and nothing can pass it. Checkmate the bot to win.","src":"title"},
"EifHtpJlv7g":{"mode":"base:Fog of War","params":{},"cfg":{},"name":"Fog of War · Survive","explain":"You only see enemy pieces on squares your pieces can reach. Checkmate the bot to win.","src":"title"},
"uQ0kzL0-taQ":{"mode":"base:Atomic","params":{},"cfg":{},"name":"Atomic · Survive","explain":"Captures explode and destroy every non-pawn piece around them. Blow up the enemy king to win.","src":"title"},
"yuOnzbeYI1k":{"mode":"opening","params":{"k":"kg"},"cfg":{},"name":"Forced Opening: King's Gambit","explain":"The game starts from the King's Gambit. Play on from there and checkmate the bot.","src":"title"},
"dR76717W3JM":{"mode":"kingplus","params":{"t":"G","n":1},"cfg":{},"name":"How Many Grasshoppers? vs Stockfish","explain":"You have only your king and grasshoppers against a full army; add one more after each loss. Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"RqXorBCKAdA":{"mode":"kingplus","params":{"t":"A","n":1},"cfg":{},"name":"How Many Archbishops? vs Stockfish (How Many Knibis to)","explain":"You have only your king and archbishops against a full army; add one more after each loss. Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"ZoSm2Wxlhvo":{"mode":"kingplus","params":{"t":"E","n":1},"cfg":{},"name":"How Many Elephants? vs Stockfish","explain":"You have only your king and elephants against a full army; add one more after each loss. Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"134MBhzRN2c":{"mode":"base:Crazyhouse-lite","params":{},"cfg":{},"name":"Bughouse (Beat)","explain":"Captured pieces join your hand and can be dropped back on the board. Checkmate the bot to win.","src":"title"},
"Ex0PeXfb39I":{"mode":"kingplus","params":{"t":"A","n":1},"cfg":{},"name":"How Many Archbishops? vs Stockfish (How Many Dragons to)","explain":"You have only your king and archbishops against a full army; add one more after each loss. Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"hk85bBLSi7Q":{"mode":"base:Crazyhouse-lite","params":{},"cfg":{},"name":"Seirawan (Survive)","explain":"Captured pieces join your hand and can be dropped back on the board. Checkmate the bot to win.","src":"title"},
"ZlQHLtMma54":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[3],"bot":5,"botShown":false,"tag":"More · Survive"},"cfg":{},"name":"Drawback Chess · More · Survive","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"Cr3j7jf5xXk":{"mode":"dice","params":{"n":1,"botFree":true},"cfg":{},"name":"Dice Chess · Bamboozle","explain":"A die picks which piece type must move each turn. Checkmate the bot to win.","src":"title"},
"hxwi9DwDUKU":{"mode":"ancient","params":{"k":"chaturanga"},"cfg":{},"name":"Chaturanga · Survive","explain":"Ancient rules: a weak ferz replaces the queen and elephants jump two squares diagonally. Checkmate the bot to win.","src":"title"},
"YZjdissxTyA":{"mode":"fairy","params":{"k":"knightmare","lbl":"Cross Derby"},"cfg":{},"name":"Cross Derby · Beat","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"Oj5rYPqpldg":{"mode":"mini","params":{"v":"6x6"},"cfg":{},"name":"Mini Chess 6x6 · Survive","explain":"A cut-down board with fewer pieces; pawns step one square and promote at the far edge. Checkmate the bot to win.","src":"title"},
"mf238p7c3bc":{"mode":"wrap","params":{"lbl":"Infinite Chess"},"cfg":{},"name":"Infinite Chess vs TwoNiche","explain":"The left and right edges are joined, so pieces slide off one side and come back on the other. Checkmate the bot to win.","src":"title"},
"TyOcZ--ICSc":{"mode":"fairy","params":{"k":"A"},"cfg":{},"name":"Paradigm Chess","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"-TKJGtBKK8U":{"mode":"craft","params":{},"cfg":{},"name":"Infinite Craft","explain":"Move a piece onto your own piece to craft a stronger one (knight + rook = knook). Checkmate the bot to win.","src":"title"},
"IbRrzKtieqs":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"battle","levels":[400,700,1000,1300,1600,1900],"names":["Peasant","Farmer","Artisan","Nobleman","Clergyman","Monarch"]}},"name":"Can I BEAT Battle Chess?","explain":"Normal chess, but every capture plays out as a cartoon sword fight. Beat the AI from Peasant up to Monarch.","src":"transcript"},
"75lmLixPkCQ":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[4],"bot":6,"botShown":false,"tag":"Outplay"},"cfg":{},"name":"Drawback Chess · Outplay","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"iUUoeJL1FvY":{"mode":"wrap","params":{"lbl":"Infinite Chess"},"cfg":{},"name":"Infinite Chess vs Pjschess","explain":"The left and right edges are joined, so pieces slide off one side and come back on the other. Checkmate the bot to win.","src":"title"},
"1FKa1LnTDeQ":{"mode":"base:King of the Hill","params":{},"cfg":{},"name":"King of the Bridge · Overkill","explain":"Checkmate the bot, or walk your king onto one of the four centre squares to win.","src":"title"},
"SMOXF1bSsDk":{"mode":"wrap","params":{"lbl":"Beyond the Board"},"cfg":{},"name":"Beyond the Board · Abyss Ending","explain":"The left and right edges are joined, so pieces slide off one side and come back on the other. Checkmate the bot to win.","src":"title"},
"CfNegcvzrFw":{"mode":"opening","params":{"k":"e4"},"cfg":{},"name":"Forced Opening: 1. e4 · Learn","explain":"The game starts from the 1. e4. Play on from there and checkmate the bot.","src":"title"},
"fqfCh3CsTJk":{"mode":"wrap","params":{"lbl":"Infinite Chess"},"cfg":{},"name":"Infinite Chess · Master","explain":"The left and right edges are joined, so pieces slide off one side and come back on the other. Checkmate the bot to win.","src":"title"},
"136U_QTxBSw":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[13],"bot":1,"botShown":false,"tag":"Crush"},"cfg":{},"name":"Drawback Chess · Crush","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"Jg-oNqDOXtg":{"mode":"dice","params":{"n":2,"botFree":false},"cfg":{},"name":"Dice Chess (two dice) · Destroy","explain":"Two dice pick which piece types you may move each turn. Checkmate the bot to win.","src":"title"},
"xlErokL2-4c":{"mode":"wrap","params":{"lbl":"Beyond the Board"},"cfg":{},"name":"Beyond the Board","explain":"The left and right edges are joined, so pieces slide off one side and come back on the other. Checkmate the bot to win.","src":"title"},
"4KetMbEVvhI":{"mode":"base:King of the Hill","params":{},"cfg":{},"name":"King of the Bridge · Showdown","explain":"Checkmate the bot, or walk your king onto one of the four centre squares to win.","src":"title"},
"EbMPOuH0a28":{"mode":"fairy","params":{"k":"M"},"cfg":{"elo":1500},"name":"How Much Is a King Worth?","explain":"Explainer video: a king is never traded, so it has no point value. Here your queen becomes a non-royal king (commoner) so you can feel its worth.","src":"transcript","approx":"explainer, no game in the video"},
"eEarfgeHByE":{"mode":"classic","params":{},"cfg":{},"name":"Beat a Chess Cheater","explain":"Normal chess rules against this bot persona. Checkmate the bot to win. Bot: a Chess Cheater.","src":"title"},
"SmCty_pVF7A":{"mode":"rosen","params":{},"cfg":{},"name":"Rosen Score · Master","explain":"Trap and win the bot's queen and you win the game instantly. Checkmate also wins.","src":"title"},
"HQYOJZgscus":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[1],"bot":12,"botShown":false,"tag":"Dominate"},"cfg":{},"name":"Drawback Chess · Dominate","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"XxsQ7s3UYAc":{"mode":"wrap","params":{"lbl":"Infinite Chess"},"cfg":{},"name":"Infinite Chess","explain":"The left and right edges are joined, so pieces slide off one side and come back on the other. Checkmate the bot to win.","src":"title"},
"hv_NHWqysZE":{"mode":"base:King of the Hill","params":{},"cfg":{},"name":"King of the Bridge · Rules","explain":"Checkmate the bot, or walk your king onto one of the four centre squares to win.","src":"title"},
"Rtee8TRU0vg":{"mode":"dice","params":{"n":1,"botFree":false},"cfg":{},"name":"Dice Chess · Defeat","explain":"A die picks which piece type must move each turn. Checkmate the bot to win.","src":"title"},
"hZf3G9Pr1UU":{"mode":"fogx","params":{"v":"half","lbl":"3D Glasses"},"cfg":{},"name":"3D Glasses · Beat","explain":"You only see enemy pieces on dark squares. Checkmate the bot to win.","src":"title"},
"iqfHW2_sMmc":{"mode":"base:King of the Hill","params":{},"cfg":{},"name":"Who Takes the Crown · Influencer Levels","explain":"Checkmate the bot, or walk your king onto one of the four centre squares to win.","src":"title"},
"Nz2A-g73_iM":{"mode":"fogx","params":{"v":"radius","lbl":"FPS Chess"},"cfg":{},"name":"FPS Chess · Master","explain":"You only see enemy pieces within two squares of yours. Checkmate the bot to win.","src":"title"},
"NKNYOJWVln8":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[13],"bot":11,"botShown":false,"tag":"Demolish"},"cfg":{},"name":"Drawback Chess · Demolish","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"puKYAUl9x9s":{"mode":"base:King of the Hill","params":{},"cfg":{},"name":"King of the Bridge · Bullet","explain":"Checkmate the bot, or walk your king onto one of the four centre squares to win.","src":"title"},
"eKAOw0yaqyA":{"mode":"dice","params":{"n":1,"botFree":false},"cfg":{},"name":"Dice Chess · Survive","explain":"A die picks which piece type must move each turn. Checkmate the bot to win.","src":"title"},
"zDFsnRE_Gig":{"mode":"base:King of the Hill","params":{},"cfg":{},"name":"Who Takes the Crown · Master","explain":"Checkmate the bot, or walk your king onto one of the four centre squares to win.","src":"title"},
"1Q4rfOd0al8":{"mode":"rosen","params":{},"cfg":{},"name":"Rosen Score","explain":"Trap and win the bot's queen and you win the game instantly. Checkmate also wins.","src":"title"},
"5iSjXn71oJg":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"karate","levels":[400,800,1200,1600,2100],"names":["White Belt","Yellow Belt","Green Belt","Brown Belt","Black Belt"]}},"name":"The Karate Bots","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"vGfdq7j_deY":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"hijack","levels":[1400,1600,1800,2000,2200],"names":["Round 1","Round 2","Round 3","Semifinal","Final"]}},"name":"Hijacked a Streamer's Tournament","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"mQFYJQtKR0U":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[5],"bot":4,"botShown":false,"tag":"Endure"},"cfg":{},"name":"Drawback Chess · Endure","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"UzoZVdmGpyc":{"mode":"base:King of the Hill","params":{},"cfg":{},"name":"Who Takes the Crown","explain":"Checkmate the bot, or walk your king onto one of the four centre squares to win.","src":"title"},
"haNXJMir3Zk":{"mode":"dice","params":{"n":1,"botFree":true},"cfg":{},"name":"Dice Chess · Gamble","explain":"A die picks which piece type must move each turn. Checkmate the bot to win.","src":"title"},
"ioUPg_z2KpA":{"mode":"duck","params":{},"cfg":{},"name":"Duck Chess","explain":"After every move a duck drops on the square that blocks the most enemy moves, and nothing can pass it. Checkmate the bot to win.","src":"title"},
"p6W3yDU-v88":{"mode":"base:Gravity","params":{},"cfg":{},"name":"Conquer Chess with Gravity","explain":"After every move all pieces except pawns and kings fall toward the bottom. Checkmate the bot to win.","src":"title"},
"dztzDlPfqSI":{"mode":"choice","params":{"k":4,"lbl":"Passant"},"cfg":{},"name":"Passant · Conquer","explain":"Each turn you may only pick from 4 random legal moves (outlined). Choose well and checkmate the bot.","src":"title"},
"Y1WHtLBLloY":{"mode":"drawback","params":{"show":true,"hard":0,"seed":0,"mine":[11],"bot":7,"botShown":false,"tag":"Classic"},"cfg":{},"name":"Drawback Chess · Classic","explain":"Your drawback (your pawns cannot move two squares) is shown. Checkmate the bot to win.","src":"title"},
"Xlke-qcgZlo":{"mode":"maze","params":{"layout":"cross","style":"wall","n":10},"cfg":{},"name":"Dangerous Intersection","explain":"Wall squares block the board and nothing can enter or slide through them. Find a way around and checkmate the bot.","src":"title"},
"oAoik9Dj2qQ":{"mode":"shapeshift","params":{"lone":false},"cfg":{},"name":"Chessformer (Master)","explain":"Pieces change shape after moving: knight, bishop, rook, queen, repeat. Checkmate the bot to win.","src":"title"},
"KJYUsRlj_34":{"mode":"dice","params":{"n":1,"botFree":false},"cfg":{},"name":"Dice Chess · Destroy","explain":"A die picks which piece type must move each turn. Checkmate the bot to win.","src":"title"},
"qZyNuiVbGMI":{"mode":"choice","params":{"k":4,"lbl":"Passant"},"cfg":{},"name":"Passant · Master","explain":"Each turn you may only pick from 4 random legal moves (outlined). Choose well and checkmate the bot.","src":"title"},
"9j7h5kF4X9s":{"mode":"shotgun","params":{"rank":4,"range":2},"cfg":{},"name":"Shotgun King · Rank 4 · Beat","explain":"You are a lone king that shoots enemies up to 2 squares away in a straight line. Clear the board or checkmate to win.","src":"title"},
"PQAWp964-b4":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[3],"bot":5,"botShown":false,"tag":"More · Survive"},"cfg":{},"name":"Drawback Chess · More · Survive","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"U0WKImOhG0s":{"mode":"clock","params":{},"cfg":{"gauntlet":{"key":"3plus","levels":[1400,1600,1800,2000,2200],"names":["Round 1","Round 2","Round 3","Semifinal","Final"]},"clock":{"total":180,"inc":2}},"name":"3+2 Tournament","explain":"You play on a 3:00 clock +2s. Checkmate the bot before your time runs out.","src":"title"},
"RDl-EmbTRWc":{"mode":"chessformer","params":{},"cfg":{"elo":300},"name":"Can I BEAT Chessformer?","explain":"Chess pieces with gravity: after each move your piece falls until it lands. Reach and capture the red king in each level.","src":"transcript","approx":"one hand-made level instead of the game's level set"},
"rMSar6g_2HY":{"mode":"choice","params":{"k":4,"lbl":"Passant"},"cfg":{},"name":"Passant","explain":"Each turn you may only pick from 4 random legal moves (outlined). Choose well and checkmate the bot.","src":"title"},
"Fbk0Xbcz728":{"mode":"base:3-Check","params":{},"cfg":{},"name":"3-Check · Win","explain":"Give check three times to win, or checkmate the bot.","src":"title"},
"ePpFGTNs5sE":{"mode":"wrap","params":{"lbl":"Circular Chess"},"cfg":{},"name":"Circular Chess · Beat","explain":"The left and right edges are joined, so pieces slide off one side and come back on the other. Checkmate the bot to win.","src":"title"},
"mLDlK5HlUiY":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[11],"bot":4,"botShown":false,"tag":"Defeat"},"cfg":{},"name":"Drawback Chess · Defeat","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"NK4Upb_s8Ok":{"mode":"shotgun","params":{"rank":3,"range":2},"cfg":{},"name":"Shotgun King · Rank 3 · Beat","explain":"You are a lone king that shoots enemies up to 2 squares away in a straight line. Clear the board or checkmate to win.","src":"title"},
"ulE3YPZI9Sc":{"mode":"base:King of the Hill","params":{},"cfg":{},"name":"King of the Bridge · Ascension","explain":"Checkmate the bot, or walk your king onto one of the four centre squares to win.","src":"title"},
"6FTov-lER7k":{"mode":"base:Chess960","params":{},"cfg":{},"name":"Mix Master","explain":"The back rank is shuffled at random and there is no castling. Checkmate the bot to win.","src":"title"},
"OcWzHqqeLNg":{"mode":"dice","params":{"n":2,"botFree":false},"cfg":{},"name":"Dice Chess (two dice)","explain":"Two dice pick which piece types you may move each turn. Checkmate the bot to win.","src":"title"},
"pzxXxIsKRRo":{"mode":"shotgun","params":{"rank":2,"range":2},"cfg":{},"name":"Shotgun King · Rank 2 · Beat","explain":"You are a lone king that shoots enemies up to 2 squares away in a straight line. Clear the board or checkmate to win.","src":"title"},
"eCzxOgc4fTY":{"mode":"hearts","params":{},"cfg":{"who":"Duo the Owl","elo":1000,"hearts":3},"name":"Duolingo Chess","explain":"You have 3 hearts; every move that throws away material costs one. Checkmate the bot before your hearts run out. Bot: Duo the Owl.","src":"title"},
"bhFqAdqNkrk":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[13],"bot":2,"botShown":false,"tag":"More · Master"},"cfg":{},"name":"Drawback Chess · More · Master","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"Y7KKKTTkwNk":{"mode":"base:King of the Hill","params":{},"cfg":{},"name":"King of the Bridge · Goose","explain":"Checkmate the bot, or walk your king onto one of the four centre squares to win. Bot: the Goose.","src":"title"},
"4tpkxYdDafE":{"mode":"base:King of the Hill","params":{},"cfg":{},"name":"Higher Ground","explain":"Checkmate the bot, or walk your king onto one of the four centre squares to win.","src":"title"},
"AvZiSnngZjA":{"mode":"shotgun","params":{"rank":1,"range":2},"cfg":{"elo":1400},"name":"Can I BEAT Shotgun King?","explain":"You are a lone king with a shotgun: shoot enemies up to two squares away in a line instead of moving. Kill or checkmate the enemy king.","src":"transcript","approx":"no shells, cards or floors; colours flipped so you are White"},
"UECeBEOHoy0":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[9],"bot":11,"botShown":false,"tag":"More · Beat"},"cfg":{},"name":"Drawback Chess · More · Beat","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"0LO0D0rOif0":{"mode":"base:King of the Hill","params":{},"cfg":{},"name":"King of the Bridge · Good","explain":"Checkmate the bot, or walk your king onto one of the four centre squares to win.","src":"title"},
"JcpCAs1a2gc":{"mode":"anarchy","params":{},"cfg":{},"name":"Anarchy Chess","explain":"En passant is forced whenever it is possible. Exploit it, then checkmate the bot.","src":"title"},
"A82x0ireZjU":{"mode":"heist","params":{},"cfg":{},"name":"The Heist · Beat","explain":"Get any of your pieces onto the bot's d8 or e8 vault square to win, or checkmate it.","src":"title"},
"Obcl5GCtNHc":{"mode":"wrap","params":{"lbl":"1 Million Chessboards"},"cfg":{},"name":"1 Million Chessboards · Beat","explain":"The left and right edges are joined, so pieces slide off one side and come back on the other. Checkmate the bot to win.","src":"title"},
"SziPGAIumqE":{"mode":"opening","params":{"k":"london"},"cfg":{},"name":"London System Propaganda","explain":"The game starts from the London System. Play on from there and checkmate the bot.","src":"title"},
"exMFzra96vo":{"mode":"dice","params":{"n":2,"botFree":false},"cfg":{},"name":"Dice Chess (two dice) · Win","explain":"Two dice pick which piece types you may move each turn. Checkmate the bot to win.","src":"title"},
"LPuSaBYVAUI":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[3],"bot":5,"botShown":false,"tag":"More · Survive"},"cfg":{},"name":"Drawback Chess · More · Survive","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"lBBL4aOMENY":{"mode":"base:3-Check","params":{},"cfg":{},"name":"3 Strikes","explain":"Give check three times to win, or checkmate the bot.","src":"title"},
"PszkLYudcws":{"mode":"fogx","params":{"v":"radius","lbl":"FPS Chess"},"cfg":{},"name":"FPS Chess · Beat","explain":"You only see enemy pieces within two squares of yours. Checkmate the bot to win.","src":"title"},
"qSwTtgUWqUw":{"mode":"mini","params":{"v":"5x5"},"cfg":{"rewind":2},"name":"Tiny 5D Chess","explain":"A cut-down board with fewer pieces; pawns step one square and promote at the far edge. Checkmate the bot to win.","src":"title"},
"gY9DNg9xDUM":{"mode":"mini","params":{"v":"5x5"},"cfg":{},"name":"Tiny Chess 5x5 · Master","explain":"A cut-down board with fewer pieces; pawns step one square and promote at the far edge. Checkmate the bot to win.","src":"title"},
"WEYUcaJTBso":{"mode":"troll","params":{"every":4},"cfg":{"who":"The Troll","elo":1200},"name":"Can I BEAT King of the Bridge?","explain":"The Troll cheats with illegal moves every few turns, and each time you get two moves in a row as payback. Checkmate the Troll.","src":"transcript","approx":"no accusation button or rule book; cheating is automatic and payback is automatic"},
"923YDOJyITE":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[13],"bot":4,"botShown":false,"tag":"Even More"},"cfg":{},"name":"Drawback Chess · Even More","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"ehmkD8nOG0g":{"mode":"craft","params":{},"cfg":{},"name":"Mad Scientist","explain":"Move a piece onto your own piece to craft a stronger one (knight + rook = knook). Checkmate the bot to win.","src":"title"},
"NbMW2bOMO5k":{"mode":"shotgun","params":{"rank":1,"range":2},"cfg":{},"name":"Killer King","explain":"You are a lone king that shoots enemies up to 2 squares away in a straight line. Clear the board or checkmate to win.","src":"title"},
"BbgwPj-u_gs":{"mode":"timetravel","params":{},"cfg":{"rewind":3},"name":"5D Chess (3 rewinds)","explain":"Press Rewind to take back your last move and the bot's reply (3 per game). Checkmate the bot to win.","src":"title"},
"HkeZayq10p8":{"mode":"dice","params":{"n":1,"botFree":false},"cfg":{},"name":"Dice Chess · Conquer","explain":"A die picks which piece type must move each turn. Checkmate the bot to win.","src":"title"},
"dDtGI5U0HQk":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"roblox13","levels":[300,600,900,1200,1500],"names":["Noob","Guest","Builder","Pro","Admin"]}},"name":"Roblox Chess · Comeback","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"oejsLcLHwoA":{"mode":"base:Giveaway","params":{},"cfg":{},"name":"4 Player Giveaway","explain":"Captures are forced and the king is just a piece. Lose all your pieces to win.","src":"title"},
"piiE6JB8pWw":{"mode":"mini","params":{"v":"5x5"},"cfg":{},"name":"Tiny Chess 5x5 · Beat","explain":"A cut-down board with fewer pieces; pawns step one square and promote at the far edge. Checkmate the bot to win.","src":"title"},
"b_BKi_Q4LfU":{"mode":"lone","params":{"k":"A1"},"cfg":{"elo":1200},"name":"How Much Is a Dragon Bishop Worth?","explain":"The Dragon Bishop moves like a bishop or a knight. It can checkmate a lone king by itself and is worth about 7 points.","src":"transcript"},
"9M2Mj2WFFys":{"mode":"multi","params":{"w":2,"b":2,"lbl":"Kung Fu Chess"},"cfg":{},"name":"Kung Fu Chess · Beat","explain":"You make 2 moves per turn, the bot makes 2; a check ends the turn. Checkmate the bot to win.","src":"title"},
"ls3U1YKj9As":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"roblox46","levels":[300,600,900,1200,1500],"names":["Noob","Guest","Builder","Pro","Admin"]}},"name":"Roblox Chess · Conquer","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"CEkC0TINhm8":{"mode":"dice","params":{"n":1,"botFree":false},"cfg":{},"name":"Dice Chess · Master","explain":"A die picks which piece type must move each turn. Checkmate the bot to win.","src":"title"},
"TsA-ro0GZ0I":{"mode":"choice","params":{"k":3,"lbl":"10,000 Player Chess"},"cfg":{},"name":"10,000 Player Chess · Beat","explain":"Each turn you may only pick from 3 random legal moves (outlined). Choose well and checkmate the bot.","src":"title"},
"tm24Uq9nlBc":{"mode":"setuppos","params":{"k":"luxury"},"cfg":{},"name":"Luxury Chess","explain":"Everything is upgraded: both sides start with two queens and their bishops replaced by archbishops.. Checkmate the bot to win.","src":"title"},
"C4KUaT_EmRQ":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[9],"bot":11,"botShown":false,"tag":"More"},"cfg":{},"name":"Drawback Chess · More","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"fXNw2uIWqgY":{"mode":"fogx","params":{"v":"blind","lbl":"Blindfold Chess"},"cfg":{},"name":"Blindfold Chess · Master","explain":"Enemy pieces are invisible; only their last move is highlighted. Checkmate the bot to win.","src":"title"},
"rBh7IIhTbw4":{"mode":"base:Giveaway","params":{},"cfg":{},"name":"Giveaway · Master","explain":"Captures are forced and the king is just a piece. Lose all your pieces to win.","src":"title"},
"3PfBlaosAmY":{"mode":"sideways","params":{},"cfg":{},"name":"Sideways Pawns · Master","explain":"Pawns can also step one square sideways. Use the extra pawn moves to break through and checkmate the bot.","src":"title"},
"Cs6knoD0INQ":{"mode":"choice","params":{"k":3,"lbl":"YouTube Chess"},"cfg":{},"name":"YouTube Chess · Beat","explain":"Each turn you may only pick from 3 random legal moves (outlined). Choose well and checkmate the bot.","src":"title"},
"EqOwqolOZOo":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"roblox76","levels":[300,600,900,1200,1500],"names":["Noob","Guest","Builder","Pro","Admin"]}},"name":"Roblox Chess · Master","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"mZUViBNWt6E":{"mode":"ancient","params":{"k":"chaturaji"},"cfg":{},"name":"Chaturaji · Master","explain":"Ancient rules: a weak ferz replaces the queen and elephants jump two squares diagonally. Checkmate the bot to win.","src":"title"},
"mgXpcH_bWcY":{"mode":"fogx","params":{"v":"blind","lbl":"Blindfold Hikaru"},"cfg":{},"name":"Blindfold Hikaru","explain":"Enemy pieces are invisible; only their last move is highlighted. Checkmate the bot to win. Bot: Hikaru.","src":"title"},
"RnMKtGgKknQ":{"mode":"torpedo","params":{},"cfg":{},"name":"Torpedo Pawns · Master","explain":"Pawns can move two squares forward from any rank. Race them up the board and checkmate the bot.","src":"title"},
"SaLxG36hldw":{"mode":"base:Crazyhouse-lite","params":{},"cfg":{},"name":"Crazyhouse (Master)","explain":"Captured pieces join your hand and can be dropped back on the board. Checkmate the bot to win.","src":"title"},
"dz81n87sILE":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"earth","levels":[400,800,1200,1600,2000],"names":["Seedling","Sapling","Oak","Rainforest","Gaia"]}},"name":"Earth Day Bots","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"xi8OzINkaiA":{"mode":"roulette","params":{"hide":true,"lbl":"April Fools"},"cfg":{},"name":"April Fools","explain":"One hidden twist from the arcade is active. Work out which one and checkmate the bot.","src":"title"},
"nmG8MDaqYTk":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[6],"bot":10,"botShown":false,"tag":"Survive"},"cfg":{},"name":"Drawback Chess · Survive","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"VV9Wb6egokU":{"mode":"captureany","params":{},"cfg":{},"name":"Capture Anything · Master","explain":"You may capture your own pieces (not the king) to open lines. Checkmate the bot to win.","src":"title"},
"NWxiv9k1yrQ":{"mode":"petrified","params":{"who":"both","only":"","lbl":"Petrified Chess"},"cfg":{},"name":"Petrified Chess · Master","explain":"Each turn one random piece is frozen and cannot move. Checkmate the bot to win.","src":"title"},
"WNAxheS0e7E":{"mode":"base:Chess960","params":{},"cfg":{},"name":"Chess960 · Master","explain":"The back rank is shuffled at random and there is no castling. Checkmate the bot to win.","src":"title"},
"x-ISu_8MDvY":{"mode":"classic","params":{},"cfg":{"who":"GM Ben Finegold","elo":2500,"style":"nof6"},"name":"GM Ben Finegold (never plays f6)","explain":"Normal chess rules against this bot persona. Checkmate the bot to win. Bot: GM Ben Finegold.","src":"title"},
"YP-PIQhyGwE":{"mode":"fourp","params":{"w":1,"b":2},"cfg":{},"name":"4 Player Chess · Master","explain":"The bot's side moves twice per turn, like several opponents. Checkmate or capture the enemy king.","src":"title"},
"I9n4kXe3A-I":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[9],"bot":11,"botShown":false,"tag":"More"},"cfg":{},"name":"Drawback Chess · More","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"qTXES0F1MVQ":{"mode":"base:3-Check","params":{},"cfg":{},"name":"3-Check · Master","explain":"Give check three times to win, or checkmate the bot.","src":"title"},
"y4jUrlwAPlA":{"mode":"base:King of the Hill","params":{},"cfg":{},"name":"King of the Hill · Master","explain":"Checkmate the bot, or walk your king onto one of the four centre squares to win.","src":"title"},
"nFY-Hn6xiOI":{"mode":"setupchess","params":{},"cfg":{"elo":2600},"name":"Can I MASTER Setup Chess?","explain":"Both armies are drafted from 39 points of material placed on the first three ranks, kings included. Then play normal chess and checkmate.","src":"transcript","approx":"placement is drafted at random instead of placed by hand"},
"8CtX9G07bMU":{"mode":"base:Crazyhouse-lite","params":{},"cfg":{},"name":"Spell Chess (Master)","explain":"Captured pieces join your hand and can be dropped back on the board. Checkmate the bot to win.","src":"title"},
"cvMXLpdwWsc":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[10],"bot":13,"botShown":false,"tag":"Master"},"cfg":{},"name":"Drawback Chess · Master","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"88CgS9anXJs":{"mode":"base:Horde","params":{},"cfg":{},"name":"Horde · Master","explain":"You are 36 pawns with no king. Checkmate the bot before your horde is wiped out.","src":"title"},
"cigOpktP92s":{"mode":"fairy","params":{"k":"gothic"},"cfg":{},"name":"Gothic Chess · Master","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"ZP5cnusxKgA":{"mode":"base:Racing Kings","params":{},"cfg":{},"name":"Racing Kings · Master","explain":"No checks allowed. Race your king to the top rank first to win.","src":"title"},
"nXpanP8v3pg":{"mode":"fogking","params":{},"cfg":{"elo":1800},"name":"Can I MASTER Fog of War Chess?","explain":"You only see the squares your pieces can reach. There's no check: capture the enemy king to win.","src":"transcript"},
"b0peFhZs4yU":{"mode":"base:Atomic","params":{},"cfg":{},"name":"Atomic · Master","explain":"Captures explode and destroy every non-pawn piece around them. Blow up the enemy king to win.","src":"title"},
"E2x-QTgBD5k":{"mode":"duck","params":{},"cfg":{},"name":"Duck Chess · Master","explain":"After every move a duck drops on the square that blocks the most enemy moves, and nothing can pass it. Checkmate the bot to win.","src":"title"},
"TTimDDC4Cwc":{"mode":"base:Crazyhouse-lite","params":{},"cfg":{},"name":"Seirawan (Master)","explain":"Captured pieces join your hand and can be dropped back on the board. Checkmate the bot to win.","src":"title"},
"GuyllCIRcQI":{"mode":"ancient","params":{"k":"chaturanga"},"cfg":{},"name":"Chaturanga · Master","explain":"Ancient rules: a weak ferz replaces the queen and elephants jump two squares diagonally. Checkmate the bot to win.","src":"title"},
"34iAKIAMKb8":{"mode":"mini","params":{"v":"mini6"},"cfg":{"elo":1600},"name":"Can I MASTER Mini Chess? (Rare Variant)","explain":"Chess on a tiny 6x6 board. Captured pieces switch sides and can be dropped back onto the board.","src":"transcript"},
"R8gZYKtr-C4":{"mode":"fairy","params":{"k":"A"},"cfg":{},"name":"Dragon Bishop Chess (Master)","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"xAFkE7-Jp88":{"mode":"base:Giveaway","params":{},"cfg":{},"name":"Giveaway · Beat (Antichess)","explain":"Captures are forced and the king is just a piece. Lose all your pieces to win.","src":"title"},
"cWvs-sIvktw":{"mode":"base:Giveaway","params":{},"cfg":{},"name":"Checkers Chess (Beat)","explain":"Captures are forced and the king is just a piece. Lose all your pieces to win.","src":"title"},
"vm0JynHlzys":{"mode":"dice","params":{"n":1,"botFree":false},"cfg":{},"name":"Dice Chess · Beat","explain":"A die picks which piece type must move each turn. Checkmate the bot to win.","src":"title"},
"aK1cIhZDzkI":{"mode":"sideways","params":{},"cfg":{},"name":"Sideways Pawns · Beat","explain":"Pawns can also step one square sideways. Use the extra pawn moves to break through and checkmate the bot.","src":"title"},
"4oJgefAYN4k":{"mode":"torpedo","params":{},"cfg":{},"name":"Torpedo Pawns · Beat","explain":"Pawns can move two squares forward from any rank. Race them up the board and checkmate the bot.","src":"title"},
"rbfC90ZzPW8":{"mode":"drawback","params":{"show":false,"hard":0,"seed":0,"mine":[8],"bot":12,"botShown":false,"tag":"Beat"},"cfg":{},"name":"Drawback Chess · Beat","explain":"You and the bot each have a hidden drawback that forbids some moves. Checkmate the bot to win.","src":"title"},
"LpfXLa5v9Zk":{"mode":"fogx","params":{"v":"blind","lbl":"Blindfold Chess"},"cfg":{},"name":"Blindfold Chess · Beat","explain":"Enemy pieces are invisible; only their last move is highlighted. Checkmate the bot to win.","src":"title"},
"GQ6MT1m78Yo":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"family","levels":[250,400,600,900,1300],"names":["Baby Martin","Martin","Martin's Sister","Martin's Dad","Martin's Grandma"]}},"name":"Martin's Family","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"5K72RRDBN5U":{"mode":"base:Crazyhouse-lite","params":{},"cfg":{},"name":"Crazyhouse (Beat)","explain":"Captured pieces join your hand and can be dropped back on the board. Checkmate the bot to win.","src":"title"},
"OVM-2QJ2NFQ":{"mode":"ancient","params":{"k":"chaturaji"},"cfg":{},"name":"Chaturaji · Beat","explain":"Ancient rules: a weak ferz replaces the queen and elephants jump two squares diagonally. Checkmate the bot to win.","src":"title"},
"8XmhGMnypjc":{"mode":"fourp","params":{"w":2,"b":2,"team":1,"lbl":"4 Player Team Chess"},"cfg":{},"name":"4 Player Team Chess · Beat","explain":"You and the bot each move twice per turn, like two teams. Checkmate or capture the enemy king.","src":"title"},
"jXOg1Py4EoA":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"roblox60","levels":[300,600,900,1200,1500],"names":["Noob","Guest","Builder","Pro","Admin"]}},"name":"Roblox Chess · Beat","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"O44sHRw-89k":{"mode":"petrified","params":{"who":"both","only":"","lbl":"Petrified Chess"},"cfg":{},"name":"Petrified Chess · Beat","explain":"Each turn one random piece is frozen and cannot move. Checkmate the bot to win.","src":"title"},
"753ZN9F-mzU":{"mode":"base:Chess960","params":{},"cfg":{},"name":"Chess960 · Beat","explain":"The back rank is shuffled at random and there is no castling. Checkmate the bot to win.","src":"title"},
"xim3ocTGn4E":{"mode":"base:3-Check","params":{},"cfg":{},"name":"3-Check · Beat","explain":"Give check three times to win, or checkmate the bot.","src":"title"},
"t8VWAr2UicA":{"mode":"base:King of the Hill","params":{},"cfg":{},"name":"King of the Hill · Beat","explain":"Checkmate the bot, or walk your king onto one of the four centre squares to win.","src":"title"},
"f4O--Ai7B9A":{"mode":"setupchess","params":{},"cfg":{},"name":"Setup Chess (Beat)","explain":"Both armies are drafted from 39 points and placed on the first three ranks. Then play normal chess and checkmate the bot.","src":"title"},
"Ag3KKsIrax4":{"mode":"base:Crazyhouse-lite","params":{},"cfg":{},"name":"Spell Chess (Beat)","explain":"Captured pieces join your hand and can be dropped back on the board. Checkmate the bot to win.","src":"title"},
"LK1gJhFKgwU":{"mode":"fourp","params":{"w":1,"b":2},"cfg":{"elo":1900},"name":"Can I BEAT 4 Player Chess?","explain":"Two-player stand-in for 4-player chess: the enemy side moves twice per turn, like several opponents. Checkmate or capture the enemy king.","src":"transcript","approx":"real game is a cross-shaped 4-army board scored by points; not representable on this 8x8 engine"},
"9bvch-UHQhg":{"mode":"base:Horde","params":{},"cfg":{},"name":"Horde · Beat","explain":"You are 36 pawns with no king. Checkmate the bot before your horde is wiped out.","src":"title"},
"yXE14E0QKNI":{"mode":"fairy","params":{"k":"gothic"},"cfg":{},"name":"Gothic Chess · Beat","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"n-sYPJVwaXs":{"mode":"fairy","params":{"k":"gothic","lbl":"XXL Chess"},"cfg":{},"name":"XXL Chess · Beat","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"bLwXpCK_h4k":{"mode":"base:Racing Kings","params":{},"cfg":{},"name":"Racing Kings · Beat","explain":"No checks allowed. Race your king to the top rank first to win.","src":"title"},
"xt4blnOS3m8":{"mode":"base:Fog of War","params":{},"cfg":{},"name":"Fog of War · Beat","explain":"You only see enemy pieces on squares your pieces can reach. Checkmate the bot to win.","src":"title"},
"wTudFnunSL0":{"mode":"base:Atomic","params":{},"cfg":{},"name":"Atomic · Beat","explain":"Captures explode and destroy every non-pawn piece around them. Blow up the enemy king to win.","src":"title"},
"TX8zxTIeby4":{"mode":"duck","params":{},"cfg":{},"name":"Duck Chess · Beat","explain":"After every move a duck drops on the square that blocks the most enemy moves, and nothing can pass it. Checkmate the bot to win.","src":"title"},
"DGlqJG6kzn8":{"mode":"base:Crazyhouse-lite","params":{},"cfg":{},"name":"Seirawan (Beat)","explain":"Captured pieces join your hand and can be dropped back on the board. Checkmate the bot to win.","src":"title"},
"XfDeP9FjZ7w":{"mode":"ancient","params":{"k":"chaturanga"},"cfg":{},"name":"Chaturanga · Beat","explain":"Ancient rules: a weak ferz replaces the queen and elephants jump two squares diagonally. Checkmate the bot to win.","src":"title"},
"v2QhfoGAp_I":{"mode":"mini","params":{"v":"6x6"},"cfg":{},"name":"Mini Chess 6x6 · Beat","explain":"A cut-down board with fewer pieces; pawns step one square and promote at the far edge. Checkmate the bot to win.","src":"title"},
"HtNZ9DTxHUs":{"mode":"fairy","params":{"k":"A"},"cfg":{},"name":"Dragon Bishop Chess (Beat)","explain":"Fairy pieces join the board (badges name them). Learn their moves and checkmate the bot.","src":"title"},
"MwXcULBxA_s":{"mode":"martinfish","params":{"p":0.45},"cfg":{},"name":"Martinfish","explain":"Each move the bot plays its best move 45% of the time and a beginner move otherwise. Checkmate the bot to win.","src":"title"},
"2Sud5_YAp84":{"mode":"classic","params":{},"cfg":{"style":"chatgpt"},"name":"A Goose at Chess","explain":"Normal chess rules against this bot persona. Checkmate the bot to win. Bot: the Goose.","src":"title"},
"lX407_vwgaA":{"mode":"kingplus","params":{"t":"Q","n":1},"cfg":{},"name":"How Many Queens? vs Croissant","explain":"You have only your king and queens against a full army; add one more after each loss. Checkmate the bot to win. Bot: Croissant.","src":"title"},
"F3CgCAxsTcI":{"mode":"classic","params":{},"cfg":{"who":"a National Master","elo":2200},"name":"First Tournament vs a National Master","explain":"Normal chess rules against this bot persona. Checkmate the bot to win. Bot: a National Master.","src":"title"},
"Y0LOmrRicgw":{"mode":"martinfish","params":{"p":0.35},"cfg":{},"name":"Martinfish (Worse)","explain":"Each move the bot plays its best move 35% of the time and a beginner move otherwise. Checkmate the bot to win.","src":"title"},
"hymgaszLxnw":{"mode":"classic","params":{},"cfg":{"who":"Evil Martin","elo":2900,"taunts":["I am not the Martin you know.","Hello again.","You thought I was 250?"]},"name":"Evil Martin (Worse)","explain":"Normal chess rules against this bot persona. Checkmate the bot to win. Bot: Evil Martin.","src":"title"},
"ew6NU1Z_G4k":{"mode":"martinfish","params":{"p":0.5},"cfg":{},"name":"Martinfish Is Back","explain":"Each move the bot plays its best move 50% of the time and a beginner move otherwise. Checkmate the bot to win.","src":"title"},
"NTZVWUtp2DM":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"nm","levels":[1500,1700,1900,2100,2200],"names":["Class C","Class B","Class A","Expert","National Master"]}},"name":"Road to National Master","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"LfzNhUjl3qE":{"mode":"classic","params":{},"cfg":{"who":"Evil Martin","elo":2600,"taunts":["I am not the Martin you know.","Hello again.","You thought I was 250?"]},"name":"You're Not Ready for Evil Martin","explain":"Normal chess rules against this bot persona. Checkmate the bot to win. Bot: Evil Martin.","src":"title"},
"t61xLLQbotM":{"mode":"gift","params":{"t":"R","n":1},"cfg":{},"name":"Give the Bot Extra Rooks vs Magnus","explain":"The bot gets extra rooks; add one more after every win. See how many you can give and still win. Bot: Magnus.","src":"title"},
"VWbwjNCAJtE":{"mode":"gift","params":{"t":"Q","n":1},"cfg":{},"name":"Give the Bot Extra Queens vs Magnus","explain":"The bot gets extra queens; add one more after every win. See how many you can give and still win. Bot: Magnus.","src":"title"},
"zJZKdeIq1Dw":{"mode":"gift","params":{"t":"P","n":1},"cfg":{},"name":"Give the Bot Extra Pawns vs Martin","explain":"The bot gets extra pawns; add one more after every win. See how many you can give and still win. Bot: Martin.","src":"title"},
"RVEM3CatpHM":{"mode":"gift","params":{"t":"N","n":1},"cfg":{},"name":"Give the Bot Extra Knights vs Martin","explain":"The bot gets extra knights; add one more after every win. See how many you can give and still win. Bot: Martin.","src":"title"},
"qUROR6pcKKw":{"mode":"gift","params":{"t":"R","n":1},"cfg":{},"name":"Give the Bot Extra Rooks vs Martin","explain":"The bot gets extra rooks; add one more after every win. See how many you can give and still win. Bot: Martin.","src":"title"},
"Y02OtzEgkRk":{"mode":"gift","params":{"t":"B","n":1},"cfg":{},"name":"Give the Bot Extra Bishops vs Martin","explain":"The bot gets extra bishops; add one more after every win. See how many you can give and still win. Bot: Martin.","src":"title"},
"Iy-Vr5-3VpY":{"mode":"gift","params":{"t":"Q","n":1},"cfg":{},"name":"Give the Bot Extra Queens vs Martin (Giving Martin 1 Extra)","explain":"The bot gets extra queens; add one more after every win. See how many you can give and still win. Bot: Martin.","src":"title"},
"dsIfLYPsTTg":{"mode":"kingplus","params":{"t":"P","n":1},"cfg":{},"name":"How Many Pawns? vs Magnus","explain":"You have only your king and pawns against a full army; add one more after each loss. Checkmate the bot to win. Bot: Magnus.","src":"title"},
"1aRADMMeFbo":{"mode":"kingplus","params":{"t":"N","n":1},"cfg":{},"name":"How Many Knights? vs Magnus","explain":"You have only your king and knights against a full army; add one more after each loss. Checkmate the bot to win. Bot: Magnus.","src":"title"},
"98Fzc7uQ7Ns":{"mode":"botodds","params":{"n":2,"lbl":"Viewers vs Me with Odds"},"cfg":{},"name":"Viewers vs Me with Odds","explain":"The bot starts without some pieces; the slider sets how many. Remove fewer each time and checkmate it.","src":"title"},
"-tZIjiXx6H0":{"mode":"kingplus","params":{"t":"B","n":1},"cfg":{},"name":"How Many Bishops? vs Magnus (How Many Bishops To)","explain":"You have only your king and bishops against a full army; add one more after each loss. Checkmate the bot to win. Bot: Magnus.","src":"title"},
"D1xzjaq6swA":{"mode":"kingplus","params":{"t":"R","n":1},"cfg":{"who":"Magnus","elo":2850},"name":"How Many Rooks to BEAT Magnus?","explain":"King plus rooks only vs Magnus's full army; add a rook after each loss. It took nine.","src":"transcript"},
"S1TqgKwVgus":{"mode":"kingplus","params":{"t":"Q","n":1},"cfg":{},"name":"How Many Queens? vs Magnus","explain":"You have only your king and queens against a full army; add one more after each loss. Checkmate the bot to win. Bot: Magnus.","src":"title"},
"3pcGt9f6yLs":{"mode":"howmany","params":{"t":"A","n":2},"cfg":{},"name":"How Many Knights and Bishops (archbishops) to Beat Martin?","explain":"You start with extra archbishops (pick how many). Beat the bot with as few as you can. Bot: Martin.","src":"title"},
"F5y72_MVsMA":{"mode":"kingplus","params":{"t":"P","n":1},"cfg":{"who":"Martin","elo":250},"name":"How Many Pawns to BEAT Martin?","explain":"You get only a king and one pawn against Martin's full army. Promote and checkmate.","src":"transcript"},
"bu31Ps0hhao":{"mode":"kingplus","params":{"t":"N","n":1},"cfg":{},"name":"How Many Knights? vs Martin","explain":"You have only your king and knights against a full army; add one more after each loss. Checkmate the bot to win. Bot: Martin.","src":"title"},
"admcKjJDGDg":{"mode":"kingplus","params":{"t":"B","n":1},"cfg":{},"name":"How Many Bishops? vs Martin","explain":"You have only your king and bishops against a full army; add one more after each loss. Checkmate the bot to win. Bot: Martin.","src":"title"},
"mFa35aLmhbQ":{"mode":"kingplus","params":{"t":"R","n":1},"cfg":{"who":"Martin","elo":250},"name":"How Many Rooks to BEAT Martin?","explain":"King and a single rook vs Martin's full army. Lose and you get another rook.","src":"transcript"},
"oHVIMc067J4":{"mode":"kingplus","params":{"t":"Q","n":1},"cfg":{},"name":"How Many Queens? vs Martin","explain":"You have only your king and queens against a full army; add one more after each loss. Checkmate the bot to win. Bot: Martin.","src":"title"},
"AaHmMC3HA0E":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"trash","levels":[600,1000,1400,1800,2200],"names":["Mouthy","Loudmouth","Smack Talker","Roaster","Trash King"]},"taunts":["Is that your best move?","My grandma plays faster.","I have seen better moves from a toaster.","You call that an attack?","Resign already."],"who":"Trash Talker"},"name":"Trash Talking Bots","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"h4FZjGSccFg":{"mode":"clock","params":{},"cfg":{"who":"GothamChess","elo":2300,"clock":{"total":180,"inc":2}},"name":"GothamChess Tiebreaker (3+2)","explain":"You play on a 3:00 clock +2s. Checkmate the bot before your time runs out. Bot: GothamChess.","src":"title"},
"Pp4r8PFPW2w":{"mode":"clock","params":{},"cfg":{"who":"Magnus","elo":2850,"clock":{"total":60}},"name":"Bullet vs Magnus (1 minute)","explain":"You play on a 1:00 clock. Checkmate the bot before your time runs out. Bot: Magnus.","src":"title"},
"pbtCSkxUg9Y":{"mode":"handicap","params":{"keep":"pawns"},"cfg":{},"name":"Handicap: No Pieces vs Martin","explain":"You play with no pieces at all, only your king and pawns. Checkmate the bot to win. Bot: Martin.","src":"title"},
"qgHutnHSyXI":{"mode":"kingplus","params":{"t":"P","n":1},"cfg":{},"name":"How Many Pawns? vs Magnus","explain":"You have only your king and pawns against a full army; add one more after each loss. Checkmate the bot to win. Bot: Magnus.","src":"title"},
"wMdAOirSvQQ":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"xmas","levels":[500,900,1300,1700,2200],"names":["Elf","Snowman","Reindeer","Mrs. Claus","Santa"]}},"name":"Every Christmas Bot","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"vEk6QGmqLdA":{"mode":"kingplus","params":{"t":"R","n":1},"cfg":{},"name":"How Many Rooks? vs Stockfish","explain":"You have only your king and rooks against a full army; add one more after each loss. Checkmate the bot to win. Bot: Stockfish.","src":"title"},
"XuvZCCFk42k":{"mode":"kingplus","params":{"t":"P","n":1},"cfg":{},"name":"How Many Pawns? vs Martin","explain":"You have only your king and pawns against a full army; add one more after each loss. Checkmate the bot to win. Bot: Martin.","src":"title"},
"Pz5ZWCrUQyY":{"mode":"puzzle","params":{"k":0},"cfg":{},"name":"Puzzle Cure (back-rank)","explain":"White to move: solve the puzzle and win within 3 moves or it counts as failed.","src":"title"},
"CRrPXR1WuDo":{"mode":"selfmate","params":{},"cfg":{"who":"Worstfish","elo":250,"style":"worst"},"name":"Can I LOSE to Worstfish?","explain":"Worstfish plays the worst move on the board and gives pieces away. Win by getting yourself checkmated: box in your king and force it to mate you.","src":"transcript","rule":"Reverse chess: you win only if Worstfish checkmates you. Worstfish plays the worst move it can find and avoids mating you unless forced."},
"bzaVzl9friM":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"climb","levels":[800,1200,1600,2000,2400],"names":["800 player","1200 player","1600 player","2000 player","2400 player"]}},"name":"Don't Look Down: Rating Climb","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"SC1loYlAJRE":{"mode":"classic","params":{},"cfg":{},"name":"Beat GothamChess","explain":"Normal chess rules against this bot persona. Checkmate the bot to win. Bot: GothamChess.","src":"title"},
"PSSEOUxNTrE":{"mode":"martinfish","params":{"p":0.7},"cfg":{},"name":"Martinfish 3.0","explain":"Each move the bot plays its best move 70% of the time and a beginner move otherwise. Checkmate the bot to win.","src":"title"},
"WciUSfeqGgs":{"mode":"classic","params":{},"cfg":{},"name":"Manuel Bot","explain":"Normal chess rules against this bot persona. Checkmate the bot to win. Bot: Manuel Bot.","src":"title"},
"2L2yE15BdMg":{"mode":"martinfish","params":{"p":0.6},"cfg":{},"name":"Martinfish 2.0","explain":"Each move the bot plays its best move 60% of the time and a beginner move otherwise. Checkmate the bot to win.","src":"title"},
"tfPyy36nwc4":{"mode":"gauntlet","params":{},"cfg":{"gauntlet":{"key":"adv","levels":[1600,1800,2000,2200,2400],"names":["Advanced 1","Advanced 2","Advanced 3","Advanced 4","Advanced 5"]}},"name":"Every Advanced Bot","explain":"Climb a ladder of bots: every win promotes you to a stronger one. Beat the top rung.","src":"title"},
"uKy9Lb98G3E":{"mode":"kingplus","params":{"t":"B","n":1},"cfg":{},"name":"How Many Bishops? vs Magnus (How Many Bishops to)","explain":"You have only your king and bishops against a full army; add one more after each loss. Checkmate the bot to win. Bot: Magnus.","src":"title"},
"DKicZI66j6k":{"mode":"martinfish","params":{"p":0.55},"cfg":{},"name":"Martinfish (You're Not Ready)","explain":"Each move the bot plays its best move 55% of the time and a beginner move otherwise. Checkmate the bot to win.","src":"title"},
"AtmctmxLq58":{"mode":"opening","params":{"k":"bongcloud"},"cfg":{},"name":"Forced Opening: Bongcloud","explain":"The game starts from the Bongcloud. Play on from there and checkmate the bot.","src":"title"},
"-cQ58zhZrSo":{"mode":"kingplus","params":{"t":"Q","n":1},"cfg":{},"name":"How Many Queens? vs Stockfish 17","explain":"You have only your king and queens against a full army; add one more after each loss. Checkmate the bot to win. Bot: Stockfish 17.","src":"title"},
"Hz1J81D8rP4":{"mode":"specialmate","params":{"k":"castle"},"cfg":{},"name":"Castling Checkmate vs Martin","explain":"Only a castling checkmate counts; any other mate is a draw. Set up the special finish. Bot: Martin.","src":"title"},
"COBnLrfJVpE":{"mode":"kingplus","params":{"t":"Q","n":1},"cfg":{},"name":"How Many Queens? vs Stockfish 10","explain":"You have only your king and queens against a full army; add one more after each loss. Checkmate the bot to win. Bot: Stockfish 10.","src":"title"},
"WLmt62Ll9Hs":{"mode":"handicap","params":{"keep":"noQ"},"cfg":{},"name":"Handicap: No Queen (Beating Intermediate Bots with)","explain":"You play without your queen. Checkmate the bot to win.","src":"title"},
"YmAkTgcRUsY":{"mode":"specialmate","params":{"k":"ep"},"cfg":{},"name":"En Passant Checkmate vs Martin","explain":"Only a en passant checkmate counts; any other mate is a draw. Set up the special finish. Bot: Martin.","src":"title"},
"N9oTio7G4vc":{"mode":"howmany","params":{"t":"Q","n":8},"cfg":{},"name":"8 Queens vs Martin","explain":"You start with extra queens (pick how many). Beat the bot with as few as you can. Bot: Magnus.","src":"title"},
"fnDkGF-EF44":{"mode":"handicap","params":{"keep":"P3"},"cfg":{},"name":"Handicap: Only 3 Pawns vs Martin","explain":"You play with your king and three pawns. Checkmate the bot to win. Bot: Martin.","src":"title"},
"49AZVEzA7zU":{"mode":"kingplus","params":{"t":"R","n":1},"cfg":{},"name":"How Many Rooks? vs GothamChess","explain":"You have only your king and rooks against a full army; add one more after each loss. Checkmate the bot to win. Bot: GothamChess.","src":"title"},
"E_qu3om4oY0":{"mode":"gift","params":{"t":"Q","n":1},"cfg":{},"name":"Give the Bot Extra Queens vs Martin (#2)","explain":"The bot gets extra queens; add one more after every win. See how many you can give and still win. Bot: Martin.","src":"title"},
"3Ie8fj1-9TY":{"mode":"botodds","params":{"n":1},"cfg":{},"name":"Piece Odds vs Komodo","explain":"The bot starts without some pieces; the slider sets how many. Remove fewer each time and checkmate it. Bot: Komodo.","src":"title"},
"VBsA2Z6ijkg":{"mode":"handicap","params":{"keep":"noQ"},"cfg":{},"name":"Handicap: No Queen (Beat Every Beginner Bot)","explain":"You play without your queen. Checkmate the bot to win.","src":"title"},
"8HlUpu8x8ik":{"mode":"botodds","params":{"n":1},"cfg":{},"name":"Piece Odds vs Magnus","explain":"The bot starts without some pieces; the slider sets how many. Remove fewer each time and checkmate it. Bot: Magnus.","src":"title"},
"QXSrAkEF744":{"mode":"classic","params":{},"cfg":{},"name":"The SINTA Bot","explain":"Normal chess rules against this bot persona. Checkmate the bot to win. Bot: The SINTA Bot.","src":"title"},
"DB81BuB6CdM":{"mode":"speedrun","params":{},"cfg":{"gauntlet":{"key":"fastbeg","levels":[250,400,550,700,850],"names":["Beginner 1","Beginner 2","Beginner 3","Beginner 4","Beginner 5"]},"speed":25},"name":"Speedrun the Beginner Bots","explain":"Checkmate the bot within 25 of your moves or the run fails.","src":"title"},
"LUftxgw75lA":{"mode":"howmany","params":{"t":"Q","n":1},"cfg":{"who":"Stockfish","elo":3200},"name":"How Many Queens To BEAT Stockfish?","explain":"Beat a 3200 Stockfish by starting with extra queens; add one more each time you lose.","src":"transcript"},
"V_3rvGDzv_U":{"mode":"kingplus","params":{"t":"Q","n":1},"cfg":{},"name":"How Many Queens? vs Ding Liren","explain":"You have only your king and queens against a full army; add one more after each loss. Checkmate the bot to win. Bot: Ding Liren.","src":"title"},
"0M7t8YiSyiM":{"mode":"kingplus","params":{"t":"P","n":1},"cfg":{},"name":"How Many Pawns? vs Martin","explain":"You have only your king and pawns against a full army; add one more after each loss. Checkmate the bot to win. Bot: Martin.","src":"title"},
"7XDtMA4WPSU":{"mode":"kingplus","params":{"t":"B","n":1},"cfg":{},"name":"How Many Bishops? vs GothamChess","explain":"You have only your king and bishops against a full army; add one more after each loss. Checkmate the bot to win. Bot: GothamChess.","src":"title"},
"D2B85mhGtT0":{"mode":"kingplus","params":{"t":"N","n":1},"cfg":{},"name":"How Many Knights? vs Hikaru","explain":"You have only your king and knights against a full army; add one more after each loss. Checkmate the bot to win. Bot: Hikaru.","src":"title"},
"nick8PeAXLA":{"mode":"roulette","params":{"hide":false,"lbl":"Spinner Wheel: The Rematch"},"cfg":{},"name":"Spinner Wheel: The Rematch","explain":"Each game spins a random twist from the arcade (named below the board). Checkmate the bot to win.","src":"title"},
"rQQKF0ZZQfg":{"mode":"roulette","params":{"hide":false,"lbl":"Spinner Wheel Chess"},"cfg":{},"name":"Spinner Wheel Chess vs Martin","explain":"Each game spins a random twist from the arcade (named below the board). Checkmate the bot to win. Bot: Martin.","src":"title"},
"8v-HhpkySYA":{"mode":"kingplus","params":{"t":"Q","n":1},"cfg":{},"name":"How Many Queens? vs Magnus","explain":"You have only your king and queens against a full army; add one more after each loss. Checkmate the bot to win. Bot: Magnus.","src":"title"}
};
function specFromConfig(vc){const m=vc.mode||'';return{id:m.startsWith('base:')?undefined:m,base:m.startsWith('base:')?m.slice(5):undefined,a:vc.params||{},c:vc.cfg||{},name:vc.name}}
modeFor=function(title,cat){let v=null;for(const x of VIDEOS)if(x[1]===title&&x[2]===cat&&x.explain==null){v=x;break}
  const vc=v&&VIDEO_CONFIG[v[0]];let r;
  if(vc){const k='vc|'+v[0];r=DCACHE[k]||(DCACHE[k]=derive(specFromConfig(vc),norm(title)));if(vc.explain)r.m.explain=vc.explain;if(vc.name)r.m.name=vc.name;if(vc.rule)r.m.rule=vc.rule}
  else r=modeFor2(title,cat);
  if(v)v.explain=(vc&&vc.explain)||r.m.explain;
  return r};
if(VIDEOS.length){try{for(const v of VIDEOS){v.explain=null}for(const v of VIDEOS){v.mode=modeFor(v[1],v[2]);v.md=modeName(v.mode.m,v.mode.arg);v.exp=explainOf(v);
    if(typeof norm==='function'){} v.s=String(v[1]).normalize('NFKD').replace(/[\u0300-\u036f\u0483-\u0489]/g,'').toLowerCase()+' '+v.md.toLowerCase()+' '+v[2].toLowerCase()}
  if($('built'))$('built').textContent=countBuilt();if(typeof renderRows==='function'){renderRows();renderFeat()}}catch(e){console.warn('modes_extra remap',e)}}
(typeof window!=="undefined"?window:globalThis).ARCADE_EXTRA={MX,modeFor:modeFor2,derive,rewind,F,GL,RULES,VIDEO_CONFIG};
})();
