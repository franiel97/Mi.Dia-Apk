/* Mi.Día – Logs de ações */
'use strict';

/* ---------- Logs de ações ---------- */
var LOG_KEY='planner-diario-logs-v1',LOG_MAX=500,logs=[],logCtx=null,logSnap={},logCards={};
try{var rl=JSON.parse(localStorage.getItem(LOG_KEY)||'[]');if(Array.isArray(rl))logs=rl.filter(function(n){return n&&typeof n.msg==='string'&&typeof n.ts==='number';});}catch(e){logs=[];}
function logAdd(type,msg,a){
  logs.unshift({ts:Date.now(),type:type,msg:msg,a:a||[]});
  if(logs.length>LOG_MAX)logs.length=LOG_MAX;
  try{localStorage.setItem(LOG_KEY,JSON.stringify(logs));}catch(e){}
}
function logTake(){
  var m={};
  Object.keys(state.plan).forEach(function(k){state.plan[k].forEach(function(t){m[t.id]={k:k,title:t.title,done:!!t.done,time:t.time||'',endTime:t.endTime||'',sig:[t.title,t.time||'',t.endTime||'',t.notes||'',t.tone||'',t.link||'',k].join('\u0001'),link:t.link||''};});});
  return m;
}
function logTakeC(){var m={};state.cards.forEach(function(c){m[c.id]=c.title;});return m;}
function kfmt(k){var p=k.split('-');return p[2]+'/'+p[1]+'/'+p[0];}
function logDiff(){
  var n=logTake(),nc=logTakeC(),ctx=logCtx;logCtx=null;
  if(ctx!=='mute'){
    var oldLinks={};Object.keys(logSnap).forEach(function(i){if(logSnap[i].link)oldLinks[logSnap[i].link]=1;});
    Object.keys(n).forEach(function(i){
      var x=n[i],o=logSnap[i];
      if(!o){if(!(x.link&&oldLinks[x.link]))logAdd('a','Tarefa adicionada ao dia {0}: “{1}”',[kfmt(x.k),x.title]);gamePlan('a:'+i,'pa',x.title);}
      else if(x.done&&!o.done){logAdd('f','Tarefa concluída: “{0}”',[x.title]);gameDone(i,x);}
      else if(x.sig!==o.sig){logAdd('e','Tarefa editada: “{0}”',[x.title]);gamePlan('e:'+i+':'+keyOf(getToday()),'pe',x.title);}
    });
    Object.keys(logSnap).forEach(function(i){if(!n[i])logAdd('r','Tarefa removida do dia {0}: “{1}”',[kfmt(logSnap[i].k),logSnap[i].title]);});
    Object.keys(nc).forEach(function(i){
      if(!(i in logCards)){logAdd('c','Tarefa criada: “{0}”',[nc[i]]);gamePlan('c:'+i,'pc',nc[i]);}
      else if(nc[i]!==logCards[i]){logAdd('e','Tarefa editada: “{0}”',[nc[i]]);gamePlan('ec:'+i+':'+keyOf(getToday()),'pe',nc[i]);}
    });
    Object.keys(logCards).forEach(function(i){if(!(i in nc))logAdd('d','Tarefa excluída: “{0}”',[logCards[i]]);});
    gamePlanEnd();
  }
  logSnap=n;logCards=nc;
}
logSnap=logTake();logCards=logTakeC();
selectedTone=state.palette[0]||NONE;
/* Ordem do dia = ordem da lista. Os cards com horário se ordenam entre si pelo horário, mas ficam
   nas posições que já ocupam; os sem horário ficam onde foram colocados (até entre os com horário). */
