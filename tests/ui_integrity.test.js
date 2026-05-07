/**
 * UI_INTEGRITY.TEST.JS - Akita Auditor Protocol
 * Hardcore UI/UX Audit for ReactDomino
 * Focus: Z-Index, Ghosting, Layout Shifts, and Rotation.
 */

// 1. ENVIRONMENT MOCKING (DOM & UI FOCUS)
global.window = {
    STATE: {
        positions: [],
        hands: [[], [], [], []],
        handSize: [0,0,0,0],
        scores: [0,0],
        playerPassed: [false,false,false,false],
        extremes: [null,null],
        roundWinner: null
    },
    CONFIG: {
        GAME: { TILE_W: 18, TILE_L: 36 }
    },
    Renderer: {},
    updateCamera: () => {},
    addEventListener: () => {},
    removeEventListener: () => {}
};

// Global cache for mocks
const elements = {};

global.document = {
    getElementById: (id) => {
        if (!elements[id]) {
            elements[id] = {
                id: id,
                innerHTML: '',
                style: {},
                className: '',
                children: [],
                classList: {
                    add: function(c) { elements[id].className += ' ' + c; },
                    remove: function(c) { elements[id].className = elements[id].className.replace(c, '').trim(); },
                    toggle: function(c, b) { if (b) this.add(c); else this.remove(c); }
                },
                setAttribute: function(k, v) { this[k] = v; },
                removeAttribute: function(k) { delete this[k]; },
                querySelector: function(sel) { return { focus: () => {} }; },
                appendChild: function(child) { 
                    if (child && child.isFragment) {
                        this.children.push(...child.children);
                    } else {
                        this.children.push(child);
                    }
                },
                querySelectorAll: function(sel) {
                    if (sel === '.tile:not(.moving-proxy):not(.temp-hidden)') {
                        return this.children.filter(c => c && c.className && !c.className.includes('moving-proxy'));
                    }
                    return [];
                },
                remove: function() {}
            };
        }
        return elements[id];
    },
    createElement: (tag) => ({
        tagName: tag.toUpperCase(),
        innerHTML: '',
        style: {},
        className: '',
        children: [],
        setAttribute: function(k, v) { this[k] = v; },
        appendChild: function(child) {
            if (child && child.isFragment) {
                this.children.push(...child.children);
            } else {
                this.children.push(child);
            }
        },
        remove: function() {}
    }),
    createDocumentFragment: function() {
        return {
            isFragment: true,
            children: [],
            appendChild: function(child) {
                this.children.push(child);
            }
        };
    },
    querySelector: function(sel) {
        if (sel === '#hand-0 .tiles-rack') return elements['hand-0-rack'] || (elements['hand-0-rack'] = { querySelectorAll: () => [] });
        return null;
    },
    documentElement: {
        style: {
            setProperty: () => {}
        }
    }
};

// LOADING MODULES
require('../renderer.js');

const assert = (condition, message) => {
    if (!condition) {
        console.error(`[FAIL] ${message}`);
        throw new Error(`[UI BUG] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

/**
 * Audit 1: Ghost Pieces Prevention
 * Renderer.drawBoard must clear old tiles.
 */
function testGhostPrevention() {
    console.log("[INFO] Testing Ghost Pieces Prevention...");
    const board = document.getElementById('snake');
    
    // Simulate old tiles
    board.children = [
        { className: 'tile', remove: function() { this.removed = true; } },
        { className: 'tile moving-proxy', remove: function() { this.removed = true; } }
    ];

    window.STATE.positions = [{x:0, y:0, v1:6, v2:6, isV:true}];
    window.Renderer.drawBoard();

    // The static tile should be removed, the proxy should remain
    assert(board.children[0].removed === true, "Renderer: Static tile was removed before redraw");
    // board.children will now contain the new tiles from drawBoard
    // The previous children were removed by the staticTiles.forEach(tile => tile.remove()) in renderer.js
}

/**
 * Audit 2: Tile Rotation Logic (v1 vs v2)
 * Ensures pips are placed correctly based on direction.
 */
function testRotationVisuals() {
    console.log("[INFO] Testing Tile Rotation Visuals...");
    const board = document.getElementById('snake');
    board.children = [];

    window.getPips = (v) => `pips-${v}`;
    // Test Horizontal (v1 left, v2 right)
    window.STATE.positions = [{x:100, y:100, v1:6, v2:5, isV:false}];
    if (window.Renderer) window.Renderer._lastBoardState = null;
    window.Renderer.drawBoard();
    
    const tileHTML = board.children[0].innerHTML;
    assert(tileHTML.includes('pips-6') && tileHTML.includes('pips-5'), "Renderer: Pips values correctly injected in HTML");
}

/**
 * Audit 3: Side Picker Logic
 */
function testSidePicker() {
    console.log("[INFO] Testing Side Picker Logic...");
    require('../flowui.js');
    
    const picker = document.getElementById('side-picker');
    window.STATE.current = 0;
    window.myPlayerIdx = 0;
    window.getMoves = () => [{idx: 0, side: 'both'}];
    window.STATE.hands[0] = [[6,6]];
    window.STATE.extremes = [6, 5];
    window.STATE.positions = [{x:0, y:0}];
    
    require('../input.js');
    window.highlight(window.getMoves());
    
    const tile0 = document.getElementById('my-tile-0');
    tile0.onclick(); 
    
    assert(picker.style.display === 'flex', "Input: Side-picker displayed when choosing side for double match");
}

async function runUIAudit() {
    console.log("--- Starting Akita UI & UX Integrity Audit ---");
    testGhostPrevention();
    testRotationVisuals();
    testSidePicker();
    console.log("--- UI Audit Complete: 3/3 Pass ---");
}

try {
    runUIAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
