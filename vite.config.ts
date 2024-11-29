import { defineConfig } from 'vite';
import path from 'path';
import svgr from 'vite-plugin-svgr';


export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'index.html'),
        background: path.resolve(__dirname, 'src/background.ts'),
        content: path.resolve(__dirname, 'src/content.ts')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]',
      }
    }
  },
  plugins: [svgr()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  }
});
