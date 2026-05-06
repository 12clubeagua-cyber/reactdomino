/* 
   ========================================================================
   INPUT.JS - CONTROLE DE ENTRADA E INTERATIVIDADE (VERSÃO BLINDADA)
   Gerencia cliques nas peças, Drag-and-Drop e menus de escolha.
   ======================================================================== 
*/

/**
 * 1. EVENTOS GERAIS DE SISTEMA
 */
let resizeTimeout;
window.handleResize = function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (window.STATE?.positions?.length > 0) {
            if (typeof window.updateCamera === 'function') window.updateCamera();
            if (typeof window.renderBoardFromState === 'function') window.renderBoardFromState();
        }
    }, 150);
};
window.addEventListener('resize', window.handleResize);

/**
 * 2. DRAG AND DROP (Otimizado)
 */
let draggedTile = null;

window.handleDrag = function(e) {
    if (!draggedTile) return;
    const x = e.clientX || (e.touches ? e.touches[0].clientX : 0);
    const y = e.clientY || (e.touches ? e.touches[0].clientY : 0);
    
    requestAnimationFrame(() => {
        if (!draggedTile) return;
        draggedTile.style.left = `${x - 15}px`;
        draggedTile.style.top = `${y - 15}px`;
    });
};

window.endDrag = function(e) {
    if (!draggedTile) return;
    
    draggedTile.style.position = 'relative';
    draggedTile.style.left = 'auto';
    draggedTile.style.top = 'auto';
    draggedTile.style.zIndex = '';
    draggedTile = null;

    // Remove listeners apenas quando a acao termina para economizar CPU
    window.removeEventListener('mousemove', window.handleDrag);
    window.removeEventListener('mouseup', window.endDrag);
    window.removeEventListener('touchmove', window.handleDrag);
    window.removeEventListener('touchend', window.endDrag);
};

window.initDrag = function(e, tileIdx) {
    if (window.STATE?.isBlocked) return;
    draggedTile = e.target;
    
    draggedTile.style.zIndex = '1000';
    draggedTile.style.position = 'fixed';

    // Adiciona listeners apenas durante o arrasto
    window.addEventListener('mousemove', window.handleDrag);
    window.addEventListener('mouseup', window.endDrag);
    window.addEventListener('touchmove', window.handleDrag, { passive: true });
    window.addEventListener('touchend', window.endDrag);
};

/**
 * 3. GESTÃO DE INTERATIVIDADE (CLIQUES)
 */
window.removePlayableListeners = function() {
    const myIdx = window.myPlayerIdx ?? 0;
    const rack = document.querySelector(`#hand-0 .tiles-rack`);
    if (!rack) return;

    const tiles = rack.querySelectorAll('.tile');
    tiles.forEach(el => {
        el.classList.remove('playable');
        el.onclick = null;
        el.onmousedown = null;
    });
};

window.highlight = function(moves) {
    window.removePlayableListeners();

    moves.forEach(move => {
        const el = document.getElementById(`my-tile-${move.idx}`);
        if (!el) return;
        
        el.classList.add('playable');
        el.onmousedown = (e) => window.initDrag(e, move.idx);
        
        el.onclick = () => {
            if (window.STATE?.isBlocked) return;
            
            const extremesAreDiff = window.STATE?.extremes?.[0] !== window.STATE?.extremes?.[1];
            const needsPicker = move.side === 'both' && extremesAreDiff && window.STATE?.positions?.length > 0;

            if (needsPicker) {
                window.STATE.isBlocked = true;
                window.STATE.pendingIdx = move.idx;
                const picker = document.getElementById('side-picker');
                if (picker) picker.style.display = 'flex';
            } else {
                window.STATE.isBlocked = true;
                const side = (move.side === 'both' || move.side === 'any') ? 0 : move.side;
                if (typeof window.play === 'function') window.play(window.myPlayerIdx ?? 0, move.idx, side);
            }
        };
    });
};

/**
 * 4. FLUXO DE ESCOLHA (PICKER)
 */
window.executeMove = function(side) {
    document.getElementById('side-picker').style.display = 'none';
    if (window.STATE && window.STATE.pendingIdx !== null) {
        const idx = window.STATE.pendingIdx;
        window.STATE.pendingIdx = null;
        if (typeof window.play === 'function') window.play(window.myPlayerIdx ?? 0, idx, side);
    }
};

window.cancelMove = function() {
    document.getElementById('side-picker').style.display = 'none';
    if (window.STATE) {
        window.STATE.pendingIdx = null;
        window.STATE.isBlocked = false;
        const moves = window.getMoves(window.STATE.hands[window.myPlayerIdx ?? 0]);
        if (moves.length > 0) window.highlight(moves);
    }
};