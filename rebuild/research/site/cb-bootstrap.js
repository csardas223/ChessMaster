
(() => {
 const narrow=matchMedia('(max-width: 960px)');
 const touchOnly=matchMedia('(hover: none) and (pointer: coarse)');
 const mobileAgent=()=>navigator.userAgentData?.mobile || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
 let loaded=false;
 async function loadScript(src){await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=reject;document.body.append(script)});}
 async function update(){
  const mobile=narrow.matches||touchOnly.matches||mobileAgent();
  document.getElementById('desktopGame').hidden=!!mobile;
  document.getElementById('mobileNotice').hidden=!mobile;
  if(mobile||loaded)return;
  loaded=true;
  try{for(const script of ['engine.js','replay.js','app.js'])await loadScript(script);}
  catch(error){console.error('Containment Breach failed to load',error);}
 }
 narrow.addEventListener('change',update);touchOnly.addEventListener('change',update);
 update();
})();
