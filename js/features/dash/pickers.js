/* Mi.Día – Dash e calendário: seletores de mês e ano */
'use strict';

function monthPop(o){
  var pp=$('#cal-mpop');pp.hidden=!o;$('#cal-label').setAttribute('aria-expanded',String(!!o));
  if(!o)return;
  pp.textContent='';popX(pp,function(){monthPop(false);$('#cal-label').focus();});
  var cm=monthCursor.getMonth(),t=getToday(),nm=monthCursor.getFullYear()===t.getFullYear()?t.getMonth():-1;
  MES_LONG.forEach(function(n,i){var b=el('button',(i===cm?'cur ':'')+(i===nm?'now':''),cap(n));b.type='button';b.setAttribute('role','option');b.setAttribute('aria-selected',String(i===cm));b.dataset.m=i;pp.append(b);});
}
function toggleMonthPop(e){e.stopPropagation();calPop(false);yearPop(false);monthPop($('#cal-mpop').hidden);}
$('#cal-label').addEventListener('click',toggleMonthPop);
$('#cal-label').addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleMonthPop(e);}});
$('#cal-mpop').addEventListener('click',function(e){
  var b=e.target.closest('[data-m]');if(!b)return;
  monthCursor=new Date(monthCursor.getFullYear(),+b.dataset.m,1);monthPop(false);renderCalendar();
});
document.addEventListener('click',function(e){if(!$('#cal-mpop').hidden&&!e.target.closest('.cal-mmenu'))monthPop(false);});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!$('#cal-mpop').hidden){monthPop(false);$('#cal-label').focus();}});
function yearPop(o){
  var pp=$('#cal-ypop');pp.hidden=!o;$('#cal-year').setAttribute('aria-expanded',String(!!o));
  if(!o)return;
  pp.textContent='';popX(pp,function(){yearPop(false);$('#cal-year').focus();});
  var cy=monthCursor.getFullYear(),ny=getToday().getFullYear(),y,sel=null;
  for(y=Math.min(cy,ny)-12;y<=Math.max(cy,ny)+12;y++){
    var b=el('button',(y===cy?'cur ':'')+(y===ny?'now':''),String(y));b.type='button';b.setAttribute('role','option');b.setAttribute('aria-selected',String(y===cy));b.dataset.y=y;
    if(y===cy)sel=b;pp.append(b);
  }
  if(sel)pp.scrollTop=sel.offsetTop-pp.clientHeight/2+17;
}
$('#cal-year').addEventListener('click',function(e){e.stopPropagation();calPop(false);monthPop(false);yearPop($('#cal-ypop').hidden);});
$('#cal-ypop').addEventListener('click',function(e){
  var b=e.target.closest('[data-y]');if(!b)return;
  monthCursor=new Date(+b.dataset.y,monthCursor.getMonth(),1);yearPop(false);renderCalendar();$('#cal-year').focus();
});
document.addEventListener('click',function(e){if(!$('#cal-ypop').hidden&&!e.target.closest('.cal-ymenu'))yearPop(false);});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!$('#cal-ypop').hidden){yearPop(false);$('#cal-year').focus();}});
function calPop(o){$('#cal-pop').hidden=!o;$('#cal-more').setAttribute('aria-expanded',String(!!o));}
popX($('#cal-pop'),function(){calPop(false);$('#cal-more').focus();});
$('#cal-more').addEventListener('click',function(e){e.stopPropagation();yearPop(false);monthPop(false);calPop($('#cal-pop').hidden);});
document.addEventListener('click',function(e){if(!$('#cal-pop').hidden&&!e.target.closest('.cal-menu'))calPop(false);});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!$('#cal-pop').hidden){calPop(false);$('#cal-more').focus();}});
$('#cal-clear-month').addEventListener('click',function(){
  calPop(false);
  var pre=keyOf(monthCursor).slice(0,7),lbl=cap(MES_LONG[monthCursor.getMonth()])+' '+monthCursor.getFullYear(),n=0,lockedN=0;
  Object.keys(state.plan).forEach(function(k){if(k.slice(0,7)!==pre)return;state.plan[k].forEach(function(t){if(isLocked(k,t))lockedN++;else n++;});});
  var lockNote=lockedN?' '+(lockedN===1?__('1 tarefa de um dia anterior não pode ser excluída e será mantida.'):__('{0} tarefas de dias anteriores não podem ser excluídas e serão mantidas.',lockedN)):'';
  confirmDialog({
    title:__('Limpar este mês?'),
    message:(n?(n===1?__('Remove a tarefa de “{0}”.',lbl):__('Remove as {0} tarefas de “{1}”.',n,lbl)):__('Não há tarefas para excluir em “{0}”.',lbl))+lockNote,
    okLabel:__('Limpar'),
    disableOk:!n,
    opener:$('#cal-more'),
    onConfirm:function(){
      logAdd('l','Limpeza do mês {0}: {1} tarefas excluídas',[lbl,n]);logCtx='mute';
      removeTasksWhere(function(k){return k.slice(0,7)===pre;});
      afterDelete();
    }
  });
});
$('#cal-today').addEventListener('click',function(){monthCursor=startOfMonth(getToday());renderCalendar();});
$('#cal-grid').addEventListener('click',function(e){
  var cell=e.target.closest('.cal-cell');
  if(!cell)return;
  goToDayFromCalendar(cell.dataset.key);
});
var resizeTimer=null;
window.addEventListener('resize',function(){
  clearTimeout(resizeTimer);
  resizeTimer=setTimeout(function(){renderHeader();renderBoard();},150);
});
$('#prev').addEventListener('click',function(){navStep(-1);});
$('#next').addEventListener('click',function(){navStep(1);});
$('#goto-today').addEventListener('click',function(){weekOffset=0;dayCursor=startOfDay(getToday());closePicker();fxqBoard.push({t:'week'});render();centerToday();});
