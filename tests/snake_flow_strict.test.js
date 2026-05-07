/**
 * SNAKE_FLOW_STRICT.TEST.JS - Akita Auditor Protocol
 * Hardcore Geometry Verification for logic.js (Refactored Turn Logic)
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

/**
 * Checks if two tiles overlap.
 * Uses the exact same offset logic as renderer.js
 */
function checkOverlap(t1, t2, idx1, idx2) {
    const W = 18;
    const L = 36;
    const box = (t) => {
        const offX = t.isV ? (W / 2) : (L / 2);
        const offY = t.isV ? (L / 2) : (W / 2);
        return {
            x1: t.x - offX,
            x2: t.x + offX,
            y1: t.y - offY,
            y2: t.y + offY
        };
    };
    const b1 = box(t1);
    const b2 = box(t2);

    // Standard AABB collision check
    // We use a small epsilon (0.5px) to ignore touching edges
    const epsilon = 0.5;
    const overlapX = b1.x1 < b2.x2 - epsilon && b1.x2 > b2.x1 + epsilon;
    const overlapY = b1.y1 < b2.y2 - epsilon && b1.y2 > b2.y1 + epsilon;
    
    if (overlapX && overlapY) {
        console.log(`[DEBUG] Overlap Details:`);
        console.log(`Tile ${idx1}: x=${t1.x}, y=${t1.y}, isV=${t1.isV} -> Box: [${b1.x1}, ${b1.x2}, ${b1.y1}, ${b1.y2}]`);
        console.log(`Tile ${idx2}: x=${t2.x}, y=${t2.y}, isV=${t2.isV} -> Box: [${b2.x1}, ${b2.x2}, ${b2.y1}, ${b2.y2}]`);
    }

    return overlapX && overlapY;
}

function runStrictTest() {
    console.log("--- Starting Akita Strict Test: Snake Flow & Overlap ---");

    window.STATE.positions = [];
    window.STATE.ends = [];
    
    // 1. Start with a double [6,6]
    console.log("[TEST] Initial Double [6,6]");
    let p1 = window.calculateTilePlacement([6,6], 0);
    window.STATE.positions.push(p1.nP);
    
    console.log("[TEST] Playing 5 more tiles on side 1 (Total 6 in snake including center)");
    for (let i = 0; i < 5; i++) {
        let p = window.calculateTilePlacement([6,6], 1);
        window.STATE.positions.push(p.nP);
    }
    assert(window.STATE.ends[1].lineCount === 6, `LineCount should be 6, got ${window.STATE.ends[1].lineCount}`);
    assert(window.STATE.ends[1].dir === 0, "Should still be horizontal");

    console.log("[TEST] Playing 7th tile on side 1 (Should TURN)");
    let p7 = window.calculateTilePlacement([6,6], 1);
    window.STATE.positions.push(p7.nP);
    
    assert(window.STATE.ends[1].dir === 90 || window.STATE.ends[1].dir === 270, `Should have turned to vertical (dir: ${window.STATE.ends[1].dir})`);
    assert(window.STATE.ends[1].lineCount === 1, "LineCount should reset to 1");

    // 3. Collision Check for all pieces
    console.log("[TEST] Checking for overlaps...");
    for (let i = 0; i < window.STATE.positions.length; i++) {
        for (let j = i + 1; j < window.STATE.positions.length; j++) {
            if (checkOverlap(window.STATE.positions[i], window.STATE.positions[j], i, j)) {
                throw new Error(`[FAIL] Overlap detected between tile ${i} and ${j}`);
            }
        }
    }
    console.log("[PASS] No overlaps detected in 7-tile snake with double-turn.");

    // 4. Test MAX_VERT specifically
    console.log("[TEST] Testing MAX_VERT limit (dir is currently vertical)");
    for (let i = 0; i < 5; i++) {
        let p = window.calculateTilePlacement([6,6], 1);
        window.STATE.positions.push(p.nP);
    }
    assert(window.STATE.ends[1].lineCount === 6, `Vertical LineCount should be 6, got ${window.STATE.ends[1].lineCount}`);
    
    console.log("[TEST] Playing piece to trigger turn back to horizontal");
    let pNext = window.calculateTilePlacement([6,5], 1);
    window.STATE.positions.push(pNext.nP);
    assert(window.STATE.ends[1].dir === 0 || window.STATE.ends[1].dir === 180, "Should have turned back to horizontal");
    assert(window.STATE.ends[1].lineCount === 1, "LineCount reset after second turn");

    // Final Overlap Check
    for (let i = 0; i < window.STATE.positions.length; i++) {
        for (let j = i + 1; j < window.STATE.positions.length; j++) {
            if (checkOverlap(window.STATE.positions[i], window.STATE.positions[j], i, j)) {
                throw new Error(`[FAIL] Overlap detected in long snake at index ${i} and ${j}`);
            }
        }
    }
    console.log("[PASS] Strict Vertical Limit and L-Shape Overlap tests passed.");
    
    console.log("--- All Strict Logic Tests Passed ---");
}

try {
    runStrictTest();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
