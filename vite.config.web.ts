import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Vite config for Web Demo build (no Electron)
 * This creates a static web app that can be deployed to Vercel
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  define: {
    // Flag to detect web demo mode
    'import.meta.env.VITE_WEB_DEMO': JSON.stringify('true')
  },
  build: {
    outDir: 'dist-web',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  base: './'
});
