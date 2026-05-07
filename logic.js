/* 
   ========================================================================
   LOGIC.JS - AS REGRAS E A MATEMATICA DO JOGO (VERSAO BLINDADA)
   Versao Otimizada: Alinhamento L-Shape, Gestao de Extremos e Bounding Box.
   ======================================================================== 
*/

/**
 * 1. VALIDACAO DE JOGADAS
 * Analisa a mao do jogador e identifica onde as pecas podem ser jogadas.
 */
window.getMoves = function(hand) {
    if (!Array.isArray(hand)) return [];

    const gameMode = window.STATE?.gameMode || 'standard';
    
    // Caso Inicial: Se a mesa estiver vazia
    if (!window.STATE?.positions?.length) {
        if (window.STATE?.roundWinner === null) {
            // Regra da Bucha de Sena (6-6) para comecar o jogo
            const senaIdx = hand.findIndex(t => t[0] === 6 && t[1] === 6);
            return senaIdx !== -1 
                ? [{ idx: senaIdx, side: 'any' }] 
                : hand.map((_, i) => ({ idx: i, side: 'any' }));
        }
        return hand.map((_, i) => ({ idx: i, side: 'any' }));
    }

    const extremes = window.STATE?.extremes;
    if (!extremes || extremes.length < 2) return [];

    return hand.map((t, i) => {
        const matchLeft = (t[0] === extremes[0] || t[1] === extremes[0]);
        const matchRight = (t[0] === extremes[1] || t[1] === extremes[1]);

        if (matchLeft && matchRight) return { idx: i, side: 'both' };
        if (matchLeft) return { idx: i, side: 0 };
        if (matchRight) return { idx: i, side: 1 };
        return null;
    }).filter(Boolean);
};

/**
 * 2. GEOMETRIA E POSICIONAMENTO (CORNER HINGE ENGINE)
 * Calcula as coordenadas X, Y e a rotacao da peca na mesa.
 */
window.calculateTilePlacement = function(tile, side) {
    if (!Array.isArray(tile) || tile.length < 2) return null;
    const normalizedSide = (typeof side !== 'number' || side < 0 || side > 1) ? 0 : side;

    const isD = tile[0] === tile[1];
    const TW = window.CONFIG?.GAME?.TILE_W ?? 18;
    const TL = window.CONFIG?.GAME?.TILE_L ?? 36;

    // Inicializa os pontos de controle das extremidades se necessario
    if (!window.STATE.ends || window.STATE.ends.length < 2) {
        window.STATE.ends = [
            { hscX: 0, hscY: 0, dir: 180, lineCount: 0, wasDouble: false, lastVDir: 270 },
            { hscX: 0, hscY: 0, dir: 0,   lineCount: 0, wasDouble: false, lastVDir: 90 }
        ];
    }


    // --- CASO A: Primeira Peca da Mesa (Centro 0,0) ---
    if (!window.STATE.positions.length) {
        const e = window.STATE.ends[0];
        const isVert = (e.dir === 90 || e.dir === 270);
        
        // Se comeca vertical, a primeira peca (se bucha) deve ser horizontal para ser transversal
        // Se for normal, deve ser vertical para seguir o fluxo.
        const nP = { 
            x: 0, y: 0, 
            v1: tile[0], v2: tile[1], 
            isV: isVert ? !isD : isD 
        };

        // Reseta as coordenadas de controle para o centro da mesa
        window.STATE.ends[0].hscX = 0;
        window.STATE.ends[0].hscY = 0;
        window.STATE.ends[1].hscX = 0;
        window.STATE.ends[1].hscY = 0;
        
        window.STATE.ends[0].lineCount = 1;
        window.STATE.ends[1].lineCount = 1;
        
        window.STATE.ends[0].wasDouble = isD;
        window.STATE.ends[1].wasDouble = isD;
        
        // Inicializa dimensoes da primeira peca
        window.STATE.ends[0].lastIsV = nP.isV;
        window.STATE.ends[1].lastIsV = nP.isV;
        
        window.updateExtremes(tile, null);
        return { nP, vOther: tile[1] };
    }

    // --- CASO B: Pecas Subsequentes ---
    const currentExtremeValue = window.STATE.extremes[normalizedSide];
    const vMatch = (tile[0] === currentExtremeValue) ? tile[0] : tile[1];
    const vOther = (tile[0] === currentExtremeValue) ? tile[1] : tile[0];
    const e = window.STATE.ends[normalizedSide];

    const prevDir = e.dir; 

    // Logica de Curva (Snake Flow)
    let isVertFlow = (e.dir === 90 || e.dir === 270);
    const maxInLine = isVertFlow ? (window.CONFIG?.GAME?.MAX_VERT ?? 6) : (window.CONFIG?.GAME?.MAX_HORIZ ?? 6);

    let isTurning = false;
    if (e.lineCount >= maxInLine) {
        isTurning = true;
        if (isVertFlow) {
            e.lastVDir = e.dir;
            e.dir = (normalizedSide === 1 ? 0 : 180); // Vira para horizontal
        } else {
            e.dir = (e.lastVDir === 90 ? 270 : 90); // Vira para vertical
        }
        e.lineCount = 0;
        isVertFlow = (e.dir === 90 || e.dir === 270);
    }
    e.lineCount++;

    // Objeto de Posicao Final - CALCULADO ANTES DAS DIMENSOES
    let finalIsV = isVertFlow ? !isD : isD;
    if (isTurning && isD) {
        finalIsV = isVertFlow; // Fica paralela ao NOVO fluxo (transversal a anterior)
    }

    // Vetores de Direcao
    const oldDX = (prevDir === 0) ? 1 : (prevDir === 180 ? -1 : 0);
    const oldDY = (prevDir === 90) ? 1 : (prevDir === 270 ? -1 : 0);
    const dx = (e.dir === 0) ? 1 : (e.dir === 180 ? -1 : 0);
    const dy = (e.dir === 90) ? 1 : (e.dir === 270 ? -1 : 0);

    let nx, ny;

    // Dimensoes dinamicas baseadas na ORIENTACAO FINAL (finalIsV) e FLUXO ATUAL (isVertFlow)
    const currentExtentInFlow = (isVertFlow === finalIsV) ? (TL / 2) : (TW / 2);
    const currentExtentSideways = (isVertFlow === finalIsV) ? (TW / 2) : (TL / 2);

    if (!isTurning) {
        // Em reta, prevHalf e a extensao da peca anterior no fluxo atual
        const prevHalf = (e.lastIsV === isVertFlow) ? (TL / 2) : (TW / 2);
        const totalDist = prevHalf + currentExtentInFlow + 2; 
        nx = e.hscX + (totalDist * dx);
        ny = e.hscY + (totalDist * dy);
    } else {
        // Em curva, precisamos das extensoes da peca anterior nos dois eixos
        const oldIsVertFlow = !isVertFlow;
        const prevExtentInOldD = (e.lastIsV === oldIsVertFlow) ? (TL / 2) : (TW / 2);
        const prevExtentInNewD = (e.lastIsV === isVertFlow) ? (TL / 2) : (TW / 2);
        
        const cornerOffset = prevExtentInOldD - currentExtentSideways; 
        const projection = prevExtentInNewD + currentExtentInFlow + 4;

        nx = e.hscX + (cornerOffset * oldDX) + (projection * dx);
        ny = e.hscY + (cornerOffset * oldDY) + (projection * dy);
    }

    const nP = {
        x: nx, y: ny,
        v1: (e.dir === 180 || e.dir === 270) ? vOther : vMatch,
        v2: (e.dir === 180 || e.dir === 270) ? vMatch : vOther,
        isV: finalIsV
    };

    // Atualiza o estado da extremidade
    e.hscX = nx;
    e.hscY = ny;
    e.wasDouble = isD;
    e.lastIsV = finalIsV;
    window.updateExtremes(tile, normalizedSide);

    return { nP, vOther };
};

/**
 * 3. GESTAO DE EXTREMOS
 * Sincroniza os numeros disponiveis nas pontas do jogo.
 */
window.updateExtremes = function(tile, side) {
    if (side === null) {
        window.STATE.extremes = [tile[0], tile[1]];
        return;
    }
    const current = window.STATE.extremes[side];
    window.STATE.extremes[side] = (tile[0] === current) ? tile[1] : tile[0];
};

/**
 * 4. CALCULO DE LIMITES (BOUNDING BOX)
 * Necessario para o sistema de auto-zoom e centralizacao.
 */
window.getSnakeBounds = function() {
    if (!window.STATE.positions || window.STATE.positions.length === 0) 
        return { width: 0, height: 0, centerX: 0, centerY: 0 };

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    window.STATE.positions.forEach(p => {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
    });

    // Adiciona uma margem de seguranca baseada no tamanho da peca
    const padding = 50;
    return {
        minX, maxX, minY, maxY,
        width: (maxX - minX) + padding * 2,
        height: (maxY - minY) + padding * 2,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2
    };
};