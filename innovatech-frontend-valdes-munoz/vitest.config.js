import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Esto es vital para que las funciones de vitest estén disponibles
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/main.jsx',
        'src/App.jsx',
        'src/**/__tests__/**', // CRÍTICO: Excluir los tests del cálculo de cobertura
        'src/**/*.test.{js,jsx}',
        'src/assets/**',
        'src/pages/dashboard/tokens.js' // Excluir constantes/diseño
      ],
      thresholds: { statements: 60, branches: 60, functions: 60, lines: 60 }
    },
  },
})