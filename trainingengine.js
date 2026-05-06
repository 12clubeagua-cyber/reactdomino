/*
   ========================================================================
   TRAININGENGINE.JS - MOTOR DE TREINAMENTO E SANDBOX
   Permite manipulacao livre do tabuleiro para pratica estrategica.
   ========================================================================
*/

window.TrainingEngine = {
    active: false,

    activate: () => {
        window.TrainingEngine.active = true;
        window.netMode = 'offline';
        window.STATE.isOver = false;
        window.Dashboard.setMessage("MODO SANDBOX: Clique para colocar pecas");
        
        // Desbloqueia a manipulacao do tabuleiro
        document.getElementById('board-container').onclick = (e) => {
            if (!window.TrainingEngine.active) return;
            // Logica simplificada de teste de colocacao (mock)
            console.log("Posicao de clique registrada para teste.");
        };
    },

    deactivate: () => {
        window.TrainingEngine.active = false;
        document.getElementById('board-container').onclick = null;
    }
};
