/* Mi.Día – Arrastar e soltar */
'use strict';

/* ---------- Arrastar e soltar (mouse, caneta e toque) ---------- */
var drag=null,pendingDelete=null;
var dropLine=el('div','drop-line');

document.addEventListener('pointerdown',onDown);
document.addEventListener('touchmove',function(e){
  if(drag&&drag.active)e.preventDefault();
},{passive:false});

function onDown(e){
  if(e.pointerType==='mouse'&&e.button!==0)return;
  if(drag)return;
  if(e.target.closest('button,input,label,a'))return;
  var chip=e.target.closest('.chip'),task=e.target.closest('.task');
  var src=chip||task;
  if(!src)return;
  drag={
    type:chip?'bank':'move',id:src.dataset.id,src:src,pid:e.pointerId,pt:e.pointerType,
    sx:e.clientX,sy:e.clientY,x:e.clientX,y:e.clientY,
    active:false,timer:null,ghost:null,ox:0,oy:0,target:null,remove:false,raf:0
  };
  if(e.pointerType!=='mouse'){
    drag.timer=setTimeout(function(){if(drag&&!drag.active)begin();},260);
  }
  window.addEventListener('pointermove',onMove);
  window.addEventListener('pointerup',onUp);
  window.addEventListener('pointercancel',onCancel);
}
function onMove(e){
  if(!drag||e.pointerId!==drag.pid)return;
  drag.x=e.clientX;drag.y=e.clientY;
  if(!drag.active){
    var dist=Math.hypot(drag.x-drag.sx,drag.y-drag.sy);
    if(drag.pt==='mouse'){if(dist>5)begin();}
    else if(dist>10){cleanup();}
    return;
  }
  e.preventDefault();
  drag.dirty=true;
}
function dragScroll(){if(drag)drag.cr=null;}
function begin(){
  clearTimeout(drag.timer);
  drag.active=true;
  var ft=drag.type==='move'?findTask(drag.id):null;
  drag.timed=!!(ft&&ft.task.time);
  drag.srcKey=ft?ft.key:null;
  closePicker();
  var src=drag.src,r=src.getBoundingClientRect();
  var g=src.cloneNode(true);
  g.classList.add('ghost');
  g.classList.remove('ghosted');
  g.querySelectorAll('[id]').forEach(function(n){n.removeAttribute('id');});
  g.style.width=r.width+'px';
  drag.ox=drag.x-r.left;drag.oy=drag.y-r.top;
  document.body.append(g);
  drag.ghost=g;
  if(drag.type==='move')src.classList.add('ghosted');
  document.body.classList.add('dragging',drag.type==='move'?'drag-move':'drag-bank');
  updateDrag();
  drag.raf=requestAnimationFrame(autoScroll);
  window.addEventListener('scroll',dragScroll,{passive:true});
}
function updateDrag(){
  drag.ghost.style.transform='translate3d('+(drag.x-drag.ox)+'px,'+(drag.y-drag.oy)+'px,0) rotate(2deg)';
  fxTrail(drag.x,drag.y);
  updateTarget();
}
function dropLineOff(){if(dropLine.parentNode)dropLine.remove();drag.li=null;}
function applyHot(elm,cls,trayOver){
  if(drag.hotEl!==elm||drag.hotCls!==cls){
    document.querySelectorAll('.col.over,.col.denied,.cal-cell.over,.cal-cell.denied').forEach(function(c){c.classList.remove('over','denied');});
    if(elm)elm.classList.add(cls);
    drag.hotEl=elm;drag.hotCls=cls;
  }
  if(drag.trayOver!==trayOver){$('#tray').classList.toggle('over-remove',trayOver);drag.trayOver=trayOver;}
}
function updateTarget(){
  var under=document.elementFromPoint(drag.x,drag.y);
  var col=under&&under.closest('.col');
  var cell=!col&&under&&under.closest('.cal-cell');
  var tray=under&&under.closest('#tray');
  drag.remove=false;
  var todayKey=keyOf(getToday());
  var hotEl=null,hotCls=null,trayOver=false;
  if(cell&&drag.type==='bank'){
    /* visão do calendário: só cards novos da bandeja podem ser soltos num dia (hoje ou futuro) */
    dropLineOff();
    hotEl=cell;
    if(cell.dataset.key<todayKey){hotCls='denied';cell.dataset.deny=__('Dia que já passou');drag.target=null;}
    else{hotCls='over';drag.target={key:cell.dataset.key,index:null};}
  }else if(col&&col.dataset.key<todayKey&&!(drag.type==='move'&&col.dataset.key===drag.srcKey)){
    /* dias passados não recebem cards: só hoje e dias futuros (reordenar no próprio dia continua valendo) */
    hotEl=col;hotCls='denied';
    col.dataset.deny=drag.type==='move'?__('Não é possível mover tarefas para dias anteriores a hoje'):__('Não é possível adicionar tarefas em dias anteriores a hoje');
    dropLineOff();
    drag.target=null;
  }else if(col){
    hotEl=col;hotCls='over';
    var body=col.querySelector('.col-body');
    if(drag.timed){
      /* card com horário: a posição vem do horário, sem linha de encaixe */
      dropLineOff();
      drag.target={key:col.dataset.key,index:null};
    }else{
      /* posições dos cards medidas uma vez por coluna (e de novo só ao rolar), sem recalcular layout a cada movimento */
      if(drag.cc!==col||!drag.cr){
        dropLineOff();
        drag.ct=Array.prototype.slice.call(body.querySelectorAll('.task:not(.ghosted)'));
        drag.cr=drag.ct.map(function(t){var r=t.getBoundingClientRect();return r.top+r.height/2;});
        drag.cc=col;
      }
      var tasks=drag.ct,idx=tasks.length;
      for(var i=0;i<tasks.length;i++){
        if(drag.y<drag.cr[i]){idx=i;break;}
      }
      if(drag.li!==idx||drag.lc!==col||dropLine.parentNode!==body){
        if(idx<tasks.length)body.insertBefore(dropLine,tasks[idx]);
        else body.append(dropLine);
        drag.li=idx;drag.lc=col;
      }
      drag.target={key:col.dataset.key,index:idx,beforeId:idx<tasks.length?tasks[idx].dataset.id:null};
    }
  }else{
    dropLineOff();
    drag.target=null;
    if(tray&&drag.type==='move'){trayOver=true;drag.remove=true;}
  }
  applyHot(hotEl,hotCls,trayOver);
}
function autoScroll(){
  if(!drag||!drag.active)return;
  if(drag.dirty){drag.dirty=false;updateDrag();}
  var board=$('#board'),r=board.getBoundingClientRect(),moved=false;
  if(board.scrollWidth>board.clientWidth){
    if(drag.x<r.left+48&&board.scrollLeft>0){board.scrollLeft-=12;moved=true;}
    else if(drag.x>r.right-48){board.scrollLeft+=12;moved=true;}
  }
  if(drag.y<64&&window.scrollY>0){window.scrollBy(0,-14);moved=true;}
  else if(drag.y>window.innerHeight-64){window.scrollBy(0,14);moved=true;}
  if(moved){drag.cr=null;updateTarget();}
  drag.raf=requestAnimationFrame(autoScroll);
}
function onUp(e){
  if(!drag||e.pointerId!==drag.pid)return;
  if(drag.active){
    drag.x=e.clientX;drag.y=e.clientY;
    updateTarget();
    applyDrop();
  }
  cleanup();
  var fk=flashKey;
  renderBoard();
  if(view==='calendar'){flashKey=fk;renderCalendar();flashKey=null;}
  if(pendingDelete){var pd=pendingDelete;pendingDelete=null;openDeleteTask(pd,null);}
}
function onCancel(e){
  if(!drag||e.pointerId!==drag.pid)return;
  cleanup();
}
function insertUntimed(list,task,beforeId){
  /* encaixa antes do card indicado (com ou sem horário); sem referência, vai para o fim.
     Os cards com horário se ordenam entre si pelo horário, e cards ocultos por filtro não atrapalham. */
  var i=beforeId?list.findIndex(function(x){return x.id===beforeId;}):-1;
  if(i<0)list.push(task);
  else list.splice(i,0,task);
}
function applyDrop(){
  var t=drag.target;
  if(t){
    if(drag.type==='bank'){
      var c=state.cards.find(function(x){return x.id===drag.id;});
      if(!c)return;
      var l=state.plan[t.key]=state.plan[t.key]||[];
      var nt={id:uid(),cardId:c.id,title:c.title,tone:c.tone,done:false};
      insertUntimed(l,nt,t.beforeId);
      fxqBoard.push({t:'add',id:nt.id});
    }else{
      var f=findTask(drag.id);
      if(!f)return;
      var l2=state.plan[t.key]=state.plan[t.key]||[];
      var moved,fromPast=f.key<keyOf(getToday())&&f.key!==t.key;
      if(fromPast){
        /* card de um dia que passou: o original fica onde está e uma cópia vai para o dia escolhido */
        var o=f.task;
        moved={id:uid(),title:o.title,tone:o.tone,done:false};
        if(o.cardId)moved.cardId=o.cardId;
        if(o.time)moved.time=o.time;
        if(o.endTime)moved.endTime=o.endTime;
        if(o.notes)moved.notes=setAllChecked(o.notes,false);
      }else{
        moved=f.list.splice(f.i,1)[0];
        if(f.key!==t.key)delete moved.late;
      }
      if(moved.time)l2.push(moved);
      else insertUntimed(l2,moved,t.beforeId);
      fxqBoard.push({t:fromPast?'add':'move',id:moved.id});
    }
    flashKey=t.key;
    prune();save();
  }else if(drag.remove){
    /* soltar na bandeja pede confirmação antes de excluir */
    pendingDelete=drag.id;
  }
}
function cleanup(){
  if(!drag)return;
  clearTimeout(drag.timer);
  cancelAnimationFrame(drag.raf);
  if(drag.ghost)drag.ghost.remove();
  drag.src.classList.remove('ghosted');
  document.querySelectorAll('.col.over,.col.denied,.cal-cell.over,.cal-cell.denied').forEach(function(c){c.classList.remove('over','denied');});
  $('#tray').classList.remove('over-remove');
  if(dropLine.parentNode)dropLine.remove();
  document.body.classList.remove('dragging','drag-move','drag-bank');
  window.removeEventListener('pointermove',onMove);
  window.removeEventListener('pointerup',onUp);
  window.removeEventListener('pointercancel',onCancel);
  window.removeEventListener('scroll',dragScroll);
  drag=null;
}

function setFiltersOpen(o){
  var box=$('#filters'),b=$('#filters-toggle');
  box.classList.toggle('open',!!o);
  b.setAttribute('aria-expanded',String(!!o));
}
popX($('#filters-body'),function(){setFiltersOpen(false);$('#filters-toggle').focus();});
$('#filters-toggle').addEventListener('click',function(){setFiltersOpen(!$('#filters').classList.contains('open'));});
document.addEventListener('pointerdown',function(e){
  if($('#filters').classList.contains('open')&&!e.target.closest('#filters'))setFiltersOpen(false);
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&$('#filters').classList.contains('open')){setFiltersOpen(false);$('#filters-toggle').focus();}
});
$('#filters').addEventListener('click',function(e){
  var b=e.target.closest('button[data-filter]');
  if(!b)return;
  fxMiniAt(b);
  var f=b.dataset.filter;
  if(f==='todos')filters.clear();
  else if(filters.has(f))filters.delete(f);
  else filters.add(f);
  renderBoard();
});
