/// <reference types="vitest/config" />
import path from 'node:path'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
  // './' for file:// contexts (Electron, Capacitor, extensions); '/' for a
  // hosted SPA. A hosted build sets VITE_WEB_BUILD=1.
  base: process.env.VITE_WEB_BUILD ? '/' : './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material'],
          query: ['@tanstack/react-query'],
          editor: ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extensions'],
        },
      },
    },
  },
  // Must match tsconfig.json compilerOptions.paths. Set both or neither.
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    port: 38472,
    // Keeps the frontend same-origin in development, so CORS only has to be
    // configured for the deployed origin.
    proxy: {
      // Overridable so several checkouts can run side by side.
      '/api': {
        target: process.env.API_PROXY_TARGET ?? 'http://localhost:38471',
        changeOrigin: true,
      },
    },
  },
  test: {
    // Top level rather than in a `projects` entry: root vitest.workspace.ts treats
    // this file as a single project and would otherwise run DOM tests in node.
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    testTimeout: 15000,
    env: {
      VITE_PUBLIC_API_BASE_URL: '/api',
    },
  },
})
