/* Mi.Día – Diálogos de confirmação e exclusões */
'use strict';

/* ---------- Exclusões com confirmação ---------- */
function dayLabel(d){return cap(DOW_LONG[(d.getDay()+6)%7])+', '+__('dm|{0} de {1}',d.getDate(),MES[d.getMonth()]);}
function removeTasksWhere(pred,force){
  /* cards atrasados de dias anteriores a hoje nunca são excluídos */
  Object.keys(state.plan).forEach(function(k){state.plan[k]=state.plan[k].filter(function(t){return !pred(k,t)||(!force&&isLocked(k,t));});});
  prune();
}
function afterDelete(){
  save();renderTray();renderBoard();
  if(view==='calendar')renderCalendar();
}
/* Card da lista "Seus cards" que corresponde a uma tarefa do dia */
function cardOf(t){
  var ti=String(t.title).trim().toLowerCase();
  return state.cards.find(function(c){return c.id===t.cardId;})||state.cards.find(function(c){return c.title.trim().toLowerCase()===ti;})||null;
}
/* Pop-up de confirmação: título, mensagem e caixas de opção. onConfirm recebe {idDaOpcao:true/false}. */
function confirmDialog(o){
  var form=document.createElement('form');
  form.className='mform'+(o.extreme?' confirm-extreme':(o.danger!==false?' confirm-warn':''));form.autocomplete='off';
  var h=el('h3','modal-title',o.title);
  h.id='modal-title';
  form.append(h);
  if(o.message)form.append(el('p','modal-sub',o.message));
  var checks={};
  if(o.options&&o.options.length){
    var f=el('div','fld');
    f.append(el('span','lab',__('Opções')));
    o.options.forEach(function(op){
      var w=el('div','');
      var lab=el('label','pick');
      var inp=document.createElement('input');
      inp.type='checkbox';inp.checked=!!op.checked&&!op.disabled;inp.disabled=!!op.disabled;
      lab.append(inp,el('span','',op.label));
      if(op.disabled)lab.classList.add('is-off');
      w.append(lab);
      if(op.help)w.append(el('p','fld-help',op.help));
      f.append(w);
      checks[op.id]=inp;
    });
    form.append(f);
  }
  var ok=modalActions(form,function(){
    var v={};
    Object.keys(checks).forEach(function(k){v[k]=checks[k].checked;});
    closeModal();
    o.onConfirm(v);
  });
  ok.textContent=o.okLabel||__('Excluir');
  if(o.danger!==false)ok.classList.add('danger');
  if(o.disableOk)ok.disabled=true;
  openModal(form,o.opener||null,form.querySelector('.modal-actions .btn-alt'));
}
function noticeDialog(title,message,opener){
  var form=document.createElement('form');
  form.className='mform';form.autocomplete='off';
  var h=el('h3','modal-title',title);
  h.id='modal-title';
  form.append(h,el('p','modal-note',message));
  var ok=modalActions(form,function(){closeModal();});
  var cancel=form.querySelector('.modal-actions .btn-alt');
  if(cancel)cancel.remove();
  ok.textContent=__('Entendi');
  openModal(form,opener||null,ok);
}
var MSG_LATE_LOCKED=function(){return __('Tarefas de dias anteriores a hoje não podem ser excluídas. Se quiser, passe a tarefa para hoje ou para um dia futuro.');};
function plural(n,um,varios){return n+' '+(n===1?um:varios);}
/* Excluir um card da lista "Seus cards" */
function openDeleteCard(id,opener){
  var c=state.cards.find(function(x){return x.id===id;});
  if(!c)return;
  var n=0;
  Object.keys(state.plan).forEach(function(k){state.plan[k].forEach(function(t){if(t.cardId===c.id&&!isLocked(k,t))n++;});});
  confirmDialog({
    title:__('Excluir a tarefa “{0}”?',c.title),
    message:__('A tarefa será removida da lista “Suas tarefas”.'),
    options:[{id:'days',label:__('Excluir também as tarefas atribuídas aos dias'),help:n?plural(n,__('tarefa atribuída a um dia será removida.'),__('tarefas atribuídas a dias serão removidas.')):__('Nenhuma tarefa atribuída a dias.'),disabled:!n}],
    opener:opener,
    onConfirm:function(v){
      var chip=document.querySelector('#chips .chip[data-id="'+c.id+'"]');
      fxRemove(chip,function(){
        state.cards=state.cards.filter(function(x){return x.id!==c.id;});
        if(v.days)removeTasksWhere(function(k,t){return t.cardId===c.id;});
        afterDelete();
      });
    }
  });
}
/* Excluir um card atribuído a um dia */
function openDeleteTask(id,opener){
  var f=findTask(id);
  if(!f)return;
  var t=f.task,others=0,card=cardOf(t);
  if(isLocked(f.key,t)){noticeDialog(__('Esta tarefa não pode ser excluída'),MSG_LATE_LOCKED(),opener);return;}
  Object.keys(state.plan).forEach(function(k){state.plan[k].forEach(function(x){if(x!==t&&sameTask(x,t)&&!isLocked(k,x))others++;});});
  confirmDialog({
    title:__('Excluir “{0}” deste dia?',t.title),
    message:__('A tarefa será removida de {0}.',dayLabel(keyToDate(f.key))),
    options:[
      {id:'same',label:__('Excluir também as tarefas com o mesmo título em outros dias'),help:others?plural(others,__('tarefa em outro dia será removida.'),__('tarefas em outros dias serão removidas.')):__('Não há tarefas com este título em outros dias.'),disabled:!others},
      {id:'list',label:__('Excluir também a tarefa da lista “Suas tarefas”'),help:card?'':__('Esta tarefa não está mais na lista.'),disabled:!card}
    ],
    opener:opener,
    onConfirm:function(v){
      var node=document.querySelector('#board .task[data-id="'+t.id+'"]');
      fxRemove(node,function(){
        removeTasksWhere(function(k,x){return x.id===t.id||(v.same&&sameTask(x,t));});
        if(v.list&&card)state.cards=state.cards.filter(function(c){return c!==card;});
        afterDelete();
      });
    }
  });
}
/* Limpar os cards de um ou mais dias (botão "Limpar semana/dia" e botão da coluna) */
function openClearDialog(keys,rangeTxt,opener){
  var list=[],lockedN=0;
  keys.forEach(function(k){(state.plan[k]||[]).forEach(function(t){if(isLocked(k,t))lockedN++;else list.push(t);});});
  var lockNote=lockedN?' '+(lockedN===1?__('1 tarefa de um dia anterior não pode ser excluída e será mantida.'):__('{0} tarefas de dias anteriores não podem ser excluídas e serão mantidas.',lockedN)):'';
  var others=0;
  Object.keys(state.plan).forEach(function(k){
    if(keys.indexOf(k)>=0)return;
    state.plan[k].forEach(function(x){if(list.some(function(t){return sameTask(x,t);})&&!isLocked(k,x))others++;});
  });
  var n=list.length;
  confirmDialog({
    title:keys.length===1?__('Limpar o dia?'):(daysPerPage()>=7?__('Limpar a semana?'):__('Limpar os dias?')),
    message:(n?(n===1?__('Remove a tarefa de “{0}”.',rangeTxt):__('Remove as {0} tarefas de “{1}”.',n,rangeTxt)):__('Não há tarefas para excluir em “{0}”.',rangeTxt))+lockNote,
    options:[{id:'same',label:__('Excluir também as tarefas com o mesmo título em outros dias'),help:others?plural(others,__('tarefa em outro dia será removida.'),__('tarefas em outros dias serão removidas.')):__('Não há tarefas com estes títulos em outros dias.'),disabled:!others}],
    okLabel:__('Limpar'),
    disableOk:!n,
    opener:opener,
    onConfirm:function(v){
      var nodes=[];
      keys.forEach(function(k){document.querySelectorAll('#board .col[data-key="'+k+'"] .task:not(.locked)').forEach(function(nd){nodes.push(nd);});});
      function doClear(){
        removeTasksWhere(function(k,x){return keys.indexOf(k)>=0;});
        if(v.same)removeTasksWhere(function(k,x){return list.some(function(t){return sameTask(x,t);});});
        afterDelete();
      }
      if(fxOn()&&nodes.length)fxMassRemove(nodes,doClear);
      else doClear();
    }
  });
}
$('#clear-mine').addEventListener('click',function(e){
  var n=state.cards.length,m=0,ids=state.cards.map(function(c){return c.id;});
  Object.keys(state.plan).forEach(function(k){state.plan[k].forEach(function(t){if(t.cardId&&ids.indexOf(t.cardId)>=0)m++;});});
  confirmDialog({
    title:__('Limpar TODAS as suas tarefas?'),
    message:n?__('ATENÇÃO: esta é uma limpeza extrema. ')+(n===1?__('A única tarefa da lista “Suas tarefas” será excluída'):__('Todas as {0} tarefas da lista “Suas tarefas” serão excluídas',n))+__('. Esta ação não pode ser desfeita.'):__('Não há tarefas na lista “Suas tarefas”.'),
    options:[{id:'days',label:__('Excluir também as tarefas já atribuídas aos dias (inclusive de dias anteriores)'),help:m?plural(m,__('tarefa atribuída a um dia será removida.'),__('tarefas atribuídas a dias serão removidas.')):__('Nenhuma tarefa atribuída a dias.'),disabled:!m}],
    okLabel:__('Sim, limpar tudo'),
    extreme:true,
    disableOk:!n,
    opener:e.currentTarget,
    onConfirm:function(v){
      logAdd('l','Limpeza da lista “Suas tarefas”: {0} excluídas',[n]);if(v.days)logAdd('l','Limpeza: {0} tarefas atribuídas a dias excluídas',[m]);logCtx='mute';
      state.cards=[];
      if(v.days)removeTasksWhere(function(k,t){return ids.indexOf(t.cardId)>=0;},true);
      afterDelete();
    }
  });
});
$('#clear-all').addEventListener('click',function(e){
  var n=0,past=0,tk=keyOf(getToday());
  Object.keys(state.plan).forEach(function(k){state.plan[k].forEach(function(){n++;if(k<tk)past++;});});
  confirmDialog({
    title:__('Limpar TODAS as tarefas dos dias?'),
    message:n?__('ATENÇÃO: esta é uma limpeza extrema. ')+(n===1?__('A única tarefa atribuída a um dia será excluída'):__('Todas as {0} tarefas atribuídas aos dias serão excluídas',n))+(past?(past===1?__(', inclusive 1 de um dia anterior a hoje'):__(', inclusive {0} de dias anteriores a hoje',past)):'')+__('. Esta ação não pode ser desfeita. As tarefas da lista “Suas tarefas” são mantidas.'):__('Não há tarefas atribuídas aos dias.'),
    okLabel:__('Sim, limpar tudo'),
    extreme:true,
    disableOk:!n,
    opener:e.currentTarget,
    onConfirm:function(){logAdd('l','Limpeza de Grade/Semanas: {0} tarefas excluídas',[n]);logCtx='mute';removeTasksWhere(function(){return true;},true);afterDelete();}
  });
});

/* Copiar tarefas: leva as tarefas dos dias exibidos para as próximas X semanas, nos mesmos
   dias da semana e na mesma ordem. Ignora cópias idênticas que já existam no dia de destino. */
