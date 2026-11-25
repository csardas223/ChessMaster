/* SCP Containment Breach. Browser and Node compatible rules engine. */
(function(root){
'use strict';
const W=8,H=20,ORTH=[[0,-1],[1,0],[0,1],[-1,0]],RING=[[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]],KNIGHT=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];
const META={
 '035':{name:'The Possessive Mask',image:'mask.png',rule:'Possesses the first adjacent piece clockwise from the upper left. Its host pursues kings using its original movement. The mask respawns when its host is captured or overridden.'},
 '049':{name:'The Plague Doctor',image:'scp049.png',rule:'Wanders one orthogonal square, then zombifies adjacent pieces. Zombies move randomly using their original movement; zombie pawns can move and capture in either direction.'},
 '096':{name:'The Shy Guy',image:'shyguy.png',rule:'Remains still until a piece attacks its square. It then rushes to and captures the nearest observer.'},
 '106':{name:'The Old Man',image:'oldman-new.png',rule:'Steps toward the closest king, then teleports adjacent pieces to random empty squares on this board. No pocket board or extra player turns.'},
 '173':{name:'The Sculpture',image:'scp173.png',rule:'Cannot move while observed by a piece. When unobserved, makes a knight jump toward the closest king and captures anything on its landing square.'},
 '409':{name:'Contagious Crystal',image:'scp409.png',rule:'Alternates between an orthogonal step with a warning aura and freezing adjacent pieces. After three of its turns, each frozen piece has an equal chance to thaw or shatter.'},
 '426':{name:'I Am a Toaster',image:'toaster.png',rule:'Wanders one orthogonal square, then turns neighboring pieces into stationary toasters. Converted toasters are capturable and may be overridden by a higher-priority effect.'},
 '682':{name:'Hard-to-Destroy Reptile',image:'lizard.png',rule:'Copies the movement of a random piece attacking it, retaining that ability. Prefers to capture its matching observer, otherwise a high-value target. Rechecks its ability after moves.'},
 '939':{name:'With Many Voices',image:'scp939.png',rule:'Tracks the higher-value piece moved by White or Black this round (ties random). Steps one square toward that move’s destination and captures anything there.'},
 '966':{name:'The Sleep Killer',image:'scp966.png',rule:'Wanders one orthogonal square and converts adjacent pieces into dark, neutral sleepers. They move randomly with their original movement and pawn direction. Contact with a king is fatal.'}
};
const inb=(x,y)=>x>=0&&x<W&&y>=0&&y<H, key=(x,y)=>y*W+x, same=(a,b)=>a&&b&&a.x===b.x&&a.y===b.y, val=t=>({P:1,N:3,B:3,R:5,Q:9,K:1000})[t]||0;
function random(seed){let a=0x811c9dc5;for(const ch of String(seed))a=Math.imul(a^ch.charCodeAt(0),16777619);return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
class Game{
 constructor(seed=String(Date.now())){this.seed=String(seed);this.rng=random(seed);this.board=Array(W*H).fill(null);this.scps=[];this.round=1;this.phase='w';this.result=null;this.serial=0;this.pieceId=0;this.log=[];this.events=[];this.trace=[];this.lastMoves={};this.ep=null;this.lastMove=null;this.castle={wK:true,wQ:true,bK:true,bQ:true};const back=['R','N','B','Q','K','B','N','R'];for(let x=0;x<8;x++){this.put(x,19,'w',back[x]);this.put(x,18,'w','P');this.put(x,0,'b',back[x]);this.put(x,1,'b','P');}
  // Two separated lanes in each of five rank bands: balanced, jittered starts.
  const slots=[];for(let band=0;band<5;band++)for(let lane=0;lane<2;lane++)slots.push({x:lane*4+this.int(4),y:2+Math.floor(band*16/5)+this.int(Math.floor((band+1)*16/5)-Math.floor(band*16/5))});
  const ids=this.shuffle(Object.keys(META));for(let i=0;i<ids.length;i++)this.scps.push({id:ids[i],order:i+1,...slots[i],host:null,ability:null,pawnColor:'w',crystalPhase:0});this.scps=this.shuffle(this.scps);this.scps.forEach((s,i)=>s.order=i+1);
 }
 int(n){return Math.floor(this.rng()*n)} pick(a){return a.length?a[this.int(a.length)]:null} shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=this.int(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
 put(x,y,color,type){const p={id:++this.pieceId,color,type,x,y,moved:false,effect:null};this.board[key(x,y)]=p;return p;}
 at(x,y){return inb(x,y)?this.board[key(x,y)]:null} body(x,y,except=null){return this.scps.find(s=>s!==except&&!s.host&&s.x===x&&s.y===y)} empty(x,y){return inb(x,y)&&!this.at(x,y)&&!this.body(x,y)} pieces(){return this.board.filter(Boolean)} scp(id){return this.scps.find(s=>s.id===id)} king(c){return this.pieces().find(p=>p.color===c&&p.type==='K')}
 controlled(p){return !!p?.effect} active(p){return p&&!['frozen','toaster'].includes(p.effect?.kind)} owned(p,c){return p&&p.color===c&&!p.effect} capturable(p,t){return t&&t!==p&&(p.effect||t.effect||p.color!==t.color)}
 attackers(x,y){return this.pieces().filter(p=>this.attacks(p,x,y));}
 attacks(p,x,y){if(!this.active(p)||same(p,{x,y}))return false;const dx=x-p.x,dy=y-p.y,ax=Math.abs(dx),ay=Math.abs(dy),t=p.type;
  if(t==='P')return ax===1&&(p.effect?.kind==='zombie'?ay===1:dy===(p.color==='w'?-1:1));if(t==='N')return ax*ay===2;if(t==='K')return Math.max(ax,ay)===1;
  const ok=(ax===ay&&['B','Q'].includes(t))||((dx===0||dy===0)&&['R','Q'].includes(t));if(!ok)return false;
  for(let xx=p.x+Math.sign(dx),yy=p.y+Math.sign(dy);xx!==x||yy!==y;xx+=Math.sign(dx),yy+=Math.sign(dy))if(this.at(xx,yy)||this.body(xx,yy))return false;return true;
 }
 danger(x,y,color){return this.pieces().some(p=>(p.effect||p.color!==color)&&this.attacks(p,x,y));}
 visibility(c='w'){const vis=new Uint8Array(W*H);for(const p of this.pieces())if(this.owned(p,c)){vis[key(p.x,p.y)]=1;for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(this.attacks(p,x,y))vis[key(x,y)]=1;}if(this.result)vis.fill(1);return vis;}
 rawMoves(p,{anomaly=false,attackKings=false,type=p?.type}={}){if(!p||(!anomaly&&!this.active(p)))return[];const out=[],x=p.x,y=p.y;
  const add=(nx,ny,extra={})=>{if(!inb(nx,ny)||this.body(nx,ny,anomaly?p:null))return false;const t=this.at(nx,ny);if(!t||anomaly||this.capturable(p,t)){if(!t||attackKings||anomaly||p.effect||t.effect||t.type!=='K')out.push({id:p.id,from:{x,y},to:{x:nx,y:ny},...extra});}return !t;};
  const rays=dirs=>{for(const [dx,dy]of dirs)for(let step=1;step<H;step++)if(!add(x+dx*step,y+dy*step))break;};
  if(type==='P'){
   const dirs=p.effect?.kind==='zombie'?[-1,1]:[p.color==='w'?-1:1];for(const d of dirs){if(this.empty(x,y+d)){add(x,y+d,{promotion:y+d===0||y+d===19});if(!p.effect&&!p.moved&&y===(p.color==='w'?18:1)&&this.empty(x,y+2*d))add(x,y+2*d,{double:true});}
    for(const dx of [-1,1]){const t=this.at(x+dx,y+d);if(t&&(anomaly||this.capturable(p,t)))add(x+dx,y+d,{promotion:y+d===0||y+d===19});
     if(!p.effect&&!anomaly&&this.ep&&this.ep.color!==p.color&&this.ep.x===x+dx&&this.ep.y===y+d&&this.empty(x+dx,y+d)){const v=this.at(this.ep.x,this.ep.vy);if(v&&v.id===this.ep.id&&!v.effect)add(x+dx,y+d,{enPassant:true});}}
   }
  }else if(type==='N'){for(const[dx,dy]of KNIGHT)add(x+dx,y+dy);}
  else if(type==='K'||type==='O'){for(const[dx,dy]of(type==='O'?ORTH:RING))add(x+dx,y+dy);}
  else rays(type==='B'?RING.filter(([dx,dy])=>dx&&dy):type==='R'?ORTH:RING);
  if(type==='K'&&!p.effect&&!anomaly&&!p.moved&&x===4&&y===(p.color==='w'?19:0)&&!this.danger(x,y,p.color))for(const side of ['K','Q']){const rx=side==='K'?7:0,rook=this.at(rx,y),path=side==='K'?[5,6]:[1,2,3],cross=side==='K'?[5,6]:[3,2];if(this.castle[p.color+side]&&this.owned(rook,p.color)&&rook.type==='R'&&!rook.moved&&path.every(f=>this.empty(f,y))&&cross.every(f=>!this.danger(f,y,p.color)))add(cross[1],y,{castle:side});}
  return out;
 }
 simulate(m,fn){const p=this.at(m.from.x,m.from.y),dst=this.at(m.to.x,m.to.y),ep=m.enPassant?this.at(m.to.x,m.from.y):null;const old={x:p.x,y:p.y,type:p.type};this.board[key(p.x,p.y)]=null;this.board[key(m.to.x,m.to.y)]=p;p.x=m.to.x;p.y=m.to.y;if(m.promotion)p.type='Q';if(ep)this.board[key(ep.x,ep.y)]=null;let rook,rx,tx;
  if(m.castle){rx=m.castle==='K'?7:0;tx=m.castle==='K'?5:3;rook=this.at(rx,p.y);this.board[key(rx,p.y)]=null;this.board[key(tx,p.y)]=rook;rook.x=tx;}
  let result;try{result=fn(p,dst||ep)}finally{if(rook){this.board[key(rx,p.y)]=rook;this.board[key(tx,p.y)]=null;rook.x=rx;}Object.assign(p,old);this.board[key(old.x,old.y)]=p;this.board[key(m.to.x,m.to.y)]=dst;if(ep)this.board[key(ep.x,ep.y)]=ep;}return result;
 }
 legalMoves(c){const out=[];for(const p of this.pieces())if(this.owned(p,c))for(const m of this.rawMoves(p))if(this.simulate(m,()=>{const k=this.king(c);return k&& (k.effect||!this.danger(k.x,k.y,c));}))out.push(m);return out;}
 emit(text,squares=[],kind='info'){this.log.push({round:this.round,text,squares:squares.map(s=>({x:s.x,y:s.y})),kind});}
 finish(loser,reason){if(this.result)return;this.result={winner:loser?(loser==='w'?'b':'w'):null,reason};this.phase='ended';this.emit(reason,[],'result');}
 revoke(p){if(p.type==='K')this.castle[p.color+'K']=this.castle[p.color+'Q']=false;if(p.type==='R'&&p.y===(p.color==='w'?19:0)){if(p.x===0)this.castle[p.color+'Q']=false;if(p.x===7)this.castle[p.color+'K']=false;}}
 detach(p){const mask=this.scp('035');if(mask?.host===p.id){mask.host=null;mask.pendingRespawn=true;}}
 cleanupMask(){const s=this.scp('035');if(s?.pendingRespawn){s.pendingRespawn=false;this.respawnMask(s);}}
 remove(p,reason){if(!p)return;this.revoke(p);this.detach(p);this.board[key(p.x,p.y)]=null;if(p.type==='K')this.finish(p.color,reason||'A king was captured.');}
 respawnMask(s){const all=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(this.empty(x,y))all.push({x,y});const clear=all.filter(q=>RING.every(([dx,dy])=>!this.at(q.x+dx,q.y+dy)));const dest=this.pick(clear.length?clear:all);if(dest){this.markMove(s,dest);s.x=dest.x;s.y=dest.y;}s.host=null;}
 movePiece(m,promotion='Q',source=null){const p=this.at(m.from.x,m.from.y);if(!p||p.id!==m.id||this.body(m.to.x,m.to.y))return false;const dest=this.at(m.to.x,m.to.y);if(dest&&!this.capturable(p,dest))return false;const victim=m.enPassant?this.at(m.to.x,m.from.y):dest;const from={x:p.x,y:p.y},movedValue=val(p.type);this.revoke(p);if(victim)this.remove(victim,`${victim.color==='w'?'White':'Black'} king captured.`);this.board[key(p.x,p.y)]=null;this.board[key(m.to.x,m.to.y)]=p;p.x=m.to.x;p.y=m.to.y;p.moved=true;if(m.promotion&&p.type==='P')p.type=promotion;
  if(m.castle){const rx=m.castle==='K'?7:0,tx=m.castle==='K'?5:3,r=this.at(rx,p.y);this.board[key(rx,p.y)]=null;this.board[key(tx,p.y)]=r;r.x=tx;r.moved=true;}
  if(!source){this.ep=m.double?{x:p.x,y:(from.y+p.y)/2,vy:p.y,id:p.id,color:p.color}:null;this.lastMoves[p.color]={x:p.x,y:p.y,value:movedValue,id:p.id};}
  else if(this.ep?.id===p.id||this.ep?.id===victim?.id)this.ep=null;
  const mask=this.scp('035');if(mask?.host===p.id){mask.x=p.x;mask.y=p.y;}this.markMove(from,p);this.events.push({kind:'move',piece:p.id,from,to:{x:p.x,y:p.y},capture:!!victim});this.cleanupMask();this.refreshLizard();return true;
 }
 play(m,prom='Q'){if(this.result||!['w','b'].includes(this.phase))return false;const legal=this.legalMoves(this.phase).find(v=>v.id===m.id&&same(v.to,m.to));if(!legal)return false;const c=this.phase;this.movePiece(legal,prom);this.emit(`${c==='w'?'White':'Black'} ${this.square(m.from)} → ${this.square(m.to)}`,[m.from,m.to],'move');if(!this.result)this.phase=c==='w'?'b':'scp';return true;}
 square(q){return String.fromCharCode(97+q.x)+(H-q.y)}
 // Keep one source/destination pair for the latest actual relocation.
 markMove(from,to){if(!same(from,to))this.lastMove={from:{x:from.x,y:from.y},to:{x:to.x,y:to.y}};}
 startPlayer(c){if(this.result)return;this.phase=c;const k=this.king(c);if(!k){this.finish(c,'King lost.');return;}if(!this.legalMoves(c).length){if(!k.effect&&this.danger(k.x,k.y,c))this.finish(c,`${c==='w'?'White':'Black'} is checkmated.`);else if(!k.effect)this.finish(null,'Draw by stalemate.');else{this.emit(`${c==='w'?'White':'Black'} has no controlled move; turn skipped.`);this.phase=c==='w'?'b':'scp';}}}
 priority(p){return p.effect?this.scp(p.effect.owner)?.order||0:0;}
 canAffect(s,p){return p&&this.priority(p)<=s.order&&!(p.effect?.owner===s.id);}
 effect(s,p,kind){if(!this.canAffect(s,p))return false;this.revoke(p);this.detach(p);p.moved=true;p.effect={kind,owner:s.id,serial:++this.serial,born:this.round,age:0};if(this.ep?.id===p.id)this.ep=null;this.emit(`SCP-${s.id}: ${kind} at ${this.square(p)}`,[p],'effect');this.events.push({kind:'effect',to:{x:p.x,y:p.y},effect:kind});return true;}
 teleport(s,p){if(!this.canAffect(s,p))return false;const spots=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(this.empty(x,y)&&(p.type!=='P'||(y!==0&&y!==H-1))&&(p.type!=='K'||!this.danger(x,y,p.color)))spots.push({x,y});const to=this.pick(spots);if(!to)return false;const from={x:p.x,y:p.y};this.revoke(p);this.detach(p);p.effect=null;p.moved=true;this.board[key(p.x,p.y)]=null;p.x=to.x;p.y=to.y;this.board[key(p.x,p.y)]=p;if(this.ep?.id===p.id)this.ep=null;this.emit(`SCP-106 teleported a piece.`,[from,to],'teleport');this.markMove(from,to);this.events.push({kind:'teleport',piece:p.id,from,to});this.cleanupMask();return true;}
 stepSCP(s,to){if(!to||!inb(to.x,to.y)||this.body(to.x,to.y,s))return false;const from={x:s.x,y:s.y},victim=this.at(to.x,to.y);if(victim)this.remove(victim,`SCP-${s.id} captured the ${victim.color==='w'?'White':'Black'} king.`);s.x=to.x;s.y=to.y;this.markMove(from,s);this.cleanupMask();this.events.push({kind:'scpMove',scp:s.id,from,to:{x:s.x,y:s.y},capture:!!victim});return true;}
 wander(s,dirs=ORTH){const options=dirs.map(([dx,dy])=>({x:s.x+dx,y:s.y+dy})).filter(q=>this.empty(q.x,q.y));this.stepSCP(s,this.pick(options));}
 refreshLizard(){const s=this.scp('682');if(!s||this.result)return;const observers=this.attackers(s.x,s.y);const p=this.pick(observers);if(p){s.ability=p.type;s.pawnColor=p.color;}}
 knightDistance(a,b){const seen=new Set([key(a.x,a.y)]),q=[[a.x,a.y,0]];for(let i=0;i<q.length;i++){const[x,y,d]=q[i];if(x===b.x&&y===b.y)return d;for(const[dx,dy]of KNIGHT){const xx=x+dx,yy=y+dy;if(inb(xx,yy)&&!seen.has(key(xx,yy))){seen.add(key(xx,yy));q.push([xx,yy,d+1]);}}}return 999;}
 scpTurn(s){if(this.result)return;this.phase=s.id;this.trace.push({round:this.round,actor:s.id});this.events=[];
  if(s.id==='049'||s.id==='966'||s.id==='426'){this.wander(s);for(const[dx,dy]of RING){const p=this.at(s.x+dx,s.y+dy);if(!this.canAffect(s,p))continue;if(p.type==='K'&&(s.id==='966'||s.id==='426')){this.remove(p,`SCP-${s.id} consumed the ${p.color==='w'?'White':'Black'} king.`);break;}this.effect(s,p,s.id==='049'?'zombie':s.id==='966'?'sleeper':'toaster');}}
  else if(s.id==='035'){if(!s.host)for(const[dx,dy]of RING){const p=this.at(s.x+dx,s.y+dy);if(this.effect(s,p,'host')){this.markMove(s,p);s.host=p.id;s.x=p.x;s.y=p.y;break;}}}
  else if(s.id==='106'){const kings=this.pieces().filter(p=>p.type==='K'),opts=RING.map(([dx,dy])=>({x:s.x+dx,y:s.y+dy})).filter(q=>this.empty(q.x,q.y));const dist=q=>Math.min(...kings.map(k=>Math.max(Math.abs(q.x-k.x),Math.abs(q.y-k.y))));opts.sort((a,b)=>dist(a)-dist(b));this.stepSCP(s,opts[0]);const targets=RING.map(([dx,dy])=>this.at(s.x+dx,s.y+dy)).filter(Boolean);for(const p of targets)this.teleport(s,p);}
  else if(s.id==='096'){const obs=this.attackers(s.x,s.y).sort((a,b)=>(a.x-s.x)**2+(a.y-s.y)**2-((b.x-s.x)**2+(b.y-s.y)**2)||a.y-b.y||a.x-b.x);if(obs.length)this.stepSCP(s,obs[0]);}
  else if(s.id==='173'){if(!this.attackers(s.x,s.y).length){const kings=this.pieces().filter(p=>p.type==='K');kings.sort((a,b)=>this.knightDistance(s,a)-this.knightDistance(s,b)|| (a.color==='w'?-1:1));const k=kings[0];if(k){const opts=KNIGHT.map(([dx,dy])=>({x:s.x+dx,y:s.y+dy})).filter(q=>inb(q.x,q.y)&&!this.body(q.x,q.y,s));opts.sort((a,b)=>this.knightDistance(a,k)-this.knightDistance(b,k));this.stepSCP(s,opts[0]);}}}
  else if(s.id==='409'){for(const p of [...this.pieces()])if(p.effect?.owner===s.id&&p.effect.kind==='frozen'){if(++p.effect.age>=3){if(this.rng()<.5){p.effect=null;this.emit('SCP-409: a piece thawed.',[p]);}else{this.emit('SCP-409: a piece shattered.',[p]);this.remove(p,'SCP-409 shattered a king.');}}}if(!this.result){if(s.crystalPhase===0){this.wander(s);s.crystalPhase=1;}else{for(const[dx,dy]of RING)this.effect(s,this.at(s.x+dx,s.y+dy),'frozen');s.crystalPhase=0;}}}
  else if(s.id==='682'){this.refreshLizard();const proxy={...s,color:s.pawnColor,type:s.ability||'O'},moves=this.rawMoves(proxy,{anomaly:true,type:proxy.type}),viewers=this.attackers(s.x,s.y),chosen=viewers.find(p=>p.type===s.ability&&(p.type!=='P'||p.color===s.pawnColor));let move=moves.find(m=>same(m.to,chosen));if(!move){let best=-1,options=[];for(const m of moves){const v=val(this.at(m.to.x,m.to.y)?.type);if(v>best){best=v;options=[m]}else if(v===best)options.push(m);}move=this.pick(options);}if(move){this.stepSCP(s,move.to);if(s.ability==='P'&&(s.y===0||s.y===19))s.ability='Q';}}
  else if(s.id==='939'){const moves=Object.values(this.lastMoves);if(moves.length){const max=Math.max(...moves.map(m=>m.value)),target=this.pick(moves.filter(m=>m.value===max)),to={x:s.x+Math.sign(target.x-s.x),y:s.y+Math.sign(target.y-s.y)};if(!same(s,to))this.stepSCP(s,to);}}
  this.cleanupMask();this.refreshLizard();return this.events;
 }
 children(s){return this.pieces().filter(p=>p.effect?.owner===s.id&&['zombie','sleeper','host'].includes(p.effect.kind)).sort((a,b)=>a.effect.serial-b.effect.serial);}
 distanceByMovement(start,target,p){
  if(p.type==='P')return Math.abs(start.x-target.x)+Math.abs(start.y-target.y)*2;
  const dirs=p.type==='N'?KNIGHT:p.type==='B'?RING.filter(([dx,dy])=>dx&&dy):p.type==='R'?ORTH:RING,limit=['B','R','Q'].includes(p.type)?19:1;
  const queue=[[start.x,start.y,0]],seen=new Set([key(start.x,start.y)]);
  for(let i=0;i<queue.length;i++){const[x,y,d]=queue[i];if(x===target.x&&y===target.y)return d;for(const[dx,dy]of dirs)for(let n=1;n<=limit;n++){const xx=x+dx*n,yy=y+dy*n;if(!inb(xx,yy)||this.body(xx,yy))break;const k=key(xx,yy);if(!seen.has(k)){seen.add(k);queue.push([xx,yy,d+1]);}const blocker=this.at(xx,yy);if(blocker&&blocker.id!==p.id)break;}}
  return 999;
 }
 childTurn(s,id){if(this.result)return;const p=this.pieces().find(p=>p.id===id&&p.effect?.owner===s.id);if(!p||!this.active(p))return;this.phase=s.id+'-'+p.effect.serial;this.trace.push({round:this.round,actor:s.id,child:id});this.events=[];
  // Source variants grant newly converted pieces their first move next round.
  if(p.effect.born===this.round)return;let moves=this.rawMoves(p,{attackKings:true});if(!moves.length)return;let m;if(p.effect.kind==='host'){const kings=this.pieces().filter(k=>k.type==='K'&&k.id!==p.id);const dist=q=>kings.length?Math.min(...kings.map(k=>this.distanceByMovement(q,k,p))):0;const close=q=>kings.length?Math.min(...kings.map(k=>Math.abs(k.x-q.x)+Math.abs(k.y-q.y))):0;const ranked=moves.map(m=>({m,d:dist(m.to),close:close(m.to)}));ranked.sort((a,b)=>a.d-b.d||a.close-b.close||val(this.at(b.m.to.x,b.m.to.y)?.type)-val(this.at(a.m.to.x,a.m.to.y)?.type));moves=ranked.map(x=>x.m);m=moves[0];}else m=this.pick(moves);this.movePiece(m,'Q',s.id);this.emit(`SCP-${s.id} controlled piece moved.`,[m.from,m.to],'move');return this.events;
 }
 endRound(){if(this.result)return;this.round++;this.lastMoves={};this.startPlayer('w');}
 aiMove(c){const moves=this.legalMoves(c);if(!moves.length)return null;let best=-Infinity,winners=[];for(const m of moves){const p=this.at(m.from.x,m.from.y),enemyKing=this.king(c==='w'?'b':'w');let score=this.simulate(m,(q,victim)=>{let v=val(victim?.type)*24+(m.promotion?150:0);if(this.danger(q.x,q.y,c))v-=val(q.type)*20;const near=this.scps.filter(s=>!s.host&&Math.max(Math.abs(q.x-s.x),Math.abs(q.y-s.y))<=1);for(const s of near)v-=s.id==='106'?3:val(q.type)*5;const check=enemyKing&&this.attacks(q,enemyKing.x,enemyKing.y);if(check)v+=5;const progress=c==='w'?-1:1;v+=(m.to.y-m.from.y)*progress*(q.type==='P'?1.3:.3);v+=3.5-Math.abs(q.x-3.5);if(!p.moved&&p.type!=='K')v+=2;if(m.castle)v+=6;return v;});score+=this.rng()*.7;if(score>best){best=score;winners=[m];}else if(score===best)winners.push(m);}return this.pick(winners);}
 validate(){const ids=new Set(),squares=new Set();for(let i=0;i<this.board.length;i++){const p=this.board[i];if(!p)continue;if(!inb(p.x,p.y)||key(p.x,p.y)!==i)throw Error('Piece position mismatch');if(ids.has(p.id))throw Error('Duplicate piece');ids.add(p.id);if(this.body(p.x,p.y))throw Error('Piece overlaps anomaly');}for(const s of this.scps){if(!inb(s.x,s.y))throw Error('Anomaly outside board');if(s.host){const p=this.pieces().find(p=>p.id===s.host);if(!p||p.effect?.owner!==s.id||!same(p,s))throw Error('Invalid mask host');}else{const k=key(s.x,s.y);if(squares.has(k))throw Error('Overlapping anomalies');squares.add(k);}}return true;}
}
const api={Game,META,W,H,ORTH,RING,KNIGHT,inb,key,val};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.Breach=api;
})(typeof globalThis!=='undefined'?globalThis:this);
