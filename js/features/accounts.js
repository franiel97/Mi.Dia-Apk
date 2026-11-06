/* Mi.Día – Contas locais, sessão e rotas de login */
'use strict';

/* ---------- Perfil e contas (locais, uma por usuário) ---------- */
var ACC_KEY='planner-diario-accounts-v1',GOOGLE_CLIENT_ID='',acc={users:[],session:null},pfMsg=null,pfMode=null,pfTab=null,pfCm=null;
try{var _ac=JSON.parse(localStorage.getItem(ACC_KEY)||'null');if(_ac&&Array.isArray(_ac.users))acc=_ac;}catch(e){}
function accSave(){try{localStorage.setItem(ACC_KEY,JSON.stringify(acc));}catch(e){}}
function curUser(){var q=acc.session;if(!q||q.exp<=Date.now())return null;return acc.users.filter(function(u){return u.id===q.uid;})[0]||null;}
function pfSave(){accSave();}
function pfEnc(x){return new TextEncoder().encode(x);}
function pfHash(salt,pw){
  if(window.crypto&&crypto.subtle&&window.TextEncoder)return crypto.subtle.importKey('raw',pfEnc(pw),'PBKDF2',false,['deriveBits']).then(function(k){return crypto.subtle.deriveBits({name:'PBKDF2',salt:pfEnc(salt),iterations:100000,hash:'SHA-256'},k,256);}).then(function(b){return 'p1:'+Array.prototype.map.call(new Uint8Array(b),function(x){return ('0'+x.toString(16)).slice(-2);}).join('');});
  return pfHashOld(salt,pw);
}
function pfVerify(u,pw){return (String(u.hash).indexOf('p1:')===0?pfHash(u.salt,pw):pfHashOld(u.salt,pw)).then(function(h){return h===u.hash;});}
function pfHashOld(salt,pw){
  var str=salt+pw;
  if(window.crypto&&crypto.subtle&&window.TextEncoder)return crypto.subtle.digest('SHA-256',new TextEncoder().encode(str)).then(function(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return ('0'+x.toString(16)).slice(-2);}).join('');});
  var h=5381,i;for(i=0;i<str.length;i++)h=((h<<5)+h+str.charCodeAt(i))|0;
  return Promise.resolve('x'+h);
}
function pfField(box,lab,id,type,val,dis,hint){
  var f=el('div','fld'),l=el('label','lab',lab),i=document.createElement('input');
  l.htmlFor=id;i.id=id;i.type=type;i.className='pf-in';i.value=val||'';i.disabled=!!dis;
  if(type==='password'){i.autocomplete='new-password';i.maxLength=64;}
  if(id==='pf-login')i.maxLength=30;if(id==='pf-name')i.maxLength=40;if(id==='pf-bd')i.max=keyOf(getToday());
  f.append(l,i);if(hint)f.append(el('p','look-note',hint));box.append(f);return i;
}
function pfBtn(box,txt,cls,fn){var b=el('button',cls,txt);b.type='button';b.addEventListener('click',fn);box.append(b);return b;}
function pfCheck(o){
  if('lg' in o&&!/^[A-Za-z0-9._-]{3,30}$/.test(o.lg))return __('Login: 3 a 30 caracteres, apenas letras, números, ponto, hífen ou sublinhado (sem espaços).');
  if(o.pw&&(o.pw.length<6||o.pw.length>64||!/[A-Za-z]/.test(o.pw)||!/[0-9]/.test(o.pw)))return __('Senha: 6 a 64 caracteres, com ao menos uma letra e um número.');
  if(o.name&&(o.name.length<2||o.name.length>40))return __('Nome de exibição: 2 a 40 caracteres.');
  if(o.mail!=null&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(o.mail))return __('Informe um e-mail válido.');
  if(o.bd){var d=new Date(o.bd+'T00:00:00');if(isNaN(d)||d>new Date()||d.getFullYear()<1900)return __('Informe uma data de nascimento válida.');}
  return '';
}
function pfDone(m,err){pfMsg=m?{t:m,e:!!err}:null;route(false);renderProfile();}
/* inicia a sessão (24h) e recarrega a página para carregar os dados do usuário */
function pfEnter(u,via,first){
  acc.session={uid:u.id,exp:Date.now()+24*36e5,via:via};
  if(first&&window.__mv)window.__mv(u.id);
  accSave();location.replace(location.pathname+location.search+'#/');location.reload();
}
function pfLogout(){
  if(cloud.user&&cloud.push&&!pfLogout.go){pfLogout.go=1;var d0=false,once=function(){if(!d0){d0=true;pfLogout();}};setTimeout(once,1500);pushOff().then(once,once);return;}
  acc.session=null;try{localStorage.removeItem(SB_AUTH);}catch(e){}accSave();location.replace(location.pathname+location.search+'#/login');location.reload();}
/* Rota de login (#/login) e sessão: 24h após o login; ao acessar com a sessão válida ela é estendida (até +12h) */
function route(ext){
  try{var _a=JSON.parse(localStorage.getItem(ACC_KEY)||'null');if(_a&&Array.isArray(_a.users))acc=_a;}catch(e){}
  var now=Date.now(),de=document.documentElement,gated=acc.users.length>0,u=curUser();
  if(gated&&!u){
    if(window.__uid!=='_none'){acc.session=null;accSave();location.replace(location.pathname+location.search+'#/login');location.reload();return;}
    var was=de.classList.contains('lp');de.classList.add('lp');
    if(location.hash!=='#/login')location.replace('#/login');
    if(!was)renderProfile();
    return;
  }
  if(u&&window.__uid!==u.id){location.reload();return;}
  de.classList.remove('lp');
  if(location.hash==='#/login')location.replace('#/');
  if(u&&ext){acc.session.exp=Math.max(acc.session.exp,now+12*36e5);accSave();}
}
function pfGsi(){
  return new Promise(function(ok,no){
    if(window.google&&google.accounts)return ok();
    var s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.async=true;
    s.onload=ok;s.onerror=no;document.head.append(s);
  });
}
function pfGoogleCb(r){
  try{
    var p=r.credential.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
    var o=JSON.parse(decodeURIComponent(escape(atob(p)))),first=!acc.users.length;
    var u=acc.users.filter(function(x){return x.gsub===o.sub||(o.email&&x.email===o.email&&!x.hash);})[0];
    if(!u){u={id:uid(),name:o.name||'',login:'',email:o.email||'',birth:''};acc.users.push(u);}
    u.gsub=o.sub;u.email=o.email||u.email;if(!u.name)u.name=o.name||'';
    pfEnter(u,'google',first);
  }catch(e){pfDone(__('Não foi possível entrar com o Google.'),true);}
}
function pfGoogleBtn(box){
  var g=el('div','pf-g');box.append(g);
  if(!GOOGLE_CLIENT_ID){pfBtn(g,__('Entrar com Google'),'btn-alt',function(){pfDone(__('Para ativar o login com Google, informe o GOOGLE_CLIENT_ID no código.'),true);});return;}
  pfGsi().then(function(){
    google.accounts.id.initialize({client_id:GOOGLE_CLIENT_ID,callback:pfGoogleCb});
    google.accounts.id.renderButton(g,{theme:'outline',size:'large',text:'signin_with'});
  }).catch(function(){g.append(el('p','look-note',__('Não foi possível carregar o login do Google.')));});
}
