/**
 * DEALER.TEST.JS - Akita Auditor Protocol
 * Hardcore Audit for Dealer.js
 */

// Mocking Browser Environment
global.window = {
    netMode: 'host'
};

require('../dealer.js');

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`[FAIL] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

function runAudit() {
    console.log("--- Starting Akita Audit: Dealer ---");

    // Test 1: Generate Deck
    const deck = window.Dealer.generateDeck();
    assert(deck.length === 28, "generateDeck: should generate 28 tiles");
    assert(deck.some(t => t[0] === 6 && t[1] === 6), "generateDeck: should contain [6,6]");

    // Test 2: Shuffle
    const shuffled = window.Dealer.shuffle([...deck]);
    assert(shuffled.length === 28, "shuffle: should maintain 28 tiles");
    // Statistically unlikely to be the same, but let's check basic integrity
    assert(shuffled.some(t => t[0] === 0 && t[1] === 0), "shuffle: should maintain integrity");

    // Test 3: Distribute
    const hands = window.Dealer.distribute([...shuffled]);
    assert(hands.length === 4, "distribute: should return 4 hands");
    assert(hands.every(h => h.length === 7), "distribute: each hand should have 7 tiles");

    // Test 4: Failsafe
    const badHands = window.Dealer.distribute([[0,0]]);
    assert(badHands.every(h => h.length === 0), "distribute: should return empty hands on invalid deck");

    // Test 5: Client mode security
    global.window.netMode = 'client';
    assert(window.Dealer.generateDeck().length === 0, "generateDeck: should return empty in client mode");

    console.log("--- Audit Complete: 5/5 Pass (Fair Dealer) ---");
}

try {
    runAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
