/**
 * BOTS.JS - INTELIGENCIA ARTIFICIAL (HYBRID HARDCORE)
 * Este arquivo agora delega a decisao estrategica para o motor Rust/Wasm.
 */

window.botPlay = async function(pIdx) {
    if (window.STATE.isOver || window.STATE.current !== pIdx) return;

    const hand = window.STATE.hands[pIdx];
    const extremes = window.STATE.extremes;
    
    console.log(`[Bot ${pIdx}] Pensando...`);
    
    // Efeito visual de "pensando"
    if (typeof window.Dashboard !== 'undefined') window.Dashboard.showThinking(pIdx);
    
    // Simula tempo de reacao humano
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    let bestMove = null;

    // --- DECISAO VIA RUST (PHASE 3) ---
    if (window.WasmCore) {
        const flatHand = new Uint8Array(hand.flat());
        const diffMap = { 'easy': 0, 'normal': 1, 'hard': 2 };
        const difficulty = diffMap[window.STATE.difficulty] || 1;
        
        const decision = window.WasmCore.GameLogic.think(flatHand, new Uint8Array(extremes), difficulty);
        
        if (decision[0] !== -1) {
            bestMove = {
                idx: decision[0],
                side: decision[1] === -1 ? 0 : decision[1] // Se for 'both', escolhe o primeiro disponivel
            };
        }
    }

    // Fallback: Logica JS Simples caso o Wasm falhe
    if (!bestMove) {
        const moves = window.getMoves(hand);
        if (moves.length > 0) {
            const m = moves[Math.floor(Math.random() * moves.length)];
            bestMove = {
                idx: m.idx,
                side: m.side === 'both' || m.side === 'any' ? 0 : m.side
            };
        }
    }

    if (bestMove) {
        if (typeof window.playTile === 'function') {
            window.playTile(pIdx, bestMove.idx, bestMove.side);
        }
    } else {
        console.log(`[Bot ${pIdx}] Sem jogadas, passando a vez...`);
        if (typeof window.passTurn === 'function') window.passTurn(pIdx);
    }
};

/**
 * Reacoes e Emotes de Bots (Fator Humano)
 */
window.botReact = function(pIdx, type) {
    const emotes = {
        'win': ["😂", "🔥", "👍"],
        'lose': ["😠", "👎", "🤔"],
        'big_play': ["🔥", "😎", "🚀"]
    };
    const pool = emotes[type] || ["😊"];
    const emote = pool[Math.floor(Math.random() * pool.length)];
    
    if (window.Dashboard) window.Dashboard.showEmote(pIdx, emote);
};
