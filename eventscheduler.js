/*
   ========================================================================
   EVENTSCHEDULER.JS - GESTOR DE EVENTOS E TORNEIOS
   Gerencia o agendamento de torneios diarios e exibe contagem regressiva.
   ========================================================================
*/

window.EventScheduler = {
    // Torneio diario as 20h
    getNextTournamentTime: () => {
        const now = new Date();
        const target = new Date();
        target.setHours(20, 0, 0, 0);
        if (now > target) target.setDate(target.getDate() + 1);
        return target;
    },

    init: () => {
        const update = () => {
            const target = window.EventScheduler.getNextTournamentTime();
            const diff = target - new Date();
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            
            const display = document.getElementById('tournament-timer');
            if (display) {
                display.innerText = `Prox. Torneio em: ${hours}h ${minutes}m ${seconds}s`;
            }
        };
        setInterval(update, 1000);
    }
};
