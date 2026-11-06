/* Mi.Día – Nuvem: conexão e sessão */
'use strict';

/* ---------- Conta na nuvem (Supabase): sincroniza tarefas, pontos e configurações entre aparelhos ---------- */
var SB_URL='https://dxelobupihmdspzqomcy.supabase.co',SB_KEY='sb_publishable_lBGy1UnegxFuwsQ7mWxluQ_ymBHAwmr',SB_LIB='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js',SB_AUTH='sb-midia-auth',CMETA='planner-diario-cloud-v1';
var cloud={sb:null,user:null,busy:false,applying:false,timer:null,ver:0,msg:null,loading:null,entering:false,linking:false,recovery:false},SB_LINK='sb-midia-link';
function cloudAccept(su){var u=curUser();return !!(u&&!cloud.entering&&(u.sbid===su.id||cloud.linking));}
function cloudSet(su){
  var had=!!cloud.user;cloud.user=su&&cloudAccept(su)?su:null;
  if(cloud.user&&!had)setTimeout(function(){cloudSync(false);},0);
  if(!cloud.user&&had)cloudMetaSave({});
  cloudUI();
}
/* entra (ou cria) o perfil local ligado à conta da nuvem e recarrega */
function cloudEnter(su){
  cloud.entering=true;
  var first=!acc.users.length,u=acc.users.filter(function(x){return x.sbid===su.id;})[0],md=su.user_metadata||{};
  var nm=String(md.full_name||md.name||String(su.email||'').split('@')[0]||'Usuário').slice(0,40);if(nm.length<2)nm+=' ';
  if(!u){u={id:uid(),name:nm,login:'',email:su.email||'',birth:'',sbid:su.id};acc.users.push(u);}
  else if(su.email)u.email=su.email;
  pfEnter(u,'cloud',first);
}
function cloudMeta(){try{return JSON.parse(localStorage.getItem(CMETA)||'{}')||{};}catch(e){return {};}}
function cloudMetaSave(m){try{localStorage.setItem(CMETA,JSON.stringify(m));}catch(e){}}
function cloudMsg(t,e){cloud.msg=t?{t:t,e:!!e}:null;cloudUI();}
function cloudUI(){if(view==='profile'&&curUser()&&!document.documentElement.classList.contains('lp'))renderProfile();}
function cloudErr(e){
  var m=String(e&&e.message||e||'');
  if(/invalid login/i.test(m))return __('E-mail ou senha incorretos.');
  if(/not confirmed/i.test(m))return __('Confirme o e-mail antes de entrar (veja sua caixa de entrada).');
  if(/already registered|already been registered/i.test(m))return __('Este e-mail já tem conta. Use Entrar.');
  if(/password/i.test(m)&&/(least|short|weak)/i.test(m))return __('Senha: 6 a 64 caracteres, com ao menos uma letra e um número.');
  if(/rate limit|too many/i.test(m))return __('Muitas tentativas. Aguarde um pouco e tente de novo.');
  if(/fetch|network|failed|load/i.test(m))return __('Sem conexão com a nuvem. Tente novamente quando estiver online.');
  return __('Não foi possível concluir. Tente novamente.');
}
function cloudLoad(){
  if(cloud.sb)return Promise.resolve(cloud.sb);
  if(cloud.loading)return cloud.loading;
  cloud.loading=new Promise(function(ok,no){
    function mk(){try{cloud.sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:SB_AUTH,flowType:'pkce'}});cloud.sb.auth.onAuthStateChange(function(ev,ss){
      if(ev==='PASSWORD_RECOVERY'){cloud.recovery=true;setTimeout(cloudRecover,0);return;}
      cloudSet(ss&&ss.user?ss.user:null);
    });ok(cloud.sb);}catch(e){no(e);}}
    if(window.supabase&&window.supabase.createClient){mk();return;}
    var sc=document.createElement('script');sc.src=SB_LIB;sc.async=true;sc.onload=mk;sc.onerror=function(){no(new Error('load'));};document.head.append(sc);
  });
  cloud.loading.catch(function(){cloud.loading=null;});
  return cloud.loading;
}
