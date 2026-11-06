/* Mi.Día – Telas de login e perfil */
'use strict';

function pfStatus(box,fn){
  var st=el('p','look-note bk-status');st.hidden=true;
  fn.say=function(t,e){st.hidden=!t;st.textContent=t||'';st.className='look-note bk-status '+(e?'err':'ok');};
  box.append(st);return fn.say;
}
function renderProfile(){
  var lp=document.documentElement.classList.contains('lp'),box=lp?$('#lp-box'):$('#pf-box'),prof=curUser();$('#pf-box').textContent='';$('#lp-box').textContent='';
  var card=el('div','set-card pf-card');box.append(card);
  if(!prof){pfLoginUI(card);return;}
  var via=acc.session.via,cl=via==='cloud',fm=via==='forms';
  var hd=el('div','pf-head');card.append(hd);
  var av=el('div','pf-av',(prof.name||prof.login||'?').trim().charAt(0).toUpperCase()),id=el('div','pf-id');
  id.append(el('b',null,prof.name||prof.login),el('span',null,prof.email||prof.login||''));
  hd.append(av,id,el('span','pf-badge',cl?__('Nuvem'):__('Local')));
  if(gameOn()){var gp=el('button','pf-pts');gp.type='button';gp.append(el('span',null,'⭐ '+__('Ganhos')+': '+game.points),el('span',null,__('Disponível')+': '+gameBal()));gp.addEventListener('click',function(){gameHistPopup(gp);});card.append(gp);}
  if(pfMsg)card.append(el('p','look-note bk-status '+(pfMsg.e?'err':'ok'),pfMsg.t));
  var n2=pfField(card,__('Nome de exibição'),'pf-name','text',prof.name),b2=pfField(card,__('Data de nascimento'),'pf-bd','date',prof.birth),l2,m2,pc,p2,pf2;
  if(fm){
    m2=pfField(card,__('E-mail'),'pf-mail','email',prof.email);
    l2=pfField(card,__('Login'),'pf-login','text',prof.login);
    var dt=document.createElement('details');dt.className='pf-more';card.append(dt);
    var sm=document.createElement('summary');sm.textContent=__('Alterar senha');dt.append(sm);
    pc=pfField(dt,__('Senha atual'),'pf-pwc','password','');
    p2=pfField(dt,__('Nova senha'),'pf-pw','password','');
    pf2=pfField(dt,__('Confirmar nova senha'),'pf-pw2','password','');
  }
  var row=el('div','pf-row');card.append(row);
  pfBtn(row,__('Salvar'),'primary',function(){
    var nm=n2.value.trim()||prof.login||prof.name,ck={name:nm,bd:b2.value};
    if(fm){ck.lg=l2.value.trim();ck.mail=m2.value.trim();ck.pw=p2.value;}
    var er=pfCheck(ck);if(er)return pfDone(er,true);
    if(fm&&acc.users.some(function(x){return x!==prof&&x.login&&x.login.toLowerCase()===ck.lg.toLowerCase();}))return pfDone(__('Este login já está em uso.'),true);
    function apply(ns,nh){
      prof.name=nm;prof.birth=b2.value;
      if(fm){prof.login=ck.lg;prof.email=ck.mail;}
      if(nh){prof.salt=ns;prof.hash=nh;}
      pfSave();pfDone(nh?__('Perfil salvo. Senha alterada.'):__('Perfil salvo.'));
    }
    if(fm&&p2.value){
      if(!pc.value)return pfDone(__('Informe a senha atual para alterar a senha.'),true);
      if(p2.value!==pf2.value)return pfDone(__('A confirmação da nova senha não confere.'),true);
      if(p2.value===pc.value)return pfDone(__('A nova senha deve ser diferente da atual.'),true);
      var ns=uid();
      return pfVerify(prof,pc.value).then(function(okp){
        if(!okp)return pfDone(__('Senha atual incorreta.'),true);
        return pfHash(ns,p2.value).then(function(h){apply(ns,h);});
      });
    }
    apply();
  });
  pfBtn(row,__('Sair'),'btn-alt',pfLogout);
  if(!lp)cloudCard(box);
}
function pfLoginUI(card){
  var hasL=acc.users.some(function(x){return x.hash;}),tab=pfTab||(hasL?'local':'cloud');
  var hd=el('div','pf-brand');hd.append(el('h2',null,'Mi.Día'),el('p','look-note',__('Entre para continuar')));card.append(hd);
  if(pfMsg)card.append(el('p','look-note bk-status '+(pfMsg.e?'err':'ok'),pfMsg.t));
  var sbu=null;try{var sj=JSON.parse(localStorage.getItem(SB_AUTH)||'null');sbu=sj&&sj.user;}catch(e){}
  var cu=sbu&&acc.users.filter(function(x){return x.sbid===sbu.id;})[0];
  if(cu)pfBtn(card,__('Continuar como {0}',cu.email||cu.name),'primary',function(){cloud.entering=true;pfEnter(cu,'cloud',false);});
  var gb=pfBtn(card,__('Continuar com Google'),'btn-alt pf-google',function(){cloudGoogle(true,gsay);});
  var gsay=pfStatus(card,gb);
  var sep=el('div','pf-sep',__('ou'));card.append(sep);
  var tabs=el('div','modes two');tabs.setAttribute('role','group');card.append(tabs);
  [['cloud',__('Na nuvem')],['local',__('Neste aparelho')]].forEach(function(t){
    var b=el('button','fx-opt',t[1]);b.type='button';b.setAttribute('aria-pressed',String(tab===t[0]));
    b.addEventListener('click',function(){pfTab=t[0];pfMsg=null;renderProfile();});tabs.append(b);
  });
  var links=null;
  if(tab==='cloud'){
    var cm=pfCm||'in',st=el('p','look-note');
    card.append(el('p','look-note pf-hint',__('Sincroniza entre aparelhos e funciona sem internet.')));
    var em=pfField(card,__('E-mail'),'cl-mail','email',''),cp=pfField(card,__('Senha'),'cl-pw','password','');
    var say=pfStatus(card,{});
    pfBtn(card,cm==='in'?__('Entrar'):__('Criar conta'),'primary',function(){cloudAuth(cm==='in'?'in':'up',em.value,cp.value,true,say);});
    links=el('div','pf-links');card.append(links);
    pfBtn(links,cm==='in'?__('Criar conta'):__('Já tenho conta'),'pf-link',function(){pfCm=cm==='in'?'up':'in';pfMsg=null;renderProfile();});
    if(cm==='in')pfBtn(links,__('Esqueci a senha'),'pf-link',function(){cloudAuth('reset',em.value,'',true,say);});
  }else{
    var mode=pfMode||(hasL?'in':'new'),login,pw,name,mail,bd;
    card.append(el('p','look-note pf-hint',__('Fica salvo só neste aparelho. Use o backup para levar os dados.')));
    login=pfField(card,__('Login'),'pf-login','text','');
    pw=pfField(card,__('Senha'),'pf-pw','password','');
    if(mode==='new'){
      name=pfField(card,__('Nome de exibição'),'pf-name','text','');
      mail=pfField(card,__('E-mail'),'pf-mail','email','');
      bd=pfField(card,__('Data de nascimento'),'pf-bd','date','');
    }
    pfBtn(card,mode==='in'?__('Entrar'):__('Criar conta'),'primary',function(){
      var lg=login.value.trim(),pv=pw.value;
      if(!lg||!pv)return pfDone(__('Preencha login e senha.'),true);
      if(mode==='in'){
        var u=acc.users.filter(function(x){return x.hash&&x.login.toLowerCase()===lg.toLowerCase();})[0];
        if(!u)return pfDone(__('Login ou senha incorretos.'),true);
        pfVerify(u,pv).then(function(okp){
          if(!okp)return pfDone(__('Login ou senha incorretos.'),true);
          pfEnter(u,'forms',false);
        });
      }else{
        var ce=pfCheck({lg:lg,pw:pv,name:name.value.trim(),mail:mail.value.trim(),bd:bd.value});if(ce)return pfDone(ce,true);
        if(acc.users.some(function(x){return x.login&&x.login.toLowerCase()===lg.toLowerCase();}))return pfDone(__('Este login já está em uso.'),true);
        var salt=uid(),first=!acc.users.length;
        pfHash(salt,pv).then(function(h){
          var nu={id:uid(),name:name.value.trim()||lg,login:lg,salt:salt,hash:h,email:mail.value.trim(),birth:bd.value};
          acc.users.push(nu);pfEnter(nu,'forms',first);
        });
      }
    });
    if(hasL){links=el('div','pf-links');card.append(links);pfBtn(links,mode==='in'?__('Criar conta'):__('Já tenho conta'),'pf-link',function(){pfMode=mode==='in'?'new':'in';pfMsg=null;renderProfile();});}
  }
}
