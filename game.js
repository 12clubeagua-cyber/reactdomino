/* 
   ========================================================================
   GAME.JS - O MOTOR DO JOGO (VERSAO FINAL POLIDA)
   Gerencia o ciclo de vida da rodada, turnos e acoes com i18n e High-Impact UX.
   ======================================================================== 
*/

let turnRetryCount = 0;
const MAX_TURN_RETRIES = 10;

/**
 * 1. CICLO DE VIDA DA RODADA
 */

window.startRound = function() {
    window.STATE.isOver = false;
    window.STATE.isBlocked = true;
    window.STATE.isShuffling = true;
    window.STATE.playerMemory = [[], [], [], []];
    window.STATE.playerPassed = [false, false, false, false];
    window.STATE.passCount = 0;
    window.STATE.lastPlayed = null;

    if (typeof window.FlowUI !== 'undefined' && typeof window.FlowUI.resetForNewRound === 'function') {
        window.FlowUI.resetForNewRound();
    }
    
    if (typeof window.Dashboard !== 'undefined' && typeof window.Dashboard.setMessage === 'function') {
        const msgKey = (window.netMode === 'offline') ? 'shuffling' : 'searching';
        window.Dashboard.setMessage(window.i18n.t(msgKey).toUpperCase());
    }

    // Som de embaralhar (Fase Final: Polimento)
    if (typeof window.playShuffle === 'function') window.playShuffle();

    if (typeof window.Network !== 'undefined' && typeof window.Network.sync === 'function') {
        window.Network.sync({ type: 'shuffle_start' });
    }

    window.dealAndStart();
};

window.dealAndStart = function() {
    const s = document.getElementById('snake');
    if (s) s.innerHTML = '';

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

    window.STATE.ends = [
        { hscX: 0, hscY: 0, dir: 270, lineCount: 1, lastVDir: 270, wasDouble: false },
        { hscX: 0, hscY: 0, dir: 90,  lineCount: 1, lastVDir: 90,  wasDouble: false },
    ];

    if (typeof window.Referee !== 'undefined') {
        window.STATE.current = window.Referee.getInitialPlayer(window.STATE.hands, window.STATE.roundWinner);
    } else {
        window.STATE.current = 0;
    }

    window.STATE.isOver = false;
    window.STATE.isBlocked = false;
    window.STATE.isShuffling = false;

    if (typeof window.Network !== 'undefined' && typeof window.Network.syncState === 'function') window.Network.syncState();
    
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

    const currentIdx = window.STATE.current;
    const myIdx = window.myPlayerIdx || 0;
    const isBot = (currentIdx !== myIdx);

    if (typeof window.Dashboard !== 'undefined' && typeof window.Dashboard.updateTurnIndicator === 'function') {
        window.Dashboard.updateTurnIndicator(currentIdx);
    }

    if (isBot) {
        if (typeof window.botPlay === 'function') {
            window.botPlay(currentIdx);
        }
    } else {
        const moves = window.getMoves(window.STATE.hands[myIdx]);
        if (moves.length === 0) {
            console.log("Jogador local sem jogadas, passando...");
            setTimeout(() => window.passTurn(myIdx), 1500);
        }
    }
};

window.playTile = function(pIdx, tIdx, side) {
    if (window.STATE.isOver || window.STATE.isBlocked) return;
    window.STATE.isBlocked = true;

    const tile = window.STATE.hands[pIdx][tIdx];
    if (!tile) return;

    const normalizedSide = (side === 'any' || side === 'both') ? 0 : side;
    let placement = null;
    if (typeof window.calculateTilePlacement === 'function') {
        placement = window.calculateTilePlacement(tile, normalizedSide);
    }

    if (!placement) return;

    window.STATE.hands[pIdx].splice(tIdx, 1);
    window.STATE.handSize[pIdx]--;
    
    // Som de Impacto (Fase Final: Polimento)
    if (typeof window.playClack === 'function') {
        const isDouble = tile[0] === tile[1];
        window.playClack(isDouble ? 600 : 800, isDouble ? 0.12 : 0.08);
    }

    window.STATE.playerPassed.fill(false);
    window.STATE.passCount = 0;
    window.STATE.lastPlayed = pIdx;

    if (typeof window.Renderer !== 'undefined' && typeof window.Renderer.drawHands === 'function') {
        window.Renderer.drawHands(); 
    }

    if (typeof window.Renderer !== 'undefined' && typeof window.Renderer.spawnEffect === 'function') {
        const isDouble = tile[0] === tile[1];
        window.Renderer.spawnEffect(placement.nP.x, placement.nP.y, isDouble ? 'impact' : 'sparkle');
    }

    if (!window.STATE.positions.length) {
        window.STATE.extremes = [tile[0], tile[1]];
    } else {
        window.STATE.extremes[normalizedSide] = placement.vOther;
    }
    window.STATE.positions.push(placement.nP);

    if (typeof window.animateTile === 'function') {
        window.animateTile(pIdx, placement.nP, () => window._completePlay(pIdx));
    } else {
        window._completePlay(pIdx);
    }
};

window._completePlay = function(pIdx) {
    if (window.STATE.handSize[pIdx] === 0) {
        window.endRound('win', pIdx);
    } else {
        window.STATE.current = (window.STATE.current + 1) % 4;
        if (typeof window.Network !== 'undefined' && typeof window.Network.syncState === 'function') window.Network.syncState();
        window.processTurn();
    }
};

window.passTurn = function(pIdx) {
    if (window.STATE.isOver || window.STATE.current !== pIdx) return;
    
    const pName = typeof window.NameManager !== 'undefined' ? window.NameManager.get(pIdx) : `Jogador ${pIdx}`;
    
    // Alerta de Alto Impacto (Fase Final: Polimento)
    if (typeof window.notifyPass === 'function') {
        window.notifyPass(pName);
    }

    window.STATE.playerPassed[pIdx] = true;
    window.STATE.passCount++;

    if (window.STATE.passCount >= 4) {
        window.endRound('block', -1);
    } else {
        window._completePlay(pIdx);
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
        result.msg = window.i18n.t('game_over');
        window.STATE.roundWinner = (result.winTeam !== -1 ? result.winTeam : window.STATE.lastPlayed);
    }

    if (result.winTeam !== -1) {
        window.STATE.scores[result.winTeam]++;
        if (result.winTeam === (myIdx % 2) && typeof window.spawnConfetti === 'function') window.spawnConfetti();
    }

    if (typeof window.FlowUI !== 'undefined' && typeof window.FlowUI.endRound === 'function') {
        window.FlowUI.endRound(result.winTeam, winnerIdx, result.msg, result.detail);
    }
};

window.exitGame = function() {
    window.location.reload();
};
