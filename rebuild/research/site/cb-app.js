'use strict';
const $=id=>document.getElementById(id),{Game,META,W,H,RING,key}=Breach;
let game,selected=null,view='w',token=0,busy=false,activeChild=null,history=[],annSquares=new Set(),annArrows=new Map(),pointer=null,ghost=null,lastPointerClient=null;
let timeline=null,finishedGame=null,replayBusy=false,replayActor=null,replayAnimating=false;
const viewport=$('viewport'),board=$('board'),pieces=$('pieces'),fog=$('fog'),ctx=fog.getContext('2d'),fogMask=document.createElement('canvas'),maskCtx=fogMask.getContext('2d'),fogAlpha=new Float32Array(160),fogTarget=new Uint8Array(160);
let fogLast=0,fogTile=null;const texture=new Image();texture.src='assets/fog-wisps.jpg';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const duration=()=>320;
const same=(a,b)=>a&&b&&a.x===b.x&&a.y===b.y;
const imageFor=p=>p.effect?.kind==='toaster'?'assets/toaster.png':`/pieces/${p.color}${p.type}.svg`;
function place(el,q){el.style.left=q.x*12.5+'%';el.style.top=q.y*5+'%';}
for(let y=0;y<H;y++)for(let x=0;x<W;x++){const el=document.createElement('div');el.className='cell';el.dataset.x=x;el.dataset.y=y;$('cells').append(el);}
const cell=q=>$('cells').children[key(q.x,q.y)];
function newGame(seed){token++;game=new Game(seed||String(Date.now()).slice(-9));timeline=new BreachReplay.Timeline(game);finishedGame=null;replayBusy=false;replayActor=null;replayAnimating=false;$('effects').replaceChildren();selected=null;view='w';busy=false;activeChild=null;history=[];annSquares.clear();annArrows.clear();for(const d of document.querySelectorAll('dialog[open]'))d.close();fogAlpha.fill(1);render();fogAlpha.set(fogTarget);requestAnimationFrame(()=>{viewport.scrollTop=viewport.scrollHeight;});}
function visible(q){return finishedGame||game.result||game.visibility(view)[key(q.x,q.y)]===1;}
function render(){
 const vis=game.visibility(view);for(let i=0;i<160;i++)fogTarget[i]=finishedGame||vis[i]?0:1;
 for(const c of $('cells').children)c.className='cell';if(game.lastMove){cell(game.lastMove.from).classList.add('last');cell(game.lastMove.to).classList.add('last');}
 if(selected&&!finishedGame){cell(selected).classList.add('selected');if(!busy&&game.phase===view)for(const m of game.legalMoves(view).filter(m=>same(m.from,selected)))cell(m.to).classList.add(game.at(m.to.x,m.to.y)||m.enPassant?'capture':'legal');}
 for(const c of ['w','b']){const k=game.king(c);if(k&&!k.effect&&game.danger(k.x,k.y,c))cell(k).classList.add('check');}
 pieces.replaceChildren();for(const p of game.pieces()){const el=document.createElement('img');el.className='piece '+(p.effect?.kind||'');el.src=imageFor(p);el.alt='';el.draggable=false;el.dataset.piece=p.id;place(el,p);pieces.append(el);if(p.effect?.kind==='sleeper'){const wrap=document.createElement('div');wrap.className='particle-wrap';wrap.dataset.pieceFx=p.id;place(wrap,p);for(let n=0;n<5;n++){const dot=document.createElement('i');dot.className='particle';dot.style.setProperty('--dx',(n%2?-1:1)*(12+n*4)+'px');dot.style.setProperty('--dy',(-20-n*3)+'px');dot.style.animationDelay=(-n*.21)+'s';wrap.append(dot);}pieces.append(wrap);}}
 for(const s of game.scps){const el=document.createElement('img');el.className='scp'+(s.host?' hosted':'');el.src='assets/'+META[s.id].image;el.alt='';el.draggable=false;el.dataset.scp=s.id;place(el,s);pieces.append(el);}
 $('auras').replaceChildren();const crystal=game.scp('409');if(crystal?.crystalPhase===1)for(const[dx,dy]of RING){const q={x:crystal.x+dx,y:crystal.y+dy};if(Breach.inb(q.x,q.y)){const a=document.createElement('div');a.className='aura';place(a,q);$('auras').append(a);}}
 renderQueue();drawAnnotations();updateBoardCursor();
}
function renderQueue(){
 const queue=$('queue');queue.replaceChildren();
 // Read left to right, then top to bottom: White, Black, shuffled SCP order.
 // A controlled piece shares its parent's icon throughout that extra turn.
 const actors=[{id:'w',image:'wk.png',label:'White'},{id:'b',image:'bk.png',label:'Black'},...game.scps.map(s=>({id:s.id,image:META[s.id].image,label:'SCP-'+s.id}))];
 const phase=replayAnimating?replayActor:(game.phase==='scp'?game.scps[0].id:game.phase.split('-')[0]);
 for(const actor of actors){
  const active=game.result&&!replayAnimating?(game.result.winner?actor.id===game.result.winner:actor.id==='w'||actor.id==='b'):actor.id===phase;
  const slot=document.createElement('div');slot.className='turn-icon'+(active?' active':'');slot.dataset.actor=actor.id;slot.setAttribute('role','listitem');slot.setAttribute('aria-label',actor.label);if(active)slot.setAttribute('aria-current','step');
  const icon=document.createElement('img');icon.src=actor.id==='w'?'/pieces/wK.svg':actor.id==='b'?'/pieces/bK.svg':'assets/'+actor.image;icon.alt='';icon.draggable=false;slot.append(icon);queue.append(slot);
 }
}
async function animateEvents(events,t){render();const animations=[];const rect=board.getBoundingClientRect(),size=rect.width/8;for(const e of events||[]){if(e.kind==='move'||e.kind==='scpMove'){const el=pieces.querySelector(e.kind==='move'?`[data-piece="${e.piece}"]`:`[data-scp="${e.scp}"]`);if(el){const a=el.animate([{transform:`translate(${(e.from.x-e.to.x)*size}px,${(e.from.y-e.to.y)*size}px)`},{transform:'translate(0,0)'}],{duration:duration(),easing:'cubic-bezier(.22,.61,.36,1)'});animations.push(a.finished.catch(()=>{}));}if(e.capture&&visible(e.to))sound(true);}
 else if(e.kind==='effect'||e.kind==='teleport'){const p=document.createElement('div');p.className='pulse';place(p,e.to);$('effects').append(p);setTimeout(()=>p.remove(),550);}}
 if(!events?.some(e=>e.capture)&&events?.some(e=>e.from&&(visible(e.from)||visible(e.to))))sound(false);
 await Promise.all(animations);if(t!==token)return false;return true;
}
function sound(capture){const a=$(capture?'captureSound':'moveSound');try{a.currentTime=0;a.play().catch(()=>{});}catch{}}
async function continueTurns(t){busy=true;try{while(t===token&&!game.result){
 if(game.phase==='w'||game.phase==='b'){
  const c=game.phase;game.startPlayer(c);if(game.result){render();break;}if(game.phase!==c){timeline.record(game,c,null,[]);render();continue;}
  if(c==='b'){render();await sleep(1000);if(t!==token)return;const m=game.aiMove('b');if(m){game.events=[];game.play(m);timeline.record(game,'b');history.push({round:game.round,color:'b',move:m,promotion:'Q'});if(!await animateEvents(game.events,t))return;}else{game.phase='scp';}continue;}
  view='w';busy=false;render();return;
 }
 if(game.phase==='scp'){
  for(const s of game.scps){if(t!==token||game.result)return;activeChild=null;game.phase=s.id;render();await sleep(duration()*.55);if(t!==token)return;game.scpTurn(s);timeline.record(game,s.id);if(!await animateEvents(game.events,t))return;await sleep(duration()*.45);if(t!==token)return;
   const children=game.children(s).map(p=>p.id);for(const id of children){if(t!==token||game.result)break;const p=game.pieces().find(p=>p.id===id);if(!p||p.effect?.owner!==s.id||p.effect.born===game.round)continue;activeChild=id;game.phase=s.id+'-'+id;render();await sleep(duration()*.45);if(t!==token)return;game.events=[];game.childTurn(s,id);timeline.record(game,s.id,id);if(!await animateEvents(game.events,t))return;}
  }activeChild=null;if(t!==token)return;game.endRound();render();continue;
 }break;
 }}finally{if(t===token){busy=false;if(game.result)finishReplayRecording();render();}}}
function finishReplayRecording(){
 if(finishedGame||!game.result)return;
 timeline.seal(game);finishedGame=game;pointer=null;ghost?.remove();ghost=null;selected=null;activeChild=null;replayActor=null;replayAnimating=false;updateBoardCursor();
}
// Historical positions use separate objects. They can never resume the game.
function replaySprite(entity,kind){
 const el=document.createElement('img');el.alt='';el.draggable=false;
 el.className=kind==='scp'?'scp'+(entity.host?' hosted':''):'piece '+(entity.effect?.kind||'');
 el.src=kind==='scp'?'assets/'+META[entity.id].image:imageFor(entity);place(el,entity);$('effects').append(el);return el;
}
async function panReplayCamera(from,to,ms,t){
 const size=board.clientWidth/8,limit=Math.max(0,viewport.scrollHeight-viewport.clientHeight),clamp=n=>Math.max(0,Math.min(limit,n));
 const centered=q=>clamp((q.y+.5)*size-viewport.clientHeight/2),start=viewport.scrollTop;
 const target=centered(to),origin=centered(from);
 // Reveal the origin before a long move; track the movement to its destination.
 const visibleY=(from.y+.5)*size;
 if(visibleY<start+size*.4||visibleY>start+viewport.clientHeight-size*.4)viewport.scrollTop=origin;
 const initial=viewport.scrollTop;
 if(target===initial)return;
 await new Promise(resolve=>{const began=performance.now();function frame(now){if(t!==token){resolve();return;}const progress=Math.min(1,(now-began)/ms),ease=1-Math.pow(1-progress,3);viewport.scrollTop=initial+(target-initial)*ease;if(progress<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});
}
async function stepReplay(direction){
 if(!finishedGame||replayBusy)return;
 const step=timeline.step(direction);if(!step)return;
 const t=token;replayBusy=true;replayAnimating=true;replayActor=step.actor;selected=null;pointer=null;ghost?.remove();ghost=null;clearAnnotations();$('effects').replaceChildren();
 game=BreachReplay.restore(step.to,Game);activeChild=step.child;fogTarget.fill(0);fogAlpha.fill(0);render();
 const ms=duration(),size=board.clientWidth/8,animations=[],temporary=[];
 const animate=(el,frames,options={})=>{if(!el)return;const a=el.animate(frames,{duration:ms,easing:'cubic-bezier(.22,.61,.36,1)',fill:'both',...options});animations.push(a.finished.catch(()=>{}));};
 const primary=step.changes.find(c=>c.mode==='move'||c.mode==='teleport')||step.changes[0];
 try{
  for(const change of step.changes){
   const {before,after,kind,id,mode}=change;
   const el=after?pieces.querySelector(kind==='piece'?`[data-piece="${id}"]`:`[data-scp="${id}"]`):null;
   const fx=kind==='piece'?pieces.querySelector(`[data-piece-fx="${id}"]`):null;
   if(mode==='move'){
    const frames=[{transform:`translate(${(before.x-after.x)*size}px,${(before.y-after.y)*size}px)`},{transform:'translate(0,0)'}];animate(el,frames);animate(fx,frames);
   }else if(mode==='teleport'){
    const old=replaySprite(before,kind);temporary.push(old);animate(old,[{transform:'scale(1)',opacity:1},{transform:'scale(.15)',opacity:0}],{duration:ms/2});
    const frames=[{transform:'scale(.15)',opacity:0},{transform:'scale(1)',opacity:1}];animate(el,frames,{duration:ms/2,delay:ms/2});animate(fx,[{opacity:0},{opacity:1}],{duration:ms/2,delay:ms/2});
   }else if(mode==='remove'){
    const old=replaySprite(before,kind);temporary.push(old);animate(old,[{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.65)'}],{duration:ms*.4,delay:ms*.6});
   }else if(mode==='appear'){
    animate(el,[{opacity:0,transform:'scale(.65)'},{opacity:1,transform:'scale(1)'}],{duration:ms*.65,delay:ms*.35});animate(fx,[{opacity:0},{opacity:1}],{duration:ms*.65,delay:ms*.35});
   }else if(mode==='effect')animate(el,[{transform:'scale(.85)',opacity:.4},{transform:'scale(1)',opacity:1}]);
  }
  for(const event of step.events){if(event.kind!=='effect'&&event.kind!=='teleport')continue;const pulse=document.createElement('div');pulse.className='pulse';place(pulse,step.backwards&&event.kind==='teleport'?event.from:event.to);$('effects').append(pulse);temporary.push(pulse);}
  if(step.events.some(e=>e.capture)||step.changes.some(c=>c.mode==='remove'||c.mode==='appear'))sound(true);
  else if(step.changes.some(c=>c.mode==='move'||c.mode==='teleport'))sound(false);
  if(primary)animations.push(panReplayCamera(primary.before||primary.after,primary.after||primary.before,ms,t));
  if(!animations.length)animations.push(sleep(ms));
  await Promise.all(animations);
 }finally{
  temporary.forEach(el=>el.remove());
  if(t===token){replayBusy=false;replayAnimating=false;replayActor=null;activeChild=null;render();fogTarget.fill(0);fogAlpha.fill(0);}
 }
}
async function choosePromotion(c){$('promotionChoices').replaceChildren();$('promotion').showModal();updateBoardCursor();return new Promise(resolve=>{for(const type of ['Q','R','B','N']){const b=document.createElement('button');b.title={Q:'Queen',R:'Rook',B:'Bishop',N:'Knight'}[type];b.innerHTML=`<img src="/pieces/${c}${type}.svg" alt="${b.title}">`;b.onclick=()=>{$('promotion').close();resolve(type);};$('promotionChoices').append(b);}$('promotion').addEventListener('cancel',e=>e.preventDefault(),{once:true});});}
async function play(m,drag=false){if(finishedGame||busy||game.result||game.phase!==view)return;busy=true;const t=token,c=game.phase;selected=null;const promotion=m.promotion?await choosePromotion(c):'Q';if(t!==token)return;clearAnnotations();game.events=[];if(!game.play(m,promotion)){busy=false;render();return;}timeline.record(game,c);history.push({round:game.round,color:c,move:m,promotion});if(drag){render();sound(game.events.some(e=>e.capture));}else if(!await animateEvents(game.events,t))return;await continueTurns(t);}
function clickSquare(q){if(!q||finishedGame||busy||game.result||game.phase!==view)return;const p=game.at(q.x,q.y);if(selected){const m=game.legalMoves(view).find(m=>same(m.from,selected)&&same(m.to,q));if(m){play(m);return;}}selected=game.owned(p,view)?q:null;render();}
function position(e){const rect=board.getBoundingClientRect();const x=Math.floor((e.clientX-rect.left)/(rect.width/8)),y=Math.floor((e.clientY-rect.top)/(rect.width/8));return Breach.inb(x,y)?{x,y}:null;}
// Match the original variants: owned pieces can be picked up for tactile
// dragging even while Black is thinking; only a legal White turn commits a move.
function canGrab(p){return !!game&&!finishedGame&&!game.result&&game.owned(p,view)&&!$('promotion').open;}
function updateBoardCursor(e){
 if(e)lastPointerClient={clientX:e.clientX,clientY:e.clientY};
 const held=pointer?.button===0&&canGrab(game.at(pointer.q.x,pointer.q.y));
 document.body.classList.toggle('grabbing-piece',!!held);
 if(held){board.style.cursor='grabbing';return;}
 const rc=viewport.getBoundingClientRect(),pos=lastPointerClient;
 const inside=pos&&pos.clientX>=rc.left&&pos.clientX<rc.right&&pos.clientY>=rc.top&&pos.clientY<rc.bottom;
 const q=inside?position(pos):null;
 board.style.cursor=q&&canGrab(game.at(q.x,q.y))?'grab':'default';
}
function cancelPointer(){pointer=null;ghost?.remove();ghost=null;selected=null;render();}
board.addEventListener('contextmenu',e=>e.preventDefault());
board.addEventListener('pointerdown',e=>{if(e.button!==0&&e.button!==2)return;const q=position(e);if(!q)return;e.preventDefault();if(e.button===0)clearAnnotations();pointer={q,x:e.clientX,y:e.clientY,button:e.button,drag:false,id:e.pointerId};board.setPointerCapture(e.pointerId);updateBoardCursor(e);});
board.addEventListener('pointermove',e=>{updateBoardCursor(e);if(!pointer)return;const q=position(e);if(pointer.button===2){drawAnnotations(pointer.q,q);return;}const p=game.at(pointer.q.x,pointer.q.y);if(!canGrab(p))return;if(!pointer.drag&&Math.hypot(e.clientX-pointer.x,e.clientY-pointer.y)>5){pointer.drag=true;ghost=document.createElement('img');ghost.className='drag-ghost';ghost.src=imageFor(p);document.body.append(ghost);selected=pointer.q;render();const src=pieces.querySelector(`[data-piece="${p.id}"]`);if(src)src.style.visibility='hidden';}if(ghost){ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';}});
function endPointer(e){if(!pointer){updateBoardCursor(e);return;}const start=pointer,q=position(e);pointer=null;ghost?.remove();ghost=null;updateBoardCursor(e);if(start.button===2){if(q){const k=key(start.q.x,start.q.y);if(same(start.q,q)){annSquares.has(k)?annSquares.delete(k):annSquares.add(k);}else{const id=k+'-'+key(q.x,q.y);annArrows.has(id)?annArrows.delete(id):annArrows.set(id,[start.q,q]);}}drawAnnotations();return;}
 if(start.drag){const m=q&&!finishedGame&&!busy&&game.phase===view?game.legalMoves(view).find(m=>same(m.from,start.q)&&same(m.to,q)):null;if(m)play(m,true);else{selected=null;render();}}else clickSquare(q);updateBoardCursor(e);}
board.addEventListener('pointerup',endPointer);
board.addEventListener('pointercancel',()=>{lastPointerClient=null;cancelPointer();});
board.addEventListener('lostpointercapture',()=>{if(pointer)cancelPointer();});
viewport.addEventListener('pointerenter',updateBoardCursor);
viewport.addEventListener('pointerleave',()=>{if(!pointer)lastPointerClient=null;updateBoardCursor();});
viewport.addEventListener('scroll',()=>updateBoardCursor(),{passive:true});
window.addEventListener('scroll',()=>updateBoardCursor(),{passive:true});
window.addEventListener('resize',()=>updateBoardCursor());
function clearAnnotations(){annSquares.clear();annArrows.clear();drawAnnotations();}
function drawAnnotations(a,b){const svg=$('annotations');svg.replaceChildren();const ns='http://www.w3.org/2000/svg';for(const k of annSquares){const el=document.createElementNS(ns,'rect');el.setAttribute('x',(k%8)*100);el.setAttribute('y',Math.floor(k/8)*100);el.setAttribute('width',100);el.setAttribute('height',100);el.setAttribute('fill','#cc00ff80');svg.append(el);}const all=[...annArrows.values()];if(a&&b&&!same(a,b))all.push([a,b]);for(const[start,end]of all){const x1=(start.x+.5)*100,y1=(start.y+.5)*100,x2=(end.x+.5)*100,y2=(end.y+.5)*100,dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len,bx=x2-ux*29,by=y2-uy*29;const path=document.createElementNS(ns,'path');path.setAttribute('d',`M${x1} ${y1}L${bx} ${by}`);path.setAttribute('stroke','#cc00ffb0');path.setAttribute('stroke-width',10);path.setAttribute('stroke-linecap','round');const head=document.createElementNS(ns,'polygon');head.setAttribute('points',`${x2},${y2} ${bx-uy*16},${by+ux*16} ${bx+uy*16},${by-ux*16}`);head.setAttribute('fill','#cc00ffb0');svg.append(path,head);}}
// Same continuous mirrored cloud and 500 ms square fades as SCP-966, extended to 20 ranks.
function getTile(){if(fogTile||!texture.complete||!texture.naturalWidth)return fogTile;const c=document.createElement('canvas');c.width=c.height=1024;const cx=c.getContext('2d');for(let y=0;y<2;y++)for(let x=0;x<2;x++){cx.save();cx.translate(x*512,y*512);cx.scale(x?-1:1,y?-1:1);cx.drawImage(texture,x?-512:0,y?-512:0,512,512);cx.restore();}fogTile=c;return c;}
function drawFog(t){if(!game){requestAnimationFrame(drawFog);return;}const width=board.clientWidth,dpr=Math.min(1.5,devicePixelRatio||1),w=Math.ceil(width*dpr),h=Math.ceil(width*2.5*dpr);if(fog.width!==w||fog.height!==h){fog.width=fogMask.width=w;fog.height=fogMask.height=h;}
 const dt=fogLast?Math.min(64,t-fogLast):0;fogLast=t;for(let i=0;i<160;i++)fogAlpha[i]=fogTarget[i]?Math.min(1,fogAlpha[i]+dt/500):Math.max(0,fogAlpha[i]-dt/500);
 ctx.globalCompositeOperation='source-over';ctx.fillStyle='#989898';ctx.fillRect(0,0,w,h);const tile=getTile();if(tile){const phase=t%32000/32000*Math.PI*2,tw=tile.width*w/640,ox=Math.sin(phase)*w*.12-w*.27,oy=Math.cos(phase)*w*.1-w*.3;ctx.globalAlpha=.83;for(let y=oy-tw;y<h;y+=tw)for(let x=ox-tw;x<w;x+=tw)ctx.drawImage(tile,x,y,tw,tw);ctx.globalAlpha=1;}
 maskCtx.clearRect(0,0,w,h);const xs=Array.from({length:9},(_,i)=>Math.round(i*w/8)),ys=Array.from({length:21},(_,i)=>Math.round(i*h/20));for(let y=0;y<20;y++)for(let x=0;x<8;x++){const a=fogAlpha[key(x,y)];if(a<=0)continue;maskCtx.fillStyle=`rgba(255,255,255,${a})`;maskCtx.fillRect(xs[x],ys[y],xs[x+1]-xs[x],ys[y+1]-ys[y]);}ctx.globalCompositeOperation='destination-in';ctx.drawImage(fogMask,0,0);ctx.globalCompositeOperation='source-over';requestAnimationFrame(drawFog);}
let scrollDir=0,scrollLast=0;
function scrollFrame(t){if(scrollDir){const dt=scrollLast?Math.min(35,t-scrollLast):0;viewport.scrollTop+=scrollDir*dt*.6;}scrollLast=t;requestAnimationFrame(scrollFrame);}
function stopScroll(){scrollDir=0;}
window.addEventListener('blur',()=>{stopScroll();lastPointerClient=null;cancelPointer();});document.addEventListener('visibilitychange',()=>{if(document.hidden){stopScroll();lastPointerClient=null;cancelPointer();}});
window.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){if(finishedGame){e.preventDefault();void stepReplay(e.key==='ArrowLeft'?-1:1);}return;}if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();scrollDir=e.key==='ArrowUp'?-1:1;}});window.addEventListener('keyup',e=>{if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();stopScroll();}});

function resizeBreachBoard(){
 const vw=innerWidth,vh=innerHeight,top=viewport.getBoundingClientRect().top;
 const availableWidth=Math.max(280,vw-40-346);
 const availableHeight=Math.max(280,vh-top-64);
 const size=Math.max(280,Math.floor(Math.min(availableWidth,availableHeight)*.9));
 document.documentElement.style.setProperty('--board-size',size+'px');
}
window.addEventListener('resize',resizeBreachBoard);
resizeBreachBoard();newGame();
// The first visible frame is already fogged; subsequent changes still fade.
drawFog(performance.now());
viewport.scrollTop=viewport.scrollHeight;
viewport.classList.add('fog-ready');
requestAnimationFrame(scrollFrame);
// Exposed for local playtest diagnostics. No network or external services are used.
window.breachDebug={get game(){return game},newGame,render,get busy(){return busy},get view(){return view},get scrollDirection(){return scrollDir},get replay(){return {ready:!!finishedGame,index:timeline?.index,total:timeline?.frames.length,busy:replayBusy}},stepReplay};
