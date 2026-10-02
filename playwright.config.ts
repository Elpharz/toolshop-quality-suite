import { defineConfig, devices } from '@playwright/test';
import { env } from './src/config/env';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  // The suite runs against a shared public demo: keep parallelism modest so we
  // are polite to it and stay below any rate limiting.
  fullyParallel: true,
  workers: isCI ? 2 : 4,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: isCI
    ? [
        ['list'],
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'test-results/junit.xml' }],
        ['github'],
      ]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: `${env.apiUrl.replace(/\/$/, '')}/`,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], baseURL: env.baseUrl },
    },
  ],
});
