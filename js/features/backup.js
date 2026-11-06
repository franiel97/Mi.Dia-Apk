/* Mi.Día – Backup: baixar e enviar dados */
'use strict';

/* ---------- Backup: baixar e enviar cards e configurações (JSON ou XML) ---------- */
var BK_APP='mi-dia',BK_VER=1,bkFmt='json';
var TASK_STR=['id','cardId','tone','time','endTime','link'],TASK_BOOL=['done','late'];
function bkStatus(msg,kind){var s=$('#bk-status');s.textContent=msg||'';s.className='look-note bk-status'+(kind?' '+kind:'');}
function bkSetFmt(f){
  bkFmt=f==='xml'?'xml':'json';
  document.querySelectorAll('#backup [data-fmt]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.fmt===bkFmt));});
}
function bkSyncButtons(){$('#bk-download').disabled=!($('#bk-planner').checked||$('#bk-settings').checked);}
$('#bk-planner').addEventListener('change',bkSyncButtons);
$('#bk-settings').addEventListener('change',bkSyncButtons);

function xmlEsc(s){
  return String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function bkCollect(wantPlanner,wantSettings){
  var out={};
  if(wantPlanner)out.planner={v:state.v||2,cards:state.cards,plan:state.plan,palette:state.palette};
  if(wantSettings)out.settings={skin:look.skin,mode:look.mode,animations:look.fx!==false,doneEnd:!!look.doneEnd,notifications:look.notif===true,view:mainView};
  return out;
}
function bkToJson(data,when){
  return JSON.stringify({app:BK_APP,version:BK_VER,exportedAt:when,planner:data.planner,settings:data.settings},null,2);
}
function bkToXml(data,when){
  var x=['<?xml version="1.0" encoding="UTF-8"?>','<midia app="'+BK_APP+'" version="'+BK_VER+'" exportedAt="'+when+'">'];
  if(data.planner){
    var p=data.planner;
    x.push('  <planner v="'+(p.v||2)+'">','    <cards>');
    p.cards.forEach(function(c){x.push('      <card id="'+xmlEsc(c.id)+'" tone="'+xmlEsc(c.tone)+'"><title>'+xmlEsc(c.title)+'</title></card>');});
    x.push('    </cards>','    <plan>');
    Object.keys(p.plan).sort().forEach(function(k){
      x.push('      <day date="'+xmlEsc(k)+'">');
      p.plan[k].forEach(function(t){
        var a='';
        TASK_STR.forEach(function(n){if(t[n]!=null&&t[n]!=='')a+=' '+n+'="'+xmlEsc(t[n])+'"';});
        TASK_BOOL.forEach(function(n){if(t[n])a+=' '+n+'="true"';});
        x.push('        <task'+a+'><title>'+xmlEsc(t.title)+'</title>'+(t.notes?'<notes>'+xmlEsc(t.notes)+'</notes>':'')+'</task>');
      });
      x.push('      </day>');
    });
    x.push('    </plan>','    <palette>');
    p.palette.forEach(function(t){x.push('      <tone>'+xmlEsc(t)+'</tone>');});
    x.push('    </palette>','  </planner>');
  }
  if(data.settings){
    var s=data.settings;
    x.push('  <settings>','    <skin>'+xmlEsc(s.skin)+'</skin>','    <mode>'+xmlEsc(s.mode)+'</mode>',
      '    <animations>'+(s.animations?'on':'off')+'</animations>','    <doneEnd>'+(s.doneEnd?'on':'off')+'</doneEnd>','    <notifications>'+(s.notifications?'on':'off')+'</notifications>',
      '    <view>'+xmlEsc(s.view||'board')+'</view>','  </settings>');
  }
  x.push('</midia>');
  return x.join('\n');
}
function bkDownload(){
  var wp=$('#bk-planner').checked,ws=$('#bk-settings').checked;
  if(!wp&&!ws)return;
  var data=bkCollect(wp,ws),now=new Date(),when=now.toISOString();
  var body=bkFmt==='xml'?bkToXml(data,when):bkToJson(data,when);
  var name='mi-dia-'+keyOf(now)+'-'+pad(now.getHours())+pad(now.getMinutes())+'.'+bkFmt;
  var blob=new Blob([body],{type:bkFmt==='xml'?'application/xml':'application/json'});
  var url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=name;
  document.body.append(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(url);},4000);
  logAdd('b','Backup baixado: {0}',[name]);
  bkStatus(__('Arquivo gerado: {0}',name),'ok');
}

/* leitura */
function xmlKid(el,name){
  var c=el.children;
  for(var i=0;i<c.length;i++)if(c[i].nodeName===name)return c[i];
  return null;
}
function xmlKids(el,name){return Array.prototype.filter.call(el.children,function(c){return c.nodeName===name;});}
function bkFromXml(text){
  var doc=new DOMParser().parseFromString(text,'application/xml');
  if(doc.getElementsByTagName('parsererror').length)throw new Error(__('O arquivo XML está inválido.'));
  var r=doc.documentElement;
  if(!r||r.nodeName!=='midia'||r.getAttribute('app')!==BK_APP)throw new Error(__('Este arquivo não é um backup do Mi.Día.'));
  var out={},pe=xmlKid(r,'planner');
  if(pe){
    var cards=[],plan={},palette=[],ce=xmlKid(pe,'cards'),pl=xmlKid(pe,'plan'),pa=xmlKid(pe,'palette');
    if(ce)xmlKids(ce,'card').forEach(function(c){
      var t=xmlKid(c,'title');
      cards.push({id:c.getAttribute('id')||'',tone:c.getAttribute('tone')||'',title:t?t.textContent:''});
    });
    if(pl)xmlKids(pl,'day').forEach(function(d){
      var k=d.getAttribute('date')||'',list=[];
      xmlKids(d,'task').forEach(function(te){
        var o={},ti=xmlKid(te,'title'),no=xmlKid(te,'notes');
        TASK_STR.forEach(function(n){var v=te.getAttribute(n);if(v!=null)o[n]=v;});
        TASK_BOOL.forEach(function(n){o[n]=te.getAttribute(n)==='true';});
        o.title=ti?ti.textContent:'';
        if(no)o.notes=no.textContent;
        list.push(o);
      });
      plan[k]=(plan[k]||[]).concat(list);
    });
    if(pa)xmlKids(pa,'tone').forEach(function(t){palette.push(t.textContent.trim());});
    out.planner={v:parseInt(pe.getAttribute('v'),10)||2,cards:cards,plan:plan,palette:pa?palette:undefined};
  }
  var se=xmlKid(r,'settings');
  if(se){
    var tx=function(n){var e=xmlKid(se,n);return e?e.textContent.trim():undefined;};
    out.settings={skin:tx('skin'),mode:tx('mode'),
      animations:tx('animations')===undefined?undefined:tx('animations')!=='off',
      doneEnd:tx('doneEnd')===undefined?undefined:tx('doneEnd')==='on',
      notifications:tx('notifications')===undefined?undefined:tx('notifications')==='on',
      view:tx('view')};
  }
  return out;
}
function bkFromJson(text){
  var o;
  try{o=JSON.parse(text);}catch(e){throw new Error(__('O arquivo JSON está inválido.'));}
  if(!o||typeof o!=='object'||o.app!==BK_APP)throw new Error(__('Este arquivo não é um backup do Mi.Día.'));
  return {planner:o.planner,settings:o.settings};
}
function bkCleanPlanner(p){
  if(!p||typeof p!=='object'||!Array.isArray(p.cards)||!p.plan||typeof p.plan!=='object')throw new Error(__('As tarefas do arquivo estão em formato inválido.'));
  var seen={},cards=[],plan={},seenT={},pal=[],tasks=0;
  p.cards.forEach(function(c){
    if(!c||typeof c.title!=='string'||!c.title.trim())return;
    var id=(typeof c.id==='string'&&c.id&&!seen[c.id])?c.id:uid();
    seen[id]=1;
    cards.push({id:id,title:c.title.trim().slice(0,120),tone:validTone(c.tone)?c.tone:NONE});
  });
  Object.keys(p.plan).forEach(function(k){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||!Array.isArray(p.plan[k]))return;
    var list=[];
    p.plan[k].forEach(function(t){
      if(!t||typeof t.title!=='string'||!t.title.trim())return;
      var id=(typeof t.id==='string'&&t.id&&!seenT[t.id])?t.id:uid();
      seenT[id]=1;
      var o={id:id,title:t.title.trim().slice(0,120),tone:validTone(t.tone)?t.tone:NONE,done:t.done===true};
      if(typeof t.cardId==='string'&&t.cardId)o.cardId=t.cardId;
      if(typeof t.time==='string'&&TIME_RE.test(t.time)){
        o.time=t.time;
        if(typeof t.endTime==='string'&&TIME_RE.test(t.endTime)&&t.endTime>t.time)o.endTime=t.endTime;
      }
      if(t.late===true)o.late=true;
      if(typeof t.link==='string'&&/^[A-Za-z0-9_-]{1,40}$/.test(t.link))o.link=t.link;
      if(typeof t.notes==='string'&&t.notes.trim())o.notes=t.notes.slice(0,5000);
      list.push(o);tasks++;
    });
    if(list.length)plan[k]=list;
  });
  var hasPal=Array.isArray(p.palette);
  (hasPal?p.palette:[]).forEach(function(t){
    var v=typeof t==='string'?t.toLowerCase():'';
    if(validTone(v)&&v!==NONE&&pal.indexOf(v)<0)pal.push(v);
  });
  if(!hasPal)TONE_IDS.forEach(function(id){pal.push(id);});
  return {cards:cards,plan:plan,palette:pal,tasks:tasks,days:Object.keys(plan).length};
}
function bkCleanSettings(s){
  if(!s||typeof s!=='object')return null;
  var o={},n=0;
  if(SKINS.indexOf(s.skin)>=0){o.skin=s.skin;n++;}
  if(s.mode==='auto'||s.mode==='light'||s.mode==='dark'){o.mode=s.mode;n++;}
  if(typeof s.animations==='boolean'){o.fx=s.animations;n++;}
  if(typeof s.doneEnd==='boolean'){o.doneEnd=s.doneEnd;n++;}
  if(typeof s.notifications==='boolean'){o.notif=s.notifications;n++;}
  if(s.view==='board'||s.view==='calendar'){o.view=s.view;n++;}
  return n?o:null;
}
function bkParse(text){
  var t=String(text).replace(/^﻿/,'').trim();
  if(!t)throw new Error(__('O arquivo está vazio.'));
  var raw=t.charAt(0)==='<'?bkFromXml(t):bkFromJson(t);
  var d={planner:raw.planner?bkCleanPlanner(raw.planner):null,settings:bkCleanSettings(raw.settings)};
  if(!d.planner&&!d.settings)throw new Error(__('O arquivo não tem tarefas nem configurações para importar.'));
  return d;
}
function bkApply(d,replace){
  if(d.planner){
    var p=d.planner;
    if(replace){
      state.cards=p.cards;state.plan=p.plan;state.palette=p.palette;
    }else{
      var ids={},tids={};
      state.cards.forEach(function(c){ids[c.id]=1;});
      p.cards.forEach(function(c){if(!ids[c.id])state.cards.push(c);});
      Object.keys(state.plan).forEach(function(k){state.plan[k].forEach(function(t){tids[t.id]=1;});});
      Object.keys(p.plan).forEach(function(k){
        var l=state.plan[k]=state.plan[k]||[];
        p.plan[k].forEach(function(t){if(!tids[t.id])l.push(t);});
      });
      p.palette.forEach(function(t){if(state.palette.indexOf(t)<0)state.palette.push(t);});
    }
    state.v=2;
    selectedTone=state.palette[0]||NONE;
  }
  if(d.settings){
    var s=d.settings;
    if(s.skin)look.skin=s.skin;
    if(s.mode)look.mode=s.mode;
    if(typeof s.fx==='boolean')look.fx=s.fx;
    if(typeof s.doneEnd==='boolean')look.doneEnd=s.doneEnd;
    if(typeof s.notif==='boolean')look.notif=s.notif;
    if(s.view){mainView=s.view;saveView();}
    saveLook();applyLook();
  }
  save();
  render();
}
var SKIN_NAMES={padrao:'Padrão',fofo:'Fofinho',tech:'Tech',glass:'Translúcido',floresta:'Floresta',caderno:'Caderno'},MODE_NAMES={auto:'automático',light:'claro',dark:'escuro'};
function bkAskImport(d,fileName){
  var parts=[];
  if(d.planner)parts.push(__('{0} na lista e {1} em {2}',plural(d.planner.cards.length,__('tarefa'),__('tarefas')),plural(d.planner.tasks,__('tarefa'),__('tarefas')),plural(d.planner.days,__('dia'),__('dias'))));
  if(d.settings){
    var s=d.settings,c=[];
    if(s.skin)c.push(__('tema {0}',__(SKIN_NAMES[s.skin])));
    if(s.mode)c.push(__('modo {0}',__(MODE_NAMES[s.mode])));
    if(typeof s.fx==='boolean')c.push(s.fx?__('animações ligadas'):__('animações desligadas'));
    if(typeof s.notif==='boolean')c.push(s.notif?__('notificações ativadas'):__('notificações desativadas'));
    parts.push(__('configurações ({0})',c.join(', ')));
  }
  confirmDialog({
    title:__('Importar arquivo?'),
    message:__('“{0}” contém {1}.',fileName,parts.join(__(' e '))),
    options:d.planner?[{id:'replace',label:__('Substituir as tarefas atuais (desmarque para mesclar)'),checked:true,help:__('Ao mesclar, as tarefas que já existem neste aparelho são mantidas e apenas as novas são adicionadas.')}]:[],
    okLabel:__('Importar'),
    danger:false,
    opener:$('#bk-upload'),
    onConfirm:function(v){
      try{
        logCtx='mute';bkApply(d,!!v.replace);logCtx=null;logSnap=logTake();logCards=logTakeC();logAdd('b','Backup importado: {0}',[fileName]);
        bkStatus(__('Importação concluída: {0}.',parts.join(__(' e '))),'ok');
      }catch(e){bkStatus(__('Não foi possível importar: {0}',e.message),'err');}
    }
  });
}
$('#bk-file').addEventListener('change',function(e){
  var f=e.target.files&&e.target.files[0];
  e.target.value='';
  if(!f)return;
  if(f.size>5*1024*1024){bkStatus(__('O arquivo é grande demais (máx. 5 MB).'),'err');return;}
  var rd=new FileReader();
  rd.onerror=function(){bkStatus(__('Não foi possível ler o arquivo.'),'err');};
  rd.onload=function(){
    try{bkAskImport(bkParse(rd.result),f.name);bkStatus('');}
    catch(err){bkStatus(err.message,'err');}
  };
  rd.readAsText(f);
});
bkSyncButtons();
