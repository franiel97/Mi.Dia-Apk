/* Mi.Día – Tutorial de primeiro acesso */
'use strict';

/* Tutorial (primeira versão, conteúdo básico) */
/* ---------- Tutorial de primeiro acesso (slides) ---------- */
var tutEl=null,tutTimer=null,tutKeyFn=null,tutRedraw=null;
function tutClose(){
  if(!tutEl)return;
  clearInterval(tutTimer);document.removeEventListener('keydown',tutKeyFn,true);
  tutEl.remove();tutEl=null;tutRedraw=null;
  try{localStorage.setItem('planner-diario-tut-v1','1');}catch(e){}
  if(tutAuto){tutAuto=false;setTimeout(gameIntro,350);}
}
var tutAuto=false;
/* Imagens do tutorial: para trocar por GIFs, basta colocar o arquivo na pasta "tutorial" e ajustar o caminho abaixo (ex.: 'tutorial/quadro.gif'). */
var TUT_IMG={
  logo:'icons/icon-192.png',
  /*tema:'tutorial/tema.png',*/
  quadro:'tutorial/quadro.gif',
  dash:'tutorial/dash.gif',
  calendario:'tutorial/calendario.gif',
  backup:'tutorial/backup.gif',
  perfil:'tutorial/perfil.gif',
  configuracoes:'tutorial/configuracoes.gif',
  limpeza:'tutorial/limpeza.gif'
};
function tutShot(k,alt){
  var f=el('figure','tut-fig'),im=document.createElement('img');
  im.className='tut-shot';im.src=TUT_IMG[k];im.alt=alt||'';im.loading='lazy';im.draggable=false;
  im.addEventListener('error',function(){f.hidden=true;});
  f.append(im);return f;
}
function tutLogo(){
  var d=el('div','tut-logo'),im=document.createElement('img');
  im.src=TUT_IMG.logo;im.alt='Mi.Día';im.draggable=false;
  im.addEventListener('error',function(){d.innerHTML='<svg viewBox="0 0 96 96" aria-hidden="true"><rect width="96" height="96" rx="24" fill="var(--accent)"/><path d="M26 50l15 15 29-32" fill="none" stroke="var(--accent-ink,#fff)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>';});
  d.append(im);return d;
}
/* ordem dos slides: 1 boas-vindas, 2 tema, 3 quadro, 4 calendario, 5 dash, 6 notificacoes, 7 perfil, 8 backup, 9 limpeza, 10 configuracoes, 11 final */
function tutSlide(i){
  var d=el('div','tut-slide');
  function add(t,p,img,q){
    d.append(el('h2','tut-h',t),el('p','tut-p',p));
    if(img)d.append(tutShot(img,t));
    if(q)d.append(el('p','tut-p tut-q',q));
  }
  if(i===0){
    d.classList.add('ctr');d.append(tutLogo(),el('h2','tut-h',__("Bem-vindo ao Mi.Día")),el('p','tut-p',__("Seu dia, do jeito que ele acontece. O Mi.Día é um planner simples para criar tarefas, encaixá-las nos dias da semana e acompanhar o que já foi feito, sem complicação e direto no seu aparelho.")));
    var lg=el('div','tut-langs');lg.append(el('p','tut-lang-lab','Idioma · Language · Idioma'));
    var lr=el('div','tut-lang-row');
    Object.keys(I18N.langs).forEach(function(c){var b=el('button','tut-lang'+(c===LANG?' on':''),I18N.langs[c]);b.type='button';b.setAttribute('aria-pressed',String(c===LANG));b.lang=c;b.addEventListener('click',function(){setLang(c);if(tutRedraw)tutRedraw();});lr.append(b);});
    lg.append(lr);d.append(lg);
  }else if(i===1){
    add(__("Escolha o seu visual"),__("Cada tema muda cores, fontes e o clima do app, e ainda dá para alternar entre modo claro e escuro e trocar o idioma. Tudo isso fica em Configurações, mas você já pode escolher um tema aqui mesmo:"),'tema');
    var th=el('div','tut-themes');
    function tmark(){Array.prototype.forEach.call(th.children,function(x){x.setAttribute('aria-pressed',String(x.dataset.skin===(look.skin||'padrao')));});}
    ['padrao','fofo','tech','glass','floresta','caderno'].forEach(function(k){
      var b=el('button','skin-opt');b.type='button';b.dataset.skin=k;
      var dt=el('span','dots');dt.setAttribute('aria-hidden','true');dt.append(document.createElement('i'),document.createElement('i'),document.createElement('i'));
      b.append(dt,el('span','nm',__(SKIN_NAMES[k])));
      b.addEventListener('click',function(){var o=document.querySelector('#look [data-skin="'+k+'"]');if(o)o.click();tmark();});
      th.append(b);
    });
    tmark();d.append(th);
  }else if(i===2)add(__("Crie tarefas e distribua pela semana"),__("Digite um título, escolha uma cor e pronto: a tarefa nasce na lista. Daí é só arrastá-la até o dia desejado, ou tocar no + para definir dias, horário e uma lista de passos. Veja dois exemplos:"),'quadro',__("É no Quadro que você manda: marque como concluída, edite, mude de dia e acompanhe o que está atrasado."));
  else if(i===3)add(__("O mês inteiro de relance"),__("No Calendário, bolinhas coloridas mostram os dias com tarefas, e dá para arrastar uma tarefa direto para um dia do mês. Já o Dash conta a história do seu progresso: quanto você concluiu, o que ficou atrasado e como a semana evoluiu."),'calendario');
  else if(i===4)add(__("Seu progresso em números"),__("O Dash transforma suas tarefas em gráficos. Escolha o período (semana, mês ou ano) e o status, veja quantas tarefas foram concluídas, ficaram pendentes ou atrasadas, confira o total de tarefas de cada dia e descubra seus melhores e piores dias. Toque nos números do gráfico para ver quais tarefas estão por trás deles."),'dash');
  else if(i===5){
    add(__("Avisos na hora certa"),__("Ative em Configurações e o Mi.Día avisa 10 minutos antes do início e do prazo das tarefas com horário. Dica: instale o app no celular para os avisos chegarem melhor. Com o app fechado, o sistema do aparelho pode atrasar ou limitar as notificações."),'notificacoes');
    var nb=el('button','primary tut-cta'),nm=el('p','tut-p tut-q');nb.type='button';
    function nsync(){
      var on=notifActive(),pm=notifPerm();
      nb.textContent=on?__('Notificações ativadas'):__('Ativar notificações');nb.disabled=on||pm==='unsupported'||pm==='denied';
      nm.textContent=pm==='unsupported'?__('Este navegador não oferece notificações.'):(pm==='denied'?__('As notificações estão bloqueadas. Libere nas permissões do site no navegador ou no sistema.'):'');nm.hidden=!nm.textContent;
    }
    nb.addEventListener('click',function(){toggleNotif(true);nsync();setTimeout(nsync,600);setTimeout(nsync,2500);});
    nsync();d.append(nb,nm);
  }
  else if(i===6)add(__("Seu perfil"),__("No ícone de perfil, ao lado das notificações, você cuida da sua conta: nome de exibição, e-mail, data de nascimento e, para quem entra com login e senha, também a senha. Quem entra pelo Google tem o e-mail preenchido automaticamente."),'perfil',__("Quer separar os seus dados dos de outras pessoas? Entre com o Google ou crie um login e senha: cada conta tem as suas próprias tarefas e configurações. A sincronização na nuvem é o próximo passo; por enquanto, tudo continua neste aparelho."));
  else if(i===7)add(__("Seus dados ficam com você"),__("Tudo o que você cria fica guardado neste aparelho, no próprio navegador. Para levar com você, exporte um backup em Configurações e importe em outro aparelho quando quiser."),'backup');
  else if(i===8)add(__("Limpeza com cuidado"),__("Na área de Limpeza, em Configurações, você apaga de uma vez as tarefas atribuídas aos dias ou tudo o que criou. As limpezas rápidas do Quadro e do Calendário preservam os dias anteriores; estas aqui levam tudo, inclusive o passado. São ações definitivas e sempre pedem confirmação, e um backup recente é o seu paraquedas."),'limpeza');
  else if(i===9)add(__("Tudo em um só lugar"),__("Na engrenagem, no canto superior direito, ficam o tema, o modo claro ou escuro, o idioma, as notificações, o backup, a limpeza e este tutorial. Sempre que quiser mudar algo no app, é lá que você vai."),'configuracoes');
  else{d.classList.add('ctr');d.append(tutLogo(),el('h2','tut-h',__("Bom uso do Mi.Día!")),el('p','tut-p',__("Quer rever este passo a passo? Em Configurações, no cartão Tutorial, é só tocar em “Abrir tutorial” sempre que quiser. Agora é com você: respire fundo, crie a primeira tarefa e deixe o dia fluir.")));}
  return d;
}
function openTutorial(auto){
  if(tutEl)return;
  tutAuto=auto===true;
  try{localStorage.setItem('planner-diario-tut-v1','1');}catch(e){}
  var i=0,N=11,ready=false,xb=null;
  var back=el('div','tut-back'),card=el('div','tut-card'),body=el('div','tut-body'),dots=el('div','tut-dots'),foot=el('div','tut-foot');
  back.setAttribute('role','dialog');back.setAttribute('aria-modal','true');back.setAttribute('aria-label',__("Tutorial do Mi.Día"));
  card.append(body,dots,foot);back.append(card);document.body.append(back);tutEl=back;
  function closable(){return i===N-2||(i===N-1&&ready);}
  function go(n){i=Math.max(0,Math.min(N-1,n));draw();}
  function draw(){
    clearInterval(tutTimer);
    body.textContent='';body.append(tutSlide(i));body.scrollTop=0;
    dots.textContent='';for(var k=0;k<N;k++)dots.append(el('span',k===i?'on':''));gameSkins();
    if(xb){xb.remove();xb=null;}
    foot.textContent='';
    var left=el('div','tut-l'),right=el('div','tut-r');
    if(i>0){var bk=el('button','btn-alt',__("Voltar"));bk.type='button';bk.addEventListener('click',function(){go(i-1);});left.append(bk);}
    if(i<N-2){var sk=el('button','tut-skip',__("Pular tutorial"));sk.type='button';sk.addEventListener('click',function(){go(0);});left.append(sk);}
    if(i<N-1){var nx=el('button','primary',__("Próximo"));nx.type='button';nx.addEventListener('click',function(){go(i+1);});right.append(nx);}
    else{
      var fin=el('button','primary',ready?__("Começar a usar"):__("Começar a usar ({0})",3));fin.type='button';fin.disabled=!ready;
      fin.addEventListener('click',function(){if(ready){tutClose();setView('board');}});right.append(fin);
      if(!ready){var s=3;tutTimer=setInterval(function(){s--;if(s<=0){clearInterval(tutTimer);ready=true;fin.disabled=false;fin.textContent=__("Começar a usar");xb=popX(card,tutClose);}else fin.textContent=__("Começar a usar ({0})",s);},1000);}
    }
    foot.append(left,right);
    if(closable())xb=popX(card,tutClose);
  }
  tutKeyFn=function(e){
    if(e.key==='ArrowRight'&&i<N-1){e.stopPropagation();go(i+1);}
    else if(e.key==='ArrowLeft'&&i>0){e.stopPropagation();go(i-1);}
    else if(e.key==='Escape'&&closable()){e.stopPropagation();tutClose();}
  };
  document.addEventListener('keydown',tutKeyFn,true);
  tutRedraw=draw;tutRedraw=draw;draw();
}
$('#tutorial-open').addEventListener('click',openTutorial);
