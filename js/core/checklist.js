/* Mi.Día – Descrição e checklist das tarefas */
'use strict';

/* ---------- Descrição e checklist ---------- */
var CK_RE=/^(\s*(?:(?:[-*•]|\d+[.)])\s+)?)\[( |x|X)\]\s?(.*)$/;
var LI_RE=/^(\s*)(?:[-*•]|\d+[.)])\s+(.*)$/;

/* Linha de lista: "- [ ] item", "- [x] item" ou item simples ("- item", "* item", "1. item"). */
function parseLine(l){
  var m=CK_RE.exec(l);
  if(m)return {pre:m[1],done:m[2]!==' ',text:m[3]};
  m=LI_RE.exec(l);
  if(m)return {pre:m[1]+'- ',done:false,text:m[2],plain:true};
  return null;
}
function parseNotes(text){
  var out=[];
  String(text||'').split('\n').forEach(function(l,i){
    var p=parseLine(l);
    if(p){if(p.text.trim())out.push({ck:true,done:p.done,text:p.text.trim(),i:i});}
    else if(l.trim())out.push({ck:false,text:l.trim(),i:i});
  });
  return out;
}
/* Mesmo card (mesmo modelo ou mesmo título) em outros dias */
function sameTask(a,b){
  if(a.cardId&&a.cardId===b.cardId)return true;
  return String(a.title).trim().toLowerCase()===String(b.title).trim().toLowerCase();
}
function itemStats(text){
  var s={total:0,done:0};
  parseNotes(text).forEach(function(r){if(r.ck){s.total++;if(r.done)s.done++;}});
  return s;
}
function mapChecks(text,fn){
  return String(text||'').split('\n').map(function(l,i){
    var p=parseLine(l);
    if(!p||!p.text.trim())return l;
    return p.pre+(fn(i,p.done)?'[x] ':'[ ] ')+p.text;
  }).join('\n');
}
function setLineChecked(text,idx,v){return mapChecks(text,function(i,cur){return i===idx?v:cur;});}
function setAllChecked(text,v){return mapChecks(text,function(){return v;});}
/* com itens, o card só está concluído quando todos estiverem marcados */
function syncDone(t){var s=itemStats(t.notes);if(s.total)t.done=s.done===s.total;}
