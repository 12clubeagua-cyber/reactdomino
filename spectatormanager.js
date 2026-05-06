/*
   ========================================================================
   SPECTATORMANAGER.JS - GESTOR DE ESPECTADORES
   Gerencia conexões de leitura apenas (read-only) para partidas.
   ========================================================================
*/

window.SpectatorManager = {
    isSpectator: false,

    enable: function() {
        this.isSpectator = true;
        // Oculta a interface de jogador (mão) e exibe apenas a mesa
        const hand0 = document.getElementById('hand-0');
        if (hand0) hand0.style.display = 'none';
        window.Dashboard.setMessage("MODO ESPECTADOR: Apenas observando");
    }
};
