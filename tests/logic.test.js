/**
 * LOGIC.TEST.JS - Akita Auditor Protocol
 * Hardcore Audit for Logic.js
 */

// Mocking Browser Environment
global.window = {
    STATE: {
        positions: [],
        extremes: [null, null],
        ends: [],
        gameMode: 'standard',
        roundWinner: null
    },
    CONFIG: {
        GAME: {
            TILE_W: 40,
            TILE_L: 80,
            MAX_VERT: 12,
            MAX_HORIZ: 12
        }
    },

};

// LOADING MODULE
require('../logic.js');

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`[FAIL] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

function runAudit() {
    console.log("--- Starting Akita Audit: Logic ---");

    // Test Case 1: getMoves (Initial Game, Bucha de 6 required)
    const hand1 = [[6,6], [1,2]];
    const moves1 = window.getMoves(hand1);
    assert(moves1.length === 1 && moves1[0].idx === 0, "getMoves: First move must be [6,6] if present");

    const hand2 = [[1,1], [2,2]];
    const moves2 = window.getMoves(hand2);
    assert(moves2.length === 2, "getMoves: If no [6,6], any piece can start (initial game)");

    // Test Case 2: getMoves (Mid-game)
    window.STATE.positions = [{ x:0, y:0 }];
    window.STATE.extremes = [1, 6];
    const hand3 = [[1,2], [6,5], [3,4], [1,6]];
    const moves3 = window.getMoves(hand3);
    // [1,2] matches side 0 | [6,5] matches side 1 | [3,4] no match | [1,6] matches both
    assert(moves3.length === 3, "getMoves: should identify 3 possible moves");
    assert(moves3.find(m => m.idx === 0).side === 0, "getMoves: [1,2] should match side 0");
    assert(moves3.find(m => m.idx === 1).side === 1, "getMoves: [6,5] should match side 1");
    assert(moves3.find(m => m.idx === 3).side === 'both', "getMoves: [1,6] should match both sides");

    // Test Case 3: calculateTilePlacement (First Piece)
    window.STATE.positions = [];
    const tile1 = [6,6];
    const placement1 = window.calculateTilePlacement(tile1, 0);
    window.STATE.positions.push(placement1.nP); // CRITICAL: Must push to positions
    assert(placement1.nP.x === 0 && placement1.nP.y === 0, "calculateTilePlacement: first tile at 0,0");
    assert(window.STATE.extremes[0] === 6 && window.STATE.extremes[1] === 6, "updateExtremes: should set both sides to 6");

    // Test Case 4: calculateTilePlacement (Second Piece, Right Side)
    const tile2 = [6,5];
    const placement2 = window.calculateTilePlacement(tile2, 1);
    window.STATE.positions.push(placement2.nP);
    // Side 1 dir is 0. dx=1, dy=0.
    // prevHalf (6,6 is double) = 40/2 = 20
    // currentHalf (6,5 is not double) = 80/2 = 40
    // totalDist = 20 + 40 + 2 = 62
    // nx = 0 + (62 * 1) = 62
    // ny = 0 + (62 * 0) = 0
    assert(placement2.nP.x === 62 && placement2.nP.y === 0, "calculateTilePlacement: second tile position check");
    assert(window.STATE.extremes[1] === 5, "updateExtremes: side 1 extreme should be 5");

    // Test Case 5: calculateTilePlacement (Turning Logic)
    // Mocking state to reach limit
    window.STATE.ends[1].lineCount = 12; // Limit reached (Config.MAX_HORIZ = 12)
    const tile3 = [5,4];
    const placement3 = window.calculateTilePlacement(tile3, 1);
    // isTurning should be true. isVertFlow was false (dir 0). 
    // Vira para vertical. e.lastVDir was 90, so e.dir becomes 270.
    assert(window.STATE.ends[1].dir === 270, "Turning logic: should turn to vertical (dir 270)");

    // Test Case 6: getSnakeBounds
    // Piece 1 (V): x=10, y=20. isV=true. TW=40, TL=80. halfW=20, halfH=40. bounds: [-10, 30] x [-20, 60]
    // Piece 2 (H): x=100, y=200. isV=false. halfW=40, halfH=20. bounds: [60, 140] x [180, 220]
    // Global: minX=-10, maxX=140, minY=-20, maxY=220
    // Width = (140 - (-10)) + 120 (padding 60*2) = 150 + 120 = 270
    // Height = (220 - (-20)) + 120 = 240 + 120 = 360
    window.STATE.positions = [{x: 10, y: 20, isV: true}, {x: 100, y: 200, isV: false}];
    const bounds = window.getSnakeBounds();
    assert(bounds.width === 270, `getSnakeBounds: width check (expected 270, got ${bounds.width})`);
    assert(bounds.centerX === 65, `getSnakeBounds: centerX check (expected 65, got ${bounds.centerX})`);

    console.log("--- Audit Complete: 6/6 Pass (Perfect Math) ---");
}

try {
    runAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
