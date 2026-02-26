"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const WEB_PORT = 5173;
const SERVER_PORT = 3000;
exports.default = (0, test_1.defineConfig)({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [['html', { open: 'never' }], ['list']],
    use: {
        baseURL: `http://localhost:${WEB_PORT}`,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...test_1.devices['Desktop Chrome'] },
        },
    ],
    webServer: [
        {
            // Backend API server — Vite proxies /api → localhost:3000
            command: 'pnpm --filter @scf/server dev',
            port: SERVER_PORT,
            timeout: 30_000,
            reuseExistingServer: !process.env.CI,
        },
        {
            // Frontend dev server with built-in /api proxy
            command: 'pnpm --filter @scf/web dev',
            port: WEB_PORT,
            timeout: 30_000,
            reuseExistingServer: !process.env.CI,
        },
    ],
});
