/**
 * MULTIPLAYER.JS - Orquestrador de Mensagens (Versao Go Server)
 * Coordena a logica entre o Network.js e o Game.js
 */

window.Multiplayer = {
    /**
     * Inicializa o papel de Host via Servidor Go
     */
    initHost: async function() {
        console.log("Iniciando como HOST via Go...");
        window.Network.isHost = true;
        
        // Gera um ID de sala aleatorio
        const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
        window.Network.roomId = roomId;
        
        const codeDisplay = document.getElementById('host-code-display');
        if (codeDisplay) codeDisplay.innerText = roomId;

        await window.Network.connect();
        
        // Envia comando de criacao de sala (lobby)
        window.Network.request({
            type: 'create_room',
            roomId: roomId,
            playerName: window.NameManager.get(0)
        });
    },

    /**
     * Inicializa o papel de Cliente via Servidor Go
     */
    initClient: async function(roomId) {
        console.log(`Tentando entrar na sala ${roomId}...`);
        window.Network.isHost = false;
        window.Network.roomId = roomId;

        await window.Network.connect();
        
        // Envia comando para entrar na sala
        window.Network.request({
            type: 'join_room',
            roomId: roomId,
            playerName: window.NameManager.get(0)
        });
    },

    /**
     * Callback invocado pelo Network.js ao receber mensagens
     */
    onMessage: function(data) {
        switch(data.type) {
            case 'player_joined':
                console.log("Novo jogador entrou:", data.playerName);
                // Atualiza lista de jogadores na tela de lobby
                this._updateLobbyList(data.players);
                break;

            case 'game_start':
                window.myPlayerIdx = data.yourIdx;
                if (window.STATE) window.STATE.targetScore = data.targetScore;
                // Atualiza nomes globais
                for (let idx in data.names) {
                    window.NameManager.set(parseInt(idx), data.names[idx]);
                }
                // Inicia o jogo visualmente
                const startScreen = document.getElementById('start-screen');
                if (startScreen) startScreen.style.display = 'none';
                break;

            case 'state_update':
                // Sincroniza o estado do jogo vindo do Host
                if (window.syncState) window.syncState(data.state);
                break;

            case 'emote':
                if (window.Dashboard) window.Dashboard.showEmote(data.pIdx, data.emote);
                break;

            case 'quick_chat':
                if (window.Dashboard) window.Dashboard.showQuickChat(data.pIdx, data.message);
                break;
        }
    },

    _updateLobbyList: function(players) {
        const list = document.getElementById('host-player-list') || document.getElementById('client-player-list');
        if (!list) return;
        
        list.innerHTML = players.map(p => `<div class="player-item">${p}</div>`).join('');
        
        // Se for host e tiver 4 jogadores, mostra o botao de iniciar
        const startBtn = document.getElementById('btn-start-multi');
        if (window.Network.isHost && players.length >= 2 && startBtn) {
            startBtn.style.display = 'block';
        }
    }
};

// Vincula as funcoes globais esperadas pelo lobby.js
window.initializeHost = () => window.Multiplayer.initHost();
window.connectToHost = () => {
    const code = document.getElementById('join-code-input').value.toUpperCase();
    if (code) window.Multiplayer.initClient(code);
};
