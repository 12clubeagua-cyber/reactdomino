/**
 * STRESS_TEST.JS - Akita Auditor Protocol
 * Hardcore System Integration & Stress Test
 * Simulates thousands of matches to find race conditions, memory leaks, and logic flaws.
 */

// 1. ENVIRONMENT MOCKING (FULL SYSTEM)
global.window = {
    STATE: {},
    CONFIG: {
        GAME: { TILE_W: 18, TILE_L: 36, MAX_VERT: 6, MAX_HORIZ: 6, START_DELAY: 0 },
        BOT: { MIN_DELAY: 0, MAX_DELAY: 0 }
    },
    // Mocks for UI/Network to isolate engine
    Renderer: { drawHands: () => {}, drawBoard: () => {}, flashPass: () => {} },
    Dashboard: { setMessage: () => {}, updateScore: () => {} },
    FlowUI: { resetForNewRound: () => {}, endRound: () => {} },
    NameManager: { get: (i) => `Bot ${i}` },
    updateCamera: () => {},
    highlight: () => {}
};

global.document = {
    getElementById: () => ({ style: {}, innerHTML: '', appendChild: () => {}, remove: () => {} }),
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, innerHTML: '', appendChild: () => {}, remove: () => {} }),
    hidden: false
};

// HARDCORE MOCK: Force all timeouts to be synchronous
global.setTimeout = (fn, delay) => fn();
global.clearTimeout = () => {};

// Loading all core modules
require('../logic.js');
require('../dealer.js');
require('../referee.js');
require('../bots.js');
require('../game.js');

const assert = (condition, message) => {
    if (!condition) throw new Error(`[CRITICAL] ${message}`);
};

/**
 * SIMULATOR: Plays a full match between 4 bots.
 */
function simulateMatch() {
    window.STATE = {
        scores: [0, 0],
        hands: [[], [], [], []],
        extremes: [null, null],
        positions: [],
        playerPassed: [false, false, false, false],
        playerMemory: [[], [], [], []],
        passCount: 0,
        current: 0,
        isOver: false,
        isBlocked: false,
        targetScore: 10, // Reasonable target
        handSize: [0,0,0,0]
    };

    let turns = 0;
    const MAX_TURNS = 5000; // High safety break

    window.dealAndStart();

    const targetScore = window.STATE.targetScore || 3;

    while (turns < MAX_TURNS) {
        const scores = window.STATE.scores || [0, 0];
        if (scores[0] >= targetScore || scores[1] >= targetScore) break;
        
        if (window.STATE.isOver) {
            window.dealAndStart();
        }

        turns++;
        const pIdx = window.STATE.current;
        
        // Execute Bot Turn
        if (typeof window.executeBotTurn === 'function') {
            window.executeBotTurn(pIdx);
        } else {
            // Manual bot logic if module not fully loaded in mock
            const moves = window.getMoves(window.STATE.hands[pIdx]);
            if (moves.length > 0) {
                const move = moves[0]; // Simplest bot: pick first
                window.play(pIdx, move.idx, move.side === 'both' ? 0 : move.side);
            } else {
                window.doPass(pIdx);
            }
        }

        // Check for round end and restart
        if (window.STATE.isOver && !window.STATE.isGameOver) {
            window.dealAndStart();
        }

        // INVARIANT CHECK: Total tiles must be 28
        const boardCount = window.STATE.positions.length;
        const handsCount = window.STATE.hands.reduce((sum, h) => sum + h.length, 0);
        assert(boardCount + handsCount === 28, `Invariant Failed: ${boardCount} + ${handsCount} != 28`);
        
        // GEOMETRY CHECK: No NaN in positions
        window.STATE.positions.forEach(p => {
            assert(!isNaN(p.x) && !isNaN(p.y), "Geometry Error: NaN detected in coordinates");
        });
    }

    assert(turns < MAX_TURNS, "Match Timeout: Possible infinite loop in game logic");
    return turns;
}

async function runHardcoreStress(iterations = 1000) {
    console.log(`--- Starting Akita Stress Test: ${iterations} iterations ---`);
    const start = Date.now();
    let totalTurns = 0;

    for (let i = 1; i <= iterations; i++) {
        totalTurns += simulateMatch();
        if (i % 100 === 0) {
            const elapsed = (Date.now() - start) / 1000;
            console.log(`[INFO] Completed ${i} matches... (${elapsed.toFixed(1)}s, total turns: ${totalTurns})`);
        }
    }

    const duration = (Date.now() - start) / 1000;
    console.log(`--- Stress Test Complete ---`);
    console.log(`Total Matches: ${iterations}`);
    console.log(`Total Turns: ${totalTurns}`);
    console.log(`Avg Turns/Match: ${(totalTurns / iterations).toFixed(2)}`);
    console.log(`Total Duration: ${duration.toFixed(2)}s`);
    console.log(`Throughput: ${(iterations / duration).toFixed(2)} matches/sec`);
}

// Running the stress test
try {
    // We run 2000 iterations to make it last a bit but stay efficient
    runHardcoreStress(2000);
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
