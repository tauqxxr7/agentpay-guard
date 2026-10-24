import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', fullyParallel: false,
  use: { baseURL: 'http://localhost:3000', trace: 'retain-on-failure' },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }, { name: 'mobile', use: { ...devices['Pixel 7'], defaultBrowserType: 'chromium', channel: 'chrome' } }],
  webServer: [{ command: 'python -m alembic upgrade head && python -m uvicorn app.main:app --port 8000', cwd: '../backend', env: { ...process.env, CLIENT_SESSION_LIMIT_PER_MINUTE: '100', CLIENT_PROPOSAL_LIMIT_PER_MINUTE: '100', SESSION_CREATION_LIMIT_PER_MINUTE: '100' }, url: 'http://127.0.0.1:8000/health', reuseExistingServer: !process.env.CI }, { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI }]
});
