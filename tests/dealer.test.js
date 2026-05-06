/**
 * DEALER.TEST.JS - Akita Auditor Protocol
 * Hardcore Audit for Dealer.js
 */

// Mocking Browser Environment
global.window = {
    netMode: 'offline'
};

// LOADING MODULE
require('../dealer.js');

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`[FAIL] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

function runAudit() {
    console.log("--- Starting Akita Audit: Dealer ---");

    // Test Case 1: Generate Deck
    const deck = window.Dealer.generateDeck();
    assert(Array.isArray(deck), "generateDeck: should return an array");
    assert(deck.length === 28, "generateDeck: classic domino deck must have 28 tiles");
    
    // Check for specific tiles
    const hasBuchaSeis = deck.some(t => t[0] === 6 && t[1] === 6);
    const hasBuchaZero = deck.some(t => t[0] === 0 && t[1] === 0);
    assert(hasBuchaSeis, "generateDeck: must include [6,6]");
    assert(hasBuchaZero, "generateDeck: must include [0,0]");

    // Test Case 2: Shuffle (Immutability check & randomness)
    const deck2 = window.Dealer.generateDeck();
    const originalOrder = JSON.stringify(deck2);
    window.Dealer.shuffle(deck2);
    assert(deck2.length === 28, "shuffle: length should remain 28");
    assert(JSON.stringify(deck2) !== originalOrder, "shuffle: deck should be shuffled (statistically likely)");

    // Test Case 3: Distribute
    const deck3 = window.Dealer.generateDeck();
    const hands = window.Dealer.distribute(deck3);
    assert(hands.length === 4, "distribute: should return 4 hands");
    assert(hands.every(h => h.length === 7), "distribute: each hand must have 7 tiles");
    assert(deck3.length === 0, "distribute: should consume the entire deck (28 tiles)");

    // Test Case 4: Client Mode Protection
    window.netMode = 'client';
    const clientDeck = window.Dealer.generateDeck();
    assert(clientDeck.length === 0, "clientMode: generateDeck should return empty array to prevent local cheating");
    
    const clientHands = window.Dealer.distribute(window.Dealer.generateDeck());
    assert(clientHands.every(h => h.length === 0), "clientMode: distribute should return empty hands");
    window.netMode = 'offline'; // Restore

    // Test Case 5: Failsafe (Invalid/Incomplete Deck)
    const incompleteDeck = [[1,1], [2,2]];
    const failHands = window.Dealer.distribute(incompleteDeck);
    assert(failHands.every(h => h.length === 0), "failsafe: should return empty hands for incomplete deck");

    console.log("--- Audit Complete: 5/5 Pass (Stable Logic) ---");
}

try {
    runAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
