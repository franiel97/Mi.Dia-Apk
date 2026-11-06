/* Mi.Día – Menu de ações de cada dia */
'use strict';

var dayPop=null;
function closeDayPop(){if(dayPop){dayPop.remove();dayPop=null;}}
function openDayMenu(btn){
  var was=dayPop&&dayPop.dataset.for===btn.dataset.key;closeDayPop();if(was)return;
  var key=btn.dataset.key,d=keyToDate(key),pop=el('div','day-pop');pop.setAttribute('role','menu');pop.dataset.for=key;
  function item(cls,svg,label,fn){var b=el('button','icon '+cls);b.type='button';b.innerHTML=svg;b.title=label;b.setAttribute('aria-label',label);b.setAttribute('role','menuitem');b.addEventListener('click',function(){closeDayPop();fn();});pop.append(b);}
  if(btn.dataset.can)item('day-add','<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" d="M12 5v14M5 12h14"/></svg>',__('Nova tarefa em {0}',dayLabel(d)),function(){openTaskEditor(null,btn,null,key);});
  if(+btn.dataset.n)item('day-clear','<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12M9 7V4h6v3"/></svg>',__('Limpar todas as tarefas de {0}',dayLabel(d)),function(){openClearDialog([key],dayLabel(d),btn);});
  document.body.append(pop);dayPop=pop;
  var r=btn.getBoundingClientRect(),w=pop.offsetWidth;
  pop.style.top=(r.bottom+6)+'px';pop.style.left=Math.max(8,Math.min(r.right-w,innerWidth-w-8))+'px';
}
document.addEventListener('pointerdown',function(e){if(dayPop&&!dayPop.contains(e.target)&&!e.target.closest('button.day-menu'))closeDayPop();},true);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&dayPop){e.stopPropagation();closeDayPop();}},true);
window.addEventListener('resize',closeDayPop);window.addEventListener('scroll',closeDayPop,true);
$('#board').addEventListener('click',function(e){
  var dmb=e.target.closest('button.day-menu');
  if(dmb){openDayMenu(dmb);return;}
  var dcb=e.target.closest('button.day-clear');
  if(dcb){var dcol=dcb.closest('.col');openClearDialog([dcol.dataset.key],dayLabel(keyToDate(dcol.dataset.key)),dcb);return;}
  var ed=e.target.closest('button.ed');
  if(ed){openTaskEditor(ed.closest('.task').dataset.id,ed);return;}
  var b=e.target.closest('button.rm');
  if(b){openDeleteTask(b.closest('.task').dataset.id,b);}
});
document.addEventListener('contextmenu',function(e){
  if(e.target.closest('.chip,.task'))e.preventDefault();
});
