/* Mi.Día – Gamificação: efeitos visuais */
'use strict';

function gameBurst(x,y,n,big){
  var sk=skinNow(),cols,mk,i;
  if(sk==='fofo'){cols=['#c93b78','#ff8fb8','#b99bf0','#ffd0e1'];mk=function(){return pick(['♥','✦','♥','★']);};}
  else if(sk==='tech'){cols=['#27e0cf','#0b9bff','#7cf5ff','#ffffff'];mk=function(){return '<i style="display:block;width:100%;height:100%;background:currentColor;box-shadow:0 0 8px currentColor"></i>';};}
  else if(sk==='glass'){cols=['#8ec9ff','#c9b3ff','#ffffff','#7fe0d4'];mk=function(){return '<i style="display:block;width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff,currentColor 70%);opacity:.85"></i>';};}
  else if(sk==='floresta'){cols=['#2f7d4f','#7fd69a','#d9a441','#cddcb9'];mk=function(){return pick(['🍃','🌿','🍀','🍃']);};}
  else if(sk==='caderno'){cols=['#2c4fa3','#c62828','#e0a030','#243049'];mk=function(){return pick(['✎','★','✓','✦']);};}
  else{cols=['#17695f','#e0a030','#6fb4e8','#d64545','#fbe79a'];mk=function(){return '<i style="display:block;width:100%;height:100%;background:currentColor;border-radius:2px"></i>';};}
  for(i=0;i<n;i++){
    var a=big?rnd(0,6.283):rnd(-2.6,-.5),sz=(sk==='fofo'||sk==='floresta'||sk==='caderno')?rnd(14,26):rnd(6,13);
    fxSpawn(mk(),x,y,{size:sz,color:pick(cols),angle:a,dist:rnd(big?90:30,big?220:70),up:big?20:0,g:big?rnd(40,110):20,rot:rnd(-240,240),dur:rnd(800,1500),delay:rnd(0,160)});
  }
  fxRing(x,y,'fx-ring-'+sk);
}
function gameFx(kind,arg){
  var on=fxOn();
  if(kind==='pts'){
    var b=$('#game-btn');if(!on||!b||b.hidden)return;
    var r=b.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
    gameBurst(x,y+8,8,false);fxLabel(x,y+30,'+'+arg);return;
  }
  if(kind==='perfect'){if(on)gameBurst(innerWidth/2,innerHeight-60,26,true);return;}
  var back=el('div','game-badge '+'gb-'+skinNow()),ic=el('div','gb-ic',arg.icon);
  back.setAttribute('role','status');
  back.append(ic,el('div','gb-t',__('Nova conquista!')),el('div','gb-n',__(arg.name)));
  document.body.append(back);
  var gone=false;function bye(){if(gone)return;gone=true;back.classList.add('out');setTimeout(function(){back.remove();},400);}
  back.addEventListener('click',bye);setTimeout(bye,4200);
  if(on)gameBurst(innerWidth/2,innerHeight/2-20,44,true);
}
