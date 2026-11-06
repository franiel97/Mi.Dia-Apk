/* Mi.Día – Gamificação: pop-ups e ícone do cabeçalho */
'use strict';

function gameInfo(opener){
  var idx=gameIdx(game.points),lv=GM.levels[idx],nx=GM.levels[idx+1],A=[GM.perfectDay.minTasks,GM.dailyCap,GM.streak.from,GM.planCap];
  var form=document.createElement('form');form.className='mform';form.autocomplete='off';
  var body=el('div','modal-body'),dots=el('div','tut-dots'),slide=el('div','game-slide'),cur=0;
  function list(rows){var u=el('ul','game-lv');rows.forEach(function(r){var li=el('li',r.on?'on':'');li.append(el('span','game-li',r.i),el('span','game-ln',r.n),el('span','game-lm',r.m));u.append(li);});return u;}
  var S=[
    {t:'Seu nível',f:function(d){
      var hd=el('div','game-hd');hd.append(el('div','game-big',lv.icon),el('h3','modal-title',__(lv.name)),el('p','game-pts',__('{0} pontos',game.points)));hd.firstChild.setAttribute('aria-hidden','true');d.append(hd);
      var bar=el('div','tut-bar'),fl=el('span');fl.style.width=(nx?Math.min(100,Math.round((game.points-lv.min)*100/(nx.min-lv.min))):100)+'%';bar.append(fl);d.append(bar);
      d.append(el('p','look-note game-next',nx?__('Faltam {0} pontos para {1}',nx.min-game.points,nx.icon+' '+__(nx.name)):__('Nível máximo alcançado!')),el('p','look-note game-next',__('Tarefas pontuadas: {0}',game.count)));
    }},
    {t:'Como ganhar pontos',f:function(d){
      var ul=el('ul','game-list');GM.rules.forEach(function(r){ul.append(el('li',null,__(r.text,A[0],A[1],A[2],A[3])+' · '+__('+{0} pontos',GM.points[r.points])));});d.append(ul);
      (GM.notes||[]).forEach(function(n){d.append(el('p','look-note',__(n,A[0],A[1],A[2],A[3])));});
    }},
    {t:'Troca de pontos',f:function(d){
      d.append(el('p','look-note',__('Saldo para trocas: {0} pontos',gameBal())));
      var rows=[];
      Object.keys(GM.themes||{}).forEach(function(k){var u=game.unlocked&&game.unlocked.indexOf(k)>=0,r=gameThemeRule(k);rows.push({on:u,i:'🎨',n:__('Tema {0}',__(SKIN_NAMES[k]||k)),m:u?__('Desbloqueado'):__('{0} pontos',r.cost)+(r.level&&r.lv?' · '+r.lv.icon:'')});});
      Object.keys(GM.features||{}).forEach(function(k){var f=GM.features[k],u=game.feat.indexOf(k)>=0;rows.push({on:u,i:'🔓',n:__(f.name),m:u?__('Desbloqueado'):__('{0} pontos',f.cost)});});
      d.append(list(rows));
    }},
    {t:'Conquistas',f:function(d){d.append(list((GM.achievements||[]).map(function(a){var u=!!game.ach[a.id];return {on:u,i:u?a.icon:'🔒',n:__(a.name),m:__(a.desc)};})));}},
    {t:'Níveis',f:function(d){d.append(list(GM.levels.map(function(l,i){return {on:i<=idx,i:l.icon,n:__(l.name),m:__('{0} pontos',l.min)};})));}}
  ];
  var a=el('div','modal-actions'),back=el('button','btn-alt',__('Voltar')),next=el('button','primary');back.type='button';next.type='button';a.append(back,next);
  function draw(dir){
    slide.textContent='';slide.className='game-slide'+(dir?(dir>0?' r':' l'):'');void slide.offsetWidth;
    if(cur>0)slide.append(el('p','look-title',__(S[cur].t)));
    S[cur].f(slide);
    dots.textContent='';S.forEach(function(x,k){dots.append(el('span',k===cur?'on':''));});
    back.hidden=cur===0;next.textContent=cur===S.length-1?__('Fechar'):__('Próximo');
    body.scrollTop=0;
  }
  function go(n){if(n<0||n>=S.length)return;var d=n>cur?1:-1;cur=n;draw(d);}
  back.addEventListener('click',function(){go(cur-1);});
  next.addEventListener('click',function(){if(cur===S.length-1)closeModal();else go(cur+1);});
  var sx=null;
  body.addEventListener('pointerdown',function(e){sx=e.clientX;});
  body.addEventListener('pointerup',function(e){if(sx===null)return;var dx=e.clientX-sx;sx=null;if(Math.abs(dx)>50)go(cur+(dx<0?1:-1));});
  form.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();go(cur+1);}else if(e.key==='ArrowLeft'){e.preventDefault();go(cur-1);}});
  body.append(dots,slide);draw(0);
  form.append(a,body);openModal(form,opener||null,next);
}
function gameIntro(){
  var IK='planner-diario-gameintro-v1',b=$('#game-btn');
  try{if(localStorage.getItem(IK))return;}catch(e){}
  if(!gameOn()||!b||b.hidden||!b.offsetWidth||tutEl||!modalBack.hidden)return;
  try{localStorage.setItem(IK,'1');}catch(e){}
  var r=b.getBoundingClientRect(),back=el('div','gi-back'),cl=b.cloneNode(true);
  cl.removeAttribute('id');cl.querySelectorAll('[id]').forEach(function(n){n.removeAttribute('id');});cl.className='game-btn gi-clone';cl.hidden=false;cl.tabIndex=-1;
  cl.style.cssText='left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px';
  var pop=el('div','gi-pop');pop.setAttribute('role','dialog');pop.setAttribute('aria-label',__('Conheça o Gamification'));
  var ok=el('button','primary',__('Entendi'));ok.type='button';
  pop.append(el('h3',null,'🎮 '+__('Conheça o Gamification')),
    el('p',null,__('Conclua tarefas para ganhar pontos e subir de nível. Seu nível e o total de pontos ficam neste ícone, no topo da tela, ao lado do horário.')),
    el('p',null,__('Toque nele para ver as regras e os níveis. A pontuação de cada período aparece no Dash.')),ok);
  back.append(cl,pop);document.body.append(back);
  var pw=Math.min(310,innerWidth-24),cx=r.left+r.width/2,left=Math.max(12,Math.min(cx-pw/2,innerWidth-pw-12));
  pop.style.cssText='width:'+pw+'px;left:'+left+'px;top:'+(r.bottom+16)+'px;--ax:'+(cx-left)+'px';
  function end(){document.removeEventListener('keydown',kd,true);window.removeEventListener('resize',end);back.classList.add('out');setTimeout(function(){back.remove();},250);}
  function kd(e){if(e.key==='Escape'||e.key==='Enter'){e.stopPropagation();e.preventDefault();end();}}
  document.addEventListener('keydown',kd,true);window.addEventListener('resize',end);
  ok.addEventListener('click',end);back.addEventListener('pointerdown',function(e){if(e.target===back)end();});
  ok.focus();
}
function gameChip(){
  var lv=GM.levels[gameIdx(game.points)],b=el('button','game-chip');b.type='button';
  b.append(el('span','game-ci',lv.icon),el('span','game-cn',__(lv.name)),el('span','game-cp',__('{0} pontos',game.points)));
  b.addEventListener('click',function(){gameInfo(b);});return b;
}
$('#game-btn').addEventListener('click',function(){gameInfo($('#game-btn'));});
