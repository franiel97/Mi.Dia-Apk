/* Mi.Día – Normalização e gravação das tarefas */
'use strict';

function normalizeDay(list){
  var slots=[],items=[];
  list.forEach(function(t,i){if(t.time){slots.push(i);items.push({t:t,i:i});}});
  items.sort(function(a,b){return a.t.time<b.t.time?-1:(a.t.time>b.t.time?1:a.i-b.i);});
  slots.forEach(function(sl,n){list[sl]=items[n].t;});
}
/* Tarefa que atravessa a meia-noite (ex.: 22:00 até 01:00): vira dois cards ligados entre si.
   O do dia vai até 23:59 e o do dia seguinte começa às 00:00. Concluir um conclui o outro. */
function splitOvernight(){
  Object.keys(state.plan).forEach(function(k){
    state.plan[k].slice().forEach(function(t){
      if(!t.time||!t.endTime||t.endTime>=t.time)return;
      var end=t.endTime;
      if(t.time<'23:59')t.endTime='23:59';else delete t.endTime;
      if(end==='00:00')return;
      if(!t.link)t.link=uid();
      var nk=keyOf(addDays(keyToDate(k),1)),nl=state.plan[nk]=state.plan[nk]||[];
      if(nl.some(function(x){return x.link===t.link;}))return;
      var c={id:uid(),title:t.title,tone:t.tone,done:false,time:'00:00',endTime:end,link:t.link};
      if(t.cardId)c.cardId=t.cardId;
      if(t.notes)c.notes=setAllChecked(t.notes,false);
      nl.unshift(c);
      if(typeof fxqBoard!=='undefined'&&fxqBoard)fxqBoard.push({t:'add',id:c.id});
    });
  });
}
/* Cards ligados: ao concluir (ou reabrir) um, o outro acompanha */
function propagateLink(t){
  if(!t.link)return;
  Object.keys(state.plan).forEach(function(k){
    state.plan[k].forEach(function(o){
      if(o===t||o.link!==t.link||!!o.done===!!t.done||(t.done&&isFuture(k)))return;
      o.done=!!t.done;
      if(o.notes&&itemStats(o.notes).total)o.notes=setAllChecked(o.notes,!!t.done);
      if(o.done&&typeof fxqBoard!=='undefined')fxqBoard.push({t:'done',id:o.id});
    });
  });
}
function hasLinked(t){
  if(!t.link)return false;
  var n=0;
  Object.keys(state.plan).forEach(function(k){state.plan[k].forEach(function(o){if(o.link===t.link)n++;});});
  return n>1;
}
/* opção "concluídas no final": mantém a ordem e leva as tarefas concluídas para o fim do dia */
function doneToEnd(list){
  var a=[],b=[],i;list.forEach(function(t){(t.done?b:a).push(t);});
  var out=a.concat(b);for(i=0;i<out.length;i++)list[i]=out[i];
}
function normalizeAll(){splitOvernight();Object.keys(state.plan).forEach(function(k){normalizeDay(state.plan[k]);if(typeof look==='object'&&look&&look.doneEnd)doneToEnd(state.plan[k]);});}
var lastDone=null;
function stampDone(){
  var now=new Date().toISOString(),nd=Object.create(null);
  Object.keys(state.plan).forEach(function(k){state.plan[k].forEach(function(t){
    if(t.done){if(!t.doneAt&&lastDone&&lastDone[t.id]===false)t.doneAt=now;}else if(t.doneAt)delete t.doneAt;
    nd[t.id]=!!t.done;
  });});
  lastDone=nd;
}
stampDone();
function save(){normalizeAll();stampDone();try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}logDiff();cloudMark();}

function findTask(id){
  var keys=Object.keys(state.plan);
  for(var a=0;a<keys.length;a++){
    var list=state.plan[keys[a]];
    for(var i=0;i<list.length;i++){
      if(list[i].id===id)return {key:keys[a],i:i,list:list,task:list[i]};
    }
  }
  return null;
}
function prune(){
  Object.keys(state.plan).forEach(function(k){if(!state.plan[k].length)delete state.plan[k];});
}
