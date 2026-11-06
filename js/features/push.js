/* Mi.Día – Avisos pelo servidor (Web Push) */
'use strict';

var PUSH_KEY='BKiaNMafw6_3jQ5V7YCGoxwxzNVK0yuOVQCRfRBH6JsV8R5PlAts_1r09FXkoA4xEjv9m9N5UcSzsWcnINetycU';
function pushOk(){return !(window.MidiaNativeNotifications&&window.MidiaNativeNotifications.isNative)&&!!PUSH_KEY&&('serviceWorker' in navigator)&&('PushManager' in window)&&!!cloud.user&&!!cloud.sb;}
function pushKey(s){var p='='.repeat((4-s.length%4)%4),r=atob((s+p).replace(/-/g,'+').replace(/_/g,'/')),o=new Uint8Array(r.length),i;for(i=0;i<r.length;i++)o[i]=r.charCodeAt(i);return o;}
/* registra este aparelho no servidor para receber os avisos com o app fechado */
function pushEnsure(){
  if(!pushOk()||!notifActive())return Promise.resolve();
  return navigator.serviceWorker.ready.then(function(reg){
    return reg.pushManager.getSubscription().then(function(sub){return sub||reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pushKey(PUSH_KEY)});});
  }).then(function(sub){
    var j=sub.toJSON();
    return cloud.sb.from('push_subscriptions').upsert({user_id:cloud.user.id,endpoint:j.endpoint,p256dh:j.keys.p256dh,auth:j.keys.auth,lang:LANG,ua:navigator.userAgent.slice(0,200)},{onConflict:'user_id,endpoint'});
  }).then(function(r){cloudCk(r);cloud.push=true;cloud.pushAt=Date.now();syncNotifUI();}).catch(function(){cloud.push=false;});
}
function pushOff(){
  if(!('serviceWorker' in navigator)||!('PushManager' in window))return Promise.resolve();
  return navigator.serviceWorker.ready.then(function(reg){return reg.pushManager.getSubscription();}).then(function(sub){
    if(!sub)return;var ep=sub.endpoint;
    var del=(cloud.sb&&cloud.user)?cloud.sb.from('push_subscriptions').delete().eq('user_id',cloud.user.id).eq('endpoint',ep).then(function(){},function(){}):Promise.resolve();
    return del.then(function(){return sub.unsubscribe();});
  }).then(function(){cloud.push=false;syncNotifUI();},function(){});
}
