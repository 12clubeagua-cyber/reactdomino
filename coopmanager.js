/*
   ========================================================================
   COOPMANAGER.JS - GESTOR DE DESAFIOS EM EQUIPE
   Rastreia e recompensa o desempenho cooperativo.
   ========================================================================
*/

window.CoopManager = {
    STORAGE_KEY: 'domino_coop_stats',

    recordTeamWin: (teamMembers) => {
        const stats = JSON.parse(localStorage.getItem(window.CoopManager.STORAGE_KEY) || '{"totalCoopWins": 0}');
        stats.totalCoopWins++;
        localStorage.setItem(window.CoopManager.STORAGE_KEY, JSON.stringify(stats));
        
        if (typeof window.Dashboard !== 'undefined') {
            window.Dashboard.setMessage("BONUS DE TRABALHO EM EQUIPE!", "active");
        }
    },

    getStats: () => {
        return JSON.parse(localStorage.getItem(window.CoopManager.STORAGE_KEY) || '{"totalCoopWins": 0}');
    }
};
