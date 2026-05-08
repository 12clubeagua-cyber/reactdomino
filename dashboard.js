/* 
   ========================================================================
   DASHBOARD.JS - O PAINEL DE CONTROLE (VERSAO BLINDADA)
   Gerencia o placar, as etiquetas de time e a barra de status superior.
   ======================================================================== 
*/

window.Dashboard = {
    _cache: {},
    _nameMap: null,

    _getEl: function(id) {
        if (!window.Dashboard._cache[id]) window.Dashboard._cache[id] = document.getElementById(id);
        return window.Dashboard._cache[id];
    },

    /**
     * Atualiza o mapa de nomes para evitar buscas repetitivas no NameManager.
     */
    _updateNameMap: function() {
        if (typeof window.NameManager === 'undefined') return;
        const names = window.NameManager.getAll();
        const myIdx = window.myPlayerIdx ?? 0;
        
        window.Dashboard._nameMap = {};
        Object.keys(names).forEach(idx => {
            const i = parseInt(idx);
            window.Dashboard._nameMap[`JOGADOR ${i + 1}`] = (i === myIdx) ? "VOCE" : names[idx];
        });
    },

    /**
     * Exibe o painel de votacao para acoes sociais.
     */
    showVotePanel: function(action, callback) {
        let panel = window.Dashboard._getEl('vote-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'vote-panel';
            panel.className = 'glass';
            panel.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:2000; padding:20px; display:flex; flex-direction:column; gap:10px;';
            document.body.appendChild(panel);
            window.Dashboard._cache['vote-panel'] = panel;
        }
        panel.innerHTML = `<div style="text-align:center; font-weight:bold;">Votar: ${action}?</div>`;
        
        const fragment = document.createDocumentFragment();
        const btnYes = document.createElement('button');
        btnYes.className = 'btn-side';
        btnYes.innerText = 'Sim';
        btnYes.onclick = () => { callback(true); panel.style.display = 'none'; };
        
        const btnNo = document.createElement('button');
        btnNo.className = 'btn-side btn-cancel';
        btnNo.innerText = 'Nao';
        btnNo.onclick = () => { callback(false); panel.style.display = 'none'; };
        
        fragment.appendChild(btnYes);
        fragment.appendChild(btnNo);
        panel.appendChild(fragment);
        panel.style.display = 'flex';
    },

    /**
     * Exibe um balao de "pensando" para um jogador.
     */
    showThinking: function(pIdx) {
        const localIdx = window.myPlayerIdx ?? 0;
        const viewIdx = (pIdx - localIdx + 4) % 4;
        const handEl = window.Dashboard._getEl(`hand-${viewIdx}`);
        if (!handEl) return;

        // Evita duplicacao de baloes de pensamento
        if (handEl.querySelector('.thinking-bubble:not(.chat-bubble):not(.emote-bubble)')) return;

        if (handEl.style.position !== 'relative') handEl.style.position = 'relative';

        const bubble = document.createElement('div');
        bubble.className = 'thinking-bubble';
        bubble.innerText = '...';
        
        handEl.appendChild(bubble);
        setTimeout(() => bubble.remove(), 2000);
    },

    /**
     * Exibe uma mensagem de chat rapido para um jogador.
     */
    showQuickChat: function(pIdx, message) {
        const localIdx = window.myPlayerIdx ?? 0;
        const viewIdx = (pIdx - localIdx + 4) % 4;
        const handEl = window.Dashboard._getEl(`hand-${viewIdx}`);
        if (!handEl) return;

        if (handEl.style.position !== 'relative') handEl.style.position = 'relative';

        // Remove baloes de pensamento simples ao falar
        const oldThinking = handEl.querySelector('.thinking-bubble:not(.chat-bubble):not(.emote-bubble)');
        if (oldThinking) oldThinking.remove();

        const bubble = document.createElement('div');
        bubble.className = 'thinking-bubble chat-bubble';
        bubble.innerText = message;
        
        handEl.appendChild(bubble);
        setTimeout(() => bubble.remove(), 2500);
    },

    /**
     * Exibe um balao de emote para um jogador especifico.
     */
    showEmote: function(pIdx, emote) {
        const localIdx = window.myPlayerIdx ?? 0;
        const viewIdx = (pIdx - localIdx + 4) % 4;
        const handEl = window.Dashboard._getEl(`hand-${viewIdx}`);
        if (!handEl) return;

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
        const scores = window.STATE?.scores || [0, 0];
        const scoreHash = `${scores[0]}-${scores[1]}-${window.myPlayerIdx}`;
        
        if (window.Dashboard._lastScoreHash === scoreHash) return;
        window.Dashboard._lastScoreHash = scoreHash;

        requestAnimationFrame(() => {
            const scoreA = window.Dashboard._getEl('scoreA');
            const scoreB = window.Dashboard._getEl('scoreB');
            const labelA = window.Dashboard._getEl('label-team-a');
            const labelB = window.Dashboard._getEl('label-team-b');
            
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
     */
    setMessage: function(text, cls = '') {
        requestAnimationFrame(() => window.Dashboard._renderStatusLocal(text, cls));

        // Anuncio de acessibilidade
        if (typeof window.Renderer !== 'undefined' && typeof window.Renderer.announce === 'function') {
            window.Renderer.announce(text);
        }

        if (typeof window.Network !== 'undefined' && window.Network.isHost && window.Network.isHost()) {
            window.Network.sync({ type: 'status', text, cls });
        }
    },

    /**
     * Helper interno para processar o texto e injetar no HTML.
     */
    _renderStatusLocal: function(text, cls) {
        const el = window.Dashboard._getEl('game-status');
        if (!el) return;
        
        if (!window.Dashboard._nameMap) window.Dashboard._updateNameMap();

        let displayMsg = text;
        if (window.Dashboard._nameMap) {
            Object.keys(window.Dashboard._nameMap).forEach(key => {
                displayMsg = displayMsg.replace(key, window.Dashboard._nameMap[key]);
            });
        }
        
        el.innerText = displayMsg;
        el.className = (cls === 'active' || cls === 'pass') ? cls : '';
    },

    /**
     * Destaca visualmente de quem e o turno atual.
     */
    updateTurnIndicator: function(currentIdx) {
        const myIdx = window.myPlayerIdx ?? 0;
        const viewIdx = (currentIdx - myIdx + 4) % 4;
        
        // Remove destaque anterior
        document.querySelectorAll('.hand').forEach(el => el.classList.remove('active-turn'));
        
        // Adiciona destaque ao jogador atual
        const activeHand = window.Dashboard._getEl(`hand-${viewIdx}`);
        if (activeHand) {
            activeHand.classList.add('active-turn');
        }

        // Anuncio de acessibilidade
        const playerName = typeof window.NameManager !== 'undefined' ? window.NameManager.get(currentIdx) : `Jogador ${currentIdx}`;
        const msg = (currentIdx === myIdx) ? "SEU TURNO!" : `Turno de: ${playerName}`;
        window.Dashboard.setMessage(msg);
    },

    /**
     * Inicializa os estilos CSS baseados nas configuracoes globais.
     */
    init: function() {
        window.Dashboard._updateNameMap();
        window.Dashboard.updateScore();
        
        const width = window.CONFIG?.GAME?.TILE_W ?? 18;
        const height = window.CONFIG?.GAME?.TILE_L ?? 36;
        document.documentElement.style.setProperty('--tile-width', `${width}px`);
        document.documentElement.style.setProperty('--tile-height', `${height}px`);
    }
};