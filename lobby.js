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
    // Inicializacao do Lobby
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
    window.goToStep('step-diff');
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
    window.startMatch();
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

        window.startMatch();
    } catch (e) {
        console.warn("Erro ao carregar partida:", e);
        try { window.safeSetStorage('domino_match_state', null); } catch(ex) {}
    }
};

// Verifica se existe partida salva ao carregar a pagina
document.addEventListener('DOMContentLoaded', () => {
    const saved = window.safeGetStorage('domino_match_state', null);
    const btn = document.getElementById('btn-continue');
    if (saved && btn) {
        btn.style.display = 'flex';
    }
});

/**
 * 3. FLUXO DE INICIO DE JOGO
 */

window.startMatch = function() {
    if (window.STATE) {
        window.STATE.scores = [0, 0];
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

    if (typeof window.startRound === 'function') {
        window.startRound();
    } else {
        console.error('Lobby: startRound nao definido ou nao carregado.');
    }
};