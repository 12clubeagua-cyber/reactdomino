/*
   ========================================================================
   ANALYTICS.JS - RASTREAMENTO DE METRICAS
   Monitora desempenho de jogo de forma nao invasiva.
   ========================================================================
*/

window.Analytics = {
    sessionStart: null,
    moveTimes: [[], [], [], []], // Tempos de decisao por jogador
    
    start: () => {
        window.Analytics.sessionStart = Date.now();
    },

    recordMove: (pIdx, timeMs) => {
        if (pIdx >= 0 && pIdx < 4) {
            window.Analytics.moveTimes[pIdx].push(timeMs);
        }
    }
};

window.Analytics.start();
