import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimizaciones para producción
    minify: 'oxc',
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Separar chart.js en su propio chunk para carga diferida
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
            return 'chart';
          }
        }
      }
    }
  },
  server: {
    // Para desarrollo local
    host: true,
    port: 5173
  }
})
