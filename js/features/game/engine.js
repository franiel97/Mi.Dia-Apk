/* Mi.Día – Gamificação: pontos, conquistas e sequências */
'use strict';

/* ---------- Gamificação (regras em js/rules) ---------- */
var GM=window.GAME||{enabled:false},GKEY='planner-diario-game-v1',game={points:0,count:0,awarded:{},daily:{},perfect:{},bonus:{},hist:[],spent:0,unlocked:null,ach:{},streakAw:{},weekAw:{},since:Date.now(),plan:{},planDay:{},feat:[]};
try{var rg=JSON.parse(localStorage.getItem(GKEY)||'null');if(rg&&typeof rg.points==='number'){game=rg;game.awarded=game.awarded||{};game.daily=game.daily||{};game.perfect=game.perfect||{};game.bonus=game.bonus||{};game.hist=game.hist||[];game.spent=game.spent||0;game.ach=game.ach||{};game.streakAw=game.streakAw||{};game.weekAw=game.weekAw||{};game.plan=game.plan||{};game.planDay=game.planDay||{};game.feat=game.feat||[];game.since=game.since||Date.now();game.count=game.count||0;}}catch(e){}
function gameOn(){return !!(GM&&GM.enabled&&GM.levels&&GM.levels.length);}
function gameSave(){
  var lim=Date.now()-90*864e5;Object.keys(game.awarded).forEach(function(k){if(game.awarded[k]<lim)delete game.awarded[k];});
  if(game.hist.length>400&&!game.srv)game.hist=game.hist.slice(-400);
  try{localStorage.setItem(GKEY,JSON.stringify(game));}catch(e){}
  cloudMark();
}
function gameIdx(pts){var r=0;GM.levels.forEach(function(l,i){if(pts>=l.min)r=i;});return r;}
function gameBal(){return game.points-game.spent;}
function gameBonus(y,p,t,k){game.points+=p;game.bonus[k]=(game.bonus[k]||0)+p;game.hist.push({a:Date.now(),k:k,p:p,t:t,y:y});}
function gamePlan(key,y,title){
  if(!gameOn()||game.plan[key]||!GM.planCap)return;
  var pts=GM.points[y==='pc'?'create':(y==='pa'?'addDay':'edit')];if(!pts)return;
  var tk=keyOf(getToday()),used=game.planDay[tk]||0,p=Math.min(pts,GM.planCap-used);
  game.plan[key]=Date.now();
  if(p<=0)return;
  game.planDay[tk]=used+p;gameBonus(y,p,title,tk);game.dirty=true;
}
function gamePlanEnd(){
  if(!game.dirty)return;game.dirty=false;
  var lim=Date.now()-60*864e5;Object.keys(game.plan).forEach(function(k){if(game.plan[k]<lim)delete game.plan[k];});
  gameAch();gameSave();gameSync();
}
function gameStreakOf(){return typeof dashStreak==='function'?dashStreak():0;}
function gameAch(){
  if(!GM.achievements)return;
  var c=game.count,st=gameStreakOf(),C={c1:c>=1,c10:c>=10,c50:c>=50,c100:c>=100,s7:st>=7,s30:st>=30,wk:Object.keys(game.weekAw).length>0,th:!!(game.paidT&&game.paidT.length)};
  var n=0;
  GM.achievements.forEach(function(a){
    if(game.ach[a.id]||!C[a.id])return;
    game.ach[a.id]=Date.now();
    setTimeout(function(){gameToast(__('Conquista: {0} {1}',a.icon,__(a.name)));},900+n*3800);n++;
    logAdd('p','Conquista desbloqueada: {0}',[a.name]);
  });
}
function gameCheck(){
  if(!gameOn())return;
  var tk=keyOf(getToday()),m=mondayOf(addDays(getToday(),-7)),mk=keyOf(m),end=addDays(m,6),got=false;
  if(!game.weekAw[mk]&&end.getTime()+864e5>game.since){
    var n=0,late=0;
    for(var i=0;i<7;i++){var k=keyOf(addDays(m,i));(state.plan[k]||[]).forEach(function(t){n++;if(!t.done&&isLate(k,t))late++;});}
    game.weekAw[mk]=1;
    if(n>=GM.perfectDay.minTasks&&!late){gameBonus('w',GM.points.weekClean,'',tk);got=true;gameToast(__('Semana sem atrasos! +{0} pontos',GM.points.weekClean));}
  }
  var b0=game.points;gameAch();
  if(got||b0!==game.points){gameSave();gameSync();}else gameSave();
}
function gameToast(msg){
  var t=el('div','game-toast',msg);t.setAttribute('role','status');document.body.append(t);
  setTimeout(function(){t.classList.add('out');},3200);setTimeout(function(){t.remove();},3700);
}
function gameDone(id,x){
  if(!gameOn()||game.awarded[id]||x.k>keyOf(getToday()))return;
  var now=new Date(),tk=keyOf(getToday()),due=x.endTime||x.time,late=x.k<tk;
  if(!late&&x.k===tk&&due){var q=due.split(':');late=(now.getHours()*60+now.getMinutes())>(+q[0]*60+(+q[1]||0));}
  var before=gameIdx(game.points),used=game.daily[tk]||0,base=late?GM.points.late:GM.points.onTime;
  var pts=Math.max(0,Math.min(base,(GM.dailyCap||1e9)-used));
  game.awarded[id]=Date.now();game.count++;game.points+=pts;game.daily[tk]=used+pts;game.hist.push({a:Date.now(),k:tk,p:pts,t:x.title,y:late?'l':'o'});
  var L=state.plan[tk]||[];
  if(x.k===tk&&!game.perfect[tk]&&L.length>=GM.perfectDay.minTasks&&L.every(function(t){return t.done;})){
    game.perfect[tk]=1;game.points+=GM.points.perfectDay;game.bonus[tk]=(game.bonus[tk]||0)+GM.points.perfectDay;game.hist.push({a:Date.now(),k:tk,p:GM.points.perfectDay,y:'p'});gameToast(__('Dia perfeito! +{0} pontos',GM.points.perfectDay));gameFx('perfect');
  }
  var nl=String(x.notes||'').split('\n').filter(function(l){var q=parseLine(l);return q&&!q.plain;}).length;
  if(nl>=2&&GM.points.checklist)gameBonus('k',GM.points.checklist,x.title,tk);
  var TL=state.plan[tk]||[];
  if(!game.streakAw[tk]&&TL.length&&TL.every(function(t){return t.done;})){
    game.streakAw[tk]=1;var sn=gameStreakOf();
    if(sn>=GM.streak.from){gameBonus('s',GM.points.streak,String(sn),tk);if(sn%7===0)gameBonus('s',GM.points.streakWeek,String(sn),tk);gameToast('🔥 '+__('Sequência de {0} dias',sn));}
  }
  var after=gameIdx(game.points);
  gameAch();gameSave();gameSync();
  var gb=$('#game-btn');if(gb){gb.classList.remove('bump');void gb.offsetWidth;gb.classList.add('bump');}
  if(after>before){var lv=GM.levels[after];setTimeout(function(){gameFx('level',lv);},game.perfect[tk]?1400:200);}
  else if(pts>0)gameFx('pts',pts);
}
