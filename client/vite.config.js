import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5187,
    proxy: {
      '/api': {
        target: 'http://localhost:3014',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3014',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../server/public',
    emptyOutDir: true
  }
});
