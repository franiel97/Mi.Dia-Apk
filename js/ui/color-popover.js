/* Mi.Día – Seletor rápido de cor */
'use strict';

function renderSwatches(){
  var fs=$('#tones'),anchor=fs.querySelector('.sw-new');
  fs.querySelectorAll('.sw[data-tone]').forEach(function(n){n.remove();});
  [NONE].forEach(function(tone){   /* só "sem cor"; as demais cores ficam no pop-up do + */
    var lab=el('label',tone===NONE?'sw sw-none':'sw');
    lab.dataset.tone=tone;
    lab.title=toneName(tone);
    tintNode(lab,tone);
    var inp=document.createElement('input');
    inp.type='radio';
    inp.name='tone';
    inp.value=tone;
    inp.id='tone-'+(tone===NONE||isPreset(tone)?tone:'c'+tone.slice(1));
    inp.checked=tone===selectedTone;
    lab.append(inp,el('span','sr',toneName(tone)));
    if(tone!==NONE)lab.append(delBtn(tone));
    if(tone!==NONE&&!isPreset(tone))lab.classList.add('sw-custom');
    fs.insertBefore(lab,anchor);
  });
  var cs=selectedTone!==NONE;
  anchor.classList.toggle('has-sel',cs);
  if(cs)anchor.style.setProperty('--selc',selectedTone);else anchor.style.removeProperty('--selc');
}
/* No celular, o seletor (+) abre um pop-up com todas as cores; as personalizadas só aparecem lá */
var MQ_MOBILE=window.matchMedia?window.matchMedia('(max-width:640px)'):{matches:false};
$('#tones').addEventListener('click',function(e){
  var n=e.target.closest('.sw-new');
  if(!n)return;
  e.preventDefault();e.stopPropagation();
  openColorPopover(n,{get:function(){return selectedTone;},set:function(v){selectedTone=v;renderSwatches();}});
},true);
/* ... e no desktop abre um menu suspenso ao lado do botão, no estilo do menu de filtros */
var colorPop=null,colorPopSt=null;
function closeColorPop(){
  if(!colorPop)return;
  var st=colorPopSt;
  colorPop.remove();colorPop=null;colorPopSt=null;
  modalRedraw=st.prev;
  document.removeEventListener('pointerdown',colorPopOutside,true);
  window.removeEventListener('keydown',colorPopKey,true);
  window.removeEventListener('resize',closeColorPop);
  window.removeEventListener('scroll',closeColorPop,true);
  st.ctx.set(st.ts.get());   /* sincroniza a seleção final com quem abriu (tela principal ou editor) */
}
function colorPopOutside(e){
  if(colorPop&&!colorPop.contains(e.target)&&!e.target.closest('.sw-new'))closeColorPop();
}
function colorPopKey(e){if(e.key==='Escape'){e.stopPropagation();closeColorPop();}}
/* Seletor de cores único (tela principal e editores): botão + abre este pop-up com todas as cores e o seletor embutido */
function openColorPopover(anchor,ctx){
  if(colorPop){closeColorPop();return;}
  var pop=el('div','color-pop');
  pop.setAttribute('role','dialog');pop.setAttribute('aria-label',__('Cores das tarefas'));
  var prev=modalRedraw;
  var ts=toneSet(ctx.get(),{inline:true,pickerOnly:!!ctx.pickerOnly,onPick:function(hex){ctx.set(hex);}});
  ts.el.addEventListener('change',function(){ctx.set(ts.get());});
  if(ctx.pickerOnly)pop.append(el('p','pop-title',__('Nova cor')),ts.el);
  else pop.append(el('p','pop-title',__('Cores das tarefas')),ts.el,el('p','fld-help',__('Escolha uma cor, crie outra no seletor acima ou remova as que não usa mais.')));
  document.body.append(pop);
  popX(pop,closeColorPop);
  colorPop=pop;colorPopSt={ts:ts,ctx:ctx,prev:prev};
  if(!MQ_MOBILE.matches){
    var r=anchor.getBoundingClientRect(),pw=pop.offsetWidth,ph=pop.offsetHeight;
    var left=Math.min(Math.max(8,r.left),window.innerWidth-pw-8);
    var top=r.bottom+8;
    if(top+ph>window.innerHeight-8)top=Math.max(8,r.top-ph-8);
    pop.style.left=left+'px';pop.style.top=top+'px';
  }
  document.addEventListener('pointerdown',colorPopOutside,true);
  window.addEventListener('keydown',colorPopKey,true);
  window.addEventListener('resize',closeColorPop);
  window.addEventListener('scroll',closeColorPop,true);
}

(function(){var row=$('#cal-dow');DOW.forEach(function(n){row.append(el('span','cal-dow-n',n));});})();
