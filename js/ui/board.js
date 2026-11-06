/* Mi.Día – Quadro e tarefas */
'use strict';

/* Uma vez atrasado, o card mantém a tag mesmo depois de concluído (até o horário ser editado). */
function isLate(key,t){return !!t.late||computeLateNow(key,t);}
/* Todo card de um dia que já passou fica bloqueado (com ou sem horário): só dá para concluir movendo-o para hoje ou um dia futuro. */
function isLocked(key,t){return key<keyOf(getToday());}
function isFuture(key){return key>keyOf(getToday());}
var FUT_HINT=function(){return __('Tarefas de dias futuros só podem ser concluídas a partir do próprio dia');};
var LOCK_HINT=function(){return __('Bloqueado: este dia já passou. Mova a tarefa para hoje ou para um dia futuro para concluí-la');};
function lockIcon(){
  var sp=el('span','lock-ico');
  sp.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z"/></svg>';
  return sp;
}
function linkIcon(){
  var sp=el('span','link-ico');
  sp.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>';
  sp.title=__('Tarefa ligada a outro dia: concluir uma conclui a outra');
  return sp;
}
function timeSignature(){
  var s=[];
  Object.keys(state.plan).forEach(function(k){
    state.plan[k].forEach(function(t){
      if(isLate(k,t))s.push('L'+t.id+(isLocked(k,t)?'k':''));
      else if(isOngoingNow(k,t))s.push('O'+t.id);
    });
  });
  return s.join(',');
}

function notesEl(t,locked,fut){
  var rows=parseNotes(t.notes);
  if(!rows.length)return null;
  var box=el('div','notes');
  rows.forEach(function(r){
    if(r.ck){
      var lab=el('label','nck'+(r.done?' is-done':''));
      var cb=document.createElement('input');
      cb.type='checkbox';cb.className='nk';cb.checked=r.done;cb.dataset.line=r.i;cb.disabled=!!locked||!!fut;
      cb.setAttribute('aria-label',r.text);
      lab.append(cb,el('span','',r.text));
      box.append(lab);
    }else box.append(el('div','nline',r.text));
  });
  return box;
}
function taskEl(t,key){
  var late=isLate(key,t),ongoing=!late&&isOngoingNow(key,t),locked=isLocked(key,t);
  var d=el('div','note task'+(t.done?' done':'')+(t.time?' timed':' untimed')+(late?' late':'')+(ongoing?' ongoing':'')+(locked?' locked':''));
  applyTone(d,t.tone);
  d.dataset.id=t.id;
  var cb=document.createElement('input');
  cb.type='checkbox';
  cb.id='chk-'+t.id;
  cb.checked=!!t.done;
  if(locked){cb.disabled=true;cb.title=LOCK_HINT();}
  else if(isFuture(key)&&!t.done){cb.disabled=true;cb.title=FUT_HINT();}
  cb.setAttribute('aria-label',__('Concluir "{0}"',t.title));
  var rm=el('button','icon rm','×');
  rm.type='button';
  rm.setAttribute('aria-label',__('Remover "{0}" deste dia',t.title));
  rm.title=__('Remover do dia');
  var ed=el('button','icon ed','\u270E\uFE0E');
  ed.type='button';
  ed.setAttribute('aria-label',__('Editar "{0}"',t.title));
  ed.title=__('Editar tarefa');
  var acts=el('div','tacts');
  acts.append(ed,rm);
  var tb=el('div','tbody');
  var st=itemStats(t.notes);
  /* linha 1: título - horário [status] ; linha 2 (abaixo): descrição */
  var line=el('div','tline');
  var head=el('span','thead');
  head.append(el('span','t',t.title));
  /*if(t.time)head.append(el('span','tsep','-'));*/
  line.append(head);
  if(t.time||st.total||locked){
    var meta=el('span','tmeta');
    if(t.time){
      meta.append(el('span','time',t.time+(t.endTime?' - '+t.endTime:'')));
      if(late){var lt=el('span','late-tag',__('Atrasado'));if(locked){lt.append(lockIcon());lt.title=LOCK_HINT();}meta.append(lt);}
      else if(ongoing)meta.append(el('span','ongoing-tag',__('Em andamento')));
    }
    if(locked&&!(t.time&&late)){var lk=lockIcon();lk.title=LOCK_HINT();meta.append(lk);}
    if(t.link&&hasLinked(t))meta.append(linkIcon());
    if(st.total)meta.append(el('span','prog'+(st.done===st.total?' all':''),st.done+'/'+st.total));
    line.append(meta);
  }
  tb.append(line);
  var nb=notesEl(t,locked,isFuture(key));
  d.append(cb,tb,acts);
  if(nb)d.append(nb);
  return d;
}

function renderBoard(){
  normalizeAll();
  var board=$('#board');
  var keep=board.scrollLeft;
  /* mantém a posição da tela: sem isso, esvaziar o quadro encolhe a página e o navegador volta ao topo */
  var keepY=window.scrollY||document.documentElement.scrollTop||0,keepH=board.offsetHeight;
  if(keepH)board.style.minHeight=keepH+'px';
  board.textContent='';
  var days=visibleDays();
  board.style.setProperty('--board-days',days.length);
  var tk=keyOf(getToday()),shown=0,total=0;
  days.forEach(function(d,i){
    var key=keyOf(d),list=state.plan[key]||[];
    var col=el('section','col');
    col.dataset.key=key;
    col.style.setProperty('--i',i);
    col.setAttribute('aria-label',DOW_LONG[(d.getDay()+6)%7]+', '+__('dm|{0} de {1}',d.getDate(),MES[d.getMonth()]));
    if(key===tk){col.classList.add('today');col.setAttribute('aria-current','date');}
    var head=el('div','col-head');
    var title=el('div','col-title');
    title.append(el('span','dow',DOW[(d.getDay()+6)%7]),el('span','num',String(d.getDate())),el('span','mon',MES[d.getMonth()]));
    var done=list.filter(function(t){return t.done;}).length;
    var tools=el('div','col-tools');
    tools.append(el('span','count',list.length?done+'/'+list.length:''));
    var canAdd=key>=keyOf(getToday());
    if(canAdd||list.length){
      var dm=el('button','icon day-menu');dm.type='button';
      dm.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>';
      dm.title=__('Ações do dia');dm.setAttribute('aria-label',__('Ações de {0}',dayLabel(d)));dm.setAttribute('aria-haspopup','true');
      dm.dataset.key=key;dm.dataset.can=canAdd?'1':'';dm.dataset.n=String(list.length);
      tools.append(dm);
    }
    head.append(title,tools);
    var body=el('div','col-body');
    var vis=list.filter(function(t){return matches(key,t);});
    shown+=vis.length;total+=list.length;
    if(list.length&&!vis.length)body.dataset.empty='filtro';
    vis.forEach(function(t){body.append(taskEl(t,key));});
    col.append(head,body);
    if(flashKey===key)col.classList.add('flash');
    board.append(col);
  });
  flashKey=null;
  timeSig=timeSignature();
  updateFilterUI(shown,total);
  board.scrollLeft=keep;
  if(keepH){
    board.style.minHeight='';
    if(Math.abs((window.scrollY||0)-keepY)>1)window.scrollTo(0,keepY);
  }
  flushFxBoard();
}

function delBtn(tone){
  var x=el('button','sw-del','\u00D7');
  x.type='button';x.dataset.tone=tone;
  x.title=__('Excluir esta cor');
  x.setAttribute('aria-label',__('Excluir a cor {0}',toneName(tone)));
  return x;
}
