/**
 * BOTS.TEST.JS - Akita Auditor Protocol
 * Hardcore Audit for Bots.js
 */

global.window = {
    STATE: {
        hands: [[], [], [], []],
        extremes: [1, 2],
        botPersonalities: ['normal', 'aggressive', 'defensive', 'random'],
        difficulty: 'normal',
        playerMemory: [[], [], [], []]
    },
    calculateWeight: (botIdx, tile, side) => 10, // Mocked
    evaluateOpponentObstruction: (opp, ext) => 5, // Mocked
    chooseBotMove: null // To be loaded
};

global.document = {
    getElementById: (id) => ({ style: {}, appendChild: () => {} }),
    createElement: (tag) => ({ style: {}, appendChild: () => {}, remove: () => {} })
};

require('../bots.js');

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`[FAIL] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

function runAudit() {
    console.log("--- Starting Akita Audit: Bots ---");

    // Test 1: calculateWeight (Base Logic)
    // Overriding mock with real implementation for deeper test
    require('../bots.js'); // Re-load to get real functions
    
    window.STATE.extremes = [1, 1];
    const tile1 = [1, 6];
    const weight1 = window.calculateWeight(0, tile1, 0);
    // (1+6)*1.2 = 8.4. [1,6] matches 1. nextExtreme = 6. 
    // countInHand = 0. weight += 0.
    assert(weight1 > 0, "calculateWeight: should return positive weight for valid move");

    // Test 2: personality impact
    const weightAggro = window.calculateWeight(1, [6,6], 0); // Aggressive
    const weightDef = window.calculateWeight(2, [6,6], 0); // Defensive
    assert(weightAggro > weightDef, "calculateWeight: Aggressive bot should favor high pieces/doubles more than defensive");

    // Test 3: chooseBotMove
    const moves = [{ idx: 0, side: 0 }, { idx: 1, side: 1 }];
    window.STATE.hands[0] = [[1,1], [1,2]];
    const best = window.chooseBotMove(0, moves);
    assert(best !== null, "chooseBotMove: should return a move");
    assert(typeof best.weight === 'number', "chooseBotMove: should include weight in decision");

    // Test 4: evaluateOpponentObstruction
    window.STATE.playerMemory[1] = [5]; // Opponent 1 doesn't have 5
    const obs = window.evaluateOpponentObstruction(1, [5, 5]);
    assert(obs === 70, "evaluateOpponentObstruction: should identify double block");

    console.log("--- Audit Complete: 4/4 Pass (Smart Bots) ---");
}

try {
    runAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
