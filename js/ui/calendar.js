/* Mi.Día – Calendário */
'use strict';

function renderCalendar(){
  $('#cal-year').textContent=monthCursor.getFullYear();
  $('#cal-label').textContent=cap(MES_LONG[monthCursor.getMonth()]);
  var today=getToday(),tk=keyOf(today);
  $('#cal-today').disabled=monthCursor.getFullYear()===today.getFullYear()&&monthCursor.getMonth()===today.getMonth();
  var grid=$('#cal-grid');
  grid.textContent='';
  var start=mondayOf(monthCursor),m=monthCursor.getMonth();
  for(var i=0;i<42;i++){
    var d=addDays(start,i),key=keyOf(d);
    var list=state.plan[key]||[];
    var cell=el('button','cal-cell');
    cell.type='button';
    cell.dataset.key=key;
    if(d.getMonth()!==m)cell.classList.add('other-month');
    if(key===tk)cell.classList.add('today');
    if(key<tk){cell.classList.add('past');if(list.length){cell.classList.add(list.every(function(t){return t.done;})?'complete':'late');}}
    if(flashKey===key)cell.classList.add('flash');
    cell.setAttribute('aria-label',DOW_LONG[(d.getDay()+6)%7]+', '+__('dm|{0} de {1}',d.getDate(),MES[d.getMonth()])+(list.length?', '+__(list.length===1?__('{0} tarefa'):__('{0} tarefas'),list.length):''));
    cell.append(el('span','cal-num',String(d.getDate())));
    if(list.length){
      var dots=el('div','cal-dots');
      list.slice(0,6).forEach(function(t){
        var dot=el('span','cal-dot'+(t.done?' done':''));
        tintNode(dot,t.tone);
        dots.append(dot);
      });
      cell.append(dots);
      var doneN=list.filter(function(t){return t.done;}).length;
      cell.append(el('span','cal-count',doneN+'/'+list.length));
    }
    grid.append(cell);
  }
  renderCalStats();
}
function countTasks(fromKey,toKey){
  var total=0,done=0;
  Object.keys(state.plan).forEach(function(k){
    if(k<fromKey||k>toKey)return;
    state.plan[k].forEach(function(t){total++;if(t.done)done++;});
  });
  return {total:total,done:done};
}
function renderCalStats(){
  var box=$('#cal-stats');
  if(!box)return;
  box.textContent='';
  var today=getToday(),tk=keyOf(today),mon=mondayOf(today);
  var y=monthCursor.getFullYear(),mo=monthCursor.getMonth();
  var items=[
    [__('Hoje'),countTasks(tk,tk)],
    [__('Esta semana'),countTasks(keyOf(mon),keyOf(addDays(mon,6)))],
    [cap(MES_LONG[mo]),countTasks(keyOf(new Date(y,mo,1)),keyOf(new Date(y,mo+1,0)))],
    [String(y),countTasks(y+'-01-01',y+'-12-31')]
  ];
  items.forEach(function(it){
    var c=it[1],d=el('div','cal-stat');
    d.append(el('span','cal-stat-l',it[0]),el('span','cal-stat-n',String(c.total)),el('span','cal-stat-d',__(c.total===1?__('tarefa'):__('tarefas'))+' · '+__(c.done===1?__('{0} concluída'):__('{0} concluídas'),c.done)));
    box.append(d);
  });
}
function goToDayFromCalendar(key){
  var d=keyToDate(key);
  if(daysPerPage()>=7)weekOffset=Math.round((mondayOf(d)-mondayOf(getToday()))/(7*86400000));
  else dayCursor=d;
  view='board';mainView='board';saveView();
  flashKey=key;
  renderHeader();renderBoard();applyView();
  revealColumn(key);
}

function centerToday(){
  var board=$('#board'),col=board.querySelector('.col.today');
  if(!col||board.scrollWidth<=board.clientWidth)return;
  board.scrollLeft=col.offsetLeft-(board.clientWidth-col.offsetWidth)/2;
}
function revealColumn(key){
  var board=$('#board');
  if(board.scrollWidth<=board.clientWidth)return;
  var col=board.querySelector('.col[data-key="'+key+'"]');
  if(!col)return;
  if(col.offsetLeft<board.scrollLeft||col.offsetLeft+col.offsetWidth>board.scrollLeft+board.clientWidth){
    board.scrollLeft=col.offsetLeft-(board.clientWidth-col.offsetWidth)/2;
  }
}
