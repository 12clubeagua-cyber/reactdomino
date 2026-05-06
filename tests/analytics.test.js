/**
 * ANALYTICS.TEST.JS - Akita Auditor Protocol
 * Hardcore Audit for Analytics
 */

// Mocking Browser Environment
global.window = {};

// LOADING MODULE
require('../analytics.js');

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`[FAIL] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

function runAudit() {
    console.log("--- Starting Akita Audit: Analytics ---");

    // Test Case 1: Initial state (Module auto-starts)
    assert(window.Analytics.sessionStart !== null, "Initial state: sessionStart should be initialized");
    assert(window.Analytics.moveTimes.length === 4, "Initial state: moveTimes should have 4 slots");

    // Test Case 2: Record valid move
    const pIdx = 0;
    const timeMs = 1500;
    window.Analytics.recordMove(pIdx, timeMs);
    assert(window.Analytics.moveTimes[pIdx].length === 1, "Record: p0 should have 1 record");
    assert(window.Analytics.moveTimes[pIdx][0] === timeMs, "Record: p0 value matches");

    // Test Case 3: Record multiple players
    window.Analytics.recordMove(1, 2000);
    window.Analytics.recordMove(3, 500);
    assert(window.Analytics.moveTimes[1][0] === 2000, "Record: p1 value matches");
    assert(window.Analytics.moveTimes[3][0] === 500, "Record: p3 value matches");

    // Test Case 4: Invalid index (Out of bounds)
    const initialCount = window.Analytics.moveTimes[0].length;
    window.Analytics.recordMove(4, 1000); // Index 4 is invalid
    window.Analytics.recordMove(-1, 1000); // Index -1 is invalid
    assert(window.Analytics.moveTimes[0].length === initialCount, "Invalid: should not affect other players");
    
    // Check if it didn't crash
    console.log("[PASS] Invalid index handling (No crash)");

    // Test Case 5: Manual restart
    const oldStart = window.Analytics.sessionStart;
    // Wait 1ms to ensure timestamp changes
    const start = Date.now();
    while(Date.now() <= start); 
    
    window.Analytics.start();
    assert(window.Analytics.sessionStart > oldStart, "Restart: sessionStart should be updated");

    console.log("--- Audit Complete: 5/5 Pass ---");
}

try {
    runAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
