import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // config.ts throws on import if anything is invalid, so the whole suite
    // fails before a test runs. Declaring the env here means CI needs no setup.
    env: {
      NODE_ENV: 'test',
      PORT: '3024',
      DATABASE_PATH: './data/test.sqlite',
      FRONTEND_URL: 'http://localhost:5177',
    },
    exclude: ['**/node_modules/**', '**/dist/**'],
  },
})
