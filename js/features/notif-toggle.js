/* Mi.Día – Ligar e desligar notificações */
'use strict';

function toggleNotif(on){
  if(window.MidiaNativeNotifications&&window.MidiaNativeNotifications.isNative){
    var native=window.MidiaNativeNotifications;
    if(!on){look.notif=false;saveLook();native.cancelAll();syncNotifUI();return;}
    native.requestPermission().then(function(granted){
      look.notif=!!granted;saveLook();syncNotifUI();
      if(granted){
        checkNotify();syncSchedule();
        native.checkExact().then(function(ok){
          if(ok)return;
          var msg='Para os avisos tocarem no horário certo, libere "Alarmes e lembretes" para o Mi.Día. Abrir a configuração agora?';
          if(window.confirm(typeof __==='function'?__(msg):msg))native.requestExact();
        });
      }
    });
    return;
  }
  if(!on){look.notif=false;saveLook();syncNotifUI();pushOff();return;}
  if(!notifSupported()||Notification.permission==='denied'){syncNotifUI();return;}
  if(Notification.permission==='granted'){look.notif=true;saveLook();syncNotifUI();checkNotify();pushEnsure();return;}
  function done(p){look.notif=(p==='granted');saveLook();syncNotifUI();if(look.notif){checkNotify();pushEnsure();}}
  try{var r=Notification.requestPermission(done);if(r&&r.then)r.then(done);}catch(e){syncNotifUI();}
}
setInterval(checkNotify,15000);
document.addEventListener('visibilitychange',function(){if(!document.hidden)checkNotify();});
