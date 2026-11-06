/* Mi.Día – Nuvem: sincronização e pontos do servidor */
'use strict';

var CSHADOW='planner-diario-cloudshadow-v1';
function cloudHash(x){var h=5381,i;for(i=0;i<x.length;i++)h=((h<<5)+h+x.charCodeAt(i))|0;return (h>>>0).toString(36);}
function cloudSig(r){return cloudHash(JSON.stringify(r));}
function cloudShadow(id){try{var o=JSON.parse(localStorage.getItem(CSHADOW)||'null');if(o&&o.uid===id)return o;}catch(e){}return {uid:id,t:{},c:{},s:''};}
function cloudShadowSave(o){try{localStorage.setItem(CSHADOW,JSON.stringify(o));}catch(e){}}
function gameNorm(g){g.awarded=g.awarded||{};g.daily=g.daily||{};g.perfect=g.perfect||{};g.bonus=g.bonus||{};g.hist=g.hist||[];g.ach=g.ach||{};g.streakAw=g.streakAw||{};g.weekAw=g.weekAw||{};g.plan=g.plan||{};g.planDay=g.planDay||{};g.feat=g.feat||[];g.spent=g.spent||0;g.count=g.count||0;g.since=g.since||Date.now();return g;}
function cloudMark(){
  if(cloud.applying||!cloud.user)return;
  cloud.ver++;var m=cloudMeta();m.dirty=true;cloudMetaSave(m);
  clearTimeout(cloud.timer);cloud.timer=setTimeout(function(){cloudSync(false);},1000);
}
function cloudIso(x){var d=new Date(x);return isNaN(d)?null:d.toISOString();}
function cloudRows(){
  var t=[],c=[];
  state.cards.forEach(function(x,i){c.push({id:x.id,title:x.title||'',tone:x.tone||null,pos:i});});
  Object.keys(state.plan).forEach(function(k){state.plan[k].forEach(function(x,i){
    t.push({id:x.id,day:k,card_id:x.cardId||null,title:x.title||'',tone:x.tone||null,done:!!x.done,done_at:x.done&&x.doneAt?cloudIso(x.doneAt):null,t_start:x.time||null,t_end:x.endTime||null,late:!!x.late,notes:x.notes||null,link:x.link||null,pos:i});
  });});
  return {t:t,c:c};
}
function cloudTaskOf(r){
  var t={id:r.id,title:r.title||'',tone:validTone(r.tone)?r.tone:NONE,done:!!r.done};
  if(r.card_id)t.cardId=r.card_id;
  if(r.t_start&&TIME_RE.test(r.t_start)){t.time=r.t_start;if(r.t_end&&TIME_RE.test(r.t_end)&&r.t_end>r.t_start)t.endTime=r.t_end;}
  if(r.late)t.late=true;if(r.link)t.link=r.link;if(r.notes)t.notes=r.notes;
  if(r.done&&r.done_at)t.doneAt=cloudIso(r.done_at);
  return t;
}
function cloudCk(r){if(r&&r.error)throw r.error;return r;}
function cloudSeq(arr,n,fn){var p=Promise.resolve(),i;for(i=0;i<arr.length;i+=n)(function(ch){p=p.then(function(){return fn(ch);});})(arr.slice(i,i+n));return p;}
function cloudPage(q){
  var all=[];
  function next(a){return q(a,a+999).then(function(r){cloudCk(r);var d=r.data||[];all=all.concat(d);return d.length===1000?next(a+1000):all;});}
  return next(0);
}
function cloudSettingsRow(){return {settings:{skin:look.skin,mode:look.mode,fx:look.fx!==false,doneEnd:!!look.doneEnd},palette:state.palette,tz:(function(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'America/Sao_Paulo';}catch(e){return 'America/Sao_Paulo';}})()};}
function cloudPush(sb,u,sh){
  var R=cloudRows(),set=cloudSettingsRow(),ss=cloudSig(set),p=Promise.resolve(),have={};
  if(sh.s!==ss)p=p.then(function(){return sb.from('user_settings').upsert(Object.assign({user_id:u.id},set));}).then(cloudCk).then(function(){sh.s=ss;});
  function part(tbl,rows,map){
    var dirty=rows.filter(function(r){return map[r.id]!==cloudSig(r);}),gone=Object.keys(map).filter(function(id){return !rows.some(function(r){return r.id===id;});});
    return Promise.resolve().then(function(){
      return cloudSeq(dirty,250,function(ch){
        return sb.from(tbl).upsert(ch.map(function(r){return Object.assign({user_id:u.id,deleted:false},r);}),{onConflict:'user_id,id'}).then(cloudCk).then(function(){ch.forEach(function(r){map[r.id]=cloudSig(r);});});
      });
    }).then(function(){
      return cloudSeq(gone,150,function(ch){return sb.from(tbl).update({deleted:true}).eq('user_id',u.id).in('id',ch).then(cloudCk).then(function(){ch.forEach(function(id){delete map[id];});});});
    });
  }
  return p.then(function(){return part('cards',R.c,sh.c);}).then(function(){return part('tasks',R.t,sh.t);});
}
function cloudCursor(rows,old){
  var mx=0;rows.forEach(function(r){var d=Date.parse(r.updated_at);if(d>mx)mx=d;});
  return mx?new Date(mx-5000).toISOString():old;
}
function cloudApplyCards(rows,sh){
  var R=cloudRows(),cur={},ids=[];R.c.forEach(function(r){cur[r.id]=cloudSig(r);});
  var pos={};
  rows.forEach(function(r){
    var j=-1;state.cards.forEach(function(c,i){if(c.id===r.id)j=i;});
    if(j>=0&&(sh.c[r.id]===undefined||cur[r.id]!==sh.c[r.id]))return;
    if(r.deleted){if(j>=0)state.cards.splice(j,1);delete sh.c[r.id];return;}
    var nc={id:r.id,title:r.title||'',tone:validTone(r.tone)?r.tone:NONE};pos[r.id]=r.pos;ids.push(r.id);
    if(j>=0)state.cards[j]=nc;else state.cards.push(nc);
  });
  state.cards=state.cards.map(function(c,i){return {c:c,o:pos[c.id]!=null?pos[c.id]:i,i:i};}).sort(function(a,b){return a.o-b.o||a.i-b.i;}).map(function(x){return x.c;});
  var R2=cloudRows();R2.c.forEach(function(r){if(ids.indexOf(r.id)>=0)sh.c[r.id]=cloudSig(r);});
  return ids.length;
}
function cloudApplyTasks(rows,sh){
  var idx={},R=cloudRows(),cur={},pos={},days={},ids=[],n=0;
  Object.keys(state.plan).forEach(function(k){state.plan[k].forEach(function(t){idx[t.id]=k;});});
  R.t.forEach(function(r){cur[r.id]=cloudSig(r);});
  function rm(k,id){var l=state.plan[k]||[],i;for(i=0;i<l.length;i++)if(l[i].id===id){l.splice(i,1);break;}if(!l.length)delete state.plan[k];}
  rows.forEach(function(r){
    var k=idx[r.id];
    if(k&&(sh.t[r.id]===undefined||cur[r.id]!==sh.t[r.id]))return;
    if(r.deleted){if(k){rm(k,r.id);days[k]=1;delete idx[r.id];n++;}delete sh.t[r.id];return;}
    var nt=cloudTaskOf(r);pos[r.id]=r.pos;ids.push(r.id);days[r.day]=1;n++;
    if(k&&k!==r.day){rm(k,r.id);days[k]=1;k=null;}
    var l=state.plan[r.day]||(state.plan[r.day]=[]),j=-1;
    l.forEach(function(t,i){if(t.id===r.id)j=i;});
    if(j>=0)l[j]=nt;else l.push(nt);
    idx[r.id]=r.day;
  });
  Object.keys(days).forEach(function(k){
    var l=state.plan[k];if(!l)return;
    state.plan[k]=l.map(function(t,i){return {t:t,o:pos[t.id]!=null?pos[t.id]:i,i:i};}).sort(function(a,b){return a.o-b.o||a.i-b.i;}).map(function(x){return x.t;});
  });
  var R2=cloudRows();R2.t.forEach(function(r){if(ids.indexOf(r.id)>=0)sh.t[r.id]=cloudSig(r);});
  return n;
}
function cloudApplySettings(row,sh){
  var s=row.settings||{};
  if(typeof s.skin==='string'&&SKINS.indexOf(s.skin)>=0)look.skin=s.skin;
  if(s.mode==='auto'||s.mode==='light'||s.mode==='dark')look.mode=s.mode;
  if(typeof s.fx==='boolean')look.fx=s.fx;
  if(typeof s.doneEnd==='boolean')look.doneEnd=s.doneEnd;
  var pal=[];(Array.isArray(row.palette)?row.palette:[]).forEach(function(t){if(typeof t==='string'&&validTone(t)&&t!==NONE&&pal.indexOf(t)<0)pal.push(t);});
  if(pal.length)state.palette=pal;
  saveLook();applyLook();
  sh.s=cloudSig(cloudSettingsRow());
}
function cloudPull(sb,u,m,sh){
  m.cur=m.cur||{};var chg=0;
  return cloudPage(function(a,b){return sb.from('cards').select('*').eq('user_id',u.id).gt('updated_at',m.cur.c||'1970-01-01T00:00:00Z').order('updated_at').order('id').range(a,b);}).then(function(cr){
    return cloudPage(function(a,b){return sb.from('tasks').select('*').eq('user_id',u.id).gt('updated_at',m.cur.t||'1970-01-01T00:00:00Z').order('updated_at').order('id').range(a,b);}).then(function(tr){
      cloud.applying=true;
      try{
        if(cr.length||tr.length){logCtx='mute';chg+=cloudApplyCards(cr,sh);chg+=cloudApplyTasks(tr,sh);if(chg){selectedTone=state.palette.indexOf(selectedTone)>=0?selectedTone:(state.palette[0]||NONE);save();}}
        m.cur.c=cloudCursor(cr,m.cur.c);m.cur.t=cloudCursor(tr,m.cur.t);
      }finally{cloud.applying=false;}
      return sb.from('user_settings').select('*').eq('user_id',u.id).maybeSingle();
    });
  }).then(function(r){
    cloudCk(r);var row=r.data;
    if(row&&Date.parse(row.updated_at)>(m.cur.s?Date.parse(m.cur.s):0)&&sh.s===cloudSig(cloudSettingsRow())){
      cloud.applying=true;try{cloudApplySettings(row,sh);chg++;}finally{cloud.applying=false;}
    }
    if(row)m.cur.s=row.updated_at;
    if(chg)render();
  });
}
/* estado de pontos do servidor (fonte da verdade) */
function cloudGameState(g){
  game.points=g.points;game.spent=g.spent;game.count=g.count;game.unlocked=g.unlocked;game.paidT=g.paid;game.feat=g.feat;game.srv=true;
  var ach={};Object.keys(g.ach||{}).forEach(function(k){ach[k]=Date.parse(g.ach[k])||Date.now();});game.ach=ach;
}
function cloudGameApply(g,evs,m){
  cloud.applying=true;
  try{
    if(!game.srv)game.hist.forEach(function(h){h.e=h.e||'legacy';});
    var keep=game.hist.filter(function(h){return h.e;}),seen={},mx=0;
    keep.forEach(function(h){seen[h.e]=1;});
    evs.forEach(function(e){
      var d=Date.parse(e.at);if(d>mx)mx=d;
      if(seen[e.key])return;seen[e.key]=1;
      keep.push({k:e.day,p:e.points,t:e.title||'',y:e.kind,e:e.key,a:Date.parse(e.at)||0});
      if(/^done:/.test(e.key))game.awarded[e.key.slice(5)]=Date.now();
      else if(/^p[ace]:/.test(e.key))game.plan[e.key.slice(1)]=Date.now();
      else if(/^ec:/.test(e.key))game.plan[e.key]=Date.now();
      else if(/^perfect:/.test(e.key))game.perfect[e.key.slice(8)]=1;
      else if(/^streak:/.test(e.key))game.streakAw[e.key.slice(7)]=1;
      else if(/^week:/.test(e.key))game.weekAw[e.key.slice(5)]=1;
    });
    game.hist=keep;game.bonus={};game.daily={};
    keep.forEach(function(h){if(h.y==='o'||h.y==='l')game.daily[h.k]=(game.daily[h.k]||0)+h.p;else game.bonus[h.k]=(game.bonus[h.k]||0)+h.p;});
    cloudGameState(g);
    if(mx)m.ev=new Date(mx-5000).toISOString();
  }finally{cloud.applying=false;}
  gameSave();gameSync();
}
function cloudGame(sb,u,m){
  var call=m.on?sb.rpc('game_sync'):sb.rpc('game_enable',{p_legacy:{points:game.points,spent:game.spent,count:game.count,paid:game.paidT||[],feat:game.feat||[],skin:look.skin}});
  return call.then(cloudCk).then(function(r){
    var g=r.data;m.on=true;
    return cloudPage(function(a,b){return sb.from('game_events').select('key,kind,points,day,title,at').eq('user_id',u.id).gt('at',m.ev||'1970-01-01T00:00:00Z').order('at').order('key').range(a,b);}).then(function(evs){cloudGameApply(g,evs,m);return cloudPage(function(a,b){return sb.from('game_spends').select('id,kind,key,cost,at').eq('user_id',u.id).order('at').order('id').range(a,b);}).then(function(sp){game.spendLog=sp.map(function(x){return {n:gameSpendName(x.kind,x.key),c:x.cost,a:Date.parse(x.at)||0,y:x.kind};});gameSave();if(view==='dash'||view==='profile')render();}).catch(function(){});});
  });
}
function cloudSpend(kind,key,done){
  if(!cloud.user||!navigator.onLine){gameToast(__('Sem conexão com a nuvem. Troque pontos quando estiver online.'));return;}
  cloud.sb.rpc('game_spend',{p_kind:kind,p_key:key}).then(cloudCk).then(function(r){
    cloud.applying=true;try{cloudGameState(r.data);}finally{cloud.applying=false;}
    gameSpendLog(kind,key);gameSave();gameSync();if(done)done();
  }).catch(function(e){
    var m=String(e&&e.message||e);
    gameToast(/saldo/.test(m)?__('Pontos insuficientes.'):/nivel/.test(m)?__('Nível insuficiente.'):__('Não foi possível trocar agora. Tente novamente.'));
  });
}
function cloudSync(manual){
  if(!cloud.user||cloud.busy||cloud.applying||cloud.entering)return Promise.resolve();
  cloud.busy=true;if(manual)cloudMsg(__('Sincronizando…'));
  var u=cloud.user,sb=cloud.sb,m=cloudMeta(),ver0=cloud.ver;
  if(m.uid!==u.id||m.v!==2)m={uid:u.id,v:2,cur:{},on:false};
  var sh=cloudShadow(u.id);
  return cloudPush(sb,u,sh).then(function(){return cloudPull(sb,u,m,sh);}).then(function(){return cloudGame(sb,u,m);}).then(function(){
    cloud.busy=false;m.at=Date.now();m.dirty=(ver0!==cloud.ver);cloudMetaSave(m);cloudShadowSave(sh);
    if(m.dirty){clearTimeout(cloud.timer);cloud.timer=setTimeout(function(){cloudSync(false);},1000);}
    if(manual)cloudMsg(__('Tudo sincronizado.'),false);else cloudUI();
    if(!cloud.push||Date.now()-(cloud.pushAt||0)>6*3600000)pushEnsure();
  }).catch(function(e){
    cloud.busy=false;cloudShadowSave(sh);cloudMetaSave(m);
    if(manual)cloudMsg(cloudErr(e),true);
  });
}
