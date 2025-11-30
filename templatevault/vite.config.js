// vite.config.js (located in the templatevault root)
import { defineConfig } from 'vite';

export default defineConfig({
  // This tells Vite that its project root (where it finds index.html) is the 'frontend' directory
  root: 'frontend',
  build: {
    // Vite will output to 'frontend/dist' by default because its root is 'frontend'.
    // If you want it in a different place (e.g., 'dist' directly in the repo root),
    // you'd set outDir: 'dist', but 'frontend/dist' is fine for now.
    outDir: 'dist', // This will output to templatevault/frontend/dist
  }
});
