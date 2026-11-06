/* Mi.Día – Cabeçalho e bandeja de cards */
'use strict';

/* ---------- Renderização ---------- */
function renderHeader(){
  var paged=daysPerPage()<7;
  var d=visibleDays(),a=d[0],b=d[d.length-1],label,prefix='';
  if(d.length===1){
    label=cap(DOW_LONG[(a.getDay()+6)%7])+', '+__('dm|{0} de {1}',a.getDate(),MES[a.getMonth()]);
    if(keyOf(a)===keyOf(getToday()))prefix=__('Hoje · ');
  }else{
    if(a.getFullYear()!==b.getFullYear())label=a.getDate()+' '+MES[a.getMonth()]+' '+a.getFullYear()+' – '+b.getDate()+' '+MES[b.getMonth()]+' '+b.getFullYear();
    else if(a.getMonth()!==b.getMonth())label=a.getDate()+' '+MES[a.getMonth()]+' – '+b.getDate()+' '+MES[b.getMonth()]+' '+b.getFullYear();
    else label=a.getDate()+' – '+b.getDate()+' '+MES[b.getMonth()]+' '+b.getFullYear();
    if(!paged&&weekOffset===0)prefix=__('Esta semana · ');
  }
  $('#week-label').textContent=prefix+label;
  $('#goto-today').disabled=paged?keyOf(dayCursor)===keyOf(getToday()):weekOffset===0;
  $('#prev').setAttribute('aria-label',!paged?__('Semana anterior'):(d.length===1?__('Dia anterior'):__('Dias anteriores')));
  $('#next').setAttribute('aria-label',!paged?__('Próxima semana'):(d.length===1?__('Próximo dia'):__('Próximos dias')));
  $('#nav').setAttribute('aria-label',!paged?__('Navegar entre semanas'):__('Navegar entre dias'));
}

var CARDS_HIDE_KEY='planner-diario-cards-hidden-v1';
function cardsHidden(){try{return localStorage.getItem(CARDS_HIDE_KEY)==='1';}catch(e){return false;}}
function applyCardsHidden(){
  var h=cardsHidden();
  $('#tray').classList.toggle('cards-hidden',h);
  var b=$('#cards-toggle');
  b.textContent=h?__('Mostrar'):__('Ocultar');
  b.setAttribute('aria-expanded',String(!h));
}
$('#cards-toggle').addEventListener('click',function(){
  try{localStorage.setItem(CARDS_HIDE_KEY,cardsHidden()?'0':'1');}catch(e){}
  applyCardsHidden();
});
applyCardsHidden();
function renderTray(){
  var box=$('#chips');
  box.textContent='';
  var n=state.cards.length;
  $('#card-count').textContent=n===1?__('1 tarefa'):__('({0} tarefas)',n);
  if(!n){
    box.append(el('p','empty',__('Nenhuma tarefa ainda. Crie a primeira no campo acima.')));
    return;
  }
  state.cards.forEach(function(c){
    var chip=el('div','note chip');
    applyTone(chip,c.tone);
    chip.dataset.id=c.id;
    chip.append(el('span','t',c.title));
    var add=el('button','icon add','+');
    add.type='button';
    add.setAttribute('aria-label',__('Adicionar "{0}" a um dia',c.title));
    add.title=__('Adicionar a um dia');
    var del=el('button','icon del','×');
    del.type='button';
    del.setAttribute('aria-label',__('Excluir a tarefa "{0}"',c.title));
    del.title=__('Excluir tarefa');
    var edit=el('button','icon edit','\u270E\uFE0E');
    edit.type='button';
    edit.setAttribute('aria-label',__('Editar a tarefa "{0}"',c.title));
    edit.title=__('Editar tarefa');
    chip.append(edit,add,del);
    box.append(chip);
  });
  flushFxTray();
}
