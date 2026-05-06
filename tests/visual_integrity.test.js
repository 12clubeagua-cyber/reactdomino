/**
 * VISUAL_INTEGRITY.TEST.JS - Akita Auditor Protocol
 * Hardcore UI/UX Audit for ReactDomino
 * Focus: Geometry Collisions, Viewport Clipping, and Rendering Artifacts.
 */

// 1. ENVIRONMENT MOCKING (GEOMETRY FOCUS)
global.window = {
    STATE: {
        positions: [],
        extremes: [null, null],
        ends: []
    },
    CONFIG: {
        GAME: { TILE_W: 18, TILE_L: 36, MAX_VERT: 6, MAX_HORIZ: 6 }
    },
    updateExtremes: () => {}
};

// Loading core logic
require('../logic.js');

const assert = (condition, message) => {
    if (!condition) {
        console.error(`[FAIL] ${message}`);
        throw new Error(`[VISUAL BUG] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

/**
 * Audit 1: L-Shape Collision Check
 */
function checkLSchemaCollisions() {
    console.log("[INFO] Testing L-Shape Geometry Integrity...");
    window.STATE.positions = [];
    window.STATE.ends = null;

    const tiles = [[6,6], [6,5], [5,5], [5,4], [4,4], [4,3], [3,3]];
    tiles.forEach(t => {
        const placement = window.calculateTilePlacement(t, 1);
        window.STATE.positions.push(placement.nP);
    });

    const turnTile = [3,2];
    const placement = window.calculateTilePlacement(turnTile, 1);
    const lastPos = window.STATE.positions[window.STATE.positions.length - 1];
    const newPos = placement.nP;

    const dist = Math.sqrt(Math.pow(newPos.x - lastPos.x, 2) + Math.pow(newPos.y - lastPos.y, 2));
    const minExpectedDist = (36/2) + (18/2) + 2; 

    assert(dist >= minExpectedDist, "L-Shape Turn distance is correct and safe");
}

/**
 * Audit 2: Bounding Box Overflow
 */
function checkBoundingBox() {
    console.log("[INFO] Testing Bounding Box Accuracy...");
    window.STATE.positions = [
        {x: -1000, y: -500, isV: true},
        {x: 1000, y: 500, isV: false}
    ];
    const bounds = window.getSnakeBounds();
    assert(bounds.minX === -1000 && bounds.maxX === 1000, "Horizontal extremes correctly identified");
    assert(bounds.minY === -500 && bounds.maxY === 500, "Vertical extremes correctly identified");
}

/**
 * Audit 3: Pip Visibility Check (Logic)
 */
function checkPipLogic() {
    console.log("[INFO] Testing Pip Rendering Logic...");
    // This is a unit test for the renderer's data flow
    require('../renderer.js');
    window.getPips = (v) => `V:${v}`; // Mock
    const pips = window.Renderer._getPips(6);
    assert(pips === "V:6", "Renderer correctly delegates pip rendering to global function");
}

async function runVisualAudit() {
    console.log("--- Starting Akita Visual & Geometry Audit ---");
    checkLSchemaCollisions();
    checkBoundingBox();
    checkPipLogic();
    console.log("--- Visual Audit Complete: 3/3 Pass ---");
}

try {
    runVisualAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
