/* Mi.Día – Inicialização do app (sempre por último) */
'use strict';

buildLangUI();applyModoHidden();
applyLook();
render();
centerToday();
syncBell();
checkNotify();
if(fxOn()&&skinNow()==='tech')setTimeout(fxScan,250);
setTimeout(function(){var seen=false;try{seen=!!localStorage.getItem('planner-diario-tut-v1');}catch(e){}if(document.documentElement.classList.contains('lp'))return;if(!seen)openTutorial(true);else gameIntro();},500);
gameSync();gameCheck();cloudInit();
document.addEventListener('visibilitychange',function(){if(!document.hidden)gameCheck();});
route(true);
setInterval(function(){route(false);},60000);
document.addEventListener('visibilitychange',function(){if(!document.hidden)route(true);});
window.addEventListener('hashchange',function(){route(false);});
var hm=/^#dia=(\d{4}-\d{2}-\d{2})$/.exec(location.hash);
if(hm){openDayFromNotif(hm[1]);history.replaceState(null,'',location.pathname+location.search);}
