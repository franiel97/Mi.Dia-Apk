/* Mi.Día – Botão de fechar dos pop-ups */
'use strict';

function popX(host,fn){
  var b=el('button','pop-x');b.type='button';b.setAttribute('aria-label',__('Fechar'));b.title=__('Fechar');
  b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" d="M5 5l14 14M19 5L5 19"/></svg>';
  b.addEventListener('click',function(e){e.stopPropagation();e.preventDefault();fn();});
  host.prepend(b);return b;
}
