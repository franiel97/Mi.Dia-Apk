/* Mi.Día – regras de gamificação: conquistas */
'use strict';
window.GAME = window.GAME || {};
Object.assign(window.GAME, {
  achievements: [
    { id: 'c1',   icon: '🎯', name: 'Primeira Vitória',     desc: 'Conclua 1 tarefa' },
    { id: 'c10',  icon: '✅', name: 'Pegando o Jeito',      desc: 'Conclua 10 tarefas' },
    { id: 'c50',  icon: '🚀', name: 'Em Órbita',            desc: 'Conclua 50 tarefas' },
    { id: 'c100', icon: '💯', name: 'Centenário',           desc: 'Conclua 100 tarefas' },
    { id: 's7',   icon: '🔥', name: 'Semana em Chamas',     desc: '7 dias seguidos' },
    { id: 's30',  icon: '🌋', name: 'Constância Total',     desc: '30 dias seguidos' },
    { id: 'wk',   icon: '🧘', name: 'Semana Zen',           desc: 'Semana sem atrasos' },
    { id: 'th',   icon: '🎨', name: 'Visual Próprio',       desc: 'Desbloqueie um tema' }
  ]
});
