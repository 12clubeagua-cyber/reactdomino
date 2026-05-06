/*
   ========================================================================
   CHALLENGEMANAGER.JS - GESTOR DE DESAFIOS DIARIOS
   Gera e rastreia metas diarias para aumentar a retencao.
   ========================================================================
*/

window.ChallengeManager = {
    STORAGE_KEY: 'domino_daily_challenge',
    
    challenges: [
        { id: 'PLAY_2', desc: 'Jogue 2 partidas', target: 2 },
        { id: 'WIN_1', desc: 'Venca 1 partida', target: 1 },
        { id: 'USE_BUCHA', desc: 'Jogue 3 buchas', target: 3 }
    ],

    init: function() {
        const today = new Date().toDateString();
        const data = window.safeGetStorage(window.ChallengeManager.STORAGE_KEY, {});
        
        if (data.date !== today) {
            // Gera novo desafio
            const random = window.ChallengeManager.challenges[Math.floor(Math.random() * window.ChallengeManager.challenges.length)];
            const newData = { date: today, id: random.id, progress: 0, target: random.target, completed: false };
            window.safeSetStorage(window.ChallengeManager.STORAGE_KEY, newData);
            return newData;
        }
        return data;
    },

    updateProgress: function(id) {
        const data = window.ChallengeManager.init();
        if (data.id === id && !data.completed) {
            data.progress++;
            if (data.progress >= data.target) {
                data.completed = true;
                if (typeof window.Dashboard !== 'undefined') {
                    window.Dashboard.setMessage("DESAFIO DIARIO CONCLUIDO!", "active");
                }
            }
            window.safeSetStorage(window.ChallengeManager.STORAGE_KEY, data);
        }
    }
};
