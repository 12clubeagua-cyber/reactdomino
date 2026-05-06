/*
   ========================================================================
   GHOSTENGINE.JS - MOTOR DE JOGADAS FANTASMAS
   Sobrepõe replays históricos ao tabuleiro atual para análise tática.
   ========================================================================
*/

window.GhostEngine = {
    active: false,
    history: [],

    activate: (replayData) => {
        window.GhostEngine.history = replayData;
        window.GhostEngine.active = true;
        window.Dashboard.setMessage("MODO FANTASMA: Replay ativado");
    },

    renderGhosts: (currentState) => {
        if (!window.GhostEngine.active) return;
        
        // Sobrepõe os eventos do replay sobre a mesa atual
        window.GhostEngine.history.forEach(event => {
            if (event.type === 'play') {
                // Renderiza tile semitransparente na posição lógica
                window.Renderer.drawGhostTile(event.data);
            }
        });
    }
};
