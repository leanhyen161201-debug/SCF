import { defineConfig, devices } from '@playwright/test';

const WEB_PORT = 5173;
const SERVER_PORT = 3000;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],

  // 全局超时 —— 单个测试上限 60s（含慢 API 和冷启动）
  timeout: 60_000,

  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // 单个 expect/action 最长等待 15s（与 waitForResponse timeout 对齐）
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      // Backend API server — Vite proxies /api → localhost:3000
      // 使用 /api/health 端点作为就绪探针，比仅检查端口更可靠
      command: 'pnpm --filter @scf/server dev',
      url: `http://localhost:${SERVER_PORT}/api/health`,
      timeout: 60_000,
      reuseExistingServer: !process.env.CI,
    },
    {
      // Frontend dev server with built-in /api proxy
      command: 'pnpm --filter @scf/web dev',
      port: WEB_PORT,
      timeout: 60_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
