/* Mi.Día – Notificações de horário */
'use strict';

/* ---------- Notificações de horário ---------- */
/* Início: 10 min antes do horário. Término: 10 min antes de o card ficar "Atrasado" (só se não concluído). */
var NOTIFY_LEAD=10*60000,NOTIFIED_KEY='planner-diario-notified-v1';
var notified={};
try{notified=JSON.parse(localStorage.getItem(NOTIFIED_KEY)||'{}')||{};}catch(e){notified={};}
function notifSupported(){return window.MidiaNativeNotifications&&window.MidiaNativeNotifications.isNative?window.MidiaNativeNotifications.isAvailable:typeof Notification!=='undefined';}
function notifPerm(){if(window.MidiaNativeNotifications&&window.MidiaNativeNotifications.isNative)return window.MidiaNativeNotifications.granted?'granted':'prompt';return notifSupported()?Notification.permission:'unsupported';}
function notifActive(){return look.notif===true&&notifPerm()==='granted';}
function saveNotified(){
  var lim=Date.now()-3*86400000;
  Object.keys(notified).forEach(function(k){if(notified[k]<lim)delete notified[k];});
  try{localStorage.setItem(NOTIFIED_KEY,JSON.stringify(notified));}catch(e){}
}
function sendNotification(title,body,tag,kind,dateKey){
  if(window.MidiaNativeNotifications&&window.MidiaNativeNotifications.isNative){
    if(!window.MidiaNativeNotifications.granted)return;
    logNotif(title,body,kind);window.MidiaNativeNotifications.notifyNow(title,body,dateKey);return;
  }
  if(!notifSupported()||Notification.permission!=='granted')return;
  logNotif(title,body,kind);
  var opts={body:body,tag:tag,icon:'icons/icon-192.png',badge:'icons/icon-192.png',data:{key:dateKey||null}};
  function direct(){
    try{var n=new Notification(title,opts);n.onclick=function(){try{window.focus();}catch(e){}n.close();openDayFromNotif(dateKey);};}catch(e){}
  }
  /* No Android (app instalado/TWA) só vale showNotification pelo service worker; new Notification() não funciona */
  if('serviceWorker' in navigator&&navigator.serviceWorker.ready){
    var fin=false,to=setTimeout(function(){if(!fin){fin=true;direct();}},2500);
    navigator.serviceWorker.ready.then(function(reg){
      if(fin)return;fin=true;clearTimeout(to);
      if(reg&&reg.showNotification){
        var o2=Object.assign({},opts,{actions:[{action:'open',title:__('Abrir')}]});
        reg.showNotification(title,o2).catch(direct);
      }else direct();
    },function(){if(!fin){fin=true;clearTimeout(to);direct();}});
  }else direct();
}

function minsLeft(ms){return Math.max(1,Math.ceil(ms/60000));}
/* Agenda dos próximos avisos (48 h) enviada ao service worker: com o app fechado o sistema pode acordá-lo (sem garantia de horário) */
var lastSched='';
function buildSchedule(){
  var now=Date.now(),horizon=now+48*3600*1000,tk=keyOf(getToday()),items=[];
  Object.keys(state.plan).forEach(function(k){
    state.plan[k].forEach(function(t){
      if(!t.time||t.done)return;
      var start=timeOf(k,t.time).getTime(),due=dueTime(k,t).getTime(),sig=t.id+'|'+t.time+'|'+(t.endTime||'');
      function add(id,at,until,title,body,kind){
        if(notified[id]||until<=now||at>horizon)return;
        items.push({id:id,at:at,until:until,title:title,body:body,tag:id,kind:kind,key:k});
      }
      add(sig+'|s',start-NOTIFY_LEAD,start,__('⏰ Realize a tarefa "{0}"',t.title),__('Horário agendado: {0}',t.time),'s');
      if(t.endTime)add(sig+'|e',Math.max(due-NOTIFY_LEAD,start),due,__('⌛ Conclua a tarefa "{0}"',t.title),__('Se ela não for concluída até {0} ela ficará em atraso.',t.endTime),'e');
      if(k>=tk)add(sig+'|l',due,due+3600000,__('😰 A tarefa "{0}" está em atraso',t.title),__('O prazo era até {0}. Conclua quando puder.',(t.endTime||t.time)),'e');
    });
  });
  return items;
}
function syncSchedule(){
  if(window.MidiaNativeNotifications&&window.MidiaNativeNotifications.isNative){
    if(!notifActive())return;
    var nativeItems=buildSchedule(),nativeSig=JSON.stringify(nativeItems);
    if(nativeSig!==lastSched){lastSched=nativeSig;window.MidiaNativeNotifications.sync(nativeItems);}
    return;
  }
  if(!notifActive()||!('serviceWorker' in navigator))return;
  var items=buildSchedule(),sig=JSON.stringify(items);
  if(sig===lastSched)return;
  lastSched=sig;
  navigator.serviceWorker.ready.then(function(reg){
    if(reg.active)reg.active.postMessage({type:'schedule',items:items});
    if(reg.periodicSync&&reg.periodicSync.register)reg.periodicSync.register('mi-dia-check',{minInterval:15*60*1000}).catch(function(){});
  }).catch(function(){});
}
/* avisos que o service worker entregou (com o app aberto ou fechado): entram no histórico e não se repetem */
function onShown(items){
  (items||[]).forEach(function(it){
    if(it&&it.id&&!notified[it.id]){notified[it.id]=Date.now();logNotif(it.title,it.body,it.kind);}
  });
  saveNotified();renderNotifs();syncBell();
}
function checkNotify(){
  if(!notifActive())return;
  var now=Date.now(),dirty=false;
  Object.keys(state.plan).forEach(function(k){
    state.plan[k].forEach(function(t){
      if(!t.time||t.done)return;
      var start=timeOf(k,t.time).getTime(),due=dueTime(k,t).getTime();
      var sig=t.id+'|'+t.time+'|'+(t.endTime||'');
      var ks=sig+'|s';
      if(!notified[ks]&&now>=start-NOTIFY_LEAD&&now<start){
        notified[ks]=now;dirty=true;
        sendNotification(__('⏰ Realize a tarefa "{0}"',t.title),__('Horário agendado: {0}',t.time),ks,'s',k);
      }
      if(t.endTime){
        var ke=sig+'|e',from=Math.max(due-NOTIFY_LEAD,start);
        if(!notified[ke]&&now>=from&&now<due){
          notified[ke]=now;dirty=true;
          sendNotification(__('⌛ Conclua a tarefa "{0}"',t.title),__('Se ela não for concluída até {0} ela ficará em atraso.',t.endTime),ke,'e',k);
        }
      }
    var kl=sig+'|l';
    if(!notified[kl]&&now>=due&&k===keyOf(getToday())){
       notified[kl]=now;dirty=true;
         sendNotification(__('😰 A tarefa "{0}" está em atraso',t.title),__('O prazo era até {0}. Conclua quando puder.',(t.endTime||t.time)),kl,'e',k);
      }
    });
  });
  if(dirty)saveNotified();
  syncSchedule();
}
function syncNotifUI(){
  var on=notifActive(),perm=notifPerm(),note='';
  document.querySelectorAll('#look [data-notif]').forEach(function(b){
    b.setAttribute('aria-pressed',String((b.dataset.notif==='on')===on));
    b.disabled=perm==='unsupported';
  });
  if(perm==='unsupported')note=__('Este navegador não oferece notificações.');
  else if(perm==='denied')note=__('As notificações estão bloqueadas. Libere nas permissões do site no navegador ou no sistema.');
  else if(on)note=(window.MidiaNativeNotifications&&window.MidiaNativeNotifications.isNative)?__('O Android agenda avisos locais 10 min antes do início e antes do prazo. Eles podem chegar com o aplicativo fechado; a precisão depende das permissões de alarmes e das otimizações de bateria do aparelho.'):__('Um aviso é enviado 10 min antes do início e outro 10 min antes da tarefa ficar atrasada (se não estiver concluída). Funciona enquanto a aba/navegador estiver aberto. No app instalado no Android, o sistema também pode entregar os avisos com o app fechado, mas sem garantia de horário exato.');
  else note=__('Ao ativar, o navegador pede a sua permissão.');
  if(!window.isSecureContext&&perm!=='unsupported')note+=__(' Abra por https:// (ou localhost) para as notificações funcionarem.');
  if(on&&window.MidiaNativeNotifications&&window.MidiaNativeNotifications.isNative&&window.MidiaNativeNotifications.exact===false)note+=(note?' ':'')+__('Alarmes exatos desativados: os avisos podem atrasar alguns minutos. Libere "Alarmes e lembretes" nas configurações do app.');
  if(on&&PUSH_KEY&&cloud&&perm==='granted')note+=(note?' ':'')+(cloud.push?__('Com sua conta na nuvem, os avisos chegam também com o app fechado.'):cloud.user?'':__('Entre na nuvem para receber avisos também com o app fechado.'));
  var n=$('#notif-note');if(n)n.textContent=note;
  var tb=$('#notif-test');if(tb)tb.hidden=!on;
}
