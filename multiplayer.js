/* 
   ========================================================================
   MULTIPLAYER.JS - VERSAO ULTRA RESILIENTE E BLINDADA (PEERJS)
   Gerencia conexoes P2P, criacao de salas e sincronizacao de rede.
   ======================================================================== 
*/

// 1. RESILIENCIA E DEBUG MOBILE
window.mobileLog = (function() {
    let statusEl, clientStatusEl;
    return function(msg, cor = "white") {
        if (!statusEl) statusEl = document.getElementById('host-status');
        if (!clientStatusEl) clientStatusEl = document.getElementById('client-status');
        
        const target = (window.netMode === 'host') ? statusEl : clientStatusEl;
        if (target) {
            target.style.color = cor;
            target.innerText = "> " + msg;
        }
    };
})();

window.onerror = function(msg, url, line) {
    if (msg.includes("Script error") || msg.includes("PeerJS")) return false;
    // Evita popups excessivos em producao, util apenas para debug
    console.error("ERRO NO JS: " + msg + "\nLinha: " + line);
    return false;
};

/**
 * 2. UTILITARIOS DE REDE
 */
window.generateShortID = function() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return 'domino-' + result;
};

/**
 * 3. LOGICA DO HOST (CRIADOR DA SALA)
 */
window.initializeHost = function() {
    window.netMode = 'host';
    window.mobileLog("Iniciando Host...", "yellow");
    
    if (typeof Peer === 'undefined') {
        alert("Erro: Biblioteca de rede (PeerJS) nao carregou. Verifique sua internet.");
        return;
    }

    try {
        // Limpa conexao anterior se existir
        if (window.myPeer) { 
            window.myPeer.destroy(); 
            window.myPeer = null; 
        }

        // PERSISTENCIA: Tenta recuperar ID anterior para manter a sala no refresh
        let fullID = localStorage.getItem('domino_host_id');
        if (!fullID) {
            fullID = window.generateShortID();
            localStorage.setItem('domino_host_id', fullID);
        }

        window.lastRoomCode = fullID.split('-')[1];

        const codeDisplay = document.getElementById('host-code-display');
        if (codeDisplay) {
            codeDisplay.innerText = window.lastRoomCode;
            codeDisplay.style.color = "var(--gold)";
        }

        window.myPeer = new Peer(fullID, {
            config: { 'iceServers': [{ urls: 'stun:stun.l.google.com:19302' }] }
        });
        window.ResourceManager.registerInstance(window.myPeer);

        window.myPeer.on('open', (id) => {
            window.mobileLog("SALA ONLINE!", "#00ff00");
            const btnStart = document.getElementById('btn-start-multi');
            if (btnStart) btnStart.style.display = 'flex';
        });

        window.myPeer.on('connection', (conn) => {
            window.mobileLog("Novo jogador conectando...", "yellow");
            window.setupHostEvents(conn);
        });

        window.myPeer.on('error', (err) => {
            window.mobileLog("Erro de rede: " + err.type, "red");
            // Se o ID ja estiver em uso (ex: refresh rapido), tenta limpar e reconectar
            if (err.type === 'unavailable-id') {
                localStorage.removeItem('domino_host_id');
                setTimeout(window.initializeHost, 1000);
            }
        });

    } catch (e) { 
        alert("Erro fatal no Host: " + e.message); 
    }
};

/**
 * 4. LOGICA DO CLIENTE (QUEM ENTRA)
 */
window.connectToHost = function() {
    const inputEl = document.getElementById('join-code-input');
    if (!inputEl) return;
    
    const input = inputEl.value.toUpperCase().trim();
    if (!input) return alert("Digite o codigo da sala!");

    window.netMode = 'client';
    window.lastRoomCode = input; // SALVA O CODIGO PARA RECONEXAO
    window.mobileLog("Procurando sala...", "yellow");

    window._initiateConnection(input);
};

// Separamos a criacao da conexao para reutilizar no loop de reconexao
window._initiateConnection = function(roomCode) {
    try {
        if (window.myPeer) window.myPeer.destroy();
        window.myPeer = new Peer({
            config: { 'iceServers': [{ urls: 'stun:stun.l.google.com:19302' }] }
        });

        window.myPeer.on('open', () => {
            // reliable: true garante que os pacotes de pecas nao se percam pelo caminho
            const conn = window.myPeer.connect('domino-' + roomCode, { reliable: true });
            window.setupClientEvents(conn);
        });

        window.myPeer.on('error', (err) => {
            window.mobileLog("Erro de rede: " + err.type, "red");
        });
    } catch (e) { 
        alert("Erro ao conectar: " + e.message); 
    }
};

/**
 * 5. TRATAMENTO DE EVENTOS E MENSAGENS
 */
window.setupHostEvents = function(conn) {
    conn.on('open', () => {
        window.mobileLog("Jogador conectado!", "#00ff00");
        if (!window.connectedClients) window.connectedClients = [];
        
        if (!window.connectedClients.includes(conn)) {
            window.connectedClients.push(conn);
        }
        window.broadcastState(); 
    });

    // BLINDAGEM: Remocao de fantasmas
    conn.on('close', () => {
        const gameStarted = window.STATE && window.STATE.positions && window.STATE.positions.length > 0;

        if (gameStarted) {
            window.mobileLog("Queda detectada. Pausando a mesa.", "var(--red)");
            conn.isActive = false; // Marca como offline, mas mantem a cadeira
            window.STATE.isBlocked = true; // Pausa o motor do jogo
            
            const pName = typeof window.NameManager !== 'undefined' ? window.NameManager.get(conn.assignedIdx) : `Jogador ${conn.assignedIdx}`;
            if (typeof window.Network !== 'undefined') {
                window.Network.sendStatus(`Aguardando ${pName}...`, 'pass');
            }

            // BOT TAKEOVER: Timer de seguranca de 60 segundos
            conn.botTimer = setTimeout(() => {
                if (!conn.isActive) {
                    window.mobileLog("Tempo esgotado. Bot assumindo...", "var(--gold)");
                    // Converte a cadeira para Bot
                    if (typeof window.BotManager !== 'undefined') {
                        window.BotManager.activateForSeat(conn.assignedIdx);
                    }
                    window.STATE.isBlocked = false; // Despausa o motor
                    window.broadcastState();
                }
            }, 60000); 
        } else {
            // Comportamento original do Lobby (Libera a cadeira)
            window.mobileLog("Um jogador saiu do lobby", "var(--red)");
            if (window.connectedClients) {
                window.connectedClients = window.connectedClients.filter(c => c !== conn);
            }
            if (conn.assignedIdx !== undefined && typeof window.SeatManager !== 'undefined') {
                window.SeatManager.renderSelectionUI();
            }
            window.broadcastState();
        }
    });

    conn.on('data', (data) => {
        if (!data) return;
        
        if (data.type === 'play_request') {
            // ... (logica de validacao ja existente)
        }

        // NOVO: Repassa mensagens de UI (Thinking, Emote, Chat) para todos
        if (data.type === 'thinking' || data.type === 'emote' || data.type === 'quick_chat') {
            window.broadcastToClients(data);
            // Se o Host nao for o remetente, ele tambem precisa mostrar visualmente
            if (data.pIdx !== window.myPlayerIdx) {
                if (data.type === 'thinking') window.Dashboard.showThinking(data.pIdx);
                if (data.type === 'emote') window.Dashboard.showEmote(data.pIdx, data.emote);
                if (data.type === 'quick_chat') window.Dashboard.showQuickChat(data.pIdx, data.message);
            }
        }

        if (data.type === 'request_seat') {
            conn.assignedIdx = data.seatIdx;
            if (typeof window.SeatManager !== 'undefined') {
                conn.isActive = true;
                window.SeatManager.renderSelectionUI();
            }
            window.broadcastState();
        }

        // NOVO: Processamento de Votacao
        if (data.type === 'vote_request') {
            window.Dashboard.showVotePanel(data.action, (result) => {
                window.Network.request({ type: 'vote_submit', pIdx: window.myPlayerIdx, action: data.action, vote: result });
            });
        }
        
        if (data.type === 'reconnect_request') {
            const targetIdx = data.seatIdx;
            const oldConnIndex = window.connectedClients.findIndex(c => c.assignedIdx === targetIdx);
            
            if (oldConnIndex !== -1) {
                // Atualiza o socket da cadeira com a nova conexao
                conn.assignedIdx = targetIdx;
                conn.isActive = true;
                window.connectedClients[oldConnIndex] = conn;

                window.mobileLog("Jogador restaurado!", "#00ff00");
                window.STATE.isBlocked = false; // Despausa o motor
                
                const pName = typeof window.NameManager !== 'undefined' ? window.NameManager.get(targetIdx) : 'Jogador';
                if (typeof window.Network !== 'undefined') {
                    window.Network.sendStatus(`${pName} VOLTOU!`, 'active');
                }

                // Envia o estado PUBLICO + a mao privada desse jogador especifico (Blind Hands)
                conn.send({
                    type: 'recovery_state',
                    state: window.getPublicState(),
                    myHand: window.STATE.hands[targetIdx]
                });

                window.broadcastState();
            }
        }
    });
};

window.setupClientEvents = function(conn) {
    conn.on('open', () => {
        window.mobileLog("Conectado ao Host!", "#00ff00");
        window.myConnToHost = conn;
        
        // Se for uma reconexao bem-sucedida, dispara o handshake
        if (window.isReconnecting) {
            conn.send({ type: 'reconnect_request', seatIdx: window.myPlayerIdx });
        }
    });

    // Detectar quando o Host fecha a sala ou cai a internet dele
    conn.on('close', () => {
        // Se a partida ja comecou, nao recarrega a pagina. Inicia o resgate.
        if (window.STATE && window.STATE.positions && window.STATE.positions.length > 0) {
            window.attemptReconnect();
        } else {
            alert("A conexao com o Host foi perdida no lobby.");
            window.location.reload(); 
        }
    });

    conn.on('data', (data) => {
        if (!data) return;

        if (data.type === 'game_start') {
            window.myPlayerIdx = data.yourIdx;
            if (data.names && typeof window.NameManager !== 'undefined') {
                window.NameManager.updateAll(data.names);
            }
            if (typeof window.startMatch === 'function') window.startMatch();
        }
        
        if (data.type === 'state_update' && window.STATE) {
            Object.assign(window.STATE, data.state);
            // BLIND HANDS: Recebe apenas a sua propria mao do Host
            if (data.myHand) {
                window.STATE.hands[window.myPlayerIdx] = data.myHand;
            }
            if (typeof window.renderHands === 'function') window.renderHands();
            if (typeof window.renderBoardFromState === 'function') window.renderBoardFromState();

            // Desbloqueia e destaca pecas se for o turno do cliente
            if (window.STATE.current === window.myPlayerIdx && !window.STATE.isOver) {
                if (typeof window.processTurn === 'function') window.processTurn();
            }
        }

        // NOVO: Suporte a animacao sincronizada
        if (data.type === 'animate_play' && data.nP) {
            if (typeof window.animateTile === 'function') {
                window.animateTile(data.pIdx, data.nP, () => {
                    if (typeof window.renderBoardFromState === 'function') window.renderBoardFromState();
                });
            }
        }

        // NOVO: Pacote de recuperacao de estado privado
        if (data.type === 'recovery_state') {
            Object.assign(window.STATE, data.state);
            window.STATE.hands[window.myPlayerIdx] = data.myHand; // Restaura a mao oculta
            
            // Limpa UI de reconexao
            window.isReconnecting = false;
            clearInterval(window.reconnectTimer);
            document.getElementById('reconnect-overlay').style.display = 'none';
            
            // Redesenha e verifica se e o turno do jogador
            if (typeof window.renderHands === 'function') window.renderHands(true);
            if (typeof window.renderBoardFromState === 'function') window.renderBoardFromState();
            
            if (window.STATE.current === window.myPlayerIdx && !window.STATE.isBlocked) {
                if (typeof window.getMoves === 'function') {
                    const moves = window.getMoves(window.STATE.hands[window.myPlayerIdx]);
                    if (moves.length > 0 && typeof window.highlight === 'function') window.highlight(moves);
                }
            }
        }
        
        if (data.type === 'status') {
            if (typeof window.updateStatusLocal === 'function') {
                window.updateStatusLocal(data.text, data.cls);
            }
        }

        // NOVO: Processamento de UI para o Cliente
        if (data.type === 'thinking') window.Dashboard.showThinking(data.pIdx);
        if (data.type === 'emote') window.Dashboard.showEmote(data.pIdx, data.emote);
        if (data.type === 'quick_chat') window.Dashboard.showQuickChat(data.pIdx, data.message);
    });
};

// A Maquina de Reconexao
window.attemptReconnect = function() {
    if (window.isReconnecting) return;
    window.isReconnecting = true;
    window.reconnectAttempts = 0;

    const overlay = document.getElementById('reconnect-overlay');
    const msgEl = document.getElementById('reconnect-msg');
    if (overlay) overlay.style.display = 'flex';

    window.reconnectTimer = setInterval(() => {
        window.reconnectAttempts++;
        if (msgEl) msgEl.innerText = `Tentando reconectar... (${window.reconnectAttempts}/${window.MAX_RECONNECT_ATTEMPTS})`;

        if (window.reconnectAttempts > window.MAX_RECONNECT_ATTEMPTS) {
            clearInterval(window.reconnectTimer);
            alert("Sinal perdido. Retornando ao menu.");
            window.location.reload();
            return;
        }

        window._initiateConnection(window.lastRoomCode);
    }, window.RECONNECT_DELAY_MS || 3000);
};

window.cancelReconnect = function() {
    if (window.reconnectTimer) clearInterval(window.reconnectTimer);
    window.location.reload();
};

/**
 * 6. SISTEMA DE TRANSMISSAO (BROADCAST)
 */
window.broadcastToClients = function(data) {
    if (window.netMode !== 'host' || !Array.isArray(window.connectedClients)) return;

    window.connectedClients.forEach(conn => {
        if (conn && conn.open) {
            try { 
                conn.send(data); 
            } catch (e) { 
                console.warn("Falha no envio P2P:", e); 
            }
        }
    });
};

window.getPublicState = function() {
    if (!window.STATE) return null;
    
    // Clonagem performatica (structuredClone se disponivel, senao fallback manual)
    const clone = (obj) => {
        if (typeof structuredClone === 'function') return structuredClone(obj);
        return JSON.parse(JSON.stringify(obj));
    };

    return {
        current: Number(window.STATE.current),
        extremes: clone(window.STATE.extremes),
        positions: clone(window.STATE.positions),
        handSize: [...window.STATE.handSize],
        scores: [...window.STATE.scores],
        isOver: !!window.STATE.isOver,
        playerPassed: [...window.STATE.playerPassed],
        roundWinner: window.STATE.roundWinner !== null ? Number(window.STATE.roundWinner) : null
    };
};

window.broadcastState = function() {
    if (window.netMode !== 'host' || !window.STATE) return;

    const publicState = window.getPublicState();

    if (Array.isArray(window.connectedClients)) {
        window.connectedClients.forEach(conn => {
            if (conn && conn.open) {
                conn.send({
                    type: 'state_update',
                    state: publicState,
                    myHand: window.STATE.hands[conn.assignedIdx]
                });
            }
        });
    }
};