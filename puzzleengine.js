/*
   ========================================================================
   PUZZLEENGINE.JS - MOTOR DE DESAFIOS TÁTICOS
   Carrega e valida cenários de dominó predefinidos.
   ========================================================================
*/

window.PuzzleEngine = {
    puzzles: [
        { id: 1, hand: [[1, 2], [2, 3], [3, 4]], extremes: [1, 4], solution: 0 },
        { id: 2, hand: [[6, 6], [6, 1]], extremes: [6, 1], solution: 0 }
    ],

    load: (id) => {
        const puzzle = window.PuzzleEngine.puzzles.find(p => p.id === id);
        if (!puzzle) return;
        
        window.STATE.hands[0] = puzzle.hand;
        window.STATE.extremes = puzzle.extremes;
        window.STATE.positions = [{x: 0, y: 0}];
        window.Dashboard.setMessage("DESAFIO: Encontre a jogada vencedora!");
    },

    verify: (moveIdx, targetIdx) => {
        const puzzle = window.PuzzleEngine.puzzles[0]; // Simplificado
        if (moveIdx === puzzle.solution) {
            window.Dashboard.setMessage("CORRETO!", "active");
        } else {
            window.Dashboard.setMessage("TENTE NOVAMENTE", "pass");
        }
    }
};
