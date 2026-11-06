/* Escopo de dados por usuário: com contas criadas, as chaves planner-diario-* passam a ser gravadas como chave@idDoUsuario */
(function(){
window.__first=(function(){try{return localStorage.length===0;}catch(e){return false;}})();
var P='planner-diario-',ACC=P+'accounts-v1',OLD=P+'profile-v1',S=Storage.prototype,g=S.getItem,st=S.setItem,rm=S.removeItem,ls=localStorage;
function mv(uid){var ks=[],i,k;for(i=0;i<ls.length;i++){k=ls.key(i);if(k.indexOf(P)===0&&k!==ACC&&k!==OLD&&k.indexOf('@')<0)ks.push(k);}ks.forEach(function(k){st.call(ls,k+'@'+uid,g.call(ls,k));rm.call(ls,k);});}
var a=null;try{a=JSON.parse(g.call(ls,ACC)||'null');}catch(e){}
if(!a){try{var o=JSON.parse(g.call(ls,OLD)||'null');
  if(o&&(o.hash||o.gsub)){a={users:[{id:'u1',name:o.name,login:o.login,salt:o.salt,hash:o.hash,email:o.email,birth:o.birth,gsub:o.gsub}],session:(o.session&&o.exp>Date.now())?{uid:'u1',exp:o.exp,via:o.session}:null};mv('u1');st.call(ls,ACC,JSON.stringify(a));}
  rm.call(ls,OLD);}catch(e){}}
var U=null;
if(a&&a.users&&a.users.length)U=(a.session&&a.session.exp>Date.now())?a.session.uid:'_none';
window.__uid=U;window.__mv=mv;
if(!U)return;
function m(k){return typeof k==='string'&&k.indexOf(P)===0&&k!==ACC?k+'@'+U:k;}
S.getItem=function(k){return g.call(this,m(k));};S.setItem=function(k,v){return st.call(this,m(k),v);};S.removeItem=function(k){return rm.call(this,m(k));};
})();
