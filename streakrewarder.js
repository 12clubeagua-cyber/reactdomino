/*
   ========================================================================
   STREAKREWARDER.JS - RECOMPENSAS POR SEQUÊNCIA DE VITÓRIAS
   Monitora vitórias consecutivas e aplica multiplicadores de XP.
   ========================================================================
*/

window.StreakRewarder = {
    STORAGE_KEY: 'domino_victory_streak',

    recordResult: (isWin) => {
        let streak = parseInt(window.safeGetStorage(window.StreakRewarder.STORAGE_KEY, '0'));
        
        if (isWin) {
            streak++;
            window.safeSetStorage(window.StreakRewarder.STORAGE_KEY, streak);
            if (streak > 1) {
                window.Dashboard.setMessage(`STREAK DE VITÓRIAS: ${streak}x`, 'active');
            }
        } else {
            streak = 0;
            window.safeSetStorage(window.StreakRewarder.STORAGE_KEY, '0');
        }
        return streak;
    },

    getMultiplier: () => {
        const streak = parseInt(window.safeGetStorage(window.StreakRewarder.STORAGE_KEY, '0'));
        return 1.0 + (streak * 0.2); // +20% XP por vitória consecutiva
    }
};
