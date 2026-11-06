/* Mi.Día – Dash: estatísticas */
'use strict';

/* ---------- Dash: estatísticas de tarefas ---------- */
/* Atrasadas: não concluídas com a tag de atraso. Não concluídas: sem concluir e ainda no prazo. Pendente = não concluídas + atrasadas. */
var dashSt={period:'week',status:'all',cur:getToday(),bDay:getToday(),bMon:startOfMonth(getToday()),bYear:getToday().getFullYear()};
function dashCount(fromKey,toKey){
  var r={c:0,l:0,n:0,total:0};
  Object.keys(state.plan).forEach(function(k){
    if(k<fromKey||k>toKey)return;
    state.plan[k].forEach(function(t){r.total++;if(t.done)r.c++;else if(isLate(k,t))r.l++;else r.n++;});
  });
  return r;
}
function dashRange(p,d){
  if(p==='year')return [d.getFullYear()+'-01-01',d.getFullYear()+'-12-31'];
  if(p==='month')return [keyOf(new Date(d.getFullYear(),d.getMonth(),1)),keyOf(new Date(d.getFullYear(),d.getMonth()+1,0))];
  if(p==='week'){var m=mondayOf(d);return [keyOf(m),keyOf(addDays(m,6))];}
  return [keyOf(d),keyOf(d)];
}
function dashShown(){
  var s=dashSt.status;
  return {c:s==='all'||s==='done',l:s==='all'||s==='late'||s==='pending',n:s==='all'||s==='open'||s==='pending'};
}
function dashLabel(){
  var p=dashSt.period,d=dashSt.cur;
  if(p==='year')return String(d.getFullYear());
  if(p==='month')return __('my|{0} de {1}',cap(MES_LONG[d.getMonth()]),d.getFullYear());
  if(p==='day')return dayLabel(d);
  var a=mondayOf(d),b=addDays(a,6);
  if(a.getFullYear()!==b.getFullYear())return a.getDate()+' '+MES[a.getMonth()]+' '+a.getFullYear()+' – '+b.getDate()+' '+MES[b.getMonth()]+' '+b.getFullYear();
  if(a.getMonth()!==b.getMonth())return a.getDate()+' '+MES[a.getMonth()]+' – '+b.getDate()+' '+MES[b.getMonth()]+' '+b.getFullYear();
  return a.getDate()+' – '+b.getDate()+' '+MES[b.getMonth()]+' '+b.getFullYear();
}
function dashMove(kind,step){
  var t=getToday();
  if(kind==='main'){
    var p=dashSt.period,d=dashSt.cur;
    if(step===0)dashSt.cur=t;
    else if(p==='year')dashSt.cur=new Date(d.getFullYear()+step,0,1);
    else if(p==='month')dashSt.cur=new Date(d.getFullYear(),d.getMonth()+step,1);
    else if(p==='week')dashSt.cur=addDays(d,7*step);
    else dashSt.cur=addDays(d,step);
  }else if(kind==='day')dashSt.bDay=step===0?t:addDays(dashSt.bDay,step);
  else if(kind==='month')dashSt.bMon=step===0?startOfMonth(t):new Date(dashSt.bMon.getFullYear(),dashSt.bMon.getMonth()+step,1);
  else dashSt.bYear=step===0?t.getFullYear():dashSt.bYear+step;
  renderDash();
}
function dashNav(kind,mid){
  var row=el('div','dash-nav');
  var p=el('button','btn-alt sm','‹'),n=el('button','btn-alt sm','›'),h=el('button','btn-alt sm',__('Hoje'));
  p.type=n.type=h.type='button';
  p.dataset.dk=n.dataset.dk=h.dataset.dk=kind;
  p.dataset.ds='-1';n.dataset.ds='1';h.dataset.ds='0';
  p.setAttribute('aria-label',__('Anterior'));n.setAttribute('aria-label',__('Próximo'));
  row.append(p,mid,n,h);
  return row;
}
function dashYearSel(d){
  var y=getToday().getFullYear(),lo=Math.min(y-5,d.getFullYear()),hi=Math.max(y+5,d.getFullYear());
  Object.keys(state.plan).forEach(function(k){var yy=+k.slice(0,4);if(yy<lo)lo=yy;if(yy>hi)hi=yy;});
  var sel=document.createElement('select');
  sel.id='dash-y';sel.setAttribute('aria-label',__('Ano'));
  for(var i=lo;i<=hi;i++){var o=document.createElement('option');o.value=i;o.textContent=String(i);if(i===d.getFullYear())o.selected=true;sel.append(o);}
  return sel;
}
function dashMonthSel(d){
  var sel=document.createElement('select');
  sel.id='dash-m';sel.setAttribute('aria-label',__('Mês'));
  MES_LONG.forEach(function(m,i){var o=document.createElement('option');o.value=i;o.textContent=cap(m);if(i===d.getMonth())o.selected=true;sel.append(o);});
  return sel;
}
function dashTiles(c,sh,gk){
  var g=el('div','dash-tiles');
  [['l','Atrasadas',c.l],['n','Não concluídas',c.n],['c','Concluídas',c.c]].forEach(function(x){
    if(!sh[x[0]])return;
    var t=el('button','dash-tile t-'+x[0]);
    t.type='button';t.dataset.go=x[0];t.dataset.gk=gk;t.title=__('Ver no Quadro');
    t.append(el('span','dash-num',String(x[2])),el('span','dash-cap',__(x[1])));
    g.append(t);
  });
  return g;
}
function dashPbar(c){
  var bar=el('div','dash-pbar');
  [['c',c.c],['n',c.n],['l',c.l]].forEach(function(x){
    if(!x[1]||!c.total)return;
    var sp=el('span','seg-'+x[0]);sp.style.width=(x[1]*100/c.total)+'%';bar.append(sp);
  });
  return bar;
}
/* dia para onde o Quadro vai ao clicar: hoje, se estiver no período; senão o primeiro dia */
function dashGoKey(r){var tk=keyOf(getToday());return(tk>=r[0]&&tk<=r[1])?tk:r[0];}
function dashShift(p,d,n){
  if(p==='year')return new Date(d.getFullYear()+n,0,1);
  if(p==='month')return new Date(d.getFullYear(),d.getMonth()+n,1);
  if(p==='week')return addDays(d,7*n);
  return addDays(d,n);
}
/* dias seguidos (até hoje) em que tudo o que havia foi concluído; dias sem tarefas não quebram a sequência */
function dashStreak(){
  var d=getToday(),n=0;
  for(var i=0;i<400;i++){
    var list=state.plan[keyOf(addDays(d,-i))]||[];
    if(!list.length)continue;
    if(list.every(function(t){return t.done;})){n++;continue;}
    if(i===0)continue;
    break;
  }
  return n;
}
function dashWeekdays(r){
  var a=[];for(var i=0;i<7;i++)a.push({t:0,c:0,l:0});
  Object.keys(state.plan).forEach(function(k){
    if(k<r[0]||k>r[1])return;
    var w=(keyToDate(k).getDay()+6)%7;
    state.plan[k].forEach(function(t){a[w].t++;if(t.done)a[w].c++;else if(isLate(k,t))a[w].l++;});
  });
  var best=-1,worst=-1;
  a.forEach(function(x,i){
    if(x.t&&(best<0||x.c/x.t>a[best].c/a[best].t||(x.c/x.t===a[best].c/a[best].t&&x.t>a[best].t)))best=i;
    if(x.l&&(worst<0||x.l>a[worst].l))worst=i;
  });
  return {a:a,best:best,worst:worst};
}
function dashByTime(r){
  var w={c:0,n:0,l:0},o={c:0,n:0};
  Object.keys(state.plan).forEach(function(k){
    if(k<r[0]||k>r[1])return;
    state.plan[k].forEach(function(t){
      if(t.time){if(t.done)w.c++;else if(isLate(k,t))w.l++;else w.n++;}
      else{if(t.done)o.c++;else o.n++;}
    });
  });
  var box=el('div','dash-sec');
  box.append(el('p','look-title',__('Tarefas com e sem horário')));
  function row(lab,parts,txt){
    var tot=0,r2=el('div','dash-tone'),bar=el('div','dash-pbar');
    parts.forEach(function(x){tot+=x[1];});
    parts.forEach(function(x){if(!x[1])return;var sp=el('span','seg-'+x[0]);sp.style.width=(x[1]*100/tot)+'%';bar.append(sp);});
    r2.append(el('span','dash-tn',lab),bar,el('span','dash-tc',txt));
    box.append(r2);
  }
  row(__('Com horário'),[['c',w.c],['n',w.n],['l',w.l]],__('{0} concluídas · {1} não concluídas · {2} atrasadas',w.c,w.n,w.l));
  row(__('Sem horário'),[['c',o.c],['n',o.n]],__('{0} concluídas · {1} não concluídas',o.c,o.n));
  return box;
}
