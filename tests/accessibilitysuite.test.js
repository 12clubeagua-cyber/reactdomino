/**
 * ACCESSIBILITYSUITE.TEST.JS - Akita Auditor Protocol
 * Hardcore Audit for AccessibilitySuite
 */

// Mocking Browser Environment
global.window = {};
global.document = {
    documentElement: {
        classList: {
            classes: new Set(),
            add: (cls) => global.document.documentElement.classList.classes.add(cls),
            remove: (cls) => global.document.documentElement.classList.classes.delete(cls),
            contains: (cls) => global.document.documentElement.classList.classes.has(cls)
        },
        style: {
            properties: {},
            setProperty: (prop, val) => {
                global.document.documentElement.style.properties[prop] = val;
            }
        }
    }
};

// Mocking storage helpers
let mockStorage = {};
window.safeGetStorage = (key, def) => mockStorage[key] || def;
window.safeSetStorage = (key, val) => { mockStorage[key] = val; };

// LOADING MODULE
require('../accessibilitysuite.js');

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`[FAIL] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

function runAudit() {
    console.log("--- Starting Akita Audit: AccessibilitySuite ---");

    // Test Case 1: Initial state (Default)
    assert(!document.documentElement.classList.contains('reduced-motion'), "Initial state: reduced-motion should be off");
    assert(document.documentElement.style.properties['--ui-scale'] === 1, "Initial state: ui-scale should be 1");

    // Test Case 2: Toggle Motion (ON)
    window.AccessibilitySuite.toggleMotion();
    assert(mockStorage['domino_a11y_suite'].reducedMotion === true, "Storage: reducedMotion should be true");
    assert(document.documentElement.classList.contains('reduced-motion'), "DOM: reduced-motion class should be present");

    // Test Case 3: Toggle Motion (OFF)
    window.AccessibilitySuite.toggleMotion();
    assert(mockStorage['domino_a11y_suite'].reducedMotion === false, "Storage: reducedMotion should be false");
    assert(!document.documentElement.classList.contains('reduced-motion'), "DOM: reduced-motion class should be removed");

    // Test Case 4: Set UI Scale
    const testScale = 1.2;
    window.AccessibilitySuite.setScale(testScale);
    assert(mockStorage['domino_a11y_suite'].uiScale === testScale, "Storage: uiScale should be updated");
    assert(document.documentElement.style.properties['--ui-scale'] === testScale, "DOM: --ui-scale property should be updated");

    // Test Case 5: Persistence check
    document.documentElement.classList.classes.clear();
    document.documentElement.style.properties = {};
    
    // Simulating module reload logic (manually calling apply since require is cached)
    window.AccessibilitySuite.apply();
    assert(document.documentElement.style.properties['--ui-scale'] === testScale, "Persistence: restored ui-scale");
    assert(!document.documentElement.classList.contains('reduced-motion'), "Persistence: restored reduced-motion (false)");

    console.log("--- Audit Complete: 5/5 Pass ---");
}

try {
    runAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
