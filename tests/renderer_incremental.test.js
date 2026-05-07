/**
 * RENDERER_INCREMENTAL.TEST.JS - Akita Auditor Protocol
 * Audit for Incremental Rendering performance and logic
 */

// Mocking Browser Environment
global.window = {
    STATE: { positions: [], isOver: false },
    CONFIG: { GAME: { TILE_W: 18, TILE_L: 36 } },
    updateCamera: () => {},
    getPips: () => '...'
};

const boardChildren = [];
global.document = {
    getElementById: (id) => ({
        id: id,
        innerHTML: '',
        appendChild: (child) => {
            if (child.isFragment) {
                boardChildren.push(...child.children);
            } else {
                boardChildren.push(child);
            }
        },
        querySelector: (sel) => {
            if (sel === '.last-move') return boardChildren.find(c => c.className && c.className.includes('last-move'));
            return null;
        }
    }),
    createElement: (tag) => {
        const el = {
            className: '',
            setAttribute: () => {},
            style: {},
            classList: {}
        };
        el.classList.remove = (c) => { el.className = el.className.replace(c, '').trim(); };
        return el;
    },
    createDocumentFragment: () => ({
        isFragment: true,
        children: [],
        appendChild: function(child) { this.children.push(child); }
    })
};

// Loading Module
require('../renderer.js');

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`[FAIL] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

function runRendererAudit() {
    console.log("--- Starting Akita Audit: Incremental Renderer ---");

    // 1. Initial Render
    window.STATE.positions = [{ x: 0, y: 0, v1: 6, v2: 6, isV: true }];
    window.Renderer.drawBoard();
    assert(boardChildren.length === 1, "Should render 1st tile");
    assert(boardChildren[0].className.includes('last-move'), "1st tile should be last-move");
    assert(window.Renderer._renderedTilesCount === 1, "Should track 1 rendered tile");

    // 2. Incremental Render (2nd tile)
    window.STATE.positions.push({ x: 29, y: 0, v1: 6, v2: 5, isV: false });
    window.Renderer.drawBoard();
    assert(boardChildren.length === 2, "Should now have 2 tiles");
    assert(!boardChildren[0].className.includes('last-move'), "1st tile should NOT be last-move anymore");
    assert(boardChildren[1].className.includes('last-move'), "2nd tile should be last-move");
    assert(window.Renderer._renderedTilesCount === 2, "Should track 2 rendered tiles");

    // 3. Reset Render
    window.STATE.positions = [];
    window.Renderer.drawBoard();
    assert(window.Renderer._renderedTilesCount === 0, "Should reset count on empty positions");

    console.log("--- Incremental Renderer Audit Complete: PASS ---");
}

try {
    runRendererAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
