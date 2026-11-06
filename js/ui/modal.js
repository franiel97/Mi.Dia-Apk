/* Mi.Día – Janela modal */
'use strict';

/* ---------- Editor de cards ---------- */
var modalBack=$('#modal-back'),modalEl=$('#modal'),modalOpener=null;
function closeModal(){
  closeColorPop();
  if(modalBack.hidden)return;
  modalBack.hidden=true;
  modalEl.textContent='';
  modalRedraw=null;
  var o=modalOpener;modalOpener=null;
  if(o&&document.contains(o))o.focus();
}
modalBack.addEventListener('pointerdown',function(e){if(e.target===modalBack)closeModal();});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&!modalBack.hidden){e.stopPropagation();closeModal();}
},true);
