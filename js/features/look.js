/* Mi.Día – Aparência: tema, modo e idioma */
'use strict';

/* ---------- Aparência: tema e modo ---------- */
var LOOK_KEY='planner-diario-look-v1';
var SKINS=['padrao','fofo','tech','glass','floresta','caderno'];
var look={skin:'padrao',mode:'auto',fx:true,notif:false,doneEnd:false,lang:LANG};
try{
  var sv=JSON.parse(localStorage.getItem(LOOK_KEY)||'{}');
  if(SKINS.indexOf(sv.skin)>=0)look.skin=sv.skin;
  if(sv.mode==='light'||sv.mode==='dark')look.mode=sv.mode;
  if(sv.fx===false)look.fx=false;
  if(sv.notif===true)look.notif=true;
  if(sv.doneEnd===true)look.doneEnd=true;
}catch(e){}
var lookEl=$('#look'),lookBtn=$('#open-look'),clockEl=$('#clock-time');
function tickClock(){
  var d=new Date(),t=pad(d.getHours())+':'+pad(d.getMinutes());
  if(document.documentElement.dataset.skin==='tech')t+=':'+pad(d.getSeconds());
  if(clockEl.textContent!==t)clockEl.textContent=t;
}
function dockSync(){
  [['open-notifs','Avisos'],['open-profile','Perfil'],['open-look','Ajustes']].forEach(function(x){var b=document.getElementById(x[0]);if(b)b.dataset.lbl=__(x[1]);});
}
function applyLook(){
  var r=document.documentElement;
  if(look.skin==='padrao')delete r.dataset.skin;else r.dataset.skin=look.skin;
  if(look.mode==='auto')delete r.dataset.mode;else r.dataset.mode=look.mode;
  if(look.fx)delete r.dataset.fx;else r.dataset.fx='off';
  document.querySelectorAll('#look [data-fx]').forEach(function(b){
    b.setAttribute('aria-pressed',String((b.dataset.fx==='on')===look.fx));
    b.disabled=!!REDUCE.matches;
  });
  $('#fx-note').textContent=REDUCE.matches?__('Seu sistema pede menos movimento, então as animações ficam desligadas.'):__('Vale para todos os temas.');
  document.querySelectorAll('#look [data-ord]').forEach(function(b){b.setAttribute('aria-pressed',String((b.dataset.ord==='end')===!!look.doneEnd));});
  document.querySelectorAll('#look [data-skin]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.skin===look.skin));});
  document.querySelectorAll('#look [data-mode]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.mode===look.mode));});
  tickClock();
  dockSync();
  gameSkins();
  syncThemeColor();
  syncNotifUI();
}
/* Barra do navegador/app acompanha o fundo do tema atual */
function syncThemeColor(){
  var m=document.querySelector('meta[name="theme-color"]');
  var c=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  if(m&&/^#[0-9a-f]{3,8}$/i.test(c))m.setAttribute('content',c);
}
function saveLook(){try{localStorage.setItem(LOOK_KEY,JSON.stringify(look));}catch(e){}cloudMark();}
/* As configurações agora são uma guia: não há mais menu flutuante para fechar. */
function closeLook(){}
function syncLangUI(){document.querySelectorAll('#lang-opts [data-lang]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.lang===LANG));});}
function buildLangUI(){
  var box=$('#lang-opts');box.textContent='';
  Object.keys(I18N.langs).forEach(function(c){var b=el('button','mode-opt',I18N.langs[c]);b.type='button';b.dataset.lang=c;box.append(b);});
  syncLangUI();
}
function setLang(l){
  if(!I18N.langs[l]||l===LANG)return;
  LANG=l;look.lang=l;saveLook();
  document.documentElement.lang=LANG;
  loadNames();applyStatic();applyCardsHidden();applyModoHidden();applyLook();render();renderNotifs();syncBell();syncLangUI();
}
lookEl.addEventListener('click',function(e){
  var lg=e.target.closest('[data-lang]');
  if(lg){setLang(lg.dataset.lang);return;}
  var fb=e.target.closest('[data-fmt]');
  if(fb){bkSetFmt(fb.dataset.fmt);return;}
  if(e.target.closest('#bk-download')){bkDownload();return;}
  if(e.target.closest('#bk-upload')){$('#bk-file').click();return;}
  var nb=e.target.closest('[data-notif]');
  if(nb){toggleNotif(nb.dataset.notif==='on');return;}
  if(e.target.closest('#notif-test')){sendNotification(__('Notificação de Mi.Día'),__('TESTE - Notificações funcionando.'),'mi-dia-teste','t');return;}
  var s=e.target.closest('.skin-opt'),m=e.target.closest('.mode-opt'),x=e.target.closest('.fx-opt:not([data-ord])'),od=e.target.closest('[data-ord]');
  var before=look.skin;
  if(s&&!gameSkinOk(s.dataset.skin,s))return;
  if(s)look.skin=s.dataset.skin;
  else if(m)look.mode=m.dataset.mode;
  else if(x&&!REDUCE.matches)look.fx=x.dataset.fx==='on';
  else if(od)look.doneEnd=od.dataset.ord==='end';
  else return;
  saveLook();applyLook();
  if(od){save();render();}
  if(s&&look.skin!==before){
    var r=s.getBoundingClientRect();
    fxBurst(r.left+r.width/2,r.top+r.height/2,'theme');
  }else if(x&&look.fx){fxMiniAt(x);}
});
setInterval(function(){if(!document.hidden)tickClock();},1000);
document.addEventListener('visibilitychange',function(){if(!document.hidden)tickClock();});
