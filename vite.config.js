// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'src'), // Tell Vite to look for source files in 'src'
  build: {
    outDir: path.resolve(__dirname, 'templatevault/public/js'), // Output built files to public/js
    emptyOutDir: false, // Don't clean the public directory, as it might contain index.html, CSS etc.
    rollupOptions: {
        input: {
            main: path.resolve(__dirname, 'src/js/main.js'), // Your main client-side entry
        },
        output: {
            // Ensure the output file is named main.js
            entryFileNames: '[name].js', 
            chunkFileNames: '[name].js',
            assetFileNames: '[name].[ext]'
        }
    }
  },
});
