/*
   ========================================================================
   PROGRESSIONMANAGER.JS - SISTEMA DE XP E NIVEIS
   Gerencia a progressao do jogador com base em vitorias.
   ========================================================================
*/

window.ProgressionManager = {
    STORAGE_KEY: 'domino_progression',

    get: () => {
        return window.safeGetStorage(window.ProgressionManager.STORAGE_KEY, { xp: 0, level: 1 });
    },

    addXp: (amount) => {
        const p = window.ProgressionManager.get();
        p.xp += amount;
        
        // Simples calculo de nivel: a cada 100 XP sobe de nivel
        p.level = Math.floor(p.xp / 100) + 1;
        
        window.safeSetStorage(window.ProgressionManager.STORAGE_KEY, p);
        return p;
    }
};
