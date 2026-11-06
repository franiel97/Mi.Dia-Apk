/* Mi.Día – Filtros do quadro */
'use strict';

var filters=new Set();

/* Filtros: dentro de um grupo vale "ou", entre grupos vale "e".
   Grupo horário: com / sem. Grupo situação: atrasados / concluídos / não concluídos. */
function matches(key,t){
  if(!filters.size)return true;
  if(filters.has('com')||filters.has('sem')){
    if(!((filters.has('com')&&!!t.time)||(filters.has('sem')&&!t.time)))return false;
  }
  if(filters.has('atrasados')||filters.has('concluidos')||filters.has('pendentes')){
    if(!((filters.has('atrasados')&&isLate(key,t))||(filters.has('concluidos')&&!!t.done)||(filters.has('pendentes')&&!t.done)))return false;
  }
  return true;
}
function updateFilterUI(shown,total){
  document.querySelectorAll('#filters button[data-filter]').forEach(function(b){
    var f=b.dataset.filter;
    b.setAttribute('aria-pressed',String(f==='todos'?filters.size===0:filters.has(f)));
  });
  $('#filter-status').textContent=filters.size?__(total===1?__('Mostrando {0} de {1} tarefa nesta semana'):__('Mostrando {0} de {1} tarefas nesta semana'),shown,total):'';
  var fb=$('#filters-badge'),ft=$('#filters-toggle');
  if(fb){fb.hidden=!filters.size;fb.textContent=String(filters.size);}
  if(ft)ft.classList.toggle('has-filter',filters.size>0);
}

function weekDays(){
  var start=addDays(mondayOf(getToday()),weekOffset*7);
  var out=[];
  for(var i=0;i<7;i++)out.push(addDays(start,i));
  return out;
}
