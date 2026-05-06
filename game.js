/* 
   ========================================================================
   GAME.JS - O MOTOR DO JOGO (VERSAO INTEGRADA E SEGURA)
   Gerencia o ciclo de vida da rodada, turnos e acoes.
   ======================================================================== 
*/

let turnRetryCount = 0;
const MAX_TURN_RETRIES = 10;

/**
 * 1. CICLO DE VIDA DA RODADA
 */

window.startRound = function() {
    // Acessando STATE globalmente para maior seguranca
    window.STATE.isOver = false;
    window.STATE.isBlocked = true;
    window.STATE.isShuffling = true;
    window.STATE.playerMemory = [[], [], [], []];
    window.STATE.playerPassed = [false, false, false, false];
    window.STATE.passCount = 0;
    window.STATE.lastPlayed = null;

    // Limpeza de UI via Dashboard e FlowUI com verificacao de seguranca
    if (typeof window.FlowUI !== 'undefined' && typeof window.FlowUI.resetForNewRound === 'function') {
        window.FlowUI.resetForNewRound();
    }
    
    if (typeof window.Dashboard !== 'undefined' && typeof window.Dashboard.setMessage === 'function') {
        window.Dashboard.setMessage("EMBARALHANDO...");
    }

    // Inicia imediatamente sem animacao ou som
    window.dealAndStart();
};

window.dealAndStart = function() {
    const s = document.getElementById('snake');
    if (s) s.innerHTML = '';

    // MODULO DEALER: Logistica de geracao e distribuicao
    if (typeof window.Dealer !== 'undefined') {
        const deck = window.Dealer.generateDeck();
        window.Dealer.shuffle(deck);
        window.STATE.hands = window.Dealer.distribute(deck);
    } else {
        console.error("Dealer.js nao carregado.");
        return;
    }
    
    window.STATE.handSize = [7, 7, 7, 7];
    window.STATE.positions = [];
    window.STATE.extremes = [null, null];

    // Configuracao inicial para o sistema de geometria de posicionamento
    window.STATE.ends = [
        { hscX: 0, hscY: 0, dir: 270, lineCount: 1, lastVDir: 270, wasDouble: false },
        { hscX: 0, hscY: 0, dir: 90,  lineCount: 1, lastVDir: 90,  wasDouble: false },
    ];

    // MODULO REFEREE: Define quem comeca
    if (typeof window.Referee !== 'undefined') {
        window.STATE.current = window.Referee.getInitialPlayer(window.STATE.hands, window.STATE.roundWinner);
    } else {
        window.STATE.current = 0; // Fallback
    }

    window.STATE.isOver = false;
    window.STATE.isBlocked = false;
    window.STATE.isShuffling = false;

    // Renderizacao Inicial Segura
    if (typeof window.Renderer !== 'undefined') {
        if (typeof window.Renderer.drawHands === 'function') window.Renderer.drawHands();
        if (typeof window.Renderer.drawBoard === 'function') window.Renderer.drawBoard(); 
    }

    if (typeof window.Dashboard !== 'undefined') {
        window.Dashboard.updateScore();
    }
    
    const startDelay = (window.CONFIG && window.CONFIG.GAME && window.CONFIG.GAME.START_DELAY) ? window.CONFIG.GAME.START_DELAY : 1200;
    setTimeout(() => window.processTurn(), startDelay);
};

/**
 * 2. GESTAO DE TURNOS
 */

window.processTurn = function() {
    if (window.STATE.isOver) return;
    window.STATE.isBlocked = false;
    window.STATE.lastTurnTime = Date.now();
    
    const cur = window.STATE.current;
    const myIdx = window.myPlayerIdx || 0;
    
    // Determina se o turno pertence ao jogador local
    const isLocal = (cur === myIdx);

    if (window.STATE.turnTimer) clearTimeout(window.STATE.turnTimer);
    
    // Apenas o sistema local gerencia o timer de auto-pass
    const isBot = !isLocal;

    // Fallback para evitar travamentos em caso de dessincronizacao
    if (!window.STATE.hands[cur]) {
        turnRetryCount++;
        if (turnRetryCount < MAX_TURN_RETRIES) {
            setTimeout(window.processTurn, 500);
            return;
        }
        window.STATE.hands[cur] = [];
    }
    turnRetryCount = 0;

    let moves = [];
    if (typeof getMoves === 'function') {
        moves = getMoves(window.STATE.hands[cur]);
    }

    // --- LOGICA DO BOT ---
    if (!isLocal) {
        window.STATE.isBlocked = true;
        
        const botName = typeof window.NameManager !== 'undefined' ? window.NameManager.get(cur) : `Bot ${cur}`;
        if (typeof window.Dashboard !== 'undefined') {
            window.Dashboard.setMessage(`${botName} PENSANDO...`);
        }

        // Balao de pensamento visual
        const localIdx = window.myPlayerIdx ?? 0;
        const viewIdx = (cur - localIdx + 4) % 4;
        const handEl = document.getElementById(`hand-${viewIdx}`);
        if (handEl) {
            // Garante que o container tenha posicao relativa para o balao fixar nele
            handEl.style.position = 'relative';
            
            const bubble = document.createElement('div');
            bubble.className = 'thinking-bubble';
            
            // Texto varia de acordo com a personalidade (ocasionalmente)
            const personality = window.STATE.botPersonalities?.[cur] || 'normal';
            let text = '...';
            if (Math.random() > 0.7) {
                if (personality === 'aggressive') text = 'Vou fechar!';
                if (personality === 'defensive') text = 'Calma...';
                if (personality === 'random') text = 'Sera?';
            }
            bubble.innerText = text;
            
            // Posicionamento centralizado
            bubble.style.left = '50%';
            bubble.style.transform = 'translateX(-50%)';
            
            handEl.appendChild(bubble);
            setTimeout(() => bubble.remove(), 1000);
        }

        const minDelay = (window.CONFIG?.BOT?.MIN_DELAY) || 500;
        const delay = minDelay + Math.random() * 1000;
        
        window.STATE.turnTimer = setTimeout(() => {
            if (moves.length === 0) {
                window.doPass(cur);
            } else if (typeof chooseBotMove === 'function') {
                const move = chooseBotMove(cur, moves);
                window.play(cur, move.idx, move.side === 'both' ? 0 : (move.side === 'any' ? 0 : move.side));
            }
        }, delay);
        return;
    }

    // --- LOGICA DO JOGADOR SEM PECAS VALIDAS ---
    if (moves.length === 0) {
        window.STATE.isBlocked = true;
        
        if (typeof window.Dashboard !== 'undefined') {
            const pName = typeof window.NameManager !== 'undefined' ? window.NameManager.get(cur) : `Jogador ${cur}`;
            window.Dashboard.setMessage(`${pName} NAO TEM PECA`, 'pass');
        }
        
        const passDelay = (window.CONFIG?.GAME?.PASS_DISPLAY_TIME) || 1000;
        window.STATE.turnTimer = setTimeout(() => window.doPass(cur), passDelay);
        return;
    }

    // --- LOGICA DO JOGADOR LOCAL COM PECAS ---
    if (isLocal) {
        if (typeof window.Dashboard !== 'undefined') window.Dashboard.setMessage('SUA VEZ', 'active');
        if (typeof highlight === 'function') highlight(moves); // Ativa as pecas
    }
};

/**
 * 3. ACOES (JOGAR E PASSAR)
 */

window.play = function(pIdx, tIdx, side) {
    if (window.STATE.isOver) return;
    
    if (window.STATE.current !== pIdx) {
        console.warn("Jogada fora de turno.");
        return;
    }

    window.STATE.playerPassed.fill(false);
    window.STATE.passCount = 0;
    window.STATE.lastPlayed = pIdx;

    const tile = window.STATE.hands[pIdx].splice(tIdx, 1)[0];
    window.STATE.handSize[pIdx]--;
    
    if (typeof window.Renderer !== 'undefined' && typeof window.Renderer.drawHands === 'function') window.Renderer.drawHands(); 

    const normalizedSide = (side === 'any') ? 0 : side;
    
    let placement = null;
    if (typeof calculateTilePlacement === 'function') placement = calculateTilePlacement(tile, normalizedSide);

    if (placement) {
        if (!window.STATE.positions.length) {
            window.STATE.extremes = [tile[0], tile[1]];
        } else {
            window.STATE.extremes[normalizedSide] = placement.vOther;
        }
        window.STATE.positions.push(placement.nP);
    }

    if (typeof window.updateCamera === 'function') window.updateCamera();

    if (typeof window.animateTile === 'function' && placement) {
        window.animateTile(pIdx, placement.nP, () => window._completePlay(pIdx));
    } else {
        window._completePlay(pIdx);
    }
};

/**
 * Funcao auxiliar interna para completar a jogada apos a animacao
 * @private
 */
window._completePlay = function(pIdx) {
    window.STATE.isBlocked = false;
    
    if (typeof window.Renderer !== 'undefined' && typeof window.Renderer.drawBoard === 'function') {
        window.Renderer.drawBoard();
    }
    
    if (window.STATE.hands[pIdx].length === 0) {
        window.endRound('win', pIdx);
    } else {
        window.STATE.current = (window.STATE.current + 1) % 4;
        window.processTurn();
    }
};

window.doPass = function(pIdx) {
    if (window.STATE.isOver) return;

    if (window.STATE.extremes[0] !== null) {
        [0, 1].forEach(s => {
            if (!window.STATE.playerMemory[pIdx].includes(window.STATE.extremes[s])) {
                window.STATE.playerMemory[pIdx].push(window.STATE.extremes[s]);
            }
        });
    }

    window.STATE.playerPassed[pIdx] = true;
    window.STATE.passCount++;
    
    if (typeof window.Renderer !== 'undefined' && typeof window.Renderer.flashPass === 'function') {
        window.Renderer.flashPass(pIdx); 
    }

    if (window.STATE.passCount >= 4) {
        window.endRound('block', -1);
    } else {
        window.STATE.isBlocked = true;
        const passDelay = (window.CONFIG?.GAME?.PASS_DISPLAY_TIME) || 1000;
        
        setTimeout(() => {
            window.STATE.current = (window.STATE.current + 1) % 4;
            window.processTurn();
        }, passDelay);
    }
};

/**
 * 4. FINALIZACAO
 */

window.endRound = function(reason, winnerIdx) {
    if (window.STATE.isOver) return;
    window.STATE.isOver = true;
    window.STATE.isBlocked = true;

    let result = { winTeam: -1, msg: '', detail: '' };
    const myIdx = window.myPlayerIdx || 0;

    if (reason === 'win') {
        const team = (winnerIdx % 2 === 0 ? 0 : 1);
        const winnerName = typeof window.NameManager !== 'undefined' ? window.NameManager.get(winnerIdx) : `Jogador ${winnerIdx}`;
        
        result = { 
            winTeam: team, 
            msg: (myIdx % 2 === team ? 'SUA DUPLA VENCEU!' : 'OPONENTES VENCERAM!'),
            detail: `${winnerName} fechou a mao!` 
        };
        window.STATE.roundWinner = winnerIdx;
    } else {
        if (typeof window.Referee !== 'undefined') {
            result = window.Referee.calculateBlockResult(window.STATE.hands);
        }
        result.msg = "JOGO TRANCADO!";
        window.STATE.roundWinner = (result.winTeam !== -1 ? result.winTeam : window.STATE.lastPlayed);
    }

    if (result.winTeam !== -1) {
        window.STATE.scores[result.winTeam]++;
    }

    if (typeof window.FlowUI !== 'undefined' && typeof window.FlowUI.endRound === 'function') {
        window.FlowUI.endRound(result.winTeam, winnerIdx, result.msg, result.detail);
    }
    };

    window.exitGame = function() {
    window.location.reload();
    };