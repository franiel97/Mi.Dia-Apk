/* Mi.Día – Seletor de cor */
'use strict';

/* Seletor de cor embutido (sem abrir o seletor nativo por cima): quadro de cor, matiz, código e botão Adicionar */
function hsv2hex(h,s,v){
  function f(n){var k=(n+h/60)%6,x=v-v*s*Math.max(0,Math.min(k,4-k,1));return Math.round(x*255);}
  return '#'+[f(5),f(3),f(1)].map(function(c){return ('0'+c.toString(16)).slice(-2);}).join('');
}
function hex2hsv(hex){
  var r=parseInt(hex.substr(1,2),16)/255,g=parseInt(hex.substr(3,2),16)/255,b=parseInt(hex.substr(5,2),16)/255;
  var mx=Math.max(r,g,b),mn=Math.min(r,g,b),d=mx-mn,h=0;
  if(d){
    if(mx===r)h=((g-b)/d)%6;else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;
    h*=60;if(h<0)h+=360;
  }
  return {h:h,s:mx?d/mx:0,v:mx};
}
function inlinePicker(init,onAdd){
  var hsv=hex2hsv(/^#[0-9a-f]{6}$/.test(init)?init:'#4f8cff');
  var box=el('div','cp');
  var sv=el('div','cp-sv'),thumb=el('span','cp-thumb');
  sv.append(thumb);
  sv.setAttribute('aria-label',__('Escolher tom e brilho'));
  var hue=document.createElement('input');
  hue.type='range';hue.min='0';hue.max='360';hue.step='1';hue.className='cp-hue';hue.setAttribute('aria-label',__('Matiz da cor'));
  var row=el('div','cp-row'),prev=el('span','cp-prev');
  var hex=document.createElement('input');
  hex.type='text';hex.className='cp-hex';hex.maxLength=7;hex.autocomplete='off';hex.spellcheck=false;hex.setAttribute('aria-label',__('Código da cor'));
  var add=el('button','btn-alt sm',__('Adicionar'));
  add.type='button';
  function paint(fromHex){
    var c=hsv2hex(hsv.h,hsv.s,hsv.v);
    sv.style.backgroundColor='hsl('+Math.round(hsv.h)+',100%,50%)';
    thumb.style.left=(hsv.s*100)+'%';thumb.style.top=((1-hsv.v)*100)+'%';
    hue.value=String(Math.round(hsv.h));
    prev.style.background=c;
    if(!fromHex)hex.value=c;
  }
  var dragging=false;
  function pickAt(e){
    var r=sv.getBoundingClientRect();
    hsv.s=Math.min(1,Math.max(0,(e.clientX-r.left)/r.width));
    hsv.v=1-Math.min(1,Math.max(0,(e.clientY-r.top)/r.height));
    paint();
  }
  sv.addEventListener('pointerdown',function(e){e.preventDefault();dragging=true;try{sv.setPointerCapture(e.pointerId);}catch(x){}pickAt(e);});
  sv.addEventListener('pointermove',function(e){if(dragging)pickAt(e);});
  sv.addEventListener('pointerup',function(){dragging=false;});
  sv.addEventListener('pointercancel',function(){dragging=false;});
  hue.addEventListener('input',function(){hsv.h=+hue.value;paint();});
  function parseHex(){
    var v=hex.value.trim().toLowerCase();
    if(v.charAt(0)!=='#')v='#'+v;
    if(/^#[0-9a-f]{3}$/.test(v))v='#'+v.charAt(1)+v.charAt(1)+v.charAt(2)+v.charAt(2)+v.charAt(3)+v.charAt(3);
    return /^#[0-9a-f]{6}$/.test(v)?v:null;
  }
  hex.addEventListener('input',function(){var v=parseHex();if(v){hsv=hex2hsv(v);paint(true);}});
  function doAdd(){var v=parseHex();if(!v){hex.focus();return;}if(!validTone(v))return;onAdd(v);}
  add.addEventListener('click',doAdd);
  hex.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();e.stopPropagation();doAdd();}});
  row.append(prev,hex,add);
  box.append(sv,hue,row);
  paint();
  return box;
}
function toneSet(selected,opts){
  var full=!!(opts&&opts.inline);   /* completo (dentro do pop-up de cores) ou compacto (cores padrão + botão +) */
  var box=el('fieldset','tones');
  var cur=selected,name='tn'+uid();
  function draw(){
    box.textContent='';
    box.append(el('legend','sr',__('Cor')));
    var list=state.palette.slice();
    if(cur!==NONE&&list.indexOf(cur)<0)list.unshift(cur);
    if(full&&opts.pickerOnly)list=[];   /* pop-up do + nos editores: só o seletor; as cores ficam na linha do editor */
    else list.unshift(NONE);
    list.forEach(function(tone){
      var lab=el('label',tone===NONE?'sw sw-none':'sw');
      lab.dataset.tone=tone;
      lab.title=toneName(tone);
      tintNode(lab,tone);
      var inp=document.createElement('input');
      inp.type='radio';inp.name=name;inp.value=tone;inp.checked=tone===cur;
      lab.append(inp,el('span','sr',toneName(tone)));
      if(tone!==NONE&&state.palette.indexOf(tone)>=0)lab.append(delBtn(tone));
      box.append(lab);
    });
    if(full){
      box.append(inlinePicker(cur,function(hex){
        cur=hex;touchPalette(hex);save();
        if(opts.onPick)opts.onPick(hex);else renderSwatches();
        draw();
      }));
      return;
    }
    var nw=el('span','sw sw-new');
    nw.setAttribute('role','button');nw.tabIndex=0;
    nw.title=__('Mais cores');
    nw.append(el('span','sr',__('Mais cores')));
    box.append(nw);
  }
  function openMore(nw){
    openColorPopover(nw,{pickerOnly:true,get:function(){return cur;},set:function(v){cur=v;draw();}});
  }
  box.addEventListener('change',function(e){
    var t=e.target;
    if(t.name===name){if(t.checked)cur=t.value;}
  });
  box.addEventListener('click',function(e){
    var x=e.target.closest('button.sw-del');
    if(x){
      e.preventDefault();e.stopPropagation();
      deleteTone(x.dataset.tone);
      return;
    }
    var n=e.target.closest('.sw-new');
    if(n){e.preventDefault();e.stopPropagation();openMore(n);}
  });
  box.addEventListener('keydown',function(e){
    var n=e.target.closest&&e.target.closest('.sw-new');
    if(n&&(e.key==='Enter'||e.key===' ')){e.preventDefault();e.stopPropagation();openMore(n);}
  });
  modalRedraw=function(deleted){
    if(cur===deleted)cur=state.palette[0]||NONE;
    draw();
  };
  draw();
  return {el:box,get:function(){return cur;}};
}
