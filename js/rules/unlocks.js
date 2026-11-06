/* Mi.Día – regras de gamificação: trocas por pontos (temas e recursos) */
'use strict';
window.GAME = window.GAME || {};
Object.assign(window.GAME, {
  /* themes: custo em pontos para desbloquear cada tema (o padrão é livre). Use { cost, level } para exigir também um nível mínimo. Pontos gastos não reduzem o nível. */
  /* features: recursos liberados por troca de pontos (uma vez, para sempre). */
  features: { copyWeek: { name: 'Copiar tarefas', cost: 60 } },
  themes: {
    fofo: 150, tech: 150, glass: 800,
    floresta: { cost: 250, level: 2 },   /* exige o nível 2 (índice em levels) além dos pontos */
    caderno:  { cost: 600, level: 3 }
  }
});
