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
    },

    getSummary: () => {
        return window.Analytics.moveTimes.map(times => {
            if (times.length === 0) return 0;
            const sum = times.reduce((a, b) => a + b, 0);
            return Math.round(sum / times.length); // Media em ms
        });
    }
};

window.Analytics.start();
