/*
   ========================================================================
   TRAININGENGINE.JS - MOTOR DE TREINAMENTO E SANDBOX
   Permite manipulação livre do tabuleiro para prática estratégica.
   ========================================================================
*/

window.TrainingEngine = {
    active: false,

    activate: () => {
        window.TrainingEngine.active = true;
        window.netMode = 'offline';
        window.STATE.isOver = false;
        window.Dashboard.setMessage("MODO SANDBOX: Clique para colocar pecas");
        
        // Desbloqueia a manipulação do tabuleiro
        document.getElementById('board-container').onclick = (e) => {
            if (!window.TrainingEngine.active) return;
            // Lógica simplificada de teste de colocação (mock)
            console.log("Posição de clique registrada para teste.");
        };
    },

    deactivate: () => {
        window.TrainingEngine.active = false;
        document.getElementById('board-container').onclick = null;
    }
};
