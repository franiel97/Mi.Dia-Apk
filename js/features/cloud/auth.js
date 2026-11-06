/* Mi.Día – Nuvem: login, Google e recuperação de senha */
'use strict';

function cloudAuth(kind,mail,pw,enter,say){
  say=say||cloudMsg;mail=(mail||'').trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)){say(__('Informe um e-mail válido.'),true);return;}
  if(kind!=='reset'&&(pw.length<6||pw.length>64||!/[A-Za-z]/.test(pw)||!/[0-9]/.test(pw))){say(__('Senha: 6 a 64 caracteres, com ao menos uma letra e um número.'),true);return;}
  say(__('Conectando…'));
  if(!enter)cloud.linking=true;
  cloudLoad().then(function(sb){
    var back=location.origin+location.pathname;
    function fin(su){if(enter){cloudEnter(su);return;}var u=curUser();if(u&&su){u.sbid=su.id;accSave();}cloud.linking=false;cloudSet(su);say(null);}
    if(kind==='in')return sb.auth.signInWithPassword({email:mail,password:pw}).then(function(r){if(r.error)throw r.error;fin(r.data.user);});
    if(kind==='up')return sb.auth.signUp({email:mail,password:pw,options:{emailRedirectTo:back}}).then(function(r){if(r.error)throw r.error;if(r.data&&r.data.session)fin(r.data.user);else{cloud.linking=false;say(__('Enviamos um e-mail de confirmação. Confirme e depois use Entrar.'));}});
    return sb.auth.resetPasswordForEmail(mail,{redirectTo:back}).then(function(r){if(r.error)throw r.error;cloud.linking=false;say(__('Se o e-mail tiver conta, enviamos um link para redefinir a senha.'));});
  }).catch(function(e){cloud.linking=false;say(cloudErr(e),true);});
}
function cloudGoogle(enter,say){
  say=say||cloudMsg;say(__('Conectando…'));
  if(!enter){try{sessionStorage.setItem(SB_LINK,'1');}catch(e){}}
  cloudLoad().then(function(sb){return sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}});}).then(function(r){if(r&&r.error)throw r.error;}).catch(function(e){say(cloudErr(e),true);});
}
function cloudRecover(){
  var form=document.createElement('form');form.className='mform';form.autocomplete='off';
  var h=el('h3','modal-title',__('Definir nova senha'));h.id='modal-title';
  var body=el('div','modal-body'),st=el('p','look-note bk-status');
  var p1=pfField(body,__('Nova senha'),'cl-np','password','');
  var a=el('div','modal-actions'),ok=el('button','primary',__('Salvar senha')),no=el('button','btn-alt',__('Cancelar'));ok.type='button';no.type='button';
  no.addEventListener('click',function(){cloud.recovery=false;closeModal();});
  ok.addEventListener('click',function(){
    var pv=p1.value;if(pv.length<6||pv.length>64||!/[A-Za-z]/.test(pv)||!/[0-9]/.test(pv)){st.textContent=__('Senha: 6 a 64 caracteres, com ao menos uma letra e um número.');st.className='look-note bk-status err';return;}
    cloud.sb.auth.updateUser({password:pv}).then(function(r){if(r.error)throw r.error;cloud.recovery=false;closeModal();if(!curUser())cloudEnter(r.data.user);else cloudMsg(__('Senha alterada.'));}).catch(function(e){st.textContent=cloudErr(e);st.className='look-note bk-status err';});
  });
  a.append(no,ok);form.append(h,body,st,a);openModal(form,null,p1);
}
function cloudOut(){
  var u=curUser();if(u&&acc.session&&acc.session.via==='cloud')return pfLogout();
  try{localStorage.removeItem(SB_AUTH);}catch(e){}
  if(u){delete u.sbid;accSave();}
  cloud.user=null;cloudMetaSave({});cloudMsg(__('Você saiu da nuvem. Seus dados continuam neste aparelho.'));
}
function cloudCard(box){
  var c=el('div','set-card pf-card cloud-card');box.append(c);
  c.append(el('h2',null,__('Sincronização')));
  if(cloud.msg)c.append(el('p','look-note bk-status '+(cloud.msg.e?'err':'ok'),cloud.msg.t));
  var cl=acc.session&&acc.session.via==='cloud';
  if(cloud.user){
    var m=cloudMeta();
    c.append(el('p','look-note',(m.at?'● '+__('Sincronizado')+' · '+new Date(m.at).toLocaleString(LANG==='pt'?'pt-BR':LANG):__('Ainda não sincronizado.'))+(cl?'':' · '+(cloud.user.email||''))));
    var r=el('div','pf-row');c.append(r);
    pfBtn(r,__('Sincronizar agora'),'primary',function(){cloudSync(true);});
    if(!cl)pfBtn(r,__('Desconectar'),'btn-alt',cloudOut);
    return;
  }
  var dt=document.createElement('details');dt.className='pf-more';c.append(dt);
  var sm=document.createElement('summary');sm.textContent=__('Conectar à nuvem para sincronizar entre aparelhos');dt.append(sm);
  var mail=pfField(dt,__('E-mail'),'cl-mail','email',''),pw=pfField(dt,__('Senha'),'cl-pw','password','');
  var r2=el('div','pf-row');dt.append(r2);
  pfBtn(r2,__('Entrar'),'primary',function(){cloudAuth('in',mail.value,pw.value);});
  pfBtn(r2,__('Criar conta'),'btn-alt',function(){cloudAuth('up',mail.value,pw.value);});
  var r3=el('div','pf-links');dt.append(r3);
  pfBtn(r3,__('Continuar com Google'),'pf-link',cloudGoogle);
  pfBtn(r3,__('Esqueci a senha'),'pf-link',function(){cloudAuth('reset',mail.value,'');});
}
function cloudInit(){
  var url=false,has=false,link=false;
  try{url=/[?&]code=|[?&#]access_token=/.test(location.search+location.hash);has=url||!!localStorage.getItem(SB_AUTH);link=sessionStorage.getItem(SB_LINK)==='1';}catch(e){}
  if(has)cloudLoad().then(function(sb){return sb.auth.getSession();}).then(function(r){
    var su=r&&r.data&&r.data.session&&r.data.session.user,u=curUser();
    try{sessionStorage.removeItem(SB_LINK);}catch(e){}
    if(!su||cloud.recovery)return;
    if(url&&!u)return cloudEnter(su);
    if(url&&u&&link&&!u.sbid){u.sbid=su.id;accSave();}
    cloudSet(su);
  }).catch(function(){});
  document.addEventListener('visibilitychange',function(){if(cloud.user&&(!document.hidden||cloudMeta().dirty)){clearTimeout(cloud.timer);cloudSync(false);}});
  window.addEventListener('pagehide',function(){if(cloud.user&&cloudMeta().dirty){clearTimeout(cloud.timer);cloudSync(false);}});
  window.addEventListener('online',function(){if(cloud.user)cloudSync(false);});
  setInterval(function(){if(!document.hidden&&cloud.user&&!cloudMeta().dirty)cloudSync(false);},30000);
}
