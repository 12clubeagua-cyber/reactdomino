/* 
   ========================================================================
   ANIMATIONS.JS - VISUAIS E DINÂMICA DE CÂMERA (VERSÃO BLINDADA)
   ======================================================================== 
*/

/**
 * HAPTIC ENGINE (FEEDBACK TÁTIL)
 */
window.HapticEngine = {
    patterns: {
        success: [30, 50, 30],
        error: [100, 30, 100],
        win: [100, 50, 100, 50, 100],
        click: [10]
    },

    vibrate: function(type) {
        if (!navigator.vibrate) return;
        const pattern = window.HapticEngine.patterns[type] || [20];
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            console.warn("Haptic feedback error:", e);
        }
    }
};

window.Animations = {
    _cache: {},
    _getEl: function(id) {
        if (!window.Animations._cache[id]) window.Animations._cache[id] = document.getElementById(id);
        return window.Animations._cache[id];
    }
};

window.updateCamera = function() {
    const snakeEl = window.Animations._getEl('snake');
    const boardBox = window.Animations._getEl('board-container');
    
    if (!window.STATE?.positions?.length || !snakeEl || !boardBox) {
        if (snakeEl) {
            snakeEl.style.transform = `scale(1) translate(0px, 0px)`;
            window.currentCamera = { scale: 1, x: 0, y: 0 };
        }
        return;
    }

    const tileW = window.CONFIG?.GAME?.TILE_W ?? 18;
    const tileL = window.CONFIG?.GAME?.TILE_L ?? 36;
    const tileHalfW = tileW / 2;
    const tileHalfL = tileL / 2;

    let minX = 0, maxX = 0, minY = 0, maxY = 0;

    const positions = window.STATE.positions;
    for (let i = 0; i < positions.length; i++) {
        const p = positions[i];
        const w = p.isV ? tileHalfW : tileHalfL;
        const h = p.isV ? tileHalfL : tileHalfW;
        if (p.x - w < minX) minX = p.x - w;
        if (p.x + w > maxX) maxX = p.x + w;
        if (p.y - h < minY) minY = p.y - h;
        if (p.y + h > maxY) maxY = p.y + h;
    }

    const padding = 100;
    const viewW = boardBox.clientWidth;
    const viewH = boardBox.clientHeight;

    const contentW = (maxX - minX) + padding;
    const contentH = (maxY - minY) + padding;

    const scaleX = viewW / contentW;
    const scaleY = viewH / contentH;
    
    const maxScaleConfig = window.CONFIG?.GAME?.SNAKE_MAX_SCALE ?? 1;
    const finalScale = Math.min(scaleX, scaleY, maxScaleConfig);

    const offsetX = -(minX + maxX) / 2;
    const offsetY = -(minY + maxY) / 2;
    
    // Define variaveis CSS para a animacao de shake usar os valores atuais
    document.documentElement.style.setProperty('--cam-scale', finalScale);
    document.documentElement.style.setProperty('--cam-x', `${offsetX}px`);
    document.documentElement.style.setProperty('--cam-y', `${offsetY}px`);

    snakeEl.style.transform = `scale(${finalScale}) translate(${offsetX}px, ${offsetY}px)`;
    
    window.currentCamera = {
        scale: finalScale,
        x: offsetX,
        y: offsetY
    };
};

/**
 * 3. ANIMACOES DE JOGADA (FLYING TILES)
 * Move a peca da mao do jogador ate a posicao exata na mesa.
 */
window.animateTile = function(pIdx, targetData, onComplete) {
    const snakeEl = document.getElementById('snake');
    const containerEl = document.getElementById('board-container');
    
    // Se a interface falhar, aplica a jogada instantaneamente
    if (!snakeEl || !containerEl || !targetData) {
        if (typeof onComplete === 'function') onComplete();
        return;
    }

    // Cria a peca 'fantasma' que fara o trajeto visual
    const proxy = document.createElement('div');
    proxy.className = `tile moving-proxy ${targetData.isV ? 'tile-v' : 'tile-h'}`;
    proxy.style.cssText = `z-index: 9999; position: fixed; pointer-events: none;`;
    
    // Preenche a peca fantasma com os pontos de forma segura
    let pipsHTML = "";
    if (typeof window.Renderer !== 'undefined' && typeof window.Renderer._getPips === 'function') {
        pipsHTML = `<div class="half">${window.Renderer._getPips(targetData.v1)}</div><div class="half">${window.Renderer._getPips(targetData.v2)}</div>`;
    } else if (typeof window.getPips === 'function') {
        pipsHTML = `<div class="half">${window.getPips(targetData.v1)}</div><div class="half">${window.getPips(targetData.v2)}</div>`;
    }
    proxy.innerHTML = pipsHTML;
    document.body.appendChild(proxy);

    // 1. Define o PONTO DE PARTIDA (Mao do Jogador)
    const localIdx = window.myPlayerIdx ?? 0;
    const viewIdx = (pIdx - localIdx + 4) % 4; // Qual mao na tela representa esse jogador?
    const handEl = document.getElementById(`hand-${viewIdx}`);
    
    // Se a mao nao for encontrada, parte do centro da tela
    const hRect = handEl ? handEl.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight/2, width: 0, height: 0 };
    const startX = hRect.left + (hRect.width / 2);
    const startY = hRect.top + (hRect.height / 2);

    // 2. Define o PONTO DE CHEGADA (Posicao logica traduzida para pixel e escala)
    const cRect = containerEl.getBoundingClientRect();
    const cam = window.currentCamera || { scale: 1, x: 0, y: 0 };
    
    // A magica matematica: converte a posicao logica para a fisica atual da camera
    const destX = (cRect.left + (cRect.width / 2)) + ((targetData.x + cam.x) * cam.scale);
    const destY = (cRect.top + (cRect.height / 2))  + ((targetData.y + cam.y) * cam.scale);

    const startTime = performance.now();
    const duration = 500; // Tempo de voo em ms

    // Motor de interpolacao frame a frame
    function step(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        
        // Easing: Cubic Out (comeca rapido, termina suave)
        const ease = 1 - Math.pow(1 - t, 3); 
        
        const curX = startX + (destX - startX) * ease;
        const curY = startY + (destY - startY) * ease;
        const curScale = 1 + (cam.scale - 1) * ease; // A peca encolhe/cresce durante o voo

        proxy.style.left = `${curX}px`;
        proxy.style.top = `${curY}px`;
        proxy.style.transform = `translate(-50%, -50%) scale(${curScale})`;

        if (t < 1) {
            requestAnimationFrame(step); // Continua a animacao
        } else {
            // Animacao terminou
            if (typeof window.playClack === 'function') window.playClack(); // Som de batida
            
            // E crucial chamar o onComplete (que desenha a peca real) ANTES de remover o proxy
            if (typeof onComplete === 'function') onComplete();
            
            // Remove o fantasma no proximo frame para evitar flicker (piscada)
            requestAnimationFrame(() => proxy.remove());
        }
    }
    
    requestAnimationFrame(step); // Inicia o voo
};
