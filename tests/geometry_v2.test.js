/**
 * GEOMETRY_V2.TEST.JS - Akita Auditor Protocol
 * Specialized Audit for Corner Hinge Engine (Doubles on Curves)
 */

// Mocking Browser Environment
global.window = {
    STATE: {
        positions: [],
        extremes: [null, null],
        ends: [],
        gameMode: 'standard'
    },
    CONFIG: {
        GAME: {
            TILE_W: 18,
            TILE_L: 36,
            MAX_VERT: 6,
            MAX_HORIZ: 6
        }
    },
    updateExtremes: (tile, side) => {
        const val = (side === 0) ? tile[1] : tile[0];
        if (side === null) {
            window.STATE.extremes = [tile[0], tile[1]];
        } else {
            window.STATE.extremes[side] = (tile[0] === window.STATE.extremes[side]) ? tile[1] : tile[0];
        }
    }
};

// LOADING MODULE
require('../logic.js');

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`[FAIL] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

function runGeometryAudit() {
    console.log("--- Starting Akita Audit: Geometry V2 (Curves & Doubles) ---");

    // 1. Setup Initial State (First Piece [6,6])
    window.STATE.positions = [];
    const tile1 = [6,6];
    const p1 = window.calculateTilePlacement(tile1, 0);
    window.STATE.positions.push(p1.nP);

    // 2. Add 5 more pieces to the right to reach the limit (Total 6 pieces)
    // Side 1 dir is 0. 
    for (let i = 0; i < 5; i++) {
        const tile = [6, 6]; // Using doubles for simplicity in calculation
        const p = window.calculateTilePlacement(tile, 1);
        window.STATE.positions.push(p.nP);
    }
    
    assert(window.STATE.ends[1].lineCount === 6, "Setup: Line count should be 6 at side 1");

    // 3. Test: The 7th piece is a DOUBLE (Bucha) at the curve
    // According to rule: "ela DEVE ser posicionada paralela ao NOVO fluxo (transversal a linha anterior)"
    const tileCurve = [6,6];
    const pCurve = window.calculateTilePlacement(tileCurve, 1);
    
    // Previous dir was 0 (Horizontal). Curve dir should be 90 or 270 (Vertical).
    // If it's a double on a curve, it should be PARALLEL to the new flow (Vertical).
    // So isV should be TRUE for the double if it's on a vertical curve.
    
    assert(window.STATE.ends[1].dir !== 0, "Curve: Direction should have changed");
    const isNewDirVertical = (window.STATE.ends[1].dir === 90 || window.STATE.ends[1].dir === 270);
    
    if (isNewDirVertical) {
        assert(pCurve.nP.isV === true, "Curve Rule: Double on vertical curve must be vertical (parallel to flow)");
    } else {
        assert(pCurve.nP.isV === false, "Curve Rule: Double on horizontal curve must be horizontal (parallel to flow)");
    }

    console.log("--- Geometry V2 Audit Complete: PASS ---");
}

try {
    runGeometryAudit();
} catch (e) {
    console.error(e.stack);
    process.exit(1);
}
