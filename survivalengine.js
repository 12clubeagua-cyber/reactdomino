/*
   ========================================================================
   SURVIVALENGINE.JS - MOTOR DE SOBREVIVÊNCIA
   Escala a dificuldade reduzindo o tempo de turno progressivamente.
   ========================================================================
*/

window.SurvivalEngine = {
    // Reduz 1 segundo do tempo de turno a cada rodada, mínimo de 3 segundos.
    getDynamicTurnTime: (initialTime, roundCount) => {
        const reduction = roundCount * 1;
        return Math.max(3, initialTime - reduction);
    }
};
