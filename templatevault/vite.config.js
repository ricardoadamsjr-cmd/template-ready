// vite.config.cjs (located in the templatevault root)

// Use require for CommonJS
const { defineConfig } = require('vite');

module.exports = defineConfig({
  // This tells Vite that its project root (where it finds index.html) is the 'frontend' directory
  root: 'frontend',
  build: {
    // Vite will output to 'frontend/dist' by default because its root is 'frontend'.
    // outDir: 'dist', // This will output to templatevault/dist
    // If you want the output explicitly in frontend/dist, keep it implicit for vite,
    // or set a relative path that works with the 'root'
    // Let's stick to default which will be <root>/dist -> frontend/dist
    // So, no explicit outDir is needed if it defaults to root/dist
  }
});
