/* 
   ========================================================================
   LOBBY.JS - GERENCIAMENTO DE MENUS E PREPARACAO (VERSAO BLINDADA)
   Controla a navegacao, selecao de dificuldades e o inicio da partida.
   ======================================================================== 
*/

/**
 * 1. NAVEGACAO ENTRE TELAS
 */

window.addEventListener('DOMContentLoaded', () => {
    // Processa convites sociais via URL
    if (typeof window.SocialManager !== 'undefined') {
        window.SocialManager.processInvite();
    }
});

window.hideAllSteps = function() {
    document.querySelectorAll('.start-step').forEach(el => el.classList.remove('active'));
};

window.goToStep = function(stepId) {
    window.hideAllSteps();
    const el = document.getElementById(stepId);
    if (el) el.classList.add('active');
};

/**
 * 2. CONFIGURACOES E IDENTIDADE
 */

// Integracao com o modulo Identity protegida
window.changeName = function() {
    if (typeof window.Identity !== 'undefined' && typeof window.Identity.promptChange === 'function') {
        window.Identity.promptChange();
    } else {
        // Fallback robusto caso o modulo nao esteja carregado
        const n = prompt("Nome:");
        if (n && typeof window.NameManager !== 'undefined') {
            window.NameManager.set(0, n);
        }
    }
};

window.selectMode = function(mode) {
    const VALID_MODES = ['offline', 'host', 'client'];
    if (!VALID_MODES.includes(mode)) mode = 'offline';
    
    window.netMode = mode; 
    
    if (mode === 'offline' || mode === 'host') {
        window.goToStep('step-diff');
    } else if (mode === 'client') {
        window.goToStep('step-lobby-client');
        window.fetchPublicRooms();
    }
};

/**
 * Busca salas ativas no servidor Go (Fase Final: Matchmaking)
 */
window.fetchPublicRooms = async function() {
    const listEl = document.getElementById('public-rooms-list');
    if (!listEl) return;

    try {
        const response = await fetch("http://localhost:8080/rooms");
        const rooms = await response.json();

        if (rooms.length === 0) {
            listEl.innerHTML = '<div class="start-sub">Nenhuma sala ativa no momento.</div>';
            return;
        }

        listEl.innerHTML = rooms.map(id => `
            <div class="player-item" style="cursor:pointer; border:1px solid var(--gold);" onclick="window.Multiplayer.initClient('${id}')">
                SALA: ${id} <span style="font-size:0.7rem; color:var(--gold); margin-left:auto;">CLIQUE PARA ENTRAR</span>
            </div>
        `).join('');
    } catch (e) {
        listEl.innerHTML = '<div class="start-sub" style="color:var(--red);">Erro ao conectar ao servidor de salas.</div>';
    }
};

window.selectDiff = function(diff) {
    if (window.STATE) window.STATE.difficulty = diff;
    
    const ids = ['btn-easy', 'btn-normal', 'btn-hard'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('selected');
    });
    
    const activeEl = document.getElementById(`btn-${diff}`);
    if (activeEl) activeEl.classList.add('selected');
    
    window.goToStep('step-goal');
};

window.selectGoal = function(limit) {
    if (window.STATE) {
        window.STATE.targetScore = (typeof limit === 'number' && limit > 0) ? limit : 3;
    }
    
    if (window.netMode === 'offline') {
        window.startMatch();
    } else if (window.netMode === 'host') {
        window.goToStep('step-lobby-host');
        if (typeof window.initializeHost === 'function') window.initializeHost();
    }
};

/**
 * Carrega uma partida salva do localStorage.
 */
window.loadMatchState = function() {
    try {
        const saved = window.safeGetStorage('domino_match_state', null);
        if (!saved) return;

        const data = saved; // Ja parseado pelo safeGetStorage
        if (window.STATE) {
            window.STATE.scores = data.scores || [0, 0];
            window.STATE.targetScore = data.targetScore || 10;
            window.STATE.difficulty = data.difficulty || 'normal';
        }

        window.startMatch(true); // Indica que e restauracao
    } catch (e) {
        console.warn("Erro ao carregar partida:", e);
        try { window.safeSetStorage('domino_match_state', null); } catch(ex) {}
    }
};

// Verifica se existe partida salva ao carregar a pagina
document.addEventListener('DOMContentLoaded', () => {
    const saved = window.safeGetStorage('domino_match_state', null);
    const btn = document.getElementById('btn-continue');
    
    // REQUISITO: Se a partida salva for offline, limpamos o legado para evitar inconsistencias
    if (saved && !saved.isMultiplayer) {
        localStorage.removeItem('domino_match_state');
        if (btn) btn.style.display = 'none';
        return;
    }

    if (saved && btn) {
        btn.style.display = 'flex';
    }
});

/**
 * 3. FLUXO DE INICIO DE JOGO
 */

window.startMatch = function(isRestoring = false) {
    // Inicializacao de audio
    if (typeof window.safeAudioInit === 'function') {
        window.safeAudioInit();
        if (window.AudioManager && typeof window.AudioManager.startBGM === 'function') {
            window.AudioManager.startBGM();
        }
    }
    
    // NOVO: Randomiza nomes de bots para maior variedade
    if (!isRestoring && typeof window.NameManager !== 'undefined' && typeof window.NameManager.randomizeBots === 'function') {
        window.NameManager.randomizeBots();
    }
    
    if (window.STATE) {
        if (!isRestoring) {
            window.STATE.scores = [0, 0];
        }
        window.STATE.roundWinner = null;
        window.STATE.isOver = false;
    }

    // Atualiza o Dashboard com os nomes e pontos zerados antes de entrar na mesa
    if (typeof window.Dashboard !== 'undefined' && typeof window.Dashboard.updateScore === 'function') {
        window.Dashboard.updateScore();
    }
    
    // Transicao visual: Esconde o Lobby e mostra o botao Sair
    const startScreen = document.getElementById('start-screen');
    if (startScreen) startScreen.style.display = 'none';

    const exitBtn = document.getElementById('btn-exit');
    if (exitBtn) exitBtn.style.display = 'block';

    const doStartRound = () => {
        if (typeof window.startRound === 'function') {
            window.startRound();
        } else {
            console.error('Lobby: startRound nao definido ou nao carregado.');
        }
    };

    // --- Logica de Rede (Host) ---
    if (window.netMode === 'host') {
        if (typeof window.Network !== 'undefined' && window.Network.isHost) {
            
            // Reune os nomes para enviar aos clientes
            let finalNames = {};
            if (typeof window.NameManager !== 'undefined') {
                finalNames = window.NameManager.getAll();
            }
            
            // O Servidor Go agora cuida da distribuicao (broadcast)
            window.Network.request({
                type: 'game_start',
                names: finalNames,
                targetScore: window.STATE ? window.STATE.targetScore : 3
            });

            // O Host roda a funcao de inicio apos um breve delay
            setTimeout(doStartRound, 600);
        }
        
    // --- Logica Local (Offline) ---
    } else if (window.netMode === 'offline') {
        doStartRound();
    }
};

/**
 * 4. CANCELAMENTO
 */

window.cancelHosting = function() {
    if (window.Network && window.Network.socket) {
        window.Network.socket.close();
    }
    window.netMode = 'offline';
    window.goToStep('step-mode');
};