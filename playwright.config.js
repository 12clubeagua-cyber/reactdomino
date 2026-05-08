const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: 'visual_layout.spec.js',
  use: {
    browserName: 'chromium',
    viewport: { width: 1280, height: 720 },
  },
});
