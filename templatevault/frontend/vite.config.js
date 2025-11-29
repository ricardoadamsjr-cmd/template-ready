
//this file is the Vite configuration file for a React project using Vite as the build tool.
//it sets up plugins for React and HTML template processing. what it does is link the React plugin to Vite
//and configures the HTML plugin to minify the output and inject a title into the HTML template.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build into the existing public folder at the repo root
export default defineConfig({
  plugins: [react()],
  root: '.',                // keep default
  build: {
    outDir: '../public',    // output build into root public
    emptyOutDir: false      // don't wipe the entire folder (protect extra static assets)
  }
})