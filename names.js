/* 
   ========================================================================
   NAMES.JS - GERENCIAMENTO DE NOMES E PERSISTENCIA (VERSAO BLINDADA)
   Controla os apelidos dos jogadores e salva as preferencias no navegador.
   ======================================================================== 
*/

/**
 * 2. ESTADO INICIAL
 * Registro base dos ocupantes das cadeiras exportado para window.
 */

window.PLAYER_NAMES = {
    0: window.safeGetStorage('userName', "VOCE"),
    1: "BOT ALPHA",
    2: "BOT BETA",
    3: "BOT GAMMA"
};

const BOT_POOL = [
    "ADA", "TURING", "HOPPER", "BABBAGE", "LOVELACE", 
    "KNUTH", "DIJKSTRA", "RITCHIE", "THOMPSON", "CERF",
    "GATES", "JOBS", "WOZ", "LINUS", "STALLMAN",
    "PASCAL", "NEWTON", "EINSTEIN", "TESLA", "CURIE",
    "HAWKING", "FEYNMAN", "DARWIN", "GALILEO", "COPERNICUS",
    "ARCHIMEDES", "EUCLID", "PYTHAGORAS", "LEIBNIZ", "MAXWELL"
];

/**
 * 3. GERENCIADOR DE NOMES (NameManager)
 * Interface central para leitura e escrita de apelidos.
 */

window.NameManager = {
    // Inicializa nomes de bots aleatorios
    randomizeBots: () => {
        const pool = [...BOT_POOL];
        const humanIndices = [0]; // Local player is always human
        
        // Se houver clientes conectados (Host mode), eles tambem sao humanos
        if (Array.isArray(window.connectedClients)) {
            window.connectedClients.forEach(c => {
                if (c.assignedIdx !== undefined) humanIndices.push(c.assignedIdx);
            });
        }

        for (let i = 1; i <= 3; i++) {
            if (humanIndices.includes(i)) continue; // Pula se for um humano
            
            const randIdx = Math.floor(Math.random() * pool.length);
            window.PLAYER_NAMES[i] = pool.splice(randIdx, 1)[0];
        }
    },

    // Retorna o dicionario completo (util para o Host enviar via rede)
    getAll: () => window.PLAYER_NAMES,
...
    // Busca o nome de uma cadeira especifica com fallback de seguranca
    get: (idx) => {
        const name = window.PLAYER_NAMES[idx];
        return (typeof name === 'string' && name.trim().length > 0) 
            ? name 
            : `JOGADOR ${parseInt(idx) + 1}`;
    },
    
    // Altera e higieniza o nome de um jogador
    set: (idx, name) => {
        if (typeof name !== 'string' || name.trim() === '') return;
        
        // Limpeza: 10 caracteres, sem espacos nas bordas e em MAIUSCULO
        const sanitized = name.trim().substring(0, 10).toUpperCase();
        window.PLAYER_NAMES[idx] = sanitized;

        // Se for o jogador local (cadeira 0), salva para o proximo acesso
        if (idx === 0) {
            window.safeSetStorage('userName', sanitized);
        }
    },
    
    // Atualiza todos os nomes de uma vez (usado por Clientes no Multiplayer ao sincronizar com o Host)
    updateAll: (newNames) => {
        if (newNames && typeof newNames === 'object') {
            // Mescla os nomes recebidos garantindo que nao perderemos a referencia do objeto principal
            window.PLAYER_NAMES = { ...window.PLAYER_NAMES, ...newNames };
        }
    }
};