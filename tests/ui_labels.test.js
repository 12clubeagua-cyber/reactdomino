/**
 * UI_LABELS.TEST.JS - Akita Auditor Protocol
 * Audit for player name tags structure.
 */

// Mocking Browser Environment
global.window = {
    STATE: {
        handSize: [7, 5, 3, 2],
        current: 0,
        isOver: false,
        hands: [[], [], [], []]
    },
    Renderer: {
        _cache: {},
        _lastHandsState: null
    },
    NameManager: {
        get: (i) => `JOAO_${i}`
    },
    myPlayerIdx: 0,
    getPips: (val) => `pips-${val}`,
    getMoves: () => [],
    highlight: () => {}
};

global.document = {
    getElementById: (id) => ({
        innerHTML: '',
        style: {},
        appendChild: () => {},
        querySelectorAll: () => [],
        remove: () => {}
    }),
    createElement: (tag) => ({
        innerHTML: '',
        className: '',
        style: {},
        appendChild: () => {},
        setAttribute: () => {},
        classList: { add: () => {}, remove: () => {} }
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

function testLabelStructure() {
    console.log("--- Starting UI Labels Structure Audit ---");

    // Mock _getEl to return a fake container
    const container = { 
        innerHTML: '', 
        style: {}, 
        appendChild: (el) => { container.lastChild = el; },
        querySelectorAll: () => [],
        remove: () => {},
        classList: { add: () => {}, remove: () => {} }
    };
    window.Renderer._getEl = () => container;

    // Capture the label
    let capturedLabel = null;
    const originalCreateElement = global.document.createElement;
    global.document.createElement = (tag) => {
        const el = originalCreateElement(tag);
        if (tag === 'div') {
            // We'll check className later because it's set after creation
            const originalClassName = el.className;
            Object.defineProperty(el, 'className', {
                set: (val) => {
                    el._className = val;
                    if (val === 'player-label') {
                        capturedLabel = el;
                    }
                },
                get: () => el._className
            });
        }
        return el;
    };

    // Trigger drawHands
    window.Renderer.drawHands();

    assert(capturedLabel !== null, "Label: player-label element was created");
    
    // Example: JOAO_3
    const text = capturedLabel.textContent;
    console.log(`[INFO] Captured Label Text: ${text}`);
    
    assert(text === 'JOAO_3', "Content: Correct player name displayed");

    console.log("--- UI Labels Structure Audit Pass ---");
}

try {
    testLabelStructure();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
