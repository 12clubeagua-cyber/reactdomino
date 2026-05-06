/**
 * ACHIEVEMENTS.TEST.JS - Akita Auditor Protocol
 * Hardcore Audit for Achievements
 */

// Mocking Browser Environment
global.window = {};

// Mocking Dashboard
window.Dashboard = {
    message: '',
    setMessage: (msg) => { window.Dashboard.message = msg; }
};

// Mocking storage helpers
let mockStorage = {};
window.safeGetStorage = (key, def) => mockStorage[key] || def;
window.safeSetStorage = (key, val) => { mockStorage[key] = val; };

// LOADING MODULE
require('../achievements.js');

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`[FAIL] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

function runAudit() {
    console.log("--- Starting Akita Audit: Achievements ---");

    // Test Case 1: Initial state
    assert(Object.keys(window.Achievements.unlocked).length === 0, "Initial state: no achievements unlocked");

    // Test Case 2: Unlock valid achievement
    window.Achievements.unlock('FIRST_WIN');
    assert(window.Achievements.unlocked['FIRST_WIN'] === true, "Unlock: FIRST_WIN should be true");
    assert(mockStorage['domino_achievements']['FIRST_WIN'] === true, "Storage: should persist FIRST_WIN");
    assert(window.Dashboard.message.includes('Primeira Vitoria'), "Dashboard: should show achievement name");

    // Test Case 3: Re-unlock same achievement (should not trigger dashboard again)
    window.Dashboard.message = 'clean';
    window.Achievements.unlock('FIRST_WIN');
    assert(window.Dashboard.message === 'clean', "Re-unlock: should not trigger dashboard message");

    // Test Case 4: Handle Missing Dashboard
    const originalDashboard = window.Dashboard;
    delete window.Dashboard;
    window.Achievements.unlock('SPEEDY');
    assert(window.Achievements.unlocked['SPEEDY'] === true, "Unlock (No Dashboard): should still work in logic");
    window.Dashboard = originalDashboard; // Restore

    // Test Case 5: Invalid ID (The "Akita" Bug Fix Verification)
    console.log("[INFO] Testing invalid ID behavior (Fix verification)...");
    window.Achievements.unlock('INVALID_ID');
    assert(window.Achievements.unlocked['INVALID_ID'] === undefined, "Unlock: Invalid ID should NOT be unlocked");

    console.log("--- Audit Complete: 5/5 Pass (Hardened Logic) ---");
}

try {
    runAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
