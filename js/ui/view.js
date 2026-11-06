/* Mi.Día – Renderização geral e troca de telas */
'use strict';

function render(){
  renderHeader();renderSwatches();renderTray();renderBoard();
  if(view==='calendar')renderCalendar();
  if(view==='dash')renderDash();
  applyView();
}
function applyView(){
  var isBoard=view==='board',isCal=view==='calendar',main=isBoard||isCal;
  $('#board').hidden=!isBoard;
  $('#nav').hidden=!isBoard;
  $('#filters').hidden=!isBoard;
  $('#calendar').hidden=!isCal;
  $('#dash').hidden=view!=='dash';
  $('#tray').hidden=!main;
  $('#look').hidden=view!=='settings';
  $('#notifs').hidden=view!=='notifs';
  $('#profile').hidden=view!=='profile';
  document.querySelectorAll('#view-toggle [data-view]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.view===view));});
}
function setView(v){
  view=v;
  if(v==='board'||v==='calendar'||v==='dash'){mainView=v;saveView();}
  if(v==='calendar')renderCalendar();
  if(v==='dash')renderDash();
  if(v==='notifs')renderNotifs();
  if(v==='profile'){pfMsg=null;renderProfile();}
  applyView();
  window.scrollTo(0,0);
}
