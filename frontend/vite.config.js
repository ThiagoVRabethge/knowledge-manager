import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    // Desabilita cache do navegador durante desenvolvimento
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    // Força HMR a recarregar sempre que possível
    hmr: {
      overlay: true,
    },
  },
  // Força re-otimização das dependências a cada inicialização (limpa cache interno)
  optimizeDeps: {
    force: true,
  },
  // Garante que builds de desenvolvimento não usem cache de módulos
  cacheDir: '.vite_cache',
})