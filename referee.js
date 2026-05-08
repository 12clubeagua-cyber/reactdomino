/* 
   ========================================================================
   REFEREE.JS - O JUIZ (VERSAO BLINDADA)
   Responsavel pelas regras de pontuacao, vitoria e inicio de rodada.
   ======================================================================== 
*/

window.Referee = {
    // Definicoes de Regras
    MODES: {
        STANDARD: 'standard',
        CLOSED: 'closed'
    },

    /**
     * Define quem deve comecar a rodada baseando-se no modo de jogo.
     */
    getInitialPlayer: function(hands, lastWinner, mode = 'standard') {
        if (lastWinner !== null && lastWinner >= 0 && lastWinner <= 3) return lastWinner;

        let starter = 0;
        if (Array.isArray(hands)) {
            hands.forEach((hand, playerIdx) => {
                if (Array.isArray(hand)) {
                    // Bucha de 6 inicia o jogo padrao
                    const hasBucha6 = hand.some(tile => tile[0] === 6 && tile[1] === 6);
                    if (hasBucha6) starter = playerIdx;
                }
            });
        }
        return starter;
    },

    /**
     * Calcula o resultado com suporte a modos de jogo.
     */
    calculateBlockResult: function(hands, mode = 'standard') {
        if (!Array.isArray(hands) || hands.length < 4) {
            return { winTeam: -1, detail: "Erro na contagem.", isDraw: true, points: 0 };
        }

        // OTIMIZACAO ES2024: Agrupamos os indices dos jogadores por time (0 ou 1)
        // Isso torna a logica de soma de duplas muito mais limpa e flexivel.
        const teams = Object.groupBy([0, 1, 2, 3], (pIdx) => (pIdx % 2));
        
        const sumA = teams[0].reduce((sum, idx) => sum + window.Referee._sumHandPoints(hands[idx]), 0);
        const sumB = teams[1].reduce((sum, idx) => sum + window.Referee._sumHandPoints(hands[idx]), 0);

        let winTeam = -1;
        let detail = `Sua Dupla: ${sumA} pts | Oponentes: ${sumB} pts`;

        // Logica de vitoria condicional
        if (sumA < sumB) {
            winTeam = 0;
        } else if (sumB < sumA) {
            winTeam = 1;
        }

        return {
            winTeam: winTeam,
            detail: detail,
            isDraw: (winTeam === -1),
            points: 1
        };
    },

    _sumHandPoints: function(hand) {
        if (!Array.isArray(hand)) return 0;
        return hand.reduce((total, tile) => total + (tile[0] || 0) + (tile[1] || 0), 0);
    }
};