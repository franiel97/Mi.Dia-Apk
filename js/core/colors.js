/* Mi.Día – Cores e paleta */
'use strict';

/* ---------- Cores ---------- */
var TONE_NAMES={amarelo:'Amarelo',rosa:'Rosa',azul:'Azul',verde:'Verde',lilas:'Lilás',laranja:'Laranja'};
var MAX_PALETTE=10;
var NONE='none';
function isPreset(t){return TONE_IDS.indexOf(t)>=0;}
function validTone(t){return typeof t==='string'&&(t===NONE||isPreset(t)||/^#[0-9a-f]{6}$/.test(t));}
function toneName(t){return t===NONE?__('Sem cor'):isPreset(t)?__(TONE_NAMES[t]):__('Cor {0}',t);}
function inkFor(hex){
  function lin(c){return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);}
  var L=0.2126*lin(parseInt(hex.slice(1,3),16)/255)+0.7152*lin(parseInt(hex.slice(3,5),16)/255)+0.0722*lin(parseInt(hex.slice(5,7),16)/255);
  return L>0.2?'dark':'light';
}
function tintNode(node,tone){
  if(tone===NONE||isPreset(tone))node.classList.add('tone-'+tone);
  else node.style.setProperty('--tint',tone);
}
function applyTone(node,tone){
  tintNode(node,tone);
  if(tone!==NONE&&!isPreset(tone)){
    var ink=inkFor(tone);
    node.style.setProperty('--card-ink',ink==='dark'?'#1a2330':'#f1f4f7');
    node.dataset.ink=ink;
  }
}
/* Leva a cor para o começo da lista (mais recente) e limita o tamanho,
   descartando as personalizadas mais antigas. */
function touchPalette(tone){
  if(tone===NONE)return;
  var p=state.palette.filter(function(t){return t!==tone;});
  p.unshift(tone);
  while(p.length>MAX_PALETTE){
    var idx=-1;
    for(var i=p.length-1;i>=0;i--){if(!isPreset(p[i])){idx=i;break;}}
    if(idx<0)break;
    p.splice(idx,1);
  }
  state.palette=p;
}

var modalRedraw=null;
/* Exclui qualquer cor da paleta, inclusive as padrão. */
function deleteTone(tone){
  if(tone===NONE)return;
  state.palette=state.palette.filter(function(t){return t!==tone;});
  if(selectedTone===tone)selectedTone=state.palette[0]||NONE;
  save();renderSwatches();
  if(modalRedraw)modalRedraw(tone);
}
