/* Mi.Día – Clique na notificação do sistema */
'use strict';

/* Clique na notificação do sistema*/
function openDayFromNotif(key){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(key||'')){setView('board');return;}
  mainView='board';
  goToDayFromCalendar(key);
}
if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('message',function(e){
    var d=e.data||{};
    if(d.type==='notif-click')openDayFromNotif(d.key);
    else if(d.type==='shown-list')onShown(d.items);
  });
}
