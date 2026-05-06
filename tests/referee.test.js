/**
 * REFEREE.TEST.JS - Akita Auditor Protocol
 * Hardcore Audit for Referee.js
 */

// Mocking Browser Environment
global.window = {};

// LOADING MODULE
require('../referee.js');

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`[FAIL] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

function runAudit() {
    console.log("--- Starting Akita Audit: Referee ---");

    // Test Case 1: getInitialPlayer (Bucha de 6)
    const hands1 = [
        [[0,0], [1,1]],
        [[6,6], [2,2]], // Player 1 has 6-6
        [[3,3]],
        [[4,4]]
    ];
    assert(window.Referee.getInitialPlayer(hands1, null) === 1, "getInitialPlayer: Player 1 should start with [6,6]");

    // Test Case 2: getInitialPlayer (Last Winner)
    assert(window.Referee.getInitialPlayer(hands1, 3) === 3, "getInitialPlayer: Last winner (3) should start");

    // Test Case 3: _sumHandPoints
    const hand = [[1,2], [3,4], [0,0]];
    assert(window.Referee._sumHandPoints(hand) === 10, "sumHandPoints: should be 10");
    assert(window.Referee._sumHandPoints([]) === 0, "sumHandPoints: empty hand should be 0");

    // Test Case 4: calculateBlockResult (Team A wins)
    const hands2 = [
        [[1,1]], // P0: 2 pts
        [[6,6]], // P1: 12 pts
        [[0,1]], // P2: 1 pt
        [[5,5]]  // P3: 10 pts
    ];
    // Team A (0+2) = 3 pts | Team B (1+3) = 22 pts
    const result1 = window.Referee.calculateBlockResult(hands2);
    assert(result1.winTeam === 0, "calculateBlockResult: Team A should win with lower points");
    assert(result1.points === 1, "calculateBlockResult: standard point is 1");

    // Test Case 5: calculateBlockResult (Team B wins)
    const hands3 = [
        [[6,6]], // P0: 12
        [[1,1]], // P1: 2
        [[5,5]], // P2: 10
        [[0,1]]  // P3: 1
    ];
    // Team A = 22 | Team B = 3
    const result2 = window.Referee.calculateBlockResult(hands3);
    assert(result2.winTeam === 1, "calculateBlockResult: Team B should win");

    // Test Case 6: calculateBlockResult (Draw)
    const hands4 = [
        [[1,1]], // 2
        [[1,1]], // 2
        [[1,1]], // 2
        [[1,1]]  // 2
    ];
    const result3 = window.Referee.calculateBlockResult(hands4);
    assert(result3.isDraw === true, "calculateBlockResult: should be a draw");

    console.log("--- Audit Complete: 6/6 Pass (Fair Rules) ---");
}

try {
    runAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
