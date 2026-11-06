/* aplica o tema e o modo salvos antes da primeira pintura */
try{var L=JSON.parse(localStorage.getItem('planner-diario-look-v1')||'{}'),R=document.documentElement;
if(L.skin==='fofo'||L.skin==='tech'||L.skin==='floresta'||L.skin==='caderno')R.dataset.skin=L.skin;
if(L.mode==='light'||L.mode==='dark')R.dataset.mode=L.mode;}catch(e){}
