/* 
   ========================================================================
   DASHBOARD.JS - O PAINEL DE CONTROLE (VERSÃO BLINDADA)
   Gerencia o placar, as etiquetas de time e a barra de status superior.
   ======================================================================== 
*/

window.Dashboard = {
    /**
     * Exibe o painel de estatísticas de fim de rodada.
     */
    showMatchStats: function(stats) {
        let panel = document.getElementById('stats-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'stats-panel';
            panel.className = 'glass';
            panel.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:2000; padding:20px; display:flex; flex-direction:column; gap:10px; min-width: 250px;';
            document.body.appendChild(panel);
        }
        panel.innerHTML = `
            <div style="text-align:center; font-weight:bold; font-size: 1.2rem;">Resumo da Partida</div>
            <div>Pontos: ${stats.points}</div>
            <div>Eficacia Media: ${stats.avgMoveTime}ms/jogada</div>
            <button class="btn-side" onclick="window.ReplayManager.play(); document.getElementById('stats-panel').style.display='none'">Assistir Replay</button>
            <button class="btn-side" onclick="document.getElementById('stats-panel').style.display='none'">Fechar</button>
        `;
        panel.style.display = 'flex';
    },

    /**
     * Exibe o painel de votação para ações sociais.
     */
    showVotePanel: function(action, callback) {
        let panel = document.getElementById('vote-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'vote-panel';
            panel.className = 'glass';
            panel.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:2000; padding:20px; display:flex; flex-direction:column; gap:10px;';
            document.body.appendChild(panel);
        }
        panel.innerHTML = `<div style="text-align:center; font-weight:bold;">Votar: ${action}?</div>`;
        
        const btnYes = document.createElement('button');
        btnYes.className = 'btn-side';
        btnYes.innerText = 'Sim';
        btnYes.onclick = () => { callback(true); panel.style.display = 'none'; };
        
        const btnNo = document.createElement('button');
        btnNo.className = 'btn-side btn-cancel';
        btnNo.innerText = 'Não';
        btnNo.onclick = () => { callback(false); panel.style.display = 'none'; };
        
        panel.appendChild(btnYes);
        panel.appendChild(btnNo);
        panel.style.display = 'flex';
    },

    /**
     * Exibe uma mensagem de chat rápido para um jogador.
     */
    showQuickChat: function(pIdx, message) {
        const localIdx = window.myPlayerIdx ?? 0;
        const viewIdx = (pIdx - localIdx + 4) % 4;
        const handEl = document.getElementById(`hand-${viewIdx}`);
        if (!handEl) return;

        // Garante posicionamento para o balão
        if (handEl.style.position !== 'relative') handEl.style.position = 'relative';

        const bubble = document.createElement('div');
        bubble.className = 'thinking-bubble chat-bubble';
        bubble.innerText = message;
        
        handEl.appendChild(bubble);
        setTimeout(() => bubble.remove(), 2500);
    },

    /**
     * Exibe um balão de emote para um jogador específico.
     */
    showEmote: function(pIdx, emote) {
        const localIdx = window.myPlayerIdx ?? 0;
        const viewIdx = (pIdx - localIdx + 4) % 4;
        const handEl = document.getElementById(`hand-${viewIdx}`);
        if (!handEl) return;

        // Garante posicionamento para o balão
        if (handEl.style.position !== 'relative') handEl.style.position = 'relative';

        const bubble = document.createElement('div');
        bubble.className = 'thinking-bubble emote-bubble';
        bubble.innerText = emote;
        
        handEl.appendChild(bubble);
        setTimeout(() => bubble.remove(), 2000);
    },

    /**
     * Atualiza os valores do placar e ajusta os nomes das duplas.
     */
    updateScore: function() {
        requestAnimationFrame(() => {
            const scoreA = document.getElementById('scoreA');
            const scoreB = document.getElementById('scoreB');
            const labelA = document.getElementById('label-team-a');
            const labelB = document.getElementById('label-team-b');
            
            if (!scoreA || !scoreB || !labelA || !labelB) return;

            const scores = window.STATE?.scores || [0, 0];
            const myIdx = window.myPlayerIdx ?? 0;

            scoreA.textContent = scores[0];
            scoreB.textContent = scores[1];
            
            scoreA.classList.toggle('winning', scores[0] > scores[1]);
            scoreB.classList.toggle('winning', scores[1] > scores[0]);

            const teamLabels = (myIdx % 2 !== 0) 
                ? ["Oponentes", "Sua Dupla"] 
                : ["Sua Dupla", "Oponentes"];
                
            labelA.innerText = teamLabels[0];
            labelB.innerText = teamLabels[1];
        });
    },

    /**
     * Define uma nova mensagem no status bar.
     * Se for o Host, propaga para todos os jogadores via rede.
     */
    setMessage: function(text, cls = '') {
        requestAnimationFrame(() => window.Dashboard._renderStatusLocal(text, cls));

        if (typeof window.Network !== 'undefined' && typeof window.Network.isHost === 'function' && window.Network.isHost()) {
            window.Network.sync({ type: 'status', text, cls });
        }
    },

    /**
     * Helper interno para processar o texto e injetar no HTML.
     * @private
     */
    _renderStatusLocal: function(text, cls) {
        const el = document.getElementById('game-status');
        if (!el) return;
        
        let displayMsg = text;
        const myIdx = window.myPlayerIdx ?? 0;
        
        // Garante que não quebre se o NameManager ainda não carregou
        const allNames = typeof window.NameManager !== 'undefined' ? window.NameManager.getAll() : {};
        
        /**
         * Tradutor de Nomes:
         * Converte "JOGADOR X" no texto para o nome real ou "VOCÊ".
         */
        Object.keys(allNames).forEach(idx => {
            const genericName = `JOGADOR ${parseInt(idx) + 1}`;
            if (displayMsg.includes(genericName)) {
                const isMe = (parseInt(idx) === myIdx);
                displayMsg = displayMsg.replace(genericName, isMe ? "VOCÊ" : allNames[idx]);
            }
        });
        
        el.innerText = displayMsg;

        // Aplica estilos CSS baseados no tipo de mensagem (ex: 'active', 'pass')
        el.className = (cls === 'active' || cls === 'pass') ? cls : '';
    },

    /**
     * Inicializa os estilos CSS baseados nas configurações globais.
     */
    init: function() {
        window.Dashboard.updateScore();
        
        // Sincroniza o tamanho das peças no CSS com o config.js de forma segura
        const width = window.CONFIG?.GAME?.TILE_W ?? 18;
        const height = window.CONFIG?.GAME?.TILE_L ?? 36;
        document.documentElement.style.setProperty('--tile-width', `${width}px`);
        document.documentElement.style.setProperty('--tile-height', `${height}px`);
    }
};