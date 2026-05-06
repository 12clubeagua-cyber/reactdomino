/**
 * FlowUI.js
 * Gerencia o fluxo visual e logico de transicao entre estados (Lobby -> Game -> Round End).
 */
window.FlowUI = {

    init: function() {
        console.log("FlowUI: Sistema de fluxo inicializado.");
    },

    /**
     * Limpa a UI para uma nova rodada.
     */
    resetForNewRound: function() {
        // Remove overlays de fim de rodada se existirem
        const overlay = document.getElementById('round-overlay');
        if (overlay) overlay.remove();
        
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

        // 3. Atualiza o placar no Dashboard
        if (typeof window.Dashboard !== 'undefined' && typeof window.Dashboard.updateScore === 'function') {
            window.Dashboard.updateScore();
        }
        
        // 4. Grava na Persistencia
        if (winTeam !== -1) {
            window.FlowUI.saveMatchState();
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
     * Inicia contagem regressiva para proxima rodada.
     */
    _startNextRoundCountdown: function(msg) {
        const overlay = document.createElement('div');
        overlay.id = 'round-overlay';
        overlay.className = 'glass';
        overlay.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:10000; padding:30px; text-align:center; border: 2px solid var(--accent);';
        
        overlay.innerHTML = `
            <h2 style="color:var(--accent); margin-bottom:10px;">${msg}</h2>
            <div id="countdown-text" style="font-size:1.5rem; font-weight:bold;">Nova rodada em 5s...</div>
        `;
        document.body.appendChild(overlay);

        let count = 5;
        const timer = setInterval(() => {
            count--;
            const txt = document.getElementById('countdown-text');
            if (txt) txt.innerText = `Nova rodada em ${count}s...`;
            
            if (count <= 0) {
                clearInterval(timer);
                // O Host ou o sistema local inicia a nova rodada
                if (window.Network && window.Network.isHost) {
                    if (typeof window.startRound === 'function') window.startRound();
                } else if (!window.STATE.isMultiplayer) {
                    if (typeof window.startRound === 'function') window.startRound();
                }
            }
        }, 1000);
    },

    /**
     * Lida com o fim da partida (Vitoria Final).
     */
    _handleMatchEnd: function(target) {
        const scoreA = window.STATE.scores[0];
        const scoreB = window.STATE.scores[1];
        const winTeam = scoreA >= target ? 0 : 1;
        
        const overlay = document.createElement('div');
        overlay.id = 'round-overlay';
        overlay.className = 'glass';
        overlay.style.cssText = 'position:fixed; inset:0; z-index:10001; display:flex; flex-direction:column; align-items:center; justify-content:center; background: rgba(0,0,0,0.8);';
        
        const names = window.NameManager ? window.NameManager.getAll() : {};
        let winners = "";
        if (winTeam === 0) {
            winners = `${names[0] || 'J1'} e ${names[2] || 'J3'}`;
        } else {
            winners = `${names[1] || 'J2'} e ${names[3] || 'J4'}`;
        }

        overlay.innerHTML = `
            <h1 style="color:var(--accent); font-size:3rem; margin-bottom:20px;">VITORIA!</h1>
            <p style="font-size:1.5rem; margin-bottom:30px;">A dupla <b>${winners}</b> venceu a partida!</p>
            <div style="font-size:2rem; margin-bottom:40px;">${scoreA} x ${scoreB}</div>
            <button class="btn-side" style="padding:15px 40px; font-size:1.2rem;" onclick="location.reload()">VOLTAR AO LOBBY</button>
        `;
        document.body.appendChild(overlay);
        
        // Limpa estado salvo
        localStorage.removeItem('domino_match_state');
    },

    /**
     * Salva o estado atual para persistencia.
     */
    saveMatchState: function() {
        if (!window.STATE) return;
        const data = {
            scores: window.STATE.scores,
            targetScore: window.STATE.targetScore,
            isMultiplayer: window.STATE.isMultiplayer,
            names: window.NameManager ? window.NameManager.getAll() : {}
        };
        localStorage.setItem('domino_match_state', JSON.stringify(data));
    }

};
