/**
 * RENDERER.TEST.JS - Akita Auditor Protocol
 * Hardcore Audit for Renderer.js (UI Engine)
 * Focus: Resilience, DOM Integrity, and Performance.
 */

// Mocking Browser Environment
global.window = {
    STATE: {
        positions: [],
        hands: [[], [], [], []],
        handSize: [0, 0, 0, 0],
        current: 0,
        isOver: false
    },
    CONFIG: {
        GAME: { TILE_W: 18, TILE_L: 36, PASS_DISPLAY_TIME: 100 }
    },
    myPlayerIdx: 0,
    getPips: (val) => `pips-${val}`,
    getMoves: () => [],
    highlight: () => {},
    updateCamera: () => {}
};

// Global cache for mocks
const elements = {};

global.document = {
    getElementById: (id) => {
        if (!elements[id]) {
            elements[id] = {
                innerHTML: '',
                style: {},
                appendChild: (child) => {
                    // Mock appendChild
                },
                querySelectorAll: () => [],
                remove: () => {}
            };
        }
        return elements[id];
    },
    createElement: (tag) => ({
        innerHTML: '',
        style: {},
        className: '',
        appendChild: () => {},
        remove: () => {}
    }),
    createDocumentFragment: () => ({
        appendChild: () => {},
        children: []
    })
};

// LOADING MODULE
require('../renderer.js');

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`[FAIL] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

async function runAudit() {
    console.log("--- Starting Akita Audit: Renderer Engine ---");

    // Test Case 1: Resilience with Missing State
    console.log("[INFO] Testing resilience with missing STATE...");
    const oldState = window.STATE;
    window.STATE = null;
    try {
        window.Renderer.drawBoard();
        window.Renderer.drawHands();
        assert(true, "Resilience: Did not crash with null STATE");
    } catch (e) {
        assert(false, `Resilience: Crashed with null STATE: ${e.message}`);
    }
    window.STATE = oldState;

    // Test Case 2: DOM Cache Verification
    console.log("[INFO] Testing DOM Cache...");
    window.Renderer._getEl('snake');
    assert(window.Renderer._cache['snake'] !== undefined, "Cache: Element 'snake' cached");

    // Test Case 3: drawBoard with positions
    console.log("[INFO] Testing drawBoard with positions...");
    window.STATE.positions = [
        {x: 100, y: 100, v1: 6, v2: 6, isV: true},
        {x: 118, y: 100, v1: 6, v2: 5, isV: false}
    ];
    // We need to mock document.createDocumentFragment more realistically to track children
    let fragmentChildrenCount = 0;
    global.document.createDocumentFragment = () => ({
        appendChild: () => { fragmentChildrenCount++; },
        children: []
    });

    window.Renderer.drawBoard();
    assert(fragmentChildrenCount === 2, `drawBoard: Created 2 tiles in fragment (Found: ${fragmentChildrenCount})`);

    // Test Case 4: drawHands visibility
    console.log("[INFO] Testing drawHands (Blind Hands check)...");
    window.STATE.hands = [
        [[0,0], [0,1]], // Player 0 (Me)
        [[1,1], [1,2]], // Player 1 (Enemy)
        [[2,2]],        // Player 2 (Ally)
        [[3,3]]         // Player 3 (Enemy)
    ];
    window.STATE.handSize = [2, 2, 1, 1];
    window.myPlayerIdx = 0;

    // Mock _createTileElement to track if it's called for private hands
    let tileCreationCount = 0;
    const originalCreateTile = window.Renderer._createTileElement;
    window.Renderer._createTileElement = function() {
        tileCreationCount++;
        return originalCreateTile.apply(this, arguments);
    };

    window.Renderer.drawHands();
    // Should only create tiles for Player 0 (Me)
    assert(tileCreationCount === 2, `drawHands: Only created tiles for local player (Created: ${tileCreationCount}, Expected: 2)`);

    // Test Case 5: Performance Stress Test (1000 tiles)
    console.log("[INFO] Performance Stress Test: 1000 tiles...");
    window.STATE.positions = Array.from({length: 1000}, (_, i) => ({
        x: i, y: i, v1: 1, v2: 1, isV: true
    }));
    
    const start = Date.now();
    window.Renderer.drawBoard();
    const duration = Date.now() - start;
    console.log(`[PERF] 1000 tiles rendered in ${duration}ms`);
    assert(duration < 200, "Performance: 1000 tiles rendered under 200ms");

    console.log("--- Audit Complete: 5/5 Pass (Renderer Robust) ---");
}

try {
    runAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
