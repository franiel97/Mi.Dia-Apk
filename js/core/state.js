/* Mi.Día – Estado e persistência local */
'use strict';

/* ---------- Estado e persistência ---------- */
function seed(){
  var cards=[
    {id:uid(),title:'Beber água',tone:'azul'},
    {id:uid(),title:'Limpar a casa',tone:'verde'},
    {id:uid(),title:'Alimentar os gatos',tone:'amarelo'},
    {id:uid(),title:'Fazer Almoço',tone:'laranja'},
    {id:uid(),title:'Fazer Janta',tone:'rosa'}
  ];
  var days=weekDays(),plan={};
  function put(i,c,done,time){
    var k=keyOf(days[i]);
    var t={id:uid(),cardId:c.id,title:c.title,tone:c.tone,done:!!done};
    if(time)t.time=time;
    (plan[k]=plan[k]||[]).push(t);
  }
  put(0,cards[4],false,'07:30');put(0,cards[1],true,'18:00');put(1,cards[3],false,'09:00');put(2,cards[2]);put(4,cards[1]);
  put((getToday().getDay()+6)%7,cards[0]);
  return {v:2,cards:cards,plan:plan,palette:TONE_IDS.slice()};
}
function load(){
  try{
    var raw=localStorage.getItem(KEY);
    if(raw){
      var o=JSON.parse(raw);
      if(o&&Array.isArray(o.cards)&&o.plan&&typeof o.plan==='object'){
        o.cards.forEach(function(c){if(!validTone(c.tone))c.tone=NONE;});
        var byTitle=Object.create(null);
        o.cards.forEach(function(c){if(!(c.title in byTitle))byTitle[c.title]=c.id;});
        Object.keys(o.plan).forEach(function(k){
          if(!Array.isArray(o.plan[k])){delete o.plan[k];return;}
          o.plan[k].forEach(function(t){
            if(!validTone(t.tone))t.tone=NONE;
            if(!t.cardId&&byTitle[t.title])t.cardId=byTitle[t.title];
            if(typeof t.notes!=='string')delete t.notes;
            if(t.time&&!TIME_RE.test(t.time))delete t.time;
            if(!t.time||!t.endTime||!TIME_RE.test(t.endTime)||t.endTime<=t.time)delete t.endTime;
            t.late=!!t.late;
            if(!t.late)delete t.late;
          });
        });
        if(o.v!==2){
          /* dados antigos: exibiam os cards com horário primeiro, depois os sem horário */
          Object.keys(o.plan).forEach(function(k){
            var l=o.plan[k];
            var tm=l.filter(function(x){return x.time;}).sort(function(a,b){return a.time<b.time?-1:(a.time>b.time?1:0);});
            o.plan[k]=tm.concat(l.filter(function(x){return !x.time;}));
          });
          o.v=2;
        }
        var hadPal=Array.isArray(o.palette);
        var pal=[];
        (Array.isArray(o.palette)?o.palette:[]).forEach(function(t){
          var v=typeof t==='string'?t.toLowerCase():'';
          if(validTone(v)&&v!==NONE&&pal.indexOf(v)<0)pal.push(v);
        });
        if(!hadPal)TONE_IDS.forEach(function(id){if(pal.indexOf(id)<0)pal.push(id);});
        o.palette=pal;
        return o;
      }
    }
  }catch(e){}
  var s=seed();
  try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){}
  return s;
}
var state=load();
