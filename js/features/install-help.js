/* Mi.Día – Ajuda de instalação e service worker */
'use strict';

function openInstallHelp(){
  var form=document.createElement('form');
  form.className='mform';form.autocomplete='off';
  var h=el('h3','modal-title',__('Instalar como app'));
  h.id='modal-title';
  var ol=el('ol','install-steps');
  (isIOS()
    ?[__('Toque em Compartilhar (o quadrado com a seta) na barra do navegador.'),__('Escolha “Adicionar à Tela de Início”.'),__('Confirme em “Adicionar”.')]
    :[__('Abra o menu do navegador (⋮ ou ≡).'),__('Toque em “Instalar app” ou “Adicionar à tela inicial”.'),__('Confirme para criar o atalho.')]
  ).forEach(function(t){ol.append(el('li','',t));});
  var a=el('div','modal-actions');
  var ok=el('button','primary',__('Entendi'));
  ok.type='button';
  ok.addEventListener('click',closeModal);
  a.append(ok);
  var body=el('div','modal-body');
  body.append(h,ol);
  form.append(a,body);
  openModal(form,installBtn,ok);
}
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferredInstall=e;syncInstall();});
window.addEventListener('appinstalled',function(){deferredInstall=null;syncInstall();});
/* O botão chama direto a instalação do PWA; sem o aviso do navegador, mostra o passo a passo. */
installBtn.addEventListener('click',function(){
  if(!deferredInstall){openInstallHelp();return;}
  var d=deferredInstall;
  d.prompt();
  d.userChoice.then(function(){deferredInstall=null;syncInstall();},function(){});
});
syncInstall();
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
  window.addEventListener('load',function(){
    navigator.serviceWorker.register('sw.js').then(function(){return navigator.serviceWorker.ready;}).then(function(reg){if(reg.active)reg.active.postMessage({type:'get-shown'});}).catch(function(){});
  });
}
