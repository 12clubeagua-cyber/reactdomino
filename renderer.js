/* 
   ========================================================================
   RENDERER.JS - O ARTISTA (VERSAO BLINDADA E CORRIGIDA)
   Transforma os dados do STATE em elementos visuais (HTML/DOM).
   ======================================================================== 
*/

window.Renderer = {
    // Cache de referencias do DOM para evitar buscas repetitivas
    _cache: {},
    _lastBoardState: null,
    _lastHandsState: null,

    _getEl: function(id) {
        if (!window.Renderer._cache[id]) window.Renderer._cache[id] = document.getElementById(id);
        return window.Renderer._cache[id];
    },

    /**
     * Anuncia um evento para leitores de tela.
     */
    announce: function(text) {
        const announcer = window.Renderer._getEl('a11y-announcer');
        if (announcer) {
            announcer.textContent = text;
            // Limpa apos um tempo para permitir repedicao da mesma mensagem
            setTimeout(() => { if (announcer.textContent === text) announcer.textContent = ''; }, 3000);
        }
    },

    /**
     * Renderiza o tabuleiro (as pecas jogadas).
     */
    drawBoard: function() {
        const board = window.Renderer._getEl('snake');
        if (!board) return;

        const positions = window.STATE?.positions || [];
        const isOver = window.STATE?.isOver || false;

        // OTIMIZACAO: Verifica se o estado do tabuleiro mudou
        const currentState = JSON.stringify({ p: positions.length, o: isOver });
        if (window.Renderer._lastBoardState === currentState) return;
        window.Renderer._lastBoardState = currentState;

        // 1. Limpeza Seletiva: Preserva pecas em animacao para evitar "piscadas"
        const staticTiles = board.querySelectorAll('.tile:not(.moving-proxy):not(.temp-hidden)');
        staticTiles.forEach(tile => tile.remove());
        
        if (positions.length === 0) return;
        // ... (resto do loop de renderizacao)

        const fragment = document.createDocumentFragment();
        const W = window.CONFIG?.GAME?.TILE_W ?? 18;
        const L = window.CONFIG?.GAME?.TILE_L ?? 36;

        for (let i = 0; i < positions.length; i++) {
            const nP = positions[i];
            const el = document.createElement('div');
            const isLast = (i === positions.length - 1 && !isOver);
            
            el.className = `tile ${nP.isV ? 'tile-v' : 'tile-h'} ${isLast ? 'last-move' : ''}`;
            el.setAttribute('role', 'img');
            el.setAttribute('aria-label', `Peca ${nP.v1} e ${nP.v2}${nP.isV ? ' vertical' : ''}`);
            
            const offX = nP.isV ? (W / 2) : (L / 2);
            const offY = nP.isV ? (L / 2) : (W / 2);

            el.style.cssText = `position:absolute; left:${nP.x - offX}px; top:${nP.y - offY}px;`;

            el.innerHTML = `
                <div class="half">${window.Renderer._getPips(nP.v1)}</div>
                <div class="half">${window.Renderer._getPips(nP.v2)}</div>
            `;
            fragment.appendChild(el);
        }

        board.appendChild(fragment);

        if (typeof window.updateCamera === 'function') {
            window.updateCamera();
        }
    },

    /**
     * Renderiza as maos dos jogadores.
     */
    drawHands: function(reveal = false) {
        const picker = window.Renderer._getEl('side-picker');
        if (picker) picker.style.display = 'none';

        const myIdx = Number(window.myPlayerIdx ?? 0);
        const currentTurn = window.STATE?.current ?? 0;
        const isOver = window.STATE?.isOver ?? false;
        const isBlocked = window.STATE?.isBlocked ?? false;
        const myHandHash = window.STATE?.hands?.[myIdx]?.map(t => t.join('')).join('|') || '';

        // OTIMIZACAO: Verifica se houve mudanca nas maos, status de turno ou pecas locais
        const currentState = JSON.stringify({
            h: window.STATE?.handSize,
            c: currentTurn,
            o: isOver,
            b: isBlocked,
            p: window.visualPass,
            r: reveal,
            m: myHandHash
        });
        if (window.Renderer._lastHandsState === currentState) {
            window.Renderer._checkLocalInteraction(); // Ainda verifica se precisa de highlights
            return;
        }
        window.Renderer._lastHandsState = currentState;
        
        // Determina quem venceu para o destaque visual
        let winTeam = -1;
        if (isOver && window.STATE.roundWinner !== undefined && window.STATE.roundWinner !== null) {
            winTeam = (window.STATE.roundWinner % 2);
        }

        for (let i = 0; i < 4; i++) {
            const viewPos = (i - myIdx + 4) % 4;
            const container = window.Renderer._getEl(`hand-${viewPos}`);
            if (!container) continue;

            const isSide = (viewPos === 1 || viewPos === 3);
            const isActive = (i === currentTurn && !isOver && !isBlocked);
            const isPassing = window.visualPass && window.visualPass[i];
            const isWinner = (isOver && (i % 2 === winTeam));

            container.className = `hand hand-${viewPos} ${isSide ? 'hand-side' : 'hand-horiz'} 
                                   ${isActive ? 'active-turn' : ''} 
                                   ${isPassing ? 'hand-passed' : ''}
                                   ${isWinner ? 'hand-win-blink' : ''}`;

            const fragment = document.createDocumentFragment();

            // A) Nome do Jogador
            const label = document.createElement('div');
            label.className = 'player-name-tag';
            const playerName = typeof window.NameManager !== 'undefined' ? window.NameManager.get(i) : `Jogador ${i}`;
            const tileCount = window.STATE?.handSize?.[i] || 0;
            label.innerHTML = `<span class="p-count">${tileCount}</span><span class="p-name">${playerName}</span>`;
            fragment.appendChild(label);

            // B) Rack de Pecas
            const rack = document.createElement('div');
            rack.className = 'tiles-rack';
            
            const isMe = (i == myIdx);
            const handData = window.STATE?.hands?.[i] || [];
            const canShow = isMe || isOver || reveal;

            if (canShow && handData.length > 0) {
                handData.forEach((t, idx) => {
                    const tileEl = window.Renderer._createTileElement(t, isSide, isMe, idx);
                    rack.appendChild(tileEl);
                });
            } else {
                const count = window.STATE?.handSize?.[i] || 0;
                for (let k = 0; k < count; k++) {
                    const darkTile = document.createElement('div');
                    darkTile.className = `tile tile-rel ${isSide ? 'tile-v' : 'tile-h'} tile-back`;
                    darkTile.innerHTML = '<div class="half"></div><div class="half"></div>';
                    rack.appendChild(darkTile);
                }
            }
            fragment.appendChild(rack);
            
            container.innerHTML = '';
            container.appendChild(fragment);
        }

        window.Renderer._checkLocalInteraction();
    },

    /**
     * Gerencia o feedback visual de "Passou a vez".
     */
    flashPass: function(pIdx) {
        if (!window.visualPass) window.visualPass = [false, false, false, false];
        
        window.visualPass[pIdx] = true;
        window.Renderer.drawHands(window.STATE?.isOver);
        
        const passDelay = window.CONFIG?.GAME?.PASS_DISPLAY_TIME ?? 1000;
        
        setTimeout(() => {
            window.visualPass[pIdx] = false;
            window.Renderer.drawHands(window.STATE?.isOver);
        }, passDelay);
    },

    _createTileElement: function(tile, isSide, isMe, idx) {
        const el = document.createElement('div');
        const isDouble = tile[0] === tile[1];
        const pipColor = isMe && isDouble ? 'var(--red)' : null;
        
        el.className = `tile tile-rel ${isSide ? 'tile-v' : 'tile-h'} ${isDouble ? 'tile-double' : ''}`;
        if (isMe) {
            el.id = `my-tile-${idx}`;
            el.setAttribute('tabindex', '0');
            el.setAttribute('role', 'button');
        } else {
            el.setAttribute('role', 'img');
        }
        
        el.setAttribute('aria-label', `${isMe ? 'Sua peca ' : 'Peca '} ${tile[0]} e ${tile[1]}`);

        el.innerHTML = `
            <div class="half">${window.Renderer._getPips(tile[0], pipColor)}</div>
            <div class="half">${window.Renderer._getPips(tile[1], pipColor)}</div>
        `;
        return el;
    },

    /**
     * @private Verifica e destaca jogadas possiveis para o jogador local.
     */
    _checkLocalInteraction: function() {
        const myIdx = window.myPlayerIdx ?? 0;
        const isMyTurn = (window.STATE?.current === myIdx && !window.STATE?.isOver && !window.STATE?.isBlocked);
        
        if (isMyTurn && typeof window.getMoves === 'function') {
            const moves = window.getMoves(window.STATE.hands[myIdx]);
            if (moves.length > 0 && typeof window.highlight === 'function') {
                window.highlight(moves);
            }
        }
    },

    /**
     * @private Acessa a funcao global de renderizacao de pontos (pips).
     */
    _getPips: function(val, color) {
        if (typeof window.getPips === 'function') {
            return window.getPips(val, color);
        }
        return `<span style="color:var(--bg); font-weight:bold; font-size:10px;">${val}</span>`;
    }
};