/* Mi.Día – Dash: pop-ups de pontos e tarefas */
'use strict';

/* pop-up com as tarefas de um status no período */
function gamePtsPopup(r,total,opener){
  var it=game.hist.filter(function(h){return h.k>=r[0]&&h.k<=r[1];}).reverse();
  var form=document.createElement('form');form.className='mform';form.autocomplete='off';
  var h=el('h3','modal-title',__('Pontos no período')+': '+total);h.id='modal-title';
  var body=el('div','modal-body'),list=el('div','dash-items');
  if(!it.length)list.append(el('p','look-note',__('Nenhuma ação pontuada neste período.')));
  it.forEach(function(x){
    var d=keyToDate(x.k),row=el('div','dash-item');
    var nm=x.y==='p'?__('Dia perfeito'):x.y==='s'?'🔥 '+__('Sequência de {0} dias',x.t):x.y==='w'?__('Semana sem atrasos'):x.y==='k'?__('Checklist concluído')+': '+(x.t||''):x.y==='pc'?__('Tarefa criada')+': '+(x.t||''):x.y==='pa'?__('Tarefa adicionada ao dia')+': '+(x.t||''):x.y==='pe'?__('Tarefa editada')+': '+(x.t||''):(x.t||'')+(x.y==='l'?' · '+__('fora do prazo'):'');
    row.append(el('span','di-t',nm),el('span','di-d',d.getDate()+' '+MES[d.getMonth()]+' · +'+x.p));
    list.append(row);
  });
  body.append(list);
  var a=el('div','modal-actions'),ok=el('button','primary',__('Fechar'));ok.type='button';ok.addEventListener('click',closeModal);a.append(ok);
  form.append(h,a,body);openModal(form,opener||null,ok);
}
function dashTaskPopup(kind,r,tabs,ttl){
  var items=[];
  Object.keys(state.plan).forEach(function(k){
    if(k<r[0]||k>r[1])return;
    state.plan[k].forEach(function(t){
      var st=t.done?'c':(isLate(k,t)?'l':'n');
      if(tabs||st===kind)items.push({k:k,t:t,st:st});
    });
  });
  items.sort(function(a,b){return a.k<b.k?-1:a.k>b.k?1:((a.t.time||'')<(b.t.time||'')?-1:1);});
  var form=document.createElement('form');
  form.className='mform';form.autocomplete='off';
  var NM={c:'Concluídas',n:'Não concluídas',l:'Atrasadas'};
  var h=el('h3','modal-title',tabs?ttl:__(NM[kind])+' ('+items.length+')');
  h.id='modal-title';
  var list=el('div','dash-items'),tb=null;
  function fill(){
    list.textContent='';
    var sh=items.filter(function(it){return !tabs||it.st===kind;});
    if(!sh.length)list.append(el('p','look-note',__('Nenhuma tarefa neste período.')));
    sh.forEach(addItem);
    if(tb)Array.prototype.forEach.call(tb.children,function(x){x.classList.toggle('on',x.dataset.k===kind);x.setAttribute('aria-pressed',x.dataset.k===kind);});
  }
  if(tabs){
    tb=el('div','dash-tabs');
    ['c','n','l'].forEach(function(k){
      var n=items.filter(function(it){return it.st===k;}).length;
      var x=el('button','dash-tab',__(NM[k])+' ('+n+')');x.type='button';x.dataset.k=k;
      x.addEventListener('click',function(){kind=k;fill();});tb.append(x);
    });
  }
  function addItem(it){
    var b=el('button','dash-item');b.type='button';
    var dot=el('span','cal-dot');tintNode(dot,it.t.tone);
    b.append(dot,el('span','dash-id',dayLabel(keyToDate(it.k))+(it.t.time?' · '+it.t.time:'')),el('span','dash-it',it.t.title));
    b.addEventListener('click',function(){closeModal();filters.clear();goToDayFromCalendar(it.k);});
    list.append(b);
  }
  fill();
  var a=el('div','modal-actions');
  var ok=el('button','primary',__('Fechar'));ok.type='button';ok.addEventListener('click',closeModal);a.append(ok);
  var body=el('div','modal-body');body.append(h);if(tb)body.append(tb);body.append(list);
  form.append(a,body);
  openModal(form,null,ok);
}
