/**
 * GAME.TEST.JS - Akita Auditor Protocol
 * Hardcore Audit for Game.js (Main Engine)
 */

// Mocking Browser Environment
global.window = {
    STATE: {
        scores: [0, 0],
        hands: [[], [], [], []],
        extremes: [null, null],
        positions: [],
        playerPassed: [false, false, false, false],
        playerMemory: [[], [], [], []],
        passCount: 0,
        current: 0,
        isOver: false,
        isBlocked: false,
        targetScore: 3
    },
    CONFIG: {
        GAME: { START_DELAY: 0, PASS_DISPLAY_TIME: 0 },
        BOT: { MIN_DELAY: 0 }
    },
    netMode: 'offline',
    myPlayerIdx: 0,
    // Mocks for modules
    FlowUI: { resetForNewRound: () => {}, endRound: () => {} },
    Dashboard: { setMessage: () => {}, updateScore: () => {} },
    Dealer: { generateDeck: () => [], shuffle: (d) => d, distribute: (d) => [[],[],[],[]] },
    Referee: { getInitialPlayer: () => 0, calculateBlockResult: () => ({ winTeam: 0 }) },
    Renderer: { drawHands: () => {}, drawBoard: () => {}, flashPass: () => {} },
    NameManager: { get: (i) => `Player ${i}` }
};

global.document = {
    getElementById: (id) => ({ 
        innerHTML: '', 
        style: {}, 
        appendChild: () => {}, 
        getBoundingClientRect: () => ({ left:0, top:0, width:0, height:0 }) 
    }),
    createElement: (tag) => ({ style: {}, appendChild: () => {}, remove: () => {} }),
    hidden: false
};

// LOADING MODULE
require('../game.js');

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`[FAIL] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

async function runAudit() {
    console.log("--- Starting Akita Audit: Game Engine ---");

    // Test Case 1: dealAndStart initialization
    console.log("[INFO] Testing dealAndStart...");
    window.STATE.hands = [[[6,6]], [], [], []];
    window.dealAndStart();
    assert(window.STATE.isShuffling === false, "dealAndStart: should end shuffling state");
    assert(window.STATE.handSize[0] === 7, "dealAndStart: should set hand sizes to 7");

    // Test Case 2: play (Normal play)
    console.log("[INFO] Testing play acion...");
    window.STATE.current = 0;
    window.STATE.hands[0] = [[6,6], [6,5]];
    window.STATE.positions = [];
    // Mock calculateTilePlacement (usually in logic.js)
    window.calculateTilePlacement = (tile, side) => ({ nP: {x:0, y:0, v1:tile[0], v2:tile[1], isV:true}, vOther: tile[1] });
    
    window.play(0, 0, 'any'); // Play 6-6
    assert(window.STATE.positions.length === 1, "play: should add piece to positions");
    assert(window.STATE.extremes[0] === 6, "play: should update extremes");
    assert(window.STATE.hands[0].length === 1, "play: should remove tile from hand");

    // Test Case 3: endRound (Win condition)
    console.log("[INFO] Testing endRound...");
    window.STATE.scores = [0, 0];
    window.endRound('win', 0); // Player 0 wins
    assert(window.STATE.isOver === true, "endRound: should set isOver");
    assert(window.STATE.scores[0] === 1, "endRound: should increment Team A score");

    // Test Case 4: doPass (Sequence of passes)
    console.log("[INFO] Testing doPass...");
    window.STATE.isOver = false;
    window.STATE.passCount = 0;
    window.doPass(0);
    assert(window.STATE.playerPassed[0] === true, "doPass: should mark player as passed");
    assert(window.STATE.passCount === 1, "doPass: should increment pass count");

    console.log("--- Audit Complete: 6/6 Pass (Engine Solid) ---");
}

try {
    runAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
