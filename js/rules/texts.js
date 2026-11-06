/* Mi.Día – regras de gamificação: textos do pop-up */
'use strict';
window.GAME = window.GAME || {};
Object.assign(window.GAME, {
  rules: [
    { text: 'Concluir uma tarefa no prazo',                                         points: 'onTime' },
    { text: 'Concluir uma tarefa fora do prazo',                                    points: 'late' },
    { text: 'Dia perfeito: concluir todas as tarefas do dia (mínimo de {0})',       points: 'perfectDay' },
    { text: 'Dia fechado em sequência (a partir de {2} dias seguidos)',             points: 'streak' },
    { text: 'Bônus a cada 7 dias seguidos',                                         points: 'streakWeek' },
    { text: 'Semana sem tarefas atrasadas (mínimo de {0} tarefas)',                 points: 'weekClean' },
    { text: 'Concluir uma tarefa com checklist (2 itens ou mais)',                  points: 'checklist' },
    { text: 'Criar uma tarefa',                                                     points: 'create' },
    { text: 'Adicionar uma tarefa a um dia',                                        points: 'addDay' },
    { text: 'Editar uma tarefa (1 vez por tarefa a cada dia)',                      points: 'edit' }
  ],
  notes: [
    'Cada tarefa pontua uma única vez.',
    'Pontos gastos em trocas não reduzem o seu nível.',
    'Planejamento (criar, adicionar e editar) rende até {4} pontos por dia. Criar e adicionar pontuam uma vez por tarefa.',
    'Limite de {1} pontos por dia (o bônus de dia perfeito não conta no limite).'
  ]
});
