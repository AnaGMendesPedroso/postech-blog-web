const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e/tests',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:3001',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'PORT=3001 npm start',
    port: 3001,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
    env: {
      PORT: '3001',
      REACT_APP_API_URL: 'http://localhost:3000',
    },
  },
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
});
