/**
 * OFFLINE_FLOW.TEST.JS - Akita Auditor Protocol
 * Hardcore Audit for Offline Game Flow
 * Focus: Correct state transitions and function integrity.
 */

// Mocking Browser Environment
global.window = {
    STATE: {
        scores: [0, 0],
        targetScore: 3,
        hands: [],
        handSize: [7, 7, 7, 7],
        current: 0,
        isOver: false,
        isBlocked: false,
        isShuffling: false,
        playerPassed: [false, false, false, false],
        passCount: 0,
        positions: [],
        extremes: [null, null]
    },
    CONFIG: {
        GAME: { START_DELAY: 10, TILE_W: 18, TILE_L: 36 }
    },
    netMode: 'offline',
    myPlayerIdx: 0,
    i18n: { t: (key) => key.toUpperCase() },
    Dashboard: {
        setMessage: (msg) => { console.log(`[DASHBOARD] Message: ${msg}`); },
        updateScore: () => { console.log(`[DASHBOARD] Score Updated`); },
        updateTurnIndicator: (idx) => { 
            console.log(`[DASHBOARD] Turn Indicator for: ${idx}`); 
            window.indicatorCalled = true;
        }
    },
    Renderer: {
        drawHands: () => {},
        drawBoard: () => {},
        announce: (msg) => console.log(`[A11Y] ${msg}`)
    },
    Dealer: {
        generateDeck: () => Array.from({length: 28}, (_, i) => [i, i]),
        shuffle: (d) => d,
        distribute: (d) => [d.slice(0,7), d.slice(7,14), d.slice(14,21), d.slice(21,28)]
    },
    Referee: {
        getInitialPlayer: () => 0
    },
    NameManager: {
        get: (i) => `Player ${i}`,
        getAll: () => ({0: 'Me', 1: 'Bot 1', 2: 'Bot 2', 3: 'Bot 3'}),
        randomizeBots: () => {}
    },
    botPlay: (idx) => {
        console.log(`[BOT] Player ${idx} is playing`);
        window.botCalled = true;
    },
    getMoves: () => [[0,0]],
    updateCamera: () => {}
};

global.document = {
    getElementById: (id) => ({
        style: {},
        innerHTML: '',
        appendChild: () => {},
        querySelectorAll: () => []
    }),
    querySelectorAll: () => []
};

// Loading Game Engine
require('../game.js');

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`[FAIL] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

async function runAudit() {
    console.log("--- Starting Akita Audit: Offline Flow ---");

    // Test Case 1: Start Round Transition
    console.log("[INFO] Testing startRound...");
    window.startRound();
    assert(window.STATE.isShuffling === false, "Flow: Shuffling ended");
    assert(window.STATE.hands.length === 4, "Flow: Hands distributed");
    
    // Test Case 2: Turn Indicator Integration
    console.log("[INFO] Testing turn processing...");
    window.indicatorCalled = false;
    window.botCalled = false;
    
    // Fast forward to processTurn (it's called via setTimeout in dealAndStart)
    // We'll call it manually to avoid waiting
    window.processTurn();
    
    assert(window.indicatorCalled === true, "Integrity: Dashboard.updateTurnIndicator was called");
    
    // Test Case 3: Bot Turn Trigger
    window.STATE.current = 1; // Bot turn
    window.processTurn();
    assert(window.botCalled === true, "Flow: botPlay was called for bot turn");

    console.log("--- Audit Complete: 3/3 Pass ---");
}

try {
    runAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
