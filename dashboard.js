/* 
   ========================================================================
   DASHBOARD.JS - O PAINEL DE CONTROLE (VERSÃO BLINDADA)
   Gerencia o placar, as etiquetas de time e a barra de status superior.
   ======================================================================== 
*/

window.Dashboard = {
    _cache: {},
    _nameMap: null,

    _getEl: function(id) {
        if (!this._cache[id]) this._cache[id] = document.getElementById(id);
        return this._cache[id];
    },

    /**
     * Atualiza o mapa de nomes para evitar buscas repetitivas no NameManager.
     */
    _updateNameMap: function() {
        if (typeof window.NameManager === 'undefined') return;
        const names = window.NameManager.getAll();
        const myIdx = window.myPlayerIdx ?? 0;
        
        this._nameMap = {};
        Object.keys(names).forEach(idx => {
            const i = parseInt(idx);
            this._nameMap[`JOGADOR ${i + 1}`] = (i === myIdx) ? "VOCÊ" : names[idx];
        });
    },

    /**
     * Exibe o painel de estatísticas de fim de rodada.
     */
    showMatchStats: function(stats) {
        let panel = this._getEl('stats-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'stats-panel';
            panel.className = 'glass';
            panel.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:2000; padding:20px; display:flex; flex-direction:column; gap:10px; min-width: 250px;';
            document.body.appendChild(panel);
            this._cache['stats-panel'] = panel;
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
        let panel = this._getEl('vote-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'vote-panel';
            panel.className = 'glass';
            panel.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:2000; padding:20px; display:flex; flex-direction:column; gap:10px;';
            document.body.appendChild(panel);
            this._cache['vote-panel'] = panel;
        }
        panel.innerHTML = `<div style="text-align:center; font-weight:bold;">Votar: ${action}?</div>`;
        
        const fragment = document.createDocumentFragment();
        const btnYes = document.createElement('button');
        btnYes.className = 'btn-side';
        btnYes.innerText = 'Sim';
        btnYes.onclick = () => { callback(true); panel.style.display = 'none'; };
        
        const btnNo = document.createElement('button');
        btnNo.className = 'btn-side btn-cancel';
        btnNo.innerText = 'Não';
        btnNo.onclick = () => { callback(false); panel.style.display = 'none'; };
        
        fragment.appendChild(btnYes);
        fragment.appendChild(btnNo);
        panel.appendChild(fragment);
        panel.style.display = 'flex';
    },

    /**
     * Exibe uma mensagem de chat rápido para um jogador.
     */
    showQuickChat: function(pIdx, message) {
        const localIdx = window.myPlayerIdx ?? 0;
        const viewIdx = (pIdx - localIdx + 4) % 4;
        const handEl = this._getEl(`hand-${viewIdx}`);
        if (!handEl) return;

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
        const handEl = this._getEl(`hand-${viewIdx}`);
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
        requestAnimationFrame(() => {
            const scoreA = this._getEl('scoreA');
            const scoreB = this._getEl('scoreB');
            const labelA = this._getEl('label-team-a');
            const labelB = this._getEl('label-team-b');
            
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
        requestAnimationFrame(() => this._renderStatusLocal(text, cls));

        if (typeof window.Network !== 'undefined' && window.Network.isHost && window.Network.isHost()) {
            window.Network.sync({ type: 'status', text, cls });
        }
    },

    /**
     * Helper interno para processar o texto e injetar no HTML.
     */
    _renderStatusLocal: function(text, cls) {
        const el = this._getEl('game-status');
        if (!el) return;
        
        if (!this._nameMap) this._updateNameMap();

        let displayMsg = text;
        if (this._nameMap) {
            Object.keys(this._nameMap).forEach(key => {
                displayMsg = displayMsg.replace(key, this._nameMap[key]);
            });
        }
        
        el.innerText = displayMsg;
        el.className = (cls === 'active' || cls === 'pass') ? cls : '';
    },

    /**
     * Inicializa os estilos CSS baseados nas configurações globais.
     */
    init: function() {
        this._updateNameMap();
        this.updateScore();
        
        const width = window.CONFIG?.GAME?.TILE_W ?? 18;
        const height = window.CONFIG?.GAME?.TILE_L ?? 36;
        document.documentElement.style.setProperty('--tile-width', `${width}px`);
        document.documentElement.style.setProperty('--tile-height', `${height}px`);
    }
};