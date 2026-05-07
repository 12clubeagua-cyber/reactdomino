/**
 * ACCESSIBILITYMANAGER.TEST.JS - Akita Auditor Protocol
 * Hardcore Audit for AccessibilityManager
 */

// Mocking Browser Environment
global.window = {};
global.document = {
    documentElement: {
        setAttribute: (name, val) => {
            document.documentElement.attributes[name] = val;
        },
        classList: {
            add: () => {},
            remove: () => {}
        },
        style: {
            fontSize: '',
            setProperty: (name, val) => {
                document.documentElement.style[name] = val;
            }
        },
        attributes: {}
    },
    getElementById: (id) => ({
        innerText: '',
        id: id
    })
};

// Mocking storage helpers from utils.js
let mockStorage = {};
window.safeGetStorage = (key, def) => mockStorage[key] || def;
window.safeSetStorage = (key, val) => { mockStorage[key] = val; };

// LOADING MODULE
require('../accessibilitymanager.js');

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(`[FAIL] ${message}`);
    }
    console.log(`[PASS] ${message}`);
};

function runAudit() {
    console.log("--- Starting Akita Audit: AccessibilityManager ---");

    // Test Case 1: Initial state (Default)
    // Note: require() calls init() once. Since mockStorage is empty, it should set attribute to ''
    assert(document.documentElement.attributes['data-a11y'] === '', "Initial state: data-a11y should be empty string");
    assert(document.documentElement.style.fontSize === '16px', "Initial state: fontSize should be 16px");

    // Test Case 2: Toggle High Contrast (ON)
    window.AccessibilityManager.toggleHighContrast();
    assert(mockStorage['domino_a11y'].highContrast === true, "Storage: highContrast should be true");
    assert(document.documentElement.attributes['data-a11y'] === 'high-contrast', "DOM: data-a11y should be high-contrast");

    // Test Case 3: Toggle High Contrast (OFF)
    window.AccessibilityManager.toggleHighContrast();
    assert(mockStorage['domino_a11y'].highContrast === false, "Storage: highContrast should be false");
    assert(document.documentElement.attributes['data-a11y'] === '', "DOM: data-a11y should be empty");

    // Test Case 4: Set Font Size
    const testSize = 20;
    window.AccessibilityManager.setFontSize(testSize);
    assert(mockStorage['domino_a11y'].fontSize === testSize, "Storage: fontSize should be " + testSize);
    assert(document.documentElement.style.fontSize === testSize + 'px', "DOM: fontSize should be " + testSize + "px");

    // Test Case 5: Persistence check (Simulating reload)
    document.documentElement.attributes = {};
    document.documentElement.style.fontSize = '';
    window.AccessibilityManager.init();
    assert(document.documentElement.style.fontSize === testSize + 'px', "Persistence: restored font size");
    assert(document.documentElement.attributes['data-a11y'] === '', "Persistence: restored high-contrast (false)");

    console.log("--- Audit Complete: 5/5 Pass ---");
}

try {
    runAudit();
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
