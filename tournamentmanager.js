/*
   ========================================================================
   TOURNAMENTMANAGER.JS - GESTOR DE COMPETIÇÕES
   Gerencia chaves de torneio e progressão de rodadas.
   ========================================================================
*/

window.TournamentManager = {
    active: false,
    bracket: [],

    start: function(playerNames) {
        window.TournamentManager.active = true;
        window.TournamentManager.bracket = playerNames.map((name, i) => ({
            name, id: i, wins: 0
        }));
        console.log("Torneio iniciado com:", window.TournamentManager.bracket);
    },

    registerWin: function(winnerIdx) {
        if (!window.TournamentManager.active) return;
        const player = window.TournamentManager.bracket.find(p => p.id === winnerIdx);
        if (player) {
            player.wins++;
            if (player.wins >= 3) {
                window.Dashboard.setMessage(`CAMPEAO DO TORNEIO: ${player.name}!`, 'active');
                window.TournamentManager.active = false;
            }
        }
    }
};
