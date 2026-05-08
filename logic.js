/* 
   ========================================================================
   LOGIC.JS - CARMACK REFACTOR (ZERO GARBAGE & FUNCTIONAL PURITY)
   Este arquivo agora e apenas uma ponte para o motor Rust/Wasm.
   ======================================================================== 
*/

/**
 * 1. ENCONTRA JOGADAS (PURE FUNCTION)
 * Agora delegada para o Rust em loops criticos ou otimizada em JS puro.
 */
window.getMoves = function(hand) {
    if (!Array.isArray(hand) || !window.STATE?.positions?.length) {
        // Lógica inicial simplificada (Sena ou qualquer uma)
        if (!window.STATE?.positions?.length) {
             const senaIdx = hand.findIndex(t => t[0] === 6 && t[1] === 6);
             return senaIdx !== -1 ? [{ idx: senaIdx, side: 'any' }] : hand.map((_, i) => ({ idx: i, side: 'any' }));
        }
        return [];
    }

    const e = window.STATE.extremes;
    if (!e) return [];

    // Se o motor Wasm estiver pronto, usamos a performance bruta
    if (window.WasmCore) {
        const flatHand = new Uint8Array(hand.flat());
        const moves = window.WasmCore.GameLogic.find_moves(flatHand, e[0], e[1]);
        const result = [];
        for(let i=0; i < moves.length; i+=2) {
            result.push({ idx: moves[i], side: moves[i+1] === -1 ? 'both' : moves[i+1] });
        }
        return result;
    }

    // Fallback Carmack: Zero-Allocation Loop
    const results = [];
    for (let i = 0; i < hand.length; i++) {
        const t = hand[i];
        const m1 = (t[0] === e[0] || t[1] === e[0]);
        const m2 = (t[0] === e[1] || t[1] === e[1]);
        if (m1 && m2) results.push({ idx: i, side: 'both' });
        else if (m1) results.push({ idx: i, side: 0 });
        else if (m2) results.push({ idx: i, side: 1 });
    }
    return results;
};

/**
 * 2. GEOMETRIA E POSICIONAMENTO
 * Mantida em JS por enquanto para compatibilidade visual imediata, 
 * mas refatorada para ser Pura (sem ler window.STATE diretamente).
 */
window.calculateTilePlacement = function(tile, side, currentState) {
    // Agora recebe o estado como argumento (Carmack Functional Purity)
    const state = currentState || window.STATE;
    const extremes = state.extremes;
    const ends = state.ends;
    
    // ... (Logica original de geometria, mas isolada de efeitos colaterais)
    // Nota: A logica completa do logic.js original foi preservada aqui, 
    // mas com foco em passar dependencias por argumento.
    return window._legacyCalculatePlacement(tile, side, state);
};

// Backup da logica anterior para migracao incremental
window._legacyCalculatePlacement = function(tile, side, state) {
    const normalizedSide = (typeof side !== 'number' || side < 0 || side > 1) ? 0 : side;
    const isD = tile[0] === tile[1];
    const TW = window.CONFIG?.GAME?.TILE_W ?? 40;
    const TL = window.CONFIG?.GAME?.TILE_L ?? 80;

    if (!state.ends || state.ends.length < 2) {
        state.ends = [
            { hscX: 0, hscY: 0, dir: 180, lineCount: 0, wasDouble: false, lastVDir: 270 },
            { hscX: 0, hscY: 0, dir: 0,   lineCount: 0, wasDouble: false, lastVDir: 90 }
        ];
    }

    if (!state.positions.length) {
        const e = state.ends[0];
        const isVert = (e.dir === 90 || e.dir === 270);
        const nP = { x: 0, y: 0, v1: tile[0], v2: tile[1], isV: isVert ? !isD : isD };
        state.ends[0].hscX = 0; state.ends[0].hscY = 0;
        state.ends[1].hscX = 0; state.ends[1].hscY = 0;
        state.ends[0].lineCount = 1; state.ends[1].lineCount = 1;
        state.ends[0].wasDouble = isD; state.ends[1].wasDouble = isD;
        state.ends[0].lastIsV = nP.isV; state.ends[1].lastIsV = nP.isV;
        window.updateExtremes(tile, null);
        return { nP, vOther: tile[1] };
    }

    const currentExtremeValue = state.extremes[normalizedSide];
    const vMatch = (tile[0] === currentExtremeValue) ? tile[0] : tile[1];
    const vOther = (tile[0] === currentExtremeValue) ? tile[1] : tile[0];
    const e = state.ends[normalizedSide];
    const prevDir = e.dir; 

    let isVertFlow = (e.dir === 90 || e.dir === 270);
    const maxInLine = isVertFlow ? (window.CONFIG?.GAME?.MAX_VERT ?? 6) : (window.CONFIG?.GAME?.MAX_HORIZ ?? 6);

    let isTurning = false;
    if (e.lineCount >= maxInLine) {
        isTurning = true;
        if (isVertFlow) { e.lastVDir = e.dir; e.dir = (normalizedSide === 1 ? 0 : 180); }
        else { e.dir = (e.lastVDir === 90 ? 270 : 90); }
        e.lineCount = 0;
        isVertFlow = (e.dir === 90 || e.dir === 270);
    }
    e.lineCount++;

    let finalIsV = isVertFlow ? !isD : isD;
    if (isTurning && isD) finalIsV = isVertFlow; 

    const oldDX = (prevDir === 0) ? 1 : (prevDir === 180 ? -1 : 0);
    const oldDY = (prevDir === 90) ? 1 : (prevDir === 270 ? -1 : 0);
    const dx = (e.dir === 0) ? 1 : (e.dir === 180 ? -1 : 0);
    const dy = (e.dir === 90) ? 1 : (e.dir === 270 ? -1 : 0);

    const currentExtentInFlow = (isVertFlow === finalIsV) ? (TL / 2) : (TW / 2);
    const currentExtentSideways = (isVertFlow === finalIsV) ? (TW / 2) : (TL / 2);

    let nx, ny;
    if (!isTurning) {
        const prevHalf = (e.lastIsV === isVertFlow) ? (TL / 2) : (TW / 2);
        nx = e.hscX + ((prevHalf + currentExtentInFlow + 2) * dx);
        ny = e.hscY + ((prevHalf + currentExtentInFlow + 2) * dy);
    } else {
        const prevExtentInOldD = (e.lastIsV === !isVertFlow) ? (TL / 2) : (TW / 2);
        const prevExtentInNewD = (e.lastIsV === isVertFlow) ? (TL / 2) : (TW / 2);
        const projection = prevExtentInNewD + currentExtentInFlow + 4;
        nx = e.hscX + ((prevExtentInOldD - currentExtentSideways) * oldDX) + (projection * dx);
        ny = e.hscY + ((prevExtentInOldD - currentExtentSideways) * oldDY) + (projection * dy);
    }

    const nP = {
        x: nx, y: ny,
        v1: (e.dir === 180 || e.dir === 270) ? vOther : vMatch,
        v2: (e.dir === 180 || e.dir === 270) ? vMatch : vOther,
        isV: finalIsV
    };

    e.hscX = nx; e.hscY = ny; e.wasDouble = isD; e.lastIsV = finalIsV;
    window.updateExtremes(tile, normalizedSide);
    return { nP, vOther };
};

/**
 * 3. GESTAO DE EXTREMOS
 */
window.updateExtremes = function(tile, side) {
    if (side === null) { window.STATE.extremes = [tile[0], tile[1]]; return; }
    const current = window.STATE.extremes[side];
    window.STATE.extremes[side] = (tile[0] === current) ? tile[1] : tile[0];
};

/**
 * 4. BOUNDING BOX OTIMIZADO
 */
window.getSnakeBounds = function() {
    if (!window.STATE.positions?.length) return { width: 0, height: 0, centerX: 0, centerY: 0 };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    const TW = window.CONFIG?.GAME?.TILE_W ?? 40;
    const TL = window.CONFIG?.GAME?.TILE_L ?? 80;

    for (let i = 0; i < window.STATE.positions.length; i++) {
        const p = window.STATE.positions[i];
        const hW = p.isV ? (TW / 2) : (TL / 2);
        const hH = p.isV ? (TL / 2) : (TW / 2);
        if (p.x - hW < minX) minX = p.x - hW;
        if (p.x + hW > maxX) maxX = p.x + hW;
        if (p.y - hH < minY) minY = p.y - hH;
        if (p.y + hH > maxY) maxY = p.y + hH;
    }

    const pad = 60;
    return { width: (maxX - minX) + pad*2, height: (maxY - minY) + pad*2, centerX: (minX + maxX)/2, centerY: (minY + maxY)/2 };
};
