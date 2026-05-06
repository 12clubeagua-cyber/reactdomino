/*
   ========================================================================
   HINTMANAGER.JS - ASSISTENTE ESTRATÉGICO
   Sugere jogadas ideais utilizando o motor de pesos da IA.
   ========================================================================
*/

window.HintManager = {
    /**
     * Calcula a melhor jogada e a exibe visualmente por um curto período.
     */
    showHint: function() {
        const myIdx = window.myPlayerIdx ?? 0;
        const hand = window.STATE?.hands?.[myIdx];
        if (!hand || !window.getMoves) return;

        const moves = window.getMoves(hand);
        if (moves.length === 0) {
            window.Dashboard.setMessage("Nenhuma jogada possivel.");
            return;
        }

        // Utiliza o motor de peso existente no bots.js
        let bestMove = null;
        let highestWeight = -Infinity;

        moves.forEach(m => {
            const sides = (m.side === 'both') ? [0, 1] : [(m.side === 'any' ? 0 : m.side)];
            sides.forEach(s => {
                const weight = window.calculateWeight(myIdx, hand[m.idx], s);
                if (weight > highestWeight) {
                    highestWeight = weight;
                    bestMove = { ...m, side: s };
                }
            });
        });

        if (bestMove) {
            const el = document.getElementById(`my-tile-${bestMove.idx}`);
            if (el) {
                el.style.outline = '4px solid #fff';
                el.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    el.style.outline = '';
                    el.style.transform = '';
                }, 2000);
            }
        }
    }
};
