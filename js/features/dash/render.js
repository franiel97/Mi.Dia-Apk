/* Mi.Día – Dash: gráficos e telas */
'use strict';

function dashBuckets(p,d){
  var out=[],i;
  if(p==='year'){for(i=0;i<12;i++){var a=new Date(d.getFullYear(),i,1);out.push({lab:MES[i],r:dashRange('month',a)});}}
  else if(p==='month'){var n=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();for(i=1;i<=n;i++){var dd=new Date(d.getFullYear(),d.getMonth(),i);out.push({lab:String(i),r:dashRange('day',dd)});}}
  else if(p==='week'){var m=mondayOf(d);for(i=0;i<7;i++){out.push({lab:DOW[i],r:dashRange('day',addDays(m,i))});}}
  return out;
}
function dashEvolution(p,d){
  var bs=dashBuckets(p,d);
  if(!bs.length)return null;
  var max=1;
  bs.forEach(function(b){b.c=dashCount(b.r[0],b.r[1]);if(b.c.total>max)max=b.c.total;});
  var box=el('div','dash-sec');
  box.append(el('p','look-title',__('Evolução')));
  var bars=el('div','dash-bars'+(bs.length>12?' dense':''));
  bs.forEach(function(b){
    var col=el('div','dash-col');
    col.title=b.lab+': '+b.c.c+'/'+b.c.total;
    if(b.c.total){col.style.cursor='pointer';col.addEventListener('click',function(){
      var k0=b.c.c?'c':(b.c.n?'n':'l'),d0=keyToDate(b.r[0]);
      dashTaskPopup(k0,b.r,true,b.r[0]===b.r[1]?dayLabel(d0):(p==='year'?MES_LONG[d0.getMonth()]+' '+d0.getFullYear():b.lab));
    });}
    var area=el('div','dash-area');
    if(b.c.total){
      var stack=el('div','dash-stack');stack.style.height=(b.c.total*100/max)+'%';
      [['c',b.c.c],['n',b.c.n],['l',b.c.l]].forEach(function(x){
        if(!x[1])return;
        var sp=el('span','seg-'+x[0]);sp.style.height=(x[1]*100/b.c.total)+'%';sp.textContent=x[1];stack.append(sp);
      });
      var bn=el('span','dash-bn');bn.append(el('small',null,__('Total')),el('b',null,String(b.c.total)));stack.append(bn);
      area.append(stack);
    }
    col.append(area,el('span','dash-xl',b.lab));
    bars.append(col);
  });
  box.append(bars);
  return box;
}
function dashKpis(p,d,r,c){
  var box=el('div','dash-kpis');
  var rate=c.total?Math.round(c.c*100/c.total):0;
  var pr=dashRange(p,dashShift(p,d,-1)),pc=dashCount(pr[0],pr[1]);
  var k1=el('div','dash-kpi');
  k1.append(el('span','dash-kv',rate+'%'),el('span','dash-cap',__('Taxa de conclusão')));
  if(pc.total){
    var diff=rate-Math.round(pc.c*100/pc.total);
    k1.append(el('span','dash-delta '+(diff>=0?'up':'down'),(diff>0?'+':'')+diff+' pp '+__('vs. período anterior')));
  }
  box.append(k1);
  var st=dashStreak(),k2=el('div','dash-kpi');
  k2.append(el('span','dash-kv','🔥 '+st),el('span','dash-cap',__(st===1?'dia seguido':'dias seguidos')));
  box.append(k2);
  if(p!=='day'){
    var w=dashWeekdays(r);
    var k3=el('div','dash-kpi');
    k3.append(el('span','dash-kv sm',w.best<0?'—':cap(DOW_LONG[w.best])),el('span','dash-cap',__('Melhor dia')));
    if(w.best>=0)k3.append(el('span','dash-delta up',Math.round(w.a[w.best].c*100/w.a[w.best].t)+'%'));
    var k4=el('div','dash-kpi');
    k4.append(el('span','dash-kv sm',w.worst<0?'—':cap(DOW_LONG[w.worst])),el('span','dash-cap',__('Dias com mais atraso')));
    if(w.worst>=0)k4.append(el('span','dash-delta down',String(w.a[w.worst].l)));
    box.append(k3,k4);
  }
  if(gameOn()){
    var gp=0;Object.keys(game.daily).forEach(function(k){if(k>=r[0]&&k<=r[1])gp+=game.daily[k];});
    Object.keys(game.bonus||{}).forEach(function(k){if(k>=r[0]&&k<=r[1])gp+=game.bonus[k];});
    var kp=el('button','dash-kpi dash-kpi-pts');kp.type='button';
    kp.append(el('span','dash-kv','⭐ '+gp),el('span','dash-cap',__('Pontos no período')));
    kp.addEventListener('click',function(){gamePtsPopup(r,gp,kp);});box.append(kp);
  }
  return box;
}
function svgEl(n,a){var e=document.createElementNS('http://www.w3.org/2000/svg',n);Object.keys(a||{}).forEach(function(k){e.setAttribute(k,a[k]);});return e;}
function renderDash(){
  var sh=dashShown();
  /* filtros: controles do período */
  var pc=$('#dash-pctl'),p=dashSt.period,d=dashSt.cur,mid;
  $('#dash-period').value=p;$('#dash-status').value=dashSt.status;
  pc.textContent='';
  if(p==='year')mid=dashYearSel(d);
  else if(p==='month'){mid=el('span','dash-mid');mid.append(dashMonthSel(d),dashYearSel(d));}
  else if(p==='week')mid=el('span','dash-lab',dashLabel());
  else{mid=document.createElement('input');mid.type='date';mid.id='dash-d';mid.value=keyOf(d);mid.setAttribute('aria-label',__('Dia'));}
  pc.append(dashNav('main',mid));
  /* gráfico de porcentagem do período escolhido */
  var ch=$('#dash-chart');ch.textContent='';
  var r2=dashRange(p,d),c2=dashCount(r2[0],r2[1]);
  var segs=[{k:'c',n:c2.c,l:'Concluídas'},{k:'n',n:c2.n,l:'Não concluídas'},{k:'l',n:c2.l,l:'Atrasadas'}].filter(function(x){return sh[x.k];});
  var sum=0;segs.forEach(function(x){sum+=x.n;});
  if(c2.total-sum>0)segs.push({k:'x',n:c2.total-sum,l:'Demais status'});
  var body=el('div','dash-chart-body');
  var svg=svgEl('svg',{viewBox:'0 0 120 120','class':'dash-donut',role:'img','aria-label':__('Tarefas por status')});
  var R=42,C=2*Math.PI*R,off=0;
  var g=svgEl('g',{transform:'rotate(-90 60 60)'});
  if(!c2.total)g.append(svgEl('circle',{cx:60,cy:60,r:R,'class':'seg-0'}));
  else segs.forEach(function(x){
    if(!x.n)return;
    var len=C*x.n/c2.total;
    var ci=svgEl('circle',{cx:60,cy:60,r:R,'class':'seg-'+x.k,'stroke-dasharray':len+' '+(C-len),'stroke-dashoffset':-off});
    var tt=svgEl('title');tt.textContent=__(x.l)+': '+x.n;ci.append(tt);
    g.append(ci);off+=len;
  });
  svg.append(g);
  var t1=svgEl('text',{x:60,y:61,'text-anchor':'middle','font-size':22,'font-weight':700});t1.textContent=String(c2.total);
  var t2=svgEl('text',{x:60,y:76,'text-anchor':'middle','font-size':9});t2.textContent=__(c2.total===1?'tarefa':'tarefas');
  svg.append(t1,t2);
  var lg=el('div','dash-legend');
  if(!c2.total)lg.append(el('p','look-note',__('Nenhuma tarefa neste período.')));
  else segs.forEach(function(x){
    var row=el('button','dash-lg');row.type='button';
    if(x.k!=='x'){row.dataset.pop=x.k;row.title=__('Ver tarefas');}
    row.append(el('span','dash-dot seg-'+x.k),el('span','',__(x.l)),el('b','',String(x.n)),el('span','pct',Math.round(x.n*100/c2.total)+'%'));
    lg.append(row);
  });
  if(c2.total){var tr=el('div','dash-lg dash-lg-total');tr.append(el('span','',__('Total de tarefas')),el('b','',String(c2.total)));lg.append(tr);}
  body.append(svg,lg);
  ch.append(el('p','look-title',__('Tarefas por status')),el('p','dash-sub',dashLabel()),dashKpis(p,d,r2,c2),body);
  var evo=dashEvolution(p,d);if(evo)ch.append(evo);
  ch.append(dashByTime(r2));
}
$('#dash').addEventListener('click',function(e){
  var pp=e.target.closest('[data-pop]');
  if(pp){dashTaskPopup(pp.dataset.pop,dashRange(dashSt.period,dashSt.cur));return;}
  var g=e.target.closest('[data-go]');
  if(g){
    var f={l:'atrasados',c:'concluidos',n:'pendentes'}[g.dataset.go];
    filters.clear();if(f)filters.add(f);
    goToDayFromCalendar(g.dataset.gk);
    return;
  }
  var b=e.target.closest('button[data-dk]');
  if(!b)return;
  dashMove(b.dataset.dk,+b.dataset.ds);
});
$('#dash').addEventListener('change',function(e){
  var t=e.target;
  if(t.id==='dash-period'){dashSt.period=t.value;renderDash();}
  else if(t.id==='dash-status'){dashSt.status=t.value;renderDash();}
  else if(t.id==='dash-y'){dashSt.cur=new Date(+t.value,dashSt.cur.getMonth(),1);renderDash();}
  else if(t.id==='dash-m'){dashSt.cur=new Date(dashSt.cur.getFullYear(),+t.value,1);renderDash();}
  else if(t.id==='dash-d'&&/^\d{4}-\d{2}-\d{2}$/.test(t.value)){dashSt.cur=keyToDate(t.value);renderDash();}
});

$('#view-toggle').addEventListener('click',function(e){
  var b=e.target.closest('button[data-view]');
  if(!b)return;
  var v=b.dataset.view;
  if(v===view){
    if(v==='settings'||v==='notifs'||v==='profile')v=mainView; /* clicar de novo volta à guia anterior */
    else return;
  }
  setView(v);
});
$('#cal-prev').addEventListener('click',function(){monthCursor=new Date(monthCursor.getFullYear(),monthCursor.getMonth()-1,1);renderCalendar();});
$('#cal-next').addEventListener('click',function(){monthCursor=new Date(monthCursor.getFullYear(),monthCursor.getMonth()+1,1);renderCalendar();});
/* Gesto de deslizar (touch) no quadro: esquerda = dia seguinte, direita = dia anterior */
(function(){
  var bd=$('#board'),sx=0,sy=0,st=0,on=false,moved=false;
  function skip(t){return !!(t&&t.closest&&t.closest('input,textarea,select,[contenteditable]'));}
  bd.addEventListener('touchstart',function(e){
    on=e.touches.length===1&&view==='board'&&!skip(e.target)&&!document.body.classList.contains('dragging');
    moved=false;if(!on)return;
    sx=e.touches[0].clientX;sy=e.touches[0].clientY;st=Date.now();
  },{passive:true});
  bd.addEventListener('touchmove',function(e){
    if(document.body.classList.contains('dragging')||e.touches.length>1)on=false;
  },{passive:true});
  bd.addEventListener('touchend',function(e){
    if(!on)return;on=false;
    if(document.body.classList.contains('dragging')||!modalBack.hidden)return;
    var t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;
    if(Date.now()-st>700||Math.abs(dx)<60||Math.abs(dy)>Math.abs(dx)*0.6)return;
    navStep(dx<0?1:-1);
  },{passive:true});
  bd.addEventListener('touchcancel',function(){on=false;},{passive:true});
})();
