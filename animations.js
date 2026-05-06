/* 
   ========================================================================
   ANIMATIONS.JS - VISUAIS E DINÂMICA DE CÂMERA (VERSÃO BLINDADA)
   ======================================================================== 
*/

window.RenderPipeline = {
    activeAnimations: [],
    lastFrameTime: 0,
    
    register: (animFunc) => {
        if (!window.RenderPipeline.activeAnimations.includes(animFunc)) {
            window.RenderPipeline.activeAnimations.push(animFunc);
        }
        if (window.RenderPipeline.activeAnimations.length === 1) {
            requestAnimationFrame(window.RenderPipeline.loop);
        }
    },
    
    unregister: (animFunc) => {
        window.RenderPipeline.activeAnimations = window.RenderPipeline.activeAnimations.filter(f => f !== animFunc);
    },
    
    loop: (now) => {
        // Implementação do PowerSaver: Throttle para 30FPS se ativo
        if (window.PowerSaver && window.PowerSaver.active) {
            if (window.RenderPipeline.lastFrameTime && (now - window.RenderPipeline.lastFrameTime) < 33) {
                requestAnimationFrame(window.RenderPipeline.loop);
                return;
            }
            window.RenderPipeline.lastFrameTime = now;
        }

        window.RenderPipeline.activeAnimations.forEach(anim => anim(now));
        if (window.RenderPipeline.activeAnimations.length > 0) {
            requestAnimationFrame(window.RenderPipeline.loop);
        }
    }
};

/**
 * 6. HAPTIC ENGINE (FEEDBACK TÁTIL)
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
    
    const centerX = (viewW / 2) / finalScale + offsetX;
    const centerY = (viewH / 2) / finalScale + offsetY;

    snakeEl.style.transform = `scale(${finalScale}) translate(${centerX}px, ${centerY}px)`;
    
    window.currentCamera = {
        scale: finalScale,
        x: offsetX,
        y: offsetY
    };
};

window.screenShake = function() {
    const snakeEl = window.Animations._getEl('snake');
    if (!snakeEl) return;
    snakeEl.classList.remove('shake');
    void snakeEl.offsetWidth; 
    snakeEl.classList.add('shake');
    setTimeout(() => snakeEl.classList.remove('shake'), 250);
};

window.runShuffleAnimation = function(onComplete) {
    const snake = window.Animations._getEl('snake');
    if (!snake) {
        if (typeof onComplete === 'function') onComplete();
        return;
    }

    snake.innerHTML = '';
    const initialScale = window.CONFIG?.GAME?.SNAKE_MAX_SCALE ?? 1;
    snake.style.transform = `scale(${initialScale}) translate(0,0)`;
    window.currentCamera = { scale: initialScale, x: 0, y: 0 };

    const fragment = document.createDocumentFragment();
    const fakes = [];
    for (let i = 0; i < 28; i++) {
        const el = document.createElement('div');
        el.className = 'tile tile-v';
        el.style.cssText = `position:absolute; left:50%; top:50%; margin-left:-9px; margin-top:-18px; transition:transform 0.1s linear; z-index:10; opacity:0;`;
        fragment.appendChild(el);
        fakes.push(el);
    }
    snake.appendChild(fragment);

    if (navigator.vibrate) try { navigator.vibrate([10, 20, 10]); } catch (e) {}

    let startTime = performance.now();
    const duration = 1000;
    let lastScatter = 0;

    const anim = (now) => {
        const elapsed = now - startTime;
        
        if (now - lastScatter > 150) {
            fakes.forEach(el => {
                el.style.opacity = '1';
                window.applyScatter(el);
            });
            if (typeof window.playClack === 'function') window.playClack(400 + Math.random() * 200, 0.05);
            lastScatter = now;
        }

        if (elapsed < duration) return;

        fakes.forEach(el => {
            el.style.opacity = '0';
            el.style.transform += ' scale(0)';
        });
        
        window.RenderPipeline.unregister(anim);
        setTimeout(() => {
            fakes.forEach(el => el.remove());
            if (typeof onComplete === 'function') onComplete();
        }, 200);
    };

    window.RenderPipeline.register(anim);
};

window.applyScatter = function(el) {
    const range = 180;
    const rx = (Math.random() - 0.5) * range;
    const ry = (Math.random() - 0.5) * range;
    const rot = Math.random() * 360;
    el.style.transform = `translate(${rx}px, ${ry}px) rotate(${rot}deg)`;
};

window.animateTile = function(pIdx, targetData, onComplete) {
    const snakeEl = document.getElementById('snake');
    const containerEl = document.getElementById('board-container');
    if (!snakeEl || !containerEl || !targetData) {
        if (typeof onComplete === 'function') onComplete();
        return;
    }

    const proxy = document.createElement('div');
    proxy.className = `tile moving-proxy ${targetData.isV ? 'tile-v' : 'tile-h'}`;
    proxy.style.cssText = `z-index: 9999; position: fixed; pointer-events: none;`;
    
    let pipsHTML = "";
    if (typeof window.Renderer !== 'undefined' && typeof window.Renderer._getPips === 'function') {
        pipsHTML = `<div class="half">${window.Renderer._getPips(targetData.v1)}</div><div class="half">${window.Renderer._getPips(targetData.v2)}</div>`;
    } else if (typeof window.getPips === 'function') {
        pipsHTML = `<div class="half">${window.getPips(targetData.v1)}</div><div class="half">${window.getPips(targetData.v2)}</div>`;
    }
    proxy.innerHTML = pipsHTML;
    document.body.appendChild(proxy);

    const localIdx = window.myPlayerIdx ?? 0;
    const viewIdx = (pIdx - localIdx + 4) % 4;
    const handEl = document.getElementById(`hand-${viewIdx}`);
    const hRect = handEl ? handEl.getBoundingClientRect() : { left: window.innerWidth/2, top: window.innerHeight/2, width: 0, height: 0 };
    const startX = hRect.left + (hRect.width / 2);
    const startY = hRect.top + (hRect.height / 2);

    const cRect = containerEl.getBoundingClientRect();
    const cam = window.currentCamera || { scale: 1, x: 0, y: 0 };
    const destX = (cRect.left + (cRect.width / 2)) + ((targetData.x + cam.x) * cam.scale);
    const destY = (cRect.top + (cRect.height / 2))  + ((targetData.y + cam.y) * cam.scale);

    const startTime = performance.now();
    const duration = 500;

    const anim = (now) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3); 
        
        const curX = startX + (destX - startX) * ease;
        const curY = startY + (destY - startY) * ease;
        const curScale = 1 + (cam.scale - 1) * ease;

        proxy.style.left = `${curX}px`;
        proxy.style.top = `${curY}px`;
        proxy.style.transform = `translate(-50%, -50%) scale(${curScale})`;

        if (t < 1) return;
        
        if (typeof window.playClack === 'function') window.playClack();
        if (typeof onComplete === 'function') onComplete();
        requestAnimationFrame(() => proxy.remove());
        window.RenderPipeline.unregister(anim);
    };
    
    window.RenderPipeline.register(anim);
};