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
