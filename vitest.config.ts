import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@renderer': path.resolve(__dirname, './src/renderer/src'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@': path.resolve(__dirname, './src/renderer/src')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/renderer/src/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/main/',
        'src/preload/',
        '**/*.d.ts',
        '**/index.ts',
        'out/',
        'dist/',
        'resources/',
        'build/',
        'electron.vite.config.ts',
        'vitest.config.ts',
        'vitest.setup.ts',
        '**/__tests__/**',
        'src/renderer/src/components/ui/',
        'src/renderer/src/editor/',
        'src/renderer/src/overlay/',
        'src/renderer/src/settings/',
        'src/renderer/src/schemas/',
        'src/shared/',
        'src/renderer/src/main.tsx',
        'src/renderer/src/editor.tsx',
        'src/renderer/src/overlay.tsx'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    }
  }
})
