import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
export default defineConfig({
  testDir: './tests/browser',
  use: {
    baseURL: 'http://127.0.0.1:5180',
    launchOptions: {
      executablePath:
        process.env.CHROME_PATH ||
        (existsSync('/opt/google/chrome/chrome')
          ? '/opt/google/chrome/chrome'
          : undefined),
      args: ['--no-sandbox'],
    },
  },
  webServer: {
    command: 'node scripts/test-server.mjs',
    url: 'http://127.0.0.1:5180',
    reuseExistingServer: false,
  },
});
