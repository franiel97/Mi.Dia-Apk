/* Mi.Día – Ações: criar tarefa e card */
'use strict';

/* ---------- Ações ---------- */
function keyToDate(k){var p=k.split('-');return new Date(+p[0],+p[1]-1,+p[2]);}
function newTask(c,time){
  var t={id:uid(),cardId:c.id,title:c.title,tone:c.tone,done:false};
  if(time&&TIME_RE.test(time))t.time=time;
  return t;
}

function createCard(){
  var input=$('#card-title'),title=input.value.trim();
  if(!title){input.focus();return;}
  var card={id:uid(),title:title,tone:selectedTone};
  state.cards.push(card);
  fxqTray.push({t:'new',id:card.id});
  touchPalette(selectedTone);
  save();renderTray();renderSwatches();
  input.value='';
  input.focus();
}
$('#new-card').addEventListener('submit',function(e){e.preventDefault();});
$('#new-card .primary').addEventListener('click',function(e){e.preventDefault();createCard();});
$('#card-title').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.isComposing){e.preventDefault();createCard();}});
$('#tones').addEventListener('click',function(e){
  var x=e.target.closest('button.sw-del');
  if(!x)return;
  e.preventDefault();e.stopPropagation();
  var r=x.getBoundingClientRect();
  fxBurst(r.left+r.width/2,r.top+r.height/2,'remove');
  deleteTone(x.dataset.tone);
});
$('#tones').addEventListener('change',function(e){
  var t=e.target;
  if(t.name==='tone'){
    if(t.checked){selectedTone=t.value;fxMiniAt(t.closest('.sw'));}
  }else if(t.id==='new-color'){
    var hex=t.value.toLowerCase();
    if(!validTone(hex))return;
    selectedTone=hex;
    fxMiniAt(t.closest('.sw'));
    touchPalette(hex);
    save();renderSwatches();
  }
});
