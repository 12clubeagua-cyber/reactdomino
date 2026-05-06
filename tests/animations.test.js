/**
 * ANIMATIONS.TEST.JS - Akita Auditor Protocol
 * Hardcore Audit for Animations & Camera
 */

// Mocking Browser Environment
global.window = {
    STATE: { positions: [] },
    CONFIG: { 
        GAME: { TILE_W: 18, TILE_L: 36, SNAKE_MAX_SCALE: 1 } 
    },
    innerWidth: 1024,
    innerHeight: 768,
    myPlayerIdx: 0,
    currentCamera: { scale: 1, x: 0, y: 0 }
};

global.document = {
    documentElement: {
        style: {
            properties: {},
            setProperty: (prop, val) => {
                global.document.documentElement.style.properties[prop] = val;
            }
        }
    },
    body: {
        appendChild: (el) => {
            global.document.body.children.push(el);
        },
        children: []
    },
    getElementById: (id) => {
        if (id === 'snake' || id === 'board-container' || id.startsWith('hand-')) {
            return {
                id: id,
                style: { transform: '' },
                clientWidth: 800,
                clientHeight: 600,
                getBoundingClientRect: () => ({
                    left: 100, top: 100, width: 800, height: 600
                })
            };
        }
        return null;
    },
    createElement: (tag) => ({
        tagName: tag,
        style: {},
        remove: function() {
            const idx = global.document.body.children.indexOf(this);
            if (idx > -1) global.document.body.children.splice(idx, 1);
        }
    })
};

global.navigator = { vibrate: () => true };
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);

// LOADING MODULE
require('../animations.js');

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`[FAIL] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

async function runAudit() {
    console.log("--- Starting Akita Audit: Animations ---");

    // Test Case 1: Haptic Engine
    window.HapticEngine.vibrate('success');
    console.log("[PASS] HapticEngine.vibrate should run without crash");

    // Test Case 2: updateCamera (Empty State)
    window.STATE.positions = [];
    window.updateCamera();
    assert(window.currentCamera.scale === 1, "Camera: Default scale when empty");

    // Test Case 3: updateCamera (With Tiles - Force Scale Down)
    window.STATE.positions = [
        { x: 0, y: 0, isV: true },
        { x: 1000, y: 0, isV: false }
    ];
    window.updateCamera();
    assert(window.currentCamera.scale < 1, "Camera: Should scale down to fit large spread of tiles");
    assert(document.documentElement.style.properties['--cam-scale'] !== undefined, "Camera: Should set CSS variable --cam-scale");

    // Test Case 4: animateTile (Structural Integrity)
    let completed = false;
    const targetData = { x: 100, y: 100, isV: true, v1: 1, v2: 6 };
    
    window.animateTile(0, targetData, () => {
        completed = true;
    });

    // Check if proxy tile was created
    assert(document.body.children.length > 0, "Animate: Proxy tile should be added to body");
    const proxy = document.body.children[0];
    assert(proxy.className.includes('moving-proxy'), "Animate: Correct class on proxy");

    // Wait for animation duration (500ms + buffer)
    await new Promise(resolve => setTimeout(resolve, 700));

    assert(completed === true, "Animate: onComplete callback should be executed");
    assert(document.body.children.length === 0, "Animate: Proxy tile should be removed from body after completion");

    console.log("--- Audit Complete: 4/4 Pass ---");
}

try {
    runAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
