import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Configuración de Vitest. Es independiente de `vite.config.ts` (que
// sigue rigiendo el build de producción): Vitest usa este archivo
// en lugar de aquel cuando existe.
//
// El motor de sincronización y los repositorios locales se escribirán
// sobre IndexedDB, así que el entorno de tests necesita IndexedDB real
// (jsdom no lo implementa) y el plugin de React para los componentes.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/**', 'dist/**', '.git/**'],
    globals: false,
  },
})