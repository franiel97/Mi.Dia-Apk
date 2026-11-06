/* Mi.Día – regras de gamificação: níveis */
'use strict';
window.GAME = window.GAME || {};
Object.assign(window.GAME, {
  levels: [
    { name: 'Primeiro Passo',       icon: '🌱', min: 1 },
    { name: 'Ritmo Aceso',          icon: '🔥', min: 100 },
    { name: 'Rota Traçada',         icon: '🧭', min: 300 },
    { name: 'Foco Inabalável',      icon: '⚡', min: 700 },
    { name: 'Mestre da Rotina',     icon: '🏆', min: 1500 },
    { name: 'Lenda da Constância',  icon: '👑', min: 3000 }
  ]
});
