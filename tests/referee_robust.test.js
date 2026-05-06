/**
 * REFEREE_ROBUST.TEST.JS - Akita Auditor Protocol
 * Hardcore Audit for Referee rules (Win/Tie/Sum).
 */

global.window = {
    Referee: {}
};

require('../referee.js');

const assert = (condition, message) => {
    if (!condition) throw new Error(`[REFEREE BUG] ${message}`);
    console.log(`[PASS] ${message}`);
};

function testReferee() {
    console.log("[INFO] Testing Referee Logic...");
    
    // 1. Simple Win Team A
    const handsA = [
        [[1,1]], // P0 (Team A)
        [[6,6]], // P1 (Team B)
        [[0,0]], // P2 (Team A)
        [[5,5]]  // P3 (Team B)
    ];
    // Team A: 2 + 0 = 2
    // Team B: 12 + 10 = 22
    let res = window.Referee.calculateBlockResult(handsA);
    assert(res.winTeam === 0, "Referee: Team A should win with fewer points");

    // 2. Tie Scenario
    const handsTie = [
        [[1,1]], // P0 (2)
        [[1,1]], // P1 (2)
        [[2,2]], // P2 (4)
        [[2,2]]  // P3 (4)
    ];
    // Team A: 6
    // Team B: 6
    res = window.Referee.calculateBlockResult(handsTie);
    assert(res.isDraw === true, "Referee: Should return draw for equal points");
    assert(res.winTeam === -1, "Referee: winTeam should be -1 on draw");

    // 3. sumHandPoints with zero
    assert(window.Referee._sumHandPoints([[0,0], [0,1]]) === 1, "Referee: Summing 0-0 and 0-1 should be 1");
}

try {
    console.log("--- Starting Akita Referee Audit ---");
    testReferee();
    console.log("--- Referee Audit Complete: 3/3 Pass ---");
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
