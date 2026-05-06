/* 
   ========================================================================
   UI.JS - O COORDENADOR DE INTERFACE (VERSAO BLINDADA)
   ======================================================================== 
*/

/**
 * Exibe painel de chat rapido
 */
window.showQuickChatPanel = function() {
    let panel = document.getElementById('chat-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'chat-panel';
        panel.className = 'glass';
        panel.style.cssText = 'position:fixed; bottom:150px; right:20px; z-index:1000; padding:10px; display:grid; gap:5px;';
        
        const messages = ["Boa!", "Vamos!", "Desculpa", "Paciencia"];
        messages.forEach(msg => {
            const btn = document.createElement('button');
            btn.className = 'btn-side';
            btn.innerText = msg;
            btn.onclick = () => {
                window.Network.request({ type: 'quick_chat', pIdx: window.myPlayerIdx, message: msg });
                window.Dashboard.showQuickChat(window.myPlayerIdx, msg);
                panel.style.display = 'none';
            };
            panel.appendChild(btn);
        });
        document.body.appendChild(panel);
    }
    panel.style.display = (panel.style.display === 'none') ? 'grid' : 'none';
};

/**
 * 1. PONTES DE COMUNICACAO (WRAPPERS)
 * Usando window.* para garantir acesso seguro aos objetos em diferentes arquivos.
 */

function updateScoreDisplay() {
    if (typeof window.Dashboard !== 'undefined') window.Dashboard.updateScore();
}

function updateStatus(text, cls = '') {
    if (typeof window.Dashboard !== 'undefined') window.Dashboard.setMessage(text, cls);
}

function updateStatusLocal(text, cls) {
    if (typeof window.Dashboard !== 'undefined') window.Dashboard._renderStatusLocal(text, cls);
}

function renderBoardFromState() {
    if (typeof window.Renderer !== 'undefined') {
        window.Renderer.drawBoard();
        // Garante que a camera se ajuste sempre que o tabuleiro for redesenhado
        syncCameraView();
    }
}

function renderHands(reveal = false) {
    if (typeof window.Renderer !== 'undefined') window.Renderer.drawHands(reveal);
}

function triggerPassVisual(pIdx) {
    if (typeof window.Renderer !== 'undefined') window.Renderer.flashPass(pIdx);
}

function executeEndRoundUI(winTeam, idx, msg, detail = '') {
    if (typeof window.FlowUI !== 'undefined') window.FlowUI.endRound(winTeam, idx, msg, detail);
}

function exitGame() {
    if (typeof window.FlowUI !== 'undefined') window.FlowUI.exitGame();
}

function changeName() {
    if (typeof window.Identity !== 'undefined') window.Identity.promptChange();
}

/**
 * 2. HELPER DE SINCRONIZACAO DE CAMERA
 * Resolve o erro de "Can't find variable" unificando os nomes.
 */
function syncCameraView() {
    if (typeof window.updateCamera === 'function') {
        window.updateCamera();
    } else if (typeof window.updateSnakeScale === 'function') {
        window.updateSnakeScale(); // Fallback caso algum codigo antigo chame
    }
}

// ! NOTA: A funcao getPips() foi removida daqui, pois agora ela vive no utils.js 
// de forma global (window.getPips) e otimizada com CSS Grid.

/**
 * 3. INICIALIZACAO DO AMBIENTE VISUAL
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("UI: Inicializando componentes visuais...");

    // 1. Inicializa Identidade
    if (typeof window.Identity !== 'undefined' && typeof window.Identity.init === 'function') {
        window.Identity.init();
    }

    // 2. Inicializa Dashboard
    if (typeof window.Dashboard !== 'undefined' && typeof window.Dashboard.init === 'function') {
        window.Dashboard.init();
    }

    // 3. Renderizacao Inicial (Tabuleiro Vazio)
    if (typeof window.Renderer !== 'undefined') {
        if (typeof window.Renderer.drawBoard === 'function') window.Renderer.drawBoard();
        if (typeof window.Renderer.drawHands === 'function') window.Renderer.drawHands();
        
        // Tenta centralizar a camera no inicio com um pequeno atraso de seguranca
        setTimeout(syncCameraView, 100);
    }
});