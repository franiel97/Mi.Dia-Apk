/* Mi.Día – Efeitos visuais dos temas */
'use strict';

/* ---------- Efeitos dos temas fofinho e tech ---------- */
var REDUCE=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
var fxqBoard=[],fxqTray=[],fxLayer=null,lastTrail=0;
var SVG_HEART='<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
var SVG_SPARK='<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z"/></svg>';
var SVG_FLOWER='<svg viewBox="0 0 24 24"><g fill="currentColor"><circle cx="12" cy="5.6" r="4.3"/><circle cx="18.3" cy="10.2" r="4.3"/><circle cx="15.9" cy="17.6" r="4.3"/><circle cx="8.1" cy="17.6" r="4.3"/><circle cx="5.7" cy="10.2" r="4.3"/></g><circle cx="12" cy="12" r="3.4" fill="#ffd45e"/></svg>';
var SVG_PETAL='<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2c4.2 4.2 6.2 8.6 0 20C5.8 10.6 7.8 6.2 12 2z"/></svg>';
var FOFO_COLORS=['#ff6fa5','#ff9ec4','#ffb3d1','#b79cff','#ffc94d','#7ee0b5','var(--accent)'];
var TECH_GLYPHS=['0','1','{','}','/','+','#','>','_','%'];
var FOFO_CFG={
  add:{n:11,s:[SVG_HEART,SVG_HEART,SVG_FLOWER,SVG_SPARK],d:[40,110],up:30,g:70,sz:[14,26]},
  move:{n:5,s:[SVG_HEART,SVG_SPARK],d:[24,60],up:20,g:40,sz:[12,20]},
  new:{n:12,s:[SVG_HEART,SVG_FLOWER,SVG_FLOWER,SVG_SPARK],d:[44,120],up:30,g:80,sz:[14,28]},
  done:{n:16,s:[SVG_HEART,SVG_HEART,SVG_FLOWER,SVG_SPARK,SVG_SPARK],d:[50,140],up:70,g:20,sz:[14,28]},
  remove:{n:10,s:[SVG_PETAL,SVG_PETAL,SVG_SPARK],d:[30,90],up:-10,g:120,sz:[12,22]},
  mini:{n:4,s:[SVG_HEART,SVG_SPARK],d:[20,44],up:20,g:20,sz:[10,16]},
  theme:{n:30,s:[SVG_HEART,SVG_FLOWER,SVG_SPARK,SVG_PETAL],d:[80,220],up:60,g:90,sz:[16,32]}
};
var TECH_CFG={
  add:{n:12,d:[30,100],lab:'[+]'},
  move:{n:6,d:[20,60]},
  new:{n:14,d:[34,110],lab:'[NEW]'},
  done:{n:16,d:[40,120],lab:'[OK]'},
  remove:{n:12,d:[26,90],lab:'[DEL]',bad:true},
  mini:{n:4,d:[14,34]},
  theme:{n:32,d:[70,230],lab:'[SYS]'}
};

var PADRAO_COLORS=['var(--accent)','#f2b84b','#4f8cff','#e76f9a','#6cc38a'];
var PADRAO_CFG={
  add:{n:8,d:[30,80],up:20,g:50,sz:[5,9]},
  move:{n:4,d:[20,50],up:14,g:30,sz:[4,7]},
  new:{n:10,d:[34,90],up:24,g:50,sz:[5,9]},
  done:{n:14,d:[40,110],up:50,g:60,sz:[5,10]},
  remove:{n:8,d:[24,70],up:-6,g:90,sz:[4,8],bad:true},
  mini:{n:3,d:[14,34],up:10,g:20,sz:[3,6]},
  theme:{n:22,d:[60,170],up:40,g:80,sz:[6,11]}
};
function padraoBurst(x,y,kind){
  var c=PADRAO_CFG[kind]||PADRAO_CFG.mini;
  if(kind!=='mini')fxRing(x,y,'fx-ring-pad'+(c.bad?' bad':''));
  for(var i=0;i<c.n;i++){
    fxSpawn('',x,y,{cls:Math.random()<.6?'fx-dot':'fx-bar',size:rnd(c.sz[0],c.sz[1]),color:c.bad?'var(--muted)':pick(PADRAO_COLORS),angle:rnd(0,Math.PI*2),dist:rnd(c.d[0],c.d[1]),up:c.up,g:c.g,rot:rnd(-200,200),dur:rnd(520,880),delay:rnd(0,60)});
  }
  if(kind==='done')fxLabel(x,y,'\u2713');
}
var GLASS_COLORS=['#64b5ff','#b28dff','#ff8fc7','#7be3c4','#ffd27a'];
var GLASS_CFG={
  add:{n:9,d:[34,90],up:26,g:30,sz:[8,16]},
  move:{n:4,d:[20,52],up:16,g:20,sz:[6,12]},
  new:{n:11,d:[40,100],up:30,g:34,sz:[8,18]},
  done:{n:14,d:[46,120],up:56,g:26,sz:[8,18]},
  remove:{n:8,d:[26,76],up:-6,g:70,sz:[6,13],bad:true},
  mini:{n:3,d:[14,34],up:12,g:14,sz:[5,9]},
  theme:{n:24,d:[64,190],up:44,g:50,sz:[9,20]}
};
function glassBurst(x,y,kind){
  var c=GLASS_CFG[kind]||GLASS_CFG.mini;
  if(kind!=='mini')fxRing(x,y,'fx-ring-glass');
  for(var i=0;i<c.n;i++){
    fxSpawn('',x,y,{cls:'fx-bubble',size:rnd(c.sz[0],c.sz[1]),color:c.bad?'#9aa7b8':pick(GLASS_COLORS),angle:rnd(0,Math.PI*2),dist:rnd(c.d[0],c.d[1]),up:c.up,g:c.g,dur:rnd(800,1300),delay:rnd(0,80),easing:'cubic-bezier(.2,.9,.3,1)'});
  }
}
function skinNow(){return document.documentElement.dataset.skin||'padrao';}
function fxOn(){return look.fx!==false&&!REDUCE.matches;}
function rnd(a,b){return a+Math.random()*(b-a);}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function fxLayerEl(){
  if(!fxLayer){
    fxLayer=document.createElement('div');
    fxLayer.className='fx-layer';
    fxLayer.setAttribute('aria-hidden','true');
    document.body.appendChild(fxLayer);
  }
  return fxLayer;
}
function fxSpawn(html,x,y,o){
  var p=document.createElement('span');
  p.className='fx-p'+(o.cls?' '+o.cls:'');
  p.innerHTML=html;
  p.style.left=x+'px';p.style.top=y+'px';
  p.style.width=o.size+'px';p.style.height=o.size+'px';
  p.style.color=o.color;
  fxLayerEl().appendChild(p);
  var dx=Math.cos(o.angle)*o.dist,dy=Math.sin(o.angle)*o.dist-(o.up||0),gy=o.g||0,rot=o.rot||0;
  var a=p.animate([
    {transform:'translate(-50%,-50%) scale(.2) rotate(0deg)',opacity:0},
    {transform:'translate(calc(-50% + '+(dx*.6)+'px),calc(-50% + '+(dy*.6)+'px)) scale(1) rotate('+(rot*.5)+'deg)',opacity:1,offset:.28},
    {transform:'translate(calc(-50% + '+dx+'px),calc(-50% + '+(dy+gy)+'px)) scale(.7) rotate('+rot+'deg)',opacity:0}
  ],{duration:o.dur,delay:o.delay||0,easing:o.easing||'cubic-bezier(.2,.7,.3,1)',fill:'both'});
  a.onfinish=function(){p.remove();};
}
function fxRing(x,y,cls){
  var r=document.createElement('span');
  r.className='fx-ring '+cls;
  r.style.left=x+'px';r.style.top=y+'px';
  fxLayerEl().appendChild(r);
  var a=r.animate([
    {transform:'translate(-50%,-50%) scale(.2)',opacity:.9},
    {transform:'translate(-50%,-50%) scale(2.6)',opacity:0}
  ],{duration:560,easing:'cubic-bezier(.2,.7,.3,1)'});
  a.onfinish=function(){r.remove();};
}
function fxLabel(x,y,text,danger){
  var l=document.createElement('span');
  l.className='fx-label'+(danger?' danger':'');
  l.textContent=text;
  l.style.left=x+'px';l.style.top=(y-12)+'px';
  fxLayerEl().appendChild(l);
  var a=l.animate([
    {transform:'translate(-50%,0)',opacity:0},
    {transform:'translate(-50%,-14px)',opacity:1,offset:.25},
    {transform:'translate(-50%,-38px)',opacity:0}
  ],{duration:950,easing:'ease-out'});
  a.onfinish=function(){l.remove();};
}
function fxLock(node){
  var r=node.getBoundingClientRect();
  var l=document.createElement('span');
  l.className='fx-lock';
  l.style.left=(r.left-4)+'px';l.style.top=(r.top-4)+'px';
  l.style.width=(r.width+8)+'px';l.style.height=(r.height+8)+'px';
  fxLayerEl().appendChild(l);
  var a=l.animate([
    {transform:'scale(1.5)',opacity:0},
    {transform:'scale(1)',opacity:1,offset:.4},
    {transform:'scale(1)',opacity:0}
  ],{duration:760,easing:'cubic-bezier(.2,.7,.3,1)'});
  a.onfinish=function(){l.remove();};
}
function fxScan(){
  var s=document.createElement('span');
  s.className='fx-scan';
  fxLayerEl().appendChild(s);
  var a=s.animate([
    {transform:'translateY(0)',opacity:0},
    {opacity:1,offset:.1},
    {transform:'translateY('+window.innerHeight+'px)',opacity:0}
  ],{duration:900,easing:'ease-in'});
  a.onfinish=function(){s.remove();};
}
function fofoBurst(x,y,kind){
  var c=FOFO_CFG[kind]||FOFO_CFG.mini;
  if(kind==='done'||kind==='theme'||kind==='new')fxRing(x,y,'fx-ring-fofo');
  for(var i=0;i<c.n;i++){
    fxSpawn(pick(c.s),x,y,{size:rnd(c.sz[0],c.sz[1]),color:pick(FOFO_COLORS),angle:rnd(0,Math.PI*2),dist:rnd(c.d[0],c.d[1]),up:c.up,g:c.g,rot:rnd(-220,220),dur:rnd(850,1350),delay:rnd(0,90)});
  }
}
function techBurst(x,y,kind,node){
  var c=TECH_CFG[kind]||TECH_CFG.mini;
  var col=c.bad?'var(--late)':'var(--accent)';
  if(kind!=='mini')fxRing(x,y,'fx-ring-tech'+(c.bad?' bad':''));
  for(var i=0;i<c.n;i++){
    var glyph=Math.random()<.55;
    fxSpawn(glyph?pick(TECH_GLYPHS):'',x,y,{cls:glyph?'fx-g':'fx-sq',size:glyph?13:rnd(4,8),color:(Math.random()<.25&&!c.bad)?'var(--ink)':col,angle:rnd(0,Math.PI*2),dist:rnd(c.d[0],c.d[1]),dur:rnd(520,900),delay:rnd(0,70),easing:'steps(7,end)'});
  }
  if(c.lab)fxLabel(x,y,c.lab,c.bad);
  if(node&&(kind==='add'||kind==='new'||kind==='done'))fxLock(node);
  if(kind==='theme')fxScan();
}
function fxBurst(x,y,kind,node){
  if(!fxOn())return;
  var sk=skinNow();
  if(sk==='glass')glassBurst(x,y,kind);
  else if(sk==='fofo')fofoBurst(x,y,kind);
  else if(sk==='tech')techBurst(x,y,kind,node);
  else padraoBurst(x,y,kind);
}
function fxMiniAt(node){
  if(!node||!fxOn())return;
  var r=node.getBoundingClientRect();
  fxBurst(r.left+r.width/2,r.top+r.height/2,'mini');
}
function fxTrail(x,y){
  if(!fxOn())return;
  var now=performance.now();
  if(now-lastTrail<120)return;
  if(fxLayer&&fxLayer.childElementCount>16)return;
  lastTrail=now;
  if(skinNow()==='glass'){
    fxSpawn('',x+rnd(-6,6),y+rnd(-6,6),{cls:'fx-bubble',size:rnd(6,12),color:pick(GLASS_COLORS),angle:rnd(0,Math.PI*2),dist:rnd(8,22),up:-4,g:18,dur:rnd(520,820)});
  }else if(skinNow()==='fofo'){
    fxSpawn(pick([SVG_HEART,SVG_SPARK,SVG_FLOWER]),x+rnd(-8,8),y+rnd(-8,8),{size:rnd(9,15),color:pick(FOFO_COLORS),angle:rnd(.4,2.7),dist:rnd(10,28),up:-6,g:34,rot:rnd(-70,70),dur:rnd(600,900)});
  }else if(skinNow()==='padrao'){
    fxSpawn('',x+rnd(-6,6),y+rnd(-6,6),{cls:'fx-dot',size:rnd(4,7),color:pick(PADRAO_COLORS),angle:rnd(0,Math.PI*2),dist:rnd(8,20),up:-4,g:20,dur:rnd(380,620)});
  }else{
    var glyph=Math.random()<.6;
    fxSpawn(glyph?pick(TECH_GLYPHS):'',x+rnd(-8,8),y+rnd(-8,8),{cls:glyph?'fx-g':'fx-sq',size:glyph?12:rnd(3,6),color:'var(--accent)',angle:rnd(0,Math.PI*2),dist:rnd(8,22),dur:rnd(420,700),easing:'steps(6,end)'});
  }
}
/* Exclusão em massa: cada card se desfaz a partir de pontos aleatórios dentro dele e os efeitos do tema disparam nesses pontos */
function fxMassRemove(nodes,done){
  var order=nodes.slice().sort(function(){return Math.random()-.5;});
  var pts=order.length>14?2:3;
  var step=Math.min(70,700/order.length),last=0;
  order.forEach(function(nd,i){
    var d=i*step+rnd(0,70);
    if(d>last)last=d;
    setTimeout(function(){
      if(!nd.isConnected)return;
      var r=nd.getBoundingClientRect();
      var dur=rnd(480,700);
      nd.style.setProperty('--fx-dur',Math.round(dur)+'ms');
      for(var k=0;k<3;k++){
        var px=k<pts?rnd(10,90):50,py=k<pts?rnd(14,86):50;
        nd.style.setProperty('--x'+(k+1),px.toFixed(1)+'%');
        nd.style.setProperty('--y'+(k+1),py.toFixed(1)+'%');
        if(k<pts){
          (function(px,py,k){
            setTimeout(function(){
              fxBurst(r.left+px/100*r.width,r.top+py/100*r.height,'remove');
            },k*rnd(70,150)+dur*.12);
          })(px,py,k);
        }
      }
      nd.classList.add('fx-mass');
    },d);
  });
  setTimeout(done,last+760);
}
function fxRemove(node,done){
  if(!node||!fxOn()){done();return;}
  if(node.classList.contains('fx-out'))return;
  var r=node.getBoundingClientRect();
  node.classList.add('fx-out');
  fxBurst(r.left+r.width/2,r.top+r.height/2,'remove');
  setTimeout(done,380);
}
function flushFxBoard(){
  var q=fxqBoard;fxqBoard=[];
  if(!q.length||!fxOn())return;
  q.forEach(function(it){
    if(it.t==='week'){
      var b=$('#board');
      b.classList.add('fx-enter');
      setTimeout(function(){b.classList.remove('fx-enter');},1000);
      return;
    }
    var node=document.querySelector('#board .task[data-id="'+it.id+'"]');
    if(!node)return;
    var r=node.getBoundingClientRect();
    if(it.t==='done'){
      var cr=node.querySelector('input').getBoundingClientRect();
      node.classList.add('fx-done');
      fxBurst(cr.left+cr.width/2,cr.top+cr.height/2,'done',node);
    }else{
      node.classList.add('fx-in');
      fxBurst(r.left+r.width/2,r.top+r.height/2,it.t,node);
    }
    setTimeout(function(){node.classList.remove('fx-in','fx-done');},1000);
  });
}
function flushFxTray(){
  var q=fxqTray;fxqTray=[];
  if(!q.length||!fxOn())return;
  q.forEach(function(it){
    var node=document.querySelector('#chips .chip[data-id="'+it.id+'"]');
    if(!node)return;
    var r=node.getBoundingClientRect();
    node.classList.add('fx-in');
    fxBurst(r.left+r.width/2,r.top+r.height/2,'new',node);
    setTimeout(function(){node.classList.remove('fx-in');},1000);
  });
}

/* Atualiza a sinalização de atraso quando um horário passa */
function checkLate(){
  if(document.hidden||(drag&&drag.active))return;
  var changed=false;
  Object.keys(state.plan).forEach(function(k){
    state.plan[k].forEach(function(t){
      if(!t.late&&computeLateNow(k,t)){t.late=true;changed=true;}
    });
  });
  if(changed)save();
  if(changed||timeSignature()!==timeSig)renderBoard();
}
setInterval(checkLate,15000);
document.addEventListener('visibilitychange',function(){if(!document.hidden)checkLate();});
