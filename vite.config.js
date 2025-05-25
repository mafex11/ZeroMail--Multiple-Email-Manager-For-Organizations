import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync } from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-content-script',
      writeBundle() {
        // Copy content script to dist folder
        try {
          copyFileSync('public/content-script.js', 'dist/content-script.js')
          console.log('Content script copied to dist/')
        } catch (error) {
          console.warn('Could not copy content script:', error.message)
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true
    }
  }
})
