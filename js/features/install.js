/* Mi.Día – Instalar como app */
'use strict';

/* ---------- Instalar como app (celular) ---------- */
var installBtn=$('#install-app'),deferredInstall=null;
function isStandalone(){return (window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true;}
function isIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);}
function isMobile(){return isIOS()||/android|mobile/i.test(navigator.userAgent);}
function syncInstall(){installBtn.hidden=isStandalone()||!(deferredInstall||isMobile());}
/* Modo e Idioma começam sempre fechados (o estado vale só enquanto a página está aberta) */
var boxClosed={modo:true,lang:true};
function applyBox(id){
  var h=boxClosed[id],b=$('#'+id+'-toggle'),l=__(h?'Mostrar':'Ocultar');
  $('#'+id+'-card').classList.toggle('collapsed',h);
  b.setAttribute('aria-expanded',String(!h));b.setAttribute('aria-label',l);b.title=l;
}
function applyModoHidden(){applyBox('modo');applyBox('lang');}
['modo','lang'].forEach(function(id){
  $('#'+id+'-toggle').addEventListener('click',function(){boxClosed[id]=!boxClosed[id];applyBox(id);});
});
