/*
   ========================================================================
   TOURNAMENTHUB.JS - HUB DE TORNEIOS
   Exibe salas de torneios publicos disponiveis.
   ========================================================================
*/

window.TournamentHub = {
    render: () => {
        const lobby = document.getElementById('step-mode');
        if (!lobby) return;

        let hub = document.getElementById('tournament-hub');
        if (!hub) {
            hub = document.createElement('div');
            hub.id = 'tournament-hub';
            hub.className = 'glass';
            hub.style.cssText = 'margin-top:20px; padding:10px; width:100%;';
            lobby.appendChild(hub);
        }

        hub.innerHTML = `<h3>Torneios em Destaque</h3>
                         <div class="start-sub">Nenhum torneio publico no momento.</div>`;
    }
};
