/* Mi.Día – Idioma e textos da interface (usa js/lang) */
'use strict';

/* ---------- Idioma: os textos traduzidos ficam na pasta js/lang ---------- */
var I18N=window.I18N||{langs:{'pt-BR':'Português'},dict:{}};
var LANG='pt-BR';
try{var _lv=JSON.parse(localStorage.getItem('planner-diario-look-v1')||'{}');if(_lv.lang&&I18N.langs[_lv.lang])LANG=_lv.lang;}catch(e){}
document.documentElement.lang=LANG;
/* __('texto em português {0}', valor): devolve o texto no idioma atual (o português é o próprio texto) */
function __(k){
  if(typeof k!=='string')return k;
  var d=LANG!=='pt-BR'&&I18N.dict[LANG],s=(d&&d[k]!==undefined)?d[k]:k.replace(/^[a-z]+\|/,'');
  if(arguments.length>1){var a=arguments;s=s.replace(/\{(\d+)\}/g,function(m,i){return a[+i+1]!==undefined?a[+i+1]:m;});}
  return s;
}
/* textos fixos do HTML: guardados uma vez, antes de qualquer renderização (conteúdo do usuário nunca entra aqui) */
var STAT=[];
function statKey(s){return s.replace(/\u200b/g,'').replace(/\s+/g,' ').trim();}
function collectStatic(){
  var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
    var p=n.parentNode&&n.parentNode.nodeName;
    return (p==='SCRIPT'||p==='STYLE'||!/\S/.test(n.nodeValue))?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT;}}),n;
  while((n=w.nextNode()))STAT.push({n:n,o:n.nodeValue});
  document.querySelectorAll('[title],[aria-label],[placeholder]').forEach(function(e){
    ['title','aria-label','placeholder'].forEach(function(at){if(e.hasAttribute(at))STAT.push({e:e,a:at,o:e.getAttribute(at)});});
  });
  STAT.push({doc:1,o:document.title});
}
function applyStatic(){
  var d=LANG!=='pt-BR'&&I18N.dict[LANG];
  STAT.forEach(function(it){
    var k=statKey(it.o),v=it.o;
    if(d&&d[k]!==undefined){v=it.n?it.o.replace(/\S[\s\S]*\S|\S/,function(){return d[k];}):d[k];}
    if(it.doc)document.title=v;else if(it.n)it.n.nodeValue=v;else it.e.setAttribute(it.a,v);
  });
}
collectStatic();
if(LANG!=='pt-BR')applyStatic();
