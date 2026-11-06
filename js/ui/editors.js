/* Mi.Día – Editores de card e tarefa */
'use strict';

function field(label,child,forId){
  var f=el('div','fld');
  var l=el(forId?'label':'span',forId?'':'lab',label);
  if(forId)l.htmlFor=forId;
  f.append(l,child);
  return f;
}
function openModal(form,opener,focusEl){
  form.addEventListener('submit',function(e){e.preventDefault();});
  closePicker();closeLook();
  closeModal();
  modalOpener=opener;
  modalEl.textContent='';
  modalEl.append(form);
  modalBack.hidden=false;
  if(!Array.prototype.some.call(form.querySelectorAll('button'),function(b){return /cancel|fechar|close|cerrar/i.test(b.textContent);}))popX(modalEl,closeModal);
  if(focusEl){focusEl.focus();if(focusEl.select)focusEl.select();}
}
/* Junta tudo que já estava no form num corpo rolável, e deixa Cancelar/OK fixos no topo,
   sempre visíveis, mesmo com o conteúdo rolando por baixo. */

function modalActions(form,onOk){

  var body=el('div','modal-body');
  while(form.firstChild)body.append(form.firstChild);
  var a=el('div','modal-actions');

  var c=el('button','btn-alt',__('Cancelar'));
  c.type='button';
  c.addEventListener('click',closeModal);
  
  var ok=el('button','primary','OK');
  ok.type='button';
  ok.addEventListener('click',onOk);
  form.addEventListener('keydown',function(e){
    if(e.key==='Enter'&&!e.isComposing&&e.target.matches('input[type=text],input[type=time],input[type=number]')){e.preventDefault();onOk();}
  });
  a.append(c,ok);
  form.append(a,body);
  return ok;
}

function openCardEditor(id,opener){
  var c=state.cards.find(function(x){return x.id===id;});
  if(!c)return;
  var form=document.createElement('form');
  form.className='mform';form.autocomplete='off';
  var h=el('h3','modal-title',__('Editar tarefa'));
  h.id='modal-title';
  var nm=document.createElement('input');
  nm.type='text';nm.id='ed-name';nm.maxLength=80;nm.value=c.title;
  var ts=toneSet(c.tone);
  form.append(h,field(__('Nome'),nm,'ed-name'),field(__('Cor'),ts.el),el('p','fld-help',__('A alteração vale também para as tarefas deste tipo que já estão nos dias.')));
  modalActions(form,function(){
    var title=nm.value.trim();
    if(!title){nm.focus();return;}
    c.title=title;c.tone=ts.get();
    touchPalette(c.tone);
    Object.keys(state.plan).forEach(function(k){
      state.plan[k].forEach(function(t){if(t.cardId===c.id){t.title=c.title;t.tone=c.tone;}});
    });
    save();closeModal();
    renderSwatches();renderTray();renderBoard();
    fxMiniAt(document.querySelector('#chips .chip[data-id="'+c.id+'"]'));
  });
  openModal(form,opener,nm);
}

/* Editor do card no dia. Com `cardId` (botão + da bandeja) cria novos cards a partir do modelo,
   com os mesmos campos do editor de um card já atribuído. */
function nowBtn(get){
  var b=el('button','btn-alt sm',__('Agora'));b.type='button';
  b.addEventListener('click',function(){var d=new Date(),i=get();i.value=pad(d.getHours())+':'+pad(d.getMinutes());i.focus();});
  return b;
}
function clearBtn(){
  var b=el('button','btn-alt sm ico-btn'),l=__('Limpar');b.type='button';b.title=l;b.setAttribute('aria-label',l);
  b.innerHTML='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M16.2 3.8l4 4a1.6 1.6 0 010 2.3L11 19.3H6.2L3.8 16.9a1.6 1.6 0 010-2.3L13.9 4.5a1.6 1.6 0 012.3-.7zM9.2 8.8l6 6M11 19.3h9.2"/></svg>';
  return b;
}
function openTaskEditor(id,opener,cardId,quickKey){
  var f=null,t,quick=!!quickKey,isNew=!!cardId||quick,tIn=null;
  if(quick){
    t={id:uid(),title:'',tone:NONE,done:false};
  }else if(isNew){
    var c0=state.cards.find(function(x){return x.id===cardId;});
    if(!c0)return;
    t={id:uid(),cardId:c0.id,title:c0.title,tone:c0.tone,done:false};
  }else{
    f=findTask(id);
    if(!f)return;
    t=f.task;
  }
  var pastMode=!isNew&&f.key<keyOf(getToday());
  var form=document.createElement('form');
  form.className='mform';form.autocomplete='off';
  var h=el('h3','modal-title',pastMode?__('Passar “{0}” para outro dia',t.title):(quick?__('Nova tarefa'):isNew?__('Configurar tarefa: “{0}”',t.title):__('Editar tarefa: “{0}”',t.title))); 
  h.id=('modal-title');
  var ts=toneSet(t.tone);
  var okBtn=null;
  if(quick){tIn=document.createElement('input');tIn.type='text';tIn.id='ed-title';tIn.maxLength=120;tIn.placeholder=__('Título da tarefa');tIn.setAttribute('aria-label',__('Título da tarefa'));tIn.addEventListener('input',function(){okBtn.disabled=!db.keys().length||!tIn.value.trim();});}
  var tk0=keyOf(getToday());
  var paged=daysPerPage()<7,calView=view==='calendar';
  var anchor=quick?keyToDate(quickKey):isNew?(calView?monthCursor:(paged?dayCursor:weekDays()[0])):keyToDate(f.key);
  var monthHasToday=calView&&monthCursor.getFullYear()===getToday().getFullYear()&&monthCursor.getMonth()===getToday().getMonth();
  var startKeys=quick?[quickKey]:isNew?(calView?(monthHasToday?[tk0]:[]):(paged?[keyOf(dayCursor)]:(weekDays().some(function(d){return keyOf(d)===tk0;})?[tk0]:[]))):[f.key];
  var db=daysBuilder(pastMode?[]:startKeys,function(n){if(okBtn)okBtn.disabled=!n||(quick&&!tIn.value.trim());},anchor,isNew?[]:[f.key],isNew,pastMode?[f.key]:null);
  var dayF=el('div','fld');
  dayF.append(el('span','lab',__('Dia')),db.nav,db.all,db.grid,db.repeat,db.sub,db.mrepeat,db.msub,el('p','fld-help',pastMode?__('O dia em que a tarefa está fica marcado e bloqueado. Uma cópia é criada em cada dia escolhido, sem duplicar uma tarefa igual que já esteja no dia.'):isNew?__('A tarefa é adicionada a todos os dias marcados. Não duplica uma tarefa igual que já esteja no dia.'):__('A tarefa fica em todos os dias marcados; os dias novos recebem uma cópia. Não duplica uma tarefa igual que já esteja no dia.')));
  var ti=document.createElement('input');
  ti.type='time';ti.id='ed-time';ti.value=t.time||'';
  var clr=clearBtn(),nowB=nowBtn(function(){return ti;});
  clr.type='button';
  clr.addEventListener('click',function(){ti.value='';te.value='';ti.focus();});
  var lab1=el('label','',__('Início'));lab1.htmlFor='ed-time';
  var row=el('div','row');
  row.append(ti,nowB,clr);
  var te=document.createElement('input');
  te.type='time';te.id='ed-end';te.value=t.endTime||'';
  var clrE=clearBtn(),nowE=nowBtn(function(){return te;});
  clrE.type='button';
  clrE.addEventListener('click',function(){te.value='';te.focus();});
  var lab2=el('label','',__('Término'));lab2.htmlFor='ed-end';
  var rowE=el('div','row');
  rowE.append(te,nowE,clrE);
  var timeF=el('div','fld');
  timeF.append(el('span','lab',__('Horário (opcional)')),lab1,row,lab2,rowE,el('p','fld-help',__('Os horários de Início e Término são usados para exibir uma sinalização de "Em andamento" e "Atrasado". Se o Término for depois da meia-noite (ex.: 22:00 até 01:00), a tarefa é dividida em duas, ligadas entre si: uma até 23:59 e outra no dia seguinte a partir de 00:00. Concluir uma conclui a outra.')));
  var ta=document.createElement('textarea');
  ta.id='ed-notes';ta.rows=3;ta.value=t.notes||'';
  ta.placeholder=__('Escreva livremente. Linhas começando com "- [ ]" viram uma lista com checkbox.');
  var addItem=el('button','btn-alt sm',__('☑ Adicionar item de lista'));
  addItem.type='button';
  addItem.addEventListener('click',function(){
    var v=ta.value;
    if(v&&!/\n$/.test(v))v+='\n';
    ta.value=v+'- [ ] ';
    ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length);
  });
  /* Enter em um item cria o próximo; Enter em item vazio encerra a lista */
  ta.addEventListener('keydown',function(e){
    if(e.key!=='Enter'||e.shiftKey||e.isComposing)return;
    var v=ta.value,pos=ta.selectionStart;
    if(ta.selectionEnd!==pos)return;
    var ls=v.lastIndexOf('\n',pos-1)+1,le=v.indexOf('\n',pos);
    if(le<0)le=v.length;
    var line=v.slice(ls,le),m=parseLine(line);
    if(!m)return;
    e.preventDefault();
    if(!m.text.trim())ta.setRangeText('',ls,le,'end');
    else ta.setRangeText('\n'+(m.plain?m.pre:m.pre+'[ ] '),le,le,'end');
  });
  var notesF=el('div','fld');
  var nl=el('label','',__('Descrição e itens'));
  nl.htmlFor='ed-notes';
  var tools=el('div','row');
  tools.append(addItem);
  notesF.append(nl,ta,tools,el('p','fld-help',__('Cada item da lista ganha um checkbox. Quando todos estiverem marcados, a tarefa é concluída sozinha. Ex: - [] Item 1')));
  var sameCount=0;
  Object.keys(state.plan).forEach(function(k){state.plan[k].forEach(function(x){if(x!==t&&sameTask(x,t))sameCount++;});});
  var rapply=document.createElement('input');
  rapply.type='checkbox';rapply.id='ed-rep';rapply.disabled=!sameCount;
  var rlab=el('label','pick');
  rlab.append(rapply,el('span','',__('Aplicar em tarefas repetidas')));
  var rwrap=el('div','');
  rwrap.append(rlab);
  var rapF=el('div','fld');
  rapF.append(el('span','lab',__('Tarefas repetidas')),rwrap,el('p','fld-help',sameCount
    ?(sameCount===1?__('Aplica cor, horário e descrição à outra tarefa com o título “{0}”, em todos os dias. O progresso de cada dia é mantido.',t.title):__('Aplica cor, horário e descrição às outras {0} tarefas com o título “{1}”, em todos os dias. O progresso de cada dia é mantido.',sameCount,t.title))
    :__('Não há outras tarefas com este título.')));
  if(pastMode){
    form.append(h,el('p','modal-note',__('Esta tarefa está em um dia que já passou e não pode ser editada. Para editá-la, passe-a para outro dia: marque abaixo um ou mais dias a partir de hoje. Uma cópia será criada em cada dia escolhido e, nela, você poderá editar tudo normalmente.')),dayF);
  }else form.append.apply(form,quick?[h,field(__('Título'),tIn,'ed-title'),field(__('Cor'),ts.el),dayF,timeF,notesF]:[h,field(__('Cor'),ts.el),dayF,timeF,notesF,rapF]);
  okBtn=modalActions(form,function(){
    var keys=db.keys();
    if(!keys.length)return;
    if(quick){var qt=tIn.value.trim().slice(0,120);if(!qt){tIn.focus();return;}t.title=qt;}
    var weeks=db.weeks(),months=db.months();
    if(pastMode){
      keys.forEach(copyTo);
      if(weeks)keys.forEach(function(k){for(var w=1;w<=weeks;w++)copyTo(keyOf(addDays(keyToDate(k),7*w)));});
      if(months)keys.forEach(function(k){for(var m=1;m<=months;m++)copyTo(monthlyKey(k,m));});
      flashKey=keys[0];
      var rvp=flashKey;
      prune();save();closeModal();
      var fkp=flashKey;
      renderBoard();
      if(view==='calendar'){flashKey=fkp;renderCalendar();flashKey=null;}
      else revealColumn(rvp);
      return;
    }
    var lockedStay=!isNew&&isLocked(f.key,t)&&keys.indexOf(f.key)>=0;
    var time=ti.value;
    if(time&&!TIME_RE.test(time))time='';
    var endTime=time&&te.value&&TIME_RE.test(te.value)&&te.value!==time?te.value:'';
    var notes=mapChecks(ta.value.replace(/\s+$/,''),function(i,cur){return cur;});
    if(lockedStay){
      /* card bloqueado que continua no mesmo dia: os itens marcados não mudam pelo editor */
      var oc=String(t.notes||'').split('\n').map(function(l){var pl=parseLine(l);return pl?pl.done:false;});
      notes=mapChecks(notes,function(i){return !!oc[i];});
    }
    t.tone=ts.get();touchPalette(t.tone);
    if(time!==(t.time||'')||endTime!==(t.endTime||''))delete t.late;
    if(time)t.time=time;else delete t.time;
    if(endTime)t.endTime=endTime;else delete t.endTime;
    if(notes)t.notes=notes;else delete t.notes;
    if(!isNew&&!lockedStay&&!(isFuture(f.key)&&!t.done)){
      var was=t.done;
      syncDone(t);
      if(!was&&t.done)fxqBoard.push({t:'done',id:t.id});
      propagateLink(t);
    }
    if(rapply.checked){
      Object.keys(state.plan).forEach(function(k){
        state.plan[k].forEach(function(o){
          if(o===t||!sameTask(o,t))return;
          o.tone=t.tone;
          if(t.time)o.time=t.time;else delete o.time;
          if(t.endTime)o.endTime=t.endTime;else delete o.endTime;
          delete o.late;
          if(t.notes)o.notes=setAllChecked(t.notes,!!o.done);else delete o.notes;
        });
      });
    }
    var origKept=isNew||keys.indexOf(f.key)>=0;
    var extra=isNew?keys.slice():keys.filter(function(k){return k!==f.key;});
    if(!origKept){
      /* o card editado passa para o primeiro dia marcado */
      f.list.splice(f.i,1);
      var first=extra.shift();
      var fl=state.plan[first]=state.plan[first]||[];
      delete t.late;
      if(t.time)fl.push(t);else fl.unshift(t);
      fxqBoard.push({t:'move',id:t.id});
      flashKey=first;
    }
    function copyTo(k){
      if(!isNew&&k<keyOf(getToday()))return;
      var list=state.plan[k]=state.plan[k]||[];
      var dup=list.some(function(x){
        return x!==t&&x.title===t.title&&(x.time||'')===(t.time||'')&&(x.endTime||'')===(t.endTime||'')&&(x.cardId||'')===(t.cardId||'');
      });
      if(dup)return;
      var c={id:uid(),title:t.title,tone:t.tone,done:false};
      if(t.cardId)c.cardId=t.cardId;
      if(t.time)c.time=t.time;
      if(t.endTime)c.endTime=t.endTime;
      if(t.notes)c.notes=setAllChecked(t.notes,false);
      if(c.time)list.push(c);else list.unshift(c);
      fxqBoard.push({t:'add',id:c.id});
    }
    extra.forEach(copyTo);
    if(weeks){
      keys.forEach(function(k){
        for(var w=1;w<=weeks;w++)copyTo(keyOf(addDays(keyToDate(k),7*w)));
      });
    }
    if(months)keys.forEach(function(k){for(var m=1;m<=months;m++)copyTo(monthlyKey(k,m));});
    if(isNew)flashKey=keys[0];
    var rv=flashKey;
    prune();save();closeModal();
    renderSwatches();
    var fk=flashKey;
    renderBoard();
    if(view==='calendar'){flashKey=fk;renderCalendar();flashKey=null;}
    else if(isNew||!origKept)revealColumn(rv);
  });
  okBtn.disabled=!db.keys().length||(quick&&!tIn.value.trim());
  openModal(form,opener,quick?tIn:(ts.el.querySelector('input:checked')||null));
}
