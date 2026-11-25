'use strict';
// The original native bridge's wall projection and exceptional-capture search,
// transported to the site's bundled Fairy Stockfish instead of a Python server.
class BoiledBrowserEngine {
  constructor(){this.engine=null;this.initPromise=null;}
  collect(commands,done,timeoutMs=15000){
    const engine=this.engine;
    return new Promise((resolve,reject)=>{
      const lines=[];
      const cleanup=()=>{clearTimeout(timer);engine.removeMessageListener(listener);};
      const listener=message=>{for(const line of String(message).split(/\r?\n/)){
        lines.push(line);if(done(line)){cleanup();resolve(lines);return;}
      }};
      const timer=setTimeout(()=>{cleanup();reject(Error('Stockfish timed out. Refresh the page to retry.'));},timeoutMs);
      engine.addMessageListener(listener);
      for(const command of commands)engine.postMessage(command);
    });
  }
  async init(){
    if(this.initPromise)return this.initPromise;
    if(this.engine)return;
    this.initPromise=(async()=>{
      if(!window.crossOriginIsolated)throw Error('The game page is missing its engine isolation headers.');
      if(!window.Stockfish)await new Promise((resolve,reject)=>{
        const script=document.createElement('script');script.src='/fairy-stockfish/stockfish.js';
        script.onload=resolve;script.onerror=()=>reject(Error('Could not load Stockfish.'));document.head.appendChild(script);
      });
      this.engine=await window.Stockfish({locateFile:path=>'/fairy-stockfish/'+path});
      await this.collect(['uci'],line=>line.trim()==='uciok');
      await this.collect([
        'setoption name UCI_Variant value chess',
        'setoption name Skill Level value 20',
        'setoption name UCI_LimitStrength value false',
        'setoption name Hash value 128',
        'setoption name Threads value 1',
        'setoption name MultiPV value 1',
        'isready'
      ],line=>line.trim()==='readyok');
      await this.collect(['ucinewgame','isready'],line=>line.trim()==='readyok');
    })();
    try{await this.initPromise;}catch(error){this.engine=null;this.initPromise=null;throw error;}
  }
  async legalMoves(fen){
    const lines=await this.collect(['position fen '+fen,'go perft 1'],line=>line.startsWith('Nodes searched:'));
    return new Set(lines.map(line=>line.split(':',1)[0].trim()).filter(move=>/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move)));
  }
  async search(fen,milliseconds,moves=null){
    let command='go movetime '+Math.max(1,Math.floor(milliseconds));
    if(moves){if(!moves.length)throw Error('Cannot search an empty move list.');command+=' searchmoves '+moves.join(' ');}
    const lines=await this.collect(['position fen '+fen,command],line=>line.startsWith('bestmove '),milliseconds+15000);
    const result={bestmove:lines.at(-1).trim().split(/\s+/)[1],score:null,depth:0,nodes:0};
    for(const line of lines){
      if(!line.startsWith('info '))continue;
      const depth=line.match(/\bdepth (\d+)/),nodes=line.match(/\bnodes (\d+)/),score=line.match(/\bscore (cp|mate) (-?\d+)/);
      if(depth)result.depth=Number(depth[1]);if(nodes)result.nodes=Number(nodes[1]);
      if(score&&!line.includes('bound')){const n=Number(score[2]);result.score=score[1]==='cp'?n:n>0?100000-n:-100000-n;}
    }
    if(result.score===null){
      if(!['(none)','0000'].includes(result.bestmove))throw Error('Stockfish returned no evaluation.');
      const status=await this.collect(['d','isready'],line=>line.trim()==='readyok');
      result.score=status.some(line=>line.startsWith('Checkers:')&&line.split(':')[1].trim())?-100000:0;
    }
    return result;
  }
  async bestMove(fen,candidates,budgetMs=1000){
    await this.init();
    const start=performance.now(),allowed=[...new Set(candidates.map(c=>c.uci))];
    if(!allowed.length)throw Error('No legal engine moves.');
    const legal=await this.legalMoves(fen),ordinary=allowed.filter(move=>legal.has(move)),exceptions=allowed.filter(move=>!legal.has(move));
    const after=new Map(candidates.map(c=>[c.uci,c.afterFen]));
    let best=null;
    if(ordinary.length){
      const remaining=Math.max(1,budgetMs-(performance.now()-start));
      best=await this.search(fen,Math.floor(remaining*(exceptions.length ? 0.7 : 1)),ordinary);
      if(!ordinary.includes(best.bestmove))throw Error('Stockfish returned an unexpected move.');
    }
    for(let i=0;i<exceptions.length;i++){
      const move=exceptions[i],remaining=Math.max(1,budgetMs-(performance.now()-start));
      const result=await this.search(after.get(move),Math.max(1,Math.floor(remaining/(exceptions.length-i))));
      result.score=-result.score;result.bestmove=move;
      if(!best||result.score>best.score)best=result;
    }
    if(!best)throw Error('No engine-evaluated move.');
    return {...best,wallExceptions:exceptions.length,elapsed:performance.now()-start};
  }
}
