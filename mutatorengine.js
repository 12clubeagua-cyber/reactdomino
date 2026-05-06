/*
   ========================================================================
   MUTATORENGINE.JS - MOTOR DE MODIFICADORES DE PARTIDA
   Injeta regras dinamicas e modificadores na logica de jogo.
   ========================================================================
*/

window.MutatorEngine = {
    activeMutators: [],

    apply: (mutators) => {
        window.MutatorEngine.activeMutators = mutators;
    },

    getScoreModifier: (baseScore) => {
        if (window.MutatorEngine.activeMutators.includes('DOUBLE_POINTS')) {
            return baseScore * 2;
        }
        return baseScore;
    },

    isMoveAllowed: (tile) => {
        if (window.MutatorEngine.activeMutators.includes('NO_DOUBLES') && tile[0] === tile[1]) {
            return false;
        }
        return true;
    }
};
