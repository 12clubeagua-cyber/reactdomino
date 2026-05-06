/**
 * PERSISTENCE.TEST.JS - Akita Auditor Protocol
 * Hardcore Audit for Persistence & State Restoration.
 */

// Mocking Browser Environment
global.window = {
    STATE: {
        scores: [0, 0],
        targetScore: 10,
        difficulty: 'normal',
        roundWinner: null,
        isOver: false
    },
    netMode: 'offline',
    safeGetStorage: () => {},
    safeSetStorage: () => {},
    safeAudioInit: () => {},
    Dashboard: { updateScore: () => {} },
    startRound: () => {},
    ResourceManager: { cleanup: () => {} },
    addEventListener: () => {}
};

global.document = {
    querySelectorAll: () => [],
    getElementById: (id) => ({ style: {}, display: 'none' }),
    addEventListener: () => {}
};

// LOADING MODULES
require('../lobby.js');

const assert = (condition, message) => {
    if (!condition) {
        console.error(`[FAIL] ${message}`);
        throw new Error(`[PERSISTENCE BUG] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

function testStateRestoration() {
    console.log("[INFO] Testing State Restoration (Persistence)...");
    
    // 1. Simulate Saved State
    const savedData = {
        scores: [2, 1],
        targetScore: 5,
        difficulty: 'hard'
    };
    window.safeGetStorage = (key) => (key === 'domino_match_state' ? savedData : null);

    // 2. Call loadMatchState
    window.loadMatchState();

    // 3. Verify if scores were preserved after startMatch
    assert(window.STATE.scores[0] === 2, `Restoration: Team A score should be 2 (Found: ${window.STATE.scores[0]})`);
    assert(window.STATE.scores[1] === 1, `Restoration: Team B score should be 1 (Found: ${window.STATE.scores[1]})`);
    assert(window.STATE.targetScore === 5, "Restoration: Target score should be 5");
    assert(window.STATE.difficulty === 'hard', "Restoration: Difficulty should be hard");
}

try {
    console.log("--- Starting Akita Persistence Audit ---");
    testStateRestoration();
    console.log("--- Persistence Audit Complete: 1/1 Pass ---");
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
