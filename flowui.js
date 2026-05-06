/* 
   ========================================================================
   FLOWUI.JS - O CERIMONIALISTA (VERSÃO BLINDADA)
   Gerencia fluxos de encerramento, transições de rodadas e diálogos.
   ======================================================================== 
*/

window.FlowUI = {
    /**
     * Limpa a interface para preparar o início de uma nova rodada.
     * Resolve o erro: FlowUI.resetForNewRound is not a function.
     */
    resetForNewRound: function() {
        // 1. Esconde qualquer overlay de resultado que esteja visível
        const resArea = document.getElementById('result-area');
        if (resArea) resArea.style.display = 'none';

        // 2. Limpa o destaque de vitória das mãos dos jogadores
        for (let i = 0; i < 4; i++) {
            const handEl = document.getElementById(`hand-${i}`);
            if (handEl) {
                handEl.classList.remove('active-turn');
            }
        }

        // 3. Garante que o seletor de lado (Cima/Baixo) seja fechado
        const picker = document.getElementById('side-picker');
        if (picker) picker.style.display = 'none';

        console.log("FlowUI: Interface limpa para nova rodada.");
    },

    /**
     * Gerencia a exibicao visual do fim de uma rodada.
     */
    endRound: function(winTeam, idx, msg, detail = '') {
        // 1. Revela as maos de todos para transparencia
        if (typeof window.Renderer !== 'undefined' && typeof window.Renderer.drawHands === 'function') {
            window.Renderer.drawHands(true);
        }

        // --- NOVO: Gatilho de Estatísticas ---
        const stats = {
            points: window.STATE.scores.reduce((a, b) => a + b, 0),
            avgMoveTime: window.Analytics.getSummary()[window.myPlayerIdx ?? 0]
        };
        setTimeout(() => window.Dashboard.showMatchStats(stats), 1500);
        
        // 3. Atualiza o placar no Dashboard
        if (typeof window.Dashboard !== 'undefined' && typeof window.Dashboard.updateScore === 'function') {
            window.Dashboard.updateScore();
        }
        
        // 4. Grava na Persistencia
        if (winTeam !== -1) {
            window.FlowUI.saveMatchState();
        }

        // 3. Atualiza o placar no Dashboard
        if (typeof window.Dashboard !== 'undefined' && typeof window.Dashboard.updateScore === 'function') {
            window.Dashboard.updateScore();
        }

        // 7. Verifica se a partida inteira acabou
        const target = (window.STATE && window.STATE.targetScore) ? window.STATE.targetScore : 10;
        const scoreA = (window.STATE && window.STATE.scores) ? window.STATE.scores[0] : 0;
        const scoreB = (window.STATE && window.STATE.scores) ? window.STATE.scores[1] : 0;

        const isMatchOver = (scoreA >= target || scoreB >= target);

        if (isMatchOver) {
            window.FlowUI._handleMatchEnd(target);
        } else {
            window.FlowUI._startNextRoundCountdown(msg);
        }
        },

    /**
     * Salva o estado atual da partida no localStorage para persistencia.
     */
    saveMatchState: function() {
        const stateToSave = {
            scores: window.STATE.scores,
            targetScore: window.STATE.targetScore,
            difficulty: window.STATE.difficulty
        };
        window.safeSetStorage('domino_match_state', stateToSave);
    },

    /**
     * Diálogo de confirmação para sair.
     */
    exitGame: function() {
        if (confirm("Deseja mesmo sair e encerrar a partida?")) {
            window.location.reload();
        }
    },

    /**
     * Encerramento definitivo da partida.
     * @private
     */
    _handleMatchEnd: function(target) {        const myIdx = window.myPlayerIdx || 0;
        const scoreA = (window.STATE && window.STATE.scores) ? window.STATE.scores[0] : 0;
        
        const isMyTeamWinner = (scoreA >= target) 
            ? (myIdx % 2 === 0) 
            : (myIdx % 2 === 1);
            
        const finalMsg = isMyTeamWinner 
            ? "🏆 VOCÊS VENCERAM A PARTIDA!" 
            : "FIM DE JOGO: VITÓRIA DOS OPONENTES";

        if (typeof window.Dashboard !== 'undefined' && typeof window.Dashboard.setMessage === 'function') {
            window.Dashboard.setMessage(finalMsg, 'active');
        }
        
        // Reinicia o jogo após 8 segundos para dar tempo de ver o placar final
        setTimeout(() => window.location.reload(), 8000);
    },

    /**
     * Contador regressivo para a próxima rodada.
     * @private
     */
    _startNextRoundCountdown: function(msg) {
        let timeLeft = 3;
        const timer = setInterval(() => {
            const statusMsg = `${msg} - Próxima rodada em ${timeLeft}s`;
            
            if (typeof window.Dashboard !== 'undefined' && typeof window.Dashboard.setMessage === 'function') {
                window.Dashboard.setMessage(statusMsg, 'active');
            }
            
            timeLeft--;
            
            if (timeLeft < 0) {
                clearInterval(timer);
                // Chama o motor do jogo para iniciar nova rodada de forma segura
                if (typeof window.startRound === 'function') {
                    window.startRound();
                } else {
                    console.error('FlowUI: startRound não foi encontrado globalmente.');
                }
            }
        }, 1000);
    }
};