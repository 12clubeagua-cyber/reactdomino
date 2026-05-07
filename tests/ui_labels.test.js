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
        remove: () => {}
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
                    if (val === 'player-name-tag') {
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

    assert(capturedLabel !== null, "Label: player-name-tag element was created");
    
    // Example: <span class="p-count">2</span><span class="p-name">JOAO_3</span>
    const html = capturedLabel.innerHTML;
    console.log(`[INFO] Captured Label HTML: ${html}`);
    
    const countIndex = html.indexOf('p-count');
    const nameIndex = html.indexOf('p-name');
    
    assert(countIndex !== -1, "Structure: p-count exists");
    assert(nameIndex !== -1, "Structure: p-name exists");
    assert(countIndex < nameIndex, "Structure: p-count appears before p-name");
    assert(html.startsWith('<span class="p-count">'), "Structure: Starts with p-count span");

    console.log("--- UI Labels Structure Audit Pass ---");
}

try {
    testLabelStructure();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
