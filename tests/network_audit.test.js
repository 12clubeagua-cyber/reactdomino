/**
 * NETWORK_AUDIT.TEST.JS - Akita Auditor Protocol
 * Hardcore Security Audit for Multiplayer.js (P2P Layer)
 * Focus: State Injection, Move Validation, and Hand Leakage.
 */

// Mocking Browser Environment
global.window = {
    STATE: {
        current: 0,
        hands: [[], [], [], []],
        positions: [],
        handSize: [0,0,0,0],
        scores: [0,0],
        playerPassed: [false,false,false,false],
        extremes: [null,null],
        roundWinner: null
    },
    netMode: 'host',
    connectedClients: [],
    myPlayerIdx: 0,
    getMoves: () => [{idx: 0, side: 0}], // Mocked valid move
    play: (pIdx, tIdx, side) => { window.lastPlay = {pIdx, tIdx, side}; },
    getPublicState: () => ({ public: true }),
    NameManager: { get: (i) => `Player ${i}` },
    Dashboard: { showVotePanel: () => {} },
    Network: { request: () => {}, sendStatus: () => {} },
    SeatManager: { renderSelectionUI: () => {} },
    ResourceManager: { registerInstance: () => {} }
};

global.document = {
    getElementById: () => ({ style: {}, innerText: '' })
};

// Mock PeerJS
global.Peer = class {
    constructor() { this.on = (ev, cb) => { if (ev === 'open') cb('id123'); }; }
};

// LOADING MODULE
require('../multiplayer.js');

const assert = (condition, message) => {
    if (!condition) throw new Error(`[FAIL] ${message}`);
    console.log(`[PASS] ${message}`);
};

async function runAudit() {
    console.log("--- Starting Akita Audit: Network Security ---");

    // Test Case 1: Unauthorized Play Request (Wrong Turn)
    console.log("[INFO] Testing unauthorized play request (Wrong Turn)...");
    window.STATE.current = 0;
    const fakeConn = { assignedIdx: 1, on: (ev, cb) => { if (ev === 'data') fakeConn.onData = cb; } };
    window.setupHostEvents(fakeConn);
    
    window.lastPlay = null;
    fakeConn.onData({ type: 'play_request', tIdx: 0, side: 0 });
    assert(window.lastPlay === null, "Security: Rejected play request from player whose turn it isn't");

    // Test Case 2: Invalid Move Injection (Illegal Piece)
    console.log("[INFO] Testing invalid move injection (Illegal Piece)...");
    window.STATE.current = 1;
    window.getMoves = () => [{idx: 5, side: 1}]; // Only piece 5 is valid
    fakeConn.onData({ type: 'play_request', tIdx: 0, side: 0 }); // Trying to play piece 0
    assert(window.lastPlay === null, "Security: Rejected illegal move injected by client");

    // Test Case 3: Valid Move Authorization
    console.log("[INFO] Testing valid move authorization...");
    fakeConn.onData({ type: 'play_request', tIdx: 5, side: 1 });
    assert(window.lastPlay !== null && window.lastPlay.tIdx === 5, "Security: Authorized valid move from correct player");

    // Test Case 4: Blind Hands Verification (Data Leakage)
    console.log("[INFO] Testing Blind Hands (Privacy check)...");
    let sentData = null;
    fakeConn.send = (data) => { sentData = data; };
    fakeConn.open = true;
    fakeConn.assignedIdx = 1;
    window.connectedClients = [fakeConn];
    window.STATE.hands = [['P0'], ['P1'], ['P2'], ['P3']];
    window.STATE.handSize = [1, 1, 1, 1];
    
    window.broadcastState();
    assert(sentData !== null, "Network: Data was sent to client");
    assert(sentData.type === 'state_update', "Network: State update sent");
    assert(sentData.myHand[0] === 'P1', "Privacy: Client received their own hand");
    assert(sentData.state.hands === undefined, "Privacy: Client did NOT receive full state hands");

    console.log("--- Audit Complete: 4/4 Pass (Network Secure) ---");
}

try {
    runAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
