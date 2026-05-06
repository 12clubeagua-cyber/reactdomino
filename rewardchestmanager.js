/*
   ========================================================================
   REWARDCHESTMANAGER.JS - GESTOR DE BAÚ DE RECOMPENSAS
   Gerencia a entrega diária de prêmios ao jogador.
   ========================================================================
*/

window.RewardChestManager = {
    STORAGE_KEY: 'domino_daily_chest',

    canClaim: () => {
        const lastClaim = window.safeGetStorage(window.RewardChestManager.STORAGE_KEY, null);
        const today = new Date().toDateString();
        return lastClaim !== today;
    },

    claim: () => {
        if (!window.RewardChestManager.canClaim()) return;
        
        window.safeSetStorage(window.RewardChestManager.STORAGE_KEY, new Date().toDateString());
        
        const xpReward = 100;
        window.ProgressionManager.addXp(xpReward);
        window.Dashboard.setMessage(`BAU ABERTO! +${xpReward} XP`, 'active');
        
        // Efeito visual
        if (typeof window.spawnConfetti === 'function') window.spawnConfetti();
    }
};
