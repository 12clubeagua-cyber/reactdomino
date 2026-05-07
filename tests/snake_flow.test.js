/**
 * SNAKE_FLOW.TEST.JS - Akita Auditor Protocol
 * Hardcore Geometry Stress Test for logic.js
 */

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
        if (side === null) {
            window.STATE.extremes = [tile[0], tile[1]];
            return;
        }
        const current = window.STATE.extremes[side];
        window.STATE.extremes[side] = (tile[0] === current) ? tile[1] : tile[0];
    }
};

require('../logic.js');

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`[FAIL] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

function runStressTest() {
    console.log("--- Starting Akita Stress Test: Snake Flow ---");

    // Case 1: Fill horizontal line with many doubles
    window.STATE.positions = [];
    window.STATE.ends = [];
    
    console.log("[INFO] Playing first tile...");
    let firstTile = [6,6];
    let p1 = window.calculateTilePlacement(firstTile, 0);
    window.STATE.positions.push(p1.nP); // CRITICAL

    // Play 10 doubles on side 1
    console.log("[INFO] Filling line with 10 doubles...");
    for (let i = 0; i < 10; i++) {
        let doubleTile = [6,6];
        let p = window.calculateTilePlacement(doubleTile, 1);
        window.STATE.positions.push(p.nP);
    }

    // lineCount should be 5 because it turned once (11 total pieces)
    // P1(1), P2(2), P3(3), P4(4), P5(5), P6(6). P7 turns (1).
    // P8(2), P9(3), P10(4), P11(5).
    assert(window.STATE.ends[1].lineCount === 5, `LineCount should be 5, got ${window.STATE.ends[1].lineCount}`);
    assert(window.STATE.ends[1].dir === 270 || window.STATE.ends[1].dir === 90, "Direction should be vertical after 1 turn");

    // Case 2: Play a normal piece after 10 doubles
    console.log("[INFO] Playing normal piece after double-overflow...");
    let normalTile = [6,5];
    let pNormal = window.calculateTilePlacement(normalTile, 1);
    window.STATE.positions.push(pNormal.nP);
    // lineCount was 5. Now 6. No turn.
    assert(window.STATE.ends[1].dir === 270 || window.STATE.ends[1].dir === 90, "Should still be vertical");
    assert(window.STATE.ends[1].lineCount === 6, "LineCount should be 6");

    // Case 3: Play another normal piece.
    console.log("[INFO] Playing second normal piece to trigger turn back to horizontal...");
    let normalTile2 = [5,4];
    let pNormal2 = window.calculateTilePlacement(normalTile2, 1);
    window.STATE.positions.push(pNormal2.nP);
    // lineCount was 6. IT TURNS BACK!
    assert(window.STATE.ends[1].dir === 0 || window.STATE.ends[1].dir === 180, "Should turn back to horizontal");
    assert(window.STATE.ends[1].lineCount === 1, "LineCount should reset to 1 after turn");

    console.log("--- Stress Test Complete: Logic holds ---");
}

try {
    runStressTest();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
