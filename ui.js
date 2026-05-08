/* 
   ========================================================================
   UI.JS - O COORDENADOR DE INTERFACE (VERSAO BLINDADA)
   ======================================================================== 
*/

/**
 * Gerencia o Menu de Audio
 */
window.AudioMenu = {
    show: function() {
        let panel = document.getElementById('audio-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'audio-panel';
            panel.className = 'glass audio-menu';
            panel.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:10001; padding:30px; display:flex; flex-direction:column; gap:20px; min-width:280px;';

            const sfxVol = window.safeGetStorage('domino_sfx_vol', 0.5);            const bgmVol = window.safeGetStorage('domino_bgm_vol', 0.3);

            panel.innerHTML = `
                <h2 style="margin:0; color:var(--gold); text-align:center;">AUDIO</h2>
                
                <div class="audio-control">
                    <label>Efeitos (SFX)</label>
                    <input type="range" id="sfx-slider" min="0" max="1" step="0.05" value="${sfxVol}">
                </div>

                <div class="audio-control">
                    <label>Musica (BGM)</label>
                    <input type="range" id="bgm-slider" min="0" max="1" step="0.05" value="${bgmVol}">
                </div>

                <button class="btn-side" style="width:100%;" onclick="window.AudioMenu.close()">FECHAR</button>
            `;
            document.body.appendChild(panel);

            // Listeners para atualizacao em tempo real
            const sfxSlider = document.getElementById('sfx-slider');
            const bgmSlider = document.getElementById('bgm-slider');

            sfxSlider.oninput = (e) => window.AudioManager.setVolumes(parseFloat(e.target.value), parseFloat(bgmSlider.value));
            bgmSlider.oninput = (e) => window.AudioManager.setVolumes(parseFloat(sfxSlider.value), parseFloat(e.target.value));
        }
        panel.style.display = 'flex';
    },

    close: function() {
        const panel = document.getElementById('audio-panel');
        if (panel) panel.style.display = 'none';
    }
};

/**
 * Alterna a exibicao do menu de opcoes (3 pontos)
 */
window.toggleOptionsMenu = function(event) {
    if (event) event.stopPropagation(); // Evita que o clique no botao feche o menu imediatamente pelo listener global
    const menu = document.getElementById('options-menu');
    if (menu) {
        menu.style.display = (menu.style.display === 'none' || menu.style.display === '') ? 'flex' : 'none';
    }
};

/**
 * Fecha todos os menus de opcoes abertos
 */
window.closeAllMenus = function() {
    const menus = ['options-menu', 'emote-panel', 'chat-panel'];
    menus.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
};

/**
 * Listener global para fechar menus ao clicar fora
 */
document.addEventListener('click', (e) => {
    const optionsBtn = document.querySelector('.options-trigger'); // Assumindo que o botao tem essa classe ou ID similar
    const optionsMenu = document.getElementById('options-menu');
    const emotePanel = document.getElementById('emote-panel');
    const chatPanel = document.getElementById('chat-panel');

    // Se clicar fora do menu de opcoes e dos paineis (e nao for o botao de abrir), fecha tudo
    if (optionsMenu && optionsMenu.style.display === 'flex') {
        if (!optionsMenu.contains(e.target) && (!optionsBtn || !optionsBtn.contains(e.target))) {
            window.closeAllMenus();
        }
    } else if ((emotePanel && emotePanel.style.display === 'grid' && !emotePanel.contains(e.target)) ||
               (chatPanel && chatPanel.style.display === 'grid' && !chatPanel.contains(e.target))) {
        window.closeAllMenus();
    }
});

/**
 * Exibe painel de emotes
 */
window.showEmotePanel = function() {
    let panel = document.getElementById('emote-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'emote-panel';
        panel.className = 'glass';
        panel.style.cssText = 'position:fixed; top:130px; right:170px; z-index:1002; padding:10px; display:grid; grid-template-columns:repeat(3, 1fr); gap:5px; box-shadow: 0 10px 20px rgba(0,0,0,0.5);';
        
        const emotes = ["😂", "😠", "👍", "👎", "🤔", "🔥"];
        emotes.forEach(emo => {
            const btn = document.createElement('button');
            btn.className = 'btn-side';
            btn.style.padding = '10px';
            btn.innerText = emo;
            btn.onclick = () => {
                window.Network.request({ type: 'emote', pIdx: window.myPlayerIdx, emote: emo });
                window.Dashboard.showEmote(window.myPlayerIdx, emo);
                panel.style.display = 'none';
                document.getElementById('options-menu').style.display = 'none';
            };
            panel.appendChild(btn);
        });
        document.body.appendChild(panel);
    }
    panel.style.display = (panel.style.display === 'none') ? 'grid' : 'none';
    if (panel.style.display === 'grid') {
        const chatPanel = document.getElementById('chat-panel');
        if (chatPanel) chatPanel.style.display = 'none';
    }
};

/**
 * Exibe painel de chat rapido
 */
window.showQuickChatPanel = function() {
    let panel = document.getElementById('chat-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'chat-panel';
        panel.className = 'glass';
        panel.style.cssText = 'position:fixed; top:130px; right:170px; z-index:1002; padding:10px; display:grid; gap:5px; box-shadow: 0 10px 20px rgba(0,0,0,0.5);';
        
        const messages = ["Boa!", "Vamos!", "Desculpa", "Paciencia"];
        messages.forEach(msg => {
            const btn = document.createElement('button');
            btn.className = 'btn-side';
            btn.innerText = msg;
            btn.onclick = () => {
                window.Network.request({ type: 'quick_chat', pIdx: window.myPlayerIdx, message: msg });
                window.Dashboard.showQuickChat(window.myPlayerIdx, msg);
                panel.style.display = 'none';
                document.getElementById('options-menu').style.display = 'none';
            };
            panel.appendChild(btn);
        });
        document.body.appendChild(panel);
    }
    panel.style.display = (panel.style.display === 'none') ? 'grid' : 'none';
    if (panel.style.display === 'grid') {
        const emotePanel = document.getElementById('emote-panel');
        if (emotePanel) emotePanel.style.display = 'none';
    }
};

/**
 * Exibe o painel de estatisticas do jogador
 */
window.showStatsPanel = function() {
    let panel = document.getElementById('stats-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'stats-panel';
        panel.className = 'glass audio-menu';
        panel.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:10002; padding:30px; display:flex; flex-direction:column; gap:15px; min-width:300px;';
        document.body.appendChild(panel);
    }
    
    const stats = window.StatsManager.get();
    const winRate = stats.roundsPlayed > 0 ? ((stats.wins / stats.roundsPlayed) * 100).toFixed(1) : 0;

    panel.innerHTML = `
        <h2 style="margin:0; color:var(--gold); text-align:center;">ESTATISTICAS</h2>
        
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; font-size:0.9rem;">
            <span>Vitorias:</span> <span style="text-align:right; color:var(--gold);">${stats.wins}</span>
            <span>Derrotas:</span> <span style="text-align:right;">${stats.losses}</span>
            <span>Win Rate:</span> <span style="text-align:right; color:var(--gold);">${winRate}%</span>
            <span>Pecas Jogadas:</span> <span style="text-align:right;">${stats.tilesPlayed}</span>
            <span>Pontos Totais:</span> <span style="text-align:right; color:var(--gold);">${stats.totalScore}</span>
        </div>

        <button class="btn-side" style="width:100%; margin-top:10px;" onclick="document.getElementById('stats-panel').style.display='none'">FECHAR</button>
    `;
    panel.style.display = 'flex';
};

/**
 * Gestor de Temas Visuais
 */
window.ThemeManager = {
    set: function(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        window.safeSetStorage('domino_theme', theme);
    },
    init: function() {
        const t = window.safeGetStorage('domino_theme', 'dark');
        this.set(t);
    }
};

/**
 * Gestor de Idiomas (i18n)
 */
window.LanguageManager = {
    _lang: 'pt',
    _data: {
        'pt': {
            'play': 'Jogar',
            'offline': 'Um Jogador',
            'host': 'Criar Sala',
            'client': 'Entrar na Sala',
            'stats': 'Estatisticas',
            'settings': 'Ajustes',
            'themes': 'Temas',
            'lang': 'Idioma',
            'wins': 'Vitorias',
            'losses': 'Derrotas',
            'tiles': 'Pecas Jogadas',
            'your_turn': 'Sua vez!',
            'thinking': 'PENSANDO...'
        },
        'en': {
            'play': 'Play',
            'offline': 'Single Player',
            'host': 'Host Room',
            'client': 'Join Room',
            'stats': 'Statistics',
            'settings': 'Settings',
            'themes': 'Themes',
            'lang': 'Language',
            'wins': 'Wins',
            'losses': 'Losses',
            'tiles': 'Tiles Played',
            'your_turn': 'Your turn!',
            'thinking': 'THINKING...'
        }
    },
    set: function(lang) {
        this._lang = lang;
        window.safeSetStorage('domino_lang', lang);
        this.updateUI();
    },
    get: function(key) {
        return this._data[this._lang][key] || key;
    },
    init: function() {
        this._lang = window.safeGetStorage('domino_lang', 'pt');
        this.updateUI();
    },
    updateUI: function() {
        // Logica para atualizar textos que ja estao no DOM
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.innerText = this.get(key);
        });
    }
};

/**
 * Exibe painel de customizacao (Temas e Idioma)
 */
window.showSettingsPanel = function() {
    let panel = document.getElementById('settings-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.id = 'settings-panel';
        panel.className = 'glass audio-menu';
        panel.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:10003; padding:30px; display:flex; flex-direction:column; gap:20px; min-width:300px;';
        document.body.appendChild(panel);
    }
    
            panel.innerHTML = `
                <h2 style="margin:0; color:var(--gold); text-align:center;" data-i18n="settings">AJUSTES</h2>
                
                <div class="audio-control">
                    <label id="label-theme">Tema Visual</label>
                    <select aria-labelledby="label-theme" onchange="window.ThemeManager.set(this.value)" class="start-btn" style="padding:10px; font-size:0.9rem; background:var(--bg-dark); color:var(--gold); border:1px solid var(--gold);">
                        <option value="dark">Dark (Padrao)</option>
                        <option value="light">Light</option>
                        <option value="vintage">Vintage</option>
                        <option value="ocean">Ocean Blue</option>
                        <option value="midnight">Midnight Purple</option>
                    </select>
                </div>

                <div class="audio-control">
                    <label id="label-lang">Idioma / Language</label>
                    <div style="display:flex; gap:10px;">
                        <button class="btn-side" style="flex:1" onclick="window.LanguageManager.set('pt')" aria-label="Português Brasil">PT-BR</button>
                        <button class="btn-side" style="flex:1" onclick="window.LanguageManager.set('en')" aria-label="English US">EN-US</button>
                    </div>
                </div>

                <button class="btn-side" style="width:100%;" onclick="document.getElementById('settings-panel').style.display='none'" aria-label="Fechar Ajustes">FECHAR</button>
            `;
    panel.style.display = 'flex';
};

window.ThemeManager.init();
window.LanguageManager.init();

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