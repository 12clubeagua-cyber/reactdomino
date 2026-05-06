/**
 * CORE_SYSTEM.TEST.JS - Akita Auditor Protocol
 * Hardcore Audit for Core Systems (State, Utils, Names)
 */

// Mocking Browser Environment
let mockLocalStorage = {};
global.window = {
    localStorage: {
        setItem: (k, v) => { mockLocalStorage[k] = v; },
        getItem: (k) => mockLocalStorage[k] || null,
        removeItem: (k) => { delete mockLocalStorage[k]; }
    }
};
global.localStorage = global.window.localStorage;

// LOADING MODULES
require('../utils.js');
require('../names.js');
require('../state.js');

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`[FAIL] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

function runAudit() {
    console.log("--- Starting Akita Audit: Core System ---");

    // --- 1. UTILS.JS ---
    console.log("[INFO] Testing Utils...");
    window.safeSetStorage('test_key', { a: 1 });
    assert(mockLocalStorage['test_key'] === '{"a":1}', "safeSetStorage: should stringify and save");
    
    const val = window.safeGetStorage('test_key', null);
    assert(val.a === 1, "safeGetStorage: should parse and return");
    
    const pips3 = window.getPips(3);
    assert(pips3.split('class="pip"').length - 1 === 3, "getPips: should return 3 pip divs for value 3");

    // --- 2. NAMES.JS ---
    console.log("[INFO] Testing Names...");
    assert(window.NameManager.get(1) === "ROBO A", "NameManager: should return default name for bot");
    window.NameManager.set(0, "AKITA");
    assert(window.NameManager.get(0) === "AKITA", "NameManager: should update and retrieve name");
    assert(mockLocalStorage['userName'] === '"AKITA"', "NameManager: should persist user name");

    // --- 3. STATE.JS ---
    console.log("[INFO] Testing State...");
    assert(Array.isArray(window.STATE.hands), "STATE: hands should be an array");
    assert(window.STATE.scores[0] === 0, "STATE: initial scores should be 0");
    
    window.STATE.turnTimer = setTimeout(() => {}, 1000);
    window.clearTurnTimer();
    assert(window.STATE.turnTimer === null, "clearTurnTimer: should nullify the timer");

    console.log("--- Audit Complete: 8/8 Pass (Core Integrity) ---");
}

try {
    runAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
