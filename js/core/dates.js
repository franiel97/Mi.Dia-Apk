/* Mi.Día – Constantes, datas e estado de navegação */
'use strict';

var KEY='planner-diario-v1';
var TONE_IDS=['amarelo','rosa','azul','verde','lilas','laranja'];
var DOW0=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],DOW_LONG0=['segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado','domingo'],MES0=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'],MES_LONG0=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
var DOW,DOW_LONG,MES,MES_LONG;
function loadNames(){
  function tr(s){return __(s);}
  DOW=DOW0.map(tr);DOW_LONG=DOW_LONG0.map(tr);MES=MES0.map(tr);MES_LONG=MES_LONG0.map(tr);
}
loadNames();
function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}

function $(s){return document.querySelector(s);}
function el(tag,cls,text){var n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n;}
function pad(n){return String(n).padStart(2,'0');}
function uid(){return Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);}
function getToday(){return new Date();}
function keyOf(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());}
function addDays(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);}
function mondayOf(d){return addDays(d,-((d.getDay()+6)%7));}

var weekOffset=0;
/* Visão do quadro: tela grande mostra a semana inteira; telas menores mostram só
   alguns dias por vez, começando no dia de hoje, com os botões de navegação
   avançando página a página. */
function daysPerPage(){
  var w=window.innerWidth;
  if(w<640)return 1;
  if(w<900)return 3;
  if(w<1180)return 4;
  return 7;
}
function startOfDay(d){return addDays(d,0);}
function startOfMonth(d){return new Date(d.getFullYear(),d.getMonth(),1);}
var dayCursor=startOfDay(getToday());
function visibleDays(){
  var n=daysPerPage();
  if(n>=7)return weekDays();
  var out=[];
  for(var i=0;i<n;i++)out.push(addDays(dayCursor,i));
  return out;
}
function navStep(dir){
  if(daysPerPage()>=7)weekOffset+=dir;
  else dayCursor=addDays(dayCursor,dir*daysPerPage());
  closePicker();fxqBoard.push({t:'week'});render();
}
/* Visualização: Quadro (dias) ou Calendário (mês) */
var VIEW_KEY='planner-diario-view-v1';
var view='board';
try{var svv=localStorage.getItem(VIEW_KEY);if(svv==='board'||svv==='calendar'||svv==='dash')view=svv;}catch(e){}
var mainView=view;
function saveView(){try{localStorage.setItem(VIEW_KEY,mainView);}catch(e){}}
var monthCursor=startOfMonth(getToday());
var selectedTone='amarelo';
var flashKey=null;
var timeSig=null;
var TIME_RE=/^([01]\d|2[0-3]):[0-5]\d$/;
function timeOf(key,hm){var p=key.split('-'),h=hm.split(':');return new Date(+p[0],+p[1]-1,+p[2],+h[0],+h[1]);}
/* Fim de uma tarefa: horário de término se houver, senão o próprio início */
function dueTime(key,t){return timeOf(key,t.endTime||t.time);}
/* Está atrasado agora, ignorando o que já foi memorizado em t.late */
function computeLateNow(key,t){return !!t.time&&!t.done&&new Date()>=dueTime(key,t);}
/* Entre o início e o término, ainda não concluído: fica destacado (sem ser atraso) */
function isOngoingNow(key,t){return !!t.time&&!!t.endTime&&!t.done&&!computeLateNow(key,t)&&new Date()>=timeOf(key,t.time);}
