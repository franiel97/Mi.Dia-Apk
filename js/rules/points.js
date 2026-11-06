/* gamification.js - regras de pontuação e níveis do Mi.Día (arquivo separado do HTML).
 *
 * Como editar
 *  - enabled: false desliga toda a gamificação (some o ícone do cabeçalho e do Perfil).
 *  - points: pontos de cada ação. dailyCap: limite de pontos por dia (o bônus de dia perfeito não entra no limite).
 *  - perfectDay.minTasks: mínimo de tarefas no dia para valer o "dia perfeito".
 *  - levels: nome, ícone (emoji) e pontos mínimos de cada nível, em ordem crescente (o primeiro deve ter min 0).
 *  - rules / notes: textos mostrados no pop-up. Em português; as traduções ficam no i18n.js (o texto é a chave).
 *    Nos textos, {0} = perfectDay.minTasks e {1} = dailyCap.
 * Cada tarefa pontua uma única vez (marcar e desmarcar de novo não gera pontos).
 */
/* Mi.Día – regras de gamificação: regras de pontos */
'use strict';
window.GAME = window.GAME || {};
Object.assign(window.GAME, {
  enabled: true,
  points: { onTime: 10, late: 5, perfectDay: 20, streak: 5, streakWeek: 30, weekClean: 25, checklist: 3, create: 3, addDay: 1, edit: 1 },
  planCap: 20, /* limite diário de pontos de planejamento (criar, adicionar ao dia e editar) */
  streak: { from: 3 },
  perfectDay: { minTasks: 3 },
  dailyCap: 150
});
