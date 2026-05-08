/**
 * UI.JS - INTERFACE E FEEDBACK (VERSAO FINAL POLIDA)
 * Gerencia alertas, i18n e overlays de jogabilidade.
 */

window.i18n = {
    lang: 'pt',
    locales: {
        'pt': {
            'passed': 'PASSOU A VEZ!',
            'searching': 'Buscando salas...',
            'shuffling': 'Embaralhando...',
            'ready': 'TUDO PRONTO!',
            'no_rooms': 'Nenhuma sala ativa.',
            'connecting': 'Conectando ao servidor...',
            'game_over': 'FIM DE JOGO',
            'winner': 'Vencedor:',
            'wait': 'Aguarde sua vez'
        },
        'en': {
            'passed': 'SKIPPED TURN!',
            'searching': 'Searching rooms...',
            'no_rooms': 'No active rooms.',
            'connecting': 'Connecting to server...',
            'game_over': 'GAME OVER',
            'winner': 'Winner:',
            'wait': 'Wait your turn'
        }
    },
    t: function(key) {
        return this.locales[this.lang][key] || key;
    }
};

/**
 * Exibe um alerta de alto impacto na tela (ex: quando alguem passa)
 */
window.showFlashAlert = function(text, duration = 1500) {
    let alertEl = document.getElementById('flash-alert');
    if (!alertEl) {
        alertEl = document.createElement('div');
        alertEl.id = 'flash-alert';
        alertEl.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:99999; background:rgba(0,0,0,0.85); color:var(--gold); padding:20px 40px; border-radius:50px; font-size:2rem; font-weight:900; pointer-events:none; border:2px solid var(--gold); box-shadow:0 0 50px var(--gold-glow); display:none; white-space:nowrap;';
        document.body.appendChild(alertEl);
    }
    
    alertEl.innerText = text;
    alertEl.style.display = 'block';
    
    // Animacao simples de entrada
    alertEl.animate([
        { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0 },
        { transform: 'translate(-50%, -50%) scale(1.1)', opacity: 1 },
        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 }
    ], { duration: 300, easing: 'ease-out' });

    setTimeout(() => {
        alertEl.style.display = 'none';
    }, duration);
};

/**
 * Alterna a exibicao do menu de opcoes (3 pontos)
 */
window.toggleOptionsMenu = function() {
    const menu = document.getElementById('options-menu');
    if (menu) {
        menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'flex' : 'none';
    }
};

// Funcoes legadas de paineis (atualizadas para fechar o menu)
window.showEmotePanel = function() {
    let panel = document.getElementById('emote-panel');
    if (!panel) { /* logica de criacao mantida */ }
    panel.style.display = (panel.style.display === 'none') ? 'grid' : 'none';
    document.getElementById('options-menu').style.display = 'none';
};

/**
 * Notificacao de "Passei" vinculada ao Audio e Visual
 */
window.notifyPass = function(playerName) {
    if (typeof window.playPass === 'function') window.playPass();
    window.showFlashAlert(`${playerName.toUpperCase()} ${window.i18n.t('passed')}`);
};

/**
 * Internacionalizacao simples na inicializacao
 */
window.initI18n = function() {
    const browserLang = navigator.language.split('-')[0];
    if (window.i18n.locales[browserLang]) window.i18n.lang = browserLang;
};

document.addEventListener('DOMContentLoaded', window.initI18n);
