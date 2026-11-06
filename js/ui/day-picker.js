/* Mi.Día – Seletor de dia */
'use strict';

/* ---------- Seletor de dia ---------- */
var picker=$('#picker'),pickerFor=null,pickerBtn=null;
var REP_OPTIONS=[1,2,4,8,12,26,52];
function monthlyKey(k,m){
  var d=keyToDate(k),y=d.getFullYear(),mo=d.getMonth()+m,dim=new Date(y,mo+1,0).getDate();
  return keyOf(new Date(y,mo,Math.min(d.getDate(),dim)));
}
function dayRow(type,name,key,i,tk,checked,disabled){
  var lab=el('label','pick'+(disabled?' is-off':''));
  var inp=document.createElement('input');
  inp.type=type;inp.name=name;inp.value=key;inp.checked=!!checked;inp.disabled=!!disabled;
  var d=keyToDate(key);
  lab.append(inp,el('span','pd',DOW[i]),el('span','pn',d.getDate()+' '+MES[d.getMonth()]+(key===tk?__(' · hoje'):'')));
  return lab;
}
/* Dias da semana com "Todos os dias" e "Repetir nas semanas seguintes", usado no seletor e no editor. */
/* Semana de 7 dias (seg-dom) mostrada no seletor de dias: a que contém `anchor`,
   não necessariamente a semana do quadro (relevante na visão paginada do mobile). */
/* Seletor de dias: os dias ficam marcados por data (não por posição na semana), então
   avançar a semana ou o mês só troca o que está visível — a seleção de outras semanas
   não se perde. Útil para marcar, por exemplo, uma quarta-feira de um mês futuro. */
function daysBuilder(checkedKeys,onChange,anchor,keepKeys,allowPast,lockKeys){
  var tk=keyOf(getToday());
  var selected=Object.create(null);
  checkedKeys.forEach(function(k){selected[k]=true;});
  var start=mondayOf(anchor||keyToDate(checkedKeys[0]||tk));
  var all=el('label','pick pick-all');
  var allIn=document.createElement('input');
  allIn.type='checkbox';
  all.append(allIn,el('span','',__('Todos os dias')));
  var grid=el('div','days-ed');
  var inputs=[];
  /* Navegação: setas avançam semana a semana; o dropdown pula direto para o mês. */
  var range=el('span','days-range');
  var wkBack=el('button','btn-alt sm','‹');wkBack.type='button';wkBack.setAttribute('aria-label',__('Semana anterior'));
  var wkFwd=el('button','btn-alt sm','›');wkFwd.type='button';wkFwd.setAttribute('aria-label',__('Próxima semana'));
  var toToday=el('button','btn-alt sm',__('Hoje'));toToday.type='button';
  var monthSel=document.createElement('select');
  monthSel.className='days-month';
  monthSel.setAttribute('aria-label',__('Ir para o mês'));
  var baseMonth=new Date(getToday().getFullYear(),getToday().getMonth(),1);
  for(var mo=-24;mo<=36;mo++){
    var md=new Date(baseMonth.getFullYear(),baseMonth.getMonth()+mo,1);
    var opt=document.createElement('option');
    opt.value=String(mo);
    opt.textContent=__('my|{0} de {1}',cap(MES_LONG[md.getMonth()]),md.getFullYear());
    monthSel.append(opt);
  }
  monthSel.addEventListener('change',function(){
    var md=new Date(baseMonth.getFullYear(),baseMonth.getMonth()+(+monthSel.value),1);
    start=mondayOf(md);rebuild();
  });
  var navRow1=el('div','days-nav-row');
  navRow1.append(wkBack,range,wkFwd);
  var navRow2=el('div','days-nav-row');
  navRow2.append(monthSel,toToday);
  var nav=el('div','days-nav');
  nav.append(navRow1,navRow2);
  function syncAll(){
    var en=inputs.filter(function(r){return !r.disabled;});
    var n=en.filter(function(r){return r.checked;}).length;
    allIn.disabled=!en.length;
    allIn.checked=!!en.length&&n===en.length;
    allIn.indeterminate=n>0&&n<en.length;
  }
  function sync(){syncAll();if(onChange)onChange(Object.keys(selected).length);}
  function rebuild(){
    grid.textContent='';
    inputs=[];
    var b=addDays(start,6),lbl;
    if(start.getFullYear()!==b.getFullYear())lbl=start.getDate()+' '+MES[start.getMonth()]+' '+start.getFullYear()+' – '+b.getDate()+' '+MES[b.getMonth()]+' '+b.getFullYear();
    else if(start.getMonth()!==b.getMonth())lbl=start.getDate()+' '+MES[start.getMonth()]+' – '+b.getDate()+' '+MES[b.getMonth()];
    else lbl=start.getDate()+' – '+b.getDate()+' '+MES[b.getMonth()];
    range.textContent=lbl;
    for(var i=0;i<7;i++){
      var d=addDays(start,i),k=keyOf(d);
      /* dias passados não recebem cards (exceto o dia onde o card editado já está) */
      var past=!allowPast&&k<tk&&!(keepKeys&&keepKeys.indexOf(k)>=0);
      var lock=!!(lockKeys&&lockKeys.indexOf(k)>=0);
      var row=dayRow('checkbox','pk',k,i,tk,lock||(!!selected[k]&&!past),past||lock);
      var inp=row.querySelector('input');
      inp.addEventListener('change',function(e){
        if(e.target.checked)selected[e.target.value]=true;else delete selected[e.target.value];
        sync();
      });
      inputs.push(inp);
      grid.append(row);
    }
    toToday.disabled=keyOf(start)===keyOf(mondayOf(getToday()));
    var off=(start.getFullYear()-baseMonth.getFullYear())*12+(start.getMonth()-baseMonth.getMonth());
    if(monthSel.querySelector('option[value="'+off+'"]'))monthSel.value=String(off);
    syncAll();
  }
  allIn.addEventListener('change',function(){
    inputs.forEach(function(r){if(r.disabled)return;r.checked=allIn.checked;if(allIn.checked)selected[r.value]=true;else delete selected[r.value];});
    sync();
  });
  wkBack.addEventListener('click',function(){start=addDays(start,-7);rebuild();});
  wkFwd.addEventListener('click',function(){start=addDays(start,7);rebuild();});
  toToday.addEventListener('click',function(){start=mondayOf(getToday());rebuild();});
  var rl=el('label','pick');
  var rep=document.createElement('input');
  rep.type='checkbox';
  rl.append(rep,el('span','',__('Repetir nas semanas seguintes')));
  var sub=el('div','pick-sub');
  sub.hidden=true;
  var sel=document.createElement('select');
  sel.setAttribute('aria-label',__('Quantidade de semanas'));
  REP_OPTIONS.forEach(function(n){
    var o=document.createElement('option');
    o.value=n;o.textContent=__(n===1?__('{0} semana'):__('{0} semanas'),n);
    if(n===12)o.selected=true;
    sel.append(o);
  });
  sub.append(el('span','',__('Repetir por')),sel);
  var mrl=el('label','pick'),mrep=document.createElement('input');
  mrep.type='checkbox';mrl.append(mrep,el('span','',__('Repetir todo mês no mesmo dia')));
  var msub=el('div','pick-sub');msub.hidden=true;
  var msel=document.createElement('select');msel.setAttribute('aria-label',__('Quantidade de meses'));
  [2,3,6,12,24].forEach(function(n){var o=document.createElement('option');o.value=n;o.textContent=__(n===1?'{0} mês':'{0} meses',n);if(n===12)o.selected=true;msel.append(o);});
  msub.append(el('span','',__('Repetir por')),msel);
  rep.addEventListener('change',function(){sub.hidden=!rep.checked;if(rep.checked){mrep.checked=false;msub.hidden=true;}});
  mrep.addEventListener('change',function(){msub.hidden=!mrep.checked;if(mrep.checked){rep.checked=false;sub.hidden=true;}});
  rebuild();
  if(onChange)onChange(Object.keys(selected).length);
  return {
    all:all,grid:grid,nav:nav,repeat:rl,sub:sub,mrepeat:mrl,msub:msub,months:function(){return mrep.checked?+msel.value:0;},allIn:allIn,
    keys:function(){return Object.keys(selected);},
    weeks:function(){return rep.checked?+sel.value:0;}
  };
}
function closePicker(){
  if(picker.hidden)return;
  picker.hidden=true;pickerFor=null;
}
document.addEventListener('pointerdown',function(e){
  if(!picker.hidden&&!picker.contains(e.target)&&!e.target.closest('button.add'))closePicker();
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'&&!picker.hidden){
    var b=pickerBtn;
    closePicker();
    if(b&&document.contains(b))b.focus();
  }
});
window.addEventListener('resize',closePicker);
