/*
   ========================================================================
   COOPMANAGER.JS - GESTOR DE DESAFIOS EM EQUIPE
   Rastreia e recompensa o desempenho cooperativo.
   ========================================================================
*/

window.CoopManager = {
    STORAGE_KEY: 'domino_coop_stats',

    recordTeamWin: (teamMembers) => {
        const stats = window.safeGetStorage(window.CoopManager.STORAGE_KEY, {"totalCoopWins": 0});
        stats.totalCoopWins++;
        window.safeSetStorage(window.CoopManager.STORAGE_KEY, stats);
        
        if (typeof window.Dashboard !== 'undefined') {
            window.Dashboard.setMessage("BONUS DE TRABALHO EM EQUIPE!", "active");
        }
    },

    getStats: () => {
        return window.safeGetStorage(window.CoopManager.STORAGE_KEY, {"totalCoopWins": 0});
    }
};
