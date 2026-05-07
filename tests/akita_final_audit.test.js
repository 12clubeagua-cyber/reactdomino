/**
 * AKITA_FINAL_AUDIT.TEST.JS - Protocolo Akita Auditor
 * Verificacao final das implementacoes de Animacao, Contraste e Persistencia Offline.
 */

// 1. MOCK ENVIRONMENT
let mockLocalStorage = {};
global.window = {
    STATE: {
        scores: [0, 0],
        targetScore: 10,
        isMultiplayer: false
    },
    netMode: 'offline',
    NameManager: { getAll: () => ({ 0: 'J1', 1: 'J2', 2: 'J3', 3: 'J4' }) },
    safeGetStorage: (key, def) => {
        const val = mockLocalStorage[key];
        return val ? JSON.parse(val) : def;
    },
    safeSetStorage: (key, val) => {
        mockLocalStorage[key] = JSON.stringify(val);
    },
    localStorage: {
        setItem: (k, v) => { mockLocalStorage[k] = v; },
        getItem: (k) => mockLocalStorage[k] || null,
        removeItem: (k) => { delete mockLocalStorage[k]; }
    },
    document: {
        documentElement: {
            setAttribute: (name, val) => { global.window.document.documentElement.attributes[name] = val; },
            attributes: {},
            style: {}
        },
        getElementById: (id) => ({ style: {}, display: 'none', innerText: '' }),
        createElement: (tag) => ({ style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {} }),
        addEventListener: (event, cb) => {
            if (event === 'DOMContentLoaded') global.window.onDOMContentLoaded = cb;
        }
    },
    addEventListener: (event, cb) => {
        if (event === 'DOMContentLoaded') global.window.onDOMContentLoaded = cb;
    },
    console: console,
    location: { reload: () => {} }
};

global.document = global.window.document;
global.localStorage = global.window.localStorage;

// 2. LOADING MODULES
require('../flowui.js');
require('../lobby.js');
require('../accessibilitymanager.js');

const assert = (condition, message) => {
    if (!condition) {
        console.error(`[FAIL] ${message}`);
        throw new Error(`[AKITA AUDIT FAILURE] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

async function runAudit() {
    console.log("--- INICIANDO AUDITORIA AKITA: REQUISITOS DO USUARIO ---");

    // TESTE 1: ALTO CONTRASTE (Acessibilidade)
    console.log("[TEST] Verificando alternancia de Alto Contraste...");
    window.AccessibilityManager.toggleHighContrast();
    assert(window.document.documentElement.attributes['data-a11y'] === 'high-contrast', "A11Y: data-a11y deve ser 'high-contrast'");
    window.AccessibilityManager.toggleHighContrast();
    assert(window.document.documentElement.attributes['data-a11y'] === '', "A11Y: data-a11y deve ser limpo");

    // TESTE 2: PERSISTENCIA OFFLINE (Nao deve salvar)
    console.log("[TEST] Verificando que partidas Offline NAO salvam estado...");
    window.netMode = 'offline';
    mockLocalStorage = {}; // Limpa storage
    window.FlowUI.saveMatchState();
    assert(mockLocalStorage['domino_match_state'] === undefined, "Persistencia: Partida offline nao deve ser salva");

    // TESTE 3: PERSISTENCIA MULTIPLAYER (Deve salvar)
    console.log("[TEST] Verificando que partidas Multiplayer SALVAM estado...");
    window.netMode = 'host';
    window.FlowUI.saveMatchState();
    assert(mockLocalStorage['domino_match_state'] !== undefined, "Persistencia: Partida multiplayer deve ser salva");
    const savedData = JSON.parse(mockLocalStorage['domino_match_state']);
    assert(savedData.isMultiplayer === true, "Persistencia: Flag isMultiplayer deve estar ativa no save");

    // TESTE 4: LIMPEZA DE LEGADO (Lobby)
    console.log("[TEST] Verificando limpeza de saves offline legados no Lobby...");
    // Simula um save offline antigo (legado)
    mockLocalStorage['domino_match_state'] = JSON.stringify({ isMultiplayer: false, scores: [10, 0] });
    
    // Dispara DOMContentLoaded simulado
    if (window.onDOMContentLoaded) window.onDOMContentLoaded();
    
    assert(mockLocalStorage['domino_match_state'] === undefined, "Lobby: Save offline legado deve ser removido no load");

    console.log("\n--- RESULTADO FINAL ---");
    console.log("Status: APROVADO PELO PROTOCOLO AKITA");
    console.log("Todas as regras de negocio e requisitos do usuario foram validados.");
}

runAudit().catch(e => {
    console.error(e.message);
    process.exit(1);
});
