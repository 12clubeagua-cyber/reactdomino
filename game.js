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

    // Sincroniza inicio do embaralhamento no Multiplayer
    if (typeof window.Network !== 'undefined' && typeof window.Network.sync === 'function') {
        window.Network.sync({ type: 'shuffle_start' });
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

    // Sincronizacao e Renderizacao Inicial Segura
    if (typeof window.Network !== 'undefined') window.Network.syncState();
    
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
    const netMode = window.netMode || 'offline';
    const myIdx = window.myPlayerIdx || 0;
    
    // Determina se o turno pertence ao jogador local
    let isLocal = false;
    if (netMode === 'offline') {
        isLocal = (cur === myIdx);
    } else if (netMode === 'host') {
        isLocal = (cur === myIdx || (window.connectedClients && window.connectedClients.some(c => c.assignedIdx === cur)));
    } else {
        isLocal = (cur === myIdx);
    }

    let timeLimit = (window.STATE.turnTime || 15) * 1000;

    if (window.STATE.turnTimer) clearTimeout(window.STATE.turnTimer);
    
    // Apenas o HOST (ou Offline) gerencia o timer de auto-pass
    // REMOVIDO: Limite de tempo para jogadores reais. O timer agora so existe para Bots.
    const isBot = !isLocal && netMode !== 'client';
    if (isBot) {
        // O timer para o Bot e definido mais abaixo na secao --- LOGICA DO BOT ---
    }

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
    if (typeof window.getMoves === 'function') {
        moves = window.getMoves(window.STATE.hands[cur]);
    }

    // --- LOGICA DO BOT ---
    if (!isLocal && netMode !== 'client') {
        if (typeof window.handleBotTurn === 'function') {
            window.handleBotTurn(cur, moves);
        }
        return;
    }

    // --- LOGICA DO JOGADOR SEM PECAS VALIDAS ---
    if (moves.length === 0) {
        window.STATE.isBlocked = true;
        
        if (typeof window.Dashboard !== 'undefined') {
            const pName = typeof window.NameManager !== 'undefined' ? window.NameManager.get(cur) : `Jogador ${cur}`;
            window.Dashboard.setMessage(`${pName} NAO TEM PECA`, 'pass');
        }
        
        if (netMode !== 'client') {
            const passDelay = (window.CONFIG?.GAME?.PASS_DISPLAY_TIME) || 1000;
            window.STATE.turnTimer = setTimeout(() => window.doPass(cur), passDelay);
        }
        return;
    }

    // --- LOGICA DO JOGADOR LOCAL COM PECAS ---
    if (isLocal) {
        if (netMode === 'client' || (netMode === 'host' && cur === myIdx) || netMode === 'offline') {
            if (typeof window.Dashboard !== 'undefined') window.Dashboard.setMessage('SUA VEZ', 'active');
            
            // Sincroniza estado de "pensando" no multiplayer
            if (netMode !== 'offline') {
                window.Network.request({ type: 'thinking', pIdx: cur });
            }

            if (typeof window.Renderer !== 'undefined' && typeof window.Renderer.announce === 'function') {
                window.Renderer.announce("E a sua vez de jogar!");
            }
            if (typeof window.highlight === 'function') {
                window.highlight(moves); // Ativa as pecas
                // OTIMIZACAO ACESSIBILIDADE: Foca na primeira peca jogavel
                setTimeout(() => {
                    const firstPlayable = document.querySelector('.playable[tabindex="0"]');
                    if (firstPlayable) firstPlayable.focus();
                }, 100);
            }
            
            // Notifica se a pagina estiver oculta
            if (document.hidden) {
                window.NotificationManager.notify("Sua vez!", "E a hora de jogar sua peca.");
            }
        } else {
            if (typeof window.Dashboard !== 'undefined') {
                const pName = typeof window.NameManager !== 'undefined' ? window.NameManager.get(cur) : `Jogador ${cur}`;
                window.Dashboard.setMessage(`${pName} JOGANDO...`);
            }
        }
    }
};

/**
 * 3. ACOES (JOGAR E PASSAR)
 */

window.play = function(pIdx, tIdx, side) {
    if (window.STATE.isOver) return;
    
    const netMode = window.netMode || 'offline';
    const myIdx = window.myPlayerIdx || 0;
    
    // Feedback tatil
    if (pIdx === myIdx && typeof window.HapticEngine !== 'undefined') {
        window.HapticEngine.vibrate('click');
    }

    if (netMode === 'client') {
        if (pIdx === myIdx) {
            window.STATE.isBlocked = true;
            if (typeof window.Network !== 'undefined') window.Network.request({ type: 'play_request', tIdx, side });
        }
        return;
    }

    if (window.STATE.current !== pIdx) {
        console.warn("Jogada fora de turno.");
        return;
    }

    const tile = window.STATE.hands[pIdx][tIdx];
    if (!tile) return;

    const normalizedSide = (side === 'any' || side === 'both') ? 0 : side;

    let placement = null;
    if (typeof window.calculateTilePlacement === 'function') {
        placement = window.calculateTilePlacement(tile, normalizedSide);
    }

    if (!placement) {
        console.error("Erro critico: Falha no calculo de posicionamento. Jogada abortada para evitar perda de peca.");
        return;
    }

    // Agora sim, removemos a peca da mao
    window.STATE.hands[pIdx].splice(tIdx, 1);
    window.STATE.handSize[pIdx]--;
    
    // Registra estatistica se for o jogador local
    if (pIdx === myIdx && typeof window.StatsManager !== 'undefined') {
        window.StatsManager.addTilePlayed();
    }
    
    window.STATE.playerPassed.fill(false);
    window.STATE.passCount = 0;
    window.STATE.lastPlayed = pIdx;

    if (typeof window.Renderer !== 'undefined' && typeof window.Renderer.drawHands === 'function') {
        window.Renderer.drawHands(); 
    }

    // Anuncio de acessibilidade
    if (typeof window.Renderer !== 'undefined' && typeof window.Renderer.announce === 'function') {
        const pName = typeof window.NameManager !== 'undefined' ? window.NameManager.get(pIdx) : `Jogador ${pIdx}`;
        window.Renderer.announce(`${pName} jogou ${tile[0]} e ${tile[1]}`);
    }

    // Efeito de impacto para buchas e reacao dos bots
    if (tile[0] === tile[1]) {
        if (typeof window.screenShake === 'function') window.screenShake();
        
        // Reacao dos bots se for uma bucha alta (ex: 6-6)
        if (tile[0] >= 5 && typeof window.botReact === 'function') {
            for (let i = 0; i < 4; i++) {
                if (i !== pIdx && (window.STATE.botPersonalities?.[i])) {
                    if (Math.random() > 0.5) window.botReact(i, 'double_six');
                }
            }
        }
    }

    // O calculateTilePlacement ja atualizou extremes internamente via updateExtremes
    if (!window.STATE.positions.length) {
        window.STATE.extremes = [tile[0], tile[1]];
    } else {
        window.STATE.extremes[normalizedSide] = placement.vOther;
    }
    window.STATE.positions.push(placement.nP);

    if (typeof window.updateCamera === 'function') window.updateCamera();

    if (typeof window.Network !== 'undefined') {
        window.Network.sync({ type: 'animate_play', pIdx, nP: placement.nP, tIdx });
    }

    if (typeof window.animateTile === 'function') {
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
        if (typeof window.Network !== 'undefined') window.Network.syncState();
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

    if (typeof window.Renderer !== 'undefined' && typeof window.Renderer.announce === 'function') {
        const pName = typeof window.NameManager !== 'undefined' ? window.NameManager.get(pIdx) : `Jogador ${pIdx}`;
        window.Renderer.announce(`${pName} passou a vez.`);
    }

    if (typeof playPass === 'function') playPass(); 
    
    if (typeof window.Renderer !== 'undefined' && typeof window.Renderer.flashPass === 'function') {
        window.Renderer.flashPass(pIdx); 
    }
    
    if (typeof window.Network !== 'undefined') {
        window.Network.sync({ type: 'animate_pass', pIdx });
    }

    if (window.STATE.passCount >= 4) {
        window.endRound('block', -1);
    } else {
        window.STATE.isBlocked = true;
        const passDelay = (window.CONFIG?.GAME?.PASS_DISPLAY_TIME) || 1000;
        
        setTimeout(() => {
            window.STATE.current = (window.STATE.current + 1) % 4;
            if (typeof window.Network !== 'undefined') window.Network.syncState();
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
        
        // Atualiza estatisticas persistentes
        if (typeof window.StatsManager !== 'undefined') {
            if (result.winTeam === (myIdx % 2)) {
                window.StatsManager.addWin();
            } else {
                window.StatsManager.addLoss();
            }
        }
        
        // Confetes para a vitoria da dupla local
        if (result.winTeam === (myIdx % 2) && typeof window.spawnConfetti === 'function') {
            window.spawnConfetti();
        }
    }

    if (typeof window.Network !== 'undefined') {
        window.Network.sync({ type: 'end_round', ...result, hands: window.STATE.hands });
        window.Network.syncState();
    }

    if (typeof window.FlowUI !== 'undefined' && typeof window.FlowUI.endRound === 'function') {
        window.FlowUI.endRound(result.winTeam, winnerIdx, result.msg, result.detail);
    }
};

window.exitGame = function() {
    window.ResourceManager.cleanup();
    window.location.reload();
};