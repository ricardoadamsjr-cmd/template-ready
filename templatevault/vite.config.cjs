// vite.config.cjs (located in the templatevault root)

// Use require for CommonJS
const { defineConfig } = require('vite');

module.exports = defineConfig({
  // This tells Vite that its project root (where it finds index.html) is the 'frontend' directory
  root: 'frontend',
  // Vite's build output will now default to 'frontend/dist' (relative to the overall project root)
  // because 'root' is set to 'frontend'.
});