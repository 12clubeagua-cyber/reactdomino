/*
   ========================================================================
   STREAKMANAGER.JS - GESTOR DE SEQUÊNCIA (STREAK)
   Rastreia dias consecutivos de jogo e define multiplicadores de XP.
   ========================================================================
*/

window.StreakManager = {
    STORAGE_KEY: 'domino_streak',

    init: function() {
        const today = new Date().toDateString();
        const data = JSON.parse(localStorage.getItem(window.StreakManager.STORAGE_KEY) || '{"lastLogin": null, "count": 0}');
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (data.lastLogin === today) return data; // Já logou hoje

        if (data.lastLogin === yesterday.toDateString()) {
            data.count++;
        } else {
            data.count = 1;
        }
        
        data.lastLogin = today;
        localStorage.setItem(window.StreakManager.STORAGE_KEY, JSON.stringify(data));
        return data;
    },

    getMultiplier: function() {
        const data = window.StreakManager.init();
        // Multiplicador: 1.0x (base), +0.1x por dia de streak (max 2.0x)
        return Math.min(1.0 + (data.count * 0.1), 2.0);
    }
};

window.StreakManager.init();
