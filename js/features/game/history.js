/* Mi.Día – Gamificação: histórico de pontos (ganhos e trocas) */
'use strict';

function gameSpendName(kind,key){
  if(kind==='feature'){var f=GM.features&&GM.features[key];return f?f.name:key;}
  return 'Tema '+(SKIN_NAMES[key]||key);
}
/* registra uma troca (nome, custo, data e hora); no modo nuvem a lista é refeita com a do servidor */
function gameSpendLog(kind,key){
  var c=0;
  if(kind==='feature'){var f=GM.features&&GM.features[key];c=f?f.cost:0;}
  else{var rl=gameThemeRule(key);c=rl?rl.cost:0;}
  (game.spendLog=game.spendLog||[]).push({n:gameSpendName(kind,key),c:c,a:Date.now(),y:kind});
}
function gameHistFmt(a,dayKey){
  if(!a){var d0=keyToDate(dayKey);return d0.getDate()+' '+MES[d0.getMonth()];}
  var d=new Date(a),p=function(n){return (n<10?'0':'')+n;};
  return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()+' · '+p(d.getHours())+':'+p(d.getMinutes());
}
function gameGainName(x){
  return x.y==='p'?__('Dia perfeito'):x.y==='s'?'🔥 '+__('Sequência de {0} dias',x.t):x.y==='w'?__('Semana sem atrasos'):x.y==='k'?__('Checklist concluído')+': '+(x.t||''):x.y==='pc'?__('Tarefa criada')+': '+(x.t||''):x.y==='pa'?__('Tarefa adicionada ao dia')+': '+(x.t||''):x.y==='pe'?__('Tarefa editada')+': '+(x.t||''):(x.t||'')+(x.y==='l'?' · '+__('fora do prazo'):'');
}
/* pop-up com abas: Ganhos e Trocas */
function gameHistPopup(opener){
  var form=document.createElement('form');form.className='mform';form.autocomplete='off';
  var h=el('h3','modal-title',__('Histórico de pontos'));h.id='modal-title';
  var sum=el('p','look-note',__('Ganhos: {0} · Gastos: {1} · Disponível: {2}',game.points,game.spent,gameBal()));
  var tabs=el('div','pf-tabs'),list=el('div','dash-items'),cur='g';
  var tg=el('button','fx-opt',__('Ganhos')),tt=el('button','fx-opt',__('Trocas'));tg.type=tt.type='button';tabs.append(tg,tt);
  function fill(){
    tg.setAttribute('aria-pressed',cur==='g');tt.setAttribute('aria-pressed',cur==='t');list.textContent='';
    var it=cur==='g'?game.hist.slice().reverse().slice(0,300):(game.spendLog||[]).slice().reverse();
    if(!it.length)list.append(el('p','look-note',cur==='g'?__('Nenhum ganho de pontos ainda.'):__('Nenhuma troca de pontos ainda.')));
    it.forEach(function(x){
      var row=el('div','dash-item');
      if(cur==='g')row.append(el('span','di-t',gameGainName(x)),el('span','di-d',gameHistFmt(x.a,x.k)+' · +'+x.p));
      else row.append(el('span','di-t',__(x.n)),el('span','di-d',gameHistFmt(x.a)+' · -'+x.c));
      list.append(row);
    });
  }
  tg.addEventListener('click',function(){cur='g';fill();});tt.addEventListener('click',function(){cur='t';fill();});fill();
  var body=el('div','modal-body');body.append(sum,tabs,list);
  var a=el('div','modal-actions'),ok=el('button','primary',__('Fechar'));ok.type='button';ok.addEventListener('click',closeModal);a.append(ok);
  form.append(h,a,body);openModal(form,opener||null,ok);
}
