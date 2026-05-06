/**
 * BOTS.TEST.JS - Akita Auditor Protocol
 * Hardcore Audit for Bots.js
 */

// Mocking Browser Environment
global.window = {
    STATE: {
        difficulty: 'normal',
        hands: [[], [], [], []],
        extremes: [null, null],
        botPersonalities: ['normal', 'normal', 'normal', 'normal'],
        playerMemory: [[], [], [], []]
    }
};

// LOADING MODULE
require('../bots.js');

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`[FAIL] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

function runAudit() {
    console.log("--- Starting Akita Audit: Bots ---");

    // Test Case 1: calculateWeight (Initial State, should prefer doubles and high points)
    const tile1 = [6,6];
    const tile2 = [1,1];
    const w1 = window.calculateWeight(0, tile1, 0);
    const w2 = window.calculateWeight(0, tile2, 0);
    assert(w1 > w2, "calculateWeight (Initial): 6-6 should have higher weight than 1-1");

    // Test Case 2: calculateWeight (Mid-game, Memory logic)
    window.STATE.extremes = [6, 1];
    window.STATE.playerMemory = [[], [2, 3], [], []]; // Opponent (Player 1) missing 2 and 3
    
    const tile3 = [6, 2]; // nextExtreme will be 2
    const tile4 = [6, 5]; // nextExtreme will be 5
    
    const w3 = window.calculateWeight(0, tile3, 0);
    const w4 = window.calculateWeight(0, tile4, 0);
    // tile3 should have higher weight because it blocks opponent (nextExtreme 2 is in memory[1])
    assert(w3 > w4, "calculateWeight: should prefer move that blocks opponent based on memory");

    // Test Case 3: evaluateOpponentObstruction
    window.STATE.playerMemory[1] = [4, 5];
    assert(window.evaluateOpponentObstruction(1, [4, 5]) === 70, "evaluateOpponentObstruction: dual block should return 70");
    assert(window.evaluateOpponentObstruction(1, [4, 0]) === 30, "evaluateOpponentObstruction: single block should return 30");

    // Test Case 4: chooseBotMove (Normal Difficulty)
    window.STATE.difficulty = 'normal';
    window.STATE.playerMemory[1] = [2]; // Only 2 in memory
    window.STATE.hands[0] = [[6,2], [6,5]];
    const moves = [{ idx: 0, side: 0 }, { idx: 1, side: 0 }];
    const bestMove = window.chooseBotMove(0, moves);
    assert(bestMove.idx === 0, "chooseBotMove: should choose move with higher weight ([6,2] blocks P1)");

    // Test Case 5: chooseBotMove (Hard Difficulty - Simulation)
    window.STATE.difficulty = 'hard';
    // Even if weight is slightly lower, simulation should prioritize obstruction
    // (In this mock, [6,2] already has higher weight AND obstruction, so it's a clear choice)
    const bestMoveHard = window.chooseBotMove(0, moves);
    assert(bestMoveHard.idx === 0, "chooseBotMove (Hard): should choose optimal strategic move");

    // Test Case 6: Personality Impact
    window.STATE.botPersonalities = ['aggressive', 'defensive', 'normal', 'normal'];
    window.STATE.extremes = [6, 6]; // Non-null to trigger personality logic
    const wAgg = window.calculateWeight(0, [6,5], 0);
    const wDef = window.calculateWeight(1, [6,5], 0);
    assert(wAgg > wDef, "Personality: Aggressive bot should value high pieces more than Defensive bot");

    console.log("--- Audit Complete: 6/6 Pass (Smart AI) ---");
}

try {
    runAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
