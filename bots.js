/* 
   ========================================================================
   BOTS.JS - INTELIGENCIA ARTIFICIAL (VERSAO BLINDADA E PRO)
   ======================================================================== 
*/

/**
 * Escolhe a melhor jogada disponivel com base na dificuldade definida no STATE.
 * Exportada para window para que processTurn() (game.js) a encontre com seguranca.
 */
window.chooseBotMove = function(botIdx, moves) {
    if (!Array.isArray(moves) || moves.length === 0) return null;
    const safeBotIdx = (typeof botIdx === 'number') ? botIdx : 0;
    
    // Fallback de seguranca para o estado global
    const currentState = window.STATE || {};
    const difficulty = currentState.difficulty || 'normal';

    // --- MODO DIFICIL (Simulacao e Obstrucao) ---
    if (difficulty === 'hard') {
        let bestMove = null;
        let highestScore = -Infinity;
        
        moves.forEach(move => {
            const hand = currentState.hands?.[safeBotIdx];
            if (!hand || !hand[move.idx]) return;
            const tile = hand[move.idx];
            
            const sidesToTry = (move.side === 'both') ? [0, 1] : [(move.side === 'any' ? 0 : move.side)];
            
            sidesToTry.forEach(s => {
                let score = window.calculateWeight(safeBotIdx, tile, s);
                
                // --- 1. Simulacao de Obstrucao: avalia o proximo oponente ---
                const nextOpponent = (safeBotIdx + 1) % 4;
                const simExtremes = [...(currentState.extremes || [null, null])];
                simExtremes[s] = (tile[0] === currentState.extremes?.[s]) ? tile[1] : tile[0];
                
                // Bônus agressivo por trancar o oponente
                score += window.evaluateOpponentObstruction(nextOpponent, simExtremes) * 1.5;
                
                // --- 2. Controle de Pontuacao (End-game) ---
                // Se o bot tem poucas pecas, foca em descartar as maiores
                if (hand.length <= 3) {
                    score += (tile[0] + tile[1]) * 5;
                }

                // --- 3. Bonus de "Bucha" (Double) estrategica ---
                if (tile[0] === tile[1]) {
                    // Prioriza soltar buchas se ja tivermos muitas pecas do mesmo naipe
                    const sameSuitCount = hand.filter(t => t[0] === tile[0] || t[1] === tile[0]).length;
                    score += (sameSuitCount * 20);
                }
                
                if (score > highestScore) {
                    highestScore = score;
                    bestMove = { ...move, side: s };
                }
            });
        });
        return bestMove || moves[0];
    }

    // --- MODO FACIL / NORMAL (Baseado em Pesos) ---
    const scoredMoves = [];
    moves.forEach(m => {
        const sidesToEval = (m.side === 'both') ? [0, 1] : [(m.side === 'any' ? 0 : m.side)];
        
        sidesToEval.forEach(s => {
            const tile = currentState.hands?.[safeBotIdx]?.[m.idx];
            if (tile) {
                scoredMoves.push({
                    ...m,
                    side: s,
                    weight: window.calculateWeight(safeBotIdx, tile, s)
                });
            }
        });
    });

    // Modo Facil: Adiciona ruido (erro proposital) nas decisoes
    if (difficulty === 'easy') {
        scoredMoves.forEach(m => m.weight += (Math.random() * 40 - 20));
    }

    // Encontra o movimento com maior peso (Otimizado: reduce em vez de sort)
    if (scoredMoves.length === 0) return moves[0];
    
    return scoredMoves.reduce((prev, current) => (prev.weight > current.weight) ? prev : current);
};

/**
 * Gerencia o processo de 'pensamento' do bot, incluindo UI e timers.
 */
window.handleBotTurn = function(botIdx, moves) {
    if (window.STATE.isOver) return;
    window.STATE.isBlocked = true;
    
    const botName = typeof window.NameManager !== 'undefined' ? window.NameManager.get(botIdx) : `Bot ${botIdx}`;
    if (typeof window.Dashboard !== 'undefined') {
        window.Dashboard.setMessage(`${botName} PENSANDO...`);
    }

    // Balao de pensamento visual
    const localIdx = window.myPlayerIdx ?? 0;
    const viewIdx = (botIdx - localIdx + 4) % 4;
    const handEl = document.getElementById(`hand-${viewIdx}`);
    if (handEl) {
        handEl.style.position = 'relative';
        const bubble = document.createElement('div');
        bubble.className = 'thinking-bubble';
        
        const personality = window.STATE.botPersonalities?.[botIdx] || 'normal';
        let text = '...';
        if (Math.random() > 0.7) {
            if (personality === 'aggressive') text = 'Vou fechar!';
            if (personality === 'defensive') text = 'Calma...';
            if (personality === 'random') text = 'Sera?';
        }
        bubble.innerText = text;
        bubble.style.left = '50%';
        bubble.style.transform = 'translateX(-50%)';
        
        handEl.appendChild(bubble);
        setTimeout(() => bubble.remove(), 1000);
    }

    const minDelay = (window.CONFIG?.BOT?.MIN_DELAY) || 500;
    const delay = minDelay + Math.random() * 1000;
    
    window.STATE.turnTimer = setTimeout(() => {
        if (moves.length === 0) {
            window.doPass(botIdx);
        } else {
            const move = window.chooseBotMove(botIdx, moves);
            if (move) {
                window.play(botIdx, move.idx, move.side === 'both' ? 0 : (move.side === 'any' ? 0 : move.side));
            }
        }
    }, delay);
};

/**
 * Calcula o peso estrategico de uma peca especifica.
 */
window.calculateWeight = function(botIdx, tile, side) {
    const currentState = window.STATE || {};
    const hand = currentState.hands?.[botIdx] || [];
    
    // Garantir que a personalidade seja extraida corretamente do STATE
    const personalities = currentState.botPersonalities || ['normal', 'normal', 'normal', 'normal'];
    const personality = personalities[botIdx] || 'normal';
    
    // CASO INICIAL
    if (!currentState.extremes || currentState.extremes[0] === null) {
        return (tile[0] + tile[1]) + (tile[0] === tile[1] ? 60 : 0);
    }

    const extremes = currentState.extremes;
    const partner = (botIdx + 2) % 4;
    const opponents = [(botIdx + 1) % 4, (botIdx + 3) % 4];
    const nextExtreme = (tile[0] === extremes[side]) ? tile[1] : tile[0];

    let weight = 0;

    // --- 1. LOGICA POR PERSONALIDADE ---
    if (personality === 'aggressive') {
        weight += (tile[0] + tile[1]) * 2.5; // Foca em descartar pecas altas
        if (tile[0] === tile[1]) weight += 70;
    } else if (personality === 'defensive') {
        weight += (tile[0] + tile[1]) * 0.5; // Foca em pecas baixas
        if (tile[0] === tile[1]) weight += 30;
    } else if (personality === 'random') {
        weight += Math.random() * 100;
    } else {
        weight += (tile[0] + tile[1]) * 1.2; 
        if (tile[0] === tile[1]) weight += 40;
    }

    // --- 2. INTELIGENCIA DE NAIPE ---
    const countInHand = hand.filter(t => t[0] === nextExtreme || t[1] === nextExtreme).length;
    weight += (countInHand * 15); 

    // --- 3. LOGICA DE MEMORIA ---
    const memory = currentState.playerMemory;
    if (Array.isArray(memory)) {
        opponents.forEach(opp => {
            if (Array.isArray(memory[opp]) && memory[opp].includes(nextExtreme)) {
                weight += 50; 
            }
        });

        if (Array.isArray(memory[partner]) && memory[partner].includes(nextExtreme)) {
            weight -= 40; 
        }
    }

    return weight;
};

/**
 * Heuristica de obstrucao para simular o impacto da jogada no adversario.
 */
window.evaluateOpponentObstruction = function(oppIdx, simExtremes) {
    const memory = window.STATE?.playerMemory?.[oppIdx];
    if (!Array.isArray(memory)) return 0;
    
    const blocksLeft = memory.includes(simExtremes[0]);
    const blocksRight = memory.includes(simExtremes[1]);
    
    // Se a jogada tranca ambos os lados para o oponente, e uma jogada excelente
    if (blocksLeft && blocksRight) return 70;
    // Se tranca apenas um lado, e boa
    if (blocksLeft || blocksRight) return 30;
    
    return 0;
};