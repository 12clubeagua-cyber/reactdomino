/* 
   ========================================================================
   ANIMATIONS.JS - VISUAIS E DINAMICA DE CAMERA (VERSAO BLINDADA)
   ======================================================================== 
*/

/**
 * HAPTIC ENGINE (FEEDBACK TATIL)
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

    // Usa o calculo centralizado da logica para evitar duplicacao
    const bounds = typeof window.getSnakeBounds === 'function' 
        ? window.getSnakeBounds() 
        : { minX: -100, maxX: 100, minY: -100, maxY: 100, centerX: 0, centerY: 0 };

    const padding = 100; // Margem maior para as pecas maiores
    const viewW = boardBox.clientWidth;
    const viewH = boardBox.clientHeight;

    const contentW = (bounds.maxX - bounds.minX) + padding * 2;
    const contentH = (bounds.maxY - bounds.minY) + padding * 2;

    const scaleX = viewW / contentW;
    const scaleY = viewH / contentH;
    
    const maxScaleConfig = window.CONFIG?.GAME?.SNAKE_MAX_SCALE ?? 1;
    const minScaleConfig = window.CONFIG?.GAME?.SNAKE_MIN_SCALE ?? 0.1;
    
    let finalScale = Math.min(scaleX, scaleY);
    // Clamping do scale
    finalScale = Math.max(minScaleConfig, Math.min(finalScale, maxScaleConfig));

    const offsetX = -bounds.centerX;
    const offsetY = -bounds.centerY;
    
    // Define variaveis CSS para a animacao de shake usar os valores atuais
    document.documentElement.style.setProperty('--cam-scale', finalScale);
    document.documentElement.style.setProperty('--cam-x', `${offsetX}px`);
    document.documentElement.style.setProperty('--cam-y', `${offsetY}px`);

    snakeEl.style.willChange = 'transform';
    snakeEl.style.transform = `scale(${finalScale}) translate(${offsetX}px, ${offsetY}px)`;
    
    window.currentCamera = {
        scale: finalScale,
        x: offsetX,
        y: offsetY
    };
};

/**
 * Efeito de tremor de tela (Screen Shake) para eventos de impacto.
 */
window.Animations.screenShake = function(intensity = 10, duration = 300) {
    const gameArea = document.getElementById('game-area');
    if (!gameArea) return;
    
    gameArea.classList.remove('shake-anim');
    void gameArea.offsetWidth; // Trigger reflow
    gameArea.classList.add('shake-anim');
    
    // Feedback haptico se disponivel
    if (typeof window.HapticEngine !== 'undefined') {
        window.HapticEngine.vibrate('error');
    }

    setTimeout(() => {
        gameArea.classList.remove('shake-anim');
    }, duration);
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
        
        // Easing: Linear (movimento direto em linha reta com velocidade constante)
        const ease = t; 
        
        const curX = startX + (destX - startX) * ease;
        const curY = startY + (destY - startY) * ease;
        const curScale = 1 + (cam.scale - 1) * ease;

        // PERFORMANCE: Usamos translate3d para forcar processamento na GPU e evitar Layout Recalculation
        proxy.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%) scale(${curScale})`;

        if (t < 1) {
            requestAnimationFrame(step); 
        } else {
            if (typeof window.playClack === 'function') window.playClack();
            
            // Trigger particulas no destino
            if (typeof window.spawnImpactParticles === 'function') {
                const isDouble = targetData.v1 === targetData.v2;
                window.spawnImpactParticles(destX, destY, isDouble);
            }

            if (typeof onComplete === 'function') onComplete();
            requestAnimationFrame(() => proxy.remove());
        }
    }

    // Inicializa a posicao sem forcar layout
    proxy.style.left = "0px";
    proxy.style.top = "0px";
    proxy.style.transform = `translate3d(${startX}px, ${startY}px, 0) translate(-50%, -50%) scale(1)`;
    
    requestAnimationFrame(step);
};

/**
 * 4. EFEITOS ESPECIAIS (PARTICULAS E SHAKE)
 */

// POOL DE PARTICULAS: Reutiliza elementos DOM para evitar GC jank (Best Practice 2026)
window._particlePool = [];
window._getParticleFromPool = function() {
    if (window._particlePool.length > 0) {
        const p = window._particlePool.pop();
        p.style.display = 'block';
        return p;
    }
    const p = document.createElement('div');
    p.className = 'particle';
    return p;
};

window._returnParticleToPool = function(p) {
    p.style.display = 'none';
    p.style.transform = '';
    window._particlePool.push(p);
};

window.screenShake = function() {
    const snakeEl = document.getElementById('snake');
    if (!snakeEl) return;
    
    snakeEl.classList.remove('shake');
    void snakeEl.offsetWidth; // Trigger reflow
    snakeEl.classList.add('shake');
    
    if (window.HapticEngine) window.HapticEngine.vibrate('error');
    
    setTimeout(() => {
        snakeEl.classList.remove('shake');
    }, 500);
};

/**
 * Cria particulas de impacto (poeira/faiscas) no local da jogada.
 */
window.spawnImpactParticles = function(x, y, isDouble = false) {
    return; // Efeito de faisca desativado por solicitacao
    const count = isDouble ? 15 : 8;
    const colors = isDouble ? ['#ffcc33', '#ffffff', '#ff5722'] : ['#a8b4a8', '#f0ede0'];
    
    for (let i = 0; i < count; i++) {
        const p = window._getParticleFromPool();
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * (isDouble ? 6 : 4) + 2;
        
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.background = color;
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        p.style.opacity = '1';
        
        if (!p.parentNode) document.body.appendChild(p);

        const angle = Math.random() * Math.PI * 2;
        const force = Math.random() * (isDouble ? 8 : 4) + 2;
        const vx = Math.cos(angle) * force;
        const vy = Math.sin(angle) * force;
        
        let curX = x;
        let curY = y;
        let opacity = 1;

        const startTime = performance.now();
        const duration = 600 + Math.random() * 400;

        function step(now) {
            const t = (now - startTime) / duration;
            if (t >= 1) {
                window._returnParticleToPool(p);
                return;
            }

            curX += vx;
            curY += vy + (t * 2); // Gravidade leve
            opacity = 1 - t;

            p.style.transform = `translate3d(${curX - x}px, ${curY - y}px, 0)`;
            p.style.opacity = opacity;

            requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
};

window.spawnConfetti = function() {
    const colors = ['#FFD700', '#FFA500', '#FF4500', '#00FF00', '#00BFFF', '#FF1493'];
    const count = 50;

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 4;
        
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.background = color;
        p.style.left = `${Math.random() * 100}vw`;
        p.style.top = `-20px`;
        
        document.body.appendChild(p);

        const velocityX = (Math.random() - 0.5) * 10;
        const velocityY = Math.random() * 5 + 5;
        const rotation = Math.random() * 360;
        const rotationSpeed = (Math.random() - 0.5) * 10;
        
        let posX = parseFloat(p.style.left);
        let posY = -20;
        let angle = rotation;

        const startTime = performance.now();
        const duration = 2000 + Math.random() * 1000;

        function animate(now) {
            const elapsed = now - startTime;
            const t = elapsed / duration;

            if (t >= 1) {
                p.remove();
                return;
            }

            posY += velocityY;
            posX += velocityX + Math.sin(elapsed / 200) * 2;
            angle += rotationSpeed;

            p.style.transform = `translate3d(${posX}px, ${posY}px, 0) rotate(${angle}deg)`;
            p.style.opacity = 1 - Math.pow(t, 2);

            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }
};

