/*
   ========================================================================
   REWARDENGINE.JS - MOTOR DE RECOMPENSAS DE SESSÃO
   Recompensa jogadores por tempo dedicado ao jogo.
   ========================================================================
*/

window.RewardEngine = {
    sessionStart: Date.now(),
    milestones: [10, 30, 60], // Minutos

    check: () => {
        const elapsedMinutes = Math.floor((Date.now() - window.RewardEngine.sessionStart) / 60000);
        window.RewardEngine.milestones.forEach(m => {
            if (elapsedMinutes >= m && !window.safeGetStorage(`reward_${m}`, null)) {
                window.safeSetStorage(`reward_${m}`, 'true');
                window.ProgressionManager.addXp(m * 10);
                window.Dashboard.setMessage(`RECOMPENSA: ${m} min de jogo!`, 'active');
            }
        });
    }
};

setInterval(window.RewardEngine.check, 60000); // Checa a cada minuto
