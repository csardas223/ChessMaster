/* Exact, read-only game history. No rules or random choices are rerun. */
(function(root){
'use strict';
const clone=value=>JSON.parse(JSON.stringify(value));
const fields=['seed','board','scps','round','phase','result','serial','pieceId','lastMoves','ep','lastMove','castle'];
function snapshot(game){const state={};for(const name of fields)state[name]=game[name];return clone(state);}
function restore(state,Game){const game=Object.assign(Object.create(Game.prototype),clone(state));game.log=[];game.trace=[];game.events=[];game.rng=()=>{throw new Error('Replay cannot make random choices.');};return game;}
const positionChanged=(a,b)=>a.x!==b.x||a.y!==b.y;
const appearance=p=>JSON.stringify([p.type,p.color,p.effect?.kind,p.effect?.owner]);
function transition(from,to,events=[]){
 const changes=[];
 for(const kind of ['piece','scp']){
  const before=new Map((kind==='piece'?from.board.filter(Boolean):from.scps).map(p=>[p.id,p]));
  const after=new Map((kind==='piece'?to.board.filter(Boolean):to.scps).map(p=>[p.id,p]));
  for(const id of new Set([...before.keys(),...after.keys()])){
   const a=before.get(id),b=after.get(id);
   if(!a||!b){changes.push({kind,id,before:a||null,after:b||null,mode:a?'remove':'appear'});continue;}
   const moved=positionChanged(a,b),changed=kind==='piece'?appearance(a)!==appearance(b):a.host!==b.host;
   const teleported=kind==='piece'?events.some(e=>e.kind==='teleport'&&e.piece===id):id==='035'&&moved&&((a.host&&!b.host)||(!a.host&&b.host&&Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y))>1));
   if(moved||changed)changes.push({kind,id,before:a,after:b,mode:teleported?'teleport':moved?'move':'effect'});
  }
 }
 return changes;
}
class Timeline{
 constructor(game){this.frames=[{state:snapshot(game),actor:'w',child:null,events:[]}];this.sealed=false;this.index=0;}
 record(game,actor,child=null,events=game.events){
  if(this.sealed)throw new Error('A finished replay cannot be changed.');
  this.frames.push({state:snapshot(game),actor,child,events:clone(events||[])});this.index=this.frames.length-1;
 }
 seal(game){
  if(this.sealed)return;
  if(!game.result)throw new Error('Replay is available only after the game ends.');
  const final=snapshot(game),last=this.frames[this.frames.length-1];
  if(JSON.stringify(last.state)!==JSON.stringify(final))this.frames.push({state:final,actor:game.result.winner||null,child:null,events:[]});
  this.sealed=true;this.index=this.frames.length-1;
 }
 step(direction){
  if(!this.sealed||![-1,1].includes(direction))return null;
  const next=this.index+direction;if(next<0||next>=this.frames.length)return null;
  const from=this.frames[this.index],to=this.frames[next],edge=direction===1?to:from;
  this.index=next;
  return {from:from.state,to:to.state,actor:edge.actor,child:edge.child,events:edge.events,backwards:direction===-1,changes:transition(from.state,to.state,edge.events),index:next};
 }
}
const api={Timeline,snapshot,restore,transition};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.BreachReplay=api;
})(typeof globalThis!=='undefined'?globalThis:this);
