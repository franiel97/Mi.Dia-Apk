/* Mi.Día – Gamificação: desbloqueio de temas e recursos */
'use strict';

function gameThemeRule(k){
  var v=GM.themes&&GM.themes[k];if(!v)return null;
  var o=typeof v==='number'?{cost:v,level:0}:{cost:v.cost,level:v.level||0};
  o.min=o.level&&GM.levels[o.level]?GM.levels[o.level].min:0;o.lv=GM.levels[o.level];return o;
}
function gameSkins(){
  if(typeof look==='undefined'||!GM)return;
  if(!Array.isArray(game.unlocked))game.unlocked=['padrao'];
  /* o tema que a pessoa já usa nunca fica bloqueado (vale também para quem abriu uma versão anterior que o travou) */
  var sv='padrao';try{sv=JSON.parse(localStorage.getItem(LOOK_KEY)||'{}').skin||'padrao';}catch(e){}
  var fx=false;
  if(!game.srv)[sv,look.skin].forEach(function(k){if(k&&SKIN_NAMES[k]&&game.unlocked.indexOf(k)<0){game.unlocked.push(k);fx=true;}});
  else if(look.skin&&look.skin!=='padrao'&&game.unlocked.indexOf(look.skin)<0){look.skin='padrao';try{localStorage.setItem(LOOK_KEY,JSON.stringify(look));}catch(e){}if(typeof applyLook==='function')applyLook();}
  if(fx)gameSave();
  var cw=$('#copy-week');
  if(cw){var ft=gameOn()&&GM.features&&GM.features.copyWeek,lk=!!ft&&game.feat.indexOf('copyWeek')<0;cw.classList.toggle('locked',lk);if(lk)cw.dataset.cost=ft.cost;else delete cw.dataset.cost;}
  document.querySelectorAll('.skin-opt[data-skin]').forEach(function(b){
    var k=b.dataset.skin,rl=gameOn()?gameThemeRule(k):null,c=rl&&rl.cost,lock=!!c&&game.unlocked.indexOf(k)<0,t=b.querySelector('.sk-lock');
    b.classList.toggle('locked',lock);
    if(lock){if(!t){t=el('span','sk-lock');b.append(t);}t.textContent='🔒 '+c+(rl.level&&rl.lv?' · '+rl.lv.icon:'');}else if(t)t.remove();
  });
}
function gameLinked(){var u=curUser();return !!(u&&u.sbid);}
function gameNet(){if(gameLinked()&&(!cloud.user||!navigator.onLine)){gameToast(__('Sem conexão com a nuvem. Troque pontos quando estiver online.'));return false;}return true;}
function gameFeatOk(id,after,opener){
  var f=gameOn()&&GM.features&&GM.features[id];gameSkins();
  if(!f||game.feat.indexOf(id)>=0)return true;
  if(!gameNet())return false;
  var bal=gameBal(),nm=__(f.name);
  if(bal<f.cost){gameToast(__('Faltam {0} pontos para desbloquear: {1}',f.cost-bal,nm));return false;}
  confirmDialog({title:__('Desbloquear recurso'),message:__('Trocar {0} pontos por “{1}”? Depois de desbloqueado, você pode usar quando quiser.',f.cost,nm),okLabel:__('Trocar pontos'),danger:false,opener:opener,
    onConfirm:function(){
      if(gameLinked())return cloudSpend('feature',id,function(){logAdd('p','Troca de pontos: {0} (-{1} pontos)',[nm,f.cost]);if(after)after();});
      game.spent+=f.cost;game.feat.push(id);gameSpendLog('feature',id);
      logAdd('p','Troca de pontos: {0} (-{1} pontos)',[nm,f.cost]);
      gameSave();gameSync();if(after)after();
    }});
  return false;
}
function gameSkinOk(k,opener){
  var rl=gameOn()?gameThemeRule(k):null,c=rl&&rl.cost;gameSkins();
  if(!c||game.unlocked.indexOf(k)>=0)return true;
  if(!gameNet())return false;
  var bal=gameBal(),nm=__(SKIN_NAMES[k]||k);
  if(game.points<rl.min){gameToast(__('Requer o nível {0} {1} para desbloquear o tema {2}',rl.lv.icon,__(rl.lv.name),nm));return false;}
  if(bal<c){gameToast(__('Faltam {0} pontos para desbloquear o tema {1}',c-bal,nm));return false;}
  confirmDialog({title:__('Desbloquear tema'),message:__('Trocar {0} pontos pelo tema {1}? Depois de desbloqueado, você pode usá-lo quando quiser.',c,nm),okLabel:__('Trocar pontos'),danger:false,opener:opener,
    onConfirm:function(){
      if(gameLinked())return cloudSpend('theme',k,function(){logAdd('p','Troca de pontos: tema {0} (-{1} pontos)',[nm,c]);look.skin=k;saveLook();applyLook();});
      game.spent+=c;game.unlocked.push(k);gameSpendLog('theme',k);(game.paidT=game.paidT||[]).push(k);
      logAdd('p','Troca de pontos: tema {0} (-{1} pontos)',[nm,c]);
      gameAch();gameSave();gameSync();look.skin=k;saveLook();applyLook();
    }});
  return false;
}
function gameSync(){
  gameSkins();
  var b=$('#game-btn');if(!b)return;
  b.hidden=!gameOn();if(!gameOn())return;
  var lv=GM.levels[gameIdx(game.points)];
  $('#game-ico').textContent=lv.icon;$('#game-hp').textContent=game.points;
  var lb=__('Seu nível')+': '+__(lv.name);b.setAttribute('aria-label',lb);b.title=lb;
}
