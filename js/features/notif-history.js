/* Mi.Día – Histórico de notificações */
'use strict';

/* ---------- Histórico de notificações recebidas ---------- */
var NLOG_KEY='planner-diario-notiflog-v1',NLOG_MAX=100;
var nlog=[];
try{var rawLog=JSON.parse(localStorage.getItem(NLOG_KEY)||'[]');if(Array.isArray(rawLog))nlog=rawLog.filter(function(n){return n&&typeof n.title==='string'&&typeof n.ts==='number';});}catch(e){nlog=[];}
function saveNlog(){try{localStorage.setItem(NLOG_KEY,JSON.stringify(nlog));}catch(e){}}
function unreadCount(){return nlog.filter(function(n){return !n.read;}).length;}
function logNotif(title,body,kind){
  nlog.unshift({id:uid(),ts:Date.now(),title:title,body:body,kind:kind||'t',read:false});
  if(nlog.length>NLOG_MAX)nlog.length=NLOG_MAX;
  saveNlog();
  if(view==='notifs')renderNotifs();else syncBell();
}
function syncBell(){
  var n=unreadCount(),b=$('#bell-badge'),btn=$('#open-notifs');
  b.hidden=!n;
  b.textContent=n>9?'9+':String(n);
  btn.classList.toggle('has-new',n>0);
  btn.setAttribute('aria-label',n?__(n===1?__('Notificações ({0} nova)'):__('Notificações ({0} novas)'),n):__('Notificações'));
}
function fmtNotifTime(ts){
  var d=new Date(ts),hm=pad(d.getHours())+':'+pad(d.getMinutes());
  return keyOf(d)===keyOf(getToday())?__('Hoje {0}',hm):d.getDate()+' '+MES[d.getMonth()]+' '+hm;
}
function renderNotifs(){
  var list=$('#nf-list');
  list.textContent='';
  $('#nf-count').textContent=nlog.length===1?__('1 notificação'):nlog.length<=89?__('{0} notificações',nlog.length):__('{0} notificações. (Ao chegar em 100 as notificações mais antigas serão excluídas automaticamente)',nlog.length);
  $('#nf-clear').hidden=!nlog.length;
  if(!nlog.length){
    list.append(el('p','empty',notifActive()?__('Nenhuma notificação recebida ainda.'):__('Nenhuma notificação recebida ainda. Ative o envio de notificações em Configurações.')));
  }
  nlog.forEach(function(n){
    var it=el('div','nf-item'+(n.kind==='e'?' end':'')+(n.read?'':' unread'));
    var main=el('div','nf-main');
    main.append(el('div','nf-t',n.title),el('div','nf-b',n.body));
    var tm=document.createElement('time');
    tm.dateTime=new Date(n.ts).toISOString();
    tm.textContent=fmtNotifTime(n.ts);
    it.append(main,tm);
    list.append(it);
  });
  /* ao ver a lista, tudo passa a lido (o destaque dessa abertura continua visível) */
  if(view==='notifs'&&unreadCount()){nlog.forEach(function(n){n.read=true;});saveNlog();}
  syncBell();
  renderLogs();
}
$('#nf-clear').addEventListener('click',function(){nlog=[];saveNlog();renderNotifs();});
var nfTab='n',lgSel={},lgOpen=false,LGT=[['all','Todos'],['c','Criação'],['a','Adicionada ao dia'],['e','Edição'],['d','Exclusão'],['r','Removida do dia'],['f','Conclusão'],['p','Pontos'],['b','Backup'],['l','Limpeza']];
function fmtFull(ts){var d=new Date(ts);return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()+' '+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());}
function renderLogs(){
  Array.prototype.forEach.call(document.querySelectorAll('.nf-tabs button'),function(b){b.classList.toggle('on',b.dataset.nt===nfTab);});
  $('#nf-pane').hidden=nfTab!=='n';$('#lg-pane').hidden=nfTab!=='l';
  if(nfTab!=='l')return;
  var ty=$('#lg-types'),nsel=Object.keys(lgSel).length;ty.textContent='';
  var tg=el('button','lg-tg'+(nsel?' on':''),__('Status')+(nsel?' ('+nsel+')':'')+' ▾');tg.type='button';tg.dataset.lo='1';ty.append(tg);
  if(lgOpen){
    var pn=el('div','lg-panel');
    LGT.slice(1).forEach(function(x){var lb=el('label','lg-opt'),cb=document.createElement('input');cb.type='checkbox';cb.checked=!!lgSel[x[0]];cb.dataset.lt=x[0];lb.append(cb,document.createTextNode(__(x[1])));pn.append(lb);});
    ty.append(pn);
  }
  var f=$('#lg-from').value,t=$('#lg-to').value,fa=f?new Date(f).getTime():0,tb=t?new Date(t).getTime()+59999:Infinity;
  var rows=logs.filter(function(l){return (!nsel||lgSel[l.type])&&l.ts>=fa&&l.ts<=tb;});
  $('#lg-count').textContent=__('{0} registros',rows.length);
  $('#lg-clear').hidden=!logs.length;
  var list=$('#lg-list');list.textContent='';
  if(!rows.length)list.append(el('p','empty',__('Nenhum registro encontrado.')));
  var nm={};LGT.forEach(function(x){nm[x[0]]=x[1];});
  rows.forEach(function(l){
    var it=el('div','nf-item'),m=el('div','nf-main');
    var tg=el('span','lg-tag',__(nm[l.type]||''));
    var tx=el('div','nf-t');tx.append(tg,document.createTextNode(__.apply(null,[l.msg].concat(l.a))));
    var tm=el('time',null,fmtFull(l.ts));tm.dateTime=new Date(l.ts).toISOString();
    m.append(tx);it.append(m,tm);list.append(it);
  });
}
$('#notifs').addEventListener('click',function(e){
  var b=e.target.closest('[data-nt]');if(b){nfTab=b.dataset.nt;renderLogs();return;}
  b=e.target.closest('[data-lo]');if(b){lgOpen=!lgOpen;renderLogs();return;}
  b=e.target.closest('[data-lt]');if(b){if(b.checked)lgSel[b.dataset.lt]=1;else delete lgSel[b.dataset.lt];renderLogs();return;}
  if(lgOpen&&!e.target.closest('.lg-panel')){lgOpen=false;renderLogs();}
  if(e.target.closest('#lg-reset')){lgSel={};$('#lg-from').value='';$('#lg-to').value='';renderLogs();}
  if(e.target.closest('#lg-clear')){logs=[];try{localStorage.setItem(LOG_KEY,'[]');}catch(x){}renderLogs();}
});
$('#lg-from').addEventListener('change',renderLogs);$('#lg-to').addEventListener('change',renderLogs);
