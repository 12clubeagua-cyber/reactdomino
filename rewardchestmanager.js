/*
   ========================================================================
   REWARDCHESTMANAGER.JS - GESTOR DE BAÚ DE RECOMPENSAS
   Gerencia a entrega diária de prêmios ao jogador.
   ========================================================================
*/

window.RewardChestManager = {
    STORAGE_KEY: 'domino_daily_chest',

    canClaim: () => {
        const lastClaim = localStorage.getItem(window.RewardChestManager.STORAGE_KEY);
        const today = new Date().toDateString();
        return lastClaim !== today;
    },

    claim: () => {
        if (!window.RewardChestManager.canClaim()) return;
        
        localStorage.setItem(window.RewardChestManager.STORAGE_KEY, new Date().toDateString());
        
        const xpReward = 100;
        window.ProgressionManager.addXp(xpReward);
        window.Dashboard.setMessage(`BAU ABERTO! +${xpReward} XP`, 'active');
        
        // Efeito visual
        if (typeof window.spawnConfetti === 'function') window.spawnConfetti();
    }
};
