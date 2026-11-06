/* Mi.Día – Copiar tarefas de uma semana */
'use strict';

function planWeekCopy(weeks){
  var src=visibleDays(),ops=[],skipped=0,srcCount=0;
  src.forEach(function(d){srcCount+=(state.plan[keyOf(d)]||[]).length;});
  for(var w=1;w<=weeks;w++){
    src.forEach(function(d){
      var list=state.plan[keyOf(d)]||[];
      if(!list.length)return;
      var tk=keyOf(addDays(d,7*w)),base=state.plan[tk]||[];
      list.forEach(function(t){
        var dup=base.some(function(x){
          return x.title===t.title&&(x.time||'')===(t.time||'')&&(x.endTime||'')===(t.endTime||'')&&(x.cardId||'')===(t.cardId||'');
        });
        if(dup)skipped++;else ops.push({key:tk,task:t});
      });
    });
  }
  return {srcCount:srcCount,ops:ops,skipped:skipped};
}
function applyWeekCopy(plan){
  plan.ops.forEach(function(o){
    var t=o.task,c={id:uid(),title:t.title,tone:t.tone,done:false};
    if(t.cardId)c.cardId=t.cardId;
    if(t.time)c.time=t.time;
    if(t.endTime)c.endTime=t.endTime;
    if(t.notes)c.notes=setAllChecked(t.notes,false);
    (state.plan[o.key]=state.plan[o.key]||[]).push(c);
  });
  save();
}
var copyTimer=null;
function flashCopied(){
  var btn=$('#copy-week');
  btn.querySelector('.cw-txt').textContent=__('Copiado ✓');
  clearTimeout(copyTimer);
  copyTimer=setTimeout(function(){btn.querySelector('.cw-txt').textContent=__('Copiar tarefas');gameSkins();},2200);
  fxMiniAt(btn);
}
function openCopyWeek(opener){
  var form=document.createElement('form');
  form.className='mform';form.autocomplete='off';
  var h=el('h3','modal-title',__('Copiar tarefas'));
  h.id='modal-title';
  var rangeTxt=$('#week-label').textContent.replace(/^(Hoje|Esta semana) · /,'');
  var sub=el('p','modal-sub',__('Copia as tarefas de “{0}” para as semanas seguintes, nos mesmos dias e na mesma ordem.',rangeTxt));
  var n=document.createElement('input');
  n.type='number';n.id='cp-weeks';n.min='1';n.max='52';n.step='1';n.value='1';n.inputMode='numeric';
  var info=el('p','fld-help');
  var ok=null;
  function weeksVal(){var v=parseInt(n.value,10);return v>=1&&v<=52?v:0;}
  function refresh(){
    var w=weeksVal();
    if(!w){info.textContent=__('Informe um número de semanas entre 1 e 52.');if(ok)ok.disabled=true;return;}
    var p=planWeekCopy(w);
    if(!p.srcCount){info.textContent=__('Não há tarefas para copiar no período exibido.');if(ok)ok.disabled=true;return;}
    info.textContent=__(p.ops.length===1?__('{0} tarefa será copiada'):__('{0} tarefas serão copiadas'),p.ops.length)+' '+__(w===1?__('para a próxima semana'):__('para as próximas {0} semanas'),w)+
      (p.skipped?' ('+__(p.skipped===1?__('{0} já existe e será ignorada'):__('{0} já existem e serão ignoradas'),p.skipped)+')':'')+'.';
    if(ok)ok.disabled=!p.ops.length;
  }
  n.addEventListener('input',refresh);
  form.append(h,sub,field(__('Número de semanas'),n,'cp-weeks'),info);
  ok=modalActions(form,function(){
    var w=weeksVal();
    if(!w)return;
    var p=planWeekCopy(w);
    if(!p.ops.length)return;
    applyWeekCopy(p);
    closeModal();
    renderBoard();
    if(view==='calendar')renderCalendar();
    flashCopied();
  });
  refresh();
  openModal(form,opener,n);
}
$('#copy-week').addEventListener('click',function(e){var b=e.currentTarget;if(gameFeatOk('copyWeek',function(){openCopyWeek(b);},b))openCopyWeek(b);});


$('#chips').addEventListener('click',function(e){
  var chip=e.target.closest('.chip');
  if(!chip)return;
  var add=e.target.closest('button.add'),del=e.target.closest('button.del'),edt=e.target.closest('button.edit');
  if(edt){openCardEditor(chip.dataset.id,edt);}
  else if(add){openTaskEditor(null,add,chip.dataset.id);}
  else if(del){closePicker();openDeleteCard(chip.dataset.id,del);}
});
$('#board').addEventListener('change',function(e){
  var cb=e.target.closest('input[type=checkbox]');
  if(!cb)return;
  var f=findTask(cb.closest('.task').dataset.id);
  if(!f)return;
  var t=f.task;
  if(isLocked(f.key,t)){renderBoard();return;}
  if(isFuture(f.key)&&cb.checked){renderBoard();gameToast(FUT_HINT());return;}
  if(cb.classList.contains('nk')){
    t.notes=setLineChecked(t.notes,+cb.dataset.line,cb.checked);
    var was=t.done;
    syncDone(t);
    if(!was&&t.done)fxqBoard.push({t:'done',id:t.id});
  }else{
    t.done=cb.checked;
    if(itemStats(t.notes).total)t.notes=setAllChecked(t.notes,cb.checked);
    if(cb.checked)fxqBoard.push({t:'done',id:t.id});
  }
  propagateLink(t);
  save();renderBoard();
});
